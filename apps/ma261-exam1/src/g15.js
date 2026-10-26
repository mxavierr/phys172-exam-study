
/* =====================================================================
   15.1–15.7   functions of several variables: domains, level curves,
   limits, partial derivatives, chain rule, gradient, tangent planes,
   linear approximation, critical points and absolute extrema
   ===================================================================== */

/* ---- rationals as [p, q] ---- */
const parseR=s=>{ const a=String(s).split('/'); return [+a[0],a[1]?+a[1]:1]; };
const toR=x=>{ const f=toFrac(x,2000); return f===null?null:parseR(f); };
const fS=r=>frac(r[0],r[1]);
const EXACT=(s,env)=>{ try{ const v=ev(s,env); return toFrac(v,2000); }catch(e){ return null; } };
const mulS=(c,rest)=>c==='0'||c===0?'0':c==='1'||c===1?rest:c==='-1'||c===-1?'-'+rest:`${c}*${rest}`;

/* ---- a bank of terms f(x,y) with first/second partials and typical wrong partials ---- */
function tMono(c,m,n){
  const both=m>0&&n>0;
  return {f:mono(c,{x:m,y:n}),fx:mono(c*m,{x:m-1,y:n}),fy:mono(c*n,{x:m,y:n-1}),
    fxx:mono(c*m*(m-1),{x:m-2,y:n}),fxy:mono(c*m*n,{x:m-1,y:n-1}),fyy:mono(c*n*(n-1),{x:m,y:n-2}),
    fxT:both?sumS([mono(c*m,{x:m-1,y:n}),mono(c*n,{x:m,y:n-1})]):mono(c*Math.max(m,1),{x:m,y:n}),
    fyT:both?sumS([mono(c*m,{x:m-1,y:n}),mono(c*n,{x:m,y:n-1})]):mono(c*Math.max(n,1),{x:m,y:n}),
    whyX:both?'For ∂/∂x, hold y constant: y^n is just a coefficient, it does not get differentiated.':'Power rule: lower the exponent by one.',
    whyY:both?'For ∂/∂y, hold x constant: x^m is just a coefficient.':'Power rule: lower the exponent by one.',poly:1};
}
const randMono=()=>{ for(;;){ const m=ri(0,3), n=ri(0,3); if(m+n>=1) return tMono(nz(-5,5),m,n); } };
function tExp(){ const a=pick([1,2,3,-1,-2]), E=`e^(${mono(a,{x:1,y:1})})`;
  return {f:E,fx:mulS(mono(a,{y:1}),E),fy:mulS(mono(a,{x:1}),E),fxx:mulS(mono(a*a,{y:2}),E),fyy:mulS(mono(a*a,{x:2}),E),
    fxy:`(${sumS([String(a),mono(a*a,{x:1,y:1})])})*${E}`,fxT:E,fyT:E,whyX:'Chain rule: e^{u} differentiates to u′e^{u}, with ∂u/∂x = '+a+'y.',whyY:'Chain rule: ∂/∂y of the exponent is '+a+'x.'}; }
function tTrig(){ const fn=pick(['sin','cos']), a=nz(-3,3), b=nz(-3,3), in_=sumS([mono(a,{x:1}),mono(b,{y:1})]), S=`sin(${in_})`, C=`cos(${in_})`;
  const d=(k,neg)=>fn==='sin'?mulS(String(k),C):mulS(String(-k),S);
  const dd=k=>fn==='sin'?mulS(String(-k),S):mulS(String(-k),C);
  return {f:`${fn}(${in_})`,fx:d(a),fy:d(b),fxx:dd(a*a),fxy:dd(a*b),fyy:dd(b*b),
    fxT:fn==='sin'?C:mulS(String(a),S),fyT:fn==='sin'?C:mulS(String(b),S),
    whyX:fn==='sin'?`Chain rule: multiply by ∂/∂x of the inside, ${a}.`:'The derivative of cos is −sin.',whyY:fn==='sin'?`Chain rule: multiply by ∂/∂y of the inside, ${b}.`:'The derivative of cos is −sin.'}; }
function tXexp(){ const m=ri(1,3), b=nz(-3,3), E=`e^(${mono(b,{y:1})})`;
  return {f:mulS(mono(1,{x:m}),E),fx:mulS(mono(m,{x:m-1}),E),fy:mulS(mono(b,{x:m}),E),fxx:mulS(mono(m*(m-1),{x:m-2}),E),fxy:mulS(mono(m*b,{x:m-1}),E),fyy:mulS(mono(b*b,{x:m}),E),
    fxT:mulS(mono(m*b,{x:m-1}),E),fyT:mulS(mono(1,{x:m}),E),whyX:'e^{by} is a constant for ∂/∂x; only x^m is differentiated.',whyY:'Chain rule: ∂/∂y of e^{by} is b·e^{by}.'}; }
function tLn(){ const a=ri(1,4), D=`x^2 + ${a===1?'':a+'*'}y^2`;
  return {f:`ln(${D})`,fx:`2*x/(${D})`,fy:`${2*a}*y/(${D})`,fxT:`1/(${D})`,fyT:`1/(${D})`,whyX:'(ln u)′ = u′/u; the numerator is ∂u/∂x = 2x.',whyY:`(ln u)′ = u′/u; the numerator is ∂u/∂y = ${2*a}y.`}; }
function tQuot(){ const a=ri(1,4), D=`x + ${a===1?'':a+'*'}y`;
  return {f:`x/(${D})`,fx:`${mono(a,{y:1})}/(${D})^2`,fy:`${mono(-a,{x:1})}/(${D})^2`,fxT:`1/(${D})`,fyT:`${mono(-1,{x:1})}/(${D})^2`,
    whyX:'Quotient rule: (x + ay)·1 − x·1 over (x + ay)²; the denominator is not a constant.',whyY:`Quotient rule: the derivative of the denominator with respect to y is ${a}.`}; }
function tSqrt(){ const a=ri(1,4), b=ri(1,4), D=sumS([mono(a,{x:2}),mono(b,{y:2})]);
  return {f:`sqrt(${D})`,fx:`${mono(a,{x:1})}/sqrt(${D})`,fy:`${mono(b,{y:1})}/sqrt(${D})`,fxT:`1/(2*sqrt(${D}))`,fyT:`1/(2*sqrt(${D}))`,
    whyX:`Chain rule: (√u)′ = u′/(2√u) with ∂u/∂x = ${2*a}x.`,whyY:`Chain rule: (√u)′ = u′/(2√u) with ∂u/∂y = ${2*b}y.`}; }
function tAtan(){ return {f:'arctan(y/x)',fx:'-y/(x^2 + y^2)',fy:'x/(x^2 + y^2)',fxT:'1/(1 + (y/x)^2)',fyT:'1/(1 + (y/x)^2)',
    whyX:'Chain rule: multiply 1/(1 + (y/x)²) by ∂(y/x)/∂x = −y/x².',whyY:'Chain rule: multiply by ∂(y/x)/∂y = 1/x.'}; }
const sumT=(ts,k)=>sumS(ts.map(t=>t[k]));
const VARF=[tExp,tTrig,tXexp,tLn,tQuot,tSqrt,tAtan,randMono];

/* ---------------- 15.1 Graphs, domains, level curves ---------------- */
add('f-domain','Domains & level curves','15.1',()=>{
  const c=ri(1,5), c2=c*c;
  const B=pick([
    {f:`sqrt(${c2} - x^2 - y^2)`,ok:m`x^2+y^2\le ${c2}`+' (a closed disk)',bad:[[m`x^2+y^2<${c2}`+' (an open disk)','√0 = 0 is allowed, so the boundary circle is included.'],[m`x^2+y^2\ge ${c2}`,'The inside of the square root must be ≥ 0: that is the disk, not its outside.'],[m`x^2+y^2=${c2}`+' (just the circle)','Every point inside the circle works too.']],pred:`x**2+y**2<=${c2}`},
    {f:`ln(${c2} - x^2 - y^2)`,ok:m`x^2+y^2<${c2}`+' (an open disk)',bad:[[m`x^2+y^2\le ${c2}`,'ln 0 is undefined, so the boundary circle is excluded.'],[m`x^2+y^2>${c2}`,'The argument of ln must be positive: inside the circle.'],['all of '+m`\mathbb R^2`,'ln needs a positive argument.']],pred:`x**2+y**2<${c2}`},
    {f:`ln(x - y)`,ok:m`y<x`,bad:[[m`y\le x`,'ln 0 is undefined: the line y = x is excluded.'],[m`y>x`,'x − y > 0 means y < x.'],[m`x>0,\ y>0`,'The condition is on x − y, not on x and y separately.']],pred:`x-y>0`},
    {f:`1/(x^2 - y^2)`,ok:'all points with '+m`y\ne\pm x`,bad:[['all points with '+m`y\ne x`,'x² − y² = (x − y)(x + y) is also 0 on y = −x.'],['all points with '+m`x\ne 0`,'The denominator is x² − y², not x.'],['all of '+m`\mathbb R^2`,'Division by zero happens on two lines.']],pred:`Ne(x**2-y**2,0)`},
    {f:`sqrt(y - ${c===1?'':c+'*'}x^2)`,ok:m`y\ge ${c===1?'':c}x^2`+' (on or above the parabola)',bad:[[m`y>${c===1?'':c}x^2`,'√0 is allowed, so the parabola itself is included.'],[m`y\le ${c===1?'':c}x^2`,'y − cx² ≥ 0 means on or ABOVE the parabola.'],[m`x\ge ${c===1?'':c}y^2`,'Swapped the roles of x and y.']],pred:`y-${c}*x**2>=0`},
    {f:`sqrt(x*y)`,ok:m`xy\ge0`+' (quadrants I and III, including the axes)',bad:[[m`xy>0`+' (open quadrants I and III)','√0 = 0 is allowed, so the axes are included.'],[m`x\ge0,\ y\ge0`+' (quadrant I only)','A negative x times a negative y is also ≥ 0.'],['all of '+m`\mathbb R^2`,'xy is negative in quadrants II and IV.']],pred:`x*y>=0`},
    {f:`sqrt(x^2 + y^2 - ${c2})`,ok:m`x^2+y^2\ge ${c2}`+' (on or outside the circle)',bad:[[m`x^2+y^2\le ${c2}`,'The radicand must be ≥ 0: outside the circle.'],[m`x^2+y^2>${c2}`,'√0 is allowed: the circle is included.'],['all of '+m`\mathbb R^2`,'Inside the circle the radicand is negative.']],pred:`x**2+y**2>=${c2}`},
    {f:`arcsin(x - y)`,ok:m`|x-y|\le1`+' (a strip between two lines)',bad:[[m`|x-y|<1`,'arcsin(±1) is defined.'],[m`x-y\le1`,'arcsin also needs x − y ≥ −1.'],['all of '+m`\mathbb R^2`,'arcsin only accepts inputs in [−1, 1].']],pred:`And(x-y<=1, x-y>=-1)`}]);
  const opts=[{h:B.ok,ok:true}].concat(B.bad.map(b=>({h:b[0],why:b[1]})));
  return {q:`What is the domain of ${m`f(x,y)=${tex(B.f)}`}?`,kind:'choice',opts,ans:B.ok,lv:1,
    how:'Square roots need a radicand ≥ 0, ln needs an argument > 0, denominators must be ≠ 0.',
    sol:[['Apply the restriction of the outer function to its input.',X`f(x,y)=${tex(B.f)}`]],chk:{op:'domain2',e:{f:B.f},n:{pred:B.pred}}};
});

