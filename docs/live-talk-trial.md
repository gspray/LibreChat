# Instructor Live Talk

Overlay on this Chat branch. Related umbrella: LessonCaddie [#443](https://github.com/gspray/lessoncaddie/pull/443).

Native OpenAI Realtime speech-to-speech via pinned `@spray/speak-core` `d441d85` (0.2.20 interruption opt-in). LessonCaddie facts use the existing instructor MCP path. Writes are denied on the Chat server.

Live Talk is on whenever this overlay is loaded. There is no env flag to disable it.

## Development Chat host

1. Confirm `config/ssmlabs/speak-core.realtime.js` exists (built from Speak Core `d441d85`).
2. Copy overlay keys from `config/instructor-assistant.compose-override.yml` into gitignored `docker-compose.override.yml` if they are missing.
3. Recreate the `api` container so `NODE_OPTIONS` and overlay bind-mounts load. A process restart is not enough for new mounts.
4. Test in **LessonCaddie Ask** (`https://lessoncaddie.ssmlabs.com/app` → Ask). Chat is mounted at `/chat`, so Live Talk config is `/chat/live-talk/config`.
5. Open **Ask**. Live Talk should appear on a new chat and on an existing thread. Hard-refresh the app so the Assistant iframe reloads.

Leaving this branch (or dropping the overlay attach) is the off switch. Existing typed Chat is unchanged.

## Manual checklist

- Native mic in / spoken reply out; interrupt during playback.
- Ask a directory or lesson question; the spoken answer uses a read tool.
- Ask to schedule or message; the tool is denied and nothing is written.
- Stop, then type in the same thread. Voice transcripts remain.
- Leave the thread or reload: microphone and provider session stop.

Live audio quality is not proven by unit tests.
