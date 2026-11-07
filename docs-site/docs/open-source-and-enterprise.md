---
title: Open source and Enterprise
description: Compare Talon's complete OSS enforcement core with planned company identity, SIEM, approval and production integrations.
slug: /open-source-and-enterprise/
---

# One enforcement engine, two adoption paths

**Talon OSS** is Apache-2.0, self-hosted infrastructure for controlling company AI use cases. Core policy enforcement, pre-request cost controls, retries and policy-valid fallback, session visibility, exact HTTP action authorization, local approvals, and signed, independently verifiable evidence are not license-gated. Check the [latest release](https://github.com/dativo-io/talon/releases/latest) for the precise supported feature set.

**Talon Enterprise is in development.** Its purpose is to integrate the same OSS enforcement and evidence kernel into a company's organizational environment. The integrations below are **planned and customer-gated**, not currently released Enterprise capabilities.

| Job | OSS | Enterprise direction (planned) |
|---|---|---|
| Enforce model and data policy; budget limits; fallback | OSS core, version-dependent | Same canonical rules |
| Control supported exact HTTP actions and local human approval | OSS core, version-dependent | Same exact-action/approval state machine |
| Verify sessions and signed evidence offline | OSS core, version-dependent | Same evidence truth and verifier |
| Export operational telemetry | Generic logs/traces/metrics and supported export | Supported customer-specific SIEM mapping, transport, recovery |
| Corporate workforce identity | Local principals and use-case keys | OIDC, verified issuer/tenant/domain mapping, groups, deprovisioning |
| Human decision workflow | Canonical local approval and reviewer UI | A customer's chosen Teams, Slack or ITSM notification/deep link |
| Organizational operations | Local CLI and per-installation view | Delegated RBAC, optional cross-installation view, controlled policy promotion |
| Keys, durability and support | Local vault/storage and single-instance limits | Customer-managed KMS, PostgreSQL/DR/scale profiles, paid support |

## Integrate with the existing enterprise environment

**Company domain and identity.** A company's email suffix is not proof of identity. Planned corporate access uses strictly verified OIDC issuer and client, an explicit customer organization/tenant binding and group-to-role mappings. Reviewers, operators, runtimes and use-case keys have separate authority. Deprovisioning must remove access within a documented maximum window.

**SIEM/SOC.** OSS keeps canonical signed evidence and a neutral telemetry surface. A paid integration may support a specific SIEM chosen by an actual pilot and provide contract-tested delivery, correlation, retry and incident runbooks. Forwarded logs are not the authoritative approval record and cannot assert events Talon did not observe. No raw prompts or secrets by default.

**Existing approval systems.** An external Teams, Slack, ServiceNow or Jira message is a notification, not a grant of authority. A decision must authenticate a reviewer with a valid company identity and map to the *same* OSS exact action digest. Approval authorizes an operation; it does not dispatch the business effect.

**Operational resilience.** Losing contact with SSO, SIEM or a management plane must not silently turn off local enforcement. Enterprise capabilities need a tested profile and truthful failure behavior before they are advertised as shipped.

## Evaluate a real use case

1. [Choose an interception path](./choosing-integration-path.md): model API, supported MCP interception or exact HTTP action.
2. [Try the no-key demo](./quickstart-demo.md) or [three-use-case product demo](./product-demo.md).
3. [Evaluate an allow and a deny](./evaluation-checklist.md), then verify the evidence.
4. Inspect [Action Gateway proof](./action-gateway-proof.md) and [control-plane boundaries](./control-plane-boundaries.md).
5. If corporate SSO, SIEM, approvals, key custody or multi-deployment operations block production adoption, [discuss a scoped Enterprise design-partner pilot](https://www.linkedin.com/in/sergeyenin/). A pilot can still begin with OSS.

Neither edition controls bypassed local actions, guarantees provider-invoice ceilings despite estimates, certifies compliance, or proves the correctness of a downstream business effect. See the [public edition overview](https://dativo.io/enterprise/) and [OSS limitations](https://github.com/dativo-io/talon/blob/main/LIMITATIONS.md).
