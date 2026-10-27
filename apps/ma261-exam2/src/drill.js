/* =====================================================================
   DRILL: exam-level questions (xItem) on chosen topics, no countdown,
   ending when every chosen topic is cleared or the student stops.
   Clearing rule (drClears): the topic's last 3 answers are right, at least
   2 of them within XEXP (5:00), at least 4 answers if the topic started weak
   (missed in its first 2 answers here, or "needs work" from history), and
   every template missed in this drill has since been answered right.
   A missed template comes back after at least 2 other questions.
   Every answer is saved at once (store.drills, merged by ts), and the drill
   in progress is kept in localStorage (DRKEY) so a reload can resume it.
   Also: the study sheet's open/back wiring, and renderDrillProg() for the
   progress page.
   Only names used at call time come from other files, so this file can sit
   anywhere after partX.js.
   ===================================================================== */
const DRKEY='ma261-e2:drill', DRMISS_CAP=40;
/* short topic labels for chips, the question header and tables (full names live in XTAGS) */
const DRS={LAGR:'Lagrange',DREV:'Order of integration',DBL:'Double integrals',POLAR:'Polar',TRI:'Triple integrals',CYL:'Cylindrical',
  SPH:'Spherical',MASS:'Mass & centroid',VF:'Vector fields',LINES:'Scalar line integrals',WORK:'Work & flux',CONS:'Conservative fields',
  GREEN:'Green’s Theorem',DIVC:'Div & curl',SURF:'Surface integrals'};
const DR_ST={new:'not tried',weak:'needs work',shaky:'shaky',solid:'solid'};
const DR_STTIP={new:'No answers yet',weak:'Below 45%: weighted across mock exams and drills, recent answers count most',
  shaky:'45–70%: not yet reliable',solid:'70% or more, and right on the latest mock exam'};
let DR=null, DRSEL=new Set(), DRTOUCH=false, drTickH=null, drLastTick=0, drSaveAcc=0, drSheetSet=false;

const drOk=t=>typeof t==='string'&&Object.prototype.hasOwnProperty.call(XTAGS,t);
const drName=t=>DRS[t]||(XTAGS[t]?XTAGS[t].name:String(t));
const drPace=()=>(typeof XEXP==='number'&&XEXP>0)?XEXP:300;

/* ---- history: every mock-exam and drill answer per topic ---- */
function drEvents(skipTs){
  const out=[];
  (store.exams||[]).forEach(e=>{ if(!e||!Array.isArray(e.tags)) return;
    e.tags.forEach((t,i)=>{ const r=e.res&&e.res[i]; if(!drOk(t)||r==null) return; if(r===-1&&e.timeUp) return;   /* time ran out: not evidence */
      out.push({src:'exam',ts:+e.ts||0,tag:t,r:r===1?1:0,t:e.t&&e.t[i]!=null?+e.t[i]:null}); }); });
  (store.drills||[]).forEach(d=>{ if(!d||!Array.isArray(d.q)||d.ts===skipTs) return;
    d.q.forEach(x=>{ if(x&&drOk(x.tag)) out.push({src:'drill',ts:+d.ts||0,tag:x.tag,r:x.r===1?1:0,t:x.t!=null?+x.t:null}); }); });
  return out.sort((a,b)=>a.ts-b.ts);
}
/* weight = (exam 1 | drill 0.5) × ½^(age / 30 days); credit 1 right (0.7 for a drill answer over 1.5 × pace), 0 wrong;
   score = (Σ w·credit + 1)/(Σ w + 2), so 50% with no evidence */
