
/* =====================================================================
   12.1 · 13.1–13.6   parametric curves, vectors, dot & cross products,
   lines, planes, quadric surfaces
   ===================================================================== */

/* ---------------- 12.1 Parametric curves ---------------- */
add('par-elim','Parametric curves','12.1',()=>{
  const kind=pick(['line','line','ellipse','circle','power','exp']);
  if(kind==='line'){
    const a=nz(-5,5),b=nz(-4,4),c=nz(-5,5),d=nz(-4,4);
    /* x = a + b t, y = c + d t  ->  d(x - a) = b(y - c)  ->  y = (d/b)x + (c - ad/b) */
    const slope=frac(d,b), icpt=frac(c*b-a*d,b);
    const ans=`y = ${sumS([`${slope}*x`,icpt])}`;
    const q=`Eliminate the parameter: ${m`x=${a}${b<0?'':'+'}${b}t,\ y=${c}${d<0?'':'+'}${d}t`}. Write the curve as an equation in ${m`x`} and ${m`y`}.`;
    return {q,kind:'eq',eqVars:['x','y'],ans,lv:1,
      dis:[{a:`y = ${sumS([`${frac(b,d)}*x`,frac(c*d-a*b,d)])}`,why:'Inverted the slope: solve x for t, t = (x − a)/b, then substitute into y.'},
           {a:`y = ${sumS([`${slope}*x`,frac(c*b+a*d,b)])}`,why:'Sign slip when substituting t = (x − a)/b.'},
           {a:`y = ${sumS([`${d}*x`,String(c)])}`,why:'Replaced t by x without solving for t first.'},
           {a:`y = ${sumS([`${frac(-d,b)}*x`,frac(c*b+a*d,b)])}`,why:'Lost the sign of the slope.'}],
      how:'Solve one equation for t and substitute into the other.',
      sol:[['Solve the x equation for t.',X`t=\frac{x-(${a})}{${b}}`],
           ['Substitute into y and simplify.',X`y=${c}+${fmtC(d)}\cdot\frac{x-(${a})}{${b}}\quad\Rightarrow\quad ${tex(ans)}`]],
      chk:{op:'elim',e:{x:`${a}+${b}*t`,y:`${c}+${d}*t`}}};
  }
  if(kind==='ellipse'||kind==='circle'){
    const A=ri(2,6), B=kind==='circle'?A:pick([2,3,4,5,6,7].filter(x=>x!==A)), h=ri(-4,4), k=ri(-4,4);
    const X_=shift('x',h), Y_=shift('y',k);
    const xs=h?`(${X_})`:'x', ys=k?`(${Y_})`:'y';
    const ans=kind==='circle'?`${xs}^2 + ${ys}^2 = ${A*A}`:`${xs}^2/${A*A} + ${ys}^2/${B*B} = 1`;
    const q=`Eliminate the parameter: ${m`x=${h?h+'+':''}${A}\cos t,\ y=${k?k+'+':''}${B}\sin t`}, ${m`0\le t\le 2\pi`}. Write the curve as an equation in ${m`x`} and ${m`y`}.`;
    const bad1=kind==='circle'?`${xs}^2 + ${ys}^2 = ${A}`:`${xs}^2/${A} + ${ys}^2/${B} = 1`;
    const hs=h?`(${shift('x',-h)})`:'x', ks=k?`(${shift('y',-k)})`:'y';
    return {q,kind:'eq',eqVars:['x','y'],ans,lv:kind==='circle'?1:2,
      dis:[{a:bad1,why:'Divided by a and b instead of a² and b²: (x−h)/a = cos t, so square it.'},
           {a:kind==='circle'?`${hs}^2 + ${ks}^2 = ${A*A}`:`${hs}^2/${A*A} + ${ks}^2/${B*B} = 1`,why:'Center signs flipped: x = h + a cos t gives (x − h).'},
           {a:kind==='circle'?`${xs}^2 - ${ys}^2 = ${A*A}`:`${xs}^2/${B*B} + ${ys}^2/${A*A} = 1`,why:kind==='circle'?'Used cos²t − sin²t; the identity is cos²t + sin²t = 1.':'Swapped which denominator goes with x and y.'},
           {a:`${xs}^2 + ${ys}^2 = 1`,why:'Forgot to divide out the radii before using cos²t + sin²t = 1.'}],
      how:'Isolate cos t and sin t, then use cos²t + sin²t = 1.',
      sol:[['Isolate the trig functions.',X`\cos t=\frac{${tex(X_)}}{${A}},\qquad \sin t=\frac{${tex(Y_)}}{${B}}`],
           ['Square and add: cos²t + sin²t = 1.',tex(ans)]],
      chk:{op:'elim',e:{x:`${h}+${A}*cos(t)`,y:`${k}+${B}*sin(t)`}}};
  }
  if(kind==='power'){
    const c=nz(-4,4), a=nz(-3,3), n=pick([2,3]);
    /* x = t + c, y = a t^n  ->  y = a (x - c)^n */
    const ans=`y = ${a===1?'':a===-1?'-':a+'*'}(${shift('x',c)})^${n}`;
    return {q:`Eliminate the parameter: ${m`x=t${c<0?'':'+'}${c},\ y=${a===1?'':a===-1?'-':a}t^{${n}}`}.`,
      kind:'eq',eqVars:['x','y'],ans,lv:1,
      dis:[{a:`y = ${a===1?'':a===-1?'-':a+'*'}(${shift('x',-c)})^${n}`,why:'t = x − c, not x + c.'},
           {a:`y = ${a}*x^${n} + ${c}`,why:'Substituted t = x and moved the shift outside.'},
           {a:`y = ${a}*(${shift('x',c)})`,why:'Dropped the power on t.'}],
      how:'Solve the simpler equation for t, then substitute.',
      sol:[['Solve for t.',X`t=${tex(shift('x',c))}`],['Substitute.',tex(ans)]],
      chk:{op:'elim',e:{x:`t+${c}`,y:`${a}*t^${n}`}}};
  }
  const k=pick([2,3]), a=ri(2,5);
  /* x = e^t, y = a e^{k t} -> y = a x^k, x > 0 */
  const ans=`y = ${a}*x^${k}`;
  return {q:`Eliminate the parameter: ${m`x=e^{t},\ y=${a}e^{${k}t}`}. (The curve only covers ${m`x>0`}.)`,
    kind:'eq',eqVars:['x','y'],ans,lv:2,range:[0.3,2],
    dis:[{a:`y = ${a*k}*x`,why:'Treated e^{kt} as k·e^t. Use e^{kt} = (e^t)^k.'},{a:`y = ${a}*x + ${k}`,why:'Exponent rules: e^{kt} = (e^t)^k, not e^t + k.'},
         {a:`y = ${a}*ln(x)^${k}`,why:'Substituted t = ln x but then took the log of the wrong thing.'},{a:`y = x^${k}`,why:'Dropped the coefficient.'}],
    how:'Use exponent rules: e^{kt} = (e^t)^k = x^k.',
    sol:[['Rewrite with exponent rules.',X`y=${a}e^{${k}t}=${a}\left(e^{t}\right)^{${k}}`],['Replace e^t by x.',tex(ans)]],
    chk:{op:'elim',e:{x:'exp(t)',y:`${a}*exp(${k}*t)`}}};
});

add('par-circle','Parametric curves','12.1',()=>{
  const R=ri(2,9), T=pick([2,4,6,8,12,10]), ccw=coin(), h=coin(0.4)?ri(-4,4):0, k=h?ri(-4,4):0;
  const w=frac(2,T), wp=+w.split('/')[0], wq=+(w.split('/')[1]||1);   /* angular speed 2π/T = (wp/wq)π */
  const arg=`${wp===1?'':wp}pi*t${wq===1?'':'/'+wq}`;
  const xs=sumS([h?String(h):'0',`${R}*cos(${arg})`]), ys=sumS([k?String(k):'0',`${ccw?'':'-'}${R}*sin(${arg})`]);
  const ans=V(xs,ys);
  const bad=(fx,fy)=>V(sumS([h?String(h):'0',fx]),sumS([k?String(k):'0',fy]));
  return {q:`An object moves around the circle of radius ${R} centered at ${mp([h,k])} at constant speed, `+
      `${ccw?'counterclockwise':'clockwise'}, completing one lap every ${T} time units. At ${m`t=0`} it is at ${mp([h+R,k])}. `+
      `Give its position ${m`\langle x(t),\,y(t)\rangle`}.`,
    kind:'vec',vars:['t'],ans,lv:2,
    dis:[{a:bad(`${R}*cos(${T}*t)`,`${ccw?'':'-'}${R}*sin(${T}*t)`),why:'Used the period T as the angular speed. One lap takes T, so ω = 2π/T.'},
         {a:bad(`${R}*cos(${arg})`,`${ccw?'-':''}${R}*sin(${arg})`),why:`Wrong direction: ${ccw?'counterclockwise needs +sin':'clockwise needs −sin'}.`},
         {a:bad(`${R}*sin(${arg})`,`${ccw?'':'-'}${R}*cos(${arg})`),why:'Swapped sin and cos, so it would start at the top, not at the given point.'},
         {a:bad(`cos(${arg})`,`${ccw?'':'-'}sin(${arg})`),why:'Left out the radius.'}],
    how:'x = h + R cos(ωt), y = k ± R sin(ωt) with ω = 2π/period; + for counterclockwise.',
    sol:[['One lap in time T means the angle grows by 2π every T.',X`\omega=\frac{2\pi}{${T}}=${tex(`${w}*pi`)}`],
         [`Start at the rightmost point (cos 0 = 1) and go ${ccw?'counterclockwise (+ sin)':'clockwise (− sin)'}.`,tex(ans)]],
    chk:{op:'circ',n:{R,T,ccw:ccw?1:0,h,k}}};
});

