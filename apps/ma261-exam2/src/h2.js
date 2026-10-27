
/* =====================================================================
   EXAM 2 CONTENT HELPERS (15.8, 16.1–16.6, 17.1–17.6)
   Problem builders return one shape that serves the sprint (typed or
   choice) and the mock exam (xFrom → six options):
     {q, kind:'expr'|'choice', ans, dis:[{a,why}] | opts:[{h,ok,why}], how, sol:[[text,LaTeX]], chk, lv}
   chk is re-solved independently by tests/ma261e2_check.py (sympy): every
   integral is recomputed from its raw set-up, never from the closed form.
     {op:'int', f, lim:[[v,lo,hi] … innermost first]}         iterated integral
     {op:'pick', ref:spec, opts:[spec…]}                      option 0 equals ref, the rest do not
     {op:'lagr', f, g, c, vars, want:'max'|'min'|'range'}     Lagrange extreme values
     {op:'ls', f, r:[…], t:[a,b]}  {op:'lv', F, r, t}  {op:'fluxc', F:[P,Q], r:[x,y], t}
     {op:'surf', f, r:[x,y,z](u,v), lim:[[u,a,b],[v,c,d]]}   {op:'ratio', num:spec, den:spec}
     {op:'sum', of:[spec…]}  {op:'curl'|'div'|'lap'|'grad', F|f, at?}  {op:'pot', F, phi}  {op:'val', e}
   All expressions are written in the page's input syntax and converted with mPy.
   ===================================================================== */
const PI='pi';
const parseR=s=>{ const a=String(s).split('/'); return [+a[0],a[1]?+a[1]:1]; };
const toR=x=>{ const f=toFrac(x,2000); return f===null?null:parseR(f); };
/* r·body with r rational [p,q]: term([3,4],'pi') → "3pi/4", term([-1,2],'(e^4 - 1)') → "-(e^4 - 1)/2" */
function term(r,body){
  r=Rr(r[0],r[1]||1); const [p,q]=r; if(p===0) return '0';
  if(!body||body==='1') return frac(p,q);
  const s=p<0?'-':'', P=Math.abs(p), num=P===1?body:`${P}${/^[a-z(]/.test(body)?'':'*'}${body}`;
  return q===1?s+num:`${s}${num}/${q}`;
}
const tm=(p,q,body)=>term([p,q||1],body);
/* exact-value check that a key string is a finite number (generators return null otherwise) */
const val=s=>{ try{ return mEval(mParse(s),{}); }catch(e){ return NaN; } };
const fin=(...ss)=>ss.every(s=>Number.isFinite(val(s)));
/* LaTeX of a key string, and of a limit given in input syntax */
const T=s=>tex(String(s));
/* \int_{a}^{b}… outer → inner: lims [[lo,hi],…] as LaTeX strings; d = "dz\\,dy\\,dx" */
function itex(lims,f,d){ return '\\displaystyle'+lims.map(([a,b])=>`\\int_{${a}}^{${b}}`).join('\\!')+`${f}\\,${d}`; }
const I=(lims,f,d)=>'\\('+itex(lims,f,d)+'\\)';
const dd=(...v)=>v.map(x=>'d'+(x==='th'?'\\theta':x==='ph'?'\\varphi':x==='rho'?'\\rho':x)).join('\\,');
/* check specs */
const CI=(f,lim)=>({op:'int',f,lim});
/* the exam's "which one …" options: key first, every other option needs its own why */
/* an option may carry s = its own check spec (an integral, a field …) so pruning never misaligns the checker */
const OK=(h,s)=>({h,ok:true,why:'',s}), NO=(h,why,s)=>({h,ok:false,why,s});
/* key + at most five distractors (the exam shows six choices); ref = the spec the key must equal (undefined: no math check) */
function choiceQ(q,opts,how,sol,ref,lv){
  const seen=new Set([opts[0].h]), rest=[];
  for(const o of shuf(opts.slice(1))){ if(seen.has(o.h)) continue; seen.add(o.h); rest.push(o); if(rest.length===5) break; }
  const kept=[opts[0]].concat(rest);
  return {q,kind:'choice',opts:kept,ans:opts[0].h,how,sol,lv:lv||2,
    chk:ref===undefined?{op:'none'}:{op:'pick',ref,opts:kept.map(o=>o.s===undefined?null:o.s)}};
}
/* a value problem */
/* display tidy: "2/3*((e - 1)/2)" → "(e - 1)/3", "4pi/3*(e^8 - 1)" → "4pi(e^8 - 1)/3". Only a coefficient times ONE
   balanced group is rewritten, and only if the value is unchanged (grading is numeric, so this is cosmetic). */
