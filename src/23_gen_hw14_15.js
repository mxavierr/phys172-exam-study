const SUBS=[['water',4186],['aluminum',900],['iron',450],['copper',385],['glass',840]];
add('th-heat','Thermal energy',14,()=>{
  const s=pick(SUBS), m=pick([0.2,0.5,1,1.5,2.5]), dT=pick([5,10,15,20,40]), Q=m*s[1]*dT;
  if(Math.random()<0.6) return{q:`How much energy does it take to raise the temperature of ${m} kg of ${s[0]} (C = ${s[1]} J/(kg·K)) by ${dT} K?`,
    ans:Q,unit:'J',lv:1,how:'ΔE_thermal = mCΔT',sol:[['',X`\Delta E=mC\Delta T=(${m})(${s[1]})(${dT})=${tn(Q)}${U('J')}`]],chk:{k:'th-heat',ask:'Q',m,C:s[1],dT}};
  const Qr=rd(Q,0);
  return{q:`${m} kg of ${s[0]} (C = ${s[1]} J/(kg·K)) absorbs ${Qr} J of heat with no work done. By how much does its temperature rise?`,ans:Qr/(m*s[1]),unit:'K',lv:1,
    how:'ΔT = Q/(mC)',sol:[['',X`\Delta T=\frac{Q}{mC}=\frac{${Qr}}{(${m})(${s[1]})}=${tn(Qr/(m*s[1]))}${U('K')}`]],chk:{k:'th-heat',ask:'dT',m,C:s[1],Q:Qr}};
});
add('th-qw','Thermal energy',14,()=>{
  const ask=pick(['dE','dE','Qlost']);
  if(ask==='dE'){ const Q=pick([3000,5000,8000,-1200,-2500]), W=pick([1000,2000,3000,4500]);
    return{q:`A pot of water ${Q>0?`absorbs ${Q} J of heat from a burner`:`loses ${-Q} J of heat to the room`} while you stir it, doing ${W} J of work on it. What is the change in its internal (thermal) energy?`,
      ans:Q+W,unit:'J',lv:1,zero:true,how:'ΔE_int = Q + W_surr; heat out of the system is negative',
      sol:[['Both heat and work count; heat flowing out is negative.',X`\Delta E_{\text{int}}=Q+W=${tn(Q)}+${W}=${tn(Q+W)}${U('J')}`]],chk:{k:'th-qw',ask,Q,W}}; }
  const M=pick([0.6,1,2.5,3]), C=pick([3800,4200,4400]), dT=pick([0.2,0.4,0.5,1]), W=pick([5300,7000,8000,12000]), dE=M*C*dT, Qv=dE-W;
  if(Qv>=0) return null;
  return{q:`In a poorly insulated container, a paddle does ${W} J of work stirring ${M} kg of liquid (C = ${C} J/(kg·K)), whose temperature rises by only ${dT} K. How much heat leaked out, |Q|?`,
    ans:-Qv,unit:'J',lv:2,how:'MCΔT = Q + W, so Q = MCΔT − W (negative: heat lost)',
    sol:[['Thermal energy gained.',X`\Delta E=MC\Delta T=(${M})(${C})(${dT})=${tn(dE)}${U('J')}`],
         ['The rest of the work leaked out as heat.',X`Q=\Delta E-W=${tn(dE)}-${W}=${tn(Qv)}\ \text{J}\quad\Rightarrow\quad|Q|=${tn(-Qv)}${U('J')}`]],chk:{k:'th-qw',ask,M,C,dT,W}};
});
add('th-mix','Thermal energy',14,()=>{
  const a=pick(SUBS.slice(1)), ma=pick([0.3,0.5,0.6,1]), Ta=pick([20,25,150,200]), mw=pick([0.4,0.5,1,2]), Tw=Ta>100?pick([15,20,25]):pick([80,90,100]);
  const Tf=(ma*a[1]*Ta+mw*4186*Tw)/(ma*a[1]+mw*4186);
  return{q:`${ma} kg of ${a[0]} (C = ${a[1]} J/(kg·K)) at ${Ta} °C is ${Ta>100?'dropped into':'put in contact with'} ${mw} kg of water (C = 4186 J/(kg·K)) at ${Tw} °C in an insulated container. What is the final temperature?`,
    ans:Tf,unit:'°C',lv:2,how:'Closed system: m₁C₁(T_f − T₁) + m₂C₂(T_f − T₂) = 0',
    sol:[['No heat in or out and no work: the two changes in thermal energy cancel.',X`m_aC_a(T_f-T_a)+m_wC_w(T_f-T_w)=0`],
         ['Solve for the final temperature.',X`T_f=\frac{m_aC_aT_a+m_wC_wT_w}{m_aC_a+m_wC_w}=${tn(Tf)}\ ^\circ\text{C}`]],chk:{k:'th-mix',ma,Ca:a[1],Ta,mw,Tw}};
});
add('th-ratio','Thermal energy',14,()=>{
  const MA=pick([2,5,10,19]), MB=pick([4,8,10,23]), dA=pick([4,6,7,10]), dB=pick([1.2,2,4,10,19]);
  if(MA===MB&&dA===dB) return null;
  return{q:`Object A (mass ${MA} kg) and object B (mass ${MB} kg) are put in thermal contact in an insulated box. A's temperature falls by ${dA} K while B's rises by ${dB} K. What is the ratio of specific heats, C<sub>B</sub>/C<sub>A</sub>?`,
    ans:MA*dA/(MB*dB),unit:'',lv:2,how:'Energy lost by A = energy gained by B: M_A C_A|ΔT_A| = M_B C_B|ΔT_B|',
    sol:[['The thermal energy A loses, B gains.',X`M_AC_A|\Delta T_A|=M_BC_B|\Delta T_B|\quad\Rightarrow\quad\frac{C_B}{C_A}=\frac{M_A|\Delta T_A|}{M_B|\Delta T_B|}=\frac{(${MA})(${dA})}{(${MB})(${dB})}=${tn(MA*dA/(MB*dB))}`]],chk:{k:'th-ratio',MA,MB,dA,dB}};
});
add('th-same','Thermal energy',14,()=>{
  const p=pick([[SUBS[1],SUBS[2]],[SUBS[3],SUBS[1]],[SUBS[2],SUBS[4]]]), d1=pick([10,15,20,25]);
  return{q:`Equal masses of ${p[0][0]} (C = ${p[0][1]} J/(kg·K)) and ${p[1][0]} (C = ${p[1][1]} J/(kg·K)) each absorb the same amount of heat. The ${p[0][0]} warms by ${d1} °C. By how much does the ${p[1][0]} warm?`,
    ans:d1*p[0][1]/p[1][1],unit:'°C',lv:1,how:'Same Q and m: C₁ΔT₁ = C₂ΔT₂',
    sol:[['Same energy, same mass, so the product CΔT is the same.',X`\Delta T_2=\Delta T_1\frac{C_1}{C_2}=(${d1})\frac{${p[0][1]}}{${p[1][1]}}=${tn(d1*p[0][1]/p[1][1])}\ ^\circ\text{C}`]],chk:{k:'th-same',d1,C1:p[0][1],C2:p[1][1]}};
});
add('th-joule','Thermal energy',14,()=>{
  const m=pick([2,5,10]), h=pick([1,1.5,2]), N=pick([10,20,30]), M=pick([0.4,0.5,1]), C=4186, dT=N*m*K.g*h/(M*C), askC=Math.random()<0.4;
  if(!askC) return{q:`In a Joule apparatus, a ${m} kg mass descends ${h} m at constant speed, turning a paddle in ${M} kg of water (C = 4186 J/(kg·K)) in an insulated container. This is repeated ${N} times. By how much does the water's temperature rise?`,
    ans:dT,unit:'K',lv:2,how:'Constant speed: all of mgh per drop goes into the water: MCΔT = N·mgh',
    sol:[['Constant speed means no change in kinetic energy, so each drop puts mgh into the water.',X`MC\Delta T=Nmgh\quad\Rightarrow\quad\Delta T=\frac{(${N})(${m})(9.8)(${h})}{(${M})(4186)}=${tn(dT)}${U('K')}`]],chk:{k:'th-joule',ask:'dT',m,h,N,M}};
  const dTr=rd(dT,3);
  return{q:`In a Joule apparatus, a ${m} kg mass descends ${h} m at constant speed ${N} times, stirring ${M} kg of an unknown liquid in an insulated container. The liquid warms by ${dTr} K. What is its specific heat?`,
    ans:N*m*K.g*h/(M*dTr),unit:'J/(kg·K)',lv:2,how:'C = N·mgh/(MΔT)',
    sol:[['',X`C=\frac{Nmgh}{M\Delta T}=\frac{(${N})(${m})(9.8)(${h})}{(${M})(${dTr})}=${tn(N*m*K.g*h/(M*dTr))}${U('J/(kg·K)')}`]],chk:{k:'th-joule',ask:'C',m,h,N,M,dT:dTr}};
});
add('th-adiabatic','Thermal energy',14,()=>{
  const rho=pick([1.2,1.3,1.4]), A=pick([0.002,0.005,0.01]), Lc=pick([0.2,0.3,0.5]), C=pick([718,1000]), m=pick([5,10,20]), h=pick([0.05,0.1,0.15]);
  const mg_=rho*A*Lc, dT=m*K.g*h/(mg_*C);
  return{q:`A sealed, insulated cylinder holds gas (density ${rho} kg/m³, C = ${C} J/(kg·K)) in a column ${Lc} m long with cross-section ${A} m². A ${m} kg mass drops ${h} m onto the piston, doing work on the gas. By how much does the gas temperature rise? (Neglect heat flow.)`,
    ans:dT,unit:'K',lv:3,how:'Adiabatic (Q = 0): m_gas C ΔT = W = mgh, with m_gas = ρAL',
    sol:[['Mass of the gas.',X`m_{\text{gas}}=\rho AL=(${rho})(${A})(${Lc})=${tn(mg_)}${U('kg')}`],
         ['No heat, so the work all becomes thermal energy.',X`\Delta T=\frac{mgh}{m_{\text{gas}}C}=\frac{(${m})(9.8)(${h})}{(${tn(mg_)})(${C})}=${tn(dT)}${U('K')}`]],chk:{k:'th-adiabatic',rho,A,L:Lc,C,m,h}};
});

