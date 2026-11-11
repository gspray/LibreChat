'use strict';

/** SSM Labs Live Talk — on for this Chat branch. */
const DEFAULT_SERVER = 'lessoncaddie-instructor';
const DEFAULT_AGENT_ID = 'agent_instructor_assistant';
const DEFAULT_MODEL = 'gpt-realtime';
const DEFAULT_VOICE = 'marin';
const DEFAULT_MAX_SESSION_MS = 15 * 60 * 1000;
const DEFAULT_IDLE_MS = 2 * 60 * 1000;
const DEFAULT_MAX_SESSIONS_PER_USER = 1;

const DEFAULT_READ_TOOLS = Object.freeze([
  'get_my_account',
  'resolve_relative_date',
  'search_directory',
  'get_student',
  'search_lessons',
  'get_lesson',
  'get_instructor_briefing',
  'summarize_roster_health',
  'summarize_upcoming_schedule',
  'get_business_overview',
  'get_weather_forecast',
  'open_app_screen',
]);

const VOICE_TOOL_HINTS = Object.freeze({
  get_my_account: 'Read the instructor account, timezone, and local calendar clock.',
  resolve_relative_date:
    'Convert today, tomorrow, or a weekday into YYYY-MM-DD in the instructor timezone.',
  search_directory:
    'Search or list students. Omit query to list the roster. Use the returned total for “how many students.”',
  get_student: 'Read one student by name or contactId.',
  search_lessons: 'Search lessons and use total for lesson counts.',
  get_lesson: 'Read one authorized lesson by lessonId.',
  get_instructor_briefing: 'Read upcoming and recent lessons for a spoken briefing.',
  summarize_roster_health: 'Summarize roster follow-up counts without listing every student.',
  summarize_upcoming_schedule: 'Summarize booked teaching load for the next 28 days.',
  get_business_overview: 'Read My Business headline metrics.',
  get_weather_forecast: 'Read weather for the instructor ZIP or a named location.',
  open_app_screen:
    'Open an app screen only when asked to open, go to, or show that page. Calendar → destination calendar. Stay in voice for lookups.',
});

const DEFAULT_WRITE_TOOLS = Object.freeze([
  'add_student',
  'update_student',
  'delete_student',
  'delete_students_by_filter',
  'generate_lesson_summary',
  'update_lesson_summary_draft',
  'share_lesson_summary',
  'attach_library_media',
  'create_lesson',
  'move_lesson',
  'update_lesson_details',
  'delete_lesson',
  'delete_lessons_by_filter',
  'create_notice',
  'delete_notice',
  'reach_out',
  'create_playbook_system',
  'update_playbook_system',
  'delete_playbook_system',
  'create_playbook_practice',
  'update_playbook_practice',
  'delete_playbook_practice',
  'update_lesson_charges',
  'create_mock_student',
  'create_mock_lesson',
  'create_mock_lessons',
  'set_assistant_conversation_starters',
]);

function parseList(value, fallback) {
  if (value == null || String(value).trim() === '') {
    return [...fallback];
  }
  return String(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function resolveLiveTalkConfig(env = process.env) {
  const readTools = parseList(env.LIVE_TALK_READ_TOOLS, DEFAULT_READ_TOOLS);
  const writeTools = new Set(parseList(env.LIVE_TALK_WRITE_TOOLS, DEFAULT_WRITE_TOOLS));
  const allowlist = readTools.filter((name) => !writeTools.has(name));
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
    allowlist,
    writeTools,
    speakCoreRevision: String(env.LIVE_TALK_SPEAK_CORE_SHA || 'd441d85').trim(),
  };
}

function isAllowedLiveTalkTool(name, config = resolveLiveTalkConfig()) {
  const tool = String(name || '').trim();
  if (!tool) return false;
  if (config.writeTools.has(tool)) return false;
  return config.allowlist.includes(tool);
}

function liveTalkInstructions(agentInstructions) {
  const base = String(agentInstructions || '').trim();
  const extra = [
    'You are in LessonCaddie Live Talk.',
    'Speak naturally. LessonCaddie facts must come from tools.',
    'For how many students or roster size, call search_directory with no query and speak the returned total.',
    'When the user asks to open, go to, or show a page, call open_app_screen. Calendar is destination calendar. Today is today. Students list is student-list.',
    'Only the provided read and navigation tools are available.',
    'If asked to send messages, schedule, change, cancel, or otherwise mutate LessonCaddie data, say that action is not available in Live Talk and they can continue in typed Chat.',
    'Do not claim a write succeeded.',
  ].join(' ');
  return base ? `${base}\n\n${extra}` : extra;
}

function voiceToolHint(name) {
  return VOICE_TOOL_HINTS[String(name || '').trim()] || `LessonCaddie tool ${name}`;
}

module.exports = {
  DEFAULT_READ_TOOLS,
  DEFAULT_WRITE_TOOLS,
  VOICE_TOOL_HINTS,
  resolveLiveTalkConfig,
  isAllowedLiveTalkTool,
  liveTalkInstructions,
  voiceToolHint,
};
