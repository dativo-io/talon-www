# Dativo Talon Website

Static landing page and Docusaurus docs for Dativo Talon.

Production domain: https://dativo.io  
Blog: https://blog.dativo.io  
Product repo: https://github.com/dativo-io/talon

## Website information architecture

The five-section homepage is a **buyer-first overview**, not the technical
product manual:

1. A company-policy promise and one clearly labelled **synthetic** exact-action
   proof (separate approval, zero dispatch before claim).
2. Four connected outcomes: cost, reliability, shared policy and sessions,
   plus a short connect → enforce → verify sequence.
3. Three self-service evaluator paths: try without keys, connect an app, or
   explore existing business use cases.
4. A single read-only Operations Console example with a link to its guide.
5. A founder-led pilot call for one bounded production use case.

Detailed cases, the Community-versus-Enterprise matrix, implementation
instructions, and architectural limits belong on dedicated marketing routes
or in Docusaurus. Do not imply Talon sees bypassed actions or that approval
itself executes a business effect. Avoid shipping assets for a flagship demo
until their release/provenance gates have passed.

The **Docusaurus front door** serves developers and evaluators, not a
second marketing site. It shows **three** first steps: no-key demo, connect
an existing app, and verify an exact action. Only that section expands in
the sidebar by default; deeper integration, controls, operations and
reference guides remain accessible and indexed. The top navbar prioritizes
these paths and the private pilot. All synced technical docs continue to
come from the selected Talon repository revision.

Run the focused-site regression check with:

```bash
node scripts/test-first-run-journeys.cjs
```

The production build also runs this test and the product-capabilities
publication checks; do not weaken truth/boundary assertions to pass a
marketing change.

## Local preview

For a complete local preview (including generated console images and technical docs), build first and serve the output:

```bash
./scripts/build-site-with-docs.sh
python3 -m http.server 8080 --directory dist
```

Serving the source tree directly is a text/layout-only preview: the console images are intentionally not checked into this repository.

Then open:

```text
http://localhost:8080
```

## Production build

Cloudflare should build the final `dist/` artifact with:

```bash
./scripts/build-site-with-docs.sh
```

Output directory:

```text
dist
```

The build script copies the static marketing site, builds Docusaurus, mounts docs under `/talon/docs/`, generates root SEO files, injects Umami analytics into every generated HTML page, and fails the build if the final artifact has a missing or duplicate tracker or contains legacy analytics code.

The homepage is a buyer-problem-first overview, with reproducible technical demonstrations linked from their canonical documentation pages. The Talon checkout remains the source of truth for published docs. No animated hero asset is needed for the homepage.

### Console screenshot publication

Talon owns the approved screenshot set in `docs/assets/console/`. This repository commits `console-screenshots.lock.json` (file names and content-derived Git blob IDs), not duplicate binaries.

Every website PR checks the lock against the **actual screenshot files on Talon main**. Added, removed, renamed or changed images fail CI. Changes to Talon's baseline metadata or unrelated code do not fail this check. If the upstream checkout or its screenshots are unavailable, CI fails rather than using stale images.

To adopt an updated set, review the upstream images and their placement and captions, then run from the website checkout:

```bash
# Use a fresh checkout of Talon main.
git clone --depth 1 --single-branch --branch main https://github.com/dativo-io/talon.git ../talon-console-source
node scripts/console-screenshot-lock.cjs check ../talon-console-source
# After reviewing the reported differences:
node scripts/console-screenshot-lock.cjs refresh ../talon-console-source
git add console-screenshots.lock.json
TALON_REPO_PATH="$(cd ../talon-console-source && pwd)" ./scripts/build-site-with-docs.sh
```

Commit the updated lock and any necessary homepage, guide-link or caption changes in a website PR. The initial website PR depends on Talon PR #559: its screenshot lock is seeded from the approved candidate in that PR and can only pass normal CI against `main` once the matching assets have merged upstream.

The website build uses the same checked-out Talon revision for the freshness check, docs, and images. It verifies published image bytes and logs the source revision. It does not run Talon or generate screenshots. A local preview can use an explicit `TALON_REPO_PATH` containing the matching locked set; website CI always checks upstream `main`. No build updates the lock automatically.

Cloudflare Workers Builds remains the production publisher through the website's existing Git integration. Talon does not trigger website deployments. If Talon changes after a website PR's last passing run, rerun its CI before merging; the production build also rejects mismatched images rather than silently publishing them.

The compatibility route `/docs/talon/` redirects users to `/talon/docs/` and is included in the same analytics verification.

## Search Console / SEO files

The production build generates:

- `/sitemap.xml` from every generated HTML page in `dist`
- `/talon/docs/sitemap.xml` from the generated Docusaurus HTML pages under `dist/talon/docs/`
- `/robots.txt` with `Allow: /` and both sitemap entries:
  - `https://dativo.io/sitemap.xml`
  - `https://dativo.io/talon/docs/sitemap.xml`

The docs sitemap is generated from the final built routes, not from the source folder layout. That means canonical docs URLs stay flat under `/talon/docs/`, for example:

```text
https://dativo.io/talon/docs/add-talon-to-existing-app/
```

and source-folder-style paths such as `/talon/docs/guides/add-talon-to-existing-app/` are not emitted into the sitemap.

Defaults:

```bash
SITE_URL=https://dativo.io
```

