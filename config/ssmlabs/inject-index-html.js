'use strict';

const fs = require('fs');
const path = require('path');

const BACK_SENTINEL = 'data-ssmlabs-lessoncaddie-back="true"';
const SELECTOR_SENTINEL = 'data-ssmlabs-hide-model-selector="true"';
const BRANDING_SENTINEL = 'data-ssmlabs-branding="true"';
const SSO_SENTINEL = 'data-ssmlabs-lessoncaddie-sso="true"';
const SCRIPTS = [
  `<script src="/ssmlabs/back-to-lessoncaddie.js?v=5" defer ${BACK_SENTINEL}></script>`,
  `<script src="/ssmlabs/hide-model-selector.js?v=3" defer ${SELECTOR_SENTINEL}></script>`,
].join('\n');
const SSO_SCRIPT = `<script src="/ssmlabs/lessoncaddie-sso.js?v=1" defer ${SSO_SENTINEL}></script>`;

function isLessonCaddieSsoEnabled(env = process.env) {
  const raw = String(env.LESSONCADDIE_SSO_ENABLED || '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

const DEFAULT_APP_TITLE = 'Ask Lesson Caddie Assistant';
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
  const shortName = (process.env.APP_SHORT_NAME || DEFAULT_APP_SHORT_NAME).trim() || DEFAULT_APP_SHORT_NAME;
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

function injectOverlayScripts(html) {
  let next = html;
  if (!(html.includes(BACK_SENTINEL) && html.includes(SELECTOR_SENTINEL))) {
    for (const tag of SCRIPTS.split('\n')) {
      if (!next.includes(tag)) {
        next = next.replace('</head>', `${tag}\n</head>`);
      }
    }
  }
  if (isLessonCaddieSsoEnabled() && !next.includes(SSO_SENTINEL)) {
    next = next.replace('</head>', `${SSO_SCRIPT}\n</head>`);
  }
  return next;
}

function injectIndexHtml(html) {
  return injectOverlayScripts(injectBranding(html));
}

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function readFileSyncWithLessonCaddieBack(file, options) {
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
  injectIndexHtml,
  injectOverlayScripts,
};
