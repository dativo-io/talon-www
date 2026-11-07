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
  'enterprise/index.html',
  'use-cases/index.html',
  'use-cases/coding-agents/index.html',
  'use-cases/customer-support/index.html',
  'use-cases/people-analytics/index.html',
  'use-cases/vendor-contract-review/index.html',
  'mcp-tool-governance/index.html',
  'ai-agent-audit-trail/index.html',
  'comparisons/talon-vs-litellm/index.html',
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
const caseNav = path.join(root, 'use-cases/index.html');
if (fs.existsSync(caseNav)) {
  const html = fs.readFileSync(caseNav, 'utf8');
  if (!html.includes('/use-cases/people-analytics/')) failures.push('People Analytics must be a first-class use case');
  if (html.includes('We will add it to the navigation')) failures.push('Outdated People Analytics demo gate');
}
const editionPage = path.join(root, 'enterprise/index.html');
if (fs.existsSync(editionPage)) {
  const html = fs.readFileSync(editionPage, 'utf8');
  if (!html.includes('Talon OSS') || !html.includes('Talon Enterprise')) failures.push('Edition comparison incomplete');
  if (!html.includes('Planned; not released') || !html.includes('not released product features')) failures.push('Enterprise roadmap must be explicitly unshipped');
  if (!html.includes('corporate') && !html.includes('Corporate')) failures.push('Corporate integration narrative missing');
  if (!html.includes('SIEM') || !html.includes('approval')) failures.push('Enterprise security/workflow integration status missing');
  if (html.includes('github.com/dativo-io/talon-enterprise')) failures.push('Private Enterprise implementation link exposed');
}
const homepage = path.join(root, 'index.html');
if (fs.existsSync(homepage)) {
  const html = fs.readFileSync(homepage, 'utf8');
  if (!html.includes('AI use cases are multiplying. Your control shouldn’t fragment.')) failures.push('Homepage lost its case-first promise');
  if (!html.includes('supported interception paths')) failures.push('Homepage lost its interception boundary');
  for (const route of ['/use-cases/coding-agents/', '/use-cases/customer-support/', '/use-cases/people-analytics/', '/use-cases/vendor-contract-review/']) {
    if (!html.includes('href="' + route + '"')) failures.push('Homepage missing use-case entry: ' + route);
  }
  if (!html.includes('href="/enterprise/"')) failures.push('Homepage missing edition overview');
  if (!html.includes('href="/talon/docs/product-demo/"')) failures.push('Homepage must link to reproducible demo');
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
