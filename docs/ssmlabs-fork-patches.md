# SSM Labs LibreChat patches

This fork stays on the published LibreChat image (`registry.librechat.ai/librechat-ai/librechat-dev`). Prefer **isolated overlays** under `config/ssmlabs/` over editing LibreChat source. Recreate the `api` container after overlay or bind-mount changes; a process restart does not remount volumes.

Do **not** bind-mount a custom `client/dist`. Branding, nested-route `<base href>`, model-chip hiding, iframe service-worker cleanup, and MCP navigation all run from overlays injected into the image’s `index.html`.

Related operator notes: [instructor-assistant.md](instructor-assistant.md). LessonCaddie-side SSO: `lessoncaddie/docs/librechat-sso.md`.

## Required LibreChat source bind-mounts

These files are listed in `config/instructor-assistant.compose-override.yml`. They exist only because v0.8.9-rc1 has no extension point for the behavior.

| File | Why it cannot be an overlay |
| --- | --- |
| `api/server/routes/config.js` | Startup `/api/config` must advertise `lessonCaddie` (pre-login overlay flags) and `hideToolActivity`. |
| `api/server/routes/messages.js` | History GET must redact tool parts; tool-detail routes must 403 for non-admins. |
| `api/server/utils/hideToolActivity.js` | New helper used by the message and agent-stream bind-mounts. Not upstream. |
| `api/server/controllers/agents/callbacks.js` | Live SSE must drop tool telemetry for non-admins while still forwarding `open_app_screen` so the navigation overlay can run. |

Each of those files has an `SSM Labs fork patch` comment at the call site.

## Required overlays (`config/ssmlabs/`)

Loaded with `NODE_OPTIONS=--require /app/config/ssmlabs/inject-index-html.js --require /app/config/ssmlabs/attach-lessoncaddie-sso.js` (SSO attach is a no-op until `LESSONCADDIE_SSO_ENABLED=true`).

| Overlay | Why |
| --- | --- |
| `inject-index-html.js` | Patches served `index.html`: LessonCaddie title/theme, `<base href="/">` for `/c/...` routes, overlay script tags. Avoids forking `api/server/index.js`. |
| `hide-model-selector.browser.js` | `interface.modelSelect: false` does not hide the header chip when `modelSpecs` is non-empty. Do not fork `ModelSelector.tsx`. |
| `lessonCaddieNavigationBridge.browser.js` | Posts `open_app_screen` results to the LessonCaddie parent. Do not fork `client/src` message components. |
| `embed-passthrough-sw.js` | Replaces Workbox `/sw.js` so a cached `X-Frame-Options: SAMEORIGIN` cannot block the Assistant iframe. |
| `branding/` | Favicons, `logo.svg`, maskable/512 icons, `manifest.webmanifest`. Do not rewrite `client/public` or `client/vite.config.ts`. |
| `attach-lessoncaddie-sso.js` + `lessonCaddieSso*.js` | Mounts `/sso/lessoncaddie` at `listen` without editing `api/server/index.js`. |
| `lessonCaddieReturn.js` | Allow-list and `lessonCaddie` config payload for overlays. |

## Config and provision (not LibreChat UI source)

| Path | Why |
| --- | --- |
| `config/instructor-assistant.librechat.yaml` | Agent spec, MCP server, `modelSelect: false`. Copy to gitignored `librechat.yaml`. |
| `config/instructor-assistant.compose-override.yml` | Bind-mounts and env. Copy keys into gitignored `docker-compose.override.yml`. |
| `config/provision-instructor-assistant.js` | Idempotent Instructor Assistant agent record. |

## Intentionally removed (do not restore)

These were turned off in product or duplicated by overlays:

- LessonCaddie header / “Back to LessonCaddie” chrome inside chat (App ↔ Assistant switching lives in the LessonCaddie shell).
- Login auto-redirect overlay (`lessoncaddie-sso.browser.js`). SSO is only the explicit LessonCaddie handoff (`/sso/lessoncaddie/callback`). Keep `/login?local=1` for administrators.
- React `ModelSelector.tsx` change (chip hide is the overlay).
- React tool-card / `useHideToolActivity` forks (server redaction + SSE drop).
- React `lessonCaddieNavigationBridge` / `LessonCaddieNavigationObserver` (DOM overlay).
- `client/public` icons and `vite.config.ts` PWA manifest (volume branding).
- `api/server/index.js` `<base href>` (inject overlay).
- `packages/api` MCP ping-after-initialize skip (not bind-mounted into the published image; do not fork `@librechat/api` for this).

## Upgrade checklist

When pulling a newer LibreChat image:

1. Re-apply only the four API bind-mounts; resolve conflicts there, not by copying more of `client/src`.
2. Confirm overlays still inject (`data-ssmlabs-*` sentinels on `index.html`).
3. Confirm SSO still mounts before the SPA fallback (`attach-lessoncaddie-sso.js`).
4. Re-run `node --test config/ssmlabs/*.test.js config/ssmlabs/*.overlay.test.js`.
5. Do not rebuild the Vite client unless you are leaving the published-image path on purpose.
