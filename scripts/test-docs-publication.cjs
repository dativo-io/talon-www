'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {execFileSync}=require('node:child_process');
const {manifest,validate,blob,applyErratum,checkCheckout,publicManifest}=require('./docs-publication.cjs');
const edition=require('./edition-comparison.cjs');
const catalog=require('./edition-capabilities.json');
const sources=require('../docs-site/src/source-map.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));

test('publication pins stable release and maps reviewed corrections',()=>{
 assert.equal(validate().channel,'stable');
 const p=publicManifest();
 assert.equal(Object.keys(p.pages).length,Object.keys(sources).length);
 assert.equal(p.errata.length,manifest.errata.length);
 for(const e of p.errata){
  assert.equal(Object.hasOwn(e,'hunks'),false);
  assert.ok(Object.values(p.pages).some(x=>x.source===e.path&&x.erratum===e.sourceCommit));
 }
 const invalid=clone(manifest);invalid.release.tag='main';
 assert.throws(()=>validate(invalid),/Invalid stable/);
 const duplicate=clone(manifest);duplicate.errata.push(duplicate.errata[0]);
 assert.throws(()=>validate(duplicate),/Invalid erratum/);
});

test('errata require both original and corrected blob integrity',()=>{
 const before='a\nb\nc\n',after='a\nreplacement\nc\n';
 const e={path:'fixture.md',originalBlob:blob(before),correctedBlob:blob(after),
 hunks:[{startLine:2,remove:['b'],insert:['replacement']}]};
 assert.equal(applyErratum(before,e),after);
 assert.throws(()=>applyErratum(before+'dirty',e),/base blob/);
 assert.throws(()=>applyErratum(before,{...e,hunks:[{startLine:2,remove:['wrong'],insert:['replacement']}]}),/context mismatch/);
 assert.throws(()=>applyErratum(before,{...e,correctedBlob:blob('wrong')}),/result blob/);
});

test('checkout must match approved commit and clean source bytes',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'talon-release-test-'));
 try{
  const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  git('init','-q');
  for(const source of Object.values(sources)){const f=path.join(root,source);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,'fixture\n');}
  git('add','.');git('-c','user.name=Test','-c','user.email=test@example.invalid','commit','-qm','fixture');
  const m={...manifest,release:{...manifest.release,commit:git('rev-parse','HEAD')},errata:[]};
  assert.doesNotThrow(()=>checkCheckout(root,m));
  assert.throws(()=>checkCheckout(root,{...m,release:{...m.release,commit:'0'.repeat(40)}}),/approved stable release/);
  fs.appendFileSync(path.join(root,Object.values(sources)[0]),'changed');
  assert.throws(()=>checkCheckout(root,m),/checkout must be clean/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('both edition tables are reproducibly generated and reject unverified availability',()=>{
 const root=path.resolve(__dirname,'..');
 const marketing=fs.readFileSync(path.join(root,'enterprise/index.html'),'utf8');
 const docs=fs.readFileSync(path.join(root,'docs-site/docs/open-source-and-enterprise.md'),'utf8');
 assert.equal(edition.renderMarketing(marketing),marketing);
 assert.equal(edition.renderDocs(docs),docs);
 assert.equal(edition.renderDocs(docs.replace('| Included | Included |','| Incorrect | Included |')),docs);
 const rows=edition.validate();
 assert.equal((edition.html().match(/class="ep-check"/g)||[]).length,rows.length+rows.filter(x=>x.group==='core').length);
 const wrong=clone(catalog);wrong.rows.find(x=>x.group==='enterprise').enterprise.status='included';
 assert.throws(()=>edition.validate(wrong),/Unverified enterprise scope/);
 const stale=clone(catalog);stale.rows[0].evidence.release='0'.repeat(40);
 assert.throws(()=>edition.validate(stale),/Invalid core scope/);
});
