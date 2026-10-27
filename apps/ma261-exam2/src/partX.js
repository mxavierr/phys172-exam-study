
/* =====================================================================
   MOCK EXAM 2: blueprint sampler, clock, navigation, grading, topic
   review, history. Exam in progress survives a reload (this browser).
   ===================================================================== */
/* XMIN: the real exam is 60 minutes, and so is this one */
const XBASE=60, XMULT=1, XN=12, XMIN=Math.round(XBASE*XMULT), XPTS=8, XFREE=4, XTOTAL=XN*XPTS+XFREE, XKEY='ma261-e2:exam';
/* F2026 prediction from the pattern model: P(a question of this type appears) */
/* Exam 2 (F26: 15.8, 16.1–16.6, 17.1–17.6 part 1) from the 2015–2025 Exam 2 archive, recent exams weighted up;
   triple integrals (16.4–16.6) carry the most questions, as on every past Exam 2 */
const XPROB={15:{LAGR:.85},16:{DREV:.75,DBL:.55,POLAR:.80,TRI:.90,CYL:.85,SPH:.90,MASS:.45},
  17:{VF:.40,LINES:.65,WORK:.60,CONS:.75,GREEN:.65,DIVC:.45,SURF:.50}};
const XDUP=['SPH','TRI','CYL','POLAR','DREV','CONS','LINES'];   /* tags that have appeared twice on one exam */
let XE=null, xtick=null, xarm=false, xarmT=null, XLAST=null;

/* chapter counts: Lagrange 1 (85%), Ch 16 six to eight, Ch 17 three to five (recent exams: 1/6/5, older: 1/7/4) */
function xCounts(){
  const r=Math.random();
  return r<0.4?{15:1,16:7,17:4}:r<0.7?{15:1,16:6,17:5}:r<0.85?{15:0,16:7,17:5}:{15:1,16:8,17:3};
}
/* k distinct tags whose inclusion probabilities follow the model: scale p so they sum to k (capped at 1), then
   systematic sampling over a shuffled order hits each tag with exactly that probability. About a third of past
   exams repeat a topic (F2018 LINE+ARC, S2023 VEC, F2017 TP, S2017 PD, F2016 PLANE, S2015 TP): sometimes do that too. */
