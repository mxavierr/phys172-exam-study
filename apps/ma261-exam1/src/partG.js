
/* =====================================================================
   sprint engine: typed or multiple-choice answers
   ===================================================================== */
const secLabel=s=>'§'+s;
const LEVEL={1:{name:'Easy',mult:1},2:{name:'Medium',mult:2},3:{name:'Hard',mult:3}};
const BASE=10, pts=lv=>BASE*LEVEL[lv].mult;
const secKey=s=>{ const m=String(s).match(/(\d+)\.(\d+)/); return m?(+m[1])*100+(+m[2]):9999; };
const TOPICS=[...new Set(GEN.map(g=>g.cat))];
const TOPIC_SEC={},FIRST={};
TOPICS.forEach(t=>{ TOPIC_SEC[t]=[...new Set(GEN.filter(g=>g.cat===t).map(g=>g.sec))].sort((a,b)=>secKey(a)-secKey(b)); });
GEN.forEach((g,i)=>{ if(FIRST[g.cat]===undefined) FIRST[g.cat]=i; });
const isConcept=t=>/^Concept/.test(t);
TOPICS.sort((a,b)=>(isConcept(a)-isConcept(b))||secKey(TOPIC_SEC[a][0])-secKey(TOPIC_SEC[b][0])||FIRST[a]-FIRST[b]);
const chapOf=t=>{ const s=TOPIC_SEC[t][0]; return /^1[23]/.test(s)?'a':/^14/.test(s)?'b':'c'; };
const secRange=list=>list.length===1?list[0]:`${list[0].split('–')[0]}–${list[list.length-1].split('–').pop()}`;
const GROUPS=[
  {key:'a',name:'Chapters 12–13',desc:'parametric curves, vectors, dot & cross products, lines, planes, quadric surfaces',test:t=>chapOf(t)==='a'},
  {key:'b',name:'Chapter 14',desc:'vector functions, derivatives & integrals, motion, arc length, curvature',test:t=>chapOf(t)==='b'},
  {key:'c',name:'Chapter 15',desc:'domains, limits, partials, chain rule, gradient, tangent planes, max & min',test:t=>chapOf(t)==='c'}
];

/* ---- clock, time bonus, overtime ---- */
const TARGET=300, BONUS_MIN=60;                  /* 12 questions in 60 minutes = 5:00 each */
const bonusFor=spent=>spent<=TARGET?BONUS_MIN+(TARGET-spent):0;
const fmtClock=sec=>{const r=Math.max(0,Math.floor(sec));return Math.floor(r/60)+':'+String(r%60).padStart(2,'0');};

/* ---- state ---- */
let dur=1200, mode='type', active=new Set(TOPICS), phase='start', t0=0, tick=null, cur=null, qi=0;
let results=[], streak=0, recent=[], bank=0, over=false, bonusOn=true, sessTs=0;
const scoreOf=rs=>rs.reduce((s,r)=>s+(r.ok?pts(r.lv):0),0);
const LET='ABCDEF';                   /* the Fall 2026 exam has six choices */

/* ---- multiple-choice options: the key plus distinct known traps ---- */
function mcqFrom(o){
  if(o.kind==='choice'){
    const opts=(o.noShuffle?o.opts:shuf(o.opts)).map(x=>({h:x.h,ok:!!x.ok,why:x.why||''}));
    return opts.filter(x=>x.ok).length===1?opts:null;
  }
  const Q={kind:o.kind,vars:o.vars,eqVars:o.eqVars,range:o.range,line:o.line,surf:o.surf};
  let K; try{ K=mParse(o.ans); }catch(e){ return null; }
  const keys=[K].concat((o.alts||[]).map(a=>mParse(a)));
  const chosen=[];
  for(const d of shuf(o.dis||[])){
    if(!d||!d.a) continue; let D; try{ D=mParse(d.a); mTex(D); }catch(e){ continue; }
    if(Q.kind==='expr'&&D.t!=='dne'&&D.t!=='none'){             /* never offer an undefined value like arccos(−6) */
      const env={}; (Q.vars||[]).forEach(v=>env[v]=1.13); let v; try{ v=mEval(D,env); }catch(e){ v=NaN; }
      if(typeof v!=='number'||!Number.isFinite(v)) continue; }
    /* line/curve answers are graded against the key's geometry, so only test the distractor against it */
    const oneWay=Q.kind==='line'||Q.kind==='curve';
    const same=(A,B)=>{ try{ return matchOne(A,B,Q,Q.kind,Q.vars||[])===true||(!oneWay&&matchOne(B,A,Q,Q.kind,Q.vars||[])===true); }catch(e){ return false; } };
    if(keys.some(k=>same(D,k))) continue;
    if(chosen.some(c=>c.a===d.a||(!oneWay&&same(D,c.node)))) continue;
    chosen.push({a:d.a,why:d.why,node:D});
    if(chosen.length===4) break;
  }
  if(chosen.length<2) return null;
  const list=shuf([{h:mk(o.ans),ok:true,why:'',a:o.ans}].concat(chosen.slice(0,chosen.length>=3?4:3).map(c=>({h:mk(c.a),ok:false,why:c.why,a:c.a}))));
  if(chosen.length<3) list.push({h:'None of these',ok:false,why:'The correct value is among the options: recheck the computation.',nota:true});
  return list;
}

