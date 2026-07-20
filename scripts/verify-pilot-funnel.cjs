#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const requiredFiles = [
  'pilot/index.html',
  'pilot/pilot.js',
  'functions/api/pilot.js',
  'acquisition.css',
  'acquisition.js',
  'scripts/inject-plausible.cjs',
  'docs-site/docusaurus.config.js',
];
const failures = [];

for (const relative of requiredFiles) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full) || fs.statSync(full).size === 0) {
    failures.push(`${relative}: missing or empty`);
  }
}

const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
if (!read('pilot/index.html').includes('action="/api/pilot"')) failures.push('pilot/index.html: private endpoint missing');
if (!read('pilot/index.html').includes('name="consent"')) failures.push('pilot/index.html: consent control missing');
if (!read('functions/api/pilot.js').includes('RESEND_API_KEY')) failures.push('functions/api/pilot.js: Resend configuration missing');
if (!read('acquisition.js').includes('Pilot one AI use case')) failures.push('acquisition.js: homepage pilot CTA missing');
if (!read('docs-site/docusaurus.config.js').includes("href: '/pilot/'")) failures.push('docs-site/docusaurus.config.js: docs pilot CTA missing');

const analytics = read('scripts/inject-plausible.cjs');
for (const event of [
  'Hero Demo Play',
  'Pilot Click',
  'Pilot Submit',
  'Product Demo Click',
  'Quickstart Demo Click',
  'Add Existing App Click',
  'Integration Selected',
  'GitHub Click',
  'Docs Click',
]) {
  if (!analytics.includes(event) && !read('pilot/pilot.js').includes(event)) {
    failures.push(`analytics: ${event} missing`);
  }
}

if (failures.length > 0) {
  console.error('Pilot acquisition contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Verified private pilot acquisition path, docs CTA, and funnel analytics.');
