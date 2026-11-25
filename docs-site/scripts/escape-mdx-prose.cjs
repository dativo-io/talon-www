'use strict';
// MDX needs literal prose angle brackets escaped. Code spans and fenced
// blocks already have their own literal-text semantics: never escape them.
function escapeInline(text){
 const runs=[...text.matchAll(/\x60+/g)];
 const escapedAt=i=>{let n=0;while(i>0&&text[--i]==='\\')n++;return n%2===1;};
 let out='',cursor=0;
 for(let i=0;i<runs.length;i++){
  const open=runs[i];
  if(escapedAt(open.index))continue;
  let close=i+1;
  while(close<runs.length&&runs[close][0].length!==open[0].length)close++;
  if(close===runs.length)continue;
  out+=text.slice(cursor,open.index).replace(/</g,'&lt;')+text.slice(open.index,runs[close].index+runs[close][0].length);
  cursor=runs[close].index+runs[close][0].length;i=close;
 }
 return out+text.slice(cursor).replace(/</g,'&lt;');
}
function escapeMdxJsxOutsideCode(markdown){
 const lines=markdown.split('\n');
 let fence=null,prose=[],out=[];
 const flush=()=>{if(prose.length){out.push(escapeInline(prose.join('\n')));prose=[];}};
 for(const line of lines){
  const marker=line.match(/^\s*(\x60{3,}|~{3,})(.*)$/);
  if(fence){
   out.push(line);
   if(marker&&marker[1][0]===fence[0]&&marker[1].length>=fence.length&&!marker[2].trim())fence=null;
  }else if(marker&&(marker[1][0]==='~'||!marker[2].includes('\x60'))){
   flush();fence=marker[1];out.push(line);
  }else if(!line.trim()){
   flush();out.push(line);
  }else prose.push(line);
 }
 flush();return out.join('\n');
}
module.exports={escapeMdxJsxOutsideCode};
