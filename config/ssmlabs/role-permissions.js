/**
 * Snapshot and reconcile the role permissions used by LessonCaddie Chat.
 * Run inside the LibreChat API container so MONGO_URI identifies that instance.
 */
const fs = require('node:fs');
const path = require('node:path');

const manifestPath = path.join(__dirname, 'role-permissions.json');
const roleNames = ['ADMIN', 'USER'];
const permissionKeys = {
  BOOKMARKS: ['USE'],
  PROMPTS: ['USE', 'CREATE', 'SHARE', 'SHARE_PUBLIC'],
  MEMORIES: ['USE', 'CREATE', 'READ', 'UPDATE', 'OPT_OUT'],
  AGENTS: ['USE', 'CREATE', 'SHARE', 'SHARE_PUBLIC'],
  MULTI_CONVO: ['USE'],
  TEMPORARY_CHAT: ['USE'],
  RUN_CODE: ['USE'],
  WEB_SEARCH: ['USE'],
  PEOPLE_PICKER: ['VIEW_USERS', 'VIEW_ROLES', 'VIEW_GROUPS'],
  MARKETPLACE: ['USE'],
  FILE_SEARCH: ['USE'],
  FILE_CITATIONS: ['USE'],
  MCP_SERVERS: ['USE', 'CREATE', 'SHARE', 'SHARE_PUBLIC', 'CONFIGURE_OBO'],
  REMOTE_AGENTS: ['USE', 'CREATE', 'SHARE', 'SHARE_PUBLIC'],
  SKILLS: ['USE', 'CREATE', 'SHARE', 'SHARE_PUBLIC'],
  SHARED_LINKS: ['CREATE', 'SHARE', 'SHARE_PUBLIC'],
  SCHEDULES: ['USE', 'CREATE'],
};
const permissionTypes = Object.keys(permissionKeys);

function validateSnapshot(snapshot) {
  if (
    !snapshot ||
    snapshot.version !== 1 ||
    snapshot.source !== 'dev' ||
    !snapshot.roles ||
    typeof snapshot.roles !== 'object'
  ) {
    throw new Error('Invalid role permission snapshot');
  }
  if (Object.keys(snapshot.roles).sort().join(',') !== roleNames.slice().sort().join(',')) {
    throw new Error('Snapshot must contain exactly ADMIN and USER roles');
  }
  for (const roleName of roleNames) {
    const permissions = snapshot.roles[roleName];
    if (
      !permissions ||
      Object.keys(permissions).sort().join(',') !== permissionTypes.slice().sort().join(',')
    ) {
      throw new Error(`Invalid permission types for ${roleName}`);
    }
    for (const permissionType of permissionTypes) {
      const actualKeys = Object.keys(permissions[permissionType] || {}).sort();
      const expectedKeys = permissionKeys[permissionType].slice().sort();
      if (actualKeys.join(',') !== expectedKeys.join(',')) {
        throw new Error(`Invalid ${roleName}.${permissionType} permissions`);
      }
      for (const key of expectedKeys) {
        if (typeof permissions[permissionType][key] !== 'boolean') {
          throw new Error(`${roleName}.${permissionType}.${key} must be boolean`);
        }
      }
    }
  }
  if (snapshot.roles.USER.AGENTS.USE !== true || snapshot.roles.USER.MCP_SERVERS.USE !== true) {
    throw new Error('USER must retain agent and MCP use for Instructor Assistant');
  }
  if (snapshot.roles.USER.AGENTS.CREATE || snapshot.roles.USER.MCP_SERVERS.CREATE
    || snapshot.roles.USER.SKILLS.USE || snapshot.roles.USER.SKILLS.CREATE) {
    throw new Error('USER cannot create agents or MCP servers or use skills');
  }
  return snapshot;
}

function snapshotFromRoles(roles) {
  const byName = Object.fromEntries(roles.map((role) => [role.name, role]));
  const snapshot = { version: 1, source: 'dev', roles: {} };
  for (const roleName of roleNames) {
    if (!byName[roleName]) {
      throw new Error(`Missing ${roleName} role`);
    }
    snapshot.roles[roleName] = {};
    for (const permissionType of permissionTypes) {
      snapshot.roles[roleName][permissionType] = {};
      for (const key of permissionKeys[permissionType]) {
        snapshot.roles[roleName][permissionType][key] =
          byName[roleName].permissions?.[permissionType]?.[key];
      }
    }
  }
  return validateSnapshot(snapshot);
}

