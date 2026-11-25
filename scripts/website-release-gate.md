# Step 8 — Final production acceptance

This is a release checklist, not a claim that production or live accounts have passed. Complete it against the exact merged commit and deployed revision. No redesign PR may waive product-truth or screenshot-lock checks.

## A. Automated built-artifact gate

1. Run the Build site workflow on the final review branch; check the exact head SHA. Retain the source checks, screenshot lock, Docusaurus source contract, production SEO validator, exact sitemap validator, strict site audit and single-tracker tests.
2. Download website-crawl-audit and website-browser-quality artifacts. Zero broken internal links and missing anchors; review any redirects. No orphan canonical routes. Verify each intended page is discoverable. Browser smoke must have zero blocking findings.
3. Review actual desktop/mobile screenshots. Compare the homepage with the approved hero and diagram. Verify enterprise table scrollability, legacy comparison layouts, all proof caveats, nav dropdowns, focus and skip link. Automated axe checks are not full WCAG conformance.
4. Lighthouse CI measures the four priority landing pages using three mobile lab runs, with external trackers blocked. Review median scores: performance >=95, accessibility 100, best practices >=95, SEO 100, LCP <=2.5s and CLS <=0.1. For strict release use TALON_RELEASE_GATE=1 in browser-smoke and Lighthouse assert. Field INP <=200ms and LCP/CLS at p75 require enough real-user field data; lab TBT does not establish INP.
5. Compare against a comparable previous revision if an archived build/baseline is available. Do not manufacture a prior baseline. Verify no critical/serious axe violations and manual keyboard/screen reader checks.

## B. Published website gate

After deployment, run the Production site health workflow with full=true. It checks the live canonical host, permanent host redirects, both sitemap inventories, required routes and canonical headers, analytics marker, security headers, social PNG, private-contact page, security.txt and true HTTP 404. Scheduled checks sample the critical routes every six hours. Configure owner notification in GitHub Actions; scheduled checks are not a substitute for real-time SLA monitoring.

Verify Cloudflare automatically injected Web Analytics is disabled if configured in the dashboard; hardcoded beacon is removed from built pages. Review current Cloudflare TLS/redirect settings, cache behavior, actual response headers, logs and CSP. Enforced CSP is a deliberately narrow safe baseline, not a full script-src allowlist. Inventory third-party domains before expanding; do not break Docusaurus or analytics. Ensure privacy/security contact routing and legal controller, lawful basis, retention, data rights, processing agreements and consent/opt-out requirements are reviewed by the owner before publishing a full legal policy. No claim of GDPR compliance from implementation alone.

## C. Search and AI discovery

Owner account access required: in Google Search Console, verify dativo.io domain ownership, submit https://dativo.io/sitemap.xml and https://dativo.io/talon/docs/sitemap.xml, inspect home, solutions/n8n, pilot, top use cases, docs canonical/indexing and coverage errors. In Bing Webmaster Tools submit the same canonical sitemap and inspect crawl/index status. Validate social card via platform preview, structured data via Rich Results Test where eligible; do not claim indexing or rich results are guaranteed. Use Search Console actual impressions, clicks, query and landing-page performance to revise the proposed keyword clusters. llms.txt is an experimental summary, not a ranking requirement; public crawler access is intentionally unchanged. Review crawler/AI training preferences with owner.

## D. Acquisition baseline

Use scripts/website-measurement-contract.md. Validate real Umami events and query/hash/DNT settings with browser devtools and account export. Verify one click event, UTM allowlist and current docs path, raw vs referral-filtered cohorts. Do not create a live calendar booking as a test without permission. Confirm actual bookings separately from click events. Gather aggregate GitHub traffic/clones/releases where accessible; clicks/copies do not establish installs. Record weekly impressions, recorded and filtered sessions, n8n landing, pilot offer, booking clicks, actual qualified calls and OSS interest; report small denominators and avoid false conversion precision. No new tracker or hidden product telemetry.

## E. Qualitative conversion

Ask five representative visitors (business buyer, n8n operator, OSS evaluator) what Talon does, whether they must replace their workflow/providers, which action to take, and whether proof limitations are clear. Record anonymized comprehension and friction; never report completed interviews unless done. Fix misunderstandings before launch.

## Decision

- [ ] Exact release commit and build CI green
- [ ] Strict crawl and browser evidence reviewed
- [ ] Mobile Lighthouse targets and field-data availability recorded
- [ ] Live health full run green; hosting account/security/privacy review done
- [ ] Search account submitted/inspected
- [ ] Umami live events, GitHub and calendar baseline recorded
- [ ] Buyer comprehension and CTA journeys verified
- [ ] Owner approves go/no-go; if not, document specific issues and rollback commit

Status at creation: automated checks are implemented; live production, account verification, legal details and interviews require actual access/results. No approved production deployment or final growth baseline is inferred from a PR.