function makeQ(){
  const topics=[...active];
  for(let tries=0;tries<120;tries++){
    const t=pick(topics);
    if(t==='Quadric surfaces'){                                     /* the quadric topic is a memorization trainer (qmem.js) */
      const o=qmQuestion(qi+1); if(!o) continue;
      return {id:'qm-'+o.qm.f,cat:t,sec:'13.6',q:o.q,kind:'choice',ans:o.ans,alts:[],vars:[],eqVars:null,range:null,line:null,surf:null,dis:[],how:o.how,lv:o.lv||1,
        sol:o.sol||[],fig:'',opts:o.opts.map(x=>({h:x.h,ok:!!x.ok,why:x.why||'',t:x.t})),ui:'mcq',qm:o.qm,intro:o.intro||''};
    }
    const all=GEN.filter(g=>g.cat===t), fresh=all.filter(g=>!recent.includes(g.id));
    const g=pick(fresh.length?fresh:all);
    let o=null; try{ o=g.fn(); }catch(e){ o=null; }
    if(!o) continue;
    const needMcq=mode==='mcq'||o.kind==='choice';
    const opts=needMcq?mcqFrom(o):null;
    if(needMcq&&!opts) continue;
    recent=[g.id,...recent].slice(0,4);
    return {id:g.id,cat:g.cat,sec:g.sec,q:o.q,kind:o.kind,ans:o.ans,alts:o.alts||[],vars:o.vars||[],eqVars:o.eqVars||null,range:o.range||null,
      line:o.line||null,surf:o.surf||null,dis:(o.dis||[]).map(d=>({a:d.a,why:d.why})),how:o.how,lv:o.lv||1,sol:o.sol||[],fig:o.fig||'',
      opts,ui:needMcq?'mcq':'type'};
  }
  return null;
}
const FMT={expr:'Enter an exact expression.',vec:'Enter a vector, like <1, -2, sqrt(3)> or i - 2j + 3k.',point:'Enter a point, like (1, -2, 3).',
  points:'Enter every point, separated by commas: (0, 0), (1, -1). Type none if there are none.',eq:'Enter an equation. Any nonzero multiple of it is fine.',
  line:'Enter r(t) = <x₀ + at, y₀ + bt, z₀ + ct>. Any point on the line and any parallel direction work.',curve:'Enter a vector function of t that traces the curve.'};
function fmtHint(Q){
  let s=FMT[Q.kind]||FMT.expr;
  if(Q.kind==='expr'&&Q.vars&&Q.vars.length) s=`Enter an expression in ${Q.vars.join(', ')}.`;
  if(Q.kind==='vec'&&Q.vars&&Q.vars.length) s=`Enter a vector function of ${Q.vars.join(', ')}, like <cos(t), 2t, 1>.`;
  if(Q.kind==='expr'&&/DNE/.test(Q.q)) s='Enter an exact value, or DNE.';
  return s;
}

/* ---- start screen ---- */
function buildGroups(){
  const box=$('groups'); box.innerHTML='';
  GROUPS.forEach(gr=>{
    const topics=TOPICS.filter(gr.test);
    const wrap=document.createElement('div'); wrap.className='group';
    wrap.innerHTML=`<div class="grouphead"><b>${gr.name}</b><em>${gr.desc}</em>`+
      `<span class="acts"><button class="link" data-g="${gr.key}" data-act="all">Select all</button>`+
      `<button class="link" data-g="${gr.key}" data-act="none">Clear</button></span></div>`;
    const chips=document.createElement('div'); chips.className='chips';
    topics.forEach(t=>{
      const c=document.createElement('div');
      c.className='chip'+(active.has(t)?' on':''); c.dataset.topic=t;
      c.setAttribute('role','button'); c.tabIndex=0;
      c.setAttribute('aria-pressed',active.has(t)?'true':'false');
      c.innerHTML=`${t.replace(/^Concept checks: /,'True/false: ')}<small>${secRange(TOPIC_SEC[t])}</small>`;
      const toggle=()=>{ if(active.has(t)){ if(active.size===1)return; active.delete(t); } else active.add(t); syncChips(); };
      c.onclick=toggle;
      c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}};
      chips.appendChild(c);
    });
    wrap.appendChild(chips); box.appendChild(wrap);
  });
  box.querySelectorAll('button[data-act]').forEach(b=>{
    b.onclick=()=>{
      const gr=GROUPS.find(g=>g.key===b.dataset.g), topics=TOPICS.filter(gr.test);
      if(b.dataset.act==='all')topics.forEach(t=>active.add(t));
      else{ const left=[...active].filter(t=>!topics.includes(t)); if(!left.length)return; topics.forEach(t=>active.delete(t)); }
      syncChips();
    };
  });
  syncChips();
}
function syncChips(){
  document.querySelectorAll('#groups .chip').forEach(c=>{
    const on=active.has(c.dataset.topic); c.classList.toggle('on',on); c.setAttribute('aria-pressed',on?'true':'false');
  });
  document.querySelectorAll('#groups button[data-act="none"]').forEach(b=>{
    const gr=GROUPS.find(g=>g.key===b.dataset.g);
    const left=[...active].filter(t=>!gr.test(t));
    b.disabled=!left.length;
  });
  paintBest('bestline');
}
function pickChip(boxId,c,fn){ [...$(boxId).children].forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false');}); c.classList.add('on'); c.setAttribute('aria-pressed','true'); fn(c); paintBest('bestline'); }
function wireChips(boxId,attr,fn){
  $(boxId).onclick=e=>{const c=e.target.closest('.chip'); if(c)pickChip(boxId,c,fn);};
  $(boxId).onkeydown=e=>{const c=e.target.closest('.chip'); if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();pickChip(boxId,c,fn);}};
}
wireChips('durchips','dur',c=>{dur=+c.dataset.dur;});
wireChips('modechips','mode',c=>{mode=c.dataset.mode; try{ localStorage.setItem('ma261-sprint:mode',mode); }catch(e){} });
function paintBonus(){ const c=$('bonuschip'); c.classList.toggle('on',bonusOn); c.setAttribute('aria-pressed',bonusOn?'true':'false'); paintBest('bestline'); }
function toggleBonus(){ bonusOn=!bonusOn; try{ localStorage.setItem('ma261-sprint:bonus',bonusOn?'1':'0'); }catch(e){} paintBonus(); }
$('bonuschip').onclick=toggleBonus;
$('bonuschip').onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleBonus();} };
$('allTopics').onclick=()=>{ active=new Set(TOPICS); syncChips(); };
$('noConcepts').onclick=()=>{ active=new Set(TOPICS.filter(t=>!isConcept(t))); syncChips(); };

