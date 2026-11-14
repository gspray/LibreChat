'use strict';

/** Authenticated Live Talk routes. Keys, tools, and limits stay on the server. */
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const express = require('express');
const {
  LIVE_TALK_PACKS,
  resolveLiveTalkConfig,
  resolveLiveTalkPack,
  applyLiveTalkPack,
  liveTalkTurnDetection,
  applyLiveVoiceToConfig,
  liveTalkToolNames,
  isAllowedLiveTalkTool,
  liveTalkInstructions,
} = require('./liveTalkConfig');

const sessions = new Map();
const userSessionCounts = new Map();

function clean(value) {
  return String(value || '').trim();
}

function normalizeSdp(value) {
  const text = String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/^\s+/, '')
    .replace(/\s+$/, '');
  if (!text) return '';
  return `${text}\n`;
}

function openaiErrorMessage(body) {
  try {
    const parsed = JSON.parse(body);
    return clean(parsed?.error?.message);
  } catch {
    return '';
  }
}

function userIdOf(req) {
  return clean(req.user?.id || req.user?._id);
}

function publicError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function countUserSessions(userId) {
  return userSessionCounts.get(userId) || 0;
}

function rememberUserSession(userId, delta) {
  const next = Math.max(0, countUserSessions(userId) + delta);
  if (next === 0) userSessionCounts.delete(userId);
  else userSessionCounts.set(userId, next);
}

function clearTimers(record) {
  if (record.maxTimer) clearTimeout(record.maxTimer);
  if (record.idleTimer) clearTimeout(record.idleTimer);
  record.maxTimer = null;
  record.idleTimer = null;
}

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function unwrapMcpResult(result) {
  if (result == null) return null;
  if (typeof result === 'string') {
    const parsed = parseJsonSafe(result);
    return parsed == null ? { text: result } : unwrapMcpResult(parsed);
  }
  if (Array.isArray(result)) return unwrapMcpResult(result[0]);
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

function rpcMessagesFromBody(body) {
  if (body == null) return [];
  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    return rpcMessagesFromBody(parseJsonSafe(String(body)));
  }
  if (Array.isArray(body)) return body.filter((item) => item && typeof item === 'object');
  if (body && typeof body === 'object') return [body];
  return [];
}

function mcpToolCallsFromRequest(req) {
  if (req.method !== 'POST') return [];
  return rpcMessagesFromBody(req.body)
    .filter((msg) => msg.method === 'tools/call')
    .map((msg) => ({ id: msg.id, name: clean(msg.params?.name) }))
    .filter((call) => call.name);
}

function rpcMessagesFromResponse(text, contentType) {
  const type = String(contentType || '').toLowerCase();
  const trimmed = String(text || '').trim();
  if (!trimmed) return [];
  if (type.includes('json') && !type.includes('event-stream')) {
    return rpcMessagesFromBody(trimmed);
  }
  const messages = rpcMessagesFromBody(trimmed);
  if (messages.length) return messages;
  const found = [];
  for (const block of trimmed.split('\n\n')) {
    const data = block
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .filter((line) => line && line !== '[DONE]')
      .join('\n');
    if (!data) continue;
    found.push(...rpcMessagesFromBody(data));
  }
  return found;
}

function enqueueClientActions(record, toolCalls, responseText, contentType) {
  if (!record || !toolCalls.length) return;
  const messages = rpcMessagesFromResponse(responseText, contentType);
  const byId = new Map();
  for (const msg of messages) {
    if (msg.id != null && msg.result != null) byId.set(String(msg.id), msg.result);
  }
  record.clientActions = Array.isArray(record.clientActions) ? record.clientActions : [];
  for (const call of toolCalls) {
    let result = call.id != null ? byId.get(String(call.id)) : null;
    if (result == null && messages.length === 1 && messages[0]?.result != null) {
      result = messages[0].result;
    }
    if (result == null) continue;
    record.clientActions.push({ name: call.name, result: unwrapMcpResult(result) });
    liveTalkLog('info', 'mcp.proxy.client-action', { name: call.name, sessionId: record.id });
  }
  if (record.clientActions.length > 20) {
    record.clientActions.splice(0, record.clientActions.length - 20);
  }
}

