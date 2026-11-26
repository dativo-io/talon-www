---
title: Technical evaluation
description: Evaluate Talon with reproducible release evidence, compatibility and security boundaries, deployment requirements, failure scenarios and a production pilot checklist.
slug: /technical-evaluation/
---

# Evaluate Talon

For platform engineers, architects, security reviewers and operators evaluating an AI control plane. Decide whether Talon can govern your existing AI use cases, what it can prove, and what you still need to validate in your environment.

**Evaluation scope: Talon v1.17.0.** [Release artifacts](https://github.com/dativo-io/talon/releases/tag/v1.17.0) · [Publication provenance](/talon/docs/publication.json) · [Security boundaries and limitations](https://github.com/dativo-io/talon/blob/410f1015a621326e722ebfb0fb9e84adf2a6a6dc/LIMITATIONS.md).

## 1. Establish the enforcement boundary

Keep your application, workflow engine and providers. Register each AI use case under one company policy, and choose a supported path through Talon.

| Path | What Talon enforces | What remains outside |
| --- | --- | --- |
| [Model API gateway](./proxy-quickstart.md) | Provider/model eligibility, configured data controls, estimated-cost admission, policy-valid fallback and signed decisions | Direct provider calls; local file edits, shell commands and tool execution |
| [HTTP Action Gateway](./action-gateway.md) | Exact operation, argument rules, separate human approval when required, dispatch and lifecycle evidence | Actions sent directly to the destination or business effects that were not observed |
| [Governed MCP](./mcp-governed-tools.md) | Same Action Gateway lifecycle for declared MCP action sources, with per-call data controls | Other MCP connections and unsupported protocol versions |
| [OpenShell composition](./openshell.md) | Delegated model policy decisions through a trusted runtime; intercepted action dispatch on the supported hop | Enforcement not observed by Talon; other runtime versions and unconfigured paths |

Distinguish **intercepted enforcement** from **delegated decisions** and **externally asserted facts**. Talon is not an OS sandbox. It cannot prove enforcement on a bypassed path or that a downstream model answer is correct.

Read the [architecture overview](./control-plane.md), [trust and enforcement boundaries](./control-plane-boundaries.md), [integration selection](./choosing-integration-path.md) and [governance control matrix](./governance-control-matrix.md).

## 2. Inspect evidence from the released artifacts

The v1.17.0 release workflow on November 24, 2026 completed successfully for commit `410f1015a621326e722ebfb0fb9e84adf2a6a6dc`. Its pilot acceptance job used the distributed Linux amd64 binary, verified against release checksums, and the published Docker image. These results are scoped to the recorded test environment.

| Verified release test | What the run established |
| --- | --- |
| No-key quickstart | Published image rejected disallowed model and sensitive-data requests; evidence verified without a provider |
| First and second use case | Secure registration, authenticated traffic through OpenAI Node SDK 7.59.0, shared policy and independent upstream counts |
| Exact-action authorization | Allowed, held and denied operations; separate reviewer identity, bound arguments, signed lifecycle |
| Governed MCP | Real MCP server and official SDK client; denied calls zero, authorized execution once, unknown outcome not blindly retried |
| n8n refund workflow | Real n8n 2.48.5 and a synthetic counting refund service; deny, approval, rejection, expiry and concurrent claim behavior |
| Operations Console | Released binary and paired read-only browser console acceptance |
| Recovery and upgrade | Cold backup, restore hold, reconciliation/resume and preceding-stable upgrade/rollback tests |
| Streaming | Early delivery with post-delivery warn observation; preventive redact buffering; allow without response scan |

[Release workflow](https://github.com/dativo-io/talon/actions/runs/45429574176) · [Pilot acceptance job](https://github.com/dativo-io/talon/actions/runs/45429574176/job/138573998621) · [Console acceptance job](https://github.com/dativo-io/talon/actions/runs/45429574176/job/138573998244) · [Public artifact verification](https://github.com/dativo-io/talon/actions/runs/45429574176/job/138577644428).

The pilot uses a deterministic local model provider and synthetic business data. The optional paid live-provider request was **not run**. These results do not establish production capacity, every client/version combination, payment correctness or customer-specific compliance.

Reproduce the release verifier using the exact tag's [verification script](https://github.com/dativo-io/talon/blob/410f1015a621326e722ebfb0fb9e84adf2a6a6dc/scripts/verify-release.sh). The [pilot acceptance script](https://github.com/dativo-io/talon/blob/410f1015a621326e722ebfb0fb9e84adf2a6a6dc/scripts/pilot-acceptance.sh) documents the required prerequisites and uses release-matched fixtures. It is an engineering test harness, not a production installation script.

## 3. Check compatibility before integration

Start with the [compatibility center](./compatibility.md) for exact client profiles, supported boundaries and verification evidence. The table below summarizes the evaluation considerations.

| Surface | Verified or documented scope | Validate in your environment |
| --- | --- | --- |
| OpenAI-compatible model traffic | Node SDK 7.59.0 in release acceptance | Client version, endpoint, credentials, model and streaming mode |
| HTTP actions | Released exact-action lifecycle | Destination allowlist, stable operation IDs, idempotency and error semantics |
| MCP | Protocol 2026-07-28 only; official Go SDK proof | Client support for the protocol and prepare/execute flow; no legacy initialize/session handshake |
| n8n | Refund reference tested on 2.48.5 | Your installed version, credentials, deployment topology and workflow; other versions, Cloud and queue mode not established by this run |
| Coding assistants | Individual client guides | Actual client version and API-key configuration; local tools and subscription/OAuth billing are outside model gateway control |
| External scanners | Presidio-compatible result contract over HTTP or Unix socket | Entity coverage, offsets, latency, failure policy and isolated transport |
| Deployment | Single-node Linux pilot profile | Your OS, host security, capacity, RPO/RTO and maintenance window |

Use the [provider registry](./provider-registry.md), [conformance suite](./conformance.md), [MCP migration](./mcp-2026-migration.md), [n8n reference](./n8n-refund-approvals.md), [Claude Code](./claude-code-integration.md), [Codex CLI](./codex-cli-integration.md) and [scanner compatibility](./presidio-compatibility-matrix.md). A historical guide is not a current compatibility certificate.

## 4. Review security and data handling

| Review area | Talon mechanism | Operator responsibility |
| --- | --- | --- |
| Identity | Dedicated use-case key, separate reviewer credential and operator key; paired read-only console session | Secure issuance, storage, rotation and revocation; do not treat asserted subagent/session IDs as authentication |
| Network | Authenticated supported routes; TLS terminator needed for remote access | Isolate host, downstream services and scanner, restrict direct/bypass traffic and enforce TLS |
| Data | Configured input and response scans, deny/redact or observation | Test your real data classes and false negatives; response warn observes after streaming delivery; LLM-embedded tool content is evidence-only by default |
| Secrets | AES-256-GCM vault; operator-managed encryption and signing keys | Secure the host and keys, maintain separate protected backup copies; do not assume all evidence files are encrypted |
| Evidence | HMAC-SHA256 signed records, hashes and configurable retention | Verify integrity with the protected signing key; review prompt-capture settings, exports, retention and access controls |

Review the [threat model](./threat-model.md), [credential scopes](./authentication-and-key-scopes.md), [evidence store](./evidence-store.md), [integrity specification](./evidence-integrity-spec.md), [external scanners](./external-scanners.md) and [configuration reference](./configuration.md).

HMAC evidence is tamper-evident, not immutable or independent proof of downstream effects. A compromised signing key can forge records. Data detection is not perfect. Talon is not a legal compliance determination or certification.

## 5. Measure performance and failure behavior

[Reproducible benchmarks](./benchmarks.md) describe small non-streaming mock-upstream pipeline overhead, classifier latency and evidence writes. The under-15-ms small-payload target is a local microbenchmark, not a production SLA. The benchmarks do not cover WAN latency, production concurrency, all payloads, streaming or retry/fallback capacity. Single-node capacity is not established.

Use a representative workload and compare direct versus governed traffic. Record p50/p95/p99 latency, time to first token, throughput, errors, payload size, CPU/memory, disk growth and evidence write health. Measure policy-specific overhead, not just the allow path. Confirm budget estimates against settled provider charges: the admission caps are not provider invoice ceilings.

| Failure to exercise | Required observation |
| --- | --- |
| Binding budget state/pricing unavailable | Admission denied before provider dispatch |
| Provider failure | Only policy-valid, re-admitted fallback candidates; verify failure and cost evidence |
| Unknown action outcome | No blind replay; reconcile against independent destination records |
| Approval or policy binding changes | Stale approval cannot authorize a changed operation |
| Backup/restore | Action dispatch held until reconciliation and explicit resume; LLM traffic is not held |
| Talon unavailable | Application or delegated runtime fails according to its configured integration contract; no unintended bypass |

See [cost governance](./cost-governance-by-agent.md), [action semantics](./action-gateway.md), [observability](./observability.md) and [incident response](./incident-response-playbook.md).

## 6. Establish operational readiness

The Community production profile is one installation, one host, one serving process, local SQLite stores and an optional read-only Operations Console. No HA, replication or automatic failover is supported in that profile. Recovery is an operator procedure, not zero-downtime failover.

Before a pilot:

- Assign installation and use-case owners; secure the admin interface, credentials and storage.
- Agree on resource headroom, monitoring, incident escalation and service objectives.
- Test cold backup, key recovery, restore hold, reconciliation and resume with synthetic downstream state. A restored ledger cannot prove which effects occurred in the lost interval.
- Test the upgrade from the current deployed version and a rollback from a pre-upgrade backup. Do not assume binary downgrade after newer writes is safe.
- Keep the release, configuration and evidence identifiers in your change record.

Read the [single-node production profile](./single-node-production.md), [production pilot runbook](./production-pilot.md), [Operations Console](./operations-console.md), [upgrade to v1.17](./upgrading-to-1.17.md) and [incident response](./incident-response-playbook.md). Compare [Community and Enterprise](./open-source-and-enterprise.md); corporate identity, supported scale/HA profiles and other Enterprise commitments are scoped during evaluation, not automatically certified by the Community test run.

## 7. Run your own evaluation and decide

Start with the [no-key quickstart](./quickstart-demo.md), then [connect an existing app](./add-talon-to-existing-app.md), verify a second use case under the same policy, and reproduce the [exact-action proof](./action-gateway-proof.md) if your workflow performs consequential actions.

Record each result in the [evaluation checklist](./evaluation-checklist.md). Use the same exact version, configuration and synthetic inputs on both positive and negative paths. Compare signed evidence with upstream counters or destination records.

**Proceed to a scoped pilot** only when allowed work succeeds, denied work cannot reach the protected destination, identity and evidence are verifiable, bypass paths have independent controls, and operational risks are accepted by named owners.

**Hold** if a required client/version, deployment profile, performance target or failure scenario remains untested. **Do not proceed** if mandatory prevention or recovery controls fail, a required profile is unsupported, or an unacceptable bypass remains.

[Discuss a pilot](https://dativo.io/pilot/) with the workflow owner, architecture/security reviewer and operator. Bring your evaluation results and requirements, not production credentials or sensitive customer data.
