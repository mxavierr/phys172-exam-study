
/* =====================================================================
   MATH ENGINE: parse what the student types, print it as LaTeX, and
   decide whether it equals the key. Equality is tested numerically at
   random points (the WeBWorK approach), so any algebraically equal form
   is accepted: sqrt(8) = 2sqrt(2), 3pi/4, <1,2>/sqrt(5), 2i - j + k.
   ===================================================================== */
const MFN={sin:1,cos:1,tan:1,sec:1,csc:1,cot:1,arcsin:1,arccos:1,arctan:1,asin:'arcsin',acos:'arccos',atan:'arctan',
  sinh:1,cosh:1,tanh:1,ln:1,log:'ln',exp:1,sqrt:1,abs:1,cbrt:1};
const MWORDS=['arcsin','arccos','arctan','asin','acos','atan','sinh','cosh','tanh','sqrt','cbrt','sin','cos','tan','sec','csc','cot',
  'ln','log','exp','abs','theta','phi','pi','dne','none','infinity','inf'];

function mTokens(src){
  let s=String(src).replace(/[−–—]/g,'-').replace(/[×·∙⋅]/g,'*').replace(/÷/g,'/').replace(/π/g,'pi').replace(/√/g,'sqrt')
    .replace(/[⟨〈]/g,'<').replace(/[⟩〉]/g,'>').replace(/²/g,'^2').replace(/³/g,'^3').replace(/θ/g,'theta').replace(/φ/g,'phi')
    .replace(/\*\*/g,'^').replace(/\\left|\\right/g,'').replace(/\\pi/g,'pi').replace(/\\sqrt/g,'sqrt').replace(/\\cdot/g,'*')
    .replace(/[{\[]/g,'(').replace(/[}\]]/g,')');
  const out=[]; let i=0;
  while(i<s.length){
    const c=s[i];
    if(/\s/.test(c)){ i++; continue; }
    if(/[0-9.]/.test(c)){
      let j=i; while(j<s.length&&/[0-9.]/.test(s[j])) j++;
      const lit=s.slice(i,j);
      if(!/^(\d+\.?\d*|\.\d+)$/.test(lit)) throw new Error(`“${lit}” is not a number`);
      out.push({k:'num',v:parseFloat(lit),s:lit}); i=j; continue;
    }
    if(/[a-zA-Z]/.test(c)){
      let j=i; while(j<s.length&&/[a-zA-Z]/.test(s[j])) j++;
      let run=s.slice(i,j); i=j;
      while(run.length){
        const low=run.toLowerCase(); const w=MWORDS.find(w=>low.startsWith(w));
        if(w){ out.push({k:'id',v:w}); run=run.slice(w.length); continue; }
        out.push({k:'id',v:run[0]==='E'?'e':run[0].toLowerCase()}); run=run.slice(1);
      }
      continue;
    }
    if('+-*/^(),<>=|'.includes(c)){ out.push({k:'op',v:c}); i++; continue; }
    throw new Error(`I can’t read “${c}”`);
  }
  return out;
}

