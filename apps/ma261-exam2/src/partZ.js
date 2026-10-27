/* ---- wiring ---- */
$('go').onclick=startGame;
$('submit').onclick=submit;
$('again').onclick=startGame;
$('back').onclick=()=>{ show('start'); window.scrollTo(0,0); paintBest('bestline'); };
$('toProg').onclick=openProg;
$('toProg2').onclick=openProg;
$('progback').onclick=()=>{ show('start'); window.scrollTo(0,0); paintBest('bestline'); };
$('pdrill').onclick=()=>{ if(!drillCats.length)return; active=new Set(drillCats); syncChips(); startGame(); };
$('clearhist').onclick=()=>{
  const b=$('clearhist');
  if(!armed){ armed=true; b.textContent='Tap again to erase the history';
    clearTimeout(armTimer); armTimer=setTimeout(()=>{armed=false;b.textContent='Clear history';},4000); return; }
  clearTimeout(armTimer); armed=false; b.textContent='Clear history';
  ensureStore().then(()=>{ store={v:1,updated:Date.now(),runs:[],sess:[],exams:[],diags:[],drills:[],dmis:{},mlog:[],ai:null,mlbf:1}; persist(); renderProg(); });
};
$('ans').addEventListener('keydown',e=>{ if(e.key==='Enter'){e.preventDefault();submit();} });
document.addEventListener('keydown',e=>{
  if(phase!=='play') return;
  if(e.key==='Escape'){ endGame(); return; }
  if(cur&&cur.ui==='mcq'&&!e.metaKey&&!e.ctrlKey&&!e.altKey){
    const k=e.key.toUpperCase(), i=LET.indexOf(k)>=0?LET.indexOf(k):'12345'.indexOf(e.key);
    if(i>=0&&i<cur.opts.length){ e.preventDefault(); pickOpt(i); }
  }
});

/* ---- start screen tiles, header, first-visit welcome (same behaviour as the PHYS pages) ---- */
const SITE={root:'{{ROOT}}', rootPath:new URL('{{ROOT}}',location.href).pathname};
const goStart=()=>{ show('start'); window.scrollTo(0,0); paintBest('bestline'); xBoot(); };
const leaveSafely=()=>{                         /* save whatever is running before leaving the screen */
  if(phase==='play') endGame();
  else if(phase==='exam'&&XE&&!XE.done){ xLog(); xSave(); }
};
$('home').onclick=leaveSafely;                  /* a link to the class picker: save first, then it navigates */
$('examhome').onclick=()=>{ if(phase==='start') return; leaveSafely(); goStart(); };
$('goTop').onclick=startGame;
const WKEY='boilercram:welcome:ma261e2', WCOOKIE='es_welcome_ma261e2';
const welcomed=()=>{ try{ return localStorage.getItem(WKEY)==='1'||cookieGet(WCOOKIE)==='1'; }catch(e){ return cookieGet(WCOOKIE)==='1'; } };
const hintExam=()=>{ let done=false; try{ done=localStorage.getItem('ma261-e2:examhint')==='done'; }catch(e){}
  $('toExam').classList.toggle('hint',welcomed()&&!done&&!(store.exams||[]).length); };
$('toExam').onclick=()=>{ try{ localStorage.setItem('ma261-e2:examhint','done'); }catch(e){} $('toExam').classList.remove('hint'); openXIntro(false); };
const welcome=$('welcome');
welcome.addEventListener('close',()=>{ try{ localStorage.setItem(WKEY,'1'); }catch(e){} cookieSet(WCOOKIE,'1',CK_DAYS,SITE.rootPath); hintExam(); });
welcome.addEventListener('click',e=>{ if(e.target===welcome) welcome.close(); });
$('welcomeok').onclick=()=>welcome.close();
if(!welcomed()){ try{ welcome.showModal(); }catch(e){ welcome.setAttribute('open',''); } }
{ const openDiag=$('toDiag').onclick; $('toDiag').onclick=()=>{ openDiag(); ensureStore().then(dStartCard); }; }

/* ---- boot ---- */
function snapshot(){
  return {dur,mode,active:[...active],phase:phase==='play'||phase==='done'||phase==='exam'||phase==='dg'?phase:'start',elapsed:phase==='play'?Date.now()-t0:0,
    results,streak,qi,cur,bank,over,bonusOn,sessTs};
}
function boot(data){
  data=data||{};
  try{ const v=localStorage.getItem('ma261-e2:bonus'); if(v!==null) bonusOn=v==='1'; }catch(e){}
  try{ const v=localStorage.getItem('ma261-e2:mode'); if(v==='mcq'||v==='type') mode=v; }catch(e){}
  if(data.dur) dur=data.dur;
  if(data.mode) mode=data.mode;
  if(typeof data.bonusOn==='boolean') bonusOn=data.bonusOn;
  bank=data.bank||0; over=!!data.over; sessTs=data.sessTs||0;
  paintBonus();
  if(Array.isArray(data.active)){ const ok=data.active.filter(t=>TOPICS.includes(t)); if(ok.length) active=new Set(ok); }
  [...$('durchips').children].forEach(x=>{ const on=+x.dataset.dur===dur; x.classList.toggle('on',on); x.setAttribute('aria-pressed',on?'true':'false'); });
  [...$('modechips').children].forEach(x=>{ const on=x.dataset.mode===mode; x.classList.toggle('on',on); x.setAttribute('aria-pressed',on?'true':'false'); });
  buildGroups();
  if(data.phase==='play'&&data.cur&&data.elapsed<(dur+bank)*1000){
    results=data.results||[]; streak=data.streak||0; qi=data.qi||1; cur=data.cur;
    buildTicks(); show('play'); t0=Date.now()-data.elapsed; paintQ(); cur.shown=Date.now(); paintStats(); runClock();
  }else if(data.phase==='done'&&Array.isArray(data.results)){
    results=data.results; renderResults(); show('done'); typeset($('missed')); openSessionUI(sessTs,results,'done');
  }else if(data.phase==='exam'&&xLoad()){
    XE=xLoad(); XE.last=Date.now(); if(XE.deadline>Date.now()) xOpen(); else xFinish(true);
  }else if(data.phase==='dg'&&dLoad()){ DG=dLoad(); dOpen();
  }else{ show('start'); xBoot(); }
  ensureStore().then(()=>{ dStartCard(); hintExam(); }); mlogBackfill();
}
boot({});

window.MA261={tex,XTOTAL,XOPT,XGEN,GEN,XTAGS,openSessionPage,xConcept,xObs,xItem,buildExam,dFocus,pQueue,pLocal,mlogMerge,renderAIProg,openXIntro,DCON,DIDEA,DEXP,buildDiag,dMastery,dReadiness,dStart,dPick,dAnswer,dFinish,_dg:()=>DG,_dlast:()=>DLAST,
  _state:()=>({bank,over,bonusOn,phase,qi,mode,runs:store.runs.length,sess:(store.sess||[]).length,exams:(store.exams||[]).length,cookieOK}),
  _xe:()=>XE, _xlast:()=>XLAST, _xadvance:sec=>{ if(XE){ XE.deadline-=sec*1000; xClock(); } },
  _store:()=>store, _cur:()=>cur, _results:()=>results, _open:()=>OPEN,
  _advance:sec=>{ t0-=sec*1000; paintClock(); },
  _ageQ:sec=>{ if(cur){ cur.shown-=sec*1000; paintClock(); } }};
})();
</script>
