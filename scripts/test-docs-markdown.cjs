'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {body,markdownPath,generate,digest}=require('./build-docs-markdown.cjs');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
test('exports preserve code, normalize page links, strip only known presentation',()=>{
 const routes=new Set(['/talon/docs/','/talon/docs/configuration/']);
 const input='---\ntitle: Example\n---\n# Hello\n<div className="qc-docs-start-card">\n[config](./configuration.md#x) [section](#here) ![image](/img/test.webp)\n</div>\n'+ '\x60\x60\x60bash\n[code](./configuration.md)\n\x60\x60\x60\n'+ '\x60[inline](./configuration.md)\x60\n';
 const out=body(input,'/talon/docs/',routes);
 assert.ok(out.includes('[config](https://dativo.io/talon/docs/configuration/#x)'));
 assert.ok(out.includes('[section](https://dativo.io/talon/docs/#here)'));
 assert.ok(out.includes('https://dativo.io/talon/docs/img/test.webp'));
 assert.ok(out.includes('\x60\x60\x60bash\n[code](./configuration.md)\n\x60\x60\x60'));
 assert.ok(out.includes('\x60[inline](./configuration.md)\x60'));
 assert.ok(!out.includes('className')&&!out.includes('title: Example'));
 assert.equal(markdownPath('/talon/docs/'),'/talon/docs/index.md');
});
test('exports cover all canonical pages with hashes and release provenance',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'talon-md-'));
 try{
  const docs=path.join(root,'source'),out=path.join(root,'dist');fs.mkdirSync(docs);
  const route='/talon/docs/',release={tag:'v1.17.0',commit:'a'.repeat(40)};
  const p={release,pages:{},websiteOwnedPages:[route]};
  fs.mkdirSync(path.join(out,'talon/docs'),{recursive:true});
  fs.writeFileSync(path.join(out,'talon/docs/index.html'),'<article><h1>Guide</h1></article>');
  fs.writeFileSync(path.join(docs,'index.md'),'# Guide\n\nExample.\n');
  const records=generate(out,docs,p);
  const dest=path.join(out,'talon/docs'),md=fs.readFileSync(path.join(dest,'index.md'),'utf8');
  assert.equal(records.length,1);assert.equal(records[0].sha256,digest(md));assert.ok(md.includes(release.commit));
  assert.ok(fs.readFileSync(path.join(dest,'llms-full.txt'),'utf8').includes(md));
  assert.throws(()=>generate(out,docs,{...p,websiteOwnedPages:[]}),/exactly canonical/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
