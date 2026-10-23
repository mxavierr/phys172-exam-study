const PARTS=[{n:'electron',m:9.11e-31},{n:'proton',m:1.67e-27},{n:'muon',m:1.88e-28}];
const iv=(a,b,step)=>nz(Math.round(a/step),Math.round(b/step))*step;      /* nonzero multiple of step */
const dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];

/* ---- Particle energy · HW11 ---- */
add('pe-energy','Particle energy',11,()=>{
  const p=pick(PARTS), f=pick([0.5,0.6,0.8,0.9,0.95,0.99,0.993]), g=gammaOf(f), Er=p.m*K.c*K.c, E=g*Er, Kk=E-Er;
  const ask=pick(['E','rest','K','K']);
  const name={E:'particle energy',rest:'rest energy',K:'kinetic energy'}[ask], ans={E,rest:Er,K:Kk}[ask];
  const sol=[['Rest energy is mc².',X`E_{\text{rest}}=mc^2=(${tn(p.m,3)})(3\times10^{8})^2=${tn(Er)}${U('J')}`]];
  if(ask!=='rest'){
    sol.push(['Find γ from the speed.',X`\gamma=\frac{1}{\sqrt{1-(${f})^2}}=${tn(g)}`]);
    sol.push(ask==='E'?['Particle energy is γmc².',X`E=\gamma mc^2=(${tn(g)})(${tn(Er)})=${tn(E)}${U('J')}`]
                      :['Kinetic energy is what is left after the rest energy.',X`K=(\gamma-1)mc^2=(${tn(g-1)})(${tn(Er)})=${tn(Kk)}${U('J')}`]);
  }
  return{q:`A ${p.n} (m = ${sci(p.m,3)} kg) moves at ${f}c. What is its ${name}?`,ans,unit:'J',lv:ask==='rest'?1:2,
    how:'E = γmc², E_rest = mc², K = (γ − 1)mc²',sol,chk:{k:'pe-energy',ask,m:p.m,f}};
});
add('pe-baseball','Particle energy',11,()=>{
  const o=pick([['baseball',0.145],['tennis ball',0.058],['soccer ball',0.43],['bowling ball',6.5]]), v=pick([10,15,20,25,30,40]);
  const Er=o[1]*K.c*K.c, Kk=0.5*o[1]*v*v, ratio=Kk/Er;
  if(Math.random()<0.5) return{q:`A ${o[0]} of mass ${o[1]} kg moves at ${v} m/s. What is its rest energy?`,ans:Er,unit:'J',lv:1,
    how:'E_rest = mc², whether or not it moves',sol:[['Rest energy depends only on the mass.',X`E_{\text{rest}}=mc^2=(${o[1]})(3\times10^{8})^2=${tn(Er)}${U('J')}`]],chk:{k:'pe-rest',m:o[1],v}};
  return{q:`A ${o[0]} of mass ${o[1]} kg moves at ${v} m/s. What is the ratio of its kinetic energy to its rest energy, K/E<sub>rest</sub>?`,ans:ratio,unit:'',lv:2,
    how:'v ≪ c, so K ≈ ½mv²; compare with mc²',
    sol:[['At this speed v ≪ c, so ½mv² is accurate.',X`K=\tfrac12mv^2=\tfrac12(${o[1]})(${v})^2=${tn(Kk)}${U('J')}`],
         ['Divide by the rest energy.',X`\frac{K}{mc^2}=\frac{${tn(Kk)}}{${tn(Er)}}=${tn(ratio)}`]],chk:{k:'pe-ratio',m:o[1],v}};
});
add('pe-fancart','Particle energy',11,()=>{
  const m=pick([0.5,0.6,0.8,1.0,1.2]), v0=pick([0.4,0.5,0.6,0.7,0.8,0.9]), F=-pick([0.1,0.2,0.3,0.4]), dt=pick([0.5,1,1.5,2]);
  const pi=m*v0, dp=F*dt, pf=pi+dp, dK=(pf*pf-pi*pi)/(2*m), askK=Math.random()<0.6;
  const q=`A ${m} kg fan cart moves with velocity ⟨${v0}, 0, 0⟩ m/s. The fan is switched on, and the air exerts a constant force ⟨${fm(F)}, 0, 0⟩ N `+
          `on the cart for ${dt} s. What is the ${askK?'change in kinetic energy of the cart':'x component of the change in momentum'} over this interval?`;
  const s1=['Momentum Principle for the change in momentum.',X`\Delta p_x=F_x\Delta t=(${tn(F)})(${dt})=${tn(dp)}${U('kg·m/s')}`];
  if(!askK) return{q,ans:dp,unit:'kg·m/s',lv:1,how:'Δp = F_net Δt',sol:[s1],chk:{k:'pe-fancart',ask:'dp',m,v0,F,dt}};
  return{q,ans:dK,unit:'J',lv:2,zero:true,how:'Find p_f with the Momentum Principle, then K = p²/2m before and after',
    sol:[s1,['Final momentum, then the kinetic energy before and after (v ≪ c, so K = p²/2m).',X`p_f=(${m})(${v0})+${tp(dp)}=${tn(pf)}${U('kg·m/s')}`],
         ['',X`\Delta K=\frac{p_f^2-p_i^2}{2m}=\frac{(${tn(pf)})^2-(${tn(pi)})^2}{2(${m})}=${tn(dK)}${U('J')}`]],chk:{k:'pe-fancart',ask:'dK',m,v0,F,dt}};
});

