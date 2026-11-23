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
assert.ok(home.length < 11500, 'homepage has accumulated an exhaustive feature catalog again');
for (const href of ['/pilot/', '/use-cases/', '/enterprise/', '/talon/docs/quickstart-demo/', '/talon/docs/action-gateway-proof/', '/talon/docs/add-talon-to-existing-app/']) {
  assert.ok(home.includes('href="' + href + '"'), 'homepage missing evaluator route ' + href);
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
