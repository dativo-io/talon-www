#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {indexable,pageInfo}=require('./site-inventory.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'talon-seo-'));
const origin='https://dativo.io';
function write(rel,content){const file=path.join(root,rel);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);}
function page(route,extra=''){return '<html><head><link href="'+origin+route+'" rel="canonical">'+extra+'</head><body></body></html>'}
try{
  write('index.html',page('/'));
  write('solutions/n8n/index.html',page('/solutions/n8n/'));
  write('talon/docs/index.html',page('/talon/docs/'));
  write('talon/docs/404.html','404');
  write('404.html','404');
  write('alias/index.html',page('/'));
  write('private/index.html',page('/private/',"<meta content='follow,noindex' name='robots'>"));
  write('talon/docs/hidden/index.html',page('/talon/docs/hidden/','<meta name="googlebot" content="noindex">'));
  write('old/index.html',page('/old/'));
  write('_redirects','/old/ /solutions/n8n/ 301\n');
  const r=indexable(root,origin);
  assert.deepEqual([...r.indexed.keys()].sort(),['/','/solutions/n8n/','/talon/docs/']);
  assert.equal(r.excluded.get('/old/'),'redirect');
  assert.equal(r.excluded.get('/alias/'),'canonical alias');
  assert.equal(r.excluded.get('/private/'),'noindex');
  assert.equal(r.excluded.get('/talon/docs/hidden/'),'noindex');
  assert.ok(pageInfo("<meta name='robots' content='NOINDEX, follow'>").noindex);
  console.log('PASS canonical inventory, noindex, alias, redirect and nested 404 exclusions');
}finally{fs.rmSync(root,{recursive:true,force:true});}
