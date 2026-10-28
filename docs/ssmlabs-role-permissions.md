# LessonCaddie Chat role permissions

`config/ssmlabs/role-permissions.json` is the reviewed snapshot of the dev chat
role settings for Agents, MCP Servers, and Skills. It contains only `ADMIN` and
`USER` role permissions in these three areas. Other role settings remain owned
by each LibreChat instance.

The current dev chat is hosted at `chat.ssmlabs.com`. Stage and production chat
instances for `stage.lessoncaddie.app` and `lessoncaddie.app` are planned but
not yet configured. Do not run the target apply command against the dev stack.

## Capture from dev

Set `LIBRECHAT_INSTANCE_ENV=dev` in the dev Compose environment and recreate the
API container so it receives the marker. After changing permissions in the dev
admin UI, capture and review the new snapshot:

```bash
docker compose exec -T api node config/ssmlabs/role-permissions.js export dev \
  > config/ssmlabs/role-permissions.json.new
diff -u config/ssmlabs/role-permissions.json config/ssmlabs/role-permissions.json.new
mv config/ssmlabs/role-permissions.json.new config/ssmlabs/role-permissions.json
node --test config/ssmlabs/role-permissions.test.js
```

Commit the reviewed snapshot. Export fails if either role or a required permission
is missing. `USER` must retain `AGENTS.USE` and `MCP_SERVERS.USE` so Instructor
Assistant can use the LessonCaddie MCP tools.

Before releasing to stage or production, run
`bash config/ssmlabs/check-dev-role-permissions.sh` on dev. It fails if the
admin UI settings have drifted from the reviewed snapshot. Capture, review, and
commit the new snapshot before retrying.

## Apply during a chat release

On each future target host, set `LIBRECHAT_INSTANCE_ENV=stage` or
`LIBRECHAT_INSTANCE_ENV=production` in the Compose environment, copy the tracked
Compose override, copy the updated `config/instructor-assistant.librechat.yaml`
to the runtime `librechat.yaml`, and bring in the permission snapshot. The
target marker is checked before database access. The
hook also rejects a `librechat.yaml` that
still explicitly seeds Agent, MCP Server, or Skill role permissions, since those
would overwrite the snapshot on a later restart. Run the matching hook before
opening the new chat instance to users:

```bash
bash config/ssmlabs/deploy-chat.sh stage
# or, on the production chat host:
bash config/ssmlabs/deploy-chat.sh production
```

The deploy command starts the API and invokes the permission hook. The hook
applies the three permission groups, preserves unrelated role settings,
restarts the API when permissions changed to clear its role cache, and checks the
result. It fails if a role is missing or the target marker does not match. A
failed hook fails the chat release; do not treat an incomplete permission apply
as successful. Repeat the hook safely if an interrupted apply needs recovery.

This hook belongs after the target LibreChat API container is recreated in the
future chat release process. LessonCaddie’s app deploy script does not deploy
LibreChat and does not invoke this hook. No stage or production chat instance is
configured yet, so there is currently no live target to attach it to.
