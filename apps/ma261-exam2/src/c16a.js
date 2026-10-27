
/* =====================================================================
   15.8 LAGRANGE · 16.1–16.2 DOUBLE INTEGRALS · ORDER OF INTEGRATION · 16.3 POLAR
   ===================================================================== */
const sgnTex=(c,v,first)=>c===0?'':(c<0?'-':first?'':'+')+(Math.abs(c)===1?'':Math.abs(c))+v;
const linTex=(cs,vs)=>{ let s='',f=true; cs.forEach((c,i)=>{ if(c){ s+=sgnTex(c,vs[i],f); f=false; } }); return s||'0'; };
const linKey=(cs,vs)=>sumS(cs.map((c,i)=>mono(c,{[vs[i]]:1})));

/* ---------- 15.8: linear f on an ellipse (F2022-Q2, S2018-Q1, F2023-Q1) ---------- */
function P_lagrEll(hard){
  for(;;){
    const p=pick([1,1,2,3,4]), q=pick([1,2,3,4]), a=nz(-4,4), b=nz(-4,4), k=hard?nz(-5,5):pick([0,0,ri(-4,4)]);
    if(p===q&&!hard&&coin(0.5)) continue;
    const c=pick([1,2,3,4,6,8,12,24].filter(x=>x%p===0||x%q===0||x<=6));
    const S=Rr(c*(a*a*q+b*b*p),p*q);                    /* max of ax + by is √S */
    const sS=surd(1,S[1],S[0]*S[1]);                      /* √(S₀/S₁) */
    if(!fin(sS)||val(sS)>40) continue;
    const want=pick(hard?['range','max','min']:['max','max','min']);
    const kS=String(k), add=x=>k===0?x:sumS([kS,x]);
    const M=add(sS), m=add('-'+sS), R2=term([2,1],sS);
    const ans=want==='max'?M:want==='min'?m:R2;
    const circle=surd(1,Math.min(p,q),c*(a*a+b*b)*Math.min(p,q)), inv=surd(1,1,c*(a*a*p+b*b*q)), noroot=frac(S[0],S[1]);
    const f=sumS([k?kS:'0',mono(a,{x:1}),mono(b,{y:1})]), g=sumS([mono(p,{x:2}),mono(q,{y:2})]);
    const ask=want==='max'?'the maximum value':want==='min'?'the minimum value':'\\(M-m\\), where \\(M\\) and \\(m\\) are the maximum and minimum values,';
    const dis=[D_(want==='max'?m:M,want==='max'?'That is the other extreme value: the minimum.':'That is the maximum, not the minimum.'),
      D_(add(noroot),'Forgot the square root: the extreme values are ±√(c(a²/p + b²/q)).'),
      D_(add(inv),'Swapped the weights: the critical point has x = a/(2λp), y = b/(2λq), so a² is divided by p, not multiplied.'),
      D_(add(circle),'Treated the ellipse like a circle of radius √(c/p).'),
      D_(want==='range'?sS:R2,want==='range'?'That is M alone; the question asks for M − m.':'That is M − m, the distance between the two extreme values.'),
      D_(want==='range'?term([2,1],noroot):sumS([kS,term([1,2],sS)]),want==='range'?'Forgot the square root before doubling.':'Halved the extreme value: λ cancels completely; nothing is halved.')];
    return valQ(`Find ${ask} of \\(f(x,y)=${T(f)}\\) subject to the constraint \\(${T(g)}=${c}\\).`,ans,dis,
      'Solve ∇f = λ∇g with g = c; for a linear f on an ellipse the extremes are ±√(c(a²/p + b²/q)) plus the constant.',
      [['Lagrange conditions.',`${a}=2\\lambda(${p})x,\\quad ${b}=2\\lambda(${q})y\\quad\\Rightarrow\\quad x=\\frac{${a}}{${2*p}\\lambda},\\ y=\\frac{${b}}{${2*q}\\lambda}`],
       ['Into the constraint, then into \\(f\\): \\(ax+by=\\pm\\sqrt{c\\left(\\tfrac{a^2}{p}+\\tfrac{b^2}{q}\\right)}\\).',`ax+by=\\pm\\sqrt{${c}\\left(\\tfrac{${a*a}}{${p}}+\\tfrac{${b*b}}{${q}}\\right)}=\\pm ${T(sS)}`],
       ['',`M=${T(M)},\\qquad m=${T(m)}`]],
      {op:'lagr',f,g,c:String(c),vars:['x','y'],want},hard?3:2);
  }
}
/* ---------- 15.8: linear f on a sphere, possibly off-centre (S2025-Q12, S2023-Q3, S2019-Q1, F2017-Q1) ---------- */
function P_lagrSphere(){
  const trip=pick([[1,2,2,3],[2,3,6,7],[1,4,8,9],[4,4,7,9],[2,6,9,11],[2,1,2,3]]);
  const s=[0,1,2].map(()=>pick([1,-1])), [a,b,c]=[0,1,2].map(i=>trip[i]*s[i]), N=trip[3];
  const R=pick([1,2,3]), h=pick([0,0,ri(-2,2)]), want=pick(['max','max','min','range']);
  const center=a*h, M=String(center+R*N), m=String(center-R*N);
  const ans=want==='max'?M:want==='min'?m:String(2*R*N);
  const f=sumS([mono(a,{x:1}),mono(b,{y:1}),mono(c,{z:1})]), g=h?`(x - ${h})^2 + y^2 + z^2`.replace('- -','+ '):`x^2 + y^2 + z^2`;
  const gT=h?`(x${h<0?'+':'-'}${Math.abs(h)})^2+y^2+z^2`:'x^2+y^2+z^2';
  const ask=want==='max'?'the maximum value':want==='min'?'the minimum value':'the difference between the maximum and minimum values';
  const dis=[D_(String(R*N+(want==='min'?0:0)*1)+'',h?'Left out the centre: f at the centre (h, 0, 0) is a·h, and the extremes are a·h ± R|∇f|.':'That is R|∇f|; the question asks for the other value.'),
    D_(String(center+R*R*N),'Used R² instead of R: the farthest point is R units from the centre along ∇f.'),
    D_(String(center+R*(Math.abs(a)+Math.abs(b)+Math.abs(c))),'Added |a| + |b| + |c|: the length of ⟨a, b, c⟩ is √(a² + b² + c²).'),
    D_(String(center+N),'Forgot the radius: |∇f| alone is the rate, not the extreme value.'),
    D_(want==='max'?m:M,want==='max'?'That is the minimum.':'That is the maximum.'),
    D_(String(R*N*(want==='range'?1:2)),want==='range'?'That is half the range: max − min = 2R|∇f|.':'That is max − min.'),
    D_(String(center+R*N*N),'Squared |∇f|.')];
  return valQ(`Find ${ask} of \\(f(x,y,z)=${T(f)}\\) on the sphere \\(${gT}=${R*R}\\).`,ans,dis,
    'For a linear f the extremes on a sphere are at centre ± R·∇f/|∇f|: f(centre) ± R|∇f|.',
    [['∇f = λ∇g says ⟨a, b, c⟩ is parallel to the radius, so the extreme points are the centre ± R times the unit vector of ∇f.',`|\\nabla f|=\\sqrt{${a*a}+${b*b}+${c*c}}=${N},\\qquad f(\\text{centre})=${center}`],
     ['',`M=${center}+${R}\\cdot ${N}=${T(M)},\\qquad m=${center}-${R}\\cdot ${N}=${T(m)}`]],
    {op:'lagr',f,g,c:String(R*R),vars:['x','y','z'],want},2);
}
/* ---------- 15.8: quadratic form on a circle ---------- */
function P_lagrQuad(){
  const a=ri(1,5), b=pick([2,4,6,-2,-4,-6,8]), R=pick([1,2,3]), R2=R*R, want=pick(['max','min','range']);
  const M=R2*(a+Math.abs(b)/2), m=R2*(a-Math.abs(b)/2), ans=String(want==='max'?M:want==='min'?m:M-m);
  const f=sumS([mono(a,{x:2}),mono(b,{x:1,y:1}),mono(a,{y:2})]);
  const ask=want==='max'?'the maximum value':want==='min'?'the minimum value':'the maximum value minus the minimum value';
  const dis=[D_(String(a*R2),'Only checked the points on the axes, where xy = 0.'),D_(String(R2*(a+Math.abs(b))),'Used xy ≤ R²; on the circle the largest xy is R²/2 (at 45°).'),
    D_(String(R*(a+Math.abs(b)/2)),'Used R instead of R²: f is quadratic.'),D_(String(want==='max'?m:M),'That is the other extreme value.'),
    D_(String(R2*Math.abs(b)*2),'Doubled the spread: max − min = |b|R².'),D_(String(R2*(2*a+Math.abs(b))),'Added both squares at full size: x² + y² = R² already.')];
  return valQ(`Find ${ask} of \\(f(x,y)=${T(f)}\\) on the circle \\(x^2+y^2=${R2}\\).`,ans,dis,
    'On x² + y² = R²: f = aR² + b·xy, and xy ranges over [−R²/2, R²/2] (x = R cos t, y = R sin t gives xy = (R²/2) sin 2t).',
    [['On the circle the squares add to \\(R^2\\).',`f=${a}(x^2+y^2)${b<0?'':'+'}${b}xy=${a*R2}${b<0?'':'+'}${b}xy`],['With \\(x=R\\cos t,\\ y=R\\sin t\\): \\(xy=\\tfrac{R^2}{2}\\sin 2t\\in\\left[-\\tfrac{R^2}{2},\\tfrac{R^2}{2}\\right]\\).',`M=${M},\\qquad m=${m}`]],
    {op:'lagr',f,g:'x^2 + y^2',c:String(R2),vars:['x','y'],want},2);
}
/* ---------- 15.8: closest point on a plane (S2023-Q4, F2018-Q1) ---------- */
function P_lagrDist(){
  for(;;){
    const n=[nz(-3,3),nz(-3,3),pick([1,1,2,-1])], P=[ri(-2,3),ri(-2,3),ri(-2,3)], d=ri(-6,8), nn=n2(n), t=Rr(d-dotA(n,P),nn);
    if(t[0]===0) continue;
    const foot=P.map((x,i)=>Radd([x,1],Rmul(t,[n[i],1]))), idx=pick([0,1,2]), V='xyz'[idx];
    const ans=Rs(foot[idx]);
    if(ans===String(P[idx])) continue;
    const plane=pn(n,d), dist2=Rmul(Rmul(t,t),[nn,1]);
    const dis=[D_(Rs(Radd([P[idx],1],Rmul(t,[-n[idx],1]))),'Moved the wrong way along the normal: the foot is P + t n with t = (d − n·P)/|n|².'),
      D_(Rs(t),'That is t, the multiple of the normal, not the coordinate.'),D_(Rs(Rr(d,n[idx])),'That is the plane\'s intercept on this axis, not the closest point.'),
      D_(Rs(dist2),'That is the squared distance, not a coordinate.'),D_(Rs(Radd([P[idx],1],[n[idx]*(d-dotA(n,P)),1])),'Forgot to divide by |n|².'),
      D_(String(P[idx]),'That is the coordinate of the given point itself.')];
    return valQ(`The point on the plane \\(${T(plane)}\\) closest to \\(${ptx(P)}\\) has \\(${V}\\)-coordinate equal to`,ans,dis,
      'Minimize the squared distance with ∇(dist²) = λ∇g: the closest point is P + t n, with t chosen to land on the plane.',
      [['Lagrange: \\(2(\\mathbf x-P)=\\lambda\\mathbf n\\), so \\(\\mathbf x=P+t\\mathbf n\\).',`\\mathbf n=${vt(n)},\\quad \\mathbf n\\cdot(P+t\\mathbf n)=${d}\\ \\Rightarrow\\ t=\\frac{${d}-(${dotA(n,P)})}{${nn}}=${T(Rs(t))}`],
       ['',`${V}=${P[idx]}+(${T(Rs(t))})(${n[idx]})=${T(ans)}`]],
      {op:'distfoot',n,d,P,idx},2);
  }
}
/* ---------- 15.8: biggest box under a plane ---------- */
function P_lagrBox(){
  const a=pick([1,2,3,4,6]), b=pick([2,3,4,6]), c=pick([1,2,3,6,9]), ans=Rs(Rr(a*b*c,27));
  const dis=[D_(Rs(Rr(a*b*c,8)),'Used halves: each coordinate of the best corner is one third of its intercept.'),D_(Rs(Rr(a*b*c,6)),'That is the volume of the tetrahedron under the plane.'),
    D_(Rs(Rr(a*b*c,9)),'Used the constraint value 1/3 for two coordinates only.'),D_(Rs(Rr(a*b*c,3)),'Divided by 3 once instead of once per coordinate.'),D_(String(a*b*c),'That is the product of the intercepts.'),
    D_(Rs(Rr(a*b*c,81)),'Divided by 3 four times.')];
  const plane=`\\frac{x}{${a}}+\\frac{y}{${b}}+\\frac{z}{${c}}=1`.replace('\\frac{x}{1}','x');
  return valQ(`A rectangular box in the first octant has three faces on the coordinate planes and the opposite vertex on the plane \\(${plane}\\). What is the largest possible volume?`,ans,dis,
    'Maximize V = xyz subject to x/a + y/b + z/c = 1: Lagrange gives x/a = y/b = z/c = 1/3.',
    [['\\(\\nabla(xyz)=\\lambda\\nabla g\\): \\(yz=\\lambda/a,\\ xz=\\lambda/b,\\ xy=\\lambda/c\\). Multiply by \\(x,y,z\\): \\(x/a=y/b=z/c\\).',`\\frac{x}{${a}}=\\frac{y}{${b}}=\\frac{z}{${c}}=\\frac13`],
     ['',`V=\\frac{${a}}{3}\\cdot\\frac{${b}}{3}\\cdot\\frac{${c}}{3}=${T(ans)}`]],
    {op:'lagr',f:'x*y*z',g:`x/${a} + y/${b} + z/${c}`,c:'1',vars:['x','y','z'],want:'max',pos:true},2);
}
/* ---------- 15.8: the multiplier itself (S2017-Q1) ---------- */
function P_lagrLambda(){
  const [p,q,h]=pick([[3,4,5],[6,8,10],[5,12,13],[8,6,10]]), a=p*pick([1,-1]), b=q*pick([1,-1]), R=pick([1,2,5]);
  const ans=Rs(Rr(h,2*R)), f=linKey([a,b],['x','y']);
  const dis=[D_(Rs(Rr(h,R)),'Dropped the 2 in ∇g = ⟨2x, 2y⟩.'),D_(Rs(Rr(-h,2*R)),'That is λ at the minimum.'),D_(Rs(Rr(R,2*h)),'Inverted λ.'),D_(String(h*R),'That is the maximum value of f, not λ.'),
    D_(Rs(Rr(h,2*R*R)),'Used R² for the size of (x, y) at the maximum.'),D_(Rs(Rr(h*R,2)),'Multiplied by R instead of dividing.')];
  return valQ(`When Lagrange multipliers are used to maximize \\(f(x,y)=${T(f)}\\) on \\(x^2+y^2=${R*R}\\) (with \\(\\nabla f=\\lambda\\nabla g\\), \\(g=x^2+y^2\\)), what is \\(\\lambda\\) at the point where the maximum occurs?`,ans,dis,
    '∇f = λ∇g: ⟨a, b⟩ = 2λ⟨x, y⟩. At the maximum (x, y) = R⟨a, b⟩/|⟨a, b⟩|, so λ = |⟨a, b⟩|/(2R).',
    [['',`\\langle ${a},${b}\\rangle=2\\lambda\\langle x,y\\rangle,\\qquad (x,y)_{\\max}=\\frac{${R}}{${h}}\\langle ${a},${b}\\rangle`],['',`\\lambda=\\frac{${a}}{2x}=\\frac{${h}}{2\\cdot ${R}}=${T(ans)}`]],
    {op:'lagrlam',f,g:'x^2 + y^2',c:String(R*R),vars:['x','y']},2);
}
/* ---------- 16.1: product integrand over a rectangle (S2025-Q3, F2022-Q3, F2019-Q2) ---------- */
const XPART=[
  {f:'x/(1 + x^2)',ft:'\\frac{x}{1+x^2}',lo:'0',hi:'1',v:'ln(2)/2',t:'\\tfrac12\\ln 2',bad:[['ln(2)','Forgot the ½ from u = 1 + x², du = 2x dx.'],['pi/4','Integrated 1/(1 + x²) (arctan) instead of x/(1 + x²).']]},
  {f:'x/(1 + x^2)',ft:'\\frac{x}{1+x^2}',lo:'0',hi:'sqrt(3)',v:'ln(2)',t:'\\tfrac12\\ln 4=\\ln 2',bad:[['ln(4)','Forgot the ½ from u = 1 + x².'],['pi/3','Integrated 1/(1 + x²) (arctan) instead.']]},
  {f:'x*e^(x^2)',ft:'xe^{x^2}',lo:'0',hi:'1',v:'(e - 1)/2',t:'\\tfrac12(e-1)',bad:[['e - 1','Forgot the ½ from u = x².'],['e/2','Dropped the lower limit: e⁰ = 1 must be subtracted.']]},
  {f:'cos(x)',ft:'\\cos x',lo:'0',hi:'pi/2',v:'1',t:'1',bad:[['0','Evaluated −sin instead of sin: sin(π/2) − sin 0 = 1.'],['pi/2','Treated cos x as 1.']]},
  {f:'sin(x)',ft:'\\sin x',lo:'0',hi:'pi',v:'2',t:'2',bad:[['0','Got cos π − cos 0 with the wrong sign: −cos x from 0 to π is 2.'],['1','Integrated over half the interval.']]}
];
function P_dblRect(){
  for(;;){
    const X0=pick(XPART), k=pick([1,2,3,4,6]), m=pick([1,2,2,3]), sym=coin(0.55), Y=pick([1,2,3]), y0=sym?-Y:0, y1=Y;
    const Yint=Rr(Math.pow(y1,m+1)-Math.pow(y0,m+1),m+1), zero=Yint[0]===0;
    const Ydbl=Rr(2*Math.pow(Y,m+1),m+1), Yhalf=Rr(Math.pow(Y,m+1),m+1);
    const ans=zero?'0':`${term([k*Yint[0],Yint[1]],'1')}*(${X0.v})`;
    const yT=m===1?'y':`y^{${m}}`, integrand=`${k===1?'':k}\\,${X0.ft}\\,${yT}`, full=`${k}*(${X0.f})*y^${m}`;
    const KY=r=>term([k*r[0],r[1]],'1');
    const dis=zero?[D_(`${KY(Ydbl)}*(${X0.v})`,'Treated y^'+m+' as even: an odd power over [−'+Y+', '+Y+'] integrates to 0, and so does the whole integral.'),
        D_(`${KY(Yhalf)}*(${X0.v})`,'Integrated y only over [0, '+Y+'].'),D_(`${k}*(${X0.v})`,'Dropped the y-integral: it is not 1.'),
        ...X0.bad.filter(([v])=>v!=='0').map(([v,w])=>D_(`${KY(Ydbl)}*(${v})`,'The y-part already makes this 0. (Also: '+w+')')),D_(`${2*k*Y}*(${X0.v})`,'Used the interval length 2·'+Y+' for the y-integral.')]
      :[D_('0','Only odd powers of y vanish on a symmetric interval; y^'+m+' does not.'),...X0.bad.map(([v,w])=>D_(`${KY(Yint)}*(${v})`,w)),
        D_(`${KY(Rr(Yint[0],Yint[1]*(m+1)))}*(${X0.v})`,'Divided by m + 1 twice in the y-integral.'),D_(`${k*(y1-y0)}*(${X0.v})`,'Used the interval length for the y-integral, as if the integrand did not depend on y.'),
        D_(`${KY(Rr(Math.pow(y1,m)-Math.pow(y0,m),1))}*(${X0.v})`,'Did not raise the power when integrating y^'+m+'.')];
    const xr=`${T(X0.lo)}\\le x\\le ${T(X0.hi)}`, yr=`${y0}\\le y\\le ${y1}`;
    const o=valQ(`Evaluate \\(\\displaystyle\\iint_R ${integrand}\\,dA\\), where \\(R=\\{(x,y):\\ ${xr},\\ ${yr}\\}\\).`,ans,dis,
      'The integrand is g(x)·h(y) on a rectangle, so the double integral is the product of two single integrals.',
      [['Separate the integral.',`\\iint_R=${k}\\left(\\int_{${T(X0.lo)}}^{${T(X0.hi)}}${X0.ft}\\,dx\\right)\\left(\\int_{${y0}}^{${y1}}${yT}\\,dy\\right)`],
       ['',`\\int ${X0.ft}\\,dx=${X0.t},\\qquad \\int_{${y0}}^{${y1}}${yT}\\,dy=${T(Rs(Yint))}`],['',`\\iint_R=${T(ans)}`]],
      CI(full,[['y',String(y0),String(y1)],['x',X0.lo,X0.hi]]),2);
    if(o.dis.length>=5) return o;
  }
}
/* ---------- 16.1/16.2: volume under a plane over a triangle (F2024-Q4) ---------- */
function P_dblVolTri(){
  const p=pick([1,2,3]), q=pick([1,2,3,4]), a=ri(0,3), b=ri(0,3); if(a+b===0) return null;
  const V=Rr(p*q*(a*p+b*q),6), ans=Rs(V), z=linKey([a,b],['x','y']);
  const edge=p===1&&q===1?'x+y=1':`\\frac{x}{${p}}+\\frac{y}{${q}}=1`.replace('\\frac{x}{1}','x').replace('\\frac{y}{1}','y');
  const dis=[D_(Rs(Rr(p*q*(a*p+b*q),2)),'Used ∬x dA = p²q/2: over this triangle it is p²q/6.'),D_(Rs(Rr(a+b,6)),'Used the triangle bounded by x + y = 1.'),
    D_(Rs(Rr(p*q*(a*p+b*q),4)),'Averaged only the two nonzero corner heights; a linear function averages to its value at the centroid, (ap + bq)/3.'),
    D_(Rs(Rr(p*q*(a*q+b*p),6)),'Swapped p and q in the moments.'),D_(Rs(Rr(p*q*(a*p+b*q),24)),'Divided by 24, a tetrahedron-type formula.'),D_(Rs(Rr(p*q*(a+b),2)),'Multiplied the area by a + b.')];
  return valQ(`Find the volume of the solid under the plane \\(z=${T(z)}\\) and above the triangle in the first quadrant bounded by the coordinate axes and the line \\(${edge}\\).`,ans,dis,
    'V = ∬(ax + by) dA; over this triangle ∬x dA = p²q/6 and ∬y dA = pq²/6.',
    [['Set up.',`V=\\int_0^{${p}}\\!\\int_0^{${T(`${q}*(1 - x/${p})`)}}(${T(z)})\\,dy\\,dx`],['',`V=${a}\\cdot\\frac{${p}^2\\cdot ${q}}{6}+${b}\\cdot\\frac{${p}\\cdot ${q}^2}{6}=${T(ans)}`]],
    CI(z,[['y','0',`${q}*(1 - x/${p})`],['x','0',String(p)]]),2);
}
/* ---------- 16.1: average value (S2023-Q5) and over a triangle ---------- */
function P_dblAvg(){
  if(coin(0.5)){
    const m=pick([1,2]), n=pick([1,2,3]), x0=pick([-1,0]), x1=pick([1,2]), y1=pick([2,3,4,5]);
    const Ix=Rr(Math.pow(x1,m+1)-Math.pow(x0,m+1),m+1), Iy=Rr(Math.pow(y1,n+1),n+1), area=(x1-x0)*y1;
    const tot=Rmul(Ix,Iy), ans=Rs(Rmul(tot,[1,area]));
    if(tot[0]===0) return null;
    const f=mono(1,{x:m,y:n}), mid=Rmul([Math.pow(x0+x1,m),Math.pow(2,m)],[Math.pow(y1,n),Math.pow(2,n)]);
    const dis=[D_(Rs(tot),'That is the integral; the average divides by the area.'),D_(Rs(mid),'Used f at the centre: that is the average only for a linear function.'),
      D_(Rs(Rmul(tot,[1,2*((x1-x0)+y1)])),'Divided by the perimeter instead of the area.'),D_(Rs(Rmul(tot,[1,(x1-x0)])),'Divided by the width only.'),D_(Rs(Rmul(tot,[1,area*area])),'Divided by the area twice.'),
      D_(Rs(Rmul(Rmul(Rr(Math.pow(x1,m+1),m+1),Iy),[1,area])),'Took the x-integral from 0 instead of '+x0+'.')];
    return valQ(`Find the average value of \\(f(x,y)=${T(f)}\\) over the rectangle \\(${x0}\\le x\\le ${x1},\\ 0\\le y\\le ${y1}\\).`,ans,dis,
      'Average = (1/area)∬_R f dA.',[['',`\\iint_R ${T(f)}\\,dA=\\left(\\int_{${x0}}^{${x1}}x^{${m}}dx\\right)\\left(\\int_0^{${y1}}y^{${n}}dy\\right)=${T(Rs(tot))}`],['',`\\bar f=\\frac{${T(Rs(tot))}}{${area}}=${T(ans)}`]],
      {op:'ratio',num:CI(f,[['y','0',String(y1)],['x',String(x0),String(x1)]]),den:{op:'val',e:String(area)}},2);
  }
  const a=pick([1,2,3,4,6]), which=pick(['x','y','xy']);
  const R=(p,q)=>Rs(Rr(p,q));
  const ans={x:R(2*a,3),y:R(a,3),xy:R(a*a,4)}[which];
  const dis={x:[D_(R(a,2),'Used the midpoint of [0, a]: the triangle has more area at large x.'),D_(R(a,3),'That is the average of y.'),D_(R(a*a*a,3),'That is the integral, not the average.'),
                D_(R(4*a,3),'Divided by a²/4 instead of the area a²/2.'),D_(R(3*a,4),'Weighted by x² instead of x.'),D_(R(a*a*a,6),'Integrated over the wrong triangle and did not divide.')],
           y:[D_(R(a,2),'Used the midpoint: y is concentrated near 0 on this triangle.'),D_(R(2*a,3),'That is the average of x.'),D_(R(a*a*a,6),'That is the integral, not the average.'),
                D_(R(a,6),'Divided by twice the area.'),D_(R(a,4),'Used ∫y dy = y² (forgot the ½), then divided twice.')],
           xy:[D_(R(a*a,2),'Used the midpoint value of x times y.'),D_(R(a*a*a*a,8),'That is the integral, not the average.'),D_(R(a*a,8),'Divided by twice the area.'),
                D_(R(a*a,3),'Used ∫x³ dx = x⁴/3.'),D_(R(a*a,6),'Forgot the ½ from ∫y dy, then divided by a² instead of a²/2.'),D_(R(2*a*a,9),'Multiplied the averages of x and y (2a/3 · a/3): averages do not multiply.')]}[which];
  return valQ(`Let \\(T\\) be the triangle with vertices \\((0,0)\\), \\((${a},0)\\) and \\((${a},${a})\\). What is the average value of \\(f(x,y)=${which==='xy'?'xy':which}\\) over \\(T\\)?`,ans,dis,
    'Average = ∬_T f dA / area(T); on T: 0 ≤ y ≤ x, 0 ≤ x ≤ a.',[['',`\\text{area}=\\tfrac{${a*a}}{2},\\qquad \\iint_T f\\,dA=\\int_0^{${a}}\\!\\int_0^{x}${which==='xy'?'xy':which}\\,dy\\,dx`],['',`\\bar f=${T(ans)}`]],
    {op:'ratio',num:CI(which==='xy'?'x*y':which,[['y','0','x'],['x','0',String(a)]]),den:{op:'val',e:`${a*a}/2`}},2);
}
/* ---------- 16.2: region between a parabola and a line ---------- */
function P_dblBetween(){
  const c=pick([1,2,3]), g=pick(['1','x','y','x*y']), C=n=>Math.pow(c,n);
  const V={'1':[C(3),6],'x':[C(4),12],'y':[C(5),15],'x*y':[C(6),24]}, top={'1':[C(3),2],'x':[C(4),3],'y':[C(5),6],'x*y':[C(6),8]},
        bot={'1':[C(3),3],'x':[C(4),4],'y':[C(5),10],'x*y':[C(6),12]}, add={'1':[5*C(3),6],'x':[7*C(4),12],'y':[4*C(5),15],'x*y':[5*C(6),24]};
  const one={'1':Radd([c,2],[-1,3]),'x':Radd([c,3],[-1,4]),'y':Radd([c*c,6],[-1,10]),'x*y':Radd([c*c,8],[-1,12])};
  const half={'y':[2*C(5),15],'x*y':[C(6),12]};
  const ans=Rs(Rr(...V[g])), gt=g==='1'?'1':g==='x*y'?'xy':g;
  const dis=[D_(Rs(Rneg(Rr(...V[g]))),'Put the parabola on top: for 0 < x < '+c+' the line y = '+(c===1?'':c)+'x is above y = x².'),
    D_(Rs(Rr(...top[g])),'Integrated from y = 0 up to the line: the lower boundary is the parabola, not the x-axis.'),D_(Rs(Rr(...bot[g])),'Integrated only up to the parabola (the region under y = x²).'),
    D_(Rs(Rr(...add[g])),'Added the two boundary contributions; the inner integral is F(top) − F(bottom).'),
    g==='y'||g==='x*y'?D_(Rs(Rr(...half[g])),'Forgot the ½ from ∫y dy = y²/2.'):D_(Rs(one[g]),'Used x from 0 to 1 instead of to the intersection x = '+c+'.')];
  return valQ(`Let \\(D\\) be the region enclosed by \\(y=x^2\\) and \\(y=${c===1?'':c}x\\). Evaluate \\(\\displaystyle\\iint_D ${gt}\\,dA\\).`,ans,dis,
    'Find where the curves meet (x = 0 and x = c), decide which is on top (the line), then integrate y from x² to cx.',
    [['The curves meet at \\(x=0\\) and \\(x='+c+'\\); between them \\('+(c===1?'':c)+'x\\ge x^2\\).',`\\iint_D ${gt}\\,dA=\\int_0^{${c}}\\!\\int_{x^2}^{${c===1?'':c}x}${gt}\\,dy\\,dx=${T(ans)}`]],
    CI(g,[['y','x^2',`${c}*x`],['x','0',String(c)]]),2);
}
/* ---------- 16.2: sin(x)/x needs dy first (S2023-Q6) ---------- */
function P_dblSinc(){
  const A=pick([['1','1 - cos(1)','1'],['pi/2','1','\\frac{\\pi}{2}'],['pi','2','\\pi']]), [a,v,at]=A;
  const dis=[D_(a==='1'?'cos(1) - 1':'-'+v,'Sign error: ∫ sin x dx = −cos x, so the value is 1 − cos a.'),D_(a==='1'?'sin(1)':a==='pi'?'0':'0','Integrated cos x instead of sin x.'),
    D_(a==='1'?'1 + cos(1)':a==='pi'?'0':'2','Evaluated −cos x at the upper limit only.'),D_(a==='1'?'1/2':a==='pi'?'pi':'1/2','Treated sin x / x as 1 near 0 everywhere.'),D_(a==='1'?'2 + cos(1)':'4','Doubled the triangle.')];
  return valQ(`Evaluate \\(\\displaystyle\\iint_R \\frac{\\sin x}{x}\\,dA\\), where \\(R\\) is bounded by the \\(x\\)-axis, the line \\(y=x\\) and the line \\(x=${at}\\).`,v,dis,
    'sin x / x has no elementary antiderivative in x, so integrate in y first: ∫₀ˣ dy = x cancels the denominator.',
    [['Integrate \\(y\\) first.',`\\int_0^{${at}}\\!\\int_0^{x}\\frac{\\sin x}{x}\\,dy\\,dx=\\int_0^{${at}}\\sin x\\,dx`],['',`=1-\\cos(${at})=${T(v)}`]],
    CI('sin(x)/x',[['y','0','x'],['x','0',a]]),2);
}
/* ---------- 16.2: reverse the order, then evaluate (F2022-Q1, S2019-Q2, S2023-Q8, F2023-Q6, F2024-Q8) ---------- */
function P_revEval(){
  const k=pick([1,1,2,2,3]), g=pick(['exp','exp','cos','sin']), m=pick([1,1,2,3,k+1]);
  const rootT=k===1?null:k===2?'\\sqrt{#}':'\\sqrt[3]{#}', rootK=k===1?'#':k===2?'sqrt(#)':'(#)^(1/3)';
  let cK,cT,Ck;                                /* c = upper limit of the variable integrated last after reversing; Ck = c^(k+1) as a key */
  if(g==='exp'){ const c=k===1?pick([1,2]):1; cK=String(c); cT=String(c); Ck=String(Math.pow(c,k+1)); }
  else if(k===1){ const c=g==='cos'?'sqrt(pi/2)':pick(['sqrt(pi)','sqrt(pi/2)']); cK=c; cT=c==='sqrt(pi)'?'\\sqrt{\\pi}':'\\sqrt{\\pi/2}'; Ck=c==='sqrt(pi)'?'pi':'pi/2'; }
  else { cK='1'; cT='1'; Ck='1'; }
  const top=g==='exp'?String(Math.pow(+cK,k)):k===1?cK:'1', topT=g==='exp'?top:k===1?cT:'1';
  const u=coin(0.6)?'y':'x', w=u==='y'?'x':'y';               /* u: the variable inside g (integrated last after reversing) */
  const gT=v=>g==='exp'?`e^{${v}^{${k+1}}}`:`\\${g}(${v}^{${k+1}})`, gK=v=>g==='exp'?`e^(${v}^${k+1})`:`${g}(${v}^${k+1})`;
  const lowT=k===1?w:rootT.replace('#',w), lowK=rootK.replace('#',w);
  const given=`\\(\\displaystyle\\int_0^{${topT}}\\!\\int_{${lowT}}^{${cT}}${m===1?'':m}\\,${gT(u)}\\,d${u}\\,d${w}\\)`;
  const G=g==='exp'?`(e^(${Ck}) - 1)`:g==='cos'?`sin(${Ck})`:`(1 - cos(${Ck}))`, K=r=>term(r,'1');
  const ans=`${K([m,k+1])}*${G}`;
  const dis=[D_(`${m}*${G}`,`Forgot the 1/${k+1} from the substitution v = ${u}^${k+1}.`),
    D_(`${K([m,k+1])}*${g==='exp'?`e^(${Ck})`:g==='cos'?`cos(${Ck})`:`cos(${Ck})`}`,g==='exp'?'Dropped the lower limit: e⁰ = 1 must be subtracted.':'Antiderivative slip: ∫cos = sin and ∫sin = −cos.'),
    D_(`${K([-m,k+1])}*${G}`,'Sign error from the order of the limits.'),D_(`${K([m,k+2])}*${G}`,`Used ${u}^${k+1} as the extra factor; the inner integral gives ${u}^${k}.`),
    D_(`${K([m*(k+1),1])}*${G}`,`Multiplied by ${k+1} instead of dividing.`),D_('0','Reversing the order never changes the value, and this one is not 0.')];
  return valQ(`Evaluate by reversing the order of integration: ${given}`,ans,dis,
    `As written the inner antiderivative is not elementary. The region is 0 ≤ ${w} ≤ ${u}^${k}, 0 ≤ ${u} ≤ c; integrating ${w} first produces the factor ${u}^${k} that the substitution v = ${u}^${k+1} needs.`,
    [[`Sketch: \\(${lowT}\\le ${u}\\le ${cT}\\) is the same as \\(0\\le ${w}\\le ${u}^{${k}}\\).`,`\\int_0^{${cT}}\\!\\int_0^{${u}^{${k}}}${m===1?'':m}\\,${gT(u)}\\,d${w}\\,d${u}=\\int_0^{${cT}}${m===1?'':m}\\,${u}^{${k}}\\,${gT(u)}\\,d${u}`.replace(`${u}^{1}`,u)],
     [`Substitute \\(v=${u}^{${k+1}}\\).`,`=${T(ans)}`]],
    CI(`${m}*${gK(u)}`,[[u,lowK,cK],[w,'0',top]]),2);
}
/* ---------- 16.2: reverse the order (set-up only) (S2022-Q10, 16.2 #57–62) ---------- */
function P_revSetup(){
  const fam=pick(['parab','parab','ln','circ']), f0='1 + x + y^2';
  const H=c=>`\\(\\displaystyle\\int_{${c[0]}}^{${c[1]}}\\!\\int_{${c[2]}}^{${c[3]}}f(x,y)\\,dx\\,dy\\)`;
  const S=k=>k?CI(f0,[['x',k[2],k[3]],['y',k[0],k[1]]]):null;
  let q,C,how,ref,solL;
  if(fam==='parab'){
    const a=pick([1,2,3,4]), A2=a*a, aT=a===1?'':a, yA=a===1?'y':`y/${a}`, yAT=a===1?'y':`\\frac{y}{${a}}`;
    q=`Reverse the order of integration: \\(\\displaystyle\\int_0^{${a}}\\!\\int_{x^2}^{${aT}x}f(x,y)\\,dy\\,dx\\)`;
    C=[[['0',A2,yAT,'\\sqrt{y}'],['0',String(A2),yA,'sqrt(y)']],
      [['0',a,yAT,'\\sqrt{y}'],['0',String(a),yA,'sqrt(y)'],'Kept the old outer limit: y runs up to the top of the region, y = '+A2+'.'],
      [['0',A2,'\\sqrt{y}',yAT],['0',String(A2),'sqrt(y)',yA],'Swapped the x-limits: the line x = y/'+a+' is the left edge, the parabola x = √y the right edge.'],
      [['0',A2,`${aT}y`,'y^2'],['0',String(A2),`${a}*y`,'y^2'],'Swapped the letters without solving for x.'],
      [['0',a,'y^2',`${aT}y`],['0',String(a),'y^2',`${a}*y`],'Renamed x ↔ y in the old limits; the curves must be solved for x.'],
      [['0',A2,'0','\\sqrt{y}'],['0',String(A2),'0','sqrt(y)'],'Used x = 0 as the left edge: the region starts at the line x = y/'+a+'.'],
      [['0',A2,yAT,String(a)],['0',String(A2),yA,String(a)],'The right edge is the parabola x = √y, not the line x = '+a+'.']];
    how=`Sketch first: the region lies between y = x² (below) and y = ${aT}x (above) for 0 ≤ x ≤ ${a}. Read it sideways: y from 0 to ${A2}, x from y/${a} to √y.`;
    ref=CI(f0,[['y','x^2',`${a}*x`],['x','0',String(a)]]); solL=[['The curves meet at \\((0,0)\\) and \\(('+a+','+A2+')\\).',H(C[0][0]).slice(2,-2)]];
  }else if(fam==='ln'){
    const b=pick([1,2]), E=b===1?'e':`e^${b}`, Et=b===1?'e':`e^{${b}}`;
    q=`Reverse the order of integration: \\(\\displaystyle\\int_1^{${Et}}\\!\\int_0^{\\ln x}f(x,y)\\,dy\\,dx\\)`;
    C=[[['0',b,'e^{y}',Et],['0',String(b),'e^y',E]],
      [['0',b,'1','e^{y}'],['0',String(b),'1','e^y'],'The region lies to the RIGHT of x = eʸ, out to x = '+(b===1?'e':'e^'+b)+'.'],
      [['0',Et,'e^{y}',Et],['0',E,'e^y',E],'The top of the region is y = '+b+', not y = '+(b===1?'e':'e^'+b)+'.'],
      [['0',b,'\\ln y',Et],['0',String(b),'ln(y)',E],'Solve y = ln x for x: x = eʸ, not ln y.'],
      [['0',b,Et,'e^{y}'],['0',String(b),E,'e^y'],'Lower and upper x-limits swapped.'],
      [['1',Et,'0','\\ln y'],['1',E,'0','ln(y)'],'Renamed the variables instead of describing the same region.']];
    how=`Region: 1 ≤ x ≤ ${b===1?'e':'e^'+b}, 0 ≤ y ≤ ln x. Sideways: 0 ≤ y ≤ ${b}, and x runs from the curve x = eʸ to the line x = ${b===1?'e':'e^'+b}.`;
    ref=CI(f0,[['y','0','ln(x)'],['x','1',E]]); solL=[['',H(C[0][0]).slice(2,-2)]];
  }else{
    const R=pick([1,2,3]), s=`\\sqrt{${R*R}-y^2}`, sk=`sqrt(${R*R} - y^2)`;
    q=`Reverse the order of integration: \\(\\displaystyle\\int_0^{${R}}\\!\\int_0^{\\sqrt{${R*R}-x^2}}f(x,y)\\,dy\\,dx\\)`;
    C=[[['0',R,'0',s],['0',String(R),'0',sk]],
      [['0',R,'-'+s,s],['0',String(R),'-'+sk,sk],'That is the right half-disk; the given region is only the quarter with y ≥ 0 and x ≥ 0.'],
      [['0',R*R,'0',s],['0',String(R*R),'0',sk],'y only goes up to the radius '+R+'.'],
      [['0',R,'0',`${R*R}-y^2`],['0',String(R),'0',`${R*R} - y^2`],'Lost the square root: x = √(R² − y²).'],
      [['0',R,s,R],['0',String(R),sk,String(R)],'That is the corner of the square outside the circle.'],
      [['0',R,'0',R],['0',String(R),'0',String(R)],'That is the whole square.']];
    how='The region is the quarter disk x ≥ 0, y ≥ 0, x² + y² ≤ '+(R*R)+'; sideways x runs from 0 to √('+(R*R)+' − y²).';
    ref=CI(f0,[['y','0',`sqrt(${R*R} - x^2)`],['x','0',String(R)]]); solL=[['',H(C[0][0]).slice(2,-2)]];
  }
  const opts=[OK(H(C[0][0]),S(C[0][1]))].concat(C.slice(1).map(c=>NO(H(c[0]),c[2],S(c[1]))));
  return choiceQ(q,opts,how,solL,ref,2);
}
/* ---------- 16.2: one integral ⇄ two (16.2 #69–70: a twist past exams never asked) ---------- */
function P_revSplit(){
  const p=pick([1,2,3]), s=pick([1,2]), h=p, b=p+s*h, f0='x + y^2 + 1';
  const RtT=`${b}-${s===1?'':s}y`, RtK=`${b} - ${s}*y`, rY=s===1?`${b}-x`:`\\frac{${b}-x}{${s}}`, rYK=`(${b} - x)/${s}`;
  const two=(a1,a2)=>`\\(\\displaystyle\\int_0^{${p}}\\!\\int_0^{${a1}}f\\,dy\\,dx+\\int_{${p}}^{${b}}\\!\\int_0^{${a2}}f\\,dy\\,dx\\)`;
  const twoS=(k1,k2)=>({op:'sum',of:[CI(f0,[['y','0',k1],['x','0',String(p)]]),CI(f0,[['y','0',k2],['x',String(p),String(b)]])]});
  const one=(t,l,r)=>`\\(\\displaystyle\\int_0^{${t}}\\!\\int_{${l}}^{${r}}f\\,dx\\,dy\\)`, oneS=(t,l,r)=>CI(f0,[['x',l,r],['y','0',String(t)]]);
  let q,opts,ref;
  if(coin(0.5)){
    q=`Write as a single iterated integral in the order \\(dx\\,dy\\): ${two('x',rY)}`;
    ref=twoS('x',rYK);
    opts=[OK(one(h,'y',RtT),oneS(h,'y',RtK)),
      NO(one(b,'y',RtT),'The top of the triangle is the apex height y = '+h+', not the base length '+b+'.',oneS(b,'y',RtK)),
      NO(one(h,'0',RtT),'The left edge is the line x = y, not the y-axis.',oneS(h,'0',RtK)),
      NO(one(h,RtT,'y'),'Limits in the wrong order: the left edge x = y comes first.',oneS(h,RtK,'y')),
      NO(one(p,'0','y'),'That is only part of the first piece.',oneS(p,'0','y')),
      NO('It cannot be written as a single iterated integral.','In dx dy order the left and right edges are single lines, x = y and x = '+b+' − '+(s===1?'':s)+'y.',null)];
    if(s>1) opts.push(NO(one(h,'y',`${b}-y`),'Solved the right edge incorrectly: it is x = '+b+' − '+s+'y.',oneS(h,'y',`${b} - y`)));
  }else{
    q=`Which sum equals \\(\\displaystyle\\int_0^{${h}}\\!\\int_{y}^{${RtT}}f(x,y)\\,dx\\,dy\\)?`;
    ref=oneS(h,'y',RtK);
    opts=[OK(two('x',rY),twoS('x',rYK)),
      NO(two(rY,'x'),'Swapped the pieces: left of x = '+p+' the top of the region is the line y = x.',twoS(rYK,'x')),
      NO(two('x','x'),'The right piece is capped by the right edge of the triangle, not by y = x.',twoS('x','x')),
      NO(two(String(h),rY),'Capping the left piece at the apex height adds a region that is not in the triangle.',twoS(String(h),rYK)),
      NO(`\\(\\displaystyle\\int_0^{${b}}\\!\\int_0^{x}f\\,dy\\,dx\\)`,'One integral cannot follow both slanted edges: the top changes at x = '+p+'.',CI(f0,[['y','0','x'],['x','0',String(b)]])),
      NO(`\\(\\displaystyle\\int_0^{${b}}\\!\\int_0^{${rY}}f\\,dy\\,dx\\)`,'Using only the right edge includes the region left of y = x.',CI(f0,[['y','0',rYK],['x','0',String(b)]]))];
    if(s>1) opts.push(NO(two('x',`${b}-x`),'Solve x = '+b+' − '+s+'y for y: y = ('+b+' − x)/'+s+'.',twoS('x',`${b} - x`)));
  }
  return choiceQ(q,opts,`Sketch the region: the triangle with vertices (0,0), (${b},0) and apex (${p},${h}). In dx dy order its left and right edges are single lines; in dy dx order the top changes at x = ${p}, so it splits.`,
    [['The region is the triangle with vertices \\((0,0)\\), \\(('+b+',0)\\), \\(('+p+','+h+')\\).',`\\int_0^{${h}}\\!\\int_{y}^{${RtT}}f\\,dx\\,dy=${two('x',rY).slice(2,-2)}`]],ref,3);
}
/* ---------- 16.2: pick the order that works (S2025-Q11) ---------- */
function P_revChoose(){
  const c=pick([1,2,3]), g=pick(['exp','cos']);
  const ans=g==='exp'?`${term([c*c,2],'1')}*(e - 1)`:`${term([c*c,2],'1')}*sin(1)`;
  const ft=g==='exp'?'e^{x/y}':'\\cos(x/y)', ff=g==='exp'?'e^(x/y)':'cos(x/y)';
  const dis=[D_(g==='exp'?`${c}*(e - 1)`:`${c}*sin(1)`,'Forgot the factor y from ∫₀ʸ e^{x/y} dx = y(e − 1).'),D_(g==='exp'?`${term([c*c,2],'1')}*e`:`${term([c*c,2],'1')}*cos(1)`,'Dropped the lower limit of the inner integral.'),
    D_(g==='exp'?`${c*c}*(e - 1)`:`${c*c}*sin(1)`,'Forgot the ½ from ∫y dy.'),D_(g==='exp'?`${term([c*c*c,3],'1')}*(e - 1)`:`${term([c*c*c,3],'1')}*sin(1)`,'Integrated y² instead of y.'),
    c>1?D_(g==='exp'?`${term([c*c,2],'1')}*(e^${c} - 1)`:`${term([c*c,2],'1')}*sin(${c})`,'Treated x/y as x.'):null,D_('0','The order matters for doing it, not for the value; it is not 0.')];
  return valQ(`Let \\(T\\) be the triangle with vertices \\((0,0)\\), \\((0,${c})\\) and \\((${c},${c})\\). Evaluate \\(\\displaystyle\\iint_T ${ft}\\,dA\\). (One order of integration is much easier than the other.)`,ans,dis,
    'Integrate x first: with y fixed, x/y is linear in x and the inner integral is y(e − 1) (or y sin 1). In the other order the inner antiderivative is not elementary.',
    [['On \\(T\\): \\(0\\le x\\le y\\), \\(0\\le y\\le '+c+'\\).',`\\int_0^{${c}}\\!\\int_0^{y}${ft}\\,dx\\,dy=\\int_0^{${c}}y\\,${g==='exp'?'(e-1)':'\\sin 1'}\\,dy`],['',`=${T(ans)}`]],
    CI(ff,[['x','0','y'],['y','0',String(c)]]),2);
}
/* ---------- 16.1: Riemann sum (F2018-Q3, 16.1 #3, #53–54) ---------- */
function P_dblRiemann(){
  const L=pick([4,6]), h=L/2, a=ri(1,3), c=ri(0,2), dv=L===6?3:2, corner=pick(['upper right','lower left','midpoints']);
  const f=(x,y)=>a*x+y*y/dv+c, fK=`${a}*x + y^2/${dv} + ${c}`;
  const P={ur:[[h,h],[L,h],[h,L],[L,L]],ll:[[0,0],[h,0],[0,h],[h,h]],mid:[[h/2,h/2],[3*h/2,h/2],[h/2,3*h/2],[3*h/2,3*h/2]]};
  const key=corner==='upper right'?'ur':corner==='lower left'?'ll':'mid', pts=P[key];
  const sum=k=>P[k].reduce((s,[x,y])=>s+f(x,y),0)*h*h, S=sum(key), F=x=>toFrac(x,100);
  const exact=L*L*(a*L/2+c)+L*Math.pow(L,3)/3/dv;
  const others=['ur','ll','mid'].filter(k=>k!==key);
  const nm={ur:'upper right corners',ll:'lower left corners',mid:'midpoints'};
  const dis=[D_(F(S/(h*h)),'Added the four function values but forgot to multiply by ΔA = '+(h*h)+', the area of each square.'),
    D_(F(sum(others[0])),'Used the '+nm[others[0]]+'.'),D_(F(sum(others[1])),'Used the '+nm[others[1]]+'.'),
    D_(F(exact),'That is the exact value of the integral, not the Riemann sum.'),D_(F(S*4),'Used ΔA = '+(L*L)+', the area of the whole square, for each piece.'),D_(F(S/4),'Averaged the four values and then multiplied by ΔA.')];
  const ft=`${a===1?'':a}x+\\frac{y^2}{${dv}}${c?'+'+c:''}`;
  return valQ(`Approximate \\(\\displaystyle\\int_0^{${L}}\\!\\int_0^{${L}}\\left(${ft}\\right)dy\\,dx\\) with a Riemann sum: split the square into four equal squares and use the ${corner==='midpoints'?'midpoint':corner+' corner'} of each as the sample point.`,F(S),dis,
    'Riemann sum = Σ f(sample point)·ΔA, with ΔA the area of one small square.',
    [['Each small square has side \\('+h+'\\), so \\(\\Delta A='+(h*h)+'\\). Sample points: '+pts.map(p=>`\\((${p[0]},${p[1]})\\)`).join(', ')+'.',`\\sum f\\,\\Delta A=${h*h}\\left(${pts.map(([x,y])=>T(F(f(x,y)))).join('+')}\\right)=${T(F(S))}`]],
    {op:'riemann',f:fK,pts,dA:h*h},2);
}
/* ---------- 16.1: volume between e^(x+y) and z = 1 (F2023-Q11) ---------- */
function P_dblVolExp(){
  const a=pick([1,2,3]), b=pick([1,2,3]);
  const ans=`(e^${a} - 1)*(e^${b} - 1) - ${a*b}`;
  const dis=[D_(`(e^${a} - 1)*(e^${b} - 1)`,'That is the volume under e^{x+y} above z = 0 minus … only part of it: the floor here is z = 1, so subtract ab.'),
    D_(`e^${a+b} - 1 - ${a*b}`,'e^{x+y} = eˣ·eʸ separates; its integral is (eᵃ − 1)(eᵇ − 1), not e^{a+b} − 1.'),D_(`(e^${a} - 1)*(e^${b} - 1) + ${a*b}`,'Added the slab under z = 1 instead of removing it.'),
    D_(`e^${a}*e^${b} - ${a*b}`,'Dropped the lower limits e⁰ = 1.'),D_(`(e^${a} - 1)*(e^${b} - 1) - 1`,'Subtracted 1 instead of the volume ab of the slab.'),D_(`e^${a+b} - ${a*b}`,'Used e^{a+b} for the whole integral.')];
  return valQ(`Find the volume of the solid enclosed by \\(x=0\\), \\(x=${a}\\), \\(y=0\\), \\(y=${b}\\), \\(z=1\\) and \\(z=e^{x+y}\\).`,ans,dis,
    'Volume = ∬(top − bottom) dA = ∬(e^{x+y} − 1) dA; e^{x+y} = eˣeʸ splits into a product.',
    [['',`V=\\int_0^{${a}}\\!\\int_0^{${b}}\\left(e^{x}e^{y}-1\\right)dy\\,dx=(e^{${a}}-1)(e^{${b}}-1)-${a*b}`]],CI('e^(x + y) - 1',[['y','0',String(b)],['x','0',String(a)]]),2);
}

