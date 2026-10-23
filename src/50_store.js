/* ==== 50 · storage =======================================================
   One progress document holds everything saved:
     store = {v, updated, runs:[sprint run], exams:[mock exam], drills:[drill]}
   (record shapes are documented in docs/DEV_NOTES.md, "Saved data").
   There is no server: progress lives in the student's own browser, in two places.
     • localStorage LS('progress'): the full document.
     • the cookie APP.cookie: a compressed copy trimmed to fit one cookie (newest records
       first; mock exams are kept longest), plus the time-bonus setting and personal bests.
       It survives when site storage is cleared on its own and refreshes its expiry on every visit.
   On load both copies are merged record by record (keyed by ts), so neither can lose or
   duplicate history. Anything read back (storage, cookie, an imported file) goes through
   cleanStore() first: only known fields with the right types survive.
   Every write goes through persist(); never assign store.* and forget it.
   ======================================================================== */
const CAP={runs:120, exams:120, drills:150};   /* records kept per list */
const MAXB=200000;                             /* JSON size budget for the whole document */
let store={v:APP.schema,updated:0,runs:[],exams:[],drills:[]};
let storeP=null, lsOK=false, cookieOK=false, wq=Promise.resolve();

/* Merge two record lists by ts. prefer(a,b) says whether b should replace a for the same ts. */
function mergeBy(a,b,cap,prefer){
  const m=new Map();
  (a||[]).concat(b||[]).forEach(r=>{ if(!r||!r.ts) return; const o=m.get(r.ts); if(!o||(prefer&&prefer(o,r))) m.set(r.ts,r); });
  return [...m.values()].sort((x,y)=>x.ts-y.ts).slice(-cap);
}
const qLen=d=>(d&&d.q||[]).length;
const mergeRuns=(a,b)=>mergeBy(a,b,CAP.runs);
const mergeExams=(a,b)=>mergeBy(a,b,CAP.exams,(o,r)=>!Array.isArray(o.q)&&Array.isArray(r.q));   /* keep per-question detail */
const mergeDrills=(a,b)=>mergeBy(a,b,CAP.drills,(o,r)=>qLen(r)>qLen(o)||(qLen(r)===qLen(o)&&(r.end||0)>(o.end||0)));  /* saved after every answer: keep the longest copy */
function mergeStores(x,y){
  return {v:APP.schema,updated:Math.max(x.updated||0,y.updated||0),
    runs:mergeRuns(x.runs,y.runs),exams:mergeExams(x.exams,y.exams),drills:mergeDrills(x.drills,y.drills)};
}

/* ---- validation: saved data is rendered on screen, so it is rebuilt field by field ---- */
const SAVED_ID=/^[A-Za-z0-9_-]{1,48}$/;
const num=(x,d)=>{ const v=+x; return Number.isFinite(v)?v:(d||0); };
const tsOf=x=>{ const v=num(x); return v>0?v:0; };
const res3=x=>(x===1||x===0||x===-1)?x:-1;
const catOk=c=>Number.isInteger(c)&&c>=0&&c<XSLOTS.length;
const list=(x,max)=>Array.isArray(x)?x.slice(-max):[];
function cleanRun(r){
  if(!r||typeof r!=='object'||!tsOf(r.ts)) return null;
  const o={ts:tsOf(r.ts),dur:num(r.dur,300),bonus:num(r.bonus)?1:0,scope:['a','b','ab'].includes(r.scope)?r.scope:'ab',
    att:num(r.att),right:num(r.right),slow:num(r.slow),skip:num(r.skip),pts:num(r.pts),time:num(r.time)};
  if(r.t&&typeof r.t==='object'){
    o.t={};
    Object.keys(r.t).slice(0,200).forEach(k=>{ if(SAVED_ID.test(k)&&Array.isArray(r.t[k])) o.t[k]=[0,1,2,3,4].map(i=>num(r.t[k][i])); });
  }
  return o;
}
function cleanExam(e){
  if(!e||typeof e!=='object'||!tsOf(e.ts)) return null;
  const o={ts:tsOf(e.ts),score:num(e.score),right:num(e.right),used:num(e.used),timeUp:num(e.timeUp)?1:0,
    slots:list(e.slots,XSLOTS.length).map(x=>res3(num(x,-1)))};
  if(Array.isArray(e.q)) o.q=list(e.q,XSLOTS.length).filter(x=>x&&catOk(x.c))
    .map(x=>({c:x.c,s:typeof x.s==='string'&&SAVED_ID.test(x.s)?x.s:null,r:res3(x.r),t:x.t==null?null:num(x.t)}));
  return o;
}
function cleanDrill(d){
  if(!d||typeof d!=='object'||!tsOf(d.ts)) return null;
  return {ts:tsOf(d.ts),cats:list(d.cats,XSLOTS.length).filter(catOk),
    q:list(d.q,400).filter(x=>x&&catOk(x.c))
      .map(x=>({c:x.c,s:typeof x.s==='string'&&SAVED_ID.test(x.s)?x.s:null,r:res3(x.r),t:x.t==null?null:num(x.t),at:tsOf(x.at)||tsOf(d.ts)})),
    cleared:list(d.cleared,XSLOTS.length).filter(catOk),end:tsOf(d.end),
    reason:['cleared','stopped'].includes(d.reason)?d.reason:''};
}
function cleanStore(o){
  if(!o||typeof o!=='object') return null;
  const keep=(x,fn,cap)=>list(x,cap).map(fn).filter(Boolean);
  return {v:APP.schema,updated:tsOf(o.updated),
    runs:keep(o.runs,cleanRun,CAP.runs),exams:keep(o.exams,cleanExam,CAP.exams),drills:keep(o.drills,cleanDrill,CAP.drills)};
}

