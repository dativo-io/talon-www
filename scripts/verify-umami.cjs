#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2];
const scriptSrc = process.argv[3];
const websiteId = process.argv[4];
const marker = 'data-talon-analytics="umami"';

if (!outDir || !scriptSrc || !websiteId) {
  console.error('Usage: verify-umami.cjs <out-dir> <umami-script-src> <website-id>');
  process.exit(2);
}

const htmlFiles = [];

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

walk(outDir);

const missing = htmlFiles.filter((file) => {
  const html = fs.readFileSync(file, 'utf8');
  return !html.includes(scriptSrc) || !html.includes(websiteId) || !html.includes(marker);
});

if (missing.length > 0) {
  console.error('Umami analytics check failed. Missing script on:');
  for (const file of missing) console.error(`- ${path.relative(outDir, file)}`);
  process.exit(1);
}

console.log(`Umami analytics verified on ${htmlFiles.length} built HTML pages.`);
