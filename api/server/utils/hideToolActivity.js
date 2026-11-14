/**
 * SSM Labs fork patch — docs/ssmlabs-fork-patches.md
 * New file (not upstream). Server-side stand-in for hide_sequential_outputs, which does not
 * hide MCP “Ran tool” cards on v0.8.9-rc1. Navigation tool events are not dropped so the
 * config/ssmlabs navigation overlay can still read open_app_screen results.
 * When those cards are hidden, the first dropped tool call also streams a live-only
 * “Looking up {name}…” message_creation step so the instructor sees progress before TTFT.
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

function parseToolArgs(call) {
  const raw = call?.args ?? call?.function?.arguments ?? call?.delta?.args ?? call?.tool_call?.args;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw !== 'string' || !raw.trim()) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function displayPerson(value) {
  const tokens = String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length || tokens.join(' ').length > 80) {
    return '';
  }
  return tokens
    .map((token) =>
      token === token.toLowerCase() ? `${token.charAt(0).toUpperCase()}${token.slice(1)}` : token,
    )
    .join(' ');
}

function lookupPersonFromCall(call) {
  const args = parseToolArgs(call);
  if (!args) {
    return '';
  }
  return displayPerson(args.name || args.query || args.studentName || args.displayName || '');
}

function genericLookupText(toolName) {
  const name = String(toolName || '');
  if (name.includes('search_lessons') || name.includes('get_lesson')) {
    return 'Looking up lessons…';
  }
  if (name.includes('search_directory')) {
    return 'Looking up your directory…';
  }
  if (name.includes('get_student') || name.includes('get_contact')) {
    return 'Looking up student…';
  }
  if (!name) {
    return '';
  }
  return 'Looking that up…';
}

function firstDroppedLookupCall(eventData) {
  return (
    collectToolCallRecords(eventData).find((call) => !isNavigationToolName(toolCallName(call))) ||
    null
  );
}

function lookupProgressText(eventData) {
  if (!shouldDropToolSse(eventData)) {
    return '';
  }
  const call = firstDroppedLookupCall(eventData);
  if (!call) {
    return '';
  }
  const person = lookupPersonFromCall(call);
  if (person) {
    return `Looking up ${person}…`;
  }
  if (parseToolArgs(call) == null) {
    return '';
  }
  return genericLookupText(toolCallName(call));
}

function buildLookupProgressEvents(eventData) {
  const text = lookupProgressText(eventData);
  if (!text) {
    return [];
  }
  const data = eventData?.data || {};
  const runId = data.runId || data.id || 'lc-lookup';
  const stepId = 'lc-lookup-progress';
  const index = Number.isInteger(data.index) ? data.index : 0;
  return [
    {
      event: 'on_run_step',
      data: {
        id: stepId,
        runId,
        index,
        type: StepTypes.MESSAGE_CREATION,
        stepDetails: {
          type: StepTypes.MESSAGE_CREATION,
          message_creation: { message_id: stepId },
        },
      },
    },
    {
      event: 'on_message_delta',
      data: {
        id: stepId,
        delta: {
          content: [{ type: 'text', text }],
        },
      },
    },
  ];
}

module.exports = {
  hideToolActivityEnabled,
  shouldHideToolActivityForUser,
  redactMessagesForClient,
  shouldDropToolSse,
  isNavigationToolName,
  eventHasNavigationTool,
  lookupProgressText,
  buildLookupProgressEvents,
};
