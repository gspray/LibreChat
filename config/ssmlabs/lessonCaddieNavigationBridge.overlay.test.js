'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  extractNavigationFromPayload,
  parseSseChunk,
} = require('./lessonCaddieNavigationBridge.browser.js');

const RESULT = {
  type: 'lessoncaddie.navigation',
  version: 1,
  destination: 'start-lesson',
  params: {},
  requestId: 'req-live-1',
};

test('extracts navigation from a completed MCP SSE payload', () => {
  const payload = {
    event: 'on_run_step_completed',
    data: {
      result: {
        tool_call: {
          name: 'open_app_screen_mcp_lessoncaddie-instructor',
          output: JSON.stringify(RESULT),
        },
      },
    },
  };
  assert.equal(extractNavigationFromPayload(payload)?.destination, 'start-lesson');
});

test('parses SSE data lines into JSON events', () => {
  const found = [];
  const rest = parseSseChunk(`event: message\ndata: ${JSON.stringify({ ok: true })}\n`, (event) =>
    found.push(event),
  );
  assert.deepEqual(found, [{ ok: true }]);
  assert.equal(rest, '');
});
