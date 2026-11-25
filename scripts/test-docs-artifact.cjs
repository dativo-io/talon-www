'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {verify,digest}=require('./verify-docs-artifact.cjs');
test('artifact audit rejects modified export, missing routes and absent controls',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'docs-artifact-')),route='/talon/docs/',md=route+'index.md',release={tag:'v1.17.0',commit:'a'.repeat(40)},publication={schema:1,release,pages:{},websiteOwnedPages:[route]};
 try{
  const dir=path.join(root,'talon/docs');fs.mkdirSync(dir,{recursive:true});
  const write=(n,s)=>fs.writeFileSync(path.join(dir,n),typeof s==='string'?s:JSON.stringify(s));
  const html='<article><h1>Guide</h1><button data-doc-copy="true">Copy</button><a href="'+md+'">View</a></article>';
  const text='> Talon release: '+release.tag+' ('+release.commit+')\n> Canonical page: https://dativo.io'+route+'\n\n# Guide\n';
  const full=release.commit+'\n'+text,search={schema:1,pages:[{route}]};
  write('index.html',html);write('index.md',text);write('publication.json',publication);write('search-index.json',search);
  write('sitemap.xml','<urlset><url><loc>https://dativo.io'+route+'</loc></url></urlset>');
  write('llms.txt',release.commit+'\n[Guide](https://dativo.io'+md+')');write('llms-full.txt',full);
  write('markdown-manifest.json',{schema:1,release,pages:[{route,markdown:md,source:'website-owned',erratum:null,sha256:digest(text)}],fullSha256:digest(full)});
  assert.equal(verify(root,publication),1);
  write('index.md',text+'tampered');assert.throws(()=>verify(root,publication),/Markdown digest mismatch/);
  write('index.md',text);write('search-index.json',{...search,pages:[]});assert.throws(()=>verify(root,publication),/search inventory mismatch/);
  write('search-index.json',search);write('index.html','<article>Guide</article>');assert.throws(()=>verify(root,publication),/missing Markdown controls/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
