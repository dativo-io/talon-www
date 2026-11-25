import React,{useCallback,useEffect,useId,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {searchPages} from '../../search/search-pages.cjs';

export default function SearchBar(){
 const indexUrl=useBaseUrl('search-index.json');
 const dialog=useRef(null),trigger=useRef(null),field=useRef(null),links=useRef(null);
 const opener=useRef(null),inflight=useRef(null);
 const [pages,setPages]=useState(null),[query,setQuery]=useState(''),[failed,setFailed]=useState(false);
 const id=useId();
 const [mounted,setMounted]=useState(false);
 useEffect(()=>setMounted(true),[]);
 const results=useMemo(()=>searchPages(pages||[],query),[pages,query]);
 const open=useCallback(()=>{
   if(!dialog.current||dialog.current.open)return;
   opener.current=document.activeElement;
   setQuery('');setFailed(false);dialog.current.showModal();field.current?.focus();
   if(!pages&&!inflight.current){
     inflight.current=fetch(indexUrl,{credentials:'same-origin'}).then(r=>{
       if(!r.ok)throw Error('Search index unavailable');
       return r.json();
     }).then(data=>{
       if(data.schema!==1||!Array.isArray(data.pages))throw Error('Invalid index');
       setPages(data.pages);
     }).catch(()=>setFailed(true)).finally(()=>{inflight.current=null;});
   }
 },[indexUrl,pages]);
 useEffect(()=>{
   const shortcut=e=>{
     if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'&&!e.altKey){e.preventDefault();open();}
   };
   window.addEventListener('keydown',shortcut);
   return ()=>window.removeEventListener('keydown',shortcut);
 },[open]);
 function close(){dialog.current?.close();}
 function restore(){if(opener.current instanceof HTMLElement&&opener.current.isConnected)opener.current.focus();else trigger.current?.focus();}
 function keys(e){
   if(!dialog.current?.open)return;
   if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
   const items=[...links.current.querySelectorAll('a')];if(!items.length)return;
   const index=items.indexOf(e.target.closest?.('a'));
   if(e.target!==field.current&&index<0)return;
   e.preventDefault();e.stopPropagation();
   if(e.key==='ArrowDown')items[Math.min(index+1,items.length-1)].focus({preventScroll:true});
   else if(index<=0)field.current.focus();else items[index-1].focus();
 }

 const status=failed?'Search is unavailable. Close and reopen to retry, or browse the sidebar.':!pages?'Loading documentation index…':!query.trim()?'Search guides, configuration and technical reference.':results.length?results.length+' matching pages shown.':'No matching pages. Try fewer words or an exact configuration name.';
 return <>
   <button ref={trigger} type="button" className="qc-search-trigger" aria-label="Search documentation" aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K" onClick={open}>
     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
     <span>Search documentation</span>
   </button>
   {mounted&&createPortal(<dialog ref={dialog} className="qc-search-dialog" aria-labelledby={id+'-label'} onClose={restore} onKeyDownCapture={keys}>
     <div className="qc-search-head"><label id={id+'-label'} htmlFor={id+'-query'}>Search documentation</label><button className="qc-search-close" type="button" onClick={close}>Close</button></div>
     <input ref={field} id={id+'-query'} className="qc-search-input" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. MCP, budget, backup" autoComplete="off" spellCheck={false} maxLength={160} />
     <p role="status" className="qc-search-status">{status}</p>
     <ul ref={links} className="qc-search-results">{results.map(r=><li key={r.route}><a href={r.route} tabIndex={0} onClick={close}><strong>{r.title}</strong><span>{r.snippet}</span></a></li>)}</ul>
   </dialog>,document.body)}
 </>;
}
