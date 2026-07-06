---
title: Dativo Talon documentation
description: Learn Dativo Talon, an open-source AI governance gateway for LLM apps, agents, and coding tools. Govern PII, tools, costs, provider fallback, EU/local routing, coding sessions, scanner engines, and signed evidence.
slug: /
---

# Dativo Talon documentation

Dativo Talon is an open-source AI governance gateway for teams that need to control LLM and AI-agent traffic before it reaches providers, then prove what happened with signed evidence.

Talon is useful when a SaaS, fintech, healthtech, e-commerce, support, or platform team already has AI workflows in production and needs practical governance without rebuilding the product. It covers PII controls, external and local scanner engines, tool and model policy, cost caps, coding-agent sessions, sovereignty-aware provider fallback, EU/local routing, dashboard visibility, tenant isolation, compliance exports, and signed evidence.

**Current release: v1.7.0 (2026-07-06).** Its main addition is coding-agent governance: Claude Code, Codex CLI, and custom orchestrators can participate in caller-scoped sessions across provider routes, with per-subagent attribution, cache-aware cost, session soft caps, dashboard drill-down, and signed session evidence.

Talon governs provider-bound traffic without becoming the agent runtime. It does not spawn agents, schedule subagents, or observe local file/shell execution that never crosses the gateway.

## What Talon helps you do

| Capability | What you get | Start here |
|---|---|---|
| Evaluate quickly | Run a no-key demo and inspect PII, cost, policy, and signed evidence. | [60-second demo](./quickstart-demo.md) |
| Govern an existing app or agent | Put Talon in front of provider-bound traffic with a base URL and caller key change. | [Add Talon to an existing app](./add-talon-to-existing-app.md) |
| Govern coding-agent fleets | One caller-scoped session across Anthropic and OpenAI routes, with subagent attribution, session budgets, and signed session evidence. | [Govern coding agents](./governing-coding-agents.md) |
| Keep sensitive-data detection in your environment | Use built-in regex, a Presidio-compatible HTTP/UDS service, or a local LLM such as Ollama. | [External scanners](./external-scanners.md) |
| Keep spend predictable | Apply caller budgets, session soft caps, and provider-aware cost accounting. | [Cost governance by caller](./cost-governance-by-caller.md) |
| Keep traffic available without bypassing policy | Configure transient-error fallback chains; every candidate is re-checked against sovereignty, model, tool, budget, and session policy. | [Configuration](./configuration.md) |
| Control EU or local-only data movement | Enforce `eu_strict` or air-gap posture and inspect configured versus observed destinations. | [Air-gapped deployment](./air-gapped-deployment.md) |
| Produce reviewable proof | Export and verify signed evidence, compliance reports, sovereignty facts, failover chains, scanner facts, and coding sessions. | [Evidence store](./evidence-store.md) |
| Produce compliance artifacts | Initialize policy packs and export RoPA, Annex IV, and framework reports. | [Turnkey compliance reports](./turnkey-compliance-reports.md) |

## Start here by job

### "I am evaluating Talon for an EU team"

1. Run the [60-second demo](./quickstart-demo.md).
2. Review [What Talon does to your request](./what-talon-does-to-your-request.md).
3. Check [EU/local-only deployment](./air-gapped-deployment.md) and the [governance control matrix](./governance-control-matrix.md).
4. Review [external scanners](./external-scanners.md) if built-in regex detection is not enough.
5. Inspect the [Evidence store](./evidence-store.md) and [sample auditor pack](./sample-auditor-pack.md).
6. Choose an integration path: [existing app](./add-talon-to-existing-app.md), [coding agents](./governing-coding-agents.md), [vendor AI](./vendor-integration-guide.md), or [new governed agent](./first-governed-agent.md).

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

Without `--tenant` or `--caller`, the session forms are unscoped. The CLI and dashboard use the same session aggregation over signed evidence, so they cannot compute different session totals.

### "I need stronger PII detection"

Review [External scanners](./external-scanners.md), [Local scanner engines](./local-scanner-engines.md), and the [Presidio compatibility matrix](./presidio-compatibility-matrix.md).

## What is new in the current release

### Coding-agent sessions and orchestration metadata

- Generic `X-Talon-Session-ID`, `X-Talon-Agent-ID`, `X-Talon-Parent-Agent-ID`, and `X-Talon-Client` headers work across provider routes.
- Claude Code and Codex adapters map vendor headers into the same neutral contract.
- Role names such as `orchestrator`, `planner`, `generator`, `reviewer`, and `executor` are examples only. Agent/client values are free-form attribution. The only enforced stage vocabulary is `generation`, `judge`, or `commit`.
- Policy and budgets bind to authenticated callers and tenants, never to the client-asserted agent label.
- Session audit, export, verification, cost rollups, and the Coding Sessions dashboard operate on the same aggregation over signed evidence.

### Cost and budget correctness

- Anthropic cache creation/read and OpenAI cached input are normalized for provider-aware cost.
- Streamed Responses usage and Anthropic streamed output are captured.
- The free Anthropic `count_tokens` endpoint remains governed but records cost 0 and zero budget impact.
- Evidence records `pricing_basis` and `pricing_known`.
- `max_session_cost` is a soft cap across provider routes; in-flight and concurrent requests can overshoot before the next request is denied.

### Agentic traffic coverage

- Responses `instructions` is governed as prompt text.
- Tool-use inputs, tool-result outputs, and function-call arguments are scanned and written to signed tool-content evidence.
- Tool-content scanning is evidence-only today; Talon does not redact or block based on that signal yet.

### Protocol and deployment hardening

- `responses_store_mode: preserve` honors explicit `store:false` by default.
- Client retry and rate-limit headers survive the gateway.
- `connect_timeout` bounds connection establishment; response-header wait defaults to `request_timeout`.
- CLI-set secrets can be scoped with repeatable `--tenant` and `--agent` flags for multi-tenant deployments.
- The coding-agents scenario has both Docker and no-Docker verification paths.

## Honest boundaries for coding agents

- Talon sees model API traffic, not local file edits, shell commands, or tool execution that never crosses the gateway.
- Tool-related request content can be scanned into evidence, but that signal is evidence-only today.
- Claude Code and Codex subscription/OAuth billing cannot be governed; the supported model is Talon caller key in, vault-stored provider API key out.
- Client-asserted subagent identity is attribution, not workload attestation.
- Session budgets are soft caps; atomic reservation remains separate work.
- Coding callers default `response_pii_action: allow` because other response-PII actions currently buffer the entire SSE stream before first token.

## Find the right guide

### Evaluate Talon

- [60-second demo](./quickstart-demo.md)
- [Turnkey compliance reports](./turnkey-compliance-reports.md)
- [Quickstart](./quickstart.md)
- [Choosing an integration path](./choosing-integration-path.md)
- [Adoption scenarios](./adoption-scenarios.md)
- [Persona guides](./persona-guides.md)
- [Why not just a PII proxy?](./why-not-a-pii-proxy.md)

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
- [Presidio compatibility matrix](./presidio-compatibility-matrix.md)
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