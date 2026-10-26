
/* =====================================================================
   DIAGNOSTIC: the Exam 1 material as 27 core concepts. Each concept has
   quick "idea" questions (do you know what the tool is and when it applies)
   and draws one-step "skill" questions from the sprint generators (lv ≤ 2).
   ===================================================================== */
/* w = how likely the concept is to carry an Exam 1 question (pattern model), sk = sprint generators for skill items */
const DCON=[
  {id:'par',  name:'Parametric curves',                 sec:'12.1',   ch:13, w:.30, topic:'Parametric curves', core:'Eliminate t (solve for t, or use cos²t + sin²t = 1) to see the curve; a cos t, b sin t traces an ellipse.',sk:['par-elim','par-circle']},
  {id:'vec',  name:'Vector basics: length, unit vectors',sec:'13.1–13.2',ch:13,w:.35,topic:'Vectors',core:'|v| = √(v₁² + v₂² + v₃²); unit vector v/|v|; PQ = Q − P; parallel means a scalar multiple.',sk:['vec-comb','vec-mag','vec-unit','vec-scale']},
  {id:'sph',  name:'Spheres: center and radius',        sec:'13.2',   ch:13, w:.25, topic:'Vectors',core:'(x − a)² + (y − b)² + (z − c)² = r²: center (a, b, c), radius r; complete the square to get this form.',sk:['sphere-eq','sphere-center']},
  {id:'dot',  name:'Dot product and angles',            sec:'13.3',   ch:13, w:.40, topic:'Dot product',core:'u·v = Σuᵢvᵢ = |u||v|cos θ; its sign tells acute/right/obtuse; u·v = 0 ⇔ orthogonal.',sk:['dot-def','dot-angle','vec-parperp']},
  {id:'proj', name:'Projections',                       sec:'13.3',   ch:13, w:.35, topic:'Dot product',core:'scal_v u = u·v/|v| (a number); proj_v u = (u·v/|v|²) v (a vector along v).',sk:['dot-proj']},
  {id:'cross',name:'Cross product: direction and area', sec:'13.4',   ch:13, w:.40, topic:'Cross product',core:'u × v is perpendicular to u and v, |u × v| = area of the parallelogram; v × u = −u × v.',sk:['cross-comp','cross-ijk','cross-area','cross-unitnormal','triple']},
  {id:'line', name:'Lines in space',                    sec:'13.5',   ch:13, w:.80, topic:'Lines',core:'r(t) = P + t d: a point and a direction; the t-coefficients are the direction.',sk:['line-thru','line-rel']},
  {id:'plane',name:'Planes',                            sec:'13.5',   ch:13, w:.60, topic:'Planes',core:'a(x − x₀) + b(y − y₀) + c(z − z₀) = 0 with normal ⟨a, b, c⟩; normal from a cross product of two in-plane vectors.',sk:['plane-thru','plane-axes','planes-rel','plane-angle','line-plane-pt','dist-pt-plane']},
  {id:'quad', name:'Quadric surfaces',                  sec:'13.6',   ch:13, w:.90, topic:'Quadric surfaces',core:'Put every squared term on one side and read the signs: all + ellipsoid, one − one sheet, two − two sheets, = 0 cone, a linear variable paraboloid.',sk:['quad-name','quad-trace']},
  {id:'vf',   name:'Vector functions: domain and shape',sec:'14.1',   ch:14, w:.40, topic:'Vector functions',core:'Work component by component: the domain is the intersection; x² + y² = R² with z = ct is a helix.',sk:['vf-seg','vf-limit','vf-domain','vf-plane-meet','vf-surface']},
  {id:'tan',  name:'Derivatives and tangent lines',     sec:'14.2',   ch:14, w:.35, topic:'Derivatives of r(t)',core:'The tangent vector is r′(t₀); tangent line r(t₀) + s r′(t₀); unit tangent r′/|r′|.',sk:['vf-deriv','vf-T0','vf-tanline','vf-prodrule']},
  {id:'vint', name:'Integrals of vector functions',     sec:'14.2',   ch:14, w:.30, topic:'Integrals of r(t)',core:'Integrate each component and add a constant vector fixed by the initial condition.',sk:['vf-integral']},
  {id:'vel',  name:'Velocity, speed, acceleration',     sec:'14.3',   ch:14, w:.60, topic:'Motion',core:'v = r′, speed = |r′| (a number), a = r″.',sk:['motion-vsa','motion-sphere']},
  {id:'mot',  name:'Motion from acceleration; projectiles',sec:'14.3',ch:14, w:.80, topic:'Motion',core:'Integrate a to get v (use v₀), integrate v to get r (use r₀); for projectiles set vertical velocity 0 at the top.',sk:['proj']},
  {id:'arc',  name:'Arc length',                        sec:'14.4',   ch:14, w:.65, topic:'Arc length',core:'L = ∫|r′(t)| dt; exam curves make |r′| constant or a perfect square.',sk:['arclen']},
  {id:'curv', name:'Curvature',                         sec:'14.5',   ch:14, w:.80, topic:'Curvature',core:'κ = |r′ × r″|/|r′|³; a circle of radius R has κ = 1/R, a line has κ = 0.',sk:['curv-helix','curv-yfx']},
  {id:'lvl',  name:'Domains and level curves',          sec:'15.1',   ch:15, w:.45, topic:'Domains & level curves',core:'Domain: what you may plug in (roots ≥ 0, logs > 0, no division by 0). Level curves: set f = c.',sk:['f-domain','f-level','f-level-shape']},
  {id:'lim',  name:'Limits and continuity',             sec:'15.2',   ch:15, w:.95, topic:'Limits',core:'Continuous functions: plug in. 0/0: factor, squeeze with x² ≤ x² + y², or substitute u = x² + y². Two paths with different limits ⇒ DNE.',sk:['lim-cont','lim-factor']},
  {id:'pd',   name:'Partial derivatives',               sec:'15.3',   ch:15, w:.60, topic:'Partial derivatives',core:'∂f/∂x treats y as a constant; mixed partials are equal (Clairaut).',sk:['pd-first','pd-eval','pd-second','pd-3var']},
  {id:'chain',name:'Chain rule',                        sec:'15.4',   ch:15, w:.55, topic:'Chain rule',core:'One term per intermediate variable: dz/dt = f_x x′ + f_y y′ (+ f_z z′).',sk:['chain-t']},
  {id:'impl', name:'Implicit differentiation',          sec:'15.4',   ch:15, w:.45, topic:'Chain rule',core:'Write F = 0; then dy/dx = −F_x/F_y and ∂z/∂x = −F_x/F_z.',sk:['implicit2']},
  {id:'grad', name:'Gradient and directional derivatives',sec:'15.5', ch:15, w:.95, topic:'Gradient',core:'∇f = ⟨f_x, f_y(, f_z)⟩; D_u f = ∇f · u with u a UNIT vector.',sk:['grad2','dirderiv','grad3']},
  {id:'steep',name:'Steepest ascent and level curves',  sec:'15.5',   ch:15, w:.70, topic:'Gradient',core:'f increases fastest along ∇f at rate |∇f|, decreases fastest along −∇f, and ∇f is perpendicular to level curves.',sk:['steepest','zero-change']},
  {id:'tp',   name:'Tangent planes',                    sec:'15.6',   ch:15, w:.70, topic:'Tangent planes',core:'z = f(a,b) + f_x(x − a) + f_y(y − b); for F(x,y,z) = 0 the normal is ∇F.',sk:['tp-graph','tp-surface']},
  {id:'lin',  name:'Linear approximation and differentials',sec:'15.6',ch:15,w:.35, topic:'Tangent planes',core:'L = f(a,b) + f_x Δx + f_y Δy; dz = f_x dx + f_y dy.',sk:['linapprox','differential']},
  {id:'crit', name:'Critical points and the second-derivative test',sec:'15.7',ch:15,w:.85,topic:'Max & min',core:'Critical points: ∇f = 0. D = f_xx f_yy − f_xy²: D < 0 saddle, D > 0 min/max by the sign of f_xx, D = 0 no conclusion.',sk:['crit-points','crit-classify','second-test']},
  {id:'abs',  name:'Absolute extrema on a region',      sec:'15.7',   ch:15, w:.25, topic:'Max & min',core:'On a closed bounded region compare f at interior critical points and at the extreme points of the boundary.',sk:[]}
];
const DIDX={}; DCON.forEach((c,i)=>DIDX[c.id]=i);
const DIDEA={}; DCON.forEach(c=>DIDEA[c.id]=[]);
const addI=(cid,fn)=>DIDEA[cid].push(fn);
/* an idea question: key + distractors [html, why]; options are shuffled by the engine */
function DQ(q,key,dis,how,lv){
  const seen=new Set([key]), opts=[{h:key,ok:true,why:''}];
  for(const [h,why] of dis){ if(seen.has(h)) continue; seen.add(h); opts.push({h,ok:false,why}); if(opts.length===5) break; }
  if(opts.length<4) return null;
  return {q,kind:'choice',opts,ans:key,lv:lv||1,how,sol:[[how,'']]};
}
const M_=s=>'\\('+s+'\\)';
const sg=(c,v)=>c===0?'':(c<0?'-':'+')+(Math.abs(c)===1?'':Math.abs(c))+v;   /* signed term for building LaTeX */
const lead=(c,v)=>(c<0?'-':'')+(Math.abs(c)===1?'':Math.abs(c))+v;

