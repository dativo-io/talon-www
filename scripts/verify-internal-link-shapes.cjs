const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const bad = [];
const repoArtifactPattern = /(?:\.md|\.go|README\.md|SECURITY\.md)\/$/i;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) checkFile(full);
  }
}

function checkFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (!href.startsWith('/')) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (repoArtifactPattern.test(clean)) {
      bad.push(`${path.relative(root, file)} -> ${href}`);
    }
  }
}

walk(root);

if (bad.length) {
  console.error('Repo-shaped internal links found in built HTML:');
  for (const item of bad) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Verified: no internal web links end in repo artifact paths.');
