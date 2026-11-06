'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  extractNavigationFromPayload,
  extractRecoveryFromPayload,
  handleDeepLinkClick,
  hideResolvedDeepLinks,
  install,
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

test('extracts safe recovery controls from a failed write payload', () => {
  const recovery = {
    type: 'lessoncaddie.recovery',
    version: 1,
    toolName: 'create_playbook_system',
    category: 'permission',
    message: 'Chat cannot save this change right now.',
    keptDetails: { title: 'Start line', drills: ['Gate drill'] },
    retry: { enabled: true, sameArguments: false },
    review: { enabled: true },
    fallback: {
      destination: 'new-playbook-system',
      params: { title: 'Start line', drills: '["Gate drill"]' },
    },
  };
  const payload = {
    event: 'on_run_step_completed',
    data: {
      result: {
        tool_call: {
          output: JSON.stringify({
            isError: true,
            structuredContent: { recovery },
          }),
        },
      },
    },
  };
  const extracted = extractRecoveryFromPayload(payload);
  assert.equal(extracted.category, 'permission');
  assert.equal(extracted.retry.enabled, true);
  assert.equal(extracted.retry.sameArguments, false);
  assert.deepEqual(extracted.keptDetails.drills, ['Gate drill']);
  assert.equal(extracted.fallback.destination, 'new-playbook-system');
  assert.equal(extracted.fallback.params.title, 'Start line');
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

test('a help overview does not navigate until its link is clicked', () => {
  const sent = [];
  const browser = {
    location: {
      href: 'https://chat.ssmlabs.com/chat/c/new?lcHelp=1&q=What%20can%20I%20do%20from%20the%20Students%20page%3F',
    },
    document: {
      referrer: 'https://lessoncaddie.ssmlabs.com/app',
      addEventListener() {},
      querySelector() {
        return null;
      },
    },
    parent: { postMessage: (message) => sent.push(message) },
    addEventListener() {},
    setTimeout() {
      return 1;
    },
  };
  install(browser);
  assert.equal(
    browser.LessonCaddieNavigationOverlay.onPayload({
      content: [
        {
          text: JSON.stringify({
            ...RESULT,
            destination: 'student-list',
            requestId: 'req-help-1',
          }),
        },
      ],
    }),
    true,
  );
  assert.equal(
    sent.some((message) => message && message.type === 'navigate'),
    false,
  );
});

test('leaves answer links inert until the user clicks them', () => {
  const payload = {
    content: [
      {
        type: 'text',
        text: [
          'Students',
          '[Take me there](https://lessoncaddie.ssmlabs.com/app?panel=directory&lc_nav=1)',
          'Calendar',
          '[Take me there](https://lessoncaddie.ssmlabs.com/app?panel=calendar&lc_nav=1)',
        ].join('\n'),
      },
    ],
  };
  assert.equal(extractNavigationFromPayload(payload), null);
  assert.equal(
    resultFromHref(null, 'https://lessoncaddie.ssmlabs.com/app?panel=directory&lc_nav=1')
      ?.destination,
    'student-list',
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

test('keeps the Open Lesson fallback visible after embedded navigation succeeds', () => {
  const anchor = {
    href: 'https://lessoncaddie.ssmlabs.com/app/edit-lesson?lessonId=lesson-1',
    hidden: false,
    setAttribute() {},
  };
  const windowObject = {
    document: { querySelectorAll: () => [anchor] },
  };
  hideResolvedDeepLinks(windowObject, {
    destination: 'lesson-detail',
    deepLink: anchor.href,
  });
  assert.equal(anchor.hidden, false);
});

test('opens a named student page directly from standalone Chat', () => {
  const opened = [];
  const browser = {
    location: { assign: (href) => opened.push(href) },
    addEventListener() {},
  };
  browser.parent = browser;
  install(browser);
  const result = {
    ...RESULT,
    destination: 'student-detail',
    params: { contactId: 'contact-1' },
    deepLink: 'https://lessoncaddie.ssmlabs.com/app/contact-edit?lc_nav=1&contactId=contact-1',
  };
  assert.equal(
    browser.LessonCaddieNavigationOverlay.onPayload({
      content: [{ text: JSON.stringify(result) }],
    }),
    true,
  );
  assert.deepEqual(opened, [result.deepLink]);
});

test('opens a named student page when the embedded app does not acknowledge navigation', () => {
  const opened = [];
  const timers = [];
  const browser = {
    location: {},
    document: { referrer: 'https://lessoncaddie.ssmlabs.com/app' },
    parent: { postMessage() {} },
    top: { location: { assign: (href) => opened.push(href) } },
    addEventListener() {},
    setTimeout(callback) {
      timers.push(callback);
      return timers.length;
    },
  };
  install(browser);
  const result = {
    ...RESULT,
    destination: 'student-detail',
    params: { contactId: 'contact-1' },
    deepLink: 'https://lessoncaddie.ssmlabs.com/app/contact-edit?lc_nav=1&contactId=contact-1',
  };
  assert.equal(
    browser.LessonCaddieNavigationOverlay.onPayload({
      content: [{ text: JSON.stringify(result) }],
    }),
    true,
  );
  assert.equal(opened.length, 0);
  timers.at(-1)();
  assert.deepEqual(opened, [result.deepLink]);
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

  const destinations = [
    ['https://lessoncaddie.ssmlabs.com/app?panel=calendar&lc_nav=1', 'calendar'],
    ['https://lessoncaddie.ssmlabs.com/app?panel=library&lc_nav=1', 'library'],
    ['https://lessoncaddie.ssmlabs.com/app/notices', 'notices'],
    ['https://lessoncaddie.ssmlabs.com/app/profile/billing', 'billing'],
    ['https://lessoncaddie.ssmlabs.com/app/settings/payment-setup', 'payment-setup'],
    ['https://lessoncaddie.ssmlabs.com/app?panel=practices&lc_nav=1', 'practices'],
    ['https://lessoncaddie.ssmlabs.com/app?panel=play&lc_nav=1', 'play'],
    ['https://lessoncaddie.ssmlabs.com/app?panel=goals&lc_nav=1', 'goals'],
  ];
  destinations.forEach(([href, destination]) => {
    const result = click(href);
    assert.equal(result.handled, true);
    assert.equal(sent.at(-1)[0].destination, destination);
  });
});

test('New Chat links keep the Chat subdirectory and reach the native click handler', () => {
  const anchor = { href: 'https://lessoncaddie.ssmlabs.com/c/new' };
  const windowObject = {
    location: { href: 'https://lessoncaddie.ssmlabs.com/chat/c/old' },
    document: { querySelector: () => ({ getAttribute: () => '/chat/' }) },
    parent: {},
  };
  const event = {
    target: { closest: () => anchor },
    preventDefault() {
      this.prevented = true;
    },
    stopPropagation() {
      this.stopped = true;
    },
  };
  const handled = handleDeepLinkClick(windowObject, { appNavigationBridge: true }, event);
  assert.equal(handled, false);
  assert.equal(anchor.href, 'https://lessoncaddie.ssmlabs.com/chat/c/new');
  assert.equal(event.prevented, undefined);
  assert.equal(event.stopped, undefined);
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
