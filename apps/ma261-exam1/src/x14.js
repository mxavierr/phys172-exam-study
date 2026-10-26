
/* ---------------- Chapter 14 exam templates ---------------- */
const paramTex=(p,d,v)=>`\\(${['x','y','z'].slice(0,p.length).map((c,i)=>`${c}=${tex(lin(p[i],d[i],v||'t'))}`).join(',\\ ')}\\)`;
const paramOpt=(p,d,why)=>({a:lineKey(p,d),h:paramTex(p,d),why});

/* ★ tangent line at a given POINT (find t first) — S2025-Q4, S2023-Q5, S2016-Q5 */
addX('x-tan-line','TAN',3,['S2025-Q4','S2023-Q5','S2016-Q5'],()=>{
  const fam=pick(['poly','poly','pi','explog']);
  let r,t0,p,d,dd,wrongT,rp=null;
  if(fam==='poly'){ const cs=[rpoly(pick([1,2]),-3,3),rpoly(2,-3,3),rpoly(pick([2,3]),-2,2)]; t0=pick([-1,1,2]); r=vpoly(cs);
    p=cs.map(c=>polyE(c,t0)); d=cs.map(c=>polyE(polyD(c),t0)); dd=cs.map(c=>polyE(polyD(polyD(c)),t0)); wrongT=p[0]!==t0&&Math.abs(p[0])<=3?cs.map(c=>polyE(polyD(c),p[0])):null; }
  else if(fam==='pi'){ t0=pick([1,2]); r=V('t*cos(pi*t)','t*sin(pi*t)','t^2'); const s=t0===1?-1:1;
    p=[s*t0,0,t0*t0]; d=[s,t0===1?'-pi':'2*pi',2*t0]; dd=null; wrongT=null; }
  else { const a=nz(-3,4), b=ri(-3,3), c=pick([1,2,3]), k=pick([1,2,3]); t0=0;
    r=V(polyS([b,a,1]),c===1?'e^t*cos(t)':`e^(${c}*t)*cos(t)`,k===1?'ln(t + 1)':`ln(${k}*t + 1)`); p=[b,1,0]; d=[a,c,k]; dd=null; wrongT=null;
    rp=V(`2*t + ${a}`,`e^(${c}*t)*(${c}*cos(t) - sin(t))`,`${k}/(${k}*t + 1)`); }
  const numD=d.map(x=>typeof x==='string'?null:x);
  const through=coin(0.25)?rv(3,-3,3):null;               /* S2016-Q5: a line through another point, parallel to the tangent */
  const base=through||p;
  const Ls=(pp,dv)=>V(...pp.map((x,i)=>sumS([String(x),typeof dv[i]==='string'?`(${dv[i]})*t`:mono(dv[i],{t:1})])));
  const Lh=(pp,dv)=>`\\(${['x','y','z'].map((c,i)=>`${c}=${tex(sumS([String(pp[i]),typeof dv[i]==='string'?`(${dv[i]})*t`:mono(dv[i],{t:1})]))}`).join(',\\ ')}\\)`;
  const O=(pp,dv,why)=>({a:Ls(pp,dv),h:Lh(pp,dv),why});
  const dNum=d.map(x=>typeof x==='string'?ev(x):x);
  const dis=[O(d,base,'Point and direction are swapped.'),O(base,d.map((x,i)=>i===1?(typeof x==='string'?`-(${x})`:-x):x),'Sign slip in one component of r′(t₀).'),
    O(base,base.map((x,i)=>x||1),'Used the position as the direction; the direction is r′(t₀).'),
    through?O(p,d,'That line passes through the curve’s point, not through the given point.'):O(base,d.map((x,i)=>i===0?(typeof x==='string'?x:x+1):x),'Arithmetic slip in r′(t₀).')];
  if(dd&&n2(dd)) dis.push(O(base,dd,'Used r″(t₀) as the direction.'));
  if(wrongT&&n2(wrongT)) dis.push(O(base,wrongT,`Plugged t = ${p[0]} (the x-coordinate) into r′; first find which t gives the point.`));
  if(rp) dis.push({a:rp,h:`\\(${['x','y','z'].map((c,i)=>`${c}=${tex(rp.slice(1,-1).split(', ')[i])}`).join(',\\ ')}\\)`,why:'That is r′(t), not a line.'});
  const opts=xm(O(base,d),dis,{kind:'line',line:{p:base,d:dNum}});
  const stem=through?`Find a parametrization of the line through ${mp(through)} that is parallel to the tangent vector of ${m`\mathbf r(t)=${tex(r)}`} at the point ${m`${tex(P3(...p))}`}.`
                    :`Find a parametrization of the line tangent to ${m`\mathbf r(t)=${tex(r)}`} at the point ${m`${tex(P3(...p))}`}.`;
  return xq(stem,opts,{kind:'line',line:{p:base,d:dNum},lv:2,how:'Find t₀ with r(t₀) = the point, then the line is (point) + t·r′(t₀).',
    sol:[['Find t₀ from the point.',X`\mathbf r(${t0})=${tex(P3(...p))}`],['Tangent vector.',X`\mathbf r'(${t0})=${tex(V(...d.map(String)))}`],['Line.',Lh(base,d).slice(2,-2)]],
    chk:{op:'tanpar',e:{r,t0:String(t0)},n:{base,p:p.map(String)}}});
});

/* ★ tangent line meets the xy-plane — S2018-Q2, S2024-Q12 */
addX('x-tan-xy','TAN',2,['S2018-Q2','S2024-Q12'],()=>{
  const a=nz(-3,3), b=ri(-3,3), c=ri(-4,4), e=ri(-5,5), t0=pick([1,2,-1]);
  const cs=[[b,a],[c,0,1],[e,0,1]], r=vpoly(cs);
  const p=cs.map(q=>polyE(q,t0)), d=cs.map(q=>polyE(polyD(q),t0)); if(!p[2]||!d[2]) return null;
  const s=Rr(-p[2],d[2]); if(s[1]>2) return null;
  const at=(pp,dv,ss)=>pp.map((x,i)=>Radd([x,1],Rmul(ss,[dv[i],1]))), S=v=>P3(...v.map(Rs));
  const X0=at(p,d,s);
  const opts=xm({a:S(X0)},[{a:S(at(p,d,Rneg(s))),why:'Sign slip solving z = 0.'},{a:S(at(p,cs.map(q=>polyE(polyD(q),p[0])),s)),why:'Used the x-coordinate of the point as t.'},
    {a:S(p.map((x,i)=>[i===2?0:x,1])),why:'Just set z = 0 in the point; x and y change along the line.'},{a:S(at(d,p,Rr(-d[2],p[2]))),why:'Point and direction swapped.'},{a:S(at(p,d,Radd(s,[1,1]))),why:'Off by one in the parameter.'}],{kind:'point'});
  return xq(`Let ${m`L`} be the tangent line to ${m`\mathbf r(t)=${tex(r)}`} at the point ${m`${ptx(p)}`}. Find the point where ${m`L`} intersects the xy-plane.`,opts,{kind:'point',lv:2,
    how:'Find t₀ from the point, build L = r(t₀) + s·r′(t₀), then set z = 0.',
    sol:[['t₀ and the tangent vector.',X`t_0=${t0},\qquad \mathbf r'(t_0)=${vt(d)}`],['Set z = 0.',X`${p[2]}+${fmtC(d[2])}s=0\quad\Rightarrow\quad s=${tex(Rs(s))}`],['Point.',tex(S(X0))]],
    chk:{op:'tanxy',e:{r,t0:String(t0)}}});
});

