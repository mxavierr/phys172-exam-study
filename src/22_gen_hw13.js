add('gp-comet','Gravitational PE',13,()=>{
  const M=2e30, r1=pick([4.5,5,6,8])*1e10, v1=pick([6.5,7.5,8.2,9.1,9.2])*1e4, r2=pick([1,2,4,6])*1e12;
  const v2s=v1*v1+2*K.G*M*(1/r2-1/r1); if(v2s<=0) return null;
  return{q:`A comet's closest approach to the Sun (mass 2×10<sup>30</sup> kg) is ${sci(r1,3)} m, where its speed is ${sci(v1,3)} m/s. What is its speed when it is ${sci(r2,3)} m from the Sun?`,
    ans:Math.sqrt(v2s),unit:'m/s',lv:2,how:'System comet + Sun: ½mv₁² − GMm/r₁ = ½mv₂² − GMm/r₂; the comet\'s mass cancels',
    sol:[['System: comet + Sun, nothing outside. The comet\'s mass cancels.',X`\tfrac12v_2^2-\frac{GM}{r_2}=\tfrac12v_1^2-\frac{GM}{r_1}`],
         ['',X`v_2=\sqrt{v_1^2+2GM\left(\frac{1}{r_2}-\frac{1}{r_1}\right)}=\sqrt{(${tn(v1)})^2+2(6.67\times10^{-11})(2\times10^{30})\left(\frac{1}{${tn(r2)}}-\frac{1}{${tn(r1)}}\right)}=${tn(Math.sqrt(v2s))}${U('m/s')}`]],
    chk:{k:'gp-comet',M,r1,v1,r2}};
});
add('gp-launch','Gravitational PE',13,()=>{
  const pl=pick([[1.6e23,2.2e6],[6.4e23,3.4e6],[7.35e22,1.74e6],[6e24,6.4e6]]), M=pl[0], R=pl[1], vf=pick([0,0,500,950,1500,2000]), v=Math.sqrt(vf*vf+2*K.G*M/R);
  return{q:`An airless planet has mass ${sci(M,3)} kg and radius ${sci(R,3)} m. An object is launched straight up from the surface. `+
           (vf?`What launch speed makes its speed ${vf} m/s when it is very far from the planet?`:'What launch speed lets it just escape (speed approaching zero far away)?'),
    ans:v,unit:'m/s',lv:2,how:'½mv² − GMm/R = ½mv_far² + 0',
    sol:[['System: object + planet. Far away the potential energy is zero.',X`\tfrac12v^2-\frac{GM}{R}=\tfrac12v_{\text{far}}^2`],
         ['',X`v=\sqrt{v_{\text{far}}^2+\frac{2GM}{R}}=\sqrt{(${vf})^2+\frac{2(6.67\times10^{-11})(${tn(M,3)})}{${tn(R,3)}}}=${tn(v)}${U('m/s')}`]],
    chk:{k:'gp-launch',M,R,vf}};
});
add('gp-approach','Gravitational PE',13,()=>{
  const M=6.4e23, r1=pick([8.2,9,10,12])*1e6, r2=pick([4.5,5.4,6])*1e6, v1=pick([1800,2400,3000]), v=Math.sqrt(v1*v1+2*K.G*M*(1/r2-1/r1));
  return{q:`A spacecraft coasts toward Mars (mass 6.4×10<sup>23</sup> kg). At ${sci(r1,3)} m from the center of Mars its speed is ${v1} m/s. What is its speed at ${sci(r2,3)} m from the center?`,
    ans:v,unit:'m/s',lv:2,how:'½v₂² − GM/r₂ = ½v₁² − GM/r₁',
    sol:[['System: spacecraft + Mars.',X`v_2=\sqrt{v_1^2+2GM\left(\frac1{r_2}-\frac1{r_1}\right)}=${tn(v)}${U('m/s')}`]],chk:{k:'gp-approach',M,r1,r2,v1}};
});
add('gp-orbit','Gravitational PE',13,()=>{
  const M=6e24, m=pick([500,1500,4000,7000]), r=pick([7.2,8.83,10,15])*1e6, v=Math.sqrt(K.G*M/r), E=K.G*M*m/(2*r), askE=Math.random()<0.5;
  return{q:`A ${m} kg satellite moves in a circular orbit of radius ${sci(r,3)} m around Earth (mass 6×10<sup>24</sup> kg). `+
           (askE?'What is the minimum energy needed to move it from this orbit to a location very far from Earth?':'What is its speed?'),
    ans:askE?E:v,unit:askE?'J':'m/s',lv:askE?3:2,how:'Momentum Principle: GMm/r² = mv²/r. Energy: K + U = −GMm/2r, so it takes +GMm/2r to reach 0',
    sol:[['Gravity supplies the centripetal force.',X`\frac{GMm}{r^2}=\frac{mv^2}{r}\quad\Rightarrow\quad v=\sqrt{\frac{GM}{r}}=${tn(v)}${U('m/s')}`]]
         .concat(askE?[['Total energy in orbit, then the energy to bring it to zero (far away, at rest).',X`K+U=\tfrac12mv^2-\frac{GMm}{r}=-\frac{GMm}{2r}\quad\Rightarrow\quad E_{\min}=\frac{GMm}{2r}=${tn(E)}${U('J')}`]]:[]),
    chk:{k:'gp-orbit',ask:askE?'E':'v',M,m,r}};
});
add('gp-max','Gravitational PE',13,()=>{
  const M=7.35e22, R=1.74e6, vesc=Math.sqrt(2*K.G*M/R), v=Math.round(vesc*rf(0.5,0.85,2)/10)*10, inv=1/R-v*v/(2*K.G*M);
  if(inv<=0) return null;
  return{q:`A probe is launched straight up from the Moon (mass 7.35×10<sup>22</sup> kg, radius 1.74×10<sup>6</sup> m) at ${v} m/s. How far from the Moon's center does it get before falling back?`,
    ans:1/inv,unit:'m',lv:3,how:'½mv² − GMm/R = −GMm/r_max',
    sol:[['At the farthest point the speed is zero.',X`\tfrac12v^2-\frac{GM}{R}=-\frac{GM}{r_{\max}}\quad\Rightarrow\quad\frac{1}{r_{\max}}=\frac1R-\frac{v^2}{2GM}`],
         ['',X`r_{\max}=${tn(1/inv)}${U('m')}`]],chk:{k:'gp-max',M,R,v}};
});

