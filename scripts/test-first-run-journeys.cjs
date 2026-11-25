#!/usr/bin/env node
// Protect short first-run journeys; deep technical pages remain present and indexed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const home = read('index.html');
const sections = [...home.matchAll(/<section\b/g)];
assert.equal(sections.length, 5, 'homepage should have five focused sections');
// Grouped navigation adds markup; bound the actual marketing content separately.
const main = home.match(/<main>[\s\S]*?<\/main>/)?.[0];
assert.ok(main && main.length < 8000, 'homepage main markup has accumulated an exhaustive feature catalog');
const words = html => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(token => /[\p{L}\p{N}]/u.test(token)).length;
assert.ok(words(main) <= 300, 'homepage main copy must remain within the storytelling budget');
assert.ok(main.includes('read-only Operations Console') && main.includes('Shows only observed activity'), 'console capability boundary must remain visible');
for (const label of ['Customer support', 'Document processing', 'People Analytics', 'Coding assistants']) assert.ok(main.includes('<h3>' + label + '</h3>'), 'missing use-case story: ' + label);
const hero = main.match(/<section\b[^>]*home-intro[^>]*>[\s\S]*?<\/section>/)?.[0];
assert.ok(hero && words(hero) < 80, 'hero must remain a short business introduction');
assert.equal((hero.match(/<a\b/g) || []).length, 2, 'hero must offer only two links');
assert.match(hero, /<h1>Stay in control as AI scales<\/h1>/);
assert.ok(hero.includes('<p class="case-kicker">Reduce AI costs and protect sensitive data</p>') && hero.includes('Keep your AI workflows and providers. Simply configure Talon in between.'), 'approved business value and integration caption');
assert.ok(main.includes('supported interception paths'), 'routed-path governance boundary must remain visible');
for (const asset of ['talon-control-layer.svg', 'talon-control-layer-mobile.svg']) {
  const diagram = read('public/assets/' + asset);
  for (const label of ['Your existing AI use cases', 'Your existing providers and tools', 'AI providers']) assert.ok(diagram.includes(label), 'missing existing-system diagram label: ' + label);
}
assert.ok(hero.includes('Manage AI policies, costs and reliability in one place.') && !hero.includes('home-intro-trust'), 'approved concise hero copy and no redundant trust line');
assert.match(hero, /class="button primary" href="\/pilot\/" data-growth-intent="pilot-offer" data-growth-placement="hero" data-growth-primary="true"/);
assert.match(hero, /class="button secondary" href="#how-it-works" data-growth-intent="product-overview" data-growth-placement="hero"/);
assert.ok(!hero.includes('Synthetic example') && !hero.includes('REQUIRE_APPROVAL'), 'technical proof belongs after the introduction');
assert.ok(hero.includes('/public/assets/talon-control-layer.svg') && fs.existsSync(path.join(root, 'public/assets/talon-control-layer.svg')), 'conceptual control-layer illustration missing');
assert.ok(main.indexOf('id="governed-actions"') > main.indexOf('id="how-it-works"'), 'refund proof must remain reachable below the hero');
const flow = main.match(/<ol class="home-proof-flow"[^>]*>([\s\S]*?)<\/ol>/)?.[1];
assert.ok(flow, 'synthetic proof lifecycle must remain visible');
const stages = [...flow.matchAll(/<li class="([^"]+)"><h3>([^<]+)<\/h3><strong>(\d+)<\/strong><span>([^<]+)<\/span><\/li>/g)];
assert.deepEqual(stages.map(m => [m[1], m[2], m[3], m[4]]), [
  ['proof-pending', 'Request held', '0', 'Downstream calls'],
  ['proof-reviewed', 'Reviewer approves', '0', 'Downstream calls'],
  ['proof-dispatched', 'Runtime claims', '1', 'Downstream call'],
], 'approval alone must cause no dispatch; authorized claim causes one call');
assert.ok(main.includes('Approval does not execute a refund') && main.includes('authorized claim') && main.includes('counting test adapter'), 'approval and dispatch must stay distinct');
assert.ok(main.includes('separate, authorized reviewer') && main.includes('REQUIRE_APPROVAL'), 'exact-action proof semantics lost');
assert.ok(main.includes('href="/public/assets/console-showcase.webp"') && main.includes('src="/public/assets/console-showcase.webp"'), 'real console screenshot must be inspectable at native size');
assert.ok(main.includes('synthetic test fixture, not production customer data'), 'console provenance missing');
for (const href of ['/pilot/', '/use-cases/', '/enterprise/', '/talon/docs/quickstart-demo/', '/talon/docs/action-gateway-proof/', '/talon/docs/add-talon-to-existing-app/']) {
  assert.ok(main.includes('href="' + href + '"'), 'homepage main content missing evaluator route ' + href);
}
for (const id of ['governed-actions', 'use-cases', 'how-it-works', 'operations-console', 'pilot']) {
  assert.ok(home.includes('id="' + id + '"'), 'deep-link anchor lost: ' + id);
}
assert.ok(!home.includes('case-console-trail'), 'legacy multi-image console gallery reintroduced');
assert.ok(!home.includes('case-editions'), 'full edition comparison belongs on /enterprise/');
assert.ok(home.includes('Synthetic example') && home.includes('not real payments'), 'governed action example needs synthetic-boundary labeling');

const doc = read('docs-site/docs/index.md');
assert.ok(doc.length < 4000, 'docs front door has become a long encyclopedia again');
for (const route of ['quickstart-demo.md', 'add-talon-to-existing-app.md', 'action-gateway-proof.md']) {
  assert.ok(doc.includes('](./' + route + ')'), 'one of the three docs entry paths is missing: ' + route);
}
assert.ok(!/start in shadow mode/i.test(doc), 'docs first run may not recommend retired shadow mode');
assert.ok(!doc.includes('![', 0), 'docs front door should not preload full console screenshots');

const sidebar = read('docs-site/sidebars.js');
const match = sidebar.match(/label: 'Start here',[\s\S]*?items: \[([\s\S]*?)\]\s*,/);
assert.ok(match, 'sidebar first-run section missing');
const visible = [...match[1].matchAll(/doc\('([^']+)'/g)].map(hit => hit[1]);
assert.deepEqual(visible, ['quickstart-demo', 'add-talon-to-existing-app', 'action-gateway-proof'], 'expanded start list must remain three task entries');
assert.ok(sidebar.includes("label: 'Start here',\n      collapsed: false,"), 'start category should be open');
assert.ok(sidebar.includes("label: 'Use cases',\n      collapsed: true,"), 'deep categories should be initially collapsed');
for (const id of ['production-pilot', 'product-demo', 'evaluation-checklist', 'open-source-and-enterprise', 'choosing-integration-path']) {
  assert.equal(sidebar.split("'"+id+"'").length-1, 1, 'relocated reference guide lost or duplicated: '+id);
}

const config = read('docs-site/docusaurus.config.js');
const navbar = config.slice(config.indexOf('    navbar: {'), config.indexOf('    footer: {'));
assert.equal((navbar.match(/position: '(left|right)'/g)||[]).length, 5, 'docs navbar must keep five choices');
assert.ok(navbar.includes('https://dativo.io/pilot/'), 'docs nav lost pilot path');
console.log('PASS: buyer and Docusaurus first-run journeys remain focused; deep docs preserved.');
