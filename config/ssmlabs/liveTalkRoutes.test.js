'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const {
  CADDIE_VOICE_ID,
  liveTalkInstructions,
  resolveLiveTalkConfig,
} = require('./liveTalkConfig');
const {
  createLiveTalkRouter,
  createLiveTalkMcpProxy,
  resetLiveTalkSessions,
  bootstrapGptLive,
} = require('./liveTalkRoutes');

function liveTalkConfig() {
  return resolveLiveTalkConfig({ OPENAI_API_KEY: 'test-key' });
}

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

function createApp(overrides = {}) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.user = { id: req.headers['x-user'] || 'instructor-1' };
    next();
  });
  app.use(
    '/live-talk',
    createLiveTalkRouter({
      resolveLiveTalkConfig: liveTalkConfig,
      getConvo: async (userId, conversationId) => ({
        conversationId,
        agent_id: 'agent_instructor_assistant',
        lastMessageId: 'msg-root',
      }),
      saveConvo: async (_ctx, convo) => convo,
      getAgent: async () => ({ instructions: 'You are Instructor Assistant.' }),
      saveMessage: async (_ctx, message) => message,
      listMcpTools: async () => [
        {
          name: 'search_directory',
          description: 'Search students',
          inputSchema: { type: 'object' },
        },
        { name: 'create_lesson', description: 'Create a lesson', inputSchema: { type: 'object' } },
      ],
      callMcpTool: async ({ toolName }) => ({ toolName, ok: true }),
      readSessionUsage: async () => ({ totalMs: 0, quotaMinutes: 60 }),
      bootstrapOpenAi: async ({ session }) => {
        assert.equal(
          session.tools.some((tool) => tool.name === 'create_lesson'),
          true,
        );
        assert.equal(
          session.tools.some((tool) => tool.name === 'search_directory'),
          true,
        );
        assert.equal(session.audio?.input?.turn_detection?.type, 'semantic_vad');
        assert.equal(session.audio?.input?.turn_detection?.eagerness, 'medium');
        assert.equal(session.audio?.input?.turn_detection?.create_response, false);
        assert.equal(session.audio?.input?.turn_detection?.interrupt_response, false);
        return 'answer-sdp';
      },
      ...overrides,
    }),
  );
  return app;
}

test('GPT-Live refuses a session after the 60-minute quota is used', async () => {
  const originalSecret = process.env.LESSONCADDIE_SSO_SHARED_SECRET;
  process.env.LESSONCADDIE_SSO_SHARED_SECRET = 's'.repeat(32);
  const app = createApp({
    resolveLiveTalkConfig: () => ({
      ...liveTalkConfig(),
      gptLiveMcpProxyUrl: 'https://chat.example.test/chat/live-talk/mcp',
    }),
    getMcpDelegation: async () => ({
      serverUrl: 'https://mcp.example.test/api/instructor-mcp',
      firebaseUid: 'firebase-instructor-1',
    }),
    readSessionUsage: async () => ({ totalMs: 60 * 60000, quotaMinutes: 60 }),
    bootstrapGptLive: async () => {
      throw new Error('Voice must not start after quota.');
    },
  });
  const server = await listen(app);
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'convo-1',
        sdp: 'offer',
        liveVoice: { provider: 'gpt-live' },
      }),
    });
    assert.equal(response.status, 429);
    assert.match((await response.json()).message, /60 Live Talk minutes/);
  } finally {
    server.close();
    resetLiveTalkSessions();
    if (originalSecret === undefined) delete process.env.LESSONCADDIE_SSO_SHARED_SECRET;
    else process.env.LESSONCADDIE_SSO_SHARED_SECRET = originalSecret;
  }
});

test('GPT-Live forwards the exact offer and returns the raw OpenAI SDP answer', async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalFetch = global.fetch;
  const offer = 'v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\ns=-\r\n';
  const answer = 'v=0\r\no=- 2 2 IN IP4 127.0.0.1\r\ns=-\r\n';
  process.env.OPENAI_API_KEY = 'test-key';
  let posted;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/live/sessions');
    posted = JSON.parse(options.body);
    return new Response(JSON.stringify({ transport: { sdp: answer }, session: { id: 'live-1' } }));
  };
  try {
    const result = await bootstrapGptLive({ sdp: offer, session: { model: 'gpt-live-1' } });
    assert.equal(posted.transport.sdp, offer);
    assert.equal(result.sdp, answer);
    assert.equal(result.sessionId, 'live-1');
    global.fetch = async () => new Response(JSON.stringify({ transport: { sdp: { answer } } }));
    await assert.rejects(bootstrapGptLive({ sdp: offer, session: {} }), /invalid audio connection/);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
});

