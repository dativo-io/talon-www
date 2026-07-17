const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || '.');
const required = [
  'public/assets/talon-mark.svg',
  'public/assets/talon-mark-white.svg',
  'public/assets/talon-icon.svg',
  'docs-site/static/img/talon-mark.svg',
  'docs-site/static/img/favicon.svg',
];

for (const asset of required) {
  const full = path.join(root, asset);
  if (!fs.existsSync(full) || fs.statSync(full).size === 0) {
    throw new Error(`Missing or empty Talon brand asset: ${asset}`);
  }
}

const normalizer = fs.readFileSync(path.join(root, 'scripts/normalize-site-nav.cjs'), 'utf8');
if (!normalizer.includes('/public/assets/talon-icon.svg?v=2')) {
  throw new Error('Marketing navigation is not using the self-contained Talon icon.');
}

console.log('Verified Talon brand assets and navbar icon.');
