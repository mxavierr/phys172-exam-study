
/* =====================================================================
   Exam 1 coverage, part 2 — statics, dynamics, springs in series/parallel,
   buoyancy on submerged objects, Young's modulus for any unknown,
   crest and minimum speeds, free-body-diagram chains
   ===================================================================== */

/* ---- 8. Statics: find the missing force · HW08 ---- */
add('statics-unknown','Equilibrium',8,()=>{
  let m,F1,F2,i,ans,tries=0;
  do{
    m=ri(2,30); F1=[ri(-80,80),ri(-80,80),0]; F2=[ri(-80,80),ri(-80,80),0];
    i=Math.random()<0.5?0:1;
    ans=i===0?-(F1[0]+F2[0]):(m*K.g-F1[1]-F2[1]);
    tries++;
  }while(Math.abs(ans)<1&&tries<40);
  const x=AX[i];
  return{q:`A ${m} kg sign hangs motionless. Two cables pull on it with forces ${vec(...F1)} N and ${vec(...F2)} N, `+
           `and a third cable also pulls on it. What is the ${x} component of the third cable's force?`,
    ans,unit:'N',lv:2,how:'At rest every force adds to zero, gravity included: F₃ = −(F₁ + F₂ + F_grav).',
    sol:[['The sign is at rest, so all the forces on it add to zero. Do not forget the Earth’s pull.',
          X`\mathbf F_1+\mathbf F_2+\mathbf F_3+\mathbf F_{\text{grav}}=0`],
         ['Gravity acts straight down.',X`\mathbf F_{\text{grav}}=\langle 0,\ -mg,\ 0\rangle=\langle 0,\ ${tn(-m*K.g)},\ 0\rangle${U('N')}`],
         [`Solve for the ${x} component of the third force.`,
          i===0?X`F_{3x}=-(F_{1x}+F_{2x})=-\big(${F1[0]}+${tp(F2[0])}\big)=${tn(ans)}${U('N')}`
               :X`F_{3y}=-(F_{1y}+F_{2y}-mg)=-\big(${F1[1]}+${tp(F2[1])}${tn(-m*K.g)}\big)=${tn(ans)}${U('N')}`]]};
});

/* ---- 9a. Dynamics: find the missing force · HW08 ---- */
add('dyn-unknown','Changing momentum',8,()=>{
  const m=pick([2,3,5,8,12,20]),a=[nz(-6,6),nz(-6,6),0];
  const F1=[ri(-40,40),ri(-40,40),0],F2=[ri(-40,40),ri(-40,40),0];
  const i=Math.random()<0.5?0:1,x=AX[i],ans=m*a[i]-F1[i]-F2[i];
  return{q:`A ${m} kg block has acceleration ${vec(...a)} m/s². Two of the three forces acting on it are `+
           `${vec(...F1)} N and ${vec(...F2)} N. What is the ${x} component of the third force?`,
    ans,unit:'N',lv:2,how:'F_net = ma, so the missing force is ma − (the forces you know).',
    sol:[['The net force is mass times acceleration, component by component.',
          X`F_{\text{net},${x}}=ma_${x}=(${m})(${a[i]})=${tn(m*a[i])}${U('N')}`],
         ['The three forces add to the net force, so subtract the two you know.',
          X`F_{3${x}}=F_{\text{net},${x}}-F_{1${x}}-F_{2${x}}=${tn(m*a[i])}-${tp(F1[i])}-${tp(F2[i])}=${tn(ans)}${U('N')}`]]};
});

