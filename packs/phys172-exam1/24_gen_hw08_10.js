
/* =====================================================================
   HW08–HW10 · equilibrium, changing momentum, circular and curving motion
   ===================================================================== */

/* ---- Equilibrium ---- */
add('two-ropes','Equilibrium',8,()=>{
  const m=ri(20,120),al=ri(15,60),W=m*K.g,F2=W/Math.cos(al*D2R),F1=W*Math.tan(al*D2R);
  const base=`A ${m} kg box hangs motionless from two ropes. Rope 1 runs horizontally to a wall; rope 2 runs up `+
             `to the ceiling at ${al}° from the vertical. `;
  const fig=FIG.twoRopes(m,al);
  const how='Vertical: F₂·cos α = mg. Horizontal: F₁ = F₂·sin α = mg·tan α.';
  const sY=['The box is at rest, so the net force is zero. Only rope 2 has a vertical component, so it alone holds the weight.',
            X`F_2\cos\alpha=mg\quad\Rightarrow\quad F_2=\frac{(${m})(9.8)}{\cos ${al}^\circ}=${tn(F2)}${U('N')}`];
  if(Math.random()<0.5)return{fig,q:base+'What is the tension in rope 2?',ans:F2,unit:'N',lv:2,how,sol:[sY]};
  return{fig,q:base+'What is the tension in rope 1?',ans:F1,unit:'N',lv:2,how,
    sol:[sY,['Horizontal balance: rope 1 cancels the horizontal part of rope 2.',X`F_1=F_2\sin\alpha=(${tn(F2)})\sin ${al}^\circ=${tn(F1)}${U('N')}`]]};
});
add('pull-angle','Equilibrium',8,()=>{
  const m=ri(15,50),al=ri(15,45),mu=rf(0.2,0.6,2),v=rf(0.5,3,1);
  const F=Math.round(mu*m*K.g/(Math.cos(al*D2R)+mu*Math.sin(al*D2R)));
  const Fx=F*Math.cos(al*D2R),N=m*K.g-F*Math.sin(al*D2R);
  const base=`You pull a ${m} kg block across a level floor with a rope angled ${al}° above the horizontal. `+
             `With a ${F} N pull, the block slides at a constant ${v} m/s. `;
  const fig=FIG.pull({m,F,th:al,lab:'F'});
  const sF=['Constant velocity means the net force is zero, whatever the speed. Friction cancels the horizontal part of the pull.',
            X`f=F\cos\alpha=(${F})\cos ${al}^\circ=${tn(Fx)}${U('N')}`];
  const sN=['Vertical balance: the rope lifts part of the weight, so the floor pushes up less.',
            X`N+F\sin\alpha-mg=0\quad\Rightarrow\quad N=(${m})(9.8)-(${F})\sin ${al}^\circ=${tn(N)}${U('N')}`];
  const ask=pick(['f','N','mu']);
  if(ask==='f')return{fig,q:base+'What is the magnitude of the friction force on the block?',ans:Fx,unit:'N',lv:1,
    how:'Constant velocity means F_net = 0, so friction = F·cos α. The speed does not matter.',sol:[sF]};
  if(ask==='N')return{fig,q:base+'What is the magnitude of the normal force from the floor?',ans:N,unit:'N',lv:2,
    how:'y: N + F·sin α − mg = 0. The rope lifts part of the weight.',sol:[sN]};
  return{fig,q:base+'What is the coefficient of kinetic friction?',ans:Fx/N,unit:'',lv:3,
    how:'μk = f/N = F·cos α / (mg − F·sin α)',
    sol:[sF,sN,['Kinetic friction is μ<sub>k</sub><i>N</i>.',X`\mu_k=\frac{f}{N}=\frac{${tn(Fx)}}{${tn(N)}}=${tn(Fx/N)}`]]};
});
add('three-wires','Equilibrium',10,()=>{
  const m=ri(20,120)*10,t1=ri(30,70),t2=ri(30,70),w=P.threeWires(m,t1,t2);
  const which=pick(['left','left','right','right','vertical']);
  const q=`A ${m} kg load hangs from a knot by a vertical wire. Two more wires run from the knot to the ceiling: `+
          `the left one at ${t1}° above the horizontal and the right one at ${t2}° above the horizontal. `+
          `What is the tension in the ${which} wire?`;
  const fig=FIG.threeWires(m,t1,t2);
  const how='Vertical wire: T = mg. At the knot: T_L·cos θ₁ = T_R·cos θ₂ and T_L·sin θ₁ + T_R·sin θ₂ = mg.';
  const sB=['The vertical wire holds the load at rest.',X`T_B=mg=(${m})(9.8)=${tn(w.B)}${U('N')}`];
  if(which==='vertical')return{fig,q,ans:w.B,unit:'N',lv:1,how,sol:[sB]};
  const left=which==='left';
  return{fig,q,ans:left?w.L:w.R,unit:'N',lv:3,how,
    sol:[sB,['The knot is at rest. Horizontal balance:',X`T_L\cos ${t1}^\circ=T_R\cos ${t2}^\circ`],
         ['Vertical balance at the knot:',X`T_L\sin ${t1}^\circ+T_R\sin ${t2}^\circ=${tn(w.B)}\ \text{N}`],
         ['Substitute one equation into the other and simplify with sin(θ₁ + θ₂).',
          left?X`T_L=\frac{T_B\cos\theta_2}{\sin(\theta_1+\theta_2)}=\frac{(${tn(w.B)})\cos ${t2}^\circ}{\sin ${t1+t2}^\circ}=${tn(w.L)}${U('N')}`
              :X`T_R=\frac{T_B\cos\theta_1}{\sin(\theta_1+\theta_2)}=\frac{(${tn(w.B)})\cos ${t1}^\circ}{\sin ${t1+t2}^\circ}=${tn(w.R)}${U('N')}`]]};
});
add('helicopter','Equilibrium',8,()=>{
  const m=ri(4,30)*50,v=ri(10,40);
  const k=pick(['zero','cable','accel']);
  if(k==='accel'){const a=rf(0.5,3,1);
    return{q:`A helicopter flying level speeds up at ${a} m/s², with a ${m} kg package hanging steadily below it on a cable. `+
             `What is the magnitude of the net force on the package?`,ans:m*a,unit:'N',lv:1,
      how:'The package shares the helicopter’s acceleration: F_net = m·a.',
      sol:[['The package moves with the helicopter, so it has the same acceleration.',X`|\mathbf F_{\text{net}}|=ma=(${m})(${a})=${tn(m*a)}${U('N')}`]]};}
  const base=`A helicopter flies level to the right at a constant ${v} m/s, carrying a ${m} kg package on a cable. Ignore air resistance. `;
  if(k==='zero')return{q:base+'What is the magnitude of the net force on the package?',ans:0,zero:true,unit:'N',lv:1,
    how:'Constant velocity: dp/dt = 0, so the net force is zero.',
    sol:[['Constant speed in a straight line means the momentum is not changing. The speed itself is irrelevant.',X`\frac{d\mathbf p}{dt}=0\quad\Rightarrow\quad|\mathbf F_{\text{net}}|=0`]]};
  return{q:base+'What is the tension in the cable?',ans:m*K.g,unit:'N',lv:1,
    how:'The net force is zero, so the cable just holds up the weight: T = mg.',
    sol:[['Constant velocity means zero net force. Only the cable and gravity act, so they balance.',X`T-mg=0\quad\Rightarrow\quad T=(${m})(9.8)=${tn(m*K.g)}${U('N')}`]]};
});

