// Dashboard with pill filters (state persisted)
const DS=Object.assign({sS:['exp'],sAvg:true,sY:null,mS:['inc','exp','net'],mAvg:true,mR:'24',yS:['inc','exp'],yAvg:true,yR:'all',cN:'10',cK:'exp'},(()=>{try{return JSON.parse(localStorage.getItem('ixman_dash')||'{}')}catch(e){return{}}})());
const saveDS=()=>{try{localStorage.setItem('ixman_dash',JSON.stringify(DS))}catch(e){}};
const COL={inc:'#22c55e',exp:'#ef4444',net:'#0ea5e9',avg:'#f59e0b'},LBL={inc:'รายรับ',exp:'รายจ่าย',net:'สุทธิ'};
function pillGrp(items,isOn,act){return`<span class="pg">${items.map(([v,l,col])=>`<button class="pill ${isOn(v)?'on':''}" data-a="${act}" data-v="${v}">${col?`<span class="dot" style="background:${col}"></span>`:''}${l}</button>`).join('')}</span>`}
function drawPills(){const ser=k=>[['inc','รายรับ',COL.inc],['exp','รายจ่าย',COL.exp],['net','สุทธิ',COL.net]];
 $('#pMon').innerHTML=pillGrp(ser(),v=>DS.mS.includes(v),'mS')+pillGrp([['avg','⌀ เฉลี่ย',COL.avg]],()=>DS.mAvg,'mAvg')+($('#dY').value?'':pillGrp([['6','6ด'],['12','12ด'],['24','2ปี'],['36','3ปี'],['60','5ปี'],['all','ทั้งหมด']],v=>DS.mR==v,'mR'));
 $('#pYr').innerHTML=pillGrp(ser(),v=>DS.yS.includes(v),'yS')+pillGrp([['avg','⌀ เฉลี่ย',COL.avg]],()=>DS.yAvg,'yAvg')+pillGrp([['5','5ปี'],['10','10ปี'],['all','ทั้งหมด']],v=>DS.yR==v,'yR');
 $('#pCat').innerHTML=pillGrp([['exp','รายจ่าย'],['inc','รายรับ']],v=>DS.cK==v,'cK')+pillGrp([['5','Top 5'],['10','10'],['15','15']],v=>DS.cN==v,'cN')}
document.addEventListener('click',e=>{const b=e.target.closest('.pill[data-a]');if(!b)return;const a=b.dataset.a,v=b.dataset.v;
 if(a=='sY'){const s=DS.sY||[];DS.sY=v=='all'?null:s.includes(v)?s.filter(x=>x!=v):[...s,v];if(DS.sY&&!DS.sY.length)DS.sY=null}else if(a=='mS'||a=='yS'||a=='sS'){const s=DS[a];DS[a]=s.includes(v)?s.filter(x=>x!=v):[...s,v]}else if(a=='mAvg'||a=='yAvg'||a=='sAvg')DS[a]=!DS[a];else DS[a]=v;saveDS();dash()});
function seriesDS(G,sel,avg){const out=[];sel.forEach(k=>{const d=G.map(g=>k=='inc'?g.inc:k=='exp'?g.exp:g.inc-g.exp);
  out.push(k=='net'?{type:'line',label:LBL[k],data:d,borderColor:COL.net,backgroundColor:COL.net,tension:.3,order:0}:{label:LBL[k],data:d,backgroundColor:COL[k]+'cc',borderRadius:4,order:2});
  if(avg&&G.length){const m=d.reduce((s,x)=>s+x,0)/d.length;out.push({type:'line',_avg:m,label:'⌀ '+LBL[k],data:G.map(()=>m),borderColor:k=='net'?COL.avg:COL[k],borderDash:[6,4],borderWidth:1.5,pointRadius:0,order:1})}});return out}
