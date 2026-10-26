# Instructor Assistant

Dedicated LessonCaddie instructor agent for this LibreChat deployment (v0.8.9-rc1).

## User-facing name

**Instructor Assistant** everywhere. The MCP server identifier remains `lessoncaddie-instructor`.

## Architecture

LibreChat (Docker Compose on ssmlabs-dev) hosts the chat UI and agent. OpenAI `gpt-4o` is billed from the existing server-side `OPENAI_API_KEY`. Tool calls go to the existing streamable-http MCP server at `https://lessoncaddie.ssmlabs.com/api/instructor-mcp`. LessonCaddie remains the system of record. There is no extra orchestration service.

Identity: each LibreChat user completes LessonCaddie MCP OAuth. LessonCaddie authorizes from that access token’s `userId`, not from chat text and not from the shared OpenAI key. Request headers `X-LibreChat-User-Id` and `X-LibreChat-Conversation-Id` are diagnostic only.

## Configuration

Host copies (gitignored by upstream LibreChat):

- `librechat.yaml`
- `docker-compose.override.yml`

Tracked templates (copy onto those paths after a git pull):

- `config/instructor-assistant.librechat.yaml`
- `config/instructor-assistant.compose-override.yml`

Variables:

| Variable | Default | Purpose |
|---|---|---|
| `HIDE_TOOL_ACTIVITY` | `true` | Hide tool names, args, JSON, and “Ran tool” cards from non-admin users. Admins still see tool activity. Stored tool results stay in Mongo for the model. |
| `INSTRUCTOR_ASSISTANT_MODEL` | `gpt-4o` | Centrally billed OpenAI model. Instructors do not supply API keys. |
| `INSTRUCTOR_ASSISTANT_OWNER_EMAIL` | `greg.spray@gmail.com` | LibreChat user who owns the agent record. |
| `APP_TITLE` | `Instructor Assistant` | Browser/app title. |
| `LESSONCADDIE_HOME_URL` | `https://lessoncaddie.ssmlabs.com/app` | Fallback destination for **← Back to LessonCaddie**. |
| `LESSONCADDIE_ALLOWED_ORIGINS` | `https://lessoncaddie.ssmlabs.com` | Comma-separated origins allowed as `returnUrl` / `lessoncaddieReturn` query values. The home URL origin is always included. |

## Back to LessonCaddie

The chat header (welcome screen and every conversation) includes a same-tab **← Back to LessonCaddie** control. Mobile shows a compact back-arrow button with that accessible name.

Open LibreChat with a safe return URL when leaving a LessonCaddie screen:

`https://chat.ssmlabs.com/c/new?returnUrl=https://lessoncaddie.ssmlabs.com/app/edit-lesson?lessonId=…`

The value is stored in `sessionStorage` for that tab, so later conversations still return to the originating screen. Unsafe or off-allowlist URLs are ignored and the button uses `LESSONCADDIE_HOME_URL`. LibreChat auth cookies and saved chats are unchanged.

This is an isolated overlay under `config/ssmlabs/` plus a one-line `Header.tsx` mount of `client/src/components/ssmlabs/BackToLessonCaddie.tsx` for a future client image rebuild. The published LibreChat image serves the overlay without rebuilding Vite.

OpenAI credentials stay in the existing Compose/Doppler env. They are not written into yaml or browser config.

## Agent record

| Field | Value |
|---|---|
| Name | Instructor Assistant |
| ID | `agent_instructor_assistant` |
| Model | `gpt-4o` (`openAI`) |
| MCP | `lessoncaddie-instructor` |
| Tools | 18 instructor MCP tools (`{name}_mcp_lessoncaddie-instructor`) |
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