/* ---------------- 12.1 parametric curves ---------------- */
addI('par',()=>{ const a=ri(2,5), b=pick([a,ri(2,5)]), circ=a===b;
  return DQ(`What curve does ${m`x=${a}\cos t,\ y=${b}\sin t,\ 0\le t\le 2\pi`} trace?`,circ?`A circle of radius ${a}`:`An ellipse ${M_(`\\frac{x^2}{${a*a}}+\\frac{y^2}{${b*b}}=1`)}`,
    [[circ?`An ellipse with axes ${a} and ${a+1}`:`A circle of radius ${a}`,circ?'Equal coefficients on cos and sin give a circle.':'Different coefficients stretch the circle into an ellipse.'],['A line segment','Use cos²t + sin²t = 1: the points satisfy a curved equation.'],['A parabola','Eliminating t with cos² + sin² = 1 gives a sum of squares, not y = x².'],[`A hyperbola ${M_(`\\frac{x^2}{${a*a}}-\\frac{y^2}{${b*b}}=1`)}`,'cos² + sin² = 1 gives a PLUS sign.']],
    `Divide by the coefficients and use cos²t + sin²t = 1: (x/${a})² + (y/${b})² = 1.`); });
addI('par',()=>{ const p=nz(-4,4);
  return DQ(`Eliminate the parameter: ${m`x=${tex(sumS(['t',String(p)]))},\ y=t^2`}.`,M_(`y=${tex(`(x ${p>0?'-':'+'} ${Math.abs(p)})^2`)}`),
    [[M_(`y=${tex(`(x ${p>0?'+':'-'} ${Math.abs(p)})^2`)}`),`Solve x = t ${p>0?'+':'−'} ${Math.abs(p)} for t first: t = x ${p>0?'−':'+'} ${Math.abs(p)}.`],[M_(`y=x^2${p>0?'-':'+'}${Math.abs(p)}`),'Substitute the whole expression for t, then square it.'],[M_(`x=(y ${p>0?'-':'+'} ${Math.abs(p)})^2`),'x and y are swapped.'],[M_('y=x^2'),'The shift matters.']],
    'Solve one equation for t and substitute into the other.'); });

/* ---------------- 13.1–13.2 vectors ---------------- */
addI('vec',()=>{ const [a,b,c]=pick([[3,4,5],[5,12,13],[6,8,10],[8,15,17]]), s=[pick([1,-1]),pick([1,-1])], v=[s[0]*a,s[1]*b];
  return DQ(`Which is the unit vector in the direction of ${m`\mathbf v=${vt(v)}`}?`,M_(tex(V(frac(v[0],c),frac(v[1],c)))),
    [[M_(tex(V(frac(v[0],c*c),frac(v[1],c*c)))),'Divide by |v| = '+c+', not |v|² = '+c*c+'.'],[M_(tex(V(frac(v[1],c),frac(v[0],c)))),'Components swapped.'],[M_(tex(V(frac(v[0],a+b),frac(v[1],a+b)))),'|v| = √(a² + b²), not a + b.'],[M_(tex(V(v[0]/Math.abs(v[0]),v[1]/Math.abs(v[1])))),'That vector has length √2, not 1, and points elsewhere.']],
    'u = v / |v|; here |v| = '+c+'.'); });
addI('vec',()=>{ const v=rv(3,-4,4,true), k=pick([2,-2,3,-3]); if(v[0]===v[1]||v[1]===v[2]||v[0]===v[2]) return null;
  const par=v.map(x=>k*x), perm=[v[1],v[0],v[2]], plus=v.map((x,i)=>i===0?x+1:x), negOne=v.map((x,i)=>i===1?-x:x);
  return DQ(`Which vector is parallel to ${m`${vt(v)}`}?`,M_(vt(par)),[[M_(vt(perm)),'Parallel means a scalar multiple of every component, in the same order.'],[M_(vt(plus)),'Adding to one component changes the direction.'],[M_(vt(negOne)),'Flipping the sign of just one component changes the direction.'],[M_(vt(v.map(x=>x*x))),'Squaring components is not scaling.']],
    'Parallel vectors are scalar multiples: w = k v (k may be negative).'); });
addI('vec',()=>{ const P=rv(3,-4,4), Q=rv(3,-4,4); if(P.join()===Q.join()) return null; const d=subA(Q,P);
  return DQ(`What is the vector ${m`\overrightarrow{PQ}`} from ${mp(P)} to ${mp(Q)}?`,M_(vt(d)),[[M_(vt(subA(P,Q))),'That is QP: subtract the START point from the END point.'],[M_(vt(addA(P,Q))),'Subtract, don’t add.'],[M_(vt(Q)),'That is the position of Q, not the displacement.'],[M_(vt(P)),'That is the position of P.']],
    'PQ = Q − P (end minus start).'); });

/* ---------------- 13.2 spheres ---------------- */
addI('sph',()=>{ const C=rv(3,-5,5), r=ri(2,6), eq=`${['x','y','z'].map((v,i)=>C[i]?`(${v} ${C[i]>0?'-':'+'} ${Math.abs(C[i])})^2`:`${v}^2`).join(' + ')} = ${r*r}`;
  return DQ(`The sphere ${mk(eq)} has`,`center ${mp(C)} and radius ${r}`,[[`center ${mp(C.map(x=>-x))} and radius ${r}`,'(x − a)² puts the center at +a: the sign flips.'],[`center ${mp(C)} and radius ${r*r}`,'The right side is r²; the radius is its square root.'],[`center ${mp(C.map(x=>-x))} and radius ${r*r}`,'Both the sign of the center and the radius are off.'],[`center ${mp([0,0,0])} and radius ${r}`,'The shifts move the center.']],
    '(x − a)² + (y − b)² + (z − c)² = r² is the sphere with center (a, b, c) and radius r.'); });

/* ---------------- 13.3 dot product ---------------- */
addI('dot',()=>{ const kind=pick(['neg','zero','pos']); let u,v;
  for(;;){ u=rv(3,-3,3,true); v=rv(3,-3,3); const d=dotA(u,v); if(!n2(v)||!n2(crossA(u,v))) continue; if((kind==='neg'&&d<0)||(kind==='zero'&&d===0)||(kind==='pos'&&d>0)) break; }
  const d=dotA(u,v), key=kind==='neg'?'obtuse (between 90° and 180°)':kind==='zero'?'a right angle (90°)':'acute (less than 90°)';
  return DQ(`For ${m`\mathbf u=${vt(u)}`} and ${m`\mathbf v=${vt(v)}`}, the angle between them is`,key,[['acute (less than 90°)','u · v = '+d+'; cos θ has the same sign as u · v.'],['a right angle (90°)','u · v = '+d+(d?', not 0.':'.')],['obtuse (between 90° and 180°)','u · v = '+d+'; cos θ has the same sign as u · v.'],['impossible to tell without the lengths','The SIGN of u · v already decides acute, right or obtuse.']],
    'cos θ = u·v/(|u||v|): u·v > 0 acute, = 0 right angle, < 0 obtuse. Here u·v = '+d+'.'); });