add('f-level','Domains & level curves','15.1',()=>{
  const a=ri(1,4), b=nz(-3,3), x0=ri(-3,3), y0=ri(-3,3);
  const F=pick([
    {f:`x^2 + ${a===1?'':a+'*'}y^2`,shape:'ellipse'},{f:`y - ${a===1?'':a+'*'}x^2`,shape:'parabola'},{f:sumS([mono(a,{x:1}),mono(b,{y:1})]),shape:'line'},
    {f:`x^2 - y^2`,shape:'hyperbola'},{f:`x*y`,shape:'hyperbola'},{f:`x^2 + y^2 - ${2*a}*x`,shape:'circle'}]);
  const k=Math.round(ev(F.f,{x:x0,y:y0}));
  if(F.f==='x*y'&&k===0||F.f==='x^2 - y^2'&&k===0) return null;
  const ans=`${F.f} = ${k}`;
  return {q:`Find an equation of the level curve of ${m`f(x,y)=${tex(F.f)}`} that passes through ${mp([x0,y0])}.`,kind:'eq',eqVars:['x','y'],ans,lv:1,
    dis:[{a:`${F.f} = ${k+1}`,why:'Arithmetic slip evaluating f at the point.'},{a:`${F.f} = ${-k||2}`,why:'Sign slip evaluating f.'},
         {a:`${F.f} = ${Math.round(ev(F.f,{x:y0,y:x0}))===k?k+2:Math.round(ev(F.f,{x:y0,y:x0}))}`,why:'Swapped x and y when plugging in the point.'},{a:`${F.f} = 0`,why:'The level is f at the point, not 0.'}],
    how:'The level curve through P is f(x, y) = f(P).',
    sol:[['Evaluate f at the point.',X`f(${x0},${y0})=${k}`],['Level curve.',tex(ans)]],chk:{op:'level',e:{f:F.f},n:{P:[x0,y0]}}};
});

add('f-level-shape','Domains & level curves','15.1',()=>{
  const a=ri(2,5);
  const B=pick([[`x^2 + ${a}*y^2`,'Ellipses (centered at the origin)'],[`x^2 + y^2`,'Circles (centered at the origin)'],[`y - ${a}*x^2`,'Parabolas'],
    [`${a}*x - y`,'Parallel lines'],[`x^2 - y^2`,'Hyperbolas (and the lines y = ±x at level 0)'],[`y/x`,'Lines through the origin (with the origin removed)'],
    [`e^(x^2 + y^2)`,'Circles (centered at the origin)'],[`sqrt(${a*a} - x^2 - y^2)`,'Circles (centered at the origin)']]);
  const all=['Ellipses (centered at the origin)','Circles (centered at the origin)','Parabolas','Parallel lines','Hyperbolas (and the lines y = ±x at level 0)','Lines through the origin (with the origin removed)'];
  const opts=[{h:B[1],ok:true}].concat(shuf(all.filter(x=>x!==B[1])).slice(0,4).map(h=>({h,why:'Set f(x, y) = c and simplify: the shape comes from what is left.'})));
  return {q:`Describe the level curves ${m`f(x,y)=c`} of ${m`f(x,y)=${tex(B[0])}`}.`,kind:'choice',opts,ans:B[1],lv:1,
    how:'Set f = c and rearrange into a familiar curve.',sol:[['Set f(x, y) = c and rearrange.',X`${tex(B[0])}=c`],['',X`\text{${B[1]}}`]],chk:{op:'manual'}};
});

/* ---------------- 15.2 Limits ---------------- */
add('lim-cont','Limits','15.2',()=>{
  const x0=ri(-3,3), y0=ri(-3,3), a=nz(-3,3), b=nz(-3,3), c=ri(1,4);
  const F=pick([
    ()=>{ const d=x0+y0+c; if(d===0) return null; const f=`(${sumS([mono(a,{x:2}),mono(b,{y:1})])})/(x + y + ${c})`; return {f,ans:frac(a*x0*x0+b*y0,d),alt:frac(a*x0*x0+b*y0,d+1)}; },
    ()=>{ const k=a*x0+b*y0; const f=`e^(${sumS([mono(a,{x:1}),mono(b,{y:1})])})`; return {f,ans:k?`e^(${k})`:'1',alt:k?`e^(${-k})`:'e'}; },
    ()=>{ const v=x0*x0+y0*y0+c; const f=`sqrt(x^2 + y^2 + ${c})`; return {f,ans:sqrtS(v),alt:String(v)}; },
    ()=>{ const k=x0*y0; const f=`${sumS([mono(a,{x:1,y:2}),mono(b,{x:1})])}*cos(pi*x*y)`; const cs=k%2===0?1:-1; return {f,ans:String(a*x0*y0*y0+b*x0*cs),alt:String((a*x0*y0*y0+b*x0)*cs)}; }]);
  const o=F(); if(!o) return null;
  return {q:`Evaluate ${m`\lim_{(x,y)\to(${x0},${y0})} ${tex(o.f)}`}.`,kind:'expr',ans:o.ans,lv:1,
    dis:[{a:o.alt,why:'Arithmetic slip; this function is continuous here, so just substitute carefully.'},{a:'DNE',why:'The function is continuous at the point (no zero denominator), so the limit exists.'},{a:'0',why:'Substitute the point; the value is not 0.'}],
    how:'Continuous at the point → substitute.',sol:[['The function is continuous at the point, so substitute.',X`${tex(o.f)}\Big|_{(${x0},${y0})}=${tex(o.ans)}`]],
    chk:{op:'lim2',e:{f:o.f,a:String(x0),b:String(y0)}}};
});

add('lim-factor','Limits','15.2',()=>{
  const a=nz(-3,3), s=ri(1,3), bb=ri(-3,3);
  const F=pick([
    {f:'(x^2 - y^2)/(x - y)',P:[a,a],ans:String(2*a),how:'Factor x² − y² = (x − y)(x + y) and cancel.',step:X`\frac{(x-y)(x+y)}{x-y}=x+y`},
    {f:'(x^2 - y^2)/(x + y)',P:[a,-a],ans:String(2*a),how:'Factor and cancel x + y.',step:X`\frac{(x-y)(x+y)}{x+y}=x-y`},
    {f:'(x^3 - y^3)/(x - y)',P:[a,a],ans:String(3*a*a),how:'x³ − y³ = (x − y)(x² + xy + y²).',step:X`x^2+xy+y^2`},
    {f:'(x^2*y - x*y^2)/(x - y)',P:[a,a],ans:String(a*a),how:'Factor out xy.',step:X`\frac{xy(x-y)}{x-y}=xy`},
    {f:'(x - y)/(sqrt(x) - sqrt(y))',P:[s*s,s*s],ans:String(2*s),how:'x − y = (√x − √y)(√x + √y).',step:X`\sqrt x+\sqrt y`},
    {f:`(x*y - ${2}*x - y + 2)/(y - 2)`,P:[bb,2],ans:String(bb-1),how:'Group: xy − 2x − y + 2 = (x − 1)(y − 2).',step:X`\frac{(x-1)(y-2)}{y-2}=x-1`},
    {f:'(sqrt(x + y) - 2)/(x + y - 4)',P:[2+bb,2-bb],ans:'1/4',how:'Let u = x + y: (√u − 2)/(u − 4) = 1/(√u + 2).',step:X`\frac{1}{\sqrt{x+y}+2}`}]);
  const val=F.ans;
  return {q:`Evaluate ${m`\lim_{(x,y)\to(${F.P[0]},${F.P[1]})} ${tex(F.f)}`}.`,kind:'expr',ans:val,lv:2,
    dis:[{a:'DNE',why:'0/0 is indeterminate, not a sign the limit fails: simplify first.'},{a:'0',why:'0/0 does not mean 0.'},
         {a:val==='1/4'?'1/2':String(+val===0?1:-val),why:'Sign or factoring slip after cancelling.'},{a:'1',why:'0/0 does not mean 1.'}],
    how:F.how,sol:[['Direct substitution gives 0/0, so simplify away from the line where the denominator vanishes.',F.step],['Now substitute.',tex(val)]],
    chk:{op:'lim2',e:{f:F.f,a:String(F.P[0]),b:String(F.P[1])}}};
});

