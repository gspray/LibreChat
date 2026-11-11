/** SSM Labs fork patch tests — docs/ssmlabs-fork-patches.md */
const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  shouldDropToolSse,
  redactMessagesForClient,
  eventHasNavigationTool,
  lookupProgressText,
  buildLookupProgressEvents,
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

test('lookup progress waits for complete args then names the person', () => {
  const pending = {
    event: 'on_run_step',
    data: {
      id: 'tool-step',
      runId: 'response-1',
      index: 0,
      stepDetails: {
        type: 'tool_calls',
        tool_calls: [{ id: '1', name: 'get_student', args: '' }],
      },
    },
  };
  assert.equal(lookupProgressText(pending), '');
  assert.deepEqual(buildLookupProgressEvents(pending), []);

  const named = {
    event: 'on_run_step_delta',
    data: {
      runId: 'response-1',
      index: 0,
      delta: {
        type: 'tool_calls',
        tool_calls: [{ id: '1', name: 'get_student', args: '{"name":"janet"}' }],
      },
    },
  };
  assert.equal(lookupProgressText(named), 'Looking up Janet…');
  const events = buildLookupProgressEvents(named);
  assert.equal(events[0].event, 'on_run_step');
  assert.equal(events[0].data.type, 'message_creation');
  assert.equal(events[0].data.runId, 'response-1');
  assert.equal(events[1].event, 'on_message_delta');
  assert.equal(events[1].data.delta.content[0].text, 'Looking up Janet…');
});

test('lookup progress uses a generic label when args have no name', () => {
  const listed = {
    event: 'on_run_step',
    data: {
      stepDetails: {
        type: 'tool_calls',
        tool_calls: [{ id: '1', name: 'search_lessons', args: '{}' }],
      },
    },
  };
  assert.equal(lookupProgressText(listed), 'Looking up lessons…');
});
