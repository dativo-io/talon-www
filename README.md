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

The build script copies the static marketing site, builds Docusaurus, mounts docs under `/talon/docs/`, and injects Plausible analytics into all generated HTML pages.

## Analytics

Plausible is injected at build time through `scripts/build-site-with-docs.sh`.

Defaults:

```bash
PLAUSIBLE_DOMAIN=dativo.io
PLAUSIBLE_SCRIPT_SRC=https://plausible.io/js/script.js
```

Set `PLAUSIBLE_DOMAIN=""` to disable Plausible in a non-production build, or override `PLAUSIBLE_SCRIPT_SRC` if we later proxy/self-host the Plausible script.

After deployment, verify the script appears in the page source:

```html
<script defer data-domain="dativo.io" src="https://plausible.io/js/script.js" data-talon-analytics="plausible"></script>
```

The injected helper also emits these buyer-intent events:

- `Quickstart Demo Click`
- `Evidence Click`
- `Checklist Click`
- `GitHub Click`
- `Docs Click`

Create matching custom event goals in Plausible so they appear as conversions.

Cloudflare Web Analytics is still present on the static marketing pages and can stay as a secondary infrastructure-level signal.