/* Pratt parser. Implicit multiplication binds like *, so 1/2x means (1/2)·x — the preview shows the reading. */
function mParse(src){
  const T=mTokens(src); let p=0;
  const peek=()=>T[p], next=()=>T[p++];
  const isOp=(t,v)=>t&&t.k==='op'&&t.v===v;
  const expect=v=>{ const t=next(); if(!isOp(t,v)) throw new Error(t?`Expected “${v}” near “${t.v}”`:`Missing “${v}”`); };
  const startsPrimary=t=>t&&(t.k==='num'||t.k==='id'||isOp(t,'(')||isOp(t,'<'));
  function top(){
    const items=[equation()];
    while(isOp(peek(),',')){ next(); items.push(equation()); }
    if(p<T.length) throw new Error(`Unexpected “${peek().v}”`);
    return items.length===1?items[0]:{t:'list',items};
  }
  function equation(){
    const a=sum(); if(isOp(peek(),'=')){ next(); const b=sum(); return {t:'eq',a,b}; } return a;
  }
  function sum(){
    let a=signed();
    for(;;){ const t=peek();
      if(isOp(t,'+')){ next(); a={t:'+',a,b:signed()}; }
      else if(isOp(t,'-')){ next(); a={t:'-',a,b:product()}; }
      else return a; }
  }
  function signed(){                     /* leading minus covers the whole product: -5x = -(5x) */
    if(isOp(peek(),'-')){ next(); return {t:'neg',a:signed()}; }
    if(isOp(peek(),'+')){ next(); return signed(); }
    return product();
  }
  function product(){
    let a=power();
    for(;;){ const t=peek();
      if(isOp(t,'*')){ next(); a={t:'*',a,b:unary()}; }
      else if(isOp(t,'/')){ next(); a={t:'/',a,b:unary()}; }
      else if(startsPrimary(t)&&!(isOp(t,'<')&&a.t==='vec')){ a={t:'*',a,b:power(),imp:1}; }
      else return a; }
  }
  function unary(){
    if(isOp(peek(),'-')){ next(); return {t:'neg',a:unary()}; }
    if(isOp(peek(),'+')){ next(); return unary(); }
    return power();
  }
  function power(){
    const b=primary();
    if(isOp(peek(),'^')){ next(); return {t:'^',a:b,b:isOp(peek(),'-')?(next(),{t:'neg',a:power()}):power()}; }
    return b;
  }
  function tight(){                       /* argument of sin x, ln 2t: a run of numbers/variables only */
    let a=power();
    while(peek()&&(peek().k==='num'||(peek().k==='id'&&!MFN[peek().v]))) a={t:'*',a,b:power(),imp:1};
    return a;
  }
  function primary(){
    const t=next(); if(!t) throw new Error('The answer ends too early');
    if(t.k==='num') return {t:'num',v:t.v,s:t.s};
    if(isOp(t,'(')){
      const items=[equation()];
      while(isOp(peek(),',')){ next(); items.push(equation()); }
      expect(')');
      return items.length===1?{t:'par',a:items[0]}:{t:'tuple',items};
    }
    if(isOp(t,'<')){
      const items=[sum()];
      while(isOp(peek(),',')){ next(); items.push(sum()); }
      expect('>'); return {t:'vec',items};
    }
    if(isOp(t,'|')){ const a=sum(); expect('|'); return {t:'fn',n:'abs',a}; }
    if(t.k==='id'){
      const v=t.v;
      if(MFN[v]){
        const n=MFN[v]===1?v:MFN[v];
        let pw=null;
        if(isOp(peek(),'^')){ next(); pw=isOp(peek(),'-')?(next(),{t:'neg',a:primary()}):primary(); }
        let a;
        if(isOp(peek(),'(')){ next(); a=sum(); expect(')'); }
        else { if(!startsPrimary(peek())) throw new Error(`${n} needs an input, like ${n}(x)`); a=tight(); }
        let f={t:'fn',n,a};
        if(pw){ if(pw.t==='neg'&&pw.a.t==='num'&&pw.a.v===1&&/^(sin|cos|tan)$/.test(n)) f={t:'fn',n:'arc'+n,a};
                else f={t:'^',a:f,b:pw}; }
        return f;
      }
      if(v==='pi') return {t:'const',n:'pi'};
      if(v==='e'){ return {t:'const',n:'e'}; }
      if(v==='i'||v==='j'||v==='k') return {t:'unit',n:v};
      if(v==='dne') return {t:'dne'};
      if(v==='none') return {t:'none'};
      if(v==='inf'||v==='infinity') return {t:'inf'};
      return {t:'var',n:v};
    }
    throw new Error(`Unexpected “${t.v}”`);
  }
  return strip(top());
}
function strip(n){                        /* drop grouping parens after parsing */
  if(!n||typeof n!=='object') return n;
  if(n.t==='par') return strip(n.a);
  const o={...n};
  ['a','b'].forEach(k=>{ if(o[k]) o[k]=strip(o[k]); });
  if(o.items) o.items=o.items.map(strip);
  return o;
}

/* ---- evaluation: numbers, or arrays for vectors ---- */
const MFUN={sin:Math.sin,cos:Math.cos,tan:Math.tan,sec:x=>1/Math.cos(x),csc:x=>1/Math.sin(x),cot:x=>1/Math.tan(x),
  arcsin:Math.asin,arccos:Math.acos,arctan:Math.atan,sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,ln:Math.log,exp:Math.exp,
  sqrt:Math.sqrt,abs:Math.abs,cbrt:Math.cbrt};
