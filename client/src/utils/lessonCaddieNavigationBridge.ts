const NAVIGATION_TYPE = 'lessoncaddie.navigation';
const NAVIGATION_VERSION = 1;
const ASSISTANT_MESSAGE_SOURCE = 'lessoncaddie-assistant';
const SHELL_MESSAGE_SOURCE = 'lessoncaddie-shell';
const TOOL_NAME = 'open_app_screen';
const DEFAULT_ALLOWED_ORIGINS = [
  'https://lessoncaddie.ssmlabs.com',
  'http://127.0.0.1:3021',
  'http://localhost:3021',
];

export type NavigationResult = {
  type: typeof NAVIGATION_TYPE;
  version: number;
  destination: string;
  params: Record<string, string>;
  requestId: string;
  deepLink?: string;
};

export type ToolResultNotice = {
  functionName?: string;
  output?: string | null;
  isLast?: boolean;
  sawSubmitting?: boolean;
  hasError?: boolean;
  toolCallId?: string;
};

type BridgeState = {
  parentOrigin: string;
  processedIds: Set<string>;
};

const state: BridgeState = {
  parentOrigin: '',
  processedIds: new Set(),
};

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isSafeId(value: unknown): boolean {
  const text = clean(value);
  return (
    text.length > 0 &&
    text.length <= 200 &&
    ![...text].some((char) => char.charCodeAt(0) < 32 || './#$[]\\'.includes(char))
  );
}

function readConfig() {
  const raw = (
    window as Window & { __LESSONCADDIE_NAV__?: { allowedOrigins?: string[]; homeUrl?: string } }
  ).__LESSONCADDIE_NAV__;
  const allowed = Array.isArray(raw?.allowedOrigins)
    ? raw.allowedOrigins.map(clean).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;
  return {
    allowedOrigins: allowed.length ? allowed : DEFAULT_ALLOWED_ORIGINS,
    homeUrl: clean(raw?.homeUrl),
  };
}

function originOf(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

function isAllowedOrigin(origin: string): boolean {
  return readConfig().allowedOrigins.includes(origin);
}

function parseJson(value: unknown): unknown {
  if (typeof value === 'object' && value) {
    return value;
  }
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function parseNavigationResult(raw: unknown): NavigationResult | null {
  const parsed = parseJson(raw) as Record<string, unknown> | null;
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }
  const fromContent = Array.isArray(parsed.content)
    ? parseJson((parsed.content[0] as { text?: unknown } | undefined)?.text)
    : null;
  const candidate = (parsed.type === NAVIGATION_TYPE ? parsed : fromContent) as Record<
    string,
    unknown
  > | null;
  if (
    !candidate ||
    candidate.type !== NAVIGATION_TYPE ||
    Number(candidate.version) !== NAVIGATION_VERSION
  ) {
    return null;
  }
  const destination = clean(candidate.destination);
  const requestId = clean(candidate.requestId);
  if (!destination || !isSafeId(requestId)) {
    return null;
  }
  const paramsIn =
    candidate.params && typeof candidate.params === 'object' && !Array.isArray(candidate.params)
      ? (candidate.params as Record<string, unknown>)
      : {};
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(paramsIn)) {
    const text = clean(value);
    if (!text) {
      continue;
    }
    if (!isSafeId(key) || !isSafeId(text)) {
      return null;
    }
    params[key] = text;
  }
  const deepLink = clean(candidate.deepLink);
  if (deepLink) {
    const origin = originOf(deepLink);
    if (!origin || !isAllowedOrigin(origin)) {
      return null;
    }
  }
  return {
    type: NAVIGATION_TYPE,
    version: NAVIGATION_VERSION,
    destination,
    params,
    requestId,
    ...(deepLink ? { deepLink } : {}),
  };
}

