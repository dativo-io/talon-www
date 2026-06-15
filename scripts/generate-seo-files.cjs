#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2];
const siteUrl = (process.argv[3] || 'https://dativo.io').replace(/\/$/, '');

if (!outDir) {
  console.error('Usage: generate-seo-files.cjs <out-dir> [site-url]');
  process.exit(2);
}

function routeFromHtml(filePath, rootDir, prefix = '') {
  const relative = path.relative(rootDir, filePath).replace(/\\/g, '/');
  if (!relative.endsWith('.html')) return null;
  if (relative === '404.html') return null;

  let route = relative;
  if (route.endsWith('/index.html')) {
    route = route.slice(0, -'index.html'.length);
  } else if (route === 'index.html') {
    route = '';
  } else {
    route = route.slice(0, -'.html'.length) + '/';
  }

  const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
  const normalizedRoute = route.replace(/^\/+/, '');
  const fullRoute = normalizedRoute
    ? [normalizedPrefix, normalizedRoute].filter(Boolean).join('/')
    : normalizedPrefix
      ? `${normalizedPrefix}/`
      : '';

  if (fullRoute === 'docs/talon/') return null;
  return `/${fullRoute}`.replace(/\/\//g, '/');
}

function walkHtmlRoutes(rootDir, prefix = '') {
  const routes = new Set();

  if (!fs.existsSync(rootDir)) return routes;

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith('.html')) {
        const route = routeFromHtml(fullPath, rootDir, prefix);
        if (route) routes.add(route);
      }
    }
  }

  walk(rootDir);
  return routes;
}

function urlForRoute(route) {
  return `${siteUrl}${route}`;
}

function writeSitemap(filePath, routes) {
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(routes)
  .sort()
  .map((route) => `  <url><loc>${urlForRoute(route)}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}
</urlset>
`;

  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, sitemap);
}

const allRoutes = walkHtmlRoutes(outDir);
const docsRoutes = walkHtmlRoutes(path.join(outDir, 'talon', 'docs'), '/talon/docs');

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
