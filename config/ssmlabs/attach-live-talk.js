'use strict';

/**
 * SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Mounts /live-talk at listen time so api/server/index.js stays upstream.
 */
const http = require('http');
const { createLiveTalkRouter } = require('./liveTalkRoutes');

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
    saveConvo,
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
        console.info('[ssmlabs-live-talk] MCP tool list ok', {
          serverName: config.serverName,
          count: tools.length,
        });
        return tools;
      }
      const empty = new Error('Instructor MCP returned no tools for Live Talk.');
      empty.status = 502;
      empty.code = 'mcp_tools_unavailable';
      throw empty;
    } catch (error) {
      console.warn('[ssmlabs-live-talk] MCP tool list failed', {
        message: error.message,
        name: error.name,
        status: error.status,
        stack: error.stack,
      });
      if (error.status && error.code) throw error;
      const failed = new Error(
        'Live Talk could not load LessonCaddie tools. Try typed Chat, then try voice again.',
      );
      failed.status = 502;
      failed.code = 'mcp_tools_unavailable';
      throw failed;
    }
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
    return unwrapMcpResult(result);
  }

  function unwrapMcpResult(result) {
    if (result == null) return null;
    if (typeof result === 'string') {
      try {
        return unwrapMcpResult(JSON.parse(result));
      } catch {
        return { text: result };
      }
    }
    if (Array.isArray(result)) {
      return unwrapMcpResult(result[0]);
    }
    if (typeof result !== 'object') return result;
    if (result.structuredContent && typeof result.structuredContent === 'object') {
      return result.structuredContent;
    }
    if (Array.isArray(result.content)) {
      const first = result.content.find((part) => part && part.text != null) || result.content[0];
      return unwrapMcpResult(first && first.text != null ? first.text : first);
    }
    return result;
  }

  const router = require('express').Router();
  router.use(requireJwtAuth);
  router.use(
    createLiveTalkRouter({
      getConvo,
      saveConvo,
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
  console.info('[ssmlabs-live-talk] mounted /live-talk');
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
