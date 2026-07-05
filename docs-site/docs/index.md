---
title: Dativo Talon documentation
description: Learn Dativo Talon, an open-source AI governance gateway for European SMBs. Govern LLM traffic, PII, tools, costs, provider fallback, EU routing, local scanner engines, and signed audit evidence.
slug: /
---

# Dativo Talon documentation

Dativo Talon is an open-source AI governance gateway for European SMBs that need to control LLM and AI-agent traffic before it reaches providers, then prove what happened with signed evidence.

Talon is useful when a SaaS, fintech, healthtech, e-commerce, or support team already has AI features in production and needs practical governance without rebuilding the product. It covers PII controls, external and local scanner engines, tool governance, cost caps, sovereignty-aware provider fallback, EU data-sovereignty routing, dashboard visibility, tenant isolation, compliance exports, and auditor-ready evidence.

## What Talon helps you do

| Capability | What you get | Start here |
|---|---|---|
| Evaluate quickly | Run a no-key Docker demo and inspect PII, cost, policy, and signed evidence. | [60-second demo](./quickstart-demo.md) |
| Produce compliance reports | Initialize EU policy packs, add declarations, and export signed RoPA, Annex IV, and framework reports. | [Turnkey compliance reports](./turnkey-compliance-reports.md) |
| Govern existing LLM traffic | Put Talon in front of OpenAI-compatible clients with a base URL and caller key change. | [Add Talon to your existing app](./add-talon-to-existing-app.md) |
| Keep traffic available without bypassing policy | Configure transient-error fallback chains; every candidate is re-checked against sovereignty, model, tool, and budget policy. | [Configuration](./configuration.md) |
| Keep scanning in your environment | Use the built-in regex scanner, a Presidio-compatible HTTP/UDS service, or a local LLM such as Ollama. | [External scanners](./external-scanners.md) |
| Control EU or local-only data movement | Enforce `eu_strict` or air-gap posture and inspect configured versus observed destinations. | [Air-gapped deployment](./air-gapped-deployment.md) |
| Prove governance | Export signed evidence, compliance reports, RoPA, Annex IV, sovereignty, failover, and scanner facts. | [Sample auditor pack](./sample-auditor-pack.md) |
| Keep spend predictable | Set hard daily and monthly cost caps per caller, app, or tenant. | [Cost governance by caller](./cost-governance-by-caller.md) |

## Best path for an EU SMB evaluator

1. Run the [60-second demo](./quickstart-demo.md) to see governed traffic and signed evidence without an API key.
2. Walk through [turnkey compliance reports](./turnkey-compliance-reports.md) to generate RoPA, Annex IV, and framework exports.
3. Review [air-gapped deployment](./air-gapped-deployment.md) if local-only or EU-only operation matters.
4. Review [external scanners](./external-scanners.md) and [local scanner engines](./local-scanner-engines.md) if regex-only PII detection is not enough.
5. Check the [governance control matrix](./governance-control-matrix.md) and [sample auditor pack](./sample-auditor-pack.md).
6. Choose an integration path: [existing app](./add-talon-to-existing-app.md), [vendor AI](./vendor-integration-guide.md), or [new governed agent](./first-governed-agent.md).

## Find the right guide

### Tutorials — learn by doing

- [60-second demo](./quickstart-demo.md) — no API key; send a request with PII and inspect signed evidence.
- [Turnkey compliance reports](./turnkey-compliance-reports.md) — start from an empty directory and generate signed RoPA, Annex IV, and framework exports.
- [Your first governed agent](./first-governed-agent.md) — install Talon, initialize a project, run a governed agent, trigger a denial, and inspect evidence.
- [Evidence integrity demo](./evidence-integrity-demo.md) — verify a record, tamper with it, and see signature validation fail.

### How-to guides — solve a concrete problem

- [Add Talon to an existing app](./add-talon-to-existing-app.md)
- [Deploy Talon in air-gap / local-only mode](./air-gapped-deployment.md)
- [Run a local PII scanner engine](./local-scanner-engines.md)
- [Test and operate Plan Review](./plan-review-operators.md)
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

- [Configuration](./configuration.md) — includes gateway and native provider fallback chains.
- [External scanners](./external-scanners.md) — scanner engine selection, adapter contract, fail-closed behavior, and evidence fields.
- [Authentication and key scopes](./authentication-and-key-scopes.md)
- [Provider registry](./provider-registry.md)
- [Gateway dashboard](./gateway-dashboard.md)
- [Operational control plane](./operational-control-plane.md)
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

The public docs now track the current Talon release line through **v1.6.8 (2026-07-04)**:

- **v1.6.8 — external and local scanner engines.** Replace the zero-config regex scanner with Microsoft Presidio, a custom Presidio-compatible HTTP/Unix-socket detector, or a local LLM engine such as Ollama. Enforcement stays fail-closed, scanner identity and typed failures are signed into evidence, and startup probes refuse dead engines. Start with [External scanners](./external-scanners.md) or [Local scanner engines](./local-scanner-engines.md).
- **v1.6.7 — sovereignty-respecting provider fallback chains.** Retry transient provider failures through an ordered same-API-family chain without turning failover into a policy bypass. Each candidate re-runs sovereignty, provider/model allowlists, tool policy, budgets, and session context; non-EU candidates under `eu_strict` are never dispatched. Configuration and signed failover evidence are documented in [Configuration](./configuration.md) and [Release notes](./release-notes.md).
- **v1.6.6 — air-gap mode and sovereignty posture reports.** Enforce local/EU-only egress, reject surprise destinations, run `talon doctor` against the effective posture, and export configured-versus-observed sovereignty facts in HTML or JSON. Start with [Air-gapped deployment](./air-gapped-deployment.md).

Earlier releases added turnkey compliance reports, EU policy packs, auditor handoff artifacts, RoPA/Annex IV exports, data-flow evidence, and the Presidio-compatible scanner boundary.

Read the [release notes](./release-notes.md) before upgrading or copying older configuration snippets.

## Source of truth

The source markdown lives in the [dativo-io/talon](https://github.com/dativo-io/talon) repository. This site is the canonical public documentation surface for indexing, navigation, and customer evaluation.