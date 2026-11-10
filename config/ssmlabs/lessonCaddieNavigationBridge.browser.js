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
  const RECOVERY_TYPE = 'lessoncaddie.recovery';
  const RECOVERY_VERSION = 1;
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
    } else if (path === '/app/contact-edit' && url.searchParams.get('contactId')) {
      destination = 'student-detail';
      params.contactId = url.searchParams.get('contactId');
    } else if (path === '/app' && url.searchParams.get('view') === 'new-student') {
      destination = 'new-student';
    } else if (path === '/app' && url.searchParams.get('panel') === 'sessions') {
      destination = 'lesson-list';
    } else if (path === '/app' && url.searchParams.get('panel') === 'calendar') {
      destination = 'calendar';
    } else if (path === '/app' && url.searchParams.get('panel') === 'library') {
      destination = 'library';
    } else if (path === '/app' && url.searchParams.get('panel') === 'today') {
      destination = 'today';
    } else if (path === '/app' && url.searchParams.get('panel') === 'practices') {
      destination = 'practices';
    } else if (path === '/app' && url.searchParams.get('panel') === 'play') {
      destination = 'play';
    } else if (path === '/app' && url.searchParams.get('panel') === 'goals') {
      destination = 'goals';
    } else if (path === '/app' && url.searchParams.get('panel') === 'playbook') {
      destination = 'practice-plan';
    } else if (path === '/app/notices' || path === '/notices') {
      destination = 'notices';
    } else if (path === '/app/profile/billing' || path === '/profile/billing') {
      destination = 'billing';
    } else if (path === '/app/settings/payment-setup' || path === '/settings/payment-setup') {
      destination = 'payment-setup';
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

  function parseRecoveryResult(raw) {
    const parsed = parseJson(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    let candidate = null;
    if (parsed.type === RECOVERY_TYPE) candidate = parsed;
    else if (parsed.recovery?.type === RECOVERY_TYPE) candidate = parsed.recovery;
    else if (parsed.structuredContent?.recovery?.type === RECOVERY_TYPE) {
      candidate = parsed.structuredContent.recovery;
    }
    if (
      !candidate ||
      Number(candidate.version) !== RECOVERY_VERSION ||
      !['permission', 'validation', 'service'].includes(clean(candidate.category))
    ) {
      return null;
    }
    const keptDetails = {};
    const rawDetails =
      candidate.keptDetails &&
      typeof candidate.keptDetails === 'object' &&
      !Array.isArray(candidate.keptDetails)
        ? candidate.keptDetails
        : {};
    for (const [key, value] of Object.entries(rawDetails)) {
      if (!isSafeId(key)) continue;
      if (Array.isArray(value)) {
        const items = value
          .map(clean)
          .filter((item) => item && item.length <= 500)
          .slice(0, 48);
        if (items.length) keptDetails[key] = items;
      } else {
        const text = clean(value);
        if (text && text.length <= 4000) keptDetails[key] = text;
      }
    }
    let fallback = null;
    if (candidate.fallback && typeof candidate.fallback === 'object') {
      const destination = clean(candidate.fallback.destination);
      const source =
        candidate.fallback.params &&
        typeof candidate.fallback.params === 'object' &&
        !Array.isArray(candidate.fallback.params)
          ? candidate.fallback.params
          : {};
      const params = {};
      let safe = isSafeId(destination);
      for (const [key, value] of Object.entries(source)) {
        const text = clean(value);
        if (!isSafeId(key) || !text || text.length > 4000) {
          safe = false;
          break;
        }
        params[key] = text;
      }
      if (safe) fallback = { destination, params };
    }
    return {
      type: RECOVERY_TYPE,
      version: RECOVERY_VERSION,
      toolName: clean(candidate.toolName),
      category: clean(candidate.category),
      message: clean(candidate.message) || 'LessonCaddie could not save this change.',
      keptDetails,
      retry: {
        enabled: candidate.retry?.enabled === true,
        sameArguments: candidate.retry?.sameArguments === true,
      },
      review: { enabled: candidate.review?.enabled === true },
      fallback,
    };
  }

  function walkForRecovery(node, depth, found) {
    if (!node || depth > 10 || found.length) return;
    const direct = parseRecoveryResult(node);
    if (direct) {
      found.push(direct);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item) => walkForRecovery(item, depth + 1, found));
      return;
    }
    if (typeof node === 'object') {
      Object.values(node).forEach((value) => walkForRecovery(value, depth + 1, found));
    }
  }

  function extractRecoveryFromPayload(payload) {
    const found = [];
    walkForRecovery(payload, 0, found);
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

  function isHelpOverview(windowObject) {
    try {
      const params = new URL(windowObject.location.href).searchParams;
      return params.get('lcHelp') === '1' || /^what can i do\b/i.test(params.get('q') || '');
    } catch {
      return false;
    }
  }

  function createState() {
    return {
      parentOrigin: '',
      appNavigationBridge: false,
      processedIds: new Set(),
      lastResult: null,
      lastRecovery: null,
      fallbackTimers: {},
      helpOverview: false,
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
    if (result?.destination === 'lesson-detail') {
      return;
    }
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

  function openStudentDetailFallback(windowObject, state, result, reason) {
    if (result?.destination !== 'student-detail') return false;
    const link = resultFromHref(windowObject, clean(result.deepLink));
    if (
      !link ||
      link.destination !== result.destination ||
      link.params.contactId !== result.params?.contactId ||
      !remember(state, `${result.requestId}:fallback`)
    )
      return false;
    try {
      const target = isFramed(windowObject) ? windowObject.top : windowObject;
      target.location.assign(result.deepLink);
      logNav('fallback_opened', {
        requestId: result.requestId,
        destination: result.destination,
        code: reason,
      });
      return true;
    } catch (error) {
      logNav('fallback_failed', {
        requestId: result.requestId,
        destination: result.destination,
        code: reason,
      });
      console.warn('LessonCaddie student page handoff failed', error);
      return false;
    }
  }

  function scheduleFallback(windowObject, state, result) {
    const requestId = result.requestId;
    if (state.fallbackTimers[requestId]) {
      windowObject.clearTimeout(state.fallbackTimers[requestId]);
    }
    state.fallbackTimers[requestId] = windowObject.setTimeout(() => {
      delete state.fallbackTimers[requestId];
      if (!state.processedIds.has(`${requestId}:acked`)) {
        if (openStudentDetailFallback(windowObject, state, result, 'bridge_timeout')) return;
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

  const ASSISTANT_FEEDBACK_PUT = /\/api\/messages\/[^/?#]+\/[^/?#]+\/feedback(?:\?|$)/;

  function parseFeedbackPutPath(url) {
    try {
      const pathname = new URL(url, 'http://localhost').pathname;
      const parts = pathname.split('/').filter(Boolean);
      const feedbackIndex = parts.lastIndexOf('feedback');
      if (feedbackIndex < 2 || parts[feedbackIndex - 3] !== 'messages') {
        return null;
      }
      return {
        conversationId: parts[feedbackIndex - 2],
        messageId: parts[feedbackIndex - 1],
      };
    } catch {
      return null;
    }
  }

  function postAssistantFeedback(windowObject, state, payload) {
    ensureEmbeddedBridge(windowObject, state);
    if (!isFramed(windowObject) || state.appNavigationBridge !== true) {
      return false;
    }
    const origin = resolveParentOrigin(windowObject, state);
    if (!origin) {
      return false;
    }
    const rating = String(payload?.feedback?.rating || '').trim();
    if (rating !== 'thumbsUp' && rating !== 'thumbsDown') {
      return false;
    }
    const message = {
      source: ASSISTANT_MESSAGE_SOURCE,
      type: 'assistant-feedback',
      version: 1,
      requestId: `feedback-${Date.now()}`,
      rating,
      feedback: payload.feedback,
      conversationId: payload.conversationId,
      messageId: payload.messageId,
      text: payload.feedback?.text,
      tag: payload.feedback?.tag,
    };
    try {
      windowObject.parent.postMessage(message, origin);
      return true;
    } catch (error) {
      console.warn('LessonCaddie assistant feedback bridge failed', error);
      return false;
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

  function renderPageHelp(windowObject, help) {
    const doc = windowObject.document;
    if (!doc?.body || typeof doc.createElement !== 'function') {
      return false;
    }
    const items = Array.isArray(help?.items) ? help.items.slice(0, 12) : [];
    const list = doc.createElement('ul');
    items.forEach((item) => {
      const href = clean(item?.href);
      const title = clean(item?.title).slice(0, 80);
      const summary = clean(item?.summary).slice(0, 180);
      if (!title || !resultFromHref(windowObject, href)) {
        return;
      }
      const row = doc.createElement('li');
      const heading = doc.createElement('strong');
      heading.textContent = title;
      const description = doc.createElement('span');
      description.textContent = summary;
      const link = doc.createElement('a');
      link.href = href;
      link.textContent = 'Take me there';
      row.append(heading, description, link);
      list.appendChild(row);
    });
    if (!list.childElementCount) {
      return false;
    }
    doc.getElementById('lessoncaddie-page-help')?.remove();
    const card = doc.createElement('section');
    card.id = 'lessoncaddie-page-help';
    const pageTitle = clean(help.pageTitle).slice(0, 60);
    const heading = doc.createElement('h2');
    heading.textContent = pageTitle ? `What you can do from ${pageTitle}` : 'What you can do';
    card.append(heading, list);
    doc.body.appendChild(card);
    return true;
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
    if (event.data.type === 'page-help') {
      state.pageHelp = event.data;
      renderPageHelp(windowObject, state.pageHelp);
      return;
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
      } else if (event.data.ok === false && state.lastResult?.requestId === requestId) {
        openStudentDetailFallback(windowObject, state, state.lastResult, 'bridge_rejected');
      }
      logNav('ack_received', {
        requestId,
        destination: state.lastResult && state.lastResult.destination,
        code: event.data.code,
      });
    }
  }

  function submitRecoveryPrompt(windowObject, prompt) {
    const doc = windowObject.document;
    const composer = doc?.querySelector?.('textarea[aria-label="Message input"]');
    if (!composer) return false;
    const proto = windowObject.HTMLTextAreaElement?.prototype;
    const setter = proto && Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (typeof setter === 'function') setter.call(composer, prompt);
    else composer.value = prompt;
    composer.dispatchEvent(new windowObject.Event('input', { bubbles: true }));
    composer.dispatchEvent(new windowObject.Event('change', { bubbles: true }));
    windowObject.setTimeout(() => {
      doc.querySelector?.('button[aria-label="Send message"]:not([disabled])')?.click?.();
    }, 0);
    return true;
  }

  function renderRecoveryControls(windowObject, state, recovery) {
    const doc = windowObject.document;
    if (!doc?.body || typeof doc.createElement !== 'function') return false;
    doc.getElementById?.('lessoncaddie-recovery-card')?.remove?.();
    const card = doc.createElement('section');
    card.id = 'lessoncaddie-recovery-card';
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', 'Save recovery');
    card.style.cssText =
      'position:fixed;left:50%;bottom:88px;z-index:2147483000;transform:translateX(-50%);' +
      'width:min(560px,calc(100vw - 24px));box-sizing:border-box;padding:14px;border:1px solid #3f4b55;' +
      'border-radius:14px;background:#111a21;color:#f5f7f8;box-shadow:0 14px 36px rgba(0,0,0,.45);' +
      'font:14px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';

    const heading = doc.createElement('strong');
    heading.textContent = {
      permission: 'Permission issue',
      validation: 'Review the details',
      service: 'LessonCaddie service issue',
    }[recovery.category];
    const message = doc.createElement('p');
    message.textContent = recovery.message;
    message.style.cssText = 'margin:6px 0 12px;color:#d7dde2;';
    const actions = doc.createElement('div');
    actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
    const status = doc.createElement('p');
    status.setAttribute('aria-live', 'polite');
    status.style.cssText = 'margin:10px 0 0;color:#b8c6cf;';
    const details = doc.createElement('dl');
    details.hidden = true;
    details.style.cssText =
      'margin:12px 0 0;padding:10px;border-radius:10px;background:#1a252d;max-height:180px;overflow:auto;';

    const detailLabels = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone',
      nickname: 'Nickname',
      notes: 'Notes',
      title: 'Title',
      tagline: 'Tagline',
      concepts: 'Concepts',
      drills: 'Drills',
      checkpoints: 'Checkpoints',
      commonMisses: 'Common misses',
      fixes: 'Fixes',
      location: 'Location',
      start: 'Start',
      durationMinutes: 'Duration',
      text: 'Draft text',
    };
    for (const [key, value] of Object.entries(recovery.keptDetails)) {
      const term = doc.createElement('dt');
      term.textContent = detailLabels[key] || key;
      term.style.cssText = 'font-weight:700;color:#f5f7f8;';
      const description = doc.createElement('dd');
      description.textContent = Array.isArray(value) ? value.join(' · ') : value;
      description.style.cssText = 'margin:0 0 8px;color:#d7dde2;white-space:pre-wrap;';
      details.append(term, description);
    }

    const button = (label, handler, primary = false) => {
      const element = doc.createElement('button');
      element.type = 'button';
      element.textContent = label;
      element.style.cssText =
        `padding:9px 12px;border-radius:9px;border:1px solid ${primary ? '#55b978' : '#55636d'};` +
        `background:${primary ? '#318a52' : '#202b33'};color:#fff;font-weight:700;cursor:pointer;`;
      element.addEventListener('click', handler);
      actions.appendChild(element);
      return element;
    };

    if (recovery.retry.enabled) {
      const retryPrompt = recovery.retry.sameArguments
        ? 'Retry the failed save now with the same retained details. Do not ask me to re-enter them.'
        : 'Review the retained details, correct only what needs attention, and retry the failed save. Do not ask me to re-enter details you already have.';
      button(
        'Retry Save',
        () => {
          if (submitRecoveryPrompt(windowObject, retryPrompt)) {
            status.textContent = 'Retry requested with the retained details.';
          } else {
            status.textContent =
              'The Chat composer is unavailable. Review the details or open the editor.';
          }
        },
        true,
      );
    }
    if (recovery.review.enabled && Object.keys(recovery.keptDetails).length) {
      const reviewButton = button('Review Details', () => {
        details.hidden = !details.hidden;
        reviewButton.setAttribute('aria-expanded', String(!details.hidden));
      });
      reviewButton.setAttribute('aria-expanded', 'false');
    }
    if (recovery.fallback) {
      button('Open in LessonCaddie', () => {
        const result = {
          type: NAVIGATION_TYPE,
          version: NAVIGATION_VERSION,
          destination: recovery.fallback.destination,
          params: recovery.fallback.params,
          requestId: `recovery-${Date.now()}`,
        };
        state.processedIds.delete(result.requestId);
        if (postNavigate(windowObject, state, result)) {
          status.textContent = 'Opening the prefilled editor in LessonCaddie.';
        } else {
          status.textContent =
            'Open LessonCaddie from the app to continue with the retained details.';
        }
      });
    }
    button('Dismiss', () => card.remove());

    card.append(heading, message, actions, details, status);
    doc.body.appendChild(card);
    return true;
  }

  function consumePayload(windowObject, state, payload) {
    const recovery = extractRecoveryFromPayload(payload);
    if (recovery) {
      state.lastRecovery = recovery;
      renderRecoveryControls(windowObject, state, recovery);
    }
    const result = extractNavigationFromPayload(payload, windowObject);
    if (!result) {
      return Boolean(recovery);
    }
    state.lastResult = result;
    if (state.helpOverview) {
      logNav('overview_link_deferred', {
        requestId: result.requestId,
        destination: result.destination,
      });
      return true;
    }
    if (!isFramed(windowObject)) {
      if (openStudentDetailFallback(windowObject, state, result, 'standalone')) return true;
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
        if (openStudentDetailFallback(windowObject, state, result, 'unknown_client')) return;
        logNav('fallback_link', {
          requestId: result.requestId,
          destination: result.destination,
          code: 'unknown_client',
        });
      }
    }, 400);
    return false;
  }

  function correctNewChatLink(windowObject, event) {
    const anchor = event?.target?.closest?.('a[href]');
    const href = anchor?.href;
    const baseHref = windowObject.document?.querySelector?.('base[href]')?.getAttribute?.('href');
    if (!href || !baseHref || !windowObject.location?.href) return;
    try {
      const base = new URL(baseHref, windowObject.location.href);
      const link = new URL(href);
      if (base.pathname === '/' || base.origin !== link.origin || link.pathname !== '/c/new')
        return;
      anchor.href = new URL(`c/new${link.search}${link.hash}`, base).toString();
    } catch {
      // Keep the original link if the deployment URL is malformed.
    }
  }

  function isApproveLink(anchor) {
    return /^i approve$/i.test(clean(anchor && anchor.textContent).replace(/\s+/g, ' '));
  }

  function handleDeepLinkClick(windowObject, state, event) {
    correctNewChatLink(windowObject, event);
    const target = event && event.target;
    const anchor = target && target.closest ? target.closest('a[href]') : null;
    if (anchor && isApproveLink(anchor)) {
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
      if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
      submitRecoveryPrompt(windowObject, 'I approve');
      return true;
    }
    if (state.appNavigationBridge !== true || !isFramed(windowObject)) {
      return false;
    }
    const href = anchor && anchor.href;
    if (!href || !isAllowedOrigin(windowObject, originOf(href))) {
      return false;
    }
    const result =
      state.lastResult && state.lastResult.deepLink === href
        ? state.lastResult
        : resultFromHref(windowObject, href);
    if (!result) {
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    state.processedIds.delete(result.requestId);
    postNavigate(windowObject, state, result);
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
    state.helpOverview = isHelpOverview(windowObject);
    windowObject.addEventListener(
      'click',
      (event) => {
        if (!state.helpOverview || !event.target?.closest?.('button[aria-label="Send message"]')) {
          return;
        }
        const typed = String(
          windowObject.document?.querySelector?.('textarea[aria-label="Message input"]')?.value ||
            '',
        ).trim();
        let initial = '';
        try {
          initial = new URL(windowObject.location.href).searchParams.get('q') || '';
        } catch {
          initial = '';
        }
        if (typed && typed !== initial.trim()) {
          state.helpOverview = false;
        }
      },
      true,
    );
    installXhrScan(windowObject, state);
    windowObject.addEventListener('message', (event) =>
      handleShellMessage(windowObject, state, event),
    );
    windowObject.addEventListener(
      'click',
      (event) => handleDeepLinkClick(windowObject, state, event),
      true,
    );
    windowObject.addEventListener(
      'pointerover',
      (event) => correctNewChatLink(windowObject, event),
      true,
    );
    windowObject.addEventListener(
      'focusin',
      (event) => correctNewChatLink(windowObject, event),
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
        const methodUpper = String(method || 'GET').toUpperCase();
        if (methodUpper === 'PUT' && ASSISTANT_FEEDBACK_PUT.test(String(url || ''))) {
          return originalFetch.apply(this, arguments).then(async (response) => {
            try {
              if (response?.ok) {
                const ids = parseFeedbackPutPath(String(url || ''));
                const clone = response.clone();
                const data = await clone.json().catch(() => null);
                const feedback = data?.feedback;
                if (
                  ids &&
                  feedback &&
                  (feedback.rating === 'thumbsUp' || feedback.rating === 'thumbsDown')
                ) {
                  postAssistantFeedback(windowObject, state, {
                    ...ids,
                    feedback,
                  });
                }
              }
            } catch {
              // Overlay must not break Chat feedback.
            }
            return response;
          });
        }
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
      openRecoveryFallback(fallback) {
        const recovery = parseRecoveryResult({
          type: RECOVERY_TYPE,
          version: RECOVERY_VERSION,
          category: 'service',
          fallback,
        });
        if (!recovery?.fallback) return false;
        const result = {
          type: NAVIGATION_TYPE,
          version: NAVIGATION_VERSION,
          destination: recovery.fallback.destination,
          params: recovery.fallback.params,
          requestId: `recovery-${Date.now()}`,
        };
        state.processedIds.delete(result.requestId);
        return postNavigate(windowObject, state, result);
      },
    };
  }

  return {
    TOOL_NAME,
    parseNavigationResult,
    extractNavigationFromPayload,
    extractRecoveryFromPayload,
    resultFromHref,
    renderPageHelp,
    parseSseChunk,
    handleDeepLinkClick,
    hideResolvedDeepLinks,
    announceBridgeReady,
    install,
  };
});