test('custom GPT-Live voices do not inherit the American accent instruction', () => {
  const instructions = liveTalkInstructions('', { id: 'instructor' }, { id: 'voice_custom' });
  assert.match(instructions, /selected custom voice/);
  assert.doesNotMatch(instructions, /Always speak American English/);
});

test('GPT-Live uses client delegation without exposing MCP credentials and stops access', async () => {
  const originalSecret = process.env.LESSONCADDIE_SSO_SHARED_SECRET;
  process.env.LESSONCADDIE_SSO_SHARED_SECRET = 's'.repeat(32);
  let liveSession;
  const app = createApp({
    getMcpDelegation: async () => ({
      serverUrl: 'https://mcp.example.test/api/instructor-mcp',
      firebaseUid: 'firebase-instructor-1',
    }),
    bootstrapGptLive: async ({ session }) => {
      liveSession = session;
      return { sdp: 'answer-sdp', sessionId: 'provider-1' };
    },
  });
  app.use('/live-talk/mcp', createLiveTalkMcpProxy());
  const server = await listen(app);
  const base = `http://127.0.0.1:${server.address().port}/live-talk`;
  try {
    const created = await fetch(`${base}/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'convo-1',
        sdp: 'offer',
        liveVoice: { provider: 'gpt-live', voice: CADDIE_VOICE_ID },
      }),
    });
    assert.equal(created.status, 201);
    const payload = await created.json();
    const { sessionId } = payload;
    assert.equal(payload.sdp, 'answer-sdp');
    assert.equal(liveSession.model, 'gpt-live-1');
    assert.deepEqual(liveSession.audio.output.voice, { id: CADDIE_VOICE_ID });
    assert.match(liveSession.instructions, /moderate Scottish accent/);
    assert.deepEqual(liveSession.delegation, { type: 'client', acknowledgement_delay_ms: 800 });
    assert.doesNotMatch(
      JSON.stringify({ payload, liveSession }),
      /firebase-instructor-1|mcp\.example\.test/,
    );
    assert.equal(JSON.stringify({ payload, liveSession }).includes('s'.repeat(32)), false);
    const denied = await fetch(`${base}/mcp/${sessionId}`, {
      method: 'POST',
      headers: { authorization: 'Bearer wrong', 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
    assert.equal(denied.status, 401);
    const forbidden = await fetch(`${base}/session/${sessionId}/client-actions`, {
      headers: { 'x-user': 'someone-else' },
    });
    assert.equal(forbidden.status, 403);
    const stopped = await fetch(`${base}/session/${sessionId}/stop`, { method: 'POST' });
    assert.equal(stopped.ok, true);
    const revoked = await fetch(`${base}/session/${sessionId}/delegation`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ delegationId: 'after-stop', utterance: 'Open Calendar' }),
    });
    assert.equal(revoked.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    resetLiveTalkSessions();
    if (originalSecret === undefined) delete process.env.LESSONCADDIE_SSO_SHARED_SECRET;
    else process.env.LESSONCADDIE_SSO_SHARED_SECRET = originalSecret;
  }
});

test('Live Talk bootstraps a session with the live MCP catalog including writes', async () => {
  const app = createApp({
    resolveLiveTalkConfig: () => ({ ...liveTalkConfig(), gptLiveEnabled: true }),
  });
  const server = await listen(app);
  try {
    const created = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'convo-1',
        sdp: 'offer',
        liveVoice: { provider: 'openai-realtime' },
      }),
    });
    assert.equal(created.status, 201);
    const session = await created.json();
    assert.equal(session.sdp, 'answer-sdp');
    assert.deepEqual(session.tools, ['search_directory', 'create_lesson']);
    const write = await fetch(
      `http://127.0.0.1:${server.address().port}/live-talk/session/${session.sessionId}/tool`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'create_lesson', arguments: {} }),
      },
    );
    assert.equal(write.status, 200);
    const allowed = await fetch(
      `http://127.0.0.1:${server.address().port}/live-talk/session/${session.sessionId}/tool`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'search_directory', arguments: { query: 'Jan' } }),
      },
    );
    assert.equal(allowed.status, 200);
    const unknown = await fetch(
      `http://127.0.0.1:${server.address().port}/live-talk/session/${session.sessionId}/tool`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'not_a_catalog_tool', arguments: {} }),
      },
    );
    assert.equal(unknown.status, 403);
  } finally {
    resetLiveTalkSessions();
    server.close();
  }
});