add('lim-dne','Limits','15.2',()=>{
  const a=ri(1,4), b=ri(1,4);
  const F=pick([
    {f:`(${a}*x^2 - ${b}*y^2)/(x^2 + y^2)`,ans:'DNE',paths:`along the x-axis the value is ${a}, along the y-axis it is ${-b}`,why0:'Along the axes you get different values.'},
    {f:`${a}*x*y/(x^2 + y^2)`,ans:'DNE',paths:`along y = x the value is ${frac(a,2)}, along the x-axis it is 0`,why0:'Both axes give 0, but y = x gives '+frac(a,2)+'.'},
    {f:`x^2*y/(x^4 + y^2)`,ans:'DNE',paths:'every line y = mx gives 0, but the parabola y = x² gives 1/2',why0:'All straight lines give 0, but a parabola y = x² gives 1/2.'},
    {f:`x*y^2/(x^2 + y^4)`,ans:'DNE',paths:'every line gives 0, but x = y² gives 1/2',why0:'Lines give 0, but the curve x = y² gives 1/2.'},
    {f:`(x + y)^2/(x^2 + y^2)`,ans:'DNE',paths:'along y = x the value is 2, along y = −x it is 0',why0:'Different lines give different values.'},
    {f:`${a}*x^2*y/(x^2 + y^2)`,ans:'0',paths:`|${a}x^2y|/(x^2+y^2) \\le ${Math.abs(a)}|y| \\to 0 \\text{ since } x^2\\le x^2+y^2`,why0:''},
    {f:`(x^3 + y^3)/(x^2 + y^2)`,ans:'0',paths:'|x^3+y^3|/(x^2+y^2) \\le |x|+|y| \\to 0 \\text{ since } x^2, y^2 \\le x^2+y^2',why0:''},
    {f:`x^2*y^2/(x^2 + y^2)`,ans:'0',paths:'x^2y^2/(x^2+y^2) \\le y^2 \\to 0 \\text{ since } x^2\\le x^2+y^2',why0:''},
    {f:`sin(x^2 + y^2)/(x^2 + y^2)`,ans:'1',paths:'u = x^2+y^2 \\to 0:\\ \\sin u/u \\to 1',why0:''}]);
  const exists=F.ans!=='DNE';
  return {q:`Evaluate ${m`\lim_{(x,y)\to(0,0)} ${tex(F.f)}`}, or enter DNE if the limit does not exist.`,kind:'expr',ans:F.ans,lv:3,
    dis:exists?[{a:'DNE',why:'Two paths agreeing is not required to fail here: the squeeze bound shows every path gives the same value.'},{a:F.ans==='1'?'0':'1',why:F.ans==='1'?'sin u/u → 1, not 0.':'The numerator has higher total degree than the denominator, so the quotient shrinks to 0.'},{a:String(a),why:'That is the coefficient, not the limit.'}]
               :[{a:'0',why:F.why0},{a:String(a),why:'That is the value along one path only.'},{a:'1',why:'0/0 does not mean 1.'}],
    how:exists?'Squeeze it: use x² ≤ x² + y² (and y² ≤ x² + y²) to bound it by something that → 0, or substitute u = x² + y².':'Find two paths into (0, 0) that give different values ⇒ the limit does not exist.',
    sol:[[exists?'Squeeze (or substitute u = x² + y²).':'Two-path test.',exists?F.paths:X`\text{${F.paths}}`],['',tex(F.ans)]],
    chk:{op:'lim2',e:{f:F.f,a:'0',b:'0'},n:{dne:exists?0:1}}};
});

/* ---------------- 15.3 Partial derivatives ---------------- */
add('pd-first','Partial derivatives','15.3',()=>{
  const t1=randMono(), t2=pick(VARF)(); if(t1.f===t2.f) return null;
  const v=coin()?'x':'y', o=v==='x'?'y':'x', T=[t1,t2];
  const ans=sumT(T,'f'+v), other=sumT(T,'f'+o);
  if(ans==='0') return null;
  return {q:`Find ${m`f_{${v}}`} for ${m`f(x,y)=${tex(sumT(T,'f'))}`}.`,kind:'expr',vars:['x','y'],ans,lv:1,
    dis:[{a:other,why:`That is f_${o}.`},{a:sumS([t1['f'+v+'T'],t2['f'+v]]),why:t1['why'+v.toUpperCase()]},{a:sumS([t1['f'+v],t2['f'+v+'T']]),why:t2['why'+v.toUpperCase()]},
         {a:sumS([t1['f'+v],`-(${t2['f'+v]})`]),why:'Sign slip.'}],
    how:`Differentiate with respect to ${v}, treating ${o} as a constant.`,
    sol:[[`Hold ${o} constant and differentiate term by term.`,X`f_{${v}}=${tex(ans)}`]],
    chk:{op:'pdiff',e:{f:sumT(T,'f')},n:{v:[v]}}};
});

add('pd-eval','Partial derivatives','15.3',()=>{
  const t1=randMono(), t2=pick([tExp,tTrig,tXexp,tLn,tQuot,tSqrt,randMono])(), T=[t1,t2];
  const v=coin()?'x':'y', o=v==='x'?'y':'x';
  for(let k=0;k<25;k++){
    const P=[ri(-2,2),ri(-2,2)], env={x:P[0],y:P[1]};
    const val=EXACT(sumT(T,'f'+v),env), oth=EXACT(sumT(T,'f'+o),env), fv=EXACT(sumT(T,'f'),env);
    if(val===null||oth===null||fv===null) continue;
    { const r=parseR(val); if(Math.abs(r[0])>150||r[1]>20) continue; }
    const tr=EXACT(sumS([t1['f'+v+'T'],t2['f'+v]]),env), tr2=EXACT(sumS([t1['f'+v],t2['f'+v+'T']]),env);
    return {q:`Let ${m`f(x,y)=${tex(sumT(T,'f'))}`}. Find ${m`f_{${v}}(${P[0]},${P[1]})`}.`,kind:'expr',ans:val,lv:2,
      dis:[{a:oth,why:`That is f_${o} at the point.`},{a:fv,why:'That is f itself at the point.'}].concat(tr!==null?[{a:tr,why:t1['why'+v.toUpperCase()]}]:[]).concat(tr2!==null?[{a:tr2,why:t2['why'+v.toUpperCase()]}]:[]),
      how:`Find f_${v} (hold ${o} constant), then substitute the point.`,
      sol:[[`Partial derivative with respect to ${v}.`,X`f_{${v}}=${tex(sumT(T,'f'+v))}`],['Substitute the point.',X`f_{${v}}(${P[0]},${P[1]})=${tex(val)}`]],
      chk:{op:'pdiff',e:{f:sumT(T,'f')},n:{v:[v],P}}};
  }
  return null;
});

add('pd-second','Partial derivatives','15.3',()=>{
  const t1=randMono(), t2=randMono(), t3=pick([tExp,tTrig,tXexp])(), T=[t1,t2,t3];
  const w=pick(['xx','yy','xy','xy']), key='f'+w, ans=sumT(T,key); if(ans==='0') return null;
  const lab={xx:'f_{xx}',yy:'f_{yy}',xy:'f_{xy}'}[w];
  const others={xx:['fxy','fyy'],yy:['fxy','fxx'],xy:['fxx','fyy']}[w];
  return {q:`Find ${m`${lab}`} for ${m`f(x,y)=${tex(sumT(T,'f'))}`}.`,kind:'expr',vars:['x','y'],ans,lv:2,
    dis:[{a:sumT(T,others[0]),why:`That is f_${others[0].slice(1)}.`},{a:sumT(T,others[1]),why:`That is f_${others[1].slice(1)}.`},
         {a:sumT(T,'f'+w[0]),why:'That is only the first derivative; differentiate again.'},{a:w==='xy'?`(${sumT(T,'fx')})*(${sumT(T,'fy')})`:sumS([t1[key],t2[key],t3['f'+w[0]]]),why:w==='xy'?'f_xy is (f_x)_y, not f_x times f_y.':'One term was only differentiated once.'}],
    how:w==='xy'?'Differentiate with respect to x, then the result with respect to y (order does not matter here).':`Differentiate twice with respect to ${w[0]}.`,
    sol:[['First derivative.',X`f_{${w[0]}}=${tex(sumT(T,'f'+w[0]))}`],['Differentiate again.',X`${lab}=${tex(ans)}`]],
    chk:{op:'pdiff',e:{f:sumT(T,'f')},n:{v:w.split('')}}};
});