function mEval(n,env){
  const E=x=>mEval(x,env), isV=Array.isArray;
  switch(n.t){
    case 'num': return n.v;
    case 'const': return n.n==='pi'?Math.PI:Math.E;
    case 'var': if(!(n.n in env)) throw new Error('var:'+n.n); return env[n.n];
    case 'unit': return n.n==='i'?[1,0,0]:n.n==='j'?[0,1,0]:[0,0,1];
    case 'vec': case 'tuple': return n.items.map(x=>{ const v=E(x); if(isV(v)) throw new Error('A vector cannot sit inside a vector'); return v; });
    case 'neg': { const a=E(n.a); return isV(a)?a.map(x=>-x):-a; }
    case '+': case '-': {
      const a=E(n.a), b=E(n.b), s=n.t==='+'?1:-1;
      if(isV(a)!==isV(b)) throw new Error('Cannot add a number to a vector');
      if(isV(a)){ const L=Math.max(a.length,b.length); return Array.from({length:L},(_,i)=>(a[i]||0)+s*(b[i]||0)); }
      return a+s*b;
    }
    case '*': {
      const a=E(n.a), b=E(n.b);
      if(isV(a)&&isV(b)) throw new Error('Two vectors multiplied: use dot or cross explicitly');
      if(isV(a)) return a.map(x=>x*b); if(isV(b)) return b.map(x=>a*x); return a*b;
    }
    case '/': { const a=E(n.a), b=E(n.b); if(isV(b)) throw new Error('Cannot divide by a vector');
      return isV(a)?a.map(x=>x/b):a/b; }
    case '^': { const a=E(n.a), b=E(n.b); if(isV(a)||isV(b)) throw new Error('Cannot raise a vector to a power');
      if(a<0&&!Number.isInteger(b)){ const q=Math.round(1/b); if(Math.abs(1/b-q)<1e-12&&q%2) return -Math.pow(-a,b); }
      return Math.pow(a,b); }
    case 'fn': { const a=E(n.a); if(isV(a)) throw new Error(`${n.n} of a vector`); return MFUN[n.n](a); }
    default: throw new Error('eval '+n.t);
  }
}
function mVars(n,set){
  set=set||new Set(); if(!n||typeof n!=='object') return set;
  if(n.t==='var') set.add(n.n);
  ['a','b'].forEach(k=>n[k]&&mVars(n[k],set)); (n.items||[]).forEach(x=>mVars(x,set));
  return set;
}
function mHas(n,pred){
  if(!n||typeof n!=='object') return false; if(pred(n)) return true;
  return ['a','b'].some(k=>n[k]&&mHas(n[k],pred))||(n.items||[]).some(x=>mHas(x,pred));
}
const mHasDecimal=n=>mHas(n,x=>x.t==='num'&&x.s&&x.s.indexOf('.')>=0);

/* ---- LaTeX printer (used for the live preview, keys, options and solutions) ---- */
const MTEXN={arcsin:'\\arcsin',arccos:'\\arccos',arctan:'\\arctan',sin:'\\sin',cos:'\\cos',tan:'\\tan',sec:'\\sec',csc:'\\csc',
  cot:'\\cot',sinh:'\\sinh',cosh:'\\cosh',tanh:'\\tanh',ln:'\\ln'};
