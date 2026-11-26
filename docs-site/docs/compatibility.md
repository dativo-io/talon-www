---
title: Compatibility
description: Find your AI provider, SDK, n8n workflow, MCP client, agent runtime or deployment profile and check Talon's version-specific compatibility.
slug: /compatibility/
---

# Will Talon work with your stack?

Keep your existing application or workflow. Select the integration boundary first, then check the exact client, protocol and release evidence.

## Find your integration

| Your stack | Check compatibility and limits |
| --- | --- |
| Model providers and application SDKs (OpenAI, Anthropic, Python, Node.js) | [Provider and SDK matrix](./choosing-integration-path.md#model-providers-and-application-sdks) |
| n8n and HTTP workflow engines | [Workflow compatibility and credential requirements](./choosing-integration-path.md#n8n-and-http-workflows) |
| MCP, agent runtimes and coding assistants | [MCP, OpenShell, Claude Code, Codex and other clients](./choosing-integration-path.md#mcp-agent-runtimes-and-coding-assistants) |
| Docker, Linux, macOS, production and external scanners | [Deployment and operational integrations](./choosing-integration-path.md#deployment-and-operational-integrations) |

## How to read the results

The [canonical compatibility inventory](./choosing-integration-path.md#compatibility-for-v1170) separates the product support boundary from verification in a particular test environment. A documented integration is not necessarily release verified. A verified synthetic workload is not a production capacity or real-provider guarantee. Untested combinations require qualification before adoption. Unsupported capabilities remain outside the support contract; passing a local test does not make them supported.

## What to do next

[Connect an existing application](./add-talon-to-existing-app.md) to verify a permitted and denied request, or [evaluate Talon](./technical-evaluation.md) for your company's production pilot.

For n8n, start with the [refund workflow](./n8n-refund-approvals.md) if you need to govern business actions. The tested workflow does not establish compatibility with every stock AI node, credential flow, n8n version or deployment mode.

