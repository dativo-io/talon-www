'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {plain,entry,build}=require('./build-docs-search.cjs');
const {searchPages}=require('../docs-site/src/search/search-pages.cjs');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const page=(route,title,headings,text)=>({route,title,headings,text});
test('index extracts article and preserves exact syntax, not navigation or scripts',()=>{
 const html='<title>Fallback</title><nav>Ignore me</nav><article><h1>Cost &amp; policy</h1><h2>Budget</h2><p>Use <code><span>gateway</span><span>.</span><span>budget</span></code> &lt; 1.</p><button>Copy</button><script>tracking</script></article>';
 const p=entry('/talon/docs/cost/',html);
 assert.equal(p.title,'Cost & policy');assert.deepEqual(p.headings,['Budget']);
 assert.ok(p.text.includes('gateway.budget < 1.'));assert.ok(!/Ignore me|Copy|tracking/.test(p.text));
 assert.equal(plain('&#x2713; &#39;'),'✓ \'');
 assert.throws(()=>entry('/missing/','<nav>no article</nav>'),/Missing documentation article/);
});
test('search ranks title and headings, requires every term, supports exact configuration tokens',()=>{
 const pages=[page('/talon/docs/cost/','Cost governance',['Budget'], 'Configure cost caps with gateway.budget.'),page('/talon/docs/mcp/','Governed MCP tools',['Approval'],'Approval can depend on policy and budget.'),page('/talon/docs/other/','Other',['MCP tools'],'Governed MCP tools are described elsewhere.')];
 assert.equal(searchPages(pages,'governed MCP tools')[0].route,'/talon/docs/mcp/');
 assert.equal(searchPages(pages,'gateway.budget')[0].route,'/talon/docs/cost/');
 assert.equal(searchPages(pages,'budget approval')[0].route,'/talon/docs/mcp/');
 assert.deepEqual(searchPages(pages,'missing term'),[]);assert.deepEqual(searchPages(pages,'  '),[]);
 assert.equal(searchPages(pages,'budget',1).length,1);
 assert.ok(searchPages(pages,'gateway.budget')[0].snippet.includes('gateway.budget'));
});
test('index excludes aliases and noindex pages and covers canonical docs',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'talon-search-'));
 try{
  function write(rel,canonical,noindex=false){const file=path.join(root,rel,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'<link rel="canonical" href="'+canonical+'">'+(noindex?'<meta name="robots" content="noindex">':'')+'<article><h1>Guide</h1><p>Sample text.</p></article>');}
  write('','https://dativo.io/talon/docs/');write('guide','https://dativo.io/talon/docs/guide/');write('alias','https://dativo.io/talon/docs/guide/');write('private','https://dativo.io/talon/docs/private/',true);
  assert.deepEqual(build(root).map(p=>p.route),['/talon/docs/','/talon/docs/guide/']);
  const index=JSON.parse(fs.readFileSync(path.join(root,'search-index.json'),'utf8'));assert.equal(index.schema,1);assert.equal(index.pages.length,2);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