function xTags(table,k){
  const tags=Object.keys(table); if(k>=tags.length) return shuf(tags).concat(Array.from({length:k-tags.length},()=>pick(tags)));
  let lo=0,hi=50; for(let it=0;it<60;it++){ const c=(lo+hi)/2, s=tags.reduce((a,t)=>a+Math.min(1,c*table[t]),0); if(s<k) lo=c; else hi=c; }
  const pi={}; tags.forEach(t=>pi[t]=Math.min(1,hi*table[t]));
  const order=shuf(tags), u=Math.random(), out=[]; let acc=0, j=0;
  for(const t of order){ const a=acc, b=acc+pi[t]; while(j<k&&u+j<b-1e-12){ if(u+j>=a) { out.push(t); } j++; } acc=b; }
  while(out.length<k) out.push(order.find(t=>!out.includes(t)));
  if(coin(0.3)){ const d=out.filter(t=>XDUP.includes(t)); if(d.length){ const low=out.slice().sort((a,b)=>pi[a]-pi[b])[0]; out[out.indexOf(low)]=pick(d); } }
  return out;
}
function xDraw(tag,used){
  const cand=XGEN.filter(g=>g.tag===tag);
  for(let round=0;round<4;round++){
    const fresh=cand.filter(g=>!used.has(g.id)), pool=fresh.length?fresh:cand;
    const tot=pool.reduce((s,g)=>s+g.w,0); let x=Math.random()*tot, G=pool[pool.length-1];
    for(const g of pool){ x-=g.w; if(x<=0){ G=g; break; } }
    for(let i=0;i<60;i++){
      let o=null; try{ o=G.fn(); }catch(e){ o=null; }
      if(o&&o.opts&&o.opts.length===XOPT){ used.add(G.id); return {g:G,o}; }
    }
  }
  return null;
}
/* key letters: uniform, at most one adjacent repeat across the exam */
function xLetters(n){
  for(;;){ const a=Array.from({length:n},()=>ri(0,XOPT-1)); let rep=0; for(let i=1;i<n;i++) if(a[i]===a[i-1]) rep++; if(rep<=1) return a; }
}
function buildExam(){
  const cnt=xCounts(), tags=[].concat(xTags(XPROB[15],cnt[15]),xTags(XPROB[16],cnt[16]),xTags(XPROB[17],cnt[17]));
  const used=new Set(), items=[];
  for(const tag of tags){
    const d=xDraw(tag,used); if(!d) continue;
    items.push({tag,id:d.g.id,src:d.g.src,o:d.o});
  }
  while(items.length<XN){ const tag=pick(Object.keys(XPROB[16])); const d=xDraw(tag,used); if(d) items.push({tag,id:d.g.id,src:d.g.src,o:d.o}); }
  const order=shuf(items.slice(0,XN)), L=xLetters(XN);
  return order.map((it,i)=>{
    const key=it.o.opts[0], rest=shuf(it.o.opts.slice(1)); rest.splice(L[i],0,key);
    return {tag:it.tag,id:it.id,src:it.src,stem:it.o.stem,opts:rest.map(o=>({h:o.h,why:o.why||'',ok:!!o.ok})),key:L[i],
            how:it.o.how||'',sol:it.o.sol||[],lv:it.o.lv||2,kind:it.o.kind};
  });
}
/* one exam-level question for a tag, key at a random letter (the drill and anything else that needs a single item) */
function xItem(tag,avoid){
  const d=xDraw(tag,new Set(avoid||[])); if(!d) return null;
  const k=ri(0,XOPT-1), rest=shuf(d.o.opts.slice(1)); rest.splice(k,0,d.o.opts[0]);
  return {tag,id:d.g.id,src:d.g.src,stem:d.o.stem,opts:rest.map(o=>({h:o.h,why:o.why||'',ok:!!o.ok})),key:k,how:d.o.how||'',sol:d.o.sol||[],lv:d.o.lv||3,kind:d.o.kind};
}

function xSave(){ try{ if(XE&&!XE.done) localStorage.setItem(XKEY,JSON.stringify(XE)); else localStorage.removeItem(XKEY); }catch(e){} }
function xLoad(){ try{ const s=localStorage.getItem(XKEY); if(!s) return null; const o=JSON.parse(s);
  return o&&Array.isArray(o.items)&&o.items.length===XN&&!o.done?o:null; }catch(e){ return null; } }
function xDrop(){ try{ localStorage.removeItem(XKEY); }catch(e){} }

