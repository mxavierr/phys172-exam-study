/* ==== 51 · progress page (sprint + mock-exam history) ====================
   Sprint history folded into per-problem-type cost, the exam projection,
   trend charts, and the mock-exam score history. The exam-skills section at
   the top of the same page is drawn by 71_skills_ui.js.
   ======================================================================== */
const GENBY={}; GEN.forEach(g=>{GENBY[g.id]=g;});
let sprintWeakCats=[];      /* topics behind the "Sprint on these concepts" button */

/* ---- one compact record per finished run; the run list is the whole history ---- */
function buildRun(){
  const n=results.length; if(!n) return null;
  const t={};
  results.forEach(r=>{
    const a=t[r.id]||(t[r.id]=[0,0,0,0,0]);
    a[0]++; if(r.ok)a[1]++; if(isSlow(r))a[2]++; if(r.skipped)a[3]++;
    a[4]=Math.round((a[4]+r.spent)*10)/10;
  });
  return {ts:Date.now(),dur,bonus:bonusOn?1:0,scope:scope(),att:n,
    right:results.filter(r=>r.ok).length,slow:results.filter(isSlow).length,
    skip:results.filter(r=>r.skipped).length,pts:scoreOf(results),
    time:Math.round(results.reduce((s,r)=>s+r.spent,0)),t};
}

/* ---- fold the run list back into per-problem-type totals ---- */
function fold(){
  const m={};
  store.runs.forEach(r=>{
    const t=r.t||{};
    Object.keys(t).forEach(id=>{
      const a=t[id],b=m[id]||(m[id]={seen:0,right:0,slow:0,skip:0,time:0,last:0});
      b.seen+=a[0]||0; b.right+=a[1]||0; b.slow+=a[2]||0; b.skip+=a[3]||0; b.time+=a[4]||0;
      if((r.ts||0)>b.last) b.last=r.ts||0;
    });
  });
  return m;
}
function typeRow(id,b){
  const g=GENBY[id]||{}, wrong=b.seen-b.right, cost=wrong+0.5*b.slow;
  return {id,...b,wrong,cost,rate:cost/(b.seen+2),cat:g.cat||'Retired problem',hw:g.hw||0};
}
function weakList(m){
  return Object.keys(m).map(id=>typeRow(id,m[id])).filter(r=>r.cost>0)
    .sort((a,b)=>b.rate-a.rate||b.cost-a.cost||b.seen-a.seen);
}
const IDEA={};
function keyIdea(id){                        /* the generator's own one-line key idea */
  if(IDEA[id]!==undefined) return IDEA[id];
  const g=GENBY[id]; const c={}; let best='';
  if(g) for(let i=0;i<6;i++){ try{ const h=g.fn().how||''; if(h) c[h]=(c[h]||0)+1; }catch(e){} }
  Object.keys(c).forEach(h=>{ if(c[h]>(c[best]||0)) best=h; });
  return IDEA[id]=best;
}

