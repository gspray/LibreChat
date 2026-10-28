/**
 * SSM Labs fork patch — docs/ssmlabs-fork-patches.md
 * New file (not upstream). Server-side stand-in for hide_sequential_outputs, which does not
 * hide MCP “Ran tool” cards on v0.8.9-rc1. Navigation tool events are not dropped so the
 * config/ssmlabs navigation overlay can still read open_app_screen results.
 */
const { StepTypes, SystemRoles } = require('librechat-data-provider');

const NAVIGATION_TOOL_NAME = 'open_app_screen';

function hideToolActivityEnabled() {
  const value = String(process.env.HIDE_TOOL_ACTIVITY || '')
    .trim()
    .toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}

function shouldHideToolActivityForUser(user) {
  return hideToolActivityEnabled() && user?.role !== SystemRoles.ADMIN;
}

function isNavigationToolName(name) {
  return String(name || '').includes(NAVIGATION_TOOL_NAME);
}

function toolCallName(call) {
  return call?.name || call?.function?.name || call?.delta?.name || call?.tool_call?.name || '';
}

function collectToolCallRecords(eventData) {
  const data = eventData?.data;
  if (!data || typeof data !== 'object') {
    return [];
  }
  const records = [];
  const fromDetails = data.stepDetails?.tool_calls;
  const fromDelta = data.delta?.tool_calls;
  if (Array.isArray(fromDetails)) {
    records.push(...fromDetails);
  }
  if (Array.isArray(fromDelta)) {
    records.push(...fromDelta);
  }
  if (data.result?.tool_call) {
    records.push(data.result.tool_call);
  }
  if (data.tool_call) {
    records.push(data.tool_call);
  }
  return records;
}

function eventHasNavigationTool(eventData) {
  return collectToolCallRecords(eventData).some((call) => isNavigationToolName(toolCallName(call)));
}

function redactToolCallPart(part) {
  const toolCall = part?.tool_call;
  if (!toolCall || typeof toolCall !== 'object') {
    return part;
  }
  if (isNavigationToolName(toolCall.name)) {
    return part;
  }
  if (toolCall.auth) {
    return {
      ...part,
      tool_call: {
        ...toolCall,
        args: '',
        output: undefined,
      },
    };
  }
  return {
    ...part,
    tool_call: {
      id: toolCall.id,
      name: 'action',
      args: '',
      output: '',
      progress: 1,
    },
  };
}

function redactMessagesForClient(messages) {
  if (!Array.isArray(messages)) {
    return messages;
  }
  return messages.map((message) => {
    if (!Array.isArray(message?.content)) {
      return message;
    }
    return {
      ...message,
      content: message.content.map((part) =>
        part?.type === 'tool_call' ? redactToolCallPart(part) : part,
      ),
    };
  });
}

function toolCallsHaveAuth(eventData) {
  const details = eventData?.data?.stepDetails || eventData?.data?.delta;
  const calls = details?.tool_calls;
  if (!Array.isArray(calls)) {
    return Boolean(eventData?.data?.auth || eventData?.data?.tool_call?.auth);
  }
  return calls.some((call) => call?.auth || call?.delta?.auth || call?.tool_call?.auth);
}

function shouldDropToolSse(eventData) {
  const event = String(eventData?.event || '');
  const data = eventData?.data;
  if (event.includes('ptc_tool_call')) {
    return true;
  }
  if (
    data?.delta?.type === StepTypes.TOOL_CALLS ||
    data?.stepDetails?.type === StepTypes.TOOL_CALLS
  ) {
    if (eventHasNavigationTool(eventData)) {
      return false;
    }
    return !toolCallsHaveAuth(eventData);
  }
  return false;
}

module.exports = {
  hideToolActivityEnabled,
  shouldHideToolActivityForUser,
  redactMessagesForClient,
  shouldDropToolSse,
  isNavigationToolName,
  eventHasNavigationTool,
};
