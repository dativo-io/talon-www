'use strict';
// GFM task lists are static in documentation. Preserve status as readable text
// instead of rendering disabled, unlabeled form controls. The source Markdown
// and machine-readable exports retain their original checkbox syntax.
module.exports=function accessibleTaskLists(){
 return tree=>{
  function visit(node){
   if(node.type==='listItem'&&typeof node.checked==='boolean'){
    const label=node.checked?'Completed: ':'Not completed: ';
    const first=node.children?.[0];
    if(first?.type==='paragraph')first.children.unshift({type:'text',value:label});
    else node.children.unshift({type:'paragraph',children:[{type:'text',value:label.trim()}]});
    node.checked=null;
   }
   for(const child of node.children||[])visit(child);
  }
  visit(tree);
 };
};
