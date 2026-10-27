
/* =====================================================================
   MISTAKE-PATTERN ANALYST (behind the scenes; the student never talks to it)
   1. LOG: every answered problem from sprints, diagnostics and mock exams
      becomes one compact event in store.mlog (backfilled once from saved sessions).
   2. LOCAL MINER (always on): recurring traps across modes, certain-but-wrong,
      exam/diagnostic misses, lucky guesses, sprint miss streaks, slow-but-right.
   It feeds pQueue(), which pins up to half of every diagnostic. Sprints never
   move the concept map.
   ===================================================================== */
const MLOG_CAP=600, DAY=864e5, AI_MIN_GAP=120000, PKINDS=['misconception','procedure','careless','speed','guessing'];
let GCI=null, BF_RUN=false;

/* event: [sessionTs, k, mode(0 sprint · 1 diagnostic · 2 mock exam), concept index, problem id, res(1/0/−1), conf(0–3), seconds, expected seconds, trap text] */
function genConcept(id){
  if(!GCI){ GCI={}; GEN.forEach(g=>{ let i=DCON.findIndex(c=>c.sk.includes(g.id)); if(i<0) i=DCON.findIndex(c=>c.topic===g.cat); GCI[g.id]=i; }); }
  return id in GCI?GCI[id]:-1;
}
function ciOfId(id){ if(/^x-/.test(id)) return xConcept(id); if(/^i:/.test(id)) return DCON.findIndex(c=>c.id===id.slice(2)); return genConcept(id); }
function evOf(ts,r,k){
  const m=r.exam?2:r.diag?1:0; let id=String(r.id||''); if(m===1) id=id.replace(/^[xs]:/,'');
  const ci=ciOfId(id); if(ci<0) return null;
  const res=r.ok?1:r.skipped?-1:0;
  const e=r.exp||(m===2?XEXP:m===1?(/^x-/.test(id)?XEXP:90):(BUDGET[r.lv]||300));
  return [ts,k,m,ci,id,res,r.conf||0,Math.round(r.spent||0),Math.round(e),res===1?'':String(r.trap||'').replace(/<[^>]+>/g,'').slice(0,100)];
}
function mlogMerge(evs){
  const L=store.mlog||(store.mlog=[]), seen=new Set(L.map(e=>e[0]+':'+e[1]));
  evs.forEach(e=>{ if(e&&!seen.has(e[0]+':'+e[1])){ seen.add(e[0]+':'+e[1]); L.push(e); } });
  L.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  while(L.length>MLOG_CAP){ const i=L.findIndex(e=>e[2]===0&&e[5]===1); L.splice(i>=0&&i<L.length-200?i:0,1); }   /* oldest clean sprint answers go first */
}
function mlogAdd(run,rs){ try{ mlogMerge(rs.map((r,k)=>evOf(run.ts,r,k))); }catch(e){} }
/* one-time: rebuild the log from sessions saved before the analyst existed */
async function mlogBackfill(){
  if(BF_RUN) return; BF_RUN=true;
  await ensureStore(); if(store.mlbf) return;
  const have=new Set((store.mlog||[]).map(e=>e[0])), list=(store.sess||[]).map(s=>s.ts).filter(ts=>!have.has(ts));
  for(const ts of list){ try{ const d=await loadSession(ts); if(d&&Array.isArray(d.items)) mlogMerge(d.items.map((it,k)=>evOf(ts,it,it.k!=null?it.k:k))); }catch(e){} }
  store.mlbf=1; persist();
}