function oneGroup(r){ if(/^[a-z]+\(/.test(r)||r[0]==='('){ let d=0,i=r.indexOf('('); for(;i<r.length;i++){ if(r[i]==='(')d++; else if(r[i]===')'){ d--; if(d===0) break; } } return i===r.length-1; }
  return /^(e\^\(?[\w.\/]+\)?|sqrt\(\d+\)|[a-z])$/.test(r); }
function tidy(s){
  if(typeof s!=='string') return s;
  let m=/^(-?)(\d+)(?:\/(\d+))?\*(.+)$/.exec(s), out=null;
  if(m&&oneGroup(m[4])){ let body=m[4], r=Rr((m[1]?-1:1)*+m[2],+(m[3]||1));
    if(body[0]==='('&&oneGroup(body)) body=body.slice(1,-1);                 /* drop the outer parentheses */
    const inner=/^(.+)\/(\d+)$/.exec(body);
    if(inner&&oneGroup(inner[1])){ r=Rmul(r,[1,+inner[2]]); body=inner[1]; }
    if(!oneGroup(body)) body='('+body+')';
    out=term(r,body); }
  m=/^(-?)(\d*)pi(?:\/(\d+))?\*(\(.+\))$/.exec(s);
  if(!out&&m&&oneGroup(m[4])) out=term([(m[1]?-1:1)*(+m[2]||1),+(m[3]||1)],'pi'+m[4]);
  if(!out) out=s;
  out=out.replace(/e\^\(?1\)?(?![\d.\/])/g,'e');
  if(out===s) return s;
  const a=val(s), b=val(out);
  return Number.isFinite(a)&&Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a))?out:s;
}
/* dis items: {a: key string, why} or {h: html, why} (an html-only trap shows in the exam and the diagnostic, never as a typed match) */
const valQ=(q,ans,dis,how,sol,chk,lv,extra)=>{ const a0=ans; ans=tidy(ans);
  if(a0!==ans){ const t0=T(a0), t1=T(ans); sol=(sol||[]).map(([x,l])=>[x,typeof l==='string'?l.split(t0).join(t1):l]); }
  return Object.assign({q,kind:'expr',ans,vars:[],dis:dis.filter(d=>d&&(d.a||d.h)).map(d=>d.a?{a:tidy(d.a),why:d.why}:d).filter(d=>d.a!==ans),how,sol,chk,lv:lv||2},extra||{}); };
