# Dativo Talon Website

Static landing page and Docusaurus docs for Dativo Talon.

Production domain: https://dativo.io  
Blog: https://blog.dativo.io  
Product repo: https://github.com/dativo-io/talon

## Website information architecture

The main page leads with the fragmentation problem (AI use cases multiply while company controls fragment), the four concrete use cases (support, coding, People Analytics, vendor review), a three-step integration overview, an OSS versus planned Enterprise adoption choice, reproducible proof links, and one private pilot contact path. The `/enterprise/` page is a directional capability/status comparison; it must never label roadmap integrations as released.

Detailed enforcement semantics and all advanced examples belong in
`/talon/docs/` and the existing search-oriented technical pages. The main page
does not embed product documentation or a secondary generated CTA section.
The production build replaces marketing-page navigation with a shared five-link header.

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

Talon owns the approved WebP screenshots and collage in `docs/assets/console/`. The website fetches one Talon revision (default `main`), copies the marketing assets into `dist/public/assets/`, and synchronizes the guide images and landing-page collage into Docusaurus. The build fails if required images are missing or differ from the canonical files. It does not start Talon or regenerate screenshots. The actual source commit is printed in the build log.

For a preview of an upstream PR before it merges:

```bash
# From a fresh website checkout without a sibling Talon checkout:
TALON_DOCS_REF=docs/console-showcase-20261110 ./scripts/build-site-with-docs.sh
# Or pass an already checked-out Talon branch explicitly:
TALON_REPO_PATH=/path/to/talon ./scripts/build-site-with-docs.sh
```

Cloudflare Workers Builds remains the production publisher. Normal website changes trigger the existing Git integration; approved console image or guide changes on Talon `main` can trigger the same build through a branch-specific Cloudflare Deploy Hook. The hook URL is a secret in the Talon repository, never in this repository or public build output. See the upstream console asset README for setup and recovery. No automatic screenshot commits or second deployment pipeline are needed.

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

Link events include the current page, destination, and truncated CTA text as event properties. Cloudflare Web Analytics remains present on the static marketing pages as a secondary infrastructure-level signal.

### Clean-traffic reporting and pilot intent

The August 8–November 6, 2026 Umami export has 417 distinct sessions. 273
carry the `aocr.org` referral. Reporting should show both raw traffic and
traffic excluding that pattern, without asserting the remainder is human.

Extract `website_event.csv` from a native Umami ZIP export and run:

```bash
node scripts/report-traffic.cjs path/to/website_event.csv
node scripts/test-report-traffic.cjs
```

The filter does not block bots and may miss other crawlers. Keep raw data.

`Pilot Contact Click` records an outbound click to the founder's LinkedIn.
It is **not** a submitted contact form, booked meeting, qualified lead, or pilot.
Track confirmed conversations in a separate, privacy-safe lead ledger.
Never send customer payloads or identifiers as analytics properties.

### Recommended Umami dashboard setup

Create these Goals in Umami:

1. `Product Demo Click` — primary technical evaluation signal.
2. `Quickstart Demo Click` — low-friction evaluation signal.
3. `GitHub Click` — implementation/repository intent.
4. `Evidence Click` — proof/audit interest.
5. `Demo Play` — product-proof engagement.

Keep `Docs Click` and `Checklist Click` as supporting events rather than headline conversions.

Create at least these Funnels:

- Homepage evaluation: `/` → `Product Demo Click` → `GitHub Click`.
- Low-friction evaluation: `/` → `Quickstart Demo Click` → `GitHub Click`.
- Comparison evaluation: `/comparisons/` → `Product Demo Click` or `Quickstart Demo Click` → `GitHub Click`.

Use consistent UTM parameters on every external campaign link:

- `utm_source`: `linkedin`, `reddit`, `github`, `blog`, `email`, `direct_outreach`
- `utm_medium`: `organic_social`, `community`, `referral`, `newsletter`, `outreach`
- `utm_campaign`: stable topic/campaign identifier
- `utm_content`: individual post, creative, or placement

For routine product review, separate three questions:

1. **Acquisition:** which sources and landing pages bring relevant visitors?
2. **Evaluation:** which visitors trigger demo, quickstart, evidence, or GitHub events?
3. **Conversion:** which journeys progress through the defined Goals and Funnels?

Do not identify visitors or attach email/form values to analytics events. Keep event properties limited to non-sensitive navigation and CTA context.