/* ---- local miner ---- */
const normTrap=s=>String(s||'').toLowerCase().replace(/\$[^$]*\$/g,'').replace(/[^a-z ]+/g,' ').replace(/\s+/g,' ').trim().slice(0,60);
function pLocal(){
  const L=store.mlog||[], now=Date.now(), out=[], recent=L.filter(e=>now-e[0]<30*DAY);
  const add=(tmpl,ci,pri,why,ts,kind)=>out.push({tmpl:tmpl&&XGEN.some(g=>g.id===tmpl)?tmpl:null,ci,pri,why,ts,src:'local',kind});
  recent.forEach(e=>{
    const ex=/^x-/.test(e[4]);
    if(e[2]>0&&e[5]===0&&e[6]===3) add(ex?e[4]:null,e[3],5,'You were certain and wrong here: likely a misconception.',e[0],'misconception');
    else if(e[2]===2&&e[5]!==1) add(e[4],e[3],4,'Missed on a mock exam.',e[0],'exam');
    else if(e[2]===1&&e[5]!==1) add(ex?e[4]:null,e[3],3,e[5]===-1?'You said you did not know this on a diagnostic.':'Missed on a diagnostic.',e[0],'diag');
    else if(e[2]>0&&e[5]===1&&e[6]===1) add(ex?e[4]:null,e[3],2,'Right, but you were guessing.',e[0],'guessing');
  });
  /* the same trap more than once, across any mode */
  const tr={}; recent.forEach(e=>{ if(e[5]!==0||!e[9]) return; const k=normTrap(e[9]); if(k.length<12) return; (tr[k]=tr[k]||[]).push(e); });
  Object.values(tr).forEach(g=>{ if(g.length<2) return; const last=g[g.length-1], ex=g.slice().reverse().find(e=>/^x-/.test(e[4]));
    add(ex?ex[4]:null,last[3],4+Math.min(1,(g.length-2)*.5),`Same mistake ${g.length} times: ${last[9].slice(0,80)}`,last[0],'recurring'); });
  /* sprint streaks and slow-but-right spots, per concept */
  DCON.forEach((c,ci)=>{
    const sp=L.filter(e=>e[2]===0&&e[3]===ci).slice(-8), miss=sp.filter(e=>e[5]!==1).length;
    if(miss>=3&&sp.length&&now-sp[sp.length-1][0]<14*DAY) add(null,ci,2.5,`${miss} of your last ${sp.length} practice problems on this concept were missed.`,sp[sp.length-1][0],'practice');
    const dx=L.filter(e=>e[2]>0&&e[3]===ci).slice(-10), slow=dx.filter(e=>e[5]===1&&e[7]>2*e[8]);
    if(slow.length>=2) add(null,ci,1.5,'Right but slow more than once: not automatic yet.',slow[slow.length-1][0],'speed');
  });
  return out;
}
function pAI(){ return []; }          /* the personal version also queued problems from an AI analyst */
/* a target is done once a later diagnostic or mock exam got it right without guessing */
function pResolved(c){ return (store.mlog||[]).some(e=>e[0]>c.ts&&e[2]>0&&e[5]===1&&e[6]!==1&&(c.tmpl?e[4]===c.tmpl:e[3]===c.ci)); }
function pQueue(){
  const now=Date.now(), by={};
  pLocal().concat(pAI()).forEach(c=>{
    if(c.ci<0||pResolved(c)) return;
    const days=(now-c.ts)/DAY, p=c.pri*(0.6+0.4*Math.exp(-days/10)), k=c.tmpl||('c'+c.ci);
    const cur=by[k];
    if(!cur) by[k]={...c,p,n:1};
    else{ cur.n++; if(c.src==='ai'&&cur.src!=='ai'){ cur.why=c.why; cur.src='ai'; } cur.p=Math.max(cur.p,p)+0.3; }
  });
  return Object.values(by).sort((a,b)=>b.p-a.p);
}

const aiAdjust=()=>0;                   /* no outside corrections to the concept map */

/* ---- progress page: read-only view of what the analyst sees ---- */
function renderAIProg(){
  const box=$('aiprog'), L=store.mlog||[]; box.hidden=!L.length; if(!L.length) return;
  const cnt=m=>L.filter(e=>e[2]===m).length;
  $('ailine').textContent=`Watching ${L.length} answered problems (${cnt(0)} practice, ${cnt(1)} diagnostic, ${cnt(2)} exam).`;
  $('aipatwrap').hidden=true;
  const q=pQueue().slice(0,8);
  $('aiqwrap').hidden=!q.length;
  $('aiq').innerHTML=q.map(c=>`<li><b>${esc(DCON[c.ci].name)}</b>${c.tmpl?` <span class="hw">${esc(c.tmpl)}</span>`:''}<span class="how">${esc(c.why)}</span></li>`).join('');
  const tr={}; L.forEach(e=>{ if(e[5]!==0||!e[9]) return; const k=normTrap(e[9]); if(k.length<12) return; const t=tr[k]||(tr[k]={n:0,txt:e[9],ci:e[3],m:new Set()}); t.n++; t.m.add('SDX'[e[2]]); });
  const top=Object.values(tr).filter(t=>t.n>=2).sort((a,b)=>b.n-a.n).slice(0,6);
  $('aitrwrap').hidden=!top.length;
  $('aitr').innerHTML=top.map(t=>`<li><b>${esc(DCON[t.ci].name)}</b> · ${t.n} times (${[...t.m].map(x=>({S:'practice',D:'diagnostic',X:'exam'})[x]).join(', ')})<span class="how">${esc(t.txt)}</span></li>`).join('');
}
