'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {setTitle, setMeta, metadata} = require('./apply-growth-optimizations.cjs');

function render(title) {
  let html = '<head><title>Original</title><meta property="og:title" content="Original" /><meta name="twitter:title" content="Original" /></head>';
  html = setTitle(html, title);
  html = setMeta(html, 'property="og:title"', title);
  return setMeta(html, 'name="twitter:title"', title);
}

function verifyTitles(html, expected) {
  assert.equal(html.match(/<title>([^<]+)<\/title>/)[1], expected);
  assert.equal(html.match(/property="og:title" content="([^"]*)"/)[1], expected);
  assert.equal(html.match(/name="twitter:title" content="([^"]*)"/)[1], expected);
}

test('action and MCP landing pages serialize identical titles', () => {
  for (const route of ['/ai-action-control/', '/mcp-tool-governance/']) {
    const [title] = metadata[route];
    assert.ok(title.includes('&'));
    verifyTitles(render(title), title.replaceAll('&', '&amp;'));
  }
});

test('plain text titles are preserved and special characters are escaped', () => {
  verifyTitles(render('Plain title'), 'Plain title');
  verifyTitles(render('A & B < C > D "E"'), 'A &amp; B &lt; C &gt; D &quot;E&quot;');
});

test('reapplying metadata does not double-escape the title', () => {
  const title = 'Policy & Evidence';
  const initial = render(title);
  let updated = setTitle(initial, title);
  updated = setMeta(updated, 'property="og:title"', title);
  updated = setMeta(updated, 'name="twitter:title"', title);
  assert.equal(updated, initial);
});

test('product identity stays broad and task pages are capabilities', () => {
  assert.equal(metadata['/'][0], "Dativo Talon | Open-source AI control plane");
  assert.ok(metadata['/'][1].startsWith("Manage AI policies, costs and reliability in one place"));
  assert.ok(metadata['/'][1].includes("open-source, self-hosted control plane for connected AI workflows"));
  assert.ok(metadata['/talon/docs/'][0].includes('AI Control Plane'));
  assert.ok(metadata['/ai-action-control/'][1].includes('one supported capability'));
  assert.ok(!metadata['/ai-action-control/'][0].startsWith('AI Agent Action Approval'));
});


test('acquisition metadata preserves the product category and bounded n8n integration', () => {
  assert.ok(metadata['/use-cases/'][0].includes('AI solutions'));
  assert.ok(metadata['/solutions/n8n/'][0].includes('n8n'));
  assert.ok(metadata['/solutions/n8n/'][1].includes('supported n8n AI workflows'));
  verifyTitles(render(metadata['/solutions/n8n/'][0]), metadata['/solutions/n8n/'][0]);
});