/* ---- Changing momentum ---- */
add('elevator','Changing momentum',8,()=>{
  const m1=ri(10,60),m2=ri(20,100),a=rf(1,4.5,1);
  const c=pick([['moving up and speeding up',1],['moving up and slowing down',-1],
                ['moving down and speeding up',-1],['moving down and slowing down',1]]);
  const ay=c[1]*a,upper=Math.random()<0.5,M=upper?m1+m2:m2,ans=M*(K.g+ay);
  const fig=FIG.elevator(m1,m2,/^moving up/.test(c[0]));
  return{fig,q:`An elevator is ${c[0]} at ${a} m/s². A ${m1} kg block hangs from the ceiling by a rope, and a ${m2} kg `+
           `block hangs from the first block by a second rope. What is the tension in the ${upper?'upper':'lower'} rope?`,
    ans,unit:'N',lv:2,how:'Each rope supplies m(g + a_y), where a_y is the upward acceleration. The upper rope carries both blocks.',
    sol:[[`The elevator is ${c[0]}, so its acceleration points ${ay>0?'up':'down'}.`,X`a_y=${tn(ay)}${U('m/s²')}`],
         [upper?'The upper rope supports both blocks, so use their combined mass.':'The lower rope supports only the bottom block.',
          X`T-Mg=Ma_y\quad\Rightarrow\quad T=M(g+a_y)=(${M})\big(9.8+${tp(ay)}\big)=${tn(ans)}${U('N')}`]]};
});
add('push-two','Changing momentum',8,()=>{
  const m1=ri(5,25),m2=ri(2,15),mu1=rf(0.1,0.5,2),mu2=rf(0.1,0.5,2);
  const F=Math.ceil((mu1*m1+mu2*m2)*K.g*rf(1.3,2.5,2));
  const f1=mu1*m1*K.g,f2=mu2*m2*K.g,a=(F-f1-f2)/(m1+m2),F12=m2*a+f2;
  const base=`Two blocks sit side by side on the floor: block 1 (${m1} kg, μk = ${mu1}) and block 2 (${m2} kg, `+
             `μk = ${mu2}). You push block 1 with ${F} N and it pushes block 2 ahead of it. `;
  const fig=FIG.pushTwo(m1,m2,F);
  const s=[['Friction on each block.',X`f_1=\mu_1m_1g=${tn(f1)}\ \text{N},\qquad f_2=\mu_2m_2g=${tn(f2)}\ \text{N}`],
           ['Treat both blocks as one system. The contact forces between them cancel.',
            X`a=\frac{F-f_1-f_2}{m_1+m_2}=\frac{${F}-${tn(f1)}-${tn(f2)}}{${m1+m2}}=${tn(a)}${U('m/s²')}`]];
  if(Math.random()<0.6)return{fig,q:base+'What is the acceleration of the blocks?',ans:a,unit:'m/s²',lv:2,
    how:'Treat both as one system: a = (F − μ₁m₁g − μ₂m₂g)/(m₁ + m₂)',sol:s};
  return{fig,q:base+'What force does block 1 exert on block 2?',ans:F12,unit:'N',lv:3,
    how:'Block 2 alone: F₁₂ − μ₂m₂g = m₂·a',
    sol:s.concat([['Now isolate block 2: the push from block 1 must overcome its friction and accelerate it.',
      X`F_{12}-f_2=m_2a\quad\Rightarrow\quad F_{12}=(${m2})(${tn(a)})+${tn(f2)}=${tn(F12)}${U('N')}`]])};
});
add('cart','Changing momentum',8,()=>{
  const m=ri(40,160),F=ri(100,300),th=ri(10,40),Fh=F*Math.cos(th*D2R);
  const f=ri(Math.round(0.2*Fh),Math.round(0.8*Fh)),dp=Fh-f;
  const base=`You pull a ${m} kg cart across a level floor with a ${F} N force at ${th}° above the horizontal. `+
             `The x component of the floor's force on the cart is ${fm(-f)} N. `;
  const fig=FIG.pull({m,F,th,lab:'F',wheels:true});
  const s=[['The x component of the net force is the rate of change of <i>p<sub>x</sub></i>. Gravity and the normal force have no x parts.',
            X`\frac{dp_x}{dt}=F\cos\theta+F_{\text{floor},x}=(${F})\cos ${th}^\circ+(${-f})=${tn(dp)}${U('N')}`]];
  if(Math.random()<0.6)return{fig,q:base+'What is dp<sub>x</sub>/dt for the cart?',ans:dp,unit:'N',lv:1,how:'dp_x/dt = F·cos θ + F_floor,x',sol:s};
  return{fig,q:base+'What is the x component of the cart’s acceleration?',ans:dp/m,unit:'m/s²',lv:2,
    how:'a_x = (F·cos θ + F_floor,x)/m',sol:s.concat([['Divide by the mass.',X`a_x=\frac{${tn(dp)}}{${m}}=${tn(dp/m)}${U('m/s²')}`]])};
});
add('lander','Changing momentum',8,()=>{
  const m=ri(300,900),h1=ri(40,80),h2=ri(3,10),v1=rf(6,12,1),v2=rf(0.3,2,1),d=h1-h2;
  const a=(v1*v1-v2*v2)/(2*d),Fn=m*a,Ft=Fn+m*1.6;
  const base=`A ${m} kg lander descends toward the Moon (g = 1.6 N/kg) with its thruster firing steadily. At ${h1} m `+
             `above the surface it moves ${v1} m/s downward; at ${h2} m it moves ${v2} m/s downward. `;
  const s=[['Distance covered while slowing.',X`d=${h1}-${h2}=${d}${U('m')}`],
           ['With a constant force, <i>v</i><sub>f</sub>² = <i>v</i><sub>i</sub>² + 2<i>ad</i>. The lander slows, so the acceleration points up.',
            X`|a|=\frac{v_i^2-v_f^2}{2d}=\frac{(${v1})^2-(${v2})^2}{2(${d})}=${tn(a)}${U('m/s²')}`],
           ['Net force from the Momentum Principle.',X`|\mathbf F_{\text{net}}|=m|a|=(${m})(${tn(a)})=${tn(Fn)}${U('N')}`]];
  if(Math.random()<0.6)return{q:base+'What is the magnitude of the net force on the lander?',ans:Fn,unit:'N',lv:2,
    how:'Constant force: v_f² = v_i² + 2a·d over d = h₁ − h₂, then F_net = m·|a|.',sol:s};
  return{q:base+'What is the magnitude of the thruster’s force?',ans:Ft,unit:'N',lv:3,
    how:'The net force points up: F_thrust − m·g_Moon = F_net.',
    sol:s.concat([['The thruster pushes up, and Moon gravity pulls down.',X`F_{\text{thrust}}=F_{\text{net}}+mg_{\text{Moon}}=${tn(Fn)}+(${m})(1.6)=${tn(Ft)}${U('N')}`]])};
});
add('mat','Changing momentum',8,()=>{
  const W=ri(300,900),v=rf(1,3,1),d=rf(0.8,3,1),m=W/K.g,dm=d/100,a=v*v/(2*dm),Fn=m*a,ans=P.matForce(W,v,dm);
  return{q:`A barbell is dropped onto a gym mat, hitting it at ${v} m/s. The mat compresses ${d} cm as it stops the `+
           `barbell, and the Earth pulls on the barbell with ${W} N. Assuming a constant force, what is the magnitude `+
           `of the mat's force on the barbell?`,
    ans,unit:'N',lv:3,how:'m = W/g. Stopping over d: F_net = m·v²/(2d). The mat also holds the weight: F_mat = F_net + W.',
    sol:[['Mass from the weight.',X`m=\frac{W}{g}=\frac{${W}}{9.8}=${tn(m)}${U('kg')}`],
         ['Stopping from <i>v</i> to 0 over <i>d</i> (in meters) with constant force.',X`a=\frac{v^2}{2d}=\frac{(${v})^2}{2(${tn(dm,4)})}=${tn(a)}${U('m/s²')}`],
         ['Net upward force needed.',X`F_{\text{net}}=ma=(${tn(m)})(${tn(a)})=${tn(Fn)}${U('N')}`],
         ['The mat must also cancel gravity, so it pushes up with the net force plus the weight.',X`F_{\text{mat}}=F_{\text{net}}+W=${tn(Fn)}+${W}=${tn(ans)}${U('N')}`]]};
});
add('truck','Changing momentum',9,()=>{
  const m=ri(9,20)*100,v1=ri(18,32),v2=ri(2,10),t=rf(2.5,6,1),xq=Math.random()<0.6,Fx=m*(v2-v1)/t;
  const q=`A ${m} kg truck moving in the +x direction on a level road slows from ${v1} m/s to ${v2} m/s in ${t} s, `+
          `with a constant net force. What is the ${xq?'x':'y'} component of the force by the road and air on the truck?`;
  if(xq)return{q,ans:Fx,unit:'N',lv:1,how:'F_x = Δp_x/Δt = m(v_f − v_i)/Δt',
    sol:[['Only the road and air have horizontal components, so they supply the whole change in <i>p<sub>x</sub></i>.',
          X`F_x=\frac{\Delta p_x}{\Delta t}=\frac{m(v_f-v_i)}{\Delta t}=\frac{(${m})(${v2}-${v1})}{${t}}=${tn(Fx)}${U('N')}`]]};
  return{q,ans:m*K.g,unit:'N',lv:2,how:'No vertical acceleration, so the road pushes up just enough to cancel gravity: F_y = +mg.',
    sol:[['The truck has no vertical acceleration, so the y forces cancel. The road pushes up against gravity.',
          X`F_{\text{road},y}-mg=0\quad\Rightarrow\quad F_{\text{road},y}=(${m})(9.8)=${tn(m*K.g)}${U('N')}`]]};
});

