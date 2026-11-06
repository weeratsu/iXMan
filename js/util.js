// shared helpers
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const fmt=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=p=>p+'_'+crypto.randomUUID().replace(/-/g,'').slice(0,12);
const XCAT=/transfer|lending|loan|ยืม/i;
function parseCSV(t){const out=[];let row=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];
 if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}
 else if(c=='"')q=true;else if(c==','){row.push(f);f=''}else if(c=='\n'||c=='\r'){if(c=='\r'&&t[i+1]=='\n')i++;row.push(f);out.push(row);row=[];f=''}else f+=c}
 if(f||row.length){row.push(f);out.push(row)}return out}
const toISO=d=>{const m=d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);return m?`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:d};
const fromISO=d=>{const[y,m,dd]=(d||'').split('-');return`${dd}/${m}/${y}`};
const csvQ=v=>`"${String(v??'').replace(/"/g,'""')}"`;
function dl(name,txt,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click()}
function group(rows,kf){const m=new Map();rows.forEach(r=>{const k=kf(r);let g=m.get(k);if(!g)m.set(k,g={k,inc:0,exp:0,n:0});r.Amount>=0?g.inc+=r.Amount:g.exp-=r.Amount;g.n++});return[...m.values()]}
function tbl(h,rows,num=[]){return`<table><thead><tr>${h.map((x,i)=>`<th class="${num.includes(i)?'n':''}">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>`<td class="${num.includes(i)?'n':''}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
// options: arr of strings or [value,label]
function opts(sel,arr,all='ทั้งหมด'){const v=sel.value;sel.innerHTML=(all!==null?`<option value="">${all}</option>`:'')+arr.map(x=>Array.isArray(x)?`<option value="${esc(x[0])}">${esc(x[1])}</option>`:`<option>${esc(x)}</option>`).join('');if([...sel.options].some(o=>o.value==v))sel.value=v}
const charts={};
function chart(id,cfg){if(!window.Chart)return;charts[id]?.destroy();const cs=getComputedStyle(document.documentElement);Chart.defaults.color=cs.getPropertyValue('--mu').trim();Chart.defaults.borderColor=cs.getPropertyValue('--ln').trim();charts[id]=new Chart($('#'+id),cfg)}