/* ---------------- 13.1–13.2 Vectors ---------------- */
add('vec-comb','Vectors','13.1–13.2',()=>{
  const n=pick([2,3,3]), u=rv(n,-6,6), v=rv(n,-6,6), a=nz(-4,4), b=nz(-4,4);
  const r=u.map((x,i)=>a*x+b*v[i]);
  const cs=(c,s)=>c===1?s:c===-1?'-'+s:c+s;
  return {q:`Let ${m`\mathbf u=${vt(u)}`} and ${m`\mathbf v=${vt(v)}`}. Find ${m`${cs(a,'\\mathbf u')}${b<0?'':'+'}${cs(b,'\\mathbf v')}`}.`,
    kind:'vec',ans:vint(r),lv:1,
    dis:[{a:vint(u.map((x,i)=>a*x-b*v[i])),why:'Sign slip on the second term.'},{a:vint(u.map((x,i)=>b*x+a*v[i])),why:'Swapped the scalars.'},
         {a:vint(u.map((x,i)=>a*(x+v[i]))),why:`Multiplied the whole sum by ${a}.`},{a:vint(u.map((x,i)=>a*x+v[i])),why:'Forgot to scale v.'}],
    how:'Scale each vector component-wise, then add components.',
    sol:[['Scale, then add component by component.',X`${a}${vt(u)}+(${b})${vt(v)}=${vt(u.map(x=>a*x))}+${vt(v.map(x=>b*x))}=${vt(r)}`]],
    chk:{op:'val',e:{v:`${a}*${V(...u)}+(${b})*${V(...v)}`}}};
});

add('vec-mag','Vectors','13.1–13.2',()=>{
  const n=pick([2,3,3]);
  if(coin()){
    const P=rv(n,-6,6), Q=rv(n,-6,6), d=subA(Q,P), s=n2(d);
    if(s===0) return null;
    const ans=sqrtS(s);
    return {q:`Find the distance between ${m`P${ptx(P)}`} and ${m`Q${ptx(Q)}`}.`,kind:'expr',ans,lv:1,
      dis:[{a:String(s),why:'Forgot the square root.'},{a:sqrtS(n2(addA(P,Q))||1),why:'Added the coordinates instead of subtracting.'},
           {a:String(Math.abs(d.reduce((a,b)=>a+b,0))||s+1),why:'Added the components; the length is √(Δx² + Δy² + Δz²).'},{a:sqrtS(d.reduce((a,x)=>a+Math.abs(x),0)),why:'Took √ of the sum of |Δ|, not of the squares.'}],
      how:'|PQ| = √((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²)',
      sol:[['Subtract coordinates to get the vector PQ.',X`\overrightarrow{PQ}=${vt(d)}`],['Take its length.',X`|\overrightarrow{PQ}|=\sqrt{${d.map(x=>`(${x})^2`).join('+')}}=\sqrt{${s}}=${tex(ans)}`]],
      chk:{op:'val',e:{v:`sqrt(${d.map(x=>`(${x})^2`).join('+')})`}}};
  }
  const u=rv(n,-5,5), v=rv(n,-4,4), c=nz(-3,3), w=u.map((x,i)=>x+c*v[i]), s=n2(w);
  if(s===0) return null;
  const ans=sqrtS(s);
  return {q:`Let ${m`\mathbf u=${vt(u)}`} and ${m`\mathbf v=${vt(v)}`}. Find ${m`|\mathbf u${c<0?'':'+'}${c===1?'':c===-1?'-':c}\mathbf v|`}.`,kind:'expr',ans,lv:1,
    dis:[{a:String(s),why:'Forgot the square root.'},{a:sumS([sqrtS(n2(u)),Math.abs(c)===1?sqrtS(n2(v)):`${Math.abs(c)}*${sqrtS(n2(v))}`]),why:'|u + cv| is not |u| + |c||v| (triangle inequality).'},
         {a:sqrtS(n2(u.map((x,i)=>x-c*v[i]))||2),why:'Sign slip on the scalar.'},{a:sqrtS(n2(u.map((x,i)=>x+v[i]))||3),why:'Forgot to scale v.'}],
    how:'Combine first, then take the length.',
    sol:[['Combine the vectors.',X`\mathbf u+(${c})\mathbf v=${vt(w)}`],['Length.',X`\sqrt{${w.map(x=>`(${x})^2`).join('+')}}=\sqrt{${s}}=${tex(ans)}`]],
    chk:{op:'val',e:{v:`sqrt(${w.map(x=>`(${x})^2`).join('+')})`}}};
});

add('vec-unit','Vectors','13.1–13.2',()=>{
  const n=pick([2,3,3]), P=rv(n,-5,5), Q=rv(n,-5,5), d=subA(Q,P), s=n2(d), opp=coin(0.3);
  if(s===0||Math.sqrt(s)%1===0&&coin(0.3)) return null;
  const e=opp?d.map(x=>-x):d;
  const ans=V(...e.map(x=>rsq(x,s)));
  return {q:`Find the unit vector that points ${opp?'in the direction opposite to':'in the same direction as'} ${m`\overrightarrow{PQ}`}, where ${m`P${ptx(P)}`} and ${m`Q${ptx(Q)}`}.`,
    kind:'vec',ans,lv:2,
    dis:[{a:vint(e),why:'That is PQ itself; divide by its length to make it a unit vector.'},
         {a:V(...e.map(x=>-x).map(x=>rsq(x,s))),why:opp?'That points along PQ; you want the opposite direction.':'Used QP = P − Q; PQ is Q − P.'},
         {a:V(...e.map(x=>frac(x,s))),why:'Divided by |PQ|² instead of |PQ|.'},
         {a:V(...e.map(x=>frac(x,e.reduce((a,b)=>a+Math.abs(b),0)))),why:'Divided by the sum of the components, not the length.'}],
    how:'û = v / |v|',
    sol:[['PQ = Q − P.',X`\overrightarrow{PQ}=${vt(d)},\qquad |\overrightarrow{PQ}|=\sqrt{${s}}`],
         [opp?'Negate for the opposite direction and divide by the length.':'Divide by the length.',X`${opp?'-':''}\frac{\overrightarrow{PQ}}{|\overrightarrow{PQ}|}=${tex(ans)}`]],
    chk:{op:'unit',e:{v:V(...e)}}};
});

add('vec-scale','Vectors','13.1–13.2',()=>{
  const nice=pick([[2,-1,2],[1,2,2],[2,3,6],[1,4,8],[4,4,7],[2,6,9],[3,4,12],[6,-2,3],[3,4],[5,-12],[8,15],[1,-2,-2]]);
  const v=shuf(nice).map(x=>x*pick([1,-1])), s=n2(v), r=Math.round(Math.sqrt(s));
  const L=pick([2,3,4,5,6,10,15,20]), opp=coin(0.35), sg=opp?-1:1;
  const exact=r*r===s;
  const vv=exact?v:v.map((x,i)=>i===0?x+1:x), s2=n2(vv), r2=Math.sqrt(s2);
  const ans=V(...vv.map(x=>surd(sg*L*x,s2,s2)));
  return {q:`Find the vector of length ${L} that points ${opp?'opposite to':'in the same direction as'} ${m`\mathbf v=${vt(vv)}`}.`,kind:'vec',ans,lv:2,
    dis:[{a:vint(vv.map(x=>sg*L*x)),why:`Multiplied v by ${L} without first making it a unit vector.`},
         {a:V(...vv.map(x=>surd(-sg*L*x,s2,s2))),why:opp?'That points the same way as v.':'That points opposite to v.'},
         {a:V(...vv.map(x=>frac(sg*L*x,s2))),why:'Divided by |v|² instead of |v|.'},{a:V(...vv.map(x=>surd(sg*x,s2,s2))),why:`That is the unit vector; scale it by ${L}.`}],
    how:'L · v/|v|, with a minus sign for the opposite direction.',
    sol:[['Length of v.',X`|\mathbf v|=\sqrt{${s2}}${Number.isInteger(r2)?'='+r2:''}`],['Scale the unit vector.',X`${opp?'-':''}${L}\,\frac{\mathbf v}{|\mathbf v|}=${tex(ans)}`]],
    chk:{op:'scaleto',e:{v:vint(vv)},n:{L:sg*L}}};
});

