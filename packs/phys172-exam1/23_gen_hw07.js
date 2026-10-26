
/* =====================================================================
   HW07 · friction, oscillations, buoyancy   (+ HW10 stacked blocks)
   ===================================================================== */

/* ---- Friction ---- */
add('fric-stop','Friction',7,()=>{
  const m=rf(2,12,1),v0=rf(3,9,1),mu=rf(0.15,0.6,2),t=rd(v0/(mu*K.g),2),a=v0/t;
  const base=`A ${m} kg box with an initial speed of ${v0} m/s slides across a level floor and comes to a stop after ${t} s. `;
  const ask=pick(['mu','dist','heavy']);
  if(ask==='mu')return{q:base+'What is the coefficient of kinetic friction?',ans:P.muStop(v0,t),unit:'',lv:2,
    how:'Friction is the only horizontal force: μk·mg·t = m·v₀, so μk = v₀/(g·t)',
    sol:[['The box slows at a constant rate.',X`|a|=\frac{v_0}{t}=\frac{${v0}}{${t}}=${tn(a)}${U('m/s²')}`],
         ['Kinetic friction μ<sub>k</sub><i>mg</i> is the only horizontal force, so |<i>a</i>| = μ<sub>k</sub><i>g</i>. The mass cancels.',
          X`\mu_k=\frac{|a|}{g}=\frac{${tn(a)}}{9.8}=${tn(P.muStop(v0,t))}`]]};
  if(ask==='dist')return{q:base+'How far does it slide?',ans:v0*t/2,unit:'m',lv:1,
    how:'Constant force: v_avg = v₀/2, so d = (v₀/2)·t',
    sol:[['A constant friction force means the speed drops steadily, so the average speed is half of <i>v</i><sub>0</sub>.',
          X`d=v_{\text{avg}}\,t=\frac{${v0}+0}{2}\,(${t})=${tn(v0*t/2)}${U('m')}`]]};
  const extra=rf(2,10,1);
  return{q:base+`You put a ${extra} kg block inside and launch the box at the same ${v0} m/s. How long does it take to stop now?`,
    ans:t,unit:'s',lv:2,how:'Friction and inertia both scale with mass (a = μk·g), so the stopping time does not change.',
    sol:[['Friction grows with the mass, but so does the inertia. The deceleration does not depend on mass.',X`|a|=\frac{\mu_k m g}{m}=\mu_k g`],
         ['Same launch speed and same deceleration give the same stopping time.',X`t=\frac{v_0}{\mu_k g}=${tn(t)}${U('s')}`]]};
});
add('conveyor','Friction',7,()=>{
  const m=ri(2,12),v=rf(1.5,4,1),mu=rf(0.2,0.6,2),a=mu*K.g,t=v/a;
  const base=`You set a ${m} kg box on a conveyor belt moving at ${v} m/s. It slips at first; μk between box and belt is ${mu}. `;
  const sA=['While it slips, kinetic friction from the belt speeds the box up. The mass cancels.',X`a=\frac{\mu_k mg}{m}=\mu_k g=(${mu})(9.8)=${tn(a)}${U('m/s²')}`];
  const sT=['It stops slipping once its speed matches the belt.',X`t=\frac{v}{a}=\frac{${v}}{${tn(a)}}=${tn(t)}${U('s')}`];
  if(Math.random()<0.5)return{q:base+'How long until the box moves with the belt?',ans:t,unit:'s',lv:2,
    how:'Friction speeds the box up at μk·g until it matches the belt: t = v/(μk·g)',sol:[sA,sT]};
  return{q:base+'How far does the box move, relative to the floor, before it reaches the belt speed?',
    ans:v*v/(2*mu*K.g),unit:'m',lv:2,how:'d = (v/2)·t with t = v/(μk·g)',
    sol:[sA,sT,['Its speed rises steadily from 0 to <i>v</i>, so the average is <i>v</i>/2.',X`d=\frac{v}{2}\,t=\frac{${v}}{2}\,(${tn(t)})=${tn(v*v/(2*mu*K.g))}${U('m')}`]]};
});
add('pushed-box','Friction',7,()=>{
  const m=ri(10,40),mu=rf(0.1,0.35,2),F=Math.round(mu*m*K.g*rf(1.3,3,2));
  const t1=ri(2,10),dt=pick([0.5,0.8,1.1,1.5,2]),t2=rd(t1+dt,1),v1=ri(1,6);
  const r=[ri(-20,20),ri(0,8),ri(-20,20)];
  const f=mu*m*K.g,Fn=F-f,a=Fn/m,v2=v1+a*dt,x2=r[0]+(v1+v2)/2*dt;
  const base=`A ${m} kg box is pushed across a level floor by a constant force ${vec(F,0,0)} N; μk = ${mu}. `+
             `At t = ${t1} s it is at ${vec(...r)} m moving at ${vec(v1,0,0)} m/s. The net force is constant. `;
  const s=[['Kinetic friction opposes the motion. The normal force equals <i>mg</i> on a level floor.',X`f=\mu_k mg=(${mu})(${m})(9.8)=${tn(f)}${U('N')}`],
           ['Net force and acceleration along x.',X`F_{\text{net},x}=${F}-${tn(f)}=${tn(Fn)}\ \text{N},\qquad a_x=\frac{${tn(Fn)}}{${m}}=${tn(a)}${U('m/s²')}`],
           [`Update the velocity over Δ<i>t</i> = ${t2} − ${t1} s.`,X`v_{x,f}=v_{x,i}+a_x\Delta t=${v1}+(${tn(a)})(${tn(dt)})=${tn(v2)}${U('m/s')}`]];
  if(Math.random()<0.5)return{q:base+`What is v<sub>x</sub> at t = ${t2} s?`,ans:v2,unit:'m/s',lv:2,
    how:'F_net,x = F − μk·mg; v_x,f = v_x,i + (F_net,x/m)·Δt',sol:s};
  return{q:base+`What is its x coordinate at t = ${t2} s?`,ans:x2,unit:'m',lv:3,
    how:'Constant force: x_f = x_i + ½(v_i + v_f)·Δt',
    sol:s.concat([['With a constant force the average velocity is exactly the average of the start and end values.',
      X`x_f=x_i+\frac{v_{x,i}+v_{x,f}}{2}\,\Delta t=${r[0]}+\frac{${v1}+${tn(v2)}}{2}(${tn(dt)})=${tn(x2)}${U('m')}`]])};
});
add('fric-static','Friction',7,()=>{
  let m,mus,muk,th,F,fr,tries=0;
  do{
    m=ri(10,40);mus=rf(0.35,0.7,2);muk=rd(mus*rf(0.6,0.85,2),2);th=pick([0,0,20,30,40]);
    const r=Math.random()<0.5?rf(0.5,0.88,2):rf(1.12,1.6,2);
    const den=Math.cos(th*D2R)-r*mus*Math.sin(th*D2R);
    F=Math.round(r*mus*m*K.g/den);
    fr=P.friction(m,F,th,mus,muk);
    tries++;
  }while((Math.abs(fr.Fh/fr.max-1)<0.08||F<=0)&&tries<50);
  const dir=th===0?'directed horizontally':`directed ${th}° below the horizontal`;
  const base=`A ${m} kg crate sits at rest on a level floor, with μs = ${mus} and μk = ${muk}. `+
             `You push it with a constant ${F} N force ${dir}. `;
  const fig=FIG.push({m,F,th});
  const sN=th===0?['A horizontal push doesn’t change the vertical balance.',X`N=mg=(${m})(9.8)=${tn(fr.N)}${U('N')}`]
                 :['A downward-angled push presses the crate into the floor, raising the normal force.',
                   X`N=mg+F\sin\theta=(${m})(9.8)+(${F})\sin ${th}^\circ=${tn(fr.N)}${U('N')}`];
  if(th>0&&Math.random()<0.35)return{fig,q:base+'What is the magnitude of the normal force on the crate?',
    ans:fr.N,unit:'N',lv:2,how:'Vertical balance: N = mg + F·sin θ. A downward push presses the crate harder into the floor.',sol:[sN]};
  const sH=th===0?['The whole push is horizontal.',X`F_x=${F}${U('N')}`]
                 :['Horizontal part of the push.',X`F_x=F\cos\theta=(${F})\cos ${th}^\circ=${tn(fr.Fh)}${U('N')}`];
  const sM=['The most static friction can supply.',X`f_{\max}=\mu_sN=(${mus})(${tn(fr.N)})=${tn(fr.max)}${U('N')}`];
  if(Math.random()<0.3){
    const a=fr.slides?(fr.Fh-muk*fr.N)/m:0;
    return{fig,q:base+'What is the magnitude of the crate\u2019s acceleration 2 s after you start pushing?',
      ans:a,zero:!fr.slides,unit:'m/s²',lv:3,
      how:'Compare F·cos θ with μs·N first. If it never slides the acceleration is zero; otherwise a = (F·cos θ − μk·N)/m.',
      sol:[sN,
           th===0?['The whole push is horizontal.',X`F_x=${F}${U('N')}`]
                 :['Horizontal part of the push.',X`F_x=F\cos\theta=(${F})\cos ${th}^\circ=${tn(fr.Fh)}${U('N')}`],
           ['The most static friction can supply.',X`f_{\max}=\mu_sN=(${mus})(${tn(fr.N)})=${tn(fr.max)}${U('N')}`],
           fr.slides?['The push wins, so the crate slides and kinetic friction opposes it.',
                      X`a=\frac{F_x-\mu_kN}{m}=\frac{${tn(fr.Fh)}-(${muk})(${tn(fr.N)})}{${m}}=${tn(a)}${U('m/s²')}`]
                    :['The push never beats static friction, so the crate stays put and its acceleration is zero.',
                      X`F_x\le\mu_sN\quad\Rightarrow\quad a=0${U('m/s²')}`]]};
  }
  const sF=fr.slides
    ?['The push is larger than the most static friction can hold, so the crate slides and kinetic friction acts.',
      X`${tn(fr.Fh)}>${tn(fr.max)}\quad\Rightarrow\quad f=\mu_kN=(${muk})(${tn(fr.N)})=${tn(fr.f)}${U('N')}`]
    :['The push is smaller than the static limit, so the crate never moves. Static friction just matches the push.',
      X`${tn(fr.Fh)}\le ${tn(fr.max)}\quad\Rightarrow\quad f=F_x=${tn(fr.f)}${U('N')}`];
  return{fig,q:base+'What is the magnitude of the friction force on the crate 2 s after you start pushing?',
    ans:fr.f,unit:'N',lv:3,
    how:'N = mg + F·sin θ. If F·cos θ ≤ μs·N it never slides and static friction just equals F·cos θ; otherwise f = μk·N.',
    sol:[sN,sH,sM,sF]};
});
add('stacked','Friction',10,()=>{
  const mu_=ri(4,15),ml=ri(15,40),mu1=rf(0.1,0.35,2),mu2=rf(0.2,0.6,2);
  const need=mu1*mu_*K.g+mu2*(mu_+ml)*K.g+1.3*mu1*K.g*ml;
  const F=Math.ceil(need*rf(1.1,1.6,2)),upper=Math.random()<0.5;
  const f1=mu1*mu_*K.g,Nf=(mu_+ml)*K.g,f2=mu2*Nf,aL=(F-f1-f2)/ml,aU=mu1*K.g;
  const q=`A ${mu_} kg block rests on top of a ${ml} kg block on the floor. You push the lower block to the right `+
          `with ${F} N, and the upper block slips on it. μk is ${mu1} between the blocks and ${mu2} between the `+
          `lower block and the floor. What is the acceleration of the ${upper?'upper':'lower'} block? Right is positive.`;
  const fig=FIG.stacked(mu_,ml,F,mu1,mu2);
  const s1=['Kinetic friction between the blocks. The upper block presses down with its weight.',X`f_1=\mu_1 m_{\text{top}}\,g=(${mu1})(${mu_})(9.8)=${tn(f1)}${U('N')}`];
  if(upper)return{fig,q,ans:aU,unit:'m/s²',lv:2,how:'Only friction from the lower block drives the upper block: a = μ₁·g',
    sol:[s1,['That friction is the only horizontal force on the upper block, and it points forward.',X`a_{\text{top}}=\frac{f_1}{m_{\text{top}}}=\mu_1 g=${tn(aU)}${U('m/s²')}`]]};
  return{fig,q,ans:aL,unit:'m/s²',lv:3,
    how:'Lower block: F − μ₁·m_top·g − μ₂·(m_top + m_bottom)·g = m_bottom·a. The floor supports both blocks.',
    sol:[s1,['The floor supports both blocks, so its normal force and friction use the total mass.',
             X`f_2=\mu_2(m_{\text{top}}+m_{\text{bot}})g=(${mu2})(${mu_+ml})(9.8)=${tn(f2)}${U('N')}`],
         ['On the lower block: your push forward, the upper block’s friction backward, the floor’s friction backward.',
          X`a_{\text{bot}}=\frac{F-f_1-f_2}{m_{\text{bot}}}=\frac{${F}-${tn(f1)}-${tn(f2)}}{${ml}}=${tn(aL)}${U('m/s²')}`]]};
});

