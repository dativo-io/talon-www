#!/usr/bin/env node
const assert = require('node:assert/strict');
const {parseCsv, report} = require('./report-traffic.cjs');
assert.deepEqual(parseCsv('a,b\n"one, two","he said ""hi"""\n'), [['a','b'],['one, two','he said "hi"']]);
const csv = 'session_id,created_at,referrer_domain,event_type,event_name\n' +
  'a,2026-11-01 10:00:00,aocr.org,1,\n' +
  'a,2026-11-01 10:00:01,,2,Funnel CTA\n' +
  'b,2026-11-02 10:00:00,,1,\n' +
  'b,2026-11-02 10:00:05,,2,Pilot Contact Click\n';
const result = report(csv);
assert.equal(result.recorded_sessions, 2);
assert.equal(result.excluded_aocr_sessions, 1);
assert.equal(result.remaining_sessions, 1);
assert.deepEqual(result.remaining_custom_events, {'Pilot Contact Click': 1});
console.log('Traffic report PASS');
