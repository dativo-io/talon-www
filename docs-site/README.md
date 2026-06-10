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

This copies the existing static marketing site into `dist/`, builds Docusaurus, and mounts the generated docs under:

```text
dist/talon/docs/
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

Add docs there when you want another Talon markdown file to be synced and published.
