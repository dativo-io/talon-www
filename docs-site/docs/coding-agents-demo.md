---
title: Coding-agents demo
slug: /coding-agents-demo/
description: "Run Talon's reproducible coding-agent governance scenario with or without Docker: one authenticated agent, one session, two providers, subagent attribution, cache-aware cost, a session-budget denial, and signed evidence."
---

# Coding-agents demo

Talon ships a reproducible scenario for the coding-agent governance surface: one authenticated Talon agent spans Anthropic and OpenAI wire families, one asserted session groups the requests, subagents are attributed, cache-token usage affects cost, an agent-scoped session soft cap denies the next request, and the session export verifies.

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

1. One authenticated Talon agent can use both supported provider routes when its effective policy allows them.
2. One asserted session groups those requests inside the `(tenant, agent)` boundary.
3. `generator` and `executor` are arbitrary client-supplied subagent labels, not Talon traffic identities or policy principals.
4. PII in prompt traffic is warned and evidenced.
5. `session_limits.max_cost` produces a provider-native `session_budget_exceeded` denial.
6. The same session can be inspected, costed, exported, and HMAC-verified.

```bash
talon audit list --session sess-coding-demo
talon costs --session sess-coding-demo --json
talon audit export --session sess-coding-demo --format signed-json
talon audit verify --session sess-coding-demo
```

The session budget is a **soft cap**: an in-flight or concurrent request can overshoot before the next request is denied.

## Identity and attribution

The Talon agent is authenticated by the vault-bound key declared in `agent.talon.yaml`. Session, subagent, parent, client, and stage metadata are attribution supplied by the already authenticated workload. They make the session explainable but do not create additional authenticated identities.

Two different Talon agents asserting the same session string create separate sessions and separate budgets.

## Source and deeper walkthrough

The maintained source is the `examples/coding-agents-demo` directory in the Talon repository. The [coding-agent fleet guide](./governing-coding-agents.md) explains the neutral metadata contract, agent topology, session semantics, budgets, and limitations.