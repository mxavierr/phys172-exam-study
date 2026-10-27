/* =====================================================================
   DIAGNOSTIC: the Exam 2 material (15.8, 16.1–16.6, 17.1–17.6 part 1) as
   34 core concepts. Every concept has exam templates (partD.js XCON_* maps
   template ids to these ids), so diagnostics ask exam-level questions; the
   sprint generators in sk are the fallback.
   w = how likely the concept is to carry an Exam 2 question (2015–2025 archive),
   ch = 15 (Lagrange), 16 or 17 (book chapter).
   ===================================================================== */
const DCON=[
  {id:'lagr',name:'Lagrange multipliers',sec:'15.8',ch:15,w:.85,topic:'Lagrange multipliers',core:'Solve ∇f = λ∇g together with g = c; evaluate f at every solution and compare. For linear f on an ellipse or sphere the extremes are ± a length.',sk:['lagr-ell','lagr-sphere','lagr-quad']},
  {id:'dbl',name:'Double integrals: set up and evaluate',sec:'16.1–16.2',ch:16,w:.45,topic:'Double integrals',core:'Inner limits may depend on the outer variable; on a rectangle a product g(x)h(y) separates; volume = ∬(top − bottom) dA.',sk:['dbl-rect','dbl-between','dbl-voltri']},
  {id:'avg',name:'Average value',sec:'16.1 · 16.4',ch:16,w:.15,topic:'Double integrals',core:'Average = (1/area or volume) × the integral; for a linear function it is the value at the centroid.',sk:['dbl-avg','tri-avg']},
  {id:'rev',name:'Reversing the order (double)',sec:'16.2',ch:16,w:.75,topic:'Order of integration',core:'Sketch the region first, then read it sideways; the new outer limits are numbers. Reverse when the inner antiderivative is not elementary.',sk:['rev-eval','rev-setup','rev-choose']},
  {id:'revsplit',name:'Regions that split into pieces',sec:'16.2',ch:16,w:.20,topic:'Order of integration',core:'If the top (or right) boundary changes formula, one order needs two integrals; the other order may need one.',sk:['rev-split']},
  {id:'polar',name:'Polar double integrals',sec:'16.3',ch:16,w:.80,topic:'Polar coordinates',core:'x = r cos θ, y = r sin θ, dA = r dr dθ; lines through the origin fix θ, circles fix r; read the region from Cartesian limits.',sk:['pol-sector','pol-gauss','pol-convert']},
  {id:'poloff',name:'Off-centre circles in polar',sec:'16.3',ch:16,w:.25,topic:'Polar coordinates',core:'x² + y² = 2ax is r = 2a cos θ for −π/2 ≤ θ ≤ π/2 (radius a, centre (a, 0)).',sk:['pol-off','pol-area']},
  {id:'polvol',name:'Volumes with polar coordinates',sec:'16.3',ch:16,w:.35,topic:'Polar coordinates',core:'Intersect the surfaces to get the radius, then V = ∫∫(top − bottom) r dr dθ.',sk:['pol-vol']},
  {id:'triset',name:'Triple integrals: limits and evaluation',sec:'16.4',ch:16,w:.80,topic:'Triple integrals',core:'Inner variable from surface to surface, middle from curve to curve in the shadow, outer between numbers.',sk:['tri-plane','tri-eval','tri-vol']},
  {id:'trireo',name:'Changing the order (triple)',sec:'16.4',ch:16,w:.50,topic:'Triple integrals',core:'Write the solid as inequalities, then read the limits in the new order; outer = numbers, middle = outer variable only.',sk:['tri-reorder','tri-which']},
  {id:'cyl',name:'Cylindrical coordinates',sec:'16.5',ch:16,w:.75,topic:'Cylindrical coordinates',core:'x² + y² = r², dV = r dz dr dθ; the xy-limits give r and θ, z keeps its surfaces rewritten in r.',sk:['cyl-convert','cyl-eval']},
  {id:'cylvol',name:'Volumes with cylindrical coordinates',sec:'16.5',ch:16,w:.35,topic:'Cylindrical coordinates',core:'Meet the surfaces to get r; for a cylinder along another axis, use polar in that plane.',sk:['cyl-vol','cyl-xaxis']},
  {id:'sph',name:'Spherical coordinates',sec:'16.5',ch:16,w:.80,topic:'Spherical coordinates',core:'dV = ρ² sin φ dρ dφ dθ; φ from the +z axis; the cone z = k·r is φ = arctan(1/k); x² + y² = ρ² sin²φ.',sk:['sph-setup','sph-vol','sph-shell']},
  {id:'sphoff',name:'Spheres and planes in spherical form',sec:'16.5',ch:16,w:.35,topic:'Spherical coordinates',core:'ρ = c cos φ is a sphere of diameter c on the z-axis; z = c is ρ = c sec φ; r = c is ρ sin φ = c.',sk:['sph-off','sph-planes','sph-surf']},
  {id:'mass',name:'Mass and center of mass',sec:'16.6',ch:16,w:.45,topic:'Mass & center of mass',core:'m = ∬ρ dA (∭ρ dV), x̄ = M_y/m with M_y = ∬xρ dA; symmetry of region AND density fixes a coordinate.',sk:['mass-rect','mass-lam','mass-tet']},
  {id:'vf',name:'Vector fields from pictures',sec:'17.1',ch:17,w:.35,topic:'Vector fields',core:'Check arrows on the axes and in one quadrant: sign and size of each component.',sk:['vf-pic']},
  {id:'vfgrad',name:'Gradient fields and level curves',sec:'17.1',ch:17,w:.30,topic:'Vector fields',core:'∇φ is perpendicular to the level curves φ = c; rotate it 90° for a tangent field.',sk:['vf-normal','vf-equip']},
  {id:'lscal',name:'Scalar line integrals',sec:'17.2',ch:17,w:.65,topic:'Line integrals',core:'∫_C f ds = ∫ f(r(t))|r′(t)| dt; independent of orientation.',sk:['ls-seg','ls-helix','ls-cancel','ls-arc']},
  {id:'work',name:'Work and circulation',sec:'17.2',ch:17,w:.55,topic:'Line integrals',core:'∫_C F·dr = ∫ F(r(t))·r′(t) dt; reversing C flips the sign; the path matters unless F is conservative.',sk:['w-seg','w-rot','w-dxdy']},
  {id:'flux',name:'Flux across curves',sec:'17.2 · 17.4',ch:17,w:.25,topic:'Line integrals',core:'Outward flux ∮F·n ds = ∮(P dy − Q dx) = ∬div F dA.',sk:['w-flux','g-flux']},
  {id:'orient',name:'Orientation and path facts',sec:'17.2–17.3',ch:17,w:.15,topic:'Line integrals',core:'Scalar integrals ignore direction; vector integrals flip; speed never matters; gradient fields have zero circulation.',sk:['w-concept']},
  {id:'cons',name:'Testing for conservative fields',sec:'17.3',ch:17,w:.30,topic:'Conservative fields',core:'On ℝ² or ℝ³ (simply connected) F is conservative ⇔ cross-partials agree (curl F = 0).',sk:['c-which']},
  {id:'pot',name:'Finding a potential',sec:'17.3',ch:17,w:.45,topic:'Conservative fields',core:'Integrate P in x, fix the leftover function of the other variables with Q and R; check the cross-partials first.',sk:['c-pot','c-const']},
  {id:'ftli',name:'Fundamental Theorem for line integrals',sec:'17.3',ch:17,w:.65,topic:'Conservative fields',core:'If F = ∇φ, ∫_C F·dr = φ(B) − φ(A) for every path; never integrate along a messy path.',sk:['c-ftli','c-spiral','c-path']},
  {id:'vortex',name:'Zero curl but not conservative',sec:'17.3',ch:17,w:.15,topic:'Conservative fields',core:'⟨−y, x⟩/(x² + y²): circulation 2π around the origin, 0 around loops that miss it.',sk:['c-vortex']},
  {id:'green',name:'Green’s Theorem (circulation)',sec:'17.4',ch:17,w:.60,topic:'Green’s Theorem',core:'∮_C P dx + Q dy = ∬_R (Q_x − P_y) dA for C counterclockwise; clockwise flips the sign.',sk:['g-poly','g-tri','g-circle']},
  {id:'garea',name:'Area by line integrals',sec:'17.4',ch:17,w:.25,topic:'Green’s Theorem',core:'Area = ∮x dy = −∮y dx = ½∮(x dy − y dx); ∮(αy dx + βx dy) = (β − α)·Area.',sk:['g-area']},
  {id:'ghole',name:'Holes and open curves',sec:'17.4',ch:17,w:.15,topic:'Green’s Theorem',core:'Ring: ∮_outer − ∮_inner = ∬_ring(Q_x − P_y) dA. Open curve: close it, apply Green, subtract the added piece.',sk:['g-hole','g-open']},
  {id:'curl',name:'Curl',sec:'17.5',ch:17,w:.35,topic:'Divergence & curl',core:'curl F = ⟨R_y − Q_z, P_z − R_x, Q_x − P_y⟩; for a × r it is 2a.',sk:['dc-curl','dc-rot']},
  {id:'div',name:'Divergence and the Laplacian',sec:'17.5',ch:17,w:.30,topic:'Divergence & curl',core:'div F = P_x + Q_y + R_z; div(∇f) = f_xx + f_yy + f_zz; ∇·(r/|r|^p) = (3 − p)/|r|^p.',sk:['dc-lap','dc-radial','dc-div']},
  {id:'ident',name:'Div/curl identities',sec:'17.5',ch:17,w:.20,topic:'Divergence & curl',core:'curl(∇f) = 0, div(curl F) = 0; curl(div F) is meaningless (div F is a scalar).',sk:['dc-ident']},
  {id:'sarea',name:'Surface area',sec:'17.6',ch:17,w:.45,topic:'Surface integrals',core:'Area = ∬√(1 + g_x² + g_y²) dA for z = g(x, y), or ∬|r_u × r_v| dA; for a plane piece it is |n|/|n_z| × the shadow’s area.',sk:['s-plane','s-parab','s-cone']},
  {id:'sint',name:'Scalar surface integrals',sec:'17.6',ch:17,w:.25,topic:'Surface integrals',core:'∬f dS with dS = √(1 + g_x² + g_y²) dA, or a² sin φ dφ dθ on a sphere; use symmetry.',sk:['s-sphere','s-graph']},
  {id:'sparam',name:'Parametrizing surfaces',sec:'17.6',ch:17,w:.15,topic:'Surface integrals',core:'Check the components satisfy the equation and the parameter ranges cover exactly the piece asked for.',sk:['s-param']}
];
const DIDX={}; DCON.forEach((c,i)=>DIDX[c.id]=i);
const DIDEA={}; DCON.forEach(c=>DIDEA[c.id]=[]);
const addI=(cid,fn)=>DIDEA[cid].push(fn);
/* an idea question: key + distractors [html, why]; options are shuffled by the engine */
function DQ(q,key,dis,how,lv){
  const seen=new Set([key]), opts=[{h:key,ok:true,why:''}];
  for(const [h,why] of dis){ if(seen.has(h)) continue; seen.add(h); opts.push({h,ok:false,why}); if(opts.length===XOPT) break; }
  if(opts.length<4) return null;
  return {q,kind:'choice',opts,ans:key,lv:lv||1,how,sol:[[how,'']]};
}
