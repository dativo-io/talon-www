#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs-site"
OUT_DIR="$ROOT_DIR/dist"
PLAUSIBLE_ENABLED="${PLAUSIBLE_ENABLED:-true}"
PLAUSIBLE_SCRIPT_SRC="${PLAUSIBLE_SCRIPT_SRC:-https://plausible.io/js/pa-XmB1x7I_rYllpvVLPcVfs.js}"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Copy the existing static marketing site as-is.
# Cloudflare Workers build images do not include rsync, so use portable shell/cp.
find "$ROOT_DIR" -mindepth 1 -maxdepth 1 \
  ! -name '.git' \
  ! -name 'dist' \
  ! -name 'docs-site' \
  ! -name 'scripts' \
  -exec cp -R {} "$OUT_DIR/" \;

# Build Docusaurus and mount it under /talon/docs/.
cd "$DOCS_DIR"
npm install
npm run build

mkdir -p "$OUT_DIR/talon/docs"
cp -R "$DOCS_DIR/build/." "$OUT_DIR/talon/docs/"

# Inject Plausible into the final static artifact so both the marketing pages
# and generated Docusaurus docs are tracked consistently. Set
# PLAUSIBLE_ENABLED="false" to disable in non-production builds, or override
# PLAUSIBLE_SCRIPT_SRC if the Plausible script changes later.
if [ "$PLAUSIBLE_ENABLED" = "true" ]; then
  OUT_DIR="$OUT_DIR" PLAUSIBLE_SCRIPT_SRC="$PLAUSIBLE_SCRIPT_SRC" node <<'NODE'
const fs = require('fs');
const path = require('path');

const outDir = process.env.OUT_DIR;
const scriptSrc = process.env.PLAUSIBLE_SCRIPT_SRC;
const marker = 'data-talon-analytics="plausible"';
const snippet = `  <!-- Privacy-friendly analytics by Plausible -->
  <script async src="${scriptSrc}" ${marker}></script>
  <script>
    window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
    plausible.init();

    document.addEventListener('click', function(event) {
      var link = event.target && event.target.closest ? event.target.closest('a') : null;
      if (!link) return;

      var href = link.getAttribute('href') || '';
      var eventName = null;

      if (href.indexOf('/quickstart-demo/') !== -1) eventName = 'Quickstart Demo Click';
      else if (href.indexOf('/sample-auditor-pack/') !== -1 || href.indexOf('/ai-governance-evidence-store/') !== -1) eventName = 'Evidence Click';
      else if (href.indexOf('/resources/eu-ai-governance-runtime-checklist/') !== -1) eventName = 'Checklist Click';
      else if (href.indexOf('github.com/dativo-io/talon') !== -1) eventName = 'GitHub Click';
      else if (href.indexOf('/talon/docs/') !== -1) eventName = 'Docs Click';

      if (eventName) window.plausible(eventName);
    });
  </script>
`;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

    const html = fs.readFileSync(fullPath, 'utf8');
    if (html.includes(marker)) continue;
    if (!/<\/head>/i.test(html)) continue;

    fs.writeFileSync(fullPath, html.replace(/<\/head>/i, `${snippet}</head>`));
  }
}

walk(outDir);
NODE
fi

echo "Built site into $OUT_DIR"