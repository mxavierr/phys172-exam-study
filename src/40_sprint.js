/* ==== 40 · sprint engine ================================================
   The timed typed-answer game: topic picker, question flow, clock + time
   bonus + overtime, grading, results screen, personal best.
   Pace numbers live here and are reused by the progress page.
   ======================================================================== */
const hwLabel=n=>'HW'+String(n).padStart(2,'0');
const LEVEL={1:{name:'Easy',mult:1},2:{name:'Medium',mult:2},3:{name:'Hard',mult:3}};
const BASE=10, pts=lv=>BASE*LEVEL[lv].mult;
const TOPICS=[...new Set(GEN.map(g=>g.cat))];
const TOPIC_HW={},FIRST={};
TOPICS.forEach(t=>{TOPIC_HW[t]=[...new Set(GEN.filter(g=>g.cat===t).map(g=>g.hw))].sort((a,b)=>a-b);});
GEN.forEach((g,i)=>{ if(FIRST[g.cat]===undefined) FIRST[g.cat]=i; });
TOPICS.sort((a,b)=>TOPIC_HW[a][0]-TOPIC_HW[b][0]||FIRST[a]-FIRST[b]);
/* the Exam 2 "what you should know" list leaves out rest energy, identity change and power */
const EXAM_OUT=['Particle energy','Identity change','Power'];
const hwRange=list=>{
  if(list.length===1)return hwLabel(list[0]);
  const contiguous=list.every((h,i)=>i===0||h===list[i-1]+1);
  return contiguous?`${hwLabel(list[0])}–${String(list[list.length-1]).padStart(2,'0')}`
                   :list.map(hwLabel).join(', ');
};
const GROUPS=[
  {key:'a',name:'HW11–HW13',desc:'work, the Energy Principle, potential energy, energy diagrams',test:t=>TOPIC_HW[t][0]<=13},
  {key:'b',name:'HW14–HW15',desc:'thermal energy, dissipation, rotational energy',test:t=>TOPIC_HW[t][0]>=14}
];

/* ---- answer parsing & checking ---- */
function parseNum(s){
  if(s==null)return NaN;
  let t=String(s).trim().toLowerCase().replace(/[−–]/g,'-').replace(/,/g,'').replace(/\s+/g,'');
  if(!t)return NaN;
  t=t.replace(/[×x·*]10\^?/g,'e').replace(/\^/g,'').replace(/e\+/g,'e');
  const v=Number(t);
  return Number.isFinite(v)?v:NaN;
}
function close(guess,ans){
  if(!Number.isFinite(guess))return false;
  if(ans===0)return Math.abs(guess)<=1e-9;
  return Math.abs(guess-ans)<=Math.abs(ans)*0.02;
}
const ansHTML=(x,u)=>`${sci(x,4)}${u?' '+u:''}`;

/* ---- pace: a 15-question, 60-minute exam averages 4:00 a question ----
   TARGET   exam pace for one average question (s); also the time-bonus cutoff
   BUDGET   per-difficulty time budget (s); a correct answer slower than this is logged as slow */
const TARGET=240, BONUS_MIN=60;
const BUDGET={1:120,2:240,3:360};
const isSlow=r=>r.ok&&r.spent>BUDGET[r.lv];
const bonusFor=spent=>spent<=TARGET?BONUS_MIN+(TARGET-spent):0;

/* ---- state ---- */
let dur=300, active=new Set(TOPICS), t0=0, cur=null, qi=0;
let results=[], streak=0, recent=[], bank=0, over=false, bonusOn=true;
const scoreOf=rs=>rs.reduce((s,r)=>s+(r.ok?pts(r.lv):0),0);

/* Pick a topic, then a generator not used in the last 3 questions, and roll it.
   A generator returns null when its random numbers are unusable (some do so 40% of the time),
   and a broken one could throw: both just mean "roll again". */