const PREC={eq:0,'+':1,'-':1,neg:2,'*':3,'/':3,'^':5};
function mTex(n){
  const P=x=>PREC[x.t]===undefined?9:PREC[x.t];
  const wrap=(x,lvl)=>P(x)<lvl?`\\left(${mTex(x)}\\right)`:mTex(x);
  switch(n.t){
    case 'num': return n.s!==undefined?n.s:String(n.v);
    case 'const': return n.n==='pi'?'\\pi':'e';
    case 'var': return n.n==='theta'?'\\theta':n.n==='phi'?'\\varphi':n.n;
    case 'unit': return `\\mathbf{${n.n}}`;
    case 'dne': return '\\text{DNE}'; case 'none': return '\\text{none}'; case 'inf': return '\\infty';
    case 'vec': return `\\left\\langle ${n.items.map(mItem).join(',\\ ')}\\right\\rangle`;
    case 'tuple': return `\\left(${n.items.map(mItem).join(',\\ ')}\\right)`;
    case 'list': return n.items.map(mTex).join(',\\quad ');
    case 'eq': return `${mTex(n.a)}=${mTex(n.b)}`;
    case '+': return n.b.t==='neg'?`${mTex(n.a)}-${wrap(n.b.a,2)}`:`${mTex(n.a)}+${mTex(n.b)}`;
    case '-': return `${mTex(n.a)}-${wrap(n.b,n.b.t==='neg'?3:2)}`;
    case 'neg': return `-${wrap(n.a,3)}`;
    case '/': return n.a.t==='neg'?`-\\frac{${mTex(n.a.a)}}{${mTex(n.b)}}`:`\\frac{${mTex(n.a)}}{${mTex(n.b)}}`;
    case '^': {
      const e=mTex(n.b);
      if(n.a.t==='fn'&&MTEXN[n.a.n]&&!/^arc/.test(n.a.n)) return `${MTEXN[n.a.n]}^{${e}}\\left(${mTex(n.a.a)}\\right)`;
      if(n.a.t==='const'&&n.a.n==='e') return `e^{${e}}`;
      const base=(n.a.t==='var'||n.a.t==='const'||(n.a.t==='num'&&n.a.v>=0)||n.a.t==='vec')?mTex(n.a):`\\left(${mTex(n.a)}\\right)`;
      return `${base}^{${e}}`;
    }
    case '*': {
      const a=wrap(n.a,3), b=wrap(n.b,3.5);
      const lead=x=>{ while(x&&(x.t==='*'||x.t==='^')) x=x.a; return x; };
      const bl=lead(n.b), al=n.a;
      const numLike=x=>x&&(x.t==='num'||(x.t==='/'&&x.a.t==='num'));
      const dot=numLike(bl)||(n.b.t==='neg')||(al.t==='vec'&&n.b.t==='vec')||(n.b.t==='/'&&!numLike(al));
      return dot?`${a}\\cdot ${b}`:`${a}${/^[a-zA-Z0-9]/.test(b)&&/[a-zA-Z]$/.test(a)&&!/\\[a-zA-Z]+$/.test(a)?'':(/\\[a-zA-Z]+$/.test(a)?'\\,':'')}${b}`;
    }
    case 'fn': {
      if(n.n==='sqrt') return `\\sqrt{${mTex(n.a)}}`;
      if(n.n==='cbrt') return `\\sqrt[3]{${mTex(n.a)}}`;
      if(n.n==='abs') return `\\left|${mTex(n.a)}\\right|`;
      if(n.n==='exp') return `e^{${mTex(n.a)}}`;
      const simple=n.a.t==='var'||n.a.t==='num'||(n.a.t==='*'&&n.a.imp&&n.a.a.t==='num'&&n.a.b.t==='var');
      return simple&&n.n!=='ln'?`${MTEXN[n.n]} ${mTex(n.a)}`:`${MTEXN[n.n]}\\left(${mTex(n.a)}\\right)`;
    }
  }
  return '?';
}
const tex=s=>mTex(mParse(s));
function mItem(x){ const t=mTex(x); return t[0]==='-'?'{'+t+'}':t; }   /* keeps a leading minus unary after a comma */          /* key string → LaTeX */

/* ---- sympy form, used by the test harness to check keys independently ---- */
function mPy(n){
  const W=x=>`(${mPy(x)})`;
  switch(n.t){
    case 'num': return n.s!==undefined?(n.s.indexOf('.')>=0?`Rational('${n.s}')`:n.s):String(n.v);
    case 'const': return n.n==='pi'?'pi':'E';
    case 'var': return n.n; case 'unit': return {i:'Matrix([1,0,0])',j:'Matrix([0,1,0])',k:'Matrix([0,0,1])'}[n.n];
    case 'dne': return "'DNE'"; case 'none': return "'NONE'"; case 'inf': return 'oo';
    case 'vec': case 'tuple': return `Matrix([${n.items.map(mPy).join(', ')}])`;
    case 'list': return `[${n.items.map(mPy).join(', ')}]`;
    case 'eq': return `Eq(${mPy(n.a)}, ${mPy(n.b)})`;
    case '+': return `${W(n.a)}+${W(n.b)}`; case '-': return `${W(n.a)}-${W(n.b)}`;
    case 'neg': return `-${W(n.a)}`; case '*': return `${W(n.a)}*${W(n.b)}`; case '/': return `${W(n.a)}/${W(n.b)}`;
    case '^': return `${W(n.a)}**${W(n.b)}`;
    case 'fn': return `${{arcsin:'asin',arccos:'acos',arctan:'atan',ln:'log',abs:'Abs',cbrt:'cbrt'}[n.n]||n.n}(${mPy(n.a)})`;
  }
  return '?';
}

