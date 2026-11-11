'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  resolveLiveTalkConfig,
  isAllowedLiveTalkTool,
  liveTalkInstructions,
} = require('./liveTalkConfig');

test('Live Talk is on for this Chat branch', () => {
  assert.equal(resolveLiveTalkConfig({}).enabled, true);
});

test('write tools cannot enter the voice allowlist even if listed as reads', () => {
  const config = resolveLiveTalkConfig({
    LIVE_TALK_READ_TOOLS: 'search_directory,create_lesson,get_lesson',
  });
  assert.deepEqual(config.allowlist, ['search_directory', 'get_lesson']);
  assert.equal(isAllowedLiveTalkTool('create_lesson', config), false);
  assert.equal(isAllowedLiveTalkTool('search_directory', config), true);
  assert.equal(isAllowedLiveTalkTool('open_app_screen', config), false);
});

test('voice instructions keep writes out of Live Talk even if the agent prompt is silent', () => {
  assert.match(liveTalkInstructions('Be helpful.'), /not available in Live Talk/i);
});
