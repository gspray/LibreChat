# Instructor Live Talk

Overlay on this Chat branch. Related umbrella: LessonCaddie [#443](https://github.com/gspray/lessoncaddie/pull/443).

OpenAI Realtime remains the default. In LessonCaddie **Live Voice Settings**, choose **GPT-Live** to use it on the next Instructor Live Talk start; choose **Realtime** to switch back. The choice is saved to the user's profile and requires no Chat restart. `LIVE_TALK_GPT_LIVE=true` remains a fallback for older clients that do not send a provider choice. The pinned Speak Core IIFE is built from `@spray/speak-core` public entry at `f9d52b4` (0.2.22). Student Live Talk remains on Realtime. LessonCaddie still authorizes MCP calls, including writes.

Live Talk is on whenever this overlay is loaded. There is no env flag to disable it.

## Development Chat host

1. Confirm `config/ssmlabs/speak-core.realtime.js` exists (generated from Speak Core `f9d52b4`). From the LibreChat checkout, regenerate with `esbuild ../speak-core/packages/speak-core/src/index.js --bundle --format=iife --global-name=SpeakCore --platform=browser --target=es2020 --outfile=config/ssmlabs/speak-core.realtime.js --banner:js='/* Pinned @spray/speak-core 0.2.22 / f9d52b4 for Live Talk trial. Generated from package public API. */'`.
2. Copy overlay keys from `config/instructor-assistant.compose-override.yml` into gitignored `docker-compose.override.yml` if they are missing.
3. Recreate the `api` container so `NODE_OPTIONS` and overlay bind-mounts load. A process restart is not enough for new mounts.
4. Test in **LessonCaddie Ask** (`https://lessoncaddie.ssmlabs.com/app` → Ask). Chat is mounted at `/chat`, so Live Talk config is `/chat/live-talk/config`.
5. Open **Ask**. Live Talk should appear on a new chat and on an existing thread. Hard-refresh the app so the Assistant iframe reloads.

GPT-Live tools need a **public HTTPS URL** to this Chat's `/live-talk/mcp` proxy. Read [ssmlabs-gpt-live-public-mcp.md](./ssmlabs-gpt-live-public-mcp.md) before touching Funnel, Caddy 443, or `LIVE_TALK_MCP_PROXY_URL`.

The Chat server issues a random bearer credential per voice session. The proxy forwards MCP traffic with the existing LessonCaddie SSO headers; it never sends the SSO secret or OpenAI key to the browser or OpenAI MCP. Proxy hops log method/status without secrets. Stopping Live Talk revokes the proxy credential. GPT-Live hangs up after 20 seconds of true silence (`LIVE_TALK_GPT_LIVE_IDLE_MS`) or 60 seconds of noise without a usable question (`LIVE_TALK_GPT_LIVE_NOISE_MS`), and when the instructor says they are done. It speaks the reason, then disconnects. GPT-Live keeps the mic open while she talks (full duplex); Realtime still mutes on assistant audio unless the user allows interrupt.

Leaving this branch (or dropping the overlay attach) is the off switch. Existing typed Chat is unchanged.

## Manual checklist

- Native mic in / spoken reply out; interrupt during playback.
- Ask a directory or lesson question; the spoken answer uses a read tool.
- If GPT-Live reports `responses_validation_failed`, talk stays up and the bar says lesson tools are unavailable; do not treat that as a dead session.
- Ask to schedule or message; Live Talk can call the same write tools as typed Ask after spoken confirmation. LessonCaddie still authorizes the mutation.
- Stop, then type in the same thread. Voice transcripts remain.
- Leave the thread or reload: microphone and provider session stop.

Live audio quality is not proven by unit tests.
