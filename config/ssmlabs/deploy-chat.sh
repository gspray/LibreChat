#!/usr/bin/env bash
# Deploy the reviewed Chat configuration on its own host.
set -euo pipefail

target="${1:-}"
case "$target" in
  dev|stage|production) ;;
  *) echo "Usage: $0 dev|stage|production" >&2; exit 2 ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

actual="$(docker compose config --format json | node -e '
  let input = "";
  process.stdin.on("data", (chunk) => { input += chunk; });
  process.stdin.on("end", () => {
    const config = JSON.parse(input);
    process.stdout.write(config.services?.api?.environment?.LIBRECHAT_INSTANCE_ENV || "");
  });
')"
if [[ "$actual" != "$target" ]]; then
  echo "LIBRECHAT_INSTANCE_ENV must identify this instance as $target before restarting Chat" >&2
  exit 2
fi

if [[ "$target" == dev ]]; then
  # Dev's Admin UI is the source of the reviewed role snapshot.
  bash config/ssmlabs/check-dev-role-permissions.sh
fi

docker compose up -d --force-recreate api
if [[ "$target" != dev ]]; then
  bash config/ssmlabs/apply-role-permissions.sh "$target"
fi
docker compose exec -T api node config/provision-instructor-assistant.js
docker compose exec -T api node config/ssmlabs/ensure-student-caddie-spec.js
docker compose restart api
