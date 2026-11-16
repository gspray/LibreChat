'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  unwrapMcpToolList,
  readConnectionTools,
  liveTalkMcpRequestBody,
} = require('./attach-live-talk');

test('Live Talk MCP requests carry conversation and unique message IDs', () => {
  const first = liveTalkMcpRequestBody('conversation-1');
  const second = liveTalkMcpRequestBody('conversation-1');
  assert.equal(first.conversationId, 'conversation-1');
  assert.match(first.messageId, /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i);
  assert.notEqual(first.messageId, second.messageId);
});

test('unwrapMcpToolList accepts arrays and { tools }', () => {
  assert.deepEqual(unwrapMcpToolList([{ name: 'search_directory' }]), [
    { name: 'search_directory' },
  ]);
  assert.deepEqual(unwrapMcpToolList({ tools: [{ name: 'get_lesson' }] }), [
    { name: 'get_lesson' },
  ]);
  assert.deepEqual(unwrapMcpToolList(undefined), []);
  assert.deepEqual(unwrapMcpToolList({}), []);
});

test('readConnectionTools prefers MCPConnection.fetchTools', async () => {
  const connection = {
    fetchTools: async () => [{ name: 'search_directory' }, { name: 'get_lesson' }],
    listTools: async () => {
      throw new Error('listTools should not run when fetchTools returns tools');
    },
  };
  const tools = await readConnectionTools(connection);
  assert.deepEqual(
    tools.map((tool) => tool.name),
    ['search_directory', 'get_lesson'],
  );
});

test('readConnectionTools falls back to Client.listTools when fetchTools is missing', async () => {
  const connection = {
    listTools: async () => ({ tools: [{ name: 'get_my_account' }] }),
  };
  const tools = await readConnectionTools(connection);
  assert.equal(tools[0].name, 'get_my_account');
});

test('readConnectionTools treats a missing listTools method as an empty catalog', async () => {
  const tools = await readConnectionTools({});
  assert.deepEqual(tools, []);
});
