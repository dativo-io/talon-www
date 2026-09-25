---
title: Dativo Talon documentation — company AI policy enforcement
description: Turn company AI policy into enforceable, use-case-specific controls with action authorization, supporting operational controls, and verifiable evidence.
slug: /
---

# Enforce company AI policy across AI use cases

Dativo Talon is the **open-source control layer for company AI use cases**. Its product model is:

1. **Company policy** — define the organization constraints that should remain stable across runtimes and providers.
2. **Use-case-specific effective rules** — apply only the bounded parameters or tighter constraints that make one AI use case different.
3. **Consequential-action authorization** — decide at supported interception/callout boundaries before a governed business effect is released.
4. **Verifiable proof** — record which policy and decision applied so operators can inspect and verify what happened.

Cost control, policy-preserving reliability, attribution, and session understanding remain important supporting capabilities on the same governed path. They help operate the control layer; they are not the category by themselves.

A support bot, coding assistant, internal copilot, and document workflow should not each reinterpret company AI policy in different runtime-specific code. Talon keeps the company control contract stable while leaving application logic and workflow orchestration in place.

[Read what the Talon control layer does](./control-plane.md), including current behavior and honest boundaries.

## Start with the product demo

The canonical [product demo](./product-demo.md) operates three AI use cases through one Talon gateway on real providers:

| AI use case | What the demo proves |
|---|---|
| **customer-support** | Sensitive customer data is redacted, a failed local destination triggers fallback, and a disallowed fallback candidate is skipped because reliability remains policy-valid. |
| **coding-assistant** | An organization tool boundary blocks a destructive `admin_*` capability that the use case cannot weaken. |
| **document-summary** | A projected session-cost check prevents the next provider call; a later configuration change is safely reloaded and reflected in the operational view. |
| **Across the session history** | Costs, routing, denials, and policy interventions are exported as signed evidence and verified offline. |

```bash
export OPENAI_API_KEY=sk-... ANTHROPIC_API_KEY=sk-ant-...
# Stop Ollama first so the reliability path starts with a real local failure.
make product-demo
```

The demo uses real, paid provider calls. For a zero-key first look, use the [60-second demo](./quickstart-demo.md).

## Get first value without a platform migration

Do not begin with a complete organization rollout. Put one real AI use case behind Talon and prove one company rule or consequential-action boundary.

1. Choose an existing OpenAI/Anthropic application, coding agent, internal assistant, or MCP boundary.
2. [Add Talon to the existing app](./add-talon-to-existing-app.md) or [choose the smallest integration path](./choosing-integration-path.md).
3. With the current OSS implementation, give the use case one `agent.talon.yaml` and one vault-bound Talon key.
4. Define the relevant organization constraint and only the explicit use-case-specific override you need.
5. Trigger one preventive decision: a data/model/provider/egress denial, an intercepted action denial, or a hard budget boundary.
6. Inspect and verify the resulting evidence:

Current releases may still expose legacy shadow/log-only settings. They are not the target product posture; the active roadmap replaces global non-enforcing runtime modes with safe policy testing/impact preview while keeping hard controls enforced.

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

## One company control model, with supporting operator capabilities

