'use strict';

/** SSM Labs overlay — docs/ssmlabs-fork-patches.md. Allow-list + lessonCaddie /api/config payload. */
const STORAGE_KEY = 'ssmlabs.lessoncaddie.returnUrl';
const QUERY_KEYS = ['returnUrl', 'lessoncaddieReturn'];
const DEFAULT_HOME_URL = 'https://lessoncaddie.ssmlabs.com/app';
const MAX_URL_LENGTH = 2048;

function trimString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function originOf(value) {
  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

function isLocalHttpHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function parseAbsoluteUrl(value) {
  const candidate = trimString(value);
  if (!candidate || candidate.length > MAX_URL_LENGTH) {
    return null;
  }
  if (!/^https?:\/\//i.test(candidate)) {
    return null;
  }
  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

function isAllowedLessonCaddieUrl(url, allowedOrigins) {
  if (!url || url.username || url.password) {
    return false;
  }
  if (url.protocol === 'https:') {
    return allowedOrigins.includes(url.origin);
  }
  if (url.protocol === 'http:' && isLocalHttpHost(url.hostname)) {
    return allowedOrigins.includes(url.origin);
  }
  return false;
}

function normalizeAllowedOrigins(raw, homeUrl) {
  const origins = new Set();
  const homeOrigin = originOf(homeUrl);
  if (homeOrigin) {
    origins.add(homeOrigin);
  }
  String(raw || '')
    .split(',')
    .map((part) => trimString(part))
    .filter(Boolean)
    .forEach((part) => {
      const parsed = parseAbsoluteUrl(part.includes('://') ? part : `https://${part}`);
      if (
        parsed &&
        (parsed.protocol === 'https:' ||
          (parsed.protocol === 'http:' && isLocalHttpHost(parsed.hostname)))
      ) {
        origins.add(parsed.origin);
      }
    });
  return [...origins];
}

function sanitizeReturnUrl(candidate, allowedOrigins) {
  const url = parseAbsoluteUrl(candidate);
  if (!url || !isAllowedLessonCaddieUrl(url, allowedOrigins)) {
    return '';
  }
  return url.toString();
}

function readEnvFlag(env, name, defaultWhenUnset) {
  const raw = env[name];
  if (raw === undefined || raw === '') {
    return defaultWhenUnset;
  }
  return !/^(0|false|no|off)$/i.test(String(raw).trim());
}

function resolveLessonCaddieConfig(env = process.env) {
  const requestedHome = trimString(env.LESSONCADDIE_HOME_URL) || DEFAULT_HOME_URL;
  const allowedOrigins = normalizeAllowedOrigins(env.LESSONCADDIE_ALLOWED_ORIGINS, requestedHome);
  const homeUrl = sanitizeReturnUrl(requestedHome, allowedOrigins);
  return {
    homeUrl,
    allowedOrigins,
    storageKey: STORAGE_KEY,
    queryKeys: QUERY_KEYS,
    /** Pre-login safe; drives ssmlabs hide-model-selector overlay (see LESSONCADDIE_HIDE_MODEL_SELECTOR). */
    hideModelSelector: readEnvFlag(env, 'LESSONCADDIE_HIDE_MODEL_SELECTOR', true),
  };
}

function readQueryReturnValue(search) {
  const params = new URLSearchParams(typeof search === 'string' ? search.replace(/^\?/, '') : '');
  for (const key of QUERY_KEYS) {
    const value = trimString(params.get(key) || '');
    if (value) {
      return value;
    }
  }
  return '';
}

function resolveReturnTarget({ queryValue, storedValue, homeUrl, allowedOrigins }) {
  const fromQuery = sanitizeReturnUrl(queryValue, allowedOrigins);
  if (fromQuery) {
    return fromQuery;
  }
  const fromStore = sanitizeReturnUrl(storedValue, allowedOrigins);
  if (fromStore) {
    return fromStore;
  }
  return sanitizeReturnUrl(homeUrl, allowedOrigins);
}

module.exports = {
  STORAGE_KEY,
  QUERY_KEYS,
  DEFAULT_HOME_URL,
  parseAbsoluteUrl,
  sanitizeReturnUrl,
  normalizeAllowedOrigins,
  resolveLessonCaddieConfig,
  readQueryReturnValue,
  resolveReturnTarget,
};