/* ---- 9b. Two blocks moving together · HW08 ---- */
add('two-block-string','Changing momentum',8,()=>{
  const m1=ri(2,12),m2=ri(2,12),F=ri(20,120),a=F/(m1+m2),T=m2*a;
  const base=`On a frictionless floor you pull a ${m1} kg block with a horizontal ${F} N force, and a light string `+
             `ties it to a ${m2} kg block that it tows along behind. `;
  const fig=FIG.tow(m1,m2,F);
  const sA=['Treat the two blocks plus the string as one system. The string’s pulls are internal and cancel.',
            X`a=\frac{F}{m_1+m_2}=\frac{${F}}{${m1}+${m2}}=${tn(a)}${U('m/s²')}`];
  if(Math.random()<0.5)return{fig,q:base+'What is the acceleration of the blocks?',ans:a,unit:'m/s²',lv:2,
    how:'One system: a = F/(m₁ + m₂)',sol:[sA]};
  return{fig,q:base+'What is the tension in the string?',ans:T,unit:'N',lv:3,
    how:'System first for a, then isolate the towed block: T = m₂a',
    sol:[sA,['Now isolate the towed block. The string is the only horizontal force on it.',
             X`T=m_2a=(${m2})(${tn(a)})=${tn(T)}${U('N')}`]]};
});

/* ---- 11. Springs in series and in parallel · HW06 ---- */
add('series-parallel','Spring networks',6,()=>{
  const k=pick([12,18,20,24,30,40,50,60]),N=ri(2,5),m=pick([0.4,0.6,0.8,1.0,1.5,2.0]);
  const ser=Math.random()<0.5,keff=ser?k/N:k*N,s=m*K.g/keff;
  const how=ser?'Springs in series: k_series = k/N. Each one stretches the full amount, so the total stretch is N times larger.'
              :'Springs in parallel: k_parallel = N·k. They share the load, so the stretch is N times smaller.';
  const sK=[ser?'In series every spring carries the whole load and their stretches add, so the combination is softer.'
              :'In parallel the springs share the load, so the combination is stiffer.',
            ser?X`k_{\text{series}}=\frac{k}{N}=\frac{${k}}{${N}}=${tn(keff)}${U('N/m')}`
               :X`k_{\text{parallel}}=Nk=(${N})(${k})=${tn(keff)}${U('N/m')}`];
  const base=`A single spring has a stiffness of ${k} N/m. You connect ${N} identical springs `+
             `${ser?'end to end in series':'side by side in parallel'} and hang a ${m} kg mass from the combination. `;
  if(Math.random()<0.45)
    return{q:base+'What is the effective stiffness of the combination?',ans:keff,unit:'N/m',lv:1,how,sol:[sK]};
  return{q:base+'How far does the combination stretch?',ans:s,unit:'m',lv:2,how,
    sol:[sK,['At rest the combination holds the weight.',
             X`s=\frac{mg}{k_{\text{eff}}}=\frac{(${m})(9.8)}{${tn(keff)}}=${tn(s)}${U('m')}`]]};
});

