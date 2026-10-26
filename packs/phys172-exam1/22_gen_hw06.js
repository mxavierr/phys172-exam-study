
/* =====================================================================
   HW06 · atoms, solids, and springs
   ===================================================================== */
const MAT=[
  {n:'aluminum',M:27,rho:2.70,Y:6.2e10},  {n:'copper',M:63.5,rho:8.96,Y:1.2e11},
  {n:'iron',M:56,rho:7.87,Y:2.0e11},      {n:'lead',M:207,rho:11.4,Y:1.6e10},
  {n:'titanium',M:48,rho:4.51,Y:1.1e11},  {n:'gold',M:197,rho:19.3,Y:7.9e10},
  {n:'silver',M:108,rho:10.5,Y:8.3e10},   {n:'nickel',M:58.7,rho:8.91,Y:2.0e11},
  {n:'zinc',M:65.4,rho:7.14,Y:1.08e11},   {n:'tin',M:118.7,rho:7.31,Y:5.0e10}
];
const dOf=mt=>+P.atomDiam(mt.M,mt.rho).toPrecision(3);
/* shared solution steps */
const stepAtomMass=M=>['Mass of one atom: molar mass in kg divided by Avogadro’s number.',
  X`m_{\text{atom}}=\frac{${M}\times10^{-3}\ \text{kg}}{6.02\times10^{23}}=${tn(P.atomMass(M))}${U('kg')}`];
const stepRho=rho=>['Convert the density to SI units.',X`\rho=${rho}\ \text{g/cm}^3=${tn(rho*1000,6)}${U('kg/m³')}`];
const stepDiam=(M,rho)=>['In a simple cubic array each atom fills a cube of side <i>d</i>, so <i>d</i>³ = <i>m</i><sub>atom</sub>/ρ.',
  X`d=\left(\frac{m_{\text{atom}}}{\rho}\right)^{1/3}=\left(\frac{${tn(P.atomMass(M))}}{${tn(rho*1000,6)}}\right)^{1/3}=${tn(P.atomDiam(M,rho))}${U('m')}`];

