---
title: Dativo Talon documentation
description: "One company policy for your AI use cases. Self-hosted control of models, data, tools, budgets and provider failures, with sessions and signed evidence."
slug: /
---

# One company policy for your AI use cases.

Talon is an open-source, self-hosted AI control plane. Control model access, data and tool permissions, enforce budgets, handle provider failures, and investigate decisions with signed evidence — on the paths you route through Talon.

Start with one AI use case. The four jobs are cost control, reliability, shared policy and session understanding, backed by signed, tamper-evident evidence.

You do **not** need to rebuild your agent in Talon. Start with one workflow and a control you can test.

**Start with an application you already have.** Register it with `talon agents add`, connect a supported interception path, and inspect the effective policy, decisions and next steps in the Operations Console.

## Choose your path

| You want to… | Start here | What you'll verify |
|---|---|---|
| See Talon without credentials | [60-second demo](./quickstart-demo.md) | A governed model request and signed evidence with a mock provider |
| Connect an existing application | [Add Talon to your app](./add-talon-to-existing-app.md) | Register a use case, point the model SDK at Talon and verify the connection |
| Govern an n8n refund workflow | [n8n refund approvals](./n8n-refund-approvals.md) | Company action policy, bound human approval, controlled dispatch and signed lifecycle evidence |
| Govern a consequential business action | [Exact-action proof](./action-gateway-proof.md) | HTTP action denial, separate approval and controlled dispatch (no provider key) |
| See several use cases in one gateway | [Product demo](./product-demo.md) | Support PII/fallback, coding tool policy, document budget denial and verified evidence |
| Operate an installation | [Production pilot](./production-pilot.md) | First app, governed business action, reviewer, evidence and recovery |
| Compare open-source and Enterprise integration options | [OSS and Enterprise](./open-source-and-enterprise.md) | Open-source enforcement and planned corporate-system integrations |
| Decide what Talon can intercept | [Integration paths](./choosing-integration-path.md) | Model, MCP, HTTP action and delegated-runtime boundaries, distinguished precisely |

## See the Operations Console

[![Talon Operations Console: readiness, AI use cases, approval decisions, action policies, sessions and signed evidence](/img/console-showcase.webp)](./operations-console.md)

The OSS [Operations Console](./operations-console.md) is a **local, paired, read-only** view: start with installation readiness and actionable findings, inspect a tenant-scoped AI use case and effective action policy, examine pending approvals and session decisions, and verify a signed evidence record. Runtime health is not inferred from historical requests, and a signature does not prove external business outcomes.

*Actual console screenshots from a synthetic Playwright fixture. The failed gateway and other degraded states are intentionally included to demonstrate failure reporting, not a customer incident.*

## Explore business use cases

| Use case | Problem | Where to start |
|---|---|---|
| **Customer support** | Safe replies, PII handling, policy-valid fallback and denied refund actions | [Support playbook](./use-case-playbooks.md#customer-support) |
| **n8n refund approval** | Allow a small action, hold another for a named reviewer, deny a large one, and prove whether dispatch happened | [n8n action walkthrough](./n8n-refund-approvals.md) |
| **Coding agents** | Intercepted release-tool policy, sessions and verifiable decisions | [Coding-agent playbook](./use-case-playbooks.md#coding-agents) |
| **People Analytics** | Allow aggregate questions; block individual-record export at the routed tool boundary | [People Analytics scenario](./use-case-playbooks.md#people-analytics) |
| **Vendor contract review** | Keep confidential content on approved provider routes | [Contract-review scenario](./use-case-playbooks.md#vendor-contract-review) |

The [use-case playbooks](./use-case-playbooks.md) distinguish reproducible demonstrations from synthetic or integration-in-progress scenarios. These are not references to customer production installations.

## Evaluate one use case end to end

1. **Choose a single boundary.** Use the [integration decision guide](./choosing-integration-path.md): your model SDK, intercepted MCP server, or exact HTTP action.
2. **Register an authenticated AI use case.** Use `talon agents add <name> --owner <team>` in [add an existing app](./add-talon-to-existing-app.md); for native agent development see [first governed agent](./first-governed-agent.md).
3. **Apply one deliberate rule.** Use the [policy cookbook](./policy-cookbook.md) and relevant [cost](./cost-governance-by-agent.md) or [action](./action-gateway.md) guide. Effective policy combines the organization baseline and explicit per-agent rules.
4. **Test an allow and a deny.** The prohibited provider request or intercepted action should be stopped on that path before dispatch; also confirm the allowed business flow still works.
5. **Inspect the record.** Verify evidence and compare it with the actual application or downstream test result. Use the [evaluation checklist](./evaluation-checklist.md) to record the outcome.

```bash
talon audit list --limit 10
talon audit show <evidence-id>
talon audit verify <evidence-id>
```

## Find the technical detail

| Need | Documentation |
|---|---|
| Organization policy and safe overrides | [Policy cookbook](./policy-cookbook.md), [authentication](./authentication-and-key-scopes.md) |
| MCP permissions vs HTTP approvals | [MCP governance](./mcp-governance-extension.md), [Action Gateway](./action-gateway.md) |
| Request spending and fallback | [Cost governance](./cost-governance-by-agent.md), [configuration](./configuration.md) |
| Sessions and operational triage | [Operations Console](./operations-console.md), [day-two operations](./operate-ai-use-cases.md), [observability](./observability.md) |
| Governed business workflows and approvals | [n8n refund approvals](./n8n-refund-approvals.md), [Action Gateway](./action-gateway.md) |
| Production readiness and recovery | [Production pilot](./production-pilot.md), [single-node production](./single-node-production.md) |
| Evidence, incident response and auditor exports | [Evidence store](./evidence-store.md), [incident playbook](./incident-response-playbook.md), [compliance export](./compliance-export-runbook.md) |
| Security and scope limits | [Control-plane boundaries](./control-plane-boundaries.md), [governance control matrix](./governance-control-matrix.md), [threat model](./threat-model.md) |

**Important boundary:** Talon does not control local shell commands, file edits, direct HTTP requests or other operations that bypass it. Agent keys authenticate the configured use case; session and subagent labels are attribution, not independent identities. HMAC verification proves record integrity, not that a downstream business operation succeeded or that a deployment is legally compliant.

**Edition boundary:** Talon OSS keeps canonical policy, exact-action authorization, local approvals and independently verifiable evidence. Corporate OIDC, SIEM delivery profiles, external approval systems and multi-deployment operations belong to a **planned**, not yet generally available Enterprise edition. See [the status comparison](./open-source-and-enterprise.md).

Technical documentation is maintained primarily in the [Talon repository](https://github.com/dativo-io/talon); this website provides the case-first navigation, practical n8n and pilot journeys, and publication layer.
