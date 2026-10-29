'use strict';

/**
 * SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Hooks fs.readFileSync so api/server/index.js stays upstream while we still inject
 * branding, <base href="/"> for nested /c/... routes, and overlay scripts.
 */
const fs = require('fs');
const path = require('path');

const { resolveLessonCaddieConfig } = require('./lessonCaddieReturn');

const SELECTOR_SENTINEL = 'data-ssmlabs-hide-model-selector="true"';
const BRANDING_SENTINEL = 'data-ssmlabs-branding="true"';
const EMBED_SW_SENTINEL = 'data-ssmlabs-embed-sw="true"';
const NAV_CONFIG_SENTINEL = 'data-ssmlabs-nav-config="true"';
const NAV_BRIDGE_SENTINEL = 'data-ssmlabs-nav-bridge="true"';
const LOGIN_FALLBACK_SENTINEL = 'data-ssmlabs-login-fallback="true"';
const SELECTOR_SCRIPT = `<script src="ssmlabs/hide-model-selector.js?v=3" defer ${SELECTOR_SENTINEL}></script>`;
const NAV_BRIDGE_SCRIPT = `<script src="ssmlabs/lesson-caddie-navigation-bridge.js?v=3" ${NAV_BRIDGE_SENTINEL}></script>`;
const EMBED_SW_SCRIPT = `<script ${EMBED_SW_SENTINEL}>
(function clearFramedChatWorker() {
  if (window.parent === window) return;
  if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      registrations.forEach(function (registration) {
        registration.unregister();
      });
    });
  }
  if (window.caches && caches.keys) {
    caches.keys().then(function (keys) {
      keys.forEach(function (key) {
        caches.delete(key);
      });
    });
  }
})();
</script>`;

const DEFAULT_APP_TITLE = 'LessonCaddie';
const DEFAULT_APP_SHORT_NAME = 'Ask Caddie';
const DEFAULT_META_DESCRIPTION =
  'Ask Lesson Caddie Assistant — instructor chat powered by LessonCaddie.';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectBranding(html) {
  if (html.includes(BRANDING_SENTINEL)) {
    return html;
  }
  const title = (process.env.APP_TITLE || DEFAULT_APP_TITLE).trim() || DEFAULT_APP_TITLE;
  const shortName =
    (process.env.APP_SHORT_NAME || DEFAULT_APP_SHORT_NAME).trim() || DEFAULT_APP_SHORT_NAME;
  const description = (process.env.APP_META_DESCRIPTION || DEFAULT_META_DESCRIPTION).trim();
  const assetVersion = (process.env.SSMLABS_BRANDING_ASSET_VERSION || '1').trim() || '1';

  let next = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  const descriptionPattern =
    /<meta[\s\S]*?\sname="description"[\s\S]*?\scontent="[^"]*"[\s\S]*?\/>/i;
  if (descriptionPattern.test(next)) {
    next = next.replace(
      descriptionPattern,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    );
  } else {
    next = next.replace(
      '</head>',
      `    <meta name="description" content="${escapeHtml(description)}" />\n</head>`,
    );
  }
  const appleTitleTag = `<meta name="apple-mobile-web-app-title" content="${escapeHtml(shortName)}" />`;
  if (!/name="apple-mobile-web-app-title"/i.test(next)) {
    next = next.replace('</head>', `    ${appleTitleTag}\n</head>`);
  } else {
    next = next.replace(
      /<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/>/i,
      appleTitleTag,
    );
  }
  next = next.replace(
    /<meta\s+name="theme-color"\s+content="[^"]*"\s*\/>/i,
    '<meta name="theme-color" content="#171717" />',
  );
  next = next.replace(
    /href="assets\/(favicon-[^"]+|apple-touch-icon[^"]+)"/gi,
    (match, assetPath) => `href="assets/${assetPath}?v=${assetVersion}"`,
  );
  next = next.replace('</head>', `    <!-- ${BRANDING_SENTINEL} -->\n</head>`);
  return next;
}

