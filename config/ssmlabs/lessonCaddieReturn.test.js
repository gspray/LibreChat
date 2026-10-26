'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  sanitizeReturnUrl,
  normalizeAllowedOrigins,
  resolveLessonCaddieConfig,
  resolveReturnTarget,
  readQueryReturnValue,
} = require('./lessonCaddieReturn');

const ORIGIN = 'https://lessoncaddie.ssmlabs.com';
const HOME = `${ORIGIN}/app`;
const ALLOWED = [ORIGIN];

test('accepts an allowlisted LessonCaddie path and query', () => {
  const url = sanitizeReturnUrl(`${ORIGIN}/app/edit-lesson?lessonId=abc`, ALLOWED);
  assert.equal(url, `${ORIGIN}/app/edit-lesson?lessonId=abc`);
});

test('rejects an open redirect off the allowlist', () => {
  assert.equal(sanitizeReturnUrl('https://evil.example/phish', ALLOWED), '');
  assert.equal(sanitizeReturnUrl('javascript:alert(1)', ALLOWED), '');
  assert.equal(sanitizeReturnUrl('https://lessoncaddie.ssmlabs.com.evil.com/app', ALLOWED), '');
  assert.equal(sanitizeReturnUrl('https://user:pass@lessoncaddie.ssmlabs.com/app', ALLOWED), '');
});

test('includes the home origin in the allowlist', () => {
  const origins = normalizeAllowedOrigins('', HOME);
  assert.deepEqual(origins, [ORIGIN]);
});

test('resolveLessonCaddieConfig reads env defaults', () => {
  const config = resolveLessonCaddieConfig({
    LESSONCADDIE_HOME_URL: HOME,
    LESSONCADDIE_ALLOWED_ORIGINS: ORIGIN,
  });
  assert.equal(config.homeUrl, HOME);
  assert.ok(config.allowedOrigins.includes(ORIGIN));
});

test('prefers a safe query return URL over home', () => {
  const target = resolveReturnTarget({
    queryValue: `${ORIGIN}/app/lessons`,
    storedValue: '',
    homeUrl: HOME,
    allowedOrigins: ALLOWED,
  });
  assert.equal(target, `${ORIGIN}/app/lessons`);
});

test('falls back to home when the query is unsafe', () => {
  const target = resolveReturnTarget({
    queryValue: 'https://evil.example/',
    storedValue: '',
    homeUrl: HOME,
    allowedOrigins: ALLOWED,
  });
  assert.equal(target, HOME);
});

test('reads returnUrl from the query string', () => {
  assert.equal(readQueryReturnValue(`?returnUrl=${encodeURIComponent(`${ORIGIN}/app`)}`), `${ORIGIN}/app`);
});
