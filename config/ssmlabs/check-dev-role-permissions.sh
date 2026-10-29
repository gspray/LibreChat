#!/usr/bin/env bash
# Fail a chat release if dev role settings have changed without a reviewed snapshot.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

docker exec LibreChat node -e '
  require("dotenv").config({ path: "/app/.env" });
  const mongoose = require("mongoose");
  (async () => {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    const roles = await mongoose.connection.db.collection("roles")
      .find({ name: { $in: ["ADMIN", "USER"] }, tenantId: { $in: [null, undefined] } })
      .toArray();
    console.log(JSON.stringify(roles.map(({ name, permissions }) => ({ name, permissions }))));
    await mongoose.disconnect();
  })().catch((error) => { console.error(error.message); process.exitCode = 1; });
' | node -e '
  const { snapshotFromRoles } = require("./config/ssmlabs/role-permissions");
  let input = "";
  process.stdin.on("data", (chunk) => { input += chunk; });
  process.stdin.on("end", () => console.log(JSON.stringify(snapshotFromRoles(JSON.parse(input)), null, 2)));
' | diff -u config/ssmlabs/role-permissions.json -