/* ---- Atomic model ---- */
add('atom-mass','Atomic model',6,()=>{
  const mt=pick(MAT),ans=P.atomMass(mt.M);
  return{q:`One mole of ${mt.n} has a mass of ${mt.M} g. What is the mass of one ${mt.n} atom?`,
    ans,unit:'kg',lv:1,how:'m_atom = (molar mass in kg) / N_A',sol:[stepAtomMass(mt.M)]};
});
add('atom-diam','Atomic model',6,()=>{
  const mt=pick(MAT),ans=P.atomDiam(mt.M,mt.rho);
  return{q:`The density of ${mt.n} is ${mt.rho} g/cm³ and one mole has a mass of ${mt.M} g. `+
           `Treating the atoms as a simple cubic array, what is the diameter of one atom (the bond length)?`,
    ans,unit:'m',lv:2,how:'Each atom fills a cube: d³ = m_atom / ρ. Convert g/cm³ to kg/m³ (×1000) first.',
    sol:[stepAtomMass(mt.M),stepRho(mt.rho),stepDiam(mt.M,mt.rho)]};
});
add('atoms-cube','Atomic model',6,()=>{
  const mt=pick(MAT),d=dOf(mt),L=ri(2,9),Lm=L/100,per=Lm/d,N=Math.pow(per,3);
  const count=[['Atoms along one edge, with <i>L</i> in meters.',X`\frac{L}{d}=\frac{${tn(Lm,6)}}{${tn(d,3)}}=${tn(per)}`],
               ['Cube it for the whole block.',X`N=\left(\frac{L}{d}\right)^3=(${tn(per)})^3=${tn(N)}`]];
  if(Math.random()<0.5)
    return{q:`A cube of ${mt.n} is ${L} cm on each side. Its atoms sit in a simple cubic array with a `+
             `diameter of ${sci(d,3)} m. How many atoms are in the cube?`,
      ans:N,unit:'atoms',lv:2,how:'Atoms along one edge = L/d, so the total is (L/d)³. Use L in meters.',sol:count};
  const ans=N*P.atomMass(mt.M);
  return{q:`A cube of ${mt.n} is ${L} cm on each side, with atoms ${sci(d,3)} m in diameter in a simple cubic `+
           `array. One mole of ${mt.n} has a mass of ${mt.M} g. By counting atoms, what is the mass of the cube?`,
    ans,unit:'kg',lv:3,how:'mass = (L/d)³ atoms × (molar mass / N_A)',
    sol:count.concat([stepAtomMass(mt.M),['Multiply the number of atoms by the mass of each.',
      X`M=N\,m_{\text{atom}}=(${tn(N)})(${tn(P.atomMass(mt.M))})=${tn(ans)}${U('kg')}`]])};
});
add('bond-k','Atomic model',6,()=>{
  const mt=pick(MAT);
  if(Math.random()<0.5){
    const d=dOf(mt),ans=P.bondK_Y(mt.Y,d);
    return{q:`Young's modulus for ${mt.n} is ${sci(mt.Y,3)} N/m² and its atomic diameter is ${sci(d,3)} m. `+
             `Modeling neighboring atoms as joined by springs, what is the stiffness of one interatomic bond?`,
      ans,unit:'N/m',lv:1,how:'k_s,i = Y·d',
      sol:[['Young’s modulus links the microscopic spring to the macroscopic material: <i>k</i><sub>s,i</sub> = <i>Y d</i>.',
            X`k_{s,i}=Y\,d=(${tn(mt.Y,3)})(${tn(d,3)})=${tn(ans)}${U('N/m')}`]]};
  }
  const d=P.atomDiam(mt.M,mt.rho),ans=P.bondK_Y(mt.Y,d);
  return{q:`Young's modulus for ${mt.n} is ${sci(mt.Y,3)} N/m². Its density is ${mt.rho} g/cm³ and one mole has a `+
           `mass of ${mt.M} g. What is the stiffness of one interatomic bond?`,
    ans,unit:'N/m',lv:3,how:'Find d from d³ = m_atom/ρ, then k_s,i = Y·d',
    sol:[stepAtomMass(mt.M),stepRho(mt.rho),stepDiam(mt.M,mt.rho),
         ['Bond stiffness from Young’s modulus.',X`k_{s,i}=Y\,d=(${tn(mt.Y,3)})(${tn(d)})=${tn(ans)}${U('N/m')}`]]};
});
add('bond-wire','Atomic model',6,()=>{
  const mt=pick(MAT),d=dOf(mt),L=pick([1.5,2.0,2.5,2.8,3.0]),m=ri(8,40);
  const round=Math.random()<0.5,s=pick([0.8,1.0,1.2,1.4,1.6,2.0]);
  const A=round?Math.PI*Math.pow(s/2000,2):Math.pow(s/1000,2);
  const dLmm=+((m*K.g*L/(A*mt.Y))*1000).toPrecision(3),dL=dLmm/1000;
  const kw=m*K.g/dL,nc=A/(d*d),nb=L/d,ks=kw*nb/nc;
  const shape=round?`with a diameter of ${s} mm`:`with a ${s} mm × ${s} mm square cross-section`;
  const base=`A hanging ${mt.n} wire ${shape} is ${L} m long. A ${m} kg mass hung from it stretches the wire `+
             `${sci(dLmm,3)} mm. The atomic diameter of ${mt.n} is ${sci(d,3)} m. `;
  const sA=round?['Cross-sectional area, with the diameter in meters.',X`A=\pi\left(\frac{${s}\times10^{-3}}{2}\right)^2=${tn(A)}\ \text{m}^2`]
                :['Cross-sectional area, with the side in meters.',X`A=(${s}\times10^{-3})^2=${tn(A)}\ \text{m}^2`];
  const sKw=['Treat the whole wire as one spring stretched by Δ<i>L</i> (in meters).',
             X`k_{\text{wire}}=\frac{mg}{\Delta L}=\frac{(${m})(9.8)}{${tn(dL,4)}}=${tn(kw)}${U('N/m')}`];
  const sNc=['Chains side by side: one chain per <i>d</i>×<i>d</i> patch of the cross-section.',X`N_{\text{chains}}=\frac{A}{d^2}=\frac{${tn(A)}}{(${tn(d,3)})^2}=${tn(nc)}`];
  const sNb=['Bonds in series along one chain.',X`N_{\text{bonds}}=\frac{L}{d}=\frac{${L}}{${tn(d,3)}}=${tn(nb)}`];
  const ask=pick(['ks','ks','kw','chains','bonds']);
  if(ask==='kw')return{q:base+'What is the stiffness of the whole wire, treated as one spring?',
    ans:kw,unit:'N/m',lv:1,how:'k_wire = mg / ΔL',sol:[sKw]};
  if(ask==='chains')return{q:base+'How many side-by-side atomic chains run down the wire?',
    ans:nc,unit:'chains',lv:2,how:'Chains side by side = cross-section area / d²',sol:[sA,sNc]};
  if(ask==='bonds')return{q:base+'How many interatomic bonds are in one chain running the length of the wire?',
    ans:nb,unit:'bonds',lv:1,how:'Bonds along one chain = L / d',sol:[sNb]};
  return{q:base+'What is the stiffness of one interatomic bond?',
    ans:ks,unit:'N/m',lv:3,
    how:'k_wire = mg/ΔL. Chains in parallel: A/d². Bonds in series per chain: L/d. k_s,i = k_wire·(L/d)/(A/d²)',
    sol:[sKw,sA,sNc,sNb,['Chains in parallel add their stiffnesses; bonds in series divide it. Undo both.',
      X`k_{\text{wire}}=N_{\text{chains}}\,\frac{k_{s,i}}{N_{\text{bonds}}}\quad\Rightarrow\quad k_{s,i}=k_{\text{wire}}\,\frac{N_{\text{bonds}}}{N_{\text{chains}}}=(${tn(kw)})\,\frac{${tn(nb)}}{${tn(nc)}}=${tn(ks)}${U('N/m')}`]]};
});

