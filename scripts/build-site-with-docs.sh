#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs-site"
OUT_DIR="$ROOT_DIR/dist"
PLAUSIBLE_DOMAIN="${PLAUSIBLE_DOMAIN:-dativo.io}"
PLAUSIBLE_SCRIPT_SRC="${PLAUSIBLE_SCRIPT_SRC:-https://plausible.io/js/script.js}"

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
# PLAUSIBLE_DOMAIN="" to disable in non-production builds, or override
# PLAUSIBLE_SCRIPT_SRC for a self-hosted/proxied Plausible script.
if [ -n "$PLAUSIBLE_DOMAIN" ]; then
  OUT_DIR="$OUT_DIR" PLAUSIBLE_DOMAIN="$PLAUSIBLE_DOMAIN" PLAUSIBLE_SCRIPT_SRC="$PLAUSIBLE_SCRIPT_SRC" node <<'NODE'
const fs = require('fs');
const path = require('path');

const outDir = process.env.OUT_DIR;
const domain = process.env.PLAUSIBLE_DOMAIN;
const scriptSrc = process.env.PLAUSIBLE_SCRIPT_SRC;
const snippet = `  <script defer data-domain="${domain}" src="${scriptSrc}"></script>\n`;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

    const html = fs.readFileSync(fullPath, 'utf8');
    if (html.includes(`data-domain="${domain}"`) && html.includes(scriptSrc)) continue;
    if (!/<\/head>/i.test(html)) continue;

    fs.writeFileSync(fullPath, html.replace(/<\/head>/i, `${snippet}</head>`));
  }
}

walk(outDir);
NODE
fi

echo "Built site into $OUT_DIR"