| Operator job | What Talon does | Start here |
|---|---|---|
| **Apply company policy** | Resolves the organization baseline plus one explicit use-case override across PII, models, providers, budgets, tools, and egress. | [Policy cookbook](./policy-cookbook.md) |
| **Govern consequential actions** | Denies disallowed intercepted actions today; exact-action `ALLOW | DENY | REQUIRE_APPROVAL` with minimal durable authorization state is the active Action Gateway direction. | [Action control on the website](https://dativo.io/ai-action-control/) |
| **Control cost** | Enforces per-agent daily/monthly limits before provider access and tracks agent-scoped session budgets as a supporting policy control. | [Budgets and hard limits](./cost-governance-by-agent.md) |
| **Keep use cases reliable** | Uses explicitly configured fallback for supported transient failures, re-checks each candidate against effective policy, and fails closed on exhaustion. | [Retries, fallback, and timeouts](./configuration.md#provider-fallback-chains-error-driven-failover) |
| **Understand sessions** | Groups supported traffic by session identity and exposes cost, provider paths, denials, and signed request history. | [Session visibility for coding agents](./governing-coding-agents.md) |

## AI use case is the product object; agent is today’s configuration object

Publicly, Talon governs **AI use cases** independent of runtime or provider. In the current OSS configuration and CLI, one AI use case is represented by one **agent**:

```text
one agent.talon.yaml
= one AI use case
= one Talon traffic identity
= one active vault-bound agent key
= one resolved effective policy
```

The key resolves `key → agent → tenant_id`; the request cannot select a different agent or tenant. Client-provided subagent and session labels remain attribution inside that authenticated boundary, not independent workload attestation.

For installations running several use cases, `agents_dir` discovers one `agent.talon.yaml` per use case. Configuration-backed enable/disable, periodic safe reload, and `talon agents` help operators manage that installation. These are current implementation mechanics; the stable contract is company policy → use-case-specific effective rules → supported enforcement boundary → evidence.

Read [authentication and key scopes](./authentication-and-key-scopes.md), the [configuration reference](./configuration.md), and the [operational control-plane reference](./operational-control-plane.md).

## Company policy means one decision model across use cases

The gateway owns provider wiring and the organization baseline in `talon.config.yaml`. Each AI use case can add one explicit override in `agent.talon.yaml`. Talon resolves both into one effective-policy snapshot used by supported provider, data, budget, fallback, tool/action, and evidence paths. The runtime is an integration surface, not a second policy authority.

Organization hard constraints remain binding:

- a use case can tighten the organization PII floor, not weaken it;
- organization model/provider restrictions and data-tier ceilings still apply;
- organization and use-case egress rules are intersected;
- tool and budget constraints are evaluated before provider or intercepted tool access;
- invalid security-sensitive configuration fails instead of silently disabling the intended boundary.

## Reliability never becomes a policy exception

Talon's current fallback behavior is error-driven, not generic load balancing or price optimization.

- Supported transient failures include timeout, connection failure, HTTP 429, and provider 5xx.
- Fallback candidates are explicitly configured.
- Every candidate is checked against the resolved effective policy before dispatch.
- A healthy but disallowed destination is skipped rather than used to keep traffic flowing.
- Exhausted chains fail closed and leave linked evidence.

See the [configuration reference](./configuration.md#provider-fallback-chains-error-driven-failover) and [incident response playbook](./incident-response-playbook.md).

## Sessions are more useful than isolated request logs

A session lets an operator ask: what did this AI use case do, what did it cost, which provider/model path did it take, and what policy intervened?

Supported clients can provide an explicit or vendor-derived session identity. Session state and budgets are scoped by tenant and authenticated Talon agent. Synthetic request IDs remain useful for evidence correlation, but they are not presented as fake multi-request sessions.

Session budgets are soft caps: concurrent in-flight requests can overshoot before a later request is denied.

Start with [governing coding agents](./governing-coding-agents.md) or the [manual governed-session proof](./manual-governed-session.md).

## Evidence, privacy, sovereignty, and compliance support

These strengthen the control layer and help teams prove what happened:

- [Evidence store](./evidence-store.md) — what is signed, stored, verified, and exported.
- [Evidence integrity proof](./evidence-integrity-demo.md) — change a record and watch verification fail.
- [Governance control matrix](./governance-control-matrix.md) — which controls run on which intercepted paths.
- [Air-gapped deployment](./air-gapped-deployment.md) — local and in-region deployment patterns.
- [Compliance export runbook](./compliance-export-runbook.md) — evidence handoff and supporting review artifacts.

Talon provides supporting controls and evidence. It does not make a deployment legally compliant by itself.

## Honest boundaries worth knowing up front

- Talon governs provider traffic and actions routed through its interception paths, not local shell commands, file edits, browser actions, or direct API calls that bypass it.
- The Talon agent identity is authenticated by its key; client-supplied subagent/session metadata is attribution.
- Session budgets are soft unless atomic reservation is explicitly implemented.
- HMAC-signed evidence is tamper-evident and verifiable, not immutable.
- The dashboard is a secondary operational surface; YAML and the local CLI remain the primary configuration and control path.

## Source of truth

The product documentation markdown lives in the [dativo-io/talon](https://github.com/dativo-io/talon) repository. This Docusaurus site publishes that content for navigation, indexing, and evaluation.

Production follows the configured `TALON_DOCS_REF` (default: `main`). The build validates mapped upstream files and public routes before compiling the site so the two repositories cannot drift silently.