
/* =====================================================================
   HW03–HW05
   ===================================================================== */

/* ---- Force · HW03 / HW04 ---- */
add('force-net','Force',3,()=>{
  const n=pick([2,3]),F=[];
  for(let k=0;k<n;k++)F.push([nz(-12,12),nz(-12,12),nz(-12,12)]);
  const S=[0,1,2].map(i=>F.reduce((s,f)=>s+f[i],0));
  const parts=F.map(f=>vec(...f));
  const list=parts.length===2?parts.join(' and '):parts.slice(0,-1).join(', ')+' and '+parts[parts.length-1];
  const i=ri(0,2),x=AX[i];
  if(Math.random()<0.5&&S[i]!==0)
    return{q:`Forces ${list} N act on an object. What is the ${x} component of the net force?`,
      ans:S[i],unit:'N',lv:1,how:'Add the forces component by component.',
      sol:[[`Add the ${x} components of every force.`,X`F_{\text{net},${x}}=${F.map(f=>tp(f[i])).join('+')}=${tn(S[i])}${U('N')}`]]};
  const ans=Math.hypot(...S);
  return{q:`Forces ${list} N act on an object. What is the magnitude of the net force?`,
    ans,unit:'N',lv:2,how:'Add the forces component by component, then take the magnitude.',
    sol:[['Add the forces component by component.',X`\mathbf F_{\text{net}}=${tv(...S)}${U('N')}`],
         ['Take the magnitude.',X`|\mathbf F_{\text{net}}|=\sqrt{(${S[0]})^2+(${S[1]})^2+(${S[2]})^2}=${tn(ans)}${U('N')}`]]};
});
add('force-update','Force',3,()=>{
  const F=[nz(-9,9),nz(-9,9),nz(-9,9)],p=[nz(-25,25),nz(-25,25),nz(-25,25)];
  const dt=pick([2,3,4,5]),i=ri(0,2),x=AX[i],ans=p[i]+F[i]*dt;
  return{q:`An object has momentum ${vec(...p)} kg·m/s when a constant net force ${vec(...F)} N `+
           `begins acting. What is the ${x} component of its momentum ${dt} s later?`,
    ans,unit:'kg·m/s',lv:1,how:'p_f = p_i + F_net Δt',
    sol:[['Momentum Principle with a constant net force.',
          X`p_{f,${x}}=p_{i,${x}}+F_{\text{net},${x}}\,\Delta t=${p[i]}+${tp(F[i])}(${dt})=${tn(ans)}${U('kg·m/s')}`]]};
});
add('crash','Force',4,()=>{
  const m=pick([900,1200,1500,1800]),v=pick([14,16,18,20,24]),d=pick([0.5,0.65,0.8,1.0]);
  const va=v/2,dt=d/va,F=m*v/dt;
  const s1=[['With a constant force the speed drops steadily, so the average speed is half the initial speed.',
             X`v_{\text{avg}}=\frac{${v}+0}{2}=${tn(va)}${U('m/s')}`],
            ['The car covers the crumple distance at that average speed.',X`\Delta t=\frac{d}{v_{\text{avg}}}=\frac{${d}}{${tn(va)}}=${tn(dt)}${U('s')}`]];
  const base=`A ${m} kg car hits a wall at ${v} m/s and stops without rebounding, crumpling ${d} m. `;
  if(Math.random()<0.5)
    return{q:base+'Treating the force as constant, how long does the collision last?',
      ans:dt,unit:'s',lv:2,how:'Constant force: v_avg = v/2, so Δt = d / (v/2)',sol:s1};
  return{q:base+'What is the magnitude of the average force on the car?',
    ans:F,unit:'N',lv:2,how:'Δt = d/(v/2), then F = |Δp| / Δt',
    sol:s1.concat([['The Momentum Principle gives the average force.',
                    X`|\mathbf F|=\frac{|\Delta\mathbf p|}{\Delta t}=\frac{(${m})(${v})}{${tn(dt)}}=${tn(F)}${U('N')}`]])};
});
add('rebound','Force',4,()=>{
  const m=pick([0.045,0.06,0.145,0.31]),v=pick([25,32,40,54]),dt=pick([0.0008,0.0012,0.002,0.004]);
  const dp=2*m*v,ans=dp/dt;
  return{q:`A ${m} kg ball moving at ${v} m/s hits a wall and rebounds at the same speed. `+
           `Contact lasts ${dt} s. What is the magnitude of the average force on the ball?`,
    ans,unit:'N',lv:2,how:'A same-speed bounce reverses p: |Δp| = 2mv, F = |Δp|/Δt',
    sol:[['The velocity reverses, so the momentum change is twice <i>mv</i>, not zero.',
          X`|\Delta\mathbf p|=mv-(-mv)=2mv=2(${m})(${v})=${tn(dp)}${U('kg·m/s')}`],
         ['Divide by the contact time.',X`|\mathbf F|=\frac{|\Delta\mathbf p|}{\Delta t}=\frac{${tn(dp)}}{${tn(dt,6)}}=${tn(ans)}${U('N')}`]]};
});

