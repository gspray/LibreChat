(function ssmlabsBackToLessonCaddie() {
  'use strict';
  const LABEL = 'Back to LessonCaddie';
  const DESKTOP_LABEL = '← Back to LessonCaddie';
  const BUTTON_ID = 'ssmlabs-back-to-lessoncaddie';
  const MOBILE_QUERY = '(max-width: 768px)';

  function readConfig(startup) {
    const lessonCaddie = startup && startup.lessonCaddie;
    if (!lessonCaddie || typeof lessonCaddie !== 'object') {
      return null;
    }
    const homeUrl = typeof lessonCaddie.homeUrl === 'string' ? lessonCaddie.homeUrl.trim() : '';
    const allowedOrigins = Array.isArray(lessonCaddie.allowedOrigins)
      ? lessonCaddie.allowedOrigins.filter((origin) => typeof origin === 'string' && origin.trim())
      : [];
    const storageKey =
      typeof lessonCaddie.storageKey === 'string' && lessonCaddie.storageKey.trim()
        ? lessonCaddie.storageKey.trim()
        : 'ssmlabs.lessoncaddie.returnUrl';
    if (!homeUrl || !allowedOrigins.length) {
      return null;
    }
    return { homeUrl, allowedOrigins, storageKey };
  }

  function parseAbsoluteUrl(value) {
    const candidate = typeof value === 'string' ? value.trim() : '';
    if (!candidate || candidate.length > 2048 || !/^https?:\/\//i.test(candidate)) {
      return null;
    }
    try {
      return new URL(candidate);
    } catch (error) {
      return null;
    }
  }

  function isLocalHttpHost(hostname) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  }

  function sanitizeReturnUrl(candidate, allowedOrigins) {
    const url = parseAbsoluteUrl(candidate);
    if (!url || url.username || url.password) {
      return '';
    }
    const allowed =
      url.protocol === 'https:'
        ? allowedOrigins.includes(url.origin)
        : url.protocol === 'http:' && isLocalHttpHost(url.hostname) && allowedOrigins.includes(url.origin);
    return allowed ? url.toString() : '';
  }

  function readStored(storageKey) {
    try {
      return sessionStorage.getItem(storageKey) || '';
    } catch (error) {
      return '';
    }
  }

  function writeStored(storageKey, value) {
    try {
      sessionStorage.setItem(storageKey, value);
    } catch (error) {
      /* Private mode still navigates to the home URL. */
    }
  }

  function queryReturnValue() {
    const params = new URLSearchParams(window.location.search);
    return (params.get('returnUrl') || params.get('lessoncaddieReturn') || '').trim();
  }

  function resolveTarget(config) {
    const fromQuery = sanitizeReturnUrl(queryReturnValue(), config.allowedOrigins);
    if (fromQuery) {
      writeStored(config.storageKey, fromQuery);
      return fromQuery;
    }
    const fromStore = sanitizeReturnUrl(readStored(config.storageKey), config.allowedOrigins);
    if (fromStore) {
      return fromStore;
    }
    return sanitizeReturnUrl(config.homeUrl, config.allowedOrigins);
  }

  function findHeader() {
    const sidebar = document.querySelector('[data-testid="header-open-sidebar-button"]');
    if (sidebar) {
      return sidebar.closest('.absolute.top-0') || sidebar.parentElement && sidebar.parentElement.parentElement;
    }
    return document.querySelector('.absolute.top-0.z-20.flex');
  }

  function ensureStyle() {
    if (document.head.querySelector('[data-ssmlabs-lessoncaddie-back-style]')) {
      return;
    }
    const style = document.createElement('style');
    style.setAttribute('data-ssmlabs-lessoncaddie-back-style', 'true');
    style.textContent = `
      #${BUTTON_ID} {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        height: 2.25rem;
        padding: 0 0.75rem;
        margin-inline-end: 0.15rem;
        border-radius: 0.75rem;
        border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
        background: var(--presentation, transparent);
        color: inherit;
        text-decoration: none;
        font: inherit;
        font-size: 0.875rem;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
        flex-shrink: 0;
        z-index: 21;
      }
      #${BUTTON_ID}:hover {
        background: color-mix(in srgb, currentColor 8%, transparent);
      }
      #${BUTTON_ID} .ssmlabs-back-icon {
        width: 1rem;
        height: 1rem;
      }
      @media ${MOBILE_QUERY} {
        #${BUTTON_ID} {
          width: 2.25rem;
          padding: 0;
        }
        #${BUTTON_ID} .ssmlabs-back-label {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function mountButton(target) {
    if (document.querySelector('[data-testid="back-to-lessoncaddie"]')) {
      return true;
    }
    if (document.getElementById(BUTTON_ID)) {
      return true;
    }
    const header = findHeader();
    if (!header) {
      return false;
    }
    ensureStyle();
    const button = document.createElement('a');
    button.id = BUTTON_ID;
    button.href = target;
    button.setAttribute('aria-label', LABEL);
    button.innerHTML =
      '<svg class="ssmlabs-back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg><span class="ssmlabs-back-label"></span>';
    const label = button.querySelector('.ssmlabs-back-label');
    if (label) {
      label.textContent = DESKTOP_LABEL;
    }
    const after = header.children[0] &&
      header.children[0].contains(document.querySelector('[data-testid="header-open-sidebar-button"]'))
      ? header.children[0]
      : null;
    if (after && after.nextSibling) {
      header.insertBefore(button, after.nextSibling);
    } else {
      header.insertBefore(button, header.firstChild);
    }
    return true;
  }

  function start(config) {
    const target = resolveTarget(config);
    if (!target) {
      return;
    }
    if (mountButton(target)) {
      return;
    }
    const observer = new MutationObserver(() => {
      if (mountButton(target)) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }

  fetch('/api/config', { credentials: 'same-origin' })
    .then((response) => (response.ok ? response.json() : null))
    .then((startup) => {
      const config = readConfig(startup);
      if (config) {
        start(config);
      }
    })
    .catch(() => {
      /* Leave LibreChat usable if the back-link config cannot be loaded. */
    });
})();
