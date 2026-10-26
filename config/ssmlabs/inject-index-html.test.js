'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { injectBranding } = require('./inject-index-html');

const SAMPLE = `<!doctype html>
<html lang="en-US">
  <head>
    <meta
      name="description"
      content="LibreChat - An open source chat application with support for multiple AI models"
    />
    <title>LibreChat</title>
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png" />
    <link rel="apple-touch-icon" href="assets/apple-touch-icon-180x180.png" />
    <meta name="theme-color" content="#009688" />
  </head>
  <body></body>
</html>`;

test('injectBranding sets title, description, apple title, and favicon cache bust', () => {
  const prevTitle = process.env.APP_TITLE;
  const prevShort = process.env.APP_SHORT_NAME;
  process.env.APP_TITLE = 'Ask Lesson Caddie Assistant';
  process.env.APP_SHORT_NAME = 'Ask Caddie';
  process.env.SSMLABS_BRANDING_ASSET_VERSION = '9';
  try {
    const html = injectBranding(SAMPLE);
    assert.match(html, /<title>Ask Lesson Caddie Assistant<\/title>/);
    assert.match(html, /name="description" content="[^"]*LessonCaddie/);
    assert.match(html, /name="apple-mobile-web-app-title" content="Ask Caddie"/);
    assert.match(html, /href="assets\/favicon-32x32\.png\?v=9"/);
    assert.match(html, /name="theme-color" content="#171717"/);
  } finally {
    process.env.APP_TITLE = prevTitle;
    process.env.APP_SHORT_NAME = prevShort;
    delete process.env.SSMLABS_BRANDING_ASSET_VERSION;
  }
});