/* angle between curves where they meet — F2022-Q1, S2017-Q3 */
addX('x-tan-angle','TAN',1,['F2022-Q1','S2017-Q3'],()=>{
  const b=ri(0,3), k=ri(1,3), mm=ri(0,3), c=ri(-3,3), a=nz(-3,3);
  const r1=V('t',mono(a,{t:2}),sumS([mono(b,{t:1}),String(c)])), r2=V('sin(t)',`sin(${k}*t)`,sumS([mono(mm,{t:1}),String(c)]));
  const v1=[1,0,b], v2=[1,k,mm], d=dotA(v1,v2), A=n2(v1)*n2(v2); if(d<=0) return null;
  const key=surd(d,A,A);
  const opts=xm({a:key},[{a:surd(1,A,A),why:'Only the x-components were dotted.'},{a:frac(d,A),why:'Forgot the square roots in the lengths.'},{a:surd(d,n2(v2),n2(v2)),why:'Forgot to divide by |r₁′|.'},
    {a:A>d*d?surd(1,A,A*(A-d*d)):'1/2',why:'That is sin θ, not cos θ.'},{a:surd(d+1,A,A),why:'Arithmetic slip in the dot product.'},{a:surd(d,A+1,A+1),why:'Slip computing a length.'}]);
  return xq(coin()?`The curves ${m`\mathbf r_1(t)=${tex(r1)}`} and ${m`\mathbf r_2(t)=${tex(r2)}`} intersect at ${mp([0,0,c])}. If ${m`\theta`} is the angle between their tangent vectors there, then ${m`\cos\theta=`}`:`Two particles with trajectories ${m`\mathbf r_1(t)=${tex(r1)}`} and ${m`\mathbf r_2(t)=${tex(r2)}`} collide at ${mp([0,0,c])}. If ${m`\theta`} is the angle between their velocity (tangent) vectors at the collision, then ${m`\cos\theta=`}`,opts,{kind:'expr',lv:2,
    how:'Both curves pass through the point at t = 0; cos θ = r₁′·r₂′ / (|r₁′||r₂′|).',
    sol:[['Tangent vectors at t = 0.',X`\mathbf r_1'(0)=${vt(v1)},\qquad \mathbf r_2'(0)=${vt(v2)}`],['',X`\cos\theta=\frac{${d}}{\sqrt{${n2(v1)}}\sqrt{${n2(v2)}}}=${tex(key)}`]],chk:{op:'tanangle',e:{r1,r2}}});
});

/* continuity / domain of r(t) — S2024-Q2 */
addX('x-vf-domain','VF',1,['S2024-Q2'],()=>{
  const a=ri(0,3), b=a+ri(1,3), F=pick([
    {r:V('ln(t^2)',a?`sqrt(${shift('t',a)})`:'sqrt(t)','cos(t)'),key:a?`[${a},\\ \\infty)`:'(0,\\ \\infty)',want:a?`Interval(${a},oo)`:'Interval.open(0,oo)',
     bad:[a?`(${a},\\ \\infty)`:'[0,\\ \\infty)',`[0,\\ ${b})`,`(${b},\\ \\infty)`,'(-\\infty,\\ \\infty)','[0,\\ 1)',`(-\\infty,\\ 0)\\cup(0,\\ \\infty)`]},
    {r:V(`sqrt(${shift('t',a)})`,`1/(${shift('t',b)})`,'e^t'),key:`[${a},\\ ${b})\\cup(${b},\\ \\infty)`,want:`Union(Interval.Ropen(${a},${b}),Interval.open(${b},oo))`,
     bad:[`(${a},\\ ${b})\\cup(${b},\\ \\infty)`,`[${a},\\ \\infty)`,`[${a},\\ ${b})`,`(${b},\\ \\infty)`,'(-\\infty,\\ \\infty)']},
    {r:V(`ln(${b} - t)`,`sqrt(t + ${a})`,'t^2'),key:`[${-a},\\ ${b})`,want:`Interval.Ropen(${-a},${b})`,
     bad:[`(${-a},\\ ${b})`,`[${-a},\\ ${b}]`,`(-\\infty,\\ ${b})`,`[${-a},\\ \\infty)`,`(${-a},\\ ${b}]`]}]);
  const opts=xm({h:m`${F.key}`},F.bad.map(h=>({h:m`${h}`,why:'Intersect the domains of all components; √ allows 0 (closed end), ln and division do not (open end or removed point).'})));
  return xq(`Where is ${m`\mathbf r(t)=${tex(F.r)}`} continuous?`,opts,{kind:'choice',lv:1,
    how:'r(t) is continuous where every component is: intersect their domains.',sol:[['Domain of each component, then intersect.',X`${F.key}`]],chk:{op:'domainx',e:{r:F.r},n:{want:F.want}}});
});

/* ★ curve of intersection of a cylinder and a plane — S2019-Q3, S2020-Q4 */
addX('x-vf-cyl','VF',2,['S2019-Q3','S2020-Q4'],()=>{
  const R=pick([1,1,2,3]), cyl=pick([['y','z','x'],['x','y','z'],['x','z','y']]), co={};   /* cylinder in first two vars; solve for the third */
  const [u,w,s]=cyl; co[u]=nz(-3,3); co[w]=nz(-3,3); if(co[u]===co[w]) return null; co[s]=1; const d=ri(-4,5);
  const plane=`${sumS(['x','y','z'].map(v=>mono(co[v],{[v]:1})))} = ${d}`;
  const Rc=R===1?'':R+'*';
  const build=(cu,cw,Ru,Rw,dd)=>{ const comp={}; comp[u]=`${Ru}cos(t)`; comp[w]=`${Rw}sin(t)`; comp[s]=sumS([String(dd),mono(-cu*R,{})+'*cos(t)',mono(-cw*R,{})+'*sin(t)']).replace(/\b1\*cos/g,'cos').replace(/\b1\*sin/g,'sin');
    return V(comp.x,comp.y,comp.z); };
  const key=build(co[u],co[w],Rc,Rc,d);
  const O=(a,why)=>({a,h:m`${tex(a)},\ 0\le t\le 2\pi`,why});
  const dis=[O(build(co[w],co[u],Rc,Rc,d),'Swapped which coefficient goes with cos t and which with sin t.'),O(build(-co[u],-co[w],Rc,Rc,d),'Sign slip moving the terms across the equals sign.'),
    O(build(co[u],co[w],Rc,Rc,0),'Dropped the plane’s constant.'),O(build(co[u],co[w],Rc,R===1?'2*':`${2*R}*`,d),'The cylinder forces both circle components to have the same radius.'),
    O(build(co[u]*2,co[w],Rc,Rc,d),'Arithmetic slip in a coefficient.')];
  const opts=xm(O(key),dis,{kind:'curve',surf:[`${u}^2 + ${w}^2 = ${R*R}`,plane]});
  return xq(`Which vector function describes the curve of intersection of the cylinder ${mk(`${u}^2 + ${w}^2 = ${R*R}`)} and the plane ${mk(plane)}?`,opts,{kind:'curve',surf:[`${u}^2 + ${w}^2 = ${R*R}`,plane],lv:2,
    how:'Parametrize the cylinder with cos t and sin t, then solve the plane equation for the remaining variable.',
    sol:[['Cylinder.',X`${u}=${R===1?'':R}\cos t,\qquad ${w}=${R===1?'':R}\sin t`],['Solve the plane for '+s+'.',tex(key)]],chk:{op:'curve2',e:{s0:`${u}^2 + ${w}^2 = ${R*R}`,s1:plane}}});
});

