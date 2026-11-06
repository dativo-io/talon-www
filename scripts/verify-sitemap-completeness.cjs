#!/usr/bin/env node
// Production build validation: the checked-in sitemap is not the deployed sitemap.
// Both production maps are generated from the complete dist/ output after Docusaurus builds.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const origin = (process.env.SITE_URL || 'https://dativo.io').replace(/\/$/, '');
const errors = [];

function htmlRoutes(dir, prefix = '') {
  const routes = [];
  if (!fs.existsSync(dir)) return routes;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) routes.push(...htmlRoutes(full, `${prefix}${entry.name}/`));
    else if (entry.isFile() && entry.name === 'index.html') routes.push('/' + prefix);
  }
  return routes;
}

function readSitemap(file) {
  if (!fs.existsSync(file)) { errors.push('Missing ' + file); return []; }
  const xml = fs.readFileSync(file, 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  if (urls.length !== new Set(urls).size) errors.push('Duplicate URL in ' + file);
  if (urls.some(url => !url.startsWith(origin + '/'))) errors.push('Foreign origin in ' + file);
  if (xml.includes('<lastmod>')) errors.push('Unverified lastmod in ' + file);
  return urls;
}

const rootMap = new Set(readSitemap(path.join(root, 'sitemap.xml')));
const docsMap = new Set(readSitemap(path.join(root, 'talon/docs/sitemap.xml')));
const marketing = htmlRoutes(root).filter(route => !route.startsWith('/talon/docs/') && !route.startsWith('/docs/talon/'));
const docs = htmlRoutes(path.join(root, 'talon/docs'), 'talon/docs/');

for (const route of marketing) {
  const file = path.join(root, route.slice(1), 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
  const expected = origin + route;
  if (!rootMap.has(expected)) errors.push('Marketing page omitted from deployed sitemap: ' + route);
  const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
  if (canonical !== expected) errors.push('Missing/noncanonical marketing URL: ' + route);
}
for (const route of docs) {
  if (!docsMap.has(origin + route)) errors.push('Docs page omitted from docs sitemap: ' + route);
}
const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
for (const map of ['/sitemap.xml', '/talon/docs/sitemap.xml']) {
  if (!robots.includes('Sitemap: ' + origin + map)) errors.push('Missing robots declaration: ' + map);
}
if (errors.length) {
  for (const err of errors) console.error('SITEMAP FAIL: ' + err);
  process.exit(1);
}
console.log(`SITEMAP PASS: ${marketing.length} marketing routes; ${docs.length} documentation routes; generated production maps verified.`);