/* =====================================================================
   GRADING. kinds: expr · vec · point · points · eq · line · curve · choice
   returns {ok, msg?, retry?}: retry = not counted, ask again (unreadable,
   wrong shape, or a decimal approximation of an exact answer).
   ===================================================================== */
const MOK=(u,k,tol)=>Number.isFinite(u)&&Math.abs(u-k)<=(tol||1e-9)*Math.max(1,Math.abs(k));
function mSamples(vars,n,range){
  const out=[]; const [lo,hi]=range||[0.35,1.85];
  for(let i=0;i<n;i++){ const e={}; vars.forEach((v,j)=>{ e[v]=lo+(hi-lo)*((Math.sin(12.9898*(i+1)*(j+3)+78.233*j)*43758.5453)%1+1)%1; }); out.push(e); }
  return out;
}
const asVec=v=>Array.isArray(v)?v:null;
function vecClose(u,k,tol){
  if(!Array.isArray(u)||!Array.isArray(k)) return false;
  const L=Math.max(u.length,k.length);
  for(let i=0;i<L;i++) if(!MOK(u[i]||0,k[i]||0,tol)) return false;
  return true;
}
/* compare two already-parsed nodes of the same kind at sample points */
function sameValue(U,Kn,kind,vars,range,tol){
  const S=mSamples(vars,10,range); let used=0;
  for(const env of S){
    let k,u;
    try{ k=mEval(Kn,env); }catch(e){ continue; }
    if(Array.isArray(k)?k.some(x=>!Number.isFinite(x)):!Number.isFinite(k)) continue;
    try{ u=mEval(U,env); }catch(e){ return false; }
    if(kind==='expr'){ if(Array.isArray(u)||!MOK(u,k,tol)) return false; }
    else if(!vecClose(asVec(u),k,tol)) return false;
    used++;
  }
  return used>=3;
}
function eqProportional(U,Kn,vars,tol){
  const G=n=>({t:'-',a:n.a,b:n.b});
  const gu=G(U), gk=G(Kn); let ratio=null, used=0;
  const S=mSamples(vars,12,[-1.7,2.3]);
  for(const env of S){
    let k,u; try{ k=mEval(gk,env); u=mEval(gu,env); }catch(e){ return false; }
    if(Array.isArray(u)||Array.isArray(k)) return false;
    if(!Number.isFinite(k)||Math.abs(k)<1e-6){ continue; }
    if(!Number.isFinite(u)) return false;
    const r=u/k; if(Math.abs(r)<1e-9) return false;
    if(ratio===null) ratio=r; else if(!MOK(r,ratio,tol||1e-7)) return false;
    used++;
  }
  return used>=5;
}

/* same zero set: along fixed random lines, both equations must vanish at the same places.
   Catches equivalent forms that are not constant multiples (y/x = 2 vs y = 2x). */
function eqZeroSet(U,Kn,vars){
  const G=n=>({t:'-',a:n.a,b:n.b}), gu=G(U), gk=G(Kn);
  const f=(g,env)=>{ try{ const v=mEval(g,env); return Array.isArray(v)?NaN:v; }catch(e){ return NaN; } };
  let lines=0, hits=0;
  for(let L=0;L<8;L++){
    const p0={}, d={}; vars.forEach((v,j)=>{ p0[v]=-1.3+0.37*L+0.21*j*j; d[v]=Math.cos(1.7*L+2.3*j+0.4); });
    const at=(g,s)=>{ const e={}; vars.forEach(v=>e[v]=p0[v]+s*d[v]); return f(g,e); };
    const roots=g=>{ const out=[]; let ps=-4, pv=at(g,ps);
      for(let i=1;i<=800;i++){ const s=-4+i*0.01, v=at(g,s);
        if(Number.isFinite(pv)&&Number.isFinite(v)&&pv*v<0){ let a=ps,b=s,fa=pv; for(let k=0;k<60;k++){ const c=(a+b)/2, fc=at(g,c); if(fa*fc<=0) b=c; else {a=c; fa=fc;} }
          const r=(a+b)/2; if(Math.abs(at(g,r))<1e-6) out.push(r); }   /* a sign change at a pole is not a root */
        else if(v===0) out.push(s);
        ps=s; pv=v; }
      return out; };
    const rk=roots(gk), ru=roots(gu);
    if(rk.length!==ru.length) return false;
    for(let i=0;i<rk.length;i++) if(Math.abs(rk[i]-ru[i])>1e-6) return false;
    lines++; hits+=rk.length;
  }
  return hits>=3;
}
function crossLen(a,b){ const A=[a[0]||0,a[1]||0,a[2]||0],B=[b[0]||0,b[1]||0,b[2]||0];
  return Math.hypot(A[1]*B[2]-A[2]*B[1],A[2]*B[0]-A[0]*B[2],A[0]*B[1]-A[1]*B[0]); }

