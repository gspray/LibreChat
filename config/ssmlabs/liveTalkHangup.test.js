'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isLiveTalkDonePhrase, isSubstantialHeard, gptLiveHangupCopy } = require('./liveTalkHangup');

test('done phrases hang up, longer requests do not', () => {
  assert.equal(isLiveTalkDonePhrase("I'm done"), true);
  assert.equal(isLiveTalkDonePhrase('okay thanks that is all'), true);
  assert.equal(isLiveTalkDonePhrase('hang up'), true);
  assert.equal(isLiveTalkDonePhrase('goodbye'), true);
  assert.equal(isLiveTalkDonePhrase("I'm done with Janet's lesson"), false);
  assert.equal(isLiveTalkDonePhrase('open my calendar'), false);
});

test('noise filler is not a useful turn', () => {
  assert.equal(isSubstantialHeard('um uh hmm'), false);
  assert.equal(isSubstantialHeard('open calendar'), true);
});

test('hangup copy names the reason', () => {
  assert.match(gptLiveHangupCopy('silence', { silenceSec: 20 }).status, /20 seconds of silence/);
  assert.match(gptLiveHangupCopy('noise', { noiseSec: 60 }).status, /60 seconds of noise/);
  assert.match(gptLiveHangupCopy('done').status, /you said you were done/);
});