addI('dot',()=>{ const u=rv(3,-3,3,true); let perp; for(;;){ perp=rv(3,-3,3); if(n2(perp)&&dotA(u,perp)===0) break; }
  const bad=()=>{ for(;;){ const w=rv(3,-3,3); if(n2(w)&&dotA(u,w)!==0) return w; } };
  const b1=bad(), b2=bad(), b3=u.map(x=>2*x);
  return DQ(`Which vector is orthogonal to ${m`${vt(u)}`}?`,M_(vt(perp)),[[M_(vt(b1)),'Its dot product with u is '+dotA(u,b1)+', not 0.'],[M_(vt(b2)),'Its dot product with u is '+dotA(u,b2)+', not 0.'],[M_(vt(b3)),'That is PARALLEL to u.'],[M_(vt(u.map(x=>-x))),'That is parallel (opposite direction).']],
    'Orthogonal ⇔ dot product 0.'); });
addI('dot',()=>DQ('Which statement about \\(\\mathbf u\\cdot\\mathbf v\\) is true?',M_('\\mathbf u\\cdot\\mathbf v=|\\mathbf u||\\mathbf v|\\cos\\theta')+', a scalar',
  [[M_('\\mathbf u\\cdot\\mathbf v=|\\mathbf u||\\mathbf v|\\sin\\theta')+', a scalar','sin θ belongs to |u × v|.'],['It is a vector perpendicular to both','That describes u × v.'],[M_('\\mathbf u\\cdot\\mathbf v=|\\mathbf u|+|\\mathbf v|'),'The dot product multiplies matching components and adds.'],[M_('\\mathbf u\\cdot\\mathbf u=|\\mathbf u|'),'u · u = |u|², not |u|.']],'u · v = u₁v₁ + u₂v₂ + u₃v₃ = |u||v| cos θ, a number.'));

/* ---------------- 13.3 projections ---------------- */
addI('proj',()=>DQ('The vector projection of \\(\\mathbf u\\) onto \\(\\mathbf v\\) is',M_('\\dfrac{\\mathbf u\\cdot\\mathbf v}{|\\mathbf v|^2}\\,\\mathbf v'),
  [[M_('\\dfrac{\\mathbf u\\cdot\\mathbf v}{|\\mathbf v|}\\,\\mathbf v'),'Divide by |v|² (or use the unit vector v/|v| twice).'],[M_('\\dfrac{\\mathbf u\\cdot\\mathbf v}{|\\mathbf u|^2}\\,\\mathbf u'),'That projects v onto u.'],[M_('\\dfrac{\\mathbf u\\cdot\\mathbf v}{|\\mathbf v|}'),'That is the SCALAR component, a number.'],[M_('(\\mathbf u\\cdot\\mathbf v)\\,\\mathbf v'),'Missing the division by |v|².']],'proj_v u = (u·v/|v|²) v: it points along v.'));
addI('proj',()=>{ const v=pick([[3,4,0],[0,3,4],[1,2,2],[2,1,2]]).map(x=>x*pick([1,-1])), s=pick([1,-1]);
  return DQ(`${m`\operatorname{proj}_{\mathbf v}\mathbf u`} for ${m`\mathbf v=${vt(v)}`} is always parallel to`,M_('\\mathbf v'),[[M_('\\mathbf u'),'The projection lies along the vector you project ONTO.'],[M_('\\mathbf u\\times\\mathbf v'),'That is perpendicular to v.'],[M_('\\mathbf u-\\mathbf v'),'Not in general.'],['nothing in particular; it depends on u','It is always a multiple of v (possibly 0).']],'proj_v u is a scalar multiple of v.'); });
addI('proj',()=>{ const v=pick([[3,4],[4,3],[6,8],[5,12]]), n=Math.hypot(...v), u=rv(2,-4,5,true), d=dotA(u,v);
  return DQ(`The scalar component of ${m`\mathbf u=${vt(u)}`} in the direction of ${m`\mathbf v=${vt(v)}`} is`,M_(tex(frac(d,n))),[[M_(tex(frac(d,n*n))),'Divide by |v| = '+n+', not |v|².'],[M_(String(d)),'Divide u · v by |v|.'],[M_(tex(surd(d,n2(u),n2(u)))),'Divide by |v|, not |u|.'],[M_(tex(frac(-d,n))),'Sign slip.']],
    'scal_v u = u·v/|v|.',2); });

/* ---------------- 13.4 cross product ---------------- */
addI('cross',()=>DQ('For nonzero, non-parallel \\(\\mathbf u\\) and \\(\\mathbf v\\), the vector \\(\\mathbf u\\times\\mathbf v\\) is',
  'perpendicular to both \\(\\mathbf u\\) and \\(\\mathbf v\\)',[['parallel to \\(\\mathbf u+\\mathbf v\\)','u × v is normal to the plane that contains u and v.'],['a scalar equal to \\(|\\mathbf u||\\mathbf v|\\sin\\theta\\)','That is its LENGTH; u × v itself is a vector.'],['equal to \\(\\mathbf v\\times\\mathbf u\\)','v × u = −(u × v).'],['perpendicular to \\(\\mathbf u\\) only','It is perpendicular to both factors.']],'u × v ⟂ u and v; |u × v| = |u||v| sin θ; v × u = −u × v.'));
addI('cross',()=>{ const pairs=[['\\mathbf i','\\mathbf j','\\mathbf k'],['\\mathbf j','\\mathbf k','\\mathbf i'],['\\mathbf k','\\mathbf i','\\mathbf j']], p=pick(pairs), rev=coin();
  const [A,B,C]=p, key=rev?'-'+C:C;
  return DQ(`${m`${rev?B:A}\times ${rev?A:B}=`}`,M_(key),[[M_(rev?C:'-'+C),rev?'Reversing the order flips the sign: '+'j × i = −k etc.':'Cyclic order i → j → k gives +.'],[M_('\\mathbf 0'),'Only parallel vectors give 0.'],[M_(A),'The result is perpendicular to both factors.'],[M_('1'),'The cross product is a vector.']],'i × j = k, j × k = i, k × i = j; reversing the order flips the sign.'); });
addI('cross',()=>{ const u=[ri(1,4),0,0], v=[ri(-3,3),ri(1,4),0], A=Math.abs(u[0]*v[1]);
  return DQ(`The area of the parallelogram spanned by ${m`${vt(u)}`} and ${m`${vt(v)}`} is`,M_(String(A)),[[M_(tex(frac(A,2))),'That is the TRIANGLE’s area.'],[M_(String(Math.abs(dotA(u,v))||A+1)),'Area uses |u × v|, not u · v.'],[M_(String(A*A)),'|u × v| is already the area; no squaring.'],[M_(tex(surd(u[0],1,n2(v)))),'|u||v| ignores the angle (sin θ).']],
    'Area = |u × v|; the triangle is half of it.'); });

/* ---------------- 13.5 lines ---------------- */
addI('line',()=>{ const p=rv(3,-5,5), d=rv(3,-4,4,true); if(!n2(crossA(p,d))||!n2(crossA(addA(p,d),d))) return null;
  const L=`x=${tex(lin(p[0],d[0]))},\\ y=${tex(lin(p[1],d[1]))},\\ z=${tex(lin(p[2],d[2]))}`;
  return DQ(`A direction vector for the line ${m`${L}`} is`,M_(vt(d)),[[M_(vt(p)),'That is a point on the line (t = 0).'],[M_(vt(addA(p,d))),'That is the point at t = 1.'],[M_(vt(d.map((x,i)=>i===1?-x:x))),'Keep the signs of the t-coefficients.'],[M_(vt([d[1],d[0],d[2]])),'Components out of order.']],'The coefficients of t form the direction vector.'); });
