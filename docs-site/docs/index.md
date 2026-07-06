---
title: Dativo Talon documentation
description: Learn Dativo Talon v1.7.0, an open-source AI governance gateway for coding-agent sessions, LLM traffic, PII, tools, costs, provider fallback, EU routing, local scanners, and signed evidence.
slug: /
---

# Dativo Talon documentation

Dativo Talon is an open-source AI governance gateway for teams that need to control LLM and AI-agent traffic before it reaches providers, then prove what happened with signed evidence.

**Current release: v1.7.0 (2026-07-06).** The release turns coding-agent governance into a complete adoption surface: Claude Code, Codex CLI, and custom orchestrators can participate in caller-scoped sessions across provider routes, with per-subagent attribution, cache-aware cost, session soft caps, dashboard drill-down, and signed session evidence.

Talon governs provider-bound traffic without becoming the agent runtime. It does not spawn agents, schedule subagents, or observe local file/shell execution that never crosses the gateway.

## What Talon helps you do

| Capability | What you get | Start here |
|---|---|---|
| Govern coding-agent fleets | One session across Anthropic and OpenAI routes, with per-subagent attribution, session budgets, and signed session evidence. | [Govern coding agents](./governing-coding-agents.md) |
| Prove the coding-agent path offline | Run the same two-wire, cross-provider session scenario with Docker or through the CI-identical Go integration test. | [Coding-agents demo](./coding-agents-demo.md) |
| Govern Claude Code | Route Anthropic Messages traffic through a caller-authenticated gateway with session/subagent evidence. | [Claude Code integration](./claude-code-integration.md) |
| Govern Codex CLI | Route Responses traffic through Talon with streaming usage, cache-aware cost, retention semantics, and session evidence. | [Codex CLI integration](./codex-cli-integration.md) |
| Keep traffic available without bypassing policy | Configure transient-error fallback chains; every candidate is re-checked against sovereignty, model, tool, and budget policy. | [Configuration](./configuration.md) |
| Keep scanning in your environment | Use regex, a Presidio-compatible HTTP/UDS service, or a local LLM such as Ollama. | [External scanners](./external-scanners.md) |
| Control EU or local-only data movement | Enforce `eu_strict` or air-gap posture and inspect configured versus observed destinations. | [Air-gapped deployment](./air-gapped-deployment.md) |
| Prove governance | Export and verify signed evidence, including session, failover, scanner, destination, tool-content, and cost facts. | [Evidence store](./evidence-store.md) |

## Start here by job

### "I need to govern coding tools used by engineers"

1. Read [How to govern a coding-agent fleet](./governing-coding-agents.md).
2. Run the [coding-agents demo](./coding-agents-demo.md) with Docker or the no-Docker integration path.
3. Configure the real tool: [Claude Code](./claude-code-integration.md) or [Codex CLI](./codex-cli-integration.md).
4. Start in shadow mode, inspect the Coding Sessions dashboard, then enable enforcement.

### "I need one audit trail for a multi-model coding session"

```bash
talon audit list --session <id>
talon audit export --session <id>
talon audit verify --session <id>
talon costs --session <id> --json
```

Without `--tenant` or `--caller`, the session forms are unscoped. The v1.7.0 post-epic fix also makes `talon costs --session` follow the same rule instead of silently defaulting to tenant `default`.

The CLI and dashboard use the same session aggregation over signed evidence, so they cannot compute different session totals.

### "I need EU/local-only provider governance"

Start with [Air-gapped deployment](./air-gapped-deployment.md), [Provider registry](./provider-registry.md), and [Configuration](./configuration.md).

### "I need stronger PII detection"

Review [External scanners](./external-scanners.md), [Local scanner engines](./local-scanner-engines.md), and the [Presidio compatibility matrix](./presidio-compatibility-matrix.md).

## v1.7.0: coding-agent governance, released

Epic #192 and its acceptance-run fixes are now the **v1.7.0 release**, not unreleased work.

### Session and orchestration model