function injectBaseHref(html) {
  const clientUrl = process.env.DOMAIN_CLIENT ? new URL(process.env.DOMAIN_CLIENT) : null;
  const pathname = clientUrl?.pathname || '/';
  const baseHref = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const baseTag = `<base href="${escapeHtml(baseHref)}">`;
  if (/<base\b[^>]*>/i.test(html)) {
    return html.replace(/<base\b[^>]*>/i, baseTag);
  }
  return html.replace(/<head\b[^>]*>/i, (headTag) => `${headTag}\n    ${baseTag}`);
}

function buildNavConfigScript() {
  const config = resolveLessonCaddieConfig(process.env);
  const payload = JSON.stringify({
    allowedOrigins: config.allowedOrigins,
    homeUrl: config.homeUrl,
  });
  return `<script ${NAV_CONFIG_SENTINEL}>window.__LESSONCADDIE_NAV__=${payload};</script>`;
}

function buildLoginFallbackScript() {
  if (process.env.LESSONCADDIE_SSO_ENABLED !== 'true') {
    return '';
  }
  const basePath = new URL(
    process.env.DOMAIN_CLIENT || 'https://chat.ssmlabs.com',
  ).pathname.replace(/\/$/, '');
  return `<script ${LOGIN_FALLBACK_SENTINEL}>
(function () {
  var basePath = ${JSON.stringify(basePath)};
  var loginPath = basePath + '/login';
  var originalReplaceState = history.replaceState;
  var originalPushState = history.pushState;
  function redirectIfChatLogin(url) {
    if (url == null || location.pathname === loginPath) return false;
    var target;
    try { target = new URL(url, location.href); } catch (_) { return false; }
    if (target.origin !== location.origin || target.pathname !== loginPath || target.searchParams.get('local') === '1') return false;
    var returnTo = location.pathname + location.search;
    location.assign(basePath + '/sso/lessoncaddie/start?returnTo=' + encodeURIComponent(returnTo));
    return true;
  }
  history.replaceState = function (state, title, url) {
    if (!redirectIfChatLogin(url)) return originalReplaceState.apply(this, arguments);
  };
  history.pushState = function (state, title, url) {
    if (!redirectIfChatLogin(url)) return originalPushState.apply(this, arguments);
  };
})();
</script>`;
}

function injectOverlayScripts(html) {
  let next = html;
  if (!next.includes(SELECTOR_SENTINEL)) {
    next = next.replace('</head>', `${SELECTOR_SCRIPT}\n</head>`);
  }
  if (!next.includes(EMBED_SW_SENTINEL)) {
    next = next.replace('</head>', `${EMBED_SW_SCRIPT}\n</head>`);
  }
  if (!next.includes(NAV_CONFIG_SENTINEL)) {
    next = next.replace('</head>', `${buildNavConfigScript()}\n</head>`);
  }
  if (!next.includes(NAV_BRIDGE_SENTINEL)) {
    next = next.replace('</head>', `${NAV_BRIDGE_SCRIPT}\n</head>`);
  }
  if (!next.includes(LOGIN_FALLBACK_SENTINEL)) {
    next = next.replace('</head>', `${buildLoginFallbackScript()}\n</head>`);
  }
  return next;
}

function injectIndexHtml(html) {
  return injectOverlayScripts(injectBaseHref(injectBranding(html)));
}

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function readFileSyncWithLessonCaddieBack(file, _options) {
  const data = originalReadFileSync.apply(this, arguments);
  const filePath = typeof file === 'string' ? file : String(file);
  if (path.basename(filePath) !== 'index.html') {
    return data;
  }
  if (typeof data === 'string') {
    return injectIndexHtml(data);
  }
  if (Buffer.isBuffer(data)) {
    const html = data.toString('utf8');
    const next = injectIndexHtml(html);
    return next === html ? data : Buffer.from(next, 'utf8');
  }
  return data;
};

module.exports = {
  injectBranding,
  injectBaseHref,
  injectIndexHtml,
  injectOverlayScripts,
};
