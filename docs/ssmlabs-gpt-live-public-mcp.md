# GPT-Live tools on the ssmlabs NUC

Read this before changing Tailscale Funnel, Caddy port 443, or `LIVE_TALK_MCP_PROXY_URL`.

## Why this exists

LessonCaddie tools live on **our** machines, not at OpenAI. GPT-Live is different from Realtime in **who dials those tools**:

| Mode | Who calls MCP | Config | Needs a public URL? |
| --- | --- | --- | --- |
| **Typed Chat** | Chat on the NUC, with SSO | `librechat.yaml` `lessoncaddie-instructor` / `lessoncaddie-student` (`startup: false`) | No. Tailscale/`*.ssmlabs.com` is enough. |
| **Realtime** (default Live Talk) | Chat on the NUC | Same YAML servers as typed Chat | No. Tailscale is enough. |
| **GPT-Live** | OpenAI’s cloud | `LIVE_TALK_MCP_PROXY_URL` only | **Yes.** OpenAI cannot see Tailscale `100.x`. |

Do not point the YAML LessonCaddie servers at `LIVE_TALK_MCP_PROXY_URL`. That URL is for OpenAI. Typed Chat must keep `/api/instructor-mcp` and `/api/student-mcp`.

GPT-Live without a reachable MCP URL is voice-only. That is not a useful Instructor Assistant.

`LIVE_TALK_MCP_PROXY_URL` is that public URL. Chat adds `/{sessionId}` and a one-time bearer. OpenAI never gets the LessonCaddie SSO secret.

## The outage we already had

On this NUC, **Caddy owns TCP 443** for every `*.ssmlabs.com` PWA (WMB, LessonCaddie, Speak Lab, Chat).

Tailscale Funnel on **443** intercepts the node’s Tailscale IP `:443`. Phones then get Funnel’s TLS instead of Caddy → `ERR_SSL_PROTOCOL_ERROR` on every PWA. Local `curl` on the NUC can still look healthy.

**Never enable Funnel on 443 on `ssmlabs`.** Funnel 8443 does not steal Caddy, but OpenAI does not use 8443 reliably.

## What to use instead (dev)

Pick **one** public HTTPS **443** path. Do not add a second product architecture.

1. **Preferred later:** forward router 443 to `192.168.86.41`, DNS one hostname to the WAN IP, set `LIVE_TALK_MCP_PROXY_URL` to `https://that-host/live-talk/mcp`. Production-shaped. Only publish the Chat/MCP name if you want the internet to reach it.
2. **Temporary:** Cloudflare tunnel (or similar) outbound from the NUC. Same idea: public 443 at their edge, no WAN port. `config/ssmlabs/mcpPublicProxy.mjs` exists so the tunnel exposes **only** `/live-talk/mcp`, not all of Chat.

These are **dev-only**. Production Chat that already has a public name (for example `https://lessoncaddie.app/chat/live-talk/mcp`) sets `LIVE_TALK_MCP_PROXY_URL` to that. No Funnel, no extra tunnel.

## Symptoms

- Voice works, tools 424 / `responses_validation_failed` / `Error retrieving tool list from MCP server: 'Instructor'` → OpenAI never reached our proxy (wrong URL, wrong port, or Funnel/tunnel down). Chat logs will **not** show `mcp.proxy.request`.
- All `*.ssmlabs.com` PWAs fail TLS after a Funnel change → Funnel is on 443. `sudo tailscale serve reset` (then put MCP on 8443 only if you must). Restore Caddy on 443.

## Invariant

This NUC’s port 443 belongs to Caddy. GPT-Live tools get a **different** public 443 (router, Cloudflare, or production host). Do not merge those two.
