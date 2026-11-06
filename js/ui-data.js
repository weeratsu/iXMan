const COLS=['Date','Type','Category','Subcategory','Vendor','Payment','Currency','Amount','Note','ID'];
$('#fi').onchange=async e=>{const f=e.target.files[0];if(!f)return;$('#iMsg').textContent='กำลังอ่าน...';
 const rows=parseCSV((await f.text()).replace(/^\uFEFF/,''));const h=rows.shift().map(x=>x.trim()),ix=Object.fromEntries(COLS.map(c=>[c,h.indexOf(c)]));
 if(ix.Date<0||ix.Amount<0){$('#iMsg').textContent='❌ header ไม่ถูกต้อง';return}
 const recs=rows.filter(r=>r.length>1).map(r=>{const o={};COLS.forEach(c=>o[c]=ix[c]>=0?(r[ix[c]]??'').trim():'');o.Date=toISO(o.Date);return o});
 const mode=$('#iMode').value;
 if(mode=='replace'){if(!confirm('ล้างข้อมูลเดิมทั้งหมดก่อน import?')){e.target.value='';return}await DB.clear('trx');await DB.clear('master');await loadAll()}
 const ex=new Map(T.map(x=>[x.ID,x]));let nw=0,up=0,sk=0;
 const go_=recs.filter(r=>{const o=ex.get(r.ID);if(!o){nw++;return true}
  if(mode=='skip'||(mode=='unedited'&&o.edited)){sk++;return false}up++;return true});
 if(!confirm(`ใหม่ ${nw} · ทับ ${up} · ข้าม ${sk}\nดำเนินการต่อ?`)){e.target.value='';$('#iMsg').textContent='ยกเลิก';return}
 await saveNamed(go_);await reload();$('#iMsg').textContent=`✅ ใหม่ ${nw}, ทับ ${up}, ข้าม ${sk}`;e.target.value=''};
function expCSV(rows){dl(`ix_export_${new Date().toISOString().slice(0,10)}.csv`,'\uFEFF'+[COLS.map(csvQ).join(',')].concat([...rows].sort((a,b)=>a.Date<b.Date?-1:1).map(r=>COLS.map(c=>csvQ(c=='Date'?fromISO(r.Date):c=='Amount'?r.Amount.toFixed(2):r[c])).join(','))).join('\n'),'text/csv')}
const expJSON=()=>dl(`ixman_backup_${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({version:2,master:[...M.values()],trx:T}),'application/json');
$('#fj').onchange=async e=>{const a=JSON.parse(await e.target.files[0].text());if(!a.master){alert('ไฟล์ backup ไม่ใช่รูปแบบ iXMan v2');return}
 if(!confirm(`Restore ${a.trx.length} trx / ${a.master.length} master (แทนที่ทั้งหมด)?`))return;await DB.clear('trx');await DB.clear('master');await DB.put('master',a.master);await DB.put('trx',a.trx);reload()};
async function wipe(){if(confirm('ลบข้อมูลทั้งหมด?')){await DB.clear('trx');await DB.clear('master');reload()}}
function qa(){const zero=T.filter(t=>!t.amount).length,noCat=T.filter(t=>!t.catId).length,today=new Date().toISOString().slice(0,10),fut=T.filter(t=>t.date>today).length,orphan=T.filter(t=>Object.values(FK).some(f=>t[f]&&!M.has(t[f]))).length;
 const dk={};T.forEach(t=>{const k=t.date+t.amount+t.vendorId+t.subId;dk[k]=(dk[k]||0)+1});const dup=Object.values(dk).filter(v=>v>1).length;
 const ds=T.map(t=>t.date).sort();
 $('#qa').innerHTML=`ช่วงข้อมูล: ${ds.length?fromISO(ds[0])+' – '+fromISO(ds.at(-1)):'-'} · Master: ${M.size} รายการ<br>Amount = 0: ${zero} · ไม่มี Category: ${noCat} · ID ลิงก์ไม่เจอ: ${orphan} · วันที่ในอนาคต: <a href="#" onclick="go('trx');$('#f1').value='${today}';filt();return false" style="color:var(--ac)">${fut}</a> · อาจซ้ำ: ${dup}
 <br><span id="pst" class="mu"></span>`;DB.persistent.then(p=>$('#pst').textContent=p?'💾 เก็บใน IndexedDB ของเบราว์เซอร์เครื่องนี้':'⚠️ เบราว์เซอร์นี้เก็บถาวรไม่ได้ ข้อมูลหายเมื่อปิดหน้า')}