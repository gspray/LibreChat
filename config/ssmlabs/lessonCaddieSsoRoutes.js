'use strict';

const express = require('express');
const crypto = require('node:crypto');
const {
  resolveSsoConfig,
  sanitizeAppReturnTo,
  buildLessonCaddieStartUrl,
  ssoBrowserStateAllowsCallback,
  mapIdentityError,
  resolveLibreChatUser,
  redeemWithLessonCaddie,
} = require('./lessonCaddieSso.js');

function createLessonCaddieSsoRouter(deps = {}) {
  const router = express.Router();
  const loadConfig = deps.resolveSsoConfig || resolveSsoConfig;
  const redeem = deps.redeemWithLessonCaddie || redeemWithLessonCaddie;
  const resolveUser = deps.resolveLibreChatUser || resolveLibreChatUser;
  const getModels = deps.getModels || (() => require('~/models'));
  const getAuthService = deps.getAuthService || (() => require('~/server/services/AuthService'));
  const logger = deps.logger || console;
  const chatOrigin = () => new URL(process.env.DOMAIN_CLIENT || 'https://chat.ssmlabs.com').origin;

  router.get('/start', (req, res) => {
    const config = loadConfig();
    if (!config.enabled) {
      res.status(503).send('LessonCaddie SSO is not enabled.');
      return;
    }
    const returnTo = sanitizeAppReturnTo(
      req.query.returnTo || req.query.redirect_uri,
      [chatOrigin()],
      '/c/new',
    );
    const state = crypto.randomBytes(24).toString('base64url');
    res.cookie('lc_sso_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 300000,
    });
    res.redirect(302, buildLessonCaddieStartUrl(config, returnTo, state));
  });

  router.get('/callback', async (req, res) => {
    const config = loadConfig();
    if (!config.enabled) {
      res.status(503).send('LessonCaddie SSO is not enabled.');
      return;
    }
    const origin = chatOrigin();
    const returnTo = sanitizeAppReturnTo(req.query.returnTo, [origin], '/c/new');
    const state = String(req.query.state || '');
    const cookieState = String(req.cookies?.lc_sso_state || '');
    res.clearCookie('lc_sso_state');
    if (!ssoBrowserStateAllowsCallback(state, cookieState)) {
      res.status(401).send('Chat sign-in expired. Please start again from LessonCaddie.');
      return;
    }
    try {
      const identity = await redeem(config, {
        code: req.query.code,
        state: req.query.state,
        origin,
      });
      const models = getModels();
      const user = await resolveUser(identity, models);
      if (String(user?.role || '').toUpperCase() === 'ADMIN') {
        // Preserve existing administrator role; never grant ADMIN from LessonCaddie instructor.
      }
      const { setAuthTokens } = getAuthService();
      await setAuthTokens(user._id || user.id, res, null, req);
      res.redirect(302, returnTo.startsWith('/') ? returnTo : returnTo);
    } catch (error) {
      logger.error('[ssmlabs-lessoncaddie-sso] callback failed', error?.code || error?.message);
      const mapped = mapIdentityError(error?.code);
      if (
        error?.code === 'LINK_REQUIRED' ||
        error?.code === 'LINK_MISSING' ||
        error?.code === 'LINK_CONFLICT'
      ) {
        res.status(mapped.status).send(mapped.message);
        return;
      }
      if (Number(error?.status) >= 500) {
        res.status(502).send('LibreChat could not complete LessonCaddie sign-in.');
        return;
      }
      res.status(401).send('Chat sign-in failed. Please start again from LessonCaddie.');
    }
  });

  router.get('/logout', async (req, res) => {
    const config = loadConfig();
    try {
      const { logoutUser } = getAuthService();
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        await logoutUser(req, refreshToken);
      }
    } catch (error) {
      logger.error('[ssmlabs-lessoncaddie-sso] logout failed', error?.message);
    }
    res.clearCookie('refreshToken');
    res.clearCookie('token_provider');
    const returnTo = sanitizeAppReturnTo(
      req.query.returnTo,
      loadConfig().allowedReturnOrigins,
      config.homeUrl,
    );
    if (returnTo === 'about:blank') {
      res
        .status(200)
        .type('html')
        .send('<!doctype html><title>Signed out</title><script>window.close()</script>');
      return;
    }
    res.redirect(302, returnTo || config.homeUrl);
  });

  return router;
}

module.exports = {
  createLessonCaddieSsoRouter,
};
