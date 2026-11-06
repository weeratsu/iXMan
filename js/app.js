// boot, navigation, refresh selects
function refresh(){$('#cnt').textContent=`${T.length.toLocaleString()} รายการ`;
 const P=k=>listM(k).map(m=>[m.id,m.name]),thb=findId('currency','THB','');
 $$('.curSel').forEach(s=>{opts(s,P('currency'),'ทุกสกุล');if(!s.dataset.i&&thb){s.value=thb;s.dataset.i=1}});
 $$('.typSel').forEach(s=>opts(s,P('type'),'ทุกบัญชี'));opts($('#fCat'),P('category'),'ทุก Category');opts($('#dCat'),P('category'),'ทุก Category');opts($('#dP'),P('payment'),'ทุก Payment');opts($('#fP'),P('payment'),'ทุก Payment');
 const ys=[...new Set(T.map(t=>t.date.slice(0,4)))].sort().reverse();opts($('#dY'),ys,'ทุกปี');opts($('#rY'),ys,'ทุกปี');
 [['lT','type'],['lCat','category'],['lSub','subcategory'],['lV','vendor'],['lP','payment'],['lC','currency']].forEach(([l,k])=>$('#'+l).innerHTML=[...new Set(listM(k).map(m=>m.name))].map(x=>`<option value="${esc(x)}">`).join(''));
 const F=['Category','Subcategory','Vendor','Type','Payment','Year','Month'];if(!$('#pR').options.length){opts($('#pR'),F,null);opts($('#pCol'),F,null);$('#pR').value='Category';$('#pCol').value='Year'}
 dash();filt();rep();master();qa()}
async function reload(){await loadAll();refresh()}
function go(s){$$('nav button[data-s]').forEach(b=>b.classList.toggle('on',b.dataset.s==s));$$('.sec').forEach(x=>x.classList.toggle('on',x.id==s))}
$$('nav button[data-s]').forEach(b=>b.onclick=()=>go(b.dataset.s));
reload().then(()=>{if(!T.length)go('data')}).catch(console.error);
function toggleHide(){HIDE=!HIDE;try{localStorage.setItem('ixman_hide',HIDE?'1':'0')}catch(e){};setHideBtn();refresh()}
function setHideBtn(){$('#hideBtn').textContent=HIDE?'👁 แสดงตัวเลข':'🙈 ซ่อนตัวเลข'}
setHideBtn();