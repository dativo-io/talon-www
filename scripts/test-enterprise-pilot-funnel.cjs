#!/usr/bin/env node
// Verify the actual Enterprise-page CTAs produce privacy-safe Umami funnel events.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'enterprise/index.html'), 'utf8');
const events = [];
const listeners = {};
const browser = {
  URL,
  window: {location: {pathname: '/enterprise/', origin: 'https://dativo.io'}, umami: {track: (name, props) => events.push({name, props})}},
  document: {addEventListener: (name, listener) => {listeners[name] = listener;}, querySelector: () => null},
};
vm.runInNewContext(fs.readFileSync(path.join(root, 'growth.js'), 'utf8'), browser);
assert.equal(typeof listeners.click, 'function');

const primary = [...html.matchAll(/<a\b[^>]*data-growth-intent="pilot-offer"[^>]*>/g)].filter(m => /data-growth-placement="enterprise-(?:hero|bottom)"/.test(m[0]));
assert.equal(primary.length, 2, 'the Enterprise hero and bottom CTAs must both be tracked');
for (const [i, anchor] of primary.entries()) {
  const href = anchor[0].match(/href="([^"]+)"/)?.[1];
  const placement = anchor[0].match(/data-growth-placement="([^"]+)"/)?.[1];
  assert.equal(href, '/pilot/');
  assert.equal(placement, i === 0 ? 'enterprise-hero' : 'enterprise-bottom');
  assert.ok(anchor[0].includes('data-growth-primary="true"'));
  const link = {
    dataset: {growthIntent: 'pilot-offer', growthPlacement: placement},
    getAttribute: name => name === 'href' ? '/pilot/?utm_source=linkedin&email=private@example.com' : null,
    closest: () => null,
    matches: selector => selector.includes('data-growth-primary'),
    textContent: 'Try a pilot',
  };
  listeners.click({target: {closest: () => link}});
}
assert.equal(events.length, 2);
for (const [i, e] of events.entries()) {
  assert.equal(e.name, 'Funnel CTA');
  assert.equal(e.props.page, '/enterprise/');
  assert.equal(e.props.intent, 'pilot-offer');
  assert.equal(e.props.placement, i === 0 ? 'enterprise-hero' : 'enterprise-bottom');
  assert.equal(e.props.destination, '/pilot/');
  assert.equal(e.props.primary, 'true');
  assert.ok(!JSON.stringify(e).includes('private@example.com'), 'private URL query leaked');
}
assert.equal(events.filter(e => e.name === 'Pilot Booking Click').length, 0, 'opening the pilot offer is not a booking');
console.log('PASS: Enterprise hero and bottom CTAs emit safe Funnel CTA / pilot-offer events.');
