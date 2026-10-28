#!/usr/bin/env bash
# Deploy the chat API and reconcile its role permissions on a target host.
set -euo pipefail

target="${1:-}"
case "$target" in
  stage|production) ;;
  *) echo "Usage: $0 stage|production" >&2; exit 2 ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

docker compose up -d --force-recreate api
bash config/ssmlabs/apply-role-permissions.sh "$target"