/* ---- Dissipation and power · HW14 ---- */
add('ds-terminal','Dissipation',14,()=>{
  const o=pick([['coffee filter',0.002,1.2],['coffee filter',0.003,1.5],['skydiver',70,50],['skydiver',80,55],['skydiver',90,60]]), m=o[1], v=o[2];
  if(Math.random()<0.5) return{q:`A ${m} kg ${o[0]} falls at a constant terminal speed of ${v} m/s. What is the magnitude of the air-resistance force on it?`,
    ans:m*K.g,unit:'N',lv:1,how:'Constant velocity → F_net = 0 → F_air = mg (the speed is a distractor)',
    sol:[['At terminal speed the momentum is constant, so the net force is zero.',X`F_{\text{air}}=mg=(${m})(9.8)=${tn(m*K.g)}${U('N')}`]],chk:{k:'ds-terminal',ask:'F',m,v}};
  const Cd=pick([0.5,0.7,1.0,1.2]), A=pick([0.3,0.5,0.7]), M=pick([60,70,80]), rho=1.2, vt=Math.sqrt(2*M*K.g/(Cd*rho*A));
  return{q:`A ${M} kg skydiver with frontal area ${A} m² and drag coefficient ${Cd} falls through air of density ${rho} kg/m³. What is the terminal speed? (F<sub>drag</sub> = ½CρAv²)`,
    ans:vt,unit:'m/s',lv:2,how:'At terminal speed ½CρAv² = mg',sol:[['Drag balances gravity.',X`\tfrac12C\rho Av^2=mg\quad\Rightarrow\quad v=\sqrt{\frac{2mg}{C\rho A}}=\sqrt{\frac{2(${M})(9.8)}{(${Cd})(${rho})(${A})}}=${tn(vt)}${U('m/s')}`]],chk:{k:'ds-terminal',ask:'v',M,Cd,A,rho}};
});
add('ds-incline','Dissipation',14,()=>{
  const m=pick([1,2,3,5]), th=pick([25,30,35,40]), mu=pick([0.1,0.2,0.3]), d=pick([2,3,4,5]), v2=2*K.g*d*(Math.sin(th*D2R)-mu*Math.cos(th*D2R));
  if(v2<=0.2) return null;
  return{q:`A ${m} kg block slides from rest ${d} m down a ${th}° incline with μ<sub>k</sub> = ${mu}. How fast is it moving at the bottom?`,ans:Math.sqrt(v2),unit:'m/s',lv:2,
    how:'ΔK = W_grav + W_friction = mgd sin θ − μ_k mg cos θ · d (the normal force does no work)',
    sol:[['System: block; surroundings: Earth and incline.',X`\tfrac12mv^2=mgd\sin\theta-\mu_kmg\cos\theta\,d`],
         ['The mass cancels.',X`v=\sqrt{2(9.8)(${d})(\sin ${th}^\circ-${mu}\cos ${th}^\circ)}=${tn(Math.sqrt(v2))}${U('m/s')}`]],chk:{k:'ds-incline',th,mu,d}};
});
add('ds-stop','Dissipation',14,()=>{
  const m=pick([2,5,10,20]), v=pick([3,4,6,8]), mu=pick([0.2,0.3,0.4,0.5]), askE=Math.random()<0.4;
  return{q:`A ${m} kg box slides across a floor at ${v} m/s and comes to rest. μ<sub>k</sub> = ${mu}. ${askE?'How much thermal energy is produced in the box and floor together?':'How far does it slide?'}`,
    ans:askE?0.5*m*v*v:v*v/(2*mu*K.g),unit:askE?'J':'m',lv:1,how:askE?'All the kinetic energy becomes thermal energy':'½mv² = μ_k mg d',
    sol:askE?[['System box + floor: the kinetic energy all becomes thermal energy.',X`\Delta E_{\text{th}}=\tfrac12mv^2=\tfrac12(${m})(${v})^2=${tn(0.5*m*v*v)}${U('J')}`]]
            :[['Friction does negative work over the sliding distance.',X`\tfrac12mv^2=\mu_kmg\,d\quad\Rightarrow\quad d=\frac{v^2}{2\mu_kg}=${tn(v*v/(2*mu*K.g))}${U('m')}`]],chk:{k:'ds-stop',ask:askE?'E':'d',m,v,mu}};
});
add('ds-work','Dissipation',14,()=>{
  const m=pick([20,30,50,60]), h=pick([2,3,5,8]), vmax=Math.sqrt(2*K.g*h), v=rd(vmax*rf(0.5,0.85,2),1), W=0.5*m*v*v-m*K.g*h;
  return{q:`A ${m} kg child slides from rest down a playground slide that drops ${h} m and reaches the bottom at ${v} m/s. How much work did friction do on the child?`,ans:W,unit:'J',lv:2,
    how:'W_friction = ΔK − mgh (must be negative)',sol:[['System child + Earth; friction outside.',X`W_f=\tfrac12mv^2-mgh=\tfrac12(${m})(${v})^2-(${m})(9.8)(${h})=${tn(W)}${U('J')}`]],chk:{k:'ds-work',m,h,v}};
});
add('pw-power','Power',14,()=>{
  if(Math.random()<0.5){ const m=pick([50,70,100,500]), h=pick([3,5,10,20]), t=pick([4,5,8,10,20]);
    return{q:`A motor lifts a ${m} kg load ${h} m at constant speed in ${t} s. What is its power output?`,ans:m*K.g*h/t,unit:'W',lv:1,how:'P = W/Δt = mgh/Δt',
      sol:[['',X`P=\frac{mgh}{\Delta t}=\frac{(${m})(9.8)(${h})}{${t}}=${tn(m*K.g*h/t)}${U('W')}`]],chk:{k:'pw-power',ask:'lift',m,h,t}}; }
  const F=pick([200,500,800,1200]), v=pick([2,5,12,25]), th=pick([0,20,30]);
  return{q:`A ${F} N force pulls an object moving at ${v} m/s, at ${th}° to its velocity. At what rate does the force do work?`,ans:F*v*Math.cos(th*D2R),unit:'W',lv:1,how:'P = F·v = Fv cos θ',
    sol:[['',X`P=Fv\cos\theta=(${F})(${v})\cos ${th}^\circ=${tn(F*v*Math.cos(th*D2R))}${U('W')}`]],chk:{k:'pw-power',ask:'Fv',F,v,th}};
});

