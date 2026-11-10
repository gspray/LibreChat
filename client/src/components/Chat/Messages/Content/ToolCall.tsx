import React, { useMemo, useState, useEffect, useContext, useCallback } from 'react';
import { Button } from '@librechat/client';
import {
  Constants,
  dataService,
  actionDelimiter,
  actionDomainSeparator,
  splitToolCallName,
} from 'librechat-data-provider';
import type { TAttachment, PartMetadata } from 'librechat-data-provider';
import {
  toolPanelSpacingClassName,
  useToolContentRequest,
  useToolExpansion,
  LoneGroupContext,
  SoleToolContext,
} from './disclosure';
import { useLocalize, useProgress, useExpandCollapse, useLazyCollapseBody } from '~/hooks';
import { ToolIcon, getToolIconType, isError, hasRenderableOutput } from './ToolOutput';
import { cn, getToolDisplayLabel, logger, openInNewTab } from '~/utils';
import { isToolCallPreparing, useToolPreparation } from './preparation';
import { useMCPIconMap, useMCPServerNames } from '~/hooks/MCP';
import { resolveToolCallPhase } from '~/utils/toolCallPhase';
import { MCPAppViews } from '~/components/MCPUIResource';
import { useToolCallIntent } from './Parts/intent';
import { AttachmentGroup } from './Parts';
import ToolCallInfo from './ToolCallInfo';
import ProgressText from './ProgressText';
import { TOOL_ROW_CLASSES } from './rows';
import { hasToolParams } from './params';
import { ToolAuthWarning } from './auth';
import { firstErrorLine } from './live';
import useRowHandoff from './handoff';

type LessonCaddieFailureCategory = 'permission' | 'validation' | 'service';
type LessonCaddieRecovery = {
  category: LessonCaddieFailureCategory;
  keptDetails: Record<string, string | string[] | number>;
  fallback: { destination: string; params: Record<string, string> } | null;
};

const LESSONCADDIE_DETAIL_KEYS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'nickname',
  'notes',
  'title',
  'location',
  'start',
  'durationMinutes',
  'text',
  'tagline',
  'concepts',
  'drills',
  'checkpoints',
  'commonMisses',
  'fixes',
] as const;

const LESSONCADDIE_FALLBACKS: Record<
  string,
  { destination: string; required?: string[]; optional?: string[] }
> = {
  add_student: {
    destination: 'new-student',
    optional: ['firstName', 'lastName', 'email', 'phone', 'nickname', 'notes'],
  },
  update_student: { destination: 'student-detail', required: ['contactId'] },
  restore_student: { destination: 'student-list' },
  create_lesson: { destination: 'start-lesson' },
  move_lesson: { destination: 'lesson-detail', required: ['lessonId'] },
  update_lesson_details: { destination: 'lesson-detail', required: ['lessonId'] },
  cancel_lesson: { destination: 'lesson-detail', required: ['lessonId'] },
  archive_lesson: { destination: 'lesson-list' },
  generate_lesson_summary: { destination: 'lesson-detail', required: ['lessonId'] },
  update_lesson_summary_draft: { destination: 'lesson-detail', required: ['lessonId'] },
  share_lesson_summary: { destination: 'lesson-detail', required: ['lessonId'] },
  attach_library_media: { destination: 'library' },
  create_notice: { destination: 'notices' },
  delete_notice: { destination: 'notices' },
  reach_out: { destination: 'student-list' },
  create_playbook_system: {
    destination: 'new-playbook-system',
    optional: ['title', 'tagline', 'concepts', 'drills', 'checkpoints', 'commonMisses', 'fixes'],
  },
  update_playbook_system: { destination: 'playbook-system', required: ['systemId'] },
  delete_playbook_system: { destination: 'playbook-systems' },
  create_playbook_practice: { destination: 'playbook-practices' },
  update_playbook_practice: { destination: 'playbook-practice', required: ['practiceId'] },
  delete_playbook_practice: { destination: 'playbook-practices' },
};