add('pd-3var','Partial derivatives','15.3',()=>{
  const c=nz(-4,4), p=[ri(0,2),ri(1,2),ri(1,3)], a=nz(-3,3), b=ri(1,3), d=ri(1,3);
  const E=pick([
    {f:`e^(${mono(a,{x:1,z:1})})`,d:{x:mulS(mono(a,{z:1}),`e^(${mono(a,{x:1,z:1})})`),y:'0',z:mulS(mono(a,{x:1}),`e^(${mono(a,{x:1,z:1})})`)},T:{x:`e^(${mono(a,{x:1,z:1})})`,z:`e^(${mono(a,{x:1,z:1})})`}},
    {f:`ln(x + ${b}*y + ${d}*z)`,d:{x:`1/(x + ${b}*y + ${d}*z)`,y:`${b}/(x + ${b}*y + ${d}*z)`,z:`${d}/(x + ${b}*y + ${d}*z)`},T:{y:`1/(x + ${b}*y + ${d}*z)`,z:`1/(x + ${b}*y + ${d}*z)`}},
    {f:`sin(x*y*z)`,d:{x:'y*z*cos(x*y*z)',y:'x*z*cos(x*y*z)',z:'x*y*cos(x*y*z)'},T:{x:'cos(x*y*z)',y:'cos(x*y*z)',z:'cos(x*y*z)'}}]);
  const M=mono(c,{x:p[0],y:p[1],z:p[2]}), Md={x:mono(c*p[0],{x:p[0]-1,y:p[1],z:p[2]}),y:mono(c*p[1],{x:p[0],y:p[1]-1,z:p[2]}),z:mono(c*p[2],{x:p[0],y:p[1],z:p[2]-1})};
  const v=pick(['x','y','z']), ans=sumS([Md[v],E.d[v]]); if(ans==='0') return null;
  const ov=AX.filter(q=>q!==v);
  return {q:`Find ${m`f_{${v}}`} for ${m`f(x,y,z)=${tex(sumS([M,E.f]))}`}.`,kind:'expr',vars:['x','y','z'],ans,lv:2,
    dis:[{a:sumS([Md[ov[0]],E.d[ov[0]]]),why:`That is f_${ov[0]}.`},{a:sumS([Md[ov[1]],E.d[ov[1]]]),why:`That is f_${ov[1]}.`},
         {a:sumS([Md[v],E.T[v]||E.d[ov[0]]]),why:'Chain rule: multiply by the derivative of the inside with respect to '+v+'.'}],
    how:`Differentiate with respect to ${v}; the other two variables are constants.`,
    sol:[[`Hold ${ov.join(' and ')} constant.`,X`f_{${v}}=${tex(ans)}`]],chk:{op:'pdiff',e:{f:sumS([M,E.f])},n:{v:[v]}}};
});

/* ---------------- 15.4 Chain rule ---------------- */
add('chain-t','Chain rule','15.4',()=>{
  const tm=[randMono(),randMono()], f=sumT(tm,'f'), Fx=sumT(tm,'fx'), Fy=sumT(tm,'fy');
  if(tm[0].f===tm[1].f) return null;
  const xc=rpoly(pick([1,2]),-3,3), yc=rpoly(pick([1,2,3]),-2,2), xt=polyS(xc), yt=polyS(yc), t0=ri(-2,2);
  const x0=polyE(xc,t0), y0=polyE(yc,t0), DX=polyE(polyD(xc),t0), DY=polyE(polyD(yc),t0);
  const fxv=Math.round(ev(Fx,{x:x0,y:y0})), fyv=Math.round(ev(Fy,{x:x0,y:y0}));
  if(Math.abs(fxv*DX+fyv*DY)>150||Math.abs(x0)>6||Math.abs(y0)>6) return null;   /* exam-sized numbers */
  const ans=String(fxv*DX+fyv*DY);
  return {q:`Let ${m`z=${tex(f)}`}, with ${m`x=${tex(xt)}`} and ${m`y=${tex(yt)}`}. Find ${m`\frac{dz}{dt}`} at ${m`t=${t0}`}.`,kind:'expr',ans,lv:2,
    dis:[{a:String(fxv*DX),why:'Only the x-branch: dz/dt = z_x·dx/dt + z_y·dy/dt.'},{a:String(fyv*DY),why:'Only the y-branch.'},{a:String(fxv+fyv),why:'Forgot to multiply by dx/dt and dy/dt.'},{a:String(fxv*DY+fyv*DX),why:'Paired z_x with dy/dt; each partial goes with its own variable’s rate.'}],
    how:'dz/dt = z_x·x′(t) + z_y·y′(t), everything evaluated at the same moment.',
    sol:[['Point and rates at t₀.',X`(x,y)=(${x0},${y0}),\qquad x'(${t0})=${DX},\qquad y'(${t0})=${DY}`],
         ['Partials at that point.',X`z_x=${tex(Fx)}=${fxv},\qquad z_y=${tex(Fy)}=${fyv}`],['Chain rule.',X`\frac{dz}{dt}=(${fxv})(${DX})+(${fyv})(${DY})=${ans}`]],
    chk:{op:'chain1',e:{f,xt,yt,t0:String(t0)}}};
});

add('chain-st','Chain rule','15.4',()=>{
  const tm=[randMono(),randMono()], f=sumT(tm,'f'), Fx=sumT(tm,'fx'), Fy=sumT(tm,'fy');
  const G=pick([['s*t','s + t'],['s^2 - t','2*s*t'],['s + 2*t','s - t'],['s*t^2','s^2 + t'],['s - t','s*t']]);
  const s0=ri(-2,2), t0=ri(-2,2), wrt=coin()?'s':'t';
  const env={s:s0,t:t0}, x0=ev(G[0],env), y0=ev(G[1],env);
  const d=(g,w)=>{ const e1={...env}, e2={...env}; e1[w]+=1e-6; e2[w]-=1e-6; return Math.round((ev(g,e1)-ev(g,e2))/2e-6); };
  const fxv=Math.round(ev(Fx,{x:x0,y:y0})), fyv=Math.round(ev(Fy,{x:x0,y:y0}));
  const ow=wrt==='s'?'t':'s';
  const val=fxv*d(G[0],wrt)+fyv*d(G[1],wrt), oth=fxv*d(G[0],ow)+fyv*d(G[1],ow);
  if(Math.abs(val)>150) return null;
  return {q:`Let ${m`z=${tex(f)}`}, where ${m`x=${tex(G[0])}`} and ${m`y=${tex(G[1])}`}. Find ${m`\frac{\partial z}{\partial ${wrt}}`} at ${m`(s,t)=(${s0},${t0})`}.`,kind:'expr',ans:String(val),lv:3,
    dis:[{a:String(oth),why:`That is ∂z/∂${ow}.`},{a:String(fxv*d(G[0],wrt)),why:'Missing the y-branch of the tree.'},{a:String(fyv*d(G[1],wrt)),why:'Missing the x-branch of the tree.'},{a:String(fxv+fyv),why:'Forgot the ∂x/∂'+wrt+' and ∂y/∂'+wrt+' factors.'},
         {a:String(fxv*d(G[1],wrt)+fyv*d(G[0],wrt)),why:'Paired z_x with ∂y/∂'+wrt+' and z_y with ∂x/∂'+wrt+'.'},{a:String(fxv*d(G[0],wrt)-fyv*d(G[1],wrt)),why:'The branches add; they do not subtract.'},
         {a:String(Math.round(ev(f,{x:x0,y:y0}))),why:'That is z itself at the point, not its rate of change.'}],
    how:`∂z/∂${wrt} = z_x·∂x/∂${wrt} + z_y·∂y/∂${wrt}.`,
    sol:[['Point.',X`(x,y)=(${x0},${y0})`],['Partials of z there.',X`z_x=${tex(Fx)}=${fxv},\qquad z_y=${tex(Fy)}=${fyv}`],
         ['Inner partials.',X`\frac{\partial x}{\partial ${wrt}}=${d(G[0],wrt)},\qquad \frac{\partial y}{\partial ${wrt}}=${d(G[1],wrt)}`],['Chain rule.',X`\frac{\partial z}{\partial ${wrt}}=(${fxv})(${d(G[0],wrt)})+(${fyv})(${d(G[1],wrt)})=${val}`]],
    chk:{op:'chain2',e:{f,x:G[0],y:G[1]},n:{s0,t0,wrt}}};
});

add('implicit2','Chain rule','15.4',()=>{
  const tm=[tMono(nz(-3,3),ri(1,2),ri(1,2)),tMono(nz(-3,3),0,ri(1,3)),tMono(nz(-3,3),ri(1,3),0)], F=sumT(tm,'f'), Fx=sumT(tm,'fx'), Fy=sumT(tm,'fy');
  if(coin(0.35)){
    const ans=`-(${Fx})/(${Fy})`;
    return {q:`Assume ${m`${tex(F)}=C`} defines ${m`y`} as a differentiable function of ${m`x`}. Find ${m`\frac{dy}{dx}`}.`,kind:'expr',vars:['x','y'],ans,lv:2,
      dis:[{a:`(${Fx})/(${Fy})`,why:'Missing the minus sign: dy/dx = −F_x/F_y.'},{a:`-(${Fy})/(${Fx})`,why:'Upside down: F_x goes on top.'},{a:`-(${Fx})`,why:'Divide by F_y.'}],
      how:'dy/dx = −F_x / F_y',sol:[['Partials of F.',X`F_x=${tex(Fx)},\qquad F_y=${tex(Fy)}`],['',X`\frac{dy}{dx}=-\frac{F_x}{F_y}=${tex(ans)}`]],chk:{op:'implicit',e:{F},n:{}}};
  }
  const P=[nz(-2,2),nz(-2,2)], env={x:P[0],y:P[1]}, C=Math.round(ev(F,env)), fx=Math.round(ev(Fx,env)), fy=Math.round(ev(Fy,env)); if(!fy||!fx) return null;
  const ans=frac(-fx,fy);
  return {q:`The curve ${m`${tex(F)}=${C}`} passes through ${mp(P)}. Find ${m`\frac{dy}{dx}`} there.`,kind:'expr',ans,lv:2,
    dis:[{a:frac(fx,fy),why:'Missing the minus sign: dy/dx = −F_x/F_y.'},{a:frac(-fy,fx),why:'Upside down: F_x goes on top.'},{a:String(-fx),why:'Divide by F_y.'}],
    how:'dy/dx = −F_x / F_y at the point.',
    sol:[['Partials of F at the point.',X`F_x=${tex(Fx)}=${fx},\qquad F_y=${tex(Fy)}=${fy}`],['',X`\frac{dy}{dx}=-\frac{${fx}}{${fy}}=${tex(ans)}`]],chk:{op:'implicit',e:{F},n:{P}}};
});

