
/* =====================================================================
   HW01–HW02   ·   each generator returns {q, ans, unit, lv, how, sol}
   lv: 1 easy ×1, 2 medium ×2, 3 hard ×3      sol: [[step text, LaTeX], ...]
   ===================================================================== */

/* ---- Vectors · HW01 ---- */
add('vec-mag','Vectors',1,()=>{
  const a=nz(-9,9),b=nz(-9,9),c=nz(-9,9),s=a*a+b*b+c*c,ans=Math.sqrt(s);
  return{q:`A rod is described by <b>r</b> = ${vec(a,b,c)} m. What is |<b>r</b>|?`,
    ans,unit:'m',lv:1,how:'|r| = √(x² + y² + z²)',
    sol:[['Square each component, add them, and take the square root.',
          X`|\mathbf r|=\sqrt{(${a})^2+(${b})^2+(${c})^2}=\sqrt{${s}}=${tn(ans)}${U('m')}`]]};
});
add('vec-unit','Vectors',1,()=>{
  const a=nz(-9,9),b=nz(-9,9),c=nz(-9,9),i=ri(0,2),comp=[a,b,c][i],M=Math.hypot(a,b,c),ans=comp/M,x=AX[i];
  return{q:`<b>A</b> = ${vec(a,b,c)} m. What is the ${x} component of the unit vector <b>Â</b>?`,
    ans,unit:'',lv:2,how:'Â = A / |A|: divide each component by |A|. Unit vectors have no units.',
    sol:[['Find the magnitude of <b>A</b>.',X`|\mathbf A|=\sqrt{(${a})^2+(${b})^2+(${c})^2}=${tn(M)}${U('m')}`],
         [`Divide the ${x} component by the magnitude. The meters cancel, so a unit vector has no units.`,
          X`\hat{A}_${x}=\frac{A_${x}}{|\mathbf A|}=\frac{${comp}}{${tn(M)}}=${tn(ans)}`]]};
});
add('vec-scale','Vectors',1,()=>{
  const a=nz(-8,8),b=nz(-8,8),c=nz(-8,8),M=ri(3,12)*5,i=ri(0,2),comp=[a,b,c][i],Am=Math.hypot(a,b,c),ans=M*comp/Am,x=AX[i];
  return{q:`<b>B</b> points the same way as <b>A</b> = ${vec(a,b,c)} but has magnitude ${M} m. What is B<sub>${x}</sub>?`,
    ans,unit:'m',lv:2,how:'B = |B| Â',
    sol:[['Find |<b>A</b>|.',X`|\mathbf A|=\sqrt{(${a})^2+(${b})^2+(${c})^2}=${tn(Am)}`],
         ['Same direction means <b>B</b> = |<b>B</b>| <b>Â</b>. Take the component you need.',
          X`B_${x}=|\mathbf B|\,\frac{A_${x}}{|\mathbf A|}=${M}\cdot\frac{${comp}}{${tn(Am)}}=${tn(ans)}${U('m')}`]]};
});
add('vec-rel','Vectors',1,()=>{
  const r1=[nz(-9,9),nz(-9,9),nz(-9,9)],d=[nz(-9,9),nz(-9,9),nz(-9,9)];
  const r2=r1.map((v,i)=>v+d[i]);
  const base=`Object 1 sits at ${vec(...r1)} m and object 2 at ${vec(...r2)} m. `;
  if(Math.random()<0.5){
    const i=ri(0,2),x=AX[i];
    return{q:base+`What is the ${x} component of the vector pointing <em>from 1 to 2</em>?`,
      ans:d[i],unit:'m',lv:1,how:'From 1 to 2 is r₂ − r₁ (final minus initial).',
      sol:[['The vector from 1 to 2 is final minus initial.',
            X`(\mathbf r_2-\mathbf r_1)_${x}=${r2[i]}-${tp(r1[i])}=${tn(d[i])}${U('m')}`]]};
  }
  const ans=Math.hypot(...d);
  return{q:base+'How far apart are they?',ans,unit:'m',lv:2,how:'Distance = |r₂ − r₁|',
    sol:[['Subtract to get the vector from 1 to 2.',X`\mathbf r_2-\mathbf r_1=${tv(...d)}${U('m')}`],
         ['Its magnitude is the distance.',X`|\mathbf r_2-\mathbf r_1|=\sqrt{(${d[0]})^2+(${d[1]})^2+(${d[2]})^2}=${tn(ans)}${U('m')}`]]};
});
add('vec-angle','Vectors',1,()=>{
  const deg=pick([25,40,55,70,110,125,160,200,215,250,290,325]);
  const i=Math.random()<0.5?0:1,ans=i===0?Math.cos(deg*D2R):Math.sin(deg*D2R),fn=i===0?'\\cos':'\\sin';
  return{q:`A unit vector lies in the xy plane at ${deg}° counterclockwise from the +x axis. What is its ${AX[i]} component?`,
    ans,unit:'',lv:1,how:'⟨cos θ, sin θ, 0⟩ with θ measured from +x',
    sol:[['A unit vector at angle θ from +x in the xy plane is ⟨cos θ, sin θ, 0⟩.',
          X`\hat{\mathbf u}=\langle\cos ${deg}^\circ,\ \sin ${deg}^\circ,\ 0\rangle`],
         ['',X`\hat u_${AX[i]}=${fn} ${deg}^\circ=${tn(ans)}`]]};
});

