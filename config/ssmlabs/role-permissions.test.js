const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const yaml = require('js-yaml');
const {
  validateSnapshot,
  snapshotFromRoles,
  diffPermissions,
  assertNoYamlRolePermissions,
  main,
} = require('./role-permissions');

const snapshot = JSON.parse(fs.readFileSync(path.join(__dirname, 'role-permissions.json'), 'utf8'));
const roles = Object.entries(snapshot.roles).map(([name, permissions]) => ({ name, permissions }));

test('the checked-in permission snapshot has the complete expected shape', () => {
  assert.equal(validateSnapshot(snapshot), snapshot);
  assert.deepEqual(snapshotFromRoles(roles), snapshot);
  assert.deepEqual(diffPermissions(snapshot, roles), []);
});

test('a changed target permission is reported without unrelated fields', () => {
  const changed = structuredClone(roles);
  changed[1].permissions.SKILLS.CREATE = true;
  changed[1].permissions.CUSTOM = { USE: false };
  assert.deepEqual(diffPermissions(snapshot, changed), [
    {
      roleName: 'USER',
      permissionType: 'SKILLS',
      key: 'CREATE',
      from: true,
      to: false,
    },
  ]);
});

test('missing role or permission values fail closed', () => {
  assert.throws(() => snapshotFromRoles(roles.slice(0, 1)), /Missing USER role/);
  const newPermissionGroup = structuredClone(roles);
  newPermissionGroup[1].permissions.NEW_FEATURE = { USE: true };
  assert.throws(() => snapshotFromRoles(newPermissionGroup), /Unexpected USER permission groups/);
  assert.throws(() => diffPermissions(snapshot, roles.slice(0, 1)), /Missing USER role/);
  const invalid = structuredClone(snapshot);
  delete invalid.roles.USER.MCP_SERVERS.USE;
  assert.throws(() => validateSnapshot(invalid), /Invalid USER.MCP_SERVERS permissions/);
  const disabledAssistant = structuredClone(snapshot);
  disabledAssistant.roles.USER.MCP_SERVERS.USE = false;
  assert.throws(() => validateSnapshot(disabledAssistant), /must retain agent and MCP use/);
  const enabledSkills = structuredClone(snapshot);
  enabledSkills.roles.USER.SKILLS.USE = true;
  assert.throws(
    () => validateSnapshot(enabledSkills),
    /cannot create agents or MCP servers or use skills/,
  );
});

test('target environment mismatch stops before database access', async () => {
  const previous = process.env.LIBRECHAT_INSTANCE_ENV;
  delete process.env.LIBRECHAT_INSTANCE_ENV;
  try {
    await assert.rejects(main(['apply', 'production']), /LIBRECHAT_INSTANCE_ENV/);
    process.env.LIBRECHAT_INSTANCE_ENV = 'stage';
    await assert.rejects(main(['apply', 'production']), /LIBRECHAT_INSTANCE_ENV/);
  } finally {
    if (previous === undefined) delete process.env.LIBRECHAT_INSTANCE_ENV;
    else process.env.LIBRECHAT_INSTANCE_ENV = previous;
  }
});

test('explicit YAML role permissions cannot override the snapshot on restart', () => {
  const template = yaml.load(
    fs.readFileSync(path.join(__dirname, '..', 'instructor-assistant.librechat.yaml'), 'utf8'),
  );
  assert.doesNotThrow(() => assertNoYamlRolePermissions(template));
  assert.doesNotThrow(() => assertNoYamlRolePermissions({ interface: { modelSelect: false } }));
  assert.throws(
    () => assertNoYamlRolePermissions({ interface: { agents: { use: true } } }),
    /interface.agents/,
  );
  assert.throws(
    () => assertNoYamlRolePermissions({ interface: { mcpServers: false } }),
    /interface.mcpServers/,
  );
});

test('student Caddie selects the student MCP server', () => {
  const template = yaml.load(
    fs.readFileSync(path.join(__dirname, '..', 'instructor-assistant.librechat.yaml'), 'utf8'),
  );
  assert.equal(
    template.mcpServers['lessoncaddie-student'].url,
    'https://lessoncaddie.ssmlabs.com/api/student-mcp',
  );
  const studentSpec = template.modelSpecs.list.find((spec) => spec.name === 'student-caddie');
  assert.equal(studentSpec.preset.endpoint, 'openAI');
  assert.deepEqual(studentSpec.mcpServers, ['lessoncaddie-student']);
  assert.equal(
    template.modelSpecs.list.find((spec) => spec.softDefault)?.name,
    'instructor-assistant',
  );
});
