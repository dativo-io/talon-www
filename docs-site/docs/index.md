---
title: Dativo Talon documentation
description: Learn Dativo Talon, an open-source AI governance gateway for European SMBs. Govern LLM traffic, PII, tools, costs, EU routing, and signed audit evidence.
slug: /
---

# Dativo Talon documentation

Dativo Talon is an open-source AI governance gateway for European SMBs that need to control LLM and AI-agent traffic before it reaches providers, then prove what happened with signed evidence.

Talon is useful when a SaaS, fintech, healthtech, e-commerce, or support team already has AI features in production and needs practical governance without rebuilding the product. It covers PII controls, tool governance, cost caps, EU data-sovereignty routing, dashboard visibility, tenant isolation, compliance exports, and auditor-ready evidence.

## What Talon helps you do

| Capability | What you get | Start here |
|---|---|---|
| Evaluate quickly | Run a no-key Docker demo and inspect PII, cost, policy, and signed evidence. | [60-second demo](./quickstart-demo.md) |
| Produce compliance reports | Initialize EU policy packs, add declarations, and export signed RoPA, Annex IV, and framework reports. | [Turnkey compliance reports](./turnkey-compliance-reports.md) |
| Govern existing LLM traffic | Put Talon in front of OpenAI-compatible clients with a base URL and caller key change. | [Add Talon to your existing app](./add-talon-to-existing-app.md) |
| Choose the right architecture | Pick LLM gateway, MCP proxy, or native Talon based on your situation. | [Choose your integration path](./choosing-integration-path.md) |
| Prove governance | Export signed evidence, compliance reports, RoPA, and Annex IV artifacts. | [Sample auditor pack](./sample-auditor-pack.md) |
| Control EU data movement | Understand which controls run on each entry path and where limitations are explicit. | [Governance control matrix](./governance-control-matrix.md) |
| Keep spend predictable | Set hard daily and monthly cost caps per caller, app, or tenant. | [Cost governance by caller](./cost-governance-by-caller.md) |

## Best path for an EU SMB evaluator

1. Run the [60-second demo](./quickstart-demo.md) to see governed traffic and signed evidence without an API key.
2. Walk through [turnkey compliance reports](./turnkey-compliance-reports.md) to generate RoPA, Annex IV, and framework exports.
3. Review the [EU compliance policy packs](./policy-packs.md) to understand GDPR, NIS2, DORA, and EU AI Act starting controls.
4. Check the [governance control matrix](./governance-control-matrix.md) and [sample auditor pack](./sample-auditor-pack.md).
5. Choose an integration path: [existing app](./add-talon-to-existing-app.md), [vendor AI](./vendor-integration-guide.md), or [new governed agent](./first-governed-agent.md).

## Find the right guide

### Tutorials — learn by doing

- [60-second demo](./quickstart-demo.md) — no API key; send a request with PII and inspect signed evidence.
- [Turnkey compliance reports](./turnkey-compliance-reports.md) — start from an empty directory and generate signed RoPA, Annex IV, and framework exports.
- [Your first governed agent](./first-governed-agent.md) — install Talon, initialize a project, run a governed agent, trigger a denial, and inspect evidence.
- [Evidence integrity demo](./evidence-integrity-demo.md) — verify a record, tamper with it, and see signature validation fail.

### How-to guides — solve a concrete problem

- [Add Talon to an existing app](./add-talon-to-existing-app.md)
- [Add compliance to a Slack bot](./slack-bot-integration.md)
- [Govern OpenClaw with Talon](./openclaw-integration.md)
- [Run a first-line support agent](./internal-support-agent.md)
- [Govern third-party AI vendors](./vendor-integration-guide.md)
- [Offer Talon to multiple customers](./multi-tenant-msp.md)
- [Run governed LLM calls in CI/CD](./cicd-pipeline-governance.md)
- [Use EU compliance policy packs](./policy-packs.md)
- [Verify turnkey compliance reports end-to-end](./verify-turnkey-compliance-reports.md)
- [Export evidence for auditors](./compliance-export-runbook.md)
- [Clear DECLARATION MISSING blocks in RoPA](./ropa-declarations.md)
- [Respond to incidents](./incident-response-playbook.md)

### Reference — look up exact behavior

- [Configuration](./configuration.md)
- [Authentication and key scopes](./authentication-and-key-scopes.md)
- [Provider registry](./provider-registry.md)
- [Gateway dashboard](./gateway-dashboard.md)
- [Governance control matrix](./governance-control-matrix.md)
- [Evidence integrity specification](./evidence-integrity-spec.md)
- [Presidio compatibility matrix](./presidio-compatibility-matrix.md)
- [Policy cookbook](./policy-cookbook.md)
- [PII semantic enrichment](./pii-semantic-enrichment.md)
- [Threat model](./threat-model.md)
- [Conformance](./conformance.md)
- [Benchmarks](./benchmarks.md)

### Explanation — understand the product

- [What Talon does to your request](./what-talon-does-to-your-request.md)
- [Why not just a PII proxy?](./why-not-a-pii-proxy.md)
- [Evidence store](./evidence-store.md)
- [Adoption scenarios](./adoption-scenarios.md)
- [Persona guides](./persona-guides.md)
- [Agent planning](./agent-planning.md)
- [Memory governance](./memory-governance.md)
- [Architecture: MCP proxy](./architecture-mcp-proxy.md)
- [Observability](./observability.md)

## Latest release highlights

Recent Talon development added user-facing controls and proof artifacts that matter for CTOs, operators, DPOs, and security reviewers:

- **Turnkey compliance reports** — initialize EU policy packs, add declared organizational facts, and export GDPR Art. 30 RoPA, EU AI Act Annex IV, and framework reports.
- **EU compliance policy packs** — GDPR, NIS2, DORA, and EU AI Act starter controls with explicit support annotations and claims discipline.
- **Auditor handoff pack** — generated sample package with signed evidence, compliance report, GDPR Art. 30 RoPA, and EU AI Act Annex IV technical-documentation output.
- **RoPA and Annex IV exports** — `talon compliance ropa` and `talon compliance annex-iv` merge declared organisational facts with runtime facts from signed evidence.
- **Declaration-missing workflow** — exports flag missing controller, processing, retention, or system facts instead of pretending the record is complete.
- **Egress and data-flow evidence** — signed records can show where classified data moved, which destinations were blocked, and where transfer gaps remain unresolved.
- **Governance control matrix** — one reference page maps controls across runner, gateway, MCP server/proxy, and graph-adapter entry paths.
- **Presidio-compatible scanner boundary** — Talon keeps byte offsets canonical, validates external scanner results, and fails closed before egress when residual sensitive data remains.

Read the [release notes](./release-notes.md) before upgrading or copying older configuration snippets.

## Source of truth

The source markdown lives in the [dativo-io/talon](https://github.com/dativo-io/talon) repository. This site is the canonical public documentation surface for indexing, navigation, and customer evaluation.
