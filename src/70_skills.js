/* ==== 70 · exam skills: taxonomy and analytics (no DOM) ==================
   Every mock-exam and drill answer is filed three ways:
     category  c = the exam slot index 0–14 (XSLOTS)
     variant   s = which version of that slot the generator built (SUBL keys, from xSub)
     traits      = tags shared across categories (multi-part, springs, circles…; tagsOf)
   statOf() turns a list of answers into a mastery score:
     weight = (exam 1 | drill W_DRILL) × 0.5^(age / HALF_DAYS)
     credit = 1 right (drill answers slower than the slot's pace get SLOW_CREDIT), 0 wrong or blank
     score  = (Σ weight·credit + 1) / (Σ weight + 2)        → 50% with no evidence
   Status rules (keep docs/DEV_NOTES.md in step if you change them):
     mastered  score ≥ .75 and every answer right on the last two exams that included it
     solid     score ≥ .70, but never while the latest exam missed it or no exam has it
     shaky     score ≥ .45        weak  below .45        new  no answers yet
     gap flag  ≥ 3 recent drill answers, ≥ 75% right, but the latest exam missed it
   ======================================================================== */
const W_EXAM=1, W_DRILL=0.2, HALF_DAYS=30, SLOW_CREDIT=0.7;
const SUBL={
  'x1-circ':'Circular orbit or string','x1-ball':'Thrown ball, gravity','x1-ball-air':'Thrown ball, air resistance','x1-ellipse':'Elliptical orbit',
  'x2-3d':'3-D forces (dot product)','x2-push':'Pushes along a line',
  'x3-rod':'Ball on a rod','x3-seat':'Ferris-wheel seat',
  'x4-triple':'Read K and U at three points','x4-dK':'ΔK and ΔU between points','x4-unbind':'Energy to break the pair apart',
  'x5-sum':'Q + W with signs','x5-lost':'Heat that leaked out','x5-dT':'Temperature rise',
  'x6-eq':'Choose the equation','x6-ratio':'Ratio of specific heats','x6-same':'Same heat, different C','x6-Tf':'Final temperature',
  'x7-eq':'Choose the equation','x7-num':'Numeric final speed',
  'x8-bowl':'Bowl, sliding block','x8-roll':'Bowl, rolling ball','x8-top':'Loop, top','x8-side':'Loop, side',
  'x9-bowl':'Bowl, sliding block','x9-roll':'Bowl, rolling ball','x9-top':'Loop, top','x9-side':'Loop, side',
  'x10-push':'Push, frictionless floor','x10-fric':'Push with friction','x10-vwork':'Work by a vertical spring',
  'x11-compare':'Compare drag and gravity','x11-force':'Drag at terminal speed','x11-air':'Work by air, round trip',
  'x12-max':'Highest point, from equilibrium','x12-speed':'Speed at equilibrium','x12-relaxed':'From the relaxed length',
  'x13-cer':'Claim, evidence, reasoning','x13-vert':'Three students, vertical launch','x13-inc':'Three students, incline with friction',
  'x14-sym':'Symbolic','x14-vert':'Vertical launch, numeric','x14-inc':'Incline with friction',
  'x15-sym':'Symbolic','x15-vert':'Vertical launch, numeric','x15-inc':'Incline with friction'};
