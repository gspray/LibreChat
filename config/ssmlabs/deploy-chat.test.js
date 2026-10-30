const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const snapshot = require('./role-permissions.json');

function runDeploy(target, marker) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'chat-deploy-test-'));
  try {
    const docker = path.join(temp, 'docker');
    const log = path.join(temp, 'docker.log');
    const fixture = path.join(temp, 'roles.json');
    fs.writeFileSync(fixture, JSON.stringify(Object.entries(snapshot.roles)
      .map(([name, permissions]) => ({ name, permissions }))));
    fs.writeFileSync(docker, `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "$DOCKER_LOG"
if [[ "$1" == compose && "$2" == config ]]; then
  printf '{"services":{"api":{"environment":{"LIBRECHAT_INSTANCE_ENV":"%s"}}}}' "$MOCK_MARKER"
elif [[ "$1" == exec ]]; then
  cat "$ROLE_FIXTURE"
fi
`, { mode: 0o755 });
    const result = spawnSync('bash', ['config/ssmlabs/deploy-chat.sh', target], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${temp}:${process.env.PATH}`,
        DOCKER_LOG: log,
        ROLE_FIXTURE: fixture,
        MOCK_MARKER: marker,
      },
    });
    return { result, calls: fs.readFileSync(log, 'utf8').trim().split('\n') };
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

test('target mismatch stops before Chat restart or database operations', () => {
  const { result, calls } = runDeploy('production', 'dev');
  assert.equal(result.status, 2);
  assert.match(result.stderr, /LIBRECHAT_INSTANCE_ENV/);
  assert.deepEqual(calls, ['compose config --format json']);
});

test('dev checks its reviewed roles and provisions the agent', () => {
  const { result, calls } = runDeploy('dev', 'dev');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(calls[0], 'compose config --format json');
  assert.match(calls.join('\n'), /exec LibreChat node -e/);
  assert.equal(calls.at(-2), 'compose up -d --force-recreate api');
  assert.equal(calls.at(-1), 'compose exec -T api node config/provision-instructor-assistant.js');
  assert.doesNotMatch(calls.join('\n'), /role-permissions.js apply/);
});

test('stage reconciles roles and provisions the same agent', () => {
  const { result, calls } = runDeploy('stage', 'stage');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(calls, [
    'compose config --format json',
    'compose up -d --force-recreate api',
    'compose exec -T api node config/ssmlabs/role-permissions.js check stage',
    'compose exec -T api node config/provision-instructor-assistant.js',
  ]);
});