add('implicit3','Chain rule','15.4',()=>{
  const c=[nz(-3,3),nz(-3,3),nz(-3,3)], e=[ri(1,2),ri(1,2),ri(1,3)];
  const F=sumS([mono(c[0],{x:e[0],y:1}),mono(c[1],{y:1,z:e[1]}),mono(c[2],{x:1,z:e[2]})]);
  const P=[nz(-2,2),nz(-2,2),nz(-2,2)], env={x:P[0],y:P[1],z:P[2]};
  const pd=v=>{ const a={...env},b={...env}; a[v]+=1e-6; b[v]-=1e-6; return Math.round((ev(F,a)-ev(F,b))/2e-6); };
  const w=coin()?'x':'y', fw=pd(w), fz=pd('z'); if(!fz||!fw) return null;
  const C=Math.round(ev(F,env)), ans=frac(-fw,fz);
  return {q:`The surface ${m`${tex(F)}=${C}`} passes through ${mp(P)}, and near that point it defines ${m`z`} as a function of ${m`x`} and ${m`y`}. Find ${m`\frac{\partial z}{\partial ${w}}`} there.`,kind:'expr',ans,lv:3,
    dis:[{a:frac(fw,fz),why:'Missing the minus sign: ∂z/∂'+w+' = −F_'+w+'/F_z.'},{a:frac(-fz,fw),why:'Upside down.'},{a:frac(-pd(w==='x'?'y':'x'),fz),why:'Used the other variable’s partial.'}],
    how:`∂z/∂${w} = −F_${w} / F_z at the point.`,
    sol:[['Partials of F at the point.',X`F_${w}=${fw},\qquad F_z=${fz}`],['',X`\frac{\partial z}{\partial ${w}}=-\frac{${fw}}{${fz}}=${tex(ans)}`]],chk:{op:'implicit3',e:{F},n:{P,w}}};
});

/* ---------------- 15.5 Gradient & directional derivatives ---------------- */
/* pick f from the bank and a point where f, f_x, f_y are all rational */
function gradPoint(pool){
  for(let k=0;k<30;k++){
    const T=[randMono(),pick(pool||[tExp,tTrig,tXexp,tLn,tSqrt,randMono,randMono])()];
    const P=[ri(-2,3),ri(-2,3)], env={x:P[0],y:P[1]}, fstr=sumT(T,'f');
    if(!/x/.test(fstr)||!/y/.test(fstr)) continue;
    const g=[EXACT(sumT(T,'fx'),env),EXACT(sumT(T,'fy'),env)], fv=EXACT(sumT(T,'f'),env);
    if(g[0]===null||g[1]===null||fv===null) continue;
    if(g[0]==='0'&&g[1]==='0') continue;
    const GG=g.map(parseR); if(GG.some(r=>Math.abs(r[0])>24||r[1]>6)) continue;   /* keep exam-sized numbers */
    return {T,P,g,G:GG,fv,f:sumT(T,'f'),fx:sumT(T,'fx'),fy:sumT(T,'fy')};
  }
  return null;
}
const lcmR=G=>G.reduce((l,r)=>l*r[1]/gcd(l,r[1]),1);
add('grad2','Gradient','15.5',()=>{
  const o=gradPoint(); if(!o) return null;
  const ans=V(...o.g);
  return {q:`Find ${m`\nabla f(${o.P[0]},${o.P[1]})`} for ${m`f(x,y)=${tex(o.f)}`}.`,kind:'vec',ans,lv:1,
    dis:[{a:V(o.g[1],o.g[0]),why:'Components swapped: ∇f = ⟨f_x, f_y⟩.'},{a:V(o.g[0],o.fv),why:'The second component should be f_y, not f.'},
         {a:V(...o.g.map(x=>frac(-parseR(x)[0],parseR(x)[1]))),why:'Sign slip.'}].concat((()=>{ const tr=[EXACT(sumS([o.T[0].fxT,o.T[1].fx]),{x:o.P[0],y:o.P[1]}),EXACT(sumS([o.T[0].fy,o.T[1].fyT]),{x:o.P[0],y:o.P[1]})]; return tr[0]!==null&&tr[1]!==null?[{a:V(...tr),why:'A partial-derivative slip: hold the other variable constant and use the chain rule.'}]:[]; })()),
    how:'∇f = ⟨f_x, f_y⟩ evaluated at the point.',
    sol:[['Partials.',X`f_x=${tex(o.fx)},\qquad f_y=${tex(o.fy)}`],['Evaluate.',X`\nabla f(${o.P[0]},${o.P[1]})=${tex(ans)}`]],chk:{op:'grad',e:{f:o.f},n:{P:o.P}}};
});

const ANG=[['0',[1,1,1],[0,1,1]],['pi/6',[1,2,3],[1,2,1]],['pi/4',[1,2,2],[1,2,2]],['pi/3',[1,2,1],[1,2,3]],['pi/2',[0,1,1],[1,1,1]],['2pi/3',[-1,2,1],[1,2,3]],
           ['3pi/4',[-1,2,2],[1,2,2]],['5pi/6',[-1,2,3],[1,2,1]],['pi',[-1,1,1],[0,1,1]],['4pi/3',[-1,2,1],[-1,2,3]],['3pi/2',[0,1,1],[-1,1,1]],['7pi/4',[1,2,2],[-1,2,2]]];
add('dirderiv','Gradient','15.5',()=>{
  const o=gradPoint(); if(!o) return null; const [g1,g2]=o.G;
  if(coin(0.55)){
    const v=rv(2,-4,4), n=n2(v), num=[g1[0]*g2[1]*v[0]+g2[0]*g1[1]*v[1],g1[1]*g2[1]];   /* g·v as p/q */
    const ans=surd(num[0],num[1]*n,n);
    return {q:`Find the directional derivative of ${m`f(x,y)=${tex(o.f)}`} at ${mp(o.P)} in the direction of ${m`\mathbf v=${vt(v)}`}.`,kind:'expr',ans,lv:2,
      dis:[{a:frac(num[0],num[1]),why:'Used v without normalizing it: the direction must be the unit vector v/|v|.'},{a:frac(num[0],num[1]*n),why:'Divided by |v|² instead of |v|.'},
           {a:surd(1,g1[1]*g2[1],(g1[0]*g2[1])**2+(g2[0]*g1[1])**2),why:'That is |∇f|, the maximum rate, not the rate in this direction.'},
           {a:surd(g1[0]*g2[1]*v[1]+g2[0]*g1[1]*v[0],num[1]*n,n),why:'Paired f_x with v₂ and f_y with v₁.'}],
      how:'D_u f = ∇f · u with u = v/|v|.',
      sol:[['Gradient at the point.',X`\nabla f=${tex(V(...o.g))}`],['Unit direction.',X`\mathbf u=\frac{${vt(v)}}{\sqrt{${n}}}`],['Dot product.',X`D_{\mathbf u}f=${tex(V(...o.g))}\cdot\frac{${vt(v)}}{\sqrt{${n}}}=${tex(ans)}`]],
      chk:{op:'dirderiv',e:{f:o.f,v:vint(v)},n:{P:o.P}}};
  }
  const A=pick(ANG), cs=(t)=>t[1]===0?[0,1]:[t[0],t[1]];
  const term=(g,t)=>t[0]===0?'0':surd(g[0]*t[0],g[1]*t[1],t[2]);
  const ans=sumS([term(g1,A[1]),term(g2,A[2])]);
  const swap=sumS([term(g2,A[1]),term(g1,A[2])]);
  return {q:`Find the directional derivative of ${m`f(x,y)=${tex(o.f)}`} at ${mp(o.P)} in the direction of the unit vector that makes angle ${mk('theta = '+A[0])} with the positive x-axis.`,kind:'expr',ans,lv:2,
    dis:[{a:swap,why:'u = ⟨cos θ, sin θ⟩: f_x pairs with cos θ, f_y with sin θ.'},{a:sumS([term(g1,A[2]),term(g2,A[1])]),why:'Mixed up cos θ and sin θ.'},{a:sumS([o.g[0],o.g[1]]),why:'Left out the direction entirely.'}],
    how:'D_u f = f_x cos θ + f_y sin θ.',
    sol:[['Gradient and unit direction.',X`\nabla f=${tex(V(...o.g))},\qquad \mathbf u=\langle\cos ${tex(A[0])},\ \sin ${tex(A[0])}\rangle`],['Dot product.',X`D_{\mathbf u}f=${tex(ans)}`]],
    chk:{op:'dirderiv',e:{f:o.f,th:A[0]},n:{P:o.P}}};
});

