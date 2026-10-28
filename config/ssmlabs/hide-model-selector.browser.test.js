'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('fs');
const { JSDOM } = require('jsdom');

test('embedded Assistant hides LessonCaddie header, back control, and Start Lesson', async () => {
  const dom = new JSDOM(
    `<body>
      <div data-testid="app-pane">
        <header class="shrink-0 border-b"><a data-testid="back-to-lessoncaddie">LessonCaddie</a></header>
        <main><a href="http://127.0.0.1:3021/app?view=start-lesson">Start Lesson</a></main>
      </div>
    </body>`,
    { url: 'https://chat.ssmlabs.com/c/new', runScripts: 'outside-only' },
  );
  const { window } = dom;
  Object.defineProperty(window, 'parent', { value: {} });
  window.fetch = async () => ({ ok: false, json: async () => null });
  window.eval(readFileSync(require.resolve('./hide-model-selector.browser.js'), 'utf8'));
  await new Promise(setImmediate);
  assert.equal(window.document.documentElement.getAttribute('data-lessoncaddie-embedded'), 'true');
  const style = window.getComputedStyle(
    window.document.querySelector('[data-testid="app-pane"] > header'),
  );
  assert.equal(style.display, 'none');
  assert.equal(window.document.querySelector('a[href*="start-lesson"]').style.display, 'none');
  dom.window.close();
});

test('standalone chat keeps LessonCaddie header visible', async () => {
  const dom = new JSDOM(
    `<body>
      <div data-testid="app-pane">
        <header class="shrink-0 border-b">LessonCaddie</header>
      </div>
    </body>`,
    { url: 'https://chat.ssmlabs.com/c/new', runScripts: 'outside-only' },
  );
  const { window } = dom;
  window.fetch = async () => ({ ok: false, json: async () => null });
  window.eval(readFileSync(require.resolve('./hide-model-selector.browser.js'), 'utf8'));
  await new Promise(setImmediate);
  assert.equal(window.document.documentElement.getAttribute('data-lessoncaddie-embedded'), null);
  assert.equal(
    window.document.querySelector('[data-testid="app-pane"] > header').style.display,
    '',
  );
  dom.window.close();
});
