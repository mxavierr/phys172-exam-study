
/* ---------------- Chapter 13 exam templates ---------------- */
const QN6=['Ellipsoid','Hyperboloid of one sheet','Hyperboloid of two sheets','Elliptic cone','Elliptic paraboloid','Hyperbolic paraboloid'];
const QNEAR={'Hyperboloid of one sheet':['Hyperboloid of two sheets','Elliptic cone','Ellipsoid','Hyperbolic paraboloid'],
  'Hyperboloid of two sheets':['Hyperboloid of one sheet','Elliptic cone','Ellipsoid','Hyperbolic paraboloid'],
  'Elliptic cone':['Hyperboloid of one sheet','Hyperboloid of two sheets','Elliptic paraboloid','Ellipsoid'],
  'Ellipsoid':['Hyperboloid of one sheet','Hyperboloid of two sheets','Elliptic cone','Elliptic paraboloid'],
  'Elliptic paraboloid':['Hyperbolic paraboloid','Elliptic cone','Hyperboloid of one sheet','Ellipsoid'],
  'Hyperbolic paraboloid':['Elliptic paraboloid','Hyperboloid of one sheet','Hyperboloid of two sheets','Elliptic cone']};
const QXWHY=n=>({'Ellipsoid':'An ellipsoid needs all three squared terms with the same sign as the positive constant.',
  'Hyperboloid of one sheet':'One sheet means exactly ONE negative square (after moving everything so the constant is positive).',
  'Hyperboloid of two sheets':'Two sheets means exactly TWO negative squares against a positive constant.',
  'Elliptic cone':'A cone needs the constant to be 0 after completing the square.',
  'Elliptic paraboloid':'A paraboloid needs one variable that appears only to the first power.',
  'Hyperbolic paraboloid':'A hyperbolic paraboloid needs one first-power variable and two squares of opposite sign.'})[n];

/* ★ identify a quadric after completing the square — S2018-Q1, F2022-Q2, F2023-Q10, F2024-Q2, S2020-Q3, F2019-Q2, S2023-Q4, F2018-Q3, S2017-Q2, S2024-Q11, S2015-Q3 */
addX('x-quad-cs','QUAD',4,['S2018-Q1','F2022-Q2','F2023-Q10','F2024-Q2','S2020-Q3','F2019-Q2','S2023-Q4','F2018-Q3','S2017-Q2','S2024-Q11','S2015-Q3'],()=>{
  const type=pick(['Hyperboloid of one sheet','Hyperboloid of one sheet','Hyperboloid of one sheet','Hyperboloid of two sheets','Hyperboloid of two sheets','Hyperboloid of two sheets','Elliptic cone','Ellipsoid','Hyperbolic paraboloid','Elliptic paraboloid']);
  const p=shuf(['x','y','z']), A=[ri(1,4),ri(1,4),ri(1,4)], terms=[];   /* terms: [coef, var, power] with sum = 0 */
  const nShift=ri(1,2), shifts=[0,0,0]; shuf([0,1,2]).slice(0,nShift).forEach(i=>shifts[i]=nz(-3,3));
  let D;
  if(/paraboloid/.test(type)){
    const s=[1,type==='Elliptic paraboloid'?1:-1], L=p[2], C=nz(-3,3); shifts[2]=0;
    [0,1].forEach(i=>{ const c=s[i]*A[i], h=shifts[i]; terms.push([c,p[i],2]); if(h) terms.push([-2*c*h,p[i],1]); terms.push([c*h*h,'',0]); });
    terms.push([-C,L,1]); terms.push([ri(-5,5),'',0]);
  } else {
    const s={'Ellipsoid':[1,1,1],'Hyperboloid of one sheet':[1,1,-1],'Hyperboloid of two sheets':[1,-1,-1],'Elliptic cone':[1,1,-1]}[type];
    D=type==='Elliptic cone'?0:pick([1,2,3,4,5,8,9,12,16]);
    [0,1,2].forEach(i=>{ const c=s[i]*A[i], h=shifts[i]; terms.push([c,p[i],2]); if(h) terms.push([-2*c*h,p[i],1]); terms.push([c*h*h,'',0]); });
    terms.push([-D,'',0]);
  }
  /* merge constants, maybe negate everything, then move some terms to the right side */
  const k0=terms.filter(t=>t[2]===0).reduce((s,t)=>s+t[0],0); let T=terms.filter(t=>t[2]>0).concat(k0?[[k0,'',0]]:[]);
  if(coin(0.3)) T=T.map(([c,v,e])=>[-c,v,e]);
  const L=[],R=[]; T.forEach(t=>{ (t[2]===0||t[0]<0&&coin(0.6)||t[2]===1&&coin(0.5)?R:L).push(t); });
  if(!L.length) L.push(R.shift()); if(!L.some(t=>t[2]===2)&&R.some(t=>t[2]===2)){ const i=R.findIndex(t=>t[2]===2); L.push(R.splice(i,1)[0]); }
  const side=(ts,neg)=>ts.length?sumS(ts.map(([c,v,e])=>e===0?String(neg?-c:c):mono(neg?-c:c,{[v]:e}))):'0';
  const eq=`${side(L,false)} = ${side(R,true)}`;
  const opts=xm({h:type},QNEAR[type].map(n=>({h:n,why:QXWHY(n)+' Complete the square before counting signs.'})));
  const cs=[0,1,2].map(i=>shifts[i]?`(${shift(p[i],shifts[i])})^2`:`${p[i]}^2`);
  return xq(`Identify the surface ${mk(eq)}.`,opts,{kind:'choice',lv:1,
    how:'Complete the square, move the constant to the right, then count the negative squares (or spot a first-power variable).',
    sol:[['Complete the square in each variable that has both a square and a linear term.',X`\text{shifted squares: } ${cs.map(c=>tex(c)).join(',\\ ')}`],[QXWHY(type),X`\text{${type}}`]],
    chk:{op:'quad2',e:{eq},n:{type}}});
});

