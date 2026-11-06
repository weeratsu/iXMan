function dash(){if(!D.length)return;const y=$('#dY').value,c=$('#dC').value,t=$('#dT').value,x=$('#dXT').checked;
 const base=D.filter(r=>(!c||r._t.curId==c)&&(!t||r._t.typeId==t)&&(!x||!XCAT.test(r.Category))),R=base.filter(r=>!y||r.Date.startsWith(y));
 const inc=R.reduce((s,r)=>s+(r.Amount>0?r.Amount:0),0),exp=R.reduce((s,r)=>s+(r.Amount<0?-r.Amount:0),0),months=new Set(R.map(r=>r.Date.slice(0,7))).size||1;
 $('#dK').innerHTML=[['รายรับ',fmt(inc),'in'],['รายจ่าย',fmt(exp),'ex'],['สุทธิ',fmt(inc-exp),inc>=exp?'in':'ex'],['จ่ายเฉลี่ย/เดือน',fmt(exp/months),''],['จำนวน trx',R.length.toLocaleString(),'']].map(([a,b,k])=>`<div class="kpi"><span>${a}</span><b class="${k}">${b}</b></div>`).join('');
 const M_=group(R,r=>r.Date.slice(0,7)).sort((a,b)=>a.k<b.k?-1:1),Ms=y?M_:M_.slice(-36);
 chart('cMon',{type:'bar',data:{labels:Ms.map(g=>g.k),datasets:[{label:'รายรับ',data:Ms.map(g=>g.inc),backgroundColor:'#4ade80'},{label:'รายจ่าย',data:Ms.map(g=>g.exp),backgroundColor:'#f87171'},{type:'line',label:'สุทธิ',data:Ms.map(g=>g.inc-g.exp),borderColor:'#38bdf8'}]}});
 const C=group(R.filter(r=>r.Amount<0),r=>r.Category).sort((a,b)=>b.exp-a.exp).slice(0,10);
 chart('cCat',{type:'doughnut',data:{labels:C.map(g=>g.k),datasets:[{data:C.map(g=>g.exp)}]},options:{plugins:{legend:{position:'right'}}}});
 const V=group(R.filter(r=>r.Amount<0&&r.Vendor&&r.Vendor!='NONE'),r=>r.Vendor).sort((a,b)=>b.exp-a.exp).slice(0,12);
 $('#dV').innerHTML=tbl(['Vendor','ครั้ง','รายจ่าย'],V.map(g=>[esc(g.k),g.n,fmt(g.exp)]),[1,2]);
 const Y=group(base,r=>r.Date.slice(0,4)).sort((a,b)=>a.k<b.k?-1:1);
 chart('cYr',{type:'bar',data:{labels:Y.map(g=>g.k),datasets:[{label:'รายรับ',data:Y.map(g=>g.inc),backgroundColor:'#4ade80'},{label:'รายจ่าย',data:Y.map(g=>g.exp),backgroundColor:'#f87171'}]}})}
['dY','dC','dT','dXT'].forEach(i=>$('#'+i).onchange=dash);