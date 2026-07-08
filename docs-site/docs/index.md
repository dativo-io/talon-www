---
title: Dativo Talon documentation
description: Learn Dativo Talon, an open-source AI governance gateway for LLM apps, agents, and coding tools. Govern PII, tools, costs, provider fallback, EU/local routing, coding sessions, scanner engines, and signed evidence.
slug: /
---

# Dativo Talon documentation

Dativo Talon is an open-source AI governance gateway for teams that already have AI traffic and need to control what leaves, which models and provider-bound tools are allowed, how much callers and sessions may spend, where workloads may execute, and how to prove the decision later.

Talon governs provider-bound traffic without becoming the agent runtime. It does not spawn agents, schedule subagents, or observe local file, shell, or tool execution that never crosses the gateway.

## Evaluate Talon by increasing the proof

Do not start with architecture diagrams. Start with a claim you can reproduce.

| Step | What you do | What it proves |
|---|---|---|
| 1. See it | Watch the real five-act governed session on the [Talon homepage](https://dativo.io/). | Good traffic flows; a dangerous tool is filtered; PII is blocked; a US candidate is rejected and a local model is selected; spend is stopped; the session verifies. |
| 2. Try it | Run the [60-second no-key demo](./quickstart-demo.md). | OpenAI-compatible traffic passes through Talon, PII is classified in shadow mode, and the signed record verifies. |
| 3. Reproduce it | [Reproduce the governed session manually](./manual-governed-session.md). | Raw requests and Talon commands reproduce tool filtering, blocking, model denial, sovereignty routing, session budgets, tamper failure, session verification, and RoPA consistency. |
| 4. Attack it | Run the [evidence-integrity proof](./evidence-integrity-demo.md). | Modify signed evidence yourself and watch verification fail. |
| 5. Adopt it | [Choose an integration path](./choosing-integration-path.md). | Pick the smallest governed boundary that fits your current workload. |
| 6. Pilot it | [Open a pilot issue](https://github.com/dativo-io/talon/issues/new?title=Pilot%3A%20%3Cyour%20stack%3E&body=Current%20stack%3A%0AFirst%20control%20I%20need%20%28PII%20%2F%20spend%20%2F%20tools%20%2F%20data%20residency%29%3A). | Put one real workload behind Talon, start in shadow mode, then enable one control. |

## Start with one workload

You do not need to trust Talon in blocking mode on day one.

1. Put Talon in front of one dev or internal workload.
2. Start in **shadow mode** so Talon records what policy would do without changing the response.
3. Inspect PII, tool, model, destination, spend, and evidence signals.
4. Turn on one control: block PII, cap spend, keep confidential work local, or remove a dangerous tool before the model sees it.

| I already have… | Start here |
|---|---|
| An OpenAI- or Anthropic-backed application | [Add Talon to an existing app](./add-talon-to-existing-app.md) |
| Claude Code, Codex CLI, or a multi-model coding workflow | [Govern coding agents](./governing-coding-agents.md) |
| OpenClaw or another packaged agent | [OpenClaw integration](./openclaw-integration.md) |
| A new agent to build | [Your first governed agent](./first-governed-agent.md) |
| A third-party AI vendor or MCP boundary | [Govern third-party AI vendors](./vendor-integration-guide.md) |

## What Talon helps you control

| Capability | What happens on the governed path | Start here |
|---|---|---|
| Sensitive data | Scan before provider access, then warn, redact, block, or constrain execution according to policy. | [External scanners](./external-scanners.md) |
| Tools | Remove forbidden tool definitions before the model sees them; record provider-bound tool-content evidence where supported. | [Policy cookbook](./policy-cookbook.md) |
| Models and providers | Enforce caller allowlists and policy on the chosen provider path. | [Provider registry](./provider-registry.md) |
| Sovereignty | Deny a chosen destination on the proxy path, or evaluate and select candidates on the policy-aware runner path. | [Manual governed session](./manual-governed-session.md) |
| Spend | Apply caller daily/monthly caps and caller-scoped cross-provider session soft caps before the next request runs. | [Cost governance by caller](./cost-governance-by-caller.md) |
| Resilience | Re-check fallback candidates against sovereignty, model, tool, budget, and session policy. | [Configuration](./configuration.md) |
| Evidence | Export and verify HMAC-signed records for allows, denials, PII, routing, failover, costs, sessions, and compliance outputs. | [Evidence store](./evidence-store.md) |
| EU review artifacts | Compare declared controls with observed destinations and generate reviewable reports and exports. | [Governance control matrix](./governance-control-matrix.md) |

## Two provider-control paths

Talon exposes two different enforcement models. They are intentionally not the same.

### Gateway proxy: enforce the destination the client chose

The provider is encoded in the proxy route. Talon can allow or deny that provider-bound request according to caller, model, PII, tool, budget, and sovereignty policy.

A request addressed to the OpenAI proxy is not silently rewritten into an Ollama request.

### Policy-aware runner: evaluate candidates and select an allowed destination

The runner owns candidate selection. It can classify a confidential request, evaluate OpenAI/US, reject it before dispatch, then select Ollama/LOCAL and record both the rejected and selected candidates in signed routing evidence.

The [manual governed-session tutorial](./manual-governed-session.md) reproduces this distinction with real requests.

## Coding-agent governance

Talon can group Anthropic and OpenAI traffic into one caller-scoped session while remaining outside orchestration.

```bash
talon audit list --session <id>
talon audit export --session <id>
talon audit verify --session <id>
talon costs --session <id> --json
```

The same session aggregation powers CLI and dashboard views. Session budgets are soft caps: in-flight and concurrent requests can overshoot before the next request is denied.

Start with [How to govern a coding-agent fleet](./governing-coding-agents.md), then use the real-client guides for [Claude Code](./claude-code-integration.md) or [Codex CLI](./codex-cli-integration.md).

## Honest boundaries

- Talon sees provider-bound traffic, not local file edits, shell commands, or local tool execution that bypasses the gateway.
- Client-asserted agent and subagent identity is attribution, not authentication or workload attestation.
- Tool-content scanning is evidence-only where documented; it is not equivalent to local execution control.
- Session budgets are soft caps; strict concurrent reservation is a different control.
- Signed evidence is tamper-evident and cryptographically verifiable, not impossible to modify.
- Compliance outputs are supporting evidence, not legal advice or certification.

## Find the right guide

### Evaluate

- [60-second demo](./quickstart-demo.md)
- [Reproduce the governed session manually](./manual-governed-session.md)
- [Evidence integrity: 5-minute proof](./evidence-integrity-demo.md)
- [Choose an integration path](./choosing-integration-path.md)
- [Why not just a PII proxy?](./why-not-a-pii-proxy.md)

### Integrate

- [Add Talon to an existing app](./add-talon-to-existing-app.md)
- [Govern a coding-agent fleet](./governing-coding-agents.md)
- [Your first governed agent](./first-governed-agent.md)
- [Add governance to a Slack bot](./slack-bot-integration.md)
- [Govern third-party AI vendors](./vendor-integration-guide.md)
- [Offer Talon to multiple customers](./multi-tenant-msp.md)

### EU governance and evidence

- [Governance control matrix](./governance-control-matrix.md)
- [Air-gap and local-only deployment](./air-gapped-deployment.md)
- [Turnkey compliance reports](./turnkey-compliance-reports.md)
- [Evidence store](./evidence-store.md)
- [Sample auditor pack](./sample-auditor-pack.md)
- [Export evidence for auditors](./compliance-export-runbook.md)

### Operate

- [Configuration](./configuration.md)
- [Gateway dashboard](./gateway-dashboard.md)
- [Authentication and key scopes](./authentication-and-key-scopes.md)
- [Provider registry](./provider-registry.md)
- [Operational control plane](./operational-control-plane.md)
- [Observability](./observability.md)

## Source of truth

The source markdown lives in the [dativo-io/talon](https://github.com/dativo-io/talon) repository. This site is the public documentation surface for indexing, navigation, and customer evaluation.