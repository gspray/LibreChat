'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  appendLiveTalkDelta,
  formatLiveTalkUtterance,
  isLiveTalkDonePhrase,
  isLiveTalkFarewellPhrase,
  isSubstantialHeard,
  gptLiveHangupCopy,
} = require('./liveTalkHangup');

test('transcript deltas keep provider spaces', () => {
  let heard = '';
  heard = appendLiveTalkDelta(heard, 'Today');
  heard = appendLiveTalkDelta(heard, ' is');
  heard = appendLiveTalkDelta(heard, ' Saturday');
  assert.equal(heard, 'Today is Saturday');
  heard = '';
  heard = appendLiveTalkDelta(heard, 'Cadd');
  heard = appendLiveTalkDelta(heard, 'ie');
  assert.equal(heard, 'Caddie');
  assert.equal(
    formatLiveTalkUtterance('Morning. How can Lesson Caddie Chat help today?'),
    'Morning. How can Lesson Caddie Chat help today?',
  );
  assert.equal(
    formatLiveTalkUtterance('Today is Saturday,November 14th,2026.'),
    'Today is Saturday, November 14th, 2026.',
  );
});

test('done phrases hang up, longer requests do not', () => {
  assert.equal(isLiveTalkDonePhrase("I'm done"), true);
  assert.equal(isLiveTalkDonePhrase('okay thanks that is all'), true);
  assert.equal(isLiveTalkDonePhrase('hang up'), true);
  assert.equal(isLiveTalkDonePhrase('goodbye'), true);
  assert.equal(isLiveTalkDonePhrase("I'm done with Janet's lesson"), false);
  assert.equal(isLiveTalkDonePhrase('open my calendar'), false);
});

test('assistant goodbye hangs up after the spoken farewell', () => {
  assert.equal(isLiveTalkFarewellPhrase('Okay, goodbye.'), true);
  assert.equal(isLiveTalkFarewellPhrase("I'll let you go. Goodbye"), true);
  assert.equal(isLiveTalkFarewellPhrase('Talk to you later'), true);
  assert.equal(isLiveTalkFarewellPhrase('Opening your calendar now.'), false);
});

test('noise filler is not a useful turn', () => {
  assert.equal(isSubstantialHeard('um uh hmm'), false);
  assert.equal(isSubstantialHeard('open calendar'), true);
});

test('hangup copy names the reason', () => {
  assert.match(gptLiveHangupCopy('silence', { silenceSec: 20 }).status, /20 seconds of silence/);
  assert.match(gptLiveHangupCopy('noise', { noiseSec: 60 }).status, /60 seconds of noise/);
  assert.match(gptLiveHangupCopy('done').status, /you said you were done/);
  assert.match(gptLiveHangupCopy('farewell').status, /after goodbye/);
});