addI('line',()=>{ const P=rv(3,-4,4), d=rv(3,-3,3,true); if(!n2(crossA(P,d))) return null;
  return DQ(`Which is the line through ${mp(P)} parallel to ${m`${vt(d)}`}?`,M_(`\\mathbf r(t)=${vt(P)}+t${vt(d)}`),[[M_(`\\mathbf r(t)=${vt(d)}+t${vt(P)}`),'Point and direction are swapped.'],[M_(`\\mathbf r(t)=t${vt(addA(P,d))}`),'That passes through the origin, not P.'],[M_(`\\mathbf r(t)=${vt(P)}\\cdot t${vt(d)}`),'A line is point + t·direction, a vector sum.'],[M_(`\\mathbf r(t)=${vt(P)}+t${vt(P)}`),'The direction must be the given vector.']],'r(t) = P + t d.'); });
addI('line',()=>DQ('Two lines in space that never intersect and are not parallel are called','skew',[['parallel','Parallel lines have parallel direction vectors.'],['orthogonal','Orthogonal is about the angle between directions; such lines can still meet.'],['coincident','Coincident lines are the same line.'],['impossible — non-parallel lines always meet','In 3-D they can pass each other at different heights.']],'In 3-D, lines are parallel, intersecting, or skew.'));

/* ---------------- 13.5 planes ---------------- */
addI('plane',()=>{ const n=rv(3,-5,5,true), d=ri(-9,9); if(n[0]===n[1]&&n[1]===n[2]) return null; const _u=0, eq=`${tex(sumS([mono(n[0],{x:1}),mono(n[1],{y:1}),mono(n[2],{z:1})]))}=${d}`;
  return DQ(`A normal vector to the plane ${m`${eq}`} is`,M_(vt(n)),[[M_(vt(n.map((x,i)=>i===1?-x:x))),'Read the coefficients with their signs.'],[M_(vt([n[0],n[1],d])),'The constant is not part of the normal.'],[M_(vt([d,d,d])),'The normal is the coefficient vector ⟨a, b, c⟩.'],[M_(vt([n[1],n[0],n[2]])),'Coefficients out of order.']],'ax + by + cz = d has normal ⟨a, b, c⟩.'); });
addI('plane',()=>{ const n=rv(3,-4,4,true), d=ri(-6,6), k=pick([2,-2,3]); if(n[0]===n[1]||n[1]===n[2]||n[0]===n[2]) return null;
  const E=(nn,dd)=>M_(`${tex(sumS([mono(nn[0],{x:1}),mono(nn[1],{y:1}),mono(nn[2],{z:1})]))}=${dd}`);
  let perp; for(;;){ perp=rv(3,-3,3); if(n2(perp)&&dotA(perp,n)===0) break; }
  return DQ(`Which plane is parallel to ${E(n,d)}?`,E(n.map(x=>k*x),k*d+1),[[E(perp,d),'Its normal is perpendicular to ⟨'+n+'⟩, so the planes are perpendicular.'],[E([n[0],n[2],n[1]],d+1),'Parallel planes need parallel normals, component for component.'],[E(n.map((x,i)=>i===0?x+1:x),d),'Changing one coefficient tilts the plane.'],[E([n[1],n[0],n[2]],d),'Coefficients rearranged: a different normal.']],
    'Planes are parallel when their normal vectors are parallel (scalar multiples).'); });
addI('plane',()=>DQ('To write the plane through three points \\(P,Q,R\\), a normal vector is',M_('\\overrightarrow{PQ}\\times\\overrightarrow{PR}'),
  [[M_('\\overrightarrow{PQ}\\cdot\\overrightarrow{PR}'),'The dot product is a number, not a vector.'],[M_('\\overrightarrow{PQ}+\\overrightarrow{PR}'),'That lies IN the plane.'],[M_('P\\times Q'),'Use vectors that lie in the plane (differences of the points).'],[M_('\\operatorname{proj}_{\\overrightarrow{PR}}\\overrightarrow{PQ}'),'That also lies in the plane.']],'The cross product of two vectors in the plane is normal to it.'));

/* ---------------- 13.6 quadrics ---------------- */
addI('quad',()=>{ const a=ri(1,4), b=ri(1,4), c=ri(1,4);
  const T=pick([['one','Hyperboloid of one sheet',`${a}x^2+${b}y^2-${c}z^2=1`],['two','Hyperboloid of two sheets',`-${a}x^2-${b}y^2+${c}z^2=1`],['cone','Elliptic cone',`${a}x^2+${b}y^2-${c}z^2=0`],['ell','Ellipsoid',`${a}x^2+${b}y^2+${c}z^2=1`],['ep','Elliptic paraboloid',`z=${a}x^2+${b}y^2`],['hp','Hyperbolic paraboloid',`z=${a}x^2-${b}y^2`],['cyl','Elliptic cylinder',`${a}x^2+${b}y^2=1`]]);
  const all=['Hyperboloid of one sheet','Hyperboloid of two sheets','Elliptic cone','Ellipsoid','Elliptic paraboloid','Hyperbolic paraboloid','Elliptic cylinder'];
  const why='Count the squared variables and their signs: all + = 1 ellipsoid; one − with = 1 one sheet; two − with = 1 two sheets; = 0 cone; a first-power variable → paraboloid; a missing variable → cylinder.';
  return DQ(`Identify the surface ${m`${T[2].replace(/(^|[^0-9])1([xyz])/g,'$1$2')}`}.`,T[1],shuf(all.filter(x=>x!==T[1])).map(x=>[x,why]),why); });
addI('quad',()=>{ const a=ri(1,3), b=ri(1,3);
  return DQ(`The traces of ${m`z=${a===1?'':a}x^2-${b===1?'':b}y^2`} in the planes ${m`z=k`} (${m`k\ne0`}) are`,'hyperbolas',[['ellipses','x² and y² have opposite signs.'],['parabolas','Parabolas are the traces in x = k or y = k.'],['circles','Opposite signs rule out circles.'],['lines','Only k = 0 gives a pair of lines.']],'Fix z = k: then a x² − b y² = k is a hyperbola.'); });

/* ---------------- 14.1 vector functions ---------------- */
addI('vf',()=>{ const a=ri(0,3), b=a+ri(2,5);
  return DQ(`The domain of ${m`\mathbf r(t)=\left\langle \sqrt{t-${a}},\ \ln(${b}-t),\ t^2\right\rangle`.replace('t-0','t')} is`,M_(`[${a},${b})`),[[M_(`(${a},${b})`),'√0 is fine, so t = '+a+' is included.'],[M_(`[${a},${b}]`),'ln 0 is undefined, so t = '+b+' is excluded.'],[M_(`[${a},\\infty)`),'ln('+b+' − t) needs t < '+b+'.'],[M_('(-\\infty,\\infty)'),'Each component has restrictions.']],'The domain of r is the intersection of the component domains.'); });
addI('vf',()=>{ const R=ri(2,5), c=nz(-4,4);
  return DQ(`The curve ${m`\mathbf r(t)=\langle ${R}\cos t,\ ${R}\sin t,\ ${c}\rangle`} is`,`a circle of radius ${R} in the plane ${M_('z='+c)}`,[[`a helix around the z-axis`,'z is constant, so the curve does not climb.'],[`a circle of radius ${R} in the xy-plane`,'It sits at height z = '+c+'.'],[`a line parallel to the z-axis`,'x and y trace a circle.'],[`a circle of radius ${R*R} in the plane ${M_('z='+c)}`,'x² + y² = '+R*R+' means radius '+R+'.']],'x² + y² = R² with z constant: a horizontal circle.'); });
