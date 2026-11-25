# Documentation 2.0 — Step 1: product truth reconciliation (2026-11-25)

Approved direction: one product identity, release-correct technical docs, Community and Enterprise positioning, developer-first adoption. Baseline: Talon v1.17.0 (2026-11-24), verified tagged CHANGELOG, governed MCP guide and limitations; selected current main sources reviewed. Growth agent strategy is input, not implementation truth.

## Resolved in this website PR

- Edition overview mirrors all 14 current marketing comparison rows (5 common, 9 Enterprise pilot-scoped) and Community alternatives, with no blanket planned-edition label. Enterprise is a commercial offering, not a claim of universally available integrations. Existing docs slug preserved. Canonical pilot destination.
- Local docs overview, evaluation checklist and playbooks: unified v1.17 governed HTTP/MCP lifecycle; approval is not dispatch, no bypass coverage. Publish upstream governed MCP and upgrade guides via source map, not copies.
- Public action, MCP, governance, audit, comparison, n8n and refund pages: remove pre-v1.17 contradictions, preserve actual supported protocol and distinct invocation paths. Historical Copilot receipts explicitly do not establish current compatibility. No new acceptance claims. Pilot links use /pilot/.
- Homepage enterprise label, sidebar, discovery file and design contract aligned. Source regression guard detects selected stale claims and requires edition capabilities and new routes.

## Canonical corrections

Companion PR https://github.com/dativo-io/talon/pull/609 corrects the n8n refund guide, migration availability, cost admission vs invoice ceiling, removed gateway.mode example, and README PII boundaries/positioning. Merge upstream correction first; then rerun website CI on the actual upstream checkout. Do not patch released tags. Until the release-aware publication contract is implemented, build still defaults to mutable main. The v1.17 tag itself contains known documentation errata; Step 2 must preserve immutable release provenance while allowing separately versioned, explicitly reviewed documentation corrections.

## Validation and remaining audit

Source-level checks passed: existing first-run guard, five metadata tests, exact 14-row matrix parity including Community alternatives, syntax of publication guard. Homepage 299 words; n8n main 242 words. No native CI/build/route/anchor/browser pass or executed product commands claimed at creation. Historical screenshots and receipts not replaced or re-certified.

Reviewed the five local owned-doc roles, source map and selected upstream primary integration/evaluation/operations guides. Full page-by-page audit of generated docs, all product claims, examples, compatibility profiles and competitor claims is not complete. Particular follow-up: verify budget guide prerequisites and commands against release artifact; verify client compatibility after MCP migration (Copilot and other integrations); distinguish real provider data vs synthetic fixtures; reconcile all operational and deployment boundaries. Check release notes and upgrade links after sync. Preserve existing URLs, redirects, anchors and screenshot provenance. Do not promote an unreleased v1.18 feature or unverified Enterprise deployment profile.

## Next review gates

1. Merge canonical correction only after upstream review/CI.
2. Website native CI on updated source, strict crawl, existing publication guard and screenshot lock; no bypass.
3. Owner review and merge website PR; verify live deployment separately.
4. Step 2: single maintained edition matrix and status contract, stable release selection + documented errata overlay/provenance, comprehensive claim inventory and cross-site parity checks.
5. Steps 3–8 remain independent: visual/search, landing/IA, executable onboarding and integration, evaluation/operations, AI-native/growth, final validation. 
