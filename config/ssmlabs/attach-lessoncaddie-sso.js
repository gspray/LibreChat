'use strict';

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
  server.__ssmlabsLessonCaddieSsoAttached = true;
  const config = resolveSsoConfig();
  if (!config.enabled) {
    return;
  }
  app.use('/sso/lessoncaddie', createLessonCaddieSsoRouter());
}

http.Server.prototype.listen = function listenWithLessonCaddieSso(...args) {
  try {
    attach(this);
  } catch (error) {
    console.error('[ssmlabs-lessoncaddie-sso] failed to attach routes', error);
  }
  return originalListen.apply(this, args);
};

module.exports = {
  attach,
};
