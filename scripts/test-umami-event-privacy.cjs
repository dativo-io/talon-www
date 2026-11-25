#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),os=require('node:os');
const {execFileSync}=require('node:child_process');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'talon-umami-'));
try{
 const file=path.join(root,'index.html');
 fs.writeFileSync(file,'<html><head><script defer src="/growth.js"></script></head><body></body></html>');
 const args=[path.join(__dirname,'inject-umami.cjs'),root,'https://cloud.umami.is/script.js','test-website-id','dativo.io'];
 execFileSync(process.execPath,args);execFileSync(process.execPath,args);
 const html=fs.readFileSync(file,'utf8');
 assert.equal((html.match(/data-talon-analytics="umami"/g)||[]).length,1);
 assert.ok(!html.includes('window.umami.track'), 'duplicate inline listener');
 for(const flag of ['data-exclude-search="true"','data-exclude-hash="true"','data-do-not-track="true"']) assert.ok(html.includes(flag));
 const events=[],listeners={};
 const location={pathname:'/solutions/n8n/',origin:'https://dativo.io',href:'https://dativo.io/solutions/n8n/?utm_source=linkedin&utm_medium=outreach&utm_campaign=n8n_acquisition&utm_content=person@example.com&secret=private'};
 const window={location,umami:{track:(name,props)=>events.push({name,props})},navigator:{},addEventListener:()=>{}};
 const document={addEventListener:(name,fn)=>{(listeners[name]||=[]).push(fn)},querySelector:()=>null};
 const script=fs.readFileSync(path.join(__dirname,'../growth.js'),'utf8');
 vm.runInNewContext(script,{window,document,URL});vm.runInNewContext(script,{window,document,URL});
 assert.equal(listeners.click.length,1);
 assert.equal(events[0].name,'Acquisition Campaign');assert.equal(events[0].props.utm_campaign,'n8n_acquisition');
 function click(href,intent){const a={dataset:{growthIntent:intent},getAttribute:()=>href,closest:()=>null,matches:()=>false,textContent:'Private Jane Doe'};listeners.click[0]({target:{closest:()=>a}});}
 click('/talon/docs/quickstart-demo/?email=person@example.com&access_token=private#client');
 click('https://github.com/dativo-io/talon?secret_token=private');
 click('/use-cases/customer-support/','case-support');
 click('/pilot/','pilot-offer');
 location.pathname='/pilot/';
 click('https://calendar.app.google/private','pilot-booking');
 click('/public/assets/console-showcase.webp');
 assert.deepEqual(events.map(e=>e.name),['Acquisition Campaign','Quickstart Demo Click','GitHub Click','Integration Example Click','Pilot Offer Click','Pilot Booking Click','Console Screenshot Click']);
 assert.equal(events[5].props.page,'/pilot/','SPA path must be current');
 assert.equal(events[1].props.destination,'/talon/docs/quickstart-demo/');
 assert.equal(events[2].props.destination,'external:github.com');
 window.navigator.doNotTrack='1';click('/pilot/','pilot-offer');assert.equal(events.length,7);
 for(const forbidden of ['person@example.com','secret_token','access_token','Jane Doe','private','#client']) assert.ok(!JSON.stringify(events).includes(forbidden),'private event property leaked');
 console.log('PASS single listener, privacy flags, campaign allowlist, event taxonomy, dynamic route and Do Not Track');
}finally{fs.rmSync(root,{recursive:true,force:true});}