/* surface that does NOT contain a curve — S2022-Q4 */
addX('x-vf-notcontain','VF',1,['S2022-Q4'],()=>{
  const p=pick([1,1,2]), q=pick([1,2,-1,-2]), s=pick([1,1,2,3]);
  const r=V(mono(p,{})+'*cos(t)',mono(q,{})+'*cos(t)',mono(s,{})+'*sin(t)').replace(/\b1\*|(-)1\*/g,'$1');
  const sq=(c,v)=>c*c===1?`${v}^2`:`${v}^2/${c*c}`;
  const on=[`${mono(q,{x:1})} ${mono(-p,{y:1})[0]==='-'?'- '+mono(p,{y:1}):'+ '+mono(-p,{y:1})} = 0`.replace('+ -','- '),`${sq(p,'x')} + ${sq(s,'z')} = 1`,`${sq(q,'y')} + ${sq(s,'z')} = 1`,
    `x^2/${2*p*p} + y^2/${2*q*q} + ${sq(s,'z')} = 1`,`x^2/${3*p*p} + 2*y^2/${3*q*q} + ${sq(s,'z')} = 1`];
  const off=pick([`${sq(p,'x')} + ${sq(q,'y')} = 1`,`x^2 + z^2 = ${p*p+s*s+1}`,`${sq(p,'x')} + ${sq(s,'z')} = 2`]);
  const opts=xm({h:mk(off)},on.map(e=>({h:mk(e),why:'Substitute x(t), y(t), z(t): this equation holds for every t, so the surface DOES contain the curve.'})));
  return xq(`Which surface does <b>not</b> contain the curve ${m`\mathbf r(t)=${tex(r)}`}?`,opts,{kind:'choice',lv:2,
    how:'Substitute the components into each equation; use sin²t + cos²t = 1.',sol:[['Substitute into each option; only this one fails.',tex(off)]],chk:{op:'notcontain',e:{r,off,o0:on[0],o1:on[1],o2:on[2],o3:on[3],o4:on[4]}}});
});

/* magnitude of a vector integral — S2018-Q3, S2015-Q5 */
addX('x-vf-intnorm','VF',1,['S2018-Q3','S2015-Q5'],()=>{
  const bank=[['1/2',[1,2]],['2*t^3',[1,2]],['t - 3*t^2',[-1,2]],['(pi/2)*cos(pi*t/2)',[1,1]],['3*t^2',[1,1]],['t',[1,2]],['4*t^3',[1,1]],['pi*sin(pi*t)',[2,1]],['2',[2,1]],['6*t^2 - 2*t',[1,1]]];
  const C=shuf(bank).slice(0,3), I=C.map(c=>c[1]);
  const L=I.reduce((l,r)=>l*r[1]/gcd(l,r[1]),1), N=I.reduce((s,r)=>s+(r[0]*L/r[1])**2,0);
  const key=surd(1,L,N);
  const opts=xm({a:key},[{a:frac(N,L*L),why:'Forgot the square root.'},{a:Rs(I.reduce((s,r)=>Radd(s,[Math.abs(r[0]),r[1]]),[0,1])),why:'Added the components; the length is the square root of the sum of squares.'},
    {a:surd(1,L,N+2*L*L),why:'Integrated one component incorrectly.'},{a:surd(1,1,C.length),why:'Evaluated the integrand at t = 1 instead of integrating.'},{a:surd(1,2*L,N),why:'Halved the result.'}]);
  return xq(`Let ${m`\mathbf v=\int_0^1 ${tex(V(...C.map(c=>c[0])))}\,dt`}. Compute ${m`|\mathbf v|`}.`,opts,{kind:'expr',lv:1,
    how:'Integrate each component over [0, 1], then take the length.',sol:[['Integrate.',X`\mathbf v=${tex(V(...I.map(Rs)))}`],['Length.',tex(key)]],chk:{op:'vintnorm',e:{r:V(...C.map(c=>c[0]))}}});
});

/* derivative of a dot product from given values — F2017-Q12 */
addX('x-vf-dotderiv','VF',1,['F2017-Q12'],()=>{
  const u1=rv(3,-2,3), up=rv(3,-3,3), t0=pick([1,1,2,-1]);
  const cs=[[0,1],[0,0,1],[0,0,0,1]].map(c=>c.map(x=>x*pick([1,1,2,-1]))), vS=vpoly(cs);
  const v=cs.map(c=>polyE(c,t0)), vp=cs.map(c=>polyE(polyD(c),t0)), key=dotA(up,v)+dotA(u1,vp);
  const opts=xm(xnum(key),[{a:String(dotA(up,vp)),why:'u′ · v′ is not the derivative of u · v.'},{a:String(dotA(up,v)),why:'Only the first term of the product rule.'},{a:String(dotA(u1,vp)),why:'Only the second term of the product rule.'},
    {a:String(dotA(u1,v)),why:'That is f(t₀) itself.'},{a:String(key+2),why:'Arithmetic slip.'}]);
  return xq(`Let ${m`f(t)=\mathbf u(t)\cdot\mathbf v(t)`}, where ${m`\mathbf u(${t0})=${vt(u1)}`}, ${m`\mathbf u'(${t0})=${vt(up)}`}, and ${m`\mathbf v(t)=${tex(vS)}`}. Find ${m`f'(${t0})`}.`,opts,{kind:'expr',lv:1,
    how:'(u · v)′ = u′ · v + u · v′.',sol:[['Values at t₀.',X`\mathbf v(${t0})=${vt(v)},\qquad \mathbf v'(${t0})=${vt(vp)}`],['Product rule.',X`f'=${dotA(up,v)}+${fmtC(dotA(u1,vp))}=${key}`]],
    chk:{op:'dotderiv',e:{v:vS,t0:String(t0)},n:{u1,up}}});
});

/* angle between velocity and acceleration — F2019-Q3 */
addX('x-vf-angle','VF',1,['F2019-Q3'],()=>{
  const c=ri(1,3), R=pick([c,c,c,2*c]), t0=1;
  const r=V(`${R===1?'':R+'*'}cos(t)`,mono(frac(c,2),{t:2}),`-${R===1?'':R+'*'}sin(t)`);
  const cos=Rr(c*c*t0,R*R+c*c*t0*t0===R*R+c*c?R*R+c*c:1);
  const key=R===c?'pi/3':`arccos(${frac(c*c,R*R+c*c)})`;
  const opts=xm({a:key},['pi/6','pi/4','-pi/3','5pi/6','pi/2','-pi/6'].map(x=>({a:x,why:x.startsWith('-')?'Angles between vectors are in [0, π], never negative.':x==='pi/2'?'v · a is not 0 here.':'Recompute cos θ = v·a/(|v||a|).'})).concat(R===c?[]:[{a:'pi/3',why:'That would need R = c.'}]));
  return xq(`Find the angle ${m`\theta`} between the velocity and acceleration vectors at ${m`t=1`} for ${m`\mathbf r(t)=${tex(r)}`}.`,opts,{kind:'expr',lv:2,
    how:'cos θ = v·a/(|v||a|); here the trig parts cancel in v·a.',
    sol:[['Velocity and acceleration.',X`\mathbf v=\langle -${R}\sin t,\ ${c}t,\ -${R}\cos t\rangle,\qquad \mathbf a=\langle -${R}\cos t,\ ${c},\ ${R}\sin t\rangle`],
         ['At t = 1.',X`\mathbf v\cdot\mathbf a=${c*c},\qquad |\mathbf v||\mathbf a|=${R*R+c*c}\quad\Rightarrow\quad\theta=${tex(key)}`]],chk:{op:'angleva',e:{r,t0:'1'}}});
});

/* which vector function matches a described curve — F2023-Q6 */
addX('x-vf-graph','VF',1,['F2023-Q6'],()=>{
  const k=ri(2,6), c=ri(2,4);
  const P=[['a spiral that winds outward in the horizontal plane z = '+k,`<t*cos(t), t*sin(t), ${k}>`],['a helix that climbs around the z-axis',`<cos(t), sin(t), ${c}*t>`],
    ['a circle in the horizontal plane z = '+k,`<${c}*cos(t), ${c}*sin(t), ${k}>`],['a spiral that winds outward while climbing, on a cone',`<t*cos(t), t*sin(t), t>`],['a parabola in the xz-plane',`<t, 0, ${c}*t^2>`]];
  const i=ri(0,P.length-1);
  const opts=xm({h:mk(P[i][1])},P.filter((_,j)=>j!==i).map(p=>({h:mk(p[1]),why:`That curve is ${p[0]}.`})));
  return xq(`Which vector function traces ${P[i][0]}? (${m`t\ge 0`})`,opts,{kind:'choice',lv:1,
    how:'Read each component: constant z ⇒ horizontal plane; t cos t, t sin t ⇒ growing radius; cos t, sin t with z = ct ⇒ helix.',sol:[['',tex(P[i][1])]],chk:{op:'manual'}});
});

