// Data model: trx links master data by ID only.
// trx: {ID,date,typeId,catId,subId,vendorId,payId,curId,amount,note}
// master: {id,kind,name,parentId}  (subcategory.parentId = category id)
const KINDS={type:'บัญชี (Type)',category:'Category',subcategory:'Subcategory',vendor:'Vendor',payment:'Payment',currency:'Currency'};
const FK={type:'typeId',category:'catId',subcategory:'subId',vendor:'vendorId',payment:'payId',currency:'curId'};
let T=[],M=new Map(),D=[],IDX={};
const mkey=(name,p)=>(p||'')+'\u0001'+name.trim().toLowerCase();
function reindex(){IDX={};for(const k in KINDS)IDX[k]=new Map();M.forEach(m=>IDX[m.kind]?.set(mkey(m.name,m.parentId),m.id))}
const nm=id=>id?(M.get(id)?.name??''):'';
const findId=(kind,name,p)=>IDX[kind].get(mkey(name||'',p));
const listM=kind=>[...M.values()].filter(m=>m.kind==kind).sort((a,b)=>a.name.localeCompare(b.name));
function ensure(kind,name,parentId,newM){name=(name||'').trim();if(!name)return '';let id=findId(kind,name,parentId);
 if(!id){id=uid(kind.slice(0,3));const m={id,kind,name,parentId:parentId||''};M.set(id,m);IDX[kind].set(mkey(name,parentId),id);newM.push(m)}return id}
function resolve(){D=T.map(t=>({ID:t.ID,Date:t.date,Type:nm(t.typeId),Category:nm(t.catId),Subcategory:nm(t.subId),Vendor:nm(t.vendorId),Payment:nm(t.payId),Currency:nm(t.curId),Amount:t.amount,Note:t.note||'',_t:t}))}
async function loadAll(){T=await DB.all('trx');M=new Map((await DB.all('master')).map(m=>[m.id,m]));reindex();resolve()}
function fromNames(o,newM){const catId=ensure('category',o.Category,'',newM);
 return{ID:o.ID||crypto.randomUUID().toUpperCase(),date:o.Date,typeId:ensure('type',o.Type,'',newM),catId,subId:ensure('subcategory',o.Subcategory,catId,newM),vendorId:ensure('vendor',o.Vendor,'',newM),payId:ensure('payment',o.Payment,'',newM),curId:ensure('currency',o.Currency||'THB','',newM),amount:+o.Amount||0,note:o.Note||'',...(o.edited?{edited:true}:{})}}
async function saveNamed(objs){const newM=[],rows=objs.map(o=>fromNames(o,newM));if(newM.length)await DB.put('master',newM);await DB.put('trx',rows);return rows}