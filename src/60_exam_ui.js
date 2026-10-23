/* ==== 60 · mock exam screens =============================================
   Clock, question navigation, flags, grading, review and the saved record.
   XE (the exam in progress) is mirrored to localStorage LS('exam') after every
   change, so a reload resumes it; the clock keeps running while the page is closed.
   XE = {v, items:[exam item], ans:[-1|k], flag:[bool], spent:[s], cur, t0, deadline, last, done}
   ======================================================================== */
let XE=null;

function xSave(){ if(XE&&!XE.done) lsSet(LS('exam'),JSON.stringify(XE)); else lsDel(LS('exam')); }
function xLoad(){
  try{ const o=JSON.parse(lsGet(LS('exam'))||'null');
    return o&&Array.isArray(o.items)&&o.items.length===XSLOTS.length&&!o.done?o:null; }catch(e){ return null; }
}
function xStart(){
  const now=Date.now(), n=XSLOTS.length;
  XE={v:1,items:buildExam(),ans:Array(n).fill(-1),flag:Array(n).fill(false),spent:Array(n).fill(0),
     cur:0,t0:now,deadline:now+XMIN*60000,last:now,done:false};
  xSave(); xOpen();
}
function xOpen(){
  show('exam'); XE.last=Date.now();
  const b=$('xsubmit'); b.dataset.armed=''; b.textContent='Submit exam';
  xPaint(); every('exam',xClock,250);
}
/* time on the current question is booked whenever the student leaves it */
function xLog(){ const now=Date.now(); if(XE&&!XE.done){ XE.spent[XE.cur]+=(now-XE.last)/1000; XE.last=now; } }
function xClock(){
  if(!XE||XE.done||phase!=='exam') return;
  const left=(XE.deadline-Date.now())/1000;
  if(left<=0){ xFinish(true); return; }
  const t=$('xtime'), f=$('xfill'), low=left<=300;
  t.textContent=fmtClock(left); t.classList.toggle('low',low);
  f.style.width=Math.max(0,left/(XMIN*60)*100)+'%'; f.classList.toggle('low',low);
  const open=XE.ans.filter(a=>a<0).length;
  $('xpace').textContent=open?`${fmtClock(left/open)} / open Q`:'all answered';
}
function xNav(){
  const nav=$('xnav'); nav.innerHTML='';
  const gk=j=>XE.items[j].group?XE.items[j].group.from:-1;            /* a small gap marks each linked set */
  XE.items.forEach((it,i)=>{
    if(i>0&&gk(i)!==gk(i-1)&&(gk(i)>=0||gk(i-1)>=0)){ const g=document.createElement('span'); g.className='gap'; nav.appendChild(g); }
    const b=document.createElement('button'); b.type='button'; b.textContent=String(i+1);
    b.className=[XE.ans[i]>=0?'ans':'',XE.flag[i]?'flag':'',i===XE.cur?'cur':''].join(' ').trim();
    b.setAttribute('aria-label',`Question ${i+1}${XE.ans[i]>=0?', answered':''}${XE.flag[i]?', flagged':''}`);
    if(i===XE.cur) b.setAttribute('aria-current','true');
    b.onclick=()=>xGo(i); nav.appendChild(b);
  });
  $('xcount').textContent=`${XE.ans.filter(a=>a>=0).length} / ${XSLOTS.length} answered`;
}
function xPaint(){
  const it=XE.items[XE.cur];
  $('xtag').textContent=it.slot.name; $('xqn').textContent=two(XE.cur+1); $('xbig').textContent=two(XE.cur+1);
  $('xnum').textContent=`${XPTS} pts`;
  $('xgroup').innerHTML=it.group?setupHTML(it.group.setup,`Questions ${it.group.from+1}–${it.group.to+1} use this setup`):'';
  $('xstem').innerHTML=markGivens(it.stem);
  showFigure('x',it.fig||(it.group&&it.group.fig)||'','Fig. '+(XE.cur+1));
  optionButtons($('xopts'),it,XE.ans[XE.cur],xPick);
  $('xprev').disabled=XE.cur===0; $('xnext').disabled=XE.cur===XSLOTS.length-1;
  $('xflag').textContent=XE.flag[XE.cur]?'Unflag':'Flag';
  xNav(); restartAnim($('xcard'));
}
function xPick(k){
  if(!XE||XE.done) return;
  XE.ans[XE.cur]=XE.ans[XE.cur]===k?-1:k; xSave();          /* tapping the chosen answer again clears it */
  [...$('xopts').children].forEach((b,i)=>b.setAttribute('aria-checked',XE.ans[XE.cur]===i?'true':'false'));
  xNav(); xClock();
}
function xGo(i){
  if(!XE||XE.done||i<0||i>=XSLOTS.length||i===XE.cur) return;
  xLog(); XE.cur=i; xSave(); xPaint();
  const top=$('xnav').getBoundingClientRect().top; if(top<0) window.scrollBy(0,top-12);
}
function xFlag(){ if(!XE||XE.done) return; XE.flag[XE.cur]=!XE.flag[XE.cur]; xSave(); $('xflag').textContent=XE.flag[XE.cur]?'Unflag':'Flag'; xNav(); }
function xSubmitClick(){
  const open=XE.ans.filter(a=>a<0).length;
  armButton($('xsubmit'),open?`${open} unanswered · tap again to submit`:'Tap again to submit','Submit exam',()=>xFinish(false));
}
function xFinish(timeUp){
  if(!XE||XE.done) return;
  xLog(); stopTimer('exam');
  XE.done=true; XE.timeUp=!!timeUp; XE.end=Math.min(Date.now(),XE.deadline);
  lsDel(LS('exam'));
  const res=xGrade(XE), saved=xRecord(res);
  xResults(res); renderXTypes(res);
  saved.then(()=>{ if(phase==='xdone') renderXTypes(res); });   /* again once the account copy has merged in */
}
function xGrade(E){
  const per=E.items.map((it,i)=>({i,ok:E.ans[i]===it.key,pick:E.ans[i],key:it.key,t:E.spent[i]}));
  const right=per.filter(p=>p.ok).length;
  return {E,per,right,score:right*XPTS,used:Math.max(0,(E.end-E.t0)/1000)};
}
/* exam record: slots keeps the v1 shape (1 right, 0 wrong, -1 blank) for old readers;
   q adds the variant (s) and seconds spent (t) for each question (c = slot index). */