/* ---- Stress & strain ---- */
add('stretch-scale','Stress & strain',6,()=>{
  const L1=pick([2.0,2.4,2.8,3.2]),a1=pick([1.2,1.5,1.8,2.0]),m1=ri(8,20),s1=rf(0.8,2.5,2);
  let L2=L1,m2=m1,a2=a1,tail;
  const kind=pick(['length','load','both','thick']);
  if(kind==='length'){L2=rd(L1*pick([0.1,0.25,0.5,1.5]),2);
    tail=`You cut a ${L2} m piece of the same wire and hang the same ${m1} kg mass from it.`;}
  else if(kind==='load'){do{m2=ri(5,40);}while(m2===m1);
    tail=`You hang ${m2} kg from the same wire instead.`;}
  else if(kind==='both'){L2=rd(L1*pick([0.25,0.5,1.5]),2);do{m2=ri(5,40);}while(m2===m1);
    tail=`You cut a ${L2} m piece of the same wire and hang ${m2} kg from it.`;}
  else{a2=rd(a1*2,2);
    tail=`A wire of the same metal and length, but with a ${a2} mm × ${a2} mm cross-section, holds the same ${m1} kg.`;}
  const ans=s1*(L2/L1)*(m2/m1)*Math.pow(a1/a2,2);
  return{q:`A ${L1} m wire with a ${a1} mm × ${a1} mm square cross-section stretches ${s1} mm when it supports `+
           `a ${m1} kg mass. ${tail} How much does it stretch?`,
    ans,unit:'mm',lv:2,how:'ΔL = FL/(AY), so stretch scales with load × length ÷ cross-section area',
    sol:[['For one material, Δ<i>L</i> = <i>FL</i>/(<i>AY</i>), so the stretch is proportional to load × length ÷ area.',
          X`\frac{\Delta L_2}{\Delta L_1}=\frac{m_2}{m_1}\cdot\frac{L_2}{L_1}\cdot\frac{A_1}{A_2}`],
         ['Plug in the changes. The area goes as the side squared.',
          X`\Delta L_2=${s1}\cdot\frac{${m2}}{${m1}}\cdot\frac{${L2}}{${L1}}\cdot\left(\frac{${a1}}{${a2}}\right)^2=${tn(ans)}${U('mm')}`]]};
});
add('strain-stress','Stress & strain',6,()=>{
  const L=pick([1.2,1.5,1.8,2.0,2.4]),dL=pick([0.005,0.008,0.01,0.012,0.015,0.02,0.03]);
  const w=pick([1.5,2,2.5,3]),m=ri(2,12),A=Math.pow(w/1000,2),Lf=rd(L+dL,3);
  const strain=(Lf-L)/L,F=m*K.g,stress=F/A,Y=stress/strain;
  const base=`You hang a ${m} kg mass from a rod that is ${L} m long with a ${w} mm × ${w} mm cross-section. `+
             `The rod's length increases to ${Lf} m. `;
  const sStrain=['Strain is the fractional change in length. It has no units.',X`\text{strain}=\frac{\Delta L}{L}=\frac{${Lf}-${L}}{${L}}=${tn(strain)}`];
  const sStress=['Stress is force per area. Convert the side to meters first.',
    X`A=(${w}\times10^{-3})^2=${tn(A)}\ \text{m}^2,\qquad \text{stress}=\frac{mg}{A}=\frac{(${m})(9.8)}{${tn(A)}}=${tn(stress)}${U('N/m²')}`];
  const ask=pick(['strain','stress','Y']);
  if(ask==='strain')return{q:base+'What is the strain?',ans:strain,unit:'',lv:1,how:'strain = ΔL / L (no units)',sol:[sStrain]};
  if(ask==='stress')return{q:base+'What is the stress?',ans:stress,unit:'N/m²',lv:2,how:'stress = F/A = mg/A, with A in m²',sol:[sStress]};
  return{q:base+"What is Young's modulus for this material?",ans:Y,unit:'N/m²',lv:2,
    how:'Y = stress / strain = (mg/A) / (ΔL/L)',
    sol:[sStrain,sStress,['Young’s modulus is stress divided by strain.',X`Y=\frac{\text{stress}}{\text{strain}}=\frac{${tn(stress)}}{${tn(strain)}}=${tn(Y)}${U('N/m²')}`]]};
});
add('young-wire','Stress & strain',6,()=>{
  const mt=pick(MAT),D=pick([0.04,0.05,0.06,0.08,0.10]),L=pick([1.8,2.0,2.4,3.0]),m=ri(10,70);
  const A=Math.PI*Math.pow(D/200,2);
  const dLcm=+((m*K.g*L/(A*mt.Y))*100).toPrecision(3),strain=(dLcm/100)/L,stress=m*K.g/A,ans=stress/strain;
  return{q:`A hanging wire made of a ${mt.n} alloy has a diameter of ${D} cm and is ${L} m long. Hanging a `+
           `${m} kg mass from it stretches it ${sci(dLcm,3)} cm. What is Young's modulus for this alloy?`,
    ans,unit:'N/m²',lv:2,how:'Y = (F/A) / (ΔL/L) with A = π(D/2)², all in SI units',
    sol:[['Area, with the diameter in meters.',X`A=\pi\left(\frac{${D}\times10^{-2}}{2}\right)^2=${tn(A)}\ \text{m}^2`],
         ['Stress.',X`\text{stress}=\frac{mg}{A}=\frac{(${m})(9.8)}{${tn(A)}}=${tn(stress)}${U('N/m²')}`],
         ['Strain, with the stretch in meters.',X`\text{strain}=\frac{\Delta L}{L}=\frac{${tn(dLcm/100,4)}}{${L}}=${tn(strain)}`],
         ['Young’s modulus.',X`Y=\frac{\text{stress}}{\text{strain}}=${tn(ans)}${U('N/m²')}`]]};
});
add('cyl-compress','Stress & strain',6,()=>{
  const r=pick([0.2,0.3,0.4,0.5]),h=pick([1.0,1.5,2.0,2.5]),Y=pick([7.0e10,1.1e11,1.75e11,2.0e11]),M=ri(20,90)*100;
  const F=M*K.g,A=Math.PI*r*r,ans=F*h/(A*Y);
  return{q:`A vertical metal cylinder of radius ${r} m is ${h} m tall; Young's modulus for the metal is `+
           `${sci(Y,3)} N/m². A second cylinder of the same radius and mass ${M} kg is set on top. `+
           `By how much does the bottom cylinder's height decrease?`,
    ans,unit:'m',lv:2,how:'ΔL = FL/(AY) with F = Mg and A = πr²',
    sol:[['The top cylinder’s weight is the compressing force.',X`F=Mg=(${M})(9.8)=${tn(F)}${U('N')}`],
         ['Cross-sectional area.',X`A=\pi r^2=\pi(${r})^2=${tn(A)}\ \text{m}^2`],
         ['Rearrange <i>Y</i> = (<i>F</i>/<i>A</i>)/(Δ<i>L</i>/<i>L</i>).',
          X`\Delta L=\frac{FL}{AY}=\frac{(${tn(F)})(${h})}{(${tn(A)})(${tn(Y,3)})}=${tn(ans)}${U('m')}`]]};
});

