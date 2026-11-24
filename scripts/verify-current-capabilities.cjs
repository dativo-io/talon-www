#!/usr/bin/env node
// Fail publication if current product/operating journeys vanish or retired public claims reappear.
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
  'pilot/index.html',
  'use-cases/index.html',
  'use-cases/coding-agents/index.html',
  'use-cases/customer-support/index.html',
  'use-cases/people-analytics/index.html',
  'use-cases/vendor-contract-review/index.html',
  'use-cases/refund-approvals/index.html',
  'talon/docs/n8n-refund-approvals/index.html',
  'talon/docs/operate-ai-use-cases/index.html',
  'talon/docs/production-pilot/index.html',
  'talon/docs/single-node-production/index.html',
  'mcp-tool-governance/index.html',
  'ai-agent-audit-trail/index.html',
  'comparisons/talon-vs-litellm/index.html',
];
let failures = [];
for (const rel of required) { if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing public route: ${rel}`); }
const pages = [
  ['ai-action-control/index.html', [/Preview gate #458/i]],
  ['ai-cost-control/index.html', [/soft[- ]caps?/i]],
  ['comparisons/talon-vs-pii-proxy/index.html', [/soft[- ]caps?/i]],
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
  if (!html.includes('Talon Community') || !html.includes('Talon Enterprise')) failures.push('Community/Enterprise edition comparison incomplete');
  if (!html.includes('Enterprise capabilities are evaluated and scoped with design partners') || !html.includes('validate the selected integration and supported deployment profile')) failures.push('Enterprise pilot-only scope and released-profile guard missing');
  if (!html.includes('corporate') && !html.includes('Corporate')) failures.push('Corporate integration narrative missing');
  if (!/SIEM/i.test(html) || !/approvals?/i.test(html)) failures.push('Enterprise security/workflow integration narrative missing');
  if ((html.match(/class="ep-check"/g) || []).length !== 19) failures.push('Edition table should show five shared rows and nine Enterprise-only rows with a two-column checkmark matrix');
  for (const feature of ['Teams register and manage their own AI apps', 'Who changed policies, keys and access', 'High-load and high-availability deployments', 'Enterprise-level support']) {
    if (!html.includes(feature)) failures.push('Enterprise buyer-oriented feature missing: ' + feature);
  }
  if ((html.match(/data-growth-intent="pilot-offer" data-growth-placement="enterprise-(?:hero|bottom)"/g) || []).length !== 2) failures.push('Enterprise page missing instrumented hero or bottom Try a pilot CTA');
  if (!html.includes('href="/enterprise/enterprise.css"')) failures.push('Enterprise edition styling missing');
  if (html.includes('github.com/dativo-io/talon-enterprise')) failures.push('Private Enterprise implementation link exposed');
}
const docsHome = path.join(root, 'talon/docs/index.html');
if (fs.existsSync(docsHome)) {
  const html = fs.readFileSync(docsHome, 'utf8');
  for (const label of ['Start with one AI use case', 'Choose your first step', 'Try Talon', 'Connect an existing app', 'Control a consequential action']) {
    if (!html.includes(label)) failures.push('Docs landing page lost the evaluator path: ' + label);
  }
  if (/start in shadow mode/i.test(html)) failures.push('Docs homepage contains retired shadow-mode guidance');
} else failures.push('Docs landing page missing');
const homepage = path.join(root, 'index.html');
if (fs.existsSync(homepage)) {
  const html = fs.readFileSync(homepage, 'utf8');
  if (!html.includes('<h1>One company policy for your AI use cases.</h1>')) failures.push('Homepage lost its canonical company-policy promise');
  if (!html.includes('Operations Console') || !html.includes('company rules')) failures.push('Homepage lost its buyer-first operating problem or console proof');
  for (const job of ['Cost control', 'Reliability', 'Shared policy', 'Session understanding']) {
    if (!html.includes('<strong>' + job + '</strong>')) failures.push('Homepage missing control-plane job: ' + job);
  }
  if (!html.includes('supported interception paths')) failures.push('Homepage lost its interception boundary');
  if (!html.includes('href="/use-cases/"')) failures.push('Homepage must link to the full use-case hub');
  if (!html.includes('href="/talon/docs/action-gateway-proof/"')) failures.push('Homepage must link to reproducible exact-action proof');
  if (!html.includes('href="/talon/docs/quickstart-demo/"')) failures.push('Homepage must preserve the no-key start path');
  if (!html.includes('Synthetic example') || !html.includes('counting test adapter')) failures.push('Homepage action proof must clearly label synthetic, non-payment behavior');
  if ((html.match(/<section\b/g) || []).length !== 5) failures.push('Homepage must retain five focused sections, not an exhaustive feature catalog');
  if (html.includes('case-console-trail') || html.includes('case-editions')) failures.push('Homepage reintroduced redundant console carousel or full edition comparison');
  if (!html.includes('href="/enterprise/"')) failures.push('Homepage missing edition overview');
  if (!html.includes('href="/talon/docs/product-demo/"')) failures.push('Homepage must link to reproducible demo');
  if (!html.includes('href="/talon/docs/add-talon-to-existing-app/"')) failures.push('Homepage lost application onboarding');
  if (!html.includes('href="/talon/docs/n8n-refund-approvals/"')) failures.push('Homepage lost governed n8n action walkthrough');
} else failures.push('Missing homepage');
for (const rel of ['index.html', 'ai-action-control/index.html']) {
  const target = path.join(root, rel);
  if (!fs.existsSync(target)) continue;
  const body = fs.readFileSync(target, 'utf8');
  if (body.includes('github.com/dativo-io/talon/issues/new?title=Pilot')) failures.push('Public pilot issue intake on ' + rel);
  if (!body.includes('href="/pilot/"')) failures.push('Private pilot offer missing on ' + rel);
}
const pilotPage = path.join(root, 'pilot/index.html');
if (fs.existsSync(pilotPage)) {
  const html = fs.readFileSync(pilotPage, 'utf8');
  if (!html.includes('https://calendar.app.google/bfNg6wuqyCaKa8nV9')) failures.push('Pilot page missing configured booking destination');
  if ((html.match(/data-growth-intent="pilot-booking"/g) || []).length !== 2) failures.push('Pilot page must have two measurable booking CTAs');
  if (!html.includes('No workflow data or contact details are collected by this page.')) failures.push('Pilot page missing truthful intake/privacy boundary');
  if (/\<form\b/i.test(html)) failures.push('Pilot page must not expose an unconfigured contact form');
}
const actionPage = path.join(root, 'ai-action-control/index.html');
if (fs.existsSync(actionPage)) {
  const body = fs.readFileSync(actionPage, 'utf8');
  if (!body.includes('How do you investigate an agent action?')) failures.push('Action incident explanation missing');
  if (!body.includes('approval ≠ dispatch')) failures.push('Action approval/dispatch separation missing');
}
const mcpPage = path.join(root, 'mcp-tool-governance/index.html');
if (fs.existsSync(mcpPage)) {
  const body = fs.readFileSync(mcpPage, 'utf8');
  if (!body.includes('2026-07-28 protocol only') || !body.includes('/talon/docs/mcp-2026-migration/')) failures.push('MCP protocol boundary missing');
}
const comparisonPage = path.join(root, 'comparisons/index.html');
if (fs.existsSync(comparisonPage) && !fs.readFileSync(comparisonPage, 'utf8').includes('observability/evaluation tools')) failures.push('Observability complementarity missing');
if (failures.length) { for (const failure of failures) console.error(`FAIL: ${failure}`); process.exit(1); }
console.log('PASS: current action/MCP/OpenShell publication routes and claims');
