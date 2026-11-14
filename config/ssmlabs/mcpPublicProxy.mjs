#!/usr/bin/env node
/**
 * Local-only reverse proxy so a public tunnel can reach Live Talk MCP
 * without exposing the rest of Chat.
 * Why: docs/ssmlabs-gpt-live-public-mcp.md
 */
import http from 'node:http';

const listenPort = Number(process.env.MCP_PUBLIC_PROXY_PORT || 3082);
const upstreamPort = Number(process.env.MCP_PUBLIC_PROXY_UPSTREAM || 3080);
const prefix = '/live-talk/mcp';

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  if (!url.startsWith(prefix)) {
    res.statusCode = 404;
    res.end();
    return;
  }
  const headers = { ...req.headers, host: `127.0.0.1:${upstreamPort}` };
  const proxy = http.request(
    {
      hostname: '127.0.0.1',
      port: upstreamPort,
      path: url,
      method: req.method,
      headers,
    },
    (up) => {
      res.writeHead(up.statusCode || 502, up.headers);
      up.pipe(res);
    },
  );
  proxy.on('error', () => {
    if (!res.headersSent) res.writeHead(502);
    res.end();
  });
  req.pipe(proxy);
});

server.listen(listenPort, '127.0.0.1', () => {
  process.stdout.write(`mcp-public-proxy listening on 127.0.0.1:${listenPort} -> :${upstreamPort}${prefix}\n`);
});
