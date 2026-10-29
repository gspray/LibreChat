/**
 * SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Forwards open_app_screen results to the LessonCaddie parent. Do not restore the
 * client/src lessonCaddieNavigationBridge React fork.
 */
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

  function isSafePrefill(value) {
    const text = clean(value);
    return (
      text.length > 0 &&
      text.length <= 500 &&
      ![...text].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
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
      const start = value.indexOf('{"type":"lessoncaddie.navigation"');
      if (start < 0) {
        return null;
      }
      try {
        return JSON.parse(value.slice(start));
      } catch {
        return null;
      }
    }
  }

  function resultFromHref(windowObject, href) {
    const linkOrigin = originOf(href);
    if (windowObject) {
      if (!isAllowedOrigin(windowObject, linkOrigin)) {
        return null;
      }
    } else if (
      !/^https:\/\//.test(href) &&
      href.indexOf('127.0.0.1') === -1 &&
      href.indexOf('localhost') === -1
    ) {
      return null;
    }
    let url;
    try {
      url = new URL(href);
    } catch {
      return null;
    }
    if (url.username || url.password || url.hash) {
      return null;
    }
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const params = {};
    let destination = '';
    if (path === '/app' && url.searchParams.get('view') === 'start-lesson') {
      destination = 'start-lesson';
    } else if (path === '/app' && url.searchParams.get('panel') === 'directory') {
      destination = 'student-list';
    } else if (path === '/app' && url.searchParams.get('view') === 'new-student') {
      destination = 'new-student';
    } else if (path === '/app' && url.searchParams.get('panel') === 'sessions') {
      destination = 'lesson-list';
    } else if (path === '/app' && url.searchParams.get('panel') === 'playbook') {
      destination = 'practice-plan';
    } else if (path === '/app/edit-lesson' && url.searchParams.get('lessonId')) {
      destination = url.searchParams.get('handoff') === 'edit' ? 'video-editor' : 'lesson-detail';
      params.lessonId = url.searchParams.get('lessonId');
      const mediaId = url.searchParams.get('mediaId');
      if (mediaId) {
        params.mediaId = mediaId;
      }
    }
    if (!destination) {
      return null;
    }
    return {
      type: NAVIGATION_TYPE,
      version: NAVIGATION_VERSION,
      destination,
      params,
      requestId: `click-${destination}`,
      deepLink: href,
    };
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
      const prefill =
        candidate.destination === 'new-student' &&
        ['firstName', 'lastName', 'email', 'phone', 'nickname', 'notes'].includes(key);
      if (!isSafeId(key) || !(prefill ? isSafePrefill(text) : isSafeId(text))) {
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
        return;
      }
      const urlMatch = node.match(/https?:\/\/[^\s)]+/);
      const fromLink = urlMatch ? resultFromHref(windowObject, urlMatch[0]) : null;
      if (fromLink) {
        found.push(fromLink);
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
      appNavigationBridge: false,
      processedIds: new Set(),
      lastResult: null,
      fallbackTimers: {},
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

  function hideResolvedDeepLinks(windowObject, result) {
    const doc = windowObject.document;
    if (!doc || typeof doc.querySelectorAll !== 'function') {
      return;
    }
    const href = clean(result && result.deepLink);
    doc.querySelectorAll('a[href]').forEach((anchor) => {
      const link = clean(anchor.href);
      const fromHref = resultFromHref(windowObject, link);
      if ((href && link === href) || fromHref) {
        anchor.setAttribute('data-lc-nav-bridged', 'true');
        anchor.hidden = true;
      }
    });
  }

  function scheduleFallback(windowObject, state, result) {
    const requestId = result.requestId;
    if (state.fallbackTimers[requestId]) {
      windowObject.clearTimeout(state.fallbackTimers[requestId]);
    }
    state.fallbackTimers[requestId] = windowObject.setTimeout(() => {
      delete state.fallbackTimers[requestId];
      if (!state.processedIds.has(`${requestId}:acked`)) {
        logNav('fallback_link', {
          requestId,
          destination: result.destination,
          code: 'bridge_timeout',
        });
      }
    }, 1500);
  }

  function ensureEmbeddedBridge(windowObject, state) {
    if (state.appNavigationBridge === true) {
      return;
    }
    if (!isFramed(windowObject)) {
      return;
    }
    if (resolveParentOrigin(windowObject, state)) {
      state.appNavigationBridge = true;
    }
  }

  function postNavigate(windowObject, state, result) {
    ensureEmbeddedBridge(windowObject, state);
    if (!isFramed(windowObject) || state.appNavigationBridge !== true) {
      logNav('external_client', {
        requestId: result.requestId,
        destination: result.destination,
        code: state.appNavigationBridge === true ? 'not_framed' : 'unknown_client',
      });
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
    if (!origin) {
      logNav('fallback_link', {
        requestId: result.requestId,
        destination: result.destination,
        code: 'missing_parent_origin',
      });
      return false;
    }
    try {
      windowObject.parent.postMessage(message, origin);
      logNav('bridge_sent', { requestId: result.requestId, destination: result.destination });
      scheduleFallback(windowObject, state, result);
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
    if (event.data.capabilities && event.data.capabilities.appNavigationBridge === true) {
      state.appNavigationBridge = true;
    }
    if (event.data.type === 'navigate-ack') {
      const requestId = clean(event.data.requestId);
      if (requestId) {
        state.processedIds.add(`${requestId}:acked`);
        if (state.fallbackTimers[requestId]) {
          windowObject.clearTimeout(state.fallbackTimers[requestId]);
          delete state.fallbackTimers[requestId];
        }
      }
      if (event.data.ok === true && state.lastResult) {
        hideResolvedDeepLinks(windowObject, state.lastResult);
        windowObject.setTimeout(() => hideResolvedDeepLinks(windowObject, state.lastResult), 800);
      }
      logNav('ack_received', {
        requestId,
        destination: state.lastResult && state.lastResult.destination,
        code: event.data.code,
      });
    }
  }

  function consumePayload(windowObject, state, payload) {
    const result = extractNavigationFromPayload(payload, windowObject);
    if (!result) {
      return false;
    }
    state.lastResult = result;
    if (!isFramed(windowObject)) {
      logNav('external_client', { requestId: result.requestId, destination: result.destination });
      return false;
    }
    ensureEmbeddedBridge(windowObject, state);
    if (state.appNavigationBridge === true) {
      return postNavigate(windowObject, state, result);
    }
    windowObject.setTimeout(() => {
      if (state.lastResult && state.lastResult.requestId === result.requestId) {
        if (state.appNavigationBridge === true) {
          postNavigate(windowObject, state, result);
          return;
        }
        logNav('fallback_link', {
          requestId: result.requestId,
          destination: result.destination,
          code: 'unknown_client',
        });
      }
    }, 400);
    return false;
  }

  function handleDeepLinkClick(windowObject, state, event) {
    if (state.appNavigationBridge !== true || !isFramed(windowObject)) {
      return false;
    }
    const target = event && event.target;
    const anchor = target && target.closest ? target.closest('a[href]') : null;
    const href = anchor && anchor.href;
    if (!href || !isAllowedOrigin(windowObject, originOf(href))) {
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    const result =
      state.lastResult && state.lastResult.deepLink === href
        ? state.lastResult
        : resultFromHref(windowObject, href);
    if (result) {
      state.processedIds.delete(result.requestId);
      postNavigate(windowObject, state, result);
    }
    return true;
  }

  function announceBridgeReady(windowObject) {
    if (!isFramed(windowObject)) {
      return;
    }
    try {
      windowObject.parent.postMessage(
        { source: ASSISTANT_MESSAGE_SOURCE, type: 'bridge-ready', version: NAVIGATION_VERSION },
        '*',
      );
    } catch {
      // Parent origin is confirmed only by the handshake that follows.
    }
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

  function installXhrScan(windowObject, state) {
    const Original = windowObject.XMLHttpRequest;
    const proto = Original && Original.prototype;
    if (!proto || typeof proto.open !== 'function' || proto.open.__lcNavWrapped) {
      return;
    }
    const originalOpen = proto.open;
    proto.open = function lessonCaddieNavXhrOpen() {
      if (!this.__lcNavBound) {
        this.__lcNavBound = true;
        let scanned = 0;
        let carry = '';
        const scan = () => {
          try {
            const text = String(this.responseText || '');
            if (text.length <= scanned) {
              return;
            }
            carry += text.slice(scanned);
            scanned = text.length;
            carry = parseSseChunk(carry, (payload) => consumePayload(windowObject, state, payload));
          } catch {
            // Overlay must not break Chat streaming.
          }
        };
        this.addEventListener('progress', scan);
        this.addEventListener('readystatechange', () => {
          if (this.readyState === Original.LOADING || this.readyState === Original.DONE) {
            scan();
          }
        });
        this.addEventListener('load', scan);
      }
      return originalOpen.apply(this, arguments);
    };
    proto.open.__lcNavWrapped = true;
  }

  function install(windowObject) {
    if (!windowObject || windowObject.__lcNavOverlayInstalled) {
      return;
    }
    windowObject.__lcNavOverlayInstalled = true;
    const state = createState();
    installXhrScan(windowObject, state);
    windowObject.addEventListener('message', (event) =>
      handleShellMessage(windowObject, state, event),
    );
    windowObject.addEventListener(
      'click',
      (event) => handleDeepLinkClick(windowObject, state, event),
      true,
    );
    announceBridgeReady(windowObject);

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
    resultFromHref,
    parseSseChunk,
    handleDeepLinkClick,
    announceBridgeReady,
    install,
  };
});
