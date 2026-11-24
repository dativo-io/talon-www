#!/usr/bin/env node
// Exercise the production growth listener without a browser or third-party tracker.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sent = [];
const listeners = {};
const context = {
  URL,
  window: {
    location: {pathname: '/pilot/', origin: 'https://dativo.io'},
    umami: {track: (name, properties) => sent.push({name, properties})},
  },
  document: {
    addEventListener: (name, listener) => {listeners[name] = listener;},
    querySelector: () => null,
  },
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../growth.js'), 'utf8'), context);
assert.equal(typeof listeners.click, 'function', 'growth click listener missing');

function click(href, intent, placement = 'test') {
  const link = {
    dataset: {growthIntent: intent, growthPlacement: placement},
    getAttribute: (name) => name === 'href' ? href : null,
    closest: () => null,
    matches: () => false,
    textContent: 'Continue',
  };
  listeners.click({target: {closest: () => link}});
}

const calendar = 'https://calendar.app.google/bfNg6wuqyCaKa8nV9';
click(calendar, 'pilot-booking', 'pilot-hero');
assert.equal(sent.length, 1, 'booking click must produce exactly one event');
assert.equal(sent[0].name, 'Pilot Booking Click');
assert.equal(sent[0].properties.channel, 'google_calendar');
assert.equal(sent[0].properties.placement, 'pilot-hero');
assert.ok(!JSON.stringify(sent[0]).includes('bfNg6wuq'), 'booking link token leaked into analytics');

click('/pilot/?utm_source=linkedin&email=visitor@example.com', 'pilot-offer', 'hero');
assert.equal(sent.length, 2);
assert.equal(sent[1].name, 'Funnel CTA');
assert.equal(sent[1].properties.intent, 'pilot-offer');
assert.equal(sent[1].properties.destination, '/pilot/', 'query string must be stripped');
assert.ok(!Object.prototype.hasOwnProperty.call(sent[1].properties, 'text'), 'CTA link text must not be transmitted');
assert.ok(!JSON.stringify(sent[1]).includes('visitor@example.com'), 'query string leaked into analytics');

click('https://github.com/dativo-io/talon?code=private', 'github', 'footer');
assert.equal(sent.length, 3);
assert.equal(sent[2].properties.destination, 'external:github.com');
assert.ok(!JSON.stringify(sent[2]).includes('code=private'), 'external URL leaked into analytics');
assert.ok(!sent.some((event) => event.name === 'Pilot Contact Click'), 'retired contact event reappeared');

console.log('PASS: pilot click telemetry is unambiguous and privacy-safe.');
