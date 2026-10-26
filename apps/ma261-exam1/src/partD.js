
/* =====================================================================
   DIAGNOSTIC: adaptive concept check. Picks concepts by exam weight, how
   weak / uncertain / stale they are; asks one idea or one-step skill
   question per concept; records answer, "don't know", confidence, time vs
   an estimate, answer changes; builds a mastery map across every run.
   ===================================================================== */
const DKEY='ma261-sprint:diag', DLEN={quick:4,std:6,full:8};          /* exam-level questions: ≈ 5:00 each */
const DEXP={idea:{1:45,2:75,3:120},skill:{1:90,2:150,3:240}};          /* seconds a prepared student should need */
const CONF=['','Guessing','Fairly sure','Certain'];
let DG=null, dtick=null, dLen='std', DLAST=null;

/* ---- scoring one response: 0 … 1 (conf 4 = a mock-exam question: no confidence asked) ---- */
function dQual(r,exp){
  if(r.res!==1) return 0;
  let q=r.conf===4?.9:r.conf===1?.35:r.conf===2?.8:1;
  if(r.t>2*exp) q*=.85;
  return q;
}
/* ---- mock-exam questions feed the same map: template id → concept (tag as fallback for old records) ---- */
const XCON_ID={'f26-q8':'cross','x-vec-proj':'proj','x-vec-area':'cross','x-vec-tf':'cross','x-vec-perpx':'dot','x-vec-cosang':'dot',
  'x-vf-intnorm':'vint','x-vf-dotderiv':'tan','x-vf-angle':'vel','x-dd-dir':'grad','x-dd-max':'steep','x-dd-steep':'steep','x-tp-approx':'lin'};
const XCON_PRE={quad:'quad',line:'line',plane:'plane',tan:'tan',vf:'vf',mot:'mot',arc:'arc',curv:'curv',lvl:'lvl',lim:'lim',pd:'pd',chain:'chain',impl:'impl',tp:'tp',crit:'crit',abs:'abs',dd:'grad',vec:'dot'};
const XCON_TAG={QUAD:'quad',LINE:'line',PLANE:'plane',VEC:'dot',VF:'vf',TAN:'tan',MOT:'mot',ARC:'arc',CURV:'curv',LVL:'lvl',LIM:'lim',PD:'pd',CHAIN:'chain',IMPL:'impl',DD:'grad',TP:'tp',CRIT:'crit',ABS:'abs'};
const XEXP=XMIN*60/XN;                                                  /* exam time per question (60 min / 12 = 5:00) */
function xConcept(id,tag){
  let c=id&&XCON_ID[id];
  if(!c&&id){ const m=/^x-([a-z]+)/.exec(id); c=m&&XCON_PRE[m[1]]; }
  if(!c) c=XCON_TAG[tag];
  const i=DCON.findIndex(d=>d.id===c); return i;
}
/* one exam record → observations [{ci,res,t}]; questions left blank because time ran out are not evidence */
function xObs(e){
  const out=[]; (e.res||[]).forEach((r,k)=>{ if(r===-1&&e.timeUp) return;
    const ci=xConcept(e.g&&e.g[k],e.tags&&e.tags[k]); if(ci<0) return;
    out.push({ci,res:r,t:e.t&&e.t[k]!=null?e.t[k]:XEXP}); }); return out;
}
/* ---- mastery from every saved diagnostic and mock exam (+ unsaved ones): recency-weighted, shrunk toward 0.5.
        Sprints (homework-style practice) never feed it. ---- */
function dMastery(extra,extraExam){
  const list=(store.diags||[]).concat(extra&&!(store.diags||[]).some(d=>d.ts===extra.ts)?[extra]:[]), per=DCON.map(()=>[]);
  list.forEach(d=>(d.it||[]).forEach(x=>{ const [ci,res,t,conf,lv,src]=x; if(per[ci]) per[ci].push({ts:d.ts,res,t,conf,lv,src,exp:src===2?XEXP:DEXP[src?'skill':'idea'][lv]||90}); }));
  const ex=(store.exams||[]).concat(extraExam&&!(store.exams||[]).some(e=>e.ts===extraExam.ts)?[extraExam]:[]);
  ex.forEach(e=>xObs(e).forEach(o=>per[o.ci].push({ts:e.ts,res:o.res,t:o.t,conf:4,lv:3,src:2,exam:1,exp:XEXP})));
  return per.map((obs,ci)=>{
    obs.sort((a,b)=>a.ts-b.ts);
    let num=.5*.6, den=.6, neff=0; const n=obs.length;
    obs.forEach((o,k)=>{ const w=Math.pow(.7,n-1-k); num+=w*dQual(o,o.exp); den+=w; neff+=w; });
    const adj=n?aiAdjust(ci,obs):0, est=Math.max(.02,Math.min(.98,num/den+adj)), last=n?obs[n-1]:null;
    const status=!n?'untested':est>=.8?'solid':est>=.55?'shaky':'weak';
    const nx=obs.filter(o=>o.exam).length;
    return {ci,est,adj,neff,n,nx,nd:n-nx,last,status,lastTs:last?last.ts:0,
      idk:obs.filter(o=>o.res===-1).length,wrong:obs.filter(o=>o.res===0).length,slow:obs.filter(o=>o.res===1&&o.t>1.5*o.exp).length,
      ratio:n?obs.reduce((s,o)=>s+o.t/o.exp,0)/n:0};
  });
}
const checksStr=m=>`${m.n} check${m.n===1?'':'s'}${m.nx?` (${m.nx} from mock exams)`:''}`;
const STATUS={solid:'Solid',shaky:'Shaky',weak:'Needs work',untested:'Not tested yet'};
function dReadiness(ms){ const W=DCON.reduce((s,c)=>s+c.w,0); return Math.round(100*ms.reduce((s,m,i)=>s+DCON[i].w*(m.n?m.est:.3),0)/W); }

