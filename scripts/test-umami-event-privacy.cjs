#!/usr/bin/env node
// Regression: injected named Umami events must not contain private URL query
// values, fragments, or arbitrary link text.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'talon-umami-'));
try {
  const page = path.join(root, 'index.html');
  fs.writeFileSync(page, '<html><head><title>Test</title></head><body></body></html>');
  execFileSync(process.execPath, [
    path.join(__dirname, 'inject-umami.cjs'),
    root, 'https://cloud.umami.is/script.js', 'test-website-id', 'dativo.io',
  ]);

  const html = fs.readFileSync(page, 'utf8');
  const inline = html.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(inline, 'injected Umami event helper missing');
  assert.equal((html.match(/data-talon-analytics="umami"/g) || []).length, 1);

  const events = [];
  const listeners = {};
  const window = {
    location: {pathname: '/pilot/', origin: 'https://dativo.io'},
    umami: {track: (name, props) => events.push({name, props})},
  };
  const document = {
    addEventListener: (name, cb) => {listeners[name] ||= []; listeners[name].push(cb);},
  };
  vm.runInNewContext(inline[1], {window, document, URL});
  assert.ok(listeners.click?.length >= 1, 'click listener missing');

  function click(href, label) {
    const link = {
      getAttribute: key => key === 'href' ? href : null,
      textContent: label,
      closest: () => null,
    };
    const event = {target: {closest: selector => selector === 'a' ? link : null}};
    for (const callback of listeners.click) callback(event);
  }

  click('/talon/docs/quickstart-demo/?email=person@example.com&access_token=private#client', 'Personal Account for Jane Doe');
  click('https://github.com/dativo-io/talon?secret_token=private', 'Customer account ABC');
  assert.equal(events.length, 2);
  assert.equal(events[0].name, 'Quickstart Demo Click');
  assert.equal(events[0].props.destination, '/talon/docs/quickstart-demo/');
  assert.equal(events[1].name, 'GitHub Click');
  assert.equal(events[1].props.destination, 'external:github.com');
  for (const event of events) {
    const payload = JSON.stringify(event);
    for (const forbidden of ['person@example.com', 'secret_token', 'access_token', 'Jane Doe', 'Customer account', 'private']) {
      assert.ok(!payload.includes(forbidden), 'sensitive value leaked into event properties');
    }
  }
  console.log('PASS: injected Umami named events never send raw link URLs or link text.');
} finally {
  fs.rmSync(root, {recursive: true, force: true});
}
