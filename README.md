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

The build script copies the static marketing site, builds Docusaurus, mounts docs under `/talon/docs/`, generates root SEO files, injects Plausible analytics into every generated HTML page, and fails the build if any generated page is missing the Plausible script.

The compatibility route `/docs/talon/` redirects users to `/talon/docs/` and is included in the same analytics verification.

## Search Console / SEO files

The production build generates:

- `/sitemap.xml` from every generated HTML page in `dist/`
- `/robots.txt` with `Allow: /` and `Sitemap: https://dativo.io/sitemap.xml`

Defaults:

```bash
SITE_URL=https://dativo.io
```

After deployment, submit `https://dativo.io/sitemap.xml` in Google Search Console.

## Analytics

Plausible is injected at build time through `scripts/build-site-with-docs.sh` using the site-specific Plausible script.

Defaults:

```bash
PLAUSIBLE_ENABLED=true
PLAUSIBLE_SCRIPT_SRC=https://plausible.io/js/pa-XmB1x7I_rYllpvVLPcVfs.js
```

Set `PLAUSIBLE_ENABLED="false"` to disable Plausible in a non-production build, or override `PLAUSIBLE_SCRIPT_SRC` if Plausible generates a new script URL later.

After deployment, verify the script appears in the page source:

```html
<!-- Privacy-friendly analytics by Plausible -->
<script async src="https://plausible.io/js/pa-XmB1x7I_rYllpvVLPcVfs.js" data-talon-analytics="plausible"></script>
<script>
  window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
  plausible.init();
</script>
```

The injected helper also emits these buyer-intent events:

- `Quickstart Demo Click`
- `Evidence Click`
- `Checklist Click`
- `GitHub Click`
- `Docs Click`

Create matching custom event goals in Plausible so they appear as conversions.

Cloudflare Web Analytics is still present on the static marketing pages and can stay as a secondary infrastructure-level signal.