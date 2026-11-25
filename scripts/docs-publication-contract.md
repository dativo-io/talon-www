# Stable product publication contract

## Sources and ownership

- `docs-publication.json` selects one stable Talon release tag and exact commit. No default to main, sibling checkout or raw remote fallback. All mapped markdown, links rewritten from relative source paths, console screenshots and linked source assets resolve from the approved checkout. Existing explicit historical or main links in source text are not automatically rewritten; audit those individually before calling a guide version-verified.
- `edition-capabilities.json` owns the 14 edition rows (five shared and nine Enterprise-scoped at introduction). Core claims cite release documents; Enterprise is a commercial offering with scoped integration, support and deployment commitments, not a blanket roadmap or GA claim.
- `edition-comparison.cjs --write` regenerates both checked-in tables; --check fails on divergence, so even static source previews are consistent. Review generated changes together.
- `docs-site/src/source-map.cjs` maps canonical technical docs to published routes. Website-owned docs remain in talon-www; release mapping does not automatically verify their prose. `/talon/docs/publication.json` records the selected release, canonical mapped source paths and explicitly applied corrections. The docs banner shows the release. Contributor edit links intentionally target main, not the release tag.
- The screenshot lock continues to check actual bytes against reviewed assets, now against the selected release. No runtime code is changed.

## Release promotion

1. Verify a published stable release, its exact tag commit, artifacts, changelog, limitations and supported profiles. Update the release manifest and affected edition evidence references in a website PR.
2. Review new or changed mapped paths, source links, screenshots, and any legacy routes. Refresh screenshot lock only after reviewing actual images.
3. Remove errata already incorporated into the new tag; re-review/rebase remaining errata against the exact new blob, with upstream review and corrected blob reference. Never modify a tag. Never apply a correction to runtime code, config files outside mapped docs or assets.
4. Run edition generation/check, manifest tests, complete native build and strict link audit, browser and analytics gates. Execute critical onboarding examples against the selected binary separately. CI must fail for unapproved commit, dirty checkout, missing source, invalid patch or inconsistent table.
5. Merge on owner approval; verify Cloudflare production and publication.json. Website CI is intentionally not a moving-main freshness check: release promotion is explicit. No automatic release adoption or new background workflow is introduced.

## v1.17.0 initial scope

The immutable release commit is 410f1015a621326e722ebfb0fb9e84adf2a6a6dc. Reviewed upstream PR #609 (merged commit 840a70acc862b41a98ba67f86eba6bd2bff9ce3d) supplies three mapped guide errata: cost governance, MCP migration, and n8n refund approvals. Exact original and corrected Git blob IDs and line hunks are recorded. README changes remain in the product repository; README is not mapped. The errata mechanism verifies bytes and review references, not the semantic truth of arbitrary claims. No new Enterprise capability is certified by this manifest. A complete claim-by-claim and executable example audit remains a separate acceptance task.

## Local usage

Run `bash scripts/build-site-with-docs.sh` from the website checkout; it fetches the selected tag once and verifies its commit. An explicit TALON_REPO_PATH may be used only for a clean checkout of that same release. To start Docusaurus directly, first synchronize with that explicit checkout (npm run sync:talon-docs). Do not set TALON_DOCS_REF to main in Cloudflare or CI; remove any legacy override, or set it to the approved tag/commit. There is no preview channel in this step; it must be deliberately introduced later and never replace stable docs.