const KIND_HINT={
  expr:'an exact expression', vec:'a vector like <1, -2, sqrt(3)> or 2i - j + k', point:'a point like (1, -2, 3)',
  points:'points separated by commas, like (0,0), (1,-1); or none', eq:'an equation, like 2x - y + 3z = 7',
  line:'a vector function of t, like <1+2t, -t, 3+4t>', curve:'a vector function of t that traces the curve'
};
function gradeInput(raw,Q){
  const src=String(raw||'').trim();
  if(!src) return {ok:false,empty:true};
  let U; try{ U=mParse(src); }catch(e){ return {ok:false,retry:true,msg:e.message+'.'}; }
  const kind=Q.kind||'expr', vars=Q.vars||[];
  /* variables the student used must belong to the problem */
  const used=[...mVars(U)];
  const allowed=kind==='line'||kind==='curve'?null:new Set(kind==='eq'?(Q.eqVars||['x','y','z']):vars);
  if(allowed){ const bad=used.filter(v=>!allowed.has(v)), av=[...allowed];
    if(bad.length) return {ok:false,retry:true,msg:av.length?`Your answer uses ${bad.join(', ')}, but this problem’s variables are ${av.join(', ')}.`
                                                               :`Your answer uses ${bad.join(', ')}, but the answer is a number.`}; }
  const keys=[Q.ans].concat(Q.alts||[]);
  const res=matchAny(U,keys,Q,kind,vars);
  if(res===true) return {ok:true};
  if(res&&res.retry) return res;
  /* a decimal that is close but not exact: ask for the exact form instead of marking it wrong */
  if(mHasDecimal(U)&&matchAny(U,keys,Q,kind,vars,3e-3)===true)
    return {ok:false,retry:true,msg:'That is a decimal approximation. Enter the exact value, e.g. sqrt(14)/7 or 3pi/4.'};
  return {ok:false};
}
function matchAny(U,keys,Q,kind,vars,tol){
  for(const key of keys){
    const Kn=mParse(key);
    const r=matchOne(U,Kn,Q,kind,vars,tol);
    if(r===true||(r&&r.retry)) return r;
  }
  return false;
}
function matchOne(U,Kn,Q,kind,vars,tol){
  if(Kn.t==='dne'||Kn.t==='none') return U.t===Kn.t||(Kn.t==='none'&&U.t==='dne');
  if(U.t==='dne'||U.t==='none') return false;
  if(kind==='expr'){
    if(U.t==='eq'||U.t==='list'||U.t==='tuple'||U.t==='vec') return {retry:true,msg:'Enter a single expression, not a list, vector or equation.'};
    return sameValue(U,Kn,'expr',vars,Q.range,tol);
  }
  if(kind==='vec'||kind==='point'){
    if(U.t==='eq'||U.t==='list') return {retry:true,msg:`Enter ${KIND_HINT[kind]}.`};
    let probe; try{ probe=mEval(U,mSamples(vars,1,Q.range)[0]); }catch(e){ return false; }
    if(!Array.isArray(probe)) return {retry:true,msg:`That is a number. Enter ${KIND_HINT[kind]}.`};
    return sameValue(U,Kn,'vec',vars,Q.range,tol);
  }
  if(kind==='points'){
    const Ku=Kn.t==='list'?Kn.items:[Kn], Uu=U.t==='list'?U.items:[U];
    if(Uu.some(x=>x.t!=='tuple'&&x.t!=='vec')) return {retry:true,msg:'Enter points in parentheses, like (1, 2), (0, -1).'};
    if(Uu.length!==Ku.length) return false;
    const left=Ku.map(k=>mEval(k,{}));
    for(const u of Uu){ const v=mEval(u,{}); const i=left.findIndex(k=>k&&vecClose(v,k,tol)); if(i<0) return false; left[i]=null; }
    return true;
  }
  if(kind==='eq'){
    if(U.t!=='eq') return {retry:true,msg:'Enter an equation with an equals sign, like 2x - y + 3z = 7.'};
    const ev_=Q.eqVars||['x','y','z'];
    return eqProportional(U,Kn,ev_,tol)||(!tol&&eqZeroSet(U,Kn,ev_));
  }
  if(kind==='line'){                                    /* key: {p:[..], d:[..]} given as Q.line */
    const L=Q.line, uv=[...mVars(U)];
    if(U.t==='eq') return {retry:true,msg:'Enter the line as a vector function, like <1+2t, -t, 3+4t>.'};
    if(uv.length!==1) return {retry:true,msg:'Use one parameter, like t: <1+2t, -t, 3+4t>.'};
    const tv=uv[0], pts=[0,1,-0.7,2.3].map(t=>{ try{ return mEval(U,{[tv]:t}); }catch(e){ return null; } });
    if(pts.some(p=>!Array.isArray(p))) return {retry:true,msg:'Enter a vector function of t.'};
    const d=L.d, dn=Math.hypot(...d);
    for(const p of pts){ const w=L.p.map((x,i)=>(p[i]||0)-x); if(crossLen(w,d)/dn>1e-7*Math.max(1,Math.hypot(...w))) return false;
      if(p.length>L.p.length&&p.slice(L.p.length).some(x=>Math.abs(x)>1e-9)) return false; }
    return Math.hypot(...pts[1].map((x,i)=>x-pts[0][i]))>1e-9;
  }
  if(kind==='curve'){                                   /* Q.surf = equations the curve must satisfy */
    const uv=[...mVars(U)];
    if(uv.length!==1) return {retry:true,msg:'Use one parameter, like t.'};
    const tv=uv[0], fs=Q.surf.map(s=>{ const e=mParse(s); return {t:'-',a:e.a,b:e.b}; });
    const ts=[0.3,0.9,1.7,2.6,4.1,5.5]; let pts=[];
    for(const t of ts){ let p; try{ p=mEval(U,{[tv]:t}); }catch(e){ return false; }
      if(!Array.isArray(p)||p.length!==3||p.some(x=>!Number.isFinite(x))) return false;
      const env={x:p[0],y:p[1],z:p[2]};
      if(fs.some(f=>Math.abs(mEval(f,env))>1e-7*Math.max(1,Math.hypot(...p)**2))) return false; pts.push(p); }
    return pts.some(p=>Math.hypot(...p.map((x,i)=>x-pts[0][i]))>1e-6);
  }
  return false;
}
/* true when a typed answer lands on one of the generator's known traps */
function trapFor(raw,Q){
  if(!Q.dis) return null;
  let U; try{ U=mParse(raw); }catch(e){ return null; }
  const kind=Q.kind||'expr';
  for(const d of Q.dis){ if(!d.a||d.a==='NOTA') continue;
    try{
      const D=mParse(d.a);
      if(kind==='line'){                       /* a trap line: same geometric line as the distractor */
        const dv=[...mVars(D)][0]||'t', p0=mEval(D,{[dv]:0}), p1=mEval(D,{[dv]:1}), dir=p1.map((x,i)=>x-p0[i]);
        if(Math.hypot(...dir)>1e-12&&matchOne(U,D,{...Q,line:{p:p0,d:dir}},'line',[])===true) return d;
      } else if(kind==='curve'){               /* same parametrization, whatever the parameter is called */
        const uv=[...mVars(U)][0], dv=[...mVars(D)][0]||'t';
        if(uv&&[0.3,1.1,2.4].every(s=>vecClose(mEval(U,{[uv]:s}),mEval(D,{[dv]:s})))) return d;
      } else if(matchOne(U,D,Q,kind,Q.vars||[])===true) return d;
    }catch(e){} }
  return null;
}