function drStat(list,now){
  now=now||Date.now(); let sw=0,sc=0,lastEx=null,lastDr=0;
  list.forEach(e=>{
    const w=(e.src==='exam'?1:0.5)*Math.pow(0.5,Math.max(0,now-e.ts)/(30*864e5));
    sw+=w; sc+=w*(e.r!==1?0:(e.src==='drill'&&e.t!=null&&e.t>1.5*drPace()?0.7:1));
    if(e.src==='exam') lastEx=e; else lastDr=Math.max(lastDr,e.ts);
  });
  const n=list.length, score=(sc+1)/(sw+2);
  let status=!n?'new':score<0.45?'weak':score<0.7?'shaky':'solid';
  if(status==='solid'&&(!lastEx||lastEx.r!==1)) status='shaky';      /* drills alone never lift a topic past shaky */
  return {n,score,status,lastEx,lastDr};
}
function drProb(t){ try{ for(const k in XPROB) if(XPROB[k]&&XPROB[k][t]!=null) return XPROB[k][t]; }catch(e){} return 0.5; }
/* suggestions: weakest first; a topic drilled in the last 3 days waits its turn; likelier exam topics break ties */
function drRecommend(evs){
  const now=Date.now();
  const rows=XTAG_ORDER.map((t,i)=>{
    const st=drStat(evs.filter(e=>e.tag===t),now), days=st.lastDr?(now-st.lastDr)/864e5:99, space=Math.min(1,days/3);
    const lx=st.lastEx, need=(1-st.score)*(0.3+0.7*space)+(lx&&lx.r!==1?0.06:0)+0.04*drProb(t);
    let why=lx&&lx.r!==1?'missed on your last mock exam':!st.n?'not tried yet':st.status==='weak'?'needs work':st.status==='shaky'?'not yet reliable':'keeping it fresh';
    if(st.lastDr&&days<3) why+=`; drilled ${days<1?'today':Math.round(days)+' day'+(Math.round(days)===1?'':'s')+' ago'}`;
    return {t,i,st,need,why};
  });
  const top=rows.slice().sort((a,b)=>b.need-a.need||a.i-b.i).slice(0,3);
  return {rows,top};
}

/* ---- the in-progress drill in localStorage ---- */
function drKeep(){ try{ if(DR&&!DR.end) localStorage.setItem(DRKEY,JSON.stringify(DR)); else localStorage.removeItem(DRKEY); }catch(e){} }
function drLoad(){
  try{ const s=localStorage.getItem(DRKEY); if(!s) return null; const o=JSON.parse(s);
    if(!o||o.v!==1||!Array.isArray(o.tags)||!o.tags.length||!o.tags.every(drOk)||!Array.isArray(o.q)||!o.st||o.end) return null;
    if(!o.tags.every(t=>o.st[t]&&Array.isArray(o.st[t].hist))) return null;
    return o; }catch(e){ return null; }
}
function drDrop(){ try{ localStorage.removeItem(DRKEY); }catch(e){} }