/* ---- personal best in points (this browser only) ---- */
function scope(){ const s=GROUPS.filter(g=>[...active].some(g.test)).map(g=>g.key).join(''); return s||'abc'; }
const scopeName=s=>s==='abc'?'all of Exam 1':GROUPS.filter(g=>s.includes(g.key)).map(g=>g.name).join(' + ');
const bestKey=()=>`ma261-sprint:points:${dur}:${mode}:${scope()}:${bonusOn?'b':'f'}`;
function readBest(){ try{ return +(localStorage.getItem(bestKey())||0); }catch(e){ return 0; } }
function writeBest(n){ try{ localStorage.setItem(bestKey(),String(n)); }catch(e){} }
function paintBest(id){
  const b=readBest();
  $(id).textContent=b?`Your best for ${dur/60} minutes, ${mode==='mcq'?'multiple choice':'typed'}, on ${scopeName(scope())}`+
    `${bonusOn?' with the time bonus':''}: ${b} points.`:'';
}

/* ---- gameplay ---- */
const SECTIONS=['start','play','done','prog','sess','xintro','exam','xdone','dgintro','dg','dgdone','qstudy'];
function show(id){ phase=id; SECTIONS.forEach(s=>{$(s).hidden=(s!==id);}); }
function buildTicks(){ $('ticks').innerHTML=Array.from({length:Math.max(2,Math.min(40,Math.round(dur/60)))},()=>'<i></i>').join(''); }
const lvlHTML=lv=>`<span class="pips" aria-hidden="true">${[1,2,3].map(i=>`<i class="${i<=lv?'on':''}"></i>`).join('')}</span>`+
                  `${LEVEL[lv].name} ×${LEVEL[lv].mult}<em>${pts(lv)} pts</em>`;

function startGame(){
  results=[]; streak=0; qi=0; recent=[]; bank=0; over=false; sessTs=Date.now();
  QM_S.again=[]; QM_PAUSE=0; $('qmteach').hidden=true; $('qmteach').innerHTML='';
  clearTimeout(flashTimer); $('verdict').innerHTML=''; $('verdict').className='verdict';
  $('hintline').textContent=mode==='mcq'?'Press Esc to end early.':'Enter on an empty box skips. Press Esc to end early.';
  buildTicks(); show('play'); t0=Date.now(); nextQ(); runClock(); paintStats();
}
function runClock(){ clearInterval(tick); tick=setInterval(paintClock,200); paintClock(); }
function paintClock(){
  const left=dur+bank-((QM_PAUSE||Date.now())-t0)/1000, t=$('time');
  if(left>0){ t.textContent=fmtClock(left); $('fill').style.width=Math.min(100,left/(dur+bank)*100)+'%'; }
  else{
    if(!over){ over=true; $('hintline').textContent='Overtime. The clock is counting up: answer or skip this question to end the run.'; }
    t.textContent='+'+fmtClock(-left); $('fill').style.width='0%';
  }
  const low=left<=60&&left>0;
  t.classList.toggle('low',low); t.classList.toggle('over',left<=0); $('fill').classList.toggle('low',low);
  if(cur){ const spent=(Date.now()-cur.shown)/1000, q=$('qtimer'); q.textContent=fmtClock(spent); q.classList.toggle('over',spent>BUDGET[cur.lv]); }
}
let answered=false;
function paintQ(){
  $('tag').textContent=cur.cat.replace(/^Concept checks: /,'True/false · '); $('hwtag').textContent=secLabel(cur.sec);
  const l=$('lvl'); l.className='lvl l'+cur.lv; l.innerHTML=lvlHTML(cur.lv);
  const qt=$('qtext'); try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([qt,$('mopts')]); }catch(e){}
  qt.innerHTML=cur.q; qt.classList.add('wait');
  $('qfig').innerHTML=cur.fig||''; $('qfig').hidden=!cur.fig;
  $('qnum').textContent='Question '+qi;
  const mcq=cur.ui==='mcq';
  $('typebox').hidden=mcq; $('mcqbox').hidden=!mcq;
  if(mcq){
    $('mopts').innerHTML=cur.opts.map((o,i)=>`<button class="mopt" role="radio" aria-checked="false" data-i="${i}"><b>${LET[i]}</b><span>${o.h}</span></button>`).join('');
    $('mopts').querySelectorAll('.mopt').forEach(b=>b.onclick=()=>pickOpt(+b.dataset.i));
  } else { $('fmt').textContent=fmtHint(cur); $('ans').value=''; paintPreview(); }
  answered=false;
  const card=$('qcard'); card.classList.remove('rise'); void card.offsetWidth; card.classList.add('rise');
  typeset(mcq?$('qcard'):qt,()=>qt.classList.remove('wait'));
  if(!mcq) $('ans').focus();
}
function nextQ(){
  cur=makeQ(); if(!cur){ endGame(); return; }
  qi++; paintQ(); cur.shown=Date.now();
}

