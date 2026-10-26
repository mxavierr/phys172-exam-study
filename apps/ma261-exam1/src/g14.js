
/* =====================================================================
   14.1–14.5   vector-valued functions, their calculus, motion (no forces),
   arc length, curvature and normal vectors
   ===================================================================== */

/* polynomials in t as coefficient arrays [c0, c1, c2, ...] */
const polyS=(cs,v)=>{ v=v||'t'; const terms=[]; for(let n=cs.length-1;n>=0;n--){ const c=cs[n]; if(c===0||c==='0') continue;
  terms.push(n===0?String(c):mono(c,{[v]:n})); } return sumS(terms); };
const polyD=cs=>cs.slice(1).map((c,i)=>c*(i+1));
const polyE=(cs,t)=>cs.reduce((s,c,n)=>s+c*Math.pow(t,n),0);
const rpoly=(deg,lo,hi)=>{ const cs=Array.from({length:deg+1},()=>ri(lo,hi)); if(cs[deg]===0) cs[deg]=nz(lo,hi); return cs; };
const vpoly=a=>V(...a.map(c=>polyS(c)));
const ev=(s,env)=>mEval(mParse(s),env||{});

/* a component f(t) with its derivative and a tempting wrong derivative */
function compD(){
  const a=nz(-4,4), b=ri(2,5), n=ri(2,4), c=ri(1,5);
  return pick([
    {f:mono(a,{t:n}),d:mono(a*n,{t:n-1}),trap:mono(a,{t:n-1}),why:'Power rule: bring the exponent down.'},
    {f:`sin(${b}*t)`,d:`${b}*cos(${b}*t)`,trap:`cos(${b}*t)`,why:'Chain rule: the inside derivative is '+b+'.'},
    {f:`cos(${b}*t)`,d:`-${b}*sin(${b}*t)`,trap:`${b}*sin(${b}*t)`,why:'The derivative of cos is −sin.'},
    {f:`e^(${b}*t)`,d:`${b}*e^(${b}*t)`,trap:`e^(${b}*t)`,why:'Chain rule: e^{bt} differentiates to b·e^{bt}.'},
    {f:`t*e^(${b}*t)`,d:`e^(${b}*t) + ${b}*t*e^(${b}*t)`,trap:`${b}*e^(${b}*t)`,why:'Product rule: (t)′·e^{bt} + t·(e^{bt})′.'},
    {f:`ln(t^2 + ${c})`,d:`2*t/(t^2 + ${c})`,trap:`1/(t^2 + ${c})`,why:'Chain rule: (ln u)′ = u′/u with u′ = 2t.'},
    {f:`cos(t^2)`,d:`-2*t*sin(t^2)`,trap:`-sin(t^2)`,why:'Chain rule: the inside t² differentiates to 2t.'},
    {f:`t^2*sin(t)`,d:`2*t*sin(t) + t^2*cos(t)`,trap:`2*t*cos(t)`,why:'Product rule, not the product of the derivatives.'},
    {f:`sqrt(t^2 + ${c})`,d:`t/sqrt(t^2 + ${c})`,trap:`1/(2*sqrt(t^2 + ${c}))`,why:'Chain rule: multiply by the inside derivative 2t.'}]);
}

/* ---------------- 14.1 ---------------- */
add('vf-seg','Vector functions','14.1',()=>{
  const n=pick([2,3,3]), P=rv(n,-5,5), Q=rv(n,-5,5), d=subA(Q,P); if(!n2(d)) return null;
  const ans=lineKey(P,d);
  return {q:`Find ${m`\mathbf r(t)`} for the line segment from ${m`P${ptx(P)}`} to ${m`Q${ptx(Q)}`}, with ${m`\mathbf r(0)=P`} and ${m`\mathbf r(1)=Q`}.`,
    kind:'vec',vars:['t'],ans,lv:1,
    dis:[{a:lineKey(P,Q),why:'P + tQ does not end at Q; the direction must be Q − P.'},{a:lineKey(Q,subA(P,Q)),why:'That runs from Q to P (it starts at Q).'},
         {a:lineKey(P,subA(P,Q)),why:'Direction reversed: use Q − P so that t = 1 lands on Q.'},{a:lineKey(Q,d),why:'Started at Q instead of P.'}],
    how:'r(t) = P + t(Q − P), 0 ≤ t ≤ 1.',
    sol:[['Start at P and move along Q − P.',X`\mathbf r(t)=${ptx(P)}+t\,${vt(d)}=${tex(ans)},\quad 0\le t\le 1`]],
    chk:{op:'seg',n:{P,Q}}};
});

add('vf-limit','Vector functions','14.1',()=>{
  const zero=coin(0.6), b=ri(2,6), c=nz(-4,4), d=ri(-5,5);
  let a, bank;
  if(zero){ a=0; bank=[[`sin(${b}*t)/t`,String(b),'0'],[`(e^(${b}*t) - 1)/t`,String(b),'0'],[`(1 - cos(t))/t`,'0','1'],
                      [`(t^2 + ${b}*t)/t`,String(b),'0'],[polyS([d,0,c]),String(d),String(d+c)],[`cos(t) + ${b}`,String(1+b),String(b)]]; }
  else { a=nz(-3,3); bank=[[`(t^2 - ${a*a})/(t - ${fmtC(a)})`,String(2*a),'0'],[`(t^3 - ${fmtC(a*a*a)})/(t - ${fmtC(a)})`,String(3*a*a),'0'],
                          [polyS([d,c]),String(d+c*a),String(d)],[`e^(t - ${fmtC(a)})`,'1','0'],[`${b}*t^2`,String(b*a*a),String(b*a)]]; }
  const picks=shuf(bank).slice(0,3), ans=V(...picks.map(p=>p[1]));
  const r=V(...picks.map(p=>p[0]));
  const trapI=picks.findIndex(p=>p[2]!==p[1]);
  const mut=(k,val)=>V(...picks.map((p,i)=>i===k?val:p[1]));
  return {q:`Evaluate ${m`\lim_{t\to ${a}}\ ${tex(r)}`}.`,kind:'vec',ans,lv:2,
    dis:[{a:mut(0,picks[0][2]),why:'Plugging in to get 0/0 does not mean the limit is 0 (or 1): simplify, or use a standard limit.'},
         {a:mut(1,picks[1][2]),why:'Evaluate each component’s limit carefully: sin(bt)/t → b, (e^{bt} − 1)/t → b, (t² − a²)/(t − a) → 2a.'},
         {a:mut(2,picks[2][2]),why:'One component was evaluated incorrectly.'},{a:V(...picks.map(p=>p[2])),why:'Several components treated as 0/0 = 0.'}],
    how:'Take the limit of each component separately.',
    sol:[['Limit component by component.',X`\lim_{t\to ${a}}\mathbf r(t)=\left\langle ${picks.map(p=>X`\lim_{t\to ${a}}${tex(p[0])}`).join(',\\ ')}\right\rangle`],['',tex(ans)]],
    chk:{op:'vlim',e:{r,a:String(a)}}};
});

