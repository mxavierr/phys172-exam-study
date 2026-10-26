/* ==== 90 · wiring ========================================================
   Every static button handler and the single keyboard dispatcher live here,
   so a renamed id or a new button is a one-file change. Handlers attached to
   elements that are created at render time stay with their render code
   (exam nav buttons, drill chips, "Drill this type" rows, resume links).
   ======================================================================== */
const on=(id,fn)=>{ const el=$(id); if(!el) throw new Error('wiring: no element #'+id); el.onclick=fn; };
const goHome=()=>{ show('start'); paintBest('bestline'); xBoot(); };
const onKeyActivate=(el,fn)=>{ el.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); fn(e); } }; };

/* ---- the logo: home from anywhere. A sprint in play ends and is saved (as Esc does);
   an exam in progress is saved and offered for resume; drills save after every answer. ---- */
const leaveSafely=()=>{
  if(phase==='play') endGame();
  else if(phase==='exam'&&XE&&!XE.done){ xLog(); xSave(); }
};
on('home',leaveSafely);                         /* a link to the class picker: save first, then it navigates */
on('examhome',()=>{ if(phase==='start') return; leaveSafely(); goHome(); });

/* ---- start screen + sprint ---- */
on('go',startGame);
on('goTop',startGame);
on('submit',submit);
on('skip',()=>{ $('ans').value=''; submit(); $('ans').focus(); });
on('again',startGame);
on('back',goHome);
on('examFocus',()=>{ active=new Set(TOPICS.filter(t=>EXAM_OUT.indexOf(t)<0)); syncChips(); });
on('allTopics',()=>{ active=new Set(TOPICS); syncChips(); });
on('bonuschip',toggleBonus); onKeyActivate($('bonuschip'),toggleBonus);
$('durchips').onclick=e=>{ const c=e.target.closest('.chip'); if(c) pickDur(c); };
onKeyActivate($('durchips'),e=>{ const c=e.target.closest('.chip'); if(c) pickDur(c); });
$('ans').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } });

/* ---- progress page ---- */
['toProg','toProg2','toProg3','toProg4'].forEach(id=>on(id,openProg));
on('progback',goHome);
on('sprintWeak',()=>{ if(!sprintWeakCats.length) return; active=new Set(sprintWeakCats); syncChips(); startGame(); });
on('clearhist',()=>armButton($('clearhist'),'Tap again to erase it all','Clear history',()=>clearStore().then(renderProg)));
on('sdrill',()=>drOpen());
on('exporthist',()=>exportStore());
on('importhist',()=>{ $('importfile').value=''; $('importfile').click(); });
$('importfile').onchange=e=>{
  const f=e.target.files&&e.target.files[0]; if(!f) return;
  importStore(f).then(n=>{ renderProg(); paintStoreNote(`✓ ${n} records merged`); },
                      ()=>paintStoreNote('✕ Not a progress file'));
};

/* ---- first visit: the welcome explains the modes and recommends a mock exam, whose tile then
   wears a "start here" ring until it is opened (never for someone who already has an exam saved) ---- */
const WKEY='boilercram:welcome:'+SITE.group, WCOOKIE='es_welcome'+(SITE.group==='phys'?'':'_'+SITE.group);   /* one welcome per kind of exam page */
const welcomed=()=>lsGet(WKEY)==='1'||lsGet(LS('welcome'))==='1'||cookieGet(WCOOKIE)==='1';
const hintExam=()=>{ $('toExam').classList.toggle('hint',welcomed()&&lsGet(LS('examhint'))!=='done'&&!store.exams.length); };
const welcome=$('welcome');
welcome.addEventListener('close',()=>{ lsSet(WKEY,'1'); cookieSet(WCOOKIE,'1',APP.cookieDays,SITE.rootPath); hintExam(); });
welcome.addEventListener('click',e=>{ if(e.target===welcome) welcome.close(); });   /* click outside the box */
on('welcomeok',()=>welcome.close());
if(!welcomed()){ try{ welcome.showModal(); }catch(e){ welcome.setAttribute('open',''); } }
ensureStore().then(hintExam);

/* ---- mock exam ---- */
const openExamIntro=()=>{ lsSet(LS('examhint'),'done'); $('toExam').classList.remove('hint'); renderSlotMap(); show('xintro'); };
on('toExam',openExamIntro);
on('xbegin',()=>{
  const start=()=>{ $('xresume').hidden=true; lsDel(LS('exam')); xStart(); };
  if(xLoad()) armButton($('xbegin'),'Tap again: this discards the exam in progress','Begin exam',start); else start();
});
on('xback',goHome);
on('xprev',()=>XE&&xGo(XE.cur-1));
on('xnext',()=>XE&&xGo(XE.cur+1));
on('xflag',xFlag);
on('xsubmit',xSubmitClick);
on('xagain',openExamIntro);
on('xhome',goHome);

/* ---- drill ---- */
on('toDrill',()=>drOpen());
on('dbegin',drStart);
on('dback',goHome);
on('dnext',drAdvance);
on('dskip',()=>drPick(-1));
on('dstop',drStop);
on('dagain',()=>drOpen());
on('dhome',goHome);

/* ---- keyboard: one dispatcher, routed by the current screen ----
   Enter is left to the browser while a button has focus, so it never fires twice. */
document.addEventListener('keydown',e=>{
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const k=e.key.length===1?e.key.toUpperCase():'', opt=it=>k&&LET.indexOf(k)>=0&&LET.indexOf(k)<it.opts.length;
  const onButton=document.activeElement&&document.activeElement.tagName==='BUTTON';
  if(phase==='play'){ if(e.key==='Escape') endGame(); return; }
  if(phase==='exam'&&XE&&!XE.done){
    if(opt(XE.items[XE.cur])){ e.preventDefault(); xPick(LET.indexOf(k)); }
    else if(e.key==='ArrowRight'){ e.preventDefault(); xGo(XE.cur+1); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); xGo(XE.cur-1); }
    else if(k==='F'){ e.preventDefault(); xFlag(); }
    return;
  }
  if(phase==='drill'&&DR&&DR.set){
    if(!DR.picked&&opt(DR.set.parts[DR.pi].it)){ e.preventDefault(); drPick(LET.indexOf(k)); }
    else if(DR.picked&&e.key==='Enter'&&!onButton){ e.preventDefault(); drAdvance(); }
  }
});
