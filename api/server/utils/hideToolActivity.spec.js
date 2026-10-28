const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  shouldDropToolSse,
  redactMessagesForClient,
  eventHasNavigationTool,
} = require('./hideToolActivity');

const NAV_OUTPUT = JSON.stringify({
  type: 'lessoncaddie.navigation',
  version: 1,
  destination: 'start-lesson',
  params: {},
  requestId: 'req-1',
});

test('drops ordinary tool-call SSE but keeps open_app_screen', () => {
  const ordinary = {
    event: 'on_run_step',
    data: {
      stepDetails: {
        type: 'tool_calls',
        tool_calls: [{ id: '1', name: 'search_directory' }],
      },
    },
  };
  const navigation = {
    event: 'on_run_step',
    data: {
      stepDetails: {
        type: 'tool_calls',
        tool_calls: [{ id: '2', name: 'open_app_screen_mcp_lessoncaddie-instructor' }],
      },
    },
  };
  assert.equal(shouldDropToolSse(ordinary), true);
  assert.equal(shouldDropToolSse(navigation), false);
  assert.equal(eventHasNavigationTool(navigation), true);
});

test('keeps completed navigation tool results named on result.tool_call', () => {
  const completed = {
    event: 'on_run_step_completed',
    data: {
      result: {
        tool_call: {
          id: '2',
          name: 'open_app_screen',
          output: NAV_OUTPUT,
        },
      },
    },
  };
  assert.equal(shouldDropToolSse(completed), false);
  assert.equal(eventHasNavigationTool(completed), true);
});

test('does not redact stored open_app_screen tool parts', () => {
  const messages = redactMessagesForClient([
    {
      content: [
        {
          type: 'tool_call',
          tool_call: {
            id: 'nav',
            name: 'open_app_screen_mcp_lessoncaddie-instructor',
            output: NAV_OUTPUT,
          },
        },
        {
          type: 'tool_call',
          tool_call: { id: 'other', name: 'search_directory', output: 'secret' },
        },
      ],
    },
  ]);
  assert.equal(messages[0].content[0].tool_call.output, NAV_OUTPUT);
  assert.equal(
    messages[0].content[0].tool_call.name,
    'open_app_screen_mcp_lessoncaddie-instructor',
  );
  assert.equal(messages[0].content[1].tool_call.name, 'action');
  assert.equal(messages[0].content[1].tool_call.output, '');
});
