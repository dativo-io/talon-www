#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const {indexable} = require('./site-inventory.cjs');
const root = path.resolve(process.argv[2] || 'dist');
const origin = (process.env.SITE_URL || 'https://dativo.io').replace(/\/$/, '');
const errors = [];
const {indexed,excluded} = indexable(root,origin);
function readMap(name) {
  const xml = fs.readFileSync(path.join(root,name),'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  if (urls.length !== new Set(urls).size) errors.push(name + ': duplicate URL');
  if (xml.includes('<lastmod>')) errors.push(name + ': unverified lastmod');
  return new Set(urls);
}
const rootMap = readMap('sitemap.xml');
const docsMap = readMap('talon/docs/sitemap.xml');
const expected = new Set([...indexed.keys()].map(route=>origin+route));
const expectedDocs = new Set([...expected].filter(url=>url.startsWith(origin+'/talon/docs/')));
for (const [actual,wanted,label] of [[rootMap,expected,'root'],[docsMap,expectedDocs,'docs']]) {
  for (const url of wanted) if (!actual.has(url)) errors.push(label + ': missing ' + url);
  for (const url of actual) if (!wanted.has(url)) errors.push(label + ': non-indexable, unknown or wrong-scope URL ' + url);
}
for (const [route,page] of indexed) {
  if (page.canonical.length !== 1 || page.canonical[0] !== origin+route) errors.push('Missing or invalid canonical: ' + route);
}
const robots = fs.readFileSync(path.join(root,'robots.txt'),'utf8');
for (const map of ['/sitemap.xml','/talon/docs/sitemap.xml']) if (!robots.includes('Sitemap: '+origin+map)) errors.push('Missing robots declaration '+map);
if (errors.length) { for (const e of errors) console.error('SITEMAP FAIL: '+e); process.exit(1); }
console.log('SITEMAP PASS: exact canonical URL sets; '+expected.size+' root, '+expectedDocs.size+' docs, '+excluded.size+' excluded aliases.');