/* ---- live preview of how the typed answer is read ---- */
let pvTimer=null;
function paintPreview(){
  clearTimeout(pvTimer);
  pvTimer=setTimeout(()=>{
    const raw=$('ans').value.trim(), pv=$('pv');
    try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([pv]); }catch(e){}
    if(!raw){ pv.innerHTML='<span class="err" style="color:var(--ink-soft)">start typing</span>'; return; }
    try{ const n=mParse(raw); pv.innerHTML='\\('+mTex(n)+'\\)'; typeset(pv); }
    catch(e){ pv.innerHTML=`<span class="err">${esc(e.message)}</span>`; }
  },140);
}
$('ans').addEventListener('input',paintPreview);
$('keypad').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  const a=$('ans'), k=b.dataset.k, s=a.selectionStart??a.value.length, en=a.selectionEnd??a.value.length;
  a.value=a.value.slice(0,s)+k+a.value.slice(en);
  const back=b.dataset.b?1:0, pos=s+k.length-back;
  a.focus(); a.setSelectionRange(pos,pos); paintPreview();
});

let flashTimer=null;
function flash(ok,html,keep){
  const v=$('verdict'); try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([v]); }catch(e){}
  v.className='verdict '+(ok?'ok':'no'); v.innerHTML=html; typeset(v);
  clearTimeout(flashTimer); flashTimer=setTimeout(()=>{v.innerHTML='';v.className='verdict';},keep||(ok?1100:3600));
}
function shake(el){ el=el||$('ans'); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
const ansTexOf=r=>r.ui==='mcq'||r.kind==='choice'?(r.opts.find(o=>o.ok)||{}).h:'\\('+tex(r.ans)+'\\)';

function record(ok,extra,spent){
  let gained=0;
  if(ok&&bonusOn&&!over){ gained=bonusFor(spent); bank+=gained; }
  results.push({...cur,...extra,ok,spent,bonus:gained});
  if(cur.qm) qmUpdate(cur.qm,ok,spent);
  if(ok){ streak++;
    flash(true,`${pick(['Got it.','Clean.','Yes.','Correct.'])} +${pts(cur.lv)} points`+(gained?`, +${fmtClock(gained)} on the clock`:'')+(streak>=3?`, ${streak} in a row`:'')+'.');
  } else streak=0;
  return gained;
}
function finishQ(){ paintStats(); if(over) endGame(); else nextQ(); }

function submit(){
  if(!cur||phase!=='play'||cur.ui==='mcq') return;
  const raw=$('ans').value.trim(), spent=(Date.now()-cur.shown)/1000;
  if(raw===''){
    record(false,{given:null,skipped:true},spent);
    flash(false,`Q${qi} skipped. Answer: ${ansTexOf(cur)}`); finishQ(); return;
  }
  const g=gradeInput(raw,cur);
  if(g.retry){ shake(); flash(false,esc(g.msg),4200); return; }
  let givenTex=''; try{ givenTex=mTex(mParse(raw)); }catch(e){}
  if(g.ok){ record(true,{given:raw,givenTex,skipped:false},spent); finishQ(); return; }
  const trap=trapFor(raw,cur);
  record(false,{given:raw,givenTex,skipped:false,trap:trap?trap.why:''},spent); shake();
  flash(false,`Q${qi}: the answer is ${ansTexOf(cur)}.`+(trap?` <span style="color:var(--ink)">Likely slip: ${esc(trap.why)}</span>`:''),trap?6000:3600);
  finishQ();
}
function pickOpt(i){
  if(!cur||phase!=='play'||cur.ui!=='mcq'||answered) return;
  answered=true;
  const spent=(Date.now()-cur.shown)/1000, o=cur.opts[i], ok=!!o.ok;
  const btns=$('mopts').querySelectorAll('.mopt');
  btns[i].classList.add(ok?'pick-ok':'pick-no');
  if(!ok){ const k=cur.opts.findIndex(x=>x.ok); btns[k].classList.add('pick-ok'); }
  record(ok,{given:o.h,picked:i,skipped:false,trap:ok?'':o.why||''},spent);
  if(!ok) flash(false,`Q${qi}: the answer is ${LET[cur.opts.findIndex(x=>x.ok)]}.`+(o.why?` <span style="color:var(--ink)">${esc(o.why)}</span>`:''),cur.qm?60000:5200);
  if(!ok&&cur.qm){ qmTeach(o); return; }                           /* quadric trainer: stop and learn the card */
  setTimeout(finishQ,ok?650:1600);
}
function paintStats(){
  $('sScore').textContent=scoreOf(results);
  $('sCorrect').textContent=results.filter(r=>r.ok).length;
  $('sStreak').textContent=streak;
}

/* ---- worked solutions, typeset with MathJax when it has loaded ---- */
function solHTML(r){
  const lines=t=>{
    const bits=t.split(/(\\quad\\Rightarrow\\quad|,\\qquad )/), out=[bits[0]];
    for(let i=1;i<bits.length;i+=2) out.push((bits[i].indexOf('Rightarrow')>=0?'\\Rightarrow\\ ':'')+bits[i+1]);
    return out.map(l=>`<div class="eq raw">\\[${esc(l)}\\]</div>`).join('');
  };
  const steps=(r.sol||[]).map(s=>`<li>${s[0]?`<p>${s[0]}</p>`:''}${s[1]?lines(s[1]):''}</li>`).join('');
  return `<details class="sol" open><summary>Worked solution</summary>`+
         (r.how?`<p class="key">Key idea: ${esc(r.how)}</p>`:'')+`<ol class="steps">${steps}</ol></details>`;
}
function typeset(el,done){
  try{ qgHydrate(el); }catch(e){}
  let tries=0;
  const go=()=>{
    const MJ=window.MathJax;
    if(MJ&&typeof MJ.typesetPromise==='function'){
      MJ.typesetPromise([el]).then(()=>{ el.querySelectorAll('.eq.raw').forEach(e=>e.classList.remove('raw')); done&&done(); }).catch(()=>{ done&&done(); });
    }else if(++tries<120) setTimeout(go,150); else done&&done();
  };
  go();
}

/* ---- pace chart ---- */
function paceChart(rows){
  const W=640,H=170,padL=46,padR=16,padT=12,padB=24;
  const top=Math.max(TARGET+60,Math.ceil(Math.max.apply(null,rows.map(r=>r.spent))/60)*60);
  const step=(W-padL-padR)/rows.length, bw=Math.max(3,step-2);
  const y=t=>padT+(H-padT-padB)*(1-Math.min(t,top)/top);
  const gstep=top>600?120:60; let grid='',bars='';
  for(let s=gstep;s<=top;s+=gstep)
    grid+=`<line class="grid" x1="${padL}" x2="${W-padR}" y1="${y(s).toFixed(1)}" y2="${y(s).toFixed(1)}"/>`+
          `<text class="ax" x="${padL-8}" y="${(y(s)+4).toFixed(1)}" text-anchor="end">${fmtClock(s)}</text>`;
  rows.forEach((r,i)=>{
    const h=Math.max(2,(H-padT-padB)*Math.min(r.spent,top)/top), state=r.skipped?'skipped':r.ok?'solved':'missed';
    bars+=`<rect class="${r.ok?'ok':'no'}" x="${(padL+i*step+1).toFixed(1)}" y="${(H-padB-h).toFixed(1)}" `+
          `width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4,bw/2).toFixed(1)}">`+
          `<title>Question ${i+1}, ${esc(r.cat)}, ${fmtClock(r.spent)}, ${state}</title></rect>`;
  });
  const ty=y(TARGET).toFixed(1);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Seconds spent on each question, with the five minute target">`+
         `<line class="axis" x1="${padL}" x2="${W-padR}" y1="${H-padB}" y2="${H-padB}"/>${grid}${bars}`+
         `<line class="target" x1="${padL}" x2="${W-padR}" y1="${ty}" y2="${ty}"/>`+
         `<text class="ax" x="${W-padR}" y="${(+ty-7).toFixed(1)}" text-anchor="end">5:00</text></svg>`;
}
function renderPace(){
  const n=results.length, box=$('pacechart'), tb=$('bytime').querySelector('tbody');
  box.innerHTML=''; tb.innerHTML='';
  $('pacelegend').hidden=!n; $('pacefold').hidden=!n;
  if(!n){ $('paceline').textContent='Nothing attempted, so there is no pace to show.'; return; }
  const avg=results.reduce((s,r)=>s+r.spent,0)/n, okr=results.filter(r=>r.ok);
  const avgOk=okr.length?okr.reduce((s,r)=>s+r.spent,0)/okr.length:0, under=okr.filter(r=>r.spent<=TARGET).length;
  let txt=`You averaged ${fmtClock(avg)} per question`;
  if(okr.length){
    txt+=` and ${fmtClock(avgOk)} per question solved. `;
    const tail=`${under} of your ${okr.length} solved questions came in under 5:00.`;
    txt+=avgOk>TARGET?`That is slower than the 5:00 exam pace: ${tail}`:`That is inside the 5:00 exam pace, and ${tail}`;
  } else txt+='. You did not solve one this time, so there is no solved-question pace.';
  if(bonusOn) txt+=` You banked ${fmtClock(bank)} of extra time.`;
  $('paceline').textContent=txt;
  box.innerHTML=paceChart(results);
  results.forEach((r,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${i+1}</td><td>${esc(r.cat)}</td><td>${LEVEL[r.lv].name}</td><td class="num">${fmtClock(r.spent)}</td>`+
                 `<td>${r.skipped?'Skipped':r.ok?'Solved':'Missed'}</td>`;
    tb.appendChild(tr);
  });
}

/* one missed problem, as shown on the results page and on a past session's page */
function missHTML(r,k){
  let yours;
  if(r.skipped) yours='<span class="yours">Skipped</span>';
  else if(r.ui==='mcq') yours='';
  else yours=`<span class="yours">You entered <span class="pv">${r.givenTex?'\\('+r.givenTex+'\\)':esc(r.given)}</span></span>`;
  const opts=r.ui==='mcq'?`<span class="opts">${r.opts.map((o,i)=>`<span class="${o.ok?'key':i===r.picked?'bad':''}"><i>${LET[i]}</i>${o.h}${i===r.picked&&!o.ok?' (your pick)':''}</span>`).join('')}</span>`:'';
  return `<span class="meta">${esc(r.cat)}, ${secLabel(r.sec)}, ${r.diag?`diagnostic question ${k+1}`:r.exam?`exam question ${k+1} <span class="pts">(8 pts)</span>`:`${LEVEL[r.lv].name} ×${LEVEL[r.lv].mult} <span class="pts">(${pts(r.lv)} pts)</span>`}</span>${r.q}`+
    (r.fig?`<div class="qfig">${r.fig}</div>`:'')+opts+yours+
    (r.ui==='mcq'?'':`<span class="right">Answer: <span class="pv">${ansTexOf(r)}</span></span>`)+
    (r.trap?`<span class="trap">${r.ui==='mcq'?'About your pick':'Your answer matches a common slip'}: ${esc(r.trap)}</span>`:'')+
    solHTML(r);
}
function renderResults(){
  const c=results.filter(r=>r.ok).length, n=results.length, score=scoreOf(results);
  $('rCorrect').textContent=c;
  $('rAcc').textContent=n?Math.round(c/n*100)+'%':'0%';
  $('rPace').textContent=n?fmtClock(results.reduce((s,r)=>s+r.spent,0)/n):'–';
  $('headline').textContent=n===0?'Time.':`${score} points`;
  const hard=results.filter(r=>r.lv===3), hardOk=hard.filter(r=>r.ok).length, acc=n?c/n:0;
  $('verdictline').textContent=
    n===0?'No answers went in. Give it another go.':
    acc>=0.9&&c>=6?`Fast and accurate: ${c} solved, ${hardOk} of them hard.`:
    acc>=0.9?'Everything you attempted was right. Now push the pace.':
    acc>=0.6?`${c} of ${n} right. The worked solutions below are where the points are.`:
    'Accuracy first, speed second. Work through the solutions below.';
  renderPace();
  const lb=$('bylevel').querySelector('tbody'); lb.innerHTML='';
  [1,2,3].forEach(lv=>{
    const rs=results.filter(r=>r.lv===lv), ok=rs.filter(r=>r.ok).length, tr=document.createElement('tr');
    tr.innerHTML=`<td>${LEVEL[lv].name} ×${LEVEL[lv].mult}</td><td class="num">${ok}</td><td class="num">${rs.length}</td><td class="num">${ok*pts(lv)}</td>`;
    lb.appendChild(tr);
  });
  const tb=$('bytopic').querySelector('tbody'); tb.innerHTML=''; const byT={};
  results.forEach(r=>{ const b=byT[r.cat]=byT[r.cat]||{c:0,n:0,p:0,sec:new Set()}; b.n++; b.sec.add(r.sec); if(r.ok){b.c++;b.p+=pts(r.lv);} });
  Object.keys(byT).sort((a,b)=>byT[b].n-byT[a].n||a.localeCompare(b)).forEach(k=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${esc(k)}</td><td class="hwcol">${[...byT[k].sec].join(', ')}</td><td class="num">${byT[k].c}</td><td class="num">${byT[k].n}</td><td class="num">${byT[k].p}</td>`;
    tb.appendChild(tr);
  });
  if(!n) tb.innerHTML='<tr><td colspan="5">Nothing attempted.</td></tr>';
  const ol=$('missed');
  try{ if(window.MathJax&&window.MathJax.typesetClear) window.MathJax.typesetClear([ol]); }catch(e){}
  ol.innerHTML='';
  const miss=results.map((r,k)=>[r,k]).filter(x=>!x[0].ok);
  $('missedwrap').hidden=!miss.length;
  const qmn=results.filter(r=>r.qm);
  $('qmres').hidden=!qmn.length;
  if(qmn.length){ const c=qmCounts(); $('qmresline').textContent=`${qmn.filter(r=>r.ok).length} of ${qmn.length} quadric questions right this session. ${c.mem} of ${c.total} facts memorized, ${c.learn} in progress.`; $('qmresgrid').innerHTML=qmGrid(); }
  miss.slice(0,60).forEach(([r,k])=>{ const li=document.createElement('li'); li.innerHTML=missHTML(r,k); ol.appendChild(li); });
}
function endGame(){
  if(phase!=='play')return;
  if(QM_PAUSE){ t0+=Date.now()-QM_PAUSE; QM_PAUSE=0; } $('qmteach').hidden=true;
  clearInterval(tick); tick=null; cur=null;
  renderResults();
  const score=scoreOf(results), prev=readBest();
  if(score>prev) writeBest(score);
  $('bestline2').textContent=score>prev&&score>0?`New best for ${dur/60} minutes on ${scopeName(scope())}.`:
    (prev?`Your best for ${dur/60} minutes on ${scopeName(scope())}: ${prev} points.`:'');
  saveRun();
  show('done'); window.scrollTo(0,0);
  typeset($('missed'));
  openSessionUI(sessTs,results,'done');
}

/* =====================================================================
   progress: what keeps costing you, kept across sessions
   ===================================================================== */
const BUDGET={1:150,2:300,3:450};
const isSlow=r=>r.ok&&r.spent>BUDGET[r.lv];
const budgetLine='2:30 easy, 5:00 medium, 7:30 hard';
const STORE_KEY='ma261-sprint:progress', RUN_CAP=150, MAXB=200000;
const GENBY={}; GEN.forEach(g=>{GENBY[g.id]=g;});
let store={v:1,updated:0,runs:[],sess:[],exams:[],diags:[],dmis:{},mlog:[],ai:null,mlbf:0}, db=null, ref=null, uid=null, storeP=null, dbOK=false, wq=Promise.resolve();
let drillCats=[], armed=false, armTimer=null;

function buildRun(){
  const n=results.length; if(!n) return null;
  const t={};
  results.forEach(r=>{
    const a=t[r.id]||(t[r.id]=[0,0,0,0,0]);
    a[0]++; if(r.ok)a[1]++; if(isSlow(r))a[2]++; if(r.skipped)a[3]++;
    a[4]=Math.round((a[4]+r.spent)*10)/10;
  });
  return {ts:sessTs,dur,mode,bonus:bonusOn?1:0,scope:scope(),att:n,
    right:results.filter(r=>r.ok).length,slow:results.filter(isSlow).length,
    skip:results.filter(r=>r.skipped).length,pts:scoreOf(results),
    time:Math.round(results.reduce((s,r)=>s+r.spent,0)),t};
}
function readLocal(){
  try{ const raw=localStorage.getItem(STORE_KEY); if(!raw)return null;
       const o=JSON.parse(raw); return o&&Array.isArray(o.runs)?o:null; }catch(e){ return null; }
}
function writeLocal(o){ try{ localStorage.setItem(STORE_KEY,JSON.stringify(o)); }catch(e){} }
function mergeRuns(a,b){
  const seen={},out=[];
  (b||[]).concat(a||[]).forEach(r=>{ const k=r&&r.ts; if(k&&!seen[k]){seen[k]=1;out.push(r);} });  /* b wins on a tie: newer info */
  return out.sort((x,y)=>x.ts-y.ts).slice(-RUN_CAP);
}
function fitStore(o){
  let s=JSON.stringify(o),i=0;
  while(s.length>MAXB&&i<o.runs.length-1){ delete o.runs[i].t; i++; s=JSON.stringify(o); }
  const dl=o.diags||[]; let j=0;
  while(s.length>MAXB&&j<dl.length-10){ delete dl[j].g; j++; s=JSON.stringify(o); }
  const ml=o.mlog||[];
  while(s.length>MAXB&&ml.length>200){ ml.splice(0,20); s=JSON.stringify(o); }
  while(s.length>MAXB&&o.runs.length>1){ o.runs.shift(); s=JSON.stringify(o); }
  while(s.length>MAXB&&dl.length>20){ dl.shift(); s=JSON.stringify(o); }
  return o;
}
function persist(){
  store.updated=Date.now(); fitStore(store); writeLocal(store);
  wq=writeCookie();                                   /* compressed copy in a cookie (storecookie.js) */
}
async function initStore(){
  const local=readLocal();
  if(local) store={v:1,updated:local.updated||0,runs:local.runs||[],sess:local.sess||[],exams:local.exams||[],diags:local.diags||[],dmis:local.dmis||{},mlog:local.mlog||[],ai:local.ai||null,mlbf:local.mlbf||0,ailog:local.ailog||[],qmem:local.qmem||null};
  try{
    const remote=await readCookieStore();          /* the cookie copy (storecookie.js), merged record by record */
    if(remote){
      const runs=mergeRuns(remote.runs,store.runs), sess=mergeRuns(remote.sess,store.sess), exams=mergeRuns(remote.exams,store.exams), diags=mergeRuns(remote.diags,store.diags);
      const dmis=Object.assign({},store.dmis||{}); Object.entries(remote.dmis||{}).forEach(([k,e])=>{ if(!dmis[k]||(e.n||0)>(dmis[k].n||0)) dmis[k]=e; });
      const mine=store.mlog||[], ai=[remote.ai,store.ai].filter(Boolean).sort((a,b)=>(b.ts||0)-(a.ts||0))[0]||null;
      store.mlog=(remote.mlog||[]).slice(); mlogMerge(mine);
      const mlog=store.mlog, mlbf=Math.max(remote.mlbf||0,store.mlbf||0);
      const grew=runs.length!==(remote.runs||[]).length||sess.length!==(remote.sess||[]).length||exams.length!==(remote.exams||[]).length||diags.length!==(remote.diags||[]).length||mlog.length!==(remote.mlog||[]).length;
      const ailog=(remote.ailog||[]).concat(store.ailog||[]).filter((x,i,a)=>a.findIndex(y=>y.at===x.at)===i).sort((a,b)=>a.at-b.at).slice(-15);
      const qa=remote.qmem||{f:{},intro:{}}, qb=store.qmem||{f:{},intro:{}}, qf=Object.assign({},qa.f||{});
      Object.entries(qb.f||{}).forEach(([k,e])=>{ if(!qf[k]||(e.l||0)>(qf[k].l||0)) qf[k]=e; });
      const qmem={v:1,f:qf,intro:Object.assign({},qa.intro||{},qb.intro||{})};
      store={v:1,updated:Math.max(remote.updated||0,store.updated||0),runs,sess,exams,diags,dmis,mlog,ai,mlbf,ailog,qmem};
      writeLocal(store);
    }
    if(store.runs.length||store.sess.length||(store.exams||[]).length||(store.diags||[]).length||Object.keys((store.qmem||{}).f||{}).length) persist();
  }catch(e){}
}
function ensureStore(){ if(!storeP) storeP=initStore().catch(()=>{}); return storeP; }

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
  return {id,...b,wrong,cost,rate:cost/(b.seen+2),cat:g.cat||'Retired problem',sec:g.sec||''};
}
function weakList(m){
  return Object.keys(m).map(id=>typeRow(id,m[id])).filter(r=>r.cost>0)
    .sort((a,b)=>b.rate-a.rate||b.cost-a.cost||b.seen-a.seen);
}
const IDEA={};
function keyIdea(id){
  if(IDEA[id]!==undefined) return IDEA[id];
  const g=GENBY[id]; const c={}; let best='';
  if(g&&!/^concept/.test(id)) for(let i=0;i<6;i++){ try{ const o=g.fn(); const h=o&&o.how||''; if(h) c[h]=(c[h]||0)+1; }catch(e){} }
  Object.keys(c).forEach(h=>{ if(c[h]>(c[best]||0)) best=h; });
  return IDEA[id]=best;
}
function lineChart(vals,o){
  const W=640,H=170,padL=58,padR=18,padT=12,padB=26,n=vals.length;
  const Xp=i=>n<2?padL+(W-padL-padR)/2:padL+(W-padL-padR)*i/(n-1);
  const Yp=v=>padT+(H-padT-padB)*(1-Math.max(0,Math.min(v,o.top))/o.top);
  let grid='';
  (o.ticks||[]).forEach(s=>{
    const y=Yp(s).toFixed(1);
    grid+=`<line class="grid" x1="${padL}" x2="${W-padR}" y1="${y}" y2="${y}"/>`+
          `<text class="ax" x="${padL-8}" y="${(+y+4).toFixed(1)}" text-anchor="end">${o.fmt(s)}</text>`;
  });
  const d=vals.map((v,i)=>`${i?'L':'M'}${Xp(i).toFixed(1)} ${Yp(v).toFixed(1)}`).join(' ');
  const dots=vals.map((v,i)=>`<circle class="pt" cx="${Xp(i).toFixed(1)}" cy="${Yp(v).toFixed(1)}" `+
    `r="${n>40?2:3.5}"><title>${esc(o.tip(v,i))}</title></circle>`).join('');
  const tg=o.target!=null?`<line class="target" x1="${padL}" x2="${W-padR}" y1="${Yp(o.target).toFixed(1)}" y2="${Yp(o.target).toFixed(1)}"/>`:'';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria)}">`+
    `<line class="axis" x1="${padL}" x2="${W-padR}" y1="${H-padB}" y2="${H-padB}"/>${grid}${tg}`+
    `${n>1?`<path class="line" d="${d}"/>`:''}${dots}`+
    `<text class="ax" x="${padL}" y="${H-8}">oldest</text>`+
    `<text class="ax" x="${W-padR}" y="${H-8}" text-anchor="end">newest</text></svg>`;
}
const whenStr=ts=>{ try{ return new Date(ts).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}); }catch(e){ return ''; } };

