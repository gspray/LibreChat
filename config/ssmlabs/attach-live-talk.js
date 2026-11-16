'use strict';

/**
 * SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Mounts /live-talk at listen time so api/server/index.js stays upstream.
 */
const http = require('http');
const crypto = require('node:crypto');
const { createLiveTalkRouter, createLiveTalkMcpProxy } = require('./liveTalkRoutes');
const { unwrapMcpResult } = require('./liveTalkMcpResult');
const { refreshDebugLogging, liveTalkLog } = require('./debugLogging');

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

function unwrapMcpToolList(listed) {
  if (Array.isArray(listed)) return listed;
  if (Array.isArray(listed?.tools)) return listed.tools;
  return [];
}

function liveTalkMcpRequestBody(conversationId) {
  return { conversationId, messageId: crypto.randomUUID() };
}

/**
 * LibreChat MCPConnection exposes fetchTools(), not the SDK Client.listTools().
 * Calling listTools?.() is undefined after a successful connect, so Live Talk
 * reports "no tools" even when MCP already refreshed the catalog.
 */
async function readConnectionTools(connection) {
  if (typeof connection?.fetchTools === 'function') {
    const fetched = unwrapMcpToolList(await connection.fetchTools());
    if (fetched.length) return fetched;
  }
  return unwrapMcpToolList(await connection?.listTools?.());
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
  const { getMCPManager, getMCPServersRegistry, getFlowStateManager } = require('~/config');
  const { getLogStores } = require('~/cache');
  const { CacheKeys } = require('librechat-data-provider');

  async function listMcpTools({ user, conversationId, config }) {
    const mcpManager = getMCPManager();
    const flowManager = getFlowStateManager(getLogStores(CacheKeys.FLOWS));
    const tokenMethods = { findToken, createToken, updateToken, deleteTokens };
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const connection = await mcpManager.getConnection({
          user,
          serverName: config.serverName,
          flowManager,
          tokenMethods,
          requestBody: liveTalkMcpRequestBody(conversationId),
        });
        const tools = await readConnectionTools(connection);
        if (Array.isArray(tools) && tools.length) {
          liveTalkLog('info', 'MCP tool list ok', {
            serverName: config.serverName,
            count: tools.length,
            attempt,
          });
          return tools;
        }
        lastError = new Error('LessonCaddie MCP returned no tools for Live Talk.');
        lastError.status = 502;
        lastError.code = 'mcp_tools_unavailable';
      } catch (error) {
        lastError = error;
        liveTalkLog('warn', 'MCP tool list failed', {
          message: error.message,
          name: error.name,
          status: error.status,
          attempt,
          serverName: config.serverName,
        });
      }
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
    if (lastError?.status && lastError?.code) throw lastError;
    const failed = new Error(
      'Live Talk could not load LessonCaddie tools. Try typed Chat, then try voice again.',
    );
    failed.status = 502;
    failed.code = 'mcp_tools_unavailable';
    throw failed;
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
      requestBody: liveTalkMcpRequestBody(conversationId),
    });
    return unwrapMcpResult(result);
  }

  async function getMcpDelegation({ user, config }) {
    const firebaseUid = String(user?.openidId || '').trim();
    if (user?.provider !== 'lessoncaddie' || !firebaseUid) {
      return null;
    }
    const registry = getMCPServersRegistry();
    const serverConfig = await registry.getServerConfig(
      config.serverName,
      user.id,
      undefined,
      user.role,
      { idOnTheSource: user.idOnTheSource },
    );
    if (!serverConfig || !(await registry.isAppServerConfig(config.serverName, serverConfig))) {
      return null;
    }
    const serverUrl = String(serverConfig.url || '');
    if (!serverUrl.startsWith('https://')) return null;
    return { serverUrl, firebaseUid };
  }

  const router = require('express').Router();
  router.use('/mcp', createLiveTalkMcpProxy());
  router.use(requireJwtAuth);
  router.use(
    createLiveTalkRouter({
      refreshDebugLogging,
      getConvo,
      saveConvo,
      getAgent,
      saveMessage,
      listMcpTools,
      getMcpDelegation,
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
  liveTalkLog('info', 'mounted /live-talk');
}

http.Server.prototype.listen = function listenWithLiveTalk(...args) {
  try {
    attach(this);
  } catch (error) {
    liveTalkLog('error', 'failed to attach routes', error);
    throw error;
  }
  return originalListen.apply(this, args);
};

module.exports = {
  attach,
  unwrapMcpToolList,
  readConnectionTools,
  liveTalkMcpRequestBody,
};