/* ★ motion: integrate a → v → r with initial conditions (sometimes at t = 1) — F2023-Q1, S2023-Q6, S2016-Q6, F2016-Q7, S2017-Q4, F2017-Q2, S2020-Q6, S2019-Q6, S2018-Q7, S2015-Q7, F2022-Q3 */
addX('x-mot-r','MOT',5,['F2023-Q1','S2023-Q6','S2016-Q6','F2016-Q7','S2017-Q4','F2017-Q2','S2020-Q6','S2019-Q6','S2018-Q7','S2015-Q7','F2022-Q3'],()=>{
  const t0=coin(0.3)?1:0, T=pick([1,2,2,3].filter(x=>x!==t0));
  /* each component of a(t): terms {k:'p',c,n} or trig/exp {k,c} (trig/exp only when t0 = 0) */
  const comp=()=>{ const ts=[]; const nt=ri(1,2);
    for(let i=0;i<nt;i++){ if(t0===0&&coin(0.3)) ts.push({k:pick(['cos','sin','exp','nexp']),c:nz(-2,3)}); else ts.push({k:'p',c:nz(-4,6),n:ri(0,2)}); }
    return ts; };
  const A=[comp(),comp(),coin(0.2)?[]:comp()], v0=rv(3,-3,3), r0=rv(3,-3,3);
  /* V(t), R(t) as {r:[p,q], parts:{name:coef}} evaluated at a number */
  const val=(term,which,t)=>{ const {k,c}=term;
    if(k==='p'){ const n=term.n; if(which==='V') return {r:Rr(c*Math.pow(t,n+1),n+1),parts:{}}; return {r:Rr(c*Math.pow(t,n+2),(n+1)*(n+2)),parts:{}}; }
    const P={}; const add=(name,co,rat)=>{ if(t===0) return {r:[co*rat,1],parts:{}}; P[name]=co; return {r:[0,1],parts:P}; };
    if(k==='cos') return which==='V'?add(`sin(${t})`,c,0):add(`cos(${t})`,-c,1);
    if(k==='sin') return which==='V'?add(`cos(${t})`,-c,1):add(`sin(${t})`,-c,0);
    if(k==='exp') return add(`e^(${t})`,c,1);
    return which==='V'?add(`e^(${-t})`,-c,1):add(`e^(${-t})`,c,1); };
  const sumV=(terms,which,t)=>terms.reduce((acc,tm)=>{ const v=val(tm,which,t); const parts={...acc.parts}; Object.keys(v.parts).forEach(n=>parts[n]=(parts[n]||0)+v.parts[n]); return {r:Radd(acc.r,v.r),parts}; },{r:[0,1],parts:{}});
  const neg=o=>({r:Rneg(o.r),parts:Object.fromEntries(Object.entries(o.parts).map(([k,v])=>[k,-v]))});
  const plus=(a,b)=>{ const parts={...a.parts}; Object.keys(b.parts).forEach(n=>parts[n]=(parts[n]||0)+b.parts[n]); return {r:Radd(a.r,b.r),parts}; };
  const num=r=>({r,parts:{}});
  const pos=(i,mode)=>{          /* mode: ok | noV0 | noSub | noR0 | t0as0 | once | trigSign */
    const a=A[i]; const tt=mode==='t0as0'?0:t0;
    let out=num([r0[i],1]); if(mode==='noR0') out=num([0,1]);
    const RT=sumV(a,'R',T), Rt0=sumV(a,'R',tt), Vt0=sumV(a,'V',tt);
    if(mode==='once'){ return plus(out,plus(sumV(a,'V',T),neg(Vt0))); }
    out=plus(out,RT); if(mode!=='noSub') out=plus(out,neg(Rt0));
    const vc=mode==='noSub'?num([v0[i],1]):plus(num([v0[i],1]),neg(Vt0));
    const dt=Rr(T-tt,1);
    if(mode!=='noV0') out=plus(out,{r:Rmul(vc.r,dt),parts:Object.fromEntries(Object.entries(vc.parts).map(([k,v])=>[k,v*(T-tt)]))});
    else out=plus(out,{r:Rmul(neg(Vt0).r,dt),parts:{}});
    if(mode==='trigSign') out={r:out.r,parts:Object.fromEntries(Object.entries(out.parts).map(([k,v])=>[k,-v]))};
    return out; };
  const S=o=>sumS([Rs(o.r)].concat(Object.entries(o.parts).filter(([k,v])=>v).map(([k,v])=>mono(v,{})+'*'+k).map(s=>s.replace(/^1\*/,'').replace(/^-1\*/,'-'))))||'0';
  const vecS=mode=>V(...[0,1,2].map(i=>S(pos(i,mode))));
  const hasTr=A.some(c=>c.some(t=>t.k!=='p'));
  const ask=hasTr?pick(['vec','vec','comp']):pick(['vec','vec','norm','comp','dist']);
  const aS=V(...A.map(c=>c.length?sumS(c.map(t=>t.k==='p'?mono(t.c,{t:t.n}):mono(t.c,{})+'*'+{cos:'cos(t)',sin:'sin(t)',exp:'e^t',nexp:'e^(-t)'}[t.k]).map(s=>s.replace(/^1\*/,'').replace(/^-1\*/,'-'))):'0'));
  const modes=['noV0','noSub','noR0','once','trigSign'].concat(t0===1?['t0as0']:[]);
  const why={noV0:'Left out the initial-velocity term v(t₀)·(t − t₀).',noSub:'Used v₀ and r₀ as the constants of integration directly; the antiderivatives are not 0 at t₀ (e⁰ = 1, cos 0 = 1), so solve for C.',
    noR0:'Forgot the initial position.',once:'Integrated only once; position needs two integrations.',trigSign:'Sign slip in a trig or exponential antiderivative.',t0as0:'The conditions are given at t = 1, not t = 0.'};
  const Q=pick([0,1,2]), pt=rv(3,-3,3);
  let stem=`A particle has acceleration ${m`\mathbf a(t)=${tex(aS)}`}. ${t0===0?`At ${m`t=0`} its position is ${m`${vt(r0)}`} and its velocity is ${m`${vt(v0)}`}`:`Its velocity at ${m`t=1`} is ${m`\mathbf v(1)=${vt(v0)}`} and its position at ${m`t=1`} is ${m`\mathbf r(1)=${vt(r0)}`}`}. `;
  let opts, key, kind='expr', chkAsk=ask;
  const rat=o=>Object.values(o.parts).every(v=>!v);
  if(ask==='vec'){ stem+=`Find its position at ${m`t=${T}`}.`; key=vecS('ok'); kind='vec';
    opts=xm({a:key},modes.map(md=>({a:vecS(md),why:why[md]})),{kind:'vec'}); }
  else if(ask==='comp'){ stem+=`Find the ${AX[Q]}-component of its position at ${m`t=${T}`}.`; key=S(pos(Q,'ok'));
    opts=xm({a:key},modes.map(md=>({a:S(pos(Q,md)),why:why[md]}))); chkAsk='comp'+Q; }
  else { const P3v=md=>[0,1,2].map(i=>pos(i,md)); if(!P3v('ok').every(rat)) return null;
    const nrm=(md,Qp)=>{ const v=P3v(md).map((o,i)=>Radd(o.r,[-(Qp?Qp[i]:0),1])); const s2=v.reduce((s,r)=>Radd(s,Rmul(r,r)),[0,1]); return surd(1,s2[1],s2[0]*s2[1]); };
    if(ask==='norm'){ stem+=`Compute ${m`|\mathbf r(${T})|`}.`; key=nrm('ok'); opts=xm({a:key},modes.filter(md=>P3v(md).every(rat)).map(md=>({a:nrm(md),why:why[md]})).concat([{a:(()=>{ const v=P3v('ok').map(o=>o.r); const s2=v.reduce((s,r)=>Radd(s,Rmul(r,r)),[0,1]); return Rs(s2); })(),why:'Forgot the square root.'}])); }
    else { stem+=`Find the distance from the particle’s position at ${m`t=${T}`} to the point ${mp(pt)}.`; key=nrm('ok',pt); chkAsk='dist';
      opts=xm({a:key},modes.filter(md=>P3v(md).every(rat)).map(md=>({a:nrm(md,pt),why:why[md]})).concat([{a:nrm('ok'),why:'That is the distance from the origin.'}])); } }
  return xq(stem,opts,{kind,lv:t0===1?3:2,how:'v(t) = v(t₀) + ∫ a from t₀ to t; r(t) = r(t₀) + ∫ v from t₀ to t. Mind the antiderivative’s value at t₀.',
    sol:[['Integrate a and fix the constant with the velocity condition.',X`\mathbf v(t)=\mathbf v(${t0})+\int_{${t0}}^{t}\mathbf a(u)\,du`],['Integrate again with the position condition, then evaluate at t = '+T+'.',X`\mathbf r(${T})=${tex(vecS('ok'))}`]],
    chk:{op:'mot',e:{a:aS,v0:vint(v0),r0:vint(r0),t0:String(t0),T:String(T)},n:{ask:chkAsk,pt}}});
});