/* ---- Spring networks ---- */
add('lattice','Spring networks',6,()=>{
  const N=pick([4,5,6,8,10,12]),n=pick([2,3,4]),k=pick([12,15,18,20,24,30,36,48]);
  const m=pick([0.3,0.4,0.5,0.6,0.8,1.0,1.2]),h0=pick([0.10,0.12,0.15,0.20]);
  const kc=k/n,kt=P.kNet(k,n,N),s=m*K.g/kt;
  const base=`An apparatus has ${N} parallel chains of springs between two light rods. Each chain is ${n} `+
             `identical springs in series, each ${k} N/m. Relaxed, it is ${h0} m tall. You hang a ${m} kg mass `+
             `from the bottom rod and let it come to rest. `;
  const how='Series: one chain is k/n. Parallel: chains add, so k_total = N·k/n. Total stretch = mg/k_total, shared equally by the n springs in a chain.';
  const sC=['Springs in series all carry the same force and their stretches add, so a chain is <i>n</i> times softer.',X`k_{\text{chain}}=\frac{k}{n}=\frac{${k}}{${n}}=${tn(kc)}${U('N/m')}`];
  const sT=['Chains side by side share the load, so their stiffnesses add.',X`k_{\text{tot}}=N\,k_{\text{chain}}=${N}\,(${tn(kc)})=${tn(kt)}${U('N/m')}`];
  const sS=['At rest the springs hold the weight.',X`\Delta h=\frac{mg}{k_{\text{tot}}}=\frac{(${m})(9.8)}{${tn(kt)}}=${tn(s)}${U('m')}`];
  const ask=pick(['chain','total','height','each']);
  if(ask==='chain')return{q:base+'What is the stiffness of one chain?',ans:kc,unit:'N/m',lv:1,how,sol:[sC]};
  if(ask==='total')return{q:base+'What is the stiffness of the whole apparatus, treated as one spring?',ans:kt,unit:'N/m',lv:2,how,sol:[sC,sT]};
  if(ask==='height')return{q:base+'How tall is the apparatus now?',ans:h0+s,unit:'m',lv:2,how,
    sol:[sC,sT,sS,['Add the stretch to the relaxed height.',X`h=${h0}+${tn(s)}=${tn(h0+s)}${U('m')}`]]};
  return{q:base+'How much does each individual spring stretch?',ans:s/n,unit:'m',lv:3,how,
    sol:[sC,sT,sS,['Every chain stretches by Δ<i>h</i>, split equally among its <i>n</i> springs.',X`s_1=\frac{\Delta h}{n}=\frac{${tn(s)}}{${n}}=${tn(s/n)}${U('m')}`]]};
});
add('hand-support','Spring networks',6,()=>{
  const N=pick([4,6,8,10]),n=pick([2,3]),k=pick([24,30,36,48,60]),m=pick([3,4,5,6,8]),d0=pick([0.10,0.12,0.15]);
  const kt=P.kNet(k,n,N),eq=m*K.g/kt;
  const d=rd(d0+eq*rf(0.25,0.75,2),3),Fs=kt*(d-d0),ans=m*K.g-Fs;
  const fig=FIG.hanger(N,n,m,d);
  return{fig,q:`An apparatus of ${N} parallel chains, each ${n} springs of ${k} N/m in series, hangs from the ceiling `+
           `with a ${m} kg mass on its bottom rod. Relaxed, it is ${d0} m tall. You hold the bottom so everything `+
           `is at rest with the apparatus ${d} m tall. What is the magnitude of the force from your hand?`,
    ans,unit:'N',lv:3,how:'The springs pull up with k_total·(d − d₀); your hand supplies the rest of mg.',
    sol:[['Stiffness of the apparatus: series inside each chain, parallel across chains.',X`k_{\text{tot}}=N\,\frac{k}{n}=${N}\cdot\frac{${k}}{${n}}=${tn(kt)}${U('N/m')}`],
         ['The springs are stretched by <i>d</i> − <i>d</i><sub>0</sub> and pull up.',X`F_{\text{springs}}=k_{\text{tot}}(d-d_0)=(${tn(kt)})(${d}-${d0})=${tn(Fs)}${U('N')}`],
         ['At rest the net force is zero, so your hand pushes up with whatever the springs don’t supply.',
          X`F_{\text{hand}}=mg-F_{\text{springs}}=(${m})(9.8)-${tn(Fs)}=${tn(ans)}${U('N')}`]]};
});