/* traces in planes parallel to a coordinate plane — S2025-Q3 */
addX('x-quad-trace','QUAD',1,['S2025-Q3'],()=>{
  const a=ri(1,4), b=ri(1,4), c=ri(1,3), d=ri(1,9);
  const Q2=(...t)=>sumS(t.map(([c,v])=>mono(c,{[v]:2})));
  const a2=a+ri(1,3), a3=a+ri(1,2);
  const F=pick([
    {s:`z = ${Q2([a,'x'],[-b,'y'])}`,pl:'parallel to and distinct from the xy-plane',v:'z',ks:[1,-2,3],key:'Hyperbolas'},
    {s:`z = ${Q2([a,'x'],[a,'y'])}`,pl:'z = k with k > 0',v:'z',ks:[1,2,5],key:'Circles'},
    {s:`z = ${Q2([a,'x'],[a2,'y'])}`,pl:'z = k with k > 0',v:'z',ks:[1,2,5],key:'Non-circular ellipses'},
    {s:`z = ${Q2([a,'x'],[-b,'y'])}`,pl:'parallel to the yz-plane (x = k)',v:'x',ks:[0,1,-2],key:'Parabolas'},
    {s:`${Q2([a,'x'],[a,'y'],[-c,'z'])} = ${d}`,pl:'parallel to the xy-plane',v:'z',ks:[0,1,-2],key:'Circles'},
    {s:`${Q2([a,'x'],[a3,'y'],[-c,'z'])} = ${d}`,pl:'parallel to the xy-plane',v:'z',ks:[0,1,-2],key:'Non-circular ellipses'},
    {s:`${Q2([a,'x'],[-b,'y'],[c,'z'])} = ${d}`,pl:'parallel to and distinct from the xz-plane (y = k, k ≠ 0)',v:'y',ks:[1,-1,2],key:'Circles or non-circular ellipses'}]);
  if(F.key==='Circles or non-circular ellipses') F.key=a===c?'Circles':'Non-circular ellipses';
  const all=['Parabolas','Hyperbolas','Circles','Non-circular ellipses','Isolated points','Lines'];
  const W={'Parabolas':'A parabola needs one of the two remaining variables to appear only to the first power.','Hyperbolas':'Hyperbolas need the two remaining squares to have opposite signs.',
    'Circles':'Circles need equal positive coefficients on the two remaining squares.','Non-circular ellipses':'Ellipses need same-sign squares; equal coefficients would make them circles.',
    'Isolated points':'A single point only happens when the right side becomes 0 for same-sign squares.','Lines':'Lines come from a factored difference of squares equal to 0, which needs k = 0.'};
  const opts=xm({h:F.key},all.filter(x=>x!==F.key).map(h=>({h,why:W[h]})));
  return xq(`In planes ${F.pl}, the traces of the surface ${mk(F.s)} are`,opts,{kind:'choice',lv:1,
    how:'Set the variable equal to a constant k and classify the curve left in the other two variables.',
    sol:[[`Put ${F.v} = k and look at the two remaining variables.`,X`${tex(F.s)},\qquad ${F.v}=k`],['',X`\text{${F.key}}`]],
    chk:{op:'trace2',e:{eq:F.s},n:{v:F.v,ks:F.ks,key:F.key}}});
});

/* which equation is this surface — S2022-Q10 (figure described in words), F2016-Q3 */
addX('x-quad-eq','QUAD',1,['S2022-Q10','F2016-Q3'],()=>{
  const a=ri(1,4), b=ri(1,9), c=ri(1,16);
  const ax=pick(['x','y','z']), oth=['x','y','z'].filter(v=>v!==ax);
  const E=(type,v)=>{ const o=['x','y','z'].filter(w=>w!==v), u=o[0], w=o[1];
    return {cone:`${u}^2 + ${b}*${w}^2 - ${c}*${v}^2 = 0`,one:`${u}^2 + ${b}*${w}^2 - ${c}*${v}^2 = 1`,two:`${u}^2 + ${b}*${w}^2 - ${c}*${v}^2 = -1`,
            par:`${v} = ${u}^2 + ${b}*${w}^2`,cyl:`${u}^2 + ${b}*${w}^2 = 1`}[type]; };
  const T=pick([['cone','an elliptic cone with its vertex at the origin, opening along the '],['one','a hyperboloid of one sheet whose axis is the '],
                ['two','a hyperboloid of two sheets whose axis is the '],['par','an elliptic paraboloid with vertex at the origin, opening in the positive direction of the '],
                ['cyl','an elliptic cylinder whose axis is the ']]);
  const key=E(T[0],ax);
  const pool=[['cone',oth[0]],['one',ax],['two',ax],['cone',ax],['par',ax],['cyl',ax],[T[0],oth[0]],[T[0],oth[1]]].filter(([t,v])=>E(t,v)!==key);
  const nm={cone:'an elliptic cone',one:'a hyperboloid of one sheet',two:'a hyperboloid of two sheets',par:'an elliptic paraboloid',cyl:'an elliptic cylinder'};
  const opts=xm({h:mk(key)},shuf(pool).map(([t,v])=>({h:mk(E(t,v)),why:t===T[0]?`Right kind of surface, but its axis is the ${v}-axis.`:`That equation is ${nm[t]}${t==='cyl'?'':` along the ${v}-axis`}.`})));
  return xq(`Which equation describes ${T[1]}${ax}-axis?`,opts,{kind:'choice',lv:2,
    how:'Axis = the variable with the odd sign (cone/hyperboloid), the first-power variable (paraboloid), or the missing variable (cylinder). Constant 0 ⇒ cone.',
    sol:[['Match the sign pattern and the constant to the surface, then read the axis off the special variable.',tex(key)]],
    chk:{op:'quaddesc',e:{eq:key},n:{type:T[0],axis:ax}}});
});