function xStart(real){
  const now=Date.now();
  XE={v:1,real:0,items:buildExam(),ans:Array(XN).fill(-1),flag:Array(XN).fill(false),spent:Array(XN).fill(0),cur:0,t0:now,deadline:now+XMIN*60000,last:now,done:false};
  xSave(); xOpen();
}
function xOpen(){
  show('exam'); window.scrollTo(0,0); XE.last=Date.now(); xarm=false; $('xsubmit').textContent='Submit exam';
  $('xkeys').textContent='Keys: A–F choose (again to clear) · ← → move · G flags';
  xPaint(); clearInterval(xtick); xtick=setInterval(xClock,250); xClock();
}
function xLog(){ const now=Date.now(); if(XE&&!XE.done){ XE.spent[XE.cur]+=(now-XE.last)/1000; XE.last=now; } }
function xClock(){
  if(!XE||XE.done||phase!=='exam') return;
  const left=(XE.deadline-Date.now())/1000;
  if(left<=0){ xFinish(true); return; }
  const t=$('xtime'), f=$('xfill'), low=left<=XMIN*60/XN;                    /* last question's worth of time */
  t.textContent=fmtClock(left); t.classList.toggle('low',low);
  f.style.width=Math.max(0,left/(XMIN*60)*100)+'%'; f.classList.toggle('low',low);
  const open=XE.ans.filter(a=>a<0).length;
  $('xpace').textContent=open?`${fmtClock(left/open)} per open question`:'all answered';
}
function xNav(){
  const nav=$('xnav'); nav.innerHTML='';
  XE.items.forEach((it,i)=>{
    const b=document.createElement('button'); b.type='button'; b.textContent=String(i+1);
    b.className=[XE.ans[i]>=0?'ans':'',XE.flag[i]?'flag':'',i===XE.cur?'cur':''].join(' ').trim();
    b.setAttribute('aria-label',`Question ${i+1}${XE.ans[i]>=0?', answered':''}${XE.flag[i]?', flagged':''}`);
    if(i===XE.cur) b.setAttribute('aria-current','true');
    b.onclick=()=>xGo(i); nav.appendChild(b);
  });
  $('xcount').textContent=`${XE.ans.filter(a=>a>=0).length} of ${XN} answered`;
}
function xPaint(){
  const it=XE.items[XE.cur], card=$('xcard');
  try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([card]); }catch(e){}
  $('xnum').textContent=`Question ${XE.cur+1} of ${XN}`;
  const st=$('xstem'); st.innerHTML=it.stem; st.classList.add('wait');
  const box=$('xopts'); box.innerHTML=''; box.classList.add('wait');
  it.opts.forEach((o,k)=>{
    const b=document.createElement('button'); b.type='button'; b.className='xopt'; b.setAttribute('role','radio');
    b.setAttribute('aria-checked',XE.ans[XE.cur]===k?'true':'false'); b.innerHTML=`<b>${LET[k]}</b><span>${o.h}</span>`;
    b.onclick=()=>xPick(k); box.appendChild(b);
  });
  $('xprev').disabled=XE.cur===0; $('xnext').disabled=XE.cur===XN-1;
  $('xflag').textContent=XE.flag[XE.cur]?'Unflag':'Flag';
  xNav();
  card.classList.remove('rise'); void card.offsetWidth; card.classList.add('rise');
  typeset(card,()=>{ st.classList.remove('wait'); box.classList.remove('wait'); });
}
function xPick(k){
  if(!XE||XE.done) return;
  XE.ans[XE.cur]=XE.ans[XE.cur]===k?-1:k; xSave();
  [...$('xopts').children].forEach((b,i)=>b.setAttribute('aria-checked',XE.ans[XE.cur]===i?'true':'false'));
  xNav(); xClock();
}
function xGo(i){
  if(!XE||XE.done||i<0||i>=XN||i===XE.cur) return;
  xLog(); XE.cur=i; xSave(); xPaint();
  const top=$('xnav').getBoundingClientRect().top; if(top<0) window.scrollBy(0,top-12);
}
function xFlag(){ if(!XE||XE.done) return; XE.flag[XE.cur]=!XE.flag[XE.cur]; xSave(); $('xflag').textContent=XE.flag[XE.cur]?'Unflag':'Flag'; xNav(); }
function xSubmitClick(){
  const open=XE.ans.filter(a=>a<0).length, b=$('xsubmit');
  if(!xarm){ xarm=true; b.textContent=open?`${open} unanswered · tap again to submit`:'Tap again to submit';
    clearTimeout(xarmT); xarmT=setTimeout(()=>{ xarm=false; b.textContent='Submit exam'; },4000); return; }
  clearTimeout(xarmT); xarm=false; b.textContent='Submit exam'; xFinish(false);
}
function xFinish(timeUp){
  if(!XE||XE.done) return;
  xLog(); clearInterval(xtick); xtick=null;
  XE.done=true; XE.timeUp=!!timeUp; XE.end=Math.min(Date.now(),XE.deadline);
  xDrop();
  const res=xGrade(XE); XLAST=res; xRecord(res); xResults(res);
}
function xGrade(E){
  const per=E.items.map((it,i)=>({i,tag:it.tag,ok:E.ans[i]===it.key,pick:E.ans[i],key:it.key,t:E.spent[i]}));
  const right=per.filter(p=>p.ok).length;
  return {E,per,right,score:right*XPTS+XFREE,used:Math.max(0,(E.end-E.t0)/1000)};
}
/* per-topic tallies for one graded exam: {tag:[right, n]} */
function xByTag(per){ const m={}; per.forEach(p=>{ const a=m[p.tag]||(m[p.tag]=[0,0]); a[1]++; if(p.ok) a[0]++; }); return m; }
/* an exam question as a session item (so the session page and the mistake log work as for sprints) */
function xAsResult(it,p){
  const o=it.opts;
  return {exam:1,id:it.id,cat:XTAGS[it.tag].name,sec:XTAGS[it.tag].sec,lv:it.lv,ok:p.ok,skipped:p.pick<0,spent:p.t,q:it.stem,kind:it.kind,ui:'mcq',ans:'',
    opts:o.map((x,k)=>({h:x.h,ok:k===it.key,why:x.why})),picked:p.pick,given:'',trap:p.pick>=0&&!p.ok?o[p.pick].why:'',how:it.how,sol:it.sol,fig:''};
}
function xRecord(res){
  const ts=res.E.t0;
  const rec={ts,real:res.E.real?1:0,score:res.score,right:res.right,used:Math.round(res.used),timeUp:res.E.timeUp?1:0,tags:res.per.map(p=>p.tag),res:res.per.map(p=>p.ok?1:(p.pick<0?-1:0)),
    g:res.per.map(p=>res.E.items[p.i].id),t:res.per.map(p=>Math.round(p.t))};
  res.rec=rec;
  const rs=res.per.map(p=>xAsResult(res.E.items[p.i],p));
  const run={ts,dur:XMIN*60,mode:'exam',real:res.E.real?1:0,att:XN,right:res.right,pts:res.score,time:Math.round(res.used),bonus:0};
  ensureStore().then(()=>{ store.exams=mergeRuns(store.exams||[],[rec]); persist(); saveSession(run,rs); });
  return rs;
}
const xState=p=>p.ok?'correct':p.pick<0?'unanswered':`you chose ${LET[p.pick]}`;
function xResults(res){
  const E=res.E, pct=Math.round(res.score/XTOTAL*100), blank=res.per.filter(p=>p.pick<0).length;
  show('xdone'); window.scrollTo(0,0);
  $('xhead').textContent=`${res.score} / ${XTOTAL}`;
  $('xRight').textContent=res.right; $('xPct').textContent=pct+'%'; $('xUsed').textContent=fmtClock(res.used);
  $('xUsedOf').textContent=`time used of ${fmtClock(XMIN*60)}`;
  const band=pct>=90?'Exam-ready on this material.':pct>=80?'Solid. Clean up the topics below and you are in A range.'
            :pct>=68?'Passing, with points to pick up. The topic table shows where.'
            :'Work through the review below: each miss names the trap behind it and walks through the method.';
  const pace=E.timeUp?`Time ran out${blank?` with ${blank} unanswered`:''}.`
            :`You used ${fmtClock(res.used)} of ${fmtClock(XMIN*60)}, about ${fmtClock(res.used/XN)} a question.`;
  $('xverdict').textContent=`${band} ${pace} Scored like the real exam: ${XPTS} points a question plus ${XFREE} for the scantron.`;
  /* by topic, weakest first */
  const bt=xByTag(res.per), tb=$('xtopics').querySelector('tbody'); tb.innerHTML='';
  Object.keys(bt).sort((a,b)=>(bt[a][0]/bt[a][1])-(bt[b][0]/bt[b][1])||bt[b][1]-bt[a][1]||XTAG_ORDER.indexOf(a)-XTAG_ORDER.indexOf(b)).forEach(t=>{
    const [r,n]=bt[t], tr=document.createElement('tr'), qs=res.per.filter(p=>p.tag===t).map(p=>p.i+1).join(', ');
    tr.innerHTML=`<td>${esc(XTAGS[t].name)}<span class="how">§${XTAGS[t].sec}</span></td><td class="hwcol">${qs}</td><td class="num ${r<n?'bad':'good'}">${r}/${n}</td>`;
    tb.appendChild(tr);
  });
  const qb=$('xtable').querySelector('tbody'); qb.innerHTML='';
  res.per.forEach(p=>{ const it=E.items[p.i], tr=document.createElement('tr');
    tr.innerHTML=`<td>${p.i+1}</td><td>${esc(XTAGS[it.tag].name)}</td><td>${p.pick<0?'–':LET[p.pick]}</td><td>${LET[p.key]}</td>`+
                 `<td class="num">${fmtClock(p.t)}</td><td class="num">${p.ok?XPTS:0}</td>`; qb.appendChild(tr); });
  /* review grouped by topic: topics with misses first, misses first inside a topic */
  const ol=$('xreview');
  try{ if(window.MathJax&&window.MathJax.typesetClear) window.MathJax.typesetClear([ol]); }catch(e){}
  ol.innerHTML='';
  const tags=Object.keys(bt).sort((a,b)=>(bt[a][0]/bt[a][1])-(bt[b][0]/bt[b][1])||XTAG_ORDER.indexOf(a)-XTAG_ORDER.indexOf(b));
  tags.forEach(t=>{
    const head=document.createElement('li'); head.className='xtopic'; head.innerHTML=`<b>${esc(XTAGS[t].name)}</b> <span>§${XTAGS[t].sec} · ${bt[t][0]} of ${bt[t][1]} right</span>`; ol.appendChild(head);
    const ps=res.per.filter(p=>p.tag===t); ps.sort((a,b)=>(a.ok-b.ok)||a.i-b.i);
    ps.forEach(p=>{
      const it=E.items[p.i], li=document.createElement('li'); li.className='xq'+(p.ok?' okq':'');
      let h=`<span class="meta">Question ${p.i+1} · ${xState(p)} · ${fmtClock(p.t)}</span><div>${it.stem}</div>`;
      it.opts.forEach((o,k)=>{ const isKey=k===p.key, bad=k===p.pick&&!isKey;
        h+=`<span class="opt${isKey?' key':''}${bad?' bad':''}"><i>${isKey?'✓':bad?'✗':' '}${LET[k]}</i>${o.h}</span>`; });
      if(!p.ok&&p.pick>=0&&it.opts[p.pick].why) h+=`<span class="whyno">Why ${LET[p.pick]} is tempting: ${it.opts[p.pick].why}</span>`;
      h+=solHTML(it); if(p.ok) h=h.replace('<details class="sol" open>','<details class="sol">');
      li.innerHTML=h; ol.appendChild(li);
    });
  });
  typeset(ol);
  xConceptMap(res);
  const xrs=res.per.map(p=>xAsResult(E.items[p.i],p));
  openSessionUI(E.t0,xrs,'xdone');
}