function rollGen(g){ try{ const o=g.fn(); return o&&Number.isFinite(o.ans)&&(o.zero||Math.abs(o.ans)>1e-30)?o:null; }catch(e){ return null; } }
function makeQ(){
  const topics=[...active];
  for(let tries=0;tries<200;tries++){
    const t=pick(topics), all=GEN.filter(g=>g.cat===t), fresh=all.filter(g=>!recent.includes(g.id));
    const g=pick(fresh.length?fresh:all), o=rollGen(g);
    if(!o) continue;
    recent=[g.id,...recent].slice(0,3);
    return {id:g.id,cat:g.cat,hw:g.hw,q:o.q,ans:o.ans,unit:o.unit,how:o.how,lv:o.lv||1,sol:o.sol||[],fig:o.fig||''};
  }
  for(const g of GEN){ const o=rollGen(g); if(o) return {id:g.id,cat:g.cat,hw:g.hw,q:o.q,ans:o.ans,unit:o.unit,how:o.how,lv:o.lv||1,sol:o.sol||[],fig:o.fig||''}; }
  throw new Error('no generator produced a question');
}

/* ---- start screen ---- */
function buildGroups(){
  const box=$('groups'); box.innerHTML='';
  GROUPS.forEach(gr=>{
    const topics=TOPICS.filter(gr.test);
    const wrap=document.createElement('div'); wrap.className='group';
    wrap.innerHTML=`<div class="grouphead"><b>${gr.name}</b>`+
      `<span class="acts"><button class="link" data-g="${gr.key}" data-act="all" data-tip="Include every ${gr.name} topic">all</button>`+
      `<button class="link" data-g="${gr.key}" data-act="none" data-tip="Leave out every ${gr.name} topic">none</button></span></div>`;
    const chips=document.createElement('div'); chips.className='chips';
    topics.forEach(t=>{
      const c=document.createElement('div');
      c.className='chip'+(active.has(t)?' on':''); c.dataset.topic=t;
      c.setAttribute('role','button'); c.tabIndex=0;
      c.setAttribute('aria-pressed',active.has(t)?'true':'false');
      c.innerHTML=`${t}<small>${hwRange(TOPIC_HW[t])}</small>`;
      const n=GEN.filter(g=>g.cat===t).length;
      c.dataset.tip=`${n} problem type${n===1?'':'s'} from ${hwRange(TOPIC_HW[t])}. Click to include or leave out.`;
      const toggle=()=>{
        if(active.has(t)){ if(active.size===1)return; active.delete(t); } else active.add(t);
        syncChips();
      };
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
    b.disabled=!left.length; b.style.opacity=left.length?'':'0.4'; b.style.cursor=left.length?'':'default';
  });
  paintBest('bestline');
}
function pickDur(c){
  [...$('durchips').children].forEach(x=>x.classList.remove('on'));
  c.classList.add('on'); dur=+c.dataset.dur; paintBest('bestline');
}
function paintBonus(){
  const c=$('bonuschip');
  c.classList.toggle('on',bonusOn); c.setAttribute('aria-pressed',bonusOn?'true':'false');
  paintBest('bestline');
}
function toggleBonus(){
  bonusOn=!bonusOn;
  lsSet(LS('bonus'),bonusOn?'1':'0');
  paintBonus();
}

/* ---- personal best in points (this browser only) ---- */
function scope(){
  const a=[...active].some(GROUPS[0].test), b=[...active].some(GROUPS[1].test);
  return a&&b?'ab':a?'a':'b';
}
const bestKey=()=>LS(`points:${dur}:${scope()}:${bonusOn?'b':'f'}`);
const readBest=()=>+(lsGet(bestKey())||0);
const writeBest=n=>lsSet(bestKey(),String(n));
function paintBest(id){
  const b=readBest();
  $(id).textContent=b?`Best ${b} pts · ${dur/60} min${bonusOn?' + bonus':''}`:'';
}
function buildTicks(){ $('ticks').innerHTML=Array.from({length:Math.max(2,Math.round(dur/30))},()=>'<i></i>').join(''); }
const lvlHTML=lv=>`<span class="pips" aria-hidden="true">${[1,2,3].map(i=>`<i class="${i<=lv?'on':''}"></i>`).join('')}</span>`+
                  `${LEVEL[lv].name} ×${LEVEL[lv].mult}<em>${pts(lv)} pts</em>`;

function startGame(){
  results=[]; streak=0; qi=0; recent=[]; bank=0; over=false;
  buildTicks(); show('play'); t0=Date.now(); nextQ(); runClock(); paintStats();
}
const runClock=()=>every('play',paintClock,100);
function paintClock(){
  const left=dur+bank-(Date.now()-t0)/1000, t=$('time');
  if(left>0){
    t.textContent=fmtClock(left);
    $('fill').style.width=Math.min(100,left/(dur+bank)*100)+'%';
  }else{
    over=true;                                   /* the big clock shows "+m:ss overtime" */
    t.textContent='+'+fmtClock(-left);
    $('fill').style.width='0%';
  }
  const low=left<=30&&left>0;
  t.classList.toggle('low',low); t.classList.toggle('over',left<=0); $('fill').classList.toggle('low',low);
  if(cur){
    const spent=(Date.now()-cur.shown)/1000, q=$('qtimer');
    q.textContent=fmtClock(spent);
    q.classList.toggle('over',spent>BUDGET[cur.lv]);   /* past exam pace for this difficulty */
  }
}
function paintQ(){
  $('tag').textContent=cur.cat; $('hwtag').textContent=hwLabel(cur.hw);
  const l=$('lvl'); l.className='lvl l'+cur.lv; l.innerHTML=lvlHTML(cur.lv);
  $('qtext').innerHTML=markGivens(cur.q); $('unit').textContent=cur.unit;
  showFigure('q',cur.fig,'Fig. '+two(qi));
  $('qbig').textContent=two(qi);
  restartAnim($('qcard'));
  $('ans').focus();
}
function nextQ(){ cur=makeQ(); qi++; $('ans').value=''; paintQ(); cur.shown=Date.now(); }

let flashTimer=null;
function flash(ok,html){
  const v=$('verdict'); v.className='verdict '+(ok?'ok':'no'); v.innerHTML=html;
  clearTimeout(flashTimer); flashTimer=setTimeout(()=>{v.innerHTML='';v.className='verdict';},ok?900:1800);
}
function shake(){ const a=$('ans'); a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); }

function submit(){
  if(!cur||phase!=='play')return;
  const raw=$('ans').value.trim(), spent=(Date.now()-cur.shown)/1000;
  const finish=()=>{ paintStats(); if(over) endGame(); else nextQ(); };
  if(raw===''){
    results.push({...cur,given:null,ok:false,skipped:true,spent,bonus:0}); streak=0;
    flash(false,`Skipped · ${ansHTML(cur.ans,cur.unit)}`); finish(); return;
  }
  const g=parseNum(raw);
  if(!Number.isFinite(g)){ shake(); flash(false,'Not a number'); return; }
  const ok=close(g,cur.ans);
  let gained=0;
  if(ok&&bonusOn&&!over){ gained=bonusFor(spent); bank+=gained; }
  results.push({...cur,given:g,ok,skipped:false,spent,bonus:gained});
  if(ok){ streak++;
    flash(true,`+${pts(cur.lv)} pts`+
      (gained?` · +${fmtClock(gained)} clock`:'')+(streak>=3?` · ${streak} streak`:''));
  }
  else { streak=0; shake(); flash(false,ansHTML(cur.ans,cur.unit)); }
  finish();
}
function paintStats(){
  $('sScore').textContent=scoreOf(results);
  $('sCorrect').textContent=results.filter(r=>r.ok).length;
  $('sStreak').textContent=streak;
}

/* ---- pace: time spent per question against the 4:00 exam target ---- */
function paceChart(rows){
  const W=640,H=170,padL=46,padR=16,padT=12,padB=24;
  const top=Math.max(300,Math.ceil(Math.max.apply(null,rows.map(r=>r.spent))/60)*60);
  const step=(W-padL-padR)/rows.length, bw=Math.max(3,step-2);
  const y=t=>padT+(H-padT-padB)*(1-Math.min(t,top)/top);
  let grid='',bars='';
  for(let s=60;s<=top;s+=60)
    grid+=`<line class="grid" x1="${padL}" x2="${W-padR}" y1="${y(s).toFixed(1)}" y2="${y(s).toFixed(1)}"/>`+
          `<text class="ax" x="${padL-8}" y="${(y(s)+4).toFixed(1)}" text-anchor="end">${fmtClock(s)}</text>`;
  rows.forEach((r,i)=>{
    const h=Math.max(2,(H-padT-padB)*Math.min(r.spent,top)/top);
    const state=r.skipped?'skipped':r.ok?'solved':'missed';
    bars+=`<rect class="${r.ok?'ok':'no'}" x="${(padL+i*step+1).toFixed(1)}" y="${(H-padB-h).toFixed(1)}" `+
          `width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4,bw/2).toFixed(1)}">`+
          `<title>Question ${i+1}, ${r.cat}, ${fmtClock(r.spent)}, ${state}</title></rect>`;
  });
  const ty=y(TARGET).toFixed(1);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Seconds spent on each question, with the four minute target">`+
         `<line class="axis" x1="${padL}" x2="${W-padR}" y1="${H-padB}" y2="${H-padB}"/>${grid}${bars}`+
         `<line class="target" x1="${padL}" x2="${W-padR}" y1="${ty}" y2="${ty}"/>`+
         `<text class="ax" x="${W-padR}" y="${(+ty-7).toFixed(1)}" text-anchor="end">4:00</text></svg>`;
}
function renderPace(){
  const n=results.length, box=$('pacechart'), tb=$('bytime').querySelector('tbody');
  box.innerHTML=''; tb.innerHTML='';
  $('pacelegend').hidden=!n; $('pacefold').hidden=!n;
  if(!n) return;
  box.innerHTML=paceChart(results);
  results.forEach((r,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${i+1}</td><td>${r.cat}</td><td>${LEVEL[r.lv].name}</td>`+
                 `<td class="num">${fmtClock(r.spent)}</td>`+
                 `<td>${r.skipped?'Skipped':r.ok?'Solved':'Missed'}</td>`;
    tb.appendChild(tr);
  });
}

function renderResults(){
  const c=results.filter(r=>r.ok).length, n=results.length, score=scoreOf(results);
  $('rCorrect').textContent=c;
  $('rAcc').textContent=n?Math.round(c/n*100)+'%':'0%';
  $('rPace').textContent=n?fmtClock(results.reduce((s,r)=>s+r.spent,0)/n):'–';
  $('headline').textContent=n===0?'Time.':`${score} points`;

  renderPace();

  const tb=$('bytopic').querySelector('tbody'); tb.innerHTML='';
  const byT={};
  results.forEach(r=>{ const b=byT[r.cat]=byT[r.cat]||{c:0,n:0,p:0,hw:new Set()}; b.n++; b.hw.add(r.hw); if(r.ok){b.c++;b.p+=pts(r.lv);} });
  Object.keys(byT).sort((a,b)=>byT[b].n-byT[a].n||a.localeCompare(b)).forEach(k=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${k}</td><td class="hwcol">${hwRange([...byT[k].hw].sort((a,b)=>a-b))}</td>`+
                 `<td class="num">${byT[k].c}</td><td class="num">${byT[k].n}</td><td class="num">${byT[k].p}</td>`;
    tb.appendChild(tr);
  });
  if(!n) tb.innerHTML='<tr><td colspan="5">Nothing attempted.</td></tr>';

  const miss=results.filter(r=>!r.ok), ol=$('missed');
  clearMath(ol);
  $('missedwrap').hidden=!miss.length;
  miss.slice(0,40).forEach(r=>{
    const li=document.createElement('li');
    li.innerHTML=`<span class="meta">${r.cat}, ${hwLabel(r.hw)}, ${LEVEL[r.lv].name} ×${LEVEL[r.lv].mult} <span class="pts">(${pts(r.lv)} pts)</span></span>${markGivens(r.q)}`+
      (r.fig?`<div class="qfig">${figPanel(r.fig,'Figure')}</div>`:'')+
      (r.skipped?'<span class="yours">Skipped</span>':`<span class="yours">You entered ${sci(r.given,4)}</span>`)+
      `<span class="right">Answer: ${ansHTML(r.ans,r.unit)}</span>`+solHTML(r);
    ol.appendChild(li);
  });
}
function endGame(){
  if(phase!=='play')return;
  stopTimer('play'); cur=null; lsDel(LS('sprint'));
  renderResults();
  const score=scoreOf(results), prev=readBest();
  if(score>prev) writeBest(score);
  $('bestline2').textContent=score>prev&&score>0?`New best · ${dur/60} min`:(prev?`Best ${prev} pts · ${dur/60} min`:'');
  saveRun();
  show('done');
  typeset($('missed'));
}