add('sphere-eq','Vectors','13.1–13.2',()=>{
  const C=rv(3,-5,5), kind=pick(['pt','pt','mid']);
  let P,Q,cen,r2,q;
  if(kind==='pt'){ P=rv(3,-5,5); cen=C; r2=n2(subA(P,C)); if(!r2) return null;
    q=`Find an equation of the sphere with center ${mp(C)} that passes through ${mp(P)}.`; }
  else { const d=rv(3,-3,3).map(x=>2*x); P=C.map((x,i)=>x-d[i]/2); Q=C.map((x,i)=>x+d[i]/2); cen=C; r2=n2(d)/4; if(!r2) return null;
    q=`Find an equation of the sphere that passes through ${m`P${ptx(P)}`} and ${m`Q${ptx(Q)}`} and has its center at the midpoint of ${m`PQ`}.`; }
  const sq=(v,c)=>c===0?`${v}^2`:`(${shift(v,c)})^2`;
  const lhs=cen.map((c,i)=>sq(AX[i],c)).join(' + ');
  const ans=`${lhs} = ${r2}`;
  const flip=cen.map((c,i)=>c===0?`${AX[i]}^2`:`(${shift(AX[i],-c)})^2`).join(' + ');
  return {q,kind:'eq',ans,lv:kind==='pt'?1:2,
    dis:[{a:`${lhs} = ${sqrtS(r2)}`,why:'The right side is r², not r.'},{a:`${flip} = ${r2}`,why:'Center (a, b, c) gives (x − a)², so the signs flip.'},
         {a:`${lhs} = ${n2(P)||r2+3}`,why:'Used |P|² (distance from the origin) instead of the distance from the center.'},
         {a:`${lhs} = ${kind==='mid'?n2(subA(Q,P)):2*r2}`,why:kind==='mid'?'Used the whole diameter |PQ| as the radius.':'Doubled the radius squared.'}],
    how:'(x−a)² + (y−b)² + (z−c)² = r², with r = distance from the center to a point on the sphere.',
    sol:[kind==='mid'?['The center is the midpoint of PQ.',X`C=\left(\tfrac{${P[0]}+${fmtC(Q[0])}}{2},\tfrac{${P[1]}+${fmtC(Q[1])}}{2},\tfrac{${P[2]}+${fmtC(Q[2])}}{2}\right)=${ptx(cen)}`]:['',''],
         ['Radius squared = squared distance from the center to P.',X`r^2=${subA(P,cen).map(x=>`(${x})^2`).join('+')}=${r2}`],
         ['Write the equation.',tex(ans)]].filter(s=>s[0]),
    chk:{op:'sphere',n:{C:cen,P}}};
});

add('sphere-center','Vectors','13.1–13.2',()=>{
  const C=rv(3,-5,5), r2=pick([1,4,9,16,25,36,5,7,10,12,20]), ask=pick(['center','radius','radius']);
  const G=n2(C)-r2;                            /* x²+y²+z² −2ax −2by −2cz + G = 0 */
  const lin=C.map((c,i)=>mono(-2*c,{[AX[i]]:1}));
  const eq=`${sumS(['x^2','y^2','z^2',...lin,String(G)])} = 0`;
  const q=`The equation ${mk(eq)} describes a sphere. Find its ${ask}.`;
  if(ask==='center') return {q,kind:'point',ans:P3(...C),lv:2,
    dis:[{a:P3(...C.map(x=>-x)),why:'Sign flip: x² − 2ax completes to (x − a)², so the center coordinate is a, not −a.'},
         {a:P3(...C.map(x=>-2*x)),why:'Used the linear coefficients directly; divide them by −2.'},{a:P3(...C.map(x=>2*x)),why:'Forgot to halve the linear coefficients.'}],
    how:'Complete the square in x, y and z.',
    sol:[['Complete the square in each variable.',X`${C.map((c,i)=>c?`(${AX[i]}${c<0?'+':'-'}${Math.abs(c)})^2`:`${AX[i]}^2`).join('+')}=${r2}`],['Read off the center.',ptx(C)]],
    chk:{op:'spherecr',e:{eq},n:{want:0}}};
  const ans=sqrtS(r2);
  return {q,kind:'expr',ans,lv:2,
    dis:[{a:String(r2),why:'That is r²; take the square root.'},{a:sqrtS(Math.abs(G)||2),why:'Used the constant term alone; you must add a² + b² + c² when completing the square.'},
         {a:sqrtS(n2(C)+r2+Math.abs(G)+1),why:'Added the completed-square constants with the wrong sign.'}],
    how:'Complete the square; the right side is r².',
    sol:[['Complete the square.',X`${C.map((c,i)=>c?`(${AX[i]}${c<0?'+':'-'}${Math.abs(c)})^2`:`${AX[i]}^2`).join('+')}=${-G}+${n2(C)}=${r2}`],['Radius.',X`r=\sqrt{${r2}}=${tex(ans)}`]],
    chk:{op:'spherecr',e:{eq},n:{want:1}}};
});

add('vec-parperp','Vectors','13.1–13.2',()=>{
  const n=pick([2,3]), v=rv(n,-6,6,true), mode=pick(['par','perp']), i=ri(0,n-1);
  let u,ans,q;
  if(mode==='par'){ const k=pick([2,3,-2,-1,frac(1,2)]); const kk=eval(String(k)); u=v.map(x=>x*kk);
    if(u.some(x=>!Number.isInteger(x))) return null;
    const j=(i+1)%n; ans=String(u[i]);
    const show=u.map((x,t)=>t===i?'a':String(x));
    q=`Find ${m`a`} so that ${m`\mathbf u=\langle ${show.join(',\\ ')}\rangle`} is parallel to ${m`\mathbf v=${vt(v)}`}.`;
    const w=v[i]?frac(-n2(v.filter((_,t)=>t!==i).map((x,t)=>x)),1):null;
    return {q,kind:'expr',ans,lv:1,
      dis:[{a:String(-u[i]),why:'Parallel means u = kv with ONE scalar k for every component; the sign must match.'},
           {a:frac(u.reduce((s,x,t)=>t===i?s:s+x*v[t],0)*-1,v[i]),why:'That makes u perpendicular to v (u·v = 0), not parallel.'},
           {a:frac(v[i]*v[j],u[j]||1),why:'Set up the ratio upside down: a/v_i must equal u_j/v_j.'}],
      how:'Parallel ⇔ u = kv: find k from a known component, then a = k·v_i.',
      sol:[['Find the scalar k from a component you know.',X`k=\frac{${u[j]}}{${v[j]}}=${frac(u[j],v[j])}`],['Apply it to the unknown component.',X`a=k\cdot(${v[i]})=${ans}`]],
      chk:{op:'parperp',n:{u:u.map((x,t)=>t===i?null:x),v,par:1}}};
  }
  u=rv(n,-6,6); const rest=u.reduce((s,x,t)=>t===i?s:s+x*v[t],0); ans=frac(-rest,v[i]);
  const show=u.map((x,t)=>t===i?'a':String(x));
  q=`Find ${m`a`} so that ${m`\mathbf u=\langle ${show.join(',\\ ')}\rangle`} is orthogonal to ${m`\mathbf v=${vt(v)}`}.`;
  return {q,kind:'expr',ans,lv:1,
    dis:[{a:frac(rest,v[i]),why:'Sign slip solving a·v_i + (rest) = 0.'},{a:frac(-rest,1),why:`Forgot to divide by the coefficient ${v[i]}.`},
         {a:frac(-v[i],rest||7),why:'Solved the equation upside down.'},{a:'0',why:'a = 0 does not make the dot product vanish here.'}],
    how:'Orthogonal ⇔ u · v = 0.',
    sol:[['Set the dot product to zero.',X`\mathbf u\cdot\mathbf v=${v[i]}a${rest<0?'':'+'}${rest}=0`],['Solve.',X`a=${tex(ans)}`]],
    chk:{op:'parperp',n:{u:u.map((x,t)=>t===i?null:x),v,par:0}}};
});

/* ---------------- 13.3 Dot products ---------------- */
const NICE_ANG=[ /* [u, v, angle key] with |u||v| making cos nice */
  [[1,0,0],[1,1,0],'pi/4'],[[1,1,0],[0,1,1],'pi/3'],[[1,0,1],[-1,1,0],'2pi/3'],[[1,1,0],[-1,0,-1],'2pi/3'],[[1,0,0],[-1,1,0],'3pi/4'],
  [[1,2,3],[3,-3,1],'pi/2'],[[2,1,-2],[1,2,2],'pi/2'],[[1,1,1],[1,1,-2],'pi/2'],[[1,-1,0],[1,-1,0],'0'],[[2,0,0],[-3,0,0],'pi'],
  [[1,1,0],[1,0,0],'pi/4'],[[0,1,1],[1,1,0],'pi/3'],[[1,1],[1,0],'pi/4'],[[1,0],[-1,1],'3pi/4'],[[3,4],[-4,3],'pi/2'],[[1,1,1,],[-1,-1,-1],'pi']];
