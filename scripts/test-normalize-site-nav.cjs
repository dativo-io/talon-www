#!/usr/bin/env node
// Exercise the exact production normalizer against the real marketing pages,
// including the action page that caught the November 2026 deployment regression.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const siteRoot = path.resolve(__dirname, '..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'talon-nav-'));
const routes = ['index.html', 'ai-action-control/index.html', 'use-cases/index.html', 'enterprise/index.html'];
const script = path.join(__dirname, 'normalize-site-nav.cjs');

try {
  for (const route of routes) {
    const output = path.join(out, route);
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.copyFileSync(path.join(siteRoot, route), output);
  }

  // Docusaurus has its own navbar; marketing normalization must not touch it.
  const docsPath = path.join(out, 'talon/docs/index.html');
  const docsFixture = '<html><head></head><body><header class="site-nav">Docusaurus-owned navigation</header></body></html>';
  fs.mkdirSync(path.dirname(docsPath), {recursive: true});
  fs.writeFileSync(docsPath, docsFixture);

  const run = () => execFileSync(process.execPath, [script, out], {encoding: 'utf8'});
  run();

  const normalized = new Map();
  for (const route of routes) {
    const html = fs.readFileSync(path.join(out, route), 'utf8');
    const header = html.match(/<header class="site-nav">[\s\S]*?<\/header>/)?.[0];
    assert.ok(header, `missing marketing nav on ${route}`);

    const labels = ['Use cases', 'How it works', 'Enterprise', 'Docs', 'GitHub', 'Discuss a pilot'];
    let previous = -1;
    for (const label of labels) {
      const position = header.indexOf(`>${label}<`);
      assert.ok(position > previous, `missing or misordered ${label} on ${route}`);
      previous = position;
    }
    assert.ok(header.includes('href="/use-cases/"'), `missing use-case hub on ${route}`);
    assert.ok(header.includes('href="/enterprise/"'), `missing Enterprise edition route on ${route}`);
    assert.ok(header.includes('href="/talon/docs/"'), `missing docs on ${route}`);
    assert.ok(!header.includes('class="nav-dropdown"'), `legacy dropdown reappeared on ${route}`);
    assert.match(header, /class="nav-toggle"/);
    assert.match(header, /id="primary-navigation"/);
    assert.match(html, /href="\/public\/assets\/talon-icon\.svg"/);
    assert.match(html, /href="\/site-nav\.css"/);
    assert.match(html, /src="\/site-nav\.js"/);
    assert.equal((html.match(/src="\/site-nav\.js"/g) || []).length, 1);
    normalized.set(route, header);
  }
  assert.equal(fs.readFileSync(docsPath, 'utf8'), docsFixture, 'Docusaurus navbar was modified');

  // Re-running the normalizer must not duplicate functional assets or alter
  // the canonical header. Cosmetic whitespace outside the header may change.
  run();
  for (const route of routes) {
    const html = fs.readFileSync(path.join(out, route), 'utf8');
    const header = html.match(/<header class="site-nav">[\s\S]*?<\/header>/)?.[0];
    assert.equal(header, normalized.get(route), `canonical header changed on ${route}`);
    assert.equal((html.match(/src="\/site-nav\.js"/g) || []).length, 1, `duplicate nav JS on ${route}`);
    assert.equal((html.match(/href="\/site-nav\.css"/g) || []).length, 1, `duplicate nav CSS on ${route}`);
    assert.equal((html.match(/href="\/public\/assets\/talon-icon\.svg"/g) || []).length, 1,
      `duplicate favicon on ${route}`);
  }
  console.log('PASS: simplified marketing nav on homepage, action page and use-case hub; Docusaurus excluded; assets unique.');
} finally {
  fs.rmSync(out, {recursive: true, force: true});
}
