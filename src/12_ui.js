/* ==== 12 · UI kit ========================================================
   Screen switching and timers, text escaping, clock format, worked-solution
   HTML + KaTeX, the line chart, and the multiple-choice pieces shared by
   the mock exam and the drill.
   ======================================================================== */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fmtClock=sec=>{const r=Math.max(0,Math.floor(sec));return Math.floor(r/60)+':'+String(r%60).padStart(2,'0');};
const pct=x=>Math.round(x*100)+'%';
const whenStr=ts=>{ try{ return new Date(ts).toLocaleString(undefined,
  {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}); }catch(e){ return ''; } };

/* ---- screens: every <section> directly inside .wrap is one screen; its id is the phase name ----
   Timers are named after the screen that owns them ('play', 'exam', 'drill'): leaving that screen
   stops them, so no clock can keep ticking behind another screen. */
let phase='start';
const TIMERS={};
function every(name,fn,ms){ clearInterval(TIMERS[name]); TIMERS[name]=setInterval(fn,ms); fn(); }
function stopTimer(name){ clearInterval(TIMERS[name]); delete TIMERS[name]; }
function show(id){
  phase=id;
  Object.keys(TIMERS).forEach(k=>{ if(k!==id) stopTimer(k); });
  document.querySelectorAll('.wrap > section').forEach(s=>{ s.hidden=s.id!==id; });
  window.scrollTo(0,0);
}
/* one-shot "tap again to confirm" for destructive buttons */
function armButton(btn,armedText,restText,onConfirm){
  if(btn.dataset.armed!=='1'){
    btn.dataset.armed='1'; btn.textContent=armedText;
    clearTimeout(btn._armT); btn._armT=setTimeout(()=>{ btn.dataset.armed=''; btn.textContent=restText; },4000);
    return;
  }
  clearTimeout(btn._armT); btn.dataset.armed=''; btn.textContent=restText; onConfirm();
}

/* ---- semantic color: the same meaning in text, equations and figures ----
   Question HTML: numbers with units (and "= value") are GIVEN → <span class="gv">.
   Solution LaTeX (KaTeX macros):  \given{x} blue · \find{x} rust · \result{x} green.
     • a parenthesized number that appears in the question (or is a constant) → \given
     • the last equation of the solution: a simple left-hand symbol → \find, the final value → \result
   Generators never call these: they are applied when a question or solution is drawn. */
