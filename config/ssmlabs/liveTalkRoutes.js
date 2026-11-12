'use strict';

/** Authenticated Live Talk routes. Keys, tools, and limits stay on the server. */
const crypto = require('node:crypto');
const express = require('express');
const {
  resolveLiveTalkConfig,
  liveTalkTurnDetection,
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

function destroySession(sessionId, reason = 'stop') {
  const record = sessions.get(sessionId);
  if (!record) return null;
  clearTimers(record);
  sessions.delete(sessionId);
  rememberUserSession(record.userId, -1);
  record.closed = true;
  record.closedReason = reason;
  return record;
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
  const callMcpTool = deps.callMcpTool;
  const bootstrap = deps.bootstrapOpenAi || bootstrapOpenAi;
  const now = deps.now || (() => Date.now());

  router.get('/config', (req, res) => {
    const config = loadConfig();
    res.set('Cache-Control', 'no-store');
    res.json({
      enabled: config.enabled,
      agentId: config.agentId,
      mcpServer: config.serverName,
      speakCoreRevision: config.speakCoreRevision,
    });
  });

  router.post('/session', async (req, res, next) => {
    try {
      const config = loadConfig();
      const userId = userIdOf(req);
      const sdp = normalizeSdp(req.body?.sdp);
      liveTalkLog('info', 'session.create.request', {
        userId: userId ? 'set' : '',
        conversationId: clean(req.body?.conversationId),
        sdpChars: sdp.length,
        sdpEndsWithNewline: sdp.endsWith('\n'),
      });
      if (!userId) {
        throw publicError(401, 'unauthorized', 'Sign in to use Live Talk.');
      }
      const requestedId = clean(req.body?.conversationId);
      if (!sdp) {
        throw publicError(400, 'invalid_session', 'Live Talk is missing a voice offer.');
      }
      if (countUserSessions(userId) >= config.maxSessionsPerUser) {
        throw publicError(
          409,
          'session_limit',
          'A Live Talk session is already active. Stop it before starting another.',
        );
      }
      let conversationId = requestedId;
      let convo = null;
      if (conversationId && conversationId !== 'new') {
        convo = await getConvo(userId, conversationId);
        if (!convo) {
          throw publicError(404, 'conversation_not_found', 'That conversation was not found.');
        }
        const agentId = clean(convo.agent_id || convo.agentId);
        if (agentId && agentId !== config.agentId) {
          throw publicError(
            403,
            'agent_not_allowed',
            'Live Talk is only available on Instructor Assistant threads.',
          );
        }
      } else {
        conversationId = crypto.randomUUID();
        convo = {
          conversationId,
          agent_id: config.agentId,
          endpoint: 'agents',
          title: 'New chat',
        };
        if (saveConvo) {
          await saveConvo({ userId }, convo, {
            context: 'ssmlabs-live-talk#session',
            initialAgentId: config.agentId,
          });
        }
      }
      const agent = await getAgent({ id: config.agentId }).catch(() => null);
      const mcpTools = await listMcpTools({ user: req.user, conversationId, config });
      const tools = toOpenAiTools(mcpTools);
      const allowedTools = liveTalkToolNames(tools);
      if (!allowedTools.size) {
        throw publicError(
          502,
          'mcp_tools_unavailable',
          'Live Talk could not load LessonCaddie tools. Try typed Chat, then try voice again.',
        );
      }
      const sessionId = crypto.randomUUID();
      const answerSdp = await bootstrap({
        sdp,
        session: {
          type: 'realtime',
          model: config.model,
          instructions: liveTalkInstructions(agent?.instructions),
          tools,
          tool_choice: 'auto',
          audio: {
            input: {
              turn_detection: liveTalkTurnDetection(config),
            },
            output: { voice: config.voice },
          },
        },
      });
      const record = {
        id: sessionId,
        userId,
        conversationId,
        agentId: config.agentId,
        createdAt: now(),
        lastActivityAt: now(),
        idleMs: config.idleMs,
        parentMessageId: clean(convo.lastMessageId || convo.last_message_id),
        allowedTools,
        closed: false,
      };
      record.maxTimer = setTimeout(
        () => destroySession(sessionId, 'duration'),
        config.maxSessionMs,
      );
      sessions.set(sessionId, record);
      rememberUserSession(userId, 1);
      touchSession(record);
      liveTalkLog('info', 'session.create.ok', {
        sessionId,
        conversationId,
        toolCount: tools.length,
        tools: tools.map((tool) => tool.name),
      });
      res.status(201).json({
        sessionId,
        sdp: answerSdp,
        conversationId,
        tools: tools.map((tool) => tool.name),
      });
    } catch (error) {
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
        serverName: config.serverName,
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
          sender: role === 'user' ? 'User' : 'Instructor Assistant',
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
  toOpenAiTools,
};
