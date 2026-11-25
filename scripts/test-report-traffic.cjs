#!/usr/bin/env node
const assert = require('node:assert/strict');
const {parseCsv, report} = require('./report-traffic.cjs');
assert.deepEqual(parseCsv('a,b\n"one, two","he said ""hi"""\n'), [['a','b'],['one, two','he said "hi"']]);
const csv = 'session_id,created_at,referrer_domain,event_type,event_name\n' +
  'a,2026-11-01 10:00:00,aocr.org,1,\n' +
  'a,2026-11-01 10:00:01,,2,Funnel CTA\n' +
  'b,2026-11-02 10:00:00,,1,\n' +
  'b,2026-11-02 10:00:05,,2,Pilot Booking Click\n';
const result = report(csv);
assert.equal(result.recorded_sessions, 2);
assert.equal(result.excluded_aocr_sessions, 1);
assert.equal(result.remaining_sessions, 1);
assert.deepEqual(result.remaining_custom_events, {'Pilot Booking Click': 1});
console.log('Traffic report PASS');

const ordered = 'session_id,created_at,referrer_domain,event_type,event_name,url_path\n' +
 'x,2026-11-25 10:00:00,,1,,/solutions/n8n/\n' +
 'x,2026-11-25 10:00:01,,2,Integration Example Click,/solutions/n8n/\n' +
 'x,2026-11-25 10:00:02,,2,Pilot Offer Click,/solutions/n8n/\n' +
 'x,2026-11-25 10:00:03,,2,Pilot Offer Click,/solutions/n8n/\n' +
 'x,2026-11-25 10:00:04,,1,,/pilot/\n' +
 'x,2026-11-25 10:00:05,,2,Pilot Booking Click,/pilot/\n' +
 'y,2026-11-25 11:00:00,aocr.org,1,,/solutions/n8n/\n' +
 'y,2026-11-25 11:00:01,,2,Pilot Offer Click,/solutions/n8n/\n' +
 'z,2026-11-25 11:00:00,,1,,/\n' +
 'z,2026-11-25 11:00:01,,2,GitHub Click,/\n';
const v=report(ordered).acquisition_funnels;
assert.deepEqual(v.raw.ordered.orchestration.map(s=>s.sessions),[2,2,1,1]);
assert.deepEqual(v.referral_filtered.ordered.orchestration.map(s=>s.sessions),[1,1,1,1]);
assert.equal(v.referral_filtered.distinct_sessions_by_event['Pilot Offer Click'],1);
assert.deepEqual(v.referral_filtered.ordered.oss.map(s=>s.sessions),[2,1]);
assert.equal(result.acquisition_funnels.referral_filtered.ordered,null);
console.log('Acquisition funnel ordering, deduplication, referral filtering and absent path fallback PASS');