/* ---- choose the concepts: once there is history, most of the run goes to the concepts you have struggled on ---- */
/* ranked focus list: checked, not solid; weakest first, weighted by how likely the concept is on Exam 1; a miss last time pushes it up */
function dFocus(ms){
  return ms.map((m,i)=>({i,m})).filter(o=>o.m.n&&o.m.status!=='solid')
    .map(o=>({i:o.i,s:Math.pow(1-o.m.est,2)*(0.5+DCON[o.i].w)*(o.m.last.res!==1?1.25:1)})).sort((a,b)=>b.s-a.s);
}
function dDraw(cands,wt){ const tot=cands.reduce((s,i)=>s+wt(i),0); let x=Math.random()*tot; for(const i of cands){ x-=wt(i); if(x<=0) return i; } return cands[cands.length-1]; }
function dPickConcepts(n,only,pre){
  if(only&&only.length){ const o=shuf(only.slice()); while(o.length<n) o.push(o[o.length%only.length]); return o; }
  if(n<=0) return [];
  const ms=dMastery(), now=Date.now(), P=(pre||[]).length, out=(pre||[]).slice();
  const done=()=>out.slice(P);
  const days=i=>ms[i].n?(now-ms[i].lastTs)/864e5:9;
  const take=(cands,wt,k)=>{ for(let j=0;j<k;j++){ const c=cands.filter(i=>!out.includes(i)); if(!c.length) return; out.push(dDraw(c,wt)); } };
  if(!ms.some(m=>m.n)){                                   /* first run: the most exam-likely concepts, chapters ≈ 1 : 1 : 2 like the exam */
    const wt=i=>dExamTemplates(i).length?Math.pow(DCON[i].w,2):0;      /* only concepts the exam asks about directly */
    const q13=Math.max(1,Math.round(n/4)), q14=Math.max(1,Math.round(n/4));
    take(DCON.map((_,i)=>i).filter(i=>DCON[i].ch===13),wt,q13);
    take(DCON.map((_,i)=>i).filter(i=>DCON[i].ch===14),wt,q14);
    take(DCON.map((_,i)=>i).filter(i=>DCON[i].ch===15),wt,n-(out.length-P));
    return done();
  }
  const focus=dFocus(ms), fs={}; focus.forEach(o=>fs[o.i]=o.s);
  const untested=DCON.map((_,i)=>i).filter(i=>!ms[i].n), solid=DCON.map((_,i)=>i).filter(i=>ms[i].status==='solid');
  const nKeep=n>=6&&solid.length?1:0;                                         /* one check that a solid concept stays solid */
  const nNew=untested.length?Math.max(1,Math.round(n*0.2)):0;                 /* keep filling the map */
  const nFocus=Math.max(0,n-nKeep-nNew);
  const nTop=Math.ceil(nFocus/2);                                              /* the weakest are always in the run */
  focus.slice(0,nTop).forEach(o=>{ if(!out.includes(o.i)) out.push(o.i); });
  take(focus.slice(nTop).map(o=>o.i),i=>fs[i],nFocus-(out.length-P));
  /* few weak concepts: the weakest get a second exam-level question (different template) */
  for(let k=0;out.length-P<nFocus&&k<focus.length;k++){ if(out.filter(i=>i===focus[k].i).length<2) out.push(focus[k].i); }
  take(untested,i=>Math.pow(DCON[i].w,2),nNew);
  take(solid,i=>(0.2+DCON[i].w)*(1+Math.min(3,days(i)/2))*(1.05-ms[i].est),nKeep);
  const wt=i=>(0.15+DCON[i].w)*Math.pow(0.1+(1-ms[i].est),2)*(1+Math.min(1,days(i)/3));
  take(DCON.map((_,i)=>i),wt,n-(out.length-P));
  return done();
}
function dRecent(){ const r={}; (store.diags||[]).slice(-4).forEach(d=>(d.it||[]).forEach((x,k)=>{ const g=d.g&&d.g[k]; if(g) (r[x[0]]=r[x[0]]||new Set()).add(g); })); return r; }
/* exam templates per concept (same mapping that feeds mock-exam results into the map) */
let DXG=null;
function dExamTemplates(ci){ if(!DXG){ DXG=DCON.map(()=>[]); XGEN.forEach(g=>{ const i=xConcept(g.id,g.tag); if(i>=0) DXG[i].push(g); }); } return DXG[ci]; }
/* one question at mock-exam difficulty: an exam template for the concept (5 choices, archive-style distractors);
   concepts the exam never tests on their own (parametric curves, vector basics, spheres) use the hardest homework type */