function diffPermissions(snapshot, roles) {
  const byName = Object.fromEntries(roles.map((role) => [role.name, role]));
  for (const roleName of roleNames) {
    if (!byName[roleName]) {
      throw new Error(`Missing ${roleName} role in target database`);
    }
  }
  const changes = [];
  for (const roleName of roleNames) {
    for (const permissionType of permissionTypes) {
      for (const key of permissionKeys[permissionType]) {
        const from = byName[roleName].permissions?.[permissionType]?.[key];
        const to = snapshot.roles[roleName][permissionType][key];
        if (from !== to) {
          changes.push({ roleName, permissionType, key, from, to });
        }
      }
    }
  }
  return changes;
}

function requireInstanceEnvironment(expected) {
  const actual = process.env.LIBRECHAT_INSTANCE_ENV;
  if (!actual || actual !== expected) {
    throw new Error(`LIBRECHAT_INSTANCE_ENV must identify this instance as ${expected}`);
  }
}

function assertNoYamlRolePermissions(config) {
  for (const field of ['agents', 'mcpServers', 'skills', 'prompts']) {
    const value = config?.interface?.[field];
    if (
      typeof value === 'boolean' ||
      (value && ['use', 'create', 'share', 'public', 'configureObo'].some((key) => key in value))
    ) {
      throw new Error(`Remove interface.${field} role permissions from librechat.yaml`);
    }
  }
}

async function main(args = process.argv.slice(2)) {
  const [operation, environment, ...extra] = args;
  if (extra.length || !['export', 'check', 'apply'].includes(operation)) {
    throw new Error(
      'Usage: role-permissions.js export dev | check stage|production | apply stage|production',
    );
  }
  if (
    operation === 'export' ? environment !== 'dev' : !['stage', 'production'].includes(environment)
  ) {
    throw new Error('Export requires dev; check/apply require stage or production');
  }
  requireInstanceEnvironment(environment);

  if (operation !== 'export') {
    const yaml = require('js-yaml');
    const configPath = process.env.CONFIG_PATH || path.resolve(process.cwd(), 'librechat.yaml');
    assertNoYamlRolePermissions(yaml.load(fs.readFileSync(configPath, 'utf8')));
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  try {
    const collection = mongoose.connection.db.collection('roles');
    const roleFilter = {
      name: { $in: roleNames },
      tenantId: { $in: [null, undefined] },
    };
    const roles = await collection.find(roleFilter).toArray();
    if (operation === 'export') {
      process.stdout.write(`${JSON.stringify(snapshotFromRoles(roles), null, 2)}\n`);
      return;
    }

    const snapshot = validateSnapshot(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
    const changes = diffPermissions(snapshot, roles);
    for (const change of changes) {
      process.stdout.write(
        `${change.roleName}.${change.permissionType}.${change.key}: ${change.from} -> ${change.to}\n`,
      );
    }
    if (operation === 'check') {
      if (changes.length) process.exitCode = 2;
      return;
    }
    require('module-alias')({ base: path.resolve(__dirname, '../..', 'api') });
    require('@librechat/data-schemas').createModels(mongoose);
    const db = require('../../api/models');
    const updatesByRole = {};
    for (const roleName of roleNames) {
      const current = roles.find((role) => role.name === roleName);
      const target = await db.getRoleByName(roleName);
      if (!target || String(target._id) !== String(current._id)) {
        throw new Error(`Role lookup did not resolve the base ${roleName} role`);
      }
      const permissions = { ...current.permissions };
      for (const permissionType of permissionTypes) {
        permissions[permissionType] = snapshot.roles[roleName][permissionType];
      }
      updatesByRole[roleName] = permissions;
    }
    for (const roleName of roleNames) {
      if (changes.some((change) => change.roleName === roleName)) {
        await db.updateRoleByName(roleName, { permissions: updatesByRole[roleName] });
      }
    }
    const verified = await collection.find(roleFilter).toArray();
    if (diffPermissions(snapshot, verified).length)
      throw new Error('Role permission verification failed');
    process.stdout.write(`Verified ${roleNames.length} roles for ${environment}\n`);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  validateSnapshot,
  snapshotFromRoles,
  diffPermissions,
  assertNoYamlRolePermissions,
  main,
};
