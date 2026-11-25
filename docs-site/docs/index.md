---
title: Start here | Dativo Talon
description: "Start with one AI use case: try Talon without a provider key, connect an existing app, or verify a governed business action."
slug: /
---

# Start with one AI use case.

Talon is an **open-source, self-hosted AI control plane**. It applies your organization's policy to model requests and actions routed through supported boundaries. Keep your application or orchestrator; Talon makes the enforcement decision and records signed evidence.

## Choose your first step

| Your goal | Start here | What you'll prove |
| --- | --- | --- |
| **Try Talon** without an application or provider key | [Run the 60-second no-key demo](./quickstart-demo.md) | A synthetic model request is governed and the evidence verifies |
| **Connect an existing app** | [Add Talon to your application](./add-talon-to-existing-app.md) | Your authenticated use case routes a real model call under company policy |
| **Control a consequential action** | [Reproduce the exact-action proof](./action-gateway-proof.md) | An intercepted HTTP action is allowed, denied or held for separate approval |

You don't need to migrate your application or adopt every Talon capability to begin.

## From first request to verified decision

1. **Choose a supported path.** Talon supports model APIs, exact HTTP actions, governed MCP tools and selected delegated runtimes. In v1.17, HTTP and governed MCP use one Action Gateway. [Choose your integration path](./choosing-integration-path.md).
2. **Register one use case.** Use `talon agents add` and the assigned Talon key. Configure the organization baseline and the use case's effective rules.
3. **Test one meaningful decision.** Allow an expected request and prevent a disallowed one on the same routed path.
4. **Inspect the evidence.** Use `talon agents`, the read-only [Operations Console](./operations-console.md), and independent [signed evidence verification](./evidence-store.md).

For a repeatable business workflow, use the [synthetic n8n refund approval example](./n8n-refund-approvals.md). **An approval authorizes the exact operation; it does not itself execute the refund.**

## Going further

- **See several use cases together:** [Three-use-case product demo](./product-demo.md) and [business use-case playbooks](./use-case-playbooks.md).
- **Design policy and operations:** [Policy cookbook](./policy-cookbook.md), [production pilot runbook](./production-pilot.md) and [evaluation checklist](./evaluation-checklist.md).
- **Explore all technical references:** Use the sidebar sections for integrations, security, controls, architecture and advanced topics.
- **Need help on a real workflow?** [Discuss a founder-led pilot](https://dativo.io/pilot/).

**Scope matters:** Talon cannot enforce rules on actions or traffic that bypass supported interception paths. Signed evidence establishes the integrity of recorded decisions, not external business outcomes or automatic regulatory compliance. [Talon Community and Enterprise](./open-source-and-enterprise.md) share the enforcement core; Enterprise integrations and deployment profiles are scoped during evaluation.