const UNIT_RE='J/\\(kg·K\\)|kg·m/s|N·m²/C²|kg·m²|kg/m³|m/s²|m/s|rad/s|N/kg|N/m|MeV|eV|kg|nC|°C|J|N|W|K|m²|m|s|C|°';
const GIVEN_RE=new RegExp(`(^|[\\s(⟨,=:])([−-]?\\d+(?:\\.\\d+)?(?:×10<sup>[−-]?\\d+</sup>)?)(\\s?)(${UNIT_RE})(?![A-Za-z0-9²³/])`,'g');
const EQ_GIVEN_RE=/(=\s?)([−-]?\d+(?:\.\d+)?)(?![\d.]|\s?(?:[A-Za-z°]|<))/g;
function markGivens(html){       /* question HTML carries no digits inside tags, so a plain replace is safe */
  if(!html) return html;
  return String(html)
    .replace(GIVEN_RE,(m,pre,num,sp,u)=>`${pre}<span class="gv">${num}${sp}${u}</span>`)
    .replace(EQ_GIVEN_RE,(m,eq,num)=>`${eq}<span class="gv">${num}</span>`);
}
const CONSTS=new Set(['9.8','10','4186','6.67\\times10^{-11}','9\\times10^{9}','9\\times10^9','1.6\\times10^{-19}','3\\times10^{8}','3\\times10^8','1.67\\times10^{-27}','9.11\\times10^{-31}']);
function givenNumbers(html){
  const t=String(html||'').replace(/<sup>[^<]*<\/sup>/g,'').replace(/<[^>]+>/g,' ').replace(/−/g,'-');
  return new Set((t.match(/-?\d+(?:\.\d+)?/g)||[]).map(x=>String(+x)));
}
function topEqs(t){                       /* positions of '=' outside any {…} group */
  const out=[]; let d=0;
  for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='{') d++; else if(ch==='}') d--; else if(ch==='='&&d===0) out.push(i); }
  return out;
}
const SIMPLE_LHS=/^(\\Delta\s*)?(\\[a-zA-Z]+|[A-Za-z])(\s*_\s*(\{(?:[^{}]|\{[^{}]*\})*\}|[A-Za-z0-9]))?$/;
function markFinal(t){
  const q=t.lastIndexOf('\\qquad');          /* "A=…,\qquad B=…": color the last statement */
  if(q>=0&&!/[;:]/.test(t)) return t.slice(0,q+6)+markFinal(t.slice(q+6));
  if(/[;:]|\\text\{\(/.test(t)) return t;
  const e=topEqs(t); if(!e.length) return t;
  const lhs=t.slice(0,e[0]), mid=t.slice(e[0],e[e.length-1]+1), rhs=t.slice(e[e.length-1]+1);
  if(!rhs.trim()) return t;
  return (SIMPLE_LHS.test(lhs.trim())?`\\find{${lhs}}`:lhs)+mid+`\\result{${rhs}}`;
}
function markGivenTex(t,given){
  return t.replace(/\((-?\d+(?:\.\d+)?(?:\\times10\^\{?-?\d+\}?)?)\)/g,(m,x)=>{
    const plain=/times/.test(x)?x:String(+x);
    return given.has(plain)||CONSTS.has(x)?`(\\given{${x}})`:m;
  });
}

/* ---- worked solutions, typeset with KaTeX (bundled with the page as katex/*) ---- */
function solHTML(r,open,extra){
  const given=givenNumbers((r.q||'')+(r.stem||'')+(r.group?r.group.setup:'')+(extra||''));
  const sol=r.sol||[], lastTex=sol.map(s=>!!s[1]).lastIndexOf(true);
  const lines=(t,final)=>{          /* one display line per ⇒ step, so long derivations fit narrow screens */
    const bits=t.split(/(\\quad\\Rightarrow\\quad|,\\qquad )/), out=[bits[0]];
    for(let i=1;i<bits.length;i+=2) out.push((bits[i].indexOf('Rightarrow')>=0?'\\Rightarrow\\ ':'')+bits[i+1]);
    return out.map((l,i)=>{
      let x=markGivenTex(l,given);
      if(final&&i===out.length-1){ const pre=x.startsWith('\\Rightarrow\\ ')?'\\Rightarrow\\ ':''; x=pre+markFinal(x.slice(pre.length)); }
      return `<div class="eq raw">${esc(x)}</div>`;
    }).join('');
  };
  const steps=sol.map((s,i)=>`<li>${s[0]?`<p>${s[0]}</p>`:''}${s[1]?lines(s[1],i===lastTex):''}</li>`).join('');
  return `<details class="sol"${open===false?'':' open'}><summary>Worked solution</summary>`+
         (r.how?`<p class="key">Key idea: ${r.how}</p>`:'')+`<ol class="steps">${steps}</ol></details>`;
}
const TEX_OPTS={displayMode:true,throwOnError:false,strict:'ignore',output:'html',
  macros:{'\\given':'\\htmlClass{tx-given}{#1}','\\find':'\\htmlClass{tx-find}{#1}','\\result':'\\htmlClass{tx-result}{#1}'},
  trust:ctx=>ctx.command==='\\htmlClass'};
/* Render every not-yet-rendered equation inside el. KaTeX loads with `defer`, so wait for it briefly;
   until then (or if it never loads) the raw LaTeX stays visible in small mono type. */
function typeset(el){
  let tries=0;
  const go=()=>{
    if(window.katex&&typeof window.katex.render==='function'){
      el.querySelectorAll('.eq.raw').forEach(e=>{ try{ e.innerHTML=window.katex.renderToString(e.textContent,TEX_OPTS); e.classList.remove('raw'); }catch(err){} });
    }else if(++tries<120) setTimeout(go,150);
  };
  go();
}
function clearMath(el){ el.innerHTML=''; }

/* ---- figures: one tinted, dotted panel. On wide screens it sits in the right-hand column (prefix+'aside'),
   on phones inline after the question text (prefix+'fig'); both get the same SVG. ---- */
const FIGKEY='<div class="figkey" aria-hidden="true"><span><i class="k-given"></i>Given</span><span><i class="k-find"></i>Find</span>'+
             '<span><i class="k-ok"></i>Correct</span><span><i class="k-bad"></i>✕ Revisit</span></div>';
const figPanel=(fig,label)=>`<span class="figlabel">${label}</span><figure class="figpanel">${fig}</figure>`;
function showFigure(prefix,fig,label){
  const a=$(prefix+'aside'), i=$(prefix+'fig'), html=fig?figPanel(fig,label):'';
  a.innerHTML=fig?html+FIGKEY:''; i.innerHTML=html; a.hidden=i.hidden=!fig;
  a.closest('.qgrid').classList.toggle('hasfig',!!fig);
}
const two=n=>String(n).padStart(2,'0');

/* ---- multiple choice, shared by the mock exam and the drill ---- */
const LET='ABCDE';
const setupHTML=(setup,head)=>`<div class="xset"><div class="xsethead">${head}</div>${markGivens(setup)}</div>`;
function optionButtons(box,it,chosen,onPick){
  box.innerHTML='';
  it.opts.forEach((o,k)=>{
    const b=document.createElement('button'); b.type='button'; b.className='xopt'; b.setAttribute('role','radio');
    b.setAttribute('aria-checked',chosen===k?'true':'false'); b.innerHTML=`<b>${LET[k]}</b><span>${o.h}</span>`;
    b.onclick=()=>onPick(k); box.appendChild(b);
  });
}
const whyHTML=(it,k,cls)=>k>=0&&k!==it.key&&it.opts[k]&&it.opts[k].why?`<span class="${cls||'whyno'}">Why ${LET[k]} is tempting: ${it.opts[k].why}</span>`:'';
const restartAnim=el=>{ el.classList.remove('rise'); void el.offsetWidth; el.classList.add('rise'); };

/* ---- trend charts: one measure each, never two on one pair of axes ---- */
function lineChart(vals,o){
  const W=640,H=170,padL=58,padR=18,padT=12,padB=26,n=vals.length;
  const X=i=>n<2?padL+(W-padL-padR)/2:padL+(W-padL-padR)*i/(n-1);
  const Y=v=>padT+(H-padT-padB)*(1-Math.max(0,Math.min(v,o.top))/o.top);
  let grid='';
  (o.ticks||[]).forEach(s=>{
    const y=Y(s).toFixed(1);
    grid+=`<line class="grid" x1="${padL}" x2="${W-padR}" y1="${y}" y2="${y}"/>`+
          `<text class="ax" x="${padL-8}" y="${(+y+4).toFixed(1)}" text-anchor="end">${o.fmt(s)}</text>`;
  });
  const d=vals.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const dots=vals.map((v,i)=>`<circle class="pt" cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" `+
    `r="${n>40?2:3.5}"><title>${esc(o.tip(v,i))}</title></circle>`).join('');
  const tg=o.target!=null?`<line class="target" x1="${padL}" x2="${W-padR}" `+
    `y1="${Y(o.target).toFixed(1)}" y2="${Y(o.target).toFixed(1)}"/>`:'';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria)}">`+
    `<line class="axis" x1="${padL}" x2="${W-padR}" y1="${H-padB}" y2="${H-padB}"/>${grid}${tg}`+
    `${n>1?`<path class="line" d="${d}"/>`:''}${dots}`+
    `<text class="ax" x="${padL}" y="${H-8}">oldest</text>`+
    `<text class="ax" x="${W-padR}" y="${H-8}" text-anchor="end">newest</text></svg>`;
}