/* ---- the progress screen ---- */
function renderProg(){
  const runs=store.runs, has=runs.length>0;
  $('progempty').hidden=has||(store.exams||[]).length>0||(store.drills||[]).length>0; $('proghas').hidden=!has;
  renderSkills(); renderXProg();
  paintStoreNote();
  if(!has) return;

  const att=runs.reduce((s,r)=>s+(r.att||0),0), right=runs.reduce((s,r)=>s+(r.right||0),0),
        time=runs.reduce((s,r)=>s+(r.time||0),0);
  $('pRuns').textContent=runs.length;
  $('pQs').textContent=att;
  $('pAcc').textContent=att?Math.round(right/att*100)+'%':'0%';
  $('pPace').textContent=att?fmtClock(time/att):'–';

  const tpq=att?time/att:0, acc=att?right/att:0;
  const nq=XSLOTS.length, reach=tpq>0?Math.max(1,Math.min(nq,Math.floor(XMIN*60/tpq))):0;
  const solved=Math.round(acc*reach);
  $('projpanel').innerHTML=`<span class="eyebrow">At this pace, a ${XMIN}-min exam</span>`+
    `<div class="proj"><div><span class="num">${reach}<small>/${nq}</small></span><span class="eyebrow">reached</span></div>`+
    `<div><span class="num">${solved}</span><span class="eyebrow">right</span></div></div>`;

  const m=fold(), box=$('weak');
  /* one row per topic: generators of the same topic are summed, then ranked by cost per attempt */
  const byCat={};
  weakList(m).forEach(r=>{ const a=byCat[r.cat]||(byCat[r.cat]={...r,hws:new Set()}); if(a!==r){ a.seen+=r.seen; a.wrong+=r.wrong; a.slow+=r.slow; a.cost+=r.cost; } a.hws.add(r.hw); });
  const top=Object.values(byCat).map(r=>({...r,rate:r.cost/(r.seen+2),hw:r.hws.size===1?[...r.hws][0]:0}))
    .sort((a,b)=>b.rate-a.rate||b.cost-a.cost).slice(0,5);
  box.innerHTML='';
  if(!top.length){
    box.innerHTML='<p class="empty">✓ None</p>';
    $('sprintWeakRow').hidden=true; sprintWeakCats=[];
  }else{
    const max=top[0].rate;
    top.forEach(r=>{
      const bits=[]; if(r.wrong) bits.push(`${r.wrong} missed`); if(r.slow) bits.push(`${r.slow} slow`);
      const d=document.createElement('div'); d.className='weakrow srow';
      d.title=keyIdea(r.id)||'';                                      /* key idea on hover; full list under "Every problem type" */
      d.innerHTML=`<b>${esc(r.cat)} <span class="hw">${r.hw?hwLabel(r.hw):''}</span></b><span></span>`+
        `<div class="bar"><i style="width:${Math.max(6,Math.round(r.rate/max*100))}%"></i></div>`+
        `<em>${bits.join(' · ')} / ${r.seen}</em>`;
      box.appendChild(d);
    });
    sprintWeakCats=[...new Set(top.map(r=>r.cat))].filter(c=>TOPICS.indexOf(c)>=0);
    $('sprintWeakRow').hidden=!sprintWeakCats.length;
    $('sprintWeak').textContent='Sprint these ▸';
  }

  const accv=runs.map(r=>r.att?r.right/r.att*100:0);
  $('accchart').innerHTML=lineChart(accv,{top:100,ticks:[0,25,50,75,100],fmt:v=>v+'%',
    aria:'Share of questions answered correctly, run by run, oldest on the left',
    tip:(v,i)=>`${whenStr(runs[i].ts)}: ${Math.round(v)}% of ${runs[i].att}`});
  const tv=runs.map(r=>r.att?r.time/r.att:0);
  const topT=Math.max(300,Math.ceil(Math.max.apply(null,tv.concat([TARGET]))/60)*60);
  const tk=[]; for(let s=0;s<=topT;s+=60) tk.push(s);
  $('timechart').innerHTML=lineChart(tv,{top:topT,ticks:tk,fmt:fmtClock,target:TARGET,
    aria:'Average time per question, run by run, against the four minute target',
    tip:(v,i)=>`${whenStr(runs[i].ts)}: ${fmtClock(v)} a question`});

  const rb=$('runs').querySelector('tbody'); rb.innerHTML='';
  runs.slice().reverse().forEach(r=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${whenStr(r.ts)}</td><td class="num">${r.att||0}</td>`+
      `<td class="num">${r.right||0}</td><td class="num">${r.slow||0}</td>`+
      `<td class="num">${r.att?fmtClock(r.time/r.att):'–'}</td><td class="num">${r.pts||0}</td>`;
    rb.appendChild(tr);
  });

  const ab=$('alltypes').querySelector('tbody'); ab.innerHTML='';
  Object.keys(m).map(id=>typeRow(id,m[id]))
    .sort((a,b)=>a.cat.localeCompare(b.cat)||a.hw-b.hw||b.seen-a.seen)
    .forEach(r=>{
      const idea=keyIdea(r.id), tr=document.createElement('tr');
      tr.innerHTML=`<td>${esc(r.cat)}${idea?`<span class="how">${mathText(idea)}</span>`:''}</td>`+
        `<td class="hwcol">${r.hw?hwLabel(r.hw):'–'}</td><td class="num">${r.seen}</td>`+
        `<td class="num">${r.right}</td><td class="num">${r.slow}</td>`+
        `<td class="num">${r.seen?fmtClock(r.time/r.seen):'–'}</td>`;
      ab.appendChild(tr);
    });
  typeset(ab);
}
/* where progress is kept; msg replaces the label briefly (import result) */
function paintStoreNote(msg){
  const ok=lsOK||cookieOK, el=$('storenote');
  el.innerHTML=`<svg class="ico sm"><use href="#i-device"/></svg>${esc(msg||(ok?'Saved in this browser':'Not saved: this browser blocks storage'))}`;
  el.classList.toggle('off',!ok&&!msg);
  el.title=ok?'Cookies + local storage on this device. Export to move it elsewhere.':'Allow cookies / site data for this page to keep progress.';
}
function openProg(){
  show('prog'); renderProg();
  ensureStore().then(()=>{ if(phase==='prog') renderProg(); });
}
function saveRun(){
  const run=buildRun(); if(!run) return;
  saveRecords('runs',[run]);
}

/* ---- the mock-exam part of the progress page ---- */
function renderXProg(){
  const ex=store.exams||[], box=$('xprog'); box.hidden=!ex.length; if(!ex.length) return;
  const best=Math.max(...ex.map(e=>e.score)), last=ex[ex.length-1];
  $('xprogline').textContent=`Latest ${last.score}/${XTOT} · Best ${best}/${XTOT}`;
  const many=ex.length>1; $('xchart').hidden=!many; $('xchartleg').hidden=!many;
  $('xchart').innerHTML=many?lineChart(ex.map(e=>e.score),{top:XTOT,ticks:[0,.25,.5,.75,1].map(f=>Math.round(f*XTOT)),fmt:v=>String(v),
    aria:'Mock exam score by attempt, oldest on the left',tip:(v,i)=>`${whenStr(ex[i].ts)}: ${v}/${XTOT}`}):'';
  const hb=$('xhist').querySelector('tbody'); hb.innerHTML='';
  ex.slice().reverse().forEach(e=>{ const tr=document.createElement('tr');
    tr.innerHTML=`<td>${whenStr(e.ts)}</td><td class="num">${e.right}</td><td class="num">${e.score}</td>`+
                 `<td class="num">${fmtClock(e.used)}${e.timeUp?' (time up)':''}</td>`; hb.appendChild(tr); });
}