function logNav(event: string, fields: Record<string, unknown> = {}) {
  try {
    console.info(
      JSON.stringify({
        area: 'appNavigation',
        event,
        requestId: fields.requestId,
        destination: fields.destination,
        code: fields.code,
        durationMs: fields.durationMs,
      }),
    );
  } catch {
    // Logging must not break navigation.
  }
}

function remember(requestId: string): boolean {
  if (state.processedIds.has(requestId)) {
    return false;
  }
  state.processedIds.add(requestId);
  while (state.processedIds.size > 80) {
    const oldest = state.processedIds.values().next().value;
    if (oldest) {
      state.processedIds.delete(oldest);
    } else {
      break;
    }
  }
  return true;
}

function isFramed(): boolean {
  try {
    return window.parent !== window;
  } catch {
    return true;
  }
}

function buildNavigateMessage(result: NavigationResult) {
  return {
    source: ASSISTANT_MESSAGE_SOURCE,
    type: 'navigate',
    version: NAVIGATION_VERSION,
    requestId: result.requestId,
    destination: result.destination,
    params: result.params,
    surface: 'app',
  };
}

function fallbackStandalone(result: NavigationResult) {
  const url = result.deepLink;
  if (!url || isFramed()) {
    return;
  }
  logNav('standalone_fallback', { requestId: result.requestId, destination: result.destination });
  window.location.assign(url);
}

export function handleShellMessage(event: MessageEvent) {
  if (!event?.data || event.data.source !== SHELL_MESSAGE_SOURCE) {
    return;
  }
  if (!isAllowedOrigin(event.origin) || !isFramed()) {
    return;
  }
  state.parentOrigin = event.origin;
  if (event.data.type === 'navigate-ack') {
    logNav('ack_received', {
      requestId: event.data.requestId,
      code: event.data.code,
      durationMs: event.data.latencyMs,
    });
  }
}

export function onToolResult(notice: ToolResultNotice = {}) {
  const name = clean(notice.functionName);
  if (
    !name.includes(TOOL_NAME) ||
    notice.hasError ||
    notice.sawSubmitting !== true ||
    notice.isLast !== true
  ) {
    return false;
  }
  const result = parseNavigationResult(notice.output);
  if (!result) {
    return false;
  }
  if (!remember(result.requestId)) {
    logNav('duplicate_suppressed', {
      requestId: result.requestId,
      destination: result.destination,
    });
    return false;
  }
  const started = window.performance?.now?.() ?? Date.now();
  if (isFramed() && state.parentOrigin) {
    try {
      window.parent.postMessage(buildNavigateMessage(result), state.parentOrigin);
      logNav('bridge_sent', {
        requestId: result.requestId,
        destination: result.destination,
        durationMs: Math.max(0, (window.performance?.now?.() ?? Date.now()) - started),
      });
      return true;
    } catch (error) {
      logNav('bridge_failed', { requestId: result.requestId, code: 'postmessage_failed' });
      console.warn('LessonCaddie navigation bridge failed', error);
      return false;
    }
  }
  fallbackStandalone(result);
  return true;
}

export function installLessonCaddieNavigationBridge() {
  if (
    typeof window === 'undefined' ||
    (window as Window & { __lcNavBridgeInstalled?: boolean }).__lcNavBridgeInstalled
  ) {
    return;
  }
  (window as Window & { __lcNavBridgeInstalled?: boolean }).__lcNavBridgeInstalled = true;
  window.addEventListener('message', handleShellMessage);
  (
    window as Window & {
      LessonCaddieNavigationBridge?: { onToolResult: typeof onToolResult };
    }
  ).LessonCaddieNavigationBridge = { onToolResult };
}

export function resetLessonCaddieNavigationBridgeForTests() {
  state.parentOrigin = '';
  state.processedIds.clear();
}

export const lessonCaddieNavigationConstants = {
  NAVIGATION_TYPE,
  NAVIGATION_VERSION,
  ASSISTANT_MESSAGE_SOURCE,
  SHELL_MESSAGE_SOURCE,
  TOOL_NAME,
};
