#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {indexable,tags} = require('./site-inventory.cjs');
const root = path.resolve(process.argv[2] || 'dist');
const origin = (process.env.SITE_URL || 'https://dativo.io').replace(/\/$/,'');
const strict = process.argv.includes('--strict');
const {pages,indexed,excluded,redirects} = indexable(root,origin);
const issues = [], warnings = [], inbound = new Map(), titles = new Map(), descriptions = new Map();
const priority = new Set(['/','/use-cases/','/solutions/n8n/','/pilot/','/enterprise/','/use-cases/customer-support/','/use-cases/vendor-contract-review/','/use-cases/people-analytics/','/use-cases/coding-agents/']);
const social = ['og:title','og:description','og:image','twitter:title','twitter:description','twitter:image'];
const decode = value => value.replace(/&(amp|quot|lt|gt|apos|#39);/g, (_,k)=>({amp:'&',quot:'"',lt:'<',gt:'>',apos:"'",'#39':"'"})[k]);
function note(kind,route,detail,hard=false) { (hard?issues:warnings).push({kind,route,detail}); }
function resolve(raw,route) {
  let url;
  try { url = new URL(decode(raw),origin+route); } catch { return {invalid:true}; }
  if (url.origin !== origin) return {external:true};
  let pathname;
  try { pathname=decodeURIComponent(url.pathname); } catch { return {invalid:true}; }
  if (pathname.includes('\0')) return {invalid:true};
  const redirect = redirects.get(pathname);
  if (redirect) return {redirect};
  const target = pathname.endsWith('/index.html') ? pathname.slice(0,-10) : pathname;
  const pageRoute = pages.has(target) ? target : pages.has(target+'/') ? target+'/' : null;
  if (pageRoute) return {route:pageRoute,hash:url.hash};
  const file=path.resolve(root,'.'+pathname);
  if (file.startsWith(root+path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) return {asset:true};
  return {missing:pathname};
}
for (const [route,page] of indexed) {
  const html=page.html;
  const marketing=!route.startsWith('/talon/docs/');
  if (marketing) {
    const title=html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
    const meta=tags(html,'meta');
    const desc=meta.filter(t=>t.name==='description');
    if (!title || desc.length!==1 || !desc[0].content?.trim()) note('metadata',route,'Missing unique title/description',true);
    for (const [value,seen,kind] of [[title,titles,'duplicate title'],[desc[0]?.content,descriptions,'duplicate description']]) {
      if (!value) continue;
      const key=decode(value).trim().toLowerCase();
      if (seen.has(key)) note(kind,route,seen.get(key),true); else seen.set(key,route);
    }
    if ((html.match(/<h1\b/gi)||[]).length!==1) note('heading',route,'Expected one H1',true);
    if (html.includes('class="site-nav"')) {
      for (const key of social) {
        const entries=meta.filter(t=>(t.name||t.property)===key);
        if(entries.length!==1||!entries[0].content) note('social metadata',route,key,true);
        else if(key.endsWith(':image') && !resolve(entries[0].content,route).asset) note('missing social image',route,entries[0].content,true);
      }
    }
    for (const m of html.matchAll(/<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/gi)) {
      try { JSON.parse(m[1]); } catch(e) { note('JSON-LD',route,e.message,true); }
    }
  }
  for (const a of tags(html,'a')) {
    if (!a.href || a.href==='#') continue;
    const result=resolve(a.href,route);
    if (result.route) {
      if (result.route!==route) inbound.set(result.route,(inbound.get(result.route)||0)+1);
      if (result.hash && result.hash!=='#') {
        let id; try { id=decodeURIComponent(result.hash.slice(1)); } catch { id=null; }
        const dest=pages.get(result.route).html;
        const anchors=new Set([...dest.matchAll(/\b(?:id|name)=["']([^"']+)["']/gi)].map(m=>m[1]));
        if (id && !anchors.has(id)) note('missing anchor',route,a.href,marketing && priority.has(route) && !result.route.startsWith('/talon/docs/'));
      }
    } else if (result.missing||result.invalid) note('broken link',route,a.href,marketing&&priority.has(route));
    else if (result.redirect) note('redirect link',route,a.href+' -> '+result.redirect);
  }
}
for (const route of indexed.keys()) if (route!=='/' && !inbound.has(route)) note('orphan candidate',route,'No incoming indexable HTML link found',priority.has(route));
for (const route of priority) if (!indexed.has(route)) note('missing priority',route,'Not indexable',true);
const report={canonical:indexed.size,excluded:excluded.size,marketing:[...indexed.keys()].filter(r=>!r.startsWith('/talon/docs/')).length,issues,warnings};
const output=path.resolve(process.env.SITE_AUDIT_REPORT||'site-audit.json');
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
for(const issue of issues) console.error('AUDIT FAIL:',issue.kind,issue.route,issue.detail);
for(const issue of warnings.slice(0,30)) console.log('AUDIT REVIEW:',issue.kind,issue.route,issue.detail);
console.log('Audit: '+issues.length+' blocking issues; '+warnings.length+' review findings. Full report: '+output);
if(issues.length||(strict&&warnings.some(w=>w.kind==='broken link'||w.kind==='missing anchor'||w.kind==='orphan candidate'))) process.exit(1);