/* ★ line through two points meets a plane — F2024-Q1, F2023-Q12, F2018-Q1, S2022-Q7, S2015-Q2 */
addX('x-line-plane','LINE',4,['F2024-Q1','F2023-Q12','F2018-Q1','S2022-Q7','S2015-Q2'],()=>{
  const P=rv(3,-4,5), Q=rv(3,-4,5), d=subA(Q,P); if(!n2(d)) return null;
  const coord=coin(0.3), i=ri(0,2);
  const n=coord?[0,0,0].map((_,j)=>j===i?1:0):rv(3,-2,3), c=coord?0:ri(-9,12), nd=dotA(n,d); if(!nd) return null;
  const t=Rr(c-dotA(n,P),nd); if(t[1]>6) return null;
  const pt=tt=>P.map((x,j)=>Radd([x,1],Rmul(tt,[d[j],1])));
  const X0=pt(t), ptS=a=>P3(...a.map(Rs));
  const dist=!coord&&coin(0.25);
  const plTxt=coord?`the ${['yz','xz','xy'][i]}-plane`:mk(pn(n,c));
  const stem=`The line through ${mp(P)} and ${mp(Q)} intersects ${plTxt} at a point.`+(dist?' How far is that point from the origin?':' Find the point.');
  const Qb=Q.map((x,j)=>Radd([x,1],Rmul(t,[d[j],1])));
  const flip=pt(Rneg(t)), onPlaneWrong=pt(Radd(t,[1,1])), nOn=pt(Rr(c+dotA(n,P),nd));
  const sq=a=>a.reduce((s,r)=>Radd(s,Rmul(r,r)),[0,1]);
  const dS=a=>{ const r=sq(a); return surd(1,r[1],r[0]*r[1]); };
  const cand=[[flip,'Sign slip solving for t.'],[Qb,'Used the t from P but started the line at Q.'],[onPlaneWrong,'Off by one step in t.'],[nOn,'Sign slip moving n·P to the other side.'],
              [P.map(x=>[x,1]),'That is the starting point P (t = 0), not the intersection.']];
  const opts=dist?xm({a:dS(X0)},cand.map(([a,w])=>({a:dS(a),why:w})).concat([{a:frac(sq(X0)[0],sq(X0)[1]),why:'That is the squared distance.'}]))
                 :xm({a:ptS(X0)},cand.map(([a,w])=>({a:ptS(a),why:w})),{kind:'point'});
  return xq(stem,opts,{kind:dist?'expr':'point',lv:2,how:'r(t) = P + t(Q − P); substitute into the plane, solve for t, plug back in.',
    sol:[['Direction and parametrization.',X`\mathbf r(t)=${ptx(P)}+t\,${vt(d)}`],['Substitute into the plane and solve.',X`t=${tex(Rs(t))}`],['Intersection point.',X`${tex(ptS(X0))}${dist?`,\\qquad |\\cdot|=${tex(dS(X0))}`:''}`]],
    chk:{op:dist?'lineplanedist':'lineplane',n:{P,d,n,c}}});
});

/* line through P perpendicular to a plane, where it meets a coordinate plane — S2019-Q1, S2020-Q1 */
addX('x-line-perp','LINE',2,['S2019-Q1','S2020-Q1'],()=>{
  const n=rv(3,-3,3,true), i=ri(0,2), k=ri(-2,2); if(!k) return null;
  const P=rv(3,-4,4); P[i]=-k*n[i];                      /* so the line hits coordinate i = 0 at t = k */
  const c=ri(-8,8), X0=addA(P,mulA(k,n));
  const opts=xm({a:P3(...X0)},[{a:P3(...subA(P,mulA(k,n))),why:'Sign slip in t: the coordinate must become 0.'},{a:P3(...addA(P,mulA(k+1,n))),why:'Off by one in t.'},
    {a:P3(...P.map((x,j)=>j===i?0:x)),why:'Just zeroed one coordinate of P; the other coordinates change along the line too.'},{a:P3(...n.map((x,j)=>j===i?0:x*k)),why:'Dropped the starting point P.'},
    {a:P3(...X0.map((x,j)=>j===i?0:-x)),why:'Sign slips in the other coordinates.'}],{kind:'point'});
  return xq(`The line ${m`\ell`} passes through ${mp(P)} and is perpendicular to the plane ${mk(pn(n,c))}. At what point does ${m`\ell`} intersect the ${['yz','xz','xy'][i]}-plane?`,opts,
    {kind:'point',lv:2,how:'The line’s direction is the plane’s normal; set the right coordinate to 0.',
     sol:[['Direction = normal of the plane.',X`\mathbf r(t)=${ptx(P)}+t\,${vt(n)}`],[`Set ${AX[i]} = 0.`,X`${P[i]}+${fmtC(n[i])}t=0\quad\Rightarrow\quad t=${k}`],['Point.',ptx(X0)]],
     chk:{op:'lineplane',n:{P,d:n,n:[0,1,2].map(j=>j===i?1:0),c:0}}});
});