/* ---- Oscillations ---- */
add('osc-band','Oscillations',7,()=>{
  const L0=rf(8,14,1),mg=ri(150,450),L=rd(L0+rf(3,8,1),1),dL=(L-L0)/100,m=mg/1000,k=m*K.g/dL;
  const base=`A rubber band has a relaxed length of ${L0} cm. Hanging a ${mg} g mug from it stretches it to ${L} cm. `+
             `Treat the band as a spring. `;
  const sK=['At rest the band’s pull balances the weight. Use kilograms and meters.',
    X`k=\frac{mg}{\Delta L}=\frac{(${tn(m,6)})(9.8)}{${tn(dL,4)}}=${tn(k)}${U('N/m')}`];
  if(Math.random()<0.5)return{q:base+'What is its stiffness?',ans:k,unit:'N/m',lv:2,how:'At rest the band holds the weight: k = mg / stretch',sol:[sK]};
  const t=ri(5,12),T=2*Math.PI*Math.sqrt(m/k),ans=t/T;
  return{q:base+`If you set the mug bouncing, how many round trips does it make in ${t} s?`,ans,unit:'trips',lv:3,
    how:'k = mg/ΔL, so T = 2π√(m/k) = 2π√(ΔL/g). Round trips = t/T.',
    sol:[sK,['Period of a mass on a spring.',X`T=2\pi\sqrt{\frac{m}{k}}=2\pi\sqrt{\frac{${tn(m,6)}}{${tn(k)}}}=${tn(T)}${U('s')}`],
         ['Count the round trips.',X`n=\frac{t}{T}=\frac{${t}}{${tn(T)}}=${tn(ans)}`]]};
});
add('osc-omega','Oscillations',7,()=>{
  const m=rf(0.3,2.5,1),k=ri(4,40),A=ri(5,20),w=P.omega(k,m),T=2*Math.PI/w;
  const base=`A ${m} kg ball hangs from a spring of stiffness ${k} N/m and oscillates up and down with an amplitude of ${A} cm. `;
  const sW=['Angular frequency depends only on the stiffness and the mass.',X`\omega=\sqrt{\frac{k}{m}}=\sqrt{\frac{${k}}{${m}}}=${tn(w)}${U('rad/s')}`];
  const ask=pick(['w','f','T','twist']);
  if(ask==='w')return{q:base+'What is the angular frequency?',ans:w,unit:'rad/s',lv:1,how:'ω = √(k/m)',sol:[sW]};
  if(ask==='f')return{q:base+'What is the frequency?',ans:w/(2*Math.PI),unit:'Hz',lv:2,how:'f = ω/2π with ω = √(k/m)',
    sol:[sW,['There are 2π radians per cycle.',X`f=\frac{\omega}{2\pi}=\frac{${tn(w)}}{2\pi}=${tn(w/(2*Math.PI))}${U('Hz')}`]]};
  const sT=['Period of a mass on a spring.',X`T=2\pi\sqrt{\frac{m}{k}}=2\pi\sqrt{\frac{${m}}{${k}}}=${tn(T)}${U('s')}`];
  if(ask==='T')return{q:base+'What is the period?',ans:T,unit:'s',lv:1,how:'T = 2π√(m/k)',sol:[sT]};
  const tw=Math.random()<0.5?`You restart it with an amplitude of ${2*A} cm.`:'You take the whole setup to the Moon, where g = 1.6 N/kg.';
  return{q:base+tw+' What is the period now?',ans:T,unit:'s',lv:2,how:'T = 2π√(m/k). Amplitude and g do not change the period.',
    sol:[['The period formula contains only <i>m</i> and <i>k</i>. Amplitude and <i>g</i> do not appear, so the change does nothing.',X`T=2\pi\sqrt{m/k}`],sT]};
});
add('osc-x','Oscillations',7,()=>{
  let m,k,A,t,w,tries=0;
  do{m=rf(0.3,3,1);k=ri(5,160);A=rf(0.04,0.15,2);t=rf(0.05,2.5,2);w=P.omega(k,m);tries++;}
  while(Math.abs(Math.cos(w*t))<0.25&&tries<60);
  const ans=P.xOfT(A,k,m,t);
  return{q:`A ${m} kg block on a horizontal spring (k = ${k} N/m) slides without friction; x = 0 is the relaxed `+
           `position. You pull it to x = +${A} m and release it from rest at t = 0. What is x at t = ${t} s?`,
    ans,unit:'m',lv:2,how:'x(t) = A·cos(ωt), ω = √(k/m). Radians, not degrees.',
    sol:[['Angular frequency.',X`\omega=\sqrt{\frac{k}{m}}=\sqrt{\frac{${k}}{${m}}}=${tn(w)}${U('rad/s')}`],
         ['Released from rest at +<i>A</i>, the motion is a cosine. The angle ω<i>t</i> is in radians.',
          X`x(t)=A\cos(\omega t)=${A}\cos\big((${tn(w)})(${t})\big)=${A}\cos(${tn(w*t)})=${tn(ans)}${U('m')}`]]};
});
add('osc-tfirst','Oscillations',7,()=>{
  const m=rf(0.3,3,1),k=ri(20,200),A=rf(0.05,0.15,2),w=P.omega(k,m);
  let x;do{x=rd(A*rf(-0.9,0.9,2),3);}while(x===0);
  const ph=Math.acos(x/A),ans=ph/w;
  return{q:`A ${m} kg block on a horizontal spring (k = ${k} N/m) slides without friction. You release it from `+
           `rest at x = +${A} m at t = 0. When does it first reach x = ${fm(x)} m?`,
    ans,unit:'s',lv:2,how:'Solve x = A·cos(ωt): t = arccos(x/A)/ω, in radians.',
    sol:[['Angular frequency.',X`\omega=\sqrt{\frac{k}{m}}=\sqrt{\frac{${k}}{${m}}}=${tn(w)}${U('rad/s')}`],
         ['Set <i>A</i> cos(ω<i>t</i>) = <i>x</i>. The first time is the principal arccos, in radians.',
          X`\omega t=\arccos\!\left(\frac{x}{A}\right)=\arccos\!\left(\frac{${x}}{${A}}\right)=${tn(ph)}\ \text{rad}`],
         ['',X`t=\frac{${tn(ph)}}{${tn(w)}}=${tn(ans)}${U('s')}`]]};
});
add('osc-scale','Oscillations',7,()=>{
  const T0=rf(0.8,2.5,2),g0=ri(20,60);
  const v=pick(['combo','combo','omega','two','par','half','series','moon']);
  if(v==='omega'){
    const w0=rf(2,12,1),p=ri(2,5),q=ri(2,8),ans=w0*Math.sqrt(q/p);
    return{q:`A mass on a spring oscillates with an angular frequency of ${w0} rad/s. You rebuild it with a mass `+
             `${p} times as large and a spring ${q} times as stiff. What is the new angular frequency?`,
      ans,unit:'rad/s',lv:2,how:'ω = √(k/m), so ω scales by √(q/p) when k grows by q and m grows by p.',
      sol:[['Angular frequency depends only on stiffness and mass.',X`\omega=\sqrt{\frac{k}{m}}`],
           ['Scale by the two factors.',
            X`\omega'=\omega\sqrt{\frac{q}{p}}=${w0}\sqrt{\frac{${q}}{${p}}}=${tn(ans)}${U('rad/s')}`]]};
  }
  const sBase=['The period depends only on mass and stiffness.',X`T=2\pi\sqrt{m/k}`];
  if(v==='combo'){
    const p=ri(2,5),q=ri(2,8),a1=rf(1.5,4,1),a2=rf(4,9,1),gp=rf(3,15,1),ans=T0*Math.sqrt(p/q);
    return{q:`On Earth, a mass on a vertical spring takes ${T0} s per round trip with a ${a1} cm amplitude. `+
             `A second oscillator has a mass ${p} times as large and a spring ${q} times as stiff. On a planet where `+
             `g = ${gp} N/kg you start it with a ${a2} cm amplitude. How long does one round trip take?`,
      ans,unit:'s',lv:2,how:'T = 2π√(m/k): only m and k matter, so T scales by √(p/q).',
      sol:[sBase,['Amplitude and <i>g</i> drop out. Scale by the mass and stiffness ratios.',
        X`T_2=T_1\sqrt{\frac{m_2/m_1}{k_2/k_1}}=${T0}\sqrt{\frac{${p}}{${q}}}=${tn(ans)}${U('s')}`]]};
  }
  const base=`A ${g0} g mass hanging from a spring oscillates with a period of ${T0} s. `;
  const mk=(q,ans,why,tex,lv)=>({q:base+q,ans,unit:'s',lv,how:why,sol:[sBase,[why,tex]]});
  if(v==='two')return mk('What is the period with two of these masses hung from the same spring?',T0*Math.SQRT2,
    'Doubling the mass multiplies the period by √2.',X`T'=T\sqrt{2}=${T0}\sqrt{2}=${tn(T0*Math.SQRT2)}${U('s')}`,2);
  if(v==='par')return mk('What is the period when the one mass hangs from two of these springs side by side?',T0/Math.SQRT2,
    'Two springs side by side share the load, so the stiffness doubles to 2k and the period drops by √2.',X`T'=\frac{T}{\sqrt{2}}=\frac{${T0}}{\sqrt{2}}=${tn(T0/Math.SQRT2)}${U('s')}`,2);
  if(v==='half')return mk('You cut the spring in half and hang the mass from one half. What is the period?',T0/Math.SQRT2,
    'Half a spring stretches half as much under the same force, so it is twice as stiff and the period drops by √2.',X`T'=\frac{T}{\sqrt{2}}=\frac{${T0}}{\sqrt{2}}=${tn(T0/Math.SQRT2)}${U('s')}`,2);
  if(v==='series')return mk('What is the period when the mass hangs from two of these springs hooked end to end?',T0*Math.SQRT2,
    'End to end, each spring stretches the full amount, so the stiffness halves to k/2 and the period grows by √2.',X`T'=T\sqrt{2}=${T0}\sqrt{2}=${tn(T0*Math.SQRT2)}${U('s')}`,2);
  return mk('You take it to the Moon, where g is 1.6 N/kg. What is the period there?',T0,
    '<i>g</i> does not appear in the period, so it is unchanged.',X`T'=T=${tn(T0)}${U('s')}`,1);
});