addI('vf',()=>{ const c=ri(2,5);
  return DQ(`The curve ${m`\mathbf r(t)=\langle \cos t,\ \sin t,\ ${c}t\rangle`} is`,'a helix around the z-axis',[['a circle','z = '+c+'t keeps increasing.'],['a spiral in the xy-plane','x² + y² = 1 stays constant; the radius does not grow.'],['a straight line','x and y go around a circle.'],['a parabola','None of the components is quadratic.']],'x² + y² = 1 while z grows linearly: a helix.'); });

/* ---------------- 14.2 derivatives & tangent lines ---------------- */
addI('tan',()=>DQ('The tangent line to \\(\\mathbf r(t)\\) at \\(t=t_0\\) is',M_("\\mathbf r(t_0)+s\\,\\mathbf r'(t_0)"),
  [[M_("\\mathbf r'(t_0)+s\\,\\mathbf r(t_0)"),'Point and direction swapped: the point is r(t₀), the direction r′(t₀).'],[M_("\\mathbf r(t_0)+s\\,\\mathbf r''(t_0)"),'The direction is the first derivative.'],[M_('s\\,\\mathbf r(t_0)'),'That line passes through the origin.'],[M_("\\mathbf r(t_0)\\cdot\\mathbf r'(t_0)"),'A line is point + s·direction, not a dot product.']],'Tangent line: point r(t₀), direction r′(t₀).'));
addI('tan',()=>{ const a=nz(-3,3), b=ri(2,4), t0=pick([2,-1,3,-2]);
  const r=V('t',mono(a,{t:2}),mono(1,{t:b})), d=[1,2*a*t0,b*t0**(b-1)];
  return DQ(`For ${m`\mathbf r(t)=${tex(r)}`}, the tangent vector at ${m`t=${t0}`} is`,M_(vt(d)),[[M_(vt([t0,a*t0*t0,t0**b])),'That is r(t₀), the position.'],[M_(vt([0,2*a,b*(b-1)*t0**(b-2)])),'That is r″(t₀).'],[M_(vt([1,a*t0,t0**(b-1)])),'Power rule: bring the exponent down.'],[M_(vt([1,2*a,b])),'Evaluate at t = '+t0+'.']],"The tangent vector is r′(t₀).",1); });
addI('tan',()=>DQ('If \\(|\\mathbf r(t)|\\) is constant, then',M_("\\mathbf r(t)\\cdot\\mathbf r'(t)=0")+' for every \\(t\\)',[[M_("\\mathbf r'(t)=\\mathbf 0"),'The direction can change even if the length does not (circular motion).'],[M_("\\mathbf r(t)\\times\\mathbf r'(t)=\\mathbf 0"),'r and r′ are perpendicular, not parallel.'],[M_("|\\mathbf r'(t)|")+' is constant','The speed can vary.'],['r(t) is a straight line','A curve on a sphere has constant |r|.']],'Differentiate r·r = const: 2 r·r′ = 0.',2));

/* ---------------- 14.2 integrals ---------------- */
addI('vint',()=>{ const a=nz(-3,3), b=nz(-3,3), r0=rv(3,-3,3);
  const rp=V(mono(2*a,{t:1}),String(b),mono(3,{t:2})), key=V(sumS([mono(a,{t:2}),String(r0[0])]),sumS([mono(b,{t:1}),String(r0[1])]),sumS(['t^3',String(r0[2])]));
  return DQ(`If ${m`\mathbf r'(t)=${tex(rp)}`} and ${m`\mathbf r(0)=${vt(r0)}`}, then ${m`\mathbf r(t)=`}`,M_(tex(key)),
    [[M_(tex(V(mono(a,{t:2}),mono(b,{t:1}),'t^3'))),'Add the constant r(0).'],[M_(tex(V(sumS([mono(2*a,{t:2}),String(r0[0])]),sumS([mono(b,{t:1}),String(r0[1])]),sumS(['3*t^3',String(r0[2])])))),'Integrating tⁿ divides by n + 1.'],[M_(tex(V(String(2*a+r0[0]),String(r0[1]),sumS(['6*t',String(r0[2])])))),'That differentiates instead of integrating.'],[M_(tex(V(sumS([mono(a,{t:2}),String(-r0[0])]),sumS([mono(b,{t:1}),String(-r0[1])]),sumS(['t^3',String(-r0[2])])))),'The constant is +r(0).']],
    'Integrate each component, then choose the constant vector so r(0) matches.'); });
addI('vint',()=>DQ('When you integrate a vector function, the constant of integration is',"a constant vector \\(\\mathbf C\\)",[['a single number \\(C\\) added to the first component only','Each component gets its own constant.'],['always \\(\\mathbf 0\\)','Only if the initial condition says so.'],['a scalar multiplying the answer','It is added, not multiplied.'],['not needed for vector functions','Every antiderivative is determined only up to a constant vector.']],'∫ r dt = R(t) + C with C = ⟨C₁, C₂, C₃⟩.'));

/* ---------------- 14.3 velocity, speed, acceleration ---------------- */
addI('vel',()=>DQ('For a moving particle with position \\(\\mathbf r(t)\\), the speed is',M_("|\\mathbf r'(t)|"),[[M_("\\mathbf r'(t)"),'That is the velocity VECTOR; speed is its length.'],[M_('|\\mathbf r(t)|'),'That is the distance from the origin.'],[M_("|\\mathbf r''(t)|"),'That is the size of the acceleration.'],[M_("\\mathbf r'(t)\\cdot\\mathbf r''(t)"),'Not the speed.']],'velocity v = r′, speed |v| (a scalar), acceleration a = r″.'));
addI('vel',()=>{ const R=ri(2,5), w=ri(1,3);
  return DQ(`A particle has ${m`\mathbf r(t)=\langle ${R}\cos ${w===1?'':w}t,\ ${R}\sin ${w===1?'':w}t\rangle`}. Its speed is`,M_(String(R*w)),[[M_(String(R)),'Chain rule: each component picks up a factor '+w+'.'],[M_(String(R*R*w*w)),'Speed is |v|, the square root.'],[M_(String(R+w)),'|v| = Rω.'],['changing with \\(t\\)','sin² + cos² = 1 makes it constant.']],'|v| = |⟨−Rω sin ωt, Rω cos ωt⟩| = Rω.'); });
addI('vel',()=>DQ('In uniform circular motion (constant speed around a circle), the acceleration',"points toward the center",[['is zero because the speed is constant','The velocity changes direction, so a ≠ 0.'],['points along the velocity','That would change the speed.'],['points away from the center','It points inward: a = −ω² r.'],['is perpendicular to the plane of the circle','It lies in the plane, toward the center.']],'a = −ω² r: centripetal.'));

/* ---------------- 14.3 motion from acceleration; projectiles ---------------- */
addI('mot',()=>DQ('Given \\(\\mathbf a(t)\\), \\(\\mathbf v(0)\\) and \\(\\mathbf r(0)\\), to find \\(\\mathbf r(t)\\) you',"integrate \\(\\mathbf a\\) (use \\(\\mathbf v(0)\\)), then integrate \\(\\mathbf v\\) (use \\(\\mathbf r(0)\\))",[['differentiate \\(\\mathbf a\\) twice','Going from a back to r is integration.'],['integrate \\(\\mathbf a\\) once and add \\(\\mathbf r(0)\\)','One integration gives v; you need two.'],['integrate \\(\\mathbf a\\) twice and ignore the initial conditions','The constants come from v(0) and r(0).'],["multiply \\(\\mathbf a\\) by \\(t^2\\)","Only for constant a: r = ½at² + v₀t + r₀ (and even then include v₀, r₀)."]],'v = ∫a dt + C₁ fixed by v(0); r = ∫v dt + C₂ fixed by r(0).'));
addI('mot',()=>DQ('A projectile moves under gravity only. At its highest point',"its vertical velocity is 0",[['its velocity is \\(\\mathbf 0\\)','The horizontal velocity never changes; only the vertical part is 0.'],['its acceleration is \\(\\mathbf 0\\)','Gravity still acts: a = ⟨0, −g⟩.'],['its speed is largest','Speed is smallest at the top.'],['its horizontal velocity is 0','Horizontal velocity is constant.']],'Max height: set the vertical velocity y′(t) = 0.'));
addI('mot',()=>{ const a=rv(2,-4,4,true), T=pick([3,4]);
  return DQ(`A particle has constant acceleration ${m`\mathbf a=${vt(a)}`}, starts at rest at the origin. Where is it at ${m`t=${T}`}?`,M_(tex(V(...a.map(x=>frac(x*T*T,2))))),[[M_(vt(a.map(x=>x*T*T))),'r = ½at²: the ½ is missing.'],[M_(vt(a.map(x=>x*T))),'That is the velocity at t = '+T+'.'],[M_(vt(a)),'That is the acceleration.'],[M_(tex(V(...a.map(x=>frac(x*T,2))))),'Integrate twice: t²/2, not t/2.']],'v = at (rest), r = ½at² (origin).'); });