/* ---- picker ---- */
function drOpen(pre){
  DRTOUCH=!!(pre&&pre.length);
  show('dintro'); window.scrollTo(0,0); drPicker(DRTOUCH?pre:null); drResumeNote();
  /* suggestions depend on saved history: redraw once it has loaded, keeping any choice already made */
  ensureStore().then(()=>{ if(phase==='dintro'){ drPicker(DRTOUCH?[...DRSEL]:null); drResumeNote(); } });
}
function drPicker(pre){
  const evs=drEvents(), rec=drRecommend(evs), sug=new Map(rec.top.map(r=>[r.t,r]));
  DRSEL=new Set(pre?pre.filter(drOk):rec.top.map(r=>r.t));
  const box=$('drchips'); box.innerHTML='';
  [[15,'15.8'],[16,'Ch 16'],[17,'Ch 17']].forEach(([ch,label])=>{
    const tags=XTAG_ORDER.filter(t=>XTAGS[t].ch===ch); if(!tags.length) return;
    const g=document.createElement('div'); g.className='drgroup';
    g.innerHTML=`<div class="setlabel">${label}</div>`;
    const chips=document.createElement('div'); chips.className='chips'; g.appendChild(chips);
    tags.forEach(t=>{
      const row=rec.rows.find(r=>r.t===t), st=row.st, s=sug.get(t), d=document.createElement('div');
      d.className='chip'+(DRSEL.has(t)?' on':'')+(s?' sug':''); d.setAttribute('role','button'); d.tabIndex=0;
      d.setAttribute('aria-pressed',DRSEL.has(t)?'true':'false'); d.dataset.tag=t;
      d.dataset.tip=`${XTAGS[t].name} (§${XTAGS[t].sec}). `+(s?`Suggested: ${s.why}. `:'')+
        (st.n?`${DR_ST[st.status][0].toUpperCase()+DR_ST[st.status].slice(1)}: ${DR_STTIP[st.status].toLowerCase()} (${st.n} answer${st.n===1?'':'s'}).`:'Not tried yet.');
      d.innerHTML=`<span class="cn">${esc(XTAGS[t].sec)}</span>${esc(drName(t))}<small class="st ${st.status}">${DR_ST[st.status]}</small>`;
      const tog=()=>{ DRTOUCH=true; DRSEL.has(t)?DRSEL.delete(t):DRSEL.add(t);
        d.classList.toggle('on',DRSEL.has(t)); d.setAttribute('aria-pressed',DRSEL.has(t)?'true':'false'); drPickNote(); };
      d.onclick=tog; d.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); tog(); } };
      chips.appendChild(d);
    });
    box.appendChild(g);
  });
  drPickNote();
}
function drPickNote(){ const n=DRSEL.size, b=$('drbegin'); b.disabled=!n; b.textContent=n?`Start · ${n} ▸`:'Pick a topic'; }
function drResumeNote(){
  const s=DR&&!DR.end?DR:drLoad(), el=$('drresume');
  if(!s){ el.hidden=true; return; }
  el.hidden=false;
  $('drresumetxt').textContent=`Drill in progress · ${s.tags.length} topic${s.tags.length>1?'s':''} · ${s.q.length} answered`;
}

/* ---- running the drill ---- */
function drStart(tags){
  tags=(tags||[]).filter(drOk); if(!tags.length) return;
  if(DR&&!DR.end){ DR.end=Date.now(); }                       /* a drill left open is already saved as stopped */
  const evs=drEvents(), st={};
  tags.forEach(t=>{ const s=drStat(evs.filter(e=>e.tag===t)); st[t]={hist:[],s0:s.score,weak0:s.status==='weak',cleared:0,dead:0}; });
  DR={v:1,ts:Date.now(),tags,st,q:[],owed:{},missAt:{},seen:{},last:'',lastId:'',cur:null,pick:-1,el:0,misses:[],end:0,reason:''};
  drKeep(); show('drill'); window.scrollTo(0,0); drNext();
}
const drOpenTags=()=>DR.tags.filter(t=>!DR.st[t].cleared&&!DR.st[t].dead);
const drOwedIn=t=>Object.keys(DR.owed).filter(id=>DR.owed[id]===t);
/* round-robin over open topics (never the same twice in a row while another is open), weakest first;
   a missed template is due once 2 other questions have passed */
function drChoose(){
  const open=drOpenTags(); if(!open.length) return null;
  const qn=DR.q.length, cand=open.length>1?open.filter(t=>t!==DR.last):open;
  const due=Object.keys(DR.owed).filter(id=>cand.includes(DR.owed[id])&&qn-DR.missAt[id]>=3).sort((a,b)=>DR.missAt[a]-DR.missAt[b]);
  if(due.length) return {tag:DR.owed[due[0]],want:due[0]};
  const key=t=>{ const h=DR.st[t].hist; return h.length-h.slice(-3).filter(x=>x.r!==1).length-(DR.st[t].weak0?0.5:0); };
  const tag=cand.slice().sort((a,b)=>key(a)-key(b)||DR.st[a].s0-DR.st[b].s0||DR.tags.indexOf(a)-DR.tags.indexOf(b))[0];
  return {tag,want:null};
}
/* one item for the topic: the owed template if asked for; otherwise prefer templates not seen in this drill,
   never the one just asked or one missed less than 2 questions ago */
