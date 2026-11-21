---
title: Govern refunds in n8n with Talon
description: "Keep an existing n8n workflow and put consequential refund actions under company policy, human approval, controlled dispatch and signed evidence."
slug: /n8n-refund-approvals/
---

# Govern an n8n refund workflow without rewriting it

Your workflow can still receive tickets, validate inputs and return an answer. For a consequential action, it asks **Talon's HTTP Action Gateway** to decide: **ALLOW**, **REQUIRE_APPROVAL** or **DENY**. Talon binds the decision to the exact operation and arguments; after an allowed or approved claim, **Talon dispatches the action**, not n8n.

The [importable n8n reference](https://github.com/dativo-io/talon/tree/main/examples/n8n-refund) contains the workflow, example company/use-case policy, a deterministic refund fixture and an end-to-end acceptance script. It is also the fastest way to see the control working before replacing the fixture with your business adapter.

## The three decisions

| Example refund amount | Talon's verdict | What happens |
|---|---|---|
| €30.00 | **ALLOW** | n8n claims the operation; Talon dispatches once |
| €75.00 | **REQUIRE_APPROVAL** | A support-lead reviewer decides; nothing dispatches while pending |
| €900.00 | **DENY** | No claim, no dispatch |

These are **example** thresholds, not hard-coded refund rules. The organization policy denies amounts above €500; the use case requires a reviewer above €50. The company restriction cannot be relaxed by the use case. n8n reads Talon's verdict instead of copying policy thresholds into its own branches.

## Connect it

1. **Prepare Talon with the company policy.** Follow [Connect an existing application](./add-talon-to-existing-app.md) for the installation keys, provider setup and secure gateway configuration.
2. **Register the workflow as a use case.** Run `talon agents add refund-bot --tenant acme --owner support-operations` on the Talon host. Save the issued use-case key in n8n's encrypted credentials.
3. **Configure the action.** Apply the [reference's action definition and company policy](https://github.com/dativo-io/talon/tree/main/examples/n8n-refund), set its fixed destination to a secured business adapter and run `talon validate`.
4. **Import the workflow.** Import [`refund-approval.workflow.json`](https://github.com/dativo-io/talon/blob/main/examples/n8n-refund/refund-approval.workflow.json). Set the Talon URL in the Config node. Supply separate Header Auth credentials for the n8n webhook caller and the Talon use-case key.
5. **Create a reviewer.** Run `talon approver add --name lead-1 --tenant acme --groups support-leads`. The reviewer's own credential is separate from the workflow and admin keys.

The reference [setup instructions](https://github.com/dativo-io/talon/blob/main/examples/n8n-refund/README.md#set-up) give the exact config paths, curl input and validation sequence. The exported workflow contains no provider or adapter credentials, and never calls the refund adapter directly.

## A reviewer decides; approval alone never dispatches

```bash
export TALON_APPROVER_KEY=...     # use the reviewer's securely stored credential
talon approvals list
talon approvals show <approval-id>
talon approvals approve <approval-id> --reason "customer verified"
# or: talon approvals reject <approval-id> --reason "duplicate"
```

An approval authorizes the **already-bound operation**. n8n waits for Talon's state and then calls **claim**; only that claim permits Talon to dispatch. Rejections and expirations do not dispatch. If a claim connection fails mid-flight, the outcome may be unknown: read the operation rather than retrying blindly.

The [Operations Console](./operations-console.md) shows the use case, its effective policy, decisions, approvals and evidence in one **read-only** view. Reviewer decisions use the CLI or reviewer API, not a browser action button.

## Prove the outcome independently

```bash
talon agents show refund-bot
talon audit verify --operation refund-T-1
talon ui
```

The reference tests the **destination fixture's own call count**, not merely n8n logs. Denied and pending requests have no dispatch; an allowed or approved operation has one; replay does not make another call. Signed lifecycle evidence lets you inspect Talon's authorization and attempt, while the downstream adapter remains authoritative for the business result.

For the full installation, second use case, backup and restore journey, see the [production pilot](./production-pilot.md), [day-two use-case operations](./operate-ai-use-cases.md), and [single-node recovery](./single-node-production.md).

**Execution boundary:** This example uses the HTTP Action Gateway. MCP interception enforces permissions on intercepted tool calls but does not provide this exact-action approval/claim lifecycle. Talon cannot govern a direct payment/API call that bypasses it. The example's refund service is a test fixture, not a payment integration.