/* ★ line of intersection of two planes, answers in different-looking forms — F2018-Q2, S2024-Q3, S2025-Q9 */
addX('x-line-2planes','LINE',4,['F2018-Q2','S2024-Q3','S2025-Q9'],()=>{
  const n1=rv(3,-3,3), n2_=rv(3,-3,3), dd=crossA(n1,n2_); if(!n2(dd)) return null;
  const P0=rv(3,-3,3); if(coin()) P0[ri(0,2)]=0;
  const c1=dotA(n1,P0), c2=dotA(n2_,P0), dr=reduceInt(dd), sc=pick([1,-1,2,-1]), d=mulA(sc,dr);
  const P1=addA(P0,mulA(pick([1,-1,2]),dr));            /* the key may start at another point on the line */
  const kp=coin()?P0:P1;
  const cands=[lineOpt(addA(kp,n1),d,'Right direction, but that point is not on both planes.'),lineOpt(kp,n1,'The normal of a plane is perpendicular to every line in it, so it cannot be the direction.'),
    lineOpt(kp,[dr[0],-dr[1],dr[2]],'Sign slip on the j component of n₁ × n₂.'),lineOpt(d,kp,'Point and direction are swapped.'),lineOpt(kp,addA(n1,n2_),'n₁ + n₂ is not parallel to both planes.'),
    lineOpt(addA(kp,n2_),d,'Right direction, but that point is not on both planes.')].filter(o=>n2(addA(n1,n2_))||!/n₁ \+ n₂/.test(o.why));
  const opts=xm(lineOpt(kp,d),cands,{kind:'line',line:{p:P0,d:dr},fmt:null});
  return xq(`Which is a parametrization of the line of intersection of the planes ${mk(pn(n1,c1))} and ${mk(pn(n2_,c2))}?`,opts,{kind:'line',line:{p:P0,d:dr},lv:2,
    how:'Direction ∥ n₁ × n₂; check the point satisfies BOTH plane equations (answers may use different points and scalings).',
    sol:[['Direction.',X`\mathbf n_1\times\mathbf n_2=${vt(dd)}\parallel ${vt(dr)}`],['A point on both planes (set one variable to 0 and solve).',ptx(P0)],['Match the option whose point is on both planes and whose direction is parallel.',lineTex(kp,d)]],
    chk:{op:'planeline',n:{n1,c1,n2:n2_,c2},e:{ans:lineKey(kp,d)}}});
});

/* line parallel to a plane: find the parameter — F2022-Q4, F2023-Q4 */
addX('x-line-par-plane','LINE',2,['F2022-Q4','F2023-Q4'],()=>{
  const n=rv(3,-5,5,true), q=nz(-4,4), r=nz(-4,4), rest=q*n[1]+r*n[2]; if(rest%n[0]) return null;
  const a=-rest/n[0]; if(!a) return null;
  const x0=ri(-7,7), y0=ri(-5,5), z0=ri(-5,5), c=ri(-9,15);
  const sym=`\\frac{${tex(shift('x',x0))}}{a}=\\frac{${tex(shift('y',y0))}}{${q}}=\\frac{${tex(shift('z',z0))}}{${r}}`;
  const perp=n[1]&&q%n[1]===0?q/n[1]*n[0]:null;
  const opts=xm(xnum(a),[{a:String(-a),why:'Sign slip solving a·n₁ + (rest) = 0.'},{a:String(perp!==null&&perp!==a?perp:a+2),why:'That makes the line perpendicular to the plane (direction ∥ normal), not parallel.'},
    {a:String((c-y0*n[1]-z0*n[2]-x0*0)/n[0]|0||a+3),why:'Used the plane’s constant; parallel only needs direction · normal = 0.'},{a:String(-(q*n[1])/n[0]|0||a-1),why:'Dropped one term of the dot product.'},{a:String(a+n[0]),why:'Arithmetic slip.'},{a:String(-rest),why:'Forgot to divide by the normal’s first component.'}]);
  return xq(`Determine ${m`a`} so that the line ${m`${sym}`} is parallel to the plane ${mk(pn(n,c))}.`,opts,{kind:'expr',lv:1,
    how:'Parallel to the plane ⇔ direction ⟂ normal: ⟨a, q, r⟩ · n = 0.',
    sol:[['Direction · normal = 0.',X`${n[0]}a+(${q})(${n[1]})+(${r})(${n[2]})=0\quad\Rightarrow\quad a=${a}`]],chk:{op:'lineparplane',n:{n,q,r}}});
});

/* two lines intersect: find the parameter — F2024-Q3 */
addX('x-line-meet','LINE',1,['F2024-Q3'],()=>{
  const d1=rv(3,-2,2), d2=rv(3,-2,2), k=ri(0,2), o=[0,1,2].filter(j=>j!==k);
  const det=d1[o[0]]*(-d2[o[1]])-(-d2[o[0]])*d1[o[1]]; if(!det||!n2(crossA(d1,d2))) return null;
  const Xp=rv(3,-3,3), t0=ri(-2,2), s0=ri(-2,2), P1=subA(Xp,mulA(t0,d1)), P2=subA(Xp,mulA(s0,d2)), a=P2[k];
  const R=P2.map((x,j)=>j===k?sumS([mono(d2[j],{s:1}),'a']):lin(x,d2[j],'s'));
  const opts=xm(xnum(a),[{a:String(-a),why:'Sign slip in the last equation.'},{a:String(a+d2[k]),why:'Used s = 1 instead of the s you solved for.'},{a:String(Xp[k]),why:'That is the intersection coordinate, not a.'},{a:String(a-d2[k]*s0-1),why:'Arithmetic slip.'},{a:String(P1[k]),why:'That is the first line’s starting coordinate.'}]);
  return xq(`For what value of ${m`a`} do the lines ${m`\mathbf r(t)=${tex(lineKey(P1,d1))}`} and ${m`\mathbf R(s)=\left\langle ${R.map(x=>tex(x)).join(',\\ ')}\right\rangle`} intersect at one point?`,opts,{kind:'expr',lv:2,
    how:'Solve two component equations for t and s, then force the third to match.',
    sol:[['Solve the two equations without a.',X`t=${t0},\qquad s=${s0}`],['The remaining component must agree.',X`a=${a}`]],chk:{op:'linemeet',n:{P1,d1,P2,d2,k}}});
});