function drItem(tag,want){
  const ids=XGEN.filter(g=>g.tag===tag).map(g=>g.id), qn=DR.q.length;
  let it=null;
  if(want){ it=xItem(tag,new Set(ids.filter(id=>id!==want))); if(it&&it.id!==want) it=null; }
  if(!it){
    const recent=id=>DR.missAt[id]!=null&&DR.owed[id]&&qn-DR.missAt[id]<3;
    const ok=ids.filter(id=>!recent(id)&&id!==DR.lastId), fresh=ok.filter(id=>!DR.seen[id]);
    const pool=fresh.length?fresh:ok.length?ok:ids;
    it=xItem(tag,new Set(ids.filter(id=>!pool.includes(id))));
    if(!it) it=xItem(tag,new Set());
  }
  return it&&Array.isArray(it.opts)&&it.opts.length>=2&&it.key>=0&&it.key<it.opts.length?it:null;
}
function drNext(){
  if(!DR) return;
  for(let guard=0;guard<40;guard++){
    const c=drChoose(); if(!c){ drFinish('cleared'); return; }
    let it=null; try{ it=drItem(c.tag,c.want); }catch(e){ it=null; }
    if(it){ DR.cur=it; DR.pick=-1; DR.el=0; DR.last=c.tag; drKeep(); drPaint(); return; }
    if(c.want) delete DR.owed[c.want];                            /* that template cannot be rebuilt: do not hold the topic on it */
    else DR.st[c.tag].dead=1;                                     /* no question could be built for this topic */
  }
  drFinish(DR.q.length?'stopped':'cleared');
}
function drPaint(){
  const it=DR.cur, card=$('drcard');
  try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([card]); }catch(e){}
  $('drtag').textContent=drName(it.tag); $('drtag').dataset.tip=`${XTAGS[it.tag].name} · §${XTAGS[it.tag].sec}`;
  $('drcount').textContent=`Q ${DR.q.length+1}`;
  const st=$('drstem'); st.innerHTML=it.stem; st.classList.add('wait');
  const box=$('dropts'); box.innerHTML=''; box.classList.add('wait');
  it.opts.forEach((o,k)=>{
    const b=document.createElement('button'); b.type='button'; b.className='xopt'; b.setAttribute('role','radio'); b.setAttribute('aria-checked','false');
    b.innerHTML=`<b>${LET[k]}</b><span>${o.h}</span>`; b.onclick=()=>drPick(k); box.appendChild(b);
  });
  $('drfb').hidden=true; $('drexplain').innerHTML=''; $('drverdict').textContent=''; $('drnext').hidden=true;
  drClockPaint(); drRail();
  card.classList.remove('rise'); void card.offsetWidth; card.classList.add('rise');
  typeset(card,()=>{ st.classList.remove('wait'); box.classList.remove('wait'); });
  drTickStart();
}
/* the clock counts only while this screen is showing and the page is visible */
function drTickStart(){ clearInterval(drTickH); drLastTick=Date.now(); drSaveAcc=0; drTickH=setInterval(drTick,250); }
function drTick(){
  const now=Date.now(), dt=Math.min(1,(now-drLastTick)/1000); drLastTick=now;
  if(!DR||DR.end||!DR.cur||DR.pick>=0){ clearInterval(drTickH); drTickH=null; return; }
  if(phase!=='drill'){ clearInterval(drTickH); drTickH=null; drKeep(); return; }
  if(document.hidden) return;
  DR.el+=dt; drSaveAcc+=dt; drClockPaint();
  if(drSaveAcc>=5){ drSaveAcc=0; drKeep(); }
}
function drClockPaint(){ $('drtime').textContent=fmtClock(DR.el); $('drpill').classList.toggle('over',DR.el>drPace()); }
function drClears(t){
  const s=DR.st[t], h=s.hist, last=h.slice(-3);
  if(last.length<3||!last.every(x=>x.r===1)) return false;
  if(last.filter(x=>x.t<=drPace()).length<2) return false;
  if((s.weak0||h.slice(0,2).some(x=>x.r!==1))&&h.length<4) return false;
  return drOwedIn(t).length===0;
}
function drPick(k){
  if(!DR||!DR.cur||DR.pick>=0||DR.end||phase!=='drill') return;
  const it=DR.cur; if(k<0||k>=it.opts.length) return;
  clearInterval(drTickH); drTickH=null;
  DR.pick=k;
  const ok=k===it.key, t=Math.round(DR.el), s=DR.st[it.tag];
  DR.q.push({tag:it.tag,id:it.id,r:ok?1:0,t});
  s.hist.push({r:ok?1:0,t,id:it.id}); DR.seen[it.id]=1; DR.lastId=it.id;
  if(ok) delete DR.owed[it.id];
  else{ DR.owed[it.id]=it.tag; DR.missAt[it.id]=DR.q.length-1;
    DR.misses.push({n:DR.q.length,item:it,pick:k,t}); if(DR.misses.length>DRMISS_CAP) DR.misses.shift(); }
  let just=false;
  if(!s.cleared&&drClears(it.tag)){ s.cleared=s.hist.length; just=true; }
  [...$('dropts').children].forEach((b,i)=>{ b.disabled=true; b.setAttribute('aria-checked',i===k?'true':'false');
    if(i===it.key) b.classList.add('drk'); else if(i===k) b.classList.add('drx'); });
  const fb=$('drfb'), v=$('drverdict'), ex=$('drexplain');
  fb.className='drfb'+(ok?'':' no'); fb.hidden=false;
  v.className='verdict '+(ok?'ok':'no');
  v.textContent=(ok?`✓ Correct · ${fmtClock(t)}`:`✕ Answer ${LET[it.key]}`)+(just?' · topic cleared':'');
  try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([ex]); }catch(e){}
  const why=!ok&&it.opts[k].why?`<span class="whyno">Why ${LET[k]} is tempting: ${it.opts[k].why}</span>`:'';
  let sol=solHTML(it); if(ok) sol=sol.replace('<details class="sol" open>','<details class="sol">');
  ex.innerHTML=why+sol; typeset(ex);
  const done=!drOpenTags().length;
  const nb=$('drnext'); nb.textContent=done?'Results ▸':'Next ▸'; nb.dataset.tip=done?'Every topic is cleared: see the summary (Enter)':'Next question (Enter)'; nb.hidden=false;
  drClockPaint(); drRail(); drSave(); drKeep();
}
function drAdvance(){ if(DR&&!DR.end&&DR.pick>=0) drNext(); }
function drRail(){
  const box=$('drail'); box.innerHTML='';
  DR.tags.forEach(t=>{
    const s=DR.st[t], h=s.hist, row=document.createElement('div'); row.className='drow'+(s.cleared?' cleared':'');
    let streak=0; for(let i=h.length-1;i>=0&&h[i].r===1;i--) streak++;
    const owed=drOwedIn(t).length, weak=s.weak0||h.slice(0,2).some(x=>x.r!==1);
    const left=Math.max(0,3-streak,(weak?4:3)-h.length);
    const note=s.cleared?'cleared':s.dead?'unavailable':owed?`${owed} to redo`:left?`${left} to go`:'1 within 5:00';
    row.innerHTML=`<b>${esc(drName(t))}</b><span class="drpips">${h.slice(-5).map(x=>`<i class="${x.r===1?(x.t>drPace()?'slow':'ok'):'no'}"></i>`).join('')}</span><em>${esc(note)}</em>`;
    box.appendChild(row);
  });
}
function drRecord(){
  return {ts:DR.ts,tags:DR.tags.slice(),q:DR.q.map(x=>({tag:x.tag,id:x.id,r:x.r,t:x.t})),
    cleared:DR.tags.filter(t=>DR.st[t].cleared),end:DR.end||Date.now(),reason:DR.reason==='cleared'?'cleared':'stopped'};
}
/* saved after every answer (same ts: the merge keeps the newest copy); until it ends it is saved as stopped */
function drSave(){
  if(!DR||!DR.q.length) return;
  const rec=drRecord();
  ensureStore().then(()=>{ store.drills=mergeRuns(store.drills||[],[rec]); persist(); });
}
function drFinish(reason){
  if(!DR) return;
  clearInterval(drTickH); drTickH=null;
  if(!DR.q.length){ DR=null; drDrop(); drOpen(); return; }          /* nothing answered: nothing to save or summarize */
  DR.end=Date.now(); DR.reason=reason; DR.cur=null;
  drSave(); drDrop(); drSummary();
}
function drStop(){ if(DR&&!DR.end) drFinish('stopped'); }
function drSummary(){
  show('ddone'); window.scrollTo(0,0);
  const q=DR.q, n=q.length, right=q.filter(x=>x.r===1).length, cl=DR.tags.filter(t=>DR.st[t].cleared), tot=q.reduce((s,x)=>s+x.t,0);
  $('drhead').textContent=DR.reason==='cleared'&&cl.length===DR.tags.length?'Drill complete':'Drill ended';
  $('drline').textContent=`${cl.length}/${DR.tags.length} cleared`;
  $('drQ').textContent=n; $('drAcc').textContent=n?Math.round(right/n*100)+'%':'–';
  $('drAvg').textContent=n?fmtClock(tot/n):'–'; $('drTot').textContent=fmtClock(tot);
  const tb=$('drtable').querySelector('tbody'); tb.innerHTML='';
  DR.tags.forEach(t=>{
    const l=q.filter(x=>x.tag===t), s=DR.st[t], tr=document.createElement('tr');
    tr.innerHTML=`<td>${esc(drName(t))}<span class="how">§${esc(XTAGS[t].sec)}</span></td><td class="num">${l.filter(x=>x.r===1).length}/${l.length}</td>`+
      `<td class="num">${l.length?fmtClock(l.reduce((a,x)=>a+x.t,0)/l.length):'–'}</td>`+
      (s.cleared?`<td class="okc" data-tip="Cleared on answer ${s.cleared} in this topic">✓ ${s.cleared} Q</td>`:'<td class="opc" data-tip="Not cleared yet: Drill again starts with it">–</td>');
    tb.appendChild(tr);
  });
  const ol=$('drmiss');
  try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([ol]); }catch(e){}
  ol.innerHTML=''; $('drmisswrap').hidden=!DR.misses.length;
  DR.misses.forEach(m=>{
    const it=m.item, li=document.createElement('li'); li.className='xq';
    let h=`<span class="meta">Q${m.n} · ${esc(drName(it.tag))} · you chose ${LET[m.pick]} · ${fmtClock(m.t)}</span><div>${it.stem}</div>`;
    it.opts.forEach((o,k)=>{ const isKey=k===it.key, bad=k===m.pick&&!isKey;
      h+=`<span class="opt${isKey?' key':''}${bad?' bad':''}"><i>${isKey?'✓':bad?'✕':' '}${LET[k]}</i>${o.h}</span>`; });
    if(it.opts[m.pick]&&it.opts[m.pick].why) h+=`<span class="whyno">Why ${LET[m.pick]} is tempting: ${it.opts[m.pick].why}</span>`;
    li.innerHTML=h+solHTML(it); ol.appendChild(li);
  });
  if(DR.misses.length) typeset(ol);
}
function drAgain(){
  if(!DR) return drOpen();
  const tags=DR.tags.filter(t=>!DR.st[t].cleared).concat(DR.tags.filter(t=>DR.st[t].cleared));
  ensureStore().then(()=>drStart(tags));
}
function drResume(){
  const s=DR&&!DR.end?DR:drLoad(); if(!s){ drResumeNote(); return; }
  DR=s; show('drill'); window.scrollTo(0,0);
  if(DR.cur&&DR.pick<0) drPaint(); else drNext();
}
function drDiscard(){
  const s=DR&&!DR.end?DR:drLoad();
  if(s&&s.q.length){ DR=s; DR.end=Date.now(); DR.reason='stopped'; drSave(); }
  DR=null; drDrop(); drResumeNote();
}