After deployment, submit both `https://dativo.io/sitemap.xml` and `https://dativo.io/talon/docs/sitemap.xml` in Google Search Console.

### Production SEO validation

The checked-in root `sitemap.xml` is a legacy source snapshot for no-build preview.
**The deployed sitemap is generated during `build-site-with-docs.sh`.**
The production build now checks that each canonical marketing URL and each
published documentation URL appears in its generated sitemap. To validate
a completed build:

```bash
node scripts/verify-sitemap-completeness.cjs dist
node scripts/verify-seo.cjs dist
```

A sitemap entry does not guarantee search indexing. Verify the deployed
sitemap and page index status separately in Google Search Console.

## Analytics

Umami is the sole browser analytics tracker and is injected at build time only after the complete deployable artifact exists. This covers both the static marketing pages and every generated Docusaurus HTML page under `/talon/docs/`.

Defaults:

```bash
UMAMI_ENABLED=true
UMAMI_SCRIPT_SRC=https://cloud.umami.is/script.js
UMAMI_WEBSITE_ID=e9e60801-c09d-4f9f-8890-7b76cb6fdbcb
UMAMI_DOMAINS=dativo.io,www.dativo.io
```

`UMAMI_DOMAINS` keeps local development and Cloudflare preview hosts out of production analytics. Disable analytics entirely for a diagnostic build with:

```bash
UMAMI_ENABLED=false ./scripts/build-site-with-docs.sh
```

`UMAMI_SCRIPT_SRC` can later point at a first-party proxy path on `dativo.io` if tracker blocking becomes material.

After deployment, the tracker should appear once in the `<head>` of every generated HTML page:

```html
<!-- Privacy-friendly analytics by Umami -->
<script defer src="https://cloud.umami.is/script.js" data-website-id="e9e60801-c09d-4f9f-8890-7b76cb6fdbcb" data-domains="dativo.io,www.dativo.io" data-talon-analytics="umami"></script>
```

The injected helper emits these buyer-intent events:

- `Product Demo Click`
- `Quickstart Demo Click`
- `Demo Play`
- `Evidence Click`
- `Checklist Click`
- `GitHub Click`
- `Docs Click`

The named event helper sends only the current page path and a safe destination (internal pathname or external hostname), never raw link URLs, query strings, fragments, or arbitrary link text. `Funnel CTA` includes classified intent, placement, safe destination and primary-CTA flag; it does not send arbitrary link text. Cloudflare Web Analytics remains present on the static marketing pages as a secondary infrastructure-level signal.

### Clean-traffic reporting and pilot intent

The August 8–November 6, 2026 Umami export has 417 distinct sessions. 273
carry the `aocr.org` referral. Reporting should show both raw traffic and
traffic excluding that pattern, without asserting the remainder is human.

Extract `website_event.csv` from a native Umami ZIP export and run:

```bash
node scripts/report-traffic.cjs path/to/website_event.csv
node scripts/test-report-traffic.cjs
node scripts/test-pilot-conversion.cjs
```

The filter does not block bots and may miss other crawlers. Keep raw data.

The dedicated `/pilot/` landing page offers a founder-led technical fit call
through a publicly shareable Google Calendar booking URL. It has **no contact
form and no website-side submission endpoint**: calendar details are handled
by Google, not collected by this website. The private notification recipient
is deliberately **not** committed to the public repository. If a future
contact form is implemented, configure its recipient using a server-side
deployment secret, with private delivery and anti-abuse measures.

`Funnel CTA` with `intent=pilot-offer` means someone clicked through to
the pilot page. `Pilot Booking Click` means someone opened the external
scheduling URL; this single event is **not** double-counted as a generic
`Funnel CTA`. Neither event proves a booking, qualified conversation or
pilot start. Confirmed bookings and qualification belong in a separate,
privacy-safe lead ledger, reconciled against Google Calendar.

`Funnel CTA` records a safe destination (internal pathname or external
hostname), not the raw link or URL query string. Never send customer payloads,
email addresses, UTM values containing identifiers, or free-text form answers
as analytics event properties.

Use campaign links such as:

```text
https://dativo.io/pilot/?utm_source=linkedin&utm_medium=founder_outreach&utm_campaign=pilot_nov2026
```

Keep UTM values aggregate/non-identifying. Umami's landing-page tracking
records campaign parameters; do not append a recipient name or email to
public URLs. Local builds and Cloudflare previews must stay out of the
production Umami project via `UMAMI_DOMAINS`.

### Configuring Umami Goals, Funnels and the operator dashboard

**Website-side events are implemented, but saved Umami Cloud reports are not
provisioned by this repository.** A passing website build does not confirm
which Goals or Funnels exist in the live Umami workspace.

The exact goal names, ordered funnels, event/property semantics, privacy
constraints, QA steps, bot-traffic caveats and manual booking reconciliation
are in [the Umami setup runbook](scripts/umami-funnel-setup.md).

Primary conversion journey:

```text
Homepage /  →  Pilot page /pilot/  →  Pilot Booking Click
```

A `Pilot Booking Click` is **outbound scheduling intent**, not a confirmed
appointment or qualified lead. Google Calendar remains the source of truth
for completed bookings; maintain the private lead ledger separately.

Compare clean traffic (excluding known `aocr.org` referral noise) with raw
traffic, and preserve the same filtering methodology across periods.