/* ---- Velocity · HW02 ---- */
add('vel-avg','Velocity',2,()=>{
  const dt=pick([0.2,0.4,0.5,2,4]),t1=ri(1,9),t2=rd(t1+dt,2);
  const r1=[nz(-6,6),nz(-6,6),nz(-6,6)];
  const d=[nz(-20,20)/10,nz(-20,20)/10,nz(-20,20)/10];
  const r2=r1.map((v,i)=>rd(v+d[i],2));
  const i=ri(0,2),x=AX[i],dx=r2[i]-r1[i],ans=dx/dt;
  return{q:`A bee is at ${vec(...r1)} m at t = ${t1} s and at ${vec(...r2)} m at t = ${t2} s. `+
           `What is the ${x} component of its average velocity?`,
    ans,unit:'m/s',lv:1,how:'v_avg = Δr / Δt, one component at a time',
    sol:[['Average velocity is displacement divided by elapsed time, one component at a time.',
          X`v_{\text{avg},${x}}=\frac{\Delta ${x}}{\Delta t}=\frac{${r2[i]}-${tp(r1[i])}}{${t2}-${t1}}=\frac{${tn(dx)}}{${dt}}=${tn(ans)}${U('m/s')}`]]};
});
add('vel-predict','Velocity',2,()=>{
  const r=[nz(-9,9),nz(-9,9),nz(-9,9)],v=[nz(-9,9),nz(-9,9),nz(-9,9)];
  const dt=pick([0.1,0.25,0.5,2,3]),i=ri(0,2),x=AX[i],ans=r[i]+v[i]*dt;
  return{q:`A drone at ${vec(...r)} m moves with constant velocity ${vec(...v)} m/s. What is its ${x} coordinate ${dt} s later?`,
    ans,unit:'m',lv:1,how:'r_f = r_i + v Δt',
    sol:[['With constant velocity, the new position is the old one plus <i>v</i>Δ<i>t</i>.',
          X`${x}_f=${x}_i+v_${x}\,\Delta t=${r[i]}+${tp(v[i])}(${dt})=${tn(ans)}${U('m')}`]]};
});

/* ---- Momentum · HW02 ---- */
add('mom-mag','Momentum',2,()=>{
  const m=pick([0.05,0.12,0.25,0.4,0.6,1.5,2.5]),v=[nz(-9,9),nz(-9,9),nz(-9,9)],sp=Math.hypot(...v),ans=m*sp;
  return{q:`A ${m} kg object has velocity ${vec(...v)} m/s. What is the magnitude of its momentum?`,
    ans,unit:'kg·m/s',lv:1,how:'|p| = m|v| at low speed',
    sol:[['Find the speed.',X`|\mathbf v|=\sqrt{(${v[0]})^2+(${v[1]})^2+(${v[2]})^2}=${tn(sp)}${U('m/s')}`],
         ['At low speed |<b>p</b>| = <i>m</i>|<b>v</b>|.',X`|\mathbf p|=m|\mathbf v|=(${m})(${tn(sp)})=${tn(ans)}${U('kg·m/s')}`]]};
});
add('mom-dp','Momentum',2,()=>{
  const m=pick([0.15,0.3,0.45,0.8,1.2]),i=ri(0,2),x=AX[i];
  const vi=[nz(-9,9),nz(-9,9),nz(-9,9)],dv=[nz(-9,9),nz(-9,9),nz(-9,9)];
  const vf=vi.map((v,k)=>v+dv[k]),ans=m*dv[i];
  return{q:`A ${m} kg ball's velocity changes from ${vec(...vi)} m/s to ${vec(...vf)} m/s. What is the ${x} component of Δ<b>p</b>?`,
    ans,unit:'kg·m/s',lv:1,how:'Δp = m(v_f − v_i)',
    sol:[['Change in momentum is mass times change in velocity, one component at a time.',
          X`\Delta p_${x}=m\,(v_{f,${x}}-v_{i,${x}})=${m}\,(${vf[i]}-${tp(vi[i])})=${tn(ans)}${U('kg·m/s')}`]]};
});
add('mom-gamma','Relativistic p',2,()=>{
  const f=pick([0.6,0.8,0.9,0.95,0.98,0.99,0.995]),ans=1/Math.sqrt(1-f*f);
  return{q:`A particle travels at ${f}c. What is γ?`,ans,unit:'',lv:1,how:'γ = 1 / √(1 − (v/c)²)',
    sol:[['Plug the speed, as a fraction of <i>c</i>, into γ.',
          X`\gamma=\frac{1}{\sqrt{1-(${f})^2}}=\frac{1}{\sqrt{${tn(1-f*f,5)}}}=${tn(ans)}`]]};
});
add('mom-rel','Relativistic p',2,()=>{
  const p=pick([{n:'proton',m:1.67e-27},{n:'electron',m:9.11e-31},{n:'muon',m:1.88e-28}]);
  const f=pick([0.8,0.9,0.95,0.98,0.99]),g=1/Math.sqrt(1-f*f),v=f*K.c,ans=g*p.m*v;
  return{q:`A ${p.n} (m = ${sci(p.m,3)} kg) moves at ${f}c. What is the magnitude of its relativistic momentum?`,
    ans,unit:'kg·m/s',lv:2,how:'|p| = γ m |v|',
    sol:[['Find γ.',X`\gamma=\frac{1}{\sqrt{1-(${f})^2}}=${tn(g)}`],
         ['Convert the speed to m/s.',X`|\mathbf v|=${f}\,c=${f}\,(3\times10^{8})=${tn(v)}${U('m/s')}`],
         ['Relativistic momentum is γ<i>m</i>|<b>v</b>|.',
          X`|\mathbf p|=\gamma m|\mathbf v|=(${tn(g)})(${tn(p.m,3)})(${tn(v)})=${tn(ans)}${U('kg·m/s')}`]]};
});