/* ---- Work · HW11 ---- */
add('w-dot','Work',11,()=>{
  const F=[iv(-400,400,10),iv(-400,400,10),iv(-400,400,10)], r1=[ri(-20,20),ri(-20,20),ri(-20,20)], d=[nz(-8,8),nz(-8,8),nz(-8,8)], r2=r1.map((x,i)=>x+d[i]), W=dot3(F,d);
  if(W===0) return null;
  return{q:`A constant force <b>F</b> = ${vec(...F)} N acts on an object while it moves from ${vec(...r1)} m to ${vec(...r2)} m. How much work does this force do?`,
    ans:W,unit:'J',lv:1,how:'W = F·Δr = F_xΔx + F_yΔy + F_zΔz',
    sol:[['Displacement is final minus initial.',X`\Delta\mathbf r=${tv(...d)}${U('m')}`],
         ['Work is the dot product.',X`W=(${F[0]})(${d[0]})+(${F[1]})(${d[1]})+(${F[2]})(${d[2]})=${tn(W)}${U('J')}`]],chk:{k:'w-dot',F,r1,r2}};
});
add('w-1d','Work',11,()=>{
  const x1=ri(-20,-5), x2=x1+nz(-6,6), F=nz(-40,40), W=F*(x2-x1);
  return{q:`An object moves along the x axis from ⟨${x1}, 0, 0⟩ m to ⟨${x2}, 0, 0⟩ m while a constant force ⟨${F}, 0, 0⟩ N acts on it. How much work does this force do?`,
    ans:W,unit:'J',lv:1,how:'W = F_xΔx; the sign says whether the force speeds the object up or slows it down',
    sol:[['Only x components are nonzero.',X`W=F_x\,\Delta x=(${F})\,(${x2}-${tp(x1)})=${tn(W)}${U('J')}`]],chk:{k:'w-1d',x1,x2,F}};
});
add('w-angle','Work',11,()=>{
  const F=pick([20,40,50,80,120,150]), d=pick([2,3,4,5,8,12]), th=pick([20,30,37,45,60,110,120,135,150]), W=F*d*Math.cos(th*D2R);
  if(Math.random()<0.65) return{q:`You pull a sled ${d} m along level snow with a ${F} N force directed ${th}° from the direction of motion. How much work does your force do?`,
    ans:W,unit:'J',lv:1,how:'W = |F||Δr|cos θ; negative when θ > 90°',
    sol:[['Only the part of the force along the displacement does work.',X`W=|\mathbf F||\Delta\mathbf r|\cos\theta=(${F})(${d})\cos ${th}^\circ=${tn(W)}${U('J')}`]],chk:{k:'w-angle',ask:'W',F,d,th}};
  const Wr=rd(W,0);
  return{q:`A ${F} N force does ${Wr} J of work on a box that moves ${d} m in a straight line. What angle does the force make with the displacement?`,
    ans:Math.acos(Wr/(F*d))/D2R,unit:'°',lv:2,how:'cos θ = W/(|F||Δr|)',
    sol:[['Solve W = |F||Δr|cos θ for θ.',X`\cos\theta=\frac{W}{|\mathbf F||\Delta\mathbf r|}=\frac{${Wr}}{(${F})(${d})}=${tn(Wr/(F*d))}\quad\Rightarrow\quad\theta=${tn(Math.acos(Wr/(F*d))/D2R)}^\circ`]],
    chk:{k:'w-angle',ask:'th',F,d,W:Wr}};
});
add('w-pushes','Work',11,()=>{
  const F1=pick([150,200,250,300,310]), d1=pick([2,2.5,3,4]), F2=pick([100,120,145,160]), d2=pick([6,8,10,11,12]), F3=pick([200,250,300,310]), d3=pick([1.5,2,2.7,3]);
  const W=F1*d1+F2*d2-F3*d3;
  return{q:`You push a crate ${d1} m with ${F1} N and then ${d2} m with ${F2} N, both along its motion. To slow it down you then push with ${F3} N, opposite to its motion, through ${d3} m. How much work do you do in all?`,
    ans:W,unit:'J',lv:1,how:'Add the work of each push; a push against the motion does negative work',
    sol:[['Work along the motion is positive; against it, negative.',X`W=(${F1})(${d1})+(${F2})(${d2})-(${F3})(${d3})=${tn(W)}${U('J')}`]],chk:{k:'w-pushes',F1,d1,F2,d2,F3,d3}};
});
add('w-grav','Work',11,()=>{
  const m=pick([2,3,5,8,12,20]), r1=[ri(-40,40),ri(0,50),ri(-40,40)], r2=[ri(-40,40),ri(0,50),ri(-40,40)], dy=r2[1]-r1[1];
  if(dy===0) return null;
  const askU=Math.random()<0.5, W=-m*K.g*dy;
  return{q:`An object of mass ${m} kg near Earth's surface moves from ${vec(...r1)} m to ${vec(...r2)} m (+y is straight up). What is the `+
           `${askU?'change in gravitational potential energy of the object + Earth system':'work done on the object by Earth'}?`,
    ans:askU?-W:W,unit:'J',lv:1,how:'Only the vertical displacement matters: W_grav = −mgΔy, ΔU = +mgΔy',
    sol:[['Gravity is ⟨0, −mg, 0⟩, so the dot product keeps only Δy; the path does not matter.',X`\Delta y=${r2[1]}-${tp(r1[1])}=${dy}\ \text{m}`],
         askU?['Potential energy of the object + Earth system.',X`\Delta U=mg\Delta y=(${m})(9.8)(${dy})=${tn(-W)}${U('J')}`]
             :['Work by Earth on the object.',X`W=\langle0,-mg,0\rangle\cdot\Delta\mathbf r=-(${m})(9.8)(${dy})=${tn(W)}${U('J')}`]],chk:{k:'w-grav',ask:askU?'dU':'W',m,r1,r2}};
});
add('w-ramp','Work',11,()=>{
  const m=pick([8,10,12,15,20]), h=pick([2,3,4,5]), Lr=h+pick([1,2,3,4]), ask=pick(['grav','tension','tension','force']);
  const W=m*K.g*h, q=`A ${m} kg crate starts at rest and is pulled ${Lr} m up a smooth ramp by a cable, rising ${h} m, where it ends at rest again. `;
  if(ask==='grav') return{q:q+'How much work does gravity do on the crate?',ans:-W,unit:'J',lv:1,how:'W_grav = −mgΔy, independent of the ramp',
    sol:[['Gravity only cares about the vertical rise h, not the ramp length.',X`W_{\text{grav}}=-mgh=-(${m})(9.8)(${h})=${tn(-W)}${U('J')}`]],chk:{k:'w-ramp',ask,m,h,L:Lr}};
  if(ask==='tension') return{q:q+'How much work does the cable do on the crate?',ans:W,unit:'J',lv:2,
    how:'At rest at both ends: ΔK = 0 = W_cable + W_grav (the normal force does no work)',
    sol:[['System: the crate. It starts and ends at rest, so the net work is zero; the smooth ramp\'s normal force is perpendicular and does none.',X`0=W_{\text{cable}}+W_{\text{grav}}`],
         ['The cable makes up for gravity.',X`W_{\text{cable}}=+mgh=(${m})(9.8)(${h})=${tn(W)}${U('J')}`]],chk:{k:'w-ramp',ask,m,h,L:Lr}};
  return{q:q+'If the crate moves slowly at constant speed, what is the size of the cable\'s force along the ramp?',ans:W/Lr,unit:'N',lv:2,
    how:'Constant speed: cable force = mg sin θ = mgh/L; a longer ramp needs less force but the same work',
    sol:[['Constant speed: the cable balances gravity\'s component along the ramp.',X`F=mg\sin\theta=mg\frac{h}{L}=(${m})(9.8)\frac{${h}}{${Lr}}=${tn(W/Lr)}${U('N')}`]],chk:{k:'w-ramp',ask,m,h,L:Lr}};
});