/* ---------------- 14.4 arc length ---------------- */
addI('arc',()=>DQ('The length of \\(\\mathbf r(t)\\) for \\(a\\le t\\le b\\) is',M_("\\int_a^b|\\mathbf r'(t)|\\,dt"),[[M_('|\\mathbf r(b)-\\mathbf r(a)|'),'That is the straight-line distance between the endpoints.'],[M_("\\int_a^b\\mathbf r'(t)\\,dt"),'That integral gives a vector (the displacement).'],[M_('\\int_a^b|\\mathbf r(t)|\\,dt'),'Integrate the SPEED |r′|, not |r|.'],[M_("\\int_a^b|\\mathbf r'(t)|^2\\,dt"),'No square: speed is |r′|.']],'L = ∫ speed dt = ∫|r′(t)| dt.'));
addI('arc',()=>{ const [a,b,c]=pick([[3,4,5],[5,12,13],[6,8,10]]), T=ri(1,4);
  return DQ(`${m`\mathbf r(t)=\langle ${a}t,\ ${b}\cos t,\ ${b}\sin t\rangle`} has constant speed. Its length for ${m`0\le t\le ${T}`} is`,M_(String(Math.hypot(a,b)*T)),[[M_(String((a+b)*T)),'Speed = √(a² + b²), not a + b.'],[M_(String((a*a+b*b)*T)),'Take the square root.'],[M_(String(Math.hypot(a,b))),'Multiply the speed by the time '+T+'.'],[M_(String(b*T)),'The '+a+'t component moves too.']],'Constant speed: length = speed × time.',2); });

/* ---------------- 14.5 curvature ---------------- */
addI('curv',()=>{ const R=ri(2,9);
  return DQ(`The curvature of a circle of radius ${R} is`,M_(tex(frac(1,R))),[[M_(String(R)),'That is the radius of curvature.'],[M_(tex(frac(1,R*R))),'κ = 1/R.'],[M_('0'),'Only straight lines have κ = 0.'],[M_(String(R*R)),'Larger circles are LESS curved.']],'A circle of radius R has κ = 1/R everywhere.'); });
addI('curv',()=>DQ('Which curve has curvature 0 everywhere?','a straight line',[['a circle','κ = 1/R > 0.'],['a helix','A helix keeps turning: κ > 0.'],['a parabola','A parabola bends most at its vertex.'],['any curve traced at constant speed','Constant speed says nothing about bending (circles have constant speed).']],'κ = |dT/ds| = 0 exactly when the direction never changes.'));
addI('curv',()=>DQ('Which formula gives the curvature of \\(\\mathbf r(t)\\)?',M_("\\kappa=\\dfrac{|\\mathbf r'\\times\\mathbf r''|}{|\\mathbf r'|^3}"),[[M_("\\kappa=\\dfrac{|\\mathbf r'\\times\\mathbf r''|}{|\\mathbf r'|^2}"),'The power is 3.'],[M_("\\kappa=|\\mathbf r''|"),'That only holds when t is arc length (unit speed).'],[M_("\\kappa=\\dfrac{|\\mathbf r'\\cdot\\mathbf r''|}{|\\mathbf r'|^3}"),'Cross product, not dot.'],[M_("\\kappa=|\\mathbf T'(t)|"),'κ = |T′(t)|/|r′(t)|; the division by speed is missing.']],'κ = |T′|/|r′| = |r′ × r″|/|r′|³.',2));

/* ---------------- 15.1 domains & level curves ---------------- */
addI('lvl',()=>{ const R=ri(2,6);
  return DQ(`The domain of ${m`f(x,y)=\sqrt{${R*R}-x^2-y^2}`} is`,`the closed disk ${M_(`x^2+y^2\\le ${R*R}`)}`,[[`the open disk ${M_(`x^2+y^2< ${R*R}`)}`,'√0 is allowed: the circle is included.'],[`the circle ${M_(`x^2+y^2=${R*R}`)}`,'Every point inside works too.'],[`the region ${M_(`x^2+y^2\\ge ${R*R}`)}`,'The radicand must be ≥ 0: inside the circle.'],['all of \\(\\mathbb R^2\\)','The square root needs a non-negative argument.']],'Set the inside of the root ≥ 0.'); });
addI('lvl',()=>{ const F=pick([['x^2+y^2','concentric circles'],['2x+3y','parallel lines'],['y-x^2','parabolas'],['xy','hyperbolas (and the two axes)'],['x^2+4y^2','ellipses']]);
  const all=['concentric circles','parallel lines','parabolas','hyperbolas (and the two axes)','ellipses that are not circles']; if(F[1]==='ellipses') F[1]='ellipses that are not circles';
  return DQ(`The level curves ${m`f(x,y)=c`} of ${m`f(x,y)=${F[0]}`} are`,F[1],all.filter(x=>x!==F[1]).map(x=>[x,'Set '+F[0].replace(/\^2/g,'²')+' = c and recognize the curve.']),'Level curves: set f(x, y) = c for several constants c.'); });

/* ---------------- 15.2 limits ---------------- */
addI('lim',()=>DQ('To show \\(\\lim_{(x,y)\\to(0,0)}f(x,y)\\) does NOT exist, it is enough to',"find two paths to \\((0,0)\\) that give different limits",[['find one path where the limit is 0','One path says nothing about the others.'],['show \\(f(0,0)\\) is undefined','Limits don’t care about the value at the point.'],['check that the limits along the x- and y-axes are equal','Equal axis limits do not prove the limit exists.'],['plug in \\((0,0)\\) and get \\(0/0\\)','0/0 only means more work is needed.']],'Two-path test: different path limits ⇒ DNE. Agreement on many paths does NOT prove existence.'));
addI('lim',()=>{ const a=ri(-3,3), b=ri(-3,3), c=ri(1,4);
  return DQ(`${m`\lim_{(x,y)\to(${a},1)}\left(${tex(sumS(['x^2',mono(b,{x:1,y:1}),String(c)]))}\right)=`}`,M_(String(a*a+b*a+c)),[[M_(String(a*a+c)),'Include the xy-term: at the point it is '+b*a+'.'],['does not exist','Polynomials are continuous: just substitute.'],[M_('0'),'Substitute the point.'],[M_(String(a*a+b*a+c+1)),'Arithmetic slip.']],'Polynomials are continuous: the limit is the value.'); });
addI('lim',()=>DQ('If \\(f(x,y)\\to 0\\) along every straight line \\(y=mx\\) through the origin, then \\(\\lim_{(x,y)\\to(0,0)}f(x,y)\\)',"might still not exist",[['must be 0','Curved paths (like y = x²) can still give a different value.'],['does not exist','It might exist and be 0.'],['must be undefined','Nothing forces that.'],['equals \\(f(0,0)\\)','That would require continuity.']],'Lines are not all paths: x²y/(x⁴ + y²) → 0 on lines but 1/2 on y = x².',2));

