'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createLiveTalkRouter, resetLiveTalkSessions } = require('./liveTalkRoutes');
const { resolveLiveTalkConfig } = require('./liveTalkConfig');

for (const scenario of [
  { name: 'formatted navigation is handed off', rejected: false, plainText: false },
  {
    name: 'structured tool errors cannot report navigation success',
    rejected: true,
    plainText: false,
  },
  {
    name: 'formatted validation errors cannot report navigation success',
    rejected: true,
    plainText: true,
  },
])
  test(`GPT-Live: ${scenario.name} without another model round`, async () => {
    const nativeFetch = global.fetch;
    const originalSecret = process.env.LESSONCADDIE_SSO_SHARED_SECRET;
    process.env.LESSONCADDIE_SSO_SHARED_SECRET = 's'.repeat(32);
    const navigation = {
      type: 'lessoncaddie.navigation',
      version: 1,
      destination: 'calendar',
      params: {},
      requestId: 'nav-immediate-1',
    };
    let modelCalls = 0;
    let toolCalls = 0;
    global.fetch = async (url, options) => {
      if (String(url) !== 'https://api.openai.com/v1/responses') return nativeFetch(url, options);
      modelCalls += 1;
      assert.equal(modelCalls, 1, 'Navigation must reach the browser before another model round');
      const request = JSON.parse(options.body);
      assert.equal(request.tools[0].strict, false);
      assert.deepEqual(request.tools[0].parameters.required, ['destination']);
      return new Response(
        JSON.stringify({
          id: 'response-1',
          output: [
            {
              type: 'function_call',
              name: 'open_app_screen',
              call_id: 'call-1',
              arguments: JSON.stringify({ destination: 'calendar' }),
            },
          ],
        }),
        { headers: { 'content-type': 'application/json' } },
      );
    };
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      req.user = { id: 'navigation-test-user' };
      next();
    });
    app.use(
      '/live-talk',
      createLiveTalkRouter({
        resolveLiveTalkConfig: () => resolveLiveTalkConfig({ OPENAI_API_KEY: 'test-key' }),
        getConvo: async () => ({
          conversationId: 'navigation-test-convo',
          agent_id: 'agent_instructor_assistant',
        }),
        saveConvo: async (_ctx, value) => value,
        getAgent: async () => ({ instructions: 'Open requested pages with open_app_screen.' }),
        saveMessage: async (_ctx, value) => value,
        listMcpTools: async () => [
          {
            name: 'open_app_screen',
            inputSchema: {
              type: 'object',
              properties: {
                destination: { type: 'string' },
                period: { type: 'string', enum: ['this_month', 'last_month'] },
                lessonRef: { type: 'string', enum: ['last', 'upcoming'] },
              },
              required: ['destination'],
              additionalProperties: false,
            },
          },
        ],
        getMcpDelegation: async () => ({
          serverUrl: 'https://mcp.example.test/api/instructor-mcp',
          firebaseUid: 'test-instructor',
        }),
        readSessionUsage: async () => ({ totalMs: 0, quotaMinutes: 60 }),
        bootstrapGptLive: async () => ({ sdp: 'answer-sdp', sessionId: 'provider-test' }),
        callMcpTool: async ({ toolArguments }) => {
          toolCalls += 1;
          assert.deepEqual(toolArguments, { destination: 'calendar' });
          if (scenario.plainText)
            return ['Details need attention: Invalid instructor read tool arguments.', undefined];
          if (scenario.rejected)
            return {
              isError: true,
              structuredContent: {
                ok: false,
                code: 'INVALID_ARGUMENTS',
                message: 'Invalid instructor read tool arguments.',
              },
            };
          return [[{ type: 'text', text: JSON.stringify(navigation) }], undefined];
        },
      }),
    );
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}/live-talk`;
    try {
      const created = await nativeFetch(`${base}/session`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          conversationId: 'navigation-test-convo',
          sdp: 'offer',
          liveVoice: { provider: 'gpt-live' },
        }),
      });
      assert.equal(created.status, 201);
      const { sessionId } = await created.json();
      const response = await nativeFetch(`${base}/session/${sessionId}/delegation`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ delegationId: 'delegation-1', utterance: 'Open Calendar' }),
      });
      assert.equal(response.status, 200);
      const payload = await response.json();
      assert.deepEqual(
        payload.actions,
        scenario.rejected ? [] : [{ name: 'open_app_screen', result: navigation }],
      );
      assert.equal(
        payload.reply,
        scenario.rejected
          ? 'I could not open the requested page. Please try opening it from the app menu.'
          : 'Waiting for the app to open the requested page.',
      );
      assert.equal(modelCalls, 1);
      assert.equal(toolCalls, 1);
    } finally {
      global.fetch = nativeFetch;
      if (originalSecret === undefined) delete process.env.LESSONCADDIE_SSO_SHARED_SECRET;
      else process.env.LESSONCADDIE_SSO_SHARED_SECRET = originalSecret;
      resetLiveTalkSessions();
      await new Promise((resolve) => server.close(resolve));
    }
  });