/* ---- this exam's questions on the diagnostic concept map (sprints never feed it) ---- */
function xConceptMap(res){
  const rec=res.rec||{ts:res.E.t0,timeUp:res.E.timeUp?1:0,tags:res.per.map(p=>p.tag),res:res.per.map(p=>p.ok?1:(p.pick<0?-1:0)),g:res.per.map(p=>res.E.items[p.i].id),t:res.per.map(p=>Math.round(p.t))};
  const paint=()=>{
    const ms=dMastery(null,rec), today=new Map();
    xObs(rec).forEach(o=>{ const cur=today.get(o.ci), rank=r=>r===0?0:r===-1?1:2;
      if(!cur||rank(o.res)<rank(cur.res)) today.set(o.ci,{res:o.res}); });
    dMap($('xmap'),ms,today);
    const hit=[...today.keys()], weak=hit.filter(ci=>ms[ci].status!=='solid').sort((a,b)=>ms[a].est-ms[b].est);
    const nd=(store.diags||[]).length;
    $('xready').textContent=`This exam checked ${hit.length} of the ${DCON.length} concepts (marked ✓ ✗ – on the map). Together with ${nd?`your ${nd} diagnostic${nd>1?'s':''}`:'any diagnostics you take'} and earlier mock exams, estimated Exam 2 readiness is ${dReadiness(ms)}/100.`;
    $('xmapacts').hidden=!weak.length;
    $('xmapdiag').textContent=`Retest the ${Math.min(weak.length,6)} weakest concept${weak.length>1?'s':''} from this exam (diagnostic, exam-level questions)`;
    $('xmapdiag').onclick=()=>dStart(Math.min(weak.length,6),weak.slice(0,6),'retest');
  };
  paint(); ensureStore().then(paint);
}

