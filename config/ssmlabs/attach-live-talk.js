'use strict';

/**
 * SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Mounts /live-talk at listen time so api/server/index.js stays upstream.
 */
const http = require('http');
const { createLiveTalkRouter } = require('./liveTalkRoutes');
const { resolveLiveTalkConfig } = require('./liveTalkConfig');

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

function createBoundRouter() {
  const { requireJwtAuth } = require('~/server/middleware');
  const {
    getConvo,
    getAgent,
    saveMessage,
    findToken,
    createToken,
    updateToken,
    deleteTokens,
  } = require('~/models');
  const { getMCPManager, getFlowStateManager } = require('~/config');
  const { getLogStores } = require('~/cache');
  const { CacheKeys } = require('librechat-data-provider');

  async function listMcpTools({ user, conversationId, config }) {
    try {
      const mcpManager = getMCPManager();
      const flowManager = getFlowStateManager(getLogStores(CacheKeys.FLOWS));
      const tokenMethods = { findToken, createToken, updateToken, deleteTokens };
      const connection = await mcpManager.getConnection({
        user,
        serverName: config.serverName,
        flowManager,
        tokenMethods,
        requestBody: { conversationId },
      });
      const listed = await connection.listTools?.();
      const tools = listed?.tools || listed || [];
      if (Array.isArray(tools) && tools.length) {
        return tools;
      }
    } catch (error) {
      console.warn(
        '[ssmlabs-live-talk] MCP tool list failed, using allowlist schemas',
        error.message,
      );
    }
    return config.allowlist.map((name) => ({
      name,
      description: `Read-only LessonCaddie tool ${name}`,
      inputSchema: { type: 'object', additionalProperties: true },
    }));
  }

  async function callMcpTool({ user, serverName, toolName, toolArguments, conversationId }) {
    const mcpManager = getMCPManager();
    const flowManager = getFlowStateManager(getLogStores(CacheKeys.FLOWS));
    const tokenMethods = { findToken, createToken, updateToken, deleteTokens };
    const result = await mcpManager.callTool({
      user,
      serverName,
      toolName,
      provider: 'openAI',
      toolArguments,
      flowManager,
      tokenMethods,
      requestBody: { conversationId },
    });
    const text = Array.isArray(result) ? result[0] : result;
    if (typeof text === 'string') {
      try {
        return JSON.parse(text);
      } catch {
        return { text };
      }
    }
    return text ?? null;
  }

  const router = require('express').Router();
  router.use(requireJwtAuth);
  router.use(
    createLiveTalkRouter({
      getConvo,
      getAgent,
      saveMessage,
      listMcpTools,
      callMcpTool,
    }),
  );
  return router;
}

function attach(server) {
  if (server.__ssmlabsLiveTalkAttached) {
    return;
  }
  const app = resolveExpressApp(server);
  if (!app) {
    return;
  }
  app.use('/live-talk', createBoundRouter());
  const stack = app.router?.stack;
  const liveTalkLayer = stack?.pop();
  const fallbackIndex = stack?.findIndex((layer) =>
    String(layer.handle).includes('STATIC_ASSET_EXT.test(req.path)'),
  );
  if (!liveTalkLayer) {
    return;
  }
  if (fallbackIndex >= 0) {
    stack.splice(fallbackIndex, 0, liveTalkLayer);
  } else {
    stack.push(liveTalkLayer);
  }
  server.__ssmlabsLiveTalkAttached = true;
  const config = resolveLiveTalkConfig();
  if (config.enabled) {
    console.info('[ssmlabs-live-talk] mounted /live-talk');
  }
}

http.Server.prototype.listen = function listenWithLiveTalk(...args) {
  try {
    attach(this);
  } catch (error) {
    console.error('[ssmlabs-live-talk] failed to attach routes', error);
    throw error;
  }
  return originalListen.apply(this, args);
};

module.exports = {
  attach,
};
