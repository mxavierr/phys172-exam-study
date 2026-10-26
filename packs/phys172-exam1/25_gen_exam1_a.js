
/* =====================================================================
   Exam 1 coverage, part 1 — average speed, position and momentum updates,
   motion graphs, momentum directions, forces from position vectors, scaling
   ===================================================================== */

/* ---- 1. Average speed and average velocity · HW02 ---- */
add('avg-speed','Velocity',2,()=>{
  const k=pick(['dist','dist','time','vel','vel']);
  if(k==='dist'){
    const d1=ri(20,120),v1=pick([40,50,60,70,80,90,100]),d2=ri(20,120),v2=pick([30,45,55,65,75,85,95]);
    const t1=d1/v1,t2=d2/v2,ans=(d1+d2)/(t1+t2);
    return{q:`You drive ${d1} km at a steady ${v1} km/h, then ${d2} km at a steady ${v2} km/h. `+
             `What is your average speed for the whole trip?`,
      ans,unit:'km/h',lv:2,how:'Average speed = total distance / total time. It is not the average of the two speeds.',
      sol:[['Time for each leg.',X`t_1=\frac{${d1}}{${v1}}=${tn(t1)}\ \text{h},\qquad t_2=\frac{${d2}}{${v2}}=${tn(t2)}\ \text{h}`],
           ['Average speed is total distance over total time. Averaging the two speeds would be wrong, because you spend different amounts of time at each.',
            X`v_{\text{avg}}=\frac{${d1}+${d2}}{${tn(t1)}+${tn(t2)}}=\frac{${d1+d2}}{${tn(t1+t2)}}=${tn(ans)}${U('km/h')}`]]};
  }
  if(k==='time'){
    const t1=rf(0.5,2.5,1),v1=ri(40,110),t2=rf(0.5,2.5,1),v2=ri(40,110),d=v1*t1+v2*t2;
    const sD=['Distance for each leg, then add.',
      X`d=v_1t_1+v_2t_2=(${v1})(${t1})+(${v2})(${t2})=${tn(d)}\ \text{km}`];
    if(Math.random()<0.5)
      return{q:`For ${t1} hours you drive at a steady ${v1} km/h, then for ${t2} hours at a steady ${v2} km/h. How far do you drive in total?`,
        ans:d,unit:'km',lv:1,how:'Distance for each leg is v·t; add them.',sol:[sD]};
    const ans=d/(t1+t2);
    return{q:`For ${t1} hours you drive at a steady ${v1} km/h, then for ${t2} hours at a steady ${v2} km/h. What is your average speed?`,
      ans,unit:'km/h',lv:2,how:'Average speed = total distance / total time.',
      sol:[sD,['Divide by the total time.',X`v_{\text{avg}}=\frac{${tn(d)}}{${t1}+${t2}}=${tn(ans)}${U('km/h')}`]]};
  }
  const d1=ri(20,90),t1=ri(5,30),d2=ri(20,90),t2=ri(5,30);
  const T=t1+t2,path=d1+d2,disp=Math.hypot(d1,d2);
  const base=`A jogger runs ${d1} m due east in ${t1} s, then turns and runs ${d2} m due north in ${t2} s. `;
  if(Math.random()<0.5)
    return{q:base+'What is her average speed?',ans:path/T,unit:'m/s',lv:2,
      how:'Average speed uses the distance travelled along the path, not the displacement.',
      sol:[['Average speed uses the path length: add the distances actually run.',
            X`v_{\text{avg}}=\frac{d_1+d_2}{t_1+t_2}=\frac{${d1}+${d2}}{${t1}+${t2}}=${tn(path/T)}${U('m/s')}`]]};
  return{q:base+'What is the magnitude of her average velocity?',ans:disp/T,unit:'m/s',lv:2,
    how:'Average velocity uses the straight-line displacement from start to finish, not the path length.',
    sol:[['Displacement is the straight line from start to finish. The two legs are perpendicular.',
          X`|\Delta\mathbf r|=\sqrt{(${d1})^2+(${d2})^2}=${tn(disp)}${U('m')}`],
         ['Divide by the total time. This is smaller than the average speed, because the path bends.',
          X`|\mathbf v_{\text{avg}}|=\frac{${tn(disp)}}{${T}}=${tn(disp/T)}${U('m/s')}`]]};
});

