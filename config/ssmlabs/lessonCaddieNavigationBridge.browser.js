(function lessonCaddieNavigationBridgeOverlay(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
    return;
  }
  api.install(root);
})(typeof window !== 'undefined' ? window : globalThis, function factory() {
  'use strict';

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

  function clean(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function isSafeId(value) {
    const text = clean(value);
    return (
      text.length > 0 &&
      text.length <= 200 &&
      ![...text].some((char) => char.charCodeAt(0) < 32 || './#$[]\\'.includes(char))
    );
  }

  function originOf(value) {
    try {
      return new URL(value).origin;
    } catch {
      return '';
    }
  }

  function readConfig(windowObject) {
    const raw = windowObject.__LESSONCADDIE_NAV__;
    const allowed = Array.isArray(raw?.allowedOrigins)
      ? raw.allowedOrigins.map(clean).filter(Boolean)
      : [];
    const merged = [...new Set([...allowed, ...DEFAULT_ALLOWED_ORIGINS])];
    return { allowedOrigins: merged };
  }

  function isAllowedOrigin(windowObject, origin) {
    return readConfig(windowObject).allowedOrigins.includes(origin);
  }

  function parseJson(value) {
    if (value && typeof value === 'object') {
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

  function parseNavigationResult(raw, windowObject) {
    const parsed = parseJson(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const fromContent = Array.isArray(parsed.content)
      ? parseJson(parsed.content[0] && parsed.content[0].text)
      : null;
    const candidate = parsed.type === NAVIGATION_TYPE ? parsed : fromContent;
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
        ? candidate.params
        : {};
    const params = {};
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
      if (!origin || (windowObject && !isAllowedOrigin(windowObject, origin))) {
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

  function walkForNavigation(node, windowObject, depth, found) {
    if (!node || depth > 8 || found.length) {
      return;
    }
    if (typeof node === 'string') {
      const parsed = parseNavigationResult(node, windowObject);
      if (parsed) {
        found.push(parsed);
      }
      return;
    }
    if (typeof node !== 'object') {
      return;
    }
    const direct = parseNavigationResult(node, windowObject);
    if (direct) {
      found.push(direct);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item) => walkForNavigation(item, windowObject, depth + 1, found));
      return;
    }
    Object.values(node).forEach((value) =>
      walkForNavigation(value, windowObject, depth + 1, found),
    );
  }

  function extractNavigationFromPayload(payload, windowObject) {
    const found = [];
    walkForNavigation(payload, windowObject, 0, found);
    return found[0] || null;
  }

  function logNav(event, fields) {
    try {
      console.info(
        JSON.stringify({
          area: 'appNavigation',
          event,
          requestId: fields.requestId,
          destination: fields.destination,
          code: fields.code,
        }),
      );
    } catch {
      // ignore
    }
  }

  function isFramed(windowObject) {
    try {
      return windowObject.parent !== windowObject;
    } catch {
      return true;
    }
  }

  function createState() {
    return {
      parentOrigin: '',
      processedIds: new Set(),
    };
  }

  function remember(state, requestId) {
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

  function resolveParentOrigin(windowObject, state) {
    if (state.parentOrigin) {
      return state.parentOrigin;
    }
    const ancestors = windowObject.location && windowObject.location.ancestorOrigins;
    if (ancestors && ancestors.length > 0 && isAllowedOrigin(windowObject, ancestors[0])) {
      state.parentOrigin = ancestors[0];
      return state.parentOrigin;
    }
    const referrer = originOf((windowObject.document && windowObject.document.referrer) || '');
    if (referrer && isAllowedOrigin(windowObject, referrer)) {
      state.parentOrigin = referrer;
      return referrer;
    }
    return '';
  }

  function buildNavigateMessage(result) {
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

  function postNavigate(windowObject, state, result) {
    if (!isFramed(windowObject)) {
      return false;
    }
    if (!remember(state, result.requestId)) {
      logNav('duplicate_suppressed', {
        requestId: result.requestId,
        destination: result.destination,
      });
      return false;
    }
    const message = buildNavigateMessage(result);
    const origin = resolveParentOrigin(windowObject, state);
    try {
      if (origin) {
        windowObject.parent.postMessage(message, origin);
      } else {
        readConfig(windowObject).allowedOrigins.forEach((allowed) => {
          windowObject.parent.postMessage(message, allowed);
        });
      }
      logNav('bridge_sent', { requestId: result.requestId, destination: result.destination });
      return true;
    } catch (error) {
      logNav('bridge_failed', { requestId: result.requestId, code: 'postmessage_failed' });
      console.warn('LessonCaddie navigation overlay failed', error);
      return false;
    }
  }

  function handleShellMessage(windowObject, state, event) {
    if (!event?.data || event.data.source !== SHELL_MESSAGE_SOURCE) {
      return;
    }
    if (!isAllowedOrigin(windowObject, event.origin) || !isFramed(windowObject)) {
      return;
    }
    state.parentOrigin = event.origin;
  }

  function consumePayload(windowObject, state, payload) {
    const result = extractNavigationFromPayload(payload, windowObject);
    if (!result) {
      return false;
    }
    return postNavigate(windowObject, state, result);
  }

  function parseSseChunk(buffer, onEvent) {
    const parts = buffer.split('\n');
    const rest = parts.pop();
    parts.forEach((line) => {
      const trimmed = String(line || '')
        .replace(/^data:\s?/, '')
        .trim();
      if (!trimmed || trimmed === '[DONE]') {
        return;
      }
      try {
        onEvent(JSON.parse(trimmed));
      } catch {
        // ignore non-JSON SSE lines
      }
    });
    return rest || '';
  }

  function scanSseStream(windowObject, state, stream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    function pump() {
      return reader
        .read()
        .then((chunk) => {
          if (chunk.done) {
            if (buffer) {
              parseSseChunk(`${buffer}\n`, (payload) =>
                consumePayload(windowObject, state, payload),
              );
            }
            return;
          }
          buffer += decoder.decode(chunk.value, { stream: true });
          buffer = parseSseChunk(buffer, (payload) => consumePayload(windowObject, state, payload));
          return pump();
        })
        .catch(() => undefined);
    }
    return pump();
  }

  function shouldScan(url, method, response) {
    const contentType = String(
      (response && response.headers && response.headers.get('content-type')) || '',
    ).toLowerCase();
    if (contentType.includes('text/event-stream')) {
      return true;
    }
    return String(method || 'GET').toUpperCase() === 'POST' && /\/api\//.test(String(url || ''));
  }

  function install(windowObject) {
    if (!windowObject || windowObject.__lcNavOverlayInstalled) {
      return;
    }
    windowObject.__lcNavOverlayInstalled = true;
    const state = createState();
    windowObject.addEventListener('message', (event) =>
      handleShellMessage(windowObject, state, event),
    );

    const originalFetch = windowObject.fetch;
    if (typeof originalFetch === 'function') {
      windowObject.fetch = function lessonCaddieNavFetch(input, init) {
        let url = '';
        if (typeof input === 'string') {
          url = input;
        } else if (input && input.url) {
          url = input.url;
        }
        const method = (init && init.method) || (input && input.method) || 'GET';
        return originalFetch.apply(this, arguments).then((response) => {
          try {
            if (
              shouldScan(url, method, response) &&
              response &&
              response.body &&
              typeof response.body.tee === 'function'
            ) {
              const branches = response.body.tee();
              scanSseStream(windowObject, state, branches[0]);
              return new Response(branches[1], {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
              });
            }
          } catch {
            return response;
          }
          return response;
        });
      };
    }

    windowObject.LessonCaddieNavigationOverlay = {
      onPayload(payload) {
        return consumePayload(windowObject, state, payload);
      },
    };
  }

  return {
    TOOL_NAME,
    parseNavigationResult,
    extractNavigationFromPayload,
    parseSseChunk,
    install,
  };
});