/* position from velocity — F2024-Q9 */
addX('x-mot-v','MOT',1,['F2024-Q9'],()=>{
  const c=[nz(-3,3),nz(-3,3),nz(-3,3)], n=[0,1,2], r0=rv(3,-5,5);
  const vS=V(...c.map((k,i)=>mono(k*(n[i]+1),{t:n[i]}))), R=V(...c.map((k,i)=>sumS([mono(k,{t:n[i]+1}),String(r0[i])])));
  const opts=xm({a:R},[{a:V(...c.map((k,i)=>mono(k,{t:n[i]+1}))),why:'Forgot the initial position.'},{a:V(...c.map((k,i)=>sumS([mono(k,{t:n[i]+1}),String(-r0[i])]))),why:'Subtracted the initial position.'},
    {a:V(...c.map((k,i)=>sumS([mono(k*(n[i]+1),{t:n[i]}),String(r0[i])]))),why:'Added r(0) to v(t) without integrating.'},{a:V(...c.map((k,i)=>sumS([mono(k*(n[i]+1),{t:n[i]+1}),String(r0[i])]))),why:'Raised the power without dividing by the new exponent.'},
    {a:V(...c.map((k,i)=>sumS([mono(k,{t:n[i]+1}),String(r0[(i+1)%3])]))),why:'Mismatched the initial-position components.'}],{kind:'vec',vars:['t']});
  return xq(`A particle has velocity ${m`\mathbf v(t)=${tex(vS)}`}, and at ${m`t=0`} it is at ${mp(r0)}. What is its position ${m`\mathbf r(t)`}?`,opts,{kind:'vec',vars:['t'],lv:1,
    how:'r(t) = r(0) + ∫₀ᵗ v(u) du.',sol:[['Integrate and add the starting point.',X`\mathbf r(t)=${tex(R)}`]],chk:{op:'ivp',e:{rp:vS,r0:vint(r0)}}});
});

/* initial velocity from a later velocity — F2015-Q4 */
addX('x-mot-v0','MOT',1,['F2015-Q4'],()=>{
  const a=[[ri(-2,3)],[0,nz(-3,3)],[nz(-3,3)]], v1=[ri(-3,3),Rr(nz(-5,5),2),[ri(-3,3),1]];
  const aS=vpoly(a);
  const integ=c=>c.reduce((s,k,n)=>Radd(s,Rr(k,n+1)),[0,1]);
  const V1=[[v1[0],1],v1[1],v1[2]], v0=V1.map((x,i)=>Radd(x,Rneg(integ(a[i])))), S=vv=>V(...vv.map(Rs));
  const opts=xm({a:S(v0)},[{a:S(V1.map((x,i)=>Radd(x,integ(a[i])))),why:'Added ∫a instead of subtracting: v(0) = v(1) − ∫₀¹ a.'},{a:S(V1.map((x,i)=>Radd(x,Rneg(a[i].reduce((s,k)=>Radd(s,[k,1]),[0,1]))))),why:'Subtracted a(1) instead of the integral of a over [0, 1].'},
    {a:S(V1),why:'That is v(1).'},{a:S(v0.map(Rneg)),why:'Sign slip.'},{a:S(V1.map((x,i)=>Radd(x,Rneg(Rmul(integ(a[i]),[2,1]))))),why:'Arithmetic slip integrating.'}],{kind:'vec'});
  return xq(`The acceleration of a particle is ${m`\mathbf a(t)=${tex(aS)}`}. Its velocity at ${m`t=1`} is ${m`\mathbf v(1)=${tex(S(V1))}`}. What was its velocity at ${m`t=0`}?`,opts,{kind:'vec',lv:1,
    how:'v(1) − v(0) = ∫₀¹ a(t) dt.',sol:[['Integrate a over [0, 1].',X`\int_0^1\mathbf a\,dt=${tex(S(a.map(integ)))}`],['Subtract.',X`\mathbf v(0)=${tex(S(v0))}`]],chk:{op:'vback',e:{a:aS,v1:S(V1)}}});
});

/* distance traveled when the speed is a perfect square — F2018-Q5 */
addX('x-mot-dist','MOT',1,['F2018-Q5'],()=>{
  const k=pick([1,2,2]), T=pick([1,2,3]), sq=k===2?'2':'sqrt(2)';
  const aS=V('0',mono(2*k,{t:1}),sq), L=Rr(3*T+k*T*T*T,3);
  const opts=xm({a:Rs(L)},[{a:Rs(Rr(k*T*T*T,3)),why:'Dropped the constant 1 in the speed 1 + kt².'},{a:String(T),why:'That is only the x-direction distance.'},{a:Rs(Rr(3*T+k*T*T*T,3).map((x,i)=>i?x:x*2)),why:'Arithmetic slip integrating the speed.'},
    {a:String(1+k*T*T),why:'That is the speed at the end, not the distance.'},{a:`sqrt(${1+k*k*T**4+2*k*T*T})*${T}`,why:'Speed is not constant; integrate it.'}]);
  return xq(`A particle has acceleration ${m`\mathbf a(t)=${tex(aS)}`} and initial velocity ${m`\langle 1,0,0\rangle`} at ${m`t=0`}. Find the distance it travels for ${m`0\le t\le ${T}`}.`,opts,{kind:'expr',lv:2,
    how:'Find v(t), then integrate the speed |v(t)|; here it is a perfect square.',
    sol:[['Velocity.',X`\mathbf v(t)=\langle 1,\ ${k}t^2,\ ${k===2?'2':'\\sqrt2'}t\rangle`],['Speed.',X`|\mathbf v|=\sqrt{1+${2*k}t^2+${k*k}t^4}=1+${k===1?'':k}t^2`],['Integrate.',X`\int_0^{${T}}(1+${k===1?'':k}t^2)\,dt=${tex(Rs(L))}`]],
    chk:{op:'motdist',e:{a:aS,T:String(T)}}});
});