/* ---- 2. Position update with a constant net force · HW03 ---- */
add('pos-update','Force',3,()=>{
  const m=pick([0.5,1.2,2,3,5]),vi=ri(2,12),F=ri(2,20),dt=pick([2,3,4,5]),x0=nz(-10,10);
  const vf=vi+F*dt/m,va=(vi+vf)/2,dx=va*dt;
  const s=[['Momentum Principle for the final velocity.',
            X`v_f=v_i+\frac{F_{\text{net}}\,\Delta t}{m}=${vi}+\frac{(${F})(${dt})}{${m}}=${tn(vf)}${U('m/s')}`],
           ['With a constant net force the average velocity is exactly the average of the endpoints.',
            X`v_{\text{avg}}=\frac{v_i+v_f}{2}=\frac{${vi}+${tn(vf)}}{2}=${tn(va)}${U('m/s')}`]];
  const base=`A ${m} kg cart moves along the x axis at ${vi} m/s when a constant net force of ${F} N in the +x direction begins acting. `;
  if(Math.random()<0.5)
    return{q:base+`How far does it travel in the next ${dt} s?`,ans:dx,unit:'m',lv:2,
      how:'v_f = v_i + FΔt/m, then Δx = ½(v_i + v_f)·Δt',
      sol:s.concat([['Displacement is average velocity times time.',X`\Delta x=v_{\text{avg}}\Delta t=(${tn(va)})(${dt})=${tn(dx)}${U('m')}`]])};
  return{q:base+`It is at x = ${fm(x0)} m at that moment. What is its x coordinate ${dt} s later?`,ans:x0+dx,unit:'m',lv:2,
    how:'r_f = r_i + v_avg·Δt with v_avg = ½(v_i + v_f)',
    sol:s.concat([['Update the position.',X`x_f=x_i+v_{\text{avg}}\Delta t=${x0}+(${tn(va)})(${dt})=${tn(x0+dx)}${U('m')}`]])};
});

