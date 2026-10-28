#!/usr/bin/env bash
# Fail a chat release if dev role settings have changed without a reviewed snapshot.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

docker compose exec -T api node config/ssmlabs/role-permissions.js export dev \
  | diff -u config/ssmlabs/role-permissions.json -
