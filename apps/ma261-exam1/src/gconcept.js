
/* =====================================================================
   Concept checks: true/false statements in the style of the book's
   "Explain why or why not" exercises. Each false one carries its counterexample.
   ===================================================================== */
const CONCEPTS={
  '13':[
    [1,'If \\(\\mathbf u\\) and \\(\\mathbf v\\) are parallel and point the same way, then \\(|\\mathbf u+\\mathbf v|=|\\mathbf u|+|\\mathbf v|\\).','Same direction means v = cu with c > 0, so |u + v| = (1 + c)|u| = |u| + |v|.'],
    [0,'If \\(\\mathbf u\\perp\\mathbf v\\), then \\(|\\mathbf u+\\mathbf v|=|\\mathbf u|+|\\mathbf v|\\).','For perpendicular vectors |u + v| = √(|u|² + |v|²) (Pythagoras), which is smaller than |u| + |v|.'],
    [0,'\\(|\\mathbf u+\\mathbf v|\\ge|\\mathbf u|\\) for all vectors \\(\\mathbf u\\) and \\(\\mathbf v\\).','Take v = −u: then |u + v| = 0.'],
    [0,'Parallel vectors have the same length.','⟨1, 0⟩ and ⟨5, 0⟩ are parallel with different lengths.'],
    [1,'\\(\\mathbf u\\times\\mathbf u=\\mathbf 0\\) for every vector \\(\\mathbf u\\).','|u × u| = |u||u| sin 0 = 0.'],
    [0,'\\(\\mathbf u\\times\\mathbf v=\\mathbf v\\times\\mathbf u\\) for all vectors.','The cross product is anticommutative: v × u = −(u × v).'],
    [1,'\\(\\mathbf u\\cdot(\\mathbf u\\times\\mathbf v)=0\\) for all \\(\\mathbf u,\\mathbf v\\).','u × v is orthogonal to u.'],
    [0,'\\((\\mathbf u\\times\\mathbf v)\\times\\mathbf w=\\mathbf u\\times(\\mathbf v\\times\\mathbf w)\\) for all vectors.','Not associative: (i × i) × j = 0, but i × (i × j) = i × k = −j.'],
    [1,'If \\(\\mathbf u\\cdot\\mathbf v=0\\) and \\(\\mathbf u\\times\\mathbf v=\\mathbf 0\\), then \\(\\mathbf u=\\mathbf 0\\) or \\(\\mathbf v=\\mathbf 0\\).','cos θ = 0 and sin θ = 0 cannot both hold, so one of the lengths must be 0.'],
    [0,'If \\(\\mathbf u\\cdot\\mathbf v=\\mathbf u\\cdot\\mathbf w\\) and \\(\\mathbf u\\ne\\mathbf 0\\), then \\(\\mathbf v=\\mathbf w\\).','u = i, v = j, w = k: both dot products are 0 but v ≠ w.'],
    [0,'Two lines in \\(\\mathbb R^3\\) that do not intersect must be parallel.','They can be skew: not parallel and never meeting.'],
    [1,'The planes \\(x+y+z=1\\) and \\(2x+2y+2z=5\\) are parallel.','Their normals ⟨1,1,1⟩ and ⟨2,2,2⟩ are multiples, and the planes are different.'],
    [0,'The plane \\(2x-y+3z=4\\) has normal vector \\(\\langle 2,1,3\\rangle\\).','The normal is the coefficient vector ⟨2, −1, 3⟩.'],
    [1,'In \\(\\mathbb R^3\\), the equation \\(x^2+y^2=4\\) describes a cylinder.','z is free, so the circle x² + y² = 4 is repeated at every height.'],
    [0,'\\(z=x^2-y^2\\) is an elliptic paraboloid.','The squares have opposite signs: it is a hyperbolic paraboloid (a saddle).'],
    [0,'The equation \\(x^2+y^2+z^2-2x+4=0\\) describes a sphere.','Completing the square gives (x − 1)² + y² + z² = −3: no points at all.'],
    [1,'\\(\\operatorname{proj}_{\\mathbf v}\\mathbf u\\) is parallel to \\(\\mathbf v\\) (when it is not \\(\\mathbf 0\\)).','It is a scalar multiple of v.'],
    [0,'\\(\\operatorname{scal}_{\\mathbf v}\\mathbf u\\) is never negative.','It is |u| cos θ, which is negative when the angle is obtuse.'],
    [1,'The area of the triangle with sides \\(\\mathbf u\\) and \\(\\mathbf v\\) is \\(\\tfrac12|\\mathbf u\\times\\mathbf v|\\).','The parallelogram has area |u × v|; the triangle is half.'],
    [0,'\\(|\\mathbf u\\cdot\\mathbf v|\\) can be larger than \\(|\\mathbf u||\\mathbf v|\\).','Cauchy–Schwarz: |u · v| = |u||v||cos θ| ≤ |u||v|.']],
  '14':[
    [1,'If \\(|\\mathbf r(t)|\\) is constant, then \\(\\mathbf r(t)\\cdot\\mathbf r\'(t)=0\\) for all \\(t\\).','Differentiate r · r = constant: 2 r · r′ = 0.'],
    [0,'The curve \\(\\mathbf r(t)=\\langle t,\\,t^2,\\,t^3\\rangle\\) lies in a plane.','It is the twisted cubic; its points (0,0,0), (1,1,1), (2,4,8), (−1,1,−1) are not coplanar.'],
    [0,'If the speed \\(|\\mathbf r\'(t)|\\) is constant, then \\(\\mathbf r\'\'(t)=\\mathbf 0\\).','Uniform circular motion has constant speed but acceleration toward the center.'],
    [1,'In uniform circular motion, the acceleration points toward the center.','r = R⟨cos ωt, sin ωt⟩ gives a = −ω² r.'],
    [0,'A circle of radius \\(R\\) has curvature \\(R\\).','Its curvature is 1/R: bigger circles bend less.'],
    [1,'A straight line has curvature 0.','T is constant, so T′ = 0.'],
    [1,'The unit tangent \\(\\mathbf T\\) and principal unit normal \\(\\mathbf N\\) are orthogonal.','|T| = 1 is constant, so T · T′ = 0, and N is parallel to T′.'],
    [0,'\\(\\frac{d}{dt}(\\mathbf u\\times\\mathbf v)=\\mathbf u\'\\times\\mathbf v\'\\).','The product rule gives u′ × v + u × v′.'],
    [1,'Curvature does not depend on how the curve is parametrized.','κ = |dT/ds| is defined with arc length, a property of the curve itself.'],
    [0,'The tangential component of acceleration always equals \\(|\\mathbf a|\\).','a = a_T T + a_N N; a_T = |a| only when the motion is straight.'],
    [1,'If the speed is constant, then \\(a_T=0\\).','a_T = d|v|/dt.'],
    [0,'The length of a curve depends on which one-to-one parametrization you use.','Arc length is independent of the (one-to-one) parametrization.'],
    [0,'If you double the launch speed of a projectile (same angle, level ground, gravity only), its range doubles.','Range = v₀² sin 2α / g, so doubling v₀ multiplies the range by 4.'],
    [1,'If you double the launch speed of a projectile (same angle, level ground, gravity only), its time of flight doubles.','Time of flight = 2v₀ sin α / g is proportional to v₀.'],
    [0,'At the top of its path, a projectile has velocity \\(\\mathbf 0\\).','Only the vertical velocity is 0 there; the horizontal velocity never changes.'],
    [1,'Two particles can move along paths that intersect without ever colliding.','A collision needs the same point at the same time; the paths can cross at different times.'],
    [1,'\\(\\mathbf r(t)=\\langle\\cos t,\\sin t\\rangle\\) and \\(\\mathbf R(t)=\\langle\\cos 2t,\\sin 2t\\rangle\\) trace the same circle.','Both trace the unit circle; R just goes twice as fast.'],
    [0,'If \\(\\mathbf r\'(t)=\\mathbf 0\\) at some \\(t\\), the curve must stop existing there.','r′ = 0 only means the parametrization is not smooth there; the curve can continue (it may have a cusp).'],
    [1,'The speed of an object with position \\(\\mathbf r(t)\\) is \\(|\\mathbf r\'(t)|\\).','Speed is the length of the velocity vector.']],
  '15':[
    [1,'If \\(f\\) is continuous at \\((a,b)\\), then \\(\\lim_{(x,y)\\to(a,b)}f(x,y)=f(a,b)\\).','That is the definition of continuity.'],
    [0,'If the limit along every line through \\((a,b)\\) equals \\(L\\), then the limit is \\(L\\).','x²y/(x⁴ + y²) → 0 along every line through the origin but → 1/2 along y = x².'],
    [1,'If two paths into \\((a,b)\\) give different limits, the limit does not exist.','That is the two-path test.'],
    [0,'The domain of \\(f(x,y)=\\sqrt{x-y}\\) is \\(\\{(x,y): x>y\\}\\).','√0 is defined, so the line y = x is included: x ≥ y.'],
    [1,'If \\(f\\) is differentiable at \\((a,b)\\), then \\(f\\) is continuous at \\((a,b)\\).','Differentiability implies continuity.'],
    [0,'If \\(f_x\\) and \\(f_y\\) exist at \\((a,b)\\), then \\(f\\) is differentiable there.','xy/(x² + y²) (with f(0,0) = 0) has both partials at the origin but is not even continuous there.'],
    [1,'If \\(f_{xy}\\) and \\(f_{yx}\\) are continuous, then \\(f_{xy}=f_{yx}\\).','Clairaut’s theorem.'],
    [1,'\\(\\nabla f(a,b)\\) is perpendicular to the level curve of \\(f\\) through \\((a,b)\\) (when it is not \\(\\mathbf 0\\)).','Along the level curve f does not change, so ∇f · T = 0.'],
    [0,'\\(D_{\\mathbf u}f\\) is largest when \\(\\mathbf u\\) is perpendicular to \\(\\nabla f\\).','Perpendicular gives 0; the maximum is along ∇f.'],
    [1,'The maximum value of \\(D_{\\mathbf u}f(a,b)\\) is \\(|\\nabla f(a,b)|\\).','D_u f = |∇f| cos θ, largest at θ = 0.'],
    [0,'If \\(\\nabla f(a,b)=\\mathbf 0\\), then \\(f\\) has a local max or min at \\((a,b)\\).','It can be a saddle point: f = x² − y² at the origin.'],
    [1,'If \\(f\\) is differentiable and has a local maximum at \\((a,b)\\), then \\(\\nabla f(a,b)=\\mathbf 0\\).','Each one-variable slice has a maximum there, so f_x = f_y = 0.'],
    [0,'If \\(D<0\\) at a critical point, the point is a local maximum.','D < 0 means a saddle point.'],
    [1,'A continuous function on a closed, bounded region has an absolute maximum and minimum there.','The Extreme Value Theorem.'],
    [0,'Two different level curves of \\(f\\) can intersect.','Each point has one value f(x, y), so it lies on exactly one level curve.'],
    [1,'The plane tangent to \\(z=f(x,y)\\) at \\((a,b)\\) has normal \\(\\langle f_x(a,b),\\,f_y(a,b),\\,-1\\rangle\\).','Write the plane as f_x(x − a) + f_y(y − b) − (z − f(a,b)) = 0.'],
    [0,'The differential \\(dz=f_x\\,dx+f_y\\,dy\\) equals the exact change \\(\\Delta z\\).','dz is the change along the tangent plane; it only approximates Δz.'],
    [1,'\\(\\nabla F(P)\\) is normal to the level surface \\(F(x,y,z)=c\\) through \\(P\\).','Every curve on the surface has F constant, so ∇F · r′ = 0.'],
    [0,'If \\(f(x,y)=e^{xy}\\), then \\(f_{xy}=xy\\,e^{xy}\\).','f_x = y e^{xy}; then the product rule gives f_xy = e^{xy} + xy e^{xy} = (1 + xy)e^{xy}.'],
    [0,'If \\(z=f(x,y)\\) with \\(x=g(t)\\), \\(y=h(t)\\), then \\(\\frac{dz}{dt}=f_x+f_y\\).','Each branch needs its rate: dz/dt = f_x dx/dt + f_y dy/dt.']]
};
const CONCEPT_TOPIC={'13':['Concept checks: Ch 13','13.1–13.6'],'14':['Concept checks: Ch 14','14.1–14.5'],'15':['Concept checks: Ch 15','15.1–15.7']};
Object.keys(CONCEPTS).forEach(ch=>{
  add('concept-'+ch,CONCEPT_TOPIC[ch][0],CONCEPT_TOPIC[ch][1],()=>{
    const [tru,s,why]=pick(CONCEPTS[ch]);
    const opts=[{h:'True',ok:!!tru,why:tru?'':why},{h:'False',ok:!tru,why:tru?why:''}];
    return {q:`True or false? ${s}`,kind:'choice',opts,ans:tru?'True':'False',lv:1,how:why,
      sol:[[tru?'True. '+why:'False. '+why,'']],chk:{op:'manual'},noShuffle:true};
  });
});
