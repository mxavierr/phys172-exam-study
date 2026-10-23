/* ==== 95 · boot ==========================================================
   Restores preferences, resumes a sprint that was in play when the page was
   closed or reloaded, starts loading saved progress, offers to resume a mock
   exam, and exposes a small test hook. Closes the shared function scope opened
   in 10_core.js.
   ======================================================================== */
function snapshot(){
  return {dur,active:[...active],phase,elapsed:phase==='play'?Date.now()-t0:0,results,streak,qi,cur,bank,over,bonusOn};
}
function boot(data){
  data=data||{};
  if([180,300,600].includes(data.dur)) dur=data.dur;
  const b=lsGet(LS('bonus')); if(b!==null) bonusOn=b==='1';
  if(typeof data.bonusOn==='boolean') bonusOn=data.bonusOn;
  bank=data.bank||0; over=!!data.over;
  paintBonus();
  if(Array.isArray(data.active)){ const ok=data.active.filter(t=>TOPICS.includes(t)); if(ok.length) active=new Set(ok); }
  [...$('durchips').children].forEach(x=>x.classList.toggle('on',+x.dataset.dur===dur));
  buildGroups();
  const fix=r=>({...r,lv:r.lv||1,sol:r.sol||[]});
  if(data.phase==='play'&&data.cur){            /* resumes into overtime too, if the clock ran out meanwhile */
    results=(data.results||[]).map(fix); streak=data.streak||0; qi=data.qi||1; cur=fix(data.cur);
    buildTicks(); show('play'); t0=Date.now()-data.elapsed; paintQ(); cur.shown=Date.now(); paintStats(); runClock();
  }else if(data.phase==='done'&&Array.isArray(data.results)){
    results=data.results.map(fix); renderResults(); show('done'); typeset($('missed'));
  }else show('start');
  ensureStore();
  xBoot();
}
/* A sprint in play is saved to localStorage LS('sprint') whenever the page is hidden or closed,
   and resumed on the next visit within SNAP_MAX_AGE (the clock does not run while away). */
const SNAP_MAX_AGE=60*60*1000;
function saveSnap(){ if(phase==='play'&&cur) lsSet(LS('sprint'),JSON.stringify({at:Date.now(),...snapshot()})); }
function readSnap(){
  try{
    const o=JSON.parse(lsGet(LS('sprint'))||'null'); lsDel(LS('sprint'));
    return o&&o.phase==='play'&&o.cur&&typeof o.cur.q==='string'&&Date.now()-num(o.at)<SNAP_MAX_AGE?o:null;
  }catch(e){ return null; }
}
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') saveSnap(); });
window.addEventListener('pagehide',saveSnap);
boot(readSnap()||{});

/* test hook (used by tests/*.py; harmless for students) */
window.EnergySprint={APP,K,GEN,TOPICS,LEVEL,FIG,XSLOTS,buildExam,parseNum,close,sci,tn,bonusFor,fmtClock,BUDGET,
  _state:()=>({bank,over,bonusOn,phase,qi,runs:store.runs.length,exams:store.exams.length,drills:store.drills.length,lsOK,cookieOK,timers:Object.keys(TIMERS)}),
  _store:()=>store, _seed:r=>saveRecords('runs',[r]), _saveSnap:saveSnap,
  _cookie:{get:()=>cookieGet(APP.cookie),unpack:unpackCookie}, _cur:()=>cur, _persistDone:()=>wq,
  _advance:sec=>{ t0-=sec*1000; paintClock(); },
  _ageQ:sec=>{ if(cur){ cur.shown-=sec*1000; paintClock(); } },
  _skills:{events,statOf,findPatterns,recommend,xSub,tagsOf,genCat,CSUBS,SUBL,XPACE,drCleared:c=>drCleared(c)},
  _tex:{solHTML,TEX_OPTS,markGivens},
  _drill:()=>DR, _drPick:k=>drPick(k), _drAge:sec=>{ if(DR) DR.shown-=sec*1000; },
  _exam:()=>XE, _xage:sec=>{ if(XE){ XE.deadline-=sec*1000; XE.t0-=sec*1000; xClock(); } }};
})();
