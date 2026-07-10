---
title: Dativo Talon documentation — AI use case control plane
description: Operate and control company AI use cases with shared cost controls, reliability, policy, session visibility, intercepted-action controls, and signed evidence.
slug: /
---

# Operate company AI use cases with one control plane

Dativo Talon is the **open-source control plane for company AI use cases**. It gives teams one operating layer for cost control, reliability, shared policy, and session understanding across AI use cases **routed through Talon**.

A support bot, coding agent, internal assistant, and vendor integration should not each reinvent budgets, retry behavior, data policy, incident visibility, and proof. Talon puts those controls on the governed path without becoming the agent runtime.

[Read what the Talon control plane does](./control-plane.md), including the exact split between shipped behavior and active product direction.

## Get first value in about 10 minutes

Do not begin with a complete organization rollout. Put one real AI use case behind Talon and prove one control.

1. **See the path:** run the [60-second no-key demo](./quickstart-demo.md).
2. **Connect one use case:** [add Talon to an existing app](./add-talon-to-existing-app.md), start a [first governed agent](./first-governed-agent.md), or [choose the smallest integration path](./choosing-integration-path.md).
3. **Observe first where supported:** start in shadow mode, send a real request, and inspect what policy would do before turning on enforcement.
4. **Inspect the evidence:**

```bash
talon audit list
talon audit show <id>
talon audit verify <id>
```

For a real asserted session:

```bash
talon audit list --session <id>
talon costs --session <id> --json
```

5. **Enable one control:** cap spend, restrict a model or destination, block/redact sensitive data, remove a forbidden tool schema, or govern an intercepted MCP call.

For the deepest evaluator path, [reproduce a governed session manually](./manual-governed-session.md).

## One control plane, four operator jobs

| Operator job | What Talon does today | Start here |
|---|---|---|
| **Control cost** | Enforces caller daily/monthly caps before provider access and tracks caller-scoped session soft caps. | [Budgets and hard limits](./cost-governance-by-caller.md) |
| **Keep AI use cases running safely** | Uses explicitly configured error-driven fallback for transient failures, re-checks each candidate against policy, and fails closed when the chain is exhausted. | [Retries, fallback, and timeouts](./configuration.md#provider-fallback-chains-error-driven-failover) |
| **Apply shared policy** | Applies gateway defaults and per-caller overrides across PII handling, models, budgets, tools, and egress; native agent policy remains in `agent.talon.yaml`. | [Policy cookbook](./policy-cookbook.md) |
| **Understand sessions** | Groups supported provider traffic by session identity and exposes session-scoped audit and cost rollups without becoming the orchestrator. | [Session visibility for coding agents](./governing-coding-agents.md) |

Under all four jobs sits a **proof layer**: enforcement and routing decisions can produce HMAC-signed, tamper-evident records that operators can verify and export. Evidence supports operations, customer review, and audit work; it is not the product category and it is not a compliance certificate.

## The product object: AI use case

Use these terms consistently:

- **AI use case** is the public product term: one operated unit of AI usage, such as a support bot, coding agent, copilot, or vendor integration.
- **Agent** is the current CLI/config object used by native Talon flows. One `agent.talon.yaml` describes one agent/use case.
- **Caller** and **tenant** remain implementation terms in parts of the current gateway configuration. Do not treat them as a competing product category.

The current implementation does not yet expose the full planned fleet workflow (`talon agents` list/show/enable/disable) as the primary operational interface. The [control-plane explanation](./control-plane.md) separates what is shipped from that active direction.

## Choose the boundary you already have

| You already have… | Start here |
|---|---|
| An OpenAI- or Anthropic-backed application | [Add Talon to an existing app](./add-talon-to-existing-app.md) |
| Claude Code, Codex CLI, or a multi-model coding workflow | [Govern coding-agent sessions](./governing-coding-agents.md) |
| OpenClaw or another packaged agent | [OpenClaw integration](./openclaw-integration.md) |
| A Slack or internal support bot | [Slack bot integration](./slack-bot-integration.md) |
| A new native Talon agent | [Your first governed agent](./first-governed-agent.md) |
| A third-party AI vendor or MCP boundary | [Govern third-party AI vendors](./vendor-integration-guide.md) |
| Multiple customer environments | [Multi-tenant / MSP guide](./multi-tenant-msp.md) |

## Shared policy means the intercepted path

Talon can govern only what actually traverses a Talon enforcement boundary.

On the LLM gateway path it can evaluate provider-bound requests, models, budgets, PII/data handling, egress rules, and visible tool schemas. Where MCP execution is routed through Talon interception, Talon can govern `tools/list` and `tools/call` on that path.

Talon does **not** see local shell commands, file edits, browser actions, local tool execution, or direct provider/API calls that bypass Talon. Read the full [request lifecycle](./what-talon-does-to-your-request.md) and [MCP proxy architecture](./architecture-mcp-proxy.md).

## Reliability never bypasses policy

Talon's current fallback behavior is error-driven, not a generic traffic optimizer.

- transient failures include timeout, connection failure, HTTP 429, and provider 5xx;
- fallback candidates are explicitly configured;
- each candidate is checked against the effective policy before dispatch;
- incompatible or disallowed candidates are not used merely to keep traffic up;
- exhausted chains fail closed and leave linked evidence.

Read the [configuration reference](./configuration.md#provider-fallback-chains-error-driven-failover) and [incident response playbook](./incident-response-playbook.md).

## Sessions are more useful than request logs

A real session lets an operator ask: what did this AI use case do, what did it cost, where did it fail, and what policy intervened?

Supported clients can provide an explicit or vendor-derived session identity. Synthetic request-level IDs remain useful for evidence correlation, but they should not be presented as fake multi-request sessions. Session budgets are soft caps: concurrent in-flight requests can overshoot before the next request is denied.

Start with [governing coding agents](./governing-coding-agents.md) and the [manual governed-session proof](./manual-governed-session.md).

## Evidence, EU, privacy, and compliance support

These are strong trust layers, not the front door of the product.

- [Evidence store](./evidence-store.md) — what is signed, stored, verified, and exported.
- [Evidence integrity proof](./evidence-integrity-demo.md) — tamper with a record and verify that validation fails.
- [Governance control matrix](./governance-control-matrix.md) — which controls run on which intercepted paths.
- [Air-gapped deployment](./air-gapped-deployment.md) — local/EU-only deployment posture where configured.
- [Compliance export runbook](./compliance-export-runbook.md) — evidence handoff and supporting review artifacts.

Talon can provide supporting controls and verifiable evidence. It does not make a deployment compliant by itself.

## Honest boundaries worth knowing up front

- Talon sees governed traffic and intercepted actions, not activity that bypasses it.
- Client-asserted agent/subagent identity is attribution, not authentication or workload attestation.
- Session budgets are soft caps unless strict reservation is explicitly implemented.
- HMAC-signed evidence is tamper-evident and verifiable, not immutable.
- The dashboard is a current operational surface; the long-term direction is CLI-primary operations with the dashboard as a secondary projection of shared semantics.
- Fleet inventory, config-backed enable/disable, safe live reload, and the warning-evidence-webhook pipeline are active product direction, not current commands to fabricate in docs.

## Source of truth

The product documentation markdown lives in the [dativo-io/talon](https://github.com/dativo-io/talon) repository. This Docusaurus site is the public documentation surface for navigation, indexing, and evaluation.

Production intentionally follows the configured `TALON_DOCS_REF` (default: `main`). The docs build validates the cross-repository publication contract before the expensive site build so mapped upstream files and sidebar routes cannot drift silently.