/* ---- 3. Motion graphs · HW02 ---- */
add('graph-xt','Motion graphs',2,()=>{
  const t1=ri(0,4),t2=t1+ri(2,6);
  let x1=nz(-10,10),x2=nz(-10,10); if(x2===x1)x2=x1+3;
  const v=(x2-x1)/(t2-t1);
  const sV=['On an x-versus-t graph the slope is the velocity.',
    X`v_x=\frac{\Delta x}{\Delta t}=\frac{${x2}-${tp(x1)}}{${t2}-${t1}}=${tn(v)}${U('m/s')}`];
  const base=`An object moves along the x axis. Its x-versus-t graph is a straight line through the points `+
             `(t = ${t1} s, x = ${fm(x1)} m) and (t = ${t2} s, x = ${fm(x2)} m). `;
  if(Math.random()<0.55)
    return{q:base+'What is v<sub>x</sub>?',ans:v,unit:'m/s',lv:1,how:'The slope of an x-vs-t graph is v_x.',sol:[sV]};
  const t3=t2+ri(1,5),ans=x2+v*(t3-t2);
  return{q:base+`The line continues with the same slope. What is x at t = ${t3} s?`,ans,unit:'m',lv:2,
    how:'Straight line on x-vs-t means constant velocity: x = x₀ + v_x·Δt',
    sol:[sV,['A straight line means constant velocity, so extend from the second point.',
             X`x=${x2}+(${tn(v)})(${t3}-${t2})=${tn(ans)}${U('m')}`]]};
});
add('graph-vt','Motion graphs',2,()=>{
  let v1=nz(-12,12),v2=nz(-12,12); if(v2===v1)v2=-v1;
  const T=ri(3,10),a=(v2-v1)/T,dx=(v1+v2)/2*T;
  const opts=['disp','disp','accel']; if(v1*v2<0)opts.push('zero');
  const k=pick(opts);
  const base=`An object's v<sub>x</sub>-versus-t graph is a straight line from v<sub>x</sub> = ${fm(v1)} m/s at `+
             `t = 0 to v<sub>x</sub> = ${fm(v2)} m/s at t = ${T} s. `;
  if(k==='accel')return{q:base+'What is its acceleration?',ans:a,unit:'m/s²',lv:1,
    how:'The slope of a v-vs-t graph is the acceleration.',
    sol:[['On a v-versus-t graph the slope is the acceleration.',
          X`a_x=\frac{\Delta v_x}{\Delta t}=\frac{${v2}-${tp(v1)}}{${T}}=${tn(a)}${U('m/s²')}`]]};
  if(k==='zero'){
    const tz=v1*T/(v1-v2);
    return{q:base+'At what time is the object momentarily at rest?',ans:tz,unit:'s',lv:2,
      how:'Find where the straight line crosses v_x = 0.',
      sol:[['Write the line and set it to zero.',X`v_x(t)=${v1}+(${tn(a)})\,t=0`],
           ['',X`t=\frac{-(${v1})}{${tn(a)}}=${tn(tz)}${U('s')}`]]};
  }
  return{q:base+`What is its displacement over those ${T} s?`,ans:dx,unit:'m',lv:2,
    how:'Displacement is the signed area under a v-vs-t graph: ½(v_i + v_f)·Δt for a straight line.',
    sol:[['Displacement is the signed area under the v-versus-t graph, so area below the axis counts as negative.',''],
         ['For a straight line that area is the average of the endpoints times the elapsed time.',
          X`\Delta x=\frac{v_i+v_f}{2}\,\Delta t=\frac{${v1}+${tp(v2)}}{2}\,(${T})=${tn(dx)}${U('m')}`]]};
});

/* ---- 4. Direction of the momentum change · HW02 ---- */
add('dp-direction','Momentum',2,()=>{
  let pi,pf,dp,ang,tries=0;
  do{
    pi=[nz(-9,9),nz(-9,9),0]; pf=[nz(-9,9),nz(-9,9),0];
    dp=[pf[0]-pi[0],pf[1]-pi[1],0];
    ang=(Math.atan2(dp[1],dp[0])*180/Math.PI+360)%360; tries++;
  }while((Math.hypot(dp[0],dp[1])<2||ang<12||ang>348)&&tries<60);
  return{q:`A ball's momentum changes from ${vec(...pi)} kg·m/s to ${vec(...pf)} kg·m/s. Measuring `+
           `counterclockwise from the +x axis, in what direction does Δ<b>p</b> point? The average net force points the same way.`,
    ans:ang,unit:'°',lv:2,how:'Δp = p_f − p_i, and F_net points along Δp. Take the angle with atan2, watching the quadrant.',
    sol:[['Subtract the vectors, component by component.',
          X`\Delta\mathbf p=\mathbf p_f-\mathbf p_i=${tv(pf[0],pf[1],0)}-${tv(pi[0],pi[1],0)}=${tv(dp[0],dp[1],0)}${U('kg·m/s')}`],
         [`The x component is ${dp[0]<0?'negative':'positive'} and the y component is ${dp[1]<0?'negative':'positive'}, so Δ<b>p</b> points into the ${dp[0]>0?(dp[1]>0?'first':'fourth'):(dp[1]>0?'second':'third')} quadrant. The net force points the same way.`,
          X`\theta=\operatorname{atan2}(${tn(dp[1])},\ ${tn(dp[0])})=${tn(ang)}^\circ`]]};
});

