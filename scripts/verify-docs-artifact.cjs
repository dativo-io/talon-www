'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {publicManifest}=require('./docs-publication.cjs');
const {indexable}=require('./site-inventory.cjs');
const prefix='/talon/docs/',origin='https://dativo.io';
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const routeList=p=>[...Object.keys(p.pages),...p.websiteOwnedPages].sort();
function verify(root,expected=publicManifest()){
 const read=p=>fs.readFileSync(path.join(root,p.slice(1)),'utf8');
 const json=p=>JSON.parse(read(prefix+p));
 const publication=json('publication.json'),manifest=json('markdown-manifest.json'),search=json('search-index.json');
 assert.deepEqual(publication,expected,'published provenance differs from approved source');
 assert.equal(manifest.schema,1);assert.deepEqual(manifest.release,expected.release);
 const routes=routeList(expected);
 assert.equal(new Set(routes).size,routes.length,'duplicate publication route');
 assert.deepEqual([...indexable(root,origin).indexed.keys()].filter(r=>r.startsWith(prefix)).sort(),routes,'HTML inventory mismatch');
 assert.equal(search.schema,1);assert.deepEqual(search.pages.map(p=>p.route).sort(),routes,'search inventory mismatch');
 assert.deepEqual(manifest.pages.map(p=>p.route).sort(),routes,'Markdown inventory mismatch');
 const urls=[...read(prefix+'sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).sort();
 assert.deepEqual(urls,routes.map(r=>origin+r),'docs sitemap inventory mismatch');
 const llms=read(prefix+'llms.txt'),full=read(prefix+'llms-full.txt');
 assert.ok(llms.includes(expected.release.commit)&&full.includes(expected.release.commit),'index and bundle release provenance');
 assert.equal(digest(full),manifest.fullSha256,'bundle digest mismatch');
 assert.ok(Buffer.byteLength(full)<=10*1024*1024,'bundle exceeds budget');
 for(const p of manifest.pages){
  assert.match(p.route,/^\/talon\/docs\/(?:[a-z0-9.-]+\/)?$/);
  assert.equal(p.markdown,p.route+'index.md','noncanonical Markdown export');
  const source=expected.pages[p.route];
  assert.equal(p.source,source?.source??'website-owned');assert.equal(p.erratum,source?.erratum??null);
  const text=read(p.markdown);
  assert.equal(digest(text),p.sha256,'Markdown digest mismatch: '+p.route);
  assert.ok(text.includes('Talon release: '+expected.release.tag+' ('+expected.release.commit+')')&&text.includes('Canonical page: '+origin+p.route),'Markdown provenance missing: '+p.route);
  assert.ok(llms.includes(']('+origin+p.markdown+')')&&full.includes(text),'missing discovery or full bundle entry: '+p.route);
  const html=read(p.route+'index.html');
  assert.ok(html.includes('href="'+p.markdown+'"')&&html.includes('data-doc-copy="true"'),'missing Markdown controls: '+p.route);
 }
 console.log('PASS documentation artifact: '+routes.length+' canonical routes, HTML/search/sitemap/Markdown parity, provenance and SHA-256');
 return routes.length;
}
if(require.main===module)verify(path.resolve(process.argv[2]||'dist'));
module.exports={verify,routeList,digest};
