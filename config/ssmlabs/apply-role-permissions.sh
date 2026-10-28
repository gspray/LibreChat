#!/usr/bin/env bash
# Run after the LibreChat API container starts on a stage or production host.
set -euo pipefail

target="${1:-}"
case "$target" in
  stage|production) ;;
  *) echo "Usage: $0 stage|production" >&2; exit 2 ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

if docker compose exec -T api node config/ssmlabs/role-permissions.js check "$target"; then
  exit 0
else
  check_status=$?
  if [[ "$check_status" -ne 2 ]]; then
    exit "$check_status"
  fi
fi

docker compose exec -T api node config/ssmlabs/role-permissions.js apply "$target"
# The apply command runs in its own process. Restart the API to clear any
# in-process role cache before users reach the updated instance.
docker compose restart api
docker compose exec -T api node config/ssmlabs/role-permissions.js check "$target"
