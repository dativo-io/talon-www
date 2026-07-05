---
title: Dativo Talon documentation
description: Learn Dativo Talon, an open-source AI governance gateway for European SMBs. Govern coding-agent sessions, LLM traffic, PII, tools, costs, provider fallback, EU routing, local scanner engines, and signed evidence.
slug: /
---

# Dativo Talon documentation

Dativo Talon is an open-source AI governance gateway for teams that need to control LLM and AI-agent traffic before it reaches providers, then prove what happened with signed evidence.

Talon governs provider-bound traffic without becoming the agent runtime. That now includes coding-agent fleets: Claude Code, Codex CLI, and custom orchestrators can share caller-scoped sessions across provider routes, with per-subagent attribution, cache-aware cost, session soft caps, dashboard drill-down, and signed session evidence.

## What Talon helps you do

| Capability | What you get | Start here |
|---|---|---|
| Govern coding-agent fleets | One session across Claude Code, Codex CLI, and custom orchestrators; per-subagent attribution, session budgets, and signed session evidence. | [Govern coding agents](./governing-coding-agents.md) |
| Govern Claude Code | Route Anthropic Messages API traffic through a caller-authenticated gateway with session/subagent evidence. | [Claude Code integration](./claude-code-integration.md) |
| Govern Codex CLI | Route Responses API traffic through Talon with correct streaming usage, cache-aware cost, retention semantics, and session evidence. | [Codex CLI integration](./codex-cli-integration.md) |
| Evaluate quickly | Run a no-key Docker demo and inspect PII, cost, policy, and signed evidence. | [60-second demo](./quickstart-demo.md) |
| Keep traffic available without bypassing policy | Configure transient-error fallback chains; every candidate is re-checked against sovereignty, model, tool, and budget policy. | [Configuration](./configuration.md) |
| Keep scanning in your environment | Use regex, a Presidio-compatible HTTP/UDS service, or a local LLM such as Ollama. | [External scanners](./external-scanners.md) |
| Control EU or local-only data movement | Enforce `eu_strict` or air-gap posture and inspect configured versus observed destinations. | [Air-gapped deployment](./air-gapped-deployment.md) |
| Prove governance | Export and verify signed evidence, including session, failover, scanner, destination, and cost facts. | [Evidence store](./evidence-store.md) |

## Start here by job

### "I need to govern coding tools used by engineers"

1. Read [How to govern a coding-agent fleet](./governing-coding-agents.md).
2. Run the offline coding-agents demo from that guide.
3. Configure the real tool: [Claude Code](./claude-code-integration.md) or [Codex CLI](./codex-cli-integration.md).
4. Start in shadow mode, inspect the Coding Sessions dashboard, then enable enforcement.

### "I need one audit trail for a multi-model coding session"

Use the session surfaces:

```bash
talon audit list --session <id>
talon audit export --session <id>
talon audit verify --session <id>
talon costs --session <id> --json
```

The CLI and dashboard use the same session aggregation, so they cannot drift into different totals.

### "I need EU/local-only provider governance"

Start with [Air-gapped deployment](./air-gapped-deployment.md), [Provider registry](./provider-registry.md), and [Configuration](./configuration.md).

### "I need stronger PII detection"

Review [External scanners](./external-scanners.md), [Local scanner engines](./local-scanner-engines.md), and the [Presidio compatibility matrix](./presidio-compatibility-matrix.md).

## Coding-agent governance: what actually shipped on `main`

Epic #192 added a complete provider-bound governance surface for coding-agent orchestration. These changes are currently in Talon `main` and the changelog's **Unreleased** section; do not treat them as a tagged release until a release is cut.

