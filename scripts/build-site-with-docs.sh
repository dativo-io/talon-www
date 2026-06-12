#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs-site"
OUT_DIR="$ROOT_DIR/dist"
PLAUSIBLE_ENABLED="${PLAUSIBLE_ENABLED:-true}"
PLAUSIBLE_SCRIPT_SRC="${PLAUSIBLE_SCRIPT_SRC:-https://plausible.io/js/pa-XmB1x7I_rYllpvVLPcVfs.js}"
SITE_URL="${SITE_URL:-https://dativo.io}"

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

# Generate the root SEO files after all pages exist.
node "$ROOT_DIR/scripts/generate-seo-files.cjs" "$OUT_DIR" "$SITE_URL"

# Inject and verify Plausible in the final static artifact so both the marketing
# pages and generated Docusaurus docs are tracked consistently.
if [ "$PLAUSIBLE_ENABLED" = "true" ]; then
  node "$ROOT_DIR/scripts/inject-plausible.cjs" "$OUT_DIR" "$PLAUSIBLE_SCRIPT_SRC"
  node "$ROOT_DIR/scripts/verify-plausible.cjs" "$OUT_DIR" "$PLAUSIBLE_SCRIPT_SRC"
fi

echo "Built site into $OUT_DIR"