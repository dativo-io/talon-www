---
title: Coding-agents demo
slug: /coding-agents-demo/
description: Run Talon's reproducible coding-agent governance scenario with or without Docker: one session, two providers, subagent attribution, cache-aware cost, a session-budget denial, and signed evidence.
---

# Coding-agents demo

Talon ships a reproducible scenario for the coding-agent governance surface: one caller-scoped session spans Anthropic and OpenAI wire families, subagents are attributed, cache-token usage affects cost, a session soft cap denies the next request, and the session export verifies.

No real provider API key is required. The mock provider speaks both Anthropic Messages and OpenAI Responses, including SSE usage events.

## Fastest path: no Docker

From a Talon repository checkout:

```bash
go test -tags=integration ./tests/integration -run TestCodingAgentsDemo_EndToEnd -v
```

This builds the real dual-wire mock and drives a real Talon gateway through the full sequence. It is the same integration path used in CI.

## Docker walkthrough

```bash
make coding-agents-demo
```

Or run the example directly:

```bash
cd examples/coding-agents-demo
docker compose up -d --build
./demo.sh all
```

If port 8080 is already occupied:

```bash
DEMO_GATEWAY_PORT=18080 docker compose up -d --build
GATEWAY=http://localhost:18080 ./demo.sh all
```

## What the demo proves

1. One logical session spans both provider routes.
2. `generator` and `executor` are arbitrary client-supplied labels, not Talon roles.
3. PII in prompt traffic is warned and evidenced.
4. `max_session_cost` produces a provider-native `session_budget_exceeded` denial.
5. The same session can be inspected, costed, exported, and HMAC-verified.

```bash
talon audit list --session sess-coding-demo
talon costs --session sess-coding-demo --json
talon audit export --session sess-coding-demo --format signed-json
talon audit verify --session sess-coding-demo
```

The session budget is a **soft cap**: an in-flight or concurrent request can overshoot before the next request is denied.

## Source and deeper walkthrough

The maintained source is the `examples/coding-agents-demo` directory in the Talon repository. The [coding-agent fleet guide](./governing-coding-agents.md) explains the neutral metadata contract, caller topology, session semantics, budgets, and limitations.