/* line parallel to two planes through a point, hitting z = 0 — S2017-Q1 */
addX('x-line-par2','LINE',1,['S2017-Q1'],()=>{
  const n1=rv(3,-2,3), n2_=rv(3,-2,3), d=crossA(n1,n2_); if(!d[2]) return null;
  const P=rv(3,-4,4), t=Rr(-P[2],d[2]); if(t[1]>2) return null;
  const X0=P.map((x,j)=>Radd([x,1],Rmul(t,[d[j],1]))), S=a=>P3(...a.map(Rs));
  const alt=(dd,tt)=>P.map((x,j)=>Radd([x,1],Rmul(tt,[dd[j],1])));
  const s=addA(n1,n2_);
  const opts=xm({a:S(X0)},[{a:S(alt(d,Rneg(t))),why:'Sign slip solving z = 0.'},{a:S(s[2]?alt(s,Rr(-P[2],s[2])):P.map(x=>[x+1,1])),why:'Used n₁ + n₂; the direction must be n₁ × n₂ (parallel to both planes).'},
    {a:S(P.map((x,j)=>[j===2?0:x,1])),why:'Just set z = 0 in P; x and y change along the line.'},{a:S(alt([d[0],-d[1],d[2]],t)),why:'Sign slip on the j component of the cross product.'},{a:S(alt(d,Radd(t,[1,1]))),why:'Off by one in t.'}],{kind:'point'});
  return xq(`The line ${m`L`} is parallel to the planes ${mk(pn(n1,ri(-5,5)))} and ${mk(pn(n2_,ri(-5,5)))} and passes through ${mp(P)}. At what point does ${m`L`} intersect the plane ${m`z=0`}?`,opts,{kind:'point',lv:2,
    how:'Parallel to both planes ⇒ direction = n₁ × n₂; then set z = 0.',
    sol:[['Direction.',X`\mathbf n_1\times\mathbf n_2=${vt(d)}`],['Set z = 0.',X`${P[2]}+${fmtC(d[2])}t=0\quad\Rightarrow\quad t=${tex(Rs(t))}`],['Point.',tex(S(X0))]],
    chk:{op:'linepar2',n:{n1,n2:n2_,P}}});
});

/* ★ plane through a point perpendicular to two planes — S2019-Q2, S2020-Q2, F2019-Q1 */
addX('x-plane-perp2','PLANE',3,['S2019-Q2','S2020-Q2','F2019-Q1'],()=>{
  const n1=rv(3,-3,3), n2_=rv(3,-3,3), nn=reduceInt(crossA(n1,n2_)); if(!n2(nn)) return null;
  const P=rv(3,-3,3), d=dotA(nn,P), sc=pick([1,-1]);
  const E=(n,c)=>pn(n,c);
  const key=E(mulA(sc,nn),sc*d), s=addA(n1,n2_);
  const opts=xm({a:key},[{a:E(nn,-d||d+4),why:'Right normal, sign slip in the constant.'},{a:E([nn[0],-nn[1],nn[2]],dotA([nn[0],-nn[1],nn[2]],P)),why:'Sign slip on the j component of n₁ × n₂.'},
    {a:E(s,dotA(s,P)),why:'n₁ + n₂ is not perpendicular to both normals.'},{a:E(n1,dotA(n1,P)),why:'That plane is parallel to the first plane, not perpendicular to it.'},{a:E(nn,d+nn[0]),why:'Arithmetic slip in n · P.'}],{kind:'eq'});
  return xq(`Find the plane through ${mp(P)} that is perpendicular to both planes ${mk(E(n1,ri(-4,4)))} and ${mk(E(n2_,ri(-4,4)))}.`,opts,{kind:'eq',lv:2,
    how:'Perpendicular to both planes ⇒ its normal is ⟂ both normals ⇒ n = n₁ × n₂.',
    sol:[['Normal.',X`\mathbf n_1\times\mathbf n_2\parallel ${vt(nn)}`],['Through P.',tex(key)]],chk:{op:'planeperp2',n:{n1,n2:n2_,P}}});
});

/* plane through three points (or its normal) — F2016-Q1, S2023-Q1, S2022-Q7 */
addX('x-plane-3pts','PLANE',2,['F2016-Q1','S2023-Q1'],()=>{
  const P=rv(3,-3,3), Q=addA(P,rv(3,-3,3)), R=addA(P,rv(3,-3,3)), u=subA(Q,P), v=subA(R,P), nn=crossA(u,v); if(!n2(nn)) return null;
  const nr=reduceInt(nn), asknormal=coin(0.4);
  if(asknormal){
    const opts=xm({a:vint(mulA(pick([1,-1,2]),nr))},[{a:vint([nr[0],-nr[1],nr[2]]),why:'Sign slip on the j component.'},{a:vint(u),why:'PQ lies in the plane; it is not perpendicular to it.'},{a:vint(addA(u,v)),why:'PQ + PR also lies in the plane.'},
      {a:vint([u[0]*v[0],u[1]*v[1],u[2]*v[2]]),why:'Multiplied matching components; that is not a cross product.'},{a:vint(nr.slice().reverse()),why:'Components in the wrong order.'}],{kind:'vec'});
    return xq(`Which vector is perpendicular to the plane containing ${m`P${ptx(P)}`}, ${m`Q${ptx(Q)}`}, and ${m`R${ptx(R)}`}?`,opts,{kind:'vec',lv:1,
      how:'Normal = PQ × PR (any nonzero multiple).',sol:[['Two edges and their cross product.',X`\overrightarrow{PQ}\times\overrightarrow{PR}=${vt(u)}\times${vt(v)}=${vt(nn)}`]],chk:{op:'normal3',n:{P,Q,R}}});
  }
  const key=planeKey(nr,dotA(nr,P));
  const opts=xm({a:key},[{a:planeKey(u,dotA(u,P)),why:'Used PQ as the normal; the normal is PQ × PR.'},{a:planeKey(nr,-dotA(nr,P)||5),why:'Sign slip in the constant.'},
    {a:planeKey([nr[0],-nr[1],nr[2]],dotA([nr[0],-nr[1],nr[2]],P)),why:'Sign slip on the j component.'},{a:planeKey(nr,dotA(nr,Q)+1),why:'Arithmetic slip.'},{a:planeKey(P.some(x=>x)?P:[1,1,1],n2(P)||3),why:'Used a point as the normal.'}],{kind:'eq'});
  return xq(`Find an equation of the plane containing ${m`P${ptx(P)}`}, ${m`Q${ptx(Q)}`}, and ${m`R${ptx(R)}`}.`,opts,{kind:'eq',lv:2,
    how:'Normal = PQ × PR; plug in P.',sol:[['Normal.',X`\overrightarrow{PQ}\times\overrightarrow{PR}=${vt(nn)}`],['Plane through P.',tex(key)]],chk:{op:'plane3',n:{P,Q,R}}});
});