function parseLessonCaddieArgs(raw: string | undefined): Record<string, unknown> {
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function lessonCaddieFailureCategory(output: string | null | undefined) {
  const text = String(output || '');
  if (text.includes('Permission issue:')) {
    return 'permission' as const;
  }
  if (text.includes('Details need attention:')) {
    return 'validation' as const;
  }
  if (text.includes('LessonCaddie service issue:')) {
    return 'service' as const;
  }
  return null;
}

function buildLessonCaddieRecovery(
  functionName: string,
  args: string | undefined,
  output: string | null | undefined,
): LessonCaddieRecovery | null {
  const category = lessonCaddieFailureCategory(output);
  if (!category) {
    return null;
  }
  const source = parseLessonCaddieArgs(args);
  const keptDetails: LessonCaddieRecovery['keptDetails'] = {};
  for (const key of LESSONCADDIE_DETAIL_KEYS) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      keptDetails[key] = value.trim();
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      keptDetails[key] = value;
    } else if (Array.isArray(value)) {
      const items = value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 48);
      if (items.length) {
        keptDetails[key] = items;
      }
    }
  }
  const fallbackSpec = LESSONCADDIE_FALLBACKS[functionName];
  let fallback: LessonCaddieRecovery['fallback'] = null;
  if (fallbackSpec) {
    const params: Record<string, string> = {};
    const keys = [...(fallbackSpec.required ?? []), ...(fallbackSpec.optional ?? [])];
    for (const key of keys) {
      const value = source[key];
      if (Array.isArray(value)) {
        params[key] = JSON.stringify(value);
      } else if (typeof value === 'string' && value.trim()) {
        params[key] = value.trim();
      }
    }
    if ((fallbackSpec.required ?? []).every((key) => Boolean(params[key]))) {
      fallback = { destination: fallbackSpec.destination, params };
    }
  }
  return { category, keptDetails, fallback };
}

function submitLessonCaddieRecoveryPrompt(prompt: string) {
  const composer = document.querySelector<HTMLTextAreaElement>(
    'textarea[aria-label="Message input"]',
  );
  if (!composer) {
    return false;
  }
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  if (setter) {
    setter.call(composer, prompt);
  } else {
    composer.value = prompt;
  }
  composer.dispatchEvent(new Event('input', { bubbles: true }));
  composer.dispatchEvent(new Event('change', { bubbles: true }));
  window.setTimeout(() => {
    document
      .querySelector<HTMLButtonElement>('button[aria-label="Send message"]:not([disabled])')
      ?.click();
  }, 0);
  return true;
}