/* ---- Springs · HW03 ---- */
add('spring-vert','Springs',3,()=>{
  const L0=pick([0.30,0.40,0.50]),k=pick([15,20,25,30]),comp=pick([0.10,0.15,0.20]);
  const m=pick([0.08,0.10,0.12,0.15]),L=rd(L0-comp,2),Fs=k*comp,Fg=-m*K.g,ans=Fs+Fg;
  return{q:`A spring (relaxed length ${L0} m, stiffness ${k} N/m) stands on a table with a ${m} kg block `+
           `glued on top. It is compressed to a length of ${L} m and released. `+
           `What is the net force on the block at that instant? Take up as positive.`,
    ans,unit:'N',lv:2,how:'F_net,y = k_s|s| − mg',
    sol:[['The spring is shorter than relaxed, so it is compressed.',X`s=L-L_0=${L}-${L0}=${tn(L-L0)}${U('m')}`],
         ['A compressed spring pushes up on the block.',X`F_{\text{spring},y}=k_s|s|=(${k})(${tn(comp)})=${tn(Fs)}${U('N')}`],
         ['The Earth pulls down.',X`F_{\text{Earth},y}=-mg=-(${m})(9.8)=${tn(Fg)}${U('N')}`],
         ['Add them.',X`F_{\text{net},y}=${tn(Fs)}+${tp(Fg)}=${tn(ans)}${U('N')}`]]};
});
add('spring-2d','Springs',3,()=>{
  const h=pick([0.60,0.80,1.00]),x=pick([0.12,0.18,0.24,0.30]);
  const drop=pick([0.30,0.40,0.45,0.50]),L0=pick([0.20,0.25,0.30]);
  const y=rd(h-drop,2),Lm=Math.hypot(x,drop),ans=Lm-L0;
  return{q:`A spring of relaxed length ${L0} m hangs from a support at ${vec(0,h,0)} m. `+
           `A ball on its end is at ${vec(x,y,0)} m. How much is the spring stretched?`,
    ans,unit:'m',lv:2,how:'L runs from the support to the ball; s = |L| − L₀',
    sol:[['<b>L</b> runs from the support to the ball: ball position minus support position.',
          X`\mathbf L=${tv(x,y,0)}-${tv(0,h,0)}=${tv(x,-drop,0)}${U('m')}`],
         ['Find its length.',X`|\mathbf L|=\sqrt{(${x})^2+(${tn(-drop)})^2}=${tn(Lm)}${U('m')}`],
         ['Stretch is length minus relaxed length.',X`s=|\mathbf L|-L_0=${tn(Lm)}-${L0}=${tn(ans)}${U('m')}`]]};
});
add('spring-force','Springs',3,()=>{
  const k=pick([12,18,24,35]),L0=pick([0.10,0.15,0.25]),L=rd(L0+pick([0.04,0.07,0.12,0.16]),2),s=L-L0,ans=k*s;
  return{q:`A spring of stiffness ${k} N/m and relaxed length ${L0} m is stretched to a length of ${L} m. `+
           `What is the magnitude of the force it exerts?`,
    ans,unit:'N',lv:1,how:'|F| = k_s |s|, s = L − L₀',
    sol:[['Find the stretch, then use Hooke’s law.',X`s=${L}-${L0}=${tn(s)}${U('m')},\qquad |\mathbf F|=k_s|s|=(${k})(${tn(s)})=${tn(ans)}${U('N')}`]]};
});