function dMakeItem(ci,recent,used,tmpl){
  const c=DCON[ci], seen=recent[ci]||new Set(), ex=dExamTemplates(ci), pin=tmpl&&!used.has('x:'+tmpl)?ex.find(g=>g.id===tmpl):null;
  if(ex.length){
    const notUsed=ex.filter(g=>!used.has('x:'+g.id)), fresh=notUsed.filter(g=>!seen.has('x:'+g.id));
    for(let round=0;round<3;round++){
      const pool=round===0&&fresh.length?fresh:notUsed.length&&round<2?notUsed:ex;
      const G=pin&&round<2?pin:pool[dDraw(pool.map((_,k)=>k),k=>pool[k].w)];
      for(let i=0;i<40;i++){
        let o=null; try{ o=G.fn(); }catch(e){ o=null; }
        if(!o||!o.opts||o.opts.length!==5) continue;
        const key=ri(0,4), rest=shuf(o.opts.slice(1)); rest.splice(key,0,o.opts[0]);
        used.add('x:'+G.id);
        return {ci,src:'exam',g:'x:'+G.id,q:o.stem,fig:'',opts:rest.map(x=>({h:x.h,why:x.why||'',ok:!!x.ok})),key,lv:3,how:o.how||'',sol:o.sol||[],kind:o.kind,exp:XEXP,arch:G.src||''};
      }
    }
  }
  const skills=c.sk.map(id=>GEN.find(g=>g.id===id)).filter(Boolean);
  for(let round=0;round<2;round++){
    for(const g of shuf(skills)){
      for(let i=0;i<30;i++){
        let o=null; try{ o=g.fn(); }catch(e){ o=null; }
        if(!o||(round===0&&(o.lv||1)<2)) continue;
        const opts=mcqFrom(o); if(!opts) continue;
        const lv=Math.min(o.lv||1,3); used.add('s:'+g.id);
        return {ci,src:'skill',g:'s:'+g.id,q:o.q,fig:o.fig||'',opts,key:opts.findIndex(x=>x.ok),lv,how:o.how||'',sol:o.sol||[],kind:o.kind,exp:DEXP.skill[lv]};
      }
    }
  }
  const ideas=DIDEA[c.id]||[];
  for(const fn of shuf(ideas)){ for(let i=0;i<20;i++){ let o=null; try{ o=fn(); }catch(e){ o=null; } if(!o) continue;
    const opts=mcqFrom(o); if(!opts) continue; return {ci,src:'idea',g:'i:'+c.id,q:o.q,fig:o.fig||'',opts,key:opts.findIndex(x=>x.ok),lv:2,how:o.how||'',sol:o.sol||[],kind:o.kind,exp:DEXP.idea[2]}; } }
  return null;
}
/* up to half of every run is pinned by the mistake-pattern queue (specific templates); the focus picker fills the rest */
function buildDiag(n,only){
  const recent=dRecent(), used=new Set(), items=[];
  if(!(only&&only.length)){
    const q=pQueue(), cap=Math.ceil(n/2), perC={};
    for(const c of q){ if(items.length>=cap) break; if((perC[c.ci]||0)>=2) continue;
      const it=dMakeItem(c.ci,recent,used,c.tmpl); if(!it) continue; it.pin=c.why; it.pinSrc=c.src; perC[c.ci]=(perC[c.ci]||0)+1; items.push(it); }
  }
  const order=dPickConcepts(n-items.length,only,items.map(i=>i.ci));
  for(const ci of order){ const it=dMakeItem(ci,recent,used); if(it) items.push(it); }
  items.sort((a,b)=>DCON[a.ci].ch-DCON[b.ci].ch||a.ci-b.ci);   /* walk through the material in book order */
  return items;
}