/* =====================================================================
   exact-number helpers for writing keys
   ===================================================================== */
const gcd=(a,b)=>{ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a; };
function frac(p,q){ q=q===undefined?1:q; if(q<0){p=-p;q=-q;} const g=gcd(p,q)||1; p/=g; q/=g; return q===1?`${p}`:`${p}/${q}`; }
function sqf(n){ let a=1,b=n; for(let f=2;f*f<=b;f++) while(b%(f*f)===0){ b/=f*f; a*=f; } return [a,b]; }
/* (p/q)·√n, simplified: surd(3,4,8) → "3sqrt(2)/2" */
function surd(p,q,n){
  if(p===0) return '0';
  const [a,b]=sqf(n); p*=a; if(q<0){p=-p;q=-q;} const g=gcd(p,q)||1; p/=g; q/=g;
  if(b===1) return frac(p,q);
  const s=p<0?'-':'', P=Math.abs(p), R=`sqrt(${b})`;
  return `${s}${P===1?'':P}${R}${q===1?'':'/'+q}`;
}
const rsq=(k,n)=>surd(k,n,n);                 /* k/√n rationalized */
const sqrtS=n=>surd(1,1,n);                   /* √n simplified */
/* a vector's key: rationals as-is */
const V=(...c)=>`<${c.join(', ')}>`;
const P3=(...c)=>`(${c.join(', ')})`;
/* monomial c·x^a·y^b… in input syntax (for keys built from polynomial rules) */
function mono(c,pw){
  if(c===0||c==='0') return '0';
  const body=Object.keys(pw).filter(v=>pw[v]!==0).map(v=>pw[v]===1?v:`${v}^${pw[v]<0?'('+pw[v]+')':pw[v]}`).join('*');
  if(!body) return String(c);
  const cs=typeof c==='string'?c:(c===1?'':c===-1?'-':String(c));
  return cs===''?body:cs==='-'?'-'+body:`${cs}*${body}`;
}
function sumS(terms){                         /* joins terms, dropping zeros */
  const t=terms.filter(s=>s!=='0'&&s!==''&&s!==0);
  if(!t.length) return '0';
  return t.map((s,i)=>i===0?String(s):(String(s)[0]==='-'?' - '+String(s).slice(1):' + '+s)).join('');
}
const dotA=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const crossA=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const n2=a=>dotA(a,a);
const subA=(a,b)=>a.map((x,i)=>x-b[i]), addA=(a,b)=>a.map((x,i)=>x+b[i]), mulA=(k,a)=>a.map(x=>k*x);
const vint=a=>V(...a);

