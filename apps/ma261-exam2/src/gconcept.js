/* =====================================================================
   Concept checks: true/false statements in the style of the book's
   "Explain why or why not" exercises. Each false one carries its counterexample.
   ===================================================================== */
const CONCEPTS={
  '16':[
    [1,'At a constrained maximum found by Lagrange multipliers, \\(\\nabla f\\) is parallel to \\(\\nabla g\\).','∇f = λ∇g: the level curve of f is tangent to the constraint curve there.'],
    [0,'Every solution of \\(\\nabla f=\\lambda\\nabla g,\\ g=c\\) is a maximum.','The solutions are candidates: compare f at all of them to find the max and the min.'],
    [0,'Lagrange multipliers on \\(g=c\\) find the maximum of \\(f\\) over the whole region inside the closed curve \\(g=c\\).','They only search the boundary g = c; interior critical points (∇f = 0) must be checked separately.'],
    [1,'\\(\\displaystyle\\int_0^1\\!\\int_0^2 xy\\,dy\\,dx=\\left(\\int_0^1x\\,dx\\right)\\left(\\int_0^2y\\,dy\\right)\\).','A product g(x)h(y) over a rectangle separates.'],
    [0,'\\(\\displaystyle\\int_0^1\\!\\int_0^x f\\,dy\\,dx=\\int_0^x\\!\\int_0^1 f\\,dx\\,dy\\).','Reversing the order means redrawing the region: it is ∫₀¹∫ᵧ¹ f dx dy. Outer limits must be numbers.'],
    [1,'Reversing the order of integration never changes the value of a double integral of a continuous function.','Fubini: both orders describe the same region.'],
    [0,'\\(\\displaystyle\\iint_R x\\,dA=0\\) for every region symmetric about the \\(x\\)-axis.','Symmetry about the x-axis kills odd powers of y, not of x: on the right half-disk ∬x dA > 0.'],
    [1,'If \\(R\\) is the disk \\(x^2+y^2\\le 4\\), then \\(\\displaystyle\\iint_R xy^2\\,dA=0\\).','The disk is symmetric under x → −x and xy² is odd in x.'],
    [0,'In polar coordinates \\(dA=dr\\,d\\theta\\).','dA = r dr dθ: a polar rectangle has sides dr and r dθ.'],
    [1,'The average value of \\(f\\) over \\(R\\) is \\(\\dfrac{1}{\\text{area}(R)}\\displaystyle\\iint_R f\\,dA\\).','That is the definition.'],
    [0,'The volume between \\(z=f\\) and \\(z=g\\) over \\(R\\) is \\(\\displaystyle\\iint_R (f+g)\\,dA\\).','It is ∬(top − bottom) dA.'],
    [1,'A triple integral over a solid can be written in six orders of integration.','3! = 6 orders; the limits change with the order.'],
    [0,'In \\(\\int\\!\\int\\!\\int f\\,dz\\,dy\\,dx\\), the limits of \\(y\\) may depend on \\(z\\).','The middle variable’s limits may depend only on the outer variable x.'],
    [1,'\\(\\displaystyle\\iiint_D 1\\,dV\\) is the volume of \\(D\\).','Integrating 1 adds up the volume elements.'],
    [0,'In cylindrical coordinates \\(dV=dz\\,dr\\,d\\theta\\).','dV = r dz dr dθ.'],
    [0,'In spherical coordinates \\(dV=\\rho^2\\cos\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta\\).','dV = ρ² sin φ dρ dφ dθ.'],
    [1,'In spherical coordinates the cone \\(z=\\sqrt{x^2+y^2}\\) is \\(\\varphi=\\pi/4\\).','tan φ = r/z = 1 on the cone.'],
    [0,'The surface \\(\\rho=2\\cos\\varphi\\) is a sphere of radius 2.','ρ² = 2ρ cos φ is x² + y² + z² = 2z: radius 1, centre (0, 0, 1).'],
    [1,'In spherical coordinates the plane \\(z=3\\) is \\(\\rho=3\\sec\\varphi\\).','z = ρ cos φ = 3.'],
    [0,'\\(\\varphi\\) runs from \\(0\\) to \\(2\\pi\\) when describing a whole ball.','φ runs from 0 to π; θ runs from 0 to 2π.'],
    [1,'If the density increases with height, the center of mass of a solid hemisphere sits higher than \\(3a/8\\).','More mass up high pulls z̄ up (for ρ = z, z̄ = 8a/15).'],
    [0,'The center of mass of a plate always lies inside the plate.','A thin ring (annulus) has its center of mass at the centre, outside the material.'],
    [1,'If a plate and its density are both symmetric about the line \\(x=1\\), then \\(\\bar x=1\\).','The moments on the two sides cancel.']
  ],
  '17':[
    [1,'A gradient field \\(\\nabla\\varphi\\) is perpendicular to the level curves of \\(\\varphi\\).','The gradient is normal to level sets.'],
    [0,'\\(\\displaystyle\\int_{-C}f\\,ds=-\\int_C f\\,ds\\).','Scalar line integrals do not depend on orientation: ds > 0.'],
    [1,'\\(\\displaystyle\\int_{-C}\\mathbf F\\cdot d\\mathbf r=-\\int_C\\mathbf F\\cdot d\\mathbf r\\).','Reversing the curve reverses the tangent direction.'],
    [0,'The value of \\(\\int_C\\mathbf F\\cdot d\\mathbf r\\) depends on how fast the curve is traced.','Any orientation-preserving reparametrization gives the same value.'],
    [1,'If \\(\\mathbf F=\\nabla\\varphi\\), then \\(\\oint_C\\mathbf F\\cdot d\\mathbf r=0\\) for every closed curve \\(C\\).','φ(end) − φ(start) = 0 on a closed curve.'],
    [0,'\\(\\mathbf F=\\langle -y,x\\rangle\\) is conservative.','Q_x − P_y = 2 ≠ 0; its circulation around the unit circle is 2π.'],
    [0,'If \\(\\operatorname{curl}\\mathbf F=\\mathbf 0\\) wherever \\(\\mathbf F\\) is defined, then \\(\\mathbf F\\) is conservative.','The vortex field ⟨−y, x⟩/(x² + y²) has zero curl but circulation 2π around the origin; the domain is not simply connected.'],
    [1,'On all of \\(\\mathbb R^3\\), \\(\\mathbf F\\) is conservative exactly when \\(\\operatorname{curl}\\mathbf F=\\mathbf 0\\).','ℝ³ is simply connected.'],
    [0,'If \\(\\oint_C\\mathbf F\\cdot d\\mathbf r=0\\) for one closed curve \\(C\\), then \\(\\mathbf F\\) is conservative.','It has to hold for every closed curve.'],
    [1,'The work done by a force that is always perpendicular to the path is 0.','F·T = 0 along the whole curve.'],
    [1,'Green’s Theorem: \\(\\oint_C x\\,dy\\) equals the area enclosed by \\(C\\) (counterclockwise).','Q = x, P = 0: Q_x − P_y = 1.'],
    [0,'Green’s Theorem applies to any curve, closed or not.','C must be a simple closed curve bounding the region (close an open curve first).'],
    [0,'Reversing the orientation of \\(C\\) does not change the value in Green’s Theorem.','A clockwise boundary gives −∬(Q_x − P_y) dA.'],
    [1,'The outward flux of \\(\\mathbf F\\) across a closed curve equals \\(\\iint_R\\operatorname{div}\\mathbf F\\,dA\\).','The flux form of Green’s Theorem.'],
    [1,'\\(\\operatorname{curl}(\\nabla f)=\\mathbf 0\\) for every smooth \\(f\\).','Mixed partials are equal.'],
    [1,'\\(\\operatorname{div}(\\operatorname{curl}\\mathbf F)=0\\) for every smooth \\(\\mathbf F\\).','Mixed partials cancel in pairs.'],
    [0,'\\(\\operatorname{curl}(\\operatorname{div}\\mathbf F)\\) is always \\(\\mathbf 0\\).','div F is a scalar function; curl of a scalar is not defined.'],
    [0,'\\(\\nabla\\cdot\\left(\\mathbf r/|\\mathbf r|^2\\right)=0\\) in \\(\\mathbb R^3\\).','In 3-D, ∇·(r/|r|^p) = (3 − p)/|r|^p; it vanishes for p = 3, not p = 2.'],
    [1,'The rotation field \\(\\mathbf F=\\langle -y,x,0\\rangle\\) has \\(\\operatorname{div}\\mathbf F=0\\).','No component depends on its own variable.'],
    [0,'For \\(z=g(x,y)\\), \\(dS=dA\\).','dS = √(1 + g_x² + g_y²) dA; only horizontal planes have dS = dA.'],
    [1,'On the sphere \\(\\rho=a\\), \\(dS=a^2\\sin\\varphi\\,d\\varphi\\,d\\theta\\).','|r_φ × r_θ| = a² sin φ.'],
    [1,'By symmetry, \\(\\iint_S z^2\\,dS=\\tfrac13\\iint_S(x^2+y^2+z^2)\\,dS\\) on a sphere centred at the origin.','∬x² = ∬y² = ∬z² on a sphere.'],
    [0,'The area of a surface is never larger than the area of its shadow in the \\(xy\\)-plane.','It is never smaller: √(1 + g_x² + g_y²) ≥ 1.']
  ]
};
const CONCEPT_TOPIC={'16':['Concept checks: 15.8 & Ch 16','16.1–16.6'],'17':['Concept checks: Ch 17','17.1–17.6']};
Object.keys(CONCEPTS).forEach(ch=>{
  add('concept-'+ch,CONCEPT_TOPIC[ch][0],CONCEPT_TOPIC[ch][1],()=>{
    const [tru,s,why]=pick(CONCEPTS[ch]);
    const opts=[{h:'True',ok:!!tru,why:tru?'':why},{h:'False',ok:!tru,why:tru?why:''}];
    return {q:`True or false? ${s}`,kind:'choice',opts,ans:tru?'True':'False',lv:1,how:why,
      sol:[[tru?'True. '+why:'False. '+why,'']],chk:{op:'manual'},noShuffle:true};
  });
});