/* plane through a point parallel to two vectors — F2024-Q11 */
addX('x-plane-2vec','PLANE',1,['F2024-Q11'],()=>{
  const u=rv(3,-2,2), v=rv(3,-2,2), nn=reduceInt(crossA(u,v)); if(!n2(nn)) return null;
  const P=rv(3,-2,3), d=dotA(nn,P), key=planeKey(nn,d);
  const opts=xm({a:key},[{a:planeKey(nn,d+2),why:'Arithmetic slip in n · P.'},{a:planeKey([nn[0],-nn[1],nn[2]],dotA([nn[0],-nn[1],nn[2]],P)),why:'Sign slip on the j component of u × v.'},
    {a:planeKey(nn,0),why:'That plane is parallel but passes through the origin, not the point.'},{a:planeKey(addA(u,v),dotA(addA(u,v),P)),why:'u + v lies in the plane; it is not the normal.'},{a:planeKey(u,dotA(u,P)),why:'u lies in the plane; the normal is u × v.'}],{kind:'eq'});
  return xq(`Find the plane containing ${mp(P)} and parallel to each of ${m`${vt(u)}`} and ${m`${vt(v)}`}.`,opts,{kind:'eq',lv:1,
    how:'The normal is perpendicular to both direction vectors: n = u × v.',sol:[['Normal.',X`${vt(u)}\times${vt(v)}\parallel ${vt(nn)}`],['Through the point.',tex(key)]],chk:{op:'planevec',n:{u,v,P}}});
});

/* plane containing a coordinate axis and a point — S2023-Q3 */
addX('x-plane-axis','PLANE',1,['S2023-Q3'],()=>{
  const i=ri(0,2), P=rv(3,-4,4,true), e=[0,0,0]; e[i]=1; const nn=reduceInt(crossA(e,P)); if(!n2(nn)) return null;
  const j=[0,1,2].filter(t=>t!==i), u=j[0], w=j[1];              /* plane: nn[u]·U + nn[w]·W = 0 */
  if(!nn[w]) return null;
  const Q=rv(3,-5,5); const aV=Rr(-nn[u]*Q[u],nn[w]); if(aV[1]!==1) return null;
  const a=aV[0], show=Q.map((x,t)=>t===w?'a':String(x));
  const opts=xm(xnum(a),[{a:String(-a),why:'Sign slip.'},{a:String(nn[w]?Rr(-nn[w]*Q[u],nn[u]||1)[0]:a+1),why:'Set up the ratio upside down.'},{a:String(P[w]),why:'That is P’s coordinate, not a.'},
    {a:String(a+Q[u]),why:'Arithmetic slip.'},{a:String(a*2||3),why:'Doubled the ratio.'}]);
  return xq(`The plane ${m`K`} contains the ${AX[i]}-axis and the point ${mp(P)}. If ${m`K`} also contains the point ${m`(${show.join(',\\ ')})`}, what is ${m`a`}?`,opts,{kind:'expr',lv:2,
    how:'The plane contains the axis direction e and the point P, so n = e × P; plug in the third point.',
    sol:[['Normal.',X`\mathbf n=\mathbf e_{${AX[i]}}\times${vt(P)}\parallel ${vt(nn)}`],['Plane through the origin: n · (x, y, z) = 0; substitute the point.',X`a=${a}`]],chk:{op:'planeaxis2',n:{i,P,Q,w}}});
});

/* angle between planes — F2016-Q2, F2015-Q1 */
addX('x-plane-angle','PLANE',1,['F2016-Q2','F2015-Q1'],()=>{
  const e=pick(NICE_ANG.filter(x=>x[0].length===3&&x[2]!=='0'&&x[2]!=='pi'&&x[2]!=='pi/2')), [n1,n2_]=orthoScramble(e[0],e[1]);
  const ac={'pi/4':'pi/4','pi/3':'pi/3','2pi/3':'pi/3','3pi/4':'pi/4'}[e[2]];
  const opts=xm({a:ac},['0','pi/6','pi/4','pi/3','pi/2','2pi/3','3pi/4','5pi/6'].filter(x=>x!==ac).map(x=>({a:x,why:x==='pi/2'?'The normals are not perpendicular.':/2pi\/3|3pi\/4|5pi\/6/.test(x)?'That angle is obtuse; use |n₁ · n₂| for the angle between planes.':'Recompute cos θ = |n₁ · n₂|/(|n₁||n₂|).'})));
  return xq(`The angle (in radians) between the planes ${mk(pn(n1,ri(-5,5)))} and ${mk(pn(n2_,ri(-5,5)))} is`,opts,{kind:'expr',lv:1,
    how:'cos θ = |n₁ · n₂| / (|n₁||n₂|).',sol:[['Normals and the cosine.',X`\cos\theta=\frac{|${dotA(n1,n2_)}|}{\sqrt{${n2(n1)}}\sqrt{${n2(n2_)}}}\quad\Rightarrow\quad\theta=${tex(ac)}`]],chk:{op:'planeangle',e:{u:vint(n1),v:vint(n2_)}}});
});