function orthoScramble(u,v){                   /* same coordinate permutation & sign flips on both: angle preserved */
  const n=u.length, perm=shuf([...Array(n).keys()]), sg=perm.map(()=>pick([1,-1])), a=ri(1,3), b=ri(1,3);
  return [perm.map((p,i)=>a*sg[i]*u[p]), perm.map((p,i)=>b*sg[i]*v[p])];
}
add('dot-angle','Dot product','13.3',()=>{
  let u,v,ans,cosS; const tri=coin(0.3);
  if(coin(0.45)){ const e=pick(NICE_ANG.filter(x=>x[2]!=='0'&&x[2]!=='pi')); [u,v]=orthoScramble(e[0],e[1]); ans=e[2]; }
  else { const n=pick([2,3,3]); u=rv(n,-4,4); v=rv(n,-4,4); }
  const d=dotA(u,v), a=n2(u), b=n2(v); if(!a||!b||a*b>400) return null;
  cosS=surd(d,a*b,a*b);                          /* d/√(ab) */
  if(!ans){ if(Math.abs(Math.abs(d)/Math.sqrt(a*b)-1)<1e-12) return null; ans=d===0?'pi/2':`arccos(${cosS})`; }
  let q,P,Q,R;
  if(tri&&u.length===3){ Q=rv(3,-3,3); P=addA(Q,u); R=addA(Q,v);
    q=`Find the angle of triangle ${m`PQR`} at vertex ${m`Q`}, where ${m`P${ptx(P)}`}, ${m`Q${ptx(Q)}`}, ${m`R${ptx(R)}`}. Give the exact angle in radians.`; }
  else q=`Find the angle between ${m`\mathbf u=${vt(u)}`} and ${m`\mathbf v=${vt(v)}`}. Give the exact angle in radians.`;
  const th=Math.acos(d/Math.sqrt(a*b));
  return {q,kind:'expr',ans,lv:2,
    dis:[{a:`arccos(${frac(d,1)})`.replace('arccos(0)','pi/2'),why:'Forgot to divide the dot product by |u||v|.'},
         {a:d===0?'0':`arcsin(${cosS})`,why:'cos θ = u·v/(|u||v|); arcsin answers a different question.'},
         {a:d===0?'pi':`pi - ${ans.startsWith('arccos')?ans:'('+ans+')'}`,why:'Sign slip in the dot product flips the angle to π − θ.'},
         {a:d===0?'pi/4':`arccos(${frac(d,a+b)})`,why:'Divided by |u|² + |v|² instead of |u||v|.'}],
    how:'cos θ = (u · v)/(|u||v|), θ in [0, π].',
    sol:[tri?['Use the two sides leaving Q.',X`\overrightarrow{QP}=${vt(u)},\qquad \overrightarrow{QR}=${vt(v)}`]:['',''],
         ['Dot product and lengths.',X`\mathbf u\cdot\mathbf v=${d},\qquad |\mathbf u|=\sqrt{${a}},\qquad |\mathbf v|=\sqrt{${b}}`],
         ['Cosine of the angle, then the angle.',X`\cos\theta=\frac{${d}}{\sqrt{${a}}\sqrt{${b}}}=${tex(cosS)}\quad\Rightarrow\quad \theta=${tex(ans)}`]].filter(s=>s[0]),
    chk:{op:'angle',e:{u:vint(u),v:vint(v)}}};
});

add('dot-proj','Dot product','13.3',()=>{
  const n=pick([2,3,3]), u=rv(n,-6,6), v=rv(n,-4,4), d=dotA(u,v), s=n2(v); if(!s||!d) return null;
  if(coin(0.55)){
    const ans=V(...v.map(x=>frac(d*x,s)));
    return {q:`Find ${m`\operatorname{proj}_{\mathbf v}\mathbf u`} for ${m`\mathbf u=${vt(u)}`} and ${m`\mathbf v=${vt(v)}`}.`,kind:'vec',ans,lv:2,
      dis:[{a:V(...v.map(x=>surd(d*x,s,s))),why:'Divided by |v| instead of |v|²: proj = (u·v/|v|²) v.'},
           {a:V(...u.map(x=>frac(d*x,n2(u)))),why:'That is proj_u v; the vector you project onto goes in the denominator and at the end.'},
           {a:V(...v.map(x=>frac(d*x,1))),why:'Forgot to divide by |v|².'},{a:rsq(d,s),why:'That is the scalar component scal_v u, not the vector projection.'}],
      how:'proj_v u = (u·v / v·v) v',
      sol:[['Dot products.',X`\mathbf u\cdot\mathbf v=${d},\qquad \mathbf v\cdot\mathbf v=${s}`],['Scale v.',X`\operatorname{proj}_{\mathbf v}\mathbf u=\frac{${d}}{${s}}${vt(v)}=${tex(ans)}`]],
      chk:{op:'proj',e:{u:vint(u),v:vint(v)},n:{scal:0}}};
  }
  const ans=rsq(d,s);
  return {q:`Find the scalar component ${m`\operatorname{scal}_{\mathbf v}\mathbf u`} for ${m`\mathbf u=${vt(u)}`} and ${m`\mathbf v=${vt(v)}`}.`,kind:'expr',ans,lv:1,
    dis:[{a:frac(d,s),why:'Divided by |v|²; the scalar component divides by |v| once.'},{a:rsq(d,n2(u)),why:'Divided by |u|; you project onto v, so divide by |v|.'},
         {a:String(d),why:'Forgot to divide by |v|.'},{a:rsq(-d,s),why:'Sign slip in the dot product.'}],
    how:'scal_v u = u·v / |v|',
    sol:[['Dot product and |v|.',X`\mathbf u\cdot\mathbf v=${d},\qquad |\mathbf v|=\sqrt{${s}}`],['Divide.',X`\operatorname{scal}_{\mathbf v}\mathbf u=\frac{${d}}{\sqrt{${s}}}=${tex(ans)}`]],
    chk:{op:'proj',e:{u:vint(u),v:vint(v)},n:{scal:1}}};
});

add('dot-decomp','Dot product','13.3',()=>{
  const n=pick([2,3]), u=rv(n,-6,6), v=rv(n,-3,3), d=dotA(u,v), s=n2(v); if(!s||!d) return null;
  const p=v.map(x=>d*x/s), nn=u.map((x,i)=>x-p[i]);
  const P_=V(...v.map(x=>frac(d*x,s))), ans=V(...u.map((x,i)=>frac(x*s-d*v[i],s)));
  const which=coin()?'n':'p';
  const q=`Write ${m`\mathbf u=${vt(u)}`} as ${m`\mathbf u=\mathbf p+\mathbf n`}, where ${m`\mathbf p`} is parallel to ${m`\mathbf v=${vt(v)}`} and ${m`\mathbf n`} is orthogonal to ${m`\mathbf v`}. Find ${m`\mathbf ${which}`}.`;
  const key=which==='n'?ans:P_, other=which==='n'?P_:ans;
  return {q,kind:'vec',ans:key,lv:3,
    dis:[{a:other,why:which==='n'?'That is p, the part parallel to v.':'That is n, the part orthogonal to v.'},
         {a:V(...u.map((x,i)=>frac(x*s+d*v[i],s))),why:'Added the projection instead of subtracting it: n = u − p.'},
         {a:V(...v.map(x=>surd(d*x,s,s))),why:'Divided by |v| instead of |v|² in the projection.'}],
    how:'p = proj_v u = (u·v/|v|²) v, n = u − p.',
    sol:[['Projection onto v.',X`\mathbf p=\frac{${d}}{${s}}${vt(v)}=${tex(P_)}`],['The rest is orthogonal.',X`\mathbf n=\mathbf u-\mathbf p=${tex(ans)}`],['',X`\mathbf ${which}=${tex(key)}`]],
    chk:{op:'decomp',e:{u:vint(u),v:vint(v)},n:{n:which==='n'?1:0}}};
});

add('dot-def','Dot product','13.3',()=>{
  /* exact trig table: [angle, cos = cn·√cr/cd, sin = sn·√sr/sd] */
  const T=[['pi/6',[1,2,3],[1,2,1]],['pi/4',[1,2,2],[1,2,2]],['pi/3',[1,2,1],[1,2,3]],['2pi/3',[-1,2,1],[1,2,3]],
           ['3pi/4',[-1,2,2],[1,2,2]],['5pi/6',[-1,2,3],[1,2,1]],['pi/2',[0,1,1],[1,1,1]]];
  const a=ri(1,6), b=ri(1,6), e=pick(T), cross=coin(0.4);
  const val=([n,d,r])=>surd(a*b*n,d,r);
  const key=val(cross?e[2]:e[1]), other=val(cross?e[1]:e[2]), neg=val((cross?e[2]:e[1]).map((x,i)=>i===0?-x:x));
  return {q:`${m`|\mathbf u|=${a}`}, ${m`|\mathbf v|=${b}`}, and the angle between ${m`\mathbf u`} and ${m`\mathbf v`} is ${mk(e[0])}. Find ${cross?m`|\mathbf u\times\mathbf v|`:m`\mathbf u\cdot\mathbf v`}.`,
    kind:'expr',ans:key,lv:1,
    dis:[{a:other,why:cross?'The cross product uses sin θ; the dot product uses cos θ.':'The dot product uses cos θ; sin θ belongs to |u × v|.'},
         {a:String(a*b),why:'Left out the trig factor.'},{a:neg,why:'Wrong sign of the trig value for this angle.'},
         {a:String(a+b),why:'Multiply the lengths, don’t add them.'}],
    how:cross?'|u × v| = |u||v| sin θ':'u · v = |u||v| cos θ',
    sol:[['Use the geometric definition.',cross?X`|\mathbf u\times\mathbf v|=(${a})(${b})\sin\left(${tex(e[0])}\right)=${tex(key)}`:X`\mathbf u\cdot\mathbf v=(${a})(${b})\cos\left(${tex(e[0])}\right)=${tex(key)}`]],
    chk:{op:'val',e:{v:`${a}*${b}*${cross?'sin':'cos'}(${e[0]})`}}};
});

