# LessonCaddie Chat role permissions

`config/ssmlabs/role-permissions.json` is the reviewed snapshot of all dev chat
role settings for `ADMIN` and `USER`. The release check compares every permission
group with dev, and the target hook applies them without changing other roles.

Dev chat is hosted at `chat.ssmlabs.com`. Stage and production Chat run under
`/chat` on `stage.lessoncaddie.app` and `lessoncaddie.app`. Never run the target
apply command against dev.

## Capture from dev

After changing permissions in the dev admin UI, capture and review the new
snapshot. The check reads the local dev `LibreChat` container:

```bash
docker exec LibreChat node -e 'require("dotenv").config({path:"/app/.env"}); const mongoose=require("mongoose"); (async()=>{await mongoose.connect(process.env.MONGO_URI); const roles=await mongoose.connection.db.collection("roles").find({name:{$in:["ADMIN","USER"]},tenantId:{$in:[null,undefined]}}).toArray(); console.log(JSON.stringify(roles.map(({name,permissions})=>({name,permissions})))); await mongoose.disconnect()})().catch(e=>{console.error(e.message);process.exitCode=1})' \
  | node -e 'const {snapshotFromRoles}=require("./config/ssmlabs/role-permissions");let input="";process.stdin.on("data",chunk=>input+=chunk);process.stdin.on("end",()=>console.log(JSON.stringify(snapshotFromRoles(JSON.parse(input)),null,2)))' \
  > config/ssmlabs/role-permissions.json.new
diff -u config/ssmlabs/role-permissions.json config/ssmlabs/role-permissions.json.new
mv config/ssmlabs/role-permissions.json.new config/ssmlabs/role-permissions.json
node --test config/ssmlabs/role-permissions.test.js
```

Commit the reviewed snapshot. Export fails if either role or a required permission
is missing. `USER` retains `AGENTS.USE` and `MCP_SERVERS.USE` for Instructor
Assistant, while agent creation, MCP server creation, and skills stay disabled.

Before releasing to stage or production, run
`bash config/ssmlabs/check-dev-role-permissions.sh` on dev. It fails if the
admin UI settings have drifted from the reviewed snapshot. Capture, review, and
commit the new snapshot before retrying.

## Apply during a chat release

Each target host has `LIBRECHAT_INSTANCE_ENV=stage` or `production` in its
Compose override. The target marker is checked before database access. The
hook rejects a `librechat.yaml` that explicitly seeds Agent, MCP Server, Skill,
or Prompt role permissions because those would overwrite the snapshot on a
later restart. Run the matching hook after pulling this Chat branch and before
opening a new Chat release to users:

```bash
bash config/ssmlabs/deploy-chat.sh stage
# or, on the production chat host:
bash config/ssmlabs/deploy-chat.sh production
```

The deploy command starts the API and invokes the permission hook. The hook
applies all Admin and User permission groups, preserves other roles,
restarts the API when permissions changed to clear its role cache, and checks the
result. It fails if a role is missing or the target marker does not match. A
failed hook fails the chat release; do not treat an incomplete permission apply
as successful. Repeat the hook safely if an interrupted apply needs recovery.

The LessonCaddie Lightsail deploy helper runs the dev snapshot check, updates
the target Chat checkout, and runs this hook after deploying the app. A release
fails if the dev settings differ from the reviewed snapshot or target apply fails.