/* ---------------- 15.3 partial derivatives ---------------- */
addI('pd',()=>{ const a=ri(2,4), b=ri(2,4), c=nz(-5,5);
  return DQ(`For ${m`f(x,y)=${c===1?'':c===-1?'-':c}x^{${a}}y^{${b}}`}, ${m`f_x=`}`,M_(tex(mono(c*a,{x:a-1,y:b}))),[[M_(tex(mono(c*a*b,{x:a-1,y:b-1}))),'Hold y constant: y^'+b+' is just a coefficient.'],[M_(tex(mono(c*b,{x:a,y:b-1}))),'That is f_y.'],[M_(tex(mono(c*a,{x:a-1}))),'y^'+b+' stays as a factor.'],[M_(tex(mono(c,{x:a-1,y:b}))),'Power rule: bring down '+a+'.']],'∂/∂x: treat y as a constant.'); });
addI('pd',()=>DQ('For a function with continuous second partials, Clairaut’s theorem says',M_('f_{xy}=f_{yx}'),[[M_('f_{xx}=f_{yy}'),'Clairaut is about MIXED partials.'],[M_('f_x=f_y'),'Different first partials in general.'],[M_('f_{xy}=0'),'Only for special functions.'],[M_('f_{xy}=f_x f_y'),'Not a product.']],'Mixed partials are equal (order does not matter).'));
addI('pd',()=>DQ('\\(f_x(a,b)\\) is geometrically',"the slope of the trace of \\(z=f(x,y)\\) in the plane \\(y=b\\), at \\(x=a\\)",[['the slope in the plane \\(x=a\\)','That is f_y.'],['the steepest slope at \\((a,b)\\)','That is |∇f|.'],['the height of the surface at \\((a,b)\\)','That is f(a, b).'],['the curvature of the surface','Partials are slopes.']],'Hold y = b fixed: f_x is the slope of the curve z = f(x, b).',2));

/* ---------------- 15.4 chain rule ---------------- */
addI('chain',()=>DQ('If \\(z=f(x,y)\\) with \\(x=x(t),\\ y=y(t)\\), then \\(\\dfrac{dz}{dt}=\\)',M_("f_x\\,x'(t)+f_y\\,y'(t)"),[[M_('f_x+f_y'),'Each partial is multiplied by the derivative of its inner variable.'],[M_("f_x\\,y'(t)+f_y\\,x'(t)"),'f_x pairs with x′, f_y with y′.'],[M_("f_x f_y\\,x'(t)y'(t)"),'The terms add; they are not multiplied together.'],[M_("f(x'(t),y'(t))"),'That is not the chain rule.']],'One term per path in the tree diagram: dz/dt = f_x x′ + f_y y′.'));
addI('chain',()=>{ const n=pick([2,3]), k=pick([2,3]);
  return DQ(`${m`w=f(${['x','y','z'].slice(0,n).join(',')})`} where each of ${m`${['x','y','z'].slice(0,n).join(',')}`} depends on ${m`${['s','t','u'].slice(0,k).join(',')}`}. How many terms are in the chain rule for ${m`\partial w/\partial s`}?`,String(n),[[String(k),'One term for each INTERMEDIATE variable of f.'],[String(n*k),'That counts all partials in the tree; ∂w/∂s uses only the s-branches.'],['1','Every intermediate variable depends on s.'],[String(n+k),'One term per intermediate variable.'],[String(n*k+1),'Only the branches through s count: one term per intermediate variable.']],'∂w/∂s = Σ (∂f/∂xᵢ)(∂xᵢ/∂s): one term per intermediate variable.'); });

/* ---------------- 15.4 implicit ---------------- */
addI('impl',()=>DQ('If \\(F(x,y,z)=0\\) defines \\(z\\) implicitly, then \\(\\dfrac{\\partial z}{\\partial x}=\\)',M_('-\\dfrac{F_x}{F_z}'),[[M_('\\dfrac{F_x}{F_z}'),'The minus sign is essential.'],[M_('-\\dfrac{F_z}{F_x}'),'Upside down.'],[M_('-\\dfrac{F_x}{F_y}'),'That is dy/dx for a curve F(x, y) = 0.'],[M_('F_x'),'You must divide by F_z.']],'Differentiate F(x, y, z(x, y)) = 0 in x: F_x + F_z z_x = 0.'));
addI('impl',()=>{ const a=ri(1,3), b=ri(1,3), P=pick([[1,1],[1,2],[2,1],[-1,1]]), C=a*P[0]**2+b*P[1]**2, Fx=2*a*P[0], Fy=2*b*P[1];
  return DQ(`On the curve ${m`${a===1?'':a}x^2+${b===1?'':b}y^2=${C}`}, the slope ${m`dy/dx`} at ${mp(P)} is`,M_(tex(frac(-Fx,Fy))),[[M_(tex(frac(Fx,Fy))),'dy/dx = −F_x/F_y: the minus is missing.'],[M_(tex(frac(-Fy,Fx))),'Upside down.'],[M_('0'),'F_x ≠ 0 here.'],[M_(tex(frac(-a,b))),'Evaluate at the point.']],'dy/dx = −F_x/F_y with F = left − right.',1); });

/* ---------------- 15.5 gradient & directional derivative ---------------- */
addI('grad',()=>DQ('The directional derivative of \\(f\\) at \\(P\\) in the direction of a vector \\(\\mathbf v\\) is',M_('\\nabla f(P)\\cdot\\dfrac{\\mathbf v}{|\\mathbf v|}'),[[M_('\\nabla f(P)\\cdot\\mathbf v'),'The direction must be a UNIT vector.'],[M_('\\nabla f(P)\\times\\mathbf v'),'A directional derivative is a number: use the dot product.'],[M_('|\\nabla f(P)|'),'That is the maximum rate, only in the direction of ∇f.'],[M_('\\dfrac{\\nabla f(P)}{|\\nabla f(P)|}'),'That is a unit vector, not a rate.']],'D_u f = ∇f · u with u = v/|v|.'));
addI('grad',()=>{ const a=nz(-3,3), b=nz(-3,3), P=[ri(-2,2),ri(-2,2)];
  const f=`${a===1?'':a===-1?'-':a}x^2${b<0?'-':'+'}${Math.abs(b)===1?'':Math.abs(b)}xy`, g=[2*a*P[0]+b*P[1],b*P[0]];
  return DQ(`For ${m`f(x,y)=${f}`}, ${m`\nabla f(${P[0]},${P[1]})=`}`,M_(vt(g)),[[M_(vt([g[1],g[0]])),'∇f = ⟨f_x, f_y⟩ in that order.'],[M_(vt([2*a*P[0],b*P[0]])),'f_x has a term from the xy part too.'],[M_(vt([2*a,b])),'Evaluate at the point.'],[M_(vt(g.map(x=>-x))),'Sign slip.']],'∇f = ⟨f_x, f_y⟩ at the point.'); });

/* ---------------- 15.5 steepest ascent ---------------- */
addI('steep',()=>DQ('At a point where \\(\\nabla f\\ne\\mathbf 0\\), \\(f\\) increases fastest in the direction of',M_('\\nabla f'),[[M_('-\\nabla f'),'That is steepest DESCENT.'],['any direction perpendicular to \\(\\nabla f\\)','Perpendicular directions give zero change (along the level curve).'],['the positive x-axis','Only if ∇f points that way.'],['the direction of the position vector','The gradient decides.']],'Max increase along ∇f, rate |∇f|; decrease fastest along −∇f; no change ⟂ ∇f.'));
addI('steep',()=>{ const g=pick([[3,4],[4,3],[6,8],[5,12],[1,2],[2,1]]).map(x=>x*pick([1,-1]));
  return DQ(`${m`\nabla f(P)=${vt(g)}`}. The maximum rate of increase of ${m`f`} at ${m`P`} is`,M_(tex(sqrtS(n2(g)))),[[M_(String(n2(g))),'Take the square root: the rate is |∇f|.'],[M_(String(g[0]+g[1])),'|∇f| is a length, not a sum.'],[M_(vt(g)),'That is the DIRECTION; the rate is its length.'],[M_('1'),'Only for a unit gradient.']],'Maximum rate = |∇f(P)|.'); });