/* ---------------- 13.4 Cross products ---------------- */
add('cross-comp','Cross product','13.4',()=>{
  const u=rv(3,-5,5), v=rv(3,-5,5), c=crossA(u,v); if(n2(c)===0) return null;
  return {q:`Find ${m`\mathbf u\times\mathbf v`} for ${m`\mathbf u=${vt(u)}`} and ${m`\mathbf v=${vt(v)}`}.`,kind:'vec',ans:vint(c),lv:1,
    dis:[{a:vint(c.map(x=>-x)),why:'That is v × u; the cross product is anticommutative.'},{a:vint([c[0],-c[1],c[2]]),why:'Sign slip on the j component: the middle term of the determinant carries a minus.'},
         {a:vint(u.map((x,i)=>x*v[i])),why:'Multiplied matching components; that is not a cross product.'},{a:vint([c[0],c[2],c[1]]),why:'Mixed up which 2×2 minor goes with j and k.'}],
    how:'Expand the 3×3 determinant; remember the minus on j.',
    sol:[['Expand along the first row.',X`\mathbf u\times\mathbf v=\begin{vmatrix}\mathbf i&\mathbf j&\mathbf k\\ ${u.join('&')}\\ ${v.join('&')}\end{vmatrix}`],
         ['Compute each minor.',X`=\big(${fmtC(u[1])}\cdot ${fmtC(v[2])}-${fmtC(u[2])}\cdot ${fmtC(v[1])}\big)\mathbf i-\big(${fmtC(u[0])}\cdot ${fmtC(v[2])}-${fmtC(u[2])}\cdot ${fmtC(v[0])}\big)\mathbf j+\big(${fmtC(u[0])}\cdot ${fmtC(v[1])}-${fmtC(u[1])}\cdot ${fmtC(v[0])}\big)\mathbf k`],
         ['',vt(c)]],
    chk:{op:'cross',e:{u:vint(u),v:vint(v)}}};
});

add('cross-ijk','Cross product','13.4',()=>{
  const E=['i','j','k'], a=nz(-4,4), b=nz(-4,4), p=ri(0,2); let q2=ri(0,2);
  const e=[[1,0,0],[0,1,0],[0,0,1]], c=crossA(mulA(a,e[p]),mulA(b,e[q2]));
  const t=(k,x)=>`${k===1?'':k===-1?'-':k}\\mathbf ${x}`;
  const ans=n2(c)?sumS(c.map((x,i)=>x?mono(x,{})+'*'+E[i]:'0')).replace(/\b1\*/g,'').replace(/-1\*/g,'-'):'<0,0,0>';
  const key=n2(c)?vint(c):'<0,0,0>';
  return {q:`Compute ${m`(${t(a,E[p])})\times(${t(b,E[q2])})`}.`,kind:'vec',ans:key,lv:1,
    dis:[{a:n2(c)?vint(c.map(x=>-x)):vint(mulA(a*b,e[3-p-q2]||e[0])),why:n2(c)?'Order matters: i × j = k but j × i = −k.':'A vector crossed with a parallel vector is 0.'},
         {a:vint([a*b,0,0].map((_,i)=>i===p?a*b:0)),why:'The cross product is orthogonal to both factors, so it cannot point along either.'},
         {a:vint([a*b,a*b,a*b]),why:'Multiplied the coefficients and ignored the directions.'}],
    how:'i × j = k, j × k = i, k × i = j; reversing the order flips the sign; parallel vectors give 0.',
    sol:[['Pull out the scalars, then use the cyclic rule.',X`(${a})(${b})\,(\mathbf ${E[p]}\times\mathbf ${E[q2]})=${vt(c)}`]],
    chk:{op:'cross',e:{u:vint(mulA(a,e[p])),v:vint(mulA(b,e[q2]))}}};
});

add('cross-area','Cross product','13.4',()=>{
  const tri=coin(0.55); let u,v,q;
  if(tri){ const A=rv(3,-4,4); u=rv(3,-4,4); v=rv(3,-4,4); const B=addA(A,u), C=addA(A,v);
    q=`Find the area of the triangle with vertices ${m`A${ptx(A)}`}, ${m`B${ptx(B)}`}, ${m`C${ptx(C)}`}.`; }
  else { u=rv(3,-5,5); v=rv(3,-5,5); q=`Find the area of the parallelogram with adjacent sides ${m`\mathbf u=${vt(u)}`} and ${m`\mathbf v=${vt(v)}`}.`; }
  const c=crossA(u,v), s=n2(c); if(!s||s>600) return null;
  const ans=tri?surd(1,2,s):sqrtS(s);
  return {q,kind:'expr',ans,lv:tri?2:1,
    dis:[{a:tri?sqrtS(s):surd(1,2,s),why:tri?'That is the parallelogram; a triangle is half of it.':'Halved it; that would be the triangle.'},
         {a:tri?frac(Math.abs(dotA(u,v)),2):String(Math.abs(dotA(u,v))),why:'Used the dot product; area needs |u × v|.'},
         {a:tri?frac(s,2):String(s),why:'Forgot the square root in |u × v|.'},{a:tri?surd(1,2,n2(u)*n2(v)):sqrtS(n2(u)*n2(v)),why:'|u||v| is the area only when the sides are perpendicular.'}],
    how:tri?'Area = ½|AB × AC|':'Area = |u × v|',
    sol:[tri?['Two sides from A.',X`\overrightarrow{AB}=${vt(u)},\qquad \overrightarrow{AC}=${vt(v)}`]:['',''],
         ['Cross product.',X`${tri?'\\overrightarrow{AB}\\times\\overrightarrow{AC}':'\\mathbf u\\times\\mathbf v'}=${vt(c)},\qquad |\cdot|=\sqrt{${s}}`],
         ['Area.',X`${tri?'\\tfrac12\\sqrt{'+s+'}=':''}${tex(ans)}`]].filter(z=>z[0]),
    chk:{op:'area',e:{u:vint(u),v:vint(v)},n:{tri:tri?1:0}}};
});

add('cross-unitnormal','Cross product','13.4',()=>{
  const u=rv(3,-3,3), v=rv(3,-3,3), c=crossA(u,v), s=n2(c); if(!s) return null;
  const g=reduceInt(c), sg=n2(g);
  const ans=V(...g.map(x=>rsq(x,sg))), neg=V(...g.map(x=>rsq(-x,sg)));
  return {q:`Find a unit vector orthogonal to both ${m`\mathbf u=${vt(u)}`} and ${m`\mathbf v=${vt(v)}`}. (Either of the two answers is accepted.)`,
    kind:'vec',ans,alts:[neg],lv:2,
    dis:[{a:vint(c),why:'u × v is orthogonal to both, but it is not a unit vector: divide by its length.'},
         {a:V(...[c[0],-c[1],c[2]].map(x=>rsq(x,s))),why:'Sign slip on the j component of the cross product.'},
         {a:V(...addA(u,v).map(x=>rsq(x,n2(addA(u,v))||1))),why:'u + v lies in the plane of u and v, so it is not orthogonal to them.'}],
    how:'n̂ = ±(u × v)/|u × v|',
    sol:[['Cross product is orthogonal to both.',X`\mathbf u\times\mathbf v=${vt(c)}`],['Normalize (either sign works).',X`\pm\frac{${vt(g)}}{\sqrt{${sg}}}=\pm${tex(ans)}`]],
    chk:{op:'unitnormal',e:{u:vint(u),v:vint(v)}}};
});

add('triple','Cross product','13.4',()=>{
  const u=rv(3,-3,3), v=rv(3,-3,3), w=rv(3,-3,3), t=dotA(u,crossA(v,w)); if(!t) return null;
  const vol=coin();
  const ans=String(vol?Math.abs(t):t);
  return {q:vol?`Find the volume of the parallelepiped determined by ${m`\mathbf u=${vt(u)}`}, ${m`\mathbf v=${vt(v)}`}, and ${m`\mathbf w=${vt(w)}`}.`
               :`Compute the scalar triple product ${m`\mathbf u\cdot(\mathbf v\times\mathbf w)`} for ${m`\mathbf u=${vt(u)}`}, ${m`\mathbf v=${vt(v)}`}, ${m`\mathbf w=${vt(w)}`}.`,
    kind:'expr',ans,lv:2,
    dis:[{a:String(vol?(t>0?-t:t):-t),why:vol?'Volume is the absolute value of the triple product.':'Sign slip: v × w expanded with the wrong sign on j.'},
         {a:String(dotA(u,crossA(v,w).map((x,i)=>i===1?-x:x))||1),why:'Dropped the minus on the j component of v × w.'},
         {a:String(dotA(u,v)+dotA(v,w)+dotA(u,w)),why:'Added dot products; the triple product is u · (v × w).'},{a:String(Math.abs(t)*2),why:'Doubled it.'}],
    how:'u · (v × w) = det[u; v; w]; volume = |u · (v × w)|.',
    sol:[['Cross product first.',X`\mathbf v\times\mathbf w=${vt(crossA(v,w))}`],['Then dot with u.',X`\mathbf u\cdot(\mathbf v\times\mathbf w)=${t}${vol?`,\\qquad V=|${t}|=${Math.abs(t)}`:''}`]],
    chk:{op:'triple',e:{u:vint(u),v:vint(v),w:vint(w)},n:{abs:vol?1:0}}};
});

