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
  const next = liveTalkDeltaText(piece);
  if (!next) return buffer || '';
  const prev = buffer || '';
  if (!prev) return next;
  if (/^\s/.test(next) || /\s$/.test(prev)) return `${prev}${next}`;
  if (/[A-Za-z0-9']$/.test(prev) && /^[A-Za-z0-9']/.test(next)) return `${prev} ${next}`;
  if (/[.,!?;:]$/.test(prev) && /^[A-Za-z0-9']/.test(next)) return `${prev} ${next}`;
  return `${prev}${next}`;
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
  if (!heard || heard.length > 72) return false;
  return /^(ok(?:ay)? |all right |alright )?(thanks? |thank you )?(i(?:'m| am) done|that(?:'s| is) (?:all|it)|we(?:'re| are) done|you can (?:hang up|stop|go)|hang up|stop (?:talking|listening)|end (?:talk|the (?:call|session)|live talk)|good ?bye|bye(?: bye)?)( now| please)?$/.test(
    heard,
  );
}

function isLiveTalkFarewellPhrase(text) {
  const heard = normalizeHeard(text);
  if (!heard || heard.length > 240) return false;
  if (isLiveTalkDonePhrase(heard)) return true;
  return /(^| )((ok(?:ay)?|alright|all right) )?(thanks? |thank you )?(good ?bye|bye bye|talk to you later|see you later|have a (good|great) (one|day|night)|take care|i(?:'ll| will) let you go|hanging up)( now)?$/.test(
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
      status: 'Hung up because you said you were done.',
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
  normalizeHeard,
  isLiveTalkDonePhrase,
  isLiveTalkFarewellPhrase,
  isSubstantialHeard,
  gptLiveHangupCopy,
};
