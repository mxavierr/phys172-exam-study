
/* =====================================================================
   MOCK EXAM 1 · question templates derived from the 2015–2025 archive.
   Every template names its archive sources; numbers and set-ups change
   on every draw. Tags follow the pattern model's taxonomy.
   ===================================================================== */
const XTAGS={
  QUAD:{name:'Quadric surfaces',sec:'13.6',ch:13,drill:['Quadric surfaces']},
  LINE:{name:'Lines (with planes)',sec:'13.5',ch:13,drill:['Lines','Planes']},
  PLANE:{name:'Planes',sec:'13.5',ch:13,drill:['Planes']},
  VEC:{name:'Vectors: dot, cross, projection',sec:'13.1–13.4',ch:13,drill:['Vectors','Dot product','Cross product']},
  VF:{name:'Vector functions',sec:'14.1–14.2',ch:14,drill:['Vector functions','Derivatives of r(t)','Integrals of r(t)']},
  TAN:{name:'Tangent lines to curves',sec:'14.2',ch:14,drill:['Derivatives of r(t)']},
  MOT:{name:'Motion: a → v → r',sec:'14.3',ch:14,drill:['Motion']},
  ARC:{name:'Arc length & speed',sec:'14.4',ch:14,drill:['Arc length']},
  CURV:{name:'Curvature',sec:'14.5',ch:14,drill:['Curvature']},
  LVL:{name:'Level curves & domains',sec:'15.1',ch:15,drill:['Domains & level curves']},
  LIM:{name:'Limits & continuity',sec:'15.2',ch:15,drill:['Limits']},
  PD:{name:'Partial derivatives',sec:'15.3',ch:15,drill:['Partial derivatives']},
  CHAIN:{name:'Chain rule',sec:'15.4',ch:15,drill:['Chain rule']},
  IMPL:{name:'Implicit differentiation',sec:'15.4',ch:15,drill:['Chain rule']},
  DD:{name:'Gradient & directional derivatives',sec:'15.5',ch:15,drill:['Gradient']},
  TP:{name:'Tangent planes & linear approximation',sec:'15.6',ch:15,drill:['Tangent planes']},
  CRIT:{name:'Critical points & second-derivative test',sec:'15.7',ch:15,drill:['Max & min']},
  ABS:{name:'Absolute extrema on a region',sec:'15.7',ch:15,drill:['Max & min']}
};
const XTAG_ORDER=Object.keys(XTAGS);
const XGEN=[];
/* w = weight inside its tag (★ templates from the pattern model get more) */
const addX=(id,tag,w,src,fn)=>XGEN.push({id,tag,w,src,fn});

/* five options: the key plus four distinct traps. key/dis items are {a: key-syntax string} or {h: html}.
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
    if(out.length===5) break;
  }
  return out.length===5?out:null;
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
