'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { resolveLiveTalkConfig } = require('./liveTalkConfig');
const { createLiveTalkRouter, resetLiveTalkSessions } = require('./liveTalkRoutes');

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
      bootstrapOpenAi: async ({ session }) => {
        assert.equal(
          session.tools.some((tool) => tool.name === 'create_lesson'),
          true,
        );
        assert.equal(
          session.tools.some((tool) => tool.name === 'search_directory'),
          true,
        );
        assert.equal(session.audio?.input?.turn_detection?.type, 'server_vad');
        assert.equal(session.audio?.input?.turn_detection?.create_response, true);
        return 'answer-sdp';
      },
      ...overrides,
    }),
  );
  return app;
}

test('Live Talk bootstraps a session with the live MCP catalog including writes', async () => {
  const app = createApp();
  const server = await listen(app);
  try {
    const created = await fetch(`http://127.0.0.1:${server.address().port}/live-talk/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: 'convo-1', sdp: 'offer' }),
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