/* ---------- 16.3: a sector of a disk (S2025-Q8, S2018-Q4, S2017-Q5) ---------- */
const SECT=[
  ['0','pi/4','in the first quadrant, below the line \\(y=x\\)'],['pi/4','pi/2','in the first quadrant, above the line \\(y=x\\)'],['0','pi/3','in the first quadrant, below the line \\(y=\\sqrt3\\,x\\)'],
  ['pi/3','pi/2','in the first quadrant, above the line \\(y=\\sqrt3\\,x\\)'],['-pi/4','3pi/4','above the line \\(y=-x\\)'],['pi/4','5pi/4','above the line \\(y=x\\)'],
  ['0','pi','with \\(y\\ge 0\\)'],['pi/2','pi','in the second quadrant'],['pi/6','pi/2','in the first quadrant, above the line \\(y=x/\\sqrt3\\)'],['pi/4','3pi/4','above both lines \\(y=x\\) and \\(y=-x\\)']];
function P_polSector(){
  const [a1,a2,words]=pick(SECT), R=pick([1,2,3]), g=pick(['x','y','x','y','x^2+y^2','xy','sqrt']);
  const len=angLen(a1,a2), R3=[R*R*R,3], R4=[Math.pow(R,4),4];
  const sn=v=>trigT(v,'s'), cs=v=>trigT(v,'c'), s2=v=>{ const t=sn(v); return Rmul(Rmul(t[0],t[0]),[t[1],1]); };
  let ans,gt,dis,fI;
  if(g==='x'){ gt='x'; fI='r^2*cos(t)'; ans=qc([scaleT(sn(a2),R3),scaleT(sn(a1),Rneg(R3))]);
    dis=[D_(qc([scaleT(sn(a2),[R*R,2]),scaleT(sn(a1),[-R*R,2])]),'Forgot the extra r in dA = r dr dθ.'),D_(qc([scaleT(cs(a1),R3),scaleT(cs(a2),Rneg(R3))]),'Used x = r sin θ: in polar x = r cos θ.'),
      D_(qc([scaleT(sn(a1),R3),scaleT(sn(a2),Rneg(R3))]),'Sign slip: ∫cos θ dθ = sin θ, evaluated top minus bottom.'),D_('0','Used θ from 0 to 2π (the whole disk), where the x-values cancel.'),
      D_(qc([scaleT(sn(a2),R4),scaleT(sn(a1),Rneg(R4))]),'Integrated r³ instead of r²: the integrand x = r cos θ contributes one r and dA another.'),D_(qc([scaleT(sn(a2),R3)]),'Evaluated sin θ at the upper limit only.')]; }
  else if(g==='y'){ gt='y'; fI='r^2*sin(t)'; ans=qc([scaleT(cs(a1),R3),scaleT(cs(a2),Rneg(R3))]);
    dis=[D_(qc([scaleT(cs(a1),[R*R,2]),scaleT(cs(a2),[-R*R,2])]),'Forgot the extra r in dA = r dr dθ.'),D_(qc([scaleT(sn(a2),R3),scaleT(sn(a1),Rneg(R3))]),'Used y = r cos θ: in polar y = r sin θ.'),
      D_(qc([scaleT(cs(a2),R3),scaleT(cs(a1),Rneg(R3))]),'Sign slip: ∫sin θ dθ = −cos θ.'),D_('0','Used θ from 0 to 2π (the whole disk), where the y-values cancel.'),
      D_(qc([scaleT(cs(a1),R4),scaleT(cs(a2),Rneg(R4))]),'Integrated r³ instead of r².'),D_(qc([scaleT(cs(a2),Rneg(R3))]),'Evaluated −cos θ at the upper limit only.')]; }
  else if(g==='xy'){ gt='xy'; fI='r^3*sin(t)*cos(t)'; const d=Radd(s2(a2),Rneg(s2(a1))); ans=Rs(Rmul(d,[Math.pow(R,4),8]));
    dis=[D_(Rs(Rmul(d,[R*R*R,6])),'Forgot the extra r in dA = r dr dθ.'),D_(Rs(Rmul(d,[Math.pow(R,4),4])),'Forgot the ½ in ∫sin θ cos θ dθ = ½sin²θ.'),D_(Rs(Rneg(Rmul(d,[Math.pow(R,4),8]))),'Sign slip in the θ-integral.'),
      D_('0','Used θ from 0 to 2π, where xy cancels.'),D_(Rs(Rmul(d,[Math.pow(R,5),10])),'Integrated r⁴ instead of r³.'),D_(Rs(Rmul(s2(a2),[Math.pow(R,4),8])),'Evaluated at the upper limit only.')]; }
  else { const pw=g==='sqrt'?3:4; gt=g==='sqrt'?'\\sqrt{x^2+y^2}':'x^2+y^2'; fI=g==='sqrt'?'r^2':'r^3'; ans=mv(Rmul(len,[Math.pow(R,pw),pw]),1,1);
    dis=[D_(mv(Rmul(len,[Math.pow(R,pw-1),pw-1]),1,1),'Forgot the extra r in dA = r dr dθ.'),D_(mv(Rmul([2,1],[Math.pow(R,pw),pw]),1,1),'Used θ from 0 to 2π (the whole disk).'),
      D_(mv(Rmul(len,[Math.pow(R,pw+1),pw+1]),1,1),'One power of r too many.'),D_(Rs(Rmul(len,[Math.pow(R,pw),pw])),'Dropped the π from the angle.'),
      D_(mv(Rmul(len,[Math.pow(R,pw),2*pw]),1,1),'Halved the angle range.'),D_(mv(Rmul(len,[Math.pow(R,2*pw-2),pw]),1,1),'Took r out to R² instead of R.')]; }
  if(ans==='0') return null;
  return valQ(`Let \\(D\\) be the part of the disk \\(x^2+y^2\\le ${R*R}\\) ${words}. Evaluate \\(\\displaystyle\\iint_D ${/[+]/.test(gt)?'('+gt+')':gt}\\,dA\\).`,ans,dis,
    'Polar: x = r cos θ, y = r sin θ, dA = r dr dθ; lines through the origin fix the θ-limits.',
    [['The region is \\(0\\le r\\le '+R+'\\), \\('+ANG[a1].t+'\\le\\theta\\le '+ANG[a2].t+'\\).',`\\int_{${ANG[a1].t}}^{${ANG[a2].t}}\\!\\int_0^{${R}}${g==='x'?'r\\cos\\theta':g==='y'?'r\\sin\\theta':g==='xy'?'r^2\\sin\\theta\\cos\\theta':g==='sqrt'?'r':'r^2'}\\,r\\,dr\\,d\\theta=${T(ans)}`]],
    CI(fI,[['r','0',String(R)],['t',ANG[a1].k,ANG[a2].k]]),2);
}
/* ---------- 16.3: e^(±r²) and sin(r²) from Cartesian limits (F2024-Q9, S2024-Q5, F2022-Q4, S2022-Q9) ---------- */
function P_polGauss(){
  const shape=pick(['full','upper','right','quarter','annulus']), g=pick(['ep','em','sin']);
  let R,R2,r0=0,RT;
  if(g==='sin'){ R2=pick(['pi','pi/2']); R=R2==='pi'?'sqrt(pi)':'sqrt(pi/2)'; RT=R2==='pi'?'\\sqrt{\\pi}':'\\sqrt{\\pi/2}'; }
  else { const Rn=pick([1,2,3]); R=String(Rn); R2=String(Rn*Rn); RT=R; }
  const Th={full:[2,1],upper:[1,1],right:[1,1],quarter:[1,2],annulus:[2,1]}[shape];
  let lim,desc,lims;
  const RR=g==='sin'?R2:R2;
  if(shape==='full'){ desc=`\\displaystyle\\int_{-${RT}}^{${RT}}\\!\\int_{-\\sqrt{${T(RR)}-y^2}}^{\\sqrt{${T(RR)}-y^2}}`; lims=[['x',`-sqrt(${RR} - y^2)`,`sqrt(${RR} - y^2)`],['y','-'+R,R]]; lim='dx\\,dy'; }
  else if(shape==='upper'){ desc=`\\displaystyle\\int_{-${RT}}^{${RT}}\\!\\int_0^{\\sqrt{${T(RR)}-x^2}}`; lims=[['y','0',`sqrt(${RR} - x^2)`],['x','-'+R,R]]; lim='dy\\,dx'; }
  else if(shape==='right'){ desc=`\\displaystyle\\int_{-${RT}}^{${RT}}\\!\\int_0^{\\sqrt{${T(RR)}-y^2}}`; lims=[['x','0',`sqrt(${RR} - y^2)`],['y','-'+R,R]]; lim='dx\\,dy'; }
  else if(shape==='quarter'){ desc=`\\displaystyle\\int_0^{${RT}}\\!\\int_0^{\\sqrt{${T(RR)}-x^2}}`; lims=[['y','0',`sqrt(${RR} - x^2)`],['x','0',R]]; lim='dy\\,dx'; }
  if(shape==='annulus'&&g==='sin') return null;
  if(shape==='annulus'){ r0=1; if(R==='1') return null; }
  const E=x=>g==='ep'?`e^(${x})`:g==='em'?`e^(-${x})`:`cos(${x})`;
  const base=g==='ep'?`(${E(R2)} - ${r0?'e':'1'})`:g==='em'?`(${r0?'e^(-1)':'1'} - ${E(R2)})`:`(1 - ${E(R2)})`;
  const ans=g==='sin'?(R2==='pi'?term([Th[0]*2,Th[1]*2],'pi'):term([Th[0],Th[1]*2],'pi')):`${term([Th[0],Th[1]*2],'pi')}*${base}`;
  const integ=g==='ep'?'e^{x^2+y^2}':g==='em'?'e^{-(x^2+y^2)}':'\\sin(x^2+y^2)';
  const q=shape==='annulus'?`Let \\(D\\) be the region between the circles \\(x^2+y^2=1\\) and \\(x^2+y^2=${R2}\\). Evaluate \\(\\displaystyle\\iint_D ${integ}\\,dA\\).`
          :`Evaluate \\(${desc}${integ}\\,${lim}\\).`;
  const full=g==='sin'?(R2==='pi'?'2pi':'pi'):`pi*${base}`;
  const dis=[D_(g==='sin'?term([Th[0]*(R2==='pi'?2:1),Th[1]],'pi'):`${term([Th[0],Th[1]],'pi')}*${base}`,'Forgot the ½ from u = r², du = 2r dr.'),
    D_(full===ans?(g==='sin'?'pi/2':`${term([1,4],'pi')}*${base}`):full,'Read the region as a full disk; the limits describe only part of it.'),
    D_(g==='sin'?term([Th[0],Th[1]],'1'):`${term([Th[0],Th[1]*2],'pi')}*${E(R2)}`,g==='sin'?'Lost the π from the θ-integral.':'Dropped the lower limit of the r-integral.'),
    D_(g==='sin'?term([Th[0],Th[1]*2],'pi'):`${term([Th[0],Th[1]*2],'pi')}*(${E(R)} - 1)`.replace('(-','(-'),g==='sin'?'Used cos(r²) at the wrong limit.':'Used e^{±R} instead of e^{±R²}.'),
    D_(g==='ep'?`${term([Th[0],Th[1]*2],'pi')}*(1 - e^(-${R2}))`:g==='em'?`${term([Th[0],Th[1]*2],'pi')}*(e^(${R2}) - 1)`:'0','Sign slip in the exponent.'),
    D_(g==='sin'?term([Th[0]*2,Th[1]],'pi'):`${term([Th[0]*2,Th[1]],'pi')}*${base}`,'Doubled the angle range.')];
  const thT=shape==='full'||shape==='annulus'?'2\\pi':shape==='quarter'?'\\pi/2':'\\pi';
  return valQ(q,ans,dis,'Read the region from the limits, switch to polar (dA = r dr dθ), then substitute u = r².',
    [['The region is '+(shape==='full'?'the whole disk':shape==='upper'?'the upper half-disk':shape==='right'?'the right half-disk':shape==='quarter'?'the first-quadrant quarter disk':'the annulus')+', so \\(\\theta\\) runs through \\('+thT+'\\).',
      `\\int\\!\\!\\int ${g==='ep'?'e^{r^2}':g==='em'?'e^{-r^2}':'\\sin(r^2)'}\\,r\\,dr\\,d\\theta`],['',`=${T(ans)}`]],
    shape==='annulus'?CI((g==='ep'?'e^(r^2)':'e^(-r^2)')+'*r',[['r','1',R],['t','0','2*pi']]):CI(g==='ep'?'e^(x^2 + y^2)':g==='em'?'e^(-(x^2 + y^2))':'sin(x^2 + y^2)',lims),2);
}
/* ---------- 16.3: convert to polar (S2019-Q3, F2023-Q3, S2023-Q7) ---------- */
function P_polConvert(asChoice){
  const R=pick([1,2,3]), g=pick(['sqrt','one','sq','inv']), reg=pick(['wedge','quarter','half']);
  const gt={sqrt:'\\sqrt{x^2+y^2}',one:'1',sq:'(x^2+y^2)',inv:'\\frac{1}{\\sqrt{x^2+y^2}}'}[g], rp={sqrt:2,one:1,sq:3,inv:0}[g];
  const gk={sqrt:'sqrt(x^2 + y^2)',one:'1',sq:'x^2 + y^2',inv:'1/sqrt(x^2 + y^2)'}[g];
  const th={wedge:['pi/4','pi/2'],quarter:['0','pi/2'],half:['0','pi']}[reg];
  let lims,limT;
  if(reg==='wedge'){ limT=`\\displaystyle\\int_0^{${R===1?'1/\\sqrt2':R===2?'\\sqrt2':R+'/\\sqrt2'}}\\!\\int_x^{\\sqrt{${R*R}-x^2}}`; lims=[['y','x',`sqrt(${R*R} - x^2)`],['x','0',`${R}/sqrt(2)`]]; }
  else if(reg==='quarter'){ limT=`\\displaystyle\\int_0^{${R}}\\!\\int_0^{\\sqrt{${R*R}-x^2}}`; lims=[['y','0',`sqrt(${R*R} - x^2)`],['x','0',String(R)]]; }
  else { limT=`\\displaystyle\\int_{-${R}}^{${R}}\\!\\int_0^{\\sqrt{${R*R}-x^2}}`; lims=[['y','0',`sqrt(${R*R} - x^2)`],['x',String(-R),String(R)]]; }
  const len=angLen(th[0],th[1]), ans=mv(Rmul(len,[Math.pow(R,rp+1),rp+1]),1,1);
  const q=`${asChoice?'Rewrite in polar coordinates (do not evaluate)':'Evaluate by converting to polar coordinates'}: \\(${limT}${gt}\\,dy\\,dx\\)`;
  const P=(a,b,Rt,pw)=>`\\(\\displaystyle\\int_{${ANG[a].t}}^{${ANG[b].t}}\\!\\int_0^{${Rt}}${pw===0?'1':pw===1?'r':'r^{'+pw+'}'}\\,dr\\,d\\theta\\)`;
  /* × (1 + x + 3y + x² + y²): a test factor that depends on θ and r, so mirror-image wedges and wrong powers of r cannot tie */
  const PS=(a,b,Rt,pw)=>CI(`r^${pw}*(1 + r*cos(t) + 3*r*sin(t) + r^2)`,[['r','0',String(Rt)],['t',ANG[a].k,ANG[b].k]]);
  if(asChoice){
    const wrongTh=reg==='wedge'?['0','pi/4']:reg==='quarter'?['0','pi']:['0','pi/2'];
    const opts=[OK(P(th[0],th[1],R,rp),PS(th[0],th[1],R,rp)),NO(P(th[0],th[1],R,rp===0?2:rp-1),'Forgot the Jacobian r in dA = r dr dθ.',PS(th[0],th[1],R,rp===0?2:rp-1)),
      NO(P(th[0],th[1],R*R,rp),'r runs out to the radius '+R+', not '+(R*R)+'.',PS(th[0],th[1],R*R,rp)),NO(P('0','2pi',R,rp),'The limits describe only part of the disk.',PS('0','2pi',R,rp)),
      NO(P(wrongTh[0],wrongTh[1],R,rp),reg==='wedge'?'Above y = x means θ from π/4 to π/2.':'Wrong angle range for this region.',PS(wrongTh[0],wrongTh[1],R,rp)),
      NO(P(th[0],th[1],R,rp+1),'One r too many: the integrand contributes '+(rp-1>0?'r^'+(rp-1):rp===1?'1':'1/r')+' and dA contributes r.',PS(th[0],th[1],R,rp+1))];
    if(R===1) opts.splice(2,1);
    return choiceQ(q,opts,'Read the region from the limits, then substitute x² + y² = r² and dA = r dr dθ.',[['',opts[0].h.slice(2,-2)]],CI(`(${gk})*(1 + x + 3*y + x^2 + y^2)`,lims),2);
  }
  const dis=[D_(mv(Rmul(len,[Math.pow(R,rp),rp||1]),1,1),'Forgot the Jacobian r.'),D_(mv(Rmul([2,1],[Math.pow(R,rp+1),rp+1]),1,1),'Used the whole disk (θ from 0 to 2π).'),
    D_(mv(Rmul(len,[Math.pow(R,2*rp+2),rp+1]),1,1),'Integrated r out to R² instead of R.'),D_(mv(Rmul(len,[Math.pow(R,rp+2),rp+2]),1,1),'One power of r too many.'),
    D_(mv(Rmul(angLen('0','pi/4'),[Math.pow(R,rp+1),rp+1]),1,1),'Used θ from 0 to π/4.'),D_(mv(Rmul(len,[2*Math.pow(R,rp+1),rp+1]),1,1),'Doubled for a symmetry that is not there.')];
  return valQ(q,ans,dis,'Read the region from the limits, then x² + y² = r², dA = r dr dθ.',
    [['Region: \\(0\\le r\\le '+R+'\\), \\('+ANG[th[0]].t+'\\le\\theta\\le '+ANG[th[1]].t+'\\).',`\\int_{${ANG[th[0]].t}}^{${ANG[th[1]].t}}\\!\\int_0^{${R}}r^{${rp}}\\,dr\\,d\\theta=${T(ans)}`]],CI(gk,lims),2);
}
/* ---------- 16.3: a disk that is not centred at the origin (F2016-Q5) ---------- */
function P_polOff(){
  const a=pick([1,2,3]), kind=pick(['yhalf','sqrtfull','xhalf','area']);
  const vals={yhalf:Rs(Rr(2*a*a*a,3)),sqrtfull:Rs(Rr(32*a*a*a,9)),xhalf:mv([a*a*a,2],1,1),area:mv([a*a,1],1,1)};
  const ans=vals[kind];
  const gt={yhalf:'y',sqrtfull:'\\sqrt{x^2+y^2}',xhalf:'x',area:'1'}[kind];
  const where=kind==='sqrtfull'||kind==='area'?`inside the circle \\(x^2+y^2=${2*a}x\\)`:`inside the circle \\(x^2+y^2=${2*a}x\\) and above the \\(x\\)-axis`;
  const dis={yhalf:[D_(Rs(Rr(16*a*a*a,3)),'Treated it as a disk centred at the origin with r from 0 to 2a.'),D_('0','Let θ run from 0 to π: there r = 2a cos θ is negative for θ > π/2.'),D_(Rs(Rr(2*a*a,3)),'Forgot the Jacobian r.'),D_(Rs(Rr(4*a*a*a,3)),'Doubled: only the upper half is in the region.'),D_(Rs(Rr(a*a*a,3)),'Integrated cos³θ sin θ to 1/8.')],
    sqrtfull:[D_(Rs(Rr(16*a*a*a,9)),'Integrated over θ from 0 to π/2 only: the circle uses −π/2 ≤ θ ≤ π/2.'),D_(mv([16*a*a*a,3],1,1),'Treated it as a disk centred at the origin of radius 2a.'),D_(Rs(Rr(8*a*a*a,3)),'Integrated cos³θ as cos θ.'),D_('0','Used θ from 0 to 2π, where r = 2a cos θ goes negative.'),D_(Rs(Rr(4*a*a,1)),'Forgot the Jacobian r.')],
    xhalf:[D_(mv([a*a*a,1],1,1),'That is the whole disk; only the upper half is in the region.'),D_(Rs(Rr(2*a*a*a,3)),'That is ∬ y dA.'),D_(mv([3*a*a*a,16],1,1),'Forgot to multiply ∫cos⁴θ by 8a³/3.'),D_(mv([a*a,2],1,1),'Forgot the Jacobian r.'),D_(mv([2*a*a*a,1],1,1),'Doubled twice.')],
    area:[D_(mv([4*a*a,1],1,1),'Used radius 2a: the circle x² + y² = 2ax has radius a.'),D_(mv([2*a*a,1],1,1),'Integrated θ from 0 to π with r = 2a cos θ, and took absolute values.'),D_(mv([a*a,2],1,1),'Integrated θ over (0, π/2) only.'),D_(String(2*a*a),'Forgot that ∫cos²θ produces π.'),D_(mv([a,1],1,1),'Forgot to square.')]}[kind];
  return valQ(`Let \\(D\\) be the region ${where}. Evaluate \\(\\displaystyle\\iint_D ${gt}\\,dA\\).`,ans,dis,
    'x² + y² = 2ax is r = 2a cos θ in polar, traced once for −π/2 ≤ θ ≤ π/2 (a circle of radius a centred at (a, 0)).',
    [['\\(r^2=2ar\\cos\\theta\\ \\Rightarrow\\ r=2a\\cos\\theta\\); the upper half is \\(0\\le\\theta\\le\\pi/2\\).',`\\int\\!\\!\\int_0^{${2*a}\\cos\\theta}${kind==='yhalf'?'r\\sin\\theta':kind==='xhalf'?'r\\cos\\theta':kind==='sqrtfull'?'r':'1'}\\,r\\,dr\\,d\\theta=${T(ans)}`]],
    CI(kind==='yhalf'?'r^2*sin(t)':kind==='xhalf'?'r^2*cos(t)':kind==='sqrtfull'?'r^2':'r',[['r','0',`${2*a}*cos(t)`],['t',kind==='sqrtfull'||kind==='area'?'-pi/2':'0','pi/2']]),3);
}
/* ---------- 16.3: volume between two paraboloids (S2024-Q3, F2018-Q9) and under 1/(1 + r²) ---------- */
function P_polVol(){
  if(coin(0.3)){
    const R2=pick([1,3,8]), ans=R2===1?'pi*ln(2)':R2===3?'pi*ln(4)':'pi*ln(9)';
    const dis=[D_(R2===1?'2pi*ln(2)':R2===3?'2pi*ln(4)':'2pi*ln(9)','Forgot the ½ from u = 1 + r².'),D_(R2===1?'pi^2/2':R2===3?'2pi^2/3':'2pi*atan(sqrt(8))','Integrated 1/(1 + r²) (arctan) without the Jacobian r.'),
      D_(R2===1?'ln(2)':R2===3?'ln(4)':'ln(9)','Lost the 2π from θ.'),D_(R2===1?'pi*ln(2)/2':R2===3?'pi*ln(4)/2':'pi*ln(9)/2','Integrated θ over (0, π).'),D_(R2===1?'pi/2':R2===3?'3pi/4':'8pi/9','Used the value at the edge times the area.')];
    return valQ(`Find the volume of the solid under \\(z=\\dfrac{1}{1+x^2+y^2}\\) and above the disk \\(x^2+y^2\\le ${R2}\\).`,ans,dis,'Polar: V = ∫∫ r/(1 + r²) dr dθ; substitute u = 1 + r².',
      [['',`V=\\int_0^{2\\pi}\\!\\int_0^{\\sqrt{${R2}}}\\frac{r}{1+r^2}\\,dr\\,d\\theta=\\pi\\ln(1+${R2})`]],CI('r/(1 + r^2)',[['r','0',`sqrt(${R2})`],['t','0','2*pi']]),2);
  }
  const A=ri(2,12), B=-ri(0,6), al=pick([1,1,2]), be=pick([1,2,3]); const d=A-B, s=al+be;
  if(d%s!==0&&coin(0.6)) return null;
  const ans=mv([d*d,2*s],1,1);
  const top=`${A} - ${al===1?'':al}(x^2+y^2)`, bot=B===0?`${be===1?'':be}(x^2+y^2)`:`${be===1?'':be}(x^2+y^2) - ${-B}`;
  const dis=[D_(mv([d*d,s],1,1),'Forgot the ½: ∫₀^{R} (d − s r²) r dr = d R²/2 − s R⁴/4 = d²/(4s).'),D_(mv([d*d,4*s],1,1),'Forgot the 2π from θ (used π).'),
    D_(mv([d,s],1,1),'Stopped at πR² (the area of the shadow).'),D_(mv([d*d,2*al],1,1),'Used only the top surface’s coefficient to find where they meet.'),D_(mv([d*d*d,6*s*s],1,1),'Integrated with the wrong power of r.'),D_(mv([A*A,2*al],1,1),'Ignored the lower surface (volume down to z = 0).')];
  return valQ(`Find the volume of the solid bounded by \\(z=${top.replace(/\(x\^2\+y\^2\)/g,'(x^2+y^2)')}\\) and \\(z=${bot}\\).`,ans,dis,
    'Where do the surfaces meet? Set them equal: r² = (A − B)/(α + β). Then V = ∫∫ (top − bottom) r dr dθ.',
    [['They meet where \\('+A+'-'+al+'r^2='+B+'+'+be+'r^2\\), so \\(r^2='+Rs(Rr(d,s))+'\\).',`V=\\int_0^{2\\pi}\\!\\int_0^{\\sqrt{${Rs(Rr(d,s))}}}(${d}-${s}r^2)\\,r\\,dr\\,d\\theta=${T(ans)}`]],
    CI(`(${d} - ${s}*r^2)*r`,[['r','0',`sqrt(${d}/${s})`],['t','0','2*pi']]),2);
}
/* ---------- 16.3: areas of polar regions (sprint, 16.3 #47–52) ---------- */
function P_polArea(){
  const a=pick([1,2,3]), kind=pick(['card','petal','circ']);
  if(kind==='card'){ const ans=mv([3*a*a,2],1,1);
    return valQ(`Find the area enclosed by the cardioid \\(r=${a===1?'':a}(1+\\cos\\theta)\\).`,ans,[D_(mv([3*a*a,4],1,1),'Forgot the ½ in A = ½∫r² dθ… then halved again.'),D_(mv([a*a,1],1,1),'Dropped the cos² term.'),D_(mv([3*a*a,1],1,1),'Forgot the ½ in A = ½∫r² dθ.'),D_(mv([2*a*a,1],1,1),'∫cos²θ over a full turn is π, not 0.')],
      'A = ½∫ r² dθ over one full trace (0 to 2π).',[['',`A=\\tfrac12\\int_0^{2\\pi}${a*a}(1+\\cos\\theta)^2\\,d\\theta=${T(ans)}`]],CI('r',[['r','0',`${a}*(1 + cos(t))`],['t','0','2*pi']]),2); }
  if(kind==='petal'){ const n=pick([2,3]), ans=mv([a*a,4*n],1,1);
    return valQ(`Find the area of one petal of the rose \\(r=${a===1?'':a}\\cos(${n}\\theta)\\).`,ans,[D_(mv([a*a,2*n],1,1),'Forgot the ½ in A = ½∫r² dθ.'),D_(mv([a*a,4],1,1),'Used −π/4 ≤ θ ≤ π/4 regardless of n.'),D_(mv([a*a,8*n],1,1),'Halved twice.'),D_(Rs(Rr(a*a,n)),'Forgot that ∫cos² gives a π.')],
      'One petal: −π/(2n) ≤ θ ≤ π/(2n), where cos(nθ) ≥ 0. A = ½∫ r² dθ.',[['',`A=\\tfrac12\\int_{-\\pi/${2*n}}^{\\pi/${2*n}}${a*a}\\cos^2(${n}\\theta)\\,d\\theta=${T(ans)}`]],CI('r',[['r','0',`${a}*cos(${n}*t)`],['t',`-pi/${2*n}`,`pi/${2*n}`]]),2); }
  const ans=mv([a*a,1],1,1);
  return valQ(`Use a polar double integral to find the area inside \\(r=${2*a}\\sin\\theta\\).`,ans,[D_(mv([4*a*a,1],1,1),'The circle r = 2a sin θ has radius a, not 2a.'),D_(mv([2*a*a,1],1,1),'Integrated θ from 0 to 2π (the circle is traced twice).'),D_(mv([a*a,2],1,1),'Integrated θ from 0 to π/2 only.')],
    'r = 2a sin θ is a circle of radius a, traced once for 0 ≤ θ ≤ π.',[['',`A=\\int_0^{\\pi}\\!\\int_0^{${2*a}\\sin\\theta}r\\,dr\\,d\\theta=${T(ans)}`]],CI('r',[['r','0',`${2*a}*sin(t)`],['t','0','pi']]),1);
}
/* ---------- 16.1: basic iterated integrals (sprint warm-ups, 16.1 #7–24) ---------- */
function P_iter(){
  const a=ri(1,3), b=ri(1,3), m=ri(0,3), n=ri(0,2), c=nz(1,4);
  const ans=Rs(Rmul([c,1],Rmul(Rr(Math.pow(a,m+1),m+1),Rr(Math.pow(b,n+1),n+1))));
  const f=mono(c,{x:m,y:n});
  return valQ(`Evaluate \\(\\displaystyle\\int_0^{${a}}\\!\\int_0^{${b}}${T(f)}\\,dy\\,dx\\).`,ans,
    [D_(Rs(Rmul([c,1],Rmul(Rr(Math.pow(b,m+1),m+1),Rr(Math.pow(a,n+1),n+1)))),'Swapped the limits: y runs from 0 to '+b+'.'),D_(Rs(Rmul([c,1],Rr(Math.pow(a,m+1)*Math.pow(b,n+1),1))),'Forgot to divide by the new powers.'),
     D_(Rs(Rmul([c,1],Rmul(Rr(Math.pow(a,m),m||1),Rr(Math.pow(b,n),n||1)))),'Differentiated instead of integrating.')],
    'Inner integral first (y), treating x as a constant; then the outer.',[['',`\\int_0^{${a}}\\!\\int_0^{${b}}${T(f)}\\,dy\\,dx=${T(ans)}`]],CI(f,[['y','0',String(b)],['x','0',String(a)]]),1);
}
function P_iterVar(){
  const a=pick([1,2,3]), k=pick([1,2]), g=pick(['x','y','1']);
  const top=k===1?'x':'x^2', topT=k===1?'x':'x^2';
  const v={x:k===1?Rr(Math.pow(a,3),3):Rr(Math.pow(a,4),4),y:k===1?Rr(Math.pow(a,3),6):Rr(Math.pow(a,5),10),'1':k===1?Rr(a*a,2):Rr(Math.pow(a,3),3)}[g];
  return valQ(`Evaluate \\(\\displaystyle\\int_0^{${a}}\\!\\int_0^{${topT}}${g}\\,dy\\,dx\\).`,Rs(v),
    [D_(Rs(Rmul(v,[2,1])),'Lost a ½.'),D_(Rs(Rmul(v,[1,2])),'Extra ½.'),D_(Rs(Rr(Math.pow(a,2),1)),'Treated the inner upper limit as a constant.')],
    'Inner integral in y with x fixed: the limits become functions of x.',[['',`=${T(Rs(v))}`]],CI(g,[['y','0',top],['x','0',String(a)]]),1);
}
