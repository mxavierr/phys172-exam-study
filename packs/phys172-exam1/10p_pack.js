/* ==== 10p · Exam 1 pack: constants and course labels =====================
   Loaded right after src/10_core.js. Everything here is specific to PHYS 172 Exam 1
   (HW01–HW10); the engine (src/) reads these names.
   ======================================================================== */
/* physics constants: the sprint uses these values and the constants band (pack.json) shows them */
const K={g:9.8, G:6.674e-11, ke:8.99e9, e:1.602e-19, c:3e8, NA:6.02e23, rhoW:1000, rhoAir:1.2};
const AX=['x','y','z'];
/* numbers that count as "given" in a worked solution even if the question does not state them */
const CONST_TEX=['9.8','10','1000','1.2','6.674\\times10^{-11}','8.99\\times10^{9}','8.99\\times10^9','1.602\\times10^{-19}','3\\times10^{8}','3\\times10^8','6.02\\times10^{23}'];
/* the Exam 1 "what you should be able to do" list leaves these out */
const EXAM_OUT=['Atomic model','Relativistic p','Curving motion'];
/* sprint topic groups on the start screen (TOPIC_HW is filled by src/40_sprint.js) */
const GROUPS=[
  {key:'a',name:'HW01–HW05',desc:'vectors, momentum, forces, gravity, conservation',test:t=>TOPIC_HW[t][0]<=5},
  {key:'b',name:'HW06–HW10',desc:'solids, friction, oscillations, equilibrium, circular motion',test:t=>TOPIC_HW[t][0]>=6}
];

/* ============ physics used by the generators (pure functions) ============ */
const P={
  atomMass:(Mg)=>Mg/1000/K.NA,
  atomDiam:(Mg,rho)=>Math.cbrt((Mg/1000/K.NA)/(rho*1000)),          /* rho in g/cm³ */
  atomsInCube:(L,d)=>Math.pow(L/d,3),
  bondK_Y:(Y,d)=>Y*d,
  bondK_wire:(m,L,dL,A,d)=>(m*K.g/dL)*(L/d)/(A/(d*d)),
  youngs:(F,A,dL,L)=>(F/A)/(dL/L),
  compress:(F,L,A,Y)=>F*L/(A*Y),
  kNet:(k,n,N)=>N*k/n,
  muStop:(v0,t)=>v0/(K.g*t),
  friction:(m,F,th,mus,muk)=>{
    const N=m*K.g+F*Math.sin(th*D2R), Fh=F*Math.cos(th*D2R);
    return {N, Fh, max:mus*N, slides:Fh>mus*N, f:Fh>mus*N?muk*N:Fh};
  },
  omega:(k,m)=>Math.sqrt(k/m),
  period:(k,m)=>2*Math.PI*Math.sqrt(m/k),
  xOfT:(A,k,m,t)=>A*Math.cos(Math.sqrt(k/m)*t),
  tFirst:(A,x,k,m)=>Math.acos(x/A)/Math.sqrt(k/m),
  airBuoy:(mass,rho)=>K.rhoAir*(mass/(rho*1000))*K.g,                 /* rho in g/cm³ */
  threeWires:(m,t1,t2)=>{
    const W=m*K.g, s=Math.sin((t1+t2)*D2R);
    return {L:W*Math.cos(t2*D2R)/s, R:W*Math.cos(t1*D2R)/s, B:W};
  },
  landerNet:(m,vi,vf,d)=>m*Math.abs(vf*vf-vi*vi)/(2*d),
  matForce:(W,v,d)=>W+(W/K.g)*v*v/(2*d),
  circF:(m,r,T)=>m*4*Math.PI*Math.PI*r/(T*T),
  conicalV:(L,th)=>Math.sqrt(K.g*L*Math.sin(th*D2R)*Math.tan(th*D2R)),
  artGravT:(R,f)=>2*Math.PI*Math.sqrt(R/(f*K.g)),
  flatVmax:(mu,r)=>Math.sqrt(mu*K.g*r),
  parPerp:(p,F)=>{
    const pm=Math.hypot(...p), ph=p.map(c=>c/pm);
    const par=F[0]*ph[0]+F[1]*ph[1]+F[2]*ph[2];
    const perpVec=F.map((c,i)=>c-par*ph[i]);
    return {par, parVec:ph.map(c=>c*par), perpVec, perp:Math.hypot(...perpVec)};
  }
};
