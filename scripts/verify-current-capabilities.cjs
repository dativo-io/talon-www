#!/usr/bin/env node
// Fail publication if October 2026 feature docs vanish or retired public claims reappear.
// Scope intentionally limited to the current flagship routes; historical changelog is not rewritten.
const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2];
if (!root || !fs.existsSync(root)) { console.error('Usage: verify-current-capabilities.cjs <dist-dir>'); process.exit(1); }
const required = [
  'talon/docs/action-gateway-proof/index.html',
  'talon/docs/mcp-governance-extension/index.html',
  'talon/docs/mcp-2026-migration/index.html',
  'talon/docs/openshell/index.html',
];
let failures = [];
for (const rel of required) { if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing public route: ${rel}`); }
const pages = [
  ['ai-action-control/index.html', [/Preview gate #458/i]],
  ['llm-governance-gateway/index.html', [/does not yet inspect provider responses/i]],
  ['talon/docs/index.html', [/Response scanning and Talon-side retry\/fallback are not available on this path/i, /start in shadow mode/i]],
];
for (const [rel, expressions] of pages) {
  const target = path.join(root, rel);
  if (!fs.existsSync(target)) { failures.push(`Missing current page: ${rel}`); continue; }
  const body = fs.readFileSync(target, 'utf8');
  for (const expression of expressions) if (expression.test(body)) failures.push(`Retired wording ${expression} in ${rel}`);
}
if (failures.length) { for (const failure of failures) console.error(`FAIL: ${failure}`); process.exit(1); }
console.log('PASS: current action/MCP/OpenShell publication routes and claims');