/* ---- 12. Buoyancy on floating and submerged objects · HW07 ---- */
add('buoy-fraction','Buoyancy',7,()=>{
  const liq=pick([{n:'water',r:1.00},{n:'seawater',r:1.03},{n:'ethanol',r:0.79}]);
  const rb=rd(liq.r*rf(0.35,0.9,2),2),ans=rb/liq.r;
  return{q:`A solid block of density ${rb} g/cm³ floats in ${liq.n} (density ${liq.r.toFixed(2)} g/cm³). `+
           `What fraction of the block's volume is below the surface?`,
    ans,unit:'',lv:1,how:'Floating: V_submerged/V_total = ρ_object/ρ_fluid',
    sol:[['Floating means the buoyant force equals the weight.',X`\rho_{\text{fluid}}V_{\text{sub}}\,g=\rho_{\text{obj}}V_{\text{tot}}\,g`],
         ['The volumes and g cancel into a ratio of densities.',
          X`\frac{V_{\text{sub}}}{V_{\text{tot}}}=\frac{\rho_{\text{obj}}}{\rho_{\text{fluid}}}=\frac{${rb}}{${liq.r.toFixed(2)}}=${tn(ans)}`]]};
});
add('buoy-submerged','Buoyancy',7,()=>{
  const k=pick(['force','tension','anchor']);
  if(k==='force'){
    const V=rf(1.5,12,1),ans=K.rhoW*(V/1000)*K.g;
    return{q:`A rock of volume ${V} L is completely submerged in water. What is the magnitude of the buoyant force on it?`,
      ans,unit:'N',lv:2,how:'F_b = ρ_water·V·g, with V in m³ (1 L = 10⁻³ m³)',
      sol:[['Convert the volume to SI units.',X`V=${V}\ \text{L}=${tn(V/1000,4)}\ \text{m}^3`],
           ['The buoyant force is the weight of the water pushed aside.',
            X`F_b=\rho_{\text{water}}Vg=(1000)(${tn(V/1000,4)})(9.8)=${tn(ans)}${U('N')}`]]};
  }
  if(k==='tension'){
    const mt=pick(MAT.filter(x=>x.rho>2)),m=ri(2,15),V=m/(mt.rho*1000);
    const Fb=K.rhoW*V*K.g,ans=m*K.g-Fb;
    return{q:`A ${m} kg block of ${mt.n} (density ${mt.rho} g/cm³) hangs from a string and is completely submerged `+
             `in water. What is the tension in the string?`,
      ans,unit:'N',lv:3,how:'Fastened and at rest: T + F_buoy − mg = 0, with F_buoy = ρ_water·V·g and V = m/ρ_block',
      sol:[['Volume of the block, from its mass and density.',X`V=\frac{m}{\rho_{\text{block}}}=\frac{${m}}{${tn(mt.rho*1000,6)}}=${tn(V)}\ \text{m}^3`],
           ['Buoyant force: the weight of the displaced water.',X`F_b=\rho_{\text{water}}Vg=(1000)(${tn(V)})(9.8)=${tn(Fb)}${U('N')}`],
           ['At rest the three forces add to zero, so the string carries what is left of the weight.',
            X`T=mg-F_b=(${m})(9.8)-${tn(Fb)}=${tn(ans)}${U('N')}`]]};
  }
  const V=rf(2,20,1),rf_=rd(rf(0.2,0.7,2),2),Vm=V/1000;
  const Fb=K.rhoW*Vm*K.g,W=rf_*1000*Vm*K.g,ans=Fb-W;
  return{q:`A ${V} L block of foam with density ${rf_} g/cm³ is held completely under water by a string anchored to `+
           `the bottom of the tank. What is the tension in the string?`,
    ans,unit:'N',lv:3,how:'Held under: F_buoy − mg − T = 0, so T = ρ_water·V·g − ρ_foam·V·g',
    sol:[['Buoyant force on the fully submerged block.',
          X`F_b=\rho_{\text{water}}Vg=(1000)(${tn(Vm,4)})(9.8)=${tn(Fb)}${U('N')}`],
         ['Weight of the foam itself.',X`mg=\rho_{\text{foam}}Vg=(${tn(rf_*1000,6)})(${tn(Vm,4)})(9.8)=${tn(W)}${U('N')}`],
         ['The block is at rest, so the string pulls down with the difference.',
          X`T=F_b-mg=${tn(Fb)}-${tn(W)}=${tn(ans)}${U('N')}`]]};
});