/* Stay under the size budget. Order of sacrifice: per-type detail of old sprint runs, then whole old
   drills, then whole old sprint runs. Mock exams are the evidence that matters most and are kept. */
function fitStore(o,maxb,deep){
  maxb=maxb||MAXB;
  const size=()=>JSON.stringify(o).length;
  for(let i=0;i<o.runs.length-1&&size()>maxb;i++) delete o.runs[i].t;
  while(size()>maxb&&o.drills.length>(deep?0:1)) o.drills.shift();
  while(size()>maxb&&o.runs.length>(deep?0:1)) o.runs.shift();
  if(deep){                                  /* cookie only: then per-question detail of old exams, then old exams */
    for(let i=0;i<o.exams.length-1&&size()>maxb;i++) delete o.exams[i].q;
    while(size()>maxb&&o.exams.length>1) o.exams.shift();
  }
  return o;
}
function readLocal(){
  try{ return cleanStore(JSON.parse(lsGet(LS('progress'))||'null')); }catch(e){ return null; }
}

/* ---- preferences that travel in the cookie with the progress ---- */
const BEST_PRE=LS('points:');
function readPrefs(){
  const best={};
  try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i);
    if(k&&k.indexOf(BEST_PRE)===0&&num(lsGet(k))>0) best[k.slice(BEST_PRE.length)]=num(lsGet(k)); } }catch(e){}
  const b=lsGet(LS('bonus'));
  return {bonus:b==='0'?0:b==='1'?1:null,best};
}
function applyPrefs(p){                      /* only fills in what this browser's storage lacks */
  if(!p||typeof p!=='object') return;
  if((p.bonus===0||p.bonus===1)&&lsGet(LS('bonus'))===null){
    lsSet(LS('bonus'),String(p.bonus)); bonusOn=p.bonus===1; paintBonus();
  }
  if(p.best&&typeof p.best==='object') Object.keys(p.best).slice(0,60).forEach(k=>{
    if(!/^\d{2,4}:(a|b|ab):(b|f)$/.test(k)) return;
    const v=Math.round(num(p.best[k])), have=num(lsGet(BEST_PRE+k));
    if(v>have) lsSet(BEST_PRE+k,String(v));
  });
  if(phase==='start') paintBest('bestline');
}

