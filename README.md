# Dativo Talon Website

Static landing page and Docusaurus docs for Dativo Talon.

Production domain: https://dativo.io  
Blog: https://blog.dativo.io  
Product repo: https://github.com/dativo-io/talon

## Local preview

Preview the static marketing pages directly:

```bash
python3 -m http.server 8080
```

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

The homepage hero and the published docs are sourced from the same Talon checkout. During the production build, `docs/assets/talon_hero.gif` is copied into `dist/public/assets/` under a Talon-commit-fingerprinted filename and the built homepage is rewritten to that same-origin URL. The source `index.html` keeps its pinned GitHub URL only so the no-build local preview above can still play the demo.

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
