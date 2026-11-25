import React,{useState,useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import Content from '@theme-original/DocItem/Content';

export default function DocItemContent(props){
 const {pathname}=useLocation();
 const route=pathname.endsWith('/')?pathname:pathname+'/';
 const url=route+'index.md';
 const [status,setStatus]=useState('');
 useEffect(()=>setStatus(''),[url]);
 async function copy(){
  setStatus('Copying…');
  try{
   const load=async()=>{const r=await fetch(url,{credentials:'same-origin'});if(!r.ok)throw Error('Markdown unavailable');return r.text();};
   if(typeof ClipboardItem!=='undefined'&&navigator.clipboard?.write){
    await navigator.clipboard.write([new ClipboardItem({'text/plain':load().then(s=>new Blob([s],{type:'text/plain'}))})]);
   }else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(await load());}
   else throw Error('Clipboard unavailable');
   setStatus('Markdown copied.');
  }catch{setStatus('Copy unavailable. Open Markdown to select and copy the text.');}
 }
 return <><div className="qc-doc-actions"><button type="button" data-doc-copy="true" onClick={copy}>Copy page as Markdown</button><a href={url} data-growth-intent="docs-markdown">View Markdown</a><span role="status">{status}</span></div><Content {...props}/></>;
}