add('steepest','Gradient','15.5',()=>{
  const o=gradPoint(); if(!o) return null;
  const L=lcmR(o.G), gi=o.G.map(r=>r[0]*L/r[1]), gr=reduceInt(gi), n=n2(gr);
  const ask=pick(['rate','up','down']);
  if(ask==='rate'){ const S=(o.G[0][0]**2)*(o.G[1][1]**2)+(o.G[1][0]**2)*(o.G[0][1]**2), D=(o.G[0][1]*o.G[1][1]); const ans=surd(1,D,S);
    return {q:`At ${mp(o.P)}, what is the maximum rate of increase of ${m`f(x,y)=${tex(o.f)}`}?`,kind:'expr',ans,lv:2,
      dis:[{a:frac(S,D*D),why:'That is |∇f|²; take the square root.'},{a:toFrac(ev(o.g[0])+ev(o.g[1])),why:'The maximum rate is |∇f|, not f_x + f_y.'},{a:V(...o.g),why:'That is the direction (∇f); the rate is its length.'}],
      how:'The maximum rate of increase is |∇f(P)|, in the direction of ∇f.',
      sol:[['Gradient.',X`\nabla f=${tex(V(...o.g))}`],['Its length.',X`|\nabla f|=${tex(ans)}`]],chk:{op:'steepest',e:{f:o.f},n:{P:o.P,ask}}};
  }
  const sg=ask==='up'?1:-1, ans=V(...gr.map(x=>rsq(sg*x,n))), neg=V(...gr.map(x=>rsq(-sg*x,n)));
  return {q:`Find the unit vector in the direction of steepest ${ask==='up'?'ascent':'descent'} of ${m`f(x,y)=${tex(o.f)}`} at ${mp(o.P)}.`,kind:'vec',ans,lv:2,
    dis:[{a:neg,why:ask==='up'?'Steepest ascent is along +∇f.':'Steepest descent is along −∇f.'},{a:V(...o.g.map(x=>sg>0?x:frac(-parseR(x)[0],parseR(x)[1]))),why:'Not a unit vector: divide by |∇f|.'},
         {a:V(...[-gr[1],gr[0]].map(x=>rsq(x,n))),why:'That direction is perpendicular to ∇f: zero change, along the level curve.'}],
    how:`Steepest ${ask==='up'?'ascent: +':'descent: −'}∇f/|∇f|.`,
    sol:[['Gradient.',X`\nabla f=${tex(V(...o.g))}\ \parallel\ ${vt(gr)}`],['Normalize.',X`${sg<0?'-':''}\frac{${vt(gr)}}{\sqrt{${n}}}=${tex(ans)}`]],chk:{op:'steepest',e:{f:o.f},n:{P:o.P,ask}}};
});

add('zero-change','Gradient','15.5',()=>{
  const o=gradPoint(); if(!o) return null;
  const L=lcmR(o.G), gr=reduceInt(o.G.map(r=>r[0]*L/r[1])), n=n2(gr);
  const u=[-gr[1],gr[0]], ans=V(...u.map(x=>rsq(x,n))), neg=V(...u.map(x=>rsq(-x,n)));
  return {q:`Find a unit vector ${m`\mathbf u`} such that ${m`f(x,y)=${tex(o.f)}`} has zero change at ${mp(o.P)} in the direction ${m`\mathbf u`}. (Either answer is accepted.)`,kind:'vec',ans,alts:[neg],lv:2,
    dis:[{a:V(...gr.map(x=>rsq(x,n))),why:'That is the direction of steepest ascent; zero change is perpendicular to ∇f.'},{a:vint(u),why:'Right direction, but not a unit vector.'},
         {a:V(...[gr[1],gr[0]].map(x=>rsq(x,n))),why:'Swapping components is not enough: ⟨a, b⟩ ⟂ ⟨−b, a⟩.'},
         {a:V(...gr.map(x=>rsq(-x,n))),why:'That is the direction of steepest descent; zero change is perpendicular to ∇f.'},{a:vint(gr),why:'That is ∇f itself (not even a unit vector).'}],
    how:'D_u f = 0 ⇔ u ⟂ ∇f: u = ±⟨−f_y, f_x⟩/|∇f|.',
    sol:[['Gradient direction.',X`\nabla f\ \parallel\ ${vt(gr)}`],['Rotate by 90° and normalize.',X`\mathbf u=\pm\frac{${vt(u)}}{\sqrt{${n}}}`]],chk:{op:'zerochange',e:{f:o.f},n:{P:o.P}}};
});

add('grad3','Gradient','15.5',()=>{
  const c=nz(-3,3), p=[ri(1,2),ri(0,2),ri(1,2)], b=nz(-3,3);
  const f=sumS([mono(c,{x:p[0],y:p[1],z:p[2]}),mono(b,{y:2}),pick(['x*z','-y*z','x','2*z^2'])]);
  const P=[ri(-2,2),ri(-2,2),ri(-2,2)], env={x:P[0],y:P[1],z:P[2]};
  const pd=v=>{ const a={...env},bb={...env}; a[v]+=1e-6; bb[v]-=1e-6; return Math.round((ev(f,a)-ev(f,bb))/2e-6); };
  const g=[pd('x'),pd('y'),pd('z')]; if(!n2(g)) return null;
  if(coin()){
    return {q:`Find ${m`\nabla f(${P.join(',')})`} for ${m`f(x,y,z)=${tex(f)}`}.`,kind:'vec',ans:vint(g),lv:2,
      dis:[{a:vint([g[1],g[0],g[2]]),why:'Components out of order: ⟨f_x, f_y, f_z⟩.'},{a:vint(g.map(x=>-x)),why:'Sign slip.'},{a:vint([g[0],g[1],Math.round(ev(f,env))]),why:'The last component is f_z, not f.'}],
      how:'∇f = ⟨f_x, f_y, f_z⟩', sol:[['Partials at the point.',X`\nabla f(${P.join(',')})=${vt(g)}`]],chk:{op:'grad',e:{f},n:{P}}};
  }
  const v=rv(3,-3,3), n=n2(v), d=dotA(g,v), ans=surd(d,n,n);
  return {q:`Find the directional derivative of ${m`f(x,y,z)=${tex(f)}`} at ${mp(P)} in the direction of ${m`\mathbf v=${vt(v)}`}.`,kind:'expr',ans,lv:3,
    dis:[{a:String(d),why:'Normalize v first.'},{a:frac(d,n),why:'Divided by |v|² instead of |v|.'},{a:sqrtS(n2(g)),why:'That is |∇f|, the maximum rate.'}],
    how:'D_u f = ∇f · v/|v|', sol:[['Gradient.',X`\nabla f=${vt(g)}`],['Dot with the unit vector.',X`\frac{${vt(g)}\cdot${vt(v)}}{\sqrt{${n}}}=\frac{${d}}{\sqrt{${n}}}=${tex(ans)}`]],
    chk:{op:'dirderiv',e:{f,v:vint(v)},n:{P}}};
});

add('level-tanline','Gradient','15.5',()=>{
  const o=gradPoint([randMono,randMono,tSqrt,tExp]); if(!o) return null;
  const L=lcmR(o.G), gr=reduceInt(o.G.map(r=>r[0]*L/r[1]));
  const d=gr[0]*o.P[0]+gr[1]*o.P[1];
  const E=(n,c)=>`${sumS([mono(n[0],{x:1}),mono(n[1],{y:1})])} = ${c}`;
  const ans=E(gr,d);
  return {q:`Find an equation of the line tangent to the level curve of ${m`f(x,y)=${tex(o.f)}`} through ${mp(o.P)}.`,kind:'eq',eqVars:['x','y'],ans,lv:3,
    dis:[{a:E([gr[1],-gr[0]],gr[1]*o.P[0]-gr[0]*o.P[1]),why:'∇f is NORMAL to the level curve: use it as ⟨a, b⟩ in a(x − x₀) + b(y − y₀) = 0.'},
         {a:E(gr,-d||d+3),why:'Sign slip in the constant.'},{a:E(o.P.some(x=>x)?o.P:[1,1],n2(o.P)||2),why:'Used the point as the normal vector.'}],
    how:'∇f(P) is perpendicular to the level curve: f_x(P)(x − x₀) + f_y(P)(y − y₀) = 0.',
    sol:[['Gradient at P (normal to the level curve).',X`\nabla f=${tex(V(...o.g))}\ \parallel\ ${vt(gr)}`],['Line with that normal through P.',tex(ans)]],chk:{op:'leveltan',e:{f:o.f},n:{P:o.P}}};
});

/* ---------------- 15.6 Tangent planes & linear approximation ---------------- */
add('tp-graph','Tangent planes','15.6',()=>{
  const o=gradPoint([randMono,randMono,tExp,tSqrt,tLn,tXexp]); if(!o) return null;
  const f0=parseR(o.fv), G=o.G, L=lcmR([G[0],G[1],f0]);
  const A=G[0][0]*L/G[0][1], B=G[1][0]*L/G[1][1], F0=f0[0]*L/f0[1];
  const ans=planeKey([A,B,-L],A*o.P[0]+B*o.P[1]-F0);
  return {q:`Find an equation of the plane tangent to ${m`z=${tex(o.f)}`} at the point where ${m`(x,y)=(${o.P[0]},${o.P[1]})`}.`,kind:'eq',ans,lv:2,
    dis:[{a:planeKey([A,B,-L],A*o.P[0]+B*o.P[1]+F0),why:'Sign slip with f(a, b): z − f(a,b) = f_x(x − a) + f_y(y − b).'},{a:planeKey([B||1,A||1,-L],B*o.P[0]+A*o.P[1]-F0),why:'Swapped f_x and f_y.'},
         {a:planeKey([A,B,-L],-F0),why:'Forgot to shift x and y by the point: (x − a), (y − b).'},{a:planeKey([A,B,L],A*o.P[0]+B*o.P[1]+F0),why:'The z term has the wrong sign.'}],
    how:'z = f(a,b) + f_x(a,b)(x − a) + f_y(a,b)(y − b)',
    sol:[['Value and partials at (a, b).',X`f=${tex(o.fv)},\qquad f_x=${tex(o.g[0])},\qquad f_y=${tex(o.g[1])}`],
         ['Tangent plane.',X`z=${tex(o.fv)}+${tex(o.g[0])}(x-${fmtC(o.P[0])})+${tex(o.g[1])}(y-${fmtC(o.P[1])})`],['Tidied (any multiple is fine).',tex(ans)]],
    chk:{op:'tpgraph',e:{f:o.f},n:{P:o.P}}};
});

