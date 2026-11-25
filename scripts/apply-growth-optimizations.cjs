#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(process.argv[2] || 'dist');
const assets = [
  '<link rel="stylesheet" href="/growth.css" data-talon-growth="styles" />',
  '<script defer src="/growth.js" data-talon-growth="script"></script>',
];
const metadata = {
  '/': ["Dativo Talon | Open-source AI control plane", "Manage AI policies, costs and reliability in one place with Talon, an open-source, self-hosted control plane for connected AI workflows."],
  '/pilot/': ['Pilot One Governed AI Use Case | Dativo Talon', 'Bring one existing AI workflow and one consequential-action or company-policy boundary. Book a founder-led technical fit call to explore a scoped Talon pilot.'],
  '/ai-action-control/': ["Tool & Action Control for AI Use Cases | Dativo Talon", "Talon's AI control plane enforces shared tool policy on intercepted paths. Exact HTTP action authorization and human approval are one supported capability."],
  '/ai-agent-governance/': ["One Company Policy for AI Use Cases | Dativo Talon", "Use Talon's open-source AI control plane to govern agents and applications with shared rules for models, data, tools, budgets, reliability and signed evidence."],
  '/comparisons/': ["AI Control Planes, Gateways & Observability | Dativo Talon", "Compare Talon's open-source AI control plane for company policy, cost, reliability and session understanding with gateways and observability platforms."],
  '/mcp-tool-governance/': ["MCP Tool Permissions & Policy Enforcement | Dativo Talon", "Apply company tool policy to AI use cases on Talon's supported MCP path. Discovery filtering and call denial are distinct from exact HTTP action approval."],
  '/ai-agent-audit-trail/': ["AI Use Case Decisions & Signed Evidence | Dativo Talon", "Investigate routed model requests and intercepted actions: policy, costs, provider paths, sessions and signed evidence, distinct from downstream effects."],
  '/comparisons/talon-vs-litellm/': ["Talon vs LiteLLM: AI Control Plane vs Model Gateway", "Compare company and use-case policy, model access, budgets, provider reliability, tool controls, session visibility and signed evidence."],
  '/talon/docs/': ["Dativo Talon Docs — Open-Source AI Control Plane", "Start with one AI use case. Try Talon without provider keys, connect an existing application, or verify an intercepted business action and signed decision."],
  '/talon/docs/compliance-export-runbook/': ['Export Verifiable AI Audit Evidence for Auditors | Talon', 'Export, verify, and hand off signed Talon evidence for audits and customer reviews. Practical commands, integrity checks, and review-ready evidence workflows.'],
  '/talon/docs/codex-cli-integration/': ['Govern Codex CLI: Cost, Policy & Session Evidence | Talon', 'Route Codex CLI through Talon for agent-attributed cost controls, model and data policy, session visibility, and signed evidence—without claiming local tool control.'],
  '/talon/docs/evidence-store/': ["Signed AI Control Plane Evidence: Verify & Export | Talon", "See how Talon signs, stores, verifies and exports evidence of routed AI use-case decisions, costs, data policy, tools, provider paths and sessions."],
  '/talon/docs/add-talon-to-existing-app/': ['Add Talon to an OpenAI or Anthropic App in Minutes', 'Put Talon in front of an existing OpenAI or Anthropic app with a base-URL change, then add cost, policy, reliability, session visibility, and signed evidence.'],
  '/ai-governance-evidence-store/': ["Signed AI Control Plane Evidence | Dativo Talon", "Inspect and verify AI use-case decisions across shared policy, cost, routing, fallback, tools and sessions. Signed evidence is the proof layer, not the product category."],
  '/coding-agent-governance/': ["Coding Use Cases: Policy, Cost & Sessions | Dativo Talon", "Apply company policy to routed coding-agent requests and intercepted MCP calls. Investigate sessions, budgets, provider paths and signed decisions."],
  '/use-cases/': ["AI solutions for your business | Dativo Talon", "Explore Talon for customer support, document processing, People Analytics, coding assistants and n8n. Keep your workflows and add shared AI controls."],
  '/solutions/n8n/': ["AI governance for n8n | Dativo Talon", "Add policy, cost controls and sensitive data protection to supported n8n AI workflows. Explore reproducible customer support, document review and refund examples."],
  '/use-cases/coding-agents/': ['Coding Agents: TokenEconomizer and Copilot | Talon', 'See real coding-agent governance with Talon: TokenEconomizer cost experiments and Copilot MCP release controls. Verified budgets and evidence, without unsupported savings claims.'],
  '/use-cases/customer-support/': ['AI Customer Support Automation: PII, Refund Controls | Talon', 'A real n8n customer support demo governed by Talon: PII redaction, policy-safe fallback, refund-tool denial, signed evidence and a separate human approval step.'],
  '/use-cases/people-analytics/': ['People Analytics AI Governance: HR Data Access | Talon', 'Govern AI workforce analytics with Talon: allow aggregate HR tools, deny intercepted employee-record exports, verify policy evidence and retain existing HR access controls.'],
  '/use-cases/vendor-contract-review/': ['AI Vendor Contract Review: Confidential Data Governance | Talon', 'See a reproducible n8n vendor contract AI review: deny unapproved model egress, redact synthetic contact fields, allow the approved provider and verify signed evidence.'],
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
  return `${html.slice(0, start)}<title>${escapeAttr(title)}</title>${html.slice(end + 8)}`;
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

// Decode existing source metadata before re-encoding, not arbitrary HTML.
function decodeAttr(value) {
  return value.replace(/&(amp|quot|lt|gt|apos|#39);/g, (_,key) => ({amp:'&',quot:'"',lt:'<',gt:'>',apos:"'",'#39':"'"})[key]);
}
function alignMarketingSocial(html,route) {
  if (!html.includes('class="site-nav"') || /name="robots"[^>]*noindex/i.test(html)) return html;
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  if (!title || !description) throw new Error('Missing owned marketing title or description: '+route);
  for (const selector of ['property="og:title"','name="twitter:title"']) html=setMeta(html,selector,decodeAttr(title));
  for (const selector of ['property="og:description"','name="twitter:description"']) html=setMeta(html,selector,decodeAttr(description));
  html=setMeta(html,'property="og:image"','https://dativo.io/public/assets/og-image.png');
  html=setMeta(html,'name="twitter:image"','https://dativo.io/public/assets/og-image.png');
  html=setMeta(html,'property="og:image:alt"','Dativo Talon: Stay in control as AI scales');
  html=setMeta(html,'name="twitter:image:alt"','Dativo Talon: Stay in control as AI scales');
  html=setMeta(html,'property="og:image:width"','1200');
  html=setMeta(html,'property="og:image:height"','630');
  html=setMeta(html,'name="twitter:card"','summary_large_image');
  return html;
}
function main() {
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
    if (!route.startsWith('/talon/docs/')) html = alignMarketingSocial(html,route);
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
}

if (require.main === module) main();
module.exports = {setTitle, setMeta, metadata, alignMarketingSocial};
