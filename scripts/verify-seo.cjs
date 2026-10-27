#!/usr/bin/env node
// Protect high-intent landing pages from SEO regressions during publication.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.argv[2] || 'dist');
const origin = (process.env.SITE_URL || 'https://dativo.io').replace(/\/$/, '');
const pages = ['/', '/ai-action-control/', '/comparisons/', '/mcp-tool-governance/', '/ai-agent-audit-trail/', '/comparisons/talon-vs-litellm/'];
const guides = ['/mcp-tool-governance/', '/ai-agent-audit-trail/', '/comparisons/talon-vs-litellm/'];
const errors = [];
function requirePage(route) {
  const file = path.join(root, route === '/' ? 'index.html' : route.slice(1) + 'index.html');
  if (!fs.existsSync(file)) { errors.push('Missing page ' + route); return ''; }
  return fs.readFileSync(file, 'utf8');
}
function metaTags(html, key, value) {
  return [...html.matchAll(/<meta\s+[^>]*>/gi)].map(x => x[0]).filter(tag => tag.includes(key + '="' + value + '"'));
}
function content(tag) {
  const match = tag.match(/\bcontent="([^"]*)"/i);
  return match ? match[1] : '';
}
const built = new Map();
for (const route of pages) {
  const html = requirePage(route);
  if (!html) continue;
  built.set(route, html);
  const ts = [...html.matchAll(/<title>([^<]+)<\/title>/gi)].map(x => x[1]);
  if (ts.length !== 1) errors.push(route + ': expected one title');
  const canon = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"[^>]*>/gi)].map(x => x[1]);
  if (canon.length !== 1 || canon[0] !== origin + route) errors.push(route + ': missing or wrong canonical');
  if ((html.match(/<h1\b/gi) || []).length !== 1) errors.push(route + ': expected one H1');
  if (/name="robots"[^>]*noindex/i.test(html)) errors.push(route + ': noindex on priority page');
  for (const [key,value] of [['name','description'],['property','og:title'],['property','og:description'],['name','twitter:title'],['name','twitter:description']]) {
    const found = metaTags(html,key,value);
    if (found.length !== 1 || !content(found[0] || '')) errors.push(route + ': expected one ' + value);
    if ((value === 'og:title' || value === 'twitter:title') && found.length === 1 && ts.length === 1 && content(found[0]) !== ts[0]) errors.push(route + ': social title mismatch');
  }
  if (guides.includes(route)) {
    const chunks = [...html.matchAll(/<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/gi)];
    if (chunks.length !== 1) errors.push(route + ': expected one JSON-LD block');
    else {
      try {
        const graph = JSON.parse(chunks[0][1])['@graph'] || [];
        if (!graph.some(x => x['@type'] === 'TechArticle' && x.mainEntityOfPage === origin + route)) errors.push(route + ': missing TechArticle');
        if (!graph.some(x => x['@type'] === 'BreadcrumbList')) errors.push(route + ': missing breadcrumbs');
      } catch (e) { errors.push(route + ': invalid structured data: ' + e.message); }
    }
  }
  for (const match of html.matchAll(/\bhref="(\/[^"]+)"/g)) {
    const link = match[1].split(/[?#]/)[0];
    if (!link.endsWith('/')) continue;
    if (!fs.existsSync(path.join(root, link.slice(1), 'index.html')) && !fs.existsSync(path.join(root, link.slice(1)))) errors.push(route + ': unresolved link ' + link);
  }
}
const home = built.get('/') || '';
if (!home.includes('Control consequential AI actions. Prove what happened.')) errors.push('Action-first headline lost');
for (const route of guides) if (!home.includes('href="' + route + '"')) errors.push('Orphan buyer guide ' + route);
const sitemap = path.join(root, 'sitemap.xml');
if (!fs.existsSync(sitemap)) errors.push('Missing sitemap');
else {
  const xml = fs.readFileSync(sitemap, 'utf8');
  for (const route of pages) if (!xml.includes('<loc>' + origin + route + '</loc>')) errors.push('Sitemap missing ' + route);
  if (xml.includes('<lastmod>')) errors.push('Sitemap contains invented deployment timestamps');
}
const robots = path.join(root, 'robots.txt');
if (!fs.existsSync(robots) || !fs.readFileSync(robots, 'utf8').includes('Sitemap: ' + origin + '/sitemap.xml')) errors.push('Missing canonical robots sitemap');
if (errors.length) { errors.forEach(x => console.error('SEO FAIL: ' + x)); process.exit(1); }
console.log('SEO PASS: canonical, snippets, guides, JSON-LD, links, and sitemap');