function renderProg(){
  const runs=store.runs, has=runs.length>0;
  $('progempty').hidden=has||!!(store.exams||[]).length||!!(store.diags||[]).length; $('proghas').hidden=!has;
  renderXProg(); renderDProg(); renderAIProg();
  $('storenote').textContent='Saved in this browser (local storage + a cookie copy). A private window or cleared site data starts from zero.';
  if(!has) return;
  const att=runs.reduce((s,r)=>s+(r.att||0),0), right=runs.reduce((s,r)=>s+(r.right||0),0),
        slow=runs.reduce((s,r)=>s+(r.slow||0),0), time=runs.reduce((s,r)=>s+(r.time||0),0);
  $('pRuns').textContent=runs.length; $('pQs').textContent=att;
  $('pAcc').textContent=att?Math.round(right/att*100)+'%':'0%';
  $('pPace').textContent=att?fmtClock(time/att):'–';
  const tpq=att?time/att:0, acc=att?right/att:0;
  const reach=tpq>0?Math.max(1,Math.min(12,Math.floor(3600/tpq))):0, solved=Math.round(acc*reach);
  $('projpanel').innerHTML=`<p><span class="num">${reach} of 12</span>questions you would work through in a 60-minute exam at ${fmtClock(tpq)} a question.</p>`+
    `<p><span class="num">${solved} right</span>if your ${Math.round(acc*100)}% accuracy holds.</p>`;
  $('projfine').textContent=`Across ${right} correct of ${att} attempted, with ${slow} solved past the time budget for their difficulty (${budgetLine}; a 12-question, 60-minute exam averages 5:00). Multiple choice and typed sessions are pooled.`;
  const m=fold(), top=weakList(m).slice(0,8), box=$('weak'); box.innerHTML='';
  if(!top.length){
    box.innerHTML='<p class="sub">Nothing is costing you yet. Everything you have seen came back right and inside its time budget.</p>';
    $('weakintro').hidden=true; $('drillrow').hidden=true; drillCats=[];
  }else{
    $('weakintro').hidden=false; const max=top[0].rate;
    top.forEach(r=>{
      const bits=[]; if(r.wrong) bits.push(`${r.wrong} missed`); if(r.slow) bits.push(`${r.slow} slow`);
      const idea=keyIdea(r.id), d=document.createElement('div'); d.className='weakrow';
      d.innerHTML=`<div class="weakhead"><b>${esc(r.cat)}</b>`+(r.sec?`<span class="hw">${secLabel(r.sec)}</span>`:'')+
        `<em>${bits.join(' · ')} of ${r.seen}</em></div>`+
        `<div class="bar"><i style="width:${Math.max(6,Math.round(r.rate/max*100))}%"></i></div>`+(idea?`<p class="key">Key idea: ${esc(idea)}</p>`:'');
      box.appendChild(d);
    });
    drillCats=[...new Set(top.map(r=>r.cat))].filter(c=>TOPICS.indexOf(c)>=0);
    $('drillrow').hidden=!drillCats.length;
    $('drill').textContent=`Drill ${drillCats.length===1?'this topic':'these '+drillCats.length+' topics'}`;
  }
  renderSessList();
  const accv=runs.map(r=>r.att?r.right/r.att*100:0);
  $('accchart').innerHTML=lineChart(accv,{top:100,ticks:[0,25,50,75,100],fmt:v=>v+'%',
    aria:'Share of questions answered correctly, session by session, oldest on the left',
    tip:(v,i)=>`${whenStr(runs[i].ts)}: ${Math.round(v)}% of ${runs[i].att}`});
  const tv=runs.map(r=>r.att?r.time/r.att:0);
  const topT=Math.max(TARGET+60,Math.ceil(Math.max.apply(null,tv.concat([TARGET]))/60)*60);
  const tk=[]; for(let s=0;s<=topT;s+=topT>900?180:60) tk.push(s);
  $('timechart').innerHTML=lineChart(tv,{top:topT,ticks:tk,fmt:fmtClock,target:TARGET,
    aria:'Average time per question, session by session, against the five minute target',
    tip:(v,i)=>`${whenStr(runs[i].ts)}: ${fmtClock(v)} a question`});
  const ab=$('alltypes').querySelector('tbody'); ab.innerHTML='';
  Object.keys(m).map(id=>typeRow(id,m[id])).sort((a,b)=>secKey(a.sec)-secKey(b.sec)||a.cat.localeCompare(b.cat)||b.seen-a.seen)
    .forEach(r=>{
      const idea=keyIdea(r.id), tr=document.createElement('tr');
      tr.innerHTML=`<td>${esc(r.cat)}${idea?`<span class="how">${esc(idea)}</span>`:''}</td>`+
        `<td class="hwcol">${r.sec?secLabel(r.sec):'–'}</td><td class="num">${r.seen}</td>`+
        `<td class="num">${r.right}</td><td class="num">${r.slow}</td><td class="num">${r.seen?fmtClock(r.time/r.seen):'–'}</td>`;
      ab.appendChild(tr);
    });
}
function openProg(){ show('prog'); window.scrollTo(0,0); renderProg(); ensureStore().then(()=>{ if(phase==='prog') renderProg(); }); }
function saveRun(){
  const run=buildRun(); if(!run) return;
  const snap=results.slice();
  ensureStore().then(()=>{ store.runs=mergeRuns(store.runs,[run]); persist(); saveSession(run,snap); });
}
