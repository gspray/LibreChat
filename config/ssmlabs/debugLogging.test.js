'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { debugLogging, liveTalkLog } = require('./debugLogging');

test('server reads environment flags once per cache interval without credentials', async () => {
  const originalFetch = global.fetch;
  const { refreshDebugLogging } = require('./debugLogging');
  let calls = 0;
  global.fetch = async (url, options) => {
    calls += 1;
    assert.equal(url.pathname, '/api/app-settings');
    assert.equal(options.headers, undefined);
    assert.equal(options.cache, 'no-store');
    return new Response(JSON.stringify({ debugLogging: { navigation: true, liveTalk: true } }));
  };
  try {
    await refreshDebugLogging();
    await refreshDebugLogging();
    assert.equal(calls, 1);
    assert.deepEqual(debugLogging, { navigation: true, liveTalk: true });
  } finally {
    global.fetch = originalFetch;
    debugLogging.navigation = debugLogging.liveTalk = false;
  }
});

test('Admin Desk flags independently gate navigation and Live Talk diagnostics', () => {
  const original = { info: console.info, warn: console.warn, error: console.error };
  const lines = [];
  for (const level of Object.keys(original)) console[level] = (...args) => lines.push(args);
  try {
    liveTalkLog('info', 'session.create.ok');
    liveTalkLog('info', 'delegation.navigation-ready');
    assert.equal(lines.length, 0);
    debugLogging.navigation = true;
    liveTalkLog('info', 'session.create.ok');
    liveTalkLog('info', 'delegation.navigation-ready');
    assert.equal(lines.length, 1);
    assert.match(lines[0][0], /\[ssmlabs-live-talk\] delegation.navigation-ready/);
    debugLogging.navigation = false;
    debugLogging.liveTalk = true;
    liveTalkLog('info', 'session.create.ok');
    assert.equal(lines.length, 2);
    debugLogging.liveTalk = false;
    liveTalkLog('error', 'bootstrap.failed', { status: 502 });
    assert.equal(lines.length, 3);
    assert.doesNotMatch(lines[2][0], /\[ssmlabs-live-talk\]/);
    assert.deepEqual(lines[2][1], { status: 502 });
  } finally {
    Object.assign(console, original);
    debugLogging.navigation = debugLogging.liveTalk = false;
  }
});