/* plane through a point parallel to a plane, where it hits an axis — S2016-Q2 */
addX('x-plane-par-axis','PLANE',1,['S2016-Q2'],()=>{
  const n=rv(3,-3,3,true), P=rv(3,-3,3), i=ri(0,2), d=dotA(n,P); const v=Rr(d,n[i]);
  const pt=r=>P3(...[0,1,2].map(j=>j===i?Rs(r):'0'));
  const opts=xm({a:pt(v)},[{a:pt(Rneg(v)),why:'Sign slip.'},{a:pt(Rr(ri(-5,5)||1,n[i])),why:'Kept the old plane’s constant; recompute d from the new point.'},{a:pt(Rr(n[i],d||1)),why:'Inverted the fraction.'},
    {a:pt(Rr(d+n[i],n[i])),why:'Arithmetic slip in n · P.'},{a:pt([P[i],1]),why:'That is P’s coordinate.'}],{kind:'point'});
  return xq(`The plane through ${mp(P)} parallel to the plane ${mk(pn(n,ri(-6,6)))} intersects the ${AX[i]}-axis at`,opts,{kind:'point',lv:1,
    how:'Same normal, new constant d = n · P; on the axis the other two coordinates are 0.',
    sol:[['Plane.',tex(pn(n,d))],[`Set the other coordinates to 0.`,X`${AX[i]}=${tex(Rs(v))}`]],chk:{op:'planeparaxis',n:{n,P,i}}});
});

/* ★ vector projection — S2024-Q6, S2025-Q10 */
addX('x-vec-proj','VEC',3,['S2024-Q6','S2025-Q10'],()=>{
  const u=rv(3,-4,4), w=rv(3,-3,3), d=dotA(u,w), s=n2(w), su=n2(u); if(!d||!s) return null;
  const F=(c,v)=>`${c}*${vint(v)}`, fr=(p,q)=>frac(p,q);
  const opts=xm({a:F(fr(d,s),w)},[{a:F(fr(d,su),u),why:'That is the projection of w onto u (roles swapped).'},{a:F(fr(d,su),w),why:'Divided by |u|²; divide by |w|² when projecting onto w.'},
    {a:F(fr(d,s),u),why:'The projection points along w, not u.'},{a:`1/sqrt(${s})*${vint(w)}`,why:'That is just the unit vector of w.'},{a:F(fr(-d,s),w),why:'Sign slip in u · w.'},{a:F(rsq(d,s),w),why:'Divided by |w| instead of |w|².'}],{kind:'vec'});
  return xq(`Compute ${m`\operatorname{proj}_{\mathbf w}\mathbf u`} for ${m`\mathbf w=${vt(w)}`} and ${m`\mathbf u=${vt(u)}`}.`,opts,{kind:'vec',lv:1,
    how:'proj_w u = (u · w / |w|²) w',sol:[['Dot product and |w|².',X`\mathbf u\cdot\mathbf w=${d},\qquad |\mathbf w|^2=${s}`],['',X`\operatorname{proj}_{\mathbf w}\mathbf u=\frac{${d}}{${s}}${vt(w)}`]],
    chk:{op:'proj',e:{u:vint(u),v:vint(w)},n:{scal:0}}});
});

/* true/false triple — S2023-Q2, S2015-Q8 style */
const VTF=[[1,'\\((\\mathbf u\\times\\mathbf v)\\cdot\\mathbf v=0\\) for every \\(\\mathbf u,\\mathbf v\\).'],[1,'The projection of \\(\\mathbf u\\) onto \\(\\mathbf v\\) equals the projection of \\(\\mathbf u\\) onto \\(2\\mathbf v\\).'],
  [0,'\\((\\mathbf i+\\mathbf j)\\times(\\mathbf i-\\mathbf j)=\\mathbf 0\\).'],[1,'\\((\\mathbf i+\\mathbf j)\\times(\\mathbf i-\\mathbf j)=-2\\mathbf k\\).'],[0,'\\(\\mathbf u\\times\\mathbf v=\\mathbf v\\times\\mathbf u\\) for every \\(\\mathbf u,\\mathbf v\\).'],
  [1,'\\(\\mathbf u\\times\\mathbf u=\\mathbf 0\\) for every \\(\\mathbf u\\).'],[0,'If \\(\\mathbf u\\cdot\\mathbf v=0\\), then \\(\\mathbf u=\\mathbf 0\\) or \\(\\mathbf v=\\mathbf 0\\).'],[1,'\\(|\\mathbf u\\times\\mathbf v|^2+(\\mathbf u\\cdot\\mathbf v)^2=|\\mathbf u|^2|\\mathbf v|^2\\).'],
  [0,'\\((\\mathbf u\\times\\mathbf v)\\times\\mathbf w=\\mathbf u\\times(\\mathbf v\\times\\mathbf w)\\) for every \\(\\mathbf u,\\mathbf v,\\mathbf w\\).'],[0,'The projection of \\(\\mathbf u\\) onto \\(2\\mathbf v\\) is twice the projection of \\(\\mathbf u\\) onto \\(\\mathbf v\\).'],
  [1,'\\(\\mathbf u\\cdot(\\mathbf v\\times\\mathbf w)=(\\mathbf u\\times\\mathbf v)\\cdot\\mathbf w\\).'],[0,'\\(|\\mathbf u+\\mathbf v|=|\\mathbf u|+|\\mathbf v|\\) for every \\(\\mathbf u,\\mathbf v\\).'],[1,'\\(\\mathbf i\\times(\\mathbf j\\times\\mathbf k)=\\mathbf 0\\).'],[0,'\\(\\mathbf i\\times\\mathbf j=-\\mathbf k\\).']];