function destroySession(sessionId, reason = 'stop') {
  const record = sessions.get(sessionId);
  if (!record) return null;
  clearTimers(record);
  for (const controller of record.proxyRequests || []) controller.abort();
  sessions.delete(sessionId);
  rememberUserSession(record.userId, -1);
  record.closed = true;
  record.closedReason = reason;
  liveTalkLog('info', 'session.destroyed', { sessionId, reason });
  return record;
}

function createLiveTalkMcpProxy() {
  const router = express.Router();
  router.use(express.json({ limit: '16kb' }));
  router.all('/:sessionId', async (req, res) => {
    const record = sessions.get(clean(req.params.sessionId));
    const bearer = clean(req.headers.authorization).replace(/^Bearer\s+/i, '');
    const expected = record?.proxyToken || '';
    const authorized =
      bearer &&
      expected &&
      Buffer.byteLength(bearer) === Buffer.byteLength(expected) &&
      crypto.timingSafeEqual(Buffer.from(bearer), Buffer.from(expected));
    if (record || req.headers.authorization) {
      liveTalkLog('info', 'mcp.proxy.request', {
        method: req.method,
        sessionKnown: Boolean(record),
        authorized: Boolean(authorized),
        bearerHeader: /^Bearer\s+\S+$/i.test(clean(req.headers.authorization)),
      });
    }
    if (!authorized || record.closed || !record.mcpProxy) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!['GET', 'POST', 'DELETE'].includes(req.method)) {
      res.set('Allow', 'GET, POST, DELETE').status(405).end();
      return;
    }
    const secret = clean(process.env.LESSONCADDIE_SSO_SHARED_SECRET);
    if (secret.length < 32) {
      res.status(503).json({ error: 'MCP connection unavailable' });
      return;
    }
    let body = null;
    if (req.method === 'POST') {
      body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
    }
    if (body && body.length > 16 * 1024) {
      res.status(413).json({ error: 'MCP request too large' });
      return;
    }
    const toolCalls = mcpToolCallsFromRequest(req);
    const controller = new AbortController();
    record.proxyRequests.add(controller);
    res.on('close', () => controller.abort());
    try {
      const upstream = await fetch(record.mcpProxy.serverUrl, {
        method: req.method,
        signal: controller.signal,
        headers: {
          'X-LessonCaddie-Sso-Secret': secret,
          'X-LibreChat-Firebase-Uid': record.mcpProxy.firebaseUid,
          'X-LibreChat-User-Provider': 'lessoncaddie',
          Accept: 'application/json, text/event-stream',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(req.headers['mcp-session-id']
            ? { 'Mcp-Session-Id': clean(req.headers['mcp-session-id']) }
            : {}),
          ...(req.headers['mcp-protocol-version']
            ? { 'Mcp-Protocol-Version': clean(req.headers['mcp-protocol-version']) }
            : {}),
          ...(req.headers['last-event-id']
            ? { 'Last-Event-ID': clean(req.headers['last-event-id']) }
            : {}),
        },
        body,
      });
      const contentType = String(upstream.headers.get('content-type') || '');
      liveTalkLog('info', 'mcp.proxy.upstream', {
        method: req.method,
        status: upstream.status,
        contentType: contentType.split(';')[0],
        toolCalls: toolCalls.map((call) => call.name),
      });
      res.status(upstream.status);
      for (const name of ['content-type', 'mcp-session-id', 'cache-control']) {
        const value = upstream.headers.get(name);
        if (value) res.set(name, value);
      }
      res.set('Cache-Control', 'no-store');
      if (toolCalls.length && upstream.body) {
        const buffer = Buffer.from(await upstream.arrayBuffer());
        enqueueClientActions(record, toolCalls, buffer.toString('utf8'), contentType);
        res.end(buffer);
      } else if (upstream.body) {
        await pipeline(Readable.fromWeb(upstream.body), res);
      } else {
        res.end();
      }
    } catch (error) {
      liveTalkLog('warn', 'mcp.proxy.failed', { method: req.method, name: error?.name || '' });
      if (!res.headersSent) res.status(502).json({ error: 'MCP connection unavailable' });
      else res.end();
    } finally {
      record.proxyRequests.delete(controller);
    }
  });
  return router;
}

