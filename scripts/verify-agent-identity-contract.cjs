#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const excludedDirs = new Set(['.git', 'dist', 'node_modules', 'docs-site']);
const checkedFiles = [];

function collectMarketingHtml(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    if (excludedDirs.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectMarketingHtml(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      checkedFiles.push(fullPath);
    }
  }
}

collectMarketingHtml(root);

for (const relativePath of [
  'docs-site/docs/index.md',
  'docs-site/docs/coding-agents-demo.md',
  'docs-site/src/source-map.cjs',
  'docs-site/sidebars.js',
  'docs-site/docusaurus.config.js',
  'docs-site/scripts/validate-docs-contract.mjs',
  'docs-site/scripts/sync-talon-docs.mjs',
  'scripts/build-site-with-docs.sh',
]) {
  checkedFiles.push(path.join(root, relativePath));
}

const banned = [
  {label: 'legacy caller identity noun', pattern: /\bcallers?\b/gi},
  {label: 'legacy tenant_key field', pattern: /tenant_key/gi},
  {label: 'legacy policy_overrides block', pattern: /policy_overrides/gi},
  {label: 'legacy gateway.callers config', pattern: /gateway\.callers/gi},
  {label: 'legacy require_caller_id config', pattern: /require_caller_id/gi},
  {label: 'legacy per-caller rate key', pattern: /per_caller_requests_per_min/gi},
  {label: 'legacy caller CLI flag', pattern: /--caller\b/gi},
  {label: 'legacy caller_id field', pattern: /caller_id/gi},
  {label: 'retired cost guide route', pattern: /cost-governance-by-caller/gi},
  {label: 'retired gateway policy key', pattern: /\bdefault_policy\s*:/gi},
];

const failures = [];

for (const filePath of [...new Set(checkedFiles)].sort()) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${path.relative(root, filePath)}: required contract file is missing`);
    continue;
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const lines = source.split('\n');
  for (const {label, pattern} of banned) {
    pattern.lastIndex = 0;
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      pattern.lastIndex = 0;
      if (pattern.test(lines[lineIndex])) {
        failures.push(
          `${path.relative(root, filePath)}:${lineIndex + 1}: ${label}: ${lines[lineIndex].trim()}`,
        );
      }
    }
  }
}

const redirectsPath = path.join(root, '_redirects');
const redirects = fs.readFileSync(redirectsPath, 'utf8');
const expectedRedirect = '/talon/docs/cost-governance-by-caller/ /talon/docs/cost-governance-by-agent/ 301';
if (!redirects.includes(expectedRedirect)) {
  failures.push(`_redirects: missing historical cost-guide redirect: ${expectedRedirect}`);
}

if (failures.length > 0) {
  console.error('Agent identity publication contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Verified agent-first identity language across ${new Set(checkedFiles).size} owned site files.`);