/* ---- the mock-exam part of the progress page ---- */
function xTagFold(ex){
  const m={}; XTAG_ORDER.forEach(t=>m[t]={seen:0,right:0,last:null});
  ex.forEach(e=>(e.tags||[]).forEach((t,i)=>{ const b=m[t]; if(!b) return; b.seen++; if(e.res[i]===1) b.right++; b.last=e.res[i]===1; }));
  return m;
}
let xDrillCats=[];
function renderXProg(){
  const ex=store.exams||[], box=$('xprog'); box.hidden=!ex.length; if(!ex.length) return;
  const best=Math.max(...ex.map(e=>e.score)), last=ex[ex.length-1], avg=Math.round(ex.reduce((s,e)=>s+e.score,0)/ex.length);
  $('xprogline').textContent=`${ex.length} exam${ex.length>1?'s':''} taken. Latest ${last.score}/${XTOTAL}, best ${best}/${XTOTAL}${ex.length>1?`, average ${avg}`:''}.`;
  const many=ex.length>1; $('xchart').hidden=!many; $('xchartleg').hidden=!many;
  $('xchart').innerHTML=many?lineChart(ex.map(e=>e.score),{top:XTOTAL,ticks:[0,25,50,75,100],fmt:v=>String(v),
    aria:'Mock exam score by attempt, oldest on the left',tip:(v,i)=>`${whenStr(ex[i].ts)}: ${v}/${XTOTAL}`}):'';
  const m=xTagFold(ex), rows=XTAG_ORDER.filter(t=>m[t].seen).map(t=>({t,...m[t],miss:m[t].seen-m[t].right,rate:(m[t].seen-m[t].right+0.5)/(m[t].seen+1)}))
    .sort((a,b)=>b.rate-a.rate||b.miss-a.miss||XTAG_ORDER.indexOf(a.t)-XTAG_ORDER.indexOf(b.t));
  const tb=$('xtags').querySelector('tbody'); tb.innerHTML='';
  rows.forEach(r=>{ const tr=document.createElement('tr'), pc=Math.round(r.right/r.seen*100);
    tr.innerHTML=`<td>${esc(XTAGS[r.t].name)}<span class="how">§${XTAGS[r.t].sec}${r.last===false?' · missed last time':''}</span></td>`+
      `<td class="num">${r.right}/${r.seen}</td><td class="xbarcell"><span class="xb"><i style="width:${pc}%"></i></span><span class="num">${pc}%</span></td>`;
    tb.appendChild(tr); });
  const weak=rows.filter(r=>r.miss>0).slice(0,3);
  xDrillCats=[...new Set([].concat(...weak.map(r=>XTAGS[r.t].drill)))].filter(c=>TOPICS.includes(c));
  $('xdrillrow').hidden=!xDrillCats.length;
  $('xdrill').textContent=weak.length?`Drill ${weak.map(r=>XTAGS[r.t].name.split(/[:(&]/)[0].trim().toLowerCase()).join(', ')}`:'';
  const hb=$('xhist').querySelector('tbody'); hb.innerHTML='';
  ex.slice().reverse().forEach(e=>{ const tr=document.createElement('tr');
    tr.innerHTML=`<td>${whenStr(e.ts)}</td><td class="num">${e.right}/${XN}</td><td class="num">${e.score}</td>`+
                 `<td class="num">${fmtClock(e.used)}${e.timeUp?' (time up)':''}</td><td class="num"><button class="link dl" data-open="${e.ts}">Open</button></td>`; hb.appendChild(tr); });
  hb.querySelectorAll('button[data-open]').forEach(b=>b.onclick=()=>openSessionPage(+b.dataset.open));
}

