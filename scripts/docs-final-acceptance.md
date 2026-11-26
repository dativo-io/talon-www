# Documentation 2.0 final acceptance

## Automated build gates

- Stable release commit, clean checkout, exact reviewed errata and screenshot lock.
- Every canonical route represented once in publication manifest, sitemap, local search and Markdown inventory; per-page Markdown provenance, SHA-256, complete bundle, copy/view controls.
- Strict existing link, anchor and orphan audit; existing edition comparison and product-claim guards.
- Desktop and mobile browser smoke, keyboard search, Markdown copy (clipboard stub), dark mode, no critical accessibility findings, and Lighthouse lab measurements.
- Dispatch Build site manually with full_docs=true and strict_quality=true for all canonical docs desktop/mobile checks and strict axe/Lighthouse thresholds. The dedicated docs/final-acceptance PR branch also runs both full and strict modes so the acceptance evidence is reviewable before merge. Ordinary PRs retain targeted browser coverage and measured Lighthouse warnings; no existing gates are weakened.

## Production acceptance after deploy

Run Production site health with full=true after the merged site is deployed. Check canonical headers, sitemap, route availability, noindex on Markdown, release provenance, search and Markdown inventory parity, full bundle hash and every individual Markdown hash. The scheduled lightweight check samples critical guides. Cloudflare deployment must actually serve the merged build; GitHub merge alone is not deployment proof.

## Manual acceptance (not simulated by CI)

- An engineer unfamiliar with Talon completes no-key proof, first use case and second use case; record timings, blockers and evidence IDs. Targets (60 seconds excluding pull, 5 minutes and 3 minutes) are hypotheses, not promises.
- Inspect overview, technical evaluation, tables, Mermaid, console screenshots and search on real mobile/desktop, light/dark. Test native clipboard permission and failure fallback.
- Verify live Umami dashboard/export: named events, no raw terms or clipboard content, no duplicate click event and DNT. Confirm GSC indexing separately. No live tracker credentials in repo.
- Record release, website commit, build/run URLs, deployment and acceptance observations. Use release evidence for product proof; no claim that CI tested every manual instruction or live provider.
- Step 8 closes only when evidence is recorded and mandatory failures resolved. No automatic compliance, adoption or performance guarantees.

Static GFM task lists render their checked/unchecked state as text for accessible reading; source exports preserve task-list syntax. Lighthouse diagnostics and report upload run before strict assertions so failure evidence remains available.

The QA preview negotiates gzip for eligible static text assets, matching the normal compressed delivery model rather than benchmarking an uncompressed Python server. Tests verify decoded response bytes, identity fallback, HEAD, redirects and missing routes. The deployable files, mobile throttling, three-run aggregation and strict thresholds are unchanged. Local gzip is not proof of actual Cloudflare compression; verify live Content-Encoding separately.

## Documentation 2.1 — technical correction review

The stable v1.17.0 release pin is unchanged. The Step 1 errata are based on the exact product PR #612 commit; this website PR must not merge before that product PR is approved and merged. If the product PR changes, regenerate and reverify patches against the approved bytes. Existing release hash checks apply to every correction. The product regression script is targeted; it does not replace execution of every developer example or semantic review of every page. No new routes or runtime features.
