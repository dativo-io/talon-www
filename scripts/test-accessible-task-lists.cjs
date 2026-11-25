'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const transform=require('../docs-site/src/remark/accessible-task-lists.cjs')();
test('static task lists preserve status, links, nesting and code',()=>{
 const link={type:'link',url:'https://example.org',children:[{type:'text',value:'Review'}]};
 const code={type:'code',value:'- [ ] keep this literal'};
 const child={type:'listItem',checked:true,children:[{type:'paragraph',children:[{type:'text',value:'Nested'}]}]};
 const item={type:'listItem',checked:false,children:[{type:'paragraph',children:[link]},{type:'list',children:[child]},code]};
 const ordinary={type:'listItem',children:[{type:'paragraph',children:[{type:'text',value:'Ordinary'}]}]};
 const tree={type:'root',children:[{type:'list',children:[item,ordinary]}]};
 transform(tree);assert.equal(item.checked,null);assert.equal(item.children[0].children[0].value,'Not completed: ');
 assert.equal(item.children[0].children[1],link);assert.equal(child.children[0].children[0].value,'Completed: ');
 assert.equal(child.checked,null);assert.equal(ordinary.children[0].children[0].value,'Ordinary');
 assert.equal(code.value,'- [ ] keep this literal');
});
