---
title: Dativo Talon documentation
description: Choose a production AI use case, connect a supported interception path, enforce company policy and verify the result.
slug: /
---

# Start with an AI use case

Talon applies **company policy** to model requests and actions that pass through its supported interception paths. It also helps teams operate their AI use cases with cost controls, policy-valid fallback, sessions, and **signed, tamper-evident evidence**.

You do **not** need to rebuild your agent in Talon. Start with one workflow and a control you can test.

> **Version note:** This site publishes the Talon source selected at build time (usually `main`). Some features described in `main` may not yet be in the [latest tagged release](https://github.com/dativo-io/talon/releases/latest). Check [release notes](./release-notes.md) and the relevant guide before deploying.

## Choose your path

| You want to… | Start here | What you'll verify |
|---|---|---|
| See Talon without credentials | [60-second demo](./quickstart-demo.md) | A governed model request and signed evidence with a mock provider |
| Evaluate a real application | [Add Talon to your app](./add-talon-to-existing-app.md) | One authenticated use case, one effective policy and a traceable decision |
| Govern a consequential business action | [Exact-action proof](./action-gateway-proof.md) | HTTP action denial, separate approval and controlled dispatch (no provider key) |
| See several use cases in one gateway | [Product demo](./product-demo.md) | Support PII/fallback, coding tool policy, document budget denial and verified evidence |
| Compare open-source and Enterprise integration options | [OSS and Enterprise](./open-source-and-enterprise.md) | What's shipped in the OSS core vs planned corporate identity, SIEM and workflow integration |
| Decide what Talon can intercept | [Integration paths](./choosing-integration-path.md) | Model, MCP, HTTP action and delegated-runtime boundaries, distinguished precisely |

## Explore four business use cases

| Use case | Problem | Where to start |
|---|---|---|
| **Customer support** | Safe replies, PII handling, policy-valid fallback and denied refund actions | [Support playbook](./use-case-playbooks.md#customer-support) |
| **Coding agents** | Intercepted release-tool policy, sessions and verifiable decisions | [Coding-agent playbook](./use-case-playbooks.md#coding-agents) |
| **People Analytics** | Allow aggregate questions; block individual-record export at the routed tool boundary | [People Analytics scenario](./use-case-playbooks.md#people-analytics) |
| **Vendor contract review** | Keep confidential content on approved provider routes | [Contract-review scenario](./use-case-playbooks.md#vendor-contract-review) |

The [use-case playbooks](./use-case-playbooks.md) distinguish reproducible demonstrations from synthetic or integration-in-progress scenarios. These are not references to customer production installations.

## Evaluate one use case end to end

1. **Choose a single boundary.** Use the [integration decision guide](./choosing-integration-path.md): your model SDK, intercepted MCP server, or exact HTTP action.
2. **Create an authenticated use-case identity.** Follow [add an existing app](./add-talon-to-existing-app.md) or [first governed agent](./first-governed-agent.md). The Talon configuration object is called an *agent*.
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
| Sessions and operational triage | [Object model](./object-model.md), [operations](./operational-control-plane.md), [observability](./observability.md) |
| Evidence, incident response and auditor exports | [Evidence store](./evidence-store.md), [incident playbook](./incident-response-playbook.md), [compliance export](./compliance-export-runbook.md) |
| Security and scope limits | [Control-plane boundaries](./control-plane-boundaries.md), [governance control matrix](./governance-control-matrix.md), [threat model](./threat-model.md) |

**Important boundary:** Talon does not control local shell commands, file edits, direct HTTP requests or other operations that bypass it. Agent keys authenticate the configured use case; session and subagent labels are attribution, not independent identities. HMAC verification proves record integrity, not that a downstream business operation succeeded or that a deployment is legally compliant.

**Edition boundary:** Talon OSS keeps canonical policy, exact-action authorization, local approvals and independently verifiable evidence. Corporate OIDC, SIEM delivery profiles, external approval systems and multi-deployment operations belong to a **planned**, not yet generally available Enterprise edition. See [the status comparison](./open-source-and-enterprise.md).

Technical documentation is maintained primarily in the [Talon repository](https://github.com/dativo-io/talon); this website provides the case-first navigation and publication layer.