function xRecord(res){
  const r=p=>p.ok?1:(p.pick<0?-1:0);
  const rec={ts:res.E.t0,score:res.score,right:res.right,used:Math.round(res.used),timeUp:res.E.timeUp?1:0,
             slots:res.per.map(r),q:res.per.map(p=>({c:p.i,s:xSub(p.i,res.E.items[p.i]),r:r(p),t:Math.round(p.t)}))};
  return saveRecords('exams',[rec]);
}
function xResults(res){
  const E=res.E, pc=Math.round(res.score/XTOT*100), blank=res.per.filter(p=>p.pick<0).length;
  show('xdone');
  $('xhead').textContent=`${res.score} / ${XTOT}`;
  $('xRight').textContent=res.right; $('xPct').textContent=pc+'%'; $('xUsed').textContent=fmtClock(res.used);
  $('xRightOf').textContent=`of ${XSLOTS.length}`; $('xUsedOf').textContent=`of ${fmtClock(XMIN*60)}`;
  const band=pc>=90?'Exam-ready':pc>=75?'Solid':pc>=60?'Passing':'Keep going';
  $('xverdict').textContent=band+(E.timeUp?' · time ran out':'')+(blank?` · ${blank} blank`:'');
  const ol=$('xreview'); clearMath(ol);
  const setupShown=new Set();
  res.per.filter(p=>!p.ok).concat(res.per.filter(p=>p.ok)).forEach(p=>{     /* misses first */
    const it=E.items[p.i], li=document.createElement('li'); li.className=p.ok?'okq':''; li.value=p.i+1;
    const state=p.ok?'correct':p.pick<0?'unanswered':`you chose ${LET[p.pick]}`;
    let h=`<span class="meta">Question ${p.i+1} · ${it.slot.name} · ${state}</span>`;
    if(it.group){ h+=`<details class="setup"${setupShown.has(it.group.from)?'':' open'}><summary>Shared setup (Questions ${it.group.from+1}–${it.group.to+1})</summary>`+
                     `<div class="xset">${markGivens(it.group.setup)}${it.group.fig?figPanel(it.group.fig,'Setup figure'):''}</div></details>`; setupShown.add(it.group.from); }
    h+=`<div>${markGivens(it.stem)}</div>${it.fig?figPanel(it.fig,'Fig. '+(p.i+1)):''}`;
    it.opts.forEach((o,k)=>{ const isKey=k===p.key, bad=k===p.pick&&!isKey;
      h+=`<span class="opt${isKey?' key':''}${bad?' bad':''}"><i>${isKey?'✓':bad?'✕':' '}${LET[k]}</i>${o.h}${isKey?' · answer':bad?' · your pick':''}</span>`; });
    h+=whyHTML(it,p.pick)+solHTML(it,!p.ok);
    li.innerHTML=h; ol.appendChild(li);
  });
  typeset(ol);
}

/* ---- exam intro: the 15 slots in order; a linked set (shared setup) is one bracketed group ---- */
function renderSlotMap(){
  const grp=i=>XSLOTS[i]&&(i===7||i===8?'T':i>=12?'L':''), cell=i=>`<span class="slot" title="${esc(XSLOTS[i].name)}">${i+1}</span>`;
  let h='';
  for(let i=0;i<XSLOTS.length;){
    const g=grp(i);
    if(g){ let j=i; const c=[]; while(j<XSLOTS.length&&grp(j)===g) c.push(cell(j++)); h+=`<span class="slotgrp" title="Shared setup">${c.join('')}</span>`; i=j; }
    else h+=cell(i++);
  }
  $('slotmap').innerHTML=h+`<span class="slotkey"><i></i>shared setup</span>`;
}

/* ---- on the start screen: resume an exam left open, or grade one whose time ran out while closed ---- */
function xBoot(){
  const s=xLoad(), el=$('xresume');
  if(!s){ el.hidden=true; return; }
  const left=(s.deadline-Date.now())/1000;
  el.hidden=false;
  el.innerHTML=`<svg class="ico sm"><use href="#i-exam"/></svg><span>Mock exam · ${left>0?fmtClock(left)+' left':'time up'}</span>`+
    `<button id="xres">${left>0?'Resume ▸':'Results ▸'}</button><button class="link" id="xdis">Discard</button>`;
  $('xres').onclick=()=>{ el.hidden=true; XE=s; XE.last=Date.now(); if((XE.deadline-Date.now())>0) xOpen(); else xFinish(true); };
  $('xdis').onclick=()=>{ lsDel(LS('exam')); el.hidden=true; };
}