/* ---------------- 13.5 Lines ---------------- */
add('line-thru','Lines','13.5',()=>{
  const kind=pick(['2pt','2pt','par','perp','axis']); let P=rv(3,-5,5),d,q,tr,Qg=null;
  if(kind==='2pt'){ const Q=rv(3,-5,5); Qg=Q; d=subA(Q,P); if(!n2(d)) return null;
    q=`Find a vector equation of the line through ${m`P${ptx(P)}`} and ${m`Q${ptx(Q)}`}.`;
    tr=[{a:lineKey(P,addA(P,Q)),why:'Used P + Q as the direction; the direction is Q − P.'},{a:lineKey(Q.map((x,i)=>x+d[i]),P),why:'Swapped the roles: the point goes in front, the direction multiplies t.'}]; }
  else if(kind==='par'){ d=rv(3,-4,4); const R=rv(3,-5,5);
    q=`Find a vector equation of the line through ${m`${ptx(P)}`} that is parallel to the line ${mk(lineKey(R,d))}.`;
    tr=[{a:lineKey(P,R),why:'Used the other line’s base point as a direction; its direction is the coefficient of t.'},{a:lineKey(R,d),why:'That is the given line itself; it does not pass through your point.'}]; }
  else if(kind==='perp'){ d=rv(3,-4,4); const c=ri(-6,6);
    q=`Find a vector equation of the line through ${m`${ptx(P)}`} that is perpendicular to the plane ${mk(planeKey(d,c).replace(/ = .*/,' = '+c))}.`;
    tr=[{a:lineKey(P,[d[1],-d[0],0].some(x=>x)?[d[1],-d[0],0]:[1,0,0]),why:'That direction lies IN the plane. A line perpendicular to the plane runs along the normal ⟨a, b, c⟩.'},
        {a:lineKey(d,P),why:'Swapped point and direction.'}]; }
  else { const i=ri(0,2); d=[0,0,0]; d[i]=1;
    q=`Find a vector equation of the line through ${m`${ptx(P)}`} that is parallel to the ${AX[i]}-axis.`;
    tr=[{a:lineKey(P,[1,1,1].map((x,j)=>j===i?0:1)),why:'Parallel to an axis means only that coordinate changes.'},{a:lineKey([0,0,0].map((x,j)=>j===i?P[j]:0),d),why:'This line runs along the axis itself; it must pass through the given point.'}]; }
  const ans=lineKey(P,d);
  return {q,kind:'line',line:{p:P,d},ans,lv:1,
    dis:tr.concat([{a:lineKey(P,d.map((x,i)=>i===0?x+1:x)),why:'Arithmetic slip in the direction vector.'}]),
    how:'r(t) = r₀ + t v: a point on the line plus t times a direction.',
    sol:[['A point on the line and a direction.',X`\mathbf r_0=${ptx(P)},\qquad \mathbf v=${vt(d)}`],['r(t) = r₀ + t v (any nonzero multiple of v also works).',X`\mathbf r(t)=${tex(ans)}`]],
    chk:Qg?{op:'lineP',n:{P,Q:Qg},e:{ans}}:{op:'lineP',n:{P,dir:d},e:{ans}}};
});

add('line-rel','Lines','13.5',()=>{
  const P1=rv(3,-4,4), d1=rv(3,-3,3), rel=pick(['par','int','int','skew','skew','same']);
  let P2,d2,X0=null;
  if(rel==='par'||rel==='same'){ d2=mulA(pick([1,-1,2,-2]),d1); P2=rel==='same'?addA(P1,mulA(ri(1,3),d1)):addA(P1,rv(3,-3,3)); if(rel==='par'&&n2(crossA(subA(P2,P1),d1))===0) return null; }
  else { d2=rv(3,-3,3); if(n2(crossA(d1,d2))===0) return null;
    const s=ri(-2,2), t=ri(-2,2); X0=addA(P1,mulA(s,d1)); P2=subA(X0,mulA(t,d2));
    if(rel==='skew'){ const nrm=crossA(d1,d2); P2=addA(P2,mulA(1,reduceInt(nrm))); X0=null; } }
  const L1=lineKey(P1,d1,'t'), L2=lineKey(P2,d2,'s');
  const fake=X0&&ptx(addA(P1,d1))===ptx(X0)?addA(P1,mulA(2,d1)):addA(P1,d1), fake2=P2;
  const O={par:'The lines are parallel (and distinct).',same:'They are the same line.',skew:'The lines are skew.'};
  const opts=[{h:O.par,ok:rel==='par',why:'Parallel means the directions are multiples of each other.'},
    {h:O.skew,ok:rel==='skew',why:'Skew lines have non-parallel directions AND no common point; check by solving for t and s.'},
    {h:`They intersect at ${m`${ptx(X0||fake)}`}.`,ok:rel==='int',why:X0?'':'Solving the x and y equations gives values of t and s that fail the z equation.'},
    {h:`They intersect at ${m`${ptx(fake2)}`}.`,ok:false,why:'That is just the base point of the second line; check it lies on the first line.'},
    {h:O.same,ok:rel==='same',why:'Same line needs parallel directions AND a shared point.'}];
  for(let i=opts.length-1;i>=0;i--) if(opts.findIndex(o=>o.h===opts[i].h)<i) opts.splice(i,1);
  if(opts.length<4) return null;
  if(rel!=='int'&&!opts.some(o=>o.ok)) return null;
  return {q:`Classify the lines ${m`\mathbf r_1(t)=${tex(L1)}`} and ${m`\mathbf r_2(s)=${tex(L2)}`}.`,kind:'choice',opts,lv:2,
    ans:opts.find(o=>o.ok).h,
    how:'Compare directions first (parallel?). If not parallel, solve r₁(t) = r₂(s) with two components and test the third.',
    sol:[['Directions.',X`\mathbf v_1=${vt(d1)},\qquad \mathbf v_2=${vt(d2)}\quad(${n2(crossA(d1,d2))?'\\text{not parallel}':'\\text{parallel}'})`],
         [rel==='par'?'Parallel directions, and the second base point is not on the first line.':rel==='same'?'Parallel directions, and a point of the second line lies on the first.':
          rel==='int'?'Solve two component equations for t and s; the third agrees.':'Solving two component equations gives t and s that fail the third: no common point.',
          rel==='int'?X`\text{intersection}=${ptx(X0)}`:'']],
    chk:{op:'linerel',n:{P1,d1,P2,d2,rel,X0}}};
});

add('dist-pt-line','Lines','13.5',()=>{
  const P=rv(3,-4,4), d=rv(3,-2,2), Q=addA(P,rv(3,-3,3)), w=subA(Q,P), c=crossA(w,d), s=n2(c), sd=n2(d);
  if(!s||!sd||s*sd>3000) return null;
  const ans=surd(1,sd,s*sd);                       /* √s/√sd */
  return {q:`Find the distance from ${m`Q${ptx(Q)}`} to the line ${m`\mathbf r(t)=${tex(lineKey(P,d))}`}.`,kind:'expr',ans,lv:3,
    dis:[{a:sqrtS(s),why:'Forgot to divide |PQ × v| by |v|.'},{a:surd(Math.abs(dotA(w,d)),sd,sd)||'1',why:'|PQ·v|/|v| is the length along the line, not the distance to it.'},
         {a:sqrtS(n2(w)),why:'|PQ| is the distance to one particular point on the line, not the closest one.'},{a:frac(s,sd),why:'Forgot the square roots.'}],
    how:'d = |PQ × v| / |v|, P any point on the line.',
    sol:[['A point P on the line, its direction v, and PQ.',X`P=${ptx(P)},\ \ \mathbf v=${vt(d)},\ \ \overrightarrow{PQ}=${vt(w)}`],
         ['Cross product.',X`\overrightarrow{PQ}\times\mathbf v=${vt(c)},\qquad |\cdot|=\sqrt{${s}}`],['Divide by |v|.',X`d=\frac{\sqrt{${s}}}{\sqrt{${sd}}}=${tex(ans)}`]],
    chk:{op:'distline',n:{P,d,Q}}};
});

