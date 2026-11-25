#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {htmlPages,pageInfo,indexable}=require('./site-inventory.cjs');
const prefix='/talon/docs/';
const origin='https://dativo.io';
function plain(html){
 return html.replace(/<(script|style|button|nav)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
   .replace(/<[^>]*>/g,' ').replace(/&(#x[0-9a-f]+|#\d+|amp|quot|lt|gt|apos|nbsp);/gi,(_,v)=>{
     if(v.startsWith('#')){const n=v[1].toLowerCase()==='x'?parseInt(v.slice(2),16):Number(v.slice(1));return n>0&&n<=0x10ffff?String.fromCodePoint(n):' ';}
     return {amp:'&',quot:'"',lt:'<',gt:'>',apos:"'",nbsp:' '}[v.toLowerCase()]||' ';
   }).replace(/\s+/g,' ').trim();
}
function entry(route,html){
 const article=html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1];
 if(!article)throw Error('Missing documentation article: '+route);
 const title=plain(article.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'');
 const headings=[...article.matchAll(/<h[234]\b[^>]*>([\s\S]*?)<\/h[234]>/gi)].map(x=>plain(x[1]).replace(/[\u200b#]+$/,'').trim()).filter(Boolean);
 const text=plain(article);
 if(!title||!text)throw Error('Empty searchable doc: '+route);
 return {route,title,headings,text};
}
function build(root){
 const pages=[];
 for(const [relative,p] of htmlPages(root)){
   const route=prefix+relative.slice(1);
   const {canonical,noindex}=pageInfo(p.html);
   if(noindex||canonical.length&&canonical[0]!==origin+route)continue;
   pages.push(entry(route,p.html));
 }
 pages.sort((a,b)=>a.route.localeCompare(b.route));
 if(!pages.length||!pages.some(p=>p.route===prefix))throw Error('Missing docs search coverage');
 const data=JSON.stringify({schema:1,pages})+'\n';
 if(Buffer.byteLength(data)>5*1024*1024)throw Error('Docs search index exceeds 5 MiB budget; review index design');
 fs.writeFileSync(path.join(root,'search-index.json'),data);
 console.log('Search index:',pages.length,'pages,',Buffer.byteLength(data),'bytes');
 return pages;
}
function verify(root){
 const data=JSON.parse(fs.readFileSync(path.join(root,'talon/docs/search-index.json'),'utf8'));
 const expected=[...indexable(root,origin).indexed.keys()].filter(r=>r.startsWith(prefix)).sort();
 const actual=data.pages.map(p=>p.route).sort();
 if(data.schema!==1||JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Search index does not cover exactly the published canonical docs routes');
 console.log('Search index covers all '+actual.length+' canonical docs routes.');
}
if(require.main===module){const [arg,root]=process.argv.slice(2);if(arg==='--verify')verify(path.resolve(root));else build(path.resolve(arg||'docs-site/build'));}
module.exports={plain,entry,build,verify};
