---
title: Dativo Talon documentation
description: Learn Dativo Talon, an open-source AI governance gateway for European SMBs. Govern LLM traffic, PII, tools, costs, EU routing, and signed audit evidence.
slug: /
---

# Dativo Talon documentation

Dativo Talon is an open-source AI governance gateway for European SMBs that need to control LLM and AI-agent traffic before it reaches providers, then prove what happened with signed evidence.

Talon is useful when a SaaS, fintech, healthtech, e-commerce, or support team already has AI features in production and needs practical governance without rebuilding the product. It covers PII controls, tool governance, cost caps, EU data-sovereignty routing, dashboard visibility, tenant isolation, and auditor-ready evidence exports.

## What Talon helps you do

| Capability | What you get | Start here |
|---|---|---|
| Govern existing LLM traffic | Put Talon in front of OpenAI-compatible clients with a base URL and caller key change. | [Add Talon to your existing app](./add-talon-to-existing-app.md) |
| Evaluate quickly | Run a no-key Docker demo and inspect PII, cost, policy, and signed evidence. | [60-second demo](./quickstart-demo.md) |
| Choose the right architecture | Pick LLM gateway, MCP proxy, or native Talon based on your situation. | [Choose your integration path](./choosing-integration-path.md) |
| Prove governance | Export signed evidence, compliance reports, RoPA, and Annex IV artifacts. | [Export evidence for auditors](./compliance-export-runbook.md) |
| Control EU data movement | Understand which controls run on each entry path and where limitations are explicit. | [Governance control matrix](./governance-control-matrix.md) |
| Keep spend predictable | Set hard daily and monthly cost caps per caller, app, or tenant. | [Cost governance by caller](./cost-governance-by-caller.md) |

## Follow the Diátaxis path

These docs are organized around Diátaxis, but the navigation is optimized for a buyer and operator journey.

### Tutorials — learn by doing

- [60-second demo](./quickstart-demo.md) — no API key; send a request with PII and inspect signed evidence.
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

## Evaluation checklist for EU SMBs

Use this sequence if you are assessing Talon as an AI governance solution:

1. Run the [60-second demo](./quickstart-demo.md).
2. Read [why Talon is more than a PII proxy](./why-not-a-pii-proxy.md).
3. Check the [governance control matrix](./governance-control-matrix.md).
4. Review the [sample auditor pack](./sample-auditor-pack.md).
5. Try [cost governance by caller](./cost-governance-by-caller.md).
6. Choose an integration path: [existing app](./add-talon-to-existing-app.md), [vendor AI](./vendor-integration-guide.md), or [new governed agent](./first-governed-agent.md).

## Latest release highlights

Recent Talon development added user-facing controls and proof artifacts that matter for CTOs, operators, DPOs, and security reviewers:

- **Auditor handoff pack** — generated sample package with signed evidence, compliance report, GDPR Art. 30 RoPA, and EU AI Act Annex IV technical-documentation output.
- **RoPA and Annex IV exports** — `talon compliance ropa` and `talon compliance annex-iv` merge declared organisational facts with runtime facts from signed evidence.
- **Declaration-missing workflow** — exports flag missing controller, processing, retention, or system facts instead of pretending the record is complete.
- **Egress and data-flow evidence** — signed records can show where classified data moved, which destinations were blocked, and where transfer gaps remain unresolved.
- **Governance control matrix** — one reference page maps controls across runner, gateway, MCP server/proxy, and graph-adapter entry paths.

Read the [release notes](./release-notes.md) before upgrading or copying older configuration snippets.

## Source of truth

The source markdown lives in the [dativo-io/talon](https://github.com/dativo-io/talon) repository. This site is the canonical public documentation surface for indexing, navigation, and customer evaluation.