/* ---- 14. Young's modulus solved for any unknown · HW06 ---- */
add('youngs-solve','Stress & strain',6,()=>{
  const mt=pick(MAT),L=pick([1.2,1.6,2.0,2.5,3.0]),D=pick([0.8,1.0,1.2,1.5,2.0]);
  const A=Math.PI*Math.pow(D/2000,2),F=ri(20,400);
  const dLmm=+((F*L/(A*mt.Y))*1000).toPrecision(3),dL=dLmm/1000;
  const k=pick(['force','ext','diam']);
  const sA=['Cross-sectional area, with the diameter in meters.',
            X`A=\pi\left(\frac{${D}\times10^{-3}}{2}\right)^2=${tn(A)}\ \text{m}^2`];
  const base=`A wire of ${mt.n} has Young's modulus ${sci(mt.Y,3)} N/m² and is ${L} m long. `;
  if(k==='force'){
    const ans=mt.Y*A*dL/L;
    return{q:base+`Its diameter is ${D} mm, and a pull stretches it ${sci(dLmm,3)} mm. What is the force pulling on it?`,
      ans,unit:'N',lv:2,how:'Y = (F/A)/(ΔL/L), so F = Y·A·ΔL/L',
      sol:[sA,['Rearrange the definition of Young’s modulus for the force.',
        X`F=\frac{YA\,\Delta L}{L}=\frac{(${tn(mt.Y,3)})(${tn(A)})(${tn(dL,4)})}{${L}}=${tn(ans)}${U('N')}`]]};
  }
  if(k==='ext'){
    const ans=F*L/(A*mt.Y)*1000;
    return{q:base+`Its diameter is ${D} mm. A ${F} N pull stretches it. By how much does it stretch, in millimeters?`,
      ans,unit:'mm',lv:2,how:'ΔL = FL/(AY)',
      sol:[sA,['Rearrange for the extension, then convert to millimeters.',
        X`\Delta L=\frac{FL}{AY}=\frac{(${F})(${L})}{(${tn(A)})(${tn(mt.Y,3)})}=${tn(ans/1000)}\ \text{m}=${tn(ans)}${U('mm')}`]]};
  }
  const ans=Math.sqrt(4*F*L/(Math.PI*mt.Y*dL))*1000;
  return{q:base+`A ${F} N pull stretches it ${sci(dLmm,3)} mm. What is the wire's diameter, in millimeters?`,
    ans,unit:'mm',lv:3,how:'Y = (F/A)/(ΔL/L) with A = πd²/4, so d = √(4FL/(πYΔL))',
    sol:[['Start from Young’s modulus with the area written in terms of the diameter.',
          X`Y=\frac{F/A}{\Delta L/L},\qquad A=\frac{\pi d^2}{4}`],
         ['Solve for the diameter.',X`d=\sqrt{\frac{4FL}{\pi Y\,\Delta L}}=\sqrt{\frac{4(${F})(${L})}{\pi(${tn(mt.Y,3)})(${tn(dL,4)})}}=${tn(ans/1000)}\ \text{m}=${tn(ans)}${U('mm')}`]]};
});

/* ---- 15. Crest of a hill, and the slowest speed at the top · HW08 ---- */
add('crest-loop','Circular motion',8,()=>{
  const k=pick(['crest','bucket','loop']);
  if(k==='crest'){
    const m=ri(9,20)*100,R=ri(30,120),v=Math.round(Math.sqrt(K.g*R*rf(0.25,0.7,2)));
    const c=m*v*v/R,ans=m*K.g-c;
    return{q:`A ${m} kg car drives over the top of a circular hill of radius ${R} m at ${v} m/s. What is the `+
             `magnitude of the force of the road on the car at the very top?`,
      ans,unit:'N',lv:2,how:'At a crest the center of the circle is below: mg − N = mv²/R',
      sol:[['At the top of a hill the center of the circle is straight down, so the net force points down.',
            X`\frac{mv^2}{R}=\frac{(${m})(${v})^2}{${R}}=${tn(c)}${U('N')}`],
           ['Gravity points toward the center and the road pushes away from it.',
            X`mg-N=\frac{mv^2}{R}\quad\Rightarrow\quad N=(${m})(9.8)-${tn(c)}=${tn(ans)}${U('N')}`]]};
  }
  const r=k==='bucket'?rf(0.7,1.4,1):ri(5,20),ans=Math.sqrt(K.g*r);
  const q=k==='bucket'
    ?`You swing a bucket of water in a vertical circle of radius ${r} m. What is the slowest speed at the top that `+
     `still keeps the water in the bucket (the rope just barely taut)?`
    :`A roller coaster car runs around a vertical loop of radius ${r} m. What is the slowest speed at the top that `+
     `keeps the car on the track (the track just barely pushing)?`;
  return{q,ans,unit:'m/s',lv:2,
    how:'At the minimum speed the rope or track goes slack, so gravity alone supplies mv²/r: v = √(gr)',
    sol:[[`At the slowest possible speed the ${k==='bucket'?'rope':'track'} force drops to zero, so gravity alone supplies the centripetal force.`,
          X`mg=\frac{mv^2}{r}`],
         ['The mass cancels.',X`v=\sqrt{gr}=\sqrt{(9.8)(${r})}=${tn(ans)}${U('m/s')}`]]};
});

