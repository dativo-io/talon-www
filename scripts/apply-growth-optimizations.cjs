#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(process.argv[2] || 'dist');
const assets = [
  '<link rel="stylesheet" href="/growth.css" data-talon-growth="styles" />',
  '<script defer src="/growth.js" data-talon-growth="script"></script>',
];
const metadata = {
  '/': ['Talon — Open-Source AI Control Plane for Cost, Policy & Sessions', 'Open-source, self-hosted control plane for AI use cases: enforce spend, model/tool/data policy, policy-valid fallback, session visibility, and signed evidence.'],
  '/talon/docs/': ['Talon Docs — AI Cost Control, Policy, Reliability & Sessions', 'Install, integrate, and operate Talon: AI cost caps, policy-valid fallback, model/tool/data controls, session visibility, and verifiable evidence.'],
  '/talon/docs/compliance-export-runbook/': ['Export Verifiable AI Audit Evidence for Auditors | Talon', 'Export, verify, and hand off signed Talon evidence for audits and customer reviews. Practical commands, integrity checks, and review-ready evidence workflows.'],
  '/talon/docs/codex-cli-integration/': ['Govern Codex CLI: Cost, Policy & Session Evidence | Talon', 'Route Codex CLI through Talon for agent-attributed cost controls, model and data policy, session visibility, and signed evidence—without claiming local tool control.'],
  '/talon/docs/evidence-store/': ['Signed AI Audit Evidence: Verify & Export | Talon', 'See how Talon signs, stores, verifies, and exports AI runtime evidence. Inspect policy decisions, cost, PII findings, sessions, and HMAC integrity.'],
  '/talon/docs/add-talon-to-existing-app/': ['Add Talon to an OpenAI or Anthropic App in Minutes', 'Put Talon in front of an existing OpenAI or Anthropic app with a base-URL change, then add cost, policy, reliability, session visibility, and signed evidence.'],
  '/ai-governance-evidence-store/': ['Signed AI Runtime Evidence Store: Verify & Export | Talon', 'Inspect and verify Talon runtime evidence for AI policy, cost, routing, PII, tools, and sessions. Export signed records for review and audit workflows.'],
  '/coding-agent-governance/': ['Coding Agent Governance: Cost, Tools & Session Visibility | Talon', 'Govern coding-agent model traffic and intercepted MCP calls with shared budgets, policy, session attribution, and signed evidence. Local actions remain outside Talon.'],
};

function htmlFiles(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...htmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) result.push(full);
  }
  return result;
}

function routeFor(file) {
  let relative = path.relative(outDir, file).split(path.sep).join('/');
  if (relative === '404.html') return null;
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) relative = relative.slice(0, -'index.html'.length);
  else relative = `${relative.slice(0, -'.html'.length)}/`;
  return `/${relative}`;
}

function setTitle(html, title) {
  const start = html.indexOf('<title>');
  const end = html.indexOf('</title>', start + 7);
  if (start < 0 || end < 0) return html;
  return `${html.slice(0, start)}<title>${title}</title>${html.slice(end + 8)}`;
}

function escapeAttr(value) {
  return value.split('&').join('&amp;').split('"').join('&quot;').split('<').join('&lt;').split('>').join('&gt;');
}

function setMeta(html, selector, content) {
  const prefix = selector.startsWith('name=') ? 'name' : 'property';
  const value = selector.slice(selector.indexOf('"') + 1, selector.lastIndexOf('"'));
  const replacement = `<meta ${prefix}="${value}" content="${escapeAttr(content)}" />`;
  let cursor = 0;
  while (true) {
    const start = html.indexOf('<meta', cursor);
    if (start < 0) break;
    const end = html.indexOf('>', start);
    if (end < 0) break;
    const tag = html.slice(start, end + 1);
    if (tag.includes(selector)) {
      return `${html.slice(0, start)}${replacement}${html.slice(end + 1)}`;
    }
    cursor = end + 1;
  }
  const headEnd = html.indexOf('</head>');
  return headEnd < 0 ? html : `${html.slice(0, headEnd)}  ${replacement}\n${html.slice(headEnd)}`;
}

function injectAssets(html) {
  const headEnd = html.indexOf('</head>');
  if (headEnd < 0) return html;
  const missing = assets.filter((tag) => !html.includes(tag));
  if (!missing.length) return html;
  return `${html.slice(0, headEnd)}  ${missing.join('\n  ')}\n${html.slice(headEnd)}`;
}

const seen = new Set();
let changed = 0;
for (const file of htmlFiles(outDir)) {
  const route = routeFor(file);
  if (!route) continue;
  seen.add(route);
  let html = fs.readFileSync(file, 'utf8');
  if (metadata[route]) {
    const [title, description] = metadata[route];
    html = setTitle(html, title);
    html = setMeta(html, 'name="description"', description);
    html = setMeta(html, 'property="og:title"', title);
    html = setMeta(html, 'property="og:description"', description);
    html = setMeta(html, 'name="twitter:title"', title);
    html = setMeta(html, 'name="twitter:description"', description);
  }
  html = injectAssets(html);
  fs.writeFileSync(file, html);
  changed += 1;
}

for (const route of Object.keys(metadata)) {
  if (!seen.has(route)) throw new Error(`Growth metadata route missing from build: ${route}`);
}
for (const file of htmlFiles(outDir)) {
  const route = routeFor(file);
  if (!route) continue;
  const html = fs.readFileSync(file, 'utf8');
  for (const tag of assets) {
    if (!html.includes(tag)) throw new Error(`Growth asset missing from ${route}`);
  }
}
console.log(`Applied growth assets to ${changed} HTML pages and search metadata to ${Object.keys(metadata).length} priority routes.`);
