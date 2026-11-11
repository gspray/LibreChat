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
          false,
        );
        assert.equal(
          session.tools.some((tool) => tool.name === 'search_directory'),
          true,
        );
        return 'answer-sdp';
      },
      ...overrides,
    }),
  );
  return app;
}

test('Live Talk bootstraps a session and denies write tools', async () => {
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
    const denied = await fetch(
      `http://127.0.0.1:${server.address().port}/live-talk/session/${session.sessionId}/tool`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'create_lesson', arguments: {} }),
      },
    );
    assert.equal(denied.status, 403);
    const allowed = await fetch(
      `http://127.0.0.1:${server.address().port}/live-talk/session/${session.sessionId}/tool`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'search_directory', arguments: { query: 'Jan' } }),
      },
    );
    assert.equal(allowed.status, 200);
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