test('Live Talk transcripts save onto the Ask conversation', async () => {
  const saved = [];
  const app = createApp({
    saveMessage: async (_ctx, message) => {
      saved.push(message);
      return message;
    },
  });
  const server = await listen(app);
  try {
    const created = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: 'convo-1', sdp: 'offer' }),
    });
    assert.equal(created.status, 201);
    const session = await created.json();
    const user = await fetch(
      `http://127.0.0.1:${server.address().port}/live-talk/session/${session.sessionId}/transcript`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'user', text: 'Open my calendar' }),
      },
    );
    const assistant = await fetch(
      `http://127.0.0.1:${server.address().port}/live-talk/session/${session.sessionId}/transcript`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'assistant', text: 'Opening Calendar.' }),
      },
    );
    assert.equal(user.status, 201);
    assert.equal(assistant.status, 201);
    assert.equal(saved[0].isCreatedByUser, true);
    assert.equal(saved[0].text, 'Open my calendar');
    assert.equal(saved[0].conversationId, 'convo-1');
    assert.equal(saved[0].unfinished, false);
    assert.equal(saved[0].error, false);
    assert.equal(saved[0].finish_reason, 'stop');
    assert.deepEqual(saved[0].content, [{ type: 'text', text: 'Open my calendar' }]);
    assert.equal(saved[1].isCreatedByUser, false);
    assert.equal(saved[1].text, 'Opening Calendar.');
    assert.equal(saved[1].unfinished, false);
  } finally {
    resetLiveTalkSessions();
    server.close();
  }
});

test('Live Talk fails closed when the MCP catalog is empty', async () => {
  const app = createApp({
    listMcpTools: async () => [],
  });
  const server = await listen(app);
  try {
    const created = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: 'convo-1', sdp: 'offer' }),
    });
    assert.equal(created.status, 502);
    const body = await created.json();
    assert.equal(body.error, 'mcp_tools_unavailable');
  } finally {
    resetLiveTalkSessions();
    server.close();
  }
});

test('a new Live Talk start replaces a leftover session for the same user', async () => {
  const app = createApp();
  const server = await listen(app);
  try {
    const first = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: 'convo-1', sdp: 'offer-1' }),
    });
    assert.equal(first.status, 201);
    const firstSession = await first.json();
    const second = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: 'convo-1', sdp: 'offer-2' }),
    });
    assert.equal(second.status, 201);
    const ping = await fetch(
      `http://127.0.0.1:${server.address().port}/live-talk/session/${firstSession.sessionId}/ping`,
      { method: 'POST' },
    );
    assert.equal(ping.status, 404);
  } finally {
    resetLiveTalkSessions();
    server.close();
  }
});

test('Live Talk can start from a new Instructor Assistant thread', async () => {
  const saved = [];
  const app = createApp({
    saveConvo: async (_ctx, convo) => {
      saved.push(convo);
      return convo;
    },
  });
  const server = await listen(app);
  try {
    const created = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: 'new', sdp: 'offer' }),
    });
    assert.equal(created.status, 201);
    const session = await created.json();
    assert.ok(session.conversationId);
    assert.notEqual(session.conversationId, 'new');
    assert.equal(saved.length, 1);
    assert.equal(saved[0].conversationId, session.conversationId);
  } finally {
    resetLiveTalkSessions();
    server.close();
  }
});

