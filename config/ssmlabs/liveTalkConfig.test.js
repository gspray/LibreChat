'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  resolveLiveTalkConfig,
  resolveLiveTalkPack,
  applyLiveTalkPack,
  applyLiveVoiceToConfig,
  liveTalkTurnDetection,
  liveTalkToolNames,
  isAllowedLiveTalkTool,
  liveTalkInstructions,
} = require('./liveTalkConfig');

test('Live Talk is on for this Chat branch', () => {
  assert.equal(resolveLiveTalkConfig({}).enabled, true);
  assert.equal(resolveLiveTalkConfig({}).serverName, 'lessoncaddie-instructor');
});

test('user Live Voice settings override VAD patience', () => {
  const fast = applyLiveVoiceToConfig(resolveLiveTalkConfig({}), {
    waitForYou: 'fast',
    allowInterrupt: true,
    ignoreBackgroundNoise: false,
    muteMicWhileSheTalks: false,
    voice: 'cedar',
  });
  assert.equal(fast.vadType, 'server_vad');
  assert.equal(fast.interruptResponse, true);
  assert.equal(fast.holdInput, false);
  assert.equal(fast.voice, 'cedar');
  assert.equal(liveTalkTurnDetection(fast).interrupt_response, true);
});

test('Live Talk waits out noise instead of barging in', () => {
  const defaults = liveTalkTurnDetection(resolveLiveTalkConfig({}));
  assert.deepEqual(defaults, {
    type: 'semantic_vad',
    eagerness: 'medium',
    create_response: true,
    interrupt_response: false,
  });
  const serverVad = liveTalkTurnDetection(
    resolveLiveTalkConfig({
      LIVE_TALK_VAD_TYPE: 'server_vad',
      LIVE_TALK_VAD_THRESHOLD: '0.8',
      LIVE_TALK_VAD_SILENCE_MS: '1200',
    }),
  );
  assert.equal(serverVad.type, 'server_vad');
  assert.equal(serverVad.threshold, 0.8);
  assert.equal(serverVad.silence_duration_ms, 1200);
  assert.equal(serverVad.interrupt_response, false);
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
  assert.match(text, /spoken form of Instructor Assistant/i);
  assert.match(text, /speak a clear approval/i);
  assert.match(text, /Always speak American English/i);
  assert.doesNotMatch(text, /not available in Live Talk/i);
});

test('student Live Talk pack uses student MCP and Student Caddie copy', () => {
  const pack = resolveLiveTalkPack({ spec: 'student-caddie' });
  assert.equal(pack.id, 'student');
  assert.equal(pack.serverName, 'lessoncaddie-student');
  assert.equal(pack.agentId, 'agent_student_caddie');
  const config = applyLiveTalkPack(resolveLiveTalkConfig({}), pack);
  assert.equal(config.serverName, 'lessoncaddie-student');
  const text = liveTalkInstructions('Be a student caddie.', pack);
  assert.match(text, /spoken form of Student Caddie/i);
  assert.match(text, /student LessonCaddie tools/i);
  assert.match(text, /do not introduce yourself/i);
  assert.doesNotMatch(text, /search_directory/);
});

test('session start does not auto-create a spoken turn', () => {
  const detection = liveTalkTurnDetection(resolveLiveTalkConfig({}), { createResponse: false });
  assert.equal(detection.create_response, false);
});

test('shell spec wins over a leftover conversation agent', () => {
  const pack = resolveLiveTalkPack({
    spec: 'instructor-assistant',
    agentId: 'agent_student_caddie',
  });
  assert.equal(pack.id, 'instructor');
  assert.equal(
    resolveLiveTalkPack({
      spec: 'student-caddie',
      agentId: 'agent_instructor_assistant',
    }).id,
    'student',
  );
});
