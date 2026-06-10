#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs-site"
OUT_DIR="$ROOT_DIR/dist"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Copy the existing static marketing site as-is.
rsync -a \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'docs-site/node_modules' \
  --exclude 'docs-site/build' \
  --exclude 'docs-site/.docusaurus' \
  --exclude 'scripts' \
  "$ROOT_DIR/" "$OUT_DIR/"

# Build Docusaurus and mount it under /talon/docs/.
cd "$DOCS_DIR"
npm ci
npm run build

mkdir -p "$OUT_DIR/talon/docs"
rsync -a "$DOCS_DIR/build/" "$OUT_DIR/talon/docs/"

echo "Built site into $OUT_DIR"