const subCat=s=>+s.slice(1,s.indexOf('-'))-1;
const CSUBS=XSLOTS.map((_,c)=>Object.keys(SUBL).filter(s=>subCat(s)===c));
function xSub(c,it){
  const ch=(it&&it.chk)||{}, k=ch.k||'';
  switch(c){
    case 0: return k==='x1-ball'&&ch.air?'x1-ball-air':k;
    case 2: return (ch.seat!=null?ch.seat:ch.m>=60)?'x3-seat':'x3-rod';
    case 7: case 8: { const p=c===7?'x8-':'x9-'; return /-sym$/.test(k)?p+(ch.roll?'roll':'bowl'):p+(ch.at==='C'?'top':'side'); }
    case 9: return k==='x10-vwork'?k:(ch.mu?'x10-fric':'x10-push');
    case 11: return 'x12-'+(ch.mode||'max');
    case 12: return k==='x13-cer'?k:(ch.incline?'x13-inc':'x13-vert');
    case 13: case 14: { const p=c===13?'x14-':'x15-'; return /-sym$/.test(k)?p+'sym':p+(ch.incline?'inc':'vert'); }
    default: return SUBL[k]?k:null;
  }
}
const TAGS=[
  {id:'multi',name:'Multi-part, shared setup'},{id:'spring',name:'Springs'},{id:'circle',name:'Circular motion'},
  {id:'sym',name:'Answer is an equation or symbols'},{id:'concept',name:'Conceptual, no numbers'},
  {id:'num',name:'Numeric calculation'},{id:'fric',name:'Friction, drag and heat loss'},
  {id:'graph',name:'Reading an energy graph'},{id:'thermal',name:'Thermal energy'},{id:'roll',name:'Rolling objects'}];
const TAGN={}; TAGS.forEach(t=>{TAGN[t.id]=t.name;});
const SYMS=new Set(['x6-eq','x7-eq','x8-bowl','x8-roll','x9-bowl','x9-roll','x12-max','x12-speed','x12-relaxed','x14-sym','x15-sym']);
const CONC=new Set(['x1-circ','x1-ball','x1-ball-air','x1-ellipse','x11-compare','x13-cer','x13-vert','x13-inc']);
const FRIC=new Set(['x1-ball-air','x5-lost','x10-fric','x11-compare','x11-force','x11-air','x13-inc','x14-inc','x15-inc']);
/* traits known from the category alone also apply to records saved before variants were tracked */
function tagsOf(c,s){
  const t=[];
  if(c===7||c===8||c>=12) t.push('multi');
  if(c===9||c>=11) t.push('spring');
  if(c===2||c===7||c===8||s==='x1-circ') t.push('circle');
  if(c===3) t.push('graph');
  if(c===4||c===5) t.push('thermal');
  if(c===0||c===12||(s&&CONC.has(s))) t.push('concept');
  if(c===11||(s&&SYMS.has(s))) t.push('sym');
  if(s){
    if(FRIC.has(s)) t.push('fric');
    if(/roll/.test(s)) t.push('roll');
    if(!SYMS.has(s)&&!CONC.has(s)&&c!==3) t.push('num');
  }
  return [...new Set(t)];
}
const catName=c=>`Q${c+1} ${XSLOTS[c].name}`;
const grpOf=c=>c===7||c===8?'T':c>=12?'L':'c'+c;

