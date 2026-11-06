let view=[],page=0,sortK='Date',sortD=-1,editId=null;const PS=200,F9=['Date','Type','Category','Subcategory','Vendor','Payment','Currency','Amount','Note'];
function filt(){const q=$('#q').value.toLowerCase().trim(),a=$('#f1').value,b=$('#f2').value,t=$('#fT').value,ca=$('#fCat').value,p=$('#fP').value,c=$('#fC').value,s=$('#fS').value,mn=parseFloat($('#fMin').value),mx=parseFloat($('#fMax').value),terms=q?q.split(/\s+/):[];
 view=D.filter(r=>{const x=r._t;return(!a||r.Date>=a)&&(!b||r.Date<=b)&&(!t||x.typeId==t)&&(!ca||x.catId==ca)&&(!p||x.payId==p)&&(!c||x.curId==c)&&(!s||(s=='ex'?r.Amount<0:r.Amount>=0))
  &&(isNaN(mn)||Math.abs(r.Amount)>=mn)&&(isNaN(mx)||Math.abs(r.Amount)<=mx)&&(!terms.length||terms.every(w=>(r.Vendor+' '+r.Note+' '+r.Subcategory+' '+r.Category+' '+r.Type+' '+r.Amount).toLowerCase().includes(w)))});
 view.sort((x,y)=>(x[sortK]>y[sortK]?1:x[sortK]<y[sortK]?-1:0)*sortD);page=0;
 const inc=view.reduce((s,r)=>s+(r.Amount>0?r.Amount:0),0),exp=view.reduce((s,r)=>s+(r.Amount<0?-r.Amount:0),0);
 $('#tSum').innerHTML=`พบ <b>${view.length.toLocaleString()}</b> รายการ · รับ <span class="in">${fmt(inc)}</span> · จ่าย <span class="ex">${fmt(exp)}</span> · สุทธิ <b>${fmt(inc-exp)}</b> ${c?'':'<span class="mu">(รวมหลายสกุล)</span>'}`;drawT()}
function drawT(){$('#tB').innerHTML=view.slice(page*PS,page*PS+PS).map(r=>`<tr class="cl" data-id="${r.ID}"><td>${fromISO(r.Date)}</td><td>${esc(r.Type)}</td><td>${esc(r.Category)}</td><td>${esc(r.Subcategory)}</td><td>${esc(r.Vendor)}</td><td>${esc(r.Payment)}</td><td class="n ${r.Amount<0?'ex':'in'}">${fmt(r.Amount)} <span class="mu">${esc(r.Currency)}</span></td><td class="mu">${esc(r.Note)}</td></tr>`).join('');
 $('#pgI').textContent=`หน้า ${page+1}/${Math.max(1,Math.ceil(view.length/PS))}`}
const pg=d=>{page=Math.min(Math.max(0,page+d),Math.max(0,Math.ceil(view.length/PS)-1));drawT()};
let tm;$('#q').oninput=()=>{clearTimeout(tm);tm=setTimeout(filt,200)};['f1','f2','fT','fCat','fP','fC','fS','fMin','fMax'].forEach(i=>$('#'+i).onchange=filt);
function clrF(){['q','f1','f2','fT','fCat','fP','fS','fMin','fMax'].forEach(i=>$('#'+i).value='');filt()}
$$('#trx th').forEach(th=>th.onclick=()=>{const k=th.dataset.k;sortD=sortK==k?-sortD:-1;sortK=k;filt()});
$('#tB').onclick=e=>{const tr=e.target.closest('tr');if(tr)edit(tr.dataset.id)};
function edit(id){editId=id||null;const r=D.find(x=>x.ID==id)||{Date:new Date().toISOString().slice(0,10),Currency:'THB',Type:'Personal',Payment:'Cash'};
 const f=$('#frm');F9.forEach(c=>f[c].value=r[c]??'');$('#dlT').textContent=id?'แก้ไข Transaction':'เพิ่ม Transaction';$('#bDel').style.display=$('#bDup').style.display=id?'':'none';$('#dlg').showModal()}
$('#dlg').onclose=async()=>{const v=$('#dlg').returnValue,f=$('#frm');if(v=='x'||!v)return;
 if(v=='del'){if(confirm('ลบรายการนี้?')){await DB.del('trx',editId);await reload()}return}
 const o={};F9.forEach(c=>o[c]=f[c].value.trim());o.ID=(v=='save'&&editId)?editId:'';o.edited=true;await saveNamed([o]);await reload()};