addI('steep',()=>DQ('The gradient \\(\\nabla f(a,b)\\) is ___ to the level curve of \\(f\\) through \\((a,b)\\).','perpendicular',[['tangent','Moving along a level curve does not change f, so D_u f = ∇f · u = 0 there.'],['parallel','Same as tangent — no.'],['unrelated','∇f is always normal to level curves.'],['at 45°','Always 90°.']],'Along a level curve f stays constant, so ∇f · T = 0.'));

/* ---------------- 15.6 tangent planes ---------------- */
addI('tp',()=>DQ('The tangent plane to \\(z=f(x,y)\\) at \\((a,b,f(a,b))\\) is',M_('z=f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)'),[[M_('z=f_x(a,b)(x-a)+f_y(a,b)(y-b)'),'The plane must pass through height f(a, b).'],[M_('z=f(a,b)+f_x(a,b)\\,x+f_y(a,b)\\,y'),'Shift by the point: (x − a), (y − b).'],[M_('z=f(a,b)+f_y(a,b)(x-a)+f_x(a,b)(y-b)'),'f_x pairs with (x − a).'],[M_('f_x(a,b)(x-a)+f_y(a,b)(y-b)+f(a,b)(z-f(a,b))=0'),'The z-coefficient is −1 (or use z − f(a, b)).']],'z − f(a,b) = f_x(x − a) + f_y(y − b).'));
addI('tp',()=>DQ('For a surface \\(F(x,y,z)=0\\), a normal vector to the tangent plane at \\(P\\) is',M_('\\nabla F(P)'),[[M_('\\overrightarrow{OP}'),'The position vector is normal only for spheres centered at O.'],[M_('\\langle F_x,F_y,0\\rangle'),'Include F_z.'],[M_('\\langle 1,1,1\\rangle'),'The normal depends on F and P.'],[M_('\\langle F_x,F_y,1\\rangle'),'For z = f(x, y) the normal is ⟨f_x, f_y, −1⟩; for F = 0 use F_z.']],'∇F is normal to the level surface F = 0.'));

/* ---------------- 15.6 linear approximation ---------------- */
addI('lin',()=>DQ('The linear approximation of \\(f\\) at \\((a,b)\\) is',M_('L(x,y)=f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)'),[[M_('L(x,y)=f_x(a,b)(x-a)+f_y(a,b)(y-b)'),'Start from f(a, b).'],[M_('L(x,y)=f(a,b)+f_x(a,b)+f_y(a,b)'),'Multiply by the changes (x − a), (y − b).'],[M_('L(x,y)=f(x,y)-f(a,b)'),'That is the exact change.'],[M_('L(x,y)=f(a,b)(x-a)(y-b)'),'Not the tangent-plane formula.']],'L is the tangent plane: f(a,b) + f_x Δx + f_y Δy.'));
addI('lin',()=>{ const fx=nz(-4,5), fy=nz(-4,5), dx=pick([1,2,-1]), dy=pick([1,-2,2]);
  const key=decS(fx*dx+fy*dy,10);
  return DQ(`At a point, ${m`f_x=${fx}`} and ${m`f_y=${fy}`}. If ${m`dx=${dx/10}`} and ${m`dy=${dy/10}`}, then ${m`dz\approx`}`,M_(key),[[M_(decS(fx*dy+fy*dx,10)),'f_x pairs with dx, f_y with dy.'],[M_(String(fx+fy)),'Multiply by dx and dy.'],[M_(decS(fx*dx-fy*dy,10)),'Sign slip.'],[M_(decS((fx+fy)*(dx+dy),100)),'dz = f_x dx + f_y dy.']],'dz = f_x dx + f_y dy.'); });

/* ---------------- 15.7 critical points ---------------- */
addI('crit',()=>{ const fxx=nz(-5,5), fyy=nz(-5,5), fxy=ri(-4,4), D=fxx*fyy-fxy*fxy; if(D===0) return null;
  const key=D<0?'a saddle point':fxx>0?'a local minimum':'a local maximum';
  const W=D<0?'D = f_xx f_yy − f_xy² = '+D+' < 0: a saddle.':'D = '+D+' > 0 and f_xx = '+fxx+(fxx>0?' > 0: a local min.':' < 0: a local max.');
  return DQ(`At a critical point, ${m`f_{xx}=${fxx},\ f_{yy}=${fyy},\ f_{xy}=${fxy}`}. The point is`,key,[['a local minimum',W],['a local maximum',W],['a saddle point',W],['impossible to classify','D ≠ 0, so the test decides.']],'D = f_xx f_yy − f_xy²: D < 0 saddle; D > 0 min (f_xx > 0) or max (f_xx < 0); D = 0 inconclusive.'); });
addI('crit',()=>DQ('A critical point of \\(f(x,y)\\) is a point where',"\\(f_x=f_y=0\\) (or a partial does not exist)",[['\\(f=0\\)','That is a zero of f, not a critical point.'],['\\(f_x=0\\) only','Both partials must vanish.'],['\\(f_{xx}f_{yy}-f_{xy}^2=0\\)','That is when the second-derivative test fails.'],['\\(f\\) has a local maximum','Critical points can also be minima or saddles.']],'Critical: ∇f = 0 or undefined. Then classify.'));
addI('crit',()=>DQ('If \\(D=f_{xx}f_{yy}-f_{xy}^2=0\\) at a critical point, the second-derivative test',"is inconclusive",[['shows a saddle point','That needs D < 0.'],['shows a local minimum','That needs D > 0 and f_xx > 0.'],['shows a local maximum','That needs D > 0 and f_xx < 0.'],['shows it is not a critical point','D says nothing about being critical.']],'D = 0: no conclusion (check another way).'));

/* ---------------- 15.7 absolute extrema ---------------- */
addI('abs',()=>DQ('To find the absolute max and min of a continuous \\(f\\) on a closed, bounded region \\(R\\), you compare the values of \\(f\\) at',"critical points inside \\(R\\) and the extreme points on its boundary",[['critical points inside \\(R\\) only','The extremes are often on the boundary.'],['the corners only','Edges can have interior extreme points too.'],['points where the second-derivative test gives a max or min','Saddles and boundary points still matter; just compare values.'],['the boundary only','An interior critical point can be the extreme.']],'Closed & bounded ⇒ absolute extremes exist; check interior critical points and the boundary.'));
addI('abs',()=>DQ('The Extreme Value Theorem guarantees an absolute max and min of a continuous \\(f\\) on',"any closed and bounded region",[['any region','Open or unbounded regions can fail (f = x on the plane).'],['any open disk','f = x on the open unit disk has no max.'],['any unbounded region that includes its boundary','Unbounded regions can fail.'],['only rectangles','Any closed, bounded set works.']],'Continuous on a closed, bounded set ⇒ absolute max and min exist.'));
addI('abs',()=>{ const R=ri(2,4), p=nz(-(R-1),R-1), c=ri(-3,5);
  const f=tex(sumS(['x^2','y^2',mono(-2*p,{y:1}),String(c)])), mn=c-p*p;
  return DQ(`The absolute minimum of ${m`f(x,y)=${f}`} on the disk ${m`x^2+y^2\le ${R*R}`} occurs at`,mp([0,p]),[[mp([0,-p]),'Solve f_y = 2y '+(p>0?'−':'+')+' '+2*Math.abs(p)+' = 0 carefully.'],[mp([0,Math.sign(p)*R]),'On the boundary the value is larger than at the interior critical point.'],[mp([0,0]),'(0, 0) is not a critical point.'],[mp([R,0]),'Compare with the interior critical point.']],'Interior critical point (0, '+p+') with f = '+mn+'; the boundary values are larger.',2); });
