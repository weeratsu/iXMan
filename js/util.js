// shared helpers
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
let HIDE=false;try{HIDE=localStorage.getItem('ixman_hide')=='1'}catch(e){}
const fmt=n=>HIDE?'•••••':n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
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
function chart(id,cfg){if(!window.Chart)return;charts[id]?.destroy();const cs=getComputedStyle(document.documentElement);Chart.defaults.color=cs.getPropertyValue('--mu').trim();Chart.defaults.borderColor=cs.getPropertyValue('--ln').trim();if(HIDE){cfg.options=cfg.options||{};cfg.options.plugins={...(cfg.options.plugins||{}),tooltip:{enabled:false}};if(cfg.type!='doughnut')cfg.options.scales={y:{ticks:{callback:()=>'•••'}}}}if(innerWidth<=768&&cfg.type!='doughnut'){cfg.options=cfg.options||{};cfg.options.aspectRatio=1.4}if(innerWidth<=768&&cfg.type=='doughnut'&&cfg.options?.plugins?.legend){cfg.options.plugins.legend.position='bottom'}charts[id]=new Chart($('#'+id),cfg)}
let _rz;addEventListener('resize',()=>{clearTimeout(_rz);_rz=setTimeout(()=>{if(typeof D!='undefined'&&D.length){dash();rep()}},300)});
// generic click-to-sort for all tables except Transactions (own sort). 'รวม' row stays at bottom.
function _sv(t){t=t.trim();let m=t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(m)return m[3]+m[2]+m[1];
 const n=t.replace(/[,%\s]|[A-Z]{3}$/g,'');return n!==''&&!isNaN(n)?+n:t.toLowerCase()}
document.addEventListener('click',e=>{const th=e.target.closest('th');if(!th||th.closest('#trx'))return;const tb=th.closest('table')?.tBodies[0];if(!tb)return;
 const i=[...th.parentNode.children].indexOf(th),asc=th.dataset.so!='a';th.parentNode.querySelectorAll('th').forEach(x=>delete x.dataset.so);th.dataset.so=asc?'a':'d';
 const rows=[...tb.rows],tot=rows.filter(r=>/^\s*รวม\s*$/.test(r.cells[0]?.textContent||'')),body=rows.filter(r=>!tot.includes(r));
 body.sort((a,b)=>{const x=_sv(a.cells[i]?.textContent||''),y=_sv(b.cells[i]?.textContent||'');return(typeof x==typeof y?(x>y?1:x<y?-1:0):typeof x=='number'?-1:1)*(asc?1:-1)});
 body.concat(tot).forEach(r=>tb.appendChild(r))});