/* ---- Projectiles · HW04 ---- */
add('proj-top','Projectiles',4,()=>{
  const vx=ri(5,25),vy=ri(8,30),ans=vy/K.g;
  return{q:`A ball is thrown with initial velocity ${vec(vx,vy,0)} m/s. Air resistance is negligible. `+
           `How long until it reaches maximum height?`,
    ans,unit:'s',lv:1,how:'v_y = 0 at the top: t = v_y0 / g',
    sol:[['At the top <i>v<sub>y</sub></i> = 0, and <i>v<sub>y</sub></i> drops by <i>g</i> every second. The x motion does not matter.',
          X`0=v_{y0}-g\,t\quad\Rightarrow\quad t=\frac{v_{y0}}{g}=\frac{${vy}}{9.8}=${tn(ans)}${U('s')}`]]};
});
add('proj-range','Projectiles',4,()=>{
  const vx=ri(5,25),vy=ri(8,30),tf=2*vy/K.g,ans=vx*tf;
  return{q:`A ball is launched from the ground with velocity ${vec(vx,vy,0)} m/s. `+
           `How far does it travel horizontally before returning to y = 0?`,
    ans,unit:'m',lv:2,how:'Flight time 2v_y0/g, range = v_x0 · 2v_y0/g',
    sol:[['<i>y</i> returns to 0 when the average <i>v<sub>y</sub></i> is zero, which takes twice the time to the top.',
          X`t_f=\frac{2v_{y0}}{g}=\frac{2(${vy})}{9.8}=${tn(tf)}${U('s')}`],
         ['<i>v<sub>x</sub></i> never changes.',X`x=v_{x0}\,t_f=(${vx})(${tn(tf)})=${tn(ans)}${U('m')}`]]};
});
add('proj-h','Projectiles',4,()=>{
  const vx=ri(5,25),vy=ri(8,30),t=vy/K.g,ans=vy*vy/(2*K.g);
  return{q:`A ball is launched with velocity ${vec(vx,vy,0)} m/s. What maximum height does it reach?`,
    ans,unit:'m',lv:2,how:'h = v_avg,y · t = (v_y0/2)(v_y0/g) = v_y0²/2g',
    sol:[['Time to reach the top.',X`t=\frac{v_{y0}}{g}=\frac{${vy}}{9.8}=${tn(t)}${U('s')}`],
         ['<i>v<sub>y</sub></i> falls steadily from <i>v<sub>y0</sub></i> to 0, so its average is half of <i>v<sub>y0</sub></i>.',
          X`h=v_{\text{avg},y}\,t=\frac{${vy}}{2}\,(${tn(t)})=${tn(ans)}${U('m')}`]]};
});

