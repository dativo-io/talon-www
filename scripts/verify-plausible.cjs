#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2];
const scriptSrc = process.argv[3];
const marker = 'data-talon-analytics="plausible"';

if (!outDir || !scriptSrc) {
  console.error('Usage: verify-plausible.cjs <out-dir> <plausible-script-src>');
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
    if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }
}

walk(outDir);

const missing = htmlFiles.filter((file) => {
  const html = fs.readFileSync(file, 'utf8');
  return !html.includes(scriptSrc) || !html.includes(marker) || !html.includes('plausible.init()');
});

if (missing.length > 0) {
  console.error('Plausible analytics check failed. Missing script on:');
  for (const file of missing) {
    console.error(`- ${path.relative(outDir, file)}`);
  }
  process.exit(1);
}

console.log(`Plausible analytics verified on ${htmlFiles.length} built HTML pages.`);