add('tp-surface','Tangent planes','15.6',()=>{
  const a=ri(1,3), b=ri(1,3), c=ri(1,3);
  const S=pick([`${a}*x^2 + ${b}*y^2 + ${c}*z^2`,`x*y*z`,`x^2 + y^2 - z^2`,`x*y + y*z + x*z`,`${a}*x^2 - y^2 + ${c}*z`,`x^2*y + z^2`]);
  const P=[nz(-2,2),nz(-2,2),nz(-2,2)], env={x:P[0],y:P[1],z:P[2]}, K=Math.round(ev(S,env));
  const pd=v=>{ const p={...env},q={...env}; p[v]+=1e-6; q[v]-=1e-6; return Math.round((ev(S,p)-ev(S,q))/2e-6); };
  const n=[pd('x'),pd('y'),pd('z')]; if(!n2(n)) return null;
  const ans=planeKey(n,dotA(n,P));
  return {q:`Find an equation of the plane tangent to the surface ${m`${tex(S)}=${K}`} at ${mp(P)}.`,kind:'eq',ans,lv:2,
    dis:[{a:planeKey(P,n2(P)),why:'Used the point as the normal; the normal is ∇F(P).'},{a:planeKey(n,-dotA(n,P)||5),why:'Sign slip in the constant.'},
         {a:planeKey(n,K),why:'The constant is ∇F(P) · P, not the level value.'}].filter(d=>d.a!==ans),
    how:'The normal is ∇F(P): F_x(x − x₀) + F_y(y − y₀) + F_z(z − z₀) = 0.',
    sol:[['Gradient of F at the point.',X`\nabla F=${vt(n)}`],['Plane through P with that normal.',tex(ans)]],chk:{op:'tpsurf',e:{F:S},n:{P}}};
});

add('linapprox','Tangent planes','15.6',()=>{
  const B=pick([
    ()=>{ const t=pick([[3,4],[4,3],[6,8],[8,6]]); return {f:'sqrt(x^2 + y^2)',P:t,f0:[Math.hypot(...t),1],fx:[t[0],Math.hypot(...t)],fy:[t[1],Math.hypot(...t)]}; },
    ()=>{ const a=ri(1,4); return {f:'x*e^y',P:[a,0],f0:[a,1],fx:[1,1],fy:[a,1]}; },
    ()=>{ const a=ri(1,3), b=2*a-1; return {f:'ln(2*x - y)',P:[a,b],f0:[0,1],fx:[2,1],fy:[-1,1]}; },
    ()=>{ const a=ri(1,3), b=ri(1,3); return {f:'x^2*y',P:[a,b],f0:[a*a*b,1],fx:[2*a*b,1],fy:[a*a,1]}; }])();

  const dx=pick([0.1,-0.1,0.02,-0.02,0.05,-0.05,0.01,-0.03]), dy=pick([0.1,-0.1,0.02,-0.02,0.04,-0.04,0.01,0.03]);
  const DX=Math.round(dx*100), DY=Math.round(dy*100);                       /* hundredths */
  /* L = f0 + fx·dx + fy·dy as an exact rational */
  const q=B.f0[1]*B.fx[1]*B.fy[1]*100, p=B.f0[0]*B.fx[1]*B.fy[1]*100+B.fx[0]*B.f0[1]*B.fy[1]*DX+B.fy[0]*B.f0[1]*B.fx[1]*DY;
  const ans=decS(p,q), x1=+(B.P[0]+dx).toFixed(2), y1=+(B.P[1]+dy).toFixed(2);
  const bad=(sx,sy)=>decS(B.f0[0]*B.fx[1]*B.fy[1]*100+sx*B.fx[0]*B.f0[1]*B.fy[1]*DX+sy*B.fy[0]*B.f0[1]*B.fx[1]*DY,q);
  return {q:`Use the linear approximation of ${m`f(x,y)=${tex(B.f)}`} at ${mp(B.P)} to estimate ${m`f(${x1},\ ${y1})`}. Enter the exact value of the approximation (a fraction or exact decimal).`,
    kind:'expr',ans,lv:2,
    dis:[{a:bad(1,-1),why:'Sign slip on Δy.'},{a:frac(B.f0[0],B.f0[1]),why:'That is f(a, b) alone; add f_x·Δx + f_y·Δy.'},{a:decS(B.fx[0]*B.f0[1]*B.fy[1]*DX+B.fy[0]*B.f0[1]*B.fx[1]*DY,q),why:'That is only the change dz; add it to f(a, b).'},
         {a:decS(B.f0[0]*B.fx[1]*B.fy[1]*100+B.fx[0]*B.f0[1]*B.fy[1]*DY+B.fy[0]*B.f0[1]*B.fx[1]*DX,q),why:'Paired f_x with Δy and f_y with Δx.'}],
    how:'f(a + Δx, b + Δy) ≈ f(a,b) + f_x(a,b)Δx + f_y(a,b)Δy',
    sol:[['Value and partials at the base point.',X`f=${tex(fS(B.f0))},\qquad f_x=${tex(fS(B.fx))},\qquad f_y=${tex(fS(B.fy))}`],
         ['Linear approximation.',X`L=${tex(fS(B.f0))}+${tex(fS(B.fx))}(${dx})+${tex(fS(B.fy))}(${dy})=${tex(ans)}`]],
    chk:{op:'linapprox',e:{f:B.f},n:{P:B.P,dx,dy}}};
});

add('differential','Tangent planes','15.6',()=>{
  const o=gradPoint([randMono,randMono,tExp]); if(!o) return null;
  const dx=pick([0.1,-0.1,0.2,0.05,-0.05,0.01]), dy=pick([0.1,-0.2,0.02,-0.05,0.03]);
  const G=o.G, q=G[0][1]*G[1][1]*100, p=G[0][0]*G[1][1]*Math.round(dx*100)+G[1][0]*G[0][1]*Math.round(dy*100);
  const ans=decS(p,q); if(ans==='0') return null;
  return {q:`Let ${m`z=${tex(o.f)}`}. Use differentials to approximate the change in ${m`z`} when ${m`(x,y)`} moves from ${mp(o.P)} by ${m`dx=${dx}`}, ${m`dy=${dy}`}. Give the exact value of ${m`dz`}.`,kind:'expr',ans,lv:2,
    dis:[{a:decS(G[0][0]*G[1][1]*Math.round(dy*100)+G[1][0]*G[0][1]*Math.round(dx*100),q),why:'Paired f_x with dy.'},{a:decS(G[0][0]*G[1][1]*Math.round(dx*100)-G[1][0]*G[0][1]*Math.round(dy*100),q),why:'Sign slip on the second term.'},
         {a:decS(G[0][0]*G[1][1]+G[1][0]*G[0][1],G[0][1]*G[1][1]),why:'Forgot to multiply by dx and dy.'}],
    how:'dz = f_x dx + f_y dy',sol:[['Partials at the point.',X`f_x=${tex(o.g[0])},\qquad f_y=${tex(o.g[1])}`],['',X`dz=${tex(o.g[0])}(${dx})+${tex(o.g[1])}(${dy})=${tex(ans)}`]],
    chk:{op:'differential',e:{f:o.f},n:{P:o.P,dx,dy}}};
});

/* ---------------- 15.7 Max & min ---------------- */
function critFamily(){
  const a=ri(1,3), b=ri(1,3), k=pick([1,2,3]), p=ri(-3,3), q=ri(-3,3);
  return pick([
    ()=>{ const A=ri(1,3)*pick([1,-1]), C=ri(1,3)*pick([1,1,-1]), Bc=ri(-2,2); if(4*A*C-Bc*Bc===0) return null;
      /* f = A(x−p)² + B(x−p)(y−q) + C(y−q)² expanded */
      const f=sumS([mono(A,{x:2}),mono(Bc,{x:1,y:1}),mono(C,{y:2}),mono(-2*A*p-Bc*q,{x:1}),mono(-Bc*p-2*C*q,{y:1})]);
      return {f,pts:[[p,q]]}; },
    ()=>({f:sumS([`x^3`,mono(-3*a*a,{x:1}),'y^2',mono(-2*q,{y:1})]),pts:[[a,q],[-a,q]]}),
    ()=>({f:sumS(['x^3','y^3',mono(-3*k,{x:1,y:1})]),pts:[[0,0],[k,k]]}),
    ()=>({f:'x^4 + y^4 - 4*x*y + 1',pts:[[0,0],[1,1],[-1,-1]]}),
    ()=>({f:sumS(['x^3',mono(-3*a*a,{x:1}),'y^3',mono(-3*b*b,{y:1})]),pts:[[a,b],[a,-b],[-a,b],[-a,-b]]}),
    ()=>({f:sumS([mono(3*k,{x:1,y:1}),'-x^2*y','-x*y^2']),pts:[[0,0],[3*k,0],[0,3*k],[k,k]]})])();
}
add('crit-points','Max & min','15.7',()=>{
  const F=critFamily(); if(!F) return null;
  const ans=F.pts.map(p=>P3(...p)).join(', ');
  const sub=F.pts.length>1?F.pts.slice(0,-1):[[F.pts[0][0]+1,F.pts[0][1]]];
  return {q:`Find all critical points of ${m`f(x,y)=${tex(F.f)}`}.`,kind:'points',ans,lv:F.pts.length>2?3:2,
    dis:[{a:sub.map(p=>P3(...p)).join(', '),why:F.pts.length>1?'A critical point is missing: solve f_x = 0 and f_y = 0 completely (consider every case).':'Arithmetic slip solving the system.'},
         {a:(()=>{ const key=F.pts.map(p=>P3(...p)).sort().join('|'), flip=F.pts.map(p=>P3(-p[0],-p[1])); return flip.slice().sort().join('|')===key?F.pts.map(p=>P3(p[0]+1,-p[1])).join(', '):flip.join(', '); })(),why:'Sign slip solving f_x = 0, f_y = 0.'},
         {a:F.pts.concat([[F.pts[0][0]+2,F.pts[0][1]-1]]).map(p=>P3(...p)).join(', '),why:'One of these does not satisfy both equations.'}],
    how:'Solve f_x = 0 and f_y = 0 simultaneously.',
    sol:[['Set both partial derivatives to zero.',X`f_x=0,\qquad f_y=0`],['Solve the system (check every case when you factor).',tex(ans)]],chk:{op:'crit',e:{f:F.f}}};
});

