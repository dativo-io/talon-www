'use strict';
const fs=require('node:fs'),path=require('node:path');
const dir=process.argv[2]||'.lighthouseci';
const reports=fs.readdirSync(dir).filter(f=>/^lhr-.*\.json$/.test(f));
for(const file of reports){
 const r=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
 if(!r.finalDisplayedUrl?.endsWith('/talon/docs/')&&!r.finalUrl?.endsWith('/talon/docs/'))continue;
 const a=r.audits||{};
 const details=id=>a[id]?.details?.items?.slice(0,8);
 console.log('DOCS LIGHTHOUSE DIAGNOSTICS',JSON.stringify({url:r.finalDisplayedUrl||r.finalUrl,
 score:r.categories?.performance?.score,metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','speed-index','total-blocking-time','cumulative-layout-shift','interactive','total-byte-weight','bootup-time','mainthread-work-breakdown'].map(id=>[id,a[id]?.numericValue])),
 lcp:details('largest-contentful-paint-element'),renderBlocking:details('render-blocking-resources'),network:details('network-requests'),bootup:details('bootup-time'),work:details('mainthread-work-breakdown'),opportunities:Object.entries(a).filter(([,v])=>v.details?.type==='opportunity').sort((x,y)=>(y[1].details.overallSavingsMs||0)-(x[1].details.overallSavingsMs||0)).slice(0,6).map(([id,v])=>({id,savingsMs:v.details.overallSavingsMs,items:v.details.items?.slice(0,4)}))}));
}
