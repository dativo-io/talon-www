#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2];
const siteUrl = (process.argv[3] || 'https://dativo.io').replace(/\/$/, '');

if (!outDir) {
  console.error('Usage: generate-seo-files.cjs <out-dir> [site-url]');
  process.exit(2);
}

const {indexable} = require('./site-inventory.cjs');
function urlForRoute(route) {
  return `${siteUrl}${route}`;
}

function writeSitemap(filePath, routes) {
  // Do not declare a fabricated lastmod: deployment time is not content-modification time.
  // Add lastmod only when authoritative per-page modification dates are available.
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(routes)
  .sort()
  .map((route) => `  <url><loc>${urlForRoute(route)}</loc></url>`)
  .join('\n')}
</urlset>
`;

  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, sitemap);
}

const {indexed,excluded} = indexable(outDir,siteUrl);
const allRoutes = new Set(indexed.keys());
const docsRoutes = new Set([...allRoutes].filter(route => route.startsWith('/talon/docs/')));
console.log('Excluded non-indexable/redirect aliases: ' + excluded.size);

writeSitemap(path.join(outDir, 'sitemap.xml'), allRoutes);
writeSitemap(path.join(outDir, 'talon', 'docs', 'sitemap.xml'), docsRoutes);

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/talon/docs/sitemap.xml
`;

fs.writeFileSync(path.join(outDir, 'robots.txt'), robots);

console.log(
  `Generated sitemap.xml with ${allRoutes.size} URLs, ` +
    `talon/docs/sitemap.xml with ${docsRoutes.size} URLs, and robots.txt.`
);