const H_=(h,why)=>({h,why});
const D_=(a,why)=>({a,why});
/* small numbers */
const sq=x=>x*x, cube=x=>x*x*x;
const gcd3=(a,b,c)=>gcd(gcd(a,b),c);
/* angle tables used across polar / cylindrical / spherical problems: name, LaTeX, sin, cos as key strings */
const ANG={
  0:{t:'0',s:'0',c:'1',k:'0'}, 'pi/6':{t:'\\frac{\\pi}{6}',s:'1/2',c:'sqrt(3)/2',k:'pi/6'}, 'pi/4':{t:'\\frac{\\pi}{4}',s:'sqrt(2)/2',c:'sqrt(2)/2',k:'pi/4'},
  'pi/3':{t:'\\frac{\\pi}{3}',s:'sqrt(3)/2',c:'1/2',k:'pi/3'}, 'pi/2':{t:'\\frac{\\pi}{2}',s:'1',c:'0',k:'pi/2'},
  '2pi/3':{t:'\\frac{2\\pi}{3}',s:'sqrt(3)/2',c:'-1/2',k:'2pi/3'}, '3pi/4':{t:'\\frac{3\\pi}{4}',s:'sqrt(2)/2',c:'-sqrt(2)/2',k:'3pi/4'},
  '5pi/6':{t:'\\frac{5\\pi}{6}',s:'1/2',c:'-sqrt(3)/2',k:'5pi/6'}, 'pi':{t:'\\pi',s:'0',c:'-1',k:'pi'},
  '-pi/4':{t:'-\\frac{\\pi}{4}',s:'-sqrt(2)/2',c:'sqrt(2)/2',k:'-pi/4'}, '-pi/2':{t:'-\\frac{\\pi}{2}',s:'-1',c:'0',k:'-pi/2'},
  '7pi/4':{t:'\\frac{7\\pi}{4}',s:'-sqrt(2)/2',c:'sqrt(2)/2',k:'7pi/4'}, '2pi':{t:'2\\pi',s:'0',c:'1',k:'2pi'}, '5pi/4':{t:'\\frac{5\\pi}{4}',s:'-sqrt(2)/2',c:'-sqrt(2)/2',k:'5pi/4'},
  '3pi/2':{t:'\\frac{3\\pi}{2}',s:'-1',c:'0',k:'3pi/2'}
};
/* a figure wrapper for stems (the exam shows figures inside the question) */
const figBox=(svg,cap)=>`<div class="qfig2">${svg}${cap?`<span class="qglegend">${cap}</span>`:''}</div>`;
/* integer square test */
const isSq=n=>n>=0&&Math.round(Math.sqrt(n))**2===n;
/* √n as a key string, simplified */
const rt=n=>sqrtS(n);
/* r·√s·π^k as a key string, with square factors pulled out of s: mv([3,4],8,1) → "3sqrt(2)pi/2" */
function mv(r,s,k,extra){
  s=s||1; let [p,q]=Rr(r[0],r[1]||1); const [a,b]=sqf(s); p*=a; [p,q]=Rr(p,q);
  const body=[b>1?`sqrt(${b})`:'',k?(k===1?'pi':`pi^${k}`):'',extra||''].filter(Boolean).join('*').replace(/\)\*pi/g,')pi');
  return term([p,q],body||'1');
}
/* Σ rᵢ·√sᵢ (sᵢ squarefree after simplification), times an optional body ("pi"): one fraction over a common denominator */
function qc(terms,body){
  const m={}; terms.forEach(([r,s])=>{ s=s||1; const [a,b]=sqf(s); const rr=Rr(r[0]*a,r[1]||1); m[b]=m[b]?Radd(m[b],rr):rr; });
  const ks=Object.keys(m).map(Number).filter(k=>m[k][0]!==0).sort((a,b)=>a-b);
  if(!ks.length) return '0';
  if(ks.length===1) return mv(m[ks[0]],ks[0],body==='pi'?1:0,body&&body!=='pi'?body:'');
  const D=ks.reduce((l,k)=>l*m[k][1]/gcd(l,m[k][1]),1);
  let parts=ks.map(k=>({n:m[k][0]*D/m[k][1],k}));
  const g=parts.reduce((s,x)=>gcd(s,x.n),0); let pre=[g,D];
  if(parts[0].n<0&&parts.every(x=>x.n<0)) pre=[-g,D];
  parts=parts.map(x=>({n:x.n/pre[0],k:x.k}));
  /* positive part first so "(sqrt(3) - 1)" not "(-1 + sqrt(3))" */
  parts.sort((x,y)=>(y.n>0)-(x.n>0)||x.k-y.k);
  const inner=sumS(parts.map(x=>x.k===1?String(x.n):x.n===1?`sqrt(${x.k})`:x.n===-1?`-sqrt(${x.k})`:`${x.n}sqrt(${x.k})`));
  return term(Rr(pre[0],pre[1]),`(${inner})${body?(body==='pi'?'pi':'*'+body):''}`);
}
/* sin/cos of a table angle as [[r,s],…] terms */
const trigT=(ang,fn)=>{ const v=ANG[ang][fn]; const tbl={'0':[[0,1],1],'1':[[1,1],1],'-1':[[-1,1],1],'1/2':[[1,2],1],'-1/2':[[-1,2],1],
  'sqrt(2)/2':[[1,2],2],'-sqrt(2)/2':[[-1,2],2],'sqrt(3)/2':[[1,2],3],'-sqrt(3)/2':[[-1,2],3]}; return tbl[v]; };
const scaleT=(t,r)=>[Rmul(t[0],r),t[1]];
/* interval length / numeric angle */
const angN=a=>val(ANG[a].k);
const angLen=(a,b)=>toR((angN(b)-angN(a))/Math.PI);            /* (b − a)/π as a rational */
