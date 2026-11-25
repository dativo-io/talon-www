#!/usr/bin/env node
// Analyze an extracted Umami website_event.csv, with a clearly labelled referral filter.
// This does not identify humans or prevent automated requests reaching the site.
const fs = require('node:fs');

function parseCsv(content) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      if (quoted && content[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(field); field = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && content[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(v => v !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (quoted) throw new Error('Unclosed CSV quoted field');
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function report(csv) {
  const [headers, ...data] = parseCsv(csv.replace(/^\uFEFF/, ''));
  const column = name => {
    const i = headers.indexOf(name);
    if (i < 0) throw new Error('Umami export lacks column ' + name);
    return i;
  };
  const sid = column('session_id'), date = column('created_at'), ref = column('referrer_domain'),
    type = column('event_type'), event = column('event_name');
  const pathColumn = headers.indexOf('url_path');
  const sessions = new Map();
  const events = [];
  for (const row of data) {
    const id = row[sid];
    if (!id) continue;
    const month = (row[date] || '').slice(0, 7);
    const referral = (row[ref] || '').toLowerCase().replace(/^www\./, '');
    const existing = sessions.get(id) || {month, excluded: false, timeline: []};
    if (!existing.month || month < existing.month) existing.month = month;
    if (referral === 'aocr.org') existing.excluded = true;
    existing.timeline.push({time: row[date] || '', sequence: existing.timeline.length, path: pathColumn < 0 ? '' : (row[pathColumn] || '').split(/[?#]/)[0], type: row[type], name: row[event] || ''});
    sessions.set(id, existing);
    if (row[type] === '2' && row[event]) events.push({session: id, name: row[event]});
  }
  const byMonth = {};
  for (const {month, excluded} of sessions.values()) {
    const bucket = byMonth[month] ||= {recorded: 0, excluded_aocr: 0, remaining: 0};
    bucket.recorded++;
    if (excluded) bucket.excluded_aocr++;
    else bucket.remaining++;
  }
  const keptEvents = {};
  for (const e of events) {
    if (!sessions.get(e.session)?.excluded) keptEvents[e.name] = (keptEvents[e.name] || 0) + 1;
  }
  const excluded = [...sessions.values()].filter(s => s.excluded).length;
  // A stage counts each distinct session once, in chronological order.
  // Acquisition cohorts can overlap: a person may try OSS and later seek a pilot.
  function stages(cohort,predicates) {
    const counts=predicates.map(()=>0);
    for(const session of cohort){
      let i=0;
      for(const e of [...session.timeline].sort((a,b)=>a.time.localeCompare(b.time)||a.sequence-b.sequence)){
        if(i<predicates.length&&predicates[i][1](e)){counts[i]++;i++;}
      }
    }
    return predicates.map(([stage],i)=>({stage,sessions:counts[i]}));
  }
  const pv=(e,match)=>e.type==='1'&&match(e.path);
  const ev=(e,name)=>e.type==='2'&&e.name===name;
  function funnels(cohort){
    const named={};
    for(const session of cohort)for(const name of new Set(session.timeline.filter(e=>e.type==='2').map(e=>e.name).filter(Boolean))) named[name]=(named[name]||0)+1;
    return {
      distinct_sessions_by_event:named,
      ordered:pathColumn<0?null:{
        business:stages(cohort,[['business landing',e=>pv(e,p=>p==='/'||p==='/use-cases/'||p.startsWith('/use-cases/')||p==='/enterprise/'||p.startsWith('/ai-'))],['pilot offer click',e=>ev(e,'Pilot Offer Click')],['pilot page view',e=>pv(e,p=>p==='/pilot/')],['calendar click',e=>ev(e,'Pilot Booking Click')]]),
        orchestration:stages(cohort,[['n8n landing',e=>pv(e,p=>p==='/solutions/n8n/')],['pilot offer click',e=>ev(e,'Pilot Offer Click')],['pilot page view',e=>pv(e,p=>p==='/pilot/')],['calendar click',e=>ev(e,'Pilot Booking Click')]]),
        n8n_example:stages(cohort,[['n8n landing',e=>pv(e,p=>p==='/solutions/n8n/')],['reference explored',e=>ev(e,'Integration Example Click')]]),
        oss:stages(cohort,[['website page view',e=>e.type==='1'],['GitHub or no-key quickstart click',e=>ev(e,'GitHub Click')||ev(e,'Quickstart Demo Click')]])
      }
    };
  }
  const all=[...sessions.values()];
  return {
    definition: 'Distinct session_id; exclude every session with referrer_domain aocr.org. Remaining sessions are NOT verified human users.',
    recorded_sessions: sessions.size,
    excluded_aocr_sessions: excluded,
    remaining_sessions: sessions.size - excluded,
    monthly_sessions: Object.fromEntries(Object.entries(byMonth).sort(([a],[b]) => a.localeCompare(b))),
    remaining_custom_events: keptEvents,
    acquisition_funnels: {raw:funnels(all),referral_filtered:funnels(all.filter(s=>!s.excluded))},
    caveats: [
      'Referral-based exclusion may miss other bots or remove a real session.',
      'Pilot Booking Click is an outbound scheduling-link click, not a confirmed booking, conversation or pilot.',
      'Historical Funnel CTA events cannot be mapped to Pilot Offer Click without event properties. Ordered funnels are meaningful after the v2 event rollout.',
      'Ordered funnels require the url_path column; if absent, only distinct sessions per named event are available. Cohorts may overlap.',
      'GitHub, quickstart, and copy-command clicks are interest signals, not verified installs. Confirmed bookings and pilot results require a separate source.',
      'No personally identifiable event properties or raw session identifiers are printed.'
    ]
  };
}

if (require.main === module) {
  const path = process.argv[2];
  if (!path) { console.error('Usage: unzip <umami-export.zip> website_event.csv -d <folder> && node scripts/report-traffic.cjs <folder>/website_event.csv'); process.exit(2); }
  try { console.log(JSON.stringify(report(fs.readFileSync(path, 'utf8')), null, 2)); }
  catch (e) { console.error(e.message); process.exit(1); }
}
module.exports = {parseCsv, report};
