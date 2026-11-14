'use strict';

/**
 * SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Mounts /sso/lessoncaddie at listen time so we do not fork api/server/index.js.
 * No-op until LESSONCADDIE_SSO_ENABLED=true and the shared secret is set.
 */
const http = require('http');
const { createLessonCaddieSsoRouter } = require('./lessonCaddieSsoRoutes');
const { resolveSsoConfig } = require('./lessonCaddieSso');

const originalListen = http.Server.prototype.listen;

function resolveExpressApp(server) {
  const listeners = server.listeners('request');
  for (const listener of listeners) {
    if (typeof listener === 'function' && typeof listener.use === 'function') {
      return listener;
    }
  }
  return null;
}

function attach(server) {
  if (server.__ssmlabsLessonCaddieSsoAttached) {
    return;
  }
  const app = resolveExpressApp(server);
  if (!app) {
    return;
  }
  const config = resolveSsoConfig();
  if (!config.enabled) {
    return;
  }
  app.use('/sso/lessoncaddie', createLessonCaddieSsoRouter());
  const stack = app.router?.stack;
  const ssoLayer = stack?.pop();
  const fallbackIndex = stack?.findIndex((layer) =>
    String(layer.handle).includes('STATIC_ASSET_EXT.test(req.path)'),
  );
  if (!ssoLayer || fallbackIndex < 0) {
    if (ssoLayer) stack.push(ssoLayer);
    throw new Error('LessonCaddie SSO route must be mounted before the SPA fallback');
  }
  stack.splice(fallbackIndex, 0, ssoLayer);
  server.__ssmlabsLessonCaddieSsoAttached = true;
}

http.Server.prototype.listen = function listenWithLessonCaddieSso(...args) {
  try {
    attach(this);
  } catch (error) {
    console.error('[ssmlabs-lessoncaddie-sso] failed to attach routes', error);
    throw error;
  }
  return originalListen.apply(this, args);
};

module.exports = {
  attach,
};