add('crit-classify','Max & min','15.7',()=>{
  let F=null; for(let i=0;i<10&&!F;i++) F=critFamily(); if(!F) return null;
  const inconc=coin(0.12);
  let f=F.f, P=pick(F.pts);
  if(inconc){ const k=ri(1,3); f=pick([`x^4 + ${k}*y^2`,`-x^4 - ${k}*y^2`,`x^4 - ${k}*y^2`,`x^3 + ${k}*y^2`]); P=[0,0]; }
  const h=1e-4, e=(x,y)=>ev(f,{x,y}), [x0,y0]=P;
  const fxx=Math.round((e(x0+h,y0)-2*e(x0,y0)+e(x0-h,y0))/(h*h)), fyy=Math.round((e(x0,y0+h)-2*e(x0,y0)+e(x0,y0-h))/(h*h));
  const fxy=Math.round((e(x0+h,y0+h)-e(x0+h,y0-h)-e(x0-h,y0+h)+e(x0-h,y0-h))/(4*h*h)), D=fxx*fyy-fxy*fxy;
  const cls=D>0?(fxx>0?'Local minimum':'Local maximum'):D<0?'Saddle point':'The Second Derivative Test is inconclusive';
  const W={'Local minimum':'Needs D > 0 and f_xx > 0.','Local maximum':'Needs D > 0 and f_xx < 0.','Saddle point':'Needs D < 0.','The Second Derivative Test is inconclusive':'Only when D = 0.'};
  const opts=['Local minimum','Local maximum','Saddle point','The Second Derivative Test is inconclusive'].map(h=>({h,ok:h===cls,why:W[h]}));
  return {q:`${mp(P)} is a critical point of ${m`f(x,y)=${tex(f)}`}. What does the Second Derivative Test say about it?`,kind:'choice',opts,ans:cls,lv:2,
    how:'D = f_xx f_yy − f_xy². D > 0: min if f_xx > 0, max if f_xx < 0. D < 0: saddle. D = 0: inconclusive.',
    sol:[['Second partials at the point.',X`f_{xx}=${fxx},\qquad f_{yy}=${fyy},\qquad f_{xy}=${fxy}`],['Discriminant.',X`D=(${fxx})(${fyy})-(${fxy})^2=${D}`],['',X`\text{${cls}}`]],
    chk:{op:'classify',e:{f},n:{P,cls}}};
});

add('second-test','Max & min','15.7',()=>{
  const fxx=nz(-6,6), fyy=nz(-6,6), fxy=ri(-5,5), D=fxx*fyy-fxy*fxy;
  const cls=D>0?(fxx>0?'Local minimum':'Local maximum'):D<0?'Saddle point':'The Second Derivative Test is inconclusive';
  const W={'Local minimum':'Needs D > 0 and f_xx > 0.','Local maximum':'Needs D > 0 and f_xx < 0.','Saddle point':'Needs D < 0.','The Second Derivative Test is inconclusive':'Only when D = 0.'};
  const opts=['Local minimum','Local maximum','Saddle point','The Second Derivative Test is inconclusive'].map(h=>({h,ok:h===cls,why:W[h]}));
  return {q:`At a critical point ${m`P`} of ${m`f`}: ${m`f_{xx}(P)=${fxx}`}, ${m`f_{yy}(P)=${fyy}`}, ${m`f_{xy}(P)=${fxy}`}. Classify ${m`P`}.`,kind:'choice',opts,ans:cls,lv:1,
    how:'D = f_xx f_yy − f_xy².',sol:[['Discriminant.',X`D=(${fxx})(${fyy})-(${fxy})^2=${D}`],['',X`\text{${cls}}`]],chk:{op:'classify2',n:{fxx,fyy,fxy,cls}}};
});

add('abs-extrema','Max & min','15.7',()=>{
  const A=pick([1,1,2,-1,-2]), Bq=pick([1,1,2,-1,-2]), C=pick([0,0,1,-1]), D=ri(-4,4), E=ri(-4,4), F0=ri(-3,3);
  const f=sumS([mono(A,{x:2}),mono(Bq,{y:2}),mono(C,{x:1,y:1}),mono(D,{x:1}),mono(E,{y:1}),String(F0)]);
  const fv=(x,y)=>A*x*x+Bq*y*y+C*x*y+D*x+E*y+F0;
  const tri=coin(0.4); let cand=[], region;
  const q1=(a2,a1,a0,lo,hi,mk)=>{ cand.push(mk(lo),mk(hi)); if(a2!==0){ const s=-a1/(2*a2); if(s>lo&&s<hi) cand.push(mk(s)); } };
  if(!tri){ const x1=ri(-2,0), x2=x1+ri(1,3), y1=ri(-2,0), y2=y1+ri(1,3);
    region=`the rectangle ${m`${x1}\le x\le ${x2},\ ${y1}\le y\le ${y2}`}`;
    q1(Bq,C*x1+E,0,y1,y2,s=>[x1,s]); q1(Bq,C*x2+E,0,y1,y2,s=>[x2,s]); q1(A,C*y1+D,0,x1,x2,s=>[s,y1]); q1(A,C*y2+D,0,x1,x2,s=>[s,y2]);
    const det=4*A*Bq-C*C; if(det){ const xc=(-D*2*Bq+C*E)/det, yc=(-2*A*E+C*D)/det; if(xc>x1&&xc<x2&&yc>y1&&yc<y2) cand.push([xc,yc]); }
    var R_={type:'rect',x1,x2,y1,y2}; }
  else { const a=ri(2,4); region=`the closed triangle with vertices ${mp([0,0])}, ${mp([a,0])}, ${mp([0,a])}`;
    q1(Bq,E,0,0,a,s=>[0,s]); q1(A,D,0,0,a,s=>[s,0]);
    /* hypotenuse x = s, y = a − s */
    q1(A+Bq-C,C*a-2*Bq*a+D-E,0,0,a,s=>[s,a-s]);
    const det=4*A*Bq-C*C; if(det){ const xc=(-D*2*Bq+C*E)/det, yc=(-2*A*E+C*D)/det; if(xc>0&&yc>0&&xc+yc<a) cand.push([xc,yc]); }
    var R_={type:'tri',a}; }
  const vals=cand.map(p=>fv(p[0],p[1])), mx=Math.max(...vals), mn=Math.min(...vals), ask=coin()?'max':'min';
  const key=toFrac(ask==='max'?mx:mn), other=toFrac(ask==='max'?mn:mx); if(key===null||other===null||mx-mn<1e-9) return null;
  const corners=(tri?[[0,0],[R_.a,0],[0,R_.a]]:[[R_.x1,R_.y1],[R_.x1,R_.y2],[R_.x2,R_.y1],[R_.x2,R_.y2]]).map(p=>fv(...p));
  const cornerBest=toFrac(ask==='max'?Math.max(...corners):Math.min(...corners));
  const det=4*A*Bq-C*C, crit=det?[(-D*2*Bq+C*E)/det,(-2*A*E+C*D)/det]:null, critV=crit?toFrac(fv(...crit)):null;
  const dis=[{a:other,why:`That is the absolute ${ask==='max'?'minimum':'maximum'}.`}];
  if(cornerBest!==key) dis.push({a:cornerBest,why:'Checked only the corners; the edges can have interior extreme points.'});
  if(critV&&critV!==key) dis.push({a:critV,why:'That is the value at the interior critical point (which may be outside the region or not the extreme).'});
  dis.push({a:toFrac((ask==='max'?mx:mn)+1),why:'Arithmetic slip evaluating a candidate.'});
  return {q:`Find the absolute ${ask==='max'?'maximum':'minimum'} value of ${m`f(x,y)=${tex(f)}`} on ${region}.`,kind:'expr',ans:key,lv:3,dis,
    how:'Compare f at interior critical points, at critical points of f restricted to each edge, and at the corners.',
    sol:[['Candidates: interior critical point (if inside), edge critical points, corners.',X`\text{${cand.length} candidate points}`],
         ['Evaluate f at each and compare.',X`\max=${tex(toFrac(mx))},\qquad \min=${tex(toFrac(mn))}`]],
    chk:{op:'absext',e:{f},n:{R:R_,ask}}};
});
