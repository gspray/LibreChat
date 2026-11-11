'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const startersSrc = fs.readFileSync(
  path.join(__dirname, 'lessonCaddieConversationStarters.browser.js'),
  'utf8',
);
const themeCss = fs.readFileSync(path.join(__dirname, 'lesson-caddie-theme.css'), 'utf8');

test('conversation starter chip CSS does not require body embed attribute', () => {
  assert.match(themeCss, /\.lc-conversation-starters\s*\{/);
  assert.doesNotMatch(
    themeCss,
    /body\[data-lesson-caddie-embed="true"\] \.lc-conversation-starter-chip/,
  );
});

test('conversation starters overlay hides native band siblings and inserts above form', () => {
  assert.match(startersSrc, /findComposerForm/);
  assert.match(startersSrc, /previousElementSibling/);
  assert.match(startersSrc, /insertStarterHost/);
  assert.match(startersSrc, /band\.insertBefore\(host, form\)/);
});