/* ---- Energy Principle · HW11 ---- */
add('ep-two','Energy Principle',11,()=>{
  const m=pick([50,80,100,120,150,200]), vi=pick([2,2.5,3,3.5,4]), r0=[ri(-25,25),ri(-25,25),ri(-10,10)];
  const d1=[nz(-8,8),nz(-8,8),nz(-6,6)], d2=[nz(-8,8),nz(-8,8),nz(-6,6)], F1=[iv(-300,400,10),iv(-300,400,10),iv(-300,300,10)], F2=[iv(-300,300,10),iv(-300,300,10),iv(-300,300,10)];
  const r1=r0.map((x,i)=>x+d1[i]), r2=r1.map((x,i)=>x+d2[i]), W1=dot3(F1,d1), W2=dot3(F2,d2), Ki=0.5*m*vi*vi, Kf=Ki+W1+W2;
  if(Kf<=0.2*Ki) return null;
  const vf=Math.sqrt(2*Kf/m);
  return{q:`A ${m} kg probe in deep space has speed ${vi} m/s at ${vec(...r0)} m. A constant force ${vec(...F1)} N acts while it moves to ${vec(...r1)} m; `+
           `then a different constant force ${vec(...F2)} N acts while it moves to ${vec(...r2)} m. What is its final speed?`,
    ans:vf,unit:'m/s',lv:3,how:'K_f = K_i + W₁ + W₂, with each W = F·Δr; a one-object system has no potential energy',
    sol:[['Initial kinetic energy.',X`K_i=\tfrac12(${m})(${vi})^2=${tn(Ki)}${U('J')}`],
         ['Work in each stage.',X`W_1=${tv(...F1)}\cdot${tv(...d1)}=${tn(W1)}\ \text{J},\qquad W_2=${tv(...F2)}\cdot${tv(...d2)}=${tn(W2)}\ \text{J}`],
         ['Energy Principle, then the speed.',X`K_f=${tn(Ki)}+${tp(W1)}+${tp(W2)}=${tn(Kf)}\ \text{J}\quad\Rightarrow\quad v_f=\sqrt{\frac{2K_f}{m}}=${tn(vf)}${U('m/s')}`]],
    chk:{k:'ep-two',m,vi,r0,r1,r2,F1,F2}};
});
add('ep-vi','Energy Principle',11,()=>{
  const m=pick([60,80,100,120,150]), F=[iv(-300,450,10),iv(-450,450,10),iv(-250,250,10)], d=[nz(-7,7),nz(-7,7),nz(-6,6)], W=dot3(F,d);
  const vf=pick([4.5,5.2,6.8,7.9,8.4]), vi2=vf*vf-2*W/m; if(vi2<1) return null;
  const vi=Math.sqrt(vi2);
  return{q:`A ${m} kg object in outer space moves through a displacement ${vec(...d)} m while the only force on it, ${vec(...F)} N, stays constant. `+
           `At the end its speed is ${vf} m/s. What was its speed at the start?`,
    ans:vi,unit:'m/s',lv:2,how:'Reverse the Energy Principle: ½mv_i² = ½mv_f² − W',
    sol:[['Work by the force.',X`W=\mathbf F\cdot\Delta\mathbf r=${tn(W)}${U('J')}`],
         ['Solve the Energy Principle for the initial speed.',X`\tfrac12mv_i^2=\tfrac12mv_f^2-W\quad\Rightarrow\quad v_i=\sqrt{(${vf})^2-\frac{2(${tn(W)})}{${m}}}=${tn(vi)}${U('m/s')}`]],
    chk:{k:'ep-vi',m,F,d,vf}};
});
add('ep-friend','Energy Principle',11,()=>{
  const m=pick([400,600,700,900,1200]), ri_=[rf(-5,5,1),rf(-5,5,1),rf(-5,5,1)], d=[rf(-6,6,1),rf(-6,6,1),rf(2,14,1)], rf_=ri_.map((x,i)=>rd(x+d[i],1));
  const dd=sub3(rf_,ri_), F=[iv(-600,600,10),iv(-600,600,10),iv(-300,300,10)], vi=pick([2,3,4,5]), vf=rd(vi+rf(0.5,3,2),2);
  const dK=0.5*m*(vf*vf-vi*vi), Wy=dot3(F,dd), Wf=dK-Wy;
  return{q:`You and a friend pull ropes to move a ${m} kg satellite outside a space station. It starts at ${vec(...ri_)} m with speed ${vi} m/s; `+
           `you exert a constant ${vec(...F)} N. When it reaches ${vec(...rf_)} m its speed is ${vf} m/s. How much work did your friend do?`,
    ans:Wf,unit:'J',lv:2,how:'ΔK = W_you + W_friend, so W_friend = ΔK − F_you·Δr',
    sol:[['Change in kinetic energy.',X`\Delta K=\tfrac12(${m})\big((${vf})^2-(${vi})^2\big)=${tn(dK)}${U('J')}`],
         ['Your work.',X`W_{\text{you}}=${tv(...F)}\cdot${tv(...dd.map(x=>rd(x,1)))}=${tn(Wy)}${U('J')}`],
         ['Energy Principle with both of you in the surroundings.',X`W_{\text{friend}}=\Delta K-W_{\text{you}}=${tn(dK)}-${tp(Wy)}=${tn(Wf)}${U('J')}`]],
    chk:{k:'ep-friend',m,ri:ri_,rf:rf_,F,vi,vf}};
});
add('ep-compare','Energy Principle',11,()=>{
  const n=pick([2,3,4,9]), same=pick(['distance','time']), ask=pick(['K','v','p']);
  const ratio={distance:{K:1,v:1/Math.sqrt(n),p:Math.sqrt(n)},time:{K:1/n,v:1/n,p:1}}[same][ask];
  const nm={K:'kinetic energy',v:'speed',p:'momentum'}[ask];
  const why=same==='distance'?'Same force over the same distance does the same work, so both gain the same kinetic energy.':'Same force for the same time gives the same impulse, so both gain the same momentum.';
  const tex={distance:{K:X`K_{${n}M}=K_M=FL\quad\Rightarrow\quad\text{ratio}=1`,v:X`\tfrac12(${n}M)v_2^2=\tfrac12Mv_1^2\quad\Rightarrow\quad\frac{v_2}{v_1}=\frac{1}{\sqrt{${n}}}=${tn(ratio)}`,
                        p:X`p=\sqrt{2mK}\quad\Rightarrow\quad\frac{p_2}{p_1}=\sqrt{${n}}=${tn(ratio)}`},
             time:{p:X`p_{${n}M}=p_M=F\Delta t\quad\Rightarrow\quad\text{ratio}=1`,v:X`v=\frac{p}{m}\quad\Rightarrow\quad\frac{v_2}{v_1}=\frac{1}{${n}}=${tn(ratio)}`,
                   K:X`K=\frac{p^2}{2m}\quad\Rightarrow\quad\frac{K_2}{K_1}=\frac{1}{${n}}=${tn(ratio)}`}}[same][ask];
  return{q:`Two pucks start at rest on frictionless ice: puck 1 has mass M and puck 2 has mass ${n}M. The same constant force F pushes each one `+
           `${same==='distance'?'over the same distance L':'for the same time Δt'}. What is the ratio of their ${nm}s, puck 2 to puck 1?`,
    ans:ratio,unit:'',lv:2,how:'Same F over the same distance → same ΔK. Same F for the same time → same Δp.',
    sol:[[why,tex]],chk:{k:'ep-compare',n,same,ask}};
});