/* ---- progress page: the drill history (#drprog) ---- */
function renderDrillProg(){
  const box=$('drprog'); if(!box) return;
  const ds=(store.drills||[]).filter(d=>d&&+d.ts>0&&Array.isArray(d.q)&&d.q.length).slice().sort((a,b)=>b.ts-a.ts);
  box.hidden=!ds.length; if(!ds.length){ box.innerHTML=''; return; }
  const row=d=>{
    const tags=(Array.isArray(d.tags)?d.tags:[]).filter(drOk), cl=(Array.isArray(d.cleared)?d.cleared:[]).filter(drOk);
    const q=d.q.filter(x=>x&&drOk(x.tag)), right=q.filter(x=>x.r===1).length;
    const names=tags.map(drName).join(', ');
    return `<tr><td>${esc(whenStr(+d.ts))}</td><td>${esc(names)}</td><td class="num">${right}/${q.length}</td>`+
      `<td class="num" data-tip="${esc(cl.length?'Cleared: '+cl.map(drName).join(', '):'None cleared')}">${cl.length}/${tags.length}${cl.length&&cl.length===tags.length?' ✓':''}</td></tr>`;
  };
  const head='<thead><tr><th>When</th><th>Topics</th><th class="num">Right</th><th class="num">Cleared</th></tr></thead>';
  const recent=ds.slice(0,8), older=ds.slice(8);
  box.innerHTML=`<h2>Drills</h2><div class="tablebox"><table>${head}<tbody>${recent.map(row).join('')}</tbody></table></div>`+
    (older.length?`<details class="fold"><summary>${older.length} older</summary><div class="tablebox"><table>${head}<tbody>${older.map(row).join('')}</tbody></table></div></details>`:'');
}