/* ---- Rotational energy · HW15 ---- */
const SHAPES=[['solid disk','½MR²',0.5],['solid cylinder','½MR²',0.5],['hoop','MR²',1],['solid sphere','(2/5)MR²',0.4],['thin spherical shell','(2/3)MR²',2/3]];
add('rot-ke','Rotational KE',15,()=>{
  const s=pick(SHAPES), M=pick([0.5,1,2,4,10]), R=pick([0.05,0.1,0.2,0.3,0.5]), w=pick([5,10,20,30,40]), I=s[2]*M*R*R, Kr=0.5*I*w*w;
  return{q:`A ${s[0]} (I = ${s[1]}) of mass ${M} kg and radius ${R} m spins at ${w} rad/s about its center. What is its rotational kinetic energy?`,
    ans:Kr,unit:'J',lv:1,how:'K_rot = ½Iω²',sol:[['',X`I=${tn(s[2],3)}MR^2=${tn(I)}${U('kg·m²')},\qquad K_{\text{rot}}=\tfrac12I\omega^2=\tfrac12(${tn(I)})(${w})^2=${tn(Kr)}${U('J')}`]],chk:{k:'rot-ke',b:s[2],M,R,w}};
});
add('rot-points','Rotational KE',15,()=>{
  const m=pick([0.2,0.5,1,2]), r1=pick([0.2,0.3,0.4]), r2=pick([0.5,0.6,0.8]), w=pick([4,6,10,12]), I=2*m*r1*r1+2*m*r2*r2;
  return{q:`Four ${m} kg balls are fixed to a light rod that spins about its center at ${w} rad/s: two balls ${r1} m from the axis and two ${r2} m from the axis. What is the rotational kinetic energy?`,
    ans:0.5*I*w*w,unit:'J',lv:2,how:'I = Σmr² for point masses; K_rot = ½Iω²',
    sol:[['Add mr² for each ball.',X`I=2(${m})(${r1})^2+2(${m})(${r2})^2=${tn(I)}${U('kg·m²')}`],['',X`K_{\text{rot}}=\tfrac12I\omega^2=${tn(0.5*I*w*w)}${U('J')}`]],chk:{k:'rot-points',m,r1,r2,w}};
});
add('rot-roll','Rotational KE',15,()=>{
  const s=pick(SHAPES), h=pick([0.5,0.9,1.2,2,3]), R=pick([0.05,0.1,0.2]), ask=pick(['v','w']), yoyo=Math.random()<0.3&&s[2]===0.5;
  const v=Math.sqrt(2*K.g*h/(1+s[2]));
  const intro=yoyo?`A yo-yo shaped like a solid cylinder (I = ½MR², R = ${R} m) unwinds from a string tied to the ceiling, starting at rest, and falls ${h} m.`
                  :`A ${s[0]} (I = ${s[1]}, radius ${R} m) rolls without slipping from rest down a slope, dropping ${h} m in height.`;
  return{q:intro+` What is ${ask==='v'?'the speed of its center':'its angular speed'} at that point?`,ans:ask==='v'?v:v/R,unit:ask==='v'?'m/s':'rad/s',lv:2,
    how:'Mgh = ½Mv² + ½Iω² with v = ωR (the string or static friction does no work)',
    sol:[[yoyo?'The string\'s contact point is momentarily at rest, so it does no work.':'Static friction at a contact point that is momentarily at rest does no work.',X`Mgh=\tfrac12Mv^2+\tfrac12(${tn(s[2],3)}MR^2)\left(\frac{v}{R}\right)^2=\tfrac12(1+${tn(s[2],3)})Mv^2`],
         ['',X`v=\sqrt{\frac{2gh}{1+${tn(s[2],3)}}}=${tn(v)}\ \text{m/s}`+(ask==='w'?X`,\qquad\omega=\frac vR=${tn(v/R)}${U('rad/s')}`:'')]],chk:{k:'rot-roll',ask,b:s[2],h,R}};
});
add('rot-frac','Rotational KE',15,()=>{
  const s=pick(SHAPES), ask=pick(['frac','race']);
  if(ask==='frac') return{q:`A ${s[0]} (I = ${s[1]}) rolls without slipping. What fraction of its total kinetic energy is rotational?`,ans:s[2]/(1+s[2]),unit:'',lv:1,
    how:'K_rot/K_tot = β/(1 + β) with I = βMR²',sol:[['With v = ωR, K_rot = ½βMv² and K_trans = ½Mv².',X`\frac{K_{\text{rot}}}{K_{\text{tot}}}=\frac{${tn(s[2],3)}}{1+${tn(s[2],3)}}=${tn(s[2]/(1+s[2]))}`]],chk:{k:'rot-frac',ask,b:s[2]}};
  return{q:`A ${s[0]} (I = ${s[1]}) rolls without slipping down a slope, and an ice block slides without friction down the same slope. Both start from rest at the same height. What is the ratio of their speeds at the bottom, v<sub>rolling</sub>/v<sub>sliding</sub>?`,
    ans:1/Math.sqrt(1+s[2]),unit:'',lv:2,how:'Same total KE, but the roller shares it with rotation: v_roll/v_slide = 1/√(1 + β)',
    sol:[['Both get Mgh of kinetic energy; the roller puts some into rotation.',X`\frac{v_{\text{roll}}}{v_{\text{slide}}}=\frac{\sqrt{2gh/(1+${tn(s[2],3)})}}{\sqrt{2gh}}=${tn(1/Math.sqrt(1+s[2]))}`]],chk:{k:'rot-frac',ask,b:s[2]}};
});
add('rot-up','Rotational KE',15,()=>{
  const s=pick(SHAPES), v=pick([2,3,4,5]), R=pick([0.1,0.2]), ask=pick(['h','w']), h=(1+s[2])*v*v/(2*K.g);
  if(ask==='h') return{q:`A ${s[0]} (I = ${s[1]}) rolls without slipping at ${v} m/s and then rolls up a slope. How high does it rise?`,ans:h,unit:'m',lv:2,
    how:'½(1 + β)Mv² = Mgh',sol:[['All the kinetic energy, translational and rotational, becomes potential energy.',X`h=\frac{(1+${tn(s[2],3)})v^2}{2g}=${tn(h)}${U('m')}`]],chk:{k:'rot-up',ask,b:s[2],v}};
  const w=v/R;
  return{q:`A ${s[0]} (I = ${s[1]}, radius ${R} m) rolls without slipping up a slope; at the bottom its angular speed is ${sci(w,4)} rad/s. What is its angular speed when it has risen half of its maximum height?`,
    ans:w/Math.SQRT2,unit:'rad/s',lv:3,how:'Kinetic energy falls linearly with height, so at half height K is halved and ω drops by √2',
    sol:[['At half the maximum height half the kinetic energy is left; K ∝ ω².',X`\omega=\frac{\omega_i}{\sqrt2}=\frac{${tn(w)}}{\sqrt2}=${tn(w/Math.SQRT2)}${U('rad/s')}`]],chk:{k:'rot-up',ask,w}};
});