/* ---- Identity change · HW12 ---- */
add('ic-annihil','Identity change',12,()=>{
  const pr=pick([['an electron and a positron',9e-31,'electron'],['a proton and an antiproton',1.67e-27,'proton']]);
  const E=pr[1]*K.c*K.c/K.eV/1e6;
  return{q:`${pr[0][0].toUpperCase()+pr[0].slice(1)}, nearly at rest, annihilate into two photons of equal energy. Each ${pr[2]} has mass ${sci(pr[1],3)} kg. `+
           `What is the energy of each photon, in MeV? (1 eV = 1.6×10<sup>−19</sup> J)`,
    ans:E,unit:'MeV',lv:1,how:'All the rest energy 2mc² goes to the two photons, so each gets mc²',
    sol:[['The total rest energy 2mc² is shared by two photons, so each carries mc².',X`E_\gamma=mc^2=(${tn(pr[1],3)})(3\times10^8)^2=${tn(pr[1]*K.c*K.c)}\ \text{J}`],
         ['Convert to MeV.',X`E_\gamma=\frac{${tn(pr[1]*K.c*K.c)}}{1.6\times10^{-19}}\ \text{eV}=${tn(E)}${U('MeV')}`]],chk:{k:'ic-annihil',m:pr[1]}};
});
add('ic-alpha','Identity change',12,()=>{
  const ma=6.640678e-27, md=Number((3.8e-25+ri(0,90)*1e-27+Math.random()*1e-27).toPrecision(7)), Q=rf(4,7.5,2)*1e6*K.eV;
  const M=Number((md+ma+Q/(K.c*K.c)).toPrecision(7)), Kt=(M-ma-md)*K.c*K.c, inMeV=Math.random()<0.5;
  if(Kt<=0) return null;
  return{q:`A nucleus of mass ${sci(M,7)} kg at rest undergoes alpha decay into an alpha particle (${sci(ma,7)} kg) and a daughter nucleus `+
           `(${sci(md,7)} kg). When the two are far apart, what is their combined kinetic energy${inMeV?', in MeV':''}?`,
    ans:inMeV?Kt/K.eV/1e6:Kt,unit:inMeV?'MeV':'J',lv:2,how:'Isolated system: the missing rest energy (M − m_α − m_d)c² becomes kinetic energy',
    sol:[['The system (all the particles) is isolated, so total energy is conserved and the drop in rest energy becomes kinetic energy.',X`K_{\text{tot}}=(M-m_\alpha-m_d)c^2`],
         ['Keep every digit in the mass difference.',X`\Delta m=${tn(M-ma-md,4)}\ \text{kg}\quad\Rightarrow\quad K_{\text{tot}}=(${tn(M-ma-md,4)})(3\times10^8)^2=${tn(Kt)}\ \text{J}`+(inMeV?X`=${tn(Kt/K.eV/1e6)}${U('MeV')}`:'')]],
    chk:{k:'ic-alpha',M,ma,md,unit:inMeV?'MeV':'J'}};
});
add('ic-decay','Identity change',12,()=>{
  const d=pick([['A pion (rest energy 140 MeV) at rest decays into a muon (rest energy 106 MeV) and a neutrino (nearly massless).',140,[106],'muon',4.1],
                ['A kaon (rest energy 494 MeV) at rest decays into two pions with rest energies 140 MeV and 135 MeV.',494,[140,135],null,0],
                ['A lambda particle (rest energy 1116 MeV) at rest decays into a proton (938 MeV) and a pion (140 MeV).',1116,[938,140],null,0]]);
  const Kt=d[1]-d[2].reduce((a,b)=>a+b,0);
  if(d[3]&&Math.random()<0.5){ const Km=pick([3.9,4.0,4.1,4.2]);
    return{q:d[0]+` The muon's kinetic energy is ${Km} MeV. What is the energy of the neutrino?`,ans:Kt-Km,unit:'MeV',lv:2,
      how:'Rest energy before = rest + kinetic energy after; the massless neutrino carries only kinetic energy',
      sol:[['Energy available as kinetic energy.',X`K_{\text{tot}}=${d[1]}-${d[2][0]}=${Kt}\ \text{MeV}`],['The neutrino takes the rest.',X`E_\nu=${Kt}-${Km}=${tn(Kt-Km)}${U('MeV')}`]],
      chk:{k:'ic-decay',ask:'nu',parent:d[1],kids:d[2],Km}}; }
  return{q:d[0]+' What is the total kinetic energy of the products?',ans:Kt,unit:'MeV',lv:1,how:'Isolated system: the drop in rest energy becomes kinetic energy',
    sol:[['Rest energy before equals rest plus kinetic energy after.',X`K_{\text{tot}}=${d[1]}-(${d[2].join('+')})=${Kt}${U('MeV')}`]],chk:{k:'ic-decay',ask:'K',parent:d[1],kids:d[2]}};
});
add('ic-binding','Identity change',12,()=>{
  const mp=1.672622e-27, mn=1.674927e-27, me=9.109e-31, mD=3.343584e-27;
  if(Math.random()<0.5){ const E=(mp+mn-mD)*K.c*K.c/K.eV/1e6;
    return{q:`A proton (${sci(mp,7)} kg) and a neutron (${sci(mn,7)} kg) at rest combine to form a deuteron (${sci(mD,7)} kg) and emit a gamma-ray photon. `+
             `Neglecting the deuteron's small recoil, what is the photon's energy in MeV? (c = 3×10<sup>8</sup> m/s, 1 eV = 1.6×10<sup>−19</sup> J)`,
      ans:E,unit:'MeV',lv:2,how:'E_γ = (m_p + m_n − m_D)c²: the bound deuteron has less rest energy than its parts',
      sol:[['Isolated system: rest energy before = rest energy after + photon energy (recoil neglected).',X`E_\gamma=(m_p+m_n-m_D)c^2=(${tn(mp+mn-mD,4)})(3\times10^8)^2=${tn((mp+mn-mD)*K.c*K.c)}\ \text{J}`],
           ['Convert to MeV.',X`E_\gamma=${tn(E)}${U('MeV')}`]],chk:{k:'ic-binding',ask:'gamma',mp,mn,mD}}; }
  const E=(mn-mp-me)*K.c*K.c/K.eV/1e6;
  return{q:`A free neutron (${sci(mn,7)} kg) at rest decays into a proton (${sci(mp,7)} kg), an electron (${sci(me,4)} kg) and a nearly massless antineutrino. `+
           `What is the total kinetic energy of the products, in MeV? (c = 3×10<sup>8</sup> m/s, 1 eV = 1.6×10<sup>−19</sup> J)`,
    ans:E,unit:'MeV',lv:2,how:'K_products = (m_n − m_p − m_e)c²',
    sol:[['The decrease in rest energy becomes kinetic energy of the products.',X`K=(m_n-m_p-m_e)c^2=(${tn(mn-mp-me,4)})(3\times10^8)^2=${tn((mn-mp-me)*K.c*K.c)}\ \text{J}=${tn(E)}${U('MeV')}`]],
    chk:{k:'ic-binding',ask:'neutron',mp,mn,me}};
});

