'use strict';

const crypto = require('node:crypto');

const PROVIDER = 'lessoncaddie';
const ISSUER_NAME = 'lessoncaddie-firebase';
const MAX_RETURN_TO_LENGTH = 2048;

function trimString(value) {
  return String(value || '').trim();
}

function envFlag(name, env = process.env) {
  const raw = trimString(env[name]).toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
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

function resolveSsoConfig(env = process.env) {
  const homeUrl = trimString(env.LESSONCADDIE_HOME_URL) || 'https://lessoncaddie.ssmlabs.com/app';
  const issuer = trimString(env.LESSONCADDIE_SSO_ISSUER) || originOf(homeUrl);
  const secret = trimString(env.LESSONCADDIE_SSO_SHARED_SECRET);
  const enabled = envFlag('LESSONCADDIE_SSO_ENABLED', env) && Boolean(secret) && Boolean(issuer);
  const allowedReturnOrigins = new Set(
    [originOf(homeUrl), issuer]
      .concat(
        String(env.LESSONCADDIE_ALLOWED_ORIGINS || '')
          .split(',')
          .map((part) => originOf(part.includes('://') ? part : `https://${part}`)),
      )
      .filter(Boolean),
  );
  return {
    enabled,
    secret,
    issuer: issuer.replace(/\/$/, ''),
    homeUrl,
    allowedReturnOrigins: [...allowedReturnOrigins],
    environment: trimString(env.LESSONCADDIE_SSO_ENVIRONMENT || 'stage'),
  };
}

function sanitizeAppReturnTo(candidate, allowedOrigins, fallback) {
  const raw = trimString(candidate);
  if (!raw || raw.length > MAX_RETURN_TO_LENGTH) {
    return fallback;
  }
  if (raw === 'about:blank') {
    return raw;
  }
  if (raw.startsWith('/') && !raw.startsWith('//')) {
    return raw;
  }
  try {
    const url = new URL(raw);
    if (url.username || url.password) {
      return fallback;
    }
    const httpLocal = url.protocol === 'http:' && isLocalHttpHost(url.hostname);
    if (url.protocol !== 'https:' && !httpLocal) {
      return fallback;
    }
    if (!allowedOrigins.includes(url.origin)) {
      return fallback;
    }
    return url.toString();
  } catch {
    return fallback;
  }
}

function buildLessonCaddieStartUrl(config, returnTo, state) {
  const url = new URL(config.homeUrl);
  url.searchParams.set('librechatSsoReturn', returnTo || '/c/new');
  url.searchParams.set('librechatSsoState', state);
  return url.toString();
}

function ssoBrowserStateAllowsCallback(queryState, cookieState) {
  const state = trimString(queryState);
  const cookie = trimString(cookieState);
  if (!state) {
    return false;
  }
  if (!cookie) {
    // Persistent iframe SSO loads /callback directly. LessonCaddie redeem binds code+state.
    return true;
  }
  if (state.length !== cookie.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(state), Buffer.from(cookie));
}

function mapIdentityError(code) {
  if (code === 'LINK_REQUIRED') {
    return {
      status: 409,
      message:
        'This email already has a LibreChat account. An administrator must link it before SSO can continue.',
    };
  }
  if (code === 'LINK_MISSING') {
    return {
      status: 409,
      message: 'The linked LibreChat account is missing. An administrator must repair the mapping.',
    };
  }
  if (code === 'LINK_CONFLICT') {
    return {
      status: 409,
      message: 'This LessonCaddie identity is already linked to a different LibreChat account.',
    };
  }
  return { status: 401, message: 'LibreChat sign-in failed.' };
}

async function resolveLibreChatUser(identity, models) {
  const { findUser, updateUser, createUserIfAbsent } = models;
  const firebaseUid = trimString(identity.firebaseUid);
  const email = trimString(identity.email).toLowerCase();
  if (!firebaseUid || !email) {
    const error = new Error('Incomplete SSO identity');
    error.code = 'INVALID_IDENTITY';
    throw error;
  }

  const existing = await findUser({ provider: PROVIDER, openidId: firebaseUid });
  if (existing) {
    return existing;
  }

  const linkedId = trimString(identity.linkedLibreChatUserId);
  if (linkedId) {
    const linked = await findUser({ _id: linkedId });
    if (!linked) {
      const missing = new Error('Linked LibreChat account is missing');
      missing.code = 'LINK_MISSING';
      throw missing;
    }
    const existingOpenId = trimString(linked.openidId);
    if (existingOpenId && existingOpenId !== firebaseUid) {
      const conflict = new Error('LibreChat account is linked to a different LessonCaddie user');
      conflict.code = 'LINK_CONFLICT';
      throw conflict;
    }
    await updateUser(linked._id, {
      provider: PROVIDER,
      openidId: firebaseUid,
      openidIssuer: ISSUER_NAME,
    });
    return findUser({ _id: linked._id });
  }

  const created = await createUserIfAbsent({
    email,
    emailVerified: identity.emailVerified === true,
    name: trimString(identity.name) || email.split('@')[0],
    username: `lc_${firebaseUid.slice(0, 20)}`,
    provider: PROVIDER,
    openidId: firebaseUid,
    openidIssuer: ISSUER_NAME,
    role: 'USER',
  });
  if (created.ok) {
    return created.value;
  }

  const byEmail = await findUser({ email });
  if (byEmail?.provider === PROVIDER && byEmail.openidId === firebaseUid) {
    return byEmail;
  }
  const error = new Error('LibreChat account exists and is not linked');
  error.code = 'LINK_REQUIRED';
  throw error;
}

async function redeemWithLessonCaddie(config, { code, state, origin }) {
  const response = await fetch(`${config.issuer}/api/auth/librechat-sso/redeem`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.secret}`,
      'Content-Type': 'application/json',
      'X-LibreChat-Origin': origin,
    },
    body: JSON.stringify({ code, state, origin }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'SSO redeem failed');
    error.status = response.status;
    error.code = payload.code || 'invalid_grant';
    throw error;
  }
  if (payload.environment && config.environment && payload.environment !== config.environment) {
    const error = new Error('Wrong environment identity');
    error.status = 403;
    error.code = 'wrong_environment';
    throw error;
  }
  return payload;
}

async function introspectWithLessonCaddie(config, { firebaseUid, issuedAt }) {
  const response = await fetch(`${config.issuer}/api/auth/librechat-sso/introspect`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ firebaseUid, issuedAt }),
  });
  if (!response.ok) {
    return { active: false, reason: 'introspect_failed' };
  }
  return response.json();
}

module.exports = {
  PROVIDER,
  ISSUER_NAME,
  resolveSsoConfig,
  sanitizeAppReturnTo,
  buildLessonCaddieStartUrl,
  ssoBrowserStateAllowsCallback,
  mapIdentityError,
  resolveLibreChatUser,
  redeemWithLessonCaddie,
  introspectWithLessonCaddie,
};