/* ---- 5. Momentum update from time or from distance · HW03 ---- */
add('mom-update','Force',3,()=>{
  const m=pick([0.5,2,5,12,60,1200]),vi=ri(10,30),vf=ri(1,8),va=(vi+vf)/2;
  if(Math.random()<0.5){
    const dt=pick([1.5,2,2.5,3,4]),F=m*(vi-vf)/dt,d=va*dt;
    const base=`A ${m} kg object moving at ${vi} m/s along the x axis slows to ${vf} m/s in ${dt} s, with a constant net force. `;
    if(Math.random()<0.5)
      return{q:base+'What is the magnitude of the average net force on it?',ans:F,unit:'N',lv:2,
        how:'|F_net| = |Δp|/Δt = m|v_f − v_i|/Δt',
        sol:[['Momentum change.',X`|\Delta p|=m|v_f-v_i|=(${m})|${vf}-${vi}|=${tn(m*(vi-vf))}${U('kg·m/s')}`],
             ['Divide by the time.',X`|\mathbf F_{\text{net}}|=\frac{|\Delta p|}{\Delta t}=\frac{${tn(m*(vi-vf))}}{${dt}}=${tn(F)}${U('N')}`]]};
    return{q:base+'How far does it travel while slowing?',ans:d,unit:'m',lv:2,
      how:'Constant force: v_avg = ½(v_i + v_f), then d = v_avg·Δt',
      sol:[['With a constant net force the average velocity is the average of the endpoints.',
            X`v_{\text{avg}}=\frac{${vi}+${vf}}{2}=${tn(va)}${U('m/s')}`],
           ['',X`d=v_{\text{avg}}\Delta t=(${tn(va)})(${dt})=${tn(d)}${U('m')}`]]};
  }
  const d=ri(10,120),dt=d/va,F=m*(vi-vf)/dt;
  const base=`A ${m} kg object moving at ${vi} m/s along the x axis slows to ${vf} m/s over a distance of ${d} m, with a constant net force. `;
  const sT=[['With a constant net force the average velocity is the average of the endpoints.',
             X`v_{\text{avg}}=\frac{${vi}+${vf}}{2}=${tn(va)}${U('m/s')}`],
            ['Time from distance and average velocity.',X`\Delta t=\frac{d}{v_{\text{avg}}}=\frac{${d}}{${tn(va)}}=${tn(dt)}${U('s')}`]];
  if(Math.random()<0.5)
    return{q:base+'How long does that take?',ans:dt,unit:'s',lv:3,how:'v_avg = ½(v_i + v_f), then Δt = d/v_avg',sol:sT};
  return{q:base+'What is the magnitude of the average net force on it?',ans:F,unit:'N',lv:3,
    how:'Get Δt from d/v_avg first, then |F| = m|Δv|/Δt',
    sol:sT.concat([['Now use the Momentum Principle.',
      X`|\mathbf F_{\text{net}}|=\frac{m|v_f-v_i|}{\Delta t}=\frac{(${m})(${vi-vf})}{${tn(dt)}}=${tn(F)}${U('N')}`]])};
});

/* ---- 6. Head-on collision that sticks · HW05 ---- */
add('collide-1d','Conservation',5,()=>{
  const m1=ri(8,20)*100,v1=ri(10,30),m2=ri(8,25)*100,v2=ri(5,25);
  const p=m1*v1-m2*v2,ans=p/(m1+m2);
  return{q:`A ${m1} kg car moving at ${v1} m/s in the +x direction collides head-on with a ${m2} kg car moving at `+
           `${v2} m/s in the −x direction. They lock together. What is the x component of their velocity just afterward?`,
    ans,unit:'m/s',lv:2,how:'p_total is conserved. Keep the signs: one car moves in −x.',
    sol:[['Total momentum before. The second car moves in −x, so its momentum is negative.',
          X`p_x=m_1v_1+m_2v_2=(${m1})(${v1})+(${m2})(${-v2})=${tn(p,6)}${U('kg·m/s')}`],
         [`The stuck-together pair carries that momentum. The sign of the answer says they move in the ${ans<0?'−x':'+x'} direction.`,
          X`v_x=\frac{p_x}{m_1+m_2}=\frac{${tn(p,6)}}{${m1+m2}}=${tn(ans)}${U('m/s')}`]]};
});