/* ---- Buoyancy ---- */
add('float','Buoyancy',7,()=>{
  const liq=pick([{n:'fresh water',r:1.00},{n:'seawater',r:1.03},{n:'vegetable oil',r:0.92}]);
  const rb=rf(0.4,0.85,2),L=ri(15,40),W=ri(8,20),H=rf(3,12,1),ans=H*rb/liq.r;
  return{q:`A block of wood ${L} cm long, ${W} cm wide, and ${H} cm high has a density of ${rb} g/cm³. It floats flat in `+
           `${liq.n} (density ${liq.r.toFixed(2)} g/cm³). How far below the surface is the bottom of the block?`,
    ans,unit:'cm',lv:1,how:'Floating: weight = weight of liquid displaced, so depth = H·ρ_block/ρ_liquid.',
    sol:[['Floating means the buoyant force equals the weight. With depth <i>h</i> under water, the length and width cancel.',
          X`\rho_{\text{liq}}(LWh)\,g=\rho_{\text{block}}(LWH)\,g\quad\Rightarrow\quad h=H\,\frac{\rho_{\text{block}}}{\rho_{\text{liq}}}`],
         ['',X`h=${H}\cdot\frac{${rb}}{${liq.r.toFixed(2)}}=${tn(ans)}${U('cm')}`]]};
});
add('air-buoy','Buoyancy',7,()=>{
  const mt=pick(MAT),mass=ri(1,20),rho=mt.rho*1000,V=mass/rho;
  if(Math.random()<0.6){
    const ans=P.airBuoy(mass,mt.rho);
    return{q:`What is the buoyant force of the air on ${mass} kg of ${mt.n} (density ${mt.rho} g/cm³)?`,
      ans,unit:'N',lv:2,how:'F_b = ρ_air·V·g with V = m/ρ_metal (in kg/m³)',
      sol:[['Volume of the metal, with its density in kg/m³.',X`V=\frac{m}{\rho}=\frac{${mass}}{${tn(rho,6)}}=${tn(V)}\ \text{m}^3`],
           ['The buoyant force is the weight of the air that volume displaces.',X`F_b=\rho_{\text{air}}Vg=(1.2)(${tn(V)})(9.8)=${tn(ans)}${U('N')}`]]};
  }
  const ans=K.rhoAir/rho;
  return{q:`A block of ${mt.n} (density ${mt.rho} g/cm³) sits in air. What is the ratio of the air's buoyant force `+
           `to the block's weight, F<sub>b</sub>/mg?`,
    ans,unit:'',lv:1,how:'F_b/mg = ρ_air·V·g / (ρ_metal·V·g) = ρ_air/ρ_metal',
    sol:[['The volume and <i>g</i> cancel, leaving a ratio of densities.',
          X`\frac{F_b}{mg}=\frac{\rho_{\text{air}}Vg}{\rho_{\text{metal}}Vg}=\frac{1.2}{${tn(rho,6)}}=${tn(ans)}`]]};
});
add('blimp','Buoyancy',7,()=>{
  const Lb=ri(15,40),D=ri(8,15),V=Math.PI*Math.pow(D/2,2)*Lb,inc=Math.random()<0.6;
  const ans=inc?K.rhoAir*V:(K.rhoAir-0.18)*V;
  const sV=['Volume of the cylindrical gas bag.',X`V=\pi\left(\frac{D}{2}\right)^2L=\pi\left(\frac{${D}}{2}\right)^2(${Lb})=${tn(V)}\ \text{m}^3`];
  const sM=['Floating at constant altitude means the buoyant force equals the total weight, so the total mass equals the mass of displaced air.',
            X`M_{\text{total}}=\rho_{\text{air}}V=(1.2)(${tn(V)})=${tn(K.rhoAir*V)}${U('kg')}`];
  return{q:`An advertising blimp floats at constant altitude. Its gas bag is a cylinder ${Lb} m long and ${D} m in `+
           `diameter, filled with helium of density 0.18 kg/m³. Estimate the blimp's total mass, `+
           `${inc?'including':'not counting'} the helium.`,
    ans,unit:'kg',lv:2,
    how:inc?'Neutral buoyancy: total mass = mass of air displaced = ρ_air·V (helium included).':'Total mass is ρ_air·V; subtract the helium, ρ_He·V.',
    sol:inc?[sV,sM]:[sV,sM,['Subtract the helium’s own mass.',X`M=M_{\text{total}}-\rho_{\text{He}}V=${tn(K.rhoAir*V)}-(0.18)(${tn(V)})=${tn(ans)}${U('kg')}`]]};
});
