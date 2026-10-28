'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { injectBaseHref, injectBranding, injectIndexHtml } = require('./inject-index-html');

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
  process.env.APP_TITLE = 'LessonCaddie';
  process.env.APP_SHORT_NAME = 'Ask Caddie';
  process.env.SSMLABS_BRANDING_ASSET_VERSION = '9';
  try {
    const html = injectBranding(SAMPLE);
    assert.match(html, /<title>LessonCaddie<\/title>/);
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

test('enabling SSO leaves ordinary LibreChat login visits unchanged', () => {
  const previous = process.env.LESSONCADDIE_SSO_ENABLED;
  process.env.LESSONCADDIE_SSO_ENABLED = 'true';
  try {
    const html = injectIndexHtml(SAMPLE);
    assert.doesNotMatch(html, /lessoncaddie-sso\.js/);
  } finally {
    if (previous === undefined) delete process.env.LESSONCADDIE_SSO_ENABLED;
    else process.env.LESSONCADDIE_SSO_ENABLED = previous;
  }
});

test('injectIndexHtml does not inject a LessonCaddie back-link overlay', () => {
  const html = injectIndexHtml(SAMPLE);
  assert.doesNotMatch(html, /back-to-lessoncaddie\.js/);
  assert.match(html, /hide-model-selector\.js/);
  assert.match(html, /data-ssmlabs-embed-sw="true"/);
});

test('injectBaseHref anchors relative assets at the app root on nested routes', () => {
  const prevDomainClient = process.env.DOMAIN_CLIENT;
  process.env.DOMAIN_CLIENT = 'https://chat.ssmlabs.com';
  try {
    const html = injectBaseHref(SAMPLE);
    assert.match(html, /<base href="\/">/);
  } finally {
    if (prevDomainClient === undefined) {
      delete process.env.DOMAIN_CLIENT;
    } else {
      process.env.DOMAIN_CLIENT = prevDomainClient;
    }
  }
});

test('injectBaseHref preserves configured subdirectory deployments', () => {
  const prevDomainClient = process.env.DOMAIN_CLIENT;
  process.env.DOMAIN_CLIENT = 'https://chat.example.com/chat';
  try {
    const html = injectBaseHref(SAMPLE);
    assert.match(html, /<base href="\/chat\/">/);
  } finally {
    if (prevDomainClient === undefined) {
      delete process.env.DOMAIN_CLIENT;
    } else {
      process.env.DOMAIN_CLIENT = prevDomainClient;
    }
  }
});
