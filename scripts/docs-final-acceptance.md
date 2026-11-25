# Documentation 2.0 final acceptance

## Automated build gates

- Stable release commit, clean checkout, exact reviewed errata and screenshot lock.
- Every canonical route represented once in publication manifest, sitemap, local search and Markdown inventory; per-page Markdown provenance, SHA-256, complete bundle, copy/view controls.
- Strict existing link, anchor and orphan audit; existing edition comparison and product-claim guards.
- Desktop and mobile browser smoke, keyboard search, Markdown copy (clipboard stub), dark mode, no critical accessibility findings, and Lighthouse lab measurements.
- Dispatch Build site manually with full_docs=true and strict_quality=true for all canonical docs desktop/mobile checks and strict axe/Lighthouse thresholds. Ordinary PRs retain targeted browser coverage and measured Lighthouse warnings; no existing gates are weakened.

## Production acceptance after deploy

Run Production site health with full=true after the merged site is deployed. Check canonical headers, sitemap, route availability, noindex on Markdown, release provenance, search and Markdown inventory parity, full bundle hash and every individual Markdown hash. The scheduled lightweight check samples critical guides. Cloudflare deployment must actually serve the merged build; GitHub merge alone is not deployment proof.

## Manual acceptance (not simulated by CI)

- An engineer unfamiliar with Talon completes no-key proof, first use case and second use case; record timings, blockers and evidence IDs. Targets (60 seconds excluding pull, 5 minutes and 3 minutes) are hypotheses, not promises.
- Inspect overview, technical evaluation, tables, Mermaid, console screenshots and search on real mobile/desktop, light/dark. Test native clipboard permission and failure fallback.
- Verify live Umami dashboard/export: named events, no raw terms or clipboard content, no duplicate click event and DNT. Confirm GSC indexing separately. No live tracker credentials in repo.
- Record release, website commit, build/run URLs, deployment and acceptance observations. Use release evidence for product proof; no claim that CI tested every manual instruction or live provider.
- Step 8 closes only when evidence is recorded and mandatory failures resolved. No automatic compliance, adoption or performance guarantees.
