#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs-site"
OUT_DIR="$ROOT_DIR/dist"
PLAUSIBLE_ENABLED="${PLAUSIBLE_ENABLED:-true}"
PLAUSIBLE_SCRIPT_SRC="${PLAUSIBLE_SCRIPT_SRC:-https://plausible.io/js/pa-XmB1x7I_rYllpvVLPcVfs.js}"
SITE_URL="${SITE_URL:-https://dativo.io}"
TALON_DOCS_REPO_URL="${TALON_DOCS_REPO_URL:-https://github.com/dativo-io/talon.git}"
TALON_DOCS_REF="${TALON_DOCS_REF:-main}"
TEMP_TALON_DIR=""

cleanup() {
  if [ -n "$TEMP_TALON_DIR" ] && [ -d "$TEMP_TALON_DIR" ]; then
    rm -rf "$TEMP_TALON_DIR"
  fi
}
trap cleanup EXIT

prepare_talon_checkout() {
  if [ -n "${TALON_REPO_PATH:-}" ]; then
    if [ ! -d "$TALON_REPO_PATH" ]; then
      echo "TALON_REPO_PATH does not exist: $TALON_REPO_PATH" >&2
      exit 1
    fi
    echo "Using Talon docs source from TALON_REPO_PATH=$TALON_REPO_PATH"
    return
  fi

  local sibling_checkout="$ROOT_DIR/../talon"
  if [ -d "$sibling_checkout" ]; then
    export TALON_REPO_PATH="$sibling_checkout"
    echo "Using sibling Talon checkout at $TALON_REPO_PATH"
    return
  fi

  TEMP_TALON_DIR="$(mktemp -d)"
  local checkout="$TEMP_TALON_DIR/talon"

  echo "Fetching Talon docs source once from $TALON_DOCS_REPO_URL ($TALON_DOCS_REF)..."
  for attempt in 1 2 3 4; do
    rm -rf "$checkout"
    if git clone --depth 1 --single-branch --branch "$TALON_DOCS_REF" "$TALON_DOCS_REPO_URL" "$checkout"; then
      export TALON_REPO_PATH="$checkout"
      echo "Using Talon docs source from $TALON_REPO_PATH"
      return
    fi

    if [ "$attempt" -lt 4 ]; then
      local delay=$((attempt * 5))
      echo "Talon checkout attempt $attempt failed; retrying in ${delay}s..." >&2
      sleep "$delay"
    fi
  done

  echo "Failed to fetch Talon docs source after 4 attempts." >&2
  exit 1
}

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

# Fetch the Talon source once. The docs sync script reads every mapped source
# file from this local checkout instead of making dozens of anonymous requests
# to raw.githubusercontent.com, which can be rate-limited during production builds.
prepare_talon_checkout

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