/* ---- Spring launch · HW13 (the recurring exam problem) ---- */
add('sl-launch','Spring launch',13,()=>{
  const inc=Math.random()<0.6, M=inc?pick([10,20,30]):pick([0.5,1,2]), ks=inc?pick([1100,1200,1300,1400]):pick([200,400,600]);
  const L0=inc?pick([5,6,7]):pick([0.3,0.4,0.5]), s=inc?pick([1,2,3]):pick([0.1,0.15,0.2]), Lc=rd(L0-s,2), th=inc?pick([48,52,56]):90, mu=inc?pick([0.1,0.2,0.3]):0;
  const v2=ks*s*s/M-2*K.g*s*(Math.sin(th*D2R)+mu*Math.cos(th*D2R)); if(v2<=1) return null;
  const v0=Math.sqrt(v2), vy=v0*Math.sin(th*D2R), ask=pick(['v','h','t']);
  const ans={v:v0,h:vy*vy/(2*K.g),t:vy/K.g}[ask], unit={v:'m/s',h:'m',t:'s'}[ask];
  const setup=inc?`A spring (k<sub>s</sub> = ${ks} N/m, relaxed length ${L0} m) lies along a ${th}° incline with μ<sub>k</sub> = ${mu}. A ${M} kg block held against it compresses it to ${Lc} m. When released, the block slides up and leaves the end of the ramp, where the spring is relaxed.`
                 :`A vertical spring (k<sub>s</sub> = ${ks} N/m, relaxed length ${L0} m) stands on the floor. A ${M} kg block held on top compresses it to ${Lc} m. When released, the block leaves the spring at its relaxed length.`;
  const askT={v:'How fast is the block moving as it leaves the spring?',h:'How high does it rise above the launch point?',t:'How long after launch does it reach its highest point?'}[ask];
  const sol=[['System block + spring + Earth (ramp outside: friction does negative work).',
              X`\tfrac12Mv_0^2=\tfrac12k_ss^2-Mgs${inc?X`\sin\theta-\mu_kMg\cos\theta\,s`:''},\qquad s=${tn(s)}\ \text{m}`],
             ['',X`v_0=${tn(v0)}${U('m/s')}`]];
  if(ask!=='v') sol.push(inc?['After launch only gravity acts; only the vertical velocity component changes.',ask==='h'?X`h=\frac{(v_0\sin\theta)^2}{2g}=${tn(ans)}${U('m')}`:X`t=\frac{v_0\sin\theta}{g}=${tn(ans)}${U('s')}`]
                            :['After launch only gravity acts.',ask==='h'?X`h=\frac{v_0^2}{2g}=${tn(ans)}${U('m')}`:X`t=\frac{v_0}{g}=${tn(ans)}${U('s')}`]);
  return{q:setup+' '+askT,ans,unit,lv:ask==='v'?2:3,fig:FIG.eLaunch({incline:inc,th,mu,find:ask==='v'?'v':''}),
    how:'½Mv₀² = ½k_s s² − Mgs sin θ − μ_k Mg cos θ s; then t = v₀ sin θ/g, h = (v₀ sin θ)²/2g',sol,chk:{k:'sl-launch',ask,M,ks,L0,L:Lc,th,mu}};
});

