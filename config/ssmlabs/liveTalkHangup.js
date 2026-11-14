'use strict';

/**
 * GPT-Live hangup policy helpers. Shared by Live Talk overlay tests.
 * Keep the phrase matcher in sync with liveTalk.browser.js.
 */
function liveTalkDeltaText(raw) {
  if (raw == null) return '';
  return String(raw);
}

function appendLiveTalkDelta(buffer, piece) {
  return `${buffer || ''}${liveTalkDeltaText(piece)}`;
}

function formatLiveTalkUtterance(text) {
  let next = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!next) return '';
  next = next.replace(/\s+([.,!?;:])/g, '$1');
  next = next.replace(/([.!?])(\s*)([A-Za-z])/g, '$1 $3');
  next = next.replace(/,([^\s])/g, ', $1');
  return next;
}

function normalizeHeard(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLiveTalkDonePhrase(text) {
  const heard = normalizeHeard(text);
  if (!heard || heard.length > 96) return false;
  if (/\b(don'?t|do not|never) (hang up|go|stop|goodbye|good bye)\b/.test(heard)) return false;
  if (/\bi(?:'m| am) done (with|for)\b/.test(heard)) return false;
  const core = heard
    .replace(/^(ok(?:ay)? |all right |alright |please |thanks? |thank you )+/g, '')
    .replace(/ (please|thanks?|thank you|now)$/g, '')
    .trim();
  if (
    /^(i(?:'m| am) done|that(?:'s| is) (?:all|it)|we(?:'re| are) done|you can (?:hang up|stop|go)|hang up|stop (?:talking|listening)|end (?:talk|the (?:call|session)|live talk)|good ?bye|bye(?: bye)?)$/.test(
      core,
    )
  ) {
    return true;
  }
  return /\b(good ?bye|bye bye|hang up)\b/.test(heard) && heard.split(' ').length <= 12;
}

function isLiveTalkFarewellPhrase(text) {
  const heard = normalizeHeard(text);
  if (!heard || heard.length > 280) return false;
  if (isLiveTalkDonePhrase(heard)) return true;
  if (
    /\b(good ?bye|bye bye|hanging up|i(?:'m| am) hanging up|i(?:'ll| will) let you go)\b/.test(
      heard,
    )
  ) {
    return true;
  }
  return /\b(talk to you later|see you later|take care|have a (good|great) (one|day|night))( now)?$/.test(
    heard,
  );
}

function isSubstantialHeard(text) {
  const words = normalizeHeard(text)
    .split(' ')
    .filter((word) => word && !/^(um+|uh+|er+|ah+|hmm+|mm+|oh|like)$/.test(word));
  return words.join('').length >= 8;
}

function gptLiveHangupCopy(kind, options = {}) {
  const silenceSec = Number(options.silenceSec) > 0 ? Math.round(options.silenceSec) : 20;
  const noiseSec = Number(options.noiseSec) > 0 ? Math.round(options.noiseSec) : 60;
  if (kind === 'done') {
    return {
      say: 'Okay, hanging up.',
      status: 'Goodbye - Disconnected.',
    };
  }
  if (kind === 'farewell') {
    return {
      say: '',
      status: 'Hung up after goodbye.',
    };
  }
  if (kind === 'noise') {
    return {
      say: 'Okay, hanging up. I am not catching words.',
      status: `Hung up after ${noiseSec} seconds of noise without a question.`,
    };
  }
  return {
    say: 'Okay, hanging up. You went quiet.',
    status: `Hung up after ${silenceSec} seconds of silence.`,
  };
}

module.exports = {
  liveTalkDeltaText,
  appendLiveTalkDelta,
  formatLiveTalkUtterance,
  normalizeHeard,
  isLiveTalkDonePhrase,
  isLiveTalkFarewellPhrase,
  isSubstantialHeard,
  gptLiveHangupCopy,
};
