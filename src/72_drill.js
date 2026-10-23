/* ==== 72 · drill ========================================================
   Exam-level questions with no clock, chosen by type, ending when every chosen
   type is cleared. Clearing rule (drCleared): the last 3 answers in the type are
   right, at least 2 of them within the slot's pace, at least 4 answers if the type
   started weak, and every variant missed (on exams before, or in this drill) has
   since been answered right. A missed variant returns after ≥ 2 other questions.
   Every answer is saved at once (drSave), so leaving mid-drill loses nothing.

   DR (the drill in progress, memory only):
     {ts, cats:[c], q:[{c,s,r,t,at}], st:{c:{hist,need,okSubs,cleared,clearedAt,hard}},
      set:{setup?,fig?,parts:[{c,it}]}, pi, shown, picked, lastCat, lastMiss:{s:qIndex}, seen:{s:1}, end, reason}
   A "set" is what one question card shows: one item, or for a linked type the shared
   setup plus its parts (selecting Track: normal force also asks Track: speed first).
   ======================================================================== */

/* build one question set for type c, optionally forcing variant `want` or avoiding variants in `avoid` */
function genOne(c){
  if(XSINGLE[c]) return {parts:[{c,it:{fig:'',...xroll(XSINGLE[c])}}]};
  if(c===7||c===8){ const t=xTrackSet(), p=t.items.map((it,i)=>({c:7+i,it:{fig:'',...it}}));
    return {setup:t.setup,fig:t.fig,parts:c===7?p.slice(0,1):p}; }
  const L=xLaunchSet();
  return {setup:L.setup,fig:L.fig,parts:[{c,it:{fig:'',...(c===12?x13(L.d):L.parts[c-13])}}]};
}
function genCat(c,want,avoid){
  let g=null;
  for(let i=0;i<70;i++){
    try{ g=genOne(c); }catch(e){ continue; }
    const s=xSub(c,g.parts[g.parts.length-1].it);
    if(want?s===want:!(avoid&&avoid.has(s))) return g;
  }
  return g||genOne(c);
}

let DR=null, DSEL=new Set(), DREC=[], DTOUCHED=false;

/* ---- picker ---- */
function drOpen(pre){
  DTOUCHED=!!(pre&&pre.length);
  show('dintro'); drPicker(pre);
  /* suggestions depend on saved history: redraw once it has loaded, unless the student already chose */
  ensureStore().then(()=>{ if(phase==='dintro'&&!DTOUCHED) drPicker(); });
}
function drPicker(pre){
  const evs=events(), rec=recommend(evs); DREC=rec.top.map(r=>r.c);
  DSEL=new Set(pre&&pre.length?pre:DREC);
  const box=$('dchips'); box.innerHTML='';
  XSLOTS.forEach((s,c)=>{
    const st=statOf(evs.filter(e=>e.c===c)), d=document.createElement('div');
    d.className='chip'+(DSEL.has(c)?' on':''); d.setAttribute('role','button'); d.tabIndex=0; d.setAttribute('aria-pressed',DSEL.has(c)?'true':'false');
    const sug=rec.top.find(r=>r.c===c);
    if(sug) d.classList.add('sug');
    d.dataset.tip=(sug?'Suggested: '+sug.why+'. ':'')+(st.n?`${STL[st.status]}: ${STTIP[st.status].toLowerCase()}`:'Not tried yet')+'. Click to include or leave out.';
    d.innerHTML=`<span class="cn">Q${c+1}</span>${esc(s.name)}<small class="st ${st.status}">${st.n?STL[st.status].toLowerCase():''}</small>`;
    const tog=()=>{ DTOUCHED=true; DSEL.has(c)?DSEL.delete(c):DSEL.add(c); d.classList.toggle('on',DSEL.has(c)); d.setAttribute('aria-pressed',DSEL.has(c)?'true':'false'); drPickNote(); };
    d.onclick=tog; d.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); tog(); } };
    box.appendChild(d);
  });
  drPickNote();
}
function drPickNote(){
  const n=DSEL.size; $('dbegin').disabled=!n;
  $('dbegin').textContent=n?`Start · ${n} ▸`:'Pick a type';
}