/* ---- Circular motion ---- */
add('carousel','Circular motion',8,()=>{
  const m=ri(18,45),r=rf(1,7,1),T=rf(4,10,1),v=2*Math.PI*r/T,F=P.circF(m,r,T);
  const base=`A ${m} kg child sits ${r} m from the center of a merry-go-round that turns at a constant rate, once every ${T} s. `;
  if(Math.random()<0.25)return{q:base+'What is the magnitude of the parallel component of the child’s dp/dt?',
    ans:0,zero:true,unit:'N',lv:1,how:'Constant speed: d|p|/dt = 0. Only the perpendicular part, toward the center, is nonzero.',
    sol:[['A constant rate means constant speed. The parallel part of d<b>p</b>/d<i>t</i> changes the speed, so it is zero.',
          X`\left(\frac{d\mathbf p}{dt}\right)_{\parallel}=\frac{d|\mathbf p|}{dt}=0`]]};
  return{q:base+'What is the magnitude of the net force on the child?',ans:F,unit:'N',lv:2,
    how:'v = 2πr/T; F_net = m·v²/r, pointing toward the center.',
    sol:[['Speed: one circumference per period.',X`v=\frac{2\pi r}{T}=\frac{2\pi(${r})}{${T}}=${tn(v)}${U('m/s')}`],
         ['At constant speed the net force points to the center.',X`|\mathbf F_{\text{net}}|=\frac{mv^2}{r}=\frac{(${m})(${tn(v)})^2}{${r}}=${tn(F)}${U('N')}`]]};
});
add('bucket','Circular motion',8,()=>{
  const m=rf(0.8,3,1),r=rf(0.7,1.3,1),top=Math.random()<0.6;
  const v=rd(Math.sqrt(K.g*r*rf(1.3,3,2)),1),c=m*v*v/r,ans=top?c-m*K.g:c+m*K.g;
  return{q:`You swing a bucket of water (total ${m} kg) in a vertical circle of radius ${r} m. At the `+
           `${top?'top':'bottom'} of the circle its speed is ${v} m/s. What is the tension in the rope at that instant?`,
    ans,unit:'N',lv:2,
    how:top?'At the top, tension and gravity both point toward the center: T + mg = m·v²/r.':'At the bottom, tension points up and gravity down: T − mg = m·v²/r.',
    sol:[['The net force toward the center must equal <i>mv</i>²/<i>r</i>.',X`\frac{mv^2}{r}=\frac{(${m})(${v})^2}{${r}}=${tn(c)}${U('N')}`],
         top?['At the top, tension and gravity both point down, toward the center.',X`T+mg=\frac{mv^2}{r}\quad\Rightarrow\quad T=${tn(c)}-(${m})(9.8)=${tn(ans)}${U('N')}`]
            :['At the bottom, tension points up to the center and gravity points away.',X`T-mg=\frac{mv^2}{r}\quad\Rightarrow\quad T=${tn(c)}+(${m})(9.8)=${tn(ans)}${U('N')}`]]};
});
add('ferris','Circular motion',10,()=>{
  const r=rf(5,15,1),T=ri(8,25),m=ri(45,90),v=2*Math.PI*r/T,c=m*v*v/r;
  const base=`A Ferris wheel of radius ${r} m turns at a constant rate, once every ${T} s. A ${m} kg rider sits in a seat that stays level. `;
  const s=[['Speed of the rider.',X`v=\frac{2\pi r}{T}=\frac{2\pi(${r})}{${T}}=${tn(v)}${U('m/s')}`],
           ['Constant speed: d<b>p</b>/d<i>t</i> points to the center and has size <i>mv</i>²/<i>r</i>.',X`\left|\frac{d\mathbf p}{dt}\right|=\frac{mv^2}{r}=\frac{(${m})(${tn(v)})^2}{${r}}=${tn(c)}${U('N')}`]];
  const ask=pick(['dp','bottom','top']);
  if(ask==='dp')return{q:base+'At the bottom of the ride, what is the magnitude of the rate of change of the rider’s momentum?',
    ans:c,unit:'N',lv:2,how:'|dp/dt| = m·v²/r with v = 2πr/T, pointing toward the center.',sol:s};
  if(ask==='bottom')return{q:base+'What force does the seat exert on the rider at the bottom?',ans:m*K.g+c,unit:'N',lv:2,
    how:'At the bottom: N − mg = m·v²/r',
    sol:s.concat([['At the bottom the center is up: the seat pushes up and gravity pulls down.',X`N-mg=\frac{mv^2}{r}\quad\Rightarrow\quad N=(${m})(9.8)+${tn(c)}=${tn(m*K.g+c)}${U('N')}`]])};
  return{q:base+'What force does the seat exert on the rider at the top?',ans:m*K.g-c,unit:'N',lv:2,
    how:'At the top: mg − N = m·v²/r',
    sol:s.concat([['At the top the center is down: gravity points toward it and the seat pushes up, away from it.',X`mg-N=\frac{mv^2}{r}\quad\Rightarrow\quad N=(${m})(9.8)-${tn(c)}=${tn(m*K.g-c)}${U('N')}`]])};
});
add('flat-curve','Circular motion',9,()=>{
  const m=ri(9,22)*100,r=ri(40,150),mu=rf(0.2,0.8,2),ans=P.flatVmax(mu,r);
  return{q:`You drive a ${m} kg car around a flat curve of radius ${r} m. The road can push sideways on the tires with `+
           `at most ${mu} times mg. What is the fastest speed that still makes the turn?`,
    ans,unit:'m/s',lv:2,how:'μ·mg = m·v²/r, so v = √(μ·g·r). The mass cancels.',
    sol:[['The sideways road force supplies the centripetal force. At top speed it is at its maximum.',X`\mu mg=\frac{mv^2}{r}`],
         ['The mass cancels.',X`v=\sqrt{\mu g r}=\sqrt{(${mu})(9.8)(${r})}=${tn(ans)}${U('m/s')}`]]};
});
add('art-grav','Circular motion',10,()=>{
  const R=rf(15,120,1),f=pick([1,1,0.5,0.8,0.3]),ge=f*K.g,ans=P.artGravT(R,f);
  return{q:`A space station is a cylinder of radius ${R} m spinning about its axis. What rotation period makes people `+
           `standing on the inner rim feel ${f===1?'normal Earth gravity':f+' times Earth’s gravity'}?`,
    ans,unit:'s',lv:2,how:'The floor supplies m·v²/R = m·g_eff with v = 2πR/T, so T = 2π√(R/g_eff).',
    sol:[['The floor pushes inward with the centripetal force, and that push is what feels like weight.',X`\frac{v^2}{R}=g_{\text{eff}}=${tn(ge)}${U('m/s²')}`],
         ['Use <i>v</i> = 2π<i>R</i>/<i>T</i> and solve for <i>T</i>.',X`T=2\pi\sqrt{\frac{R}{g_{\text{eff}}}}=2\pi\sqrt{\frac{${R}}{${tn(ge)}}}=${tn(ans)}${U('s')}`]]};
});
add('conical','Circular motion',10,()=>{
  const L=rf(0.5,2,1),th=ri(15,60),v=P.conicalV(L,th),r=L*Math.sin(th*D2R),sp=Math.random()<0.6,Tp=2*Math.PI*r/v;
  const fig=FIG.conical(L,th);
  const s=[['Radius of the circle.',X`r=L\sin\theta=(${L})\sin ${th}^\circ=${tn(r)}${U('m')}`],
           ['The tension’s vertical part holds the weight and its horizontal part supplies the centripetal force. Divide one equation by the other.',
            X`T\cos\theta=mg,\quad T\sin\theta=\frac{mv^2}{r}\quad\Rightarrow\quad \tan\theta=\frac{v^2}{gr}`],
           ['Solve for the speed.',X`v=\sqrt{g\,r\tan\theta}=\sqrt{(9.8)(${tn(r)})\tan ${th}^\circ}=${tn(v)}${U('m/s')}`]];
  return{fig,q:`A small ball on a ${L} m string swings in a horizontal circle (a conical pendulum), with the string `+
           `${th}° from the vertical. What is the ball's ${sp?'speed':'period'}?`,
    ans:sp?v:Tp,unit:sp?'m/s':'s',lv:3,
    how:'T·cos θ = mg and T·sin θ = m·v²/r with r = L·sin θ, so v² = g·r·tan θ'+(sp?'.':'; period = 2πr/v.'),
    sol:sp?s:s.concat([['One lap is a circumference.',X`T_{\text{period}}=\frac{2\pi r}{v}=\frac{2\pi(${tn(r)})}{${tn(v)}}=${tn(Tp)}${U('s')}`]])};
});
add('swing','Circular motion',9,()=>{
  const m=ri(18,45),v=rf(3,8,1),L=rf(2,6,2),c=m*v*v/L;
  const base=`A ${m} kg child swings at the end of a ${L} m cord. At the bottom of the swing her velocity is horizontal at ${v} m/s. `;
  const sC=['At the bottom the velocity is horizontal and both forces are vertical, so d<b>p</b>/d<i>t</i> is all perpendicular, pointing up toward the pivot.',
            X`\left|\frac{d\mathbf p}{dt}\right|=\frac{mv^2}{L}=\frac{(${m})(${v})^2}{${L}}=${tn(c)}${U('N')}`];
  const ask=pick(['dp','dp','T','par']);
  if(ask==='dp')return{q:base+'What is the magnitude of the rate of change of her momentum at that instant?',ans:c,unit:'N',lv:2,
    how:'At the bottom only the perpendicular part survives: |dp/dt| = m·v²/L, toward the pivot.',sol:[sC]};
  if(ask==='T')return{q:base+'What is the tension in the cord at that instant?',ans:m*K.g+c,unit:'N',lv:2,how:'T − mg = m·v²/L',
    sol:[sC,['The cord pulls up and gravity pulls down; the difference is the net force toward the pivot.',X`T-mg=\frac{mv^2}{L}\quad\Rightarrow\quad T=(${m})(9.8)+${tn(c)}=${tn(m*K.g+c)}${U('N')}`]]};
  return{q:base+'What is the parallel component of her dp/dt (along her velocity) at that instant?',ans:0,zero:true,unit:'N',lv:1,
    how:'At the bottom, gravity and tension are both vertical, perpendicular to v, so d|p|/dt = 0.',
    sol:[['Both forces are vertical and the velocity is horizontal, so no force component lies along the velocity.',
          X`\left(\frac{d\mathbf p}{dt}\right)_{\parallel}=\frac{d|\mathbf p|}{dt}=0`]]};
});
add('plane','Circular motion',10,()=>{
  const m=ri(50,100),v=ri(150,300);
  if(Math.random()<0.4)return{q:`A ${m} kg passenger sits in an airplane flying level at a constant ${v} m/s. `+
      `What is the magnitude of the force the Earth exerts on the passenger?`,ans:m*K.g,unit:'N',lv:1,
    how:'Gravity is mg however fast the plane flies.',
    sol:[['Gravity depends on mass and <i>g</i>, not on speed. The speed is a distractor.',X`|\mathbf F_{\text{grav}}|=mg=(${m})(9.8)=${tn(m*K.g)}${U('N')}`]]};
  const R=ri(1,4)*1000,c=m*v*v/R,ans=m*K.g+c;
  return{q:`A ${m} kg passenger's plane pulls out of a dive along a vertical circle of radius ${R} m. At the bottom its `+
           `speed is ${v} m/s. What force does the seat exert on the passenger there?`,ans,unit:'N',lv:2,
    how:'At the bottom: N − mg = m·v²/R',
    sol:[['Net force toward the center (up) at the bottom of the circle.',X`\frac{mv^2}{R}=\frac{(${m})(${v})^2}{${R}}=${tn(c)}${U('N')}`],
         ['The seat pushes up and gravity pulls down.',X`N-mg=\frac{mv^2}{R}\quad\Rightarrow\quad N=(${m})(9.8)+${tn(c)}=${tn(ans)}${U('N')}`]]};
});

