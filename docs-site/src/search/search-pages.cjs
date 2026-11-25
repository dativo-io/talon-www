'use strict';
const normal = value => String(value||'').toLowerCase().replace(/\s+/g,' ').trim();
function searchPages(pages, query, limit=10) {
 const q=normal(query).slice(0,160);
 if(!q)return [];
 const terms=[...new Set(q.split(' ').filter(Boolean))].slice(0,12);
 return pages.flatMap(page=>{
   const title=normal(page.title),headings=normal(page.headings.join(' ')),body=normal(page.text),route=normal(page.route);
   const combined=[title,headings,route,body].join(' ');
   if(!terms.every(t=>combined.includes(t)))return [];
   const score=(title.includes(q)?60:0)+(headings.includes(q)?25:0)+(body.includes(q)?5:0)+terms.reduce((n,t)=>n+(title.includes(t)?15:0)+(headings.includes(t)?6:0)+(route.includes(t)?4:0)+(body.includes(t)?1:0),0);
   const match=body.indexOf(q), offset=match>=0?match:body.indexOf(terms[0]);
   const start=Math.max(0,offset-55),end=Math.min(page.text.length,start+180);
   const snippet=(start?'…':'')+page.text.slice(start,end)+(end<page.text.length?'…':'');
   return [{route:page.route,title:page.title,snippet,score}];
 }).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)||a.route.localeCompare(b.route)).slice(0,limit);
}
module.exports={searchPages};