function LessonCaddieRecoveryControls({ recovery }: { recovery: LessonCaddieRecovery }) {
  const localize = useLocalize();
  const [showDetails, setShowDetails] = useState(false);
  const [status, setStatus] = useState('');
  const labels: Record<string, string> = {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    nickname: 'Nickname',
    notes: 'Notes',
    title: 'Title',
    location: 'Location',
    start: 'Start',
    durationMinutes: 'Duration',
    text: 'Draft text',
    tagline: 'Tagline',
    concepts: 'Concepts',
    drills: 'Drills',
    checkpoints: 'Checkpoints',
    commonMisses: 'Common misses',
    fixes: 'Fixes',
  };
  const detailEntries = Object.entries(recovery.keptDetails);
  const retryPrompt =
    recovery.category === 'validation'
      ? 'Review the retained details, correct only what needs attention, and retry the failed save. Do not ask me to re-enter details you already have.'
      : 'Retry the failed save now with the same retained details. Do not ask me to re-enter them.';

  const openFallback = () => {
    const overlay = (
      window as typeof window & {
        LessonCaddieNavigationOverlay?: {
          openRecoveryFallback?: (fallback: LessonCaddieRecovery['fallback']) => boolean;
        };
      }
    ).LessonCaddieNavigationOverlay;
    if (recovery.fallback && overlay?.openRecoveryFallback?.(recovery.fallback)) {
      setStatus('Opening the prefilled editor in LessonCaddie.');
      return;
    }
    setStatus('Open LessonCaddie from the app to continue with the retained details.');
  };

  return (
    <section
      aria-label="Save recovery"
      className="border-border-light bg-surface-secondary mt-2 rounded-xl border p-3"
    >
      <p className="text-text-primary text-sm font-medium">
        {recovery.category === 'permission' && 'Permission issue'}
        {recovery.category === 'validation' && 'Review the details'}
        {recovery.category === 'service' && 'LessonCaddie service issue'}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (submitLessonCaddieRecoveryPrompt(retryPrompt)) {
              setStatus('Retry requested with the retained details.');
            } else {
              setStatus('The Chat composer is unavailable. Review the details or open the editor.');
            }
          }}
        >
          {localize('com_ui_lc_retry_save')}
        </Button>
        {detailEntries.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-expanded={showDetails}
            onClick={() => setShowDetails((value) => !value)}
          >
            {localize('com_ui_lc_review_details')}
          </Button>
        )}
        {recovery.fallback && (
          <Button type="button" size="sm" variant="outline" onClick={openFallback}>
            {localize('com_ui_lc_open_in_app')}
          </Button>
        )}
      </div>
      {showDetails && detailEntries.length > 0 && (
        <dl className="bg-surface-tertiary mt-3 max-h-44 overflow-auto rounded-lg p-2 text-sm">
          {detailEntries.map(([key, value]) => (
            <React.Fragment key={key}>
              <dt className="text-text-primary font-medium">{labels[key] ?? key}</dt>
              <dd className="text-text-secondary mb-2 whitespace-pre-wrap">
                {Array.isArray(value) ? value.join(' · ') : String(value)}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      )}
      {status && (
        <p className="text-text-secondary mt-2 text-sm" aria-live="polite">
          {status}
        </p>
      )}
    </section>
  );
}

export default function ToolCall({
  initialProgress = 0.1,
  isLast = false,
  isSubmitting,
  toolCallId,
  stepId,
  name,
  args: _args = '',
  output,
  attachments,
  auth,
  hideAttachments = false,
  onExpand,
  runStepStatus,
  runStepDurationMs,
  toolPreparationStartedAt,
  toolDispatchedAt,
  toolPreparationDurationMs,
  toolExecutionDurationMs,
}: {
  initialProgress: number;
  isLast?: boolean;
  isSubmitting: boolean;
  toolCallId?: string;
  stepId?: string;
  name: string;
  args: string | Record<string, unknown>;
  output?: string | null;
  attachments?: TAttachment[];
  auth?: string;
  hideAttachments?: boolean;
  onExpand?: () => void;
  runStepStatus?: PartMetadata['runStepStatus'];
  runStepDurationMs?: PartMetadata['runStepDurationMs'];
  toolPreparationStartedAt?: PartMetadata['toolPreparationStartedAt'];
  toolDispatchedAt?: PartMetadata['toolDispatchedAt'];
  toolPreparationDurationMs?: PartMetadata['toolPreparationDurationMs'];
  toolExecutionDurationMs?: PartMetadata['toolExecutionDurationMs'];
}) {
  const localize = useLocalize();
  const [oauthError, setOAuthError] = useState<string | null>(null);
  const [oauthBinding, setOAuthBinding] = useState<'pending' | 'bound' | 'failed'>('pending');

  const parsedAuthUrl = useMemo(() => {
    if (!auth) {
      return null;
    }
    try {
      return new URL(auth);
    } catch {
      return null;
    }
  }, [auth]);

  const mcpServerNames = useMCPServerNames();
  const { function_name, domain, isMCPToolCall, mcpServerName } = useMemo(() => {
    if (typeof name !== 'string') {
      return { function_name: '', domain: null, isMCPToolCall: false, mcpServerName: '' };
    }
    if (name.includes(Constants.mcp_delimiter)) {
      const [func, server = ''] = splitToolCallName(name, mcpServerNames);
      const displayName = func === 'oauth' ? server : func;
      return {
        function_name: displayName || '',
        domain: server && (server.replaceAll(actionDomainSeparator, '.') || null),
        isMCPToolCall: true,
        mcpServerName: server || '',
      };
    }

    if (parsedAuthUrl) {
      const redirectUri = parsedAuthUrl.searchParams.get('redirect_uri') || '';
      const mcpMatch = redirectUri.match(/\/api\/mcp\/([^/]+)\/oauth\/callback/);
      if (mcpMatch?.[1]) {
        return {
          function_name: mcpMatch[1],
          domain: null,
          isMCPToolCall: true,
          mcpServerName: mcpMatch[1],
        };
      }
    }

    const [func, _domain] = name.includes(actionDelimiter)
      ? name.split(actionDelimiter)
      : [name, ''];
    return {
      function_name: func || '',
      domain: _domain && (_domain.replaceAll(actionDomainSeparator, '.') || null),
      isMCPToolCall: false,
      mcpServerName: '',
    };
  }, [name, parsedAuthUrl, mcpServerNames]);

  const toolIconType = useMemo(() => getToolIconType(name), [name]);
  const displayFunctionName = useMemo(
    () =>
      /** `function_name` has already had the MCP delimiter and server stripped
       *  above, so re-parsing it would classify an MCP function that happens to
       *  share a built-in's name (`read_file`, `set_memory`) as that native
       *  tool and show, and announce, an unrelated label. */
      isMCPToolCall ? function_name : getToolDisplayLabel(function_name, localize, mcpServerNames),
    [function_name, isMCPToolCall, localize, mcpServerNames],
  );
  const mcpIconMap = useMCPIconMap();
  const mcpIconUrl = isMCPToolCall ? mcpIconMap.get(mcpServerName) : undefined;
  const hideLessonCaddieToolIcon = isMCPToolCall && mcpServerName === 'lessoncaddie-instructor';

  const actionId = useMemo(() => {
    if (isMCPToolCall || !parsedAuthUrl) {
      return '';
    }
    const redirectUri = parsedAuthUrl.searchParams.get('redirect_uri') || '';
    const match = redirectUri.match(/\/api\/actions\/([^/]+)\/oauth\/callback/);
    return match?.[1] || '';
  }, [parsedAuthUrl, isMCPToolCall]);

  /**
   * Sets the CSRF cookie the OAuth callback checks when the provider redirects back, or returns
   * null when this prompt has nothing to bind.
   */
  const bindOAuth = useCallback((): Promise<void> | null => {
    const bindsMCP = isMCPToolCall && mcpServerName.length > 0;
    if (!bindsMCP && !actionId) {
      return null;
    }
    return (async () => {
      if (bindsMCP) {
        await dataService.bindMCPOAuth(mcpServerName);
      } else {
        await dataService.bindActionOAuth(actionId);
      }
    })();
  }, [isMCPToolCall, mcpServerName, actionId]);

  const hasError = (typeof output === 'string' && isError(output)) || runStepStatus === 'failed';
  /**
   * The step's own terminal status wins when the run emitted one. The
   * `isSubmitting` heuristic below it is a whole-message inference: it cannot
   * tell which step actually stopped, so it holds every unfinished call in a
   * running state until the entire response ends and then flips them all to
   * cancelled at once. Retained as the fallback for messages saved before
   * `on_run_step_closed` and for endpoints that do not emit it.
   *
   * The status is authoritative on its own terms — deliberately not gated on
   * `hasError`, so output parsing cannot demote a stopped step back into an
   * in-flight state.
   */
  const isClosed = runStepStatus != null;

  const args = useMemo(() => {
    if (typeof _args === 'string') {
      return _args;
    }
    try {
      return JSON.stringify(_args, null, 2);
    } catch (e) {
      logger.error(
        'client/src/components/Chat/Messages/Content/ToolCall.tsx - Failed to stringify args',
        e,
      );
      return '';
    }
  }, [_args]) as string | undefined;

  const hasInfo = useMemo(
    () => (args?.length ?? 0) > 0 || (output?.length ?? 0) > 0,
    [args, output],
  );
  /** The preference opens a card once it has output; a sole call opens on
   *  its arguments too, so a call that returned nothing still shows them. */
  const soleTool = useContext(SoleToolContext) === true;
  const authDomain = useMemo(() => {
    return parsedAuthUrl?.hostname ?? '';
  }, [parsedAuthUrl]);

  /**
   * Both halves are load-bearing: passing 1 in stops `useProgress` scheduling
   * its 200ms interval, and masking the result makes the terminal value
   * observable on the same render rather than after the hook settles.
   */
  const rawProgress = useProgress(isClosed ? 1 : initialProgress);
  /**
   * One resolution, read by the label, the live region, the icon and the
   * shimmer alike. It also unifies two inputs that had drifted apart: the
   * cancellation inference read `initialProgress` while the label read the
   * animated `rawProgress`.
   */
  const phase = resolveToolCallPhase({
    runStepStatus,
    displayProgress: rawProgress,
    reportedProgress: initialProgress,
    isSubmitting,
    hasError,
  });
  const lessonCaddieRecovery = useMemo(() => {
    if (phase !== 'failed' || !isMCPToolCall || mcpServerName !== 'lessoncaddie-instructor') {
      return null;
    }
    return buildLessonCaddieRecovery(function_name, args, output);
  }, [phase, isMCPToolCall, mcpServerName, function_name, args, output]);
  const showOAuth = Boolean(auth) && phase === 'running';

  const [expandedInfo, setShowInfo] = useToolExpansion(
    soleTool ? hasInfo : (output?.length ?? 0) > 0,
  );
  /** The only call of its group, settled successfully: the group header is the
   *  row, so the panel stands alone and stays open. An MCP or action call keeps
   *  its row, the only place its function name and domain appear, as does a call
   *  with a model-authored intent. */
  const intent = useToolCallIntent(_args);
  const isActionCall = domain != null && domain !== '';
  const loneGroup = useContext(LoneGroupContext);
  /** The cheap, identity and phase checks run first: a streaming call re-renders
   *  on every argument delta, and the panel check parses its payload. */
  const bare =
    phase === 'completed' &&
    (soleTool || loneGroup) &&
    !isMCPToolCall &&
    !isActionCall &&
    intent == null &&
    hasInfo &&
    (hasToolParams(args) || hasRenderableOutput(output));
  const showInfo = bare || expandedInfo;
  /** A bare panel is open without the reader expanding it, so it asks for the stored part too. */
  useToolContentRequest(bare);
  const { style: expandStyle, ref: expandRef } = useExpandCollapse(showInfo);
  const rowRef = useRowHandoff(bare);
  const { shouldRenderBody, mountBody, handleTransitionEnd } = useLazyCollapseBody(showInfo);

  /**
   * Binds when the sign-in prompt appears instead of on tap, so the tap opens the provider
   * synchronously: an iOS home-screen app drops a tab opened after an awaited request. The button
   * stays disabled until the bind lands, so the provider cannot redirect back before its cookie.
   */
  useEffect(() => {
    if (!showOAuth) {
      return;
    }
    const binding = bindOAuth();
    if (binding == null) {
      setOAuthBinding('bound');
      return;
    }
    let active = true;
    setOAuthBinding('pending');
    binding.then(
      () => {
        if (active) {
          setOAuthBinding('bound');
        }
      },
      (error: unknown) => {
        logger.error('Failed to bind OAuth CSRF cookie', error);
        if (active) {
          setOAuthBinding('failed');
        }
      },
    );
    return () => {
      active = false;
    };
  }, [showOAuth, auth, bindOAuth]);

  const handleOAuthClick = useCallback(() => {
    if (!auth || oauthBinding === 'pending') {
      return;
    }
    if (oauthBinding === 'bound') {
      setOAuthError(null);
      openInNewTab(auth);
      /**
       * Live prompts share one CSRF cookie per callback path, so the last prompt to bind owns it.
       * The tapped prompt claims it again after opening; the provider cannot redirect back before
       * the user signs in, and the session cookie from the earlier bind covers a faster callback.
       */
      bindOAuth()?.catch((error: unknown) => {
        logger.error('Failed to bind OAuth CSRF cookie', error);
      });
      return;
    }
    setOAuthError(localize('com_ui_oauth_error_generic'));
    setOAuthBinding('pending');
    (bindOAuth() ?? Promise.resolve()).then(
      () => {
        setOAuthBinding('bound');
        setOAuthError(null);
      },
      (error: unknown) => {
        logger.error('Failed to bind OAuth CSRF cookie', error);
        setOAuthBinding('failed');
      },
    );
  }, [auth, oauthBinding, bindOAuth, localize]);

  const handleToggleInfo = useCallback(() => {
    mountBody();
    if (!showInfo) {
      onExpand?.();
    }
    setShowInfo(!showInfo);
  }, [mountBody, onExpand, setShowInfo, showInfo]);

  /** A failed row spends its subtitle on the error's first line: what went
   *  wrong is the fact the reader needs from that slot, ahead of which server
   *  the call went through. */
  const subtitle = useMemo(() => {
    const errorLine = phase === 'failed' ? firstErrorLine(output) : '';
    if (errorLine.length > 0) {
      return errorLine;
    }
    if (isMCPToolCall && mcpServerName) {
      return localize('com_ui_via_server', { 0: mcpServerName });
    }
    if (domain && domain.length !== Constants.ENCODED_DOMAIN_LENGTH) {
      return localize('com_ui_via_server', { 0: domain });
    }
    return undefined;
  }, [phase, output, isMCPToolCall, mcpServerName, domain, localize]);

  /** Model-authored live label, streamed as the first args key (injected by
   *  the `tool_intents` capability); persists as the settled label —
   *  completion is a UI state, not a tense change. */
  const preparationText = useToolPreparation();
  const preparing = useMemo(
    () =>
      isToolCallPreparing({
        args: _args,
        output,
        progress: initialProgress,
        toolPreparationStartedAt,
        toolDispatchedAt,
        runStepStatus,
      }),
    [_args, output, initialProgress, toolPreparationStartedAt, toolDispatchedAt, runStepStatus],
  );
  const subject = intent ?? displayFunctionName;
  let inProgressText =
    intent ??
    (displayFunctionName
      ? localize('com_assistants_running_var', { 0: displayFunctionName })
      : localize('com_assistants_running_action'));
  if (toolDispatchedAt != null) {
    inProgressText = localize('com_ui_tool_calling', { 0: subject });
  } else if (preparing) {
    inProgressText =
      preparationText ??
      (displayFunctionName
        ? localize('com_ui_tool_preparing', { 0: displayFunctionName })
        : localize('com_assistants_preparing_action'));
  }

  const getFinishedText = () => {
    if (phase === 'cancelled') {
      return localize('com_ui_cancelled');
    }
    /**
     * Announced before the completion strings below: a terminal step that
     * errored must not reach the live region as "completed", which would tell
     * a screen-reader user the opposite of what the card shows.
     */
    if (phase === 'failed') {
      /** The subject is the work the call named for itself, as on the live
       *  header and the collapsed card's peek, so the same failure reads the
       *  same wherever it is summarized. */
      const subject = intent ?? displayFunctionName;
      return subject
        ? localize('com_ui_failed_subject', { 0: subject })
        : localize('com_ui_failed');
    }
    if (intent != null) {
      return intent;
    }
    if (isMCPToolCall === true) {
      return localize('com_assistants_completed_function', { 0: displayFunctionName });
    }
    if (domain != null && domain && domain.length !== Constants.ENCODED_DOMAIN_LENGTH) {
      return localize('com_assistants_completed_action', { 0: domain });
    }
    return localize('com_assistants_completed_function', { 0: displayFunctionName });
  };

  if (!isLast && (!function_name || function_name.length === 0) && !output) {
    return null;
  }

  return (
    <>
      {/* The live region gets a STABLE in-progress value: the streaming
          intent grows on every delta, and an atomic polite region would
          re-announce the whole sentence each time. The settled intent is
          announced once via getFinishedText. */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {(() => {
          if (phase === 'running') {
            if (toolDispatchedAt != null) {
              return localize('com_ui_tool_calling', { 0: displayFunctionName });
            }
            if (preparing) {
              return inProgressText;
            }
            return displayFunctionName
              ? localize('com_assistants_running_var', { 0: displayFunctionName })
              : localize('com_assistants_running_action');
          }
          return getFinishedText();
        })()}
      </span>
      {!bare && (
        <div
          className={TOOL_ROW_CLASSES}
          ref={rowRef}
          data-testid="tool-call"
          data-tool-call-id={toolCallId}
          data-task-tool-call={toolCallId}
          data-task-step={stepId}
        >
          <ProgressText
            phase={phase}
            onClick={handleToggleInfo}
            inProgressText={inProgressText}
            authText={
              phase === 'running' && authDomain.length > 0
                ? localize('com_ui_requires_auth')
                : undefined
            }
            finishedText={getFinishedText()}
            subtitle={subtitle}
            durationMs={runStepDurationMs}
            toolPreparationDurationMs={toolPreparationDurationMs}
            toolExecutionDurationMs={toolExecutionDurationMs}
            phaseStartAt={toolDispatchedAt ?? toolPreparationStartedAt}
            icon={
              hideLessonCaddieToolIcon ? null : (
                <ToolIcon
                  type={toolIconType}
                  iconUrl={mcpIconUrl}
                  isAnimating={phase === 'running'}
                />
              )
            }
            hasInput={hasInfo}
            isExpanded={showInfo}
          />
        </div>
      )}
      <div
        style={expandStyle}
        onTransitionEnd={handleTransitionEnd}
        data-tool-call-output-id={toolCallId}
      >
        <div className="overflow-hidden" ref={expandRef}>
          {hasInfo && shouldRenderBody && (
            <div
              className={cn(
                toolPanelSpacingClassName,
                'border-border-light bg-surface-secondary overflow-hidden rounded-lg border',
              )}
            >
              <ToolCallInfo input={args ?? ''} output={output} />
            </div>
          )}
        </div>
      </div>
      {lessonCaddieRecovery && <LessonCaddieRecoveryControls recovery={lessonCaddieRecovery} />}
      {showOAuth && (
        <div className="flex w-full flex-col gap-2.5">
          <div className="mt-2 mb-1">
            <Button
              className="inline-flex items-center justify-center rounded-xl font-medium"
              variant="default"
              rel="noopener noreferrer"
              disabled={oauthBinding === 'pending'}
              aria-busy={oauthBinding === 'pending'}
              onClick={handleOAuthClick}
            >
              {localize('com_ui_sign_in_to_domain', { 0: authDomain })}
            </Button>
          </div>
          {oauthError && (
            <p role="alert" className="text-text-destructive text-sm">
              {oauthError}
            </p>
          )}
          <ToolAuthWarning />
        </div>
      )}
      {!hideAttachments && attachments && attachments.length > 0 && (
        <>
          <AttachmentGroup attachments={attachments} />
          <MCPAppViews attachments={attachments} />
        </>
      )}
    </>
  );
}
