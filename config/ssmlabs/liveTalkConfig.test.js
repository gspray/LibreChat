'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  resolveLiveTalkConfig,
  isAllowedLiveTalkTool,
  voiceTrialInstructions,
} = require('./liveTalkConfig');

test('Live Talk stays disabled unless the trial flag is an explicit true value', () => {
  assert.equal(resolveLiveTalkConfig({}).enabled, false);
  assert.equal(resolveLiveTalkConfig({ LIVE_TALK_TRIAL: 'false' }).enabled, false);
  assert.equal(resolveLiveTalkConfig({ LIVE_TALK_TRIAL: 'true' }).enabled, true);
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

test('voice instructions keep writes out of the trial even if the agent prompt is silent', () => {
  assert.match(voiceTrialInstructions('Be helpful.'), /unavailable in the voice trial/i);
});