function dash(){if(!D.length)return;drawPills();const y=$('#dY').value,c=$('#dC').value,t=$('#dT').value,x=$('#dXT').checked,ca=$('#dCat').value,pm=$('#dP').value;
 const base=D.filter(r=>(!c||r._t.curId==c)&&(!t||r._t.typeId==t)&&(!ca||r._t.catId==ca)&&(!pm||r._t.payId==pm)&&(!x||!XCAT.test(r.Category))),R=base.filter(r=>!y||r.Date.startsWith(y));
 const inc=R.reduce((s,r)=>s+(r.Amount>0?r.Amount:0),0),exp=R.reduce((s,r)=>s+(r.Amount<0?-r.Amount:0),0),months=new Set(R.map(r=>r.Date.slice(0,7))).size||1;
 $('#dK').innerHTML=[['รายรับ',fmt(inc),'in'],['รายจ่าย',fmt(exp),'ex'],['สุทธิ',fmt(inc-exp),inc>=exp?'in':'ex'],['จ่ายเฉลี่ย/เดือน',fmt(exp/months),''],['จำนวน trx',R.length.toLocaleString(),'']].map(([a,b,k])=>`<div class="kpi"><span>${a}</span><b class="${k}">${b}</b></div>`).join('');
 let Ms=group(y?R:base,r=>r.Date.slice(0,7)).sort((a,b)=>a.k<b.k?-1:1);if(!y&&DS.mR!='all')Ms=Ms.slice(-+DS.mR);
 chart('cMon',{type:'bar',data:{labels:Ms.map(g=>g.k),datasets:seriesDS(Ms,DS.mS,DS.mAvg)},options:{interaction:{mode:'index',intersect:false}}});
 const C=group(R.filter(r=>DS.cK=='exp'?r.Amount<0:r.Amount>0),r=>r.Category).sort((a,b)=>DS.cK=='exp'?b.exp-a.exp:b.inc-a.inc).slice(0,+DS.cN);
 chart('cCat',{type:'doughnut',data:{labels:C.map(g=>g.k),datasets:[{data:C.map(g=>DS.cK=='exp'?g.exp:g.inc)}]},options:{plugins:{legend:{position:'right'}}}});
 const V=group(R.filter(r=>r.Amount<0&&r.Vendor&&r.Vendor!='NONE'),r=>r.Vendor).sort((a,b)=>b.exp-a.exp).slice(0,12);
 $('#dV').innerHTML=tbl(['Vendor','ครั้ง','รายจ่าย'],V.map(g=>[esc(g.k),g.n,fmt(g.exp)]),[1,2]);
 season(base);
 let Y=group(base,r=>r.Date.slice(0,4)).sort((a,b)=>a.k<b.k?-1:1);if(DS.yR!='all')Y=Y.slice(-+DS.yR);
 chart('cYr',{type:'bar',data:{labels:Y.map(g=>g.k),datasets:seriesDS(Y,DS.yS,DS.yAvg)},options:{interaction:{mode:'index',intersect:false}}})}
['dY','dC','dT','dCat','dP','dXT'].forEach(i=>$('#'+i).onchange=dash);
// draw average value at the end of each avg line
const avgLabel={id:'avgLabel',afterDatasetsDraw(ch){const x=ch.ctx,a=ch.chartArea;ch.data.datasets.forEach((ds,i)=>{if(ds._avg==null||!ch.isDatasetVisible(i))return;const pts=ch.getDatasetMeta(i).data;if(!pts.length)return;
 const Y=pts[pts.length-1].y,t='เฉลี่ย '+fmt(ds._avg),c=ds.borderColor;x.save();x.font='600 11px '+getComputedStyle(document.body).fontFamily;
 const w=x.measureText(t).width+14,h=18,X=a.right-w-4,top=Math.max(a.top,Y-h-3);
 x.globalAlpha=.15;x.fillStyle=c;x.beginPath();x.roundRect?x.roundRect(X,top,w,h,9):x.rect(X,top,w,h);x.fill();
 x.globalAlpha=1;x.fillStyle=c;x.textBaseline='middle';x.textAlign='right';x.fillText(t,a.right-11,top+h/2);x.restore()})}};
if(window.Chart)Chart.register(avgLabel);
// Seasonality: average per calendar month over selected years
const MTH=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function season(base){const ys=[...new Set(base.map(r=>r.Date.slice(0,4)))].sort(),sel=DS.sY?DS.sY.filter(y=>ys.includes(y)):ys;
 $('#pSea').innerHTML=pillGrp([['inc','รายรับ',COL.inc],['exp','รายจ่าย',COL.exp],['net','สุทธิ',COL.net]],v=>DS.sS.includes(v),'sS')+pillGrp([['avg','⌀ เฉลี่ย',COL.avg]],()=>DS.sAvg,'sAvg');
 $('#pSeaY').innerHTML='<span class="mu" style="font-size:12px">ปี:</span>'+pillGrp([['all','ทุกปี']],()=>!DS.sY,'sY')+pillGrp(ys.map(y=>[y,y]),y=>!!DS.sY&&DS.sY.includes(y),'sY');
 const R=base.filter(r=>sel.includes(r.Date.slice(0,4))),G=MTH.map((k,i)=>({k,inc:0,exp:0,n:0,ym:new Set()}));
 R.forEach(r=>{const g=G[+r.Date.slice(5,7)-1];r.Amount>=0?g.inc+=r.Amount:g.exp-=r.Amount;g.ym.add(r.Date.slice(0,4))});
 G.forEach(g=>{const n=g.ym.size||1;g.inc/=n;g.exp/=n});
 chart('cSea',{type:'bar',data:{labels:MTH,datasets:seriesDS(G,DS.sS,DS.sAvg)},options:{interaction:{mode:'index',intersect:false}}})}