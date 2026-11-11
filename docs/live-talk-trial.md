# Instructor Live Talk trial

Opt-in overlay for LessonCaddie Chat. Related umbrella: LessonCaddie [#443](https://github.com/gspray/lessoncaddie/pull/443).

Disabled by default. Native OpenAI Realtime speech-to-speech via pinned `@spray/speak-core` `d441d85` (0.2.20 interruption opt-in). LessonCaddie facts use the existing instructor MCP path. Writes are denied on the Chat server.

## Enable on the development Chat host

1. Confirm `config/ssmlabs/speak-core.realtime.js` exists (built from Speak Core `d441d85`).
2. Copy overlay keys from `config/instructor-assistant.compose-override.yml` into gitignored `docker-compose.override.yml` if they are missing.
3. Set `LIVE_TALK_TRIAL=true` in that override (or the shell env Compose reads).
4. Recreate the `api` container so `NODE_OPTIONS` and overlay bind-mounts load. A process restart is not enough for new mounts.
5. Test in **LessonCaddie Ask** (`https://lessoncaddie.ssmlabs.com/app` → Ask), not a bare `:3080` tab. Chat is mounted at `/chat`, so Live Talk config is `/chat/live-talk/config`.
6. Open an **existing** Instructor Assistant thread (URL contains `/c/<id>`, not `/c/new`) and use **Live Talk**. Hard-refresh the app so the Assistant iframe reloads.

Rollback: set `LIVE_TALK_TRIAL=false` and recreate `api`. Session bootstrap then returns 403. Existing typed Chat is unchanged.

## Manual checklist

- Flag off: no usable Live Talk start; POST `/live-talk/session` rejected.
- Native mic in / spoken reply out; interrupt during playback.
- Ask a directory or lesson question; the spoken answer uses a read tool.
- Ask to schedule or message; the tool is denied and nothing is written.
- Stop, then type in the same thread. Voice transcripts remain.
- Leave the thread or reload: microphone and provider session stop.

Live audio quality is not proven by unit tests.