test('student spec starts Live Talk against student MCP', async () => {
  const saved = [];
  const listed = [];
  const called = [];
  const app = createApp({
    getAgent: async ({ id }) => ({
      instructions: id === 'agent_student_caddie' ? 'You are Student Caddie.' : 'Instructor',
    }),
    saveConvo: async (_ctx, convo) => {
      saved.push(convo);
      return convo;
    },
    listMcpTools: async ({ config }) => {
      listed.push(config.serverName);
      return [
        { name: 'get_student_briefing', description: 'Briefing', inputSchema: { type: 'object' } },
        { name: 'open_app_screen', description: 'Open a page', inputSchema: { type: 'object' } },
      ];
    },
    callMcpTool: async ({ serverName, toolName }) => {
      called.push({ serverName, toolName });
      return { ok: true, toolName };
    },
    bootstrapOpenAi: async ({ session }) => {
      assert.match(session.instructions, /Student Caddie/);
      assert.equal(
        session.tools.some((tool) => tool.name === 'get_student_briefing'),
        true,
      );
      return 'answer-sdp';
    },
  });
  const server = await listen(app);
  try {
    const created = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: 'new', spec: 'student-caddie', sdp: 'offer' }),
    });
    assert.equal(created.status, 201);
    const session = await created.json();
    assert.deepEqual(listed, ['lessoncaddie-student']);
    assert.equal(saved[0].agent_id, 'agent_student_caddie');
    const tool = await fetch(
      `http://127.0.0.1:${server.address().port}/live-talk/session/${session.sessionId}/tool`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'get_student_briefing', arguments: {} }),
      },
    );
    assert.equal(tool.status, 200);
    assert.deepEqual(called, [
      { serverName: 'lessoncaddie-student', toolName: 'get_student_briefing' },
    ]);
  } finally {
    resetLiveTalkSessions();
    server.close();
  }
});

test('instructor spec keeps instructor MCP even on a leftover student thread', async () => {
  const listed = [];
  const app = createApp({
    getConvo: async (userId, conversationId) => ({
      conversationId,
      agent_id: 'agent_student_caddie',
      lastMessageId: 'msg-root',
    }),
    listMcpTools: async ({ config }) => {
      listed.push(config.serverName);
      return [{ name: 'search_directory', description: 'Search', inputSchema: { type: 'object' } }];
    },
    bootstrapOpenAi: async () => 'answer-sdp',
  });
  const server = await listen(app);
  try {
    const created = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'student-thread',
        spec: 'instructor-assistant',
        sdp: 'offer',
      }),
    });
    assert.equal(created.status, 201);
    assert.deepEqual(listed, ['lessoncaddie-instructor']);
    const config = await fetch(
      `http://127.0.0.1:${server.address().port}/live-talk/config?spec=instructor-assistant`,
    );
    assert.equal(config.status, 200);
    const body = await config.json();
    assert.equal(body.mcpServer, 'lessoncaddie-instructor');
    assert.equal(body.spec, 'instructor-assistant');
  } finally {
    resetLiveTalkSessions();
    server.close();
  }
});

test('student conversation threads keep student MCP even without spec', async () => {
  const listed = [];
  const app = createApp({
    getConvo: async (userId, conversationId) => ({
      conversationId,
      agent_id: 'agent_student_caddie',
      lastMessageId: 'msg-root',
    }),
    listMcpTools: async ({ config }) => {
      listed.push(config.serverName);
      return [
        {
          name: 'find_activities',
          description: 'Find activities',
          inputSchema: { type: 'object' },
        },
      ];
    },
    bootstrapOpenAi: async () => 'answer-sdp',
  });
  const server = await listen(app);
  try {
    const created = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: 'student-thread', sdp: 'offer' }),
    });
    assert.equal(created.status, 201);
    assert.deepEqual(listed, ['lessoncaddie-student']);
  } finally {
    resetLiveTalkSessions();
    server.close();
  }
});

test('a second instructor cannot use another instructor session', async () => {
  const app = createApp();
  const server = await listen(app);
  try {
    const created = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: 'convo-1', sdp: 'offer' }),
    });
    const session = await created.json();
    const other = await fetch(
      `http://127.0.0.1:${server.address().port}/live-talk/session/${session.sessionId}/tool`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-user': 'instructor-2' },
        body: JSON.stringify({ name: 'search_directory', arguments: {} }),
      },
    );
    assert.equal(other.status, 403);
    const body = await other.json();
    assert.equal(body.error, 'session_forbidden');
  } finally {
    resetLiveTalkSessions();
    server.close();
  }
});