/* ---- run ---- */
function dSave(){ try{ if(DG&&!DG.done) localStorage.setItem(DKEY,JSON.stringify(DG)); else localStorage.removeItem(DKEY); }catch(e){} }
function dLoad(){ try{ const s=localStorage.getItem(DKEY); if(!s) return null; const o=JSON.parse(s); return o&&Array.isArray(o.items)&&!o.done?o:null; }catch(e){ return null; } }
function dDrop(){ try{ localStorage.removeItem(DKEY); }catch(e){} }
function dStart(n,only,label){
  const items=buildDiag(n,only);
  DG={v:1,ts:Date.now(),mode:label||(n<=DLEN.quick?'quick':n<=DLEN.std?'std':'full'),items,res:items.map(()=>null),i:0,t0:Date.now(),shown:Date.now(),pick:-1,chg:0,first:-1,done:false,only:only||null};
  dSave(); dOpen();
}
function dOpen(){ show('dg'); window.scrollTo(0,0); DG.shown=Date.now()-(DG.spentCur||0)*1000; dPaint(); clearInterval(dtick); dtick=setInterval(dClock,500); dClock(); }
function dClock(){
  if(!DG||DG.done||phase!=='dg') return;
  const it=DG.items[DG.i]; if(!it) return;
  const t=(Date.now()-DG.shown)/1000, el=$('dgqt');
  el.textContent=fmtClock(t); el.classList.toggle('over',t>it.exp*1.5);
  $('dgall').textContent=fmtClock((Date.now()-DG.t0)/1000);
  DG.spentCur=t;
}
function dPaint(){
  const it=DG.items[DG.i], card=$('dgcard');
  try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([card]); }catch(e){}
  $('dgnum').textContent=`Question ${DG.i+1} of ${DG.items.length}`;
  $('dgfill').style.width=(DG.i/DG.items.length*100)+'%';
  $('dgaim').textContent=`aim ≈ ${fmtClock(it.exp)}`;
  const st=$('dgstem'); st.innerHTML=it.q+(it.fig?`<div class="qfig">${it.fig}</div>`:''); st.classList.add('wait');
  const box=$('dgopts'); box.classList.add('wait');
  box.innerHTML=it.opts.map((o,k)=>`<button class="xopt" role="radio" aria-checked="${DG.pick===k}" data-k="${k}"><b>${LET[k]}</b><span>${o.h}</span></button>`).join('');
  box.querySelectorAll('.xopt').forEach(b=>b.onclick=()=>dPick(+b.dataset.k));
  $('dgconf').hidden=DG.pick<0;
  const c=$('dgcard'); c.classList.remove('rise'); void c.offsetWidth; c.classList.add('rise');
  typeset(card,()=>{ st.classList.remove('wait'); box.classList.remove('wait'); });
}
function dPick(k){
  if(!DG||DG.done) return;
  if(DG.pick!==k){ if(DG.first<0) DG.first=k; else DG.chg++; }
  DG.pick=k; dSave();
  [...$('dgopts').children].forEach((b,i)=>b.setAttribute('aria-checked',i===k?'true':'false'));
  $('dgconf').hidden=false;
}
function dAnswer(conf,idk){
  if(!DG||DG.done) return;
  if(!idk&&DG.pick<0) return;
  const it=DG.items[DG.i], t=Math.max(1,Math.round((Date.now()-DG.shown)/1000));
  DG.res[DG.i]={pick:idk?-1:DG.pick,res:idk?-1:(DG.pick===it.key?1:0),conf:idk?0:conf,t,chg:DG.chg,first:idk?-1:DG.first};
  DG.pick=-1; DG.first=-1; DG.chg=0; DG.spentCur=0;
  if(DG.i+1>=DG.items.length){ dFinish(); return; }
  DG.i++; DG.shown=Date.now(); dSave(); dPaint(); window.scrollTo(0,0);
}
function dFinish(){
  if(!DG||DG.done) return;
  clearInterval(dtick); dtick=null; DG.done=true; DG.end=Date.now(); dDrop();
  const idx=DG.res.map((r,i)=>r?i:-1).filter(i=>i>=0);
  if(!idx.length){ show('start'); dBoot(); return; }
  const rec=dRecord(DG,idx); DLAST={DG,idx,rec}; dResults(DG,idx,rec);
}
/* compact record: it = [concept, res(1/0/-1), sec, conf, lv, src(0 idea / 1 skill / 2 exam-level), changes, firstWasRight] */
function dRecord(D,idx){
  const it=idx.map(i=>{ const x=D.items[i], r=D.res[i]; return [x.ci,r.res,r.t,r.conf,x.lv,x.src==='exam'?2:x.src==='skill'?1:0,r.chg,r.first===x.key&&r.res!==1?1:0]; });
  const q=idx.map(i=>dQual(D.res[i],D.items[i].exp));
  const rec={ts:D.ts,mode:D.mode,n:idx.length,right:idx.filter(i=>D.res[i].res===1).length,idk:idx.filter(i=>D.res[i].res===-1).length,
    score:Math.round(100*q.reduce((s,v)=>s+v,0)/idx.length),used:Math.round((D.end-D.t0)/1000),exp:idx.reduce((s,i)=>s+D.items[i].exp,0),it,g:idx.map(i=>D.items[i].g)};
  const rs=idx.map(i=>dAsResult(D.items[i],D.res[i]));
  const run={ts:D.ts,dur:rec.used,mode:'diag',att:rec.n,right:rec.right,pts:rec.score,time:rec.used,bonus:0};
  ensureStore().then(()=>{
    store.diags=mergeRuns(store.diags||[],[rec]);
    const mis=store.dmis||(store.dmis={});
    idx.forEach(i=>{ const r=D.res[i], x=D.items[i]; if(r.res!==0) return; const why=(x.opts[r.pick]||{}).why; if(!why) return;
      const h=String(x.ci)+':'+why.slice(0,48); const e=mis[h]||(mis[h]={c:x.ci,w:why,n:0,sure:0,last:0}); e.n++; if(r.conf===3) e.sure++; e.last=D.ts; });
    const ks=Object.keys(mis); if(ks.length>80) ks.sort((a,b)=>mis[a].last-mis[b].last).slice(0,ks.length-80).forEach(k=>delete mis[k]);
    persist(); saveSession(run,rs);
  });
  return rec;
}
function dAsResult(x,r){
  const c=DCON[x.ci];
  return {diag:1,id:x.g,conf:r.conf,exp:x.exp,cat:c.name,sec:c.sec,lv:x.lv,ok:r.res===1,skipped:r.res===-1,spent:r.t,q:x.q,kind:x.kind,ui:'mcq',ans:'',
    opts:x.opts.map((o,k)=>({h:o.h,ok:k===x.key,why:o.why||''})),picked:r.pick,given:'',trap:r.pick>=0&&r.res===0?x.opts[r.pick].why:'',how:x.how,sol:x.sol,fig:x.fig};
}