/* ---- 7a. Force vector from two position vectors · HW04 / HW05 ---- */
const TRIPLE=[[3,4,5],[6,8,10],[5,12,13],[9,12,15],[8,15,17],[12,16,20],[7,24,25]];
add('grav-vec','Gravitation',4,()=>{
  const t=pick(TRIPLE),sx=pick([1,-1]),sy=pick([1,-1]);
  const rp=[nz(-6,6),nz(-6,6),0],d=[sx*t[0],sy*t[1],0],rs=[rp[0]+d[0],rp[1]+d[1],0];
  const mp=ri(2,9),ms=ri(1,9),rm=t[2]*1e11;
  const rh=[d[0]/t[2],d[1]/t[2],0];
  const F=K.G*(mp*1e24)*(ms*1e30)/(rm*rm);
  const i=Math.random()<0.5?0:1,x=AX[i],ans=F*rh[i];
  return{q:`A planet of mass ${mp}×10<sup>24</sup> kg is at ${vec(...rp)}×10<sup>11</sup> m. A star of mass `+
           `${ms}×10<sup>30</sup> kg is at ${vec(...rs)}×10<sup>11</sup> m. What is the ${x} component of the `+
           `gravitational force on the planet by the star?`,
    ans,unit:'N',lv:3,how:'r = r_star − r_planet, then r̂, then F = (Gm₁m₂/|r|²) r̂. Gravity is attractive, so it points along +r̂ (planet toward star).',
    sol:[['Relative position vector, pointing from the planet to the star.',
          X`\mathbf r=\mathbf r_{\text{star}}-\mathbf r_{\text{planet}}=${tv(d[0],d[1],0)}\times10^{11}${U('m')}`],
         ['Its magnitude.',X`|\mathbf r|=\sqrt{(${d[0]})^2+(${d[1]})^2}\times10^{11}=${tn(rm)}${U('m')}`],
         ['Unit vector.',X`\hat{\mathbf r}=\frac{\mathbf r}{|\mathbf r|}=${tv(rh[0],rh[1],0)}`],
         ['Magnitude of the force.',
          X`|\mathbf F|=\frac{Gm_1m_2}{|\mathbf r|^2}=\frac{(6.674\times10^{-11})(${mp}\times10^{24})(${ms}\times10^{30})}{(${tn(rm)})^2}=${tn(F)}${U('N')}`],
         ['Gravity pulls the planet toward the star, which is the +r̂ direction. Take the component.',
          X`F_${x}=|\mathbf F|\,\hat r_${x}=(${tn(F)})(${tn(rh[i])})=${tn(ans)}${U('N')}`]]};
});
add('elec-vec','Electric',5,()=>{
  const t=pick(TRIPLE),sc=pick([0.1,0.05]),sx=pick([1,-1]),sy=pick([1,-1]);
  const r1=[rd(nz(-6,6)/10,2),rd(nz(-6,6)/10,2),0];
  const d=[rd(sx*t[0]*sc,3),rd(sy*t[1]*sc,3),0];
  const r2=[rd(r1[0]+d[0],3),rd(r1[1]+d[1],3),0],rm=t[2]*sc;
  const q1=nz(-9,9),q2=nz(-9,9);
  const rh=[d[0]/rm,d[1]/rm,0];
  const Fs=K.ke*(q1*1e-9)*(q2*1e-9)/(rm*rm);           /* signed: + means repulsive, along +r̂ */
  const i=Math.random()<0.5?0:1,x=AX[i],ans=Fs*rh[i];
  const rep=q1*q2>0;
  return{q:`Sphere 1 carries ${fm(q1)} nC and sits at ${vec(...r1)} m. Sphere 2 carries ${fm(q2)} nC and sits at `+
           `${vec(...r2)} m. What is the ${x} component of the electric force on sphere 2 by sphere 1?`,
    ans,unit:'N',lv:3,how:'r points from 1 to 2. Like charges push along +r̂, opposite charges pull along −r̂.',
    sol:[['Relative position vector, from sphere 1 to sphere 2.',X`\mathbf r=\mathbf r_2-\mathbf r_1=${tv(d[0],d[1],0)}${U('m')}`],
         ['Magnitude and unit vector.',X`|\mathbf r|=${tn(rm)}\ \text{m},\qquad \hat{\mathbf r}=${tv(rh[0],rh[1],0)}`],
         ['Magnitude of the force.',
          X`|\mathbf F|=\frac{1}{4\pi\varepsilon_0}\frac{|q_1q_2|}{|\mathbf r|^2}=(8.99\times10^{9})\frac{|(${fm(q1)}\times10^{-9})(${fm(q2)}\times10^{-9})|}{(${tn(rm)})^2}=${tn(Math.abs(Fs))}${U('N')}`],
         [rep?'The charges have the same sign, so sphere 2 is pushed away from sphere 1: along +r̂.'
             :'The charges have opposite signs, so sphere 2 is pulled toward sphere 1: along −r̂.',
          X`F_${x}=${rep?'':'-'}|\mathbf F|\,\hat r_${x}=${tn(ans)}${U('N')}`]]};
});

