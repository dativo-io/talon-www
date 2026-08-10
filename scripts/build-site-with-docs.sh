#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs-site"
OUT_DIR="$ROOT_DIR/dist"
UMAMI_ENABLED="${UMAMI_ENABLED:-true}"
UMAMI_SCRIPT_SRC="${UMAMI_SCRIPT_SRC:-https://cloud.umami.is/script.js}"
UMAMI_WEBSITE_ID="${UMAMI_WEBSITE_ID:-e9e60801-c09d-4f9f-8890-7b76cb6fdbcb}"
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

# Keep the canonical mark, app icon, and docs copies present and non-empty.
node "$ROOT_DIR/scripts/verify-talon-brand-assets.cjs" "$ROOT_DIR"

# Copy the existing static marketing site as-is.
# Cloudflare Workers build images do not include rsync, so use portable shell/cp.
find "$ROOT_DIR" -mindepth 1 -maxdepth 1 \
  ! -name '.git' \
  ! -name 'dist' \
  ! -name 'docs-site' \
  ! -name 'scripts' \
  -exec cp -R {} "$OUT_DIR/" \;

# Marketing pages historically carried independent hard-coded nav variants.
# Normalize every .site-nav in the built artifact from one canonical definition
# so adding or editing a page cannot silently reintroduce menu drift.
node "$ROOT_DIR/scripts/normalize-site-nav.cjs" "$OUT_DIR"

# Keep the website's locally owned copy and configuration aligned with Talon's
# shipped agent identity model. Historical routes are allowed only in _redirects.
node "$ROOT_DIR/scripts/verify-agent-identity-contract.cjs" "$ROOT_DIR"

# Fetch the Talon source once. The docs sync script and hero publisher read from
# this one checkout, keeping the homepage proof and /talon/docs on the same ref.
prepare_talon_checkout

# Publish the exact hero from the selected Talon checkout as a fingerprinted,
# same-origin asset. Source index.html keeps its pinned GitHub URL for no-build
# local previews; the production artifact never depends on raw.githubusercontent.
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

# Fail fast, before npm install and Docusaurus compilation, if talon/main changed
# a mapped docs path without the corresponding talon-www publication update.
node "$DOCS_DIR/scripts/validate-docs-contract.mjs" --sources-only

# Build Docusaurus and mount it under /talon/docs/.
cd "$DOCS_DIR"
npm install
npm run build

mkdir -p "$OUT_DIR/talon/docs"
cp -R "$DOCS_DIR/build/." "$OUT_DIR/talon/docs/"

# Keep the canonical evaluator demo, use-case guides, and the four control-plane
# journeys present in every production artifact.
test -f "$OUT_DIR/talon/docs/product-demo/index.html"
test -f "$OUT_DIR/talon/docs/github-copilot-cli-governance/index.html"
test -f "$OUT_DIR/talon/docs/manual-governed-session/index.html"
test -f "$OUT_DIR/talon/docs/control-plane/index.html"
test -f "$OUT_DIR/talon/docs/cost-governance-by-agent/index.html"
test -f "$OUT_DIR/talon/docs/configuration/index.html"
test -f "$OUT_DIR/talon/docs/policy-cookbook/index.html"
test -f "$OUT_DIR/talon/docs/governing-coding-agents/index.html"

# Prevent historical repo-relative link mistakes from becoming public web routes.
node "$ROOT_DIR/scripts/verify-internal-link-shapes.cjs" "$OUT_DIR"

# Generate the root SEO files after all pages exist.
node "$ROOT_DIR/scripts/generate-seo-files.cjs" "$OUT_DIR" "$SITE_URL"

# Umami is the sole browser analytics tracker. Inject it only after both the
# static marketing site and generated Docusaurus docs exist in the final dist,
# then verify every HTML page contains exactly one tracker and no Plausible code.
if [ "$UMAMI_ENABLED" = "true" ]; then
  node "$ROOT_DIR/scripts/inject-umami.cjs" "$OUT_DIR" "$UMAMI_SCRIPT_SRC" "$UMAMI_WEBSITE_ID"
  node "$ROOT_DIR/scripts/verify-umami.cjs" "$OUT_DIR" "$UMAMI_SCRIPT_SRC" "$UMAMI_WEBSITE_ID"
fi

echo "Built site into $OUT_DIR"
