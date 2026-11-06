// Master data: rename edits master only (trx follow by ID). Same name in same scope = merge.
function master(){const k=$('#mF').value,q=$('#mQ').value.toLowerCase(),fk=FK[k],cnt={},last={};
 T.forEach(t=>{const id=t[fk];cnt[id]=(cnt[id]||0)+1;if(!last[id]||t.date>last[id])last[id]=t.date});
 const L=listM(k).filter(m=>m.name.toLowerCase().includes(q)).sort((a,b)=>(cnt[b.id]||0)-(cnt[a.id]||0));
 $('#mOut').innerHTML=tbl([...(k=='subcategory'?['Category']:[]),KINDS[k],'ID','ครั้ง','ล่าสุด',''],L.map(m=>[...(k=='subcategory'?[esc(nm(m.parentId))]:[]),
  `<a href="#" data-id="${m.id}" style="color:var(--ac)">${esc(m.name)}</a>`,`<span class="mu">${m.id}</span>`,cnt[m.id]||0,last[m.id]?fromISO(last[m.id]):'',cnt[m.id]?'':`<span class="del" data-del="${m.id}">🗑</span>`]),[k=='subcategory'?3:2])}
$('#mF').onchange=master;$('#mQ').oninput=master;
$('#mOut').onclick=async e=>{const d=e.target.closest('[data-del]');if(d){if(confirm('ลบรายการที่ไม่ได้ใช้นี้?')){await DB.del('master',d.dataset.del);await reload()}return}
 const a=e.target.closest('a[data-id]');if(!a)return;e.preventDefault();const m=M.get(a.dataset.id),k=m.kind;
 const n=(prompt(`เปลี่ยนชื่อ ${KINDS[k]} "${m.name}" (ใส่ชื่อที่มีอยู่ = merge):`,m.name)||'').trim();if(!n||n==m.name)return;
 const tgt=findId(k,n,m.parentId);
 if(!tgt||tgt==m.id){await DB.put('master',[{...m,name:n}]);return reload()}
 const fk=FK[k],upd=T.filter(t=>t[fk]==m.id).map(t=>({...t,[fk]:tgt}));if(!confirm(`Merge "${m.name}" เข้ากับ "${n}" (${upd.length} trx)?`))return;
 const newM=[],delM=[m.id];
 if(k=='category'){// move subcategories of old category under target
  const subMap={};listM('subcategory').filter(s=>s.parentId==m.id).forEach(s=>{subMap[s.id]=ensure('subcategory',s.name,tgt,newM);delM.push(s.id)});
  upd.forEach(t=>{if(subMap[t.subId])t.subId=subMap[t.subId]})}
 if(newM.length)await DB.put('master',newM);await DB.put('trx',upd);await DB.del('master',delM);reload()};