/* ★ arc length families — F2019-Q5, S2025-Q8, S2022-Q8, S2020-Q5, F2015-Q3, S2015-Q6, S2016-Q3, F2016-Q5, S2018-Q6, F2024-Q7 */
addX('x-arc','ARC',5,['F2019-Q5','S2025-Q8','S2020-Q5','F2015-Q3','S2015-Q6','S2016-Q3','F2016-Q5','S2018-Q6','F2024-Q7'],()=>{
  const fam=pick(['inv','inv','cubic','log2t','lnsq','t3','cyc','helix']);
  let r,lo='0',hi,key,dis,steps;
  if(fam==='inv'){ const k=pick([0,0,1,1,2]), R=pick([1,1,2]), T=pick(['1','2','pi','2pi']), s2=1+4*k*k;
    const Rc=R===1?'':R+'*'; r=k?V(`${Rc}(sin(t) - t*cos(t))`.replace('1*',''),`${Rc}(cos(t) + t*sin(t))`,mono(R*k,{t:2})):V(`${Rc}(sin(t) - t*cos(t))`,`${Rc}(cos(t) + t*sin(t))`);
    hi=T; const Tsq={'1':'1','2':'4','pi':'pi^2','2pi':'4*pi^2'}[T];
    key=`${surd(R,2,s2)}*${Tsq}`.replace(/^1\*/,''); if(T==='1'||T==='2') key=surd(R*({'1':1,'2':4}[T]),2,s2);
    const alt=(num,den,rad)=>T==='1'||T==='2'?surd(num*({'1':1,'2':4}[T]),den,rad):`${surd(num,den,rad)}*${Tsq}`;
    dis=[{a:alt(R,1,s2),why:'∫ t dt = t²/2: the ½ is missing.'},{a:alt(R,2,1),why:k?'The z-component contributes too: |r′| = t√(1 + 4k²)·R.':'Dropped the factor R.'},{a:T==='1'||T==='2'?surd(R*+T,1,s2):`${surd(R,1,s2)}*${T==='pi'?'pi':'2*pi'}`,why:'Treated the speed as constant.'},{a:alt(R*R,2,s2*s2),why:'Forgot a square root.'}];
    steps=[['Speed.',X`|\mathbf r'(t)|=${R===1?'':R}t${k?`\\sqrt{${s2}}`:''}`],['Integrate.',X`L=${tex(key)}`]]; }
  else if(fam==='cubic'){ const mm=pick([3,4,5,6]), T=`sqrt(${mm*mm-4})`, c=ri(-5,7);
    r=V('t^2','t^3/3',String(c)); hi=T; key=frac(mm**3-8,3);
    dis=[{a:frac(mm**3,3),why:'Evaluate the antiderivative at both limits: (4 + 0)^{3/2} = 8 must be subtracted.'},{a:frac(mm**3-1,3),why:'At t = 0 the value is 4^{3/2} = 8, not 1.'},{a:frac(mm**3-8,2),why:'∫ t√(4 + t²) dt = (4 + t²)^{3/2}/3.'},{a:String(mm*mm),why:'Evaluated the speed, not the integral.'}];
    steps=[['Speed.',X`|\mathbf r'|=\sqrt{4t^2+t^4}=t\sqrt{4+t^2}`],['Substitute u = 4 + t².',X`L=\left[\tfrac13(4+t^2)^{3/2}\right]_0^{${tex(T)}}=${tex(key)}`]]; }
  else if(fam==='log2t'){ const b=pick(['e','e^2','2','4']); r=V('2*t','4*sqrt(t)','ln(t)'); lo='1'; hi=b;
    key={e:'2e - 1','e^2':'2e^2','2':'2 + ln(2)','4':'6 + ln(4)'}[b];
    dis=[{a:{e:'2e + 1','e^2':'2e^2 + 1','2':'2 + ln(4)','4':'6 + ln(2)'}[b],why:'Arithmetic slip evaluating 2t + ln t.'},{a:{e:'e - 1','e^2':'e^2','2':'1 + ln(2)','4':'3 + ln(4)'}[b],why:'The speed is 2 + 1/t, not 1 + 1/t.'},
         {a:{e:'2e','e^2':'2e^2 + 2','2':'4 + ln(2)','4':'8 + ln(4)'}[b],why:'Forgot to subtract the value at t = 1.'},{a:{e:'4e - 3','e^2':'4e^2 - 2','2':'4','4':'12'}[b],why:'Dropped the ln t part.'}];
    steps=[['Speed is a perfect square.',X`|\mathbf r'|=\sqrt{4+\tfrac4t+\tfrac1{t^2}}=2+\tfrac1t`],['Integrate.',X`L=\left[2t+\ln t\right]_1^{${tex(b)}}=${tex(key)}`]]; }
  else if(fam==='lnsq'){ const b=pick([2,3,4,'e']); r=V('ln(t)','sqrt(2)*t','t^2/2'); lo='1'; hi=String(b);
    key=b==='e'?'(e^2 - 1)/2 + 1':`${frac(b*b-1,2)} + ln(${b})`;
    dis=[{a:b==='e'?'(e^2 + 1)/2':`${frac(b*b+1,2)} + ln(${b})`,why:'Subtract the value at t = 1: (b² − 1)/2.'},{a:b==='e'?'e^2 - 1':`${b*b-1} + ln(${b})`,why:'∫ t dt = t²/2.'},{a:b==='e'?'(e^2 - 1)/2':frac(b*b-1,2),why:'Missed the 1/t part of the speed t + 1/t.'},{a:b==='e'?'(e^2-1)/2 + 2':`${frac(b*b-1,2)} + ${frac(1,b)}`,why:'∫ (1/t) dt = ln t.'}];
    steps=[['Speed.',X`|\mathbf r'|=\sqrt{\tfrac1{t^2}+2+t^2}=t+\tfrac1t`],['Integrate.',X`L=${tex(key)}`]]; }
  else if(fam==='t3'){ const a=pick([1,2]), sym=coin(); lo=sym?String(-a):'0'; hi=String(a); r=V('t^3','sqrt(6)/2*t^2','t'); const L=(a**3+a)*(sym?2:1); key=String(L);
    dis=[{a:String(L/2*(sym?1:3)),why:sym?'Integrate over the whole interval [−a, a].':'Arithmetic slip.'},{a:String(sym?0:L+1),why:sym?'Speed is positive; arc length cannot cancel to 0.':'Off by one.'},{a:String(a**3*(sym?2:1)),why:'Dropped the +1 in the speed 3t² + 1.'},{a:String(3*a**3*(sym?2:1)+a),why:'∫ 3t² dt = t³.'}];
    steps=[['Speed is a perfect square.',X`|\mathbf r'|=\sqrt{9t^4+6t^2+1}=3t^2+1`],['Integrate.',X`L=\left[t^3+t\right]_{${lo}}^{${hi}}=${key}`]]; }
  else if(fam==='cyc'){ const R=pick([1,2,3]), full=coin(0.3); r=V(`${R===1?'':R+'*'}(t - sin(t))`,`${R===1?'':R+'*'}(1 - cos(t))`); hi=full?'2pi':'pi'; key=String((full?8:4)*R);
    dis=[{a:String((full?4:2)*R),why:'|r′| = 2R sin(t/2); its integral over [0, π] is 4R.'},{a:`${R}*pi`,why:'That is not the arc length of this cycloid.'},{a:String((full?16:8)*R),why:'Doubled the result.'},{a:`${2*R}*pi`,why:'Used the width of the arch.'}];
    steps=[['Speed.',X`|\mathbf r'|=${R===1?'':R}\sqrt{2-2\cos t}=${2*R}\sin\tfrac t2`],['Integrate.',X`L=${key}`]]; }
  else { const tr=pick([[3,4,5],[5,12,13],[6,8,10],[2,2,'2sqrt(2)']]), [a,b,c]=tr, T=pick(['pi','2pi','1']);
    r=pick([V(`${a}*cos(t) + ${b}*sin(t)`,String(ri(-5,5)),`${a}*sin(t) - ${b}*cos(t)`),V(`${b}*t`,`${a}*sin(t)`,`${a}*cos(t)`)]); lo=T==='pi'&&coin()?'pi':'0'; hi=lo==='pi'?'2pi':T;
    const sp=r.includes('*t,')||r.startsWith(`<${b}*t`)?Math.sqrt(a*a+b*b):Math.sqrt(a*a+b*b);
    const len=hi==='1'?'1':hi==='2pi'&&lo==='0'?'2*pi':'pi';
    const spS=typeof c==='number'?String(c):'2*sqrt(2)'; key=`${spS}*${len}`.replace('*1','');
    dis=[{a:`${a+b}*${len}`.replace('*1',''),why:'The speed is √(a² + b²), not a + b.'},{a:`${a*a+b*b}*${len}`.replace('*1',''),why:'Forgot the square root in the speed.'},{a:`${a}*${len}`.replace('*1',''),why:'Missed part of the velocity.'},{a:`${spS}*${len==='pi'?'2*pi':len==='1'?'2':'pi'}`,why:'Check the length of the interval.'}];
    steps=[['Constant speed.',X`|\mathbf r'|=\sqrt{${a*a}+${b*b}}=${tex(spS)}`],['Speed × time.',tex(key)]]; }
  const opts=xm({a:key},dis);
  return xq(`Find the length of the curve ${m`\mathbf r(t)=${tex(r)}`} for ${m`${tex(lo)}\le t\le ${tex(hi)}`}.`,opts,{kind:'expr',lv:2,
    how:'L = ∫|r′(t)| dt; exam curves are built so the speed simplifies (constant, or a perfect square).',sol:steps,chk:{op:'arclen',e:{r,a:lo,b:hi}}});
});