addX('x-vec-tf','VEC',1,['S2023-Q2'],()=>{
  const S=shuf(VTF).slice(0,3), truth=S.map(s=>s[0]);
  const txt=t=>{ const T=[0,1,2].filter(i=>t[i]).map(i=>['(I)','(II)','(III)'][i]), F=[0,1,2].filter(i=>!t[i]).map(i=>['(I)','(II)','(III)'][i]);
    return !F.length?'All three are true':!T.length?'All three are false':`${T.join(' and ')} ${T.length>1?'are':'is'} true; ${F.join(' and ')} ${F.length>1?'are':'is'} false`; };
  const combos=[...Array(8).keys()].map(b=>[b&4?1:0,b&2?1:0,b&1?1:0]).filter(c=>c.join()!==truth.join());
  const opts=xm({h:txt(truth)},shuf(combos).map(c=>({h:txt(c),why:'Check each statement separately; at least one of these is judged wrong.'})));
  return xq(`Determine which statements are true.<br>(I) ${S[0][1]}<br>(II) ${S[1][1]}<br>(III) ${S[2][1]}`,opts,{kind:'choice',lv:2,
    how:'Test each statement on its own with the definitions (cross product ⟂ both factors, anticommutative; projection depends only on the direction of v).',
    sol:S.map((s,i)=>[`${['(I)','(II)','(III)'][i]} is ${s[0]?'true':'false'}.`,'']),chk:{op:'manual'}});
});

/* triangle area — S2018-Q4 */
addX('x-vec-area','VEC',1,['S2018-Q4'],()=>{
  const P=rv(3,-2,3), u=rv(3,-3,3), v=rv(3,-3,3), Q=addA(P,u), R=addA(P,v), c=crossA(u,v), s=n2(c); if(!s||s>500) return null;
  const opts=xm({a:surd(1,2,s)},[{a:sqrtS(s),why:'That is the parallelogram; the triangle is half.'},{a:frac(s,2),why:'Forgot the square root.'},{a:surd(1,2,n2(u)*n2(v)),why:'½|PQ||PR| is only right for a right angle at P.'},
    {a:surd(1,2,s+2),why:'Arithmetic slip in the cross product.'},{a:frac(Math.abs(dotA(u,v))||3,2),why:'Used the dot product.'}]);
  return xq(`Find the area of the triangle with vertices ${m`P${ptx(P)}`}, ${m`Q${ptx(Q)}`}, ${m`R${ptx(R)}`}.`,opts,{kind:'expr',lv:1,
    how:'Area = ½|PQ × PR|.',sol:[['Cross product.',X`\overrightarrow{PQ}\times\overrightarrow{PR}=${vt(c)}`],['Half its length.',X`\tfrac12\sqrt{${s}}=${tex(surd(1,2,s))}`]],chk:{op:'area',e:{u:vint(u),v:vint(v)},n:{tri:1}}});
});

/* perpendicular for which x — S2016-Q1 */
addX('x-vec-perpx','VEC',1,['S2016-Q1'],()=>{
  const r1=nz(-4,4), r2=nz(-4,4); if(r1===r2||r1+r2===0) return null;
  /* ⟨x², a, b⟩ · ⟨1, c x, d⟩ = x² + ac x + bd, with ac = −(r1+r2), bd = r1 r2 */
  const S=-(r1+r2), Pp=r1*r2; const c=pick([1,-1,5,-5].filter(k=>S%k===0)); const a=S/c; const d=pick([1,2,3,-1,-2].filter(k=>Pp%k===0)); const b=Pp/d;
  const pr=(p,q)=>{ const s=[p,q].sort((x,y)=>x-y); return `\\(${s[0]},\\ ${s[1]}\\)`; };
  const opts=xm({h:pr(r1,r2)},[{h:pr(-r1,-r2),why:'Sign slip factoring the quadratic.'},{h:pr(0,r1+r2),why:'Dropped the constant term b·d.'},{h:pr(r1,-r2),why:'Factoring slip.'},{h:pr(0,r1),why:'x = 0 does not satisfy the equation.'},{h:pr(r1*2,r2*2),why:'Solved x² + ac·x + bd = 0 incorrectly.'}]);
  return xq(`Find the two values of ${m`x`} for which ${m`\langle x^2,\ ${a},\ ${b}\rangle`} and ${m`\langle 1,\ ${c===1?'':c===-1?'-':c}x,\ ${d}\rangle`} are perpendicular.`,opts,{kind:'choice',lv:1,
    how:'Perpendicular ⇔ dot product = 0; solve the quadratic.',sol:[['Dot product = 0.',X`x^2+${fmtC(a*c)}x+${fmtC(b*d)}=0`],['Factor.',X`(x-${fmtC(r1)})(x-${fmtC(r2)})=0`]],chk:{op:'perpx',n:{a,b,c,d,r:[r1,r2]}}});
});

/* cos of the angle between u×v and w — S2015-Q1 */
addX('x-vec-cosang','VEC',1,['S2015-Q1'],()=>{
  const u=rv(3,-2,2), v=rv(3,-2,2), w=rv(3,-2,2), c=crossA(u,v); if(!n2(c)||!dotA(c,w)) return null;
  const d=dotA(c,w), A=n2(c)*n2(w), key=surd(d,A,A);
  const opts=xm({a:key},[{a:surd(-d,A,A),why:'Sign slip in the cross product.'},{a:surd(dotA(u,w)||1,n2(u)*n2(w),n2(u)*n2(w)),why:'Used u instead of u × v.'},{a:frac(d,A),why:'Divided by the product of squared lengths.'},
    {a:surd(dotA([c[0],-c[1],c[2]],w)||2,A,A),why:'Sign slip on the j component of u × v.'},{a:surd(d,n2(c),n2(c)),why:'Forgot to divide by |w|.'}]);
  return xq(`Find ${m`\cos\theta`}, where ${m`\theta`} is the angle between ${m`\mathbf u\times\mathbf v`} and ${m`\mathbf w`}, for ${m`\mathbf u=${vt(u)}`}, ${m`\mathbf v=${vt(v)}`}, ${m`\mathbf w=${vt(w)}`}.`,opts,{kind:'expr',lv:2,
    how:'Compute u × v, then cos θ = (u×v)·w / (|u×v||w|).',sol:[['Cross product.',X`\mathbf u\times\mathbf v=${vt(c)}`],['',X`\cos\theta=\frac{${d}}{\sqrt{${n2(c)}}\sqrt{${n2(w)}}}=${tex(key)}`]],chk:{op:'cosang',e:{u:vint(u),v:vint(v),w:vint(w)}}});
});
