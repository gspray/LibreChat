# Instructor Assistant

Dedicated LessonCaddie instructor agent for this LibreChat deployment (v0.8.9-rc1).

## User-facing name

**Ask Lesson Caddie Assistant** (`APP_TITLE`) for browser tab, PWA manifest, and login chrome. **Ask Caddie** (`APP_SHORT_NAME`) for home-screen short name. The default agent remains **Instructor Assistant**; the MCP server identifier remains `lessoncaddie-instructor`.

LessonCaddie launcher icons under `config/ssmlabs/branding/assets/` are volume-mounted over `/app/client/dist/assets/` (favicons, `logo.svg`, maskable/512 icons) and `manifest.webmanifest`. `config/ssmlabs/inject-index-html.js` patches the served `index.html` title, description, apple web app title, and favicon cache-bust query. Recreate the `api` container after changing those files; a process restart alone does not remount volumes.

## Architecture

LibreChat (Docker Compose on ssmlabs-dev) hosts the chat UI and agent. OpenAI `gpt-4o` is billed from the existing server-side `OPENAI_API_KEY`. Tool calls go to the existing streamable-http MCP server at `https://lessoncaddie.ssmlabs.com/api/instructor-mcp`. LessonCaddie remains the system of record. There is no extra orchestration service.

Identity: each LibreChat user completes LessonCaddie MCP OAuth. LessonCaddie authorizes from that access token’s `userId`, not from chat text and not from the shared OpenAI key. Request headers `X-LibreChat-User-Id` and `X-LibreChat-Conversation-Id` are diagnostic only.

## Configuration

Host copies (gitignored by upstream LibreChat):

- `librechat.yaml`
- `docker-compose.override.yml`

**Live branding on chat.ssmlabs.com** also comes from the Mongo `configs` document `principalId: __base__` (Admin → Config overrides). That layer wins over `librechat.yaml` for fields such as `interface.customWelcome` and `modelSpecs.list[].label` (landing title and “Message …” composer placeholder). After editing yaml, check Mongo if the UI copy did not change.

Tracked templates (copy onto those paths after a git pull):

- `config/instructor-assistant.librechat.yaml`
- `config/instructor-assistant.compose-override.yml`

Variables:

| Variable | Default | Purpose |
|---|---|---|
| `HIDE_TOOL_ACTIVITY` | `true` | Hide tool names, args, JSON, and “Ran tool” cards from non-admin users. Admins still see tool activity. Stored tool results stay in Mongo for the model. |
| `INSTRUCTOR_ASSISTANT_MODEL` | `gpt-4o` | Centrally billed OpenAI model. Instructors do not supply API keys. |
| `INSTRUCTOR_ASSISTANT_OWNER_EMAIL` | `greg.spray@gmail.com` | LibreChat user who owns the agent record. |
| `APP_TITLE` | `Ask Lesson Caddie Assistant` | Browser/app title (tab default, login logo alt). |
| `APP_SHORT_NAME` | `Ask Caddie` | Apple web app / PWA short name. |
| `SSMLABS_BRANDING_ASSET_VERSION` | `1` | Bumps favicon query string when icons change (PWA cache). |
| `LESSONCADDIE_HOME_URL` | `https://lessoncaddie.ssmlabs.com/app` | LessonCaddie origin used by SSO return/allow-list helpers. |
| `LESSONCADDIE_ALLOWED_ORIGINS` | `https://lessoncaddie.ssmlabs.com` | Comma-separated origins allowed as SSO `returnUrl` values. The home URL origin is always included. |

Chat uses LibreChat’s own header. App ↔ Assistant switching lives in the LessonCaddie shell, not inside chat.

LibreChat’s default `X-Frame-Options: SAMEORIGIN` blocks the Assistant iframe. Set `X_FRAME_OPTIONS=off` (Caddy also strips it). A Workbox service worker can still replay a cached `/` that carried that header — overlay `config/ssmlabs/embed-passthrough-sw.js` on `/sw.js` so those caches are dropped.

OpenAI credentials stay in the existing Compose/Doppler env. They are not written into yaml or browser config.

## Agent record

| Field | Value |
|---|---|
| Name | Instructor Assistant |
| ID | `agent_instructor_assistant` |
| Model | `gpt-4o` (`openAI`) |
| MCP | `lessoncaddie-instructor` |
| Tools | Instructor MCP tools including `open_app_screen` (`{name}_mcp_lessoncaddie-instructor`) |
| Sharing | Owner ACL + USER role **viewer**. USER `permissions.AGENTS.CREATE` is `false`. |

Default selection: model spec `instructor-assistant` with `softDefault: true` and `preset.agent_id: agent_instructor_assistant`. Existing conversations that use another agent are not rewritten.

UI: `modelSelect` and `parameters` off; MCP `chatMenu` false; MCP create/share/public false; prompts off. Administrators retain agent create and tool diagnostics.

On LibreChat **v0.8.9-rc1**, `interface.modelSelect: false` alone does **not** hide the header model/agent chip when `modelSpecs.list` is non-empty (the chip can still open “Search models”). Keep `modelSpecs` for `softDefault` and landing starters; hide the chip with the mounted `config/ssmlabs/hide-model-selector.browser.js` overlay (or rebuild the client after the `ModelSelector` fix). Do **not** set `showInMenu: false` on the only spec — that removes it from `/api/config` and breaks client-side default agent selection for new chats.

## Provision / update

From the LibreChat repo after the API container is running:

```bash
cp config/instructor-assistant.librechat.yaml librechat.yaml
cp config/instructor-assistant.compose-override.yml docker-compose.override.yml
docker compose up -d api
docker compose exec api node config/provision-instructor-assistant.js
docker compose restart api
```

The provision command is idempotent: it creates the agent if missing, otherwise updates instructions, model, MCP tools, conversation starters, and sharing.

## Hide tool activity

Native `hide_sequential_outputs` does not hide MCP “Ran tool” cards in v0.8.9-rc1.

Server (`HIDE_TOOL_ACTIVITY`):

- Drops tool SSE events for non-admins (OAuth prompts still stream).
- Redacts tool parts on message GET.
- Returns 403 for tool-part detail routes for non-admins.

The production image cannot rebuild the Vite client. Source patches in `client/src` are kept for a future rebuild. Do not rely on CSS alone.

## Identity status

Designed per LibreChat user OAuth → LessonCaddie instructor `userId`. This host currently has one ADMIN instructor user. Cross-instructor isolation is **not** verified with a second account. Do not open registration or share one LessonCaddie login across instructors until that test exists.

## Upgrade notes

Keep the bind-mounted API files listed in the compose override when pulling LibreChat images. Do not upgrade LibreChat as part of ordinary Instructor Assistant maintenance.