/* distance traveled at constant speed: find the time — S2019-Q5, S2024-Q5, S2017-Q5 */
addX('x-arc-inv','ARC',2,['S2019-Q5','S2024-Q5','S2017-Q5'],()=>{
  const tr=pick([[3,4,5],[5,12,13],[6,8,10],[8,6,10]]), [a,b,c]=tr, k=pick([1,2,3,4,5,8]), D=c*k, h=ri(-9,9);
  const variant=pick(['alpha','diff','xcoord']);
  if(variant==='xcoord'){ const d=pick([[5,-3,4],[1,2,2],[2,-1,2],[4,4,7],[6,2,3]]), s=Math.sqrt(n2(d)), P=rv(3,-5,5), L=pick([2,3,4,6]), key=surd(P[0]*1,1,1);
    const t=Rr(L,s===Math.round(s)?s:1), xk=s===Math.round(s)?Rs(Radd([P[0],1],Rmul(t,[d[0],1]))):`${P[0]} + ${d[0]*L}/sqrt(${n2(d)})`;
    const r=lineKey(P,d);
    const opts=xm({a:xk},[{a:String(P[0]+d[0]*L),why:'Used t = distance; the speed is |r′| ≠ 1, so t = distance/speed.'},{a:String(P[0]),why:'That is the starting x-coordinate.'},
      {a:s===Math.round(s)?Rs(Radd([P[0],1],Rmul(Rr(L,s*s),[d[0],1]))):`${P[0]} + ${d[0]*L}/${n2(d)}`,why:'Divided by the speed squared.'},{a:s===Math.round(s)?Rs(Radd([-P[0],1],Rmul(t,[d[0],1]))):`${-P[0]} + ${d[0]*L}/sqrt(${n2(d)})`,why:'Sign slip.'},{a:s===Math.round(s)?Rs(Rmul(t,[d[0],1])):`${d[0]*L}/sqrt(${n2(d)})`,why:'Forgot the starting x-coordinate.'}]);
    return xq(`A particle moves along ${m`\mathbf r(t)=${tex(r)}`}, ${m`t\ge0`}. What is its x-coordinate after it has traveled a distance ${L} along the curve?`,opts,{kind:'expr',lv:2,
      how:'Speed |r′| is constant, so the time is distance ÷ speed; plug that t into x(t).',sol:[['Speed.',X`|\mathbf r'|=\sqrt{${n2(d)}}`],['Time and x.',X`t=\frac{${L}}{\sqrt{${n2(d)}}},\qquad x=${tex(xk)}`]],chk:{op:'arcpos',e:{r},n:{L}}});
  }
  const r=variant==='alpha'?V(`${b}*t`,`${a}*sin(t)`,`${a}*cos(t)`):V(`${a}*cos(t) + ${ri(-9,9)}`,`${b}*cos(t) + ${h}`,`${c}*sin(t) - ${ri(1,9)}`);
  const sp=variant==='alpha'?Math.hypot(a,b):c, key=frac(D,sp);
  const opts=xm({a:key},[{a:String(D),why:'That is the distance itself; divide by the speed.'},{a:frac(D,sp*sp),why:'Divided by the speed squared.'},{a:frac(D,a+b),why:'Speed is √(a² + b²), not a + b.'},{a:frac(D*2,sp),why:'Doubled the time.'},{a:frac(D,a),why:'Used only one component of the velocity.'}]);
  return xq(variant==='alpha'?`A particle moves along ${m`\mathbf r(t)=${tex(r)}`}, ${m`t\ge0`}. Find ${m`\alpha\ge0`} such that the distance traveled from ${m`t=0`} to ${m`t=\alpha`} is ${D}.`
                            :`A particle moves along ${m`\mathbf r(t)=${tex(r)}`}, ${m`t\ge0`}. Find ${m`t_2-t_1`} so that the distance traveled from ${m`t_1`} to ${m`t_2`} is ${D}.`,opts,{kind:'expr',lv:1,
    how:'The speed is constant; time = distance ÷ speed.',sol:[['Speed.',X`|\mathbf r'(t)|=${sp}`],['',X`\Delta t=\frac{${D}}{${sp}}=${tex(key)}`]],chk:{op:'arcinv',e:{r},n:{D}}});
});

/* arc-length function and speed — S2022-Q8, F2018-Q6 */
addX('x-arc-fn','ARC',1,['S2022-Q8','F2018-Q6'],()=>{
  if(coin()){ const c=pick([1,2]), t0=pick([1,2]); const r=V('t*cos(t)','t*sin(t)',sumS([String(ri(1,9)),mono(-c,{t:2})])); const s2=1+t0*t0+4*c*c*t0*t0;
    const opts=xm({a:sqrtS(s2)},[{a:String(s2),why:'Speed is the square root of |r′|².'},{a:sqrtS(1+4*c*c*t0*t0),why:'|(t cos t)′|² + |(t sin t)′|² = 1 + t², not 1.'},{a:sqrtS(t0*t0+4*c*c*t0*t0),why:'Missed the 1 from the product rule.'},{a:sqrtS(2+4*c*c*t0*t0),why:'Arithmetic slip.'},{a:String(1+t0+2*c*t0),why:'The speed is not the sum of component speeds.'}]);
    return xq(`Find the speed of a particle with position ${m`\mathbf r(t)=${tex(r)}`} at ${m`t=${t0}`}.`,opts,{kind:'expr',lv:1,how:'Speed = |r′(t)|.',
      sol:[['|r′|² simplifies with sin² + cos² = 1.',X`|\mathbf r'(t)|^2=1+t^2+${4*c*c}t^2`],['At t = '+t0+'.',tex(sqrtS(s2))]],chk:{op:'motion',e:{r,t0:String(t0)},n:{ask:'speed'}}});
  }
  const k=pick([1,1,2]), s2=1+4*k*k, r=V('cos(t) + t*sin(t)','sin(t) - t*cos(t)',mono(k,{t:2}));
  const key=`${surd(1,2,s2)}*t^2`;
  const opts=xm({a:key},[{a:`${sqrtS(s2)}*t`,why:'That is the speed, not its integral.'},{a:`${sqrtS(s2)}*t^2`,why:'∫₀ᵗ u du = t²/2.'},{a:'(1 + t^2)^(3/2)/3 - 1/3',why:'The speed is t√(1 + 4k²), not √(1 + t²)·t.'},{a:'t^2/2',why:'The z-component contributes to the speed too.'},{a:`${surd(1,2,s2)}*t^2 + 1`,why:'s(t) must be 0 at the starting point.'}],{kind:'expr',vars:['t']});
  return xq(`Find the arc length function ${m`s(t)`} for ${m`\mathbf r(t)=${tex(r)}`}, measured from ${mp([1,0,0])} in the direction of increasing ${m`t`}.`,opts,{kind:'expr',vars:['t'],lv:2,
    how:'s(t) = ∫₀ᵗ |r′(u)| du, starting where r = (1, 0, 0), i.e. t = 0.',sol:[['Speed.',X`|\mathbf r'(t)|=t\sqrt{${s2}}`],['Integrate from 0.',X`s(t)=${tex(key)}`]],chk:{op:'arcfn',e:{r,key}}});
});