add('vf-domain','Vector functions','14.1',()=>{
  const c1=ri(-4,2), c2=c1+ri(2,6), ex=coin(0.5)?ri(c1+1,c2-1):null, loC=coin(), hiC=coin();
  const lo=loC?`sqrt(${shift('t',c1)})`:`ln(${shift('t',c1)})`, hi=hiC?`sqrt(${c2} - t)`:`1/sqrt(${c2} - t)`;
  const comps=shuf([lo,hi,ex!==null?`1/(${shift('t',ex)})`:pick(['t^2','e^t','cos(t)'])]);
  const I=(lc,hc,e)=>{ const L=`${lc?'[':'('}${c1},\\ `, H=`${c2}${hc?']':')'}`; return e!==null?`${L}${e})\\cup(${e},\\ ${H}`:`${L}${H}`; };
  const opts=[{h:m`${I(loC,hiC,ex)}`,ok:true},
    {h:m`${I(!loC,hiC,ex)}`,why:loC?'√(t − a) is defined AT t = a (√0 = 0), so the endpoint is included.':'ln(t − a) needs t − a > 0 strictly, so the endpoint is excluded.'},
    {h:m`${I(loC,!hiC,ex)}`,why:hiC?'√(b − t) is defined at t = b.':'1/√(b − t) needs b − t > 0 strictly.'},
    {h:ex!==null?m`${I(loC,hiC,null)}`:m`${I(!loC,!hiC,null)}`,why:ex!==null?'1/(t − c) is undefined at t = c, so that point is removed.':'Check each endpoint separately.'},
    {h:m`(-\infty,\ \infty)`,why:'The domain of r is where EVERY component is defined: the intersection of their domains.'}];
  return {q:`Find the domain of ${m`\mathbf r(t)=${tex(V(...comps))}`}.`,kind:'choice',opts,ans:opts[0].h,lv:2,
    how:'The domain of r(t) is the intersection of the domains of its components.',
    sol:[['Domain of each component, then intersect.',X`${comps.map(c=>tex(c)).join(',\\quad ')}`],['',I(loC,hiC,ex)]],
    chk:{op:'domain1',e:{r:V(...comps)},n:{c1,c2,loC:loC?1:0,hiC:hiC?1:0,ex}}};
});

add('vf-plane-meet','Vector functions','14.1',()=>{
  const t1=ri(-3,3); let t2=ri(-3,3); if(t2===t1) return null;
  const p=ri(-3,3), c=nz(-3,3), q=ri(-3,3), beta=nz(-2,2), alpha=t1+t2-beta*c, delta=t1*t2+alpha*p+beta*q;
  const r=V(polyS([p,1]),'t^2',polyS([q,c]));
  const R=t=>[t+p,t*t,c*t+q];
  const plane=`${sumS([mono(alpha,{x:1}),'-y',mono(beta,{z:1})])} = ${delta}`;
  const ans=`${P3(...R(t1))}, ${P3(...R(t2))}`;
  return {q:`Find all points where the curve ${m`\mathbf r(t)=${tex(r)}`} meets the plane ${mk(plane)}.`,kind:'points',ans,lv:2,
    dis:[{a:P3(...R(t1)),why:'The quadratic in t has two roots; each gives a point.'},{a:`${P3(...R(-t1))}, ${P3(...R(-t2))}`,why:'Sign slip solving the quadratic for t.'},
         {a:`(${t1}, ${t2})`,why:'Those are the parameter values, not the points; plug them back into r(t).'},{a:`${P3(...R(t1+1))}, ${P3(...R(t2+1))}`,why:'Arithmetic slip in the roots.'}],
    how:'Substitute x(t), y(t), z(t) into the plane, solve for t, then evaluate r(t).',
    sol:[['Substitute the curve into the plane.',X`${alpha}(${tex(polyS([p,1]))})-t^2+${fmtC(beta)}(${tex(polyS([q,c]))})=${delta}`],
         ['Solve the quadratic.',X`t^2-${fmtC(t1+t2)}t+${fmtC(t1*t2)}=0\quad\Rightarrow\quad t=${t1},\ ${t2}`],['Evaluate r at each root.',tex(ans)]],
    chk:{op:'curveplane',e:{r,plane}}};
});

const SURF_POOL=['x^2 + y^2 = R2','z^2 = x^2 + y^2','z = x^2 + y^2','x^2 + y^2 + z^2 = R2','z = x^2 - y^2','y = x^2','x^2 + z^2 = R2','z = x*y'];
add('vf-surface','Vector functions','14.1',()=>{
  const a=ri(2,4), b=ri(1,3);
  const C=pick([
    {r:`<${a}*cos(t), ${a}*sin(t), ${b}*t>`,eq:`x^2 + y^2 = ${a*a}`,name:'a circular cylinder'},
    {r:`<t*cos(t), t*sin(t), t>`,eq:`z^2 = x^2 + y^2`,name:'a cone'},
    {r:`<t*cos(t), t*sin(t), t^2>`,eq:`z = x^2 + y^2`,name:'a paraboloid'},
    {r:`<${a}*sin(t)*cos(t), ${a}*sin(t)^2, ${a}*cos(t)>`,eq:`x^2 + y^2 + z^2 = ${a*a}`,name:'a sphere'},
    {r:`<e^t*cos(t), e^t*sin(t), e^t>`,eq:`z^2 = x^2 + y^2`,name:'a cone'},
    {r:`<t, ${b}*t, ${b}*t^2>`,eq:`z = x*y`,name:'a hyperbolic paraboloid (z = xy)'},
    {r:`<${a}*cos(t), t, ${a}*sin(t)>`,eq:`x^2 + z^2 = ${a*a}`,name:'a circular cylinder along the y-axis'}]);
  const onS=eq=>{ const e=mParse(eq); return [0.4,1.3,2.2].every(t=>{ const p=ev(C.r,{t}); const env={x:p[0],y:p[1],z:p[2]};
    return Math.abs(mEval(e.a,env)-mEval(e.b,env))<1e-9; }); };
  const pool=shuf(SURF_POOL.map(s=>s.replace('R2',String(pick([a*a,a*a+1,4,9]))))).filter(s=>s!==C.eq&&!onS(s));
  if(pool.length<4) return null;
  const opts=[{h:mk(C.eq),ok:true}].concat(pool.slice(0,4).map(s=>({h:mk(s),why:'Substitute x(t), y(t), z(t): this equation fails for most t.'})));
  return {q:`On which surface does the curve ${m`\mathbf r(t)=${tex(C.r)}`} lie?`,kind:'choice',opts,ans:opts[0].h,lv:2,
    how:'Substitute the components into each equation and check it holds for every t.',
    sol:[['Substitute and simplify with sin²t + cos²t = 1.',tex(C.eq)],[`So the curve lies on ${C.name}.`,'']],
    chk:{op:'onsurf',e:Object.assign({r:C.r,eq:C.eq},...[C.eq].concat(pool.slice(0,4)).map((q,i)=>({['o'+i]:q})))}};
});