/* ---- results ---- */
function dFlags(x,r){
  const f=[];
  if(r.res===-1) f.push(['idk','Don’t know']);
  else if(r.res===0) f.push(r.conf===3?['sure','Wrong but certain']:['wrong','Wrong']);
  else if(r.conf===1) f.push(['lucky','Right but guessed']);
  else f.push(['ok','Right']);
  if(r.res===1&&r.t>1.5*x.exp) f.push(['slow','Slow']);
  if(r.first===x.key&&r.res===0) f.push(['talked','Changed away from the right answer']);
  return f;
}
function dPriority(x,r,m){ const q=dQual(r,x.exp); return (1-q)*(0.5+DCON[x.ci].w)*(0.6+0.4*(1-m.est))+(r.res===0&&r.conf===3?.4:0); }
function dReason(x,r){
  if(r.res===-1) return 'You said you don’t know this yet: start with the idea below.';
  if(r.res===0&&r.conf===3) return 'You were certain but wrong: that points to a misconception, the most important kind of gap to fix.';
  if(r.res===0) return 'Missed: here is what your pick usually means.';
  if(r.conf===1) return 'Right, but you were guessing: treat it as not known yet.';
  if(r.t>1.5*x.exp) return `Right, but it took ${fmtClock(r.t)} against about ${fmtClock(x.exp)}: it is not automatic yet.`;
  return 'Right, but not yet confident.';
}
function dResults(D,idx,rec){
  show('dgdone'); window.scrollTo(0,0);
  const msNow=dMastery(rec);            /* the record may not be merged yet; dMastery skips it if it is */
  const X=i=>D.items[i], R=i=>D.res[i];
  $('dghead').textContent=`${rec.score} / 100`;
  const sureN=idx.filter(i=>R(i).conf===3).length, sureOk=idx.filter(i=>R(i).conf===3&&R(i).res===1).length;
  $('dgRight').textContent=`${rec.right}/${rec.n}`; $('dgIdk').textContent=rec.idk;
  $('dgCal').textContent=sureN?Math.round(sureOk/sureN*100)+'%':'–';
  $('dgTime').textContent=fmtClock(rec.used); $('dgTimeOf').textContent=`time (estimate ${fmtClock(rec.exp)})`;
  $('dgline').textContent=rec.score>=85?'Exam-level work on these concepts is there. The next run moves on to whatever is weakest now.'
    :rec.score>=65?'Close. Fix the concepts listed first; the next run will check them again.'
    :rec.score>=40?'A mixed picture. The study list below is ordered by what will pay off most on the exam.'
    :'Early days. Work through the study list in order; each concept has a key idea and a practice button.';
  /* study first */
  const ranked=idx.map(i=>({i,p:dPriority(X(i),R(i),msNow[X(i).ci])})).filter(o=>dQual(R(o.i),X(o.i).exp)<.95).sort((a,b)=>b.p-a.p);
  const seenC=new Set(), top=[]; ranked.forEach(o=>{ if(!seenC.has(X(o.i).ci)&&top.length<5){ seenC.add(X(o.i).ci); top.push(o.i); } });
  const sf=$('dgstudy'); sf.innerHTML='';
  if(!top.length) sf.innerHTML='<p class="sub">Nothing to flag: every answer was right, confident and on pace.</p>';
  top.forEach((i,k)=>{ const x=X(i), r=R(i), c=DCON[x.ci], d=document.createElement('div'); d.className='dgrow';
    d.innerHTML=`<div class="weakhead"><b>${k+1}. ${esc(c.name)}</b><span class="hw">§${c.sec}</span><em>${dFlags(x,r).map(f=>`<span class="flag ${f[0]}">${f[1]}</span>`).join(' ')}</em></div>`+
      `<p class="key">${dReason(x,r)}${r.res===0&&x.opts[r.pick]&&x.opts[r.pick].why?` <span class="whyno">Your pick: ${x.opts[r.pick].why}</span>`:''}</p>`+
      `<p class="key"><b>Core idea:</b> ${esc(c.core)}</p>${x.how&&x.how!==c.core?`<p class="key"><b>On this question:</b> ${esc(x.how)}</p>`:''}<div class="btnrow tight"><button class="link" data-drill="${x.ci}">Practice ${esc(c.topic)} in a sprint</button></div>`;
    sf.appendChild(d); });
  sf.querySelectorAll('button[data-drill]').forEach(b=>b.onclick=()=>{ active=new Set([DCON[+b.dataset.drill].topic]); syncChips(); startGame(); });
  $('dgstudyacts').hidden=!top.length;
  $('dgretest').onclick=()=>dStart(top.length,top.map(i=>X(i).ci),'retest');
  $('dgdrillall').onclick=()=>{ active=new Set(top.map(i=>DCON[X(i).ci].topic)); syncChips(); startGame(); };
  /* insights */
  const L=[];
  const ideaI=idx.filter(i=>X(i).src==='idea'), skillI=idx.filter(i=>X(i).src==='skill');
  const pc=a=>a.length?Math.round(a.filter(i=>R(i).res===1).length/a.length*100):null;
  if(ideaI.length&&skillI.length){ const a=pc(ideaI), b=pc(skillI);
    L.push(a-b>=20?`<b>Ideas ahead of mechanics.</b> Concept questions ${a}% right, one-step computations ${b}%. You know what to do; sprints will make the computing reliable.`
      :b-a>=20?`<b>Mechanics ahead of ideas.</b> Computations ${b}% right, concept questions ${a}%. You can run procedures but some ideas are fuzzy: read the key ideas below before drilling.`
      :`<b>Ideas and mechanics are level</b> (concept questions ${a}%, computations ${b}%).`); }
  const conf3w=idx.filter(i=>R(i).conf===3&&R(i).res===0);
  if(sureN) L.push(`<b>Calibration.</b> When you said “certain” you were right ${sureOk} of ${sureN} times${conf3w.length?`. The ${conf3w.length} certain-but-wrong answer${conf3w.length>1?'s are':' is'} the top priority: ${conf3w.map(i=>DCON[X(i).ci].name).join(', ')}.`:'. Your confidence is trustworthy.'}`);
  const lucky=idx.filter(i=>R(i).res===1&&R(i).conf===1);
  if(lucky.length) L.push(`<b>Lucky guesses.</b> ${lucky.length} right answer${lucky.length>1?'s were':' was a'} guess${lucky.length>1?'es':''} (${lucky.map(i=>DCON[X(i).ci].name).join(', ')}). They count as not known yet.`);
  if(rec.idk) L.push(`<b>Honest unknowns.</b> You marked ${rec.idk} “don’t know”: ${idx.filter(i=>R(i).res===-1).map(i=>DCON[X(i).ci].name).join(', ')}. That is exactly what this diagnostic is for.`);
  const slow=idx.filter(i=>R(i).res===1&&R(i).t>1.5*X(i).exp);
  const ratio=rec.used/Math.max(1,rec.exp);
  L.push(`<b>Pace.</b> ${fmtClock(rec.used)} against an estimate of ${fmtClock(rec.exp)} (${ratio<0.8?'faster than expected':ratio<=1.25?'on pace':'slower than expected'}).${slow.length?` Right but slow on: ${slow.map(i=>DCON[X(i).ci].name).join(', ')}.`:''}`);
  const talked=idx.filter(i=>R(i).first===X(i).key&&R(i).res===0), fixed=idx.filter(i=>R(i).chg>0&&R(i).res===1&&R(i).first!==X(i).key);
  if(talked.length||fixed.length) L.push(`<b>Second thoughts.</b> Changing your answer helped ${fixed.length} time${fixed.length===1?'':'s'} and hurt ${talked.length} time${talked.length===1?'':'s'}${talked.length>fixed.length?': trust your first read more.':'.'}`);
  const byCh=[13,14,15].map(ch=>{ const a=idx.filter(i=>DCON[X(i).ci].ch===ch); return a.length?`Ch ${ch===13?'12–13':ch}: ${a.filter(i=>R(i).res===1).length}/${a.length}`:null; }).filter(Boolean);
  L.push(`<b>By chapter.</b> ${byCh.join(' · ')}.`);
  const pinI=idx.filter(i=>X(i).pin);
  if(pinI.length) L.push(`<b>From your mistake patterns.</b> ${pinI.length} question${pinI.length>1?'s were':' was'} queued because of earlier mistakes; ${pinI.filter(i=>R(i).res===1&&R(i).conf!==1).length} now right without guessing. Fixed ones leave the queue; misses stay in it.`);
  $('dginsights').innerHTML=L.map(s=>`<li>${s}</li>`).join('');
  /* knowledge map across every diagnostic so far */
  dMap($('dgmap'),msNow,new Map(idx.map(i=>[X(i).ci,R(i)])));
  $('dgready').textContent=`Across your diagnostics and mock exams, estimated Exam 1 readiness is ${dReadiness(msNow)}/100 (weighted by how often each concept is tested; untested concepts count as unknown).`;
  /* review */
  const ol=$('dgreview'); try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([ol]); }catch(e){}
  ol.innerHTML='';
  idx.forEach(i=>{ const x=X(i), r=R(i), c=DCON[x.ci], li=document.createElement('li'); li.className='xq'+(r.res===1?' okq':''); li.value=i+1;
    let h=`<span class="meta">Question ${i+1} · ${esc(c.name)} (§${c.sec}) · ${x.src==='exam'?'exam-level':x.src==='idea'?'concept':'computation'} · ${r.res===-1?'don’t know':r.res===1?'right':'wrong'}${r.conf?' · '+CONF[r.conf].toLowerCase():''} · ${fmtClock(r.t)} of ≈${fmtClock(x.exp)}${x.pin?` · picked by the pattern finder: ${esc(x.pin)}`:''}</span><div>${x.q}</div>`;
    x.opts.forEach((o,k)=>{ const isKey=k===x.key, bad=k===r.pick&&!isKey; h+=`<span class="opt${isKey?' key':''}${bad?' bad':''}"><i>${isKey?'✓':bad?'✗':' '}${LET[k]}</i>${o.h}</span>`; });
    if(r.res===0&&x.opts[r.pick].why) h+=`<span class="whyno">Why ${LET[r.pick]} is tempting: ${x.opts[r.pick].why}</span>`;
    h+=solHTML(x); if(r.res===1) h=h.replace('<details class="sol" open>','<details class="sol">');
    li.innerHTML=h; ol.appendChild(li); });
  typeset(ol); typeset($('dgstudy'));
  openSessionUI(D.ts,idx.map(i=>dAsResult(X(i),R(i))),'dgdone');
}
/* map tiles; today = Map(ci → response) for a badge */
function dMap(box,ms,today){
  box.innerHTML=[13,14,15].map(ch=>`<div class="dmapch"><h4>${ch===13?'Chapters 12–13':'Chapter '+ch}</h4><div class="dmapgrid">`+
    DCON.map((c,i)=>c.ch!==ch?'':(()=>{ const m=ms[i], t=today&&today.get(i);
      const mark=t?(t.res===1?(t.conf===1?'?':'✓'):t.res===-1?'–':'✗'):'';
      return `<div class="dtile ${m.status}" title="${esc(c.name)}: ${STATUS[m.status]}${m.n?`, ${Math.round(m.est*100)}% from ${checksStr(m)}`:''}"><b>${esc(c.name)}</b><span>§${c.sec} · ${STATUS[m.status]}${m.n?' · '+Math.round(m.est*100)+'%':''}</span>${mark?`<i>${mark}</i>`:''}</div>`; })()).join('')+`</div></div>`).join('');
}

