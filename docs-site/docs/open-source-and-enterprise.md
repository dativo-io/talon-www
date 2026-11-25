---
title: Talon Community and Enterprise
description: Compare the shared Talon enforcement core and Enterprise company-wide operations, integration and support offering.
slug: /open-source-and-enterprise/
---

# Talon Community and Enterprise

One AI control plane, two adoption paths. **Talon Community** is Apache 2.0 open-source, self-hosted infrastructure. **Talon Enterprise** extends that foundation for organizations scaling AI across teams, integrating company identity, controlled changes and operational support.

The core policy and evidence engine is shared. Community is a complete enforcement core, not a feature-limited trial. The public Community release defines the shipped technical baseline; Enterprise integrations, deployment profiles and support commitments are scoped and validated during customer evaluation. The Enterprise column does not claim that every listed integration is generally available.

## Compare editions

| Capability | Talon Community | Talon Enterprise |
| --- | --- | --- |
| Organization and AI use-case policy | Included | Included |
| Model and data controls, spend limits, policy-valid fallback | Included | Included |
| Exact-action authorization and local human review | Included | Included |
| Signed decision evidence and independent verification | Included | Included |
| Sessions and local read-only Operations Console | Included | Included |
| Corporate SSO, team roles and access revocation | Local credentials | Pilot scope |
| Teams register and manage their own AI apps | Operator-led CLI | Pilot scope |
| Who changed policies, keys and access | Runtime evidence | Pilot scope |
| Review and promote policy changes | Local config / CLI | Pilot scope |
| Approvals in existing corporate workflows | Local reviewer API/CLI | Pilot scope |
| Security monitoring and customer-managed keys | Generic telemetry / local vault | Pilot scope |
| Supported deployment, recovery and upgrades | Self-managed single-node | Pilot scope |
| High-load and high-availability deployments | Single-node profile | Pilot scope |
| Enterprise-level support | Community support | Pilot scope |

The five shared controls are included in the core, subject to the supported release and interception boundary. In v1.17.0 exact-action authorization covers declared HTTP actions and governed MCP tools through one Action Gateway. Approval itself dispatches nothing. Community's supported production profile is single-node; high availability and scale profiles in Enterprise require explicit pilot validation. See the [public edition comparison](https://dativo.io/enterprise/) and [v1.17.0 limitations](https://github.com/dativo-io/talon/blob/v1.17.0/LIMITATIONS.md).

## Integrate with the existing enterprise environment

**Company identity and team roles.** Corporate access must bind verified identity-provider issuer, client and organization/tenant to authorized roles. An email suffix alone is not authentication. Use-case credentials, reviewers and operators have distinct authority. Validate access revocation and delegated administration for the selected profile.

**Controlled changes.** Team self-service must not weaken company policy. Distinguish administrative change history from signed runtime decision evidence; verify the actual change and promotion workflow during evaluation.

**Security monitoring and key custody.** Validate the selected SIEM, vault or KMS integration, including delivery, recovery, correlation and key handling. Forwarded telemetry is not canonical approval evidence; never infer unobserved activity from it.

**Corporate approval workflows.** A Teams, Slack or ITSM notification is not a grant of authority. Reviewer identity and authorization must bind the same exact operation. Approval is separate from dispatch.

**Operational support.** Establish deployment, upgrade, backup, restore, escalation and recovery requirements. Provider fallback does not provide Talon high availability. Community's [single-node guide](./single-node-production.md) explains supported recovery and its limits; Enterprise profiles and support terms are validated and agreed for the pilot.

## Evaluate a real use case

1. [Try Community](./quickstart-demo.md) or [connect an existing application](./add-talon-to-existing-app.md).
2. [Choose an integration path](./choosing-integration-path.md) and [evaluate a positive and negative case](./evaluation-checklist.md).
3. [Inspect governed MCP tools](./mcp-governed-tools.md), [exact-action proof](./action-gateway-proof.md) and [control-plane boundaries](./control-plane-boundaries.md).
4. [Discuss a pilot](https://dativo.io/pilot/) to identify which organizational requirements matter as you scale and operate AI.

Neither edition governs bypassed traffic, guarantees invoice ceilings despite cost estimates, certifies compliance, or proves the correctness of a downstream business effect. Check the [released Community artifact](https://github.com/dativo-io/talon/releases/tag/v1.17.0) and selected Enterprise pilot scope.
