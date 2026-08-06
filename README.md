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

The build script copies the static marketing site, builds Docusaurus, mounts docs under `/talon/docs/`, generates root SEO files, injects Umami analytics into every generated HTML page, and fails the build if any generated page is missing the Umami script.

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

Umami is injected at build time through `scripts/build-site-with-docs.sh` using the site-specific Umami website ID.

Defaults:

```bash
UMAMI_ENABLED=true
UMAMI_SCRIPT_SRC=https://cloud.umami.is/script.js
UMAMI_WEBSITE_ID=e9e60801-c09d-4f9f-8890-7b76cb6fdbcb
```

Set `UMAMI_ENABLED="false"` to disable Umami in a non-production build. Override `UMAMI_SCRIPT_SRC` when moving collection behind a first-party proxy, and override `UMAMI_WEBSITE_ID` when deploying another Umami website/project.

After deployment, verify the script appears in the page source:

```html
<!-- Privacy-friendly analytics by Umami -->
<script defer src="https://cloud.umami.is/script.js" data-website-id="e9e60801-c09d-4f9f-8890-7b76cb6fdbcb" data-talon-analytics="umami"></script>
```

The injected helper also emits these buyer-intent events with page, destination, and CTA-text properties where relevant:

- `Product Demo Click`
- `Quickstart Demo Click`
- `Demo Play`
- `Evidence Click`
- `Checklist Click`
- `GitHub Click`
- `Docs Click`

Cloudflare Web Analytics is still present on the static marketing pages and can stay as a secondary infrastructure-level signal.