- **Neutral orchestration metadata.** Generic `X-Talon-Session-ID`, `X-Talon-Agent-ID`, `X-Talon-Parent-Agent-ID`, and `X-Talon-Client` headers work across provider routes. Claude Code and Codex adapters map vendor headers into the same contract. Identity is client-asserted attribution, not authentication, and never a policy input.
- **Cross-provider session audit.** A caller-scoped session can span Anthropic and OpenAI routes. `audit list/export/verify --session` and `costs --session` operate on the whole session with a per-subagent rollup.
- **Cache-aware, provider-aware cost.** Anthropic cache creation/read and OpenAI cached input are normalized correctly, including terminal usage from streamed Responses traffic. Evidence records `pricing_basis` and whether pricing was known.
- **Session soft caps.** `max_session_cost` denies a new request once accumulated session spend plus the pre-request estimate exceeds the limit, across provider routes. It is intentionally documented as a soft cap: in-flight and concurrent requests can overshoot.
- **Coding Sessions dashboard.** Recent asserted sessions show requests, models/providers, tokens, cost, denials by reason, and per-subagent drill-down.
- **Coding-agents pack and offline demo.** `talon init --pack coding-agents` creates a shadow-mode starting point with coding-tuned timeouts, session budget defaults, and high-precision credential recognizers. The offline demo exercises two wire families, subagent attribution, a PII warning, a session-budget denial, and signed export verification.
- **Retention semantics fixed for Responses clients.** `responses_store_mode: preserve` is the default, so explicit client `store:false` is not silently reversed. `force_if_absent` and `force_true` are explicit operator choices.

## Honest boundaries for coding agents

- Talon sees model API traffic, not local file edits, shell commands, or other tool execution that never crosses the gateway.
- Claude Code and Codex subscription/OAuth billing cannot be governed; the supported model is Talon caller key in, vault-stored provider API key out.
- Client-asserted subagent identity is attribution, not workload attestation.
- Session budgets are soft caps; atomic reservation remains separate work.
- Coding callers default `response_pii_action: allow` because other response-PII actions currently buffer the entire SSE stream before first token.

## Find the right guide

### Coding agents

- [Govern a coding-agent fleet](./governing-coding-agents.md)
- [Govern Claude Code](./claude-code-integration.md)
- [Govern Codex CLI](./codex-cli-integration.md)
- [Govern OpenClaw](./openclaw-integration.md)

### Other how-to guides

- [Add Talon to an existing app](./add-talon-to-existing-app.md)
- [Deploy in air-gap / local-only mode](./air-gapped-deployment.md)
- [Run a local PII scanner engine](./local-scanner-engines.md)
- [Test and operate Plan Review](./plan-review-operators.md)
- [Add compliance to a Slack bot](./slack-bot-integration.md)
- [Govern third-party AI vendors](./vendor-integration-guide.md)
- [Offer Talon to multiple customers](./multi-tenant-msp.md)
- [Run governed LLM calls in CI/CD](./cicd-pipeline-governance.md)
- [Export evidence for auditors](./compliance-export-runbook.md)
- [Respond to incidents](./incident-response-playbook.md)

### Reference

- [Configuration](./configuration.md)
- [Gateway dashboard](./gateway-dashboard.md)
- [Authentication and key scopes](./authentication-and-key-scopes.md)
- [Provider registry](./provider-registry.md)
- [Operational control plane](./operational-control-plane.md)
- [Evidence integrity specification](./evidence-integrity-spec.md)
- [Governance control matrix](./governance-control-matrix.md)
- [External scanners](./external-scanners.md)
- [Threat model](./threat-model.md)
- [Conformance](./conformance.md)
- [Benchmarks](./benchmarks.md)

## Tagged release highlights

The latest tagged release line documented by the previous site update is **v1.6.8 (2026-07-04)**:

- **v1.6.8 — external and local scanner engines**
- **v1.6.7 — sovereignty-respecting provider fallback chains**
- **v1.6.6 — air-gap mode and sovereignty posture reports**

The coding-agent work above is newer and currently belongs to **Unreleased** in the Talon changelog.

Read the [release notes](./release-notes.md) before upgrading or copying configuration snippets.

## Source of truth

The source markdown lives in the [dativo-io/talon](https://github.com/dativo-io/talon) repository. This site is the public documentation surface for indexing, navigation, and customer evaluation.