/* ---- Gravitation · HW04 / HW05 ---- */
add('grav-force','Gravitation',4,()=>{
  const a=ri(2,9),b=ri(1,9),r=ri(2,9),ans=K.G*(a*1e24)*(b*1e30)/Math.pow(r*1e11,2);
  return{q:`A planet of mass ${a}×10<sup>24</sup> kg and a star of mass ${b}×10<sup>30</sup> kg are `+
           `${r}×10<sup>11</sup> m apart. What is the magnitude of the gravitational force between them?`,
    ans,unit:'N',lv:2,how:'F = G m₁m₂ / r²',
    sol:[['Newton’s law of gravitation, with <i>r</i> the center-to-center distance.',
          X`|\mathbf F|=\frac{Gm_1m_2}{r^2}=\frac{(6.674\times10^{-11})(${a}\times10^{24})(${b}\times10^{30})}{(${r}\times10^{11})^2}=${tn(ans)}${U('N')}`]]};
});
add('surface-g','Gravitation',5,()=>{
  const M=ri(3,9),R=ri(3,9),ans=K.G*M*1e24/Math.pow(R*1e6,2);
  return{q:`A planet has mass ${M}×10<sup>24</sup> kg and radius ${R}×10<sup>6</sup> m. What is g at its surface?`,
    ans,unit:'N/kg',lv:1,how:'g = GM / R²',
    sol:[['The force per kilogram at the surface is <i>GM</i>/<i>R</i>².',
          X`g=\frac{GM}{R^2}=\frac{(6.674\times10^{-11})(${M}\times10^{24})}{(${R}\times10^{6})^2}=${tn(ans)}${U('N/kg')}`]]};
});
add('recoil','Gravitation',4,()=>{
  const M=pick([55,62,68,75,80]),m=pick([0.8,1.2,1.5,2.0,2.5]),v=pick([2.5,3.0,3.5,4.0]),ans=m*v/M;
  return{q:`A ${M} kg astronaut floating at rest throws a ${m} kg toolbag away at ${v} m/s. How fast does she recoil?`,
    ans,unit:'m/s',lv:1,how:'Reciprocity: total momentum stays zero, so Mv = m v_bag',
    sol:[['Nothing outside the astronaut–bag system pushes on it, and its total momentum starts at zero.',
          X`0=M\,v_{\text{astro}}+m\,v_{\text{bag}}`],
         ['Solve for her speed.',X`|v_{\text{astro}}|=\frac{m\,v_{\text{bag}}}{M}=\frac{(${m})(${v})}{${M}}=${tn(ans)}${U('m/s')}`]]};
});
add('dv-ratio','Gravitation',4,()=>{
  const big=pick([1200,2600,4800,7500]),small=pick([0.15,0.6,2.5,12]),ans=big/small;
  return{q:`A ${small} kg object and a ${big} kg object interact only with each other. `+
           `The smaller one's change in speed is how many times the larger one's?`,
    ans,unit:'times',lv:1,how:'Equal and opposite impulses, so Δv ∝ 1/m',
    sol:[['Reciprocity: equal and opposite forces for the same time give equal-size momentum changes.',
          X`m_{\text{small}}|\Delta v_{\text{small}}|=m_{\text{large}}|\Delta v_{\text{large}}|`],
         ['',X`\frac{|\Delta v_{\text{small}}|}{|\Delta v_{\text{large}}|}=\frac{m_{\text{large}}}{m_{\text{small}}}=\frac{${big}}{${small}}=${tn(ans)}`]]};
});

/* ---- Electric · HW05 ---- */
add('coulomb','Electric',5,()=>{
  const q1=ri(2,9),q2=ri(2,9),r=pick([0.20,0.25,0.40,0.50,0.60]),ans=K.ke*(q1*1e-9)*(q2*1e-9)/(r*r);
  return{q:`Two spheres carry charges of ${q1} nC and ${q2} nC and sit ${r} m apart. `+
           `What is the magnitude of the electric force between them?`,
    ans,unit:'N',lv:1,how:'F = (1/4πε₀)|q₁q₂| / r², with nC = 10⁻⁹ C',
    sol:[['Convert nC to C (×10<sup>−9</sup>) and apply Coulomb’s law.',
          X`|\mathbf F|=\frac{1}{4\pi\varepsilon_0}\frac{|q_1q_2|}{r^2}=(8.99\times10^{9})\,\frac{(${q1}\times10^{-9})(${q2}\times10^{-9})}{(${r})^2}=${tn(ans)}${U('N')}`]]};
});
add('nucleus','Electric',5,()=>{
  const Z=ri(2,9)*10,r=pick([2,4,6,8]),q=Z*K.e,ans=K.ke*q*K.e/Math.pow(r*1e-10,2);
  return{q:`A nucleus holding ${Z} protons sits ${r}×10<sup>−10</sup> m from a single electron. `+
           `What is the magnitude of the electric force on the electron?`,
    ans,unit:'N',lv:2,how:'F = (1/4πε₀)(Ze)(e) / r²',
    sol:[['The nucleus carries +<i>e</i> for each proton.',X`q_{\text{nuc}}=Ze=${Z}\,(1.602\times10^{-19})=${tn(q)}${U('C')}`],
         ['Coulomb’s law with the electron’s charge of magnitude <i>e</i>.',
          X`|\mathbf F|=(8.99\times10^{9})\,\frac{(${tn(q)})(1.602\times10^{-19})}{(${r}\times10^{-10})^2}=${tn(ans)}${U('N')}`]]};
});

