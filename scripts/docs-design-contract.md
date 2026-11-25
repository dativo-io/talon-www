# Documentation 2.0 / Step 3 — Reading and search

## Design

Use the Quiet Confidence palette (logo navy #081E58, canvas #F6F5F0, ink #14213A, accent #E4EBF8, muted #4F5D73, white reading surface, navy code). Retain native Docusaurus navigation, breadcrumbs, table of contents, pagination, dark mode, accessible sidebar and copy controls. The sidebar is 280px on desktop, technical content remains readable with an 860px upper bound, tables and code scroll internally, inline identifiers wrap, and keyboard focus is visible. Use equivalent dark theme tokens, respect the system preference, and keep the release banner and pilot route. The homepage content, sidebar structure and all routes are unchanged in this step; Step 4 revises information architecture.

## Search

A static same-origin index is generated from published Docusaurus articles after compilation. It includes canonical document title, headings and article text, not global navigation, scripts or buttons. It is fetched only on opening search, with a 5 MiB uncompressed build limit and exact canonical route coverage enforced in the final artifact. No external service, API key, raw search query telemetry or new dependency. Rank exact titles and headings ahead of body matches; all query terms must occur. Result snippets are plain text and all links are canonical docs routes. This is page-level retrieval, not semantic/AI search, fuzzy matching or heading deep links. Search supports button activation, Cmd/Ctrl+K, modal focus, arrow-key result selection, Escape, no-result state and retry after fetch failure.

## Acceptance

Native unit tests cover article extraction, exact code tokens, ranking, exclusions and complete final-route coverage. Browser QA checks six docs routes at 1440/390 widths, search on both devices including query privacy, dark theme, screenshots and axe. Lighthouse includes the docs overview. Existing release, screenshot, link, SEO and analytics gates remain. Real production measurements and manual design review remain separate. No design framework or documentation service migration.

Local full build: bash scripts/build-site-with-docs.sh. Direct Docusaurus build needs the approved clean Talon checkout and generates the index at docs-site/build/search-index.json; the dev server alone does not run the index generation.
