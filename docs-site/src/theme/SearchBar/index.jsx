import React,{useCallback,useEffect,useId,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {searchPages} from '../../search/search-pages.cjs';

const signal=action=>window.dispatchEvent(new CustomEvent('talon:docs-search',{detail:action}));
export default function SearchBar(){
 const indexUrl=useBaseUrl('search-index.json');
 const dialog=useRef(null),trigger=useRef(null),field=useRef(null),links=useRef(null);
 const opener=useRef(null),inflight=useRef(null);
 const [pages,setPages]=useState(null),[query,setQuery]=useState(''),[failed,setFailed]=useState(false);
 const id=useId();
 const [mounted,setMounted]=useState(false);
 const [active,setActive]=useState(-1);
 useEffect(()=>setMounted(true),[]);
 const results=useMemo(()=>searchPages(pages||[],query),[pages,query]);
 const open=useCallback(()=>{
   if(!dialog.current||dialog.current.open)return;
   signal('open');
   opener.current=document.activeElement;
   setQuery('');setActive(-1);setFailed(false);dialog.current.showModal();field.current?.focus();
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
 // Keep DOM focus in the editable combobox. A selected option is announced
 // through aria-activedescendant; no attempt to move focus out of the input.
 const activeOption=active>=0&&active<results.length?active:-1;
 useEffect(()=>{
   if(activeOption>=0)links.current?.querySelectorAll('[role="option"]')[activeOption]?.scrollIntoView({block:'nearest'});
 },[activeOption,results]);
 function keys(e){
   if(e.isComposing||e.nativeEvent?.isComposing||!dialog.current?.open)return;
   if(e.key==='Enter'&&query.trim()&&pages&&!results.length){e.preventDefault();signal('no-results');return;}
   if(!results.length)return;
   if(e.key==='ArrowDown'||e.key==='ArrowUp'){
     e.preventDefault();e.stopPropagation();
     setActive(i=>e.key==='ArrowDown'?Math.min(i+1,results.length-1):Math.max(-1,i-1));
   }else if(e.key==='Enter'&&activeOption>=0){
     e.preventDefault();e.stopPropagation();
     const route=results[activeOption].route;
     signal('result');close();window.location.assign(route);
   }
 }

 const status=failed?'Search is unavailable. Close and reopen to retry, or browse the sidebar.':!pages?'Loading documentation index…':!query.trim()?'Search guides, configuration and technical reference.':results.length?results.length+' matching pages shown.':'No matching pages. Try fewer words or an exact configuration name.';
 return <>
   <button ref={trigger} type="button" className="qc-search-trigger" aria-label="Search documentation" aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K" onClick={open}>
     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
     <span>Search documentation</span>
   </button>
   {mounted&&createPortal(<dialog ref={dialog} className="qc-search-dialog" aria-labelledby={id+'-label'} onClose={restore}>
     <div className="qc-search-head"><label id={id+'-label'} htmlFor={id+'-query'}>Search documentation</label><button className="qc-search-close" type="button" onClick={close}>Close</button></div>
     <input ref={field} id={id+'-query'} className="qc-search-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded={results.length>0} aria-controls={results.length?id+'-results':undefined} aria-activedescendant={activeOption>=0?id+'-option-'+activeOption:undefined} value={query} onKeyDown={keys} onChange={e=>{setActive(-1);setQuery(e.target.value);}} placeholder="e.g. MCP, budget, backup" autoComplete="off" spellCheck={false} maxLength={160} />
     <p role="status" className="qc-search-status">{status}</p>
     {results.length>0&&<ul ref={links} id={id+'-results'} role="listbox" aria-label="Matching documentation pages" className="qc-search-results">{results.map((r,i)=><li key={r.route} role="presentation"><a id={id+'-option-'+i} role="option" aria-selected={i===activeOption} href={r.route} tabIndex={-1} onClick={()=>{signal('result');close();}}><strong>{r.title}</strong><span>{r.snippet}</span></a></li>)}</ul>}
   </dialog>,document.body)}
 </>;
}
