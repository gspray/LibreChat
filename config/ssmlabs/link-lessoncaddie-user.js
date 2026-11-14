'use strict';

/**
 * SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Controlled linking for an existing LibreChat user to a Firebase UID.
 * Does not merge by email automatically.
 *
 * docker exec -it LibreChat node config/ssmlabs/link-lessoncaddie-user.js \
 *   --email person@example.com --firebaseUid FIREBASE_UID
 */

const { PROVIDER, ISSUER_NAME } = require('./lessonCaddieSso');

function readArg(name) {
  const prefix = `--${name}=`;
  const matched = process.argv.find((arg) => arg.startsWith(prefix));
  if (matched) {
    return matched.slice(prefix.length);
  }
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) {
    return process.argv[index + 1];
  }
  return '';
}

async function main() {
  const email = String(readArg('email') || '')
    .trim()
    .toLowerCase();
  const firebaseUid = String(readArg('firebaseUid') || '').trim();
  if (!email || !firebaseUid) {
    throw new Error('Required: --email and --firebaseUid');
  }
  const { findUser, updateUser } = require('~/models');
  const user = await findUser({ email });
  if (!user) {
    throw new Error(`No LibreChat user for ${email}`);
  }
  if (user.openidId && user.openidId !== firebaseUid) {
    throw new Error('User is already linked to a different Firebase UID');
  }
  const alreadyMapped = await findUser({ provider: PROVIDER, openidId: firebaseUid });
  if (alreadyMapped && String(alreadyMapped._id) !== String(user._id)) {
    throw new Error('Firebase UID is already linked to a different LibreChat user');
  }
  await updateUser(user._id, {
    provider: PROVIDER,
    openidId: firebaseUid,
    openidIssuer: ISSUER_NAME,
  });
  console.log(`Linked ${email} -> ${firebaseUid} (LibreChat id ${user._id})`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