- **Neutral orchestration metadata.** Generic `X-Talon-Session-ID`, `X-Talon-Agent-ID`, `X-Talon-Parent-Agent-ID`, and `X-Talon-Client` headers work across provider routes. Claude Code and Codex adapters map vendor headers into the same contract.
- **Roles are labels.** `orchestrator`, `planner`, `generator`, `reviewer`, `executor`, and `judge` are examples only. Agent/client values are free-form attribution. The only enforced stage vocabulary is `generation`, `judge`, or `commit`.
- **Caller ≠ tenant ≠ agent.** Policy and budgets bind to authenticated callers/tenants, never to the client-asserted agent label.
- **Cross-provider session audit.** `audit list/export/verify --session` and `costs --session` operate on the whole caller-scoped session with a per-subagent rollup.
- **Coding Sessions dashboard.** Recent asserted sessions show requests, models/providers, tokens, cost, denials by reason, and per-subagent drill-down.

### Cost and budget correctness

- **Cache-aware, provider-aware cost.** Anthropic cache creation/read and OpenAI cached input are normalized correctly, including terminal usage from streamed Responses traffic.
- **Anthropic streamed output is counted.** v1.7.0 fixes output usage that was previously missed in `message_delta` events.
- **`count_tokens` costs zero.** The free Anthropic endpoint is still PII-scanned, policy-checked, and evidenced, but no fabricated spend reaches budgets.
- **Pricing derivation is explicit.** Evidence records `pricing_basis` and `pricing_known`.
- **Session soft caps.** `max_session_cost` denies a new request once accumulated session spend plus the pre-request estimate exceeds the limit across provider routes. In-flight and concurrent requests can overshoot.
- **Session-store failure is explicit.** The budget check fails open and signed evidence carries `session_budget_unavailable`.

### Agentic traffic coverage

- **Responses `instructions` are governed prompt text.** PII there is scanned and can be redacted.
- **Tool-related request content is observed.** Tool-use inputs, tool-result outputs, and function-call arguments are scanned and written to signed `classification.tool_content` evidence.
- **Tool-content scanning is evidence-only today.** Talon does not redact or block based on that signal yet because per-block-type tool redaction is not implemented. This is intentionally different from local tool execution, which remains invisible when it never crosses the gateway.

### Protocol and retention correctness

- **Responses retention intent is preserved by default.** `responses_store_mode: preserve` honors explicit `store:false`; `force_if_absent` and `force_true` are explicit operator choices.
- **Client backoff headers are forwarded.** Retry and rate-limit headers needed by coding clients survive the gateway.
- **Long reasoning calls no longer inherit a 10-second response-header ceiling.** `connect_timeout` now bounds connection establishment; `response_header_timeout` defaults to `request_timeout`. The coding-agents pack only needs its raised `request_timeout: 600s`.

### Multi-tenant secret isolation

v1.7.0 adds repeatable `talon secrets set --tenant` and `--agent` flags. In multi-tenant/MSP deployments, use them to scope CLI-set provider secrets. The backward-compatible default remains allow-all and now prints a warning.

## Honest boundaries for coding agents

- Talon sees model API traffic, not local file edits, shell commands, or tool execution that never crosses the gateway.
- Tool-related request content can be scanned into evidence, but that signal is evidence-only today.
- Claude Code and Codex subscription/OAuth billing cannot be governed; the supported model is Talon caller key in, vault-stored provider API key out.
- Client-asserted subagent identity is attribution, not workload attestation.
- Session budgets are soft caps; atomic reservation remains separate work.
- Coding callers default `response_pii_action: allow` because other response-PII actions currently buffer the entire SSE stream before first token.

## Find the right guide

### Coding agents

- [Govern a coding-agent fleet](./governing-coding-agents.md)
- [Run the coding-agents demo](./coding-agents-demo.md)
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

- **v1.7.0 — 2026-07-06:** coding-agent sessions, subagent attribution, session audit/cost/verification, cache-aware pricing, session soft caps, Coding Sessions dashboard, coding-agents pack/demo/guides, agentic tool-content evidence, retention and protocol fixes, timeout hardening, and scoped CLI-set secret ACLs.
- **v1.6.8 — 2026-07-04:** external and local scanner engines.
- **v1.6.7 — 2026-07-03:** sovereignty-respecting provider fallback chains.
- **v1.6.6 — 2026-06-30:** air-gap mode and sovereignty posture reports.

Read the [release notes](./release-notes.md) before upgrading or copying configuration snippets.

## Source of truth

The source markdown lives in the [dativo-io/talon](https://github.com/dativo-io/talon) repository. This site is the public documentation surface for indexing, navigation, and customer evaluation.