/* ---- study sheet ---- */
function openSheet(){
  show('sheet'); window.scrollTo(0,0);
  if(!drSheetSet){ drSheetSet=true; typeset($('sheet')); }
}

/* ---- wiring ---- */
{ const t=$('toDrill'); if(t) t.onclick=()=>drOpen(); }
{ const t=$('toSheet'); if(t) t.onclick=openSheet; }
$('drbegin').onclick=()=>{ if(!DRSEL.size) return; const sel=[...DRSEL]; ensureStore().then(()=>drStart(XTAG_ORDER.filter(t=>sel.includes(t)))); };
$('drback').onclick=()=>{ show('start'); window.scrollTo(0,0); };
$('drres').onclick=drResume;
$('drdis').onclick=drDiscard;
$('drnext').onclick=drAdvance;
$('drstop').onclick=drStop;
$('dragain').onclick=drAgain;
$('drnew').onclick=()=>{ DR=null; drOpen(); };
$('drhome').onclick=()=>{ show('start'); window.scrollTo(0,0); };
$('sheetback').onclick=()=>{ show('start'); window.scrollTo(0,0); };
$('sheetup').onclick=()=>window.scrollTo(0,0);
document.querySelectorAll('#sheet [data-go]').forEach(b=>{ b.onclick=()=>{ const el=$(b.dataset.go); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); }; });
document.addEventListener('keydown',e=>{
  if(phase!=='drill'||!DR||DR.end||e.metaKey||e.ctrlKey||e.altKey) return;
  const tg=e.target, tn=tg&&tg.tagName;
  if(tn==='INPUT'||tn==='TEXTAREA'||tn==='SELECT'||(tg&&tg.isContentEditable)) return;
  if(e.key==='Enter'){
    if(DR.pick<0) return;
    if((tn==='BUTTON'||tn==='A'||tn==='SUMMARY')&&!tg.disabled) return;      /* the focused control handles its own Enter */
    e.preventDefault(); drAdvance(); return;
  }
  if(e.key.length!==1||DR.pick>=0||!DR.cur) return;
  const i=LET.indexOf(e.key.toUpperCase());
  if(i>=0&&i<DR.cur.opts.length){ e.preventDefault(); drPick(i); }
});
document.addEventListener('visibilitychange',()=>{ if(document.hidden&&DR&&!DR.end) drKeep(); });
window.addEventListener('pagehide',()=>{ if(DR&&!DR.end) drKeep(); });