/* ---------------- 13.5 Planes ---------------- */
add('plane-thru','Planes','13.5',()=>{
  const kind=pick(['pn','3pt','3pt','parallel','perpline']); const P=rv(3,-4,4); let n,q,tr=[],pts=null;
  if(kind==='pn'){ n=rv(3,-5,5); q=`Find an equation of the plane through ${mp(P)} with normal vector ${m`${vt(n)}`}.`;
    tr=[{a:planeKey(P,dotA(P,n)),why:'Swapped the point and the normal: the normal gives the coefficients of x, y, z.'}]; }
  else if(kind==='3pt'){ const Q=addA(P,rv(3,-3,3)), R=addA(P,rv(3,-3,3)); pts=[P,Q,R]; n=crossA(subA(Q,P),subA(R,P)); if(!n2(n)) return null;
    q=`Find an equation of the plane through ${m`P${ptx(P)}`}, ${m`Q${ptx(Q)}`}, and ${m`R${ptx(R)}`}.`;
    const w=subA(Q,P), nj=[n[0],-n[1],n[2]]; tr=[{a:planeKey(w,dotA(w,P)),why:'Used PQ as the normal; the normal is PQ × PR.'},
      {a:planeKey(nj,dotA(nj,P)),why:'Sign slip on the j component of the cross product.'}]; }
  else if(kind==='parallel'){ n=rv(3,-5,5); const c=ri(-9,9);
    q=`Find an equation of the plane through ${mp(P)} that is parallel to ${mk(`${sumS([mono(n[0],{x:1}),mono(n[1],{y:1}),mono(n[2],{z:1})])} = ${c}`)}.`;
    tr=[{a:planeKey(n,c),why:'Kept the old constant; recompute d from the new point.'}]; }
  else { n=rv(3,-4,4); const R=rv(3,-4,4);
    q=`Find an equation of the plane through ${mp(P)} that is perpendicular to the line ${m`\mathbf r(t)=${tex(lineKey(R,n))}`}.`;
    tr=[{a:planeKey(R,dotA(R,P)),why:'Used the line’s base point as the normal; the normal is the line’s direction.'}]; }
  const d=dotA(n,P), ans=planeKey(n,d);
  return {q,kind:'eq',ans,lv:kind==='3pt'?2:1,
    dis:tr.concat([{a:planeKey(n,-d||d+5),why:'Sign slip computing d = n · P.'},{a:planeKey(n,d+n[0]||d+1),why:'Arithmetic slip in d = ax₀ + by₀ + cz₀.'}]),
    how:'a(x−x₀) + b(y−y₀) + c(z−z₀) = 0 with normal ⟨a, b, c⟩.',
    sol:[kind==='3pt'?['Normal from the cross product of two edges.',X`\mathbf n=\overrightarrow{PQ}\times\overrightarrow{PR}=${vt(n)}`]:['Normal vector.',X`\mathbf n=${vt(n)}`],
         ['Plug in the point.',X`${n[0]}(x-${fmtC(P[0])})+${fmtC(n[1])}(y-${fmtC(P[1])})+${fmtC(n[2])}(z-${fmtC(P[2])})=0`],['Simplify (any nonzero multiple is fine).',tex(ans)]],
    chk:pts?{op:'plane3',n:{P:pts[0],Q:pts[1],R:pts[2]}}:{op:'plane',n:{n,P}}};
});

add('plane-axes','Planes','13.5',()=>{
  const n=rv(3,-6,6,true), d=nz(-12,12), i=ri(0,2);
  const eq=`${sumS([mono(n[0],{x:1}),mono(n[1],{y:1}),mono(n[2],{z:1})])} = ${d}`;
  const pt=[0,0,0]; pt[i]=d/n[i]; const ans=P3(...pt.map((x,j)=>j===i?frac(d,n[i]):'0'));
  return {q:`Where does the plane ${mk(eq)} cross the ${AX[i]}-axis?`,kind:'point',ans,lv:1,
    dis:[{a:P3(...pt.map((x,j)=>j===i?frac(n[i],d):'0')),why:'Inverted the fraction.'},{a:P3(...pt.map((x,j)=>j===i?frac(-d,n[i]):'0')),why:'Sign slip.'},
         {a:P3(...[0,0,0].map((x,j)=>j===i?'0':frac(d,n[j]))),why:'On the '+AX[i]+'-axis the OTHER two coordinates are 0.'}],
    how:'On an axis the other two coordinates are zero.',
    sol:[[`Set the other two coordinates to 0 and solve.`,X`${n[i]}${AX[i]}=${d}\quad\Rightarrow\quad ${AX[i]}=${tex(frac(d,n[i]))}`],['',tex(ans)]],
    chk:{op:'planeaxis',n:{n,d,i}}};
});

add('planes-rel','Planes','13.5',()=>{
  const n1=rv(3,-4,4), rel=pick(['par','orth','neither']); let n2_;
  if(rel==='par') n2_=mulA(pick([2,-1,-2,3]),n1);
  else if(rel==='orth'){ const w=rv(3,-3,3); n2_=crossA(n1,w); if(!n2(n2_)) return null; n2_=reduceInt(n2_); }
  else { n2_=rv(3,-4,4); if(!dotA(n1,n2_)||!n2(crossA(n1,n2_))) return null; }
  const c1=ri(-8,8), c2=ri(-8,8), E=(n,c)=>`${sumS([mono(n[0],{x:1}),mono(n[1],{y:1}),mono(n[2],{z:1})])} = ${c}`;
  if(rel==='par'&&c2===c1*(n2_[0]/n1[0]||n2_[1]/n1[1]||n2_[2]/n1[2])) return null;
  const opts=[{h:'Parallel',ok:rel==='par',why:'Parallel planes have normals that are multiples of each other.'},{h:'Orthogonal',ok:rel==='orth',why:'Orthogonal planes have normals with dot product 0.'},
    {h:'Neither parallel nor orthogonal',ok:rel==='neither',why:'Check both: are the normals multiples? Is their dot product 0?'},{h:'The same plane',ok:false,why:'Same plane needs proportional normals AND proportional constants.'}];
  return {q:`Are the planes ${mk(E(n1,c1))} and ${mk(E(n2_,c2))} parallel, orthogonal, or neither?`,kind:'choice',opts,ans:opts.find(o=>o.ok).h,lv:1,
    how:'Compare normal vectors: multiples → parallel; dot product 0 → orthogonal.',
    sol:[['Normals.',X`\mathbf n_1=${vt(n1)},\qquad \mathbf n_2=${vt(n2_)}`],['Test.',X`\mathbf n_1\cdot\mathbf n_2=${dotA(n1,n2_)}${rel==='par'?',\\quad \\mathbf n_2='+(n2_[0]/n1[0]||n2_[1]/n1[1]||n2_[2]/n1[2])+'\\mathbf n_1':''}`]],
    chk:{op:'planerel',n:{n1,n2:n2_,rel}}};
});

add('plane-angle','Planes','13.5',()=>{
  const e=pick(NICE_ANG.filter(x=>x[0].length===3&&x[2]!=='0'&&x[2]!=='pi'&&x[2]!=='pi/2')); const [n1,n2_]=orthoScramble(e[0],e[1]);
  const d=dotA(n1,n2_), a=n2(n1), b=n2(n2_); const acute=Math.acos(Math.abs(d)/Math.sqrt(a*b));
  const ans={'pi/4':'pi/4','pi/3':'pi/3','2pi/3':'pi/3','3pi/4':'pi/4'}[e[2]];
  const E=(n)=>`${sumS([mono(n[0],{x:1}),mono(n[1],{y:1}),mono(n[2],{z:1})])} = ${ri(-5,5)}`;
  return {q:`Find the acute angle between the planes ${mk(E(n1))} and ${mk(E(n2_))}.`,kind:'expr',ans,lv:2,
    dis:[{a:ans==='pi/3'?'2pi/3':'3pi/4',why:'That angle is obtuse; the angle between planes uses |n₁ · n₂|.'},{a:ans==='pi/3'?'pi/6':'pi/4 + pi/2',why:'Took the complement; the planes meet at the same angle as their normals.'},
         {a:'pi/2',why:'The normals are not orthogonal here.'}],
    how:'cos θ = |n₁ · n₂| / (|n₁||n₂|).',
    sol:[['Normals, their dot product and lengths.',X`${vt(n1)}\cdot${vt(n2_)}=${d},\qquad |\mathbf n_1||\mathbf n_2|=\sqrt{${a}}\sqrt{${b}}`],
         ['Use the absolute value for the acute angle.',X`\cos\theta=\frac{${Math.abs(d)}}{\sqrt{${a*b}}}\quad\Rightarrow\quad\theta=${tex(ans)}`]],
    chk:{op:'planeangle',e:{u:vint(n1),v:vint(n2_)}}};
});

add('plane-plane-line','Planes','13.5',()=>{
  const n1=rv(3,-3,3), n2_=rv(3,-3,3), d=crossA(n1,n2_); if(!n2(d)) return null;
  const P=rv(3,-3,3), c1=dotA(n1,P), c2=dotA(n2_,P), dd=reduceInt(d);
  const E=(n,c)=>`${sumS([mono(n[0],{x:1}),mono(n[1],{y:1}),mono(n[2],{z:1})])} = ${c}`;
  const ans=lineKey(P,dd);
  return {q:`Find a vector equation of the line where the planes ${mk(E(n1,c1))} and ${mk(E(n2_,c2))} intersect.`,kind:'line',line:{p:P,d:dd},ans,lv:3,
    dis:[{a:lineKey(P,addA(n1,n2_).some(x=>x)?addA(n1,n2_):n1),why:'The direction is n₁ × n₂; adding normals gives a vector that is not in both planes.'},
         {a:lineKey(P,n1),why:'A plane’s normal is perpendicular to every line in that plane.'},
         {a:lineKey(addA(P,n1),dd),why:'Right direction, but the point is not on both planes.'}],
    how:'Direction = n₁ × n₂; find one common point (e.g. set one coordinate and solve).',
    sol:[['The line lies in both planes, so it is orthogonal to both normals.',X`\mathbf v=\mathbf n_1\times\mathbf n_2=${vt(d)}\ \parallel\ ${vt(dd)}`],
         ['Find a point on both planes (fix one coordinate, solve the 2×2 system).',X`P=${ptx(P)}`],['',X`\mathbf r(t)=${tex(ans)}`]],
    chk:{op:'planeline',n:{n1,c1,n2:n2_,c2},e:{ans}}};
});