function destroyUserSessions(userId, reason = 'replaced') {
  for (const record of [...sessions.values()]) {
    if (record.userId === userId) destroySession(record.id, reason);
  }
}

function touchSession(record) {
  if (!record || record.closed) return;
  if (record.idleTimer) clearTimeout(record.idleTimer);
  record.idleTimer = setTimeout(() => {
    destroySession(record.id, 'idle');
  }, record.idleMs);
  record.lastActivityAt = Date.now();
}

function requireSession(req) {
  const sessionId = clean(req.params.sessionId);
  const record = sessions.get(sessionId);
  if (!record || record.closed) {
    throw publicError(404, 'session_not_found', 'Live Talk session is not active.');
  }
  if (record.userId !== userIdOf(req)) {
    throw publicError(403, 'session_forbidden', 'That Live Talk session belongs to another user.');
  }
  touchSession(record);
  return record;
}

function clip(value, max = 800) {
  const text = String(value || '');
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function liveTalkLog(level, stage, data = {}) {
  const line = `[ssmlabs-live-talk] ${stage}`;
  if (level === 'error') console.error(line, data);
  else if (level === 'warn') console.warn(line, data);
  else console.info(line, data);
}

async function bootstrapOpenAi({ sdp, session }) {
  const apiKey = resolveLiveTalkConfig().openaiApiKey;
  if (!apiKey) {
    liveTalkLog('error', 'openai.unconfigured', { hasKey: false });
    throw publicError(503, 'openai_unconfigured', 'Live Talk is missing a server OpenAI key.');
  }
  const offer = normalizeSdp(sdp);
  const form = new FormData();
  form.set('sdp', offer);
  form.set('session', JSON.stringify(session));
  liveTalkLog('info', 'openai.bootstrap.start', {
    model: session?.model || '',
    voice: session?.audio?.output?.voice || '',
    toolCount: Array.isArray(session?.tools) ? session.tools.length : 0,
    sdpChars: offer.length,
    sdpEndsWithNewline: offer.endsWith('\n'),
    sdpTail: clip(offer.slice(-24), 24),
  });
  const response = await fetch('https://api.openai.com/v1/realtime/calls', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });
  const answer = await response.text();
  if (!response.ok) {
    const openaiMessage = openaiErrorMessage(answer);
    const clientStatus = response.status >= 400 && response.status < 500 ? 400 : 502;
    const error = publicError(
      clientStatus,
      'openai_session_failed',
      openaiMessage || 'Could not start the voice session. Try again in a moment.',
    );
    error.debug = {
      openaiStatus: response.status,
      openaiBody: clip(answer),
    };
    liveTalkLog('error', 'openai.bootstrap.failed', error.debug);
    throw error;
  }
  liveTalkLog('info', 'openai.bootstrap.ok', {
    status: response.status,
    answerChars: answer.length,
  });
  return answer;
}

async function bootstrapGptLive({ sdp, session }) {
  const apiKey = resolveLiveTalkConfig().openaiApiKey;
  if (!apiKey) {
    throw publicError(503, 'openai_unconfigured', 'Live Talk is missing a server OpenAI key.');
  }
  const response = await fetch('https://api.openai.com/v1/live/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session,
      transport: { type: 'webrtc', sdp },
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    liveTalkLog('error', 'gpt-live.bootstrap.failed', { status: response.status });
    throw publicError(
      502,
      'openai_session_failed',
      'Could not start the voice session. Try again in a moment.',
    );
  }
  const answerSdp = body.transport?.sdp;
  if (typeof answerSdp !== 'string' || !/^v=0\r?\n/.test(answerSdp)) {
    throw publicError(
      502,
      'openai_session_failed',
      'The voice session returned an invalid audio connection.',
    );
  }
  return { sdp: answerSdp, sessionId: clean(body.session?.id || body.id) };
}