/* ---- Electric PE · HW13 ---- */
add('el-pair','Electric PE',13,()=>{
  const q1=pick([1,2,-1,-2,3])*1.6e-19, q2=pick([1,-1,2])*1.6e-19, r=pick([0.1,0.2,0.5,1,2])*1e-9, Uu=K.ke*q1*q2/r, ev=Math.random()<0.5;
  const nm=q=>`${q>0?'+':'−'}${Math.abs(Math.round(q/1.6e-19))===1?'':Math.abs(Math.round(q/1.6e-19))}e`;
  return{q:`Two point charges, ${nm(q1)} and ${nm(q2)} (e = 1.6×10<sup>−19</sup> C), are ${sci(r,3)} m apart. What is the electric potential energy of the pair${ev?', in eV':''}?`,
    ans:ev?Uu/K.eV:Uu,unit:ev?'eV':'J',lv:1,how:'U = (1/4πε₀)q₁q₂/r, with signs: unlike charges give negative U',
    sol:[['Keep the signs of the charges.',X`U=\frac{1}{4\pi\varepsilon_0}\frac{q_1q_2}{r}=(9\times10^9)\frac{(${tn(q1)})(${tn(q2)})}{${tn(r)}}=${tn(Uu)}\ \text{J}`+(ev?X`=${tn(Uu/K.eV)}${U('eV')}`:'')]],
    chk:{k:'el-pair',q1,q2,r,unit:ev?'eV':'J'}};
});
add('el-release','Electric PE',13,()=>{
  const N=pick([2,3,4,4]), m=1.67e-27, e=1.6e-19, d=pick([2,5,7.7,10,20])*1e-9;
  const pairsU=N===2?K.ke*e*e/d:N===3?3*K.ke*e*e/d:4*K.ke*e*e/d+2*K.ke*e*e/(Math.SQRT2*d), v=Math.sqrt(2*pairsU/(N*m));
  const geo=N===2?`${sci(d,3)} m apart`:N===3?`at the corners of an equilateral triangle with sides ${sci(d,3)} m`:`at the corners of a square with sides ${sci(d,3)} m`;
  return{q:`${['','','Two','Three','Four'][N]} protons (mass 1.67×10<sup>−27</sup> kg, charge 1.6×10<sup>−19</sup> C) are held ${geo} and released from rest. What is the speed of each proton when they are very far apart?`,
    ans:v,unit:'m/s',lv:N===2?2:3,how:'Sum U over every pair (N(N−1)/2 of them); it all becomes kinetic energy shared equally',
    sol:[[`Count the pairs: ${N*(N-1)/2}${N===4?' (4 sides at d and 2 diagonals at √2 d)':''}.`,X`U_i=${N===2?X`\frac{ke^2}{d}`:N===3?X`3\frac{ke^2}{d}`:X`4\frac{ke^2}{d}+2\frac{ke^2}{\sqrt2\,d}`}=${tn(pairsU)}${U('J')}`],
         ['System: all the protons; far apart U = 0, and by symmetry each has the same speed.',X`${N}\left(\tfrac12mv^2\right)=U_i\quad\Rightarrow\quad v=\sqrt{\frac{2U_i}{${N}m}}=${tn(v)}${U('m/s')}`]],
    chk:{k:'el-release',N,m,e,d}};
});
add('el-closest','Electric PE',13,()=>{
  const al=Math.random()<0.4, m=al?6.64e-27:1.7e-27, qp=al?2:1, Z=pick([29,47,74,79,82]), v=pick([2,3.5,5,8])*1e5*(al?10:1), r=K.ke*qp*Z*1.6e-19*1.6e-19/(0.5*m*v*v);
  return{q:`${al?'An alpha particle (mass 6.64×10<sup>−27</sup> kg, charge +2e)':'A proton (mass 1.7×10<sup>−27</sup> kg, charge +e)'} heads straight at a heavy bare nucleus with ${Z} protons, `+
           `starting far away at ${sci(v,3)} m/s. The nucleus barely moves. How close does it get? (e = 1.6×10<sup>−19</sup> C)`,
    ans:r,unit:'m',lv:2,how:'½mv² = (1/4πε₀)(q·Ze)/r_min at the turning point',
    sol:[['All the kinetic energy becomes electric potential energy at closest approach.',X`\tfrac12mv^2=\frac{1}{4\pi\varepsilon_0}\frac{(${qp}e)(${Z}e)}{r}\quad\Rightarrow\quad r=\frac{(9\times10^9)(${qp})(${Z})(1.6\times10^{-19})^2}{\tfrac12(${tn(m,3)})(${tn(v)})^2}=${tn(r)}${U('m')}`]],
    chk:{k:'el-closest',m,qp,Z,v}};
});
add('el-move','Electric PE',13,()=>{
  const Q=pick([2,3,5,8])*1e-9, q=pick([1,2,-1,-3])*1e-9, r1=pick([0.1,0.2,0.3]), r2=pick([0.05,0.4,0.6,0.8]); if(r1===r2) return null;
  const dU=K.ke*Q*q*(1/r2-1/r1);
  return{q:`A ${q>0?'+':'−'}${Math.round(Math.abs(q)*1e9)} nC charge is moved slowly from ${r1} m to ${r2} m away from a fixed +${Math.round(Q*1e9)} nC charge. How much work do you do (equal to the change in electric potential energy)?`,
    ans:dU,unit:'J',lv:2,how:'Slow move: ΔK = 0, so W_you = ΔU = kQq(1/r₂ − 1/r₁)',
    sol:[['Moving slowly means ΔK = 0, so your work equals ΔU of the pair.',X`W=\Delta U=kQq\left(\frac1{r_2}-\frac1{r_1}\right)=(9\times10^9)(${tn(Q)})(${tn(q)})\left(\frac1{${r2}}-\frac1{${r1}}\right)=${tn(dU)}${U('J')}`]],
    chk:{k:'el-move',Q,q,r1,r2}};
});

