---
title: Evaluate Talon on one workflow
description: A repeatable checklist for choosing a supported boundary, testing allow and deny paths, and validating evidence without overstating coverage.
slug: /evaluation-checklist/
---

# Evaluate Talon on one workflow

Use this checklist for an initial engineering review. Start with [technical evaluation](./technical-evaluation.md) for release evidence, compatibility, security and deployment boundaries. A successful evaluation proves a **specific, supported interception point**, not universal control over an agent.

## 1. Record your scope

| Question | Record |
|---|---|
| Which business workflow? | Support reply, coding release, aggregate analytics, contract review, or another single case |
| What could go wrong? | Forbidden action, sensitive egress, unexpected spend or policy-unsafe fallback |
| Which Talon interception point? | Model gateway, governed MCP endpoint, HTTP Action Gateway or delegated runtime |
| Which requests bypass Talon? | Local tool execution, direct API requests, unproxied provider traffic |
| What is the expected business effect? | One allowed mock call, zero forbidden calls, a denied provider request, etc. |

See [choose your integration path](./choosing-integration-path.md) and [control-plane boundaries](./control-plane-boundaries.md). In v1.17, governed HTTP and MCP actions share the Action Gateway. Test each transport's invocation, approval and dispatch procedure separately; discovery filtering alone does not authorize execution. See [governed MCP tools](./mcp-governed-tools.md).

## 2. Choose the smallest reproducible proof

- **No provider key:** [published-image quickstart](./quickstart-demo.md) or [HTTP action authorization proof](./action-gateway-proof.md).
- **Multiple AI use cases:** [full product demo](./product-demo.md).
- **Coding assistant:** [Claude Code](./claude-code-integration.md) or [Codex CLI](./codex-cli-integration.md). Local execution is outside the model API gateway; historical client examples are not current compatibility claims.
- **Consequential action:** [governed MCP](./mcp-governed-tools.md) or [n8n refund workflow](./n8n-refund-approvals.md), with exact client versions and independent counters.
- **Existing app:** [add Talon to the app](./add-talon-to-existing-app.md), beginning with the smallest valid policy.

Match the guide to the version you are actually running. `main` and the [latest release](https://github.com/dativo-io/talon/releases/latest) can differ.

## 3. Run positive and negative tests

1. **Allowed path:** verify the governed request or mock action reaches its expected handler, and capture the policy decision.
2. **Denied path:** verify the forbidden provider request or intercepted tool/action call does **not** reach its upstream handler.
3. **Bypass path:** run or reason about an unproxied/local action and clearly record that Talon cannot attest to it.
4. **Evidence integrity:** inspect the signed record and verify its integrity. Cross-check it with application logs or the synthetic downstream service counter.

Useful CLI commands for a configured Talon installation:

```bash
talon audit list --limit 10
talon audit show <evidence-id>
talon audit verify <evidence-id>
```

When you have an asserted session, the [session guide](./manual-governed-session.md) and [coding-agent guide](./governing-coding-agents.md) show session-oriented audit and cost commands. A session label alone does not establish an independent authenticated agent.

## 4. Capture a small evidence packet

| Field | Example of what to write |
|---|---|
| Talon version or commit | Exact deployed binary or source revision |
| Workflow + principal | One authenticated Talon agent/use case; tenant and asserted session when relevant |
| Enforcement boundary | Model API, MCP `tools/call`, or exact HTTP operation |
| Expected policy decision | Allow / deny / approval required, with the policy rule |
| Actual dispatch result | Zero downstream calls, one mock call, or **unknown** if not observed |
| Evidence | Record ID, signature verification result and relevant policy snapshot |
| Missing coverage | Unproxied calls, local execution, downstream state not observed |
| Compatibility and performance | Client version, Talon release, topology, latency/throughput targets and measured results |
| Failure and recovery | Provider failure, unavailable budget state, unknown action outcome, backup/restore and reconciliation where relevant |
| Owner and residual risk | Named workflow and operations owners, security reviewer, documented exception or no-go |
| Next step | Pilot, integration repair, or explicit no-go decision |

For exported evidence see [evidence store](./evidence-store.md), [integrity demo](./evidence-integrity-demo.md) and [compliance export](./compliance-export-runbook.md).

## 5. Decision

Proceed to a scoped pilot only if the negative test actually prevents the relevant upstream effect, allowed work still succeeds, an operator can explain and verify the decision, and all bypass paths have independent controls or are documented, accepted risks. Record a hold for missing required tests, and a no-go for failed mandatory controls or unsupported requirements. For a production pilot, also validate the [single-node profile](./single-node-production.md) and [runbook](./production-pilot.md).

Talon's HMAC evidence is **tamper-evident, not immutable**. An approved action is **not automatically dispatched**. Runtime cost estimates can differ from final provider charges. Product evidence is not legal or regulatory certification.