function toOpenAiTools(mcpTools) {
  const list = Array.isArray(mcpTools) ? mcpTools : [];
  return list
    .filter((tool) => String(tool?.name || '').trim())
    .map((tool) => ({
      type: 'function',
      name: String(tool.name).trim(),
      description: String(tool.description || '').slice(0, 800),
      parameters:
        tool.inputSchema && typeof tool.inputSchema === 'object'
          ? tool.inputSchema
          : { type: 'object', additionalProperties: false },
    }));
}

function createLiveTalkRouter(deps = {}) {
  const router = express.Router();
  const loadConfig = deps.resolveLiveTalkConfig || resolveLiveTalkConfig;
  const getConvo = deps.getConvo;
  const saveConvo = deps.saveConvo;
  const getAgent = deps.getAgent;
  const saveMessage = deps.saveMessage;
  const listMcpTools = deps.listMcpTools;
  const getMcpDelegation = deps.getMcpDelegation;
  const callMcpTool = deps.callMcpTool;
  const bootstrap = deps.bootstrapOpenAi || bootstrapOpenAi;
  const bootstrapLive = deps.bootstrapGptLive || bootstrapGptLive;
  const now = deps.now || (() => Date.now());

  router.get('/config', (req, res) => {
    const baseConfig = loadConfig();
    const pack =
      resolveLiveTalkPack({ spec: clean(req.query?.spec), agentId: clean(req.query?.agentId) }) ||
      LIVE_TALK_PACKS.instructor;
    const config = applyLiveTalkPack(baseConfig, pack);
    res.set('Cache-Control', 'no-store');
    res.json({
      enabled: config.enabled,
      agentId: config.agentId,
      mcpServer: config.serverName,
      spec: pack.spec,
      displayName: pack.displayName,
      speakCoreRevision: config.speakCoreRevision,
      provider: config.gptLiveEnabled && pack.id === 'instructor' ? 'gpt-live' : 'openai-realtime',
      gptLiveIdleMs: config.gptLiveIdleMs,
    });
  });

  router.post('/session', async (req, res, next) => {
    const startedAt = Date.now();
    const timings = {};
    const timed = async (name, operation) => {
      const beganAt = Date.now();
      try {
        return await operation();
      } finally {
        timings[name] = Date.now() - beganAt;
      }
    };
    try {
      const baseConfig = loadConfig();
      const userId = userIdOf(req);
      const sdp = typeof req.body?.sdp === 'string' ? req.body.sdp : '';
      liveTalkLog('info', 'session.create.request', {
        userId: userId ? 'set' : '',
        conversationId: clean(req.body?.conversationId),
        spec: clean(req.body?.spec),
        agentId: clean(req.body?.agentId),
        sdpChars: sdp.length,
        sdpEndsWithNewline: sdp.endsWith('\n'),
      });
      if (!userId) {
        throw publicError(401, 'unauthorized', 'Sign in to use Live Talk.');
      }
      const requestedId = clean(req.body?.conversationId);
      if (!sdp.trim()) {
        throw publicError(400, 'invalid_session', 'Live Talk is missing a voice offer.');
      }
      if (countUserSessions(userId) > 0) {
        destroyUserSessions(userId, 'replaced');
      }
      let conversationId = requestedId;
      let convo = null;
      let convoAgentId = '';
      if (conversationId && conversationId !== 'new') {
        convo = await timed('getConvoMs', () => getConvo(userId, conversationId));
        if (!convo) {
          throw publicError(404, 'conversation_not_found', 'That conversation was not found.');
        }
        convoAgentId = clean(convo.agent_id || convo.agentId);
      }
      const pack = resolveLiveTalkPack({
        spec: clean(req.body?.spec),
        agentId: clean(req.body?.spec) ? '' : convoAgentId || clean(req.body?.agentId),
      });
      if (!pack) {
        throw publicError(
          403,
          'agent_not_allowed',
          'Live Talk is only available on LessonCaddie Caddie threads.',
        );
      }
      const config = applyLiveTalkPack(baseConfig, pack);
      const agentPromise = timed('getAgentMs', () =>
        getAgent({ id: config.agentId }).catch(() => null),
      );
      if (!conversationId || conversationId === 'new') {
        conversationId = crypto.randomUUID();
        convo = {
          conversationId,
          agent_id: config.agentId,
          endpoint: 'agents',
          title: 'New chat',
        };
        if (saveConvo) {
          await timed('saveConvoMs', () =>
            saveConvo({ userId }, convo, {
              context: 'ssmlabs-live-talk#session',
              initialAgentId: config.agentId,
            }),
          );
        }
      }
      const agent = await agentPromise;
      const requestedProvider = req.body?.liveVoice?.provider;
      const gptLive =
        pack.id === 'instructor' &&
        (requestedProvider === 'gpt-live' ||
          (requestedProvider !== 'openai-realtime' && config.gptLiveEnabled));
      const mcpTools = gptLive
        ? []
        : await listMcpTools({ user: req.user, conversationId, config });
      const tools = toOpenAiTools(mcpTools);
      const allowedTools = liveTalkToolNames(tools);
      if (!gptLive && !allowedTools.size) {
        throw publicError(
          502,
          'mcp_tools_unavailable',
          'Live Talk could not load LessonCaddie tools. Try typed Chat, then try voice again.',
        );
      }
      const sessionId = crypto.randomUUID();
      const sessionConfig = applyLiveVoiceToConfig(config, req.body?.liveVoice);
      const instructions = liveTalkInstructions(agent?.instructions, pack);
      let answerSdp;
      let providerSessionId = '';
      let proxyRecord = null;
      if (gptLive) {
        const delegation = await timed('mcpConfigMs', () =>
          getMcpDelegation?.({ user: req.user, conversationId, config }),
        );
        if (!delegation?.serverUrl || !delegation?.firebaseUid) {
          throw publicError(
            503,
            'mcp_tools_unavailable',
            'Live Talk could not connect to LessonCaddie tools.',
          );
        }
        if (clean(process.env.LESSONCADDIE_SSO_SHARED_SECRET).length < 32) {
          throw publicError(
            503,
            'mcp_proxy_unconfigured',
            'Live Talk MCP authentication is unavailable.',
          );
        }
        let proxyUrl;
        try {
          proxyUrl = new URL(config.gptLiveMcpProxyUrl);
        } catch {
          throw publicError(
            503,
            'mcp_proxy_unconfigured',
            'Live Talk MCP proxy URL is unavailable.',
          );
        }
        if (
          proxyUrl.protocol !== 'https:' ||
          proxyUrl.username ||
          proxyUrl.password ||
          proxyUrl.search ||
          proxyUrl.hash
        ) {
          throw publicError(503, 'mcp_proxy_unconfigured', 'Live Talk MCP proxy URL is invalid.');
        }
        const proxyToken = crypto.randomBytes(32).toString('base64url');
        proxyRecord = {
          id: sessionId,
          userId,
          closed: false,
          idleMs: config.idleMs,
          proxyToken,
          mcpProxy: delegation,
          proxyRequests: new Set(),
          clientActions: [],
        };
        sessions.set(sessionId, proxyRecord);
        rememberUserSession(userId, 1);
        touchSession(proxyRecord);
        const requestedVoice = req.body?.liveVoice?.voice;
        const customVoiceId =
          typeof requestedVoice === 'object' ? clean(requestedVoice.id) : clean(requestedVoice);
        const outputVoice = /^voice_[A-Za-z0-9_-]+$/.test(customVoiceId)
          ? { id: customVoiceId }
          : sessionConfig.voice;
        let live;
        try {
          live = await timed('openAiMs', () =>
            bootstrapLive({
              sdp,
              session: {
                model: 'gpt-live-1',
                instructions,
                audio: { output: { voice: outputVoice } },
                delegation: {
                  type: 'responses',
                  responses: {
                    model: 'gpt-6-luna',
                    tools: [
                      {
                        type: 'mcp',
                        server_url: `${proxyUrl.toString().replace(/\/+$/, '')}/${sessionId}`,
                        server_label: 'Instructor',
                        authorization: proxyToken,
                        require_approval: 'never',
                      },
                    ],
                    tool_choice: 'auto',
                  },
                },
              },
            }),
          );
        } catch (error) {
          destroySession(sessionId, 'bootstrap-failed');
          throw error;
        }
        answerSdp = live.sdp;
        providerSessionId = live.sessionId;
      } else {
        answerSdp = await bootstrap({
          sdp,
          session: {
            type: 'realtime',
            model: sessionConfig.model,
            instructions,
            tools,
            tool_choice: 'auto',
            audio: {
              input: {
                turn_detection: liveTalkTurnDetection(sessionConfig, { createResponse: false }),
              },
              output: { voice: sessionConfig.voice },
            },
          },
        });
      }
      const record = {
        id: sessionId,
        userId,
        conversationId,
        agentId: config.agentId,
        serverName: config.serverName,
        packId: pack.id,
        displayName: pack.displayName,
        createdAt: now(),
        lastActivityAt: now(),
        idleMs: config.idleMs,
        parentMessageId: clean(convo.lastMessageId || convo.last_message_id),
        allowedTools,
        ...(proxyRecord
          ? {
              proxyToken: proxyRecord.proxyToken,
              mcpProxy: proxyRecord.mcpProxy,
              proxyRequests: proxyRecord.proxyRequests,
              clientActions: proxyRecord.clientActions || [],
            }
          : {}),
        closed: false,
      };
      record.maxTimer = setTimeout(
        () => destroySession(sessionId, 'duration'),
        config.maxSessionMs,
      );
      if (proxyRecord) clearTimers(proxyRecord);
      sessions.set(sessionId, record);
      if (!proxyRecord) rememberUserSession(userId, 1);
      touchSession(record);
      liveTalkLog('info', 'session.create.ok', {
        sessionId,
        conversationId,
        packId: pack.id,
        totalMs: Date.now() - startedAt,
        timings,
        agentId: config.agentId,
        serverName: config.serverName,
        toolCount: tools.length,
        tools: tools.map((tool) => tool.name),
      });
      res.status(201).json({
        sessionId,
        sdp: answerSdp,
        providerSessionId,
        conversationId,
        tools: tools.map((tool) => tool.name),
      });
    } catch (error) {
      liveTalkLog('warn', 'session.create.failed', {
        totalMs: Date.now() - startedAt,
        timings,
        code: error?.code || '',
        status: error?.status || '',
      });
      next(error);
    }
  });

  router.post('/session/:sessionId/tool', async (req, res, next) => {
    try {
      const config = loadConfig();
      const record = requireSession(req);
      const name = clean(req.body?.name);
      liveTalkLog('info', 'tool.call', {
        sessionId: record.id,
        name,
        argumentKeys:
          req.body?.arguments && typeof req.body.arguments === 'object'
            ? Object.keys(req.body.arguments)
            : [],
      });
      if (!isAllowedLiveTalkTool(name, record.allowedTools)) {
        liveTalkLog('warn', 'tool.denied', {
          name,
          toolCount: record.allowedTools instanceof Set ? record.allowedTools.size : 0,
        });
        throw publicError(
          403,
          'tool_denied',
          'That action is not in the LessonCaddie catalog for this voice session.',
        );
      }
      const result = await callMcpTool({
        user: req.user,
        serverName: record.serverName || config.serverName,
        toolName: name,
        toolArguments:
          req.body?.arguments && typeof req.body.arguments === 'object' ? req.body.arguments : {},
        conversationId: record.conversationId,
      });
      liveTalkLog('info', 'tool.ok', {
        name,
        resultType: result && typeof result === 'object' ? result.type || 'object' : typeof result,
      });
      res.json({ ok: true, result });
    } catch (error) {
      next(error);
    }
  });

  router.post('/session/:sessionId/transcript', async (req, res, next) => {
    try {
      const record = requireSession(req);
      const role = clean(req.body?.role);
      const text = clean(req.body?.text);
      const providerItemId = clean(req.body?.providerItemId);
      if (!['user', 'assistant'].includes(role) || !text) {
        throw publicError(400, 'invalid_transcript', 'Transcript text is required.');
      }
      const dedupeKey = providerItemId || `${role}:${text}`;
      record.transcripts = record.transcripts || new Set();
      if (record.transcripts.has(dedupeKey)) {
        res.json({ ok: true, duplicate: true });
        return;
      }
      record.transcripts.add(dedupeKey);
      const interrupted = Boolean(req.body?.interrupted);
      const messageId = crypto.randomUUID();
      const saved = await saveMessage(
        { userId: record.userId },
        {
          messageId,
          conversationId: record.conversationId,
          parentMessageId: record.parentMessageId || undefined,
          sender: role === 'user' ? 'User' : record.displayName || 'Instructor Assistant',
          isCreatedByUser: role === 'user',
          text: interrupted ? `${text}\n\n[Interrupted]` : text,
          endpoint: 'agents',
          model: loadConfig().model,
          error: false,
        },
        { context: 'POST /live-talk/session/:id/transcript' },
      );
      record.parentMessageId = saved?.messageId || messageId;
      res.status(201).json({ ok: true, messageId: record.parentMessageId });
    } catch (error) {
      next(error);
    }
  });

  router.get('/session/:sessionId/client-actions', (req, res, next) => {
    try {
      const record = requireSession(req);
      const actions = Array.isArray(record.clientActions) ? record.clientActions.splice(0) : [];
      res.json({ ok: true, actions });
    } catch (error) {
      next(error);
    }
  });

  router.post('/session/:sessionId/ping', (req, res, next) => {
    try {
      requireSession(req);
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  router.post('/session/:sessionId/stop', (req, res, next) => {
    try {
      const sessionId = clean(req.params.sessionId);
      const record = sessions.get(sessionId);
      if (record && record.userId !== userIdOf(req)) {
        throw publicError(
          403,
          'session_forbidden',
          'That Live Talk session belongs to another user.',
        );
      }
      destroySession(sessionId, clean(req.body?.reason) || 'stop');
      res.json({ ok: true, stopped: true });
    } catch (error) {
      next(error);
    }
  });

  router.use((error, req, res, _next) => {
    const status = Number(error.status) || 500;
    const debug = {
      code: error.code || 'live_talk_error',
      message: error.message || '',
      path: `${req.method} ${req.originalUrl || req.url || ''}`,
      ...(error.debug && typeof error.debug === 'object' ? error.debug : {}),
    };
    liveTalkLog(status >= 500 ? 'error' : 'warn', 'request.failed', debug);
    res.status(status).json({
      error: error.code || 'live_talk_error',
      message:
        status >= 500 ? 'Live Talk failed. Stop and try again, or continue typing.' : error.message,
      debug,
    });
  });

  return router;
}

function resetLiveTalkSessions() {
  for (const record of sessions.values()) {
    clearTimers(record);
  }
  sessions.clear();
  userSessionCounts.clear();
}

module.exports = {
  createLiveTalkRouter,
  destroySession,
  resetLiveTalkSessions,
  bootstrapOpenAi,
  bootstrapGptLive,
  createLiveTalkMcpProxy,
  toOpenAiTools,
};
