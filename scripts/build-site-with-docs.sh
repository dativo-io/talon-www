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

node "$ROOT_DIR/scripts/verify-talon-brand-assets.cjs" "$ROOT_DIR"
node "$ROOT_DIR/scripts/verify-pilot-funnel.cjs" "$ROOT_DIR"

# Cloudflare Pages Functions remain at repository root and must not be exposed
# as static source files inside dist/.
find "$ROOT_DIR" -mindepth 1 -maxdepth 1 \
  ! -name '.git' \
  ! -name 'dist' \
  ! -name 'docs-site' \
  ! -name 'functions' \
  ! -name 'scripts' \
  -exec cp -R {} "$OUT_DIR/" \;

node "$ROOT_DIR/scripts/normalize-site-nav.cjs" "$OUT_DIR"
node "$ROOT_DIR/scripts/verify-agent-identity-contract.cjs" "$ROOT_DIR"
prepare_talon_checkout
node "$ROOT_DIR/scripts/publish-talon-hero.cjs" "$TALON_REPO_PATH" "$OUT_DIR"
HERO_ASSET="$(find "$OUT_DIR/public/assets" -maxdepth 1 -type f -name 'talon_hero-*.gif' -size +0c -print -quit)"
if [ -z "$HERO_ASSET" ]; then
  echo "Production build did not publish a non-empty Talon hero asset." >&2
  exit 1
fi
if grep -q 'data-demo-src="https://raw.githubusercontent.com/dativo-io/talon/' "$OUT_DIR/index.html"; then
  echo "Production homepage still hotlinks the Talon hero asset." >&2
  exit 1
fi

node "$DOCS_DIR/scripts/validate-docs-contract.mjs" --sources-only
cd "$DOCS_DIR"
npm install
npm run build
mkdir -p "$OUT_DIR/talon/docs"
cp -R "$DOCS_DIR/build/." "$OUT_DIR/talon/docs/"

test -f "$OUT_DIR/talon/docs/product-demo/index.html"
test -f "$OUT_DIR/talon/docs/manual-governed-session/index.html"
test -f "$OUT_DIR/talon/docs/control-plane/index.html"
test -f "$OUT_DIR/talon/docs/cost-governance-by-agent/index.html"
test -f "$OUT_DIR/talon/docs/configuration/index.html"
test -f "$OUT_DIR/talon/docs/policy-cookbook/index.html"
test -f "$OUT_DIR/talon/docs/governing-coding-agents/index.html"
test -f "$OUT_DIR/pilot/index.html"
test -f "$OUT_DIR/pilot/pilot.js"
if find "$OUT_DIR" -path '*/functions/api/pilot.js' -print -quit | grep -q .; then
  echo "Cloudflare Pages Function source leaked into the static dist artifact." >&2
  exit 1
fi

node "$ROOT_DIR/scripts/verify-internal-link-shapes.cjs" "$OUT_DIR"
node "$ROOT_DIR/scripts/generate-seo-files.cjs" "$OUT_DIR" "$SITE_URL"
if [ "$PLAUSIBLE_ENABLED" = "true" ]; then
  node "$ROOT_DIR/scripts/inject-plausible.cjs" "$OUT_DIR" "$PLAUSIBLE_SCRIPT_SRC"
  node "$ROOT_DIR/scripts/verify-plausible.cjs" "$OUT_DIR" "$PLAUSIBLE_SCRIPT_SRC"
fi

echo "Built site into $OUT_DIR"
