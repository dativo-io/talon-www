#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const manifest = require('./docs-publication.json');
const sourceMap = require('../docs-site/src/source-map.cjs');
const sha = /^[0-9a-f]{40}$/;
function validate(m = manifest) {
  if (m.schema !== 1 || m.channel !== 'stable' || !/^v\d+\.\d+\.\d+$/.test(m.release?.tag) ||
      !sha.test(m.release.commit) || m.release.repository !== 'https://github.com/dativo-io/talon' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(m.release.releasedOn) || !Array.isArray(m.errata)) throw Error('Invalid stable docs release manifest');
  const seen = new Set();
  for (const e of m.errata) {
    if (!Object.values(sourceMap).includes(e.path) || seen.has(e.path) || !sha.test(e.originalBlob) ||
        !sha.test(e.correctedBlob) || !sha.test(e.sourceCommit) ||
        !/^https:\/\/github\.com\/dativo-io\/talon\/pull\/\d+$/.test(e.review) || !e.hunks?.length) throw Error('Invalid erratum: '+e.path);
    seen.add(e.path);
    let end = 0;
    for (const h of e.hunks) {
      if (!Number.isInteger(h.startLine) || h.startLine < 1 || h.startLine <= end ||
          !Array.isArray(h.remove) || !Array.isArray(h.insert) || (!h.remove.length && !h.insert.length) ||
          [...h.remove,...h.insert].some(x=>typeof x !== 'string' || x.includes('\n'))) throw Error('Invalid erratum hunk: '+e.path);
      end = h.startLine + Math.max(1,h.remove.length)-1;
    }
  }
  return m;
}
function blob(text) {
  const b=Buffer.from(text,'utf8');
  return crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
}
function applyErratum(text,e) {
  if (blob(text)!==e.originalBlob) throw Error('Erratum base blob mismatch: '+e.path);
  const lines=text.split('\n');
  for (const h of [...e.hunks].reverse()) {
    const start=h.startLine-1;
    if (start>lines.length || JSON.stringify(lines.slice(start,start+h.remove.length))!==JSON.stringify(h.remove)) throw Error('Erratum context mismatch: '+e.path);
    lines.splice(start,h.remove.length,...h.insert);
  }
  const out=lines.join('\n');
  if(blob(out)!==e.correctedBlob) throw Error('Erratum result blob mismatch: '+e.path);
  return out;
}
function checkCheckout(root,m=manifest) {
  validate(m);
  const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
  if(git('rev-parse','HEAD')!==m.release.commit) throw Error('Talon checkout must match the approved stable release commit '+m.release.commit);
  if(git('status','--porcelain','--untracked-files=all')) throw Error('Talon checkout must be clean');
  for(const source of Object.values(sourceMap)) {
    const file=path.join(root,source);
    if(!fs.statSync(file).isFile() || fs.lstatSync(file).isSymbolicLink()) throw Error('Invalid mapped source '+source);
    if(blob(fs.readFileSync(file,'utf8'))!==git('rev-parse','HEAD:'+source)) throw Error('Mapped source bytes differ from release: '+source);
  }
  for(const e of m.errata) applyErratum(fs.readFileSync(path.join(root,e.path),'utf8'),e);
}
function publicManifest(m=manifest) {
  validate(m);
  return {schema:m.schema,channel:m.channel,release:m.release,
    websiteOwnedPages:['/talon/docs/','/talon/docs/coding-agents-demo/','/talon/docs/use-case-playbooks/','/talon/docs/evaluation-checklist/','/talon/docs/open-source-and-enterprise/'],
    errata:m.errata.map(({hunks,...e})=>e),
    pages:Object.fromEntries(Object.entries(sourceMap).map(([page,source])=>['/talon/docs/'+page.replace(/\.md$/,'')+'/',{source,sourceCommit:m.release.commit,erratum:m.errata.find(e=>e.path===source)?.sourceCommit??null}]))};
}
function main() {
  const [cmd,root]=process.argv.slice(2);validate();
  if(cmd==='tag') console.log(manifest.release.tag);
  else if(cmd==='commit') console.log(manifest.release.commit);
  else if(cmd==='check' && root) {checkCheckout(root);console.log('Verified stable Talon checkout and '+manifest.errata.length+' errata: '+manifest.release.tag);}
  else if(cmd==='public' && root) fs.writeFileSync(root,JSON.stringify(publicManifest(),null,2)+'\n');
  else throw Error('Usage: docs-publication.cjs tag|commit|check <checkout>|public <output>');
}
if(require.main===module) main();
module.exports={manifest,validate,blob,applyErratum,checkCheckout,publicManifest};
