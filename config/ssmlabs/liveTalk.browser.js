/**
 * SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Live Talk host adapter. Uses Speak Core's public API only.
 */
(function attachLessonCaddieLiveTalk(windowObject) {
  'use strict';

  const SpeakCore = windowObject.SpeakCore;
  const root = windowObject.document;
  const nativeFetch = windowObject.fetch.bind(windowObject);
  const LOG_PREFIX = '[ssmlabs-live-talk]';
  const ASSISTANT_MESSAGE_SOURCE = 'lessoncaddie-assistant';
  const SHELL_MESSAGE_SOURCE = 'lessoncaddie-shell';
  const DEFAULT_PARENT_ORIGINS = [
    'https://lessoncaddie.ssmlabs.com',
    'http://127.0.0.1:3021',
    'http://localhost:3021',
  ];
  let config = { enabled: false };
  let overlayReady = false;
  let active = null;
  let accessToken = '';
  let ui = { state: 'idle', text: '' };
  let pendingShellAction = '';
  let pendingLiveVoice = null;
  let pendingGreeting = '';
  let greetingLine = 'Good morning.';
  let liveTalkSpec = '';
  let greetingPending = false;
  let greetingAudioStarted = false;
  let greetingResponseId = '';
  let greetingSent = false;
  let assistantAudioPlaying = false;
  let paused = false;
  let startInFlight = false;
  let stopRequested = false;
  let awaitingAssistant = false;
  let pendingKickTimer = 0;
  let readyTimer = 0;
  let pingTimer = 0;
  let gptLiveIdleTimer = 0;
  let gptLiveHeardTimer = 0;
  let gptLiveHangupSpeechTimer = 0;
  let gptLiveHangupInFlight = false;
  let gptLiveHangupKind = '';
  let gptLiveHeard = '';
  let gptLiveUserWantsHangup = false;
  let liveTalkConversationId = '';
  let liveTalkUserHeard = '';
  let liveTalkAssistantHeard = '';
  let liveTalkUserDraftId = '';
  let liveTalkAssistantDraftId = '';
  let liveTalkPreviewTimer = 0;
  let liveTalkPreviewRoles = new Set();
  let liveTalkQueryClient = null;
  let gptLiveLastEventAt = 0;
  let gptLiveLastUsefulAt = 0;
  let gptLiveLastTranscriptAt = 0;
  let gptLiveClientActionTimer = 0;
  let gptLivePlaybackMeter = null;
  let liveVoiceSettings = {
    waitForYou: 'patient',
    allowInterrupt: false,
    ignoreBackgroundNoise: true,
    muteMicWhileSheTalks: true,
    voice: 'marin',
    provider: 'openai-realtime',
  };

  function normalizeLiveVoiceSettings(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const waitForYou = ['patient', 'balanced', 'fast'].includes(
      String(src.waitForYou || '')
        .trim()
        .toLowerCase(),
    )
      ? String(src.waitForYou).trim().toLowerCase()
      : 'patient';
    const customVoiceId = typeof src.voice === 'object' ? clean(src.voice.id) : clean(src.voice);
    const voiceRaw = String(customVoiceId || '')
      .trim()
      .toLowerCase();
    const voices = ['marin', 'cedar', 'shimmer', 'verse', 'alloy'];
    let selectedVoice = voices.includes(voiceRaw) ? voiceRaw : 'marin';
    if (/^voice_[A-Za-z0-9_-]+$/.test(customVoiceId)) selectedVoice = { id: customVoiceId };
    return {
      waitForYou,
      allowInterrupt: src.allowInterrupt === true,
      ignoreBackgroundNoise: src.ignoreBackgroundNoise !== false,
      muteMicWhileSheTalks: src.muteMicWhileSheTalks !== false,
      voice: selectedVoice,
      provider: src.provider === 'gpt-live' ? 'gpt-live' : 'openai-realtime',
    };
  }

  function clean(value) {
    return String(value || '').trim();
  }

  function appendLiveTalkDelta(buffer, piece) {
    const next = piece == null ? '' : String(piece);
    if (!next) return buffer || '';
    const prev = buffer || '';
    if (!prev) return next;
    if (/^\s/.test(next) || /\s$/.test(prev)) return `${prev}${next}`;
    if (/[A-Za-z0-9']$/.test(prev) && /^[A-Za-z0-9']/.test(next)) return `${prev} ${next}`;
    if (/[.,!?;:]$/.test(prev) && /^[A-Za-z0-9']/.test(next)) return `${prev} ${next}`;
    return `${prev}${next}`;
  }

  function normalizeHeard(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^\w\s']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isLiveTalkDonePhrase(text) {
    const heard = normalizeHeard(text);
    if (!heard || heard.length > 72) return false;
    return /^(ok(?:ay)? |all right |alright )?(thanks? |thank you )?(i(?:'m| am) done|that(?:'s| is) (?:all|it)|we(?:'re| are) done|you can (?:hang up|stop|go)|hang up|stop (?:talking|listening)|end (?:talk|the (?:call|session)|live talk)|good ?bye|bye(?: bye)?)( now| please)?$/.test(
      heard,
    );
  }

  function isLiveTalkFarewellPhrase(text) {
    const heard = normalizeHeard(text);
    if (!heard || heard.length > 240) return false;
    if (isLiveTalkDonePhrase(heard)) return true;
    return /(^| )((ok(?:ay)?|alright|all right) )?(thanks? |thank you )?(good ?bye|bye bye|talk to you later|see you later|have a (good|great) (one|day|night)|take care|i(?:'ll| will) let you go|hanging up)( now)?$/.test(
      heard,
    );
  }

  function gptLiveSilenceMs() {
    return Number(config.gptLiveIdleMs) > 0 ? Number(config.gptLiveIdleMs) : 20000;
  }

  function gptLiveNoiseMs() {
    return Number(config.gptLiveNoiseMs) > 0 ? Number(config.gptLiveNoiseMs) : 60000;
  }

  function gptLiveHangupCopy(kind) {
    const silenceSec = Math.round(gptLiveSilenceMs() / 1000);
    const noiseSec = Math.round(gptLiveNoiseMs() / 1000);
    if (kind === 'done') {
      return { say: 'Okay, hanging up.', status: 'Hung up because you said you were done.' };
    }
    if (kind === 'farewell') {
      return { say: '', status: 'Hung up after goodbye.' };
    }
    if (kind === 'noise') {
      return {
        say: 'Okay, hanging up. I am not catching words.',
        status: `Hung up after ${noiseSec} seconds of noise without a question.`,
      };
    }
    return {
      say: 'Okay, hanging up. You went quiet.',
      status: `Hung up after ${silenceSec} seconds of silence.`,
    };
  }

  function gptLiveStopStatus(reason) {
    if (
      reason === 'done' ||
      reason === 'farewell' ||
      reason === 'silence' ||
      reason === 'noise' ||
      reason === 'idle'
    ) {
      return gptLiveHangupCopy(reason === 'idle' ? 'silence' : reason).status;
    }
    if (reason === 'failed') return ui.text || 'Could not connect Live Talk.';
    return 'Live Talk stopped.';
  }

  function liveTalkLog(stage, data) {
    try {
      windowObject.console.info(LOG_PREFIX, stage, data || {});
    } catch (_) {
      /* ignore console failures */
    }
  }

  function liveTalkWarn(stage, data) {
    try {
      windowObject.console.warn(LOG_PREFIX, stage, data || {});
    } catch (_) {
      /* ignore console failures */
    }
  }

  function liveTalkError(stage, data) {
    try {
      windowObject.console.error(LOG_PREFIX, stage, data || {});
    } catch (_) {
      /* ignore console failures */
    }
  }

  function summarizeError(error, extra) {
    const debug = error?.debug && typeof error.debug === 'object' ? error.debug : null;
    return {
      name: error?.name || '',
      message: error?.message || String(error || ''),
      code: error?.code || '',
      status: error?.status || '',
      openaiStatus: debug?.openaiStatus || '',
      openaiBody: debug?.openaiBody || '',
      debug,
      ...(extra || {}),
    };
  }

  function summarizeEvent(event) {
    const detail = event?.detail && typeof event.detail === 'object' ? event.detail : {};
    return {
      type: event?.type || '',
      name: detail.name || '',
      message: detail.message || '',
      providerEvent: detail.providerEvent || detail.event?.type || '',
      state: detail.state || '',
      connectionState: detail.connectionState || '',
      dataChannelState: detail.dataChannelState || '',
      iceConnectionState: detail.iceConnectionState || '',
    };
  }

  function rememberAuthHeader(value) {
    const text = String(value || '').trim();
    const match = text.match(/^Bearer\s+(\S+)/i);
    if (match && !accessToken) {
      accessToken = match[1];
      liveTalkLog('auth.captured', { chars: accessToken.length });
    } else if (match) {
      accessToken = match[1];
    }
  }

  function patchAuthCapture() {
    const proto = windowObject.XMLHttpRequest?.prototype;
    if (proto && !proto.__lcLiveTalkAuth) {
      const original = proto.setRequestHeader;
      proto.setRequestHeader = function setRequestHeader(name, value) {
        if (String(name).toLowerCase() === 'authorization') rememberAuthHeader(value);
        return original.apply(this, arguments);
      };
      proto.__lcLiveTalkAuth = true;
    }
  }

  function isSsoPath() {
    return String(windowObject.location?.pathname || '').includes('/sso/');
  }

  async function waitForAccessToken() {
    patchAuthCapture();
    for (let attempt = 0; attempt < 40 && !accessToken; attempt += 1) {
      await new Promise((resolve) => windowObject.setTimeout(resolve, 250));
    }
    liveTalkLog('auth.wait', {
      present: Boolean(accessToken),
      chars: accessToken.length,
    });
    return accessToken;
  }

  function chatBasePath() {
    try {
      const href = root.querySelector('base')?.getAttribute('href') || '/';
      const pathname = new URL(href, windowObject.location.origin).pathname;
      return pathname.replace(/\/$/, '');
    } catch (_) {
      return '';
    }
  }

  function liveTalkPath(path) {
    return `${chatBasePath()}${path}`;
  }

  function allowedParentOrigins() {
    const extra = windowObject.__LESSONCADDIE_NAV__?.allowedOrigins;
    const listed = Array.isArray(extra) ? extra.map(clean).filter(Boolean) : [];
    return [...new Set([...DEFAULT_PARENT_ORIGINS, ...listed])];
  }

  function isAllowedParentOrigin(origin) {
    return allowedParentOrigins().includes(clean(origin));
  }

  const WRITE_TOOLS = {
    add_student: true,
    update_student: true,
    delete_student: true,
    delete_students_by_filter: true,
    create_mock_student: true,
    create_lesson: true,
    create_mock_lesson: true,
    create_mock_lessons: true,
    move_lesson: true,
    update_lesson_details: true,
    delete_lesson: true,
    delete_lessons_by_filter: true,
    generate_lesson_summary: true,
    update_lesson_summary_draft: true,
    share_lesson_summary: true,
    attach_library_media: true,
    create_notice: true,
    delete_notice: true,
    create_playbook_system: true,
    update_playbook_system: true,
    delete_playbook_system: true,
    create_playbook_practice: true,
    update_playbook_practice: true,
    delete_playbook_practice: true,
    update_lesson_charges: true,
    set_assistant_conversation_starters: true,
  };

  function recordIdsFromToolResult(result) {
    let src = {};
    if (result?.structuredContent && typeof result.structuredContent === 'object') {
      src = result.structuredContent;
    } else if (result && typeof result === 'object') {
      src = result;
    }
    const lessonIds = Array.isArray(src.lessonIds) ? src.lessonIds.map(clean).filter(Boolean) : [];
    return {
      contactId: clean(src.contactId || src.relationshipRecordId) || undefined,
      lessonId: clean(src.lessonId) || lessonIds[0] || undefined,
      lessonIds: lessonIds.length ? lessonIds : undefined,
      noticeId: clean(src.noticeId) || undefined,
      systemId: clean(src.systemId) || undefined,
      practiceId: clean(src.practiceId) || undefined,
    };
  }

  function applyHostToolResult(name, result) {
    postAppDataChanged(name, result);
    if (clean(name) !== 'open_app_screen') return false;
    const overlay = windowObject.LessonCaddieNavigationOverlay;
    const opened = overlay?.onPayload?.(result);
    liveTalkLog('tool.navigate', {
      opened: Boolean(opened),
      destination: result?.destination || result?.structuredContent?.destination || '',
    });
    return Boolean(opened);
  }

  function stopGptLiveClientActionPoll() {
    windowObject.clearInterval(gptLiveClientActionTimer);
    gptLiveClientActionTimer = 0;
  }

  function startGptLiveClientActionPoll(session, sessionId) {
    stopGptLiveClientActionPoll();
    gptLiveClientActionTimer = windowObject.setInterval(() => {
      if (active?.session !== session || !sessionId) return;
      void api(liveTalkPath(`/live-talk/session/${sessionId}/client-actions`), { quiet: true })
        .then((payload) => {
          const actions = Array.isArray(payload?.actions) ? payload.actions : [];
          for (const action of actions) {
            applyHostToolResult(action?.name, action?.result);
          }
        })
        .catch((error) => {
          if (
            active?.session === session &&
            (error?.status === 401 || error?.status === 403 || error?.status === 404)
          ) {
            stopGptLiveClientActionPoll();
            void stopCall(ensureBar(), 'expired');
          }
        });
    }, 400);
  }

  function postAppDataChanged(toolName, result) {
    const name = clean(toolName);
    if (!WRITE_TOOLS[name]) return;
    if (windowObject.parent === windowObject) return;
    const ids = recordIdsFromToolResult(result);
    try {
      windowObject.parent.postMessage(
        {
          source: ASSISTANT_MESSAGE_SOURCE,
          type: 'data-changed',
          version: 1,
          toolName: name,
          ...ids,
        },
        '*',
      );
    } catch (_) {
      /* parent may be gone */
    }
    liveTalkLog('app.data-changed', { toolName: name, keys: Object.keys(ids) });
  }

  function postStatus() {
    if (windowObject.parent === windowObject) return;
    try {
      windowObject.parent.postMessage(
        {
          source: ASSISTANT_MESSAGE_SOURCE,
          type: 'live-talk-status',
          version: 1,
          enabled: Boolean(config.enabled),
          ready: overlayReady,
          state: ui.state,
          text: ui.text,
        },
        '*',
      );
    } catch (_) {
      /* parent may be gone */
    }
  }

  function conversationIdFromLocation() {
    const match = String(windowObject.location?.pathname || '').match(/\/c\/([^/]+)/);
    const id = match ? decodeURIComponent(match[1]) : '';
    if (!id || id === 'new') return '';
    return id;
  }

  function isQueryClient(value) {
    return Boolean(
      value && typeof value.setQueryData === 'function' && typeof value.getQueryData === 'function',
    );
  }

  function queryClientFromFiber(fiber) {
    const props = fiber?.memoizedProps || fiber?.pendingProps || {};
    if (isQueryClient(props.client)) return props.client;
    if (isQueryClient(props.value)) return props.value;
    const queued = fiber?.memoizedState;
    if (isQueryClient(queued)) return queued;
    if (isQueryClient(queued?.client)) return queued.client;
    let dep = fiber?.dependencies?.firstContext || fiber?.dependencies?.first;
    while (dep) {
      const value = dep.memoizedValue || dep._currentValue;
      if (isQueryClient(value)) return value;
      if (isQueryClient(value?.client)) return value.client;
      dep = dep.next;
    }
    return null;
  }

  function findQueryClient() {
    if (isQueryClient(liveTalkQueryClient)) return liveTalkQueryClient;
    const rootEl = root.getElementById?.('root');
    if (!rootEl) return null;
    const fiberKey = Object.keys(rootEl).find(
      (key) => key.startsWith('__reactFiber') || key.startsWith('__reactContainer'),
    );
    if (!fiberKey) return null;
    const queue = [rootEl[fiberKey]];
    const seen = new Set();
    for (let i = 0; i < 8000 && queue.length; i += 1) {
      const fiber = queue.shift();
      if (!fiber || seen.has(fiber)) continue;
      seen.add(fiber);
      const client = queryClientFromFiber(fiber);
      if (client) {
        liveTalkQueryClient = client;
        return client;
      }
      if (fiber.child) queue.push(fiber.child);
      if (fiber.sibling) queue.push(fiber.sibling);
      if (fiber.alternate && !seen.has(fiber.alternate)) queue.push(fiber.alternate);
    }
    return null;
  }

  function liveTalkCacheKeys() {
    const id = clean(liveTalkConversationId);
    const viewId = conversationIdFromLocation() || 'new';
    return [...new Set([id, viewId].filter(Boolean))];
  }

  function newLiveTalkDraftId(role) {
    const rand =
      typeof windowObject.crypto?.randomUUID === 'function'
        ? windowObject.crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    return `live-${role}-${rand}`;
  }

  function upsertLivePreview(role, text) {
    const spoken = String(text || '');
    if (!spoken.trim() || !['user', 'assistant'].includes(role)) return;
    const client = findQueryClient();
    if (!client) return;
    const convoId = clean(liveTalkConversationId) || conversationIdFromLocation() || 'new';
    const isUser = role === 'user';
    if (isUser && !liveTalkUserDraftId) liveTalkUserDraftId = newLiveTalkDraftId('user');
    if (!isUser && !liveTalkAssistantDraftId)
      liveTalkAssistantDraftId = newLiveTalkDraftId('assistant');
    const messageId = isUser ? liveTalkUserDraftId : liveTalkAssistantDraftId;
    const now = new Date().toISOString();
    for (const key of liveTalkCacheKeys()) {
      const prev = client.getQueryData(['messages', key]);
      const list = Array.isArray(prev) ? prev.slice() : [];
      const idx = list.findIndex((message) => message && message.messageId === messageId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], text: spoken, unfinished: false, updatedAt: now };
      } else {
        const last = list[list.length - 1];
        list.push({
          messageId,
          conversationId: convoId,
          parentMessageId: last?.messageId || null,
          sender: isUser ? 'User' : 'Instructor Assistant',
          text: spoken,
          isCreatedByUser: isUser,
          endpoint: 'agents',
          unfinished: false,
          error: false,
          createdAt: now,
          updatedAt: now,
        });
      }
      client.setQueryData(['messages', key], list);
    }
  }

  function scheduleLivePreview(role) {
    liveTalkPreviewRoles.add(role);
    if (liveTalkPreviewTimer) return;
    const run = () => {
      liveTalkPreviewTimer = 0;
      const roles = liveTalkPreviewRoles;
      liveTalkPreviewRoles = new Set();
      if (roles.has('user') || roles.has('both')) upsertLivePreview('user', liveTalkUserHeard);
      if (roles.has('assistant') || roles.has('both')) {
        upsertLivePreview('assistant', liveTalkAssistantHeard);
      }
    };
    if (typeof windowObject.requestAnimationFrame === 'function') {
      liveTalkPreviewTimer = windowObject.requestAnimationFrame(run);
      return;
    }
    liveTalkPreviewTimer = windowObject.setTimeout(run, 32);
  }

  function clearLivePreviewDraft(role) {
    if (role === 'user') liveTalkUserDraftId = '';
    else liveTalkAssistantDraftId = '';
  }

  async function refreshAskConversation(conversationId) {
    const id = clean(conversationId || liveTalkConversationId);
    if (!id) return;
    let messages = null;
    try {
      const response = await nativeFetch(
        `${chatBasePath()}/api/messages/${encodeURIComponent(id)}`,
        {
          credentials: 'include',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (response.ok) {
        const payload = await response.json();
        messages = Array.isArray(payload) ? payload : payload?.messages;
      }
    } catch (_) {
      /* Ask refresh is best-effort after the save */
    }
    const client = findQueryClient();
    if (!client || !Array.isArray(messages)) return;
    for (const key of liveTalkCacheKeys()) {
      try {
        client.setQueryData(['messages', key], messages);
      } catch (_) {
        /* Recoil QueryClient shape can differ */
      }
    }
    try {
      client.invalidateQueries(['allConversations']);
    } catch (_) {
      /* conversation list refresh is best-effort */
    }
  }

  async function saveLiveTranscript(role, text) {
    const sessionId = active?.sessionId;
    const spoken = clean(text);
    if (!sessionId || !spoken || !['user', 'assistant'].includes(role)) return;
    try {
      await api(liveTalkPath(`/live-talk/session/${sessionId}/transcript`), {
        method: 'POST',
        body: JSON.stringify({ role, text: spoken }),
        quiet: true,
      });
      liveTalkLog('transcript.saved', { role, chars: spoken.length });
      clearLivePreviewDraft(role);
      await refreshAskConversation(liveTalkConversationId);
    } catch (error) {
      liveTalkWarn('transcript.save-failed', summarizeError(error, { role }));
    }
  }

  function flushLiveTranscript(role) {
    const spoken = role === 'user' ? liveTalkUserHeard : liveTalkAssistantHeard;
    if (role === 'user') liveTalkUserHeard = '';
    else liveTalkAssistantHeard = '';
    upsertLivePreview(role, spoken);
    if (!clean(spoken)) return null;
    return saveLiveTranscript(role, spoken);
  }

  function liveTalkSpecFromLocation() {
    try {
      return new URL(windowObject.location.href).searchParams.get('spec') || '';
    } catch (_) {
      return '';
    }
  }

  function rememberLiveTalkSpec(value) {
    const spec = clean(value);
    if (spec === 'student-caddie' || spec === 'instructor-assistant') {
      liveTalkSpec = spec;
    }
    return liveTalkSpec;
  }

  function resolveLiveTalkSpec() {
    rememberLiveTalkSpec(liveTalkSpecFromLocation());
    if (liveTalkSpec) return liveTalkSpec;
    try {
      const title = String(windowObject.document?.title || '');
      const heading = String(windowObject.document?.querySelector?.('h1')?.textContent || '');
      if (/student caddie/i.test(`${title} ${heading}`)) return 'student-caddie';
    } catch (_) {
      /* title may be unavailable */
    }
    return '';
  }

  function isTalkingState(state) {
    return (
      state === 'connecting' ||
      state === 'greeting' ||
      state === 'listening' ||
      state === 'responding' ||
      state === 'tool' ||
      state === 'paused'
    );
  }

  function sleep(ms) {
    return new Promise((resolve) => windowObject.setTimeout(resolve, ms));
  }

  function setStatus(_bar, state, text) {
    if (paused && !['paused', 'idle', 'error'].includes(state)) return;
    ui.state = String(state || 'idle');
    ui.text = String(text || '');
    postStatus();
  }

  async function api(path, options) {
    const method = String(options?.method || 'GET').toUpperCase();
    const quiet = options?.quiet === true;
    const retry = Math.max(0, Number(options?.retry) || 0);
    const fetchOptions = { ...(options || {}) };
    delete fetchOptions.quiet;
    delete fetchOptions.retry;
    const token = accessToken || (await waitForAccessToken());
    if (!token) {
      const error = new Error('Live Talk is waiting for Chat sign-in.');
      error.code = 'auth_missing';
      if (!quiet) liveTalkError('api.auth-missing', { method, path });
      throw error;
    }
    liveTalkLog('api.request', { method, path, tokenChars: token.length });
    let response;
    try {
      response = await nativeFetch(path, {
        credentials: 'include',
        ...fetchOptions,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
          ...(fetchOptions.body ? { 'content-type': 'application/json' } : {}),
          ...(fetchOptions.headers || {}),
        },
      });
    } catch (error) {
      if (retry > 0) {
        await sleep(400);
        return api(path, { ...options, retry: retry - 1 });
      }
      if (!quiet) liveTalkError('api.network', summarizeError(error, { method, path }));
      throw error;
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.message || 'Live Talk request failed.');
      error.code = payload.error || `http_${response.status}`;
      error.status = response.status;
      error.debug = payload.debug || payload;
      if (retry > 0 && (response.status >= 500 || response.status === 409)) {
        await sleep(400);
        return api(path, { ...options, retry: retry - 1 });
      }
      if (!quiet) {
        liveTalkError(
          'api.failed',
          summarizeError(error, { method, path, httpStatus: response.status }),
        );
      }
      throw error;
    }
    liveTalkLog('api.ok', {
      method,
      path,
      status: response.status,
      keys: payload && typeof payload === 'object' ? Object.keys(payload) : [],
    });
    return payload;
  }

  function ensureBar() {
    return { dataset: ui };
  }

  async function stopCall(bar, reason) {
    const current = active;
    liveTalkLog('stop', { reason: String(reason || ''), sessionId: current?.sessionId || '' });
    await Promise.all(
      [flushLiveTranscript('user'), flushLiveTranscript('assistant')].filter(Boolean),
    );
    active = null;
    stopGptLiveHangupWatch();
    windowObject.clearTimeout(gptLiveHangupSpeechTimer);
    gptLiveHangupSpeechTimer = 0;
    gptLiveHangupInFlight = false;
    gptLiveHangupKind = '';
    gptLiveHeard = '';
    gptLiveUserWantsHangup = false;
    liveTalkUserDraftId = '';
    liveTalkAssistantDraftId = '';
    if (liveTalkPreviewTimer) {
      windowObject.cancelAnimationFrame?.(liveTalkPreviewTimer);
      windowObject.clearTimeout(liveTalkPreviewTimer);
      liveTalkPreviewTimer = 0;
    }
    stopGptLiveClientActionPoll();
    stopGptLivePlaybackMeter();
    if (!current?.gptLive) {
      try {
        current?.session?.cancel?.(reason);
      } catch (_) {
        /* already closed */
      }
    }
    try {
      await current?.session?.stop?.(reason);
    } catch (_) {
      /* already closed */
    }
    try {
      current?.bridge?.detach?.();
    } catch (_) {
      /* ignore */
    }
    liveTalkAudioElements().forEach((audio) => {
      try {
        audio.pause?.();
        audio.srcObject = null;
        audio.remove();
      } catch (_) {
        /* ignore */
      }
    });
    if (pingTimer) {
      windowObject.clearInterval(pingTimer);
      pingTimer = 0;
    }
    if (current?.sessionId) {
      try {
        await api(liveTalkPath(`/live-talk/session/${current.sessionId}/stop`), {
          method: 'POST',
          body: JSON.stringify({ reason }),
          quiet: true,
        });
      } catch (_) {
        /* stop is best-effort if Chat already dropped the session */
      }
    }
    greetingPending = false;
    greetingAudioStarted = false;
    greetingResponseId = '';
    greetingSent = false;
    assistantAudioPlaying = false;
    awaitingAssistant = false;
    if (reason !== 'restart') paused = false;
    clearPendingKick();
    windowObject.clearTimeout(readyTimer);
    readyTimer = 0;
    if (reason !== 'restart' && reason !== 'failed') {
      setStatus(bar, 'idle', gptLiveStopStatus(reason));
    }
  }

  function pauseCall(bar) {
    if (!active && !startInFlight) return;
    paused = true;
    greetingPending = false;
    greetingAudioStarted = false;
    greetingResponseId = '';
    greetingSent = false;
    assistantAudioPlaying = false;
    awaitingAssistant = false;
    clearPendingKick();
    windowObject.clearTimeout(readyTimer);
    readyTimer = 0;
    try {
      active?.session?.setMuted?.(true);
    } catch (_) {
      /* session may be connecting */
    }
    try {
      active?.session?.sendEvent?.({ type: 'output_audio_buffer.clear' });
    } catch (_) {
      /* buffer may be empty */
    }
    liveTalkAudioElements().forEach((audio) => {
      try {
        audio.pause?.();
      } catch (_) {
        /* audio may be gone */
      }
    });
    setStatus(bar, 'paused', 'Paused');
  }

  function resumeCall(bar) {
    if (!active || !paused) return;
    paused = false;
    try {
      active.session?.sendEvent?.({ type: 'output_audio_buffer.clear' });
    } catch (_) {
      /* audio may already be clear */
    }
    try {
      active.session?.setMuted?.(false);
    } catch (_) {
      /* reconnect can still fail later */
    }
    setStatus(bar, 'listening', 'Listening…');
  }

  function turnDetectionForVoice(voice, createResponse) {
    const interrupt_response = voice.allowInterrupt === true;
    if (!voice.ignoreBackgroundNoise) {
      return {
        type: 'server_vad',
        threshold: 0.75,
        prefix_padding_ms: 300,
        silence_duration_ms: 900,
        create_response: createResponse,
        interrupt_response,
      };
    }
    let eagerness = 'medium';
    if (voice.waitForYou === 'fast') eagerness = 'high';
    else if (voice.waitForYou === 'patient') eagerness = 'medium';
    return {
      type: 'semantic_vad',
      eagerness,
      create_response: createResponse,
      interrupt_response,
    };
  }

  function enableTurnResponses(session) {
    if (!session?.sendEvent) return;
    try {
      /* The speech-end handler owns response.create; automatic VAD responses would duplicate it. */
      session.sendEvent({
        type: 'session.update',
        session: {
          type: 'realtime',
          audio: {
            input: {
              turn_detection: turnDetectionForVoice(
                normalizeLiveVoiceSettings(liveVoiceSettings),
                false,
              ),
            },
          },
        },
      });
    } catch (error) {
      liveTalkWarn('turn-detection.enable-failed', summarizeError(error));
    }
  }

  function clearPendingKick() {
    windowObject.clearTimeout(pendingKickTimer);
    pendingKickTimer = 0;
  }

  function kickTurn(session, reason) {
    if (paused) return;
    if (!session?.sendEvent) return;
    if (awaitingAssistant) return;
    if (ui.state === 'responding' || ui.state === 'tool') return;
    awaitingAssistant = true;
    liveTalkLog('turn.kick', { reason: String(reason || '') });
    try {
      session.sendEvent({ type: 'response.create' });
    } catch (error) {
      awaitingAssistant = false;
      liveTalkWarn('turn.kick-failed', summarizeError(error));
    }
  }

  function armSpeechEndKick(session) {
    if (paused) return;
    clearPendingKick();
    pendingKickTimer = windowObject.setTimeout(() => {
      pendingKickTimer = 0;
      kickTurn(session, 'speech-end');
    }, 400);
  }

  function finishGreeting(reason) {
    if (!greetingPending) return;
    greetingPending = false;
    greetingAudioStarted = false;
    greetingResponseId = '';
    greetingSent = false;
    awaitingAssistant = false;
    windowObject.clearTimeout(readyTimer);
    readyTimer = 0;
    if (paused) return;
    if (reason !== 'playback-stopped') {
      try {
        active?.session?.sendEvent?.({ type: 'response.cancel' });
      } catch (_) {
        /* stop an unfinished greeting before opening the mic */
      }
    }
    enableTurnResponses(active?.session);
    try {
      active?.session?.setMuted?.(false);
    } catch (_) {
      /* user must be able to speak after the greeting */
    }
    if (isTalkingState(ui.state)) {
      setStatus(ensureBar(), 'listening', 'Ready — go ahead');
    }
    liveTalkLog('greeting.done', { reason: String(reason || '') });
  }

  async function sendWhenChannelOpen(session, event) {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      if (paused && event?.type === 'response.create') return false;
      try {
        session.sendEvent(event);
        return true;
      } catch (error) {
        if (error?.code === 'SPEAK_REALTIME_CLOSED') throw error;
        if (error?.code !== 'SPEAK_REALTIME_CHANNEL_CLOSED') throw error;
        await sleep(100);
      }
    }
    return false;
  }

  async function speakGreeting(session) {
    if (paused) return;
    greetingPending = true;
    greetingAudioStarted = false;
    greetingResponseId = '';
    greetingSent = false;
    setStatus(ensureBar(), 'greeting', 'Starting…');
    const line = greetingLine || 'Good morning.';
    try {
      await sendWhenChannelOpen(session, { type: 'response.cancel' });
    } catch (_) {
      /* no in-flight response is fine */
    }
    if (paused) return;
    try {
      session.sendEvent({ type: 'output_audio_buffer.clear' });
    } catch (_) {
      /* buffer may already be empty */
    }
    const greetingResponse = {
      type: 'response.create',
      response: {
        tool_choice: 'none',
        instructions: `Speak only American English. Do not introduce yourself. Speak only this exact greeting, then stop. Do not add any other sentence, word, or language. Do not continue in Chinese or any other language. Say exactly: ${line}`,
      },
    };
    try {
      const started = await sendWhenChannelOpen(session, greetingResponse);
      if (!started) {
        liveTalkWarn('greeting.send-failed', { line, snapshot: session.snapshot?.() || {} });
        finishGreeting('send-failed');
        return;
      }
      greetingSent = true;
      liveTalkLog('greeting.sent', { line });
    } catch (error) {
      liveTalkWarn('greeting.send-failed', summarizeError(error));
      finishGreeting('send-failed');
      return;
    }
    windowObject.clearTimeout(readyTimer);
    readyTimer = windowObject.setTimeout(() => finishGreeting('timeout'), 20000);
  }

  function liveTalkAudioElements() {
    return Array.from(root.querySelectorAll('audio[data-lc-live-talk="true"]'));
  }

  function stopGptLivePlaybackMeter() {
    const meter = gptLivePlaybackMeter;
    gptLivePlaybackMeter = null;
    if (!meter) return;
    windowObject.clearInterval(meter.timer);
    meter.source.disconnect();
    void meter.context.close().catch(() => {});
  }

  function startGptLivePlaybackMeter(session, audio) {
    if (gptLivePlaybackMeter || !audio.srcObject) return;
    const AudioContext = windowObject.AudioContext || windowObject.webkitAudioContext;
    if (!AudioContext) {
      liveTalkWarn('playback.meter-unavailable', {});
      return;
    }
    let context;
    try {
      context = new AudioContext();
      const source = context.createMediaStreamSource(audio.srcObject);
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      const meter = { context, source, timer: 0, lastAudibleAt: Date.now() };
      gptLivePlaybackMeter = meter;
      void context.resume().then(
        () => liveTalkLog('playback.meter-ready', { state: context.state }),
        (error) => liveTalkWarn('playback.meter-resume-failed', summarizeError(error)),
      );
      meter.timer = windowObject.setInterval(() => {
        if (active?.session !== session || paused || context.state !== 'running') return;
        analyser.getFloatTimeDomainData(samples);
        let energy = 0;
        for (const sample of samples) energy += sample * sample;
        const audible = Math.sqrt(energy / samples.length) > 0.01;
        if (audible) {
          meter.lastAudibleAt = Date.now();
          if (ui.state !== 'responding') setStatus(ensureBar(), 'responding', 'Responding…');
        } else if (Date.now() - meter.lastAudibleAt > 700 && ui.state === 'responding') {
          assistantAudioPlaying = false;
          setStatus(ensureBar(), 'listening', 'Listening…');
        }
      }, 100);
    } catch (error) {
      liveTalkWarn('playback.meter-failed', summarizeError(error));
      if (gptLivePlaybackMeter) stopGptLivePlaybackMeter();
      else if (context) void context.close().catch(() => {});
    }
  }

  function createLiveTalkAudioElement() {
    const audio = root.createElement('audio');
    audio.autoplay = true;
    audio.playsInline = true;
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('data-lc-live-talk', 'true');
    audio.hidden = true;
    (root.body || root.documentElement).appendChild(audio);
    audio.addEventListener('playing', () => {
      if (active?.gptLive) startGptLivePlaybackMeter(active.session, audio);
    });
    audio.addEventListener('pause', () => {
      liveTalkWarn('playback.paused', {
        paused: audio.paused,
        ended: audio.ended,
        readyState: audio.readyState,
        hasSrcObject: Boolean(audio.srcObject),
      });
    });
    return audio;
  }

  function diagnosePlayback(reason) {
    const audios = liveTalkAudioElements();
    liveTalkLog('playback.elements', {
      reason: String(reason || ''),
      count: audios.length,
      items: audios.map((audio) => ({
        autoplay: Boolean(audio.autoplay),
        paused: Boolean(audio.paused),
        muted: Boolean(audio.muted),
        readyState: audio.readyState,
        hasSrcObject: Boolean(audio.srcObject),
      })),
    });
    audios.forEach((audio, index) => {
      if (!audio.paused) {
        liveTalkLog('playback.already-playing', {
          reason,
          index,
          readyState: audio.readyState,
        });
        return;
      }
      const play = audio.play?.();
      if (play && typeof play.then === 'function') {
        play.then(
          () => liveTalkLog('playback.play-ok', { reason, index }),
          (error) =>
            liveTalkError('playback.play-blocked', summarizeError(error, { reason, index })),
        );
      }
    });
  }

  async function waitForRemotePlayback(session, timeoutMs = 2500) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (active?.session !== session) return false;
      const audios = liveTalkAudioElements().filter((audio) => audio.srcObject);
      for (const audio of audios) {
        if (audio.paused) {
          try {
            await audio.play();
          } catch (_) {
            /* autoplay may still attach */
          }
        }
        if (!audio.paused) {
          liveTalkLog('playback.remote-ready', { readyState: audio.readyState });
          if (active?.gptLive) startGptLivePlaybackMeter(session, audio);
          return true;
        }
      }
      await sleep(50);
    }
    liveTalkWarn('playback.remote-wait-timeout', {
      count: liveTalkAudioElements().length,
    });
    return false;
  }

  function watchPeer(session) {
    [500, 1500, 4000].forEach((ms) => {
      windowObject.setTimeout(() => {
        if (active?.session !== session) return;
        try {
          liveTalkLog(`peer.snapshot.${ms}ms`, session.snapshot?.() || {});
        } catch (error) {
          liveTalkWarn('peer.snapshot-failed', summarizeError(error, { ms }));
        }
      }, ms);
    });
  }

  function noteGptLiveActivity(kind) {
    const now = Date.now();
    gptLiveLastEventAt = now;
    if (kind === 'useful' || kind === 'assistant' || kind === 'tool') gptLiveLastUsefulAt = now;
    if (kind === 'transcript') gptLiveLastTranscriptAt = now;
  }

  function resetGptLiveHeard() {
    gptLiveHeard = '';
    windowObject.clearTimeout(gptLiveHeardTimer);
    gptLiveHeardTimer = 0;
  }

  function markUserHangupIfDone() {
    if (isLiveTalkDonePhrase(gptLiveHeard)) gptLiveUserWantsHangup = true;
    return gptLiveUserWantsHangup;
  }

  function hangupAfterSpokenTurn(session, kind) {
    if (!session || active?.session !== session) return;
    gptLiveHangupInFlight = true;
    gptLiveHangupKind = kind || gptLiveHangupKind || 'farewell';
    stopGptLiveHangupWatch();
    const copy = gptLiveHangupCopy(gptLiveHangupKind);
    liveTalkLog('hangup.after-speech', { kind: gptLiveHangupKind, status: copy.status });
    setStatus(ensureBar(), 'responding', copy.status);
    windowObject.clearTimeout(gptLiveHangupSpeechTimer);
    gptLiveHangupSpeechTimer = windowObject.setTimeout(() => {
      void finishGptLiveHangup(session, gptLiveHangupKind);
    }, 700);
  }

  function stopGptLiveHangupWatch() {
    windowObject.clearInterval(gptLiveIdleTimer);
    gptLiveIdleTimer = 0;
    windowObject.clearTimeout(gptLiveHeardTimer);
    gptLiveHeardTimer = 0;
  }

  async function finishGptLiveHangup(session, kind) {
    if (active?.session !== session) return;
    const reason = kind || gptLiveHangupKind || 'silence';
    await stopCall(ensureBar(), reason);
  }

  function beginGptLiveHangup(session, kind) {
    if (!session || gptLiveHangupInFlight || active?.session !== session) return;
    gptLiveHangupInFlight = true;
    gptLiveHangupKind = kind;
    stopGptLiveHangupWatch();
    const copy = gptLiveHangupCopy(kind);
    liveTalkLog('hangup.begin', { kind, status: copy.status });
    setStatus(ensureBar(), 'responding', copy.status);
    try {
      session.cancel?.('hangup');
    } catch (_) {
      /* interrupt is best-effort */
    }
    try {
      session.sendEvent({
        type: 'response.create',
        response: {
          tool_choice: 'none',
          instructions: `Speak only American English. Speak only this exact line, then stop. Say exactly: ${copy.say}`,
        },
      });
    } catch (error) {
      liveTalkWarn('hangup.speak-failed', summarizeError(error, { kind }));
      void finishGptLiveHangup(session, kind);
      return;
    }
    windowObject.clearTimeout(gptLiveHangupSpeechTimer);
    gptLiveHangupSpeechTimer = windowObject.setTimeout(() => {
      void finishGptLiveHangup(session, kind);
    }, 5000);
  }

  function armGptLiveHangupWatch(session) {
    stopGptLiveHangupWatch();
    const now = Date.now();
    gptLiveHangupInFlight = false;
    gptLiveHangupKind = '';
    gptLiveHeard = '';
    gptLiveUserWantsHangup = false;
    gptLiveLastEventAt = now;
    gptLiveLastUsefulAt = now;
    gptLiveLastTranscriptAt = 0;
    gptLiveIdleTimer = windowObject.setInterval(() => {
      if (active?.session !== session || paused || gptLiveHangupInFlight) return;
      if (assistantAudioPlaying || awaitingAssistant) return;
      if (['connecting', 'greeting', 'responding', 'tool'].includes(ui.state)) return;
      const at = Date.now();
      const silenceMs = gptLiveSilenceMs();
      const noiseMs = gptLiveNoiseMs();
      const transcriptIsFresh = gptLiveLastTranscriptAt && at - gptLiveLastTranscriptAt < 2500;
      if (transcriptIsFresh && at - gptLiveLastUsefulAt >= noiseMs) {
        beginGptLiveHangup(session, 'noise');
        return;
      }
      if (at - gptLiveLastEventAt >= silenceMs) beginGptLiveHangup(session, 'silence');
    }, 250);
  }

  async function startCall(bar) {
    if (startInFlight) {
      liveTalkLog('start.ignored-in-flight', {});
      return;
    }
    startInFlight = true;
    stopRequested = false;
    paused = false;
    try {
      liveTalkLog('start.clicked', {
        href: String(windowObject.location?.href || ''),
        framed: windowObject.parent !== windowObject,
        speakCore: Boolean(SpeakCore),
        sessionApi: Boolean(SpeakCore?.createSpeakRealtimeSession),
        bridgeApi: Boolean(SpeakCore?.createOpenAIRealtimeFunctionCallBridge),
        mediaDevices: Boolean(windowObject.navigator?.mediaDevices?.getUserMedia),
      });
      if (
        !SpeakCore?.createSpeakRealtimeSession ||
        !SpeakCore.createOpenAIRealtimeFunctionCallBridge
      ) {
        liveTalkError('start.engine-missing', {
          speakCoreKeys: SpeakCore ? Object.keys(SpeakCore) : [],
        });
        setStatus(bar, 'error', 'Voice engine is not loaded. Reload Chat and try again.');
        return;
      }
      const conversationId = conversationIdFromLocation() || 'new';
      const spec = resolveLiveTalkSpec();
      liveTalkLog('start.conversation', { conversationId, spec });
      if (spec) {
        try {
          const nextConfig = await api(
            `${liveTalkPath('/live-talk/config')}?spec=${encodeURIComponent(spec)}`,
          );
          if (nextConfig && typeof nextConfig === 'object') {
            config = nextConfig;
          }
        } catch (error) {
          liveTalkWarn('config.spec-refresh-failed', summarizeError(error, { spec }));
        }
      }
      await stopCall(bar, 'restart');
      if (stopRequested) return;
      setStatus(bar, 'connecting', 'Connecting…');
      let sessionId = '';
      let bridgeInputHeld = false;
      const voice = normalizeLiveVoiceSettings(liveVoiceSettings);
      const gptLive = voice.provider === 'gpt-live' && config.spec === 'instructor-assistant';
      const session = SpeakCore.createSpeakRealtimeSession({
        provider: gptLive ? 'gpt-live' : 'openai-realtime',
        ...(gptLive
          ? {
              session: { model: 'gpt-live-1', audio: { output: { voice: voice.voice } } },
            }
          : {}),
        holdInput: voice.muteMicWhileSheTalks,
        conversationBehavior: { interruption: voice.allowInterrupt ? 'enabled' : 'disabled' },
        createAudioElement: createLiveTalkAudioElement,
        [gptLive ? 'bootstrapLiveSession' : 'bootstrapCall']: async ({ sdp }) => {
          /* The mic stream now exists; apply the startup mute before sending the offer. */
          session.setMuted?.(true);
          liveTalkLog('bootstrap.offer', {
            conversationId,
            sdpChars: String(sdp || '').length,
            waitForYou: voice.waitForYou,
            allowInterrupt: voice.allowInterrupt,
          });
          const created = await api(liveTalkPath('/live-talk/session'), {
            method: 'POST',
            body: JSON.stringify({ conversationId, sdp, liveVoice: voice, spec }),
            retry: gptLive ? 0 : 2,
          });
          sessionId = created.sessionId;
          liveTalkConversationId = created.conversationId || conversationId;
          liveTalkLog('bootstrap.answer', {
            sessionId,
            conversationId: liveTalkConversationId,
            sdpChars: String(created.sdp || '').length,
            toolCount: Array.isArray(created.tools) ? created.tools.length : 0,
          });
          return gptLive ? { sdp: created.sdp, sessionId: created.providerSessionId } : created.sdp;
        },
      });
      const bridge = gptLive
        ? null
        : SpeakCore.createOpenAIRealtimeFunctionCallBridge({
            holdInput: voice.muteMicWhileSheTalks,
            conversationBehavior: { interruption: voice.allowInterrupt ? 'enabled' : 'disabled' },
            pauseInput: () => {
              bridgeInputHeld = true;
              session.setMuted?.(true);
            },
            resumeInput: () => {
              bridgeInputHeld = false;
              session.setMuted?.(paused);
            },
            invokeTool: async (call) => {
              const startedAt = Date.now();
              liveTalkLog('tool.invoke', { name: call.name, callId: call.callId || '', sessionId });
              if (ui.state === 'connecting') {
                liveTalkLog('tool.ignored-while-starting', { name: call.name });
                return {
                  ok: false,
                  error: 'Live Talk is still connecting. Retry the tool after the greeting.',
                };
              }
              if (greetingPending) finishGreeting('tool-call');
              setStatus(bar, 'tool', `Looking up ${call.name}…`);
              const payload = await api(liveTalkPath(`/live-talk/session/${sessionId}/tool`), {
                method: 'POST',
                body: JSON.stringify({
                  name: call.name,
                  arguments: call.arguments,
                  callId: call.callId,
                }),
              });
              const result = payload.result;
              liveTalkLog('tool.returned', {
                name: call.name,
                ms: Date.now() - startedAt,
              });
              applyHostToolResult(call.name, result);
              return result;
            },
          });
      bridge?.attach(session);
      session.onEvent((event) => {
        if (
          gptLive &&
          (event.type === SpeakCore.SpeakRealtimeEvent.USER_SPEECH_START ||
            event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_RESPONSE_START ||
            event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_RESPONSE_DONE ||
            event.type === SpeakCore.SpeakRealtimeEvent.TOOL_CALL)
        ) {
          const useful =
            event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_RESPONSE_START ||
            event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_RESPONSE_DONE ||
            event.type === SpeakCore.SpeakRealtimeEvent.TOOL_CALL;
          noteGptLiveActivity(useful ? 'useful' : 'speech');
          if (event.type === SpeakCore.SpeakRealtimeEvent.TOOL_CALL) {
            const toolName = clean(
              event.detail?.name ||
                event.detail?.event?.item?.name ||
                event.detail?.event?.name ||
                event.detail?.toolName,
            );
            setStatus(bar, 'tool', toolName ? `Looking up ${toolName}…` : 'Looking up…');
          }
          if (event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_RESPONSE_START) {
            flushLiveTranscript('user');
            markUserHangupIfDone();
          }
          if (event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_RESPONSE_DONE) {
            const spoken = liveTalkAssistantHeard;
            flushLiveTranscript('assistant');
            const farewell = isLiveTalkFarewellPhrase(spoken);
            if (gptLiveHangupInFlight) {
              windowObject.clearTimeout(gptLiveHangupSpeechTimer);
              hangupAfterSpokenTurn(session, gptLiveHangupKind || (farewell ? 'farewell' : 'done'));
            } else if (farewell || gptLiveUserWantsHangup) {
              hangupAfterSpokenTurn(session, farewell ? 'farewell' : 'done');
            }
          }
          if (useful && !gptLiveUserWantsHangup && !gptLiveHangupInFlight) resetGptLiveHeard();
        }
        const providerEvent = event.detail?.providerEvent || event.detail?.event?.type || '';
        const deltaText = String(
          event.detail?.event?.delta ??
            event.detail?.text ??
            event.detail?.event?.transcript ??
            event.detail?.transcript ??
            '',
        );
        const transcript = clean(deltaText);
        const interesting =
          event.type === SpeakCore.SpeakRealtimeEvent.SESSION_FAILED ||
          event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CONNECTED ||
          event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CLOSED ||
          event.type === SpeakCore.SpeakRealtimeEvent.CONNECTION_STATE ||
          event.type === SpeakCore.SpeakRealtimeEvent.TOOL_ERROR;
        const recoverableLiveError =
          gptLive &&
          event.type === SpeakCore.SpeakRealtimeEvent.SESSION_FAILED &&
          (event.detail?.code === 'responses_validation_failed' ||
            (event.detail?.code === 'invalid_request_error' &&
              /retrieving tool list from MCP server/i.test(event.detail?.message || '')));
        if (interesting || event.detail?.message) {
          let logEvent = liveTalkLog;
          if (recoverableLiveError) logEvent = liveTalkWarn;
          else if (event.type === SpeakCore.SpeakRealtimeEvent.SESSION_FAILED)
            logEvent = liveTalkError;
          logEvent('realtime.event', summarizeEvent(event));
        }
        if (
          !gptLive &&
          paused &&
          event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_AUDIO_START
        ) {
          try {
            session.sendEvent({ type: 'output_audio_buffer.clear' });
          } catch (_) {
            /* playback element is already paused */
          }
        }
        if (
          paused &&
          event.type !== SpeakCore.SpeakRealtimeEvent.SESSION_FAILED &&
          event.type !== SpeakCore.SpeakRealtimeEvent.SESSION_CLOSED
        )
          return;
        if (
          event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CONNECT_START ||
          event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CONNECTED
        ) {
          try {
            session.setMuted?.(true);
          } catch (_) {
            /* mic may not exist yet */
          }
        }
        if (event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CONNECTED) {
          setStatus(bar, 'connecting', 'Connecting…');
        }
        if (
          event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_RESPONSE_START ||
          providerEvent === 'response.created'
        ) {
          awaitingAssistant = true;
          clearPendingKick();
          if (greetingPending && greetingSent && !greetingResponseId) {
            greetingResponseId = event.detail?.event?.response?.id || '';
          }
          liveTalkLog('response.created', {
            id: event.detail?.event?.response?.id || '',
            greeting: greetingPending,
          });
        }
        if (event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_AUDIO_START) {
          if (!gptLive) {
            try {
              session.setMuted?.(true);
            } catch (_) {
              /* holdInput still covers echo */
            }
          }
          if (greetingPending) {
            if (
              providerEvent === 'output_audio_buffer.started' &&
              event.detail?.event?.response_id === greetingResponseId
            ) {
              greetingAudioStarted = true;
            }
            setStatus(bar, 'greeting', 'Starting…');
            diagnosePlayback(providerEvent || 'greeting-audio');
          } else {
            assistantAudioPlaying = true;
            const alreadyResponding = bar.dataset.state === 'responding';
            if (!alreadyResponding) {
              setStatus(bar, 'responding', 'Responding…');
              diagnosePlayback(providerEvent || 'assistant-audio');
            }
          }
        }
        if (
          event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_RESPONSE_DONE ||
          providerEvent === 'response.done'
        ) {
          awaitingAssistant = false;
          liveTalkLog('response.done', {
            id: event.detail?.event?.response?.id || '',
            greeting: greetingPending,
          });
          /* response.done ends generation, but WebRTC may still be playing the greeting. */
          if (gptLive && gptLiveHangupInFlight && active?.session === session) {
            windowObject.clearTimeout(gptLiveHangupSpeechTimer);
            gptLiveHangupSpeechTimer = 0;
            void finishGptLiveHangup(session, gptLiveHangupKind);
            return;
          }
          if (!greetingPending && !assistantAudioPlaying) {
            try {
              session.setMuted?.(false);
            } catch (_) {
              /* keep listening even if mute release throws */
            }
            if (isTalkingState(bar.dataset.state) && bar.dataset.state !== 'tool') {
              setStatus(bar, 'listening', 'Listening…');
            }
          }
        }
        if (
          providerEvent === 'output_audio_buffer.stopped' &&
          greetingPending &&
          greetingAudioStarted &&
          event.detail?.event?.response_id === greetingResponseId
        ) {
          finishGreeting('playback-stopped');
        }
        if (
          !greetingPending &&
          (event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_INTERRUPTED ||
            providerEvent === 'output_audio_buffer.stopped' ||
            providerEvent === 'output_audio_buffer.cleared')
        ) {
          assistantAudioPlaying = false;
          try {
            session.setMuted?.(false);
          } catch (_) {
            /* keep listening even if mute release throws */
          }
          if (isTalkingState(bar.dataset.state) && bar.dataset.state !== 'tool') {
            setStatus(bar, 'listening', 'Listening…');
          }
        }
        if (providerEvent === 'error' && greetingPending) {
          liveTalkWarn('greeting.provider-error', summarizeEvent(event));
        }
        if (event.type === SpeakCore.SpeakRealtimeEvent.USER_SPEECH_START) {
          if (greetingPending) finishGreeting('user-speech');
          awaitingAssistant = false;
          setStatus(bar, 'listening', 'Listening…');
        }
        if (event.type === SpeakCore.SpeakRealtimeEvent.USER_SPEECH_END) {
          if (greetingPending) finishGreeting('user-speech-end');
          liveTalkLog('turn.speech-end', { awaitingAssistant, state: ui.state });
          if (!gptLive && !awaitingAssistant && ui.state !== 'responding' && ui.state !== 'tool') {
            armSpeechEndKick(session);
          }
        }
        if (event.type === SpeakCore.SpeakRealtimeEvent.SESSION_FAILED) {
          const failed = summarizeError(
            { message: event.detail?.message, name: event.detail?.name, code: event.detail?.code },
            summarizeEvent(event),
          );
          if (recoverableLiveError) {
            liveTalkWarn('session.failed', failed);
            setStatus(bar, 'listening', 'Lesson tools unavailable; voice is still connected.');
            return;
          }
          liveTalkError('session.failed', failed);
          setStatus(
            bar,
            'error',
            event.detail?.message || event.detail?.name || 'Could not connect Live Talk.',
          );
          if (gptLive && active?.session === session) void stopCall(bar, 'failed');
        }
        if (
          gptLive &&
          event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CLOSED &&
          active?.session === session
        )
          void stopCall(bar, 'closed');
        if (
          gptLive &&
          event.type === SpeakCore.SpeakRealtimeEvent.PROVIDER_EVENT &&
          providerEvent === 'session.output_transcript.delta' &&
          deltaText
        ) {
          liveTalkAssistantHeard = appendLiveTalkDelta(liveTalkAssistantHeard, deltaText);
          scheduleLivePreview('assistant');
        }
        if (event.type === SpeakCore.SpeakRealtimeEvent.INPUT_TRANSCRIPT && deltaText) {
          liveTalkLog('transcript.heard', { chars: deltaText.length });
          if (!gptLive) {
            void saveLiveTranscript('user', transcript || deltaText);
            upsertLivePreview('user', transcript || deltaText);
          } else if (!gptLiveHangupInFlight) {
            liveTalkUserHeard = appendLiveTalkDelta(liveTalkUserHeard, deltaText);
            gptLiveHeard = appendLiveTalkDelta(gptLiveHeard, deltaText);
            if (gptLiveHeard.length > 240) gptLiveHeard = gptLiveHeard.slice(-240);
            scheduleLivePreview('user');
            noteGptLiveActivity('transcript');
            markUserHangupIfDone();
            windowObject.clearTimeout(gptLiveHeardTimer);
            gptLiveHeardTimer = windowObject.setTimeout(() => {
              if (active?.session !== session || gptLiveHangupInFlight) return;
              if (!markUserHangupIfDone()) return;
              if (assistantAudioPlaying || awaitingAssistant) return;
              beginGptLiveHangup(session, 'done');
            }, 900);
          }
        }
      });
      active = {
        session,
        bridge,
        gptLive,
        get inputHeld() {
          return bridgeInputHeld;
        },
        get sessionId() {
          return sessionId;
        },
      };
      greetingPending = !gptLive;
      try {
        await session.start();
        if (stopRequested || active?.session !== session) {
          if (active?.session === session) await stopCall(bar, 'stop');
          return;
        }
        session.setMuted?.(!gptLive);
        if (gptLive) {
          armGptLiveHangupWatch(session);
          startGptLiveClientActionPoll(session, sessionId);
        }
        liveTalkLog('session.started', session.snapshot?.() || { sessionId });
        if (pingTimer) windowObject.clearInterval(pingTimer);
        pingTimer = windowObject.setInterval(() => {
          const id = active?.sessionId;
          if (!id) return;
          void api(liveTalkPath(`/live-talk/session/${id}/ping`), {
            method: 'POST',
            body: '{}',
            quiet: true,
          }).catch((error) => {
            if (error?.status !== 404 || active?.session !== session) return;
            void stopCall(bar, 'expired').then(() => {
              setStatus(bar, 'error', 'Session ended. Start Live Talk again.');
            });
          });
        }, 20000);
        watchPeer(session);
        if (active?.session === session && !paused) {
          await waitForRemotePlayback(session);
          if (!paused && !gptLive) await speakGreeting(session);
          if (!paused && gptLive) setStatus(bar, 'listening', 'Listening…');
        }
      } catch (error) {
        if (stopRequested) {
          if (active?.session === session) await stopCall(bar, 'stop');
          return;
        }
        liveTalkError(
          'session.start-threw',
          summarizeError(error, {
            conversationId,
            sessionId,
            snapshot: session.snapshot?.() || null,
          }),
        );
        setStatus(
          bar,
          'error',
          [error.name, error.message].filter(Boolean).join(': ') ||
            'Microphone or voice session failed.',
        );
        await stopCall(bar, 'failed');
      }
    } finally {
      startInFlight = false;
    }
  }

  function syncBar() {
    const bar = ensureBar();
    if (!config.enabled) {
      if (active) void stopCall(bar, 'disabled');
      setStatus(bar, 'idle', '');
      return;
    }
    if (!active) {
      setStatus(bar, 'idle', 'Chat or Talk Live');
      return;
    }
    setStatus(bar, ui.state || 'listening', ui.text || 'Listening…');
  }

  async function applyShellAction(action, settings, greeting) {
    const bar = ensureBar();
    if (settings) {
      liveVoiceSettings = normalizeLiveVoiceSettings(settings);
    }
    if (action === 'pause' || (action === 'toggle' && active && !paused)) {
      if (active?.gptLive) {
        await stopCall(bar, 'pause');
        setStatus(bar, 'paused', 'Paused');
        return;
      }
      pauseCall(bar);
      return;
    }
    if (action === 'resume' || (action === 'toggle' && paused)) {
      if (!active && liveVoiceSettings.provider === 'gpt-live') {
        await startCall(bar);
        return;
      }
      resumeCall(bar);
      return;
    }
    const line = clean(greeting);
    if (line) greetingLine = line;
    if (action === 'stop') {
      stopRequested = true;
      pendingShellAction = '';
      pendingLiveVoice = null;
      pendingGreeting = '';
      if (active) await stopCall(bar, 'stop');
      return;
    }
    if (!config.enabled) {
      pendingShellAction = action;
      pendingLiveVoice = settings || pendingLiveVoice;
      pendingGreeting = line || pendingGreeting;
      return;
    }
    pendingShellAction = '';
    pendingLiveVoice = null;
    pendingGreeting = '';
    if (!isTalkingState(ui.state) && !startInFlight) {
      await startCall(bar);
    }
  }

  function onShellMessage(event) {
    if (event.source !== windowObject.parent) return;
    if (!isAllowedParentOrigin(event.origin)) return;
    const data = event.data;
    if (!data || data.source !== SHELL_MESSAGE_SOURCE) return;
    if (data.type === 'surface') {
      rememberLiveTalkSpec(data.spec);
      return;
    }
    if (data.type !== 'live-talk') return;
    const action = clean(data.action);
    if (!['start', 'pause', 'resume', 'stop', 'toggle'].includes(action)) return;
    rememberLiveTalkSpec(data.spec);
    liveTalkLog('shell.command', {
      action,
      spec: liveTalkSpec || resolveLiveTalkSpec(),
      waitForYou: data.liveVoice?.waitForYou || '',
      greeting: Boolean(clean(data.greeting)),
    });
    void applyShellAction(action, data.liveVoice, data.greeting);
  }

  function watchThreadChanges() {
    windowObject.addEventListener('message', onShellMessage);
    windowObject.addEventListener('beforeunload', () => {
      if (active) void stopCall(ensureBar(), 'unload');
    });
    windowObject.addEventListener('pagehide', () => {
      if (active) void stopCall(ensureBar(), 'leave');
    });
  }

  async function start() {
    liveTalkLog('overlay.boot', {
      href: String(windowObject.location?.href || ''),
      pathname: String(windowObject.location?.pathname || ''),
      framed: windowObject.parent !== windowObject,
      ssoPath: isSsoPath(),
      basePath: chatBasePath(),
      speakCore: Boolean(SpeakCore),
      speakCoreKeys: SpeakCore ? Object.keys(SpeakCore) : [],
    });
    if (isSsoPath()) {
      liveTalkWarn('overlay.skip-sso', {});
      return;
    }
    watchThreadChanges();
    patchAuthCapture();
    try {
      const bootSpec = resolveLiveTalkSpec();
      config = await api(
        bootSpec
          ? `${liveTalkPath('/live-talk/config')}?spec=${encodeURIComponent(bootSpec)}`
          : liveTalkPath('/live-talk/config'),
      );
      liveTalkLog('overlay.config', {
        enabled: Boolean(config.enabled),
        agentId: config.agentId || '',
        mcpServer: config.mcpServer || '',
        spec: config.spec || bootSpec || '',
        speakCoreRevision: config.speakCoreRevision || '',
      });
    } catch (error) {
      liveTalkError(
        'overlay.config-failed',
        summarizeError(error, { path: liveTalkPath('/live-talk/config') }),
      );
      config = { enabled: false };
    }
    overlayReady = true;
    syncBar();
    liveTalkLog('overlay.chrome', { host: 'shell-fab' });
    if (pendingShellAction) {
      void applyShellAction(pendingShellAction, pendingLiveVoice, pendingGreeting);
    }
  }

  void start().catch((error) => {
    liveTalkError('overlay.start-threw', summarizeError(error));
  });
})(window);
