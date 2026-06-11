---
title: Dativo Talon documentation
description: Technical docs for governing LLM and AI-agent traffic with Dativo Talon.
slug: /
---

# Dativo Talon documentation

Dativo Talon is a self-hostable governance gateway for LLM applications, AI agents, and vendor AI workflows. It helps teams enforce policy before provider access and produce signed evidence after each decision.

Use these docs to install Talon, route existing AI traffic through the gateway, configure PII and tool controls, cap spend, enforce EU data-sovereignty and egress rules, and export audit-ready evidence.

## Latest release highlights

Recent Talon development added user-facing controls and proof artifacts that matter for operators, DPOs, and security reviewers:

- **Auditor handoff pack** — generated sample package with signed evidence, compliance report, GDPR Art. 30 RoPA, and EU AI Act Annex IV technical-documentation output.
- **RoPA and Annex IV exports** — `talon compliance ropa` and `talon compliance annex-iv` merge declared organisational facts with runtime facts from signed evidence.
- **Declaration-missing workflow** — exports flag missing controller, processing, retention, or system facts instead of pretending the record is complete.
- **Egress and data-flow evidence** — signed records can show where classified data moved, which destinations were blocked, and where transfer gaps remain unresolved.
- **Governance control matrix** — one reference page maps controls across runner, gateway, MCP server/proxy, and graph-adapter entry paths.

Read the [release notes](./release-notes.md) before upgrading or copying older configuration snippets.

## Start here

- [60-second demo](./quickstart-demo.md) — run a no-key Docker demo and inspect signed evidence.
- [Evidence integrity proof](./evidence-integrity-demo.md) — export signed evidence, tamper with a field, and verify failure.
- [Quickstart](./quickstart.md) — choose the right path: existing app, new agent, or demo.
- [Your first governed agent](./first-governed-agent.md) — install, initialize, run, and inspect evidence.
- [Add Talon to your existing app](./add-talon-to-existing-app.md) — point an existing OpenAI-compatible client at Talon.

## Auditor and compliance workflows

- [Sample auditor pack](./sample-auditor-pack.md) — see the exact files you can hand to a DPO, customer security reviewer, or internal audit.
- [Export evidence for auditors](./compliance-export-runbook.md) — export reduced reports, signed evidence, RoPA, and Annex IV packs.
- [Clear DECLARATION MISSING blocks](./ropa-declarations.md) — fill the declared facts Talon cannot infer from evidence.
- [Evidence integrity specification](./evidence-integrity-spec.md) — independently verify signed evidence records.
- [Governance control matrix](./governance-control-matrix.md) — understand which controls run on each Talon entry path.

## Common use cases

- [Add compliance to a Slack bot](./slack-bot-integration.md)
- [Govern OpenClaw with Talon](./openclaw-integration.md)
- [Offer Talon to multiple customers](./multi-tenant-msp.md)

## Key concepts

- [What Talon does to your request](./what-talon-does-to-your-request.md)
- [Evidence store](./evidence-store.md)
- [Why not just a PII proxy?](./why-not-a-pii-proxy.md)
- [Agent planning](./agent-planning.md)
- [Memory governance](./memory-governance.md)

## Reference

- [Configuration](./configuration.md)
- [Authentication and key scopes](./authentication-and-key-scopes.md)
- [Provider registry](./provider-registry.md)
- [Gateway dashboard](./gateway-dashboard.md)
- [Threat model](./threat-model.md)
- [Conformance](./conformance.md)
- [Benchmarks](./benchmarks.md)
- [Observability](./observability.md)
- [Policy cookbook](./policy-cookbook.md)
- [Release notes](./release-notes.md)

## Source of truth

The source markdown lives in the [dativo-io/talon](https://github.com/dativo-io/talon) repository. This site is the canonical public documentation surface for indexing, navigation, and customer evaluation.