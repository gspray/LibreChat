'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
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

test('client-side login navigation returns through LessonCaddie SSO', () => {
  const previous = {
    enabled: process.env.LESSONCADDIE_SSO_ENABLED,
    domain: process.env.DOMAIN_CLIENT,
    secret: process.env.LESSONCADDIE_SSO_SHARED_SECRET,
    home: process.env.LESSONCADDIE_HOME_URL,
  };
  process.env.LESSONCADDIE_SSO_ENABLED = 'true';
  process.env.LESSONCADDIE_SSO_SHARED_SECRET = 'test-secret';
  process.env.DOMAIN_CLIENT = 'https://stage.lessoncaddie.app/chat';
  process.env.LESSONCADDIE_HOME_URL = 'https://stage.lessoncaddie.app/app';
  try {
    const html = injectIndexHtml(SAMPLE);
    const script = html.match(
      /<script data-ssmlabs-login-fallback="true">([\s\S]*?)<\/script>/,
    )?.[1];
    assert.ok(script);
    const calls = [];
    const browser = {
      location: {
        href: 'https://stage.lessoncaddie.app/chat/c/abc',
        origin: 'https://stage.lessoncaddie.app',
        pathname: '/chat/c/abc',
        search: '',
        assign(url) {
          calls.push(['assign', url]);
        },
      },
      history: {
        replaceState(...args) {
          calls.push(['replace', ...args]);
        },
        pushState(...args) {
          calls.push(['push', ...args]);
        },
      },
      URL,
      encodeURIComponent,
    };
    browser.window = browser;
    browser.parent = browser;
    vm.runInNewContext(script, browser);
    browser.history.replaceState({}, '', '/chat/login');
    assert.deepEqual(calls, [
      ['assign', '/chat/sso/lessoncaddie/start?returnTo=%2Fchat%2Fc%2Fabc'],
    ]);
    calls.length = 0;
    browser.history.pushState({}, '', '/chat/login?local=1');
    assert.equal(calls[0][0], 'push');
    calls.length = 0;
    browser.history.replaceState({}, '', '/chat/c/other');
    assert.equal(calls[0][0], 'replace');
    calls.length = 0;
    const listeners = {};
    class FakeXhr {
      open() {}
      send() {}
      addEventListener(name, listener) {
        listeners[name] = listener;
      }
    }
    browser.XMLHttpRequest = FakeXhr;
    browser.setTimeout = (callback) => callback();
    vm.runInNewContext(script, browser);
    const xhr = new FakeXhr();
    xhr.open('POST', '/chat/api/auth/logout');
    xhr.send();
    browser.history.replaceState({}, '', '/chat/login');
    assert.deepEqual(calls, []);
    xhr.status = 200;
    listeners.loadend.call(xhr);
    assert.deepEqual(calls, [['assign', 'https://stage.lessoncaddie.app/app']]);
    const parentMessages = [];
    const frameListeners = {};
    class FrameXhr {
      open() {}
      send() {}
      addEventListener(name, listener) {
        frameListeners[name] = listener;
      }
    }
    const frame = {
      location: { ...browser.location },
      history: { replaceState() {}, pushState() {} },
      XMLHttpRequest: FrameXhr,
      URL,
      encodeURIComponent,
      setTimeout(callback) {
        callback();
      },
      parent: {
        postMessage(message, origin) {
          parentMessages.push({ message, origin });
        },
      },
    };
    frame.window = frame;
    vm.runInNewContext(script, frame);
    const frameXhr = new FrameXhr();
    frameXhr.open('POST', '/chat/api/auth/logout');
    frameXhr.send();
    frameXhr.status = 200;
    frameListeners.loadend.call(frameXhr);
    assert.deepEqual(JSON.parse(JSON.stringify(parentMessages)), [
      {
        message: { source: 'lessoncaddie-assistant', type: 'logout' },
        origin: 'https://stage.lessoncaddie.app',
      },
    ]);
  } finally {
    if (previous.enabled === undefined) delete process.env.LESSONCADDIE_SSO_ENABLED;
    else process.env.LESSONCADDIE_SSO_ENABLED = previous.enabled;
    if (previous.domain === undefined) delete process.env.DOMAIN_CLIENT;
    else process.env.DOMAIN_CLIENT = previous.domain;
    if (previous.secret === undefined) delete process.env.LESSONCADDIE_SSO_SHARED_SECRET;
    else process.env.LESSONCADDIE_SSO_SHARED_SECRET = previous.secret;
    if (previous.home === undefined) delete process.env.LESSONCADDIE_HOME_URL;
    else process.env.LESSONCADDIE_HOME_URL = previous.home;
  }
});

test('injectIndexHtml does not inject a LessonCaddie back-link overlay', () => {
  const html = injectIndexHtml(SAMPLE);
  assert.doesNotMatch(html, /back-to-lessoncaddie\.js/);
  assert.match(html, /hide-model-selector\.js/);
  assert.match(html, /data-ssmlabs-embed-sw="true"/);
  assert.match(html, /data-ssmlabs-nav-config="true"/);
  assert.match(html, /window\.__LESSONCADDIE_NAV__/);
  assert.match(html, /lesson-caddie-navigation-bridge\.js/);
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
