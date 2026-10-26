add('g-fall','Gravity near Earth',12,()=>{
  const o=pick([['teddy bear',0.8],['flowerpot',1.6],['basketball',0.6],['book',1.2]]), h=pick([1.93,2.55,3.2,4.9,6,8.5]), v=Math.sqrt(2*K.g*h), askK=Math.random()<0.4;
  return{q:`A ${o[1]} kg ${o[0]} falls from rest through ${h} m. Neglecting air resistance, what is its ${askK?'kinetic energy':'speed'} just before it lands?`,
    ans:askK?o[1]*K.g*h:v,unit:askK?'J':'m/s',lv:1,how:'System object + Earth: ΔK + ΔU = 0, so ½mv² = mgh and the mass cancels in the speed',
    sol:[['System: object + Earth, nothing in the surroundings doing work.',X`\Delta K+\Delta U=0\quad\Rightarrow\quad\tfrac12mv^2=mgh`],
         askK?['',X`K=mgh=(${o[1]})(9.8)(${h})=${tn(o[1]*K.g*h)}${U('J')}`]:['The mass cancels.',X`v=\sqrt{2gh}=\sqrt{2(9.8)(${h})}=${tn(v)}${U('m/s')}`]],
    chk:{k:'g-fall',ask:askK?'K':'v',m:o[1],h}};
});
add('g-up','Gravity near Earth',12,()=>{
  if(Math.random()<0.5){ const v=pick([12,15,20,25,30,41.2]), h=v*v/(2*K.g);
    return{q:`A ball is thrown straight up at ${v} m/s. Neglecting air resistance, how high does it rise above the launch point?`,ans:h,unit:'m',lv:1,
      how:'½mv² = mgh at the top, so h = v²/2g',sol:[['At the top all the kinetic energy has become potential energy of the ball + Earth system.',X`h=\frac{v^2}{2g}=\frac{(${v})^2}{2(9.8)}=${tn(h)}${U('m')}`]],chk:{k:'g-up',ask:'h',v}}; }
  const T=pick([2.2,2.8,3.3,3.9,4.4]), v0=K.g*T/2, h=v0*v0/(2*K.g), askH=Math.random()<0.6;
  return{q:`You throw a ball straight up and catch it at the same height ${T} s later. Neglecting air resistance, ${askH?'how high above your hand does it rise':'how fast was it moving when it left your hand'}?`,
    ans:askH?h:v0,unit:askH?'m':'m/s',lv:2,how:'Momentum Principle for the launch speed (half the time to the top), Energy Principle for the height',
    sol:[['Going up takes half the flight time; momentum goes from mv₀ to 0 under gravity.',X`0=mv_0-mg\frac{T}{2}\quad\Rightarrow\quad v_0=\frac{(9.8)(${T})}{2}=${tn(v0)}${U('m/s')}`]
         .concat(askH?[]:[]),
         askH?['Energy Principle to the top.',X`h=\frac{v_0^2}{2g}=\frac{(${tn(v0)})^2}{2(9.8)}=${tn(h)}${U('m')}`]:null].filter(Boolean),
    chk:{k:'g-up',ask:askH?'Th':'Tv',T}};
});
add('g-air','Gravity near Earth',12,()=>{
  const m=pick([0.15,0.2,0.4,0.5]), vi=pick([12,15,18,20,24]), vf=rd(vi*rf(0.6,0.9,2),1), W=0.5*m*(vf*vf-vi*vi);
  return{q:`A ${m} kg ball is thrown straight up at ${vi} m/s and caught at the same height moving at ${vf} m/s. How much work did air resistance do on the ball over the round trip?`,
    ans:W,unit:'J',lv:2,how:'Back at the same height, gravity\'s net work is zero, so W_air = ΔK (and must be negative)',
    sol:[['System: ball; surroundings: Earth and air. Over the round trip Δy = 0, so gravity does no net work.',X`\Delta K=W_{\text{grav}}+W_{\text{air}}=0+W_{\text{air}}`],
         ['',X`W_{\text{air}}=\tfrac12(${m})\big((${vf})^2-(${vi})^2\big)=${tn(W)}${U('J')}`]],chk:{k:'g-air',m,vi,vf}};
});
add('g-slide','Gravity near Earth',12,()=>{
  const L=pick([3,4,5,6,8]), th=pick([20,25,30,35,40]), v=Math.sqrt(2*K.g*L*Math.sin(th*D2R));
  return{q:`A block slides from rest ${L} m down a frictionless ramp inclined at ${th}°. How fast is it moving at the bottom?`,ans:v,unit:'m/s',lv:1,
    how:'Only the drop in height matters: h = L sin θ, v = √(2gh); the normal force does no work',
    sol:[['The normal force is perpendicular to the motion, and gravity only cares about the height drop.',X`h=L\sin\theta=(${L})\sin ${th}^\circ=${tn(L*Math.sin(th*D2R))}${U('m')}`],
         ['',X`v=\sqrt{2gh}=${tn(v)}${U('m/s')}`]],chk:{k:'g-slide',L,th}};
});

