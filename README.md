# Agent Protocol Tracker Daemon

A CONK intelligence daemon. Tracks the four agent protocols that matter and
publishes a daily activity digest as a Cast on CONK mainnet.

## Tracked Protocols

| Protocol | Repo | What it is |
|---|---|---|
| **x402** | coinbase/x402 | HTTP 402 payment standard for paid API endpoints |
| **MCP**  | modelcontextprotocol/specification | Model Context Protocol — LLM tool/resource standard |
| **ACP**  | zed-industries/agent-client-protocol | Agent Client Protocol — IDE/agent interop |
| **MPP**  | _placeholder_ | Multi-agent Payment Protocol — spec still emerging |

Metrics per protocol: cumulative stars, commits last 24h, open issues, latest
release tag, repo activity recency.

## Architecture

Identical to [sui-stats-daemon](https://github.com/AXIOM-TIDE/sui-stats-daemon).
`fetch.js` and `format.js` are the only daemon-specific files.

## Setup

See `sui-stats-daemon` README — same six steps.

Part of the CONK Intelligence Network · [conk.app](https://conk.app)