/* ---- Curving motion (HW09) ---- */
add('par-perp','Curving motion',9,()=>{
  let p,F,r,tries=0;
  do{
    p=[rf(-6,6,1),rf(-6,6,1),0];F=[rf(-6,6,1),rf(-6,6,1),0];
    r=P.parPerp(p,F);tries++;
  }while((Math.hypot(...p)<1||Math.hypot(...F)<1||Math.abs(r.par)<0.12*Math.hypot(...F)||r.perp<0.12*Math.hypot(...F))&&tries<80);
  const pm=Math.hypot(...p),ph=p.map(c=>c/pm),Fn=F.map(c=>c*1000),par=r.par*1000,pv=r.perpVec.map(c=>c*1000),perp=r.perp*1000;
  const base=`At one instant a car's momentum is ${vec(p[0],p[1],0)}×10<sup>4</sup> kg·m/s and the net force on it is `+
             `${vec(F[0],F[1],0)}×10<sup>3</sup> N. `;
  const s=[['Unit vector along the momentum. The ×10<sup>4</sup> cancels.',
            X`\hat{\mathbf p}=\frac{\mathbf p}{|\mathbf p|}=\frac{${tv(p[0],p[1],0)}}{${tn(pm)}}=${tv(ph[0],ph[1],0)}`],
           ['The parallel component is the dot product of <b>F</b> with p̂.',
            X`F_\parallel=\mathbf F\cdot\hat{\mathbf p}=(${tn(Fn[0])})(${tn(ph[0])})+(${tn(Fn[1])})(${tn(ph[1])})=${tn(par)}${U('N')}`]];
  if(Math.random()<0.5)return{q:base+'What is F<sub>∥</sub>, the component of the net force along p̂? It is negative if it points opposite p.',
    ans:par,unit:'N',lv:3,how:'p̂ = p/|p|; F_∥ = F·p̂. A negative value means the car is slowing.',sol:s};
  return{q:base+'What is the magnitude of F<sub>⊥</sub>, the part of the net force perpendicular to p?',ans:perp,unit:'N',lv:3,
    how:'F_⊥ = F − (F·p̂)p̂, then take its magnitude.',
    sol:s.concat([['Subtract the parallel part from <b>F</b> and take the magnitude of what remains.',
      X`\mathbf F_\perp=\mathbf F-F_\parallel\hat{\mathbf p}=${tv(pv[0],pv[1],0)}\ \text{N},\qquad |\mathbf F_\perp|=${tn(perp)}${U('N')}`]])};
});
add('curve-rate','Curving motion',9,()=>{
  const m=ri(9,20)*100,vx=ri(8,30),Fx=nz(-6,6)*500,Fy=nz(-8,8)*500;
  const base=`A ${m} kg car has velocity ${vec(vx,0,0)} m/s at an instant when the net force on it is ${vec(Fx,Fy,0)} N. `;
  if(Math.random()<0.5)return{q:base+'At what rate is its speed changing? Negative means slowing.',ans:Fx/m,unit:'m/s²',lv:2,
    how:'Only F_∥ changes the speed: d|v|/dt = F_∥/m. Here p̂ = x̂, so F_∥ = F_x.',
    sol:[['The velocity points along +x, so p̂ = x̂ and the parallel component is just <i>F<sub>x</sub></i>.',X`F_\parallel=F_x=${Fx}${U('N')}`],
         ['Only the parallel part changes the speed.',X`\frac{d|\mathbf v|}{dt}=\frac{F_\parallel}{m}=\frac{${Fx}}{${m}}=${tn(Fx/m)}${U('m/s²')}`]]};
  const R=m*vx*vx/Math.abs(Fy);
  return{q:base+'What is the radius of curvature of its path at this instant?',ans:R,unit:'m',lv:2,
    how:'F_⊥ = m·v²/R, so R = m·v²/|F_⊥|. Here F_⊥ is the y component.',
    sol:[['The perpendicular part is the y component. It bends the path.',X`|F_\perp|=|F_y|=${Math.abs(Fy)}${U('N')}`],
         ['Solve |<b>F</b><sub>⊥</sub>| = <i>mv</i>²/<i>R</i> for <i>R</i>.',X`R=\frac{mv^2}{|F_\perp|}=\frac{(${m})(${vx})^2}{${Math.abs(Fy)}}=${tn(R)}${U('m')}`]]};
});
add('track','Curving motion',9,()=>{
  const m=ri(9,20)*100,R=ri(50,300),v=ri(10,35),a=rf(0.5,3,1);
  const c=pick(['steady','up','down']);
  const txt=c==='steady'?'holding steady':c==='up'?`increasing at ${a} m/s²`:`decreasing at ${a} m/s²`;
  const base=`A ${m} kg car drives around a circular track of radius ${R} m. Right now its speed is ${v} m/s and ${txt}. `;
  if(Math.random()<0.5){
    const ans=c==='steady'?0:m*a;
    return{q:base+'What is the magnitude of the parallel component of its dp/dt?',ans,zero:c==='steady',unit:'N',lv:1,
      how:'Parallel part = m·d|v|/dt. It is zero at constant speed.',
      sol:[['The parallel part of d<b>p</b>/d<i>t</i> is what changes the speed.',
            c==='steady'?X`\left|\frac{d\mathbf p}{dt}\right|_{\parallel}=m\,\frac{d|\mathbf v|}{dt}=0`
                        :X`\left|\frac{d\mathbf p}{dt}\right|_{\parallel}=m\,\frac{d|\mathbf v|}{dt}=(${m})(${a})=${tn(ans)}${U('N')}`]]};
  }
  const ans=m*v*v/R;
  return{q:base+'What is the magnitude of the perpendicular component of its dp/dt?',ans,unit:'N',lv:2,
    how:'Perpendicular part = m·v²/R, whatever the speed is doing.',
    sol:[['The perpendicular part turns the velocity and depends only on the current speed and radius, not on whether the speed is changing.',
          X`\left|\frac{d\mathbf p}{dt}\right|_{\perp}=\frac{mv^2}{R}=\frac{(${m})(${v})^2}{${R}}=${tn(ans)}${U('N')}`]]};
});