/* ---- Tracks and circles · HW12 ---- */
const CY={A:1,B:0,C:-1,D:0};
add('trk-rod','Tracks & circles',12,()=>{
  const seat=Math.random()<0.4, m=seat?pick([60,80,90]):pick([2,4,5,6,8]), R=seat?pick([5,6,10,12]):pick([1,1.5,2,3]), v=pick([3,4,6,8]);
  const pts=['A','B','C','D'], from=pick(pts), to=pick(pts.filter(x=>x!==from)), dir=pick(['cw','ccw']), W=m*K.g*R*(CY[to]-CY[from]);
  const who=seat?`A ${m} kg rider sits in a seat on a Ferris wheel of radius ${R} m`:`A ${m} kg ball on the end of a light rigid rod swings in a vertical circle of radius ${R} m`;
  return{q:`${who}, moving at a constant ${v} m/s (see figure: A top, B right, C bottom, D left). How much work does the ${seat?'seat':'rod'} do on the ${seat?'rider':'ball'} from ${from} to ${to}?`,
    ans:W,unit:'J',lv:2,zero:true,fig:FIG.eCircle(from,dir,seat),
    how:'Constant speed: ΔK = 0 = W_rod + W_grav, so W_rod = +mgΔy (the speed is a distractor)',
    sol:[['System: the ball. Constant speed means ΔK = 0, so the rod\'s work cancels gravity\'s.',X`0=W_{\text{${seat?'seat':'rod'}}}+W_{\text{grav}}\quad\Rightarrow\quad W=mg\,\Delta y`],
         [`From ${from} to ${to} the height changes by ${tn(R*(CY[to]-CY[from]))} m.`,X`W=(${m})(9.8)(${tn(R*(CY[to]-CY[from]))})=${tn(W)}${U('J')}`]],
    chk:{k:'trk-rod',m,R,from,to}};
});
add('trk-bowl','Tracks & circles',12,()=>{
  const m=pick([0.5,1,2,3]), R=pick([0.8,1,1.5,2,3]), h=rd(R*pick([0.3,0.5,0.75,1]),2), askN=Math.random()<0.55;
  const v=Math.sqrt(2*K.g*h), N=m*K.g+m*v*v/R;
  return{q:`A ${m} kg block is released from rest on the inside of a smooth bowl whose cross-section is a circle of radius ${R} m, at a point ${h} m above the bottom. `+
           `At the bottom, what is ${askN?'the normal force from the bowl':'its speed'}?`,
    ans:askN?N:v,unit:askN?'N':'m/s',lv:askN?3:2,how:'Energy for the speed (v² = 2gh); at the bottom N − mg = mv²/R',
    sol:[['System block + Earth; the normal force does no work.',X`v=\sqrt{2gh}=\sqrt{2(9.8)(${h})}=${tn(v)}${U('m/s')}`]]
         .concat(askN?[['At the bottom the center is straight up, so the net force mv²/R points up.',X`N-mg=\frac{mv^2}{R}\quad\Rightarrow\quad N=(${m})(9.8)+\frac{(${m})(${tn(v)})^2}{${R}}=${tn(N)}${U('N')}`]]:[]),
    chk:{k:'trk-bowl',ask:askN?'N':'v',m,R,h}};
});
add('trk-loop','Tracks & circles',12,()=>{
  const m=pick([200,300,400,500]), R=pick([5,6,8,10,12]), h=rd(R*rf(2.6,4,1),0), pt_=pick(['C','D']), ask=pick(['v','N']);
  const y=pt_==='C'?2*R:R, v=Math.sqrt(2*K.g*(h-y)), N=pt_==='C'?m*v*v/R-m*K.g:m*v*v/R;
  const where=pt_==='C'?'the top of the loop (C)':'the side of the loop, level with its center (D)';
  return{q:`A ${m} kg roller-coaster car starts from rest at A, ${h} m above the bottom of a frictionless track, and goes around a vertical loop of radius ${R} m (see figure). `+
           `At ${where}, what is ${ask==='v'?'its speed':'the size of the normal force from the track'}?`,
    ans:ask==='v'?v:N,unit:ask==='v'?'m/s':'N',lv:ask==='v'?2:3,fig:FIG.eTrack('loop',{h,R,at:pt_}),
    how:pt_==='C'?'v_C = √(2g(h − 2R)); at the top N + mg = mv²/R':'v_D = √(2g(h − R)); at the side only N points to the center: N = mv²/R',
    sol:[[`${pt_} is ${y} m above the bottom.`,X`\tfrac12mv^2=mg(h-${pt_==='C'?'2R':'R'})\quad\Rightarrow\quad v=\sqrt{2(9.8)(${h}-${y})}=${tn(v)}${U('m/s')}`]]
         .concat(ask==='N'?[[pt_==='C'?'At the top both gravity and the track push toward the center.':'At the side gravity is tangent; only the normal force points to the center.',
            pt_==='C'?X`N+mg=\frac{mv^2}{R}\quad\Rightarrow\quad N=\frac{(${m})(${tn(v)})^2}{${R}}-(${m})(9.8)=${tn(N)}${U('N')}`:X`N=\frac{mv^2}{R}=\frac{(${m})(${tn(v)})^2}{${R}}=${tn(N)}${U('N')}`]]:[]),
    chk:{k:'trk-loop',ask,pt:pt_,m,R,h}};
});
add('trk-friction','Tracks & circles',12,()=>{
  const m=pick([200,300,400,500]), R=pick([5,6,8,10]), h=rd(R*rf(2.8,4,1),0), vmax=Math.sqrt(2*K.g*(h-2*R)), vC=rd(vmax*rf(0.55,0.85,2),1);
  const W=0.5*m*vC*vC-m*K.g*(h-2*R);
  return{q:`A ${m} kg roller-coaster car starts from rest ${h} m above the bottom of the track and goes around a vertical loop of radius ${R} m (see figure). `+
           `At the top of the loop (C) its speed is only ${vC} m/s. How much work did friction do on the car from A to C?`,
    ans:W,unit:'J',lv:3,fig:FIG.eTrack('loop',{h,R,at:'C'}),how:'System car + Earth, friction outside: ½mv_C² + mg(2R − h) = W_friction (negative)',
    sol:[['System: car + Earth; the track\'s friction is in the surroundings.',X`\Delta K+\Delta U=W_f\quad\Rightarrow\quad W_f=\tfrac12mv_C^2-mg(h-2R)`],
         ['',X`W_f=\tfrac12(${m})(${vC})^2-(${m})(9.8)(${h}-${2*R})=${tn(W)}${U('J')}`]],chk:{k:'trk-friction',m,R,h,vC}};
});

