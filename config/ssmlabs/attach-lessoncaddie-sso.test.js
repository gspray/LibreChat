'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const createSpaFallback = require('../../api/server/utils/fallback');
const { attach } = require('./attach-lessoncaddie-sso');

test('SSO router is mounted before the SPA fallback', () => {
  const previousEnabled = process.env.LESSONCADDIE_SSO_ENABLED;
  const previousSecret = process.env.LESSONCADDIE_SSO_SHARED_SECRET;
  process.env.LESSONCADDIE_SSO_ENABLED = 'true';
  process.env.LESSONCADDIE_SSO_SHARED_SECRET = 'a'.repeat(32);
  try {
    const app = express();
    app.use(createSpaFallback((_req, res) => res.send('SPA')));
    app.use((_error, _req, res, _next) => res.status(500).end());
    const server = http.createServer(app);
    attach(server);
    const routeIndex = app.router.stack.findIndex((layer) =>
      layer.handle.stack?.some((routeLayer) => routeLayer.route?.path === '/start'),
    );
    const fallbackIndex = app.router.stack.findIndex((layer) =>
      String(layer.handle).includes('STATIC_ASSET_EXT.test(req.path)'),
    );
    assert.ok(routeIndex >= 0);
    assert.ok(routeIndex < fallbackIndex);
  } finally {
    if (previousEnabled === undefined) delete process.env.LESSONCADDIE_SSO_ENABLED;
    else process.env.LESSONCADDIE_SSO_ENABLED = previousEnabled;
    if (previousSecret === undefined) delete process.env.LESSONCADDIE_SSO_SHARED_SECRET;
    else process.env.LESSONCADDIE_SSO_SHARED_SECRET = previousSecret;
  }
});
