#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2];
const siteUrl = (process.argv[3] || 'https://dativo.io').replace(/\/$/, '');

if (!outDir) {
  console.error('Usage: generate-seo-files.cjs <out-dir> [site-url]');
  process.exit(2);
}

const urls = new Set();

function toUrl(filePath) {
  const relative = path.relative(outDir, filePath).replace(/\\/g, '/');
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

  if (route === 'docs/talon/') return null;
  return `${siteUrl}/${route}`;
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      const url = toUrl(fullPath);
      if (url) urls.add(url);
    }
  }
}

walk(outDir);

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(urls).sort().map((url) => `  <url><loc>${url}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(outDir, 'robots.txt'), robots);

console.log(`Generated sitemap.xml with ${urls.size} URLs and robots.txt.`);