/* ---- generator conveniences ---- */
const mk=s=>'\\('+tex(s)+'\\)';                 /* key string → inline math */
const vt=a=>tex(V(...a));                        /* int vector → LaTeX */
const ptx=a=>tex(P3(...a));                      /* int point → LaTeX */
function rv(n,lo,hi,noZero){ for(;;){ const a=Array.from({length:n},()=>noZero?nz(lo,hi):ri(lo,hi)); if(a.some(x=>x!==0)) return a; } }
function toFrac(x,maxDen){                      /* exact rational for a float, or null */
  maxDen=maxDen||5000; if(!Number.isFinite(x)) return null;
  for(let q=1;q<=maxDen;q++){ const p=Math.round(x*q); if(Math.abs(p/q-x)<1e-10*Math.max(1,Math.abs(x))) return frac(p,q); }
  return null;
}
function decS(p,q){                              /* p/q as a terminating decimal string, else fraction */
  const f=frac(p,q), d=+f.split('/')[1]||1; let k=d; while(k%2===0)k/=2; while(k%5===0)k/=5;
  if(k!==1) return f; const s=String(+((p/q).toFixed(10))); return s;
}
/* x0 + d·t, printed tidily */
const lin=(x0,d,v)=>sumS([x0===0?'0':String(x0),mono(d,{[v||'t']:1})]);
const lineKey=(p,d,v)=>V(...p.map((x,i)=>lin(x,d[i],v)));
function reduceInt(a){ const g=a.reduce((s,x)=>gcd(s,x),0)||1; return a.map(x=>x/g); }
/* plane n·r = d with integer n, reduced, first nonzero coefficient positive */
function planeKey(n,d){
  let a=n.concat([d]); a=reduceInt(a); const f=a.find(x=>x!==0); if(f<0) a=a.map(x=>-x);
  return `${sumS([mono(a[0],{x:1}),mono(a[1],{y:1}),mono(a[2],{z:1})])} = ${a[3]}`;
}
const fmtC=c=>c<0?`(${c})`:String(c);           /* number inside a product */
const shift=(v,c)=>c===0?v:c<0?`${v} + ${-c}`:`${v} - ${c}`;   /* x − c, tidy sign */
const mp=a=>'\\('+ptx(a)+'\\)';                /* point, inline math */
