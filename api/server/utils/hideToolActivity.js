const { StepTypes, SystemRoles } = require('librechat-data-provider');

function hideToolActivityEnabled() {
  const value = String(process.env.HIDE_TOOL_ACTIVITY || '').trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}

function shouldHideToolActivityForUser(user) {
  return hideToolActivityEnabled() && user?.role !== SystemRoles.ADMIN;
}

function redactToolCallPart(part) {
  const toolCall = part?.tool_call;
  if (!toolCall || typeof toolCall !== 'object') {
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
  if (data?.delta?.type === StepTypes.TOOL_CALLS || data?.stepDetails?.type === StepTypes.TOOL_CALLS) {
    return !toolCallsHaveAuth(eventData);
  }
  return false;
}

module.exports = {
  hideToolActivityEnabled,
  shouldHideToolActivityForUser,
  redactMessagesForClient,
  shouldDropToolSse,
};