/* ---- Energy diagrams · HW13 ---- */
add('ed-read','Energy diagrams',13,()=>{
  const E=-rd(rf(0.1,0.6,1),1), U1=-rd(rf(0.8,1.8,1),1), U2=rd(U1+rf(0.2,0.5,1),1), ask=pick(['K','K','unbind','dK']);
  if(U2>=E) return null;
  const base=`For two atoms, the potential energy curve and the total energy K + U = ${E} eV (a horizontal line) are drawn. At separation r₁ the curve is at U = ${U1} eV`;
  if(ask==='K') return{q:base+'. What is the kinetic energy at r₁?',ans:E-U1,unit:'eV',lv:1,how:'K = (K + U) − U: the vertical gap from the curve up to the line',
    sol:[['The total energy line does not change with r.',X`K=E-U=${tn(E)}-(${tn(U1)})=${tn(E-U1)}${U('eV')}`]],chk:{k:'ed-read',ask,E,U1}};
  if(ask==='unbind') return{q:base+'. What is the minimum energy you must add to break the pair apart?',ans:-E,unit:'eV',lv:1,
    how:'Unbound means K + U ≥ 0; raise the total energy to 0',sol:[['Far apart U = 0, so the total energy must reach 0.',X`E_{\min}=0-E=${tn(-E)}${U('eV')}`]],chk:{k:'ed-read',ask,E}};
  return{q:base+`, and at r₂ it is at U = ${U2} eV. What is the change in kinetic energy, ΔK, going from r₁ to r₂?`,ans:U1-U2,unit:'eV',lv:2,
    how:'K + U is constant, so ΔK = −ΔU',sol:[['Total energy is constant, so any rise in U comes out of K.',X`\Delta K=-\Delta U=-(${tn(U2)}-(${tn(U1)}))=${tn(U1-U2)}${U('eV')}`]],chk:{k:'ed-read',ask,E,U1,U2}};
});

