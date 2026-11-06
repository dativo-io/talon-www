---
title: AI use-case playbooks
description: Four realistic Talon evaluation scenarios, with integration boundaries, proof steps, evidence to inspect and explicit limitations.
slug: /use-case-playbooks/
---

# AI use-case playbooks

Choose the business workflow first. For each scenario, identify **which execution path Talon actually intercepts**, trigger an allowed action and a forbidden action, then inspect the evidence. A model's proposed tool call is not proof that the tool executed.

The four scenarios below use documented Talon capabilities, but **they are not all equally mature demos**. Consult the linked case page for the current reproduction status before describing one as a completed integration.

## Customer support

**Business question:** Can the assistant draft a useful response without leaking customer data or issuing an unauthorized refund?

| | |
|---|---|
| **Workflow** | n8n support workflow processes synthetic customer text and prepares a reply |
| **Boundary** | Governed model calls for data handling and fallback; an intercepted MCP/tool call for a prohibited financial action |
| **Allow case** | Draft response with customer data appropriately handled |
| **Deny case** | A forbidden `refund` tool does not reach the synthetic downstream handler |
| **Evidence** | PII action, provider/fallback decisions, tool-call denial and signed history |
| **Do not infer** | Talon itself performs a human refund-approval workflow; or that a live Zendesk account has been tested |

**How to evaluate:** Begin with [customer-support case details](https://dativo.io/use-cases/customer-support/) and [first-line support guide](./internal-support-agent.md). For the shared control-plane product demo run [three-use-case proof](./product-demo.md). Verify the blocked call separately; a drafted reply is not authority to execute a refund.

## Coding agents

**Business question:** Can an assistant inspect release state and prepare work, but not publish through a forbidden tool?

| | |
|---|---|
| **Workflow** | GitHub Copilot CLI or a coding-assistant use case |
| **Boundary** | Model requests routed through Talon and MCP release calls traversing its proxy |
| **Allow case** | Read `release_status` and prepare a release using allowed tools |
| **Deny case** | `release_publish` or a prohibited `admin_*` tool is blocked on the intercepted path |
| **Evidence** | Authenticated agent key, asserted session, model/tool timeline, denied call, signature verification |
| **Do not infer** | Talon watches local file edits or shell commands that bypass it; a benchmark proves savings for every coding agent |

**How to evaluate:** Follow [GitHub Copilot CLI governance](./github-copilot-cli-governance.md) for the bounded Copilot/MCP scenario and [coding agents demo](./coding-agents-demo.md) for a no-provider-key session and budget test. Read [coding-agent fleet controls](./governing-coding-agents.md) for identity and session limitations. The [website case](https://dativo.io/use-cases/coding-agents/) reports the optimization experiment's bounded result rather than claiming a universal cost reduction.

## People Analytics

**Business question:** Can an AI analyst answer aggregate workforce questions while refusing to export individual records?

| | |
|---|---|
| **Workflow** | Synthetic People Analytics requests using aggregated and individual-record tools |
| **Boundary** | MCP or exact HTTP action path deliberately routed through Talon; existing warehouse/HRIS authorization remains mandatory |
| **Allow case** | Aggregated headcount or trends within authorized data-access rules |
| **Deny case** | Attempted employee-record export blocked before the intercepted upstream call |
| **Evidence** | Tool/action identifier, authenticated use case, effective policy decision and signed denial |
| **Do not infer** | A production Workday/HRIS connector is shipped or tested; Talon prevents a direct warehouse query that bypasses it |

**How to evaluate:** Read the [People Analytics scenario and current integration status](https://dativo.io/use-cases/people-analytics/). Use the [MCP governance reference](./mcp-governance-extension.md) or [exact HTTP action proof](./action-gateway-proof.md) to test an equivalent supported authorization boundary on a mock service. **The website scenario is synthetic and its end-to-end integration has been tracked separately; do not label it as a verified production HR deployment.**

## Vendor contract review

**Business question:** Can procurement use AI on confidential documents without routing them to an unapproved model or provider?

| | |
|---|---|
| **Workflow** | Synthetic n8n vendor document review |
| **Boundary** | Provider/model/data-egress policy on traffic routed through Talon's LLM gateway |
| **Allow case** | Approved provider path handles the sanitized or permitted request |
| **Deny case** | Unapproved provider path is rejected before egress |
| **Evidence** | Effective policy snapshot, provider decision, data handling and signed record |
| **Do not infer** | Complete contract exfiltration prevention for integrations that bypass Talon, or regulatory compliance certification |

**How to evaluate:** See the [vendor-review case](https://dativo.io/use-cases/vendor-contract-review/), [integration path decision](./choosing-integration-path.md) and [policy cookbook](./policy-cookbook.md). Test a forbidden provider before testing the approved path, then verify the denial and allow records.

## Which demo should I actually run?

| Goal | Best first proof | Prerequisites |
|---|---|---|
| Inspect the simplest governed LLM request | [60-second demo](./quickstart-demo.md) | Docker; no provider key |
| See support, coding and document-summary controls together | [Product demo](./product-demo.md) | Local Talon checkout; real paid provider keys |
| Prove exact-action denial, human approval and attempt control | [Action proof](./action-gateway-proof.md) | Go/test tooling; no provider key; HTTP Action Gateway |
| Test a coding session with dual model APIs | [Coding-agents demo](./coding-agents-demo.md) | Integration test or Docker; no provider key |
| Test a real Copilot MCP release boundary | [GitHub Copilot guide](./github-copilot-cli-governance.md) | Specific documented demo setup |

For every evaluation, record the path, the test input, the expected upstream effect, the observed effect and the evidence ID. The [evaluation checklist](./evaluation-checklist.md) gives a reproducible template.
