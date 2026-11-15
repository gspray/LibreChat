'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { install } = require('./lessonCaddieNavigationBridge.browser');

const origin = 'https://lessoncaddie.ssmlabs.com';
const navigation = {
  type: 'lessoncaddie.navigation',
  version: 1,
  destination: 'calendar',
  params: {},
  requestId: 'live-nav-1',
};

function createBrowser() {
  const sent = [];
  const timers = new Map();
  let onMessage;
  let timerId = 0;
  const browser = {
    location: {},
    document: { referrer: `${origin}/app` },
    parent: {
      postMessage(message, targetOrigin) {
        sent.push({ message, targetOrigin });
      },
    },
    top: {
      location: {
        assign() {
          assert.fail('Live Talk must preserve the active voice frame');
        },
      },
    },
    addEventListener(type, listener) {
      if (type === 'message') onMessage = listener;
    },
    setTimeout(callback, delay) {
      timers.set(++timerId, { callback, delay });
      return timerId;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
  };
  install(browser);
  return {
    overlay: browser.LessonCaddieNavigationOverlay,
    sent,
    timers,
    ack(data = {}, source = browser.parent) {
      onMessage({
        source,
        origin,
        data: {
          source: 'lessoncaddie-shell',
          type: 'navigate-ack',
          version: 1,
          requestId: navigation.requestId,
          ok: true,
          code: 'ok',
          ...data,
        },
      });
    },
  };
}

test('Live Talk navigation waits for the trusted parent acknowledgement', async () => {
  const browser = createBrowser();
  let settled = false;
  const completion = browser.overlay.navigate({ structuredContent: navigation });
  completion.then(() => {
    settled = true;
  });
  await Promise.resolve();
  assert.equal(settled, false);
  const posted = browser.sent.find(({ message }) => message.type === 'navigate');
  assert.equal(posted.targetOrigin, origin);
  assert.equal(posted.message.destination, 'calendar');
  browser.ack({}, {});
  await Promise.resolve();
  assert.equal(settled, false);
  browser.ack({ requestId: 'another-request' });
  await Promise.resolve();
  assert.equal(settled, false);
  browser.ack();
  assert.deepEqual(await completion, { ok: true, code: 'ok', requestId: navigation.requestId });
});

test('Live Talk returns rejection and allows a subsequent attempt with the same MCP request ID', async () => {
  const browser = createBrowser();
  const payload = { content: [{ type: 'text', text: JSON.stringify(navigation) }] };
  const first = browser.overlay.navigate(payload);
  browser.ack({ ok: false, code: 'panel_handler_missing' });
  assert.equal((await first).ok, false);
  const second = browser.overlay.navigate(payload);
  browser.ack();
  assert.equal((await second).ok, true);
  assert.equal(browser.sent.filter(({ message }) => message.type === 'navigate').length, 2);
});

test('missing confirmation times out without navigating the top window or claiming success', async () => {
  const browser = createBrowser();
  const completion = browser.overlay.navigate({
    ...navigation,
    destination: 'student-detail',
    params: { contactId: 'student-1' },
    deepLink: `${origin}/app/contact-edit?contactId=student-1`,
  });
  const timeout = [...browser.timers.values()].find(({ delay }) => delay === 15000);
  assert.ok(timeout);
  timeout.callback();
  assert.deepEqual(await completion, {
    ok: false,
    code: 'bridge_timeout',
    requestId: navigation.requestId,
  });
});

test('a duplicate in-flight request cannot replace its acknowledgement waiter', async () => {
  const browser = createBrowser();
  const first = browser.overlay.navigate(navigation);
  const duplicate = await browser.overlay.navigate(navigation);
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.code, 'navigation_in_flight');
  browser.ack();
  assert.equal((await first).ok, true);
  assert.equal(browser.sent.filter(({ message }) => message.type === 'navigate').length, 1);
});

test('standalone Chat and invalid navigation cannot report an opened app page', async () => {
  const browser = createBrowser();
  assert.equal((await browser.overlay.navigate({ destination: 'calendar' })).ok, false);
  const standalone = { location: {}, addEventListener() {} };
  standalone.parent = standalone;
  install(standalone);
  assert.equal(
    (await standalone.LessonCaddieNavigationOverlay.navigate(navigation)).code,
    'not_framed',
  );
});
