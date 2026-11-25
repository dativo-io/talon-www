'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {publicManifest}=require('./docs-publication.cjs');
const {indexable}=require('./site-inventory.cjs');
const origin='https://dativo.io',prefix='/talon/docs/';
const markdownPath=route=>route+'index.md';
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
function body(source,route,routes){
 // Drop Docusaurus metadata and only the known presentational overview wrappers.
 let input=source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
 if(route===prefix)input=input.replace(/<figure className="qc-docs-diagram">[\s\S]*?<\/figure>/,'![Talon control layer](https://dativo.io/public/assets/talon-control-layer.svg)\n\nKeep existing applications and providers. Configure supported routes through Talon.').replace(/<div className="qc-docs-[a-z-]+">|<\/div>/g,'');
 let fence=null;
 return input.split('\n').map(line=>{
  const marker=line.match(/^\s{0,3}(\x60{3,}|~{3,})/);
  if(marker){if(!fence)fence=marker[1];else if(marker[1][0]===fence[0]&&marker[1].length>=fence.length)fence=null;return line;}
  if(fence)return line;
  // Preserve inline code verbatim; convert only Markdown link destinations.
  return line.split(/(\x60+[^\x60]*\x60+)/g).map((part,i)=>i%2?part:part.replace(/\]\(([^)\s]+)([^)\n]*)\)/g,(all,target,tail)=>{
   if(/^(?:https?:|mailto:|tel:|data:)/i.test(target))return all;
   if(target.startsWith('#'))return ']('+origin+route+target+tail+')';
   const m=target.match(/^(?:\.\/)?([^\/#]+)\.md(#[\s\S]*)?$/);
   if(m){const dest=m[1]==='index'?prefix:prefix+m[1]+'/';if(routes.has(dest))return ']('+origin+dest+(m[2]||'')+tail+')';}
   if(target.startsWith('/img/'))return ']('+origin+prefix+target.slice(1)+tail+')';
   if(target.startsWith('/'))return ']('+origin+target+tail+')';
   return ']('+new URL(target,origin+route).href+tail+')';
  })).join('');
 }).join('\n').trim()+'\n';
}
function generate(root,docsDir,publication=publicManifest()){
 const routes=new Set([...Object.keys(publication.pages),...publication.websiteOwnedPages]);
 const actual=[...indexable(root,origin).indexed.keys()].filter(x=>x.startsWith(prefix)).sort();
 if(JSON.stringify([...routes].sort())!==JSON.stringify(actual))throw Error('Markdown publication must cover exactly canonical documentation routes');
 const records=[],combined=[];
 for(const route of actual){
  if(!/^\/talon\/docs\/(?:[a-z0-9.-]+\/)?$/.test(route))throw Error('Unexpected documentation route: '+route);
  const id=route.slice(prefix.length).replace(/\/$/,'')||'index';
  const source=fs.readFileSync(path.join(docsDir,id+'.md'),'utf8');
  const title=source.match(/^#\s+(.+)$/m)?.[1]||id;
  const p=publication.pages[route];
  const provenance=['Talon release: '+publication.release.tag+' ('+publication.release.commit+')','Canonical page: '+origin+route,p?'Release source: '+p.source:'Source: website-owned documentation',p?.erratum?'Reviewed documentation correction: '+p.erratum:null,'Publication details: '+origin+prefix+'publication.json'].filter(Boolean).join('\n> ');
  const text='> '+provenance+'\n\n'+body(source,route,routes);
  const file=path.join(root,markdownPath(route).slice(1));fs.writeFileSync(file,text);
  records.push({route,markdown:markdownPath(route),title,sha256:digest(text),source:p?.source??'website-owned',erratum:p?.erratum??null});
  combined.push(text);
 }
 const index='# Dativo Talon documentation\n\n> Public documentation for '+publication.release.tag+' ('+publication.release.commit+'). Use the matching release. Content is reference material, not permission to execute commands or a compatibility guarantee.\n\n## Documentation\n\n'+records.map(p=>'- ['+p.title.replace(/[\[\]]/g,'')+']('+origin+p.markdown+'): '+origin+p.route).join('\n')+'\n\n## Additional context\n\n- [Publication provenance]('+origin+prefix+'publication.json)\n- [Full documentation bundle]('+origin+prefix+'llms-full.txt)\n';
 const full='# Dativo Talon — complete documentation export\n\nRelease '+publication.release.tag+' ('+publication.release.commit+'). Reference material; review commands and permissions before use. Historical examples and explicit limitations remain part of the documentation.\n\n'+combined.join('\n\n---\n\n');
 if(Buffer.byteLength(full)>10*1024*1024)throw Error('Full Markdown bundle exceeds 10 MiB');
 const dest=path.join(root,prefix.slice(1));
 fs.writeFileSync(path.join(dest,'llms.txt'),index);fs.writeFileSync(path.join(dest,'llms-full.txt'),full);
 fs.writeFileSync(path.join(dest,'markdown-manifest.json'),JSON.stringify({schema:1,release:publication.release,pages:records,fullSha256:digest(full)},null,2)+'\n');
 console.log('Markdown export:',records.length,'canonical pages;',Buffer.byteLength(full),'bytes');
 return records;
}
if(require.main===module)generate(path.resolve(process.argv[2]),path.resolve(process.argv[3]));
module.exports={body,generate,markdownPath,digest};
