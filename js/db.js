// IndexedDB (browser-local). stores: trx (key ID), master (key id). Falls back to memory if unavailable.
const DB=(()=>{const mem={trx:new Map(),master:new Map()},K={trx:'ID',master:'id'};
 const idb=new Promise(ok=>{try{const r=indexedDB.open('ixman',1);r.onupgradeneeded=()=>{r.result.createObjectStore('trx',{keyPath:'ID'});r.result.createObjectStore('master',{keyPath:'id'})};r.onsuccess=()=>ok(r.result);r.onerror=r.onblocked=()=>ok(null)}catch(e){ok(null)}});
 async function run(st,mode,fn){const db=await idb;const memFn=()=>{const m=mem[st];return fn({getAll:()=>({result:[...m.values()]}),put:o=>m.set(o[K[st]],o),delete:id=>m.delete(id),clear:()=>m.clear()})};
  if(!db){const r=memFn();return r&&r.result}
  return new Promise(ok=>{try{const t=db.transaction(st,mode);const r=fn(t.objectStore(st));t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>ok(null)}catch(e){const r=memFn();ok(r&&r.result)}})}
 return{persistent:idb.then(d=>!!d),all:st=>run(st,'readonly',s=>s.getAll()).then(r=>r||[]),put:(st,rows)=>run(st,'readwrite',s=>{rows.forEach(r=>s.put(r))}),del:(st,ids)=>run(st,'readwrite',s=>{[].concat(ids).forEach(i=>s.delete(i))}),clear:st=>run(st,'readwrite',s=>{s.clear()})}})();