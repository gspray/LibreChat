'use strict';

/** SSM Labs Live Talk — same MCP catalog as typed Ask for the active Caddie pack. */
const DEFAULT_SERVER = 'lessoncaddie-instructor';
const DEFAULT_AGENT_ID = 'agent_instructor_assistant';
const STUDENT_SERVER = 'lessoncaddie-student';
const STUDENT_AGENT_ID = 'agent_student_caddie';

const LIVE_TALK_PACKS = Object.freeze({
  instructor: Object.freeze({
    id: 'instructor',
    spec: 'instructor-assistant',
    agentId: DEFAULT_AGENT_ID,
    serverName: DEFAULT_SERVER,
    displayName: 'Instructor Assistant',
  }),
  student: Object.freeze({
    id: 'student',
    spec: 'student-caddie',
    agentId: STUDENT_AGENT_ID,
    serverName: STUDENT_SERVER,
    displayName: 'Student Caddie',
  }),
});
const DEFAULT_MODEL = 'gpt-realtime';
const DEFAULT_VOICE = 'marin';
const DEFAULT_MAX_SESSION_MS = 15 * 60 * 1000;
const DEFAULT_IDLE_MS = 2 * 60 * 1000;
const DEFAULT_MAX_SESSIONS_PER_USER = 1;
const DEFAULT_VAD_TYPE = 'semantic_vad';
const DEFAULT_VAD_EAGERNESS = 'medium';
const DEFAULT_VAD_THRESHOLD = 0.75;
const DEFAULT_VAD_PREFIX_PADDING_MS = 300;
const DEFAULT_VAD_SILENCE_MS = 900;

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function parseUnitInterval(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(1, Math.max(0, parsed));
}

function parseBoolean(value, fallback) {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  if (raw === '1' || raw === 'true' || raw === 'yes') return true;
  if (raw === '0' || raw === 'false' || raw === 'no') return false;
  return fallback;
}

function parseVadType(value) {
  const raw = String(value || '')
    .trim()
    .toLowerCase();
  return raw === 'server_vad' ? 'server_vad' : DEFAULT_VAD_TYPE;
}

function parseVadEagerness(value) {
  const raw = String(value || '')
    .trim()
    .toLowerCase();
  return ['low', 'medium', 'high', 'auto'].includes(raw) ? raw : DEFAULT_VAD_EAGERNESS;
}

function resolveLiveTalkPack({ spec, agentId } = {}) {
  const requestedSpec = String(spec || '').trim();
  const requestedAgent = String(agentId || '').trim();
  if (requestedSpec === LIVE_TALK_PACKS.student.spec) return LIVE_TALK_PACKS.student;
  if (requestedSpec === LIVE_TALK_PACKS.instructor.spec) return LIVE_TALK_PACKS.instructor;
  if (requestedAgent === STUDENT_AGENT_ID) return LIVE_TALK_PACKS.student;
  if (requestedAgent === DEFAULT_AGENT_ID) return LIVE_TALK_PACKS.instructor;
  if (!requestedSpec && !requestedAgent) {
    return LIVE_TALK_PACKS.instructor;
  }
  return null;
}

function applyLiveTalkPack(config, pack) {
  if (!pack) return config;
  return {
    ...config,
    agentId: pack.agentId,
    serverName: pack.serverName,
    packId: pack.id,
    displayName: pack.displayName,
  };
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
    vadType: parseVadType(env.LIVE_TALK_VAD_TYPE),
    vadEagerness: parseVadEagerness(env.LIVE_TALK_VAD_EAGERNESS),
    vadThreshold: parseUnitInterval(env.LIVE_TALK_VAD_THRESHOLD, DEFAULT_VAD_THRESHOLD),
    vadPrefixPaddingMs: parsePositiveInt(
      env.LIVE_TALK_VAD_PREFIX_PADDING_MS,
      DEFAULT_VAD_PREFIX_PADDING_MS,
    ),
    vadSilenceMs: parsePositiveInt(env.LIVE_TALK_VAD_SILENCE_MS, DEFAULT_VAD_SILENCE_MS),
    interruptResponse: parseBoolean(env.LIVE_TALK_INTERRUPT_RESPONSE, false),
  };
}

const WAIT_FOR_YOU = ['patient', 'balanced', 'fast'];
const VOICES = ['marin', 'cedar', 'shimmer', 'verse', 'alloy'];
const WAIT_PRESETS = {
  patient: {
    vadEagerness: 'medium',
    vadThreshold: 0.75,
    vadSilenceMs: 700,
    vadPrefixPaddingMs: 300,
  },
  balanced: {
    vadEagerness: 'medium',
    vadThreshold: 0.55,
    vadSilenceMs: 600,
    vadPrefixPaddingMs: 250,
  },
  fast: { vadEagerness: 'high', vadThreshold: 0.4, vadSilenceMs: 400, vadPrefixPaddingMs: 200 },
};