/* ---- progress page section ---- */
function renderDProg(){
  const dl=store.diags||[], xl=store.exams||[], box=$('dprog'); box.hidden=!dl.length&&!xl.length; if(box.hidden) return;
  const ms=dMastery(), last=dl[dl.length-1];
  const src=[dl.length?`${dl.length} diagnostic${dl.length>1?'s':''}`:'',xl.length?`${xl.length} mock exam${xl.length>1?'s':''}`:''].filter(Boolean).join(' and ');
  $('dprogline').textContent=(last?`Latest diagnostic ${last.score}/100. `:'No diagnostic yet. ')+`Estimated Exam 1 readiness ${dReadiness(ms)}/100, from ${src}.`;
  $('dmapnote').textContent='Built from diagnostics and mock exams, since both test the whole exam. Sprints are practice and do not count here.';
  $('dhistfold').hidden=!dl.length;
  const many=dl.length>1; $('dchart').hidden=!many; $('dchartleg').hidden=!many;
  $('dchart').innerHTML=many?lineChart(dl.map(d=>d.score),{top:100,ticks:[0,25,50,75,100],fmt:v=>String(v),aria:'Diagnostic score by attempt, oldest on the left',tip:(v,i)=>`${whenStr(dl[i].ts)}: ${v}/100`}):'';
  dMap($('dprogmap'),ms,null);
  const tb=$('dcons').querySelector('tbody'); tb.innerHTML='';
  ms.map((m,i)=>({m,i})).sort((a,b)=>(a.m.n?a.m.est:-.1)-(b.m.n?b.m.est:-.1)||DCON[b.i].w-DCON[a.i].w).forEach(({m,i})=>{
    const c=DCON[i], tr=document.createElement('tr');
    tr.innerHTML=`<td>${esc(c.name)}<span class="how">§${c.sec}${m.n?` · last: ${m.last.res===1?(m.last.conf===1?'guessed right':'right'):m.last.res===-1?'don’t know':'wrong'}${m.last.exam?' (mock exam)':''}`:''}</span></td>`+
      `<td><span class="flag ${m.status}">${STATUS[m.status]}</span></td><td class="num">${m.n?Math.round(m.est*100)+'%':'–'}${m.adj&&Math.abs(m.adj)>=.01?`<span class="how" title="${esc((store.ai.adj[c.id]||{}).why||'')}">${m.adj>0?'+':'−'}${Math.round(Math.abs(m.adj)*100)} pattern</span>`:''}</td><td class="num">${m.n}${m.nx?`<span class="how">${m.nx} exam</span>`:''}</td><td class="num">${m.n?m.ratio.toFixed(1)+'×':'–'}</td>`;
    tb.appendChild(tr); });
  const mis=Object.values(store.dmis||{}).filter(e=>e.n>=2).sort((a,b)=>b.n-a.n||b.sure-a.sure).slice(0,8);
  $('dmiswrap').hidden=!mis.length;
  $('dmis').innerHTML=mis.map(e=>`<li><b>${esc(DCON[e.c]?DCON[e.c].name:'')}</b> · picked ${e.n} times${e.sure?`, ${e.sure} of them “certain”`:''}<span class="how">${e.w}</span></li>`).join('');
  const hb=$('dhist').querySelector('tbody'); hb.innerHTML='';
  dl.slice().reverse().forEach(d=>{ const tr=document.createElement('tr');
    tr.innerHTML=`<td>${whenStr(d.ts)}</td><td>${{quick:'Quick',std:'Half exam',full:'Long',retest:'Retest'}[d.mode]||d.mode}</td><td class="num">${d.right}/${d.n}</td><td class="num">${d.idk}</td><td class="num">${d.score}</td><td class="num">${fmtClock(d.used)}</td><td class="num"><button class="link dl" data-open="${d.ts}">Open</button></td>`;
    hb.appendChild(tr); });
  hb.querySelectorAll('button[data-open]').forEach(b=>b.onclick=()=>openSessionPage(+b.dataset.open));
}

