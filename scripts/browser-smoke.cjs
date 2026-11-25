#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=(process.env.SITE_QA_URL||'http://127.0.0.1:8080').replace(/\/$/,'');
const dist=path.resolve(process.env.SITE_QA_DIST||'dist');
const out=path.resolve(process.env.SITE_QA_REPORT_DIR||'site-qa');
fs.mkdirSync(out,{recursive:true});
const origin=new URL(base).origin;
const priority=['/','/use-cases/','/solutions/n8n/','/pilot/','/enterprise/','/use-cases/customer-support/','/use-cases/vendor-contract-review/','/use-cases/people-analytics/','/use-cases/coding-agents/'];
const sitemap=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
const marketing=[...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname).filter(p=>!p.startsWith('/talon/docs/')))];
const routes=[...new Set([...priority,...marketing,'/privacy/','/404.html','/talon/docs/','/talon/docs/quickstart-demo/','/talon/docs/open-source-and-enterprise/','/talon/docs/mcp-governed-tools/','/talon/docs/operations-console/','/talon/docs/configuration/'])];
const report={mode:'built artifact; external requests blocked, Umami stubbed; no real booking',pages:[],blocking:[],review:[],journeys:[]};
const strict=process.env.TALON_RELEASE_GATE==='1';
function issue(route,viewport,kind,detail,blocking=true){(blocking?report.blocking:report.review).push({route,viewport,kind,detail});}
const fileName=(route,viewport)=>(route==='/'?'home':route.replace(/^\/|\/$/g,'').replace(/[^a-z0-9-]/gi,'_'))+'-'+viewport;
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox']});
 try{
 for(const device of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  const ctx=await browser.newContext({viewport:{width:device.width,height:device.height},reducedMotion:'reduce'});
  await ctx.addInitScript(()=>{window.__qaEvents=[];window.umami={track:(name,props)=>window.__qaEvents.push({name,props})};});
  await ctx.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin===origin||url.protocol==='data:'||url.protocol==='blob:')return route.continue();
    if(url.hostname==='cloud.umami.is')return route.fulfill({status:200,contentType:'application/javascript',body:'/* QA stub: no live event delivery */'});
    return route.abort();
  });
  const page=await ctx.newPage();
  for(const route of routes){
   const errors=[],missing=[];
   const onError=e=>errors.push(e.message);
   const onResponse=r=>{if(r.url().startsWith(origin+'/')&&r.status()>=400)missing.push(r.status()+' '+new URL(r.url()).pathname)};
   page.on('pageerror',onError);page.on('response',onResponse);
   try{
    const resp=await page.goto(base+route,{waitUntil:'load',timeout:30000});
    if(!resp||resp.status()!==200)issue(route,device.name,'HTTP','Expected 200 from preview: '+resp?.status());
    await page.evaluate(()=>document.fonts.ready);
    const info=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,h1:document.querySelectorAll('h1').length,main:document.querySelectorAll('main').length,trackers:document.querySelectorAll('script[data-talon-analytics="umami"]').length,broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src'))}));
    if(info.width>info.viewport+2)issue(route,device.name,'overflow',info.width+' > '+info.viewport);
    if(info.broken.length)issue(route,device.name,'broken image',info.broken);
    if(info.trackers!==1)issue(route,device.name,'tracker count',info.trackers);
    if(!route.startsWith('/talon/docs/')){
      if(info.main!==1||info.h1!==1)issue(route,device.name,'landmarks',info);
      const skip=page.locator('.site-skip-link');
      if(await skip.count()!==1)issue(route,device.name,'skip link','missing');
    }
    for(const error of errors)issue(route,device.name,'page error',error);
    for(const error of missing)issue(route,device.name,'asset response',error);
    if(priority.includes(route)||route==='/privacy/'||route.startsWith('/talon/docs/')||route==='/404.html'){
     await page.screenshot({path:path.join(out,fileName(route,device.name)+'.png'),fullPage:true,animations:'disabled'});
     await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
     const axe=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}));
     for(const v of axe.violations)issue(route,device.name,'axe '+v.impact,{id:v.id,description:v.description,nodes:v.nodes.map(n=>n.target)},v.impact==='critical'||strict);
    }
    report.pages.push({route,viewport:device.name,width:info.width,viewportWidth:info.viewport});
   }catch(e){issue(route,device.name,'browser test',e.message)}
   finally{page.off('pageerror',onError);page.off('response',onResponse);}
  }
  try{
   await page.goto(base+'/',{waitUntil:'load'});
   const skip=page.locator('.site-skip-link');await skip.focus();await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>document.activeElement.id),'main-content','skip link focuses main');
   if(device.name==='mobile')await page.getByRole('button',{name:'Open navigation'}).click();
   const menu=page.locator('.nav-dropdown').filter({hasText:'Solutions'}).locator('summary');
   await menu.focus();await page.keyboard.press('Enter');
   assert.equal(await menu.evaluate(s=>s.parentElement.open),true);
   await page.keyboard.press('Escape');
   assert.equal(await menu.evaluate(s=>s.parentElement.open),false);
   assert.equal(await menu.evaluate(s=>document.activeElement===s),true);
   if(device.name==='mobile'){
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'false');
   }
   // Real DOM links, intercepted only to avoid visiting external services or booking.
   await page.goto(base+'/solutions/n8n/',{waitUntil:'load'});
   await page.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('a[href]'))e.preventDefault();},true));
   const check=async(locator,name)=>{
     await page.evaluate(()=>{window.__qaEvents=[]});await locator.click();
     const events=await page.evaluate(()=>window.__qaEvents);
     assert.equal(events.length,1,'exactly one click event: '+name);
     assert.equal(events[0].name,name);assert.equal(events[0].props.event_version,'2');
   };
   await check(page.locator('main a[href="/use-cases/customer-support/"]').first(),'Integration Example Click');
   await check(page.locator('main a[href="/pilot/"]').first(),'Pilot Offer Click');
   await check(page.locator('main a[href="https://github.com/dativo-io/talon"]').first(),'GitHub Click');
   await page.goto(base+'/pilot/',{waitUntil:'load'});
   await page.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('a[href]'))e.preventDefault();},true));
   assert.equal(await page.locator('.pilot-hero-actions a').count(),1,'single hero booking CTA');
   assert.equal(await page.locator('.pilot-next a[href="/talon/docs/action-gateway-proof/"]').count(),1,'technical proof remains available');
   assert.equal(await page.getByRole('heading',{level:1,name:'Scale your AI with confidence'}).count(),1);
   const booking = page.locator('main a[data-growth-intent="pilot-booking"]');
   assert.deepEqual(await booking.allTextContents(),['Book a call','Book a call']);
   assert.equal(await page.getByRole('heading',{name:'How to prepare for your first use case'}).count(),1);
   await check(booking.first(),'Pilot Booking Click');
   report.journeys.push({viewport:device.name,status:'passed'});
  }catch(e){issue('acquisition journeys',device.name,'journey',e.message)}
  try{
   const docsRoute='/talon/docs/';
   await page.goto(base+docsRoute,{waitUntil:'load'});
   const search=page.getByRole('button',{name:'Search documentation',exact:true});
   await search.waitFor({state:'visible'});
   const requests=[];
   const observe=r=>requests.push(r.url());
   page.on('request',observe);
   try{
    // Wait for the client to hydrate: a real keyboard shortcut opens the modal.
    await search.focus();await page.keyboard.press('Control+k');
    const dialog=page.getByRole('dialog',{name:'Search documentation'});
    await dialog.waitFor({state:'visible',timeout:10000});
    const field=dialog.getByRole('searchbox',{name:'Search documentation'});
    assert.equal(await field.evaluate(el=>el===document.activeElement),true,'search input focus');
    await field.fill('governed MCP tools');
    const result=dialog.locator('a[href="/talon/docs/mcp-governed-tools/"]');
    await result.waitFor({state:'visible',timeout:15000});
    assert.equal(await dialog.locator('.qc-search-results a').first().getAttribute('href'),'/talon/docs/mcp-governed-tools/','exact title should rank first');
    await field.press('ArrowDown');
    await page.waitForFunction(()=>document.activeElement?.getAttribute('href')==='/talon/docs/mcp-governed-tools/');
    assert.equal(await result.evaluate(el=>el===document.activeElement),true,'keyboard search result focus');
    await page.keyboard.press('ArrowUp');
    assert.equal(await field.evaluate(el=>el===document.activeElement),true,'ArrowUp returns to query');
    await page.keyboard.press('Escape');
    await dialog.waitFor({state:'hidden'});
    assert.equal(await search.evaluate(el=>el===document.activeElement),true,'Escape restores focus');
    await search.click();await field.fill('zzzxnoresultsxyzz');
    await dialog.getByRole('status').filter({hasText:'No matching pages'}).waitFor();
    await field.fill('governed MCP tools');await result.waitFor({state:'visible'});
    await Promise.all([page.waitForURL('**/talon/docs/mcp-governed-tools/'),result.click()]);
    assert.ok(requests.some(u=>new URL(u).pathname==='/talon/docs/search-index.json'),'same-origin search index loaded');
    assert.ok(!requests.some(u=>/zzzxnoresultsxyzz|governed(?:%20|\+)MCP/i.test(u)),'search query must not leave browser');
   }finally{page.off('request',observe);}
   await page.evaluate(()=>localStorage.setItem('theme','dark'));
   await page.reload({waitUntil:'load'});
   await page.waitForFunction(()=>document.documentElement.getAttribute('data-theme')==='dark');
   const dark=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,background:getComputedStyle(document.body).backgroundColor}));
   assert.ok(dark.width<=dark.viewport+2,'dark mode overflow');
   assert.notEqual(dark.background,'rgb(255, 255, 255)','dark reading surface');
   await page.screenshot({path:path.join(out,'docs-mcp-dark-'+device.name+'.png'),fullPage:true,animations:'disabled'});
   await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
   const axe=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}));
   for(const v of axe.violations)issue('/talon/docs/mcp-governed-tools/',device.name+' dark','axe '+v.impact,{id:v.id,description:v.description,nodes:v.nodes.map(n=>n.target)},v.impact==='critical'||strict);
   await page.evaluate(()=>localStorage.removeItem('theme'));
   report.journeys.push({viewport:device.name,journey:'docs search and dark mode',status:'passed'});
  }catch(e){issue('docs experience',device.name,'journey',e.message)}
  await ctx.close();
 }
 }finally{await browser.close();fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2)+'\n');}
 for(const e of report.blocking)console.error('BROWSER FAIL',JSON.stringify(e));
 for(const e of report.review.slice(0,20))console.log('BROWSER REVIEW',JSON.stringify(e));
 console.log('Browser QA:',report.pages.length,'page/viewports,',report.blocking.length,'blocking,',report.review.length,'review findings.');
 if(report.blocking.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
