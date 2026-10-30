'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  extractNavigationFromPayload,
  handleDeepLinkClick,
  parseSseChunk,
  resultFromHref,
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

test('extracts navigation JSON that follows an Opened screen sentence', () => {
  const payload = {
    content: [
      {
        type: 'text',
        text: 'Opened Start Lesson.\n{"type":"lessoncaddie.navigation","version":1,"destination":"start-lesson","params":{},"requestId":"req-1"}',
      },
    ],
  };
  assert.equal(extractNavigationFromPayload(payload)?.destination, 'start-lesson');
  assert.equal(extractNavigationFromPayload(payload)?.requestId, 'req-1');
});

test('extracts start-lesson from an external markdown fallback link', () => {
  const payload = {
    content: [
      {
        type: 'text',
        text: 'Open Start Lesson in LessonCaddie: https://lessoncaddie.ssmlabs.com/app?view=start-lesson',
      },
    ],
  };
  assert.equal(extractNavigationFromPayload(payload)?.destination, 'start-lesson');
  assert.equal(
    resultFromHref(null, 'https://lessoncaddie.ssmlabs.com/app?view=start-lesson')?.destination,
    'start-lesson',
  );
});

test('forwards New Student details while the fallback link carries no personal data', () => {
  const result = {
    type: 'lessoncaddie.navigation',
    version: 1,
    destination: 'new-student',
    params: { firstName: 'Alex', email: 'alex.doe@example.com' },
    requestId: 'req-new-student',
    deepLink: 'https://lessoncaddie.ssmlabs.com/app?view=new-student',
  };
  const extracted = extractNavigationFromPayload({
    content: [{ type: 'text', text: JSON.stringify(result) }],
  });
  assert.equal(extracted.destination, 'new-student');
  assert.equal(extracted.params.email, 'alex.doe@example.com');
  assert.equal(resultFromHref(null, result.deepLink)?.destination, 'new-student');
  assert.equal(result.deepLink.includes('alex.doe'), false);
});

test('leaves Chat navigation links alone while forwarding LessonCaddie handoff links', () => {
  const sent = [];
  const windowObject = {
    parent: { postMessage: (...args) => sent.push(args) },
    setTimeout: () => 1,
  };
  const state = {
    appNavigationBridge: true,
    parentOrigin: 'https://lessoncaddie.ssmlabs.com',
    processedIds: new Set(),
    fallbackTimers: {},
    lastResult: null,
  };
  const click = (href) => {
    const event = {
      target: { closest: () => ({ href }) },
      preventDefault() {
        this.prevented = true;
      },
      stopPropagation() {
        this.stopped = true;
      },
    };
    const handled = handleDeepLinkClick(windowObject, state, event);
    return { handled, event };
  };

  const chat = click('https://lessoncaddie.ssmlabs.com/c/new');
  assert.equal(chat.handled, false);
  assert.equal(chat.event.prevented, undefined);
  assert.equal(chat.event.stopped, undefined);
  assert.equal(sent.length, 0);

  const app = click('https://lessoncaddie.ssmlabs.com/app?view=start-lesson');
  assert.equal(app.handled, true);
  assert.equal(app.event.prevented, true);
  assert.equal(app.event.stopped, true);
  assert.equal(sent[0][0].destination, 'start-lesson');
});

test('parses SSE data lines into JSON events', () => {
  const found = [];
  const rest = parseSseChunk(`event: message\ndata: ${JSON.stringify({ ok: true })}\n`, (event) =>
    found.push(event),
  );
  assert.deepEqual(found, [{ ok: true }]);
  assert.equal(rest, '');
});

test('reassembles navigation JSON across XHR progress chunks', () => {
  const found = [];
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
  const line = `data: ${JSON.stringify(payload)}\n`;
  const mid = Math.floor(line.length / 2);
  let rest = parseSseChunk(line.slice(0, mid), (event) => found.push(event));
  rest = parseSseChunk(`${rest}${line.slice(mid)}`, (event) => found.push(event));
  assert.equal(found.length, 1);
  assert.equal(extractNavigationFromPayload(found[0])?.destination, 'start-lesson');
  assert.equal(rest, '');
});