/* ---- 7b. How the force changes when mass, charge or distance changes ---- */
const factorWord=f=>f===0.5?'half as large':f===0.25?'a quarter as large':`${f} times as large`;
add('force-scale-grav','Gravitation',4,()=>{
  const F0=rf(1,9,1),e=ri(18,22);
  let ma,db; do{ma=pick([1,2,3,4,0.5]);db=pick([1,2,3,0.5,4]);}while(ma===1&&db===1);
  const both=ma!==1&&db!==1,ans=F0*Math.pow(10,e)*ma/(db*db);
  const changes=[ma!==1?`the moon's mass were ${factorWord(ma)}`:null,
                 db!==1?`the distance between them were ${factorWord(db)}`:null].filter(Boolean);
  const list=changes.join(' and ');
  return{q:`The gravitational force between a planet and its moon has magnitude ${F0}×10<sup>${e}</sup> N. `+
           `If ${list} (with everything else unchanged), what would the magnitude of the force be?`,
    ans,unit:'N',lv:both?2:1,how:'F = Gm₁m₂/r²: force scales with each mass and with 1/r².',
    sol:[['Gravity is proportional to each mass and inversely proportional to the square of the distance.',X`F=\frac{Gm_1m_2}{r^2}`],
         ['Scale the original force by each change. The distance factor gets squared.',
          X`F'=(${tn(F0*Math.pow(10,e))})\cdot\frac{${ma}}{(${db})^2}=${tn(ans)}${U('N')}`]]};
});
add('force-scale-elec','Electric',5,()=>{
  const F0=rf(1,9,1),e=ri(-7,-4);
  let qa,db; do{qa=pick([1,2,3,4,0.5]);db=pick([1,2,3,0.5,4]);}while(qa===1&&db===1);
  const both=qa!==1&&db!==1,ans=F0*Math.pow(10,e)*qa/(db*db);
  const changes=[qa!==1?`one sphere's charge were ${factorWord(qa)}`:null,
                 db!==1?`their separation were ${factorWord(db)}`:null].filter(Boolean);
  const list=changes.join(' and ');
  return{q:`Two charged spheres attract each other with a force of magnitude ${F0}×10<sup>${e}</sup> N. `+
           `If ${list} (with everything else unchanged), what would the magnitude of the force be?`,
    ans,unit:'N',lv:both?2:1,how:'F = (1/4πε₀)|q₁q₂|/r²: force scales with each charge and with 1/r².',
    sol:[['The electric force is proportional to each charge and inversely proportional to the square of the separation.',
          X`F=\frac{1}{4\pi\varepsilon_0}\frac{|q_1q_2|}{r^2}`],
         ['Scale the original force by each change, squaring the distance factor.',
          X`F'=(${tn(F0*Math.pow(10,e))})\cdot\frac{${qa}}{(${db})^2}=${tn(ans)}${U('N')}`]]};
});
