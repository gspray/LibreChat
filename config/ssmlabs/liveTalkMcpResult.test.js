'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { unwrapMcpResult } = require('./liveTalkMcpResult');

const navigation = {
  type: 'lessoncaddie.navigation',
  version: 1,
  destination: 'calendar',
  params: {},
  requestId: 'nav-formatted-1',
};

test('decodes navigation from LibreChat formatted content tuples', () => {
  const text = { type: 'text', text: JSON.stringify(navigation) };
  assert.deepEqual(unwrapMcpResult([[text], undefined]), navigation);
  assert.deepEqual(unwrapMcpResult([text]), navigation);
  assert.deepEqual(unwrapMcpResult([JSON.stringify(navigation), undefined]), navigation);
});

test('preserves navigation from raw SDK and already decoded results', () => {
  assert.deepEqual(
    unwrapMcpResult({
      structuredContent: navigation,
      content: [{ type: 'text', text: 'Navigation requested' }],
    }),
    navigation,
  );
  assert.deepEqual(
    unwrapMcpResult({ content: [{ type: 'text', text: JSON.stringify(navigation) }] }),
    navigation,
  );
  assert.deepEqual(unwrapMcpResult(navigation), navigation);
});

test('read results and plain tool text retain their existing meaning', () => {
  const account = { timezone: 'America/Phoenix', total: 4 };
  assert.deepEqual(
    unwrapMcpResult([[{ type: 'text', text: JSON.stringify(account) }], undefined]),
    account,
  );
  assert.deepEqual(unwrapMcpResult([[{ type: 'text', text: 'No matching lesson.' }], undefined]), {
    text: 'No matching lesson.',
  });
  assert.deepEqual(unwrapMcpResult({ error: 'Not available' }), { error: 'Not available' });
  assert.equal(unwrapMcpResult(null), null);
});
