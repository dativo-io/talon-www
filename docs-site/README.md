# Dativo Talon docs site

This directory contains the Docusaurus documentation site published under:

```text
https://dativo.io/talon/docs/
```

The Talon product repository remains the source of truth for documentation markdown. This site is the canonical public documentation surface for indexing, navigation, and customer evaluation.

## Local development

```bash
cd docs-site
npm install
npm run sync:talon-docs
npm run validate:docs-contract
npm run start
```

By default, the sync script reads from a sibling `../talon` checkout when present. If not present, it fetches markdown from `https://raw.githubusercontent.com/dativo-io/talon/main`.

To use a specific local Talon checkout:

```bash
TALON_REPO_PATH=/path/to/talon npm run sync:talon-docs
```

## Production build

From the repository root:

```bash
bash scripts/build-site-with-docs.sh
```

This copies the existing static marketing site into `dist/`, validates the cross-repository docs contract, builds Docusaurus, and mounts the generated docs under:

```text
dist/talon/docs/
```

## Production source contract

Production intentionally follows the configured Talon docs ref:

```text
TALON_DOCS_REF=main
```

`main` is the default because the public docs should follow the current open-source product documentation. A different branch or tag can be supplied through `TALON_DOCS_REF` for a deliberate pinned build.

Following a mutable upstream branch creates a real publication contract:

- every path in `docs-site/src/source-map.cjs` must exist in the selected Talon checkout;
- a Talon docs rename or deletion that affects a mapped page requires a matching `talon-www` source-map, navigation, and redirect update;
- the sidebar may reference only synced docs or local docs that exist in `docs-site/docs/`;
- Docusaurus keeps strict broken-anchor validation enabled.

The production build runs a source-map preflight **before `npm install` and Docusaurus compilation**. It reports all missing mapped upstream files together instead of failing on the first one. The docs build then validates the complete publication contract again after sync.

Run the same contract check directly with:

```bash
cd docs-site
TALON_REPO_PATH=/path/to/talon node ./scripts/validate-docs-contract.mjs --sources-only
npm run validate:docs-contract
```

## Cloudflare Pages settings

Use these settings for the combined marketing site + docs deployment:

```text
Build command: bash scripts/build-site-with-docs.sh
Build output directory: dist
Root directory: /
```

## Source mapping

The source-to-published-doc mapping lives in:

```text
docs-site/src/source-map.cjs
```

Add docs there when you want another Talon markdown file to be synced and published. Do not copy upstream Talon markdown into a second local version merely to change navigation or positioning; change the source map, sidebar, landing page, or upstream source as appropriate.