/* ★ curvature of a (shifted) circle traced in space — F2022-Q5, S2023-Q8, F2016-Q6, F2019-Q4, F2023-Q2 */
addX('x-curv-circle','CURV',4,['F2022-Q5','S2023-Q8','F2016-Q6','F2019-Q4','F2023-Q2'],()=>{
  const tr=pick([[3,4,5],[5,12,13],[6,8,10],[8,15,17],[1,'sqrt(3)',2],[0,1,1],[0,2,2],[0,9,9]]), A=tr[2];
  const sh=[ri(-9,9),ri(-9,9),ri(-9,9)].map(v=>coin(0.5)?v:0), ord=shuf([0,1,2]);
  const B=tr[0], C=tr[1];
  const comps=[`${A}*sin(t)`,B?`${B}*cos(t)`:'0',C?`${C}*cos(t)`:'0'];
  if(tr[1]==='sqrt(3)'){ comps[0]='sqrt(3)*sin(t)'; comps[1]='sin(t)'; comps[2]='2*cos(t)'; }
  const cs=ord.map(i=>sumS([comps[i],String(sh[i])]));
  const r=V(...cs), t0=pick(['pi/2','2pi/3','pi/4','pi','pi/3','0']);
  const Rad=typeof A==='number'?A:2;
  const opts=xm({a:frac(1,Rad)},[{a:String(Rad),why:'That is the radius; curvature is 1/radius.'},{a:frac(1,Rad*Rad),why:'κ = |r′ × r″|/|r′|³ = R²/R³ = 1/R, not 1/R².'},
    {a:frac(1,typeof B==='number'&&B?B:Rad+1),why:'Used one coefficient instead of the radius √(B² + C²).'},{a:typeof C==='number'&&C?frac(1,C):frac(2,Rad),why:'Used one coefficient instead of the radius.'},{a:'0',why:'A circle is curved; only lines have κ = 0.'},{a:frac(Rad,2),why:'Arithmetic slip.'}]);
  return xq(`Let ${m`\mathbf r(t)=${tex(r)}`}. Find the curvature ${m`\kappa`} at ${mk('t = '+t0)}.`,opts,{kind:'expr',lv:2,
    how:'The coefficients satisfy B² + C² = A², so this is a circle of radius A traced at constant speed: κ = 1/A (or use |r′ × r″|/|r′|³).',
    sol:[['Speed is constant.',X`|\mathbf r'(t)|=${Rad}`],['',X`\kappa=\frac{|\mathbf r'\times\mathbf r''|}{|\mathbf r'|^3}=\frac{${Rad*Rad}}{${Rad**3}}=${tex(frac(1,Rad))}`]],chk:{op:'curv',e:{r,t0}}});
});

/* curvature of a helix — F2024-Q8 */
addX('x-curv-helix','CURV',2,['F2024-Q8'],()=>{
  const R=pick([1,1,2,3]), c=ri(1,4), s=R*R+c*c, r=V(`${R===1?'':R+'*'}cos(t)`,`${R===1?'':R+'*'}sin(t)`,mono(c,{t:1}));
  const opts=xm({a:frac(R,s)},[{a:frac(s,R),why:'That is the radius of curvature 1/κ.'},{a:frac(1,R),why:'That ignores the vertical motion; κ = R/(R² + c²).'},{a:surd(R,s,s),why:'Divided by |r′| instead of |r′|³ (or |r′|²).'},
    {a:frac(c,s),why:'The numerator is R.'},{a:`sin(t)^2`,why:'The curvature of a helix is constant.'},{a:`${s}*${sqrtS(s)}`,why:'Inverted |r′ × r″|/|r′|³.'}]);
  return xq(`Find the curvature ${m`\kappa(t)`} of ${m`\mathbf r(t)=${tex(r)}`}.`,opts,{kind:'expr',vars:['t'],lv:1,
    how:'Helix ⟨R cos t, R sin t, ct⟩: κ = R/(R² + c²).',sol:[['',X`|\mathbf r'|=\sqrt{${s}},\qquad |\mathbf r'\times\mathbf r''|=${R}\sqrt{${s}}`],['',X`\kappa=\frac{${R}\sqrt{${s}}}{(\sqrt{${s}})^3}=${tex(frac(R,s))}`]],chk:{op:'curv',e:{r,t0:'t'}}});
});

/* curvature of polynomial curves — S2019-Q4, F2018-Q4 */
addX('x-curv-poly','CURV',2,['S2019-Q4','F2018-Q4'],()=>{
  let r,t0,v,a;
  if(coin()){ const p=pick([1,1,2]), q=pick([1,2,3]); const cc=ri(-4,4); r=V(String(cc),mono(p,{t:2}),mono(q,{t:1})); t0=0; v=[0,0,q]; a=[0,2*p,0]; }
  else { const A=pick([1,1,2]), B=pick(['1/2',1,2]), C=pick(['1/3',1]); r=V(mono(A,{t:1}),mono(B,{t:2}),mono(C,{t:3})); t0=pick([0,1,-1]);
    const b=eval(String(B)), c=eval(String(C)); v=[A,2*b*t0,3*c*t0*t0]; a=[0,2*b,6*c*t0]; if(v.some(x=>!Number.isInteger(x))||a.some(x=>!Number.isInteger(x))) return null; }
  const cr=crossA(v,a), n1=n2(cr), mm=n2(v); if(!n1||!mm) return null;
  const key=surd(1,mm*mm,n1*mm);
  const opts=xm({a:key},[{a:surd(-1,mm*mm,n1*mm),why:'Curvature is never negative.'},{a:surd(1,mm,n1),why:'Divided by |r′|² instead of |r′|³.'},{a:surd(1,1,n1*mm)==='0'?'1':surd(1,mm,n1*mm),why:'Divided by |r′| instead of |r′|³.'},
    {a:surd(1,mm*mm,n2(a)*mm),why:'Used |r″| instead of |r′ × r″|.'},{a:sqrtS(n1),why:'Forgot to divide by |r′|³.'},{a:frac(n2(a),mm),why:'Not the curvature formula.'}]);
  return xq(`Let ${m`\mathbf r(t)=${tex(r)}`}. Find the curvature ${m`\kappa(${t0})`}.`,opts,{kind:'expr',lv:2,
    how:'κ = |r′ × r″| / |r′|³.',sol:[['Derivatives at t₀.',X`\mathbf r'=${vt(v)},\qquad \mathbf r''=${vt(a)}`],['',X`\kappa=\frac{\sqrt{${n1}}}{(\sqrt{${mm}})^3}=${tex(key)}`]],chk:{op:'curv',e:{r,t0:String(t0)}}});
});