/* ---- resume an exam left open, or grade one whose time ran out while closed ---- */
function xBoot(){
  const s=xLoad(), el=$('xresume');
  if(!s){ el.hidden=true; return; }
  const left=(s.deadline-Date.now())/1000;
  el.hidden=false;
  el.innerHTML=(left>0?`Mock exam in progress, ${fmtClock(left)} left. `:`Your mock exam ran out of time while the page was closed. `)+
    `<button class="link" id="xres">${left>0?'Resume':'See results'}</button> <button class="link" id="xdis">Discard</button>`;
  $('xres').onclick=()=>{ el.hidden=true; XE=s; XE.last=Date.now(); if((XE.deadline-Date.now())>0) xOpen(); else xFinish(true); };
  $('xdis').onclick=()=>{ xDrop(); el.hidden=true; };
}

/* ---- wiring ---- */
/* one intro screen for both exams: XINTRO_REAL says which one Begin starts */
let XINTRO_REAL=false;
function openXIntro(real){
  XINTRO_REAL=!!real;
  $('xititle').textContent='Mock Exam 2';
  $('xiopts').textContent='A–F';
  $('xisub').textContent='New questions every time, weighted like past Exam 2s (triple integrals most). No calculator; answers are exact.';
  show('xintro'); window.scrollTo(0,0);
}
$('xbegin').onclick=()=>{
  const go=()=>{ $('xresume').hidden=true; xDrop(); xStart(XINTRO_REAL); };
  const b=$('xbegin');
  if(xLoad()&&!b.dataset.armed){ b.dataset.armed='1'; b.textContent='Tap again: this discards the exam in progress'; setTimeout(()=>{ b.dataset.armed=''; b.textContent='Begin ▸'; },4000); return; }
  b.dataset.armed=''; b.textContent='Begin ▸'; go();
};
$('xback').onclick=()=>{ show('start'); window.scrollTo(0,0); xBoot(); };
$('xprev').onclick=()=>XE&&xGo(XE.cur-1);
$('xnext').onclick=()=>XE&&xGo(XE.cur+1);
$('xflag').onclick=xFlag;
$('xsubmit').onclick=xSubmitClick;
$('xagain').onclick=()=>openXIntro(XE&&XE.real);
$('xhome').onclick=()=>{ show('start'); window.scrollTo(0,0); paintBest('bestline'); };
$('toProg3').onclick=openProg;
$('xdrill').onclick=()=>{ if(!xDrillCats.length) return; active=new Set(xDrillCats); syncChips(); startGame(); };
document.addEventListener('keydown',e=>{
  if(phase!=='exam'||!XE||XE.done||e.metaKey||e.ctrlKey||e.altKey) return;
  if(e.target&&e.target.tagName==='INPUT') return;
  const k=e.key.length===1?e.key.toUpperCase():'';
  const it=XE.items[XE.cur], ki=k?LET.indexOf(k):-1;
  if(ki>=0&&ki<it.opts.length){ e.preventDefault(); xPick(ki); }
  else if(e.key==='ArrowRight'){ e.preventDefault(); xGo(XE.cur+1); }
  else if(e.key==='ArrowLeft'){ e.preventDefault(); xGo(XE.cur-1); }
  else if(k==='G'){ e.preventDefault(); xFlag(); }
});
