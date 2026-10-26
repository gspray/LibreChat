'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  resolveSsoConfig,
  sanitizeAppReturnTo,
  buildLessonCaddieStartUrl,
  resolveLibreChatUser,
} = require('./lessonCaddieSso');

test('SSO config stays disabled until secret, issuer, and flag are set', () => {
  const config = resolveSsoConfig({
    LESSONCADDIE_SSO_ENABLED: 'true',
    LESSONCADDIE_HOME_URL: 'https://lessoncaddie.ssmlabs.com/app',
  });
  assert.equal(config.enabled, false);
});

test('return paths off LessonCaddie origins are rejected', () => {
  const allowed = ['https://lessoncaddie.ssmlabs.com'];
  assert.equal(
    sanitizeAppReturnTo('https://evil.example/phish', allowed, 'https://lessoncaddie.ssmlabs.com/app'),
    'https://lessoncaddie.ssmlabs.com/app',
  );
  assert.equal(sanitizeAppReturnTo('/c/new', allowed, '/c/new'), '/c/new');
});

test('start URL sends the user through LessonCaddie with a return path', () => {
  const url = new URL(buildLessonCaddieStartUrl({
    homeUrl: 'https://lessoncaddie.ssmlabs.com/app',
  }, '/c/new'));
  assert.equal(url.origin, 'https://lessoncaddie.ssmlabs.com');
  assert.equal(url.searchParams.get('librechatSsoReturn'), '/c/new');
});

test('resolveLibreChatUser creates on first login and does not merge by email', async () => {
  const created = { _id: 'lc-new', provider: 'lessoncaddie', openidId: 'fb-1', role: 'USER' };
  const models = {
    async findUser(query) {
      if (query.provider === 'lessoncaddie' && query.openidId === 'fb-1') {
        return null;
      }
      if (query.email === 'greg@example.com') {
        return { _id: 'lc-old', email: 'greg@example.com', provider: 'local', role: 'ADMIN' };
      }
      return null;
    },
    async updateUser() {
      throw new Error('should not update on email collision');
    },
    async createUserIfAbsent() {
      return { ok: false, error: { code: 'user_exists' } };
    },
  };
  await assert.rejects(
    () => resolveLibreChatUser({ firebaseUid: 'fb-1', email: 'greg@example.com' }, models),
    (error) => error.code === 'LINK_REQUIRED',
  );

  const createModels = {
    async findUser(query) {
      if (query.provider === 'lessoncaddie') {
        return null;
      }
      return null;
    },
    async updateUser() {},
    async createUserIfAbsent(data) {
      assert.equal(data.role, 'USER');
      assert.equal(data.provider, 'lessoncaddie');
      assert.equal(data.openidId, 'fb-2');
      return { ok: true, value: created };
    },
  };
  const user = await resolveLibreChatUser({ firebaseUid: 'fb-2', email: 'new@example.com' }, createModels);
  assert.equal(user._id, 'lc-new');
});

test('explicit link maps an existing LibreChat user without changing ADMIN', async () => {
  const adminUser = { _id: 'lc-admin', role: 'ADMIN', email: 'admin@example.com' };
  const models = {
    async findUser(query) {
      if (query.provider === 'lessoncaddie') {
        return null;
      }
      if (String(query._id) === 'lc-admin') {
        return adminUser;
      }
      return null;
    },
    async updateUser(id, fields) {
      assert.equal(String(id), 'lc-admin');
      assert.equal(fields.provider, 'lessoncaddie');
      assert.equal(fields.openidId, 'fb-admin');
      Object.assign(adminUser, fields);
    },
    async createUserIfAbsent() {
      throw new Error('should not create');
    },
  };
  const user = await resolveLibreChatUser({
    firebaseUid: 'fb-admin',
    email: 'admin@example.com',
    linkedLibreChatUserId: 'lc-admin',
  }, models);
  assert.equal(user.role, 'ADMIN');
  assert.equal(user.openidId, 'fb-admin');
});
