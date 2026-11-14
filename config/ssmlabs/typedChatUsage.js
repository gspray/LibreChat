'use strict';

const crypto = require('node:crypto');

/** Save one cumulative usage snapshot per typed Chat interaction. */
async function saveTypedChatUsage({ user, responseMessageId, jobCreatedAt, usageEvents, usage }) {
  const firebaseUid = String(user?.openidId || '').trim();
  const secret = String(process.env.LESSONCADDIE_SSO_SHARED_SECRET || '').trim();
  if (user?.provider !== 'lessoncaddie' || !firebaseUid || secret.length < 32) return;
  if (!responseMessageId || !Array.isArray(usageEvents) || !usageEvents.length || !usage) return;

  const homeUrl = new URL(
    process.env.LESSONCADDIE_HOME_URL || 'https://lessoncaddie.ssmlabs.com/app',
  );
  if (homeUrl.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(homeUrl.hostname)) {
    throw new Error('Typed Chat usage endpoint requires HTTPS');
  }
  const url = new URL('/api/user/typed-chat-turns', homeUrl);
  const inputTokens = Math.max(0, Math.round(usage.input + usage.cacheRead + usage.cacheWrite));
  const outputTokens = Math.max(0, Math.round(usage.output));
  const cachedTokens = Math.max(0, Math.round(usage.cacheRead));
  const turnId = crypto
    .createHash('sha256')
    .update(`${responseMessageId}:${jobCreatedAt ?? ''}`)
    .digest('hex');
  const startedAt = Number(jobCreatedAt);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-LessonCaddie-Sso-Secret': secret,
      'X-LibreChat-Firebase-Uid': firebaseUid,
      'X-LibreChat-User-Provider': 'lessoncaddie',
    },
    body: JSON.stringify({
      turnId,
      createdAt: Number.isSafeInteger(startedAt) && startedAt > 0 ? startedAt : Date.now(),
      inputTokens,
      outputTokens,
      cachedTokens,
      modelCalls: usageEvents.length,
    }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Typed Chat usage write returned ${response.status}`);
}

module.exports = { saveTypedChatUsage };
