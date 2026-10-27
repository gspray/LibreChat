'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { JSDOM } = require('jsdom');

test('back-link observer does not rewrite an unchanged label', async () => {
  const dom = new JSDOM(
    '<body><a data-testid="back-to-lessoncaddie"><span>Back</span></a></body>',
    {
      url: 'https://chat.ssmlabs.com/c/new',
      runScripts: 'outside-only',
    },
  );
  const { window } = dom;
  const label = window.document.querySelector('span');
  const descriptor = Object.getOwnPropertyDescriptor(window.Node.prototype, 'textContent');
  let writes = 0;
  let observerCallback;
  Object.defineProperty(label, 'textContent', {
    get() {
      return descriptor.get.call(this);
    },
    set(value) {
      writes += 1;
      descriptor.set.call(this, value);
    },
  });
  window.matchMedia = () => ({ matches: false });
  window.setTimeout = () => 0;
  window.MutationObserver = class {
    constructor(callback) {
      observerCallback = callback;
    }
    observe() {}
    disconnect() {}
  };
  window.fetch = async () => ({
    ok: true,
    json: async () => ({
      lessonCaddie: {
        homeUrl: 'https://lessoncaddie.ssmlabs.com/app',
        allowedOrigins: ['https://lessoncaddie.ssmlabs.com'],
      },
    }),
  });

  window.eval(readFileSync(require.resolve('./back-to-lessoncaddie.browser.js'), 'utf8'));
  await new Promise(setImmediate);
  assert.equal(label.textContent, 'LessonCaddie App');
  assert.equal(writes, 1);
  observerCallback();
  observerCallback();
  assert.equal(writes, 1);
  dom.window.close();
});
