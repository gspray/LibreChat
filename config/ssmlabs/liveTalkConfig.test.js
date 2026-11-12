'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  resolveLiveTalkConfig,
  liveTalkToolNames,
  isAllowedLiveTalkTool,
  liveTalkInstructions,
} = require('./liveTalkConfig');

test('Live Talk is on for this Chat branch', () => {
  assert.equal(resolveLiveTalkConfig({}).enabled, true);
  assert.equal(resolveLiveTalkConfig({}).serverName, 'lessoncaddie-instructor');
});

test('voice uses the live MCP catalog, including writes', () => {
  const allowed = liveTalkToolNames([
    { name: 'search_directory' },
    { name: 'create_lesson' },
    { name: 'open_app_screen' },
    { name: '  ' },
  ]);
  assert.equal(isAllowedLiveTalkTool('search_directory', allowed), true);
  assert.equal(isAllowedLiveTalkTool('create_lesson', allowed), true);
  assert.equal(isAllowedLiveTalkTool('open_app_screen', allowed), true);
  assert.equal(isAllowedLiveTalkTool('delete_student', allowed), false);
  assert.equal(isAllowedLiveTalkTool('create_lesson'), false);
});

test('voice instructions keep typed Ask confirmation rules without blocking writes', () => {
  const text = liveTalkInstructions('Be helpful.');
  assert.match(text, /same LessonCaddie tools as typed Ask/i);
  assert.match(text, /speak a clear approval/i);
  assert.doesNotMatch(text, /not available in Live Talk/i);
});
