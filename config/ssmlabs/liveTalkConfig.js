'use strict';

/** SSM Labs Live Talk — same Instructor Assistant MCP catalog as typed Ask. */
const DEFAULT_SERVER = 'lessoncaddie-instructor';
const DEFAULT_AGENT_ID = 'agent_instructor_assistant';
const DEFAULT_MODEL = 'gpt-realtime';
const DEFAULT_VOICE = 'marin';
const DEFAULT_MAX_SESSION_MS = 15 * 60 * 1000;
const DEFAULT_IDLE_MS = 2 * 60 * 1000;
const DEFAULT_MAX_SESSIONS_PER_USER = 1;

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function resolveLiveTalkConfig(env = process.env) {
  return {
    enabled: true,
    serverName: String(env.LIVE_TALK_MCP_SERVER || DEFAULT_SERVER).trim() || DEFAULT_SERVER,
    agentId: String(env.LIVE_TALK_AGENT_ID || DEFAULT_AGENT_ID).trim() || DEFAULT_AGENT_ID,
    model: String(env.LIVE_TALK_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL,
    voice: String(env.LIVE_TALK_VOICE || DEFAULT_VOICE).trim() || DEFAULT_VOICE,
    openaiApiKey: String(env.OPENAI_API_KEY || '').trim(),
    maxSessionMs: parsePositiveInt(env.LIVE_TALK_MAX_SESSION_MS, DEFAULT_MAX_SESSION_MS),
    idleMs: parsePositiveInt(env.LIVE_TALK_IDLE_MS, DEFAULT_IDLE_MS),
    maxSessionsPerUser: parsePositiveInt(
      env.LIVE_TALK_MAX_SESSIONS_PER_USER,
      DEFAULT_MAX_SESSIONS_PER_USER,
    ),
    speakCoreRevision: String(env.LIVE_TALK_SPEAK_CORE_SHA || '36581f2').trim(),
  };
}

function liveTalkToolNames(mcpTools) {
  const names = new Set();
  for (const tool of Array.isArray(mcpTools) ? mcpTools : []) {
    const name = String(tool?.name || '').trim();
    if (name) names.add(name);
  }
  return names;
}

function isAllowedLiveTalkTool(name, allowedNames) {
  const tool = String(name || '').trim();
  if (!tool || !(allowedNames instanceof Set)) return false;
  return allowedNames.has(tool);
}

function liveTalkInstructions(agentInstructions) {
  const base = String(agentInstructions || '').trim();
  const extra = [
    'You are in LessonCaddie Live Talk, the spoken form of Instructor Assistant.',
    'You have the same LessonCaddie tools as typed Ask. LessonCaddie authorizes each call.',
    'Speak naturally. LessonCaddie facts must come from tools.',
    'For how many students or roster size, call search_directory with no query and speak the returned total.',
    'When the user asks to open, go to, or show a page, call open_app_screen. Calendar is destination calendar. Today is today. Students list is student-list.',
    'Follow the same confirmation rules as typed Chat before mutating data. In voice, do not use Markdown approval links; ask the user to speak a clear approval, then call the tool with confirmed true and a stable mutation ID.',
    'Do not claim a write succeeded until the tool returns success. If LessonCaddie asks for confirmation or denies the action, say that.',
  ].join(' ');
  return base ? `${base}\n\n${extra}` : extra;
}

module.exports = {
  resolveLiveTalkConfig,
  liveTalkToolNames,
  isAllowedLiveTalkTool,
  liveTalkInstructions,
};