function normalizeLiveVoiceSettings(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const waitForYou = WAIT_FOR_YOU.includes(
    String(src.waitForYou || '')
      .trim()
      .toLowerCase(),
  )
    ? String(src.waitForYou).trim().toLowerCase()
    : 'patient';
  const voiceRaw = String(src.voice || '')
    .trim()
    .toLowerCase();
  return {
    waitForYou,
    allowInterrupt: src.allowInterrupt === true,
    ignoreBackgroundNoise: src.ignoreBackgroundNoise !== false,
    muteMicWhileSheTalks: src.muteMicWhileSheTalks !== false,
    voice: VOICES.includes(voiceRaw) ? voiceRaw : '',
  };
}

function applyLiveVoiceToConfig(config, liveVoice) {
  const settings = normalizeLiveVoiceSettings(liveVoice);
  const preset = WAIT_PRESETS[settings.waitForYou] || WAIT_PRESETS.patient;
  return {
    ...config,
    vadType: settings.ignoreBackgroundNoise ? 'semantic_vad' : 'server_vad',
    vadEagerness: preset.vadEagerness,
    vadThreshold: preset.vadThreshold,
    vadSilenceMs: preset.vadSilenceMs,
    vadPrefixPaddingMs: preset.vadPrefixPaddingMs,
    interruptResponse: settings.allowInterrupt,
    voice: settings.voice || config.voice,
    holdInput: settings.muteMicWhileSheTalks,
    interruption: settings.allowInterrupt ? 'enabled' : 'disabled',
  };
}

function liveTalkTurnDetection(config = resolveLiveTalkConfig(), options = {}) {
  const interrupt_response = config.interruptResponse === true;
  const create_response = options.createResponse !== false;
  if (config.vadType === 'server_vad') {
    return {
      type: 'server_vad',
      threshold: config.vadThreshold,
      prefix_padding_ms: config.vadPrefixPaddingMs,
      silence_duration_ms: config.vadSilenceMs,
      create_response,
      interrupt_response,
    };
  }
  return {
    type: 'semantic_vad',
    eagerness: config.vadEagerness,
    create_response,
    interrupt_response,
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

function liveTalkInstructions(agentInstructions, pack) {
  const base = String(agentInstructions || '').trim();
  const isStudent = pack?.id === 'student';
  const extra = [
    isStudent
      ? 'You are in LessonCaddie Live Talk, the spoken form of Student Caddie.'
      : 'You are in LessonCaddie Live Talk, the spoken form of Instructor Assistant.',
    'Always speak American English. Do not switch languages, even briefly, unless the user clearly speaks another language first; then match that language. Never start or continue in Chinese, Japanese, Korean, or any other language on your own.',
    'Do not introduce yourself, greet the user, or say you are Student Caddie or Instructor Assistant unless the user asks who you are. The only allowed opening line is the exact greeting from a greeting turn. After that greeting, wait silently until the user speaks. Do not call tools or ask a question until the user speaks.',
    isStudent
      ? 'You have the same student LessonCaddie tools as typed Ask. LessonCaddie authorizes each call.'
      : 'You have the same LessonCaddie tools as typed Ask. LessonCaddie authorizes each call.',
    'Speak naturally. LessonCaddie facts must come from tools.',
    isStudent
      ? 'When the user asks to open, go to, or show a page, call open_app_screen. Calendar is destination calendar. Lessons is sessions. Practices is practices. Goals is goals.'
      : 'For how many students or roster size, call search_directory with no query and speak the returned total.',
    isStudent
      ? null
      : 'When the user asks to open, go to, or show a page, call open_app_screen. Calendar is destination calendar. Today is today. Students list is student-list.',
    'Follow the same confirmation rules as typed Chat before mutating data. In voice, do not use Markdown approval links; ask the user to speak a clear approval, then call the tool with confirmed true and a stable mutation ID.',
    'Do not claim a write succeeded until the tool returns success. If LessonCaddie asks for confirmation or denies the action, say that.',
  ]
    .filter(Boolean)
    .join(' ');
  return base ? `${base}\n\n${extra}` : extra;
}

module.exports = {
  LIVE_TALK_PACKS,
  DEFAULT_AGENT_ID,
  STUDENT_AGENT_ID,
  resolveLiveTalkPack,
  applyLiveTalkPack,
  resolveLiveTalkConfig,
  normalizeLiveVoiceSettings,
  applyLiveVoiceToConfig,
  liveTalkTurnDetection,
  liveTalkToolNames,
  isAllowedLiveTalkTool,
  liveTalkInstructions,
};
