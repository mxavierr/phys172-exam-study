
/* =====================================================================
   MOCK EXAM 1 · question templates derived from the 2015–2025 archive.
   Every template names its archive sources; numbers and set-ups change
   on every draw. Tags follow the pattern model's taxonomy.
   ===================================================================== */
const XTAGS={
  LAGR:{name:'Lagrange multipliers',sec:'15.8',ch:15,drill:['Lagrange multipliers']},
  DREV:{name:'Order of integration',sec:'16.2',ch:16,drill:['Order of integration']},
  DBL:{name:'Double integrals: regions, volume, average',sec:'16.1–16.2',ch:16,drill:['Double integrals']},
  POLAR:{name:'Double integrals in polar',sec:'16.3',ch:16,drill:['Polar coordinates']},
  TRI:{name:'Triple integrals: set-up & order',sec:'16.4',ch:16,drill:['Triple integrals']},
  CYL:{name:'Cylindrical coordinates',sec:'16.5',ch:16,drill:['Cylindrical coordinates']},
  SPH:{name:'Spherical coordinates',sec:'16.5',ch:16,drill:['Spherical coordinates']},
  MASS:{name:'Mass & center of mass',sec:'16.6',ch:16,drill:['Mass & center of mass']},
  VF:{name:'Vector fields & gradient fields',sec:'17.1',ch:17,drill:['Vector fields']},
  LINES:{name:'Scalar line integrals',sec:'17.2',ch:17,drill:['Line integrals']},
  WORK:{name:'Work, circulation & flux',sec:'17.2',ch:17,drill:['Line integrals']},
  CONS:{name:'Conservative fields & potentials',sec:'17.3',ch:17,drill:['Conservative fields']},
  GREEN:{name:'Green’s Theorem',sec:'17.4',ch:17,drill:['Green’s Theorem']},
  DIVC:{name:'Divergence & curl',sec:'17.5',ch:17,drill:['Divergence & curl']},
  SURF:{name:'Surface area & surface integrals',sec:'17.6',ch:17,drill:['Surface integrals']}
};
const XTAG_ORDER=Object.keys(XTAGS);
const XGEN=[], XOPT=6;
/* w = weight inside its tag (★ templates from the pattern model get more) */
const addX=(id,tag,w,src,fn)=>XGEN.push({id,tag,w,src,fn});

/* XOPT options (six, A–F, like the Fall 2026 exams): the key plus distinct traps. key/dis items are {a: key-syntax string} or {h: html}.
   cfg.kind/vars/line decide equivalence for syntax items; html items compare by text. */
function xm(key,dis,cfg){
  cfg=cfg||{};
  const kind=cfg.kind||'expr', Q={kind,vars:cfg.vars||[],eqVars:cfg.eqVars,line:cfg.line,surf:cfg.surf,range:cfg.range};
  const H=o=>o.h||(cfg.fmt?cfg.fmt(o.a):mk(o.a));
  let K=null; if(key.a){ try{ K=mParse(key.a); }catch(e){ return null; } }
  const out=[{h:H(key),ok:true,why:'',a:key.a||null}], nodes=[];
  const eqv=(A,B)=>{ try{ return matchOne(A,B,Q,kind,Q.vars)===true; }catch(e){ return false; } };
  for(const d of shuf(dis)){
    if(!d||(!d.a&&!d.h)) continue;
    const h=H(d); if(out.some(o=>o.h===h)) continue;
    if(d.a&&K){
      let D; try{ D=mParse(d.a); mTex(D); }catch(e){ continue; }
      if(kind==='expr'&&D.t!=='dne'){ let v; try{ const env={}; Q.vars.forEach(x=>env[x]=1.13); v=mEval(D,env); }catch(e){ v=NaN; }
        if(typeof v!=='number'||!Number.isFinite(v)) continue; }
      if(eqv(D,K)||(kind!=='line'&&kind!=='curve'&&eqv(K,D))) continue;
      if(kind!=='line'&&kind!=='curve'&&nodes.some(n=>eqv(D,n))) continue;
      nodes.push(D);
    }
    out.push({h,ok:false,why:d.why||'',a:d.a||null});
    if(out.length===XOPT) break;
  }
  return out.length===XOPT?out:null;
}
/* a question record: stem, 5 options, solution; `ans`/`kind` feed the independent checker */
function xq(stem,opts,o){ if(!opts) return null; return Object.assign({stem,opts,ans:opts[0].a||opts[0].h},o); }
const xnum=v=>({a:String(v)});
const T3=(v)=>`\\left(${v.join(',\\ ')}\\right)`;
const pn=(n,c)=>`${sumS([mono(n[0],{x:1}),mono(n[1],{y:1}),mono(n[2],{z:1})])} = ${c}`;   /* plane text from normal, const */
const lineTex=(p,d)=>X`\left\langle ${p.map(x=>x<0?`{${x}}`:x).join(',\ ')}\right\rangle+t\left\langle ${d.map(x=>x<0?`{${x}}`:x).join(',\ ')}\right\rangle`;
const lineOpt=(p,d,why)=>({a:lineKey(p,d),h:'\\('+lineTex(p,d)+'\\)',why});
/* exact rationals [p,q] */
const Rr=(p,q)=>{ q=q||1; if(q<0){p=-p;q=-q;} const g=gcd(p,q)||1; return [p/g,q/g]; };
const Radd=(a,b)=>Rr(a[0]*b[1]+b[0]*a[1],a[1]*b[1]), Rmul=(a,b)=>Rr(a[0]*b[0],a[1]*b[1]), Rneg=a=>[-a[0],a[1]];
const Rs=a=>frac(a[0],a[1]);
/* a builder's problem → a mock-exam question (key first, then five traps) */
const xFrom=o=>{ if(!o) return null;
  if(o.kind==='choice'){ const k=o.opts.find(x=>x.ok); return xq(o.q,xm({h:k.h},o.opts.filter(x=>!x.ok).map(x=>({h:x.h,why:x.why}))),{kind:'choice',lv:o.lv,how:o.how,sol:o.sol,chk:o.chk}); }
  return xq(o.q,xm({a:o.ans},o.dis,{kind:o.kind,vars:o.vars||[]}),{kind:o.kind,vars:o.vars,lv:o.lv,how:o.how,sol:o.sol,chk:o.chk}); };