/* ---- Conservation · HW05 ---- */
add('car-truck','Conservation',5,()=>{
  const m1=pick([1200,1400,1800,2100]),m2=pick([2600,3200,4800]);
  const v1=ri(15,32),v2=ri(10,25),along=Math.random()<0.5,x=along?'x':'z';
  const px=m1*v1,pz=-m2*v2,pc=along?px:pz,ans=pc/(m1+m2);
  return{q:`A ${m1} kg car moving at ${vec(v1,0,0)} m/s collides with a ${m2} kg truck moving at `+
           `${vec(0,0,-v2)} m/s. They lock together. What is the ${x} component of their velocity just afterward?`,
    ans,unit:'m/s',lv:2,how:'p_total is conserved; v = p_total / (m₁ + m₂)',
    sol:[['Total momentum just before. The road’s impulse is negligible over the brief collision.',
          X`\mathbf p_{\text{tot}}=m_1\mathbf v_1+m_2\mathbf v_2=${tv(px,0,pz,6)}${U('kg·m/s')}`],
         ['The locked-together wreck carries all of it.',X`v_${x}=\frac{p_{\text{tot},${x}}}{m_1+m_2}=\frac{${tn(pc,6)}}{${m1+m2}}=${tn(ans)}${U('m/s')}`]]};
});
add('rocks','Conservation',5,()=>{
  const pa=[nz(-20,20),nz(-20,20),nz(-20,20)],pb=[nz(-20,20),nz(-20,20),nz(-20,20)];
  const i=ri(0,2),x=AX[i],ans=pa[i]+pb[i];
  return{q:`Two rocks drift in deep space with momenta ${vec(...pa)} and ${vec(...pb)} kg·m/s. `+
           `They collide and stick together. What is the ${x} component of the combined momentum?`,
    ans,unit:'kg·m/s',lv:1,how:'No external impulse: p after = sum of p before',
    sol:[['No outside forces act, so the total momentum is unchanged by the collision.',
          X`p_${x}=${pa[i]}+${tp(pb[i])}=${tn(ans)}${U('kg·m/s')}`]]};
});
add('explosion','Conservation',5,()=>{
  const ma=ri(2,8),mb=ri(2,8),mc=ri(3,9);
  const va=[nz(-9,9)*20,nz(-9,9)*20,nz(-9,9)*20],vb=[nz(-9,9)*20,nz(-9,9)*20,nz(-9,9)*20];
  const i=ri(0,2),x=AX[i],ans=-(ma*va[i]+mb*vb[i])/mc;
  return{q:`A ${ma+mb+mc} kg object at rest in deep space blows apart into three pieces. `+
           `The ${ma} kg piece flies off at ${vec(...va)} m/s and the ${mb} kg piece at ${vec(...vb)} m/s. `+
           `What is the ${x} component of the ${mc} kg piece's velocity?`,
    ans,unit:'m/s',lv:2,how:'Total p stays zero: m₃v₃ = −(m₁v₁ + m₂v₂)',
    sol:[['The object starts at rest, so the pieces’ momenta must add to zero.',X`m_Av_{A${x}}+m_Bv_{B${x}}+m_Cv_{C${x}}=0`],
         ['Solve for the third piece.',X`v_{C${x}}=-\frac{(${ma})(${va[i]})+(${mb})(${vb[i]})}{${mc}}=${tn(ans)}${U('m/s')}`]]};
});
add('balls','Conservation',5,()=>{
  const m1=pick([0.05,0.06,0.10]),m2=pick([0.20,0.25,0.40]);
  const v1=ri(9,20),ly=pick([-8,-6,-5,-4]),lx=rd(v1*pick([0.4,0.5,0.6]),2),ans=-m1*ly/m2;
  return{q:`A ${m1} kg ball moving at ${vec(v1,0,0)} m/s strikes a stationary ${m2} kg ball. `+
           `Afterward the light ball moves at ${vec(lx,ly,0)} m/s. What is the y component of the heavy ball's velocity?`,
    ans,unit:'m/s',lv:2,how:'Total p_y starts at 0, so m₂v₂y = −m₁v₁y',
    sol:[['Total <i>p<sub>y</sub></i> starts at zero: the moving ball has no y velocity and the other ball is at rest.',
          X`m_1v_{1y}+m_2v_{2y}=0`],
         ['Solve for the heavy ball.',X`v_{2y}=-\frac{m_1v_{1y}}{m_2}=-\frac{(${m1})(${ly})}{${m2}}=${tn(ans)}${U('m/s')}`]]};
});