add('line-plane-pt','Planes','13.5',()=>{
  const n=rv(3,-3,3), d=rv(3,-3,3), dn=dotA(n,d); if(!dn) return null;
  const t0=ri(-3,3), X0=rv(3,-4,4), P=subA(X0,mulA(t0,d)), c=dotA(n,X0);
  const E=`${sumS([mono(n[0],{x:1}),mono(n[1],{y:1}),mono(n[2],{z:1})])} = ${c}`;
  return {q:`Find the point where the line ${m`\mathbf r(t)=${tex(lineKey(P,d))}`} meets the plane ${mk(E)}.`,kind:'point',ans:P3(...X0),lv:2,
    dis:[{a:P3(...addA(P,mulA(-t0,d))),why:'Sign slip solving for t.'},{a:P3(...P),why:'That is the line’s base point (t = 0).'},{a:P3(...addA(P,mulA(t0+1,d))),why:'Off by one when solving for t.'}],
    how:'Substitute x(t), y(t), z(t) into the plane, solve for t, plug back in.',
    sol:[['Substitute the line into the plane.',X`${n[0]}(${tex(lin(P[0],d[0]))})+${fmtC(n[1])}(${tex(lin(P[1],d[1]))})+${fmtC(n[2])}(${tex(lin(P[2],d[2]))})=${c}`],
         ['Solve for t.',X`${dotA(n,P)}${dn<0?'':'+'}${dn}t=${c}\quad\Rightarrow\quad t=${t0}`],['Plug back in.',ptx(X0)]],
    chk:{op:'lineplane',n:{P,d,n,c}}};
});

add('dist-pt-plane','Planes','13.5',()=>{
  const n=rv(3,-4,4,false), c=ri(-8,8), Q=rv(3,-5,5), s=n2(n), num=dotA(n,Q)-c; if(!s||!num) return null;
  const ans=surd(Math.abs(num),s,s);
  const E=`${sumS([mono(n[0],{x:1}),mono(n[1],{y:1}),mono(n[2],{z:1})])} = ${c}`;
  return {q:`Find the distance from ${m`${ptx(Q)}`} to the plane ${mk(E)}.`,kind:'expr',ans,lv:2,
    dis:[{a:frac(Math.abs(num),s),why:'Divided by |n|² instead of |n|.'},{a:surd(Math.abs(dotA(n,Q)),s,s)||'1',why:'Forgot to subtract the constant d.'},
         {a:String(Math.abs(num)),why:'Forgot to divide by |n|.'},{a:surd(Math.abs(dotA(n,Q)+c),s,s),why:'Sign slip: the formula uses ax₀ + by₀ + cz₀ − d.'}],
    how:'D = |ax₀ + by₀ + cz₀ − d| / √(a² + b² + c²)',
    sol:[['Plug the point into the plane’s left side and subtract d.',X`${dotA(n,Q)}-(${c})=${num}`],['Divide by the length of the normal.',X`D=\frac{|${num}|}{\sqrt{${s}}}=${tex(ans)}`]],
    chk:{op:'distplane',n:{n,c,Q}}};
});

/* ---------------- 13.6 Quadric surfaces ---------------- */
const QNAMES=['Ellipsoid','Hyperboloid of one sheet','Hyperboloid of two sheets','Elliptic cone','Elliptic paraboloid','Hyperbolic paraboloid','Elliptic cylinder','Parabolic cylinder','Hyperbolic cylinder'];
const QWHY={'Ellipsoid':'All three squares positive, equal to a positive constant.','Hyperboloid of one sheet':'Three squares, ONE negative, = positive constant.',
  'Hyperboloid of two sheets':'Three squares, TWO negative, = positive constant.','Elliptic cone':'Three squares with mixed signs = 0.',
  'Elliptic paraboloid':'One variable appears to the first power; the two squares have the same sign.','Hyperbolic paraboloid':'One linear variable; the two squares have opposite signs (a saddle).',
  'Elliptic cylinder':'A variable is missing entirely, and the remaining two squares have the same sign.','Parabolic cylinder':'A variable is missing and one of the others is only to the first power.',
  'Hyperbolic cylinder':'A variable is missing and the two squares have opposite signs.'};
add('quad-name','Quadric surfaces','13.6',()=>{
  const type=pick(QNAMES), p=shuf(['x','y','z']), A=ri(1,9), B=ri(1,9), C=ri(1,9), D=ri(1,36);
  /* terms as [coef, var, power]; lhs = rhs */
  const T2=(c,v)=>[c,v,2], T1=(c,v)=>[c,v,1];
  let L,R;
  switch(type){
    case 'Ellipsoid': L=[T2(A,p[0]),T2(B,p[1]),T2(C,p[2])]; R=[[D,'',0]]; break;
    case 'Hyperboloid of one sheet': L=[T2(A,p[0]),T2(B,p[1]),T2(-C,p[2])]; R=[[D,'',0]]; break;
    case 'Hyperboloid of two sheets': L=[T2(-A,p[0]),T2(-B,p[1]),T2(C,p[2])]; R=[[D,'',0]]; break;
    case 'Elliptic cone': L=[T2(A,p[0]),T2(B,p[1])]; R=[T2(C,p[2])]; break;
    case 'Elliptic paraboloid': L=[T1(1,p[2])]; R=[T2(A,p[0]),T2(B,p[1])]; break;
    case 'Hyperbolic paraboloid': L=[T1(1,p[2])]; R=[T2(A,p[0]),T2(-B,p[1])]; break;
    case 'Elliptic cylinder': L=[T2(A,p[0]),T2(B,p[1])]; R=[[D,'',0]]; break;
    case 'Parabolic cylinder': L=[T1(1,p[1])]; R=[T2(A,p[0])]; break;
    default: L=[T2(A,p[0]),T2(-B,p[1])]; R=[[D,'',0]];
  }
  if(coin(0.3)){ L=L.map(([c,v,k])=>[-c,v,k]); R=R.map(([c,v,k])=>[-c,v,k]); }   /* multiply through by −1 */
  if(coin(0.3)) [L,R]=[R,L];
  const side=ts=>sumS(shuf(ts).map(([c,v,k])=>k===0?String(c):mono(c,{[v]:k})));
  const eq=`${side(L)} = ${side(R)}`;
  let others=shuf(QNAMES.filter(n=>n!==type));
  const near={'Hyperboloid of one sheet':'Hyperboloid of two sheets','Hyperboloid of two sheets':'Hyperboloid of one sheet','Elliptic paraboloid':'Hyperbolic paraboloid',
    'Hyperbolic paraboloid':'Elliptic paraboloid','Elliptic cone':'Hyperboloid of one sheet','Ellipsoid':'Elliptic cylinder','Elliptic cylinder':'Ellipsoid','Parabolic cylinder':'Elliptic paraboloid','Hyperbolic cylinder':'Hyperboloid of one sheet'}[type];
  others=[near].concat(others.filter(o=>o!==near)).slice(0,4);
  const opts=[{h:type,ok:true}].concat(others.map(o=>({h:o,why:QWHY[o]})));
  return {q:`Identify the surface ${mk(eq)}.`,kind:'choice',opts,ans:type,lv:1,
    how:'Count the squared variables, check which are negative, and see whether the constant is 0 or a variable is linear or missing.',
    sol:[[`${QWHY[type]}`,tex(eq)]],chk:{op:'quad',e:{eq},n:{type}}};
});

add('quad-trace','Quadric surfaces','13.6',()=>{
  const A=ri(1,4), B=ri(1,4), C=ri(1,4), D=pick([4,9,16,36]), k=ri(-3,3);
  const kinds=[
    {eq:`${sumS([mono(A,{x:2}),mono(B,{y:2}),mono(-C,{z:2})])} = ${D}`,var:'z',curve:D+C*k*k>0?'Ellipse':'no'},
    {eq:`${sumS([mono(-A,{x:2}),mono(B,{y:2}),mono(C,{z:2})])} = ${D}`,var:'z',curve:D-C*k*k>0?'Hyperbola':D-C*k*k<0?'Hyperbola':'Pair of lines'},
    {eq:`z = ${sumS([mono(A,{x:2}),mono(-B,{y:2})])}`,var:'z',curve:k===0?'Pair of lines':'Hyperbola'},
    {eq:`z = ${sumS([mono(A,{x:2}),mono(B,{y:2})])}`,var:'z',curve:k>0?'Ellipse':k===0?'Single point':'No points (empty trace)'},
    {eq:`z = ${sumS([mono(A,{x:2}),mono(B,{y:2})])}`,var:'x',curve:'Parabola'},
    {eq:`${sumS([mono(A,{x:2}),mono(B,{y:2}),mono(C,{z:2})])} = ${D}`,var:'y',curve:D-B*k*k>0?'Ellipse':D-B*k*k===0?'Single point':'No points (empty trace)'}];
  const s=pick(kinds); if(s.curve==='no') return null;
  const names=['Ellipse','Hyperbola','Parabola','Pair of lines','Single point','No points (empty trace)'];
  const opts=[{h:s.curve,ok:true}].concat(shuf(names.filter(x=>x!==s.curve)).slice(0,4).map(h=>({h,why:'Substitute the constant and look at what is left: same-sign squares → ellipse, opposite signs → hyperbola, one linear variable → parabola.'})));
  return {q:`What is the trace of the surface ${mk(s.eq)} in the plane ${m`${s.var}=${k}`}?`,kind:'choice',opts,ans:s.curve,lv:2,
    how:'Substitute the plane’s constant for that variable and classify the remaining equation in two variables.',
    sol:[[`Set ${s.var} = ${k} in the equation and look at the two remaining variables.`,X`${tex(s.eq)}\quad\text{with}\quad ${s.var}=${k}`],['',X`\text{${s.curve}}`]],
    chk:{op:'trace',e:{eq:s.eq},n:{v:s.var,k,curve:s.curve}}};
});
