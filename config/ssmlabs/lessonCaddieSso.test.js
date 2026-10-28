'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const { createLessonCaddieSsoRouter } = require('./lessonCaddieSsoRoutes');
const {
  resolveSsoConfig,
  sanitizeAppReturnTo,
  buildLessonCaddieStartUrl,
  ssoBrowserStateAllowsCallback,
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
    sanitizeAppReturnTo(
      'https://evil.example/phish',
      allowed,
      'https://lessoncaddie.ssmlabs.com/app',
    ),
    'https://lessoncaddie.ssmlabs.com/app',
  );
  assert.equal(sanitizeAppReturnTo('/c/new', allowed, '/c/new'), '/c/new');
});

test('start URL sends the user through LessonCaddie with a return path', () => {
  const url = new URL(
    buildLessonCaddieStartUrl(
      {
        homeUrl: 'https://lessoncaddie.ssmlabs.com/app',
      },
      '/c/new',
      'browser-state',
    ),
  );
  assert.equal(url.origin, 'https://lessoncaddie.ssmlabs.com');
  assert.equal(url.searchParams.get('librechatSsoReturn'), '/c/new');
  assert.equal(url.searchParams.get('librechatSsoState'), 'browser-state');
});

test('iframe callback may omit the /start cookie; mismatched cookies are still rejected', () => {
  assert.equal(ssoBrowserStateAllowsCallback('', ''), false);
  assert.equal(ssoBrowserStateAllowsCallback('issued-state-token-aaaaaaaa', ''), true);
  assert.equal(
    ssoBrowserStateAllowsCallback('issued-state-token-aaaaaaaa', 'issued-state-token-aaaaaaaa'),
    true,
  );
  assert.equal(
    ssoBrowserStateAllowsCallback('issued-state-token-aaaaaaaa', 'other-state-token-bbbbbbbbb'),
    false,
  );
});

test('callback replaces the chat session only with matching browser state', async () => {
  const app = express();
  app.use((req, _res, next) => {
    req.cookies = { lc_sso_state: String(req.headers.cookie || '').split('=')[1] || '' };
    next();
  });
  let redeemed = 0;
  let signedInUser = '';
  app.use(
    '/sso/lessoncaddie',
    createLessonCaddieSsoRouter({
      resolveSsoConfig: () => ({ enabled: true, homeUrl: 'https://lessoncaddie.ssmlabs.com/app' }),
      redeemWithLessonCaddie: async () => {
        redeemed += 1;
        return { firebaseUid: 'switched-user', email: 'switched@example.com' };
      },
      resolveLibreChatUser: async () => ({ _id: 'chat-switched-user' }),
      getModels: () => ({}),
      getAuthService: () => ({
        setAuthTokens: async (uid) => {
          signedInUser = uid;
        },
      }),
    }),
  );
  const mismatched = await request(app)
    .get('/sso/lessoncaddie/callback?code=code&state=other')
    .set('Cookie', 'lc_sso_state=browser-state');
  assert.equal(mismatched.status, 401);
  assert.equal(redeemed, 0);
  const valid = await request(app)
    .get('/sso/lessoncaddie/callback?code=code&state=browser-state&returnTo=%2Fc%2Fnew')
    .set('Cookie', 'lc_sso_state=browser-state');
  assert.equal(valid.status, 302);
  assert.equal(valid.headers.location, '/c/new');
  assert.equal(redeemed, 1);
  assert.equal(signedInUser, 'chat-switched-user');
});

test('callback without lc_sso_state cookie redeems the LessonCaddie handoff', async () => {
  const app = express();
  app.use((req, _res, next) => {
    req.cookies = {};
    next();
  });
  let redeemed = 0;
  app.use(
    '/sso/lessoncaddie',
    createLessonCaddieSsoRouter({
      resolveSsoConfig: () => ({ enabled: true, homeUrl: 'https://lessoncaddie.ssmlabs.com/app' }),
      redeemWithLessonCaddie: async (_config, payload) => {
        redeemed += 1;
        assert.equal(payload.code, 'iframe-code');
        assert.equal(payload.state, 'iframe-state-token-aaaaaaaaaa');
        return { firebaseUid: 'instructor-1', email: 'instructor@example.com' };
      },
      resolveLibreChatUser: async () => ({ _id: 'chat-instructor-1' }),
      getModels: () => ({}),
      getAuthService: () => ({
        setAuthTokens: async () => {},
      }),
    }),
  );
  const response = await request(app).get(
    '/sso/lessoncaddie/callback?code=iframe-code&state=iframe-state-token-aaaaaaaaaa&returnTo=%2Fc%2Fnew',
  );
  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/c/new');
  assert.equal(redeemed, 1);
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
  const user = await resolveLibreChatUser(
    { firebaseUid: 'fb-2', email: 'new@example.com' },
    createModels,
  );
  assert.equal(user._id, 'lc-new');
});

test('stale explicit links fail closed instead of creating a second account', async () => {
  const models = {
    async findUser(query) {
      if (query.provider === 'lessoncaddie' || query._id) {
        return null;
      }
      return null;
    },
    async updateUser() {
      throw new Error('should not update a missing link');
    },
    async createUserIfAbsent() {
      throw new Error('should not create when an explicit link is missing');
    },
  };
  await assert.rejects(
    () =>
      resolveLibreChatUser(
        {
          firebaseUid: 'fb-stale',
          email: 'stale@example.com',
          linkedLibreChatUserId: 'missing-chat-user',
        },
        models,
      ),
    (error) => error.code === 'LINK_MISSING',
  );
});

test('explicit links refuse to overwrite a different Firebase UID', async () => {
  const models = {
    async findUser(query) {
      if (query.provider === 'lessoncaddie') {
        return null;
      }
      if (String(query._id) === 'lc-taken') {
        return { _id: 'lc-taken', openidId: 'other-uid', provider: 'lessoncaddie', role: 'USER' };
      }
      return null;
    },
    async updateUser() {
      throw new Error('should not steal an existing mapping');
    },
    async createUserIfAbsent() {
      throw new Error('should not create');
    },
  };
  await assert.rejects(
    () =>
      resolveLibreChatUser(
        {
          firebaseUid: 'fb-new',
          email: 'new@example.com',
          linkedLibreChatUserId: 'lc-taken',
        },
        models,
      ),
    (error) => error.code === 'LINK_CONFLICT',
  );
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
  const user = await resolveLibreChatUser(
    {
      firebaseUid: 'fb-admin',
      email: 'admin@example.com',
      linkedLibreChatUserId: 'lc-admin',
    },
    models,
  );
  assert.equal(user.role, 'ADMIN');
  assert.equal(user.openidId, 'fb-admin');
});
