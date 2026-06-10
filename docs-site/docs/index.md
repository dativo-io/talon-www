---
title: Dativo Talon documentation
description: Technical docs for governing LLM and AI-agent traffic with Dativo Talon.
slug: /
---

# Dativo Talon documentation

Dativo Talon is a self-hostable governance gateway for LLM applications, AI agents, and vendor AI workflows. It helps teams enforce policy before provider access and produce signed evidence after each decision.

Use these docs to install Talon, route existing AI traffic through the gateway, configure PII and tool controls, cap spend, enforce EU data-sovereignty rules, and export audit evidence.

## Start here

- [60-second demo](./quickstart-demo.md) — run a no-key Docker demo and inspect signed evidence.
- [Quickstart](./quickstart.md) — choose the right path: existing app, new agent, or demo.
- [Your first governed agent](./first-governed-agent.md) — install, initialize, run, and inspect evidence.
- [Add Talon to your existing app](./add-talon-to-existing-app.md) — point an existing OpenAI-compatible client at Talon.

## Common use cases

- [Add compliance to a Slack bot](./slack-bot-integration.md)
- [Govern OpenClaw with Talon](./openclaw-integration.md)
- [Offer Talon to multiple customers](./multi-tenant-msp.md)
- [Export evidence for auditors](./compliance-export-runbook.md)

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
- [Observability](./observability.md)
- [Policy cookbook](./policy-cookbook.md)

## Source of truth

The source markdown lives in the [dativo-io/talon](https://github.com/dativo-io/talon) repository. This site is the canonical public documentation surface for indexing, navigation, and customer evaluation.
