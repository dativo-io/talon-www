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
  'talon/docs/observability/index.html',
];
let failures = [];
for (const rel of required) { if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing public route: ${rel}`); }
const pages = [
  ['ai-action-control/index.html', [/Preview gate #458/i]],
  ['comparisons/index.html', [/direct OTLP log export is shipped/i]],
  ['llm-governance-gateway/index.html', [/does not yet inspect provider responses/i]],
  ['talon/docs/index.html', [/Response scanning and Talon-side retry\/fallback are not available on this path/i, /start in shadow mode/i]],
];
for (const [rel, expressions] of pages) {
  const target = path.join(root, rel);
  if (!fs.existsSync(target)) { failures.push(`Missing current page: ${rel}`); continue; }
  const body = fs.readFileSync(target, 'utf8');
  for (const expression of expressions) if (expression.test(body)) failures.push(`Retired wording ${expression} in ${rel}`);
}
const homepage = path.join(root, 'index.html');
if (fs.existsSync(homepage)) {
  const html = fs.readFileSync(homepage, 'utf8');
  if (!html.includes('Control consequential AI actions. Prove what happened.')) failures.push('Homepage lost the action-first product promise');
  if (!html.includes('routed through it')) failures.push('Homepage lost its interception-boundary qualification');
  if (html.indexOf('<h3>Action → stop</h3>') >= html.indexOf('<h3>Policy → prevent</h3>')) failures.push('Homepage action proof is no longer the first proof story');
} else failures.push('Missing homepage');
for (const rel of ['index.html', 'ai-action-control/index.html']) {
  const target = path.join(root, rel);
  if (!fs.existsSync(target)) continue;
  const body = fs.readFileSync(target, 'utf8');
  if (body.includes('github.com/dativo-io/talon/issues/new?title=Pilot')) failures.push('Public pilot issue intake on ' + rel);
  if (!body.includes('linkedin.com/in/sergeyenin/')) failures.push('Private founder contact missing on ' + rel);
}
const actionPage = path.join(root, 'ai-action-control/index.html');
if (fs.existsSync(actionPage)) {
  const body = fs.readFileSync(actionPage, 'utf8');
  if (!body.includes('How do you investigate an agent action?')) failures.push('Action incident explanation missing');
  if (!body.includes('approval ≠ dispatch')) failures.push('Action approval/dispatch separation missing');
}
const comparisonPage = path.join(root, 'comparisons/index.html');
if (fs.existsSync(comparisonPage) && !fs.readFileSync(comparisonPage, 'utf8').includes('observability/evaluation tools')) failures.push('Observability complementarity missing');
if (failures.length) { for (const failure of failures) console.error(`FAIL: ${failure}`); process.exit(1); }
console.log('PASS: current action/MCP/OpenShell publication routes and claims');
