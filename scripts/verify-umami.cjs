#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2];
const scriptSrc = process.argv[3];
const websiteId = process.argv[4];
const domains = process.argv[5] || '';
const marker = 'data-talon-analytics="umami"';

if (!outDir || !scriptSrc || !websiteId) {
  console.error('Usage: verify-umami.cjs <out-dir> <umami-script-src> <website-id> [domains]');
  process.exit(2);
}

const htmlFiles = [];
const failures = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(fullPath);
  }
}

function count(haystack, needle) {
  if (!needle) return 0;
  let total = 0;
  let cursor = 0;
  while ((cursor = haystack.indexOf(needle, cursor)) !== -1) {
    total += 1;
    cursor += needle.length;
  }
  return total;
}

walk(outDir);

if (htmlFiles.length === 0) {
  console.error('Umami analytics check failed: no built HTML pages were found.');
  process.exit(1);
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(outDir, file);

  const markerCount = count(html, marker);
  const websiteIdCount = count(html, `data-website-id="${websiteId}"`);
  const scriptSrcCount = count(html, `src="${scriptSrc}"`);

  if (markerCount !== 1) failures.push(`${relative}: expected exactly one Umami marker, found ${markerCount}`);
  if (websiteIdCount !== 1) failures.push(`${relative}: expected exactly one configured website ID, found ${websiteIdCount}`);
  if (scriptSrcCount !== 1) failures.push(`${relative}: expected exactly one configured Umami script source, found ${scriptSrcCount}`);

  const trackerMatch = html.match(/<script\b[^>]*data-talon-analytics="umami"[^>]*><\/script>/i);
  if (!trackerMatch) {
    failures.push(`${relative}: Umami tracker is not a valid script element`);
  } else {
    const tracker = trackerMatch[0];
    if (!/\bdefer\b/i.test(tracker)) failures.push(`${relative}: Umami tracker is missing defer`);
    if (!tracker.includes(`src="${scriptSrc}"`)) failures.push(`${relative}: Umami tracker has the wrong script source`);
    if (!tracker.includes(`data-website-id="${websiteId}"`)) failures.push(`${relative}: Umami tracker has the wrong website ID`);
    if (domains && !tracker.includes(`data-domains="${domains}"`)) failures.push(`${relative}: Umami tracker has the wrong production domain allowlist`);
  }

  if (!html.includes('window.umami.track')) {
    failures.push(`${relative}: Talon buyer-intent event helper is missing`);
  }

  const plausibleSignals = [
    'data-talon-analytics="plausible"',
    'plausible.io/js/',
    'window.plausible',
    'plausible.init('
  ];
  for (const signal of plausibleSignals) {
    if (html.includes(signal)) failures.push(`${relative}: residual Plausible analytics code found (${signal})`);
  }
}

if (failures.length > 0) {
  console.error('Analytics verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Umami analytics verified on ${htmlFiles.length} built HTML pages; no Plausible tracker remains.`);