/* ---- start-page card and intro ---- */
function dStartCard(){
  const dl=store.diags||[], xl=store.exams||[], el=$('dglast');
  if(!dl.length&&!xl.length){ el.textContent='No history yet: the first run samples the most exam-likely concepts and starts your concept map.'; return; }
  const ms=dMastery(), last=dl[dl.length-1];
  const weak=dFocus(ms).slice(0,4);
  el.innerHTML=(last?`Last diagnostic ${whenStr(last.ts)}: <b>${last.score}/100</b>. `:`No diagnostic yet; your mock exam${xl.length>1?'s':''} already fill part of the concept map. `)+
    `Readiness ${dReadiness(ms)}/100.`+((n=>n?` ${n} problem${n>1?'s':''} queued from your mistake patterns.`:'')(pQueue().length))+(weak.length?` Next run focuses on: ${weak.map(o=>esc(DCON[o.i].name)).join(', ')}.`:' Nothing is weak right now, so the run checks untested and stale concepts.');
}
function dBoot(){
  const s=dLoad(), el=$('dgresume');
  if(!s){ el.hidden=true; return; }
  el.hidden=false; el.innerHTML=`Diagnostic in progress (question ${s.i+1} of ${s.items.length}). <button class="link" id="dgres">Resume</button> <button class="link" id="dgdis">Discard</button>`;
  $('dgres').onclick=()=>{ el.hidden=true; DG=s; dOpen(); };
  $('dgdis').onclick=()=>{ dDrop(); el.hidden=true; };
}
function dPaintLen(){ [...$('dglen').children].forEach(x=>{ const on=x.dataset.len===dLen; x.classList.toggle('on',on); x.setAttribute('aria-pressed',on?'true':'false'); }); }
$('toDiag').onclick=()=>{ show('dgintro'); window.scrollTo(0,0); dPaintLen(); dBoot(); ensureStore().then(dStartCard); };
[...$('dglen').children].forEach(x=>x.onclick=()=>{ dLen=x.dataset.len; try{ localStorage.setItem('ma261-sprint:dlen',dLen); }catch(e){} dPaintLen(); });
$('dgbegin').onclick=()=>{ $('dgresume').hidden=true; dDrop(); ensureStore().then(()=>dStart(DLEN[dLen])); };
$('dgback').onclick=()=>{ show('start'); window.scrollTo(0,0); };
$('dgidk').onclick=()=>dAnswer(0,true);
[...$('dgconf').querySelectorAll('button')].forEach(b=>b.onclick=()=>dAnswer(+b.dataset.c,false));
$('dgend').onclick=()=>{ const b=$('dgend'); if(b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent='Tap again to end and see results'; setTimeout(()=>{ b.dataset.arm=''; b.textContent='End early'; },4000); return; } b.dataset.arm=''; b.textContent='End early'; dFinish(); };
$('dgagain').onclick=()=>{ show('dgintro'); window.scrollTo(0,0); dPaintLen(); dStartCard(); };
$('dghome').onclick=()=>{ show('start'); window.scrollTo(0,0); dStartCard(); };
$('toProg4').onclick=openProg;
document.addEventListener('keydown',e=>{
  if(phase!=='dg'||!DG||DG.done||e.metaKey||e.ctrlKey||e.altKey) return;
  const k=e.key.length===1?e.key.toUpperCase():'', it=DG.items[DG.i];
  if(k&&LET.indexOf(k)>=0&&LET.indexOf(k)<it.opts.length){ e.preventDefault(); dPick(LET.indexOf(k)); }
  else if('123'.includes(e.key)&&e.key&&DG.pick>=0){ e.preventDefault(); dAnswer(+e.key,false); }
  else if(e.key==='0'||e.key==='?'){ e.preventDefault(); dAnswer(0,true); }
});
try{ const v=localStorage.getItem('ma261-sprint:dlen'); if(v&&DLEN[v]) dLen=v; }catch(e){}
