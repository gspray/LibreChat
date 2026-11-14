'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync(path.join(__dirname, 'hide-agent-owner-contact.browser.js'), 'utf8');

test('hides Greg Spray contact rows on initial and later agent views', async () => {
  const dom = new JSDOM(
    '<div class="text-text-secondary flex min-w-0 items-center gap-1"><span>Contact:</span><span>Greg Spray</span></div>' +
      '<div class="text-text-secondary flex min-w-0 items-center gap-1"><span>Contact:</span><span>Support Team</span></div>',
    { runScripts: 'outside-only' },
  );
  const { document } = dom.window;
  await new Promise((resolve) =>
    document.addEventListener('DOMContentLoaded', resolve, { once: true }),
  );
  dom.window.eval(script);

  const [owner, support] = document.querySelectorAll('div');
  assert.equal(owner.style.display, 'none');
  assert.equal(owner.getAttribute('aria-hidden'), 'true');
  assert.equal(support.style.display, '');

  const later = document.createElement('div');
  later.className = 'text-text-secondary flex min-w-0 items-center gap-1';
  later.innerHTML = '<span>Greg Spray</span>';
  document.body.append(later);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(later.style.display, 'none');
});
