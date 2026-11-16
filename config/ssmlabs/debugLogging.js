'use strict';

const debugLogging = { navigation: false, liveTalk: false };
let refreshAfter = 0;
let pending;

/** Public diagnostic flags only; no credentials or changes to tool eligibility. */
async function refreshDebugLogging() {
  if (pending) return pending;
  if (Date.now() < refreshAfter) return debugLogging;
  refreshAfter = Date.now() + 30000;
  pending = (async () => {
    try {
      const url = new URL(
        '/api/app-settings',
        process.env.LESSONCADDIE_HOME_URL || 'https://lessoncaddie.ssmlabs.com/app',
      );
      const response = await fetch(url, { signal: AbortSignal.timeout(3000), cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const settings = (await response.json()).debugLogging;
      debugLogging.navigation = settings?.navigation === true;
      debugLogging.liveTalk = settings?.liveTalk === true;
    } catch (error) {
      debugLogging.navigation = debugLogging.liveTalk = false;
      console.warn(
        'Live Talk diagnostic settings unavailable; diagnostics disabled.',
        error.message,
      );
    }
    return debugLogging;
  })();
  try {
    return await pending;
  } finally {
    pending = null;
  }
}

function liveTalkLog(level, stage, data = {}) {
  const navigation =
    /^delegation\.(navigation|tool)/.test(stage) || stage === 'mcp.proxy.client-action';
  const enabled = navigation ? debugLogging.navigation : debugLogging.liveTalk;
  if (!enabled && level === 'info') return;
  const line = `${enabled ? '[ssmlabs-live-talk]' : 'Live Talk:'} ${stage}`;
  if (level === 'error') console.error(line, data);
  else if (level === 'warn') console.warn(line, data);
  else console.info(line, data);
}

module.exports = { debugLogging, refreshDebugLogging, liveTalkLog };