/* ---- every exam and drill answer as one flat, time-ordered list ---- */
function events(){
  const out=[];
  (store.exams||[]).forEach(e=>{
    const q=Array.isArray(e.q)?e.q:Array.isArray(e.slots)&&e.slots.length===XSLOTS.length?e.slots.map((r,i)=>({c:i,s:null,r,t:null})):[];
    q.forEach(x=>out.push({src:'exam',sid:e.ts,ts:e.ts,c:x.c,s:x.s||null,r:x.r,t:x.t==null?null:x.t}));
  });
  (store.drills||[]).forEach(d=>(d.q||[]).forEach(x=>out.push({src:'drill',sid:d.ts,ts:x.at||d.ts,c:x.c,s:x.s||null,r:x.r,t:x.t==null?null:x.t})));
  return out.filter(e=>e.c>=0&&e.c<XSLOTS.length).sort((a,b)=>a.ts-b.ts);
}
const credit=e=>e.r!==1?0:(e.src==='drill'&&e.t!=null&&e.t>XPACE[e.c]?SLOW_CREDIT:1);
function statOf(list,now){
  now=now||Date.now();
  const o={n:list.length,right:0,blank:0,exN:0,exR:0,drN:0,drR:0,tSum:0,tN:0,exSeq:[],drSeq:[]};
  let sw=0,sc=0; const ses={}, order=[];
  list.forEach(e=>{
    const w=(e.src==='exam'?W_EXAM:W_DRILL)*Math.pow(0.5,Math.max(0,now-e.ts)/(HALF_DAYS*864e5));
    sw+=w; sc+=w*credit(e);
    if(e.r===1)o.right++; if(e.r===-1)o.blank++;
    if(e.src==='exam'){o.exN++; if(e.r===1)o.exR++; o.exSeq.push(e.r); if(!(e.sid in ses)){ses[e.sid]=true;order.push(e.sid);} if(e.r!==1) ses[e.sid]=false;} else {o.drN++; if(e.r===1)o.drR++; o.drSeq.push(e.r);}
    if(e.t!=null){o.tSum+=e.t;o.tN++;}
  });
  o.score=(sc+1)/(sw+2);                       /* starts at 50% with no evidence */
  const ex=o.exSeq, dr=o.drSeq.slice(-8);
  o.lastExMiss=order.length>0&&!ses[order[order.length-1]];   /* by exam, so a trait with several questions per exam works too */
  o.gap=dr.length>=3&&dr.filter(r=>r===1).length/dr.length>=0.75&&o.lastExMiss;
  let st=!o.n?'new':o.score>=0.75&&order.length>=2&&ses[order[order.length-1]]&&ses[order[order.length-2]]?'mastered':o.score>=0.7?'solid':o.score>=0.45?'shaky':'weak';
  if((st==='solid')&&(o.lastExMiss||!ex.length)) st='shaky';   /* drills alone never lift a type past shaky */
  o.status=st; o.tAvg=o.tN?o.tSum/o.tN:null;
  return o;
}
const STL={new:'Not seen',weak:'Weak',shaky:'Shaky',solid:'Solid',mastered:'Mastered'};
const STO={weak:0,shaky:1,new:2,solid:3,mastered:4};
const chipOf=st=>`<span class="status ${st.status}">${STL[st.status]}</span>`+(st.gap?'<span class="status gapb">exam gap</span>':'');

