#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const catalog=require('./edition-capabilities.json');
const {manifest}=require('./docs-publication.cjs');
const root=path.resolve(__dirname,'..');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function validate(c=catalog,release=manifest.release) {
 if(c.schema!==1||!Array.isArray(c.rows)||!c.rows.length)throw Error('Invalid edition catalog');
 const seen=new Set();let enterprise=false;
 for(const r of c.rows){
   if(!/^[a-z0-9-]+$/.test(r.id)||seen.has(r.id)||!r.label||[r.label,r.detail,r.community?.label??''].some(s=>typeof s!=='string'||/[\r\n|<>]/.test(s)))throw Error('Invalid edition row '+r.id);
   seen.add(r.id);
   if(r.group==='core'){
     if(enterprise||r.community.status!=='included'||r.enterprise.status!=='included'||r.evidence?.type!=='released-documentation'||r.evidence.release!==release.commit||!/^(docs\/[a-zA-Z0-9/_.-]+|LIMITATIONS\.md)$/.test(r.evidence.path)||r.evidence.path.includes('..'))throw Error('Invalid core scope '+r.id);
   }else if(r.group==='enterprise'){
     enterprise=true;
     if(r.community.status!=='local-alternative'||!r.community.label||r.enterprise.status!=='pilot-scope'||r.evidence?.type!=='commercial-scope'||r.evidence.reference!=='https://dativo.io/enterprise/')throw Error('Unverified enterprise scope '+r.id);
   }else throw Error('Invalid group '+r.group);
 }
 if(!enterprise||!c.rows.some(r=>r.group==='core'))throw Error('Missing edition group');
 return c.rows;
}
function markdown(c=catalog){
 return ['| Capability | Talon Community | Talon Enterprise |','| --- | --- | --- |',...validate(c).map(r=>'| '+r.label+' | '+(r.community.status==='included'?'Included':r.community.label)+' | '+(r.enterprise.status==='included'?'Included':'Pilot scope')+' |')].join('\n');
}
function html(c=catalog){
 const rows=validate(c);
 const check=label=>'<span class="ep-check" aria-label="'+label+'">✓</span>';
 let group='';
 return rows.flatMap(r=>{
  const output=[];
  if(group!==r.group){group=r.group;output.push('            <tr class="ep-group"><th scope="rowgroup" colspan="3">'+(group==='core'?'Core controls · Shared by both editions':'Enterprise adds · Company-wide operations')+'</th></tr>');}
  output.push('            <tr><th scope="row">'+escape(r.label)+(r.detail?'<small>'+escape(r.detail)+'</small>':'')+'</th>'+(r.community.status==='included'?'<td>'+check('Included')+'</td>':'<td class="ep-community"><span class="ep-minus" aria-hidden="true">−</span> '+escape(r.community.label)+'</td>')+'<td>'+check(r.enterprise.status==='included'?'Included':'Enterprise pilot capability')+'</td></tr>');
  return output;
 }).join('\n');
}
function replaceOnce(input,pattern,replacement){
 const matches=[...input.matchAll(pattern)];if(matches.length!==1)throw Error('Expected one edition table, got '+matches.length);
 return input.replace(pattern,()=>replacement);
}
function renderMarketing(input){return replaceOnce(input,/<tbody>\n[\s\S]*?\n          <\/tbody>/g,'<tbody>\n'+html()+'\n          </tbody>');}
function renderDocs(input){return replaceOnce(input,/^\| Capability \| Talon Community \| Talon Enterprise \|\n(?:\|[^\n]+\|\n?)+/gm,markdown()+'\n');}
function main(){
 const cmd=process.argv[2];if(!['--check','--write'].includes(cmd))throw Error('Use --check or --write');
 for(const [file,render] of [['enterprise/index.html',renderMarketing],['docs-site/docs/open-source-and-enterprise.md',renderDocs]]){
  const p=path.join(root,file),before=fs.readFileSync(p,'utf8'),after=render(before);
  if(before!==after){if(cmd==='--check')throw Error('Stale edition comparison: '+file+'; run node scripts/edition-comparison.cjs --write');fs.writeFileSync(p,after);}
 }
 console.log('Edition comparison generated from '+validate().length+' canonical capabilities.');
}
if(require.main===module)main();
module.exports={validate,markdown,html,renderMarketing,renderDocs};
