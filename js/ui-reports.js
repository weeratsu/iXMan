let lastRep=[];
function rep(){if(!D.length)return;const k=$('#rK').value,y=$('#rY').value,c=$('#rC').value,t=$('#rT').value;
 const R=D.filter(r=>(!y||k=='yr'||r.Date.startsWith(y))&&(!c||r._t.curId==c)&&(!t||r._t.typeId==t));
 const kf={mon:r=>r.Date.slice(0,7),yr:r=>r.Date.slice(0,4),cat:r=>r.Category,ven:r=>r.Vendor||'(none)',typ:r=>r.Type,pay:r=>r.Payment,cur:r=>r.Currency}[k];
 let G=group(R,kf);if(k=='mon'||k=='yr')G.sort((a,b)=>a.k<b.k?-1:1);else if(k=='typ')G.sort((a,b)=>(b.inc-b.exp)-(a.inc-a.exp));else G.sort((a,b)=>b.exp-a.exp);
 if(k=='ven')G=G.slice(0,300);lastRep=G;const tI=G.reduce((s,g)=>s+g.inc,0),tE=G.reduce((s,g)=>s+g.exp,0);
 let html=tbl([{mon:'เดือน',yr:'ปี',cat:'Category',ven:'Vendor',typ:'บัญชี',pay:'Payment',cur:'สกุลเงิน'}[k],'ครั้ง','รับ','จ่าย',k=='typ'?'ยอดคงเหลือ':'สุทธิ','% จ่าย'],
  G.map(g=>[`<b>${esc(g.k)}</b>`,g.n,`<span class="in">${fmt(g.inc)}</span>`,`<span class="ex">${fmt(g.exp)}</span>`,fmt(g.inc-g.exp),tE?(g.exp/tE*100).toFixed(1)+'%':'']).concat([['<b>รวม</b>',R.length,fmt(tI),fmt(tE),fmt(tI-tE),'']]),[1,2,3,4,5]);
 if(k=='cat')html+='<h3>Subcategory</h3>'+tbl(['Category','Sub','ครั้ง','จ่าย','รับ'],group(R,r=>r._t.subId||r._t.catId).sort((a,b)=>b.exp-a.exp).map(g=>{const m=M.get(g.k);return[esc(m?.parentId?nm(m.parentId):m?.name),esc(m?.parentId?m.name:''),g.n,fmt(g.exp),fmt(g.inc)]}),[2,3,4]);
 $('#rOut').innerHTML=html;const C=G.slice(0,k=='mon'||k=='yr'?999:20);
 chart('cRep',{type:'bar',data:{labels:C.map(g=>g.k),datasets:[{label:'รับ',data:C.map(g=>g.inc),backgroundColor:'#4ade80'},{label:'จ่าย',data:C.map(g=>g.exp),backgroundColor:'#f87171'}]}})}
['rK','rY','rC','rT'].forEach(i=>$('#'+i).onchange=rep);
function expRep(){dl('report.csv','\uFEFFKey,Count,Income,Expense,Net\n'+lastRep.map(g=>[csvQ(g.k),g.n,g.inc.toFixed(2),g.exp.toFixed(2),(g.inc-g.exp).toFixed(2)].join(',')).join('\n'),'text/csv')}
function pivot(){const rk=$('#pR').value,ck=$('#pCol').value,c=$('#pC').value,s=$('#pS').value;
 const val=(r,k)=>k=='Year'?r.Date.slice(0,4):k=='Month'?r.Date.slice(5,7):r[k]||'(none)';
 const R=D.filter(r=>(!c||r._t.curId==c)&&(!s||(s=='ex'?r.Amount<0:r.Amount>=0)));const P={},cs=new Set(),tot={};
 R.forEach(r=>{const a=val(r,rk),b=val(r,ck),v=s=='ex'?-r.Amount:r.Amount;cs.add(b);(P[a]??={})[b]=(P[a][b]||0)+v;tot[a]=(tot[a]||0)+v});
 const C=[...cs].sort(),rows=Object.keys(P).sort((a,b)=>tot[b]-tot[a]);
 $('#pOut').innerHTML=tbl([rk+' \\ '+ck,...C,'รวม'],rows.map(a=>[esc(a),...C.map(b=>P[a][b]?fmt(P[a][b]):''),`<b>${fmt(tot[a])}</b>`]),C.map((_,i)=>i+1).concat(C.length+1))}