#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const origin='https://dativo.io';
const full=process.argv.includes('--full');
const errors=[],checks=[];
async function request(url,expected=200){
 const res=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{'user-agent':'TalonWebsiteHealth/1.0'}});
 checks.push({url:new URL(url).origin+new URL(url).pathname,status:res.status});
 if(res.status!==expected)errors.push(url+': expected '+expected+', got '+res.status);
 return res;
}
async function redirectToCanonical(start){
 let url=start;
 for(let i=0;i<3;i++){
  const res=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000)});
  if(res.status===200){if(url!==origin+'/')errors.push(start+': unexpected final URL '+url);return;}
  if(![301,308].includes(res.status)){errors.push(start+': expected permanent redirect, got '+res.status);return;}
  const next=res.headers.get('location');if(!next){errors.push(start+': missing Location');return;}
  url=new URL(next,url).href;
  if(!['dativo.io','www.dativo.io'].includes(new URL(url).hostname)){errors.push(start+': unexpected redirect host');return;}
 }
 errors.push(start+': excessive redirect chain');
}
function xmlUrls(xml){return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);}
async function checkPage(url){
 try{
  const res=await request(url);
  if(res.status!==200)return;
  const html=await res.text();
  const canonical=[...html.matchAll(/<link\b[^>]*>/gi)].find(m=>/\brel=["']canonical["']/i.test(m[0]))?.[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
  if(canonical!==url)errors.push(url+': canonical '+canonical);
  if(/<meta\b[^>]*name=["'](?:robots|googlebot)["'][^>]*content=["'][^"']*noindex/i.test(html)||/noindex/i.test(res.headers.get('x-robots-tag')||''))errors.push(url+': unexpectedly noindex');
  for(const [header,match] of [['x-content-type-options',/nosniff/i],['strict-transport-security',/max-age=/i],['content-security-policy',/frame-ancestors 'none'/],['referrer-policy',/strict-origin-when-cross-origin/i]])if(!match.test(res.headers.get(header)||''))errors.push(url+': missing or unexpected '+header);
  if((html.match(/data-talon-analytics="umami"/g)||[]).length!==1)errors.push(url+': expected exactly one configured tracker');
  if(html.includes('static.cloudflareinsights.com/beacon.min.js'))errors.push(url+': unexpected second browser tracker');
 }catch(e){errors.push(url+': '+e.message);}
}
(async()=>{
 try{
  for(const start of ['http://dativo.io/','https://www.dativo.io/','http://www.dativo.io/'])await redirectToCanonical(start);
  const robots=await (await request(origin+'/robots.txt')).text();
  for(const file of ['/sitemap.xml','/talon/docs/sitemap.xml'])if(!robots.includes('Sitemap: '+origin+file))errors.push('Missing robots sitemap '+file);
  const [map,docs]=await Promise.all(['/sitemap.xml','/talon/docs/sitemap.xml'].map(async p=>xmlUrls(await (await request(origin+p)).text())));
  for(const [urls,name] of [[map,'root'],[docs,'docs']]){
   if(!urls.length||urls.length!==new Set(urls).size)errors.push(name+': empty or duplicate sitemap entries');
   if(urls.some(u=>!u.startsWith(origin+'/')||/[?#]/.test(u)||u.endsWith('/404/')||u.endsWith('/404.html')))errors.push(name+': invalid sitemap URLs');
  }
  if(docs.some(u=>!u.startsWith(origin+'/talon/docs/')||!map.includes(u)))errors.push('docs sitemap not canonical subset of root');
  const required=['/','/use-cases/','/solutions/n8n/','/pilot/','/enterprise/','/talon/docs/','/talon/docs/quickstart-demo/'];
  for(const p of required)if(!map.includes(origin+p))errors.push('Missing canonical '+p);
  const urls=full?map.filter(u=>u.startsWith(origin+'/')):required.map(p=>origin+p);
  for(let i=0;i<urls.length;i+=5)await Promise.all(urls.slice(i,i+5).map(checkPage));
  const png=await request(origin+'/public/assets/og-image.png');const bytes=new Uint8Array(await png.arrayBuffer());
  if(!png.headers.get('content-type')?.includes('image/png')||bytes[0]!==137||bytes[1]!==80)errors.push('Invalid social PNG');
  await request(origin+'/privacy/');
  const security=await(await request(origin+'/.well-known/security.txt')).text();
  if(!security.includes('Contact: mailto:security@dativo.io'))errors.push('Missing security contact');
  const expires=Date.parse(security.match(/^Expires: (.+)$/m)?.[1]||'');
  if(!Number.isFinite(expires)||expires-Date.now()<30*86400000)errors.push('security.txt expired or expires within 30 days');
  const missing=await request(origin+'/website-health-404-probe/',404);
  const notFound=await missing.text();
  if(!/noindex/i.test(notFound)&&!/noindex/i.test(missing.headers.get('x-robots-tag')||''))errors.push('404 is not explicitly noindex');
 }catch(e){errors.push(e.message)}
 const report={checkedAt:new Date().toISOString(),full,checks,errors};
 fs.writeFileSync('live-site-health.json',JSON.stringify(report,null,2)+'\n');
 for(const e of errors)console.error('LIVE FAIL:',e);
 console.log('Live site health:',checks.length,'responses;',errors.length,'issues');
 if(errors.length)process.exitCode=1;
})();