add('vf-curve-int','Vector functions','14.1',()=>{
  const R=ri(2,4), a=nz(-3,3), b=ri(-3,3), c=ri(-4,4), h=ri(1,3);
  const C=pick([
    {s:[`x^2 + y^2 = ${R*R}`,`z = ${sumS([mono(a,{x:1}),mono(b,{y:1}),String(c)])}`],
     r:V(`${R}*cos(t)`,`${R}*sin(t)`,sumS([`${a*R}*cos(t)`,`${b*R}*sin(t)`,String(c)])),
     bad:[V(`${R}*cos(t)`,`${R}*sin(t)`,sumS([`${a}*cos(t)`,`${b}*sin(t)`,String(c)])),V(`${R*R}*cos(t)`,`${R*R}*sin(t)`,sumS([`${a*R*R}*cos(t)`,`${b*R*R}*sin(t)`,String(c)]))]},
    {s:[`z = x^2 + y^2`,`z = ${R*R}`],r:V(`${R}*cos(t)`,`${R}*sin(t)`,String(R*R)),bad:[V(`${R*R}*cos(t)`,`${R*R}*sin(t)`,String(R*R)),V(`${R}*cos(t)`,`${R}*sin(t)`,String(R))]},
    {s:[`x^2 + y^2 + z^2 = ${R*R+h*h}`,`z = ${h}`],r:V(`${R}*cos(t)`,`${R}*sin(t)`,String(h)),bad:[V(`${sqrtS(R*R+h*h)}*cos(t)`,`${sqrtS(R*R+h*h)}*sin(t)`,String(h)),V(`${R*R}*cos(t)`,`${R*R}*sin(t)`,String(h))]},
    {s:[`y = ${mono(a,{x:2})}`,`z = ${sumS([mono(b||1,{x:1}),String(c)])}`],r:V('t',mono(a,{t:2}),sumS([mono(b||1,{t:1}),String(c)])),bad:[V('t',mono(a,{t:1}),sumS([mono(b||1,{t:1}),String(c)])),V(mono(a,{t:2}),'t',sumS([mono(b||1,{t:1}),String(c)]))]}]);
  return {q:`Find a vector function ${m`\mathbf r(t)`} that traces the curve where the surfaces ${mk(C.s[0])} and ${mk(C.s[1])} intersect. (Any parametrization of the curve is accepted.)`,
    kind:'curve',surf:C.s,ans:C.r,lv:3,
    dis:C.bad.map(x=>({a:x,why:'Substitute back into both surfaces: this one fails at least one of them.'})).concat([{a:V(C.r.slice(1,-1).split(', ')[1],C.r.slice(1,-1).split(', ')[0],C.r.slice(1,-1).split(', ')[2]),why:'Swapped x and y, so the second surface no longer holds.'}]),
    how:'Parametrize one surface (usually the cylinder or the simpler relation), then use the other equation for the last coordinate.',
    sol:[['Parametrize the first relation, then solve the second for the remaining coordinate.',X`${tex(C.s[0])},\qquad ${tex(C.s[1])}`],['',X`\mathbf r(t)=${tex(C.r)}`]],
    chk:{op:'curve2',e:{s0:C.s[0],s1:C.s[1]}}};
});