/* ---- 16–17. Free-body diagram, then the updates that follow from it · HW08 ---- */
add('fbd-chain','Changing momentum',8,()=>{
  let m,th,T,f,tries=0;
  do{
    m=ri(8,40); th=ri(15,40); T=ri(60,220);
    f=ri(10,Math.max(11,Math.round(0.7*T*Math.cos(th*D2R))));
    tries++;
  }while((T*Math.sin(th*D2R)>0.8*m*K.g||T*Math.cos(th*D2R)-f<5)&&tries<60);
  const Tx=T*Math.cos(th*D2R),Ty=T*Math.sin(th*D2R),N=m*K.g-Ty,Fnet=Tx-f;
  const dt=pick([2,3,4]),p=Fnet*dt,vf=p/m,d=vf/2*dt;
  const base=`A ${m} kg crate sits at rest on a level floor. You pull on a rope tied to it with ${T} N at ${th}° `+
             `above the horizontal, and the floor's friction on the crate is ${f} N, opposing the sliding. `;
  const fig=FIG.pull({m,F:T,th,lab:'T'});
  const sX=['Break the rope force into components. Gravity and the normal force are vertical, so only the rope and friction matter along x.',
            X`F_{\text{net},x}=T\cos\theta-f=(${T})\cos ${th}^\circ-${f}=${tn(Fnet)}${U('N')}`];
  const k=pick(['netx','normal','p','dist']);
  if(k==='normal')return{fig,q:base+'What is the magnitude of the normal force from the floor?',ans:N,unit:'N',lv:2,
    how:'y: N + T·sin θ − mg = 0. The rope holds up part of the weight.',
    sol:[['Vertical part of the rope force.',X`T\sin\theta=(${T})\sin ${th}^\circ=${tn(Ty)}${U('N')}`],
         ['The crate does not accelerate vertically, so the y forces cancel.',
          X`N=mg-T\sin\theta=(${m})(9.8)-${tn(Ty)}=${tn(N)}${U('N')}`]]};
  if(k==='netx')return{fig,q:base+'What is the x component of the net force on the crate?',ans:Fnet,unit:'N',lv:2,
    how:'F_net,x = T·cos θ − f',sol:[sX]};
  if(k==='p')return{fig,q:base+`What is the crate's x momentum ${dt} s after it starts moving?`,ans:p,unit:'kg·m/s',lv:2,
    how:'p_f = p_i + F_net,x·Δt, starting from rest',
    sol:[sX,['Momentum Principle from rest.',X`p_x=0+F_{\text{net},x}\Delta t=(${tn(Fnet)})(${dt})=${tn(p)}${U('kg·m/s')}`]]};
  return{fig,q:base+`How far does the crate move in the first ${dt} s?`,ans:d,unit:'m',lv:3,
    how:'F_net,x → p after Δt → v_f = p/m → Δx = ½(0 + v_f)·Δt',
    sol:[sX,['Momentum after that time, starting from rest.',X`p_x=F_{\text{net},x}\Delta t=(${tn(Fnet)})(${dt})=${tn(p)}${U('kg·m/s')}`],
         ['Final velocity, then the average velocity for a constant force.',
          X`v_f=\frac{p_x}{m}=${tn(vf)}\ \text{m/s},\qquad v_{\text{avg}}=\frac{0+v_f}{2}=${tn(vf/2)}${U('m/s')}`],
         ['',X`\Delta x=v_{\text{avg}}\Delta t=(${tn(vf/2)})(${dt})=${tn(d)}${U('m')}`]]};
});