/* ---- cookie codec: deflate + base64url where the browser has CompressionStream, plain JSON otherwise ---- */
const canZip=typeof CompressionStream==='function'&&typeof DecompressionStream==='function';
const b64u=bytes=>{ let s=''; for(let i=0;i<bytes.length;i+=0x8000) s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
const unb64u=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const pipeBytes=async(bytes,stream)=>new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
async function packCookie(obj){
  const json=JSON.stringify(obj);
  if(canZip) return 'z'+b64u(await pipeBytes(new TextEncoder().encode(json),new CompressionStream('deflate-raw')));
  return 'j'+encodeURIComponent(json);
}
async function unpackCookie(v){
  if(!v) return null;
  try{
    if(v[0]==='z'&&canZip) return JSON.parse(new TextDecoder().decode(await pipeBytes(unb64u(v.slice(1)),new DecompressionStream('deflate-raw'))));
    if(v[0]==='j') return JSON.parse(decodeURIComponent(v.slice(1)));
  }catch(e){}
  return null;
}
/* The newest records that fit in one cookie. The first pass trims by the measured compression
   ratio; each further pass tightens by 15% until it fits. */
async function cookieValue(){
  const prefs=readPrefs(), full=JSON.stringify(store);
  let v=await packCookie({s:store,p:prefs});
  if(v.length<=APP.cookieMax) return v;
  let budget=Math.floor(full.length*APP.cookieMax/v.length*0.95);
  for(let i=0;i<20;i++){
    const o=fitStore(JSON.parse(full),budget,true);
    v=await packCookie({s:o,p:prefs});
    if(v.length<=APP.cookieMax) return v;
    budget=Math.floor(budget*0.85);
  }
  return null;
}
let cookieBusy=null, cookieAgain=false;
function writeCookie(){                      /* coalesces bursts of saves into one cookie write */
  if(cookieBusy){ cookieAgain=true; return cookieBusy; }
  cookieBusy=(async()=>{
    do{ cookieAgain=false; const v=await cookieValue(); cookieOK=!!v&&cookieSet(APP.cookie,v,APP.cookieDays); }while(cookieAgain);
  })().catch(()=>{ cookieOK=false; }).finally(()=>{ cookieBusy=null; });
  return cookieBusy;
}

function persist(){
  store.v=APP.schema; store.updated=Date.now(); fitStore(store);
  const json=JSON.stringify(store);
  lsSet(LS('progress'),json); lsOK=lsGet(LS('progress'))===json;
  wq=writeCookie();
}
async function initStore(){
  const local=readLocal(), saved=await unpackCookie(cookieGet(APP.cookie));
  const fromCookie=saved&&cleanStore(saved.s);
  /* merge with what is in memory NOW: a run or exam may have been recorded while we waited */
  if(local) store=mergeStores(store,local);
  if(fromCookie) store=mergeStores(store,fromCookie);
  if(saved) applyPrefs(saved.p);
  const any=store.runs.length||store.exams.length||store.drills.length;
  if(any||saved) persist();                  /* writes both copies back; also renews the cookie's expiry */
  else { lsSet(LS('probe'),'1'); lsOK=lsGet(LS('probe'))==='1'; lsDel(LS('probe')); }
}
/* Every reader/writer awaits this once; it runs initStore at most once per page load. */
function ensureStore(){ if(!storeP) storeP=initStore().catch(()=>{}); return storeP; }
/* Add or replace records and save. Records go into memory right away (so screens can show them),
   then again after the store has loaded, in case loading replaced the in-memory copy. */
function saveRecords(kind,recs){
  const merge={runs:mergeRuns,exams:mergeExams,drills:mergeDrills}[kind];
  store[kind]=merge(store[kind],recs);
  return ensureStore().then(()=>{ store[kind]=merge(store[kind],recs); persist(); return wq; });
}
function clearStore(){
  return ensureStore().then(()=>{ store={v:APP.schema,updated:Date.now(),runs:[],exams:[],drills:[]}; persist(); return wq; });
}

/* ---- backup file: the way to move progress to another browser or device ---- */
function exportStore(){
  return ensureStore().then(()=>{
    const body=JSON.stringify({app:APP.ns,schema:APP.schema,exported:Date.now(),store,prefs:readPrefs()});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([body],{type:'application/json'}));
    a.download=`boilercram-progress-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  });
}
/* Resolves to the number of records in the file, or rejects when it is not a progress file. */
function importStore(file){
  if(!file||file.size>2e6) return Promise.reject(new Error('not a progress file'));
  return file.text().then(text=>{
    let o; try{ o=JSON.parse(text); }catch(e){ throw new Error('not a progress file'); }
    const s=cleanStore(o&&o.app===APP.ns?o.store:o);
    const n=s?s.runs.length+s.exams.length+s.drills.length:0;
    if(!n) throw new Error('not a progress file');
    return ensureStore().then(()=>{ store=mergeStores(store,s); if(o.app===APP.ns) applyPrefs(o.prefs); persist(); return n; });
  });
}