/* ---------------- 14.2 ---------------- */
add('vf-deriv','Derivatives of r(t)','14.2',()=>{
  const n=pick([2,3,3]), C=Array.from({length:n},compD);
  if(new Set(C.map(c=>c.f)).size<n) return null;
  const r=V(...C.map(c=>c.f)), ans=V(...C.map(c=>c.d));
  const mut=k=>V(...C.map((c,i)=>i===k?c.trap:c.d));
  return {q:`Differentiate ${m`\mathbf r(t)=${tex(r)}`}.`,kind:'vec',vars:['t'],ans,lv:C.some(c=>/\*t\*e|t\^2\*sin|cos\(t\^2|ln|sqrt/.test(c.f))?2:1,
    dis:C.map((c,k)=>({a:mut(k),why:c.why})),
    how:'Differentiate component by component.',
    sol:[['Differentiate each component.',X`\mathbf r'(t)=${tex(ans)}`]],
    chk:{op:'vdiff',e:{r}}};
});

add('vf-T0','Derivatives of r(t)','14.2',()=>{
  let r,v,t0,t0s,rv0;
  if(coin(0.55)){ const cs=[[ri(-3,3),nz(-3,3)],[ri(-3,3),0,nz(-2,2)],[ri(-3,3),0,0,nz(-1,1)]]; t0=pick([1,-1,2]); t0s=String(t0);
    r=vpoly(cs); v=cs.map(c=>polyE(polyD(c),t0)); rv0=cs.map(c=>polyE(c,t0)); }
  else { const R=ri(1,4), h=nz(-4,4), th=pick([0,1,2,3]); t0s=['0','pi/2','pi','3pi/2'][th];
    r=V(`${R}*cos(t)`,`${R}*sin(t)`,mono(h,{t:1}));
    v=[[0,-R,0,R][th],[R,0,-R,0][th],h]; rv0=null; }
  const s=n2(v); if(!s) return null;
  const ans=V(...v.map(x=>rsq(x,s)));
  return {q:`Find the unit tangent vector ${m`\mathbf T`} at ${mk('t = '+t0s)} for ${m`\mathbf r(t)=${tex(r)}`}.`,kind:'vec',ans,lv:2,
    dis:[{a:vint(v),why:'That is r′(t₀); divide by |r′(t₀)| to get a unit vector.'},{a:V(...v.map(x=>frac(x,s))),why:'Divided by |r′|² instead of |r′|.'},
         {a:V(...v.map(x=>rsq(-x,s))),why:'Sign slip in the derivative.'}].concat(rv0&&n2(rv0)?[{a:V(...rv0.map(x=>rsq(x,n2(rv0)))),why:'Normalized r(t₀) instead of r′(t₀): the tangent comes from the derivative.'}]:[]),
    how:'T = r′(t)/|r′(t)|',
    sol:[['Differentiate and evaluate.',X`\mathbf r'(${tex(t0s)})=${vt(v)},\qquad |\mathbf r'|=\sqrt{${s}}`],['Normalize.',X`\mathbf T=${tex(ans)}`]],
    chk:{op:'unitT',e:{r,t0:t0s}}};
});

add('vf-Tgen','Derivatives of r(t)','14.2',()=>{
  const R=ri(1,5), h=nz(-4,4), s=R*R+h*h;
  const r=V(`${R}*cos(t)`,`${R}*sin(t)`,mono(h,{t:1}));
  const ans=V(`${rsq(-R,s)}*sin(t)`,`${rsq(R,s)}*cos(t)`,rsq(h,s)).replace(/\b1\*|--/g,'');
  return {q:`Find the unit tangent vector ${m`\mathbf T(t)`} for ${m`\mathbf r(t)=${tex(r)}`}.`,kind:'vec',vars:['t'],ans,lv:2,
    dis:[{a:V(`${-R}*sin(t)`,`${R}*cos(t)`,String(h)),why:'That is r′(t); divide by its length √(R² + h²).'},
         {a:V(`${frac(-R,s)}*sin(t)`,`${frac(R,s)}*cos(t)`,frac(h,s)),why:'Divided by |r′|² instead of |r′|.'},
         {a:V(`${rsq(R,s)}*sin(t)`,`${rsq(-R,s)}*cos(t)`,rsq(h,s)),why:'Sign slips: (cos t)′ = −sin t and (sin t)′ = cos t.'},
         {a:V(`-sin(t)`,`cos(t)`,'0'),why:'Dropped the z-component: the helix climbs, so T has a z part.'}],
    how:'T = r′/|r′|; here |r′| = √(R² + h²) is constant.',
    sol:[['Derivative and its length.',X`\mathbf r'(t)=\langle -${R}\sin t,\ ${R}\cos t,\ ${h}\rangle,\qquad |\mathbf r'(t)|=\sqrt{${R*R}\sin^2t+${R*R}\cos^2t+${h*h}}=\sqrt{${s}}`],
         ['Divide.',X`\mathbf T(t)=${tex(ans)}`]],
    chk:{op:'unitTgen',e:{r}}};
});

add('vf-tanline','Derivatives of r(t)','14.2',()=>{
  const cs=[rpoly(2,-3,3),rpoly(pick([1,2,3]),-3,3),rpoly(pick([1,2]),-3,3)], t0=pick([-1,1,2]);
  const r=vpoly(cs), p=cs.map(c=>polyE(c,t0)), d=cs.map(c=>polyE(polyD(c),t0)); if(!n2(d)) return null;
  const dd=cs.map(c=>polyE(polyD(polyD(c)),t0));
  const ans=lineKey(p,d);
  return {q:`Find a vector equation of the line tangent to ${m`\mathbf r(t)=${tex(r)}`} at ${m`t=${t0}`}.`,kind:'line',line:{p,d},ans,lv:2,
    dis:[{a:lineKey(p,p.some(x=>x)?p:[1,1,1]),why:'Used r(t₀) as the direction; the direction is r′(t₀).'},{a:lineKey(d,p),why:'Swapped point and direction.'},
         {a:lineKey(p,dd.some(x=>x)?dd:[2,0,1]),why:'Used r″(t₀); the tangent direction is r′(t₀).'},{a:lineKey(cs.map(c=>c[0]),d),why:'Used r(0) as the point; the line passes through r(t₀).'}],
    how:'ℓ(s) = r(t₀) + s·r′(t₀).',
    sol:[['Point and direction at t₀.',X`\mathbf r(${t0})=${ptx(p)},\qquad \mathbf r'(${t0})=${vt(d)}`],['',X`\ell(t)=${tex(ans)}`]],
    chk:{op:'tanline',e:{r,t0:String(t0)}}};
});

add('vf-prodrule','Derivatives of r(t)','14.2',()=>{
  const u=[rpoly(1,-3,3),rpoly(2,-2,2),[ri(-3,3)]], v=[[ri(-3,3)],rpoly(1,-3,3),rpoly(2,-2,2)], t0=pick([0,1,-1,2]);
  const U=vpoly(u), Vv=vpoly(v), cross=coin(0.4);
  const ue=u.map(c=>polyE(c,t0)), ve=v.map(c=>polyE(c,t0)), up=u.map(c=>polyE(polyD(c),t0)), vp=v.map(c=>polyE(polyD(c),t0));
  if(cross){
    const a=addA(crossA(up,ve),crossA(ue,vp)); if(!n2(a)) return null;
    return {q:`Let ${m`\mathbf u(t)=${tex(U)}`} and ${m`\mathbf v(t)=${tex(Vv)}`}. Find ${m`\frac{d}{dt}\big[\mathbf u(t)\times\mathbf v(t)\big]`} at ${m`t=${t0}`}.`,
      kind:'vec',ans:vint(a),lv:3,
      dis:[{a:vint(crossA(up,vp)),why:'u′ × v′ is not the derivative; use the product rule u′ × v + u × v′.'},{a:vint(addA(crossA(ve,up),crossA(vp,ue))),why:'Reversed the order in both terms; cross products are anticommutative.'},
           {a:vint(crossA(up,ve)),why:'Only one term of the product rule.'}],
      how:'(u × v)′ = u′ × v + u × v′ (keep the order).',
      sol:[['Values at t₀.',X`\mathbf u=${vt(ue)},\ \mathbf u'=${vt(up)},\ \mathbf v=${vt(ve)},\ \mathbf v'=${vt(vp)}`],
           ['Product rule, order preserved.',X`\mathbf u'\times\mathbf v+\mathbf u\times\mathbf v'=${vt(crossA(up,ve))}+${vt(crossA(ue,vp))}=${vt(a)}`]],
      chk:{op:'dprod',e:{u:U,v:Vv,t0:String(t0)},n:{cross:1}}};
  }
  const a=dotA(up,ve)+dotA(ue,vp);
  return {q:`Let ${m`\mathbf u(t)=${tex(U)}`} and ${m`\mathbf v(t)=${tex(Vv)}`}. Find ${m`\frac{d}{dt}\big[\mathbf u(t)\cdot\mathbf v(t)\big]`} at ${m`t=${t0}`}.`,
    kind:'expr',ans:String(a),lv:2,
    dis:[{a:String(dotA(up,vp)),why:'u′ · v′ is not the derivative; use u′ · v + u · v′.'},{a:String(dotA(up,ve)),why:'Only one term of the product rule.'},
         {a:String(dotA(ue,vp)),why:'Only one term of the product rule.'},{a:String(dotA(ue,ve)),why:'That is u · v itself, not its derivative.'}],
    how:'(u · v)′ = u′ · v + u · v′.',
    sol:[['Values at t₀.',X`\mathbf u=${vt(ue)},\ \mathbf u'=${vt(up)},\ \mathbf v=${vt(ve)},\ \mathbf v'=${vt(vp)}`],
         ['Product rule.',X`\mathbf u'\cdot\mathbf v+\mathbf u\cdot\mathbf v'=${dotA(up,ve)}+${fmtC(dotA(ue,vp))}=${a}`]],
    chk:{op:'dprod',e:{u:U,v:Vv,t0:String(t0)},n:{cross:0}}};
});

add('vf-integral','Integrals of r(t)','14.2',()=>{
  const b=pick([1,2,3]), k=ri(1,3);
  const bank=[
    ()=>{ const c=nz(-4,4), n=ri(0,3); return {f:mono(c,{t:n}),F:x=>c*Math.pow(x,n+1)/(n+1),exact:frac(c*Math.pow(b,n+1),n+1),trap:String(c*n*Math.pow(b,Math.max(0,n-1))),why:'Differentiated instead of integrating.'}; },
    ()=>({f:`e^(${k}*t)`,exact:k===1?`e^${b} - 1`:`(e^(${k*b}) - 1)/${k}`,trap:`e^(${k*b}) - 1`,why:`∫e^{${k}t}dt = e^{${k}t}/${k}.`}),
    ()=>({f:`${k}*t*e^(t^2)`,exact:frac(k,2)===`1`?`e^(${b*b}) - 1`:`${frac(k,2)}*(e^(${b*b}) - 1)`,trap:`${k}*(e^(${b*b}) - 1)`,why:'u-substitution u = t² brings a factor 1/2.'})];
  let lo=0, hi=b, bankT;
  if(coin(0.4)){ lo=0; const up=pick(['pi/2','pi']); hi=up;
    const cosI=up==='pi'?'0':`1/${k}`.replace('/1','')/*∫cos(kt)*/;
    bankT=[{f:`cos(t)`,exact:up==='pi'?'0':'1',trap:up==='pi'?'-2':'-1',why:'∫cos t dt = sin t (not −sin t).'},{f:`sin(t)`,exact:up==='pi'?'2':'1',trap:up==='pi'?'-2':'-1',why:'∫sin t dt = −cos t; mind the sign.'},
           {f:'1',exact:up,trap:'1',why:'∫1 dt over the interval is its length.'},{f:'2*t',exact:up==='pi'?'pi^2':'pi^2/4',trap:'2',why:'∫2t dt = t².'}];
    const C=shuf(bankT).slice(0,3);
    const r=V(...C.map(c=>c.f)), ans=V(...C.map(c=>c.exact));
    return {q:`Evaluate ${m`\int_{0}^{${tex(up)}}${tex(r)}\,dt`}.`,kind:'vec',ans,lv:2,
      dis:C.map((c,i)=>({a:V(...C.map((d,j)=>j===i?d.trap:d.exact)),why:c.why})),
      how:'Integrate each component; evaluate top minus bottom.',
      sol:[['Integrate component by component.',X`\left.${tex(V(...C.map(c=>({'cos(t)':'sin(t)','sin(t)':'-cos(t)','1':'t','2*t':'t^2'})[c.f])))}\right|_{0}^{${tex(up)}}=${tex(ans)}`]],
      chk:{op:'vint',e:{r,a:'0',b:up}}};
  }
  const C=[bank[0](),bank[pick([0,1,2])](),bank[pick([0,1])]()]; if(new Set(C.map(c=>c.f)).size<3) return null;
  const r=V(...C.map(c=>c.f)), ans=V(...C.map(c=>c.exact));
  return {q:`Evaluate ${m`\int_{0}^{${b}}${tex(r)}\,dt`}.`,kind:'vec',ans,lv:2,
    dis:C.map((c,i)=>({a:V(...C.map((d,j)=>j===i?d.trap:d.exact)),why:c.why})),
    how:'Integrate each component; evaluate top minus bottom.',
    sol:[['Integrate each component and evaluate from 0 to '+b+'.',X`\int_0^{${b}}\mathbf r(t)\,dt=${tex(ans)}`]],
    chk:{op:'vint',e:{r,a:'0',b:String(b)}}};
});

add('vf-ivp','Integrals of r(t)','14.2',()=>{
  const b=ri(1,4);
  const bank=[
    ()=>{ const c=nz(-4,4), n=ri(0,3); return {d:mono(c,{t:n}),F:mono(frac(c,n+1),{t:n+1}),F0:0}; },
    ()=>({d:`cos(${b}*t)`,F:b===1?'sin(t)':`sin(${b}*t)/${b}`,F0:0}),
    ()=>({d:`sin(${b}*t)`,F:b===1?'-cos(t)':`-cos(${b}*t)/${b}`,F0:-1/b,F0s:frac(-1,b)}),
    ()=>({d:`e^(${b}*t)`,F:b===1?'e^t':`e^(${b}*t)/${b}`,F0:1/b,F0s:frac(1,b)}),
    ()=>({d:`1/(t + 1)`,F:'ln(t + 1)',F0:0})];
  const n=pick([2,3,3]), C=Array.from({length:n},()=>pick(bank)()); if(new Set(C.map(c=>c.d)).size<n) return null;
  if(!C.some(c=>c.F0)) C[0]=bank[pick([2,3])]();
  const r0=rv(n,-4,4);
  const comp=(c,i,withF0)=>{ const k=withF0?(c.F0s?toFrac(r0[i]-c.F0):String(r0[i])):String(r0[i]); return sumS([c.F,k]); };
  const ans=V(...C.map((c,i)=>comp(c,i,true))), naive=V(...C.map((c,i)=>comp(c,i,false)));
  if(ans===naive) return null;
  return {q:`Find ${m`\mathbf r(t)`} if ${m`\mathbf r'(t)=${tex(V(...C.map(c=>c.d)))}`} and ${m`\mathbf r(0)=${vt(r0)}`}.`,kind:'vec',vars:['t'],ans,lv:3,range:[0.2,1.6],
    dis:[{a:naive,why:'Added r(0) directly. The antiderivative is not 0 at t = 0 (−cos 0 = −1, e⁰ = 1), so solve for C.'},
         {a:V(...C.map(c=>c.F)),why:'Forgot the constant of integration: use r(0) to find it.'},
         {a:V(...C.map((c,i)=>sumS([c.F,c.F0s?toFrac(r0[i]+c.F0):String(r0[i])]))),why:'Sign slip solving for the constant: C = r(0) − F(0).'}],
    how:'Integrate each component, then choose the constants so the antiderivative equals r(0) at t = 0.',
    sol:[['Antiderivative plus a constant vector.',X`\mathbf r(t)=${tex(V(...C.map(c=>c.F)))}+\mathbf C`],
         ['At t = 0 the antiderivative is not always 0.',X`\mathbf r(0)=${tex(V(...C.map(c=>c.F0s||'0')))}+\mathbf C=${vt(r0)}`],['Solve for C and write r(t).',X`\mathbf r(t)=${tex(ans)}`]],
    chk:{op:'ivp',e:{rp:V(...C.map(c=>c.d)),r0:vint(r0)}}};
});

/* ---------------- 14.3 Motion ---------------- */
add('motion-vsa','Motion','14.3',()=>{
  const ask=pick(['v','speed','a','speedfn']);
  if(ask==='speedfn'){ const R=ri(1,5), w=ri(1,4), h=ri(1,5);
    const r=V(`${R}*cos(${w}*t)`,`${R}*sin(${w}*t)`,mono(h,{t:1})), s=R*R*w*w+h*h;
    return {q:`Find the speed of an object with position ${m`\mathbf r(t)=${tex(r)}`}.`,kind:'expr',vars:['t'],ans:sqrtS(s),lv:2,
      dis:[{a:sqrtS(R*R+h*h),why:'Chain rule: the x and y components pick up a factor '+w+'.'},{a:String(s),why:'Speed is |v|; take the square root.'},
           {a:String(R*w+h),why:'|v| is not the sum of the component sizes.'}],
      how:'speed = |r′(t)|',
      sol:[['Velocity.',X`\mathbf v(t)=\langle -${R*w}\sin ${w}t,\ ${R*w}\cos ${w}t,\ ${h}\rangle`],['Its length (sin² + cos² = 1).',X`|\mathbf v|=\sqrt{${R*R*w*w}+${h*h}}=${tex(sqrtS(s))}`]],
      chk:{op:'motion',e:{r,t0:'1'},n:{ask:'speed'}}};
  }
  const cs=[rpoly(pick([2,3]),-3,3),rpoly(2,-3,3),rpoly(pick([1,2,3]),-3,3)], t0=pick([0,1,-1,2]), r=vpoly(cs);
  const v=cs.map(c=>polyE(polyD(c),t0)), a=cs.map(c=>polyE(polyD(polyD(c)),t0)), p=cs.map(c=>polyE(c,t0));
  if(ask==='v') return {q:`An object has position ${m`\mathbf r(t)=${tex(r)}`}. Find its velocity at ${m`t=${t0}`}.`,kind:'vec',ans:vint(v),lv:1,
    dis:[{a:vint(p),why:'That is the position r(t₀); velocity is r′(t₀).'},{a:vint(a),why:'That is the acceleration r″(t₀).'},{a:vint(cs.map(c=>polyE(polyD(c),t0+1))),why:'Evaluated at the wrong time.'}],
    how:'v = r′(t)', sol:[['Differentiate and evaluate.',X`\mathbf v(${t0})=${vt(v)}`]],chk:{op:'motion',e:{r,t0:String(t0)},n:{ask:'v'}}};
  if(ask==='a') return {q:`An object has position ${m`\mathbf r(t)=${tex(r)}`}. Find its acceleration at ${m`t=${t0}`}.`,kind:'vec',ans:vint(a),lv:1,
    dis:[{a:vint(v),why:'That is the velocity; differentiate once more.'},{a:vint(p),why:'That is the position.'},{a:vint(cs.map(c=>polyE(polyD(polyD(polyD(c))),t0))),why:'Differentiated three times.'}],
    how:'a = r″(t)', sol:[['Differentiate twice and evaluate.',X`\mathbf a(${t0})=${vt(a)}`]],chk:{op:'motion',e:{r,t0:String(t0)},n:{ask:'a'}}};
  const s=n2(v); if(!s) return null;
  return {q:`An object has position ${m`\mathbf r(t)=${tex(r)}`}. Find its speed at ${m`t=${t0}`}.`,kind:'expr',ans:sqrtS(s),lv:1,
    dis:[{a:String(s),why:'Take the square root: speed = |v|.'},{a:sqrtS(n2(p)||1),why:'That is |r(t₀)|, the distance from the origin.'},{a:String(Math.abs(v.reduce((x,y)=>x+y,0))||s+2),why:'Speed is the length of v, not the sum of its components.'}],
    how:'speed = |r′(t)|', sol:[['Velocity, then its length.',X`\mathbf v(${t0})=${vt(v)},\qquad |\mathbf v|=\sqrt{${s}}=${tex(sqrtS(s))}`]],chk:{op:'motion',e:{r,t0:String(t0)},n:{ask:'speed'}}};
});

add('motion-ivp','Motion','14.3',()=>{
  const n=pick([2,3]), a=rv(n,-4,4), v0=rv(n,-4,4), r0=rv(n,-4,4), lin=coin(0.4)?ri(0,n-1):-1;
  /* a(t) = a (constant) except one component = a_i t */
  const acc=a.map((c,i)=>i===lin?mono(c,{t:1}):String(c));
  const comp=(i,withV,withR,half)=>{ const c=a[i]; const at=i===lin?mono(frac(c,6),{t:3}):mono(half?frac(c,2):c,{t:2});
    return sumS([at,withV?mono(v0[i],{t:1}):'0',withR?String(r0[i]):'0']); };
  const ans=V(...a.map((_,i)=>comp(i,true,true,true)));
  return {q:`An object has acceleration ${m`\mathbf a(t)=${tex(V(...acc))}`}, initial velocity ${m`\mathbf v(0)=${vt(v0)}`}, and initial position ${m`\mathbf r(0)=${vt(r0)}`}. Find ${m`\mathbf r(t)`}.`,
    kind:'vec',vars:['t'],ans,lv:3,
    dis:[{a:V(...a.map((_,i)=>comp(i,true,true,false))),why:'∫∫a dt dt = ½at² for constant a; the ½ is missing.'},{a:V(...a.map((_,i)=>comp(i,false,true,true))),why:'Forgot the v(0)·t term from the first integration.'},
         {a:V(...a.map((_,i)=>comp(i,true,false,true))),why:'Forgot the initial position.'}],
    how:'Integrate a to get v (use v(0)), then integrate v to get r (use r(0)).',
    sol:[['Integrate once and use v(0).',X`\mathbf v(t)=${tex(V(...a.map((c,i)=>sumS([i===lin?mono(frac(c,2),{t:2}):mono(c,{t:1}),String(v0[i])]))))}`],
         ['Integrate again and use r(0).',X`\mathbf r(t)=${tex(ans)}`]],
    chk:{op:'ivp2',e:{a:V(...acc),v0:vint(v0),r0:vint(r0)}}};
});

add('motion-sphere','Motion','14.3',()=>{
  const tr=pick([[3,4,5],[5,12,13],[8,15,17],[6,8,10]]), k=pick([1,2]), [a,b,c]=tr;
  const kt=k===1?'t':`${k}*t`, comps=shuf([`${a}*sin(${kt})`,`${b}*sin(${kt})`]); const order=shuf([0,1,2]);
  const all=[comps[0],comps[1],`${c}*cos(${kt})`]; const r=V(...order.map(i=>all[i]));
  return {q:`Show that ${m`\mathbf r(t)=${tex(r)}`} lies on a sphere centered at the origin, and find the sphere’s radius.`,kind:'expr',ans:String(c),lv:2,
    dis:[{a:String(c*c),why:'|r|² = '+c*c+' is the radius squared.'},{a:String(a+b),why:'Add the squares, not the coefficients: a²sin² + b²sin² + c²cos².'},{a:sqrtS(a*a+b*b+c*c),why:'The sin² and cos² terms combine; they don’t all survive at once.'}],
    how:'Compute |r(t)|² and simplify with sin² + cos² = 1; it is constant.',
    sol:[['Square the length.',X`|\mathbf r|^2=${a*a}\sin^2${k===1?'':k}t+${b*b}\sin^2${k===1?'':k}t+${c*c}\cos^2${k===1?'':k}t=${c*c}(\sin^2+\cos^2)=${c*c}`],['Radius.',String(c)]],
    chk:{op:'sphereR',e:{r}}};
});

/* ---------------- 14.4 Arc length ---------------- */
add('arclen','Arc length','14.4',()=>{
  const kind=pick(['line','helix','helix','log','exp','cubic']);
  let r,ans,lo='0',hi,dis,sol,how='L = ∫ |r′(t)| dt';
  if(kind==='line'){ const d=pick([[1,2,2],[2,3,6],[1,4,8],[2,-1,2],[4,4,7],[3,4,0]]).map(x=>x*pick([1,-1])), p=rv(3,-3,3), T=ri(1,4);
    r=lineKey(p,d); hi=String(T); const s=n2(d); ans=String(T*Math.sqrt(s));
    dis=[{a:String(T*s),why:'Forgot the square root in |r′|.'},{a:sqrtS(n2(addA(p,mulA(T,d)))),why:'That is |r(T)|, not the length traveled.'},{a:String(T*d.reduce((a,b)=>a+Math.abs(b),0)),why:'|r′| is not the sum of the components.'}];
    sol=[['Constant speed.',X`|\mathbf r'(t)|=|${vt(d)}|=${Math.sqrt(s)}`],['Length = speed × time.',X`L=${Math.sqrt(s)}\cdot ${T}=${ans}`]]; }
  else if(kind==='helix'){ const R=pick([3,4,5,6,8,12,1]), h=pick([4,3,12,8,6,5,1]), k=pick([1,2]), s=R*R+h*h;
    r=V(`${R}*cos(t)`,`${R}*sin(t)`,mono(h,{t:1})); hi=k===1?'2pi':'4pi'; ans=`${2*k}*${sqrtS(s)}*pi`.replace('*1*','*');
    ans=`${surd(2*k,1,s)}*pi`;
    dis=[{a:`${2*k*R}*pi`,why:'Only the circular part: the helix also climbs, so include h.'},{a:`${2*k*s}*pi`,why:'Forgot the square root.'},{a:`${surd(2*k,1,s)}`,why:'Dropped the π from the interval length.'}];
    sol=[['Speed.',X`|\mathbf r'(t)|=\sqrt{${R*R}\sin^2t+${R*R}\cos^2t+${h*h}}=\sqrt{${s}}`],['Integrate.',X`L=\int_0^{${tex(hi)}}\sqrt{${s}}\,dt=${tex(ans)}`]]; }
  else if(kind==='log'){ const b=pick([2,3,4]);
    r=V('t^2','2*t','ln(t)'); lo='1'; hi=String(b); ans=`${b*b-1} + ln(${b})`;
    dis=[{a:String(b*b-1),why:'Missed the ∫(1/t)dt = ln t part of the speed 2t + 1/t.'},{a:`${b*b} + ln(${b})`,why:'Evaluate t² from 1 to b: that is b² − 1.'},{a:`${b*b-1} + ${frac(1,b)}`,why:'∫(1/t)dt is ln t, not 1/t.'}];
    sol=[['Speed is a perfect square.',X`|\mathbf r'|=\sqrt{4t^2+4+\tfrac{1}{t^2}}=\sqrt{\left(2t+\tfrac1t\right)^2}=2t+\tfrac1t`],['Integrate.',X`L=\left[t^2+\ln t\right]_1^{${b}}=${tex(ans)}`]]; }
  else if(kind==='exp'){ const b=pick([1,2,'ln(2)','ln(3)']);
    r=V('e^t*cos(t)','e^t*sin(t)','e^t'); hi=String(b); ans=b==='ln(2)'?'sqrt(3)':b==='ln(3)'?'2*sqrt(3)':`sqrt(3)*(e^${b} - 1)`;
    dis=[{a:b==='ln(2)'?'sqrt(2)':b==='ln(3)'?'2*sqrt(2)':`sqrt(2)*(e^${b} - 1)`,why:'|r′|² = 3e^{2t}: the z-component contributes too.'},{a:b==='ln(2)'?'3':b==='ln(3)'?'6':`3*(e^${b} - 1)`,why:'Forgot the square root.'},
         {a:b==='ln(2)'?'2*sqrt(3)':b==='ln(3)'?'3*sqrt(3)':`sqrt(3)*e^${b}`,why:'Evaluate at both limits: e⁰ = 1 must be subtracted.'}];
    sol=[['Speed.',X`|\mathbf r'|=\sqrt{e^{2t}(\cos t-\sin t)^2+e^{2t}(\sin t+\cos t)^2+e^{2t}}=\sqrt3\,e^{t}`],['Integrate.',X`L=\sqrt3\,\left[e^t\right]_0^{${tex(hi)}}=${tex(ans)}`]]; }
  else { const T=pick([1,2,3]);
    r=V('6*t','3*sqrt(2)*t^2','2*t^3'); hi=String(T); ans=String(6*T+2*T*T*T);
    dis=[{a:String(6*T),why:'Speed is 6 + 6t², not 6.'},{a:String(6*T+6*T*T*T),why:'∫6t² dt = 2t³.'},{a:String(n2([6*T,3*Math.SQRT2*T*T,2*T**3])|0),why:'That is |r(T)|²; integrate the speed instead.'}];
    sol=[['Speed is a perfect square.',X`|\mathbf r'|^2=36+72t^2+36t^4=36(1+t^2)^2\quad\Rightarrow\quad |\mathbf r'|=6+6t^2`],['Integrate.',X`L=\left[6t+2t^3\right]_0^{${T}}=${ans}`]]; }
  return {q:`Find the length of the curve ${m`\mathbf r(t)=${tex(r)}`} for ${m`${tex(lo)}\le t\le ${tex(hi)}`}.`,kind:'expr',ans,lv:kind==='line'?1:kind==='helix'?2:3,dis,how,sol,
    chk:{op:'arclen',e:{r,a:lo,b:hi}}};
});

add('arclen-param','Arc length','14.4',()=>{
  let r,c,key;
  if(coin()){ const d=pick([[1,2,2],[2,3,6],[2,-1,2],[3,4,0],[4,4,7]]).map(x=>x*pick([1,-1])), p=rv(3,-3,3); c=Math.sqrt(n2(d));
    r=lineKey(p,d); key=V(...p.map((x,i)=>sumS([String(x),mono(frac(d[i],c),{s:1})]))); }
  else { const tr=pick([[3,4,5],[5,12,13],[6,8,10],[4,3,5],[8,6,10]]), [R,h,cc]=tr; c=cc;
    r=V(`${R}*cos(t)`,`${R}*sin(t)`,mono(h,{t:1})); key=V(`${R}*cos(s/${c})`,`${R}*sin(s/${c})`,mono(frac(h,c),{s:1})); }
  return {q:`Find the arc length parametrization ${m`\mathbf r(s)`} of ${m`\mathbf r(t)=${tex(r)}`}, with ${m`s`} measured from ${m`t=0`} (so ${m`s=0`} at ${m`t=0`}).`,
    kind:'vec',vars:['s'],ans:key,lv:3,range:[0.3,6],
    dis:[{a:r.replace(/\bt\b/g,'s'),why:'Renaming t to s is not enough: the speed is '+c+', not 1, so t = s/'+c+'.'},{a:r.replace(/\bt\b/g,`(${c}*s)`),why:'Inverted the relation: s = '+c+'t means t = s/'+c+'.'},
         {a:r.replace(/\bt\b/g,`(s/${c*c})`),why:'Divided by the speed squared.'}],
    how:'s = ∫₀ᵗ |r′(u)| du; solve for t in terms of s and substitute.',
    sol:[['Constant speed, so s is proportional to t.',X`|\mathbf r'(t)|=${c}\quad\Rightarrow\quad s=${c}t\quad\Rightarrow\quad t=\frac{s}{${c}}`],['Substitute.',X`\mathbf r(s)=${tex(key)}`]],
    chk:{op:'arcparam',e:{r,key}}};
});

/* ---------------- 14.5 Curvature ---------------- */
add('curv-helix','Curvature','14.5',()=>{
  if(coin(0.3)){ const R=ri(2,9), w=ri(1,4);
    const r=V(`${R}*cos(${w}*t)`,`${R}*sin(${w}*t)`);
    return {q:`Find the curvature of ${m`\mathbf r(t)=${tex(r)}`}.`,kind:'expr',ans:frac(1,R),lv:1,
      dis:[{a:String(R),why:'That is the radius; curvature is 1/R.'},{a:frac(w,R),why:'Curvature does not depend on how fast the circle is traced.'},{a:frac(1,R*R),why:'κ = 1/R, not 1/R².'}],
      how:'A circle of radius R has curvature 1/R.',sol:[['Circle of radius '+R+'.',X`\kappa=\frac{1}{${R}}`]],chk:{op:'curv',e:{r,t0:'t'}}};
  }
  const a=ri(1,6), b=nz(-6,6), s=a*a+b*b, r=V(`${a}*cos(t)`,`${a}*sin(t)`,mono(b,{t:1}));
  return {q:`Find the curvature of the helix ${m`\mathbf r(t)=${tex(r)}`}.`,kind:'expr',ans:frac(a,s),lv:2,
    dis:[{a:frac(1,a),why:'That ignores the climb: κ = a/(a² + b²).'},{a:frac(s,a),why:'That is the radius of curvature 1/κ.'},{a:frac(Math.abs(b),s),why:'The numerator is the circle radius a.'},{a:surd(a,s,s),why:'|T′|/|r′| divides by √(a²+b²) twice.'}],
    how:'κ = |T′(t)|/|r′(t)|; for this helix κ = a/(a² + b²).',
    sol:[['Speed and unit tangent.',X`|\mathbf r'|=\sqrt{${s}},\qquad \mathbf T=\tfrac{1}{\sqrt{${s}}}\langle -${a}\sin t,\ ${a}\cos t,\ ${b}\rangle`],
         ['Differentiate T and divide by the speed.',X`|\mathbf T'|=\frac{${a}}{\sqrt{${s}}},\qquad \kappa=\frac{|\mathbf T'|}{|\mathbf r'|}=\frac{${a}}{${s}}`]],
    chk:{op:'curv',e:{r,t0:'t'}}};
});

add('curv-t0','Curvature','14.5',()=>{
  const cs=[[ri(-2,2),nz(-2,2)],[ri(-2,2),0,nz(-2,2)],coin(0.4)?[0]:[ri(-2,2),0,0,nz(-1,1)]], t0=pick([0,1,-1]);
  const r=vpoly(cs), v=cs.map(c=>polyE(polyD(c),t0)), a=cs.map(c=>polyE(polyD(polyD(c)),t0));
  const c=crossA(v,a), n1=n2(c), mm=n2(v); if(!n1||!mm||mm===1||n1*mm>3000) return null;
  const ans=surd(1,mm*mm,n1*mm);                                     /* √n1 / m^{3/2} */
  return {q:`Find the curvature of ${m`\mathbf r(t)=${tex(r)}`} at ${m`t=${t0}`}.`,kind:'expr',ans,lv:3,
    dis:[{a:surd(1,mm,n1),why:'Divided by |v|² instead of |v|³.'},{a:surd(1,1,n1*mm).replace(/^$/,'1')&&surd(1,mm,n1*mm),why:'Divided by |v| instead of |v|³.'},
         {a:surd(1,mm*mm,n2(a)*mm),why:'Used |a| instead of |v × a|.'},{a:sqrtS(n1),why:'Forgot to divide by |v|³.'}],
    how:'κ = |v × a| / |v|³',
    sol:[['Velocity and acceleration at t₀.',X`\mathbf v=${vt(v)},\qquad \mathbf a=${vt(a)}`],['Cross product and speed.',X`\mathbf v\times\mathbf a=${vt(c)},\qquad |\mathbf v\times\mathbf a|=\sqrt{${n1}},\qquad |\mathbf v|=\sqrt{${mm}}`],
         ['Divide.',X`\kappa=\frac{\sqrt{${n1}}}{(\sqrt{${mm}})^3}=${tex(ans)}`]],
    chk:{op:'curv',e:{r,t0:String(t0)}}};
});

add('curv-yfx','Curvature','14.5',()=>{
  const a=nz(-3,3), c=ri(-3,3), x0=ri(-2,2), rad=coin(0.3), fp0=ri(-3,3), b=fp0-2*a*x0;
  const f=polyS([c,b,a],'x'), fp=2*a*x0+b, fpp=2*a, n=1+fp*fp;
  const kap=surd(Math.abs(fpp),n*n,n);                            /* |f''|/n^{3/2} */
  const ans=rad?surd(n,Math.abs(fpp),n):kap;                       /* n^{3/2}/|f''| */
  return {q:`Find the ${rad?'radius of curvature':'curvature'} of ${m`y=${tex(f)}`} at ${m`x=${x0}`}.`,kind:'expr',ans,lv:2,
    dis:rad?[{a:kap,why:'That is κ; the radius of curvature is 1/κ.'},{a:frac(n,Math.abs(fpp)),why:'The exponent is 3/2: (1 + f′²)^{3/2}.'},{a:frac(1,Math.abs(fpp)),why:'Forgot the (1 + f′²)^{3/2} factor.'}]
            :[{a:frac(Math.abs(fpp),n),why:'The denominator is (1 + f′²)^{3/2}, not 1 + f′².'},{a:String(Math.abs(fpp)),why:'κ = |f″| only where f′ = 0.'},{a:surd(Math.abs(fpp),n,n),why:'Exponent 1/2 instead of 3/2.'},{a:surd(Math.abs(fp)||1,n*n,n),why:'The numerator is |f″|, not |f′|.'}],
    how:'κ = |f″(x)| / (1 + f′(x)²)^{3/2}; radius = 1/κ.',
    sol:[['Derivatives at x₀.',X`f'(${x0})=${fp},\qquad f''(${x0})=${fpp}`],['Plug in.',X`\kappa=\frac{|${fpp}|}{(1+${fp*fp})^{3/2}}=${tex(kap)}${rad?X`,\qquad \rho=\frac1\kappa=${tex(ans)}`:''}`]],
    chk:{op:'curvyfx',e:{f,x0:String(x0)},n:{rad:rad?1:0}}};
});

add('curv-N','Curvature','14.5',()=>{
  const R=ri(1,5), h=ri(0,4), gen=coin(0.6);
  const r=h?V(`${R}*cos(t)`,`${R}*sin(t)`,`${h}*t`):V(`${R}*cos(t)`,`${R}*sin(t)`);
  const Nk=h?V('-cos(t)','-sin(t)','0'):V('-cos(t)','-sin(t)');
  if(gen) return {q:`Find the principal unit normal vector ${m`\mathbf N(t)`} for ${m`\mathbf r(t)=${tex(r)}`}.`,kind:'vec',vars:['t'],ans:Nk,lv:2,
    dis:[{a:h?V('cos(t)','sin(t)','0'):V('cos(t)','sin(t)'),why:'N points toward the center of curvature (inward), so it is −⟨cos t, sin t⟩.'},
         {a:h?V('-sin(t)','cos(t)','0'):V('-sin(t)','cos(t)'),why:'That is the direction of T (the tangent), not N.'},
         {a:h?V(`${-R}*cos(t)`,`${-R}*sin(t)`,'0'):V(`${-R}*cos(t)`,`${-R}*sin(t)`),why:'That is r″ (or unnormalized T′); N is a unit vector.'}],
    how:'N = T′/|T′|; for a circle or helix it points straight at the axis.',
    sol:[['Unit tangent.',X`\mathbf T=\tfrac{1}{\sqrt{${R*R+h*h}}}\langle -${R}\sin t,\ ${R}\cos t${h?`,\\ ${h}`:''}\rangle`],['Differentiate and normalize.',X`\mathbf N=\frac{\mathbf T'}{|\mathbf T'|}=${tex(Nk)}`]],
    chk:{op:'normalN',e:{r,t0:'t'}}};
  const th=pick([['0',[-1,0]],['pi/2',[0,-1]],['pi',[1,0]],['pi/3',['-1/2','-sqrt(3)/2']],['pi/4',['-sqrt(2)/2','-sqrt(2)/2']]]);
  const N0=h?V(...th[1],'0'):V(...th[1]);
  return {q:`Find the principal unit normal vector ${m`\mathbf N`} for ${m`\mathbf r(t)=${tex(r)}`} at ${mk('t = '+th[0])}.`,kind:'vec',ans:N0,lv:2,
    dis:[{a:h?V(...th[1].map(x=>typeof x==='string'?x.replace(/^-/,''):-x),'0'):V(...th[1].map(x=>typeof x==='string'?x.replace(/^-/,''):-x)),why:'N points toward the center of curvature: inward.'},
         {a:h?V(...th[1].map(x=>typeof x==='string'?x.replace(/^-/,''):-x).reverse(),'0'):V(`-sin(${th[0]})`,`cos(${th[0]})`),why:'That is (a multiple of) T, not N.'}],
    how:'N = T′/|T′|.',sol:[['For a circle or helix around the z-axis, N = ⟨−cos t, −sin t, 0⟩.',X`\mathbf N(${tex(th[0])})=${tex(N0)}`]],
    chk:{op:'normalN',e:{r,t0:th[0]}}};
});

add('curv-aTaN','Curvature','14.5',()=>{
  const cs=[[ri(-2,2),nz(-3,3)],[ri(-2,2),ri(-2,2),nz(-2,2)],coin()?[ri(-2,2),nz(-2,2)]:[0]], t0=pick([0,1,-1]);
  const r=vpoly(cs), v=cs.map(c=>polyE(polyD(c),t0)), a=cs.map(c=>polyE(polyD(polyD(c)),t0)), mm=n2(v); if(!mm) return null;
  const aT=surd(dotA(v,a),mm,mm), cr=n2(crossA(v,a)), aN=surd(1,mm,cr*mm), ask=coin()?'T':'N';
  if(ask==='N'&&!cr) return null;
  return {q:`An object moves along ${m`\mathbf r(t)=${tex(r)}`}. Find the ${ask==='T'?'tangential':'normal'} component of acceleration ${m`a_${ask}`} at ${m`t=${t0}`}.`,
    kind:'expr',ans:ask==='T'?aT:aN,lv:3,
    dis:[{a:ask==='T'?aN:aT,why:ask==='T'?'That is a_N = |v × a|/|v|.':'That is a_T = v · a/|v|.'},{a:ask==='T'?String(dotA(v,a)):sqrtS(cr||1),why:'Forgot to divide by |v|.'},
         {a:ask==='T'?frac(dotA(v,a),mm):surd(1,mm,cr),why:'Divided by |v|² instead of |v|.'}],
    how:'a_T = (v · a)/|v|,  a_N = |v × a|/|v|',
    sol:[['Velocity and acceleration at t₀.',X`\mathbf v=${vt(v)},\qquad \mathbf a=${vt(a)},\qquad |\mathbf v|=\sqrt{${mm}}`],
         ask==='T'?['Tangential part.',X`a_T=\frac{\mathbf v\cdot\mathbf a}{|\mathbf v|}=\frac{${dotA(v,a)}}{\sqrt{${mm}}}=${tex(aT)}`]:['Normal part.',X`a_N=\frac{|\mathbf v\times\mathbf a|}{|\mathbf v|}=\frac{\sqrt{${cr}}}{\sqrt{${mm}}}=${tex(aN)}`]],
    chk:{op:'aTaN',e:{r,t0:String(t0)},n:{ask}}};
});