/* ---- what the exam history says, beyond one question at a time ---- */
function findPatterns(evs){
  const ex=evs.filter(e=>e.src==='exam'); if(!ex.length) return [];
  const out=[], miss=e=>e.r!==1, overall=ex.filter(miss).length/ex.length;
  const sids=[...new Set(ex.map(e=>e.sid))].sort((a,b)=>a-b), nEx=sids.length;
  TAGS.forEach(tg=>{
    const v=ex.filter(e=>tagsOf(e.c,e.s).indexOf(tg.id)>=0); if(v.length<3) return;
    const m=v.filter(miss), r=m.length/v.length;
    if(m.length>=2&&r>=0.5&&r>=overall+0.1){
      const cs=[...new Set(m.map(e=>e.c))].sort((a,b)=>a-b);
      out.push({sev:1.6+r-overall,title:tg.name,cats:cs,stat:`${m.length}/${v.length} missed · avg ${pct(overall)}`});
    }
  });
  const by={}; ex.filter(e=>e.s).forEach(e=>{(by[e.s]=by[e.s]||[]).push(e);});
  Object.keys(by).forEach(s=>{ const v=by[s], m=v.filter(miss).length;
    if(m>=2&&m/v.length>=0.5) out.push({sev:1.4+m*0.1,title:`${XSLOTS[subCat(s)].name}: ${SUBL[s]}`,cats:[subCat(s)],stat:`${m}/${v.length} missed`}); });
  if(nEx>=2){ const last2=sids.slice(-2);
    const rec=XSLOTS.map((_,c)=>c).filter(c=>last2.every(sid=>ex.some(e=>e.sid===sid&&e.c===c&&miss(e))));
    if(rec.length) out.push({sev:1.5,title:'Missed on both recent exams',cats:rec,stat:''}); }
  const gap=XSLOTS.map((_,c)=>c).filter(c=>statOf(evs.filter(e=>e.c===c)).gap);
  if(gap.length) out.push({sev:1.45,title:'Right in drills, not yet on exams',cats:gap,stat:''});
  const L=sids[nEx-1], le=ex.filter(e=>e.sid===L), rec=(store.exams||[]).find(e=>e.ts===L)||{};
  const bl=le.filter(e=>e.r===-1);
  if(bl.length>=2){ const left=rec.timeUp?0:XMIN*60-(rec.used||XMIN*60);
    out.push({sev:1.3,title:`${bl.length} left blank`,cats:bl.map(e=>e.c),stat:left>60?`${fmtClock(left)} left unused · guess, blanks score 0`:'blanks score 0'}); }
  if(le.length===XSLOTS.length){
    const hi=le.filter(e=>e.c>=10), lo=le.filter(e=>e.c<10), a=lo.filter(miss).length/lo.length, b=hi.filter(miss).length/hi.length;
    if(b-a>=0.299&&hi.filter(miss).length>=3) out.push({sev:1.1,title:'Late-exam slump',cats:hi.filter(miss).map(e=>e.c),stat:`Q11–15 ${pct(b)} missed · Q1–10 ${pct(a)}`});
  }
  const slow=le.filter(e=>e.t!=null&&e.t>XPACE[e.c]*1.5);
  if(slow.length>=2) out.push({sev:0.9,title:'Time sinks',cats:slow.map(e=>e.c),stat:slow.map(e=>`Q${e.c+1} ${fmtClock(e.t)}`).join(' · ')});
  return out.sort((x,y)=>y.sev-x.sev);
}
function patHTML(pats,one){       /* title · short stat · the question numbers involved */
  if(!pats.length) return '';
  return `<div class="pats">${pats.map(p=>`<div class="pat"><b>${esc(p.title)}</b>`+
    (p.stat?`<span class="pstat">${esc(p.stat)}</span>`:'')+
    `<span class="pq">${[...new Set(p.cats||[])].sort((x,y)=>x-y).map(c=>`<i title="${esc(XSLOTS[c].name)}">Q${c+1}</i>`).join('')}</span></div>`).join('')}</div>`+
    (one?`<p class="fine mono">1 exam so far</p>`:'');
}

/* ---- drill suggestions: weakest first, but anything drilled in the last few days waits its turn ---- */
function recommend(evs){
  const now=Date.now();
  const rows=XSLOTS.map((_,c)=>{
    const l=evs.filter(e=>e.c===c), st=statOf(l,now), ld=l.filter(e=>e.src==='drill').reduce((m,e)=>Math.max(m,e.ts),0);
    const days=ld?(now-ld)/864e5:99, space=Math.min(1,days/3), le=l.filter(e=>e.src==='exam').pop();
    const need=(1-st.score)*(0.3+0.7*space)+(st.gap?0.15:0)+(le&&le.r===0?0.06:0)+(le&&le.r===-1?0.04:0);
    let why=st.gap?'right in drills, still missed on your last exam':le&&le.r===0?'answered wrong on your last exam':le&&le.r===-1?'left blank on your last exam'
      :!st.n?'not tried yet':st.status==='weak'?'weak across your exams and drills':st.status==='shaky'?'not yet reliable':'keeping it fresh';
    if(ld&&days<3) why+=`; drilled ${days<1?'today':Math.round(days)+' day'+(Math.round(days)===1?'':'s')+' ago'}, so it is spaced out for now`;
    return {c,need,st,days,why};
  }).sort((a,b)=>b.need-a.need||a.c-b.c);
  const top=[rows[0]], second=rows.find(r=>r!==rows[0]&&grpOf(r.c)!==grpOf(rows[0].c));
  if(second) top.push(second);
  return {top,rows};
}
function weakSubs(c,evs){
  const by={}; evs.filter(e=>e.c===c&&e.s).forEach(e=>{(by[e.s]=by[e.s]||[]).push(e);});
  return Object.keys(by).map(s=>({s,sc:statOf(by[s]).score})).filter(x=>x.sc<0.5).sort((a,b)=>a.sc-b.sc).slice(0,2).map(x=>x.s);
}