/* ---- running the drill ---- */
function drStart(){
  if(!DSEL.size) return;
  const evs=events();
  DR={ts:Date.now(),cats:[...DSEL].sort((a,b)=>a-b),q:[],st:{},lastCat:-1,set:null,pi:0,shown:0,picked:false,lastMiss:{},seen:{},end:0,reason:''};
  DR.cats.forEach(c=>{ const st=statOf(evs.filter(e=>e.c===c));
    DR.st[c]={hist:[],need:new Set(weakSubs(c,evs)),okSubs:new Set(),cleared:false,clearedAt:0,hard:st.n>0&&st.score<0.45}; });
  show('drill'); drNext();
}
const drOpenCats=()=>DR.cats.filter(c=>!DR.st[c].cleared);
const drLastPart=()=>!DR.set||DR.pi>=DR.set.parts.length-1;
function drNext(){
  if(!DR) return;
  if(!drLastPart()){ DR.pi++; drPaint(); return; }                 /* finish the linked set first */
  const open=drOpenCats(); if(!open.length){ drFinish('cleared'); return; }
  /* interleave: never the same type twice in a row when another is open; weight toward recent misses */
  const cand=open.length>1?open.filter(c=>c!==DR.lastCat):open;
  const wt=c=>{ const cs=DR.st[c]; return 1+cs.hist.slice(-4).filter(x=>x.r!==1).length+0.5*[...cs.need].filter(s=>!cs.okSubs.has(s)).length; };
  let x=Math.random()*cand.reduce((s,c)=>s+wt(c),0), c=cand[cand.length-1];
  for(const k of cand){ x-=wt(k); if(x<=0){ c=k; break; } }
  /* variant: a missed one once it has waited 2 questions, else sometimes an unseen one, else any but a just-missed one */
  const cs=DR.st[c], qn=DR.q.length, recent=s=>DR.lastMiss[s]!=null&&qn-DR.lastMiss[s]<3;
  const due=[...cs.need].filter(s=>!cs.okSubs.has(s)&&!recent(s));
  const unseen=CSUBS[c].filter(s=>!DR.seen[s]);
  const want=due.length?pick(due):unseen.length&&Math.random()<0.5?pick(unseen):null;
  DR.set=genCat(c,want,new Set(CSUBS[c].filter(recent))); DR.pi=0; DR.lastCat=c; drPaint();
}
function drPaint(){
  const p=DR.set.parts[DR.pi], it=p.it, n=DR.set.parts.length;
  $('dtag').textContent=XSLOTS[p.c].name;
  $('dpart').textContent=n>1?`· part ${DR.pi+1}/${n}`:'';
  $('dgroup').innerHTML=DR.set.setup?setupHTML(DR.set.setup,n>1?'Both parts use this setup':'Setup'):'';
  $('dstem').innerHTML=markGivens(it.stem);
  showFigure('d',it.fig||DR.set.fig||'','Fig. '+two(DR.q.length+1));
  optionButtons($('dopts'),it,-1,drPick);
  clearMath($('dexplain')); $('dverdict').textContent=''; $('dverdict').className='verdict'; $('dfb').hidden=true;
  $('dnext').hidden=true; $('dskip').hidden=false;
  $('dcount').textContent=`Q ${DR.q.length+1}`; $('dbig').textContent=two(DR.q.length+1);
  $('dpace').textContent=`pace ${fmtClock(XPACE[p.c])}`;
  DR.shown=Date.now(); DR.picked=false; drRail();
  every('drill',drClock,250); restartAnim($('dcard'));
}
function drClock(){
  if(!DR||DR.picked||phase!=='drill') return;
  const t=(Date.now()-DR.shown)/1000, c=DR.set.parts[DR.pi].c, el=$('dtime');
  el.textContent=fmtClock(t); el.classList.toggle('low',t>XPACE[c]);      /* count-up; red past exam pace */
}
function drCleared(c){
  const cs=DR.st[c], h=cs.hist; if(h.length<(cs.hard?4:3)) return false;
  const last=h.slice(-3);
  if(!last.every(x=>x.r===1)) return false;
  if(last.filter(x=>x.t<=XPACE[c]).length<2) return false;
  return [...cs.need].every(s=>cs.okSubs.has(s));
}
/* k = option index, or -1 for "I don't know" (saved like an exam blank) */
function drPick(k){
  if(!DR||DR.picked) return;
  DR.picked=true; stopTimer('drill');
  const p=DR.set.parts[DR.pi], it=p.it, ok=k===it.key, t=(Date.now()-DR.shown)/1000, s=xSub(p.c,it), r=ok?1:k<0?-1:0;
  DR.q.push({c:p.c,s,r,t:Math.round(t),at:Date.now()}); if(s) DR.seen[s]=1;
  let justCleared=false;
  const cs=DR.st[p.c];          /* undefined for an unselected first part of a linked pair: saved, not tracked */
  if(cs){
    cs.hist.push({r,t,s});
    if(s){ if(ok) cs.okSubs.add(s); else { cs.okSubs.delete(s); cs.need.add(s); DR.lastMiss[s]=DR.q.length-1; } }
    if(!cs.cleared&&drCleared(p.c)){ cs.cleared=true; cs.clearedAt=cs.hist.length; justCleared=true; }
  }
  [...$('dopts').children].forEach((b,i)=>{ b.disabled=true; b.setAttribute('aria-checked',i===k?'true':'false');
    if(i===it.key) b.classList.add('key'); else if(i===k) b.classList.add('bad'); });
  const v=$('dverdict'), pace=XPACE[p.c];
  v.className='verdict '+(ok?'ok':'no'); $('dfb').className='fb '+(ok?'ok':'no'); $('dfb').hidden=false;
  v.textContent=(ok?`Correct · ${fmtClock(t)}${t>pace?' · over pace':''}`:`Answer ${LET[it.key]}`)+(justCleared?' · type cleared':'');
  $('dexplain').innerHTML=whyHTML(it,k)+solHTML(it,!ok,DR.set.setup); typeset($('dexplain'));
  const done=drLastPart()&&!drOpenCats().length;
  $('dnext').textContent=!drLastPart()?'Next part':done?'See the summary':'Next question';
  $('dnext').hidden=false; $('dskip').hidden=true;
  drSave(); drRail();
}
function drAdvance(){ if(DR&&DR.picked) drNext(); }
function drRail(){
  const box=$('drail'); box.innerHTML='';
  DR.cats.forEach(c=>{
    const cs=DR.st[c], h=cs.hist.slice(-5), row=document.createElement('div'); row.className='drow'+(cs.cleared?' cleared':'');
    let streak=0; for(let i=cs.hist.length-1;i>=0&&cs.hist[i].r===1;i--) streak++;
    const owed=[...cs.need].filter(s=>!cs.okSubs.has(s));
    const left=Math.max(0,3-streak,(cs.hard?4:3)-cs.hist.length);
    const note=cs.cleared?'cleared':owed.length?`fix: ${owed.map(s=>SUBL[s]).join(', ')}`:left?`${left} to go`:'1 at pace';
    row.innerHTML=`<b>${esc(XSLOTS[c].name)}</b><span class="pips2">${h.map(x=>`<i class="${x.r===1?(x.t>XPACE[c]?'slow':'ok'):'no'}"></i>`).join('')}</span><em>${esc(note)}</em>`;
    box.appendChild(row);
  });
}
function drRecord(){ return {ts:DR.ts,cats:DR.cats,q:DR.q.slice(),cleared:DR.cats.filter(c=>DR.st[c].cleared),end:DR.end||0,reason:DR.reason||''}; }
function drSave(){ if(DR&&DR.q.length) saveRecords('drills',[drRecord()]); }
function drFinish(reason){
  if(!DR) return;
  stopTimer('drill'); DR.end=Date.now(); DR.reason=reason;
  drSave(); drSummary();
}
function drStop(){
  if(!DR) return;
  if(!DR.q.length){ DR=null; show('start'); return; }        /* nothing answered: nothing to save or summarize */
  drFinish('stopped');
}
function drSummary(){
  show('ddone');
  const q=DR.q, n=q.length, right=q.filter(x=>x.r===1).length, cl=DR.cats.filter(c=>DR.st[c].cleared);
  $('dhead').textContent=DR.reason==='cleared'?'Drill complete':'Drill stopped';
  $('dverdictline').textContent=`${cl.length}/${DR.cats.length} cleared`;
  $('dQ').textContent=n; $('dAcc').textContent=n?pct(right/n):'–'; $('dT').textContent=n?fmtClock(q.reduce((s,x)=>s+x.t,0)/n):'–';
  const tb=$('dtable').querySelector('tbody'); tb.innerHTML='';
  [...new Set(DR.cats.concat(q.map(x=>x.c)))].sort((a,b)=>a-b).forEach(c=>{
    const l=q.filter(x=>x.c===c), cs=DR.st[c], missed=[...new Set(l.filter(x=>x.r!==1&&x.s).map(x=>SUBL[x.s]))];
    const out=!cs?'<span class="mono">linked part</span>':cs.cleared?`<span class="okc">${cs.clearedAt} Q</span>`:'<span class="noc">open</span>';
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${esc(XSLOTS[c].name)}${missed.length?`<span class="how">✕ ${esc(missed.join(', '))}</span>`:''}</td>`+
      `<td class="num">${l.filter(x=>x.r===1).length} / ${l.length}</td><td class="num">${l.length?fmtClock(l.reduce((s,x)=>s+x.t,0)/l.length):'–'}</td><td>${out}</td>`;
    tb.appendChild(tr);
  });
}