/* ---- Springs · HW13 ---- */
add('sp-pe','Springs',13,()=>{
  const k=pick([50,120,200,400,800,1200]), s=pick([0.05,0.08,0.1,0.15,0.2,0.3]), Uu=0.5*k*s*s;
  if(Math.random()<0.6) return{q:`A spring of stiffness ${k} N/m is ${Math.random()<0.5?'stretched':'compressed'} ${s} m from its relaxed length. How much potential energy is stored in it?`,
    ans:Uu,unit:'J',lv:1,how:'U = ½k_s s², positive whether stretched or compressed',sol:[['',X`U=\tfrac12k_ss^2=\tfrac12(${k})(${s})^2=${tn(Uu)}${U('J')}`]],chk:{k:'sp-pe',ask:'U',ks:k,s}};
  const Ur=rd(Uu,2);
  return{q:`A spring of stiffness ${k} N/m stores ${Ur} J. How far is it stretched or compressed from its relaxed length?`,ans:Math.sqrt(2*Ur/k),unit:'m',lv:1,
    how:'s = √(2U/k_s)',sol:[['',X`s=\sqrt{\frac{2U}{k_s}}=\sqrt{\frac{2(${Ur})}{${k}}}=${tn(Math.sqrt(2*Ur/k))}${U('m')}`]],chk:{k:'sp-pe',ask:'s',ks:k,U:Ur}};
});
add('sp-launch','Springs',13,()=>{
  const m=pick([0.1,0.2,0.25,0.5,1]), k=pick([40,80,120,200,400]), s=pick([0.05,0.1,0.12,0.15,0.2]), v=s*Math.sqrt(k/m), h=k*s*s/(2*m*K.g), askH=Math.random()<0.5;
  return{q:`A ${m} kg cart on a frictionless track compresses a spring (k<sub>s</sub> = ${k} N/m) by ${s} m and is released. `+
           (askH?'After leaving the spring it coasts up a frictionless ramp. How high does it rise?':'How fast is it moving when it leaves the spring?'),
    ans:askH?h:v,unit:askH?'m':'m/s',lv:askH?2:1,how:'½k_s s² = ½mv² = mgh',
    sol:[['System cart + spring: the spring\'s energy becomes kinetic energy.',X`\tfrac12k_ss^2=\tfrac12mv^2\quad\Rightarrow\quad v=s\sqrt{\frac{k_s}{m}}=(${s})\sqrt{\frac{${k}}{${m}}}=${tn(v)}${U('m/s')}`]]
         .concat(askH?[['Then it all becomes gravitational energy at the top.',X`h=\frac{k_ss^2}{2mg}=\frac{(${k})(${s})^2}{2(${m})(9.8)}=${tn(h)}${U('m')}`]]:[]),
    chk:{k:'sp-launch',ask:askH?'h':'v',m,ks:k,s}};
});
add('sp-push','Springs',13,()=>{
  const M=pick([2,5,8,10]), k=pick([200,400,800,1000]), s0=pick([0.1,0.15,0.2,0.25]), v0=pick([1,1.5,2,3]), v=Math.sqrt(v0*v0+k*s0*s0/M), way=pick(['further stretching it','back toward the wall']);
  return{q:`A ${M} kg block on a frictionless floor is attached to a horizontal spring (k<sub>s</sub> = ${k} N/m). You stretch the spring ${s0} m and then give the block a speed of ${v0} m/s, ${way}. `+
           `How fast is it moving when the spring reaches its relaxed length?`,
    ans:v,unit:'m/s',lv:2,how:'System block + spring: ½Mv² = ½Mv₀² + ½k_s s₀²; the direction of the push does not matter',
    sol:[['Energy is a scalar, so the direction of the initial velocity does not matter.',X`\tfrac12Mv^2=\tfrac12Mv_0^2+\tfrac12k_ss_0^2`],
         ['',X`v=\sqrt{(${v0})^2+\frac{(${k})(${s0})^2}{${M}}}=${tn(v)}${U('m/s')}`]],chk:{k:'sp-push',M,ks:k,s0,v0}};
});
add('sp-vertical','Springs',13,()=>{
  const m=pick([0.1,0.5,1,2,8]), up=Math.random()<0.5, dy=pick([0.1,0.11,0.2,0.3]), vi=pick([2,3,5.2,7]), vf=rd(vi*rf(0.55,0.85,2),2), ask=pick(['earth','spring','spring']);
  const Wg=(up?-1:1)*m*K.g*dy, Ws=0.5*m*(vf*vf-vi*vi)-Wg;
  return{q:`A ${m} kg mass hangs from a vertical spring. It moves ${up?'up':'down'} ${dy} m while its speed changes from ${vi} m/s to ${vf} m/s. How much work did ${ask==='earth'?'Earth':'the spring'} do on the mass?`,
    ans:ask==='earth'?Wg:Ws,unit:'J',lv:ask==='earth'?1:2,how:'System: the mass. W_Earth = ±mgΔy (+ moving down); W_spring = ΔK − W_Earth',
    sol:[[`Gravity points down and the mass moves ${up?'up':'down'}.`,X`W_{\text{Earth}}=${up?'-':'+'}mg|\Delta y|=${up?'-':''}(${m})(9.8)(${dy})=${tn(Wg)}${U('J')}`]]
         .concat(ask==='spring'?[['Energy Principle with both the spring and Earth in the surroundings.',X`W_{\text{spring}}=\Delta K-W_{\text{Earth}}=\tfrac12(${m})\big((${vf})^2-(${vi})^2\big)-${tp(Wg)}=${tn(Ws)}${U('J')}`]]:[]),
    chk:{k:'sp-vertical',ask,m,up,dy,vi,vf}};
});
add('sp-drop','Springs',13,()=>{
  const m=pick([0.5,1,2]), k=pick([200,400,600,1000]), h=pick([0.2,0.3,0.5,0.8]), mg=m*K.g, s=(mg+Math.sqrt(mg*mg+2*k*mg*h))/k;
  return{q:`A ${m} kg block is dropped from rest ${h} m above the top of a vertical spring (k<sub>s</sub> = ${k} N/m) standing on the floor. What is the spring's maximum compression?`,
    ans:s,unit:'m',lv:3,how:'System block + spring + Earth: ½k_s s² = mg(h + s), a quadratic in s',
    sol:[['At maximum compression the block is momentarily at rest; it has fallen h + s.',X`\tfrac12k_ss^2=mg(h+s)\quad\Rightarrow\quad\tfrac12(${k})s^2-(${tn(mg)})s-(${tn(mg)})(${h})=0`],
         ['Take the positive root.',X`s=\frac{mg+\sqrt{(mg)^2+2k_smgh}}{k_s}=${tn(s)}${U('m')}`]],chk:{k:'sp-drop',m,ks:k,h}};
});
add('sp-friction','Springs',13,()=>{
  const m=pick([0.5,1,2,3]), k=pick([200,400,600,800]), s=pick([0.1,0.15,0.2,0.25]), mu=pick([0.1,0.2,0.3]), v2=k*s*s/m-2*mu*K.g*s;
  if(v2<=0.5) return null;
  return{q:`A ${m} kg block compresses a horizontal spring (k<sub>s</sub> = ${k} N/m) by ${s} m on a floor where μ<sub>k</sub> = ${mu}. It is released from rest. How fast is it moving when the spring reaches its relaxed length?`,
    ans:Math.sqrt(v2),unit:'m/s',lv:3,how:'½mv² = ½k_s s² − μ_k mg s (friction does negative work over the distance s)',
    sol:[['System block + spring; friction from the floor is outside and does negative work.',X`\tfrac12mv^2=\tfrac12k_ss^2-\mu_kmg\,s`],
         ['',X`v=\sqrt{\frac{(${k})(${s})^2}{${m}}-2(${mu})(9.8)(${s})}=${tn(Math.sqrt(v2))}${U('m/s')}`]],chk:{k:'sp-friction',m,ks:k,s,mu}};
});

