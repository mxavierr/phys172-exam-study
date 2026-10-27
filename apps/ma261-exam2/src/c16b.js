
/* =====================================================================
   16.4 TRIPLE INTEGRALS · 16.5 CYLINDRICAL & SPHERICAL · 16.6 MASS
   ===================================================================== */
const F3='1 + x + 2*y + 3*z^2';                         /* test integrand for "same region?" checks */
const vT=v=>v==='th'?'\\theta':v==='ph'?'\\varphi':v==='rho'?'\\rho':v;
/* (c0 − Σ cᵢvᵢ)/den, simplified to an integer form when den divides everything: linD(8,[[4,'x']],2) → "4 - 2x" */
function linD(c0,cs,den){
  const all=[c0,...cs.map(c=>c[0])], g=all.every(x=>x%den===0);
  const K=g?sumS([String(c0/den),...cs.map(([c,v])=>mono(-c/den,{[v]:1}))]):`(${sumS([String(c0),...cs.map(([c,v])=>mono(-c,{[v]:1}))])})/${den}`;
  return K;
}
/* a triple iterated integral from limit triples [[v,lo,hi] outer → inner] (lo/hi are key strings) */
const I3=(L,f)=>`\\(\\displaystyle${L.map(([,a,b])=>`\\int_{${T(a)}}^{${T(b)}}`).join('\\!')}${f}\\,${L.slice().reverse().map(([v])=>'d'+vT(v)).join('\\,')}\\)`;
const S3=(L,f)=>CI(f||F3,L.slice().reverse().map(([v,a,b])=>[v,a,b]));

/* ---------- 16.4: a solid under a plane in the first octant (F2023-Q8, S2024-Q6, S2019-Q5, F2022-Q5) ---------- */
const PLANES=[[4,2,1,8],[3,2,6,12],[1,2,3,6],[6,3,2,6],[2,1,4,4],[3,1,1,3],[1,1,2,4],[2,3,6,6],[1,2,1,2]];
function P_triPlane(){
  const [A,B,Cc,d]=pick(PLANES), K={x:A,y:B,z:Cc}, ord=shuf(['x','y','z']), [v1,v2,v3]=ord;
  const hi1=String(d/K[v1]), hi2=linD(d,[[K[v1],v1]],K[v2]), hi3=linD(d,[[K[v1],v1],[K[v2],v2]],K[v3]);
  const plane=`${A===1?'':A}x+${B===1?'':B}y+${Cc===1?'':Cc}z=${d}`;
  const L=(h1,h2,h3)=>[[v1,'0',h1],[v2,'0',h2],[v3,'0',h3]];
  const style=pick(['full','full','ab']);
  const wrong=[
    [L(hi1,linD(d,[[K[v1],v1]],K[v3]),hi3),`The middle limit comes from setting ${v3} = 0 in the plane: divide by the coefficient of ${v2}, not of ${v3}.`],
    [L(hi1,String(d/K[v2]),hi3),`The middle upper limit depends on ${v1}: the ${v1}${v2}-shadow is a triangle, not a rectangle.`],
    [L(K[v1]===1?String(d/K[v2]):String(d),hi2,hi3),K[v1]===1?`The outer limit is the ${v1}-intercept ${d}.`:`Forgot to divide by ${K[v1]}: the ${v1}-intercept is ${d/K[v1]}.`],
    [L(hi1,hi2,K[v3]===1?linD(d,[[K[v1],v1],[-K[v2],v2]],1):`${d} - ${K[v1]}${v1} - ${K[v2]}${v2}`.replace(/ 1([xyz])/g,' $1')),K[v3]===1?'Sign error in the top surface.':`Solved the plane for ${v3} without dividing by ${K[v3]}.`],
    [L(hi1,linD(d,[[K[v2],v1]],K[v2]),hi3),`Used the coefficient of ${v2} on ${v1} in the middle limit.`],
    [L(String(d/K[v2]),linD(d,[[K[v2],v1]],K[v1]),hi3),`Swapped the roles of ${v1} and ${v2} in the outer two limits.`]];
  const q0=style==='full'?`Which iterated integral equals \\(\\displaystyle\\iiint_E f\\,dV\\), where \\(E\\) is the solid in the first octant below the plane \\(${plane}\\)?`
    :`Let \\(E\\) be the solid in the first octant below the plane \\(${plane}\\). Then \\(\\displaystyle\\iiint_E f\\,dV=\\int_0^{a}\\!\\int_0^{b}\\!\\int_0^{c}f\\,d${v3}\\,d${v2}\\,d${v1}\\) with`;
  const H=Lm=>style==='full'?I3(Lm,'f'):`\\(a=${T(Lm[0][2])},\\ \\ b=${T(Lm[1][2])}\\)`;
  const opts=[OK(H(L(hi1,hi2,hi3)),S3(L(hi1,hi2,hi3)))].concat(wrong.map(([Lm,w])=>NO(H(Lm),w,S3(style==='full'?Lm:[Lm[0],Lm[1],[v3,'0',hi3]]))));
  return choiceQ(q0,opts,`Solve the plane for the innermost variable, set it to 0 to get the shadow line for the middle limit, and set both inner variables to 0 for the outer intercept.`,
    [[`Innermost: solve the plane for \\(${v3}\\).`,`0\\le ${v3}\\le ${T(hi3)}`],[`Shadow in the \\(${v1}${v2}\\)-plane (\\(${v3}=0\\)).`,`0\\le ${v2}\\le ${T(hi2)},\\qquad 0\\le ${v1}\\le ${T(hi1)}`]],
    S3(L(hi1,hi2,hi3)),2);
}
/* ---------- 16.4: change the order (S2025-Q6, F2018-Q7, S2018-Q5, 16.4 #30–37) ---------- */
/* region: 0 ≤ x ≤ y ≤ a, k·y ≤ z ≤ k·a; every order with its correct limits and the slips students make */
function triOrders(a,k){
  const Ka=String(k*a), A=String(a), ky=`${k}*y`, kx=`${k}*x`, zk=`z/${k}`;
  return {
    'zyx':{ok:[['x','0',A],['y','x',A],['z',ky,Ka]],bad:[[[['x','0',A],['y','0','x'],['z',ky,Ka]],'Below the line y = x instead of above it.'],[[['x','0',A],['y','x',A],['z','0',ky]],'z runs from the plane z = '+k+'y UP to '+Ka+'.']]},
    'xzy':{ok:[['y','0',A],['z',ky,Ka],['x','0','y']],bad:[[[['y','0',A],['z',ky,Ka],['x','y',A]],'x is between 0 and y (x ≤ y), not between y and '+a+'.'],[[['y','0',A],['z','0',Ka],['x','0','y']],'z starts at the plane z = '+k+'y, not at 0.'],
      [[['y','0',Ka],['z',ky,Ka],['x','0','y']],'y only goes up to '+a+'.'],[[['y','0',A],['z',ky,Ka],['x','0',zk]],'With y fixed, x is cut off by x = y, not by z.'],[[['y','x',A],['z',ky,Ka],['x','0',A]],'The outer limits must be numbers; x cannot appear there.']]},
    'yzx':{ok:[['x','0',A],['z',kx,Ka],['y','x',zk]],bad:[[[['x','0',A],['z',ky,Ka],['y','x',A]],'With x outermost, z’s limits can only involve x.'],[[['x','0',A],['z','0',Ka],['y','x',zk]],'For fixed x, z starts at '+k+'x (the region needs z ≥ '+k+'y ≥ '+k+'x).'],
      [[['x','0',A],['z',kx,Ka],['y','0',zk]],'y starts at x, not 0.'],[[['x','0',A],['z',kx,Ka],['y',zk,A]],'The upper limit of y comes from z ≥ '+k+'y: y ≤ z/'+k+'.'],[[['x','0',Ka],['z',kx,Ka],['y','x',zk]],'x only goes up to '+a+'.']]},
    'xyz':{ok:[['z','0',Ka],['y','0',zk],['x','0','y']],bad:[[[['z','0',Ka],['y','0',A],['x','0','y']],'For fixed z, y is cut off at z/'+k+' (from z ≥ '+k+'y).'],[[['z','0',Ka],['y',zk,A],['x','0','y']],'y is below z/'+k+', not above it.'],
      [[['z','0',A],['y','0',zk],['x','0','y']],'z runs up to '+Ka+'.'],[[['z','0',Ka],['y','0',zk],['x','y',A]],'x ≤ y, so x runs from 0 to y.'],[[['z','0',Ka],['y','0',zk],['x','0',zk]],'x is cut off by x = y, not by z/'+k+'.']]},
    'yxz':{ok:[['z','0',Ka],['x','0',zk],['y','x',zk]],bad:[[[['z','0',Ka],['x','0',A],['y','x',zk]],'For fixed z, x ≤ y ≤ z/'+k+' forces x ≤ z/'+k+'.'],[[['z','0',Ka],['x','0',zk],['y','0','x']],'y is above x, not below.'],
      [[['z','0',Ka],['x','0',zk],['y','x',A]],'y is cut off at z/'+k+'.'],[[['z','0',Ka],['x',zk,A],['y','x',zk]],'x runs from 0 up to z/'+k+'.'],[[['z','0',A],['x','0',zk],['y','x',zk]],'z runs up to '+Ka+'.']]},
    'zxy':{ok:[['y','0',A],['x','0','y'],['z',ky,Ka]],bad:[[[['y','0',A],['x','y',A],['z',ky,Ka]],'x ≤ y, so x runs from 0 to y.'],[[['y','0',A],['x','0','y'],['z','0',ky]],'z runs from '+k+'y up to '+Ka+'.'],
      [[['y','0',A],['x','0',A],['z',ky,Ka]],'x is cut off by x = y.'],[[['y','0',Ka],['x','0','y'],['z',ky,Ka]],'y only goes up to '+a+'.'],[[['y','x',A],['x','0',A],['z',ky,Ka]],'The outer limits must be numbers.']]}
  };
}
const ORDN={zyx:'dz\\,dy\\,dx',xzy:'dx\\,dz\\,dy',yzx:'dy\\,dz\\,dx',xyz:'dx\\,dy\\,dz',yxz:'dy\\,dx\\,dz',zxy:'dz\\,dx\\,dy'};
function P_triReorder(){
  const a=pick([1,2]), k=pick([2,3]), O=triOrders(a,k), tgt=pick(['xzy','yzx','xyz','yxz','zxy']);
  const given=I3(O.zyx.ok,'f(x,y,z)'), ref=S3(O.zyx.ok);
  const opts=[OK(I3(O[tgt].ok,'f'),S3(O[tgt].ok))].concat(O[tgt].bad.map(([Lm,w])=>NO(I3(Lm,'f'),w,S3(Lm))));
  return choiceQ(`Rewrite ${given} in the order \\(${ORDN[tgt]}\\).`,opts,
    `Describe the solid first: 0 ≤ x ≤ y ≤ ${a} and ${k}y ≤ z ≤ ${k*a}. Then read the limits in the new order: the outer variable gets numbers, the middle one may use the outer one, the inner one may use both.`,
    [[`The solid: \\(0\\le x\\le y\\le ${a}\\), \\(${k}y\\le z\\le ${k*a}\\).`,`${I3(O[tgt].ok,'f').slice(2,-2)}`]],ref,3);
}
/* ---------- 16.4: five integrals over the same solid, one over a different one (S2022-Q3) ---------- */
function P_triWhich(){
  const a=1, k=pick([2,3]), O=triOrders(a,k), keys=shuf(Object.keys(O)), bad=keys[0];
  const [Lb,why]=pick(O[bad].bad), ref=S3(O.zyx.ok);
  const opts=[OK(I3(Lb,'f'),S3(Lb))].concat(keys.slice(1).map(o=>NO(I3(O[o].ok,'f'),'This one is correct: it describes 0 ≤ x ≤ y ≤ 1, '+k+'y ≤ z ≤ '+k+' in the order '+ORDN[o].replace(/\\,/g,' ')+'.',S3(O[o].ok))));
  const o=choiceQ(`Five of these six integrals are over the same solid \\(E=\\{0\\le x\\le y\\le 1,\\ ${k}y\\le z\\le ${k}\\}\\). Which one is over a different region?`,opts,
    'Check each one by reading its limits back as inequalities: outer variable first, then middle, then inner.',[['The odd one out: '+why,'']],ref,3);
  o.chk.op='pickdiff'; return o;
}
/* ---------- 16.4: evaluate an iterated integral (F2024-Q5, 16.4 #7–14) ---------- */
function P_triEval(){
  const A=pick([1,2]), c=A+pick([1,2,3]), g=pick(['exp','2x','cos']);
  const B=g==='cos'?'pi/2':String(pick([1,2])), BT=g==='cos'?'\\frac{\\pi}{2}':B;
  const G=g==='exp'?`(e^${B} - 1)`:g==='2x'?String(Math.pow(+B,2)):'1', Gbad=g==='exp'?`e^${B}`:g==='2x'?String(2*B):'0';
  const Y=Rr(2*c*A-A*A,2), ans=g==='2x'?Rs(Rmul([+G,1],Y)):`${Rs(Y)}*${G}`;
  const gT=g==='exp'?'e^{x}':g==='2x'?'2x':'\\cos x', gK=g==='exp'?'e^x':g==='2x'?'2*x':'cos(x)';
  const M=(r,gg)=>g==='2x'?Rs(Rmul([+(gg||G),1],r)):`${Rs(r)}*${gg||G}`;
  const dis=[D_(M([c*A,1]),'Integrated (c − y) as if it were just c.'),D_(M([c*A-A*A,1]),'Forgot the ½ in ∫y dy.'),D_(M(Y,Gbad),g==='exp'?'Dropped e⁰ = 1 at the lower limit.':g==='2x'?'Did not raise the power: ∫2x dx = x².':'Used −sin instead of sin.'),
    D_(M([(c-A)*A,1]),'Replaced c − y by its value at y = '+A+'.'),D_(Rs(Rmul(Y,[g==='cos'?1:+B,1]))+(g==='cos'?'*pi/2':''),'Integrated dx as if the integrand were 1.'),D_(M([c*A+A*A,2]),'Sign slip: ∫(c − y)dy = cy − y²/2.'),D_(M([c,1]),'Integrated dy as if the interval had length 1.'),D_(M([2*c*A-A*A,1]),'Doubled: ∫(c − y)dy = cA − A²/2, not 2cA − A².')];
  return valQ(`Evaluate \\(\\displaystyle\\int_0^{${A}}\\!\\int_0^{${BT}}\\!\\int_0^{${c}-y}${gT}\\,dz\\,dx\\,dy\\).`,ans,dis,
    'Work inside out. The z-integral of a function of x alone just multiplies it by the length (c − y); the x-integral then treats (c − y) as a constant.',
    [['',`\\int_0^{${c}-y}${gT}\\,dz=(${c}-y)${gT}`],['',`\\int_0^{${BT}}(${c}-y)${gT}\\,dx=(${c}-y)\\cdot ${T(G)}`],['',`\\int_0^{${A}}(${c}-y)\\,dy\\cdot ${T(G)}=${T(ans)}`]],
    CI(gK,[['z','0',`${c} - y`],['x','0',B],['y','0',String(A)]]),2);
}
/* ---------- 16.4: volumes bounded by cylinders and planes (16.4 #15–29, #57–62) ---------- */
function P_triVol(){
  if(coin(0.55)){
    const h=pick([1,4,9]), r=[1,4,9].indexOf(h), H5=[1,32,243][r], H3=[1,8,27][r];
    const ans=Rs(Rr(8*H5,15));
    const dis=[D_(Rs(Rr(4*H5,15)),'Integrated x from 0 to √h only; the parabola y = x² gives −√h ≤ x ≤ √h.'),D_(Rs(Rr(16*H5,15)),'Doubled twice.'),
      D_(Rs(Rr(4*H3,3)),'That is the area of the base region (between y = x² and y = h), not the volume.'),D_(Rs(Rr(8*h*h,15)),'Wrong power of h.'),D_(Rs(Rr(4*H5,3)),'Used height h everywhere instead of h − y.'),D_(Rs(Rr(8*H5,5)),'Integrated (h − y) to (h − y)²/2 but forgot the ½… then lost another factor.')];
    return valQ(`Find the volume of the solid bounded by the parabolic cylinder \\(y=x^2\\) and the planes \\(z=0\\) and \\(y+z=${h}\\).`,ans,dis,
      'The shadow in the xy-plane is x² ≤ y ≤ h; above each point the solid runs from z = 0 to z = h − y.',
      [['',`V=\\int_{-${h===1?1:Math.sqrt(h)}}^{${h===1?1:Math.sqrt(h)}}\\!\\int_{x^2}^{${h}}\\!\\int_0^{${h}-y}dz\\,dy\\,dx=\\int\\frac{(${h}-x^2)^2}{2}\\,dx=${T(ans)}`]],
      CI('1',[['z','0',`${h} - y`],['y','x^2',String(h)],['x',String(-Math.sqrt(h)),String(Math.sqrt(h))]]),2);
  }
  const c=pick([1,4,9]), b=pick([1,2,3]), C3=[1,8,27][[1,4,9].indexOf(c)], sc=Math.sqrt(c);
  const ans=Rs(Rr(4*C3*b,3));
  const dis=[D_(Rs(Rr(2*C3*b,3)),'Integrated x from 0 to √c only; the trough is symmetric about x = 0.'),D_(Rs(Rr(4*C3,3)),'Forgot the length '+b+' in the y-direction.'),
    D_(String(2*sc*c*b),'Used the rectangle 2√c by c instead of the parabolic cross-section.'),D_(Rs(Rr(4*c*c*b,3)),'Wrong power of c.'),D_(Rs(Rr(8*C3*b,3)),'Doubled the symmetric half twice.')];
  return valQ(`Find the volume of the solid bounded by \\(z=${c}-x^2\\), \\(z=0\\), \\(y=0\\) and \\(y=${b}\\).`,ans,dis,
    'The cross-section in each plane y = const is the region under z = c − x² (where it is ≥ 0); multiply its area by the length in y.',
    [['',`V=\\int_0^{${b}}\\!\\int_{-${sc}}^{${sc}}\\!\\int_0^{${c}-x^2}dz\\,dx\\,dy=${b}\\cdot\\frac{4}{3}(${c})^{3/2}=${T(ans)}`]],
    CI('1',[['z','0',`${c} - x^2`],['x',String(-sc),String(sc)],['y','0',String(b)]]),2);
}
/* ---------- 16.4: average value over a tetrahedron (16.4 #51–54) ---------- */
function P_triAvg(){
  const p=pick([1,2,3,4]), q=pick([1,2,3]), r=pick([2,4,6,8,12]), what=pick(['z','x+y+z','x']);
  const ans=what==='z'?Rs(Rr(r,4)):what==='x'?Rs(Rr(p,4)):Rs(Rr(p+q+r,4));
  const val=what==='z'?r:what==='x'?p:p+q+r;
  const dis=[D_(Rs(Rr(val,3)),'Used 1/3: that is the centroid of a triangle; a tetrahedron’s centroid is 1/4 of the way.'),D_(Rs(Rr(val,2)),'Used the midpoint.'),
    D_(Rs(Rr(val*p*q*r,24)),'That is the integral; the average divides by the volume pqr/6.'),D_(Rs(Rr(val,6)),'Divided by 6 (the volume formula) instead of 4.'),D_(Rs(Rr(val,8)),'Averaged as if over a box.'),D_(Rs(Rr(val*p*q*r,6)),'Multiplied by the volume instead of dividing.')];
  const plane=`\\frac{x}{${p}}+\\frac{y}{${q}}+\\frac{z}{${r}}=1`.replace('\\frac{x}{1}','x').replace('\\frac{y}{1}','y');
  const w=what==='x+y+z'?'x+y+z':what;
  return valQ(`Find the average value of \\(f(x,y,z)=${w}\\) over the tetrahedron bounded by the coordinate planes and \\(${plane}\\).`,ans,dis,
    'Average = (1/V)∭f dV. For a linear f it equals f at the centroid, and the centroid of this tetrahedron is (p/4, q/4, r/4).',
    [['',`V=\\frac{${p}\\cdot ${q}\\cdot ${r}}{6},\\qquad \\bar f=\\frac{1}{V}\\iiint ${w}\\,dV=${T(ans)}`]],
    {op:'ratio',num:CI(what==='x+y+z'?'x + y + z':what,[['z','0',`${r}*(1 - x/${p} - y/${q})`],['y','0',`${q}*(1 - x/${p})`],['x','0',String(p)]]),den:{op:'val',e:`${p*q*r}/6`}},2);
}
/* ---------- 16.4: basic triple integral over a box (sprint, 16.4 #7–14) ---------- */
function P_triBox(){
  const a=ri(1,3), b=ri(1,3), c=ri(1,2), m=ri(0,2), n=ri(0,2), s=ri(0,3), k=nz(1,3);
  const ans=Rs(Rmul([k,1],Rmul(Rr(Math.pow(a,m+1),m+1),Rmul(Rr(Math.pow(b,n+1),n+1),Rr(Math.pow(c,s+1),s+1)))));
  const f=mono(k,{x:m,y:n,z:s});
  return valQ(`Evaluate \\(\\displaystyle\\int_0^{${a}}\\!\\int_0^{${b}}\\!\\int_0^{${c}}${T(f)}\\,dz\\,dy\\,dx\\).`,ans,
    [D_(Rs(Rr(k*Math.pow(a,m+1)*Math.pow(b,n+1)*Math.pow(c,s+1),1)),'Forgot to divide by the new powers.'),D_(Rs(Rmul([k,1],Rmul(Rr(Math.pow(c,m+1),m+1),Rmul(Rr(Math.pow(b,n+1),n+1),Rr(Math.pow(a,s+1),s+1))))),'Matched the limits to the wrong variables.')],
    'A product of single-variable factors over a box: the triple integral is a product of three single integrals.',[['',`=${T(ans)}`]],CI(f,[['z','0',String(c)],['y','0',String(b)],['x','0',String(a)]]),1);
}

/* ---------- 16.5: Cartesian → cylindrical (F2023-Q9, F2022-Q7, S2019-Q6, F2017-Q6) ---------- */
function P_cylConvert(){
  const R=pick([1,2,3]), reg=pick(['wedge','quarter','half','full']), g=pick(['gauss','sqrt','z','sq']), zt=pick(['const','cone','par']);
  if(zt==='par'&&g==='z') return null;
  const xy={wedge:{T:`\\int_0^{${R===1?'1/\\sqrt2':R+'/\\sqrt2'}}\\!\\int_x^{\\sqrt{${R*R}-x^2}}`,L:[['y','x',`sqrt(${R*R} - x^2)`],['x','0',`${R}/sqrt(2)`]],th:['pi/4','pi/2'],d:'dy\\,dx'},
    quarter:{T:`\\int_0^{${R}}\\!\\int_0^{\\sqrt{${R*R}-x^2}}`,L:[['y','0',`sqrt(${R*R} - x^2)`],['x','0',String(R)]],th:['0','pi/2'],d:'dy\\,dx'},
    half:{T:`\\int_{-${R}}^{${R}}\\!\\int_0^{\\sqrt{${R*R}-x^2}}`,L:[['y','0',`sqrt(${R*R} - x^2)`],['x',String(-R),String(R)]],th:['0','pi'],d:'dy\\,dx'},
    full:{T:`\\int_{-${R}}^{${R}}\\!\\int_{-\\sqrt{${R*R}-y^2}}^{\\sqrt{${R*R}-y^2}}`,L:[['x',`-sqrt(${R*R} - y^2)`,`sqrt(${R*R} - y^2)`],['y',String(-R),String(R)]],th:['0','2pi'],d:'dx\\,dy'}}[reg];
  const z0=pick([0,1,2]), z1=z0+pick([1,2,4]);
  const zc={const:{lo:String(z0),hi:String(z1),loT:z0,hiT:z1,rlo:String(z0),rhi:String(z1)},cone:{lo:'0',hi:'sqrt(x^2 + y^2)',loT:'0',hiT:'\\sqrt{x^2+y^2}',rlo:'0',rhi:'r'},
    par:{lo:'x^2 + y^2',hi:String(R*R+1),loT:'x^2+y^2',hiT:R*R+1,rlo:'r^2',rhi:String(R*R+1)}}[zt];
  const gx={gauss:['e^(-(x^2 + y^2))','e^{-(x^2+y^2)}','r*e^(-r^2)','re^{-r^2}','e^(-r^2)','e^{-r^2}'],sqrt:['sqrt(x^2 + y^2)','\\sqrt{x^2+y^2}','r^2','r^2','r','r'],
    z:['z','z','z*r','zr','z','z'],sq:['x^2 + y^2','(x^2+y^2)','r^3','r^3','r^2','r^2']}[g];
  const q=`Rewrite in cylindrical coordinates (do not evaluate): \\(\\displaystyle${xy.T.replace(/^/,'')}\\!\\int_{${zc.loT}}^{${zc.hiT}}${gx[1]}\\,dz\\,${xy.d}\\)`;
  /* × (1 + x + 3y + z + x² + y²): depends on θ, r and z, so set-ups that differ cannot integrate to the same number */
  const ref=CI(`(${gx[0]})*(1 + x + 3*y + z + x^2 + y^2)`,[['z',zc.lo,zc.hi],...xy.L]);
  const C=(t0,t1,r1,zlo,zhi,fK,fT)=>[`\\(\\displaystyle\\int_{${ANG[t0].t}}^{${ANG[t1].t}}\\!\\int_0^{${r1}}\\!\\int_{${T(zlo)}}^{${T(zhi)}}${fT}\\,dz\\,dr\\,d\\theta\\)`,CI(`(${fK})*(1 + r*cos(t) + 3*r*sin(t) + z + r^2)`,[['z',zlo,zhi],['r','0',String(r1)],['t',ANG[t0].k,ANG[t1].k]])];
  const [t0,t1]=xy.th, k=C(t0,t1,R,zc.rlo,zc.rhi,gx[2],gx[3]);
  const wth=reg==='full'?['0','pi']:reg==='wedge'?['0','pi/4']:reg==='quarter'?['0','pi']:['0','2pi'];
  const wz=zt==='cone'?['0','r^2']:zt==='par'?['r',zc.rhi]:[String(z0),String(z1+z0)];
  const NC=(c,why)=>NO(c[0],why,c[1]);
  const opts=[OK(...k),NC(C(t0,t1,R,zc.rlo,zc.rhi,gx[4],gx[5]),'Forgot the Jacobian: dV = r dz dr dθ.'),
    NC(C(wth[0],wth[1],R,zc.rlo,zc.rhi,gx[2],gx[3]),'Wrong θ-range: read it from the xy-limits ('+{wedge:'above y = x in the first quadrant',quarter:'the first quadrant',half:'y ≥ 0',full:'the whole disk'}[reg]+').'),
    R>1?NC(C(t0,t1,R*R,zc.rlo,zc.rhi,gx[2],gx[3]),'r runs to the radius '+R+', not '+(R*R)+'.'):null,
    NC(C(t0,t1,R,wz[0],wz[1],gx[2],gx[3]),zt==='cone'?'√(x² + y²) = r, not r².':zt==='par'?'x² + y² = r², not r.':'Kept the wrong z-limits.'),
    NC(C(t0,t1,R,zc.rlo,zc.rhi,g==='z'?'z*r^2':g==='gauss'?'r^2*e^(-r^2)':g==='sqrt'?'r^3':'r^4',g==='z'?'zr^2':g==='gauss'?'r^2e^{-r^2}':g==='sqrt'?'r^3':'r^4'),'One factor of r too many.')].filter(Boolean);
  return choiceQ(q,opts,'x² + y² = r², the xy-limits give the r- and θ-ranges, z keeps its limits (rewritten in r), and dV = r dz dr dθ.',
    [['The shadow is '+{wedge:'the part of the disk above y = x in the first quadrant',quarter:'the quarter disk',half:'the upper half-disk',full:'the whole disk'}[reg]+' of radius '+R+'.',k[0].slice(2,-2)]],ref,2);
}
/* ---------- 16.5: evaluate by converting (S2023-Q9, S2022-Q8, S2025-Q5, F2019-Q5) ---------- */
function P_cylEval(){
  const fam=pick(['inv','pow','ann','ann']);
  if(fam==='inv'){
    const R=pick([1,2,3,4,10]), full=coin(0.35), top=pick(['cone','par']);
    const Th=full?[2,1]:[1,2], ans=top==='cone'?mv(Rmul(Th,[R*R,2]),1,1):mv(Rmul(Th,[R*R*R,3]),1,1);
    const lims=full?`\\int_{-${R}}^{${R}}\\!\\int_{-\\sqrt{${R*R}-x^2}}^{\\sqrt{${R*R}-x^2}}`:`\\int_0^{${R}}\\!\\int_0^{\\sqrt{${R*R}-x^2}}`;
    const L=full?[['y',`-sqrt(${R*R} - x^2)`,`sqrt(${R*R} - x^2)`],['x',String(-R),String(R)]]:[['y','0',`sqrt(${R*R} - x^2)`],['x','0',String(R)]];
    const zt=top==='cone'?'\\sqrt{x^2+y^2}':'x^2+y^2', zk=top==='cone'?'sqrt(x^2 + y^2)':'x^2 + y^2';
    const p=top==='cone'?2:3;
    const dis=[D_(mv(Rmul(Th,[Math.pow(R,p+1),p+1]),1,1),'Kept 1/r out of the integrand but also multiplied by the extra r: count the powers again.'),D_(mv(Rmul(Th,[Math.pow(R,p-1),p-1]),1,1),'Forgot the Jacobian r.'),
      D_(mv(Rmul(full?[1,2]:[2,1],[Math.pow(R,p),p]),1,1),full?'Used a quarter of the disk.':'Used the whole disk; the limits give the first quadrant only.'),D_(mv(Rmul(Th,[Math.pow(R,p),2*p]),1,1),'Halved by mistake.'),
      D_(mv(Rmul(Th,[Math.pow(R,2*p),p]),1,1),'Took r out to R² instead of R.'),D_(Rs(Rmul(Th,[Math.pow(R,p),p])),'Lost the π from the θ-integral.')];
    return valQ(`Evaluate by converting to cylindrical coordinates: \\(\\displaystyle${lims}\\!\\int_0^{${zt}}\\frac{1}{\\sqrt{x^2+y^2}}\\,dz\\,dy\\,dx\\)`,ans,dis,
      'Convert: 1/√(x²+y²) = 1/r cancels the Jacobian r, the z-integral gives the height '+(top==='cone'?'r':'r²')+'.',
      [['',`\\int\\!\\!\\int_0^{${R}}\\!\\int_0^{${top==='cone'?'r':'r^2'}}\\frac1r\\,r\\,dz\\,dr\\,d\\theta=\\int\\!\\!\\int_0^{${R}}${top==='cone'?'r':'r^2'}\\,dr\\,d\\theta=${T(ans)}`]],
      CI('1/sqrt(x^2 + y^2)',[['z','0',zk],...L]),2);
  }
  if(fam==='pow'){
    const R=pick([1,2]), z0=pick([-1,0,1]), z1=z0+pick([1,2,3]), H=z1-z0, ans=mv([2*H*Math.pow(R,5),5],1,1);
    const dis=[D_(mv([2*H*Math.pow(R,4),4],1,1),'Forgot the Jacobian r: r³·r integrates to r⁵/5.'),D_(mv([H*Math.pow(R,5),5],1,1),'Used θ from 0 to π.'),D_(mv([2*Math.pow(R,5),5],1,1),'Forgot the height of the cylinder.'),
      D_(mv([2*H*Math.pow(R,6),6],1,1),'One factor of r too many.'),D_(mv([2*H*R*R*R,3],1,1),'Treated (x² + y²)^{3/2} as r².'),D_(mv([4*H*Math.pow(R,5),5],1,1),'Doubled the θ-range.')];
    return valQ(`Evaluate \\(\\displaystyle\\int_{-${R}}^{${R}}\\!\\int_{-\\sqrt{${R*R}-y^2}}^{\\sqrt{${R*R}-y^2}}\\!\\int_{${z0}}^{${z1}}(x^2+y^2)^{3/2}\\,dz\\,dx\\,dy\\).`,ans,dis,
      'The region is a solid cylinder of radius R; (x² + y²)^{3/2} = r³ and dV = r dz dr dθ.',[['',`\\int_0^{2\\pi}\\!\\int_0^{${R}}\\!\\int_{${z0}}^{${z1}}r^3\\,r\\,dz\\,dr\\,d\\theta=2\\pi\\cdot ${H}\\cdot\\frac{${Math.pow(R,5)}}{5}=${T(ans)}`]],
      CI('(x^2 + y^2)^(3/2)',[['z',String(z0),String(z1)],['x',`-sqrt(${R*R} - y^2)`,`sqrt(${R*R} - y^2)`],['y',String(-R),String(R)]]),2);
  }
  const [a,b,c]=pick([[1,2,4],[1,2,5],[1,3,9],[2,3,9],[1,2,6]]), ans=mv(Rmul([2,1],Radd(Rr(c,a),Radd(Rr(-c,b),[a-b,1]))),1,1);
  const dis=[D_(mv(Rmul([2,1],Radd(Rr(c,a),Rr(-c,b))),1,1),'Dropped the −r term: ∫(c − r²)/r² dr = −c/r − r.'),D_(mv(Rmul([2,1],Radd(Rr(c*c,2*a*a),Rr(-c*c,2*b*b))),1,1),'Forgot the Jacobian r: the integrand is r⁻³·r = r⁻².'),
    D_(Rs(Rmul([2,1],Radd(Rr(c,a),Radd(Rr(-c,b),[a-b,1])))),'Lost the π from the θ-integral.'),D_(mv(Radd(Rr(c,a),Radd(Rr(-c,b),[a-b,1])),1,1),'Used θ from 0 to π.'),
    D_(mv(Rmul([2,1],Radd(Rr(c,b),Radd(Rr(-c,a),[b-a,1]))),1,1),'Sign error: the antiderivative is −c/r − r, evaluated top minus bottom.'),D_(mv(Rmul([2,1],Radd([c*(b-a),1],[-(b*b*b-a*a*a),3])),1,1),'Integrated (c − r²) dr: r⁻³ times the Jacobian r is r⁻², not 1.')];
  return valQ(`Let \\(D\\) be the solid between the cylinders \\(x^2+y^2=${a*a}\\) and \\(x^2+y^2=${b*b}\\), above \\(z=0\\) and below \\(z=${c}-(x^2+y^2)\\). In cylindrical coordinates let \\(f(r,\\theta,z)=\\dfrac{1}{r^3}\\). Find \\(\\displaystyle\\iiint_D f\\,dV\\).`,ans,dis,
    'dV = r dz dr dθ, so the integrand becomes r⁻²; the z-integral gives the height c − r².',
    [['',`\\int_0^{2\\pi}\\!\\int_{${a}}^{${b}}\\!\\int_0^{${c}-r^2}\\frac{1}{r^3}\\,r\\,dz\\,dr\\,d\\theta=2\\pi\\int_{${a}}^{${b}}\\left(\\frac{${c}}{r^2}-1\\right)dr`],['',`=2\\pi\\left[-\\frac{${c}}{r}-r\\right]_{${a}}^{${b}}=${T(ans)}`]],
    CI('r^(-3)*r',[['z','0',`${c} - r^2`],['r',String(a),String(b)],['t','0','2*pi']]),2);
}
/* ---------- 16.5: volumes with cylindrical coordinates (16.5 #29–34, #72) ---------- */
function P_cylVol(){
  const fam=pick(['conepar','hole','spheres']);
  if(fam==='conepar'){
    const a=pick([1,2,3]), ans=mv([Math.pow(a,4),6],1,1);
    const dis=[D_(mv([Math.pow(a,4),3],1,1),'Forgot the ½ somewhere: ∫(ar − r²) r dr = a⁴/3 − a⁴/4 = a⁴/12.'),D_(mv([Math.pow(a,4),12],1,1),'Used θ from 0 to π.'),D_(mv([Math.pow(a,3),6],1,1),'Forgot the Jacobian r.'),
      D_(mv([7*Math.pow(a,4),6],1,1),'Added the two surfaces instead of subtracting.'),D_(mv([Math.pow(a,4),2],1,1),'Used the volume of the cone alone.'),D_(mv([a*a*a,3],1,1),'Used the cylinder volume minus nothing.')];
    return valQ(`Find the volume of the solid bounded by the cone \\(z=${a===1?'':a}\\sqrt{x^2+y^2}\\) and the paraboloid \\(z=x^2+y^2\\).`,ans,dis,
      'They meet where ar = r², at r = a. Between, the cone is on top: V = ∫∫(ar − r²) r dr dθ.',[['',`V=\\int_0^{2\\pi}\\!\\int_0^{${a}}(${a===1?'':a}r-r^2)\\,r\\,dr\\,d\\theta=${T(ans)}`]],CI(`(${a}*r - r^2)*r`,[['r','0',String(a)],['t','0','2*pi']]),2);
  }
  if(fam==='hole'){
    const [R,h,m3,s]=pick([[2,1,'3',3],[5,3,'64',1],[5,4,'27',1],[3,1,'8',8]]);
    const inner=R*R-h*h, k=Math.round(Math.sqrt(inner)), ans=isSq(inner)?mv([4*k*k*k,3],1,1):mv([4*inner,3],inner,1);
    const dis=[D_(mv([4*(R*R*R-h*h*h),3],1,1),'Subtracted a sphere of the hole’s radius; the hole is a cylinder.'),D_(mv([4*R*R*R,3],1,1),'That is the whole ball, before drilling.'),
      D_(isSq(inner)?mv([2*k*k*k,3],1,1):mv([2*inner,3],inner,1),'Integrated θ over π only.'),D_(mv([4*R*R*R-6*h*h*R,3],1,1),'Subtracted the full cylinder πh²·2R; its ends are capped by the sphere, so less is removed.'),
      D_(isSq(inner)?mv([4*k*k,3],1,1):mv([4*inner,3],1,1),'Wrong power: (R² − h²)^{3/2}.')];
    return valQ(`A hole of radius ${h} is drilled along the \\(z\\)-axis through the ball \\(x^2+y^2+z^2\\le ${R*R}\\). Find the volume that remains.`,ans,dis,
      'Cylindrical: what remains is h ≤ r ≤ R, −√(R² − r²) ≤ z ≤ √(R² − r²). The answer depends only on R² − h².',
      [['',`V=\\int_0^{2\\pi}\\!\\int_{${h}}^{${R}}2\\sqrt{${R*R}-r^2}\\,r\\,dr\\,d\\theta=\\frac{4\\pi}{3}(${R*R}-${h*h})^{3/2}=${T(ans)}`]],CI(`2*sqrt(${R*R} - r^2)*r`,[['r',String(h),String(R)],['t','0','2*pi']]),3);
  }
  const [c,d]=pick([[4,12],[2,8],[1,9],[3,5]]), mm=(d-c)/2, ans=mv([mm*mm,1],1,1);
  const dis=[D_(mv([2*mm*mm,1],1,1),'Forgot the ½ when integrating r(… ) dr.'),D_(mv([mm,1],1,1),'Stopped at the area of the shadow.'),D_(mv([mm*mm,2],1,1),'Used θ from 0 to π.'),
    D_(mv([(d-c)*mm,1],1,1),'Integrated the height d − c without the −2r² term.'),D_(mv([mm*mm*2,3],1,1),'Integrated z instead of 2z.'),D_(mv([d*d-c*c,4],1,1),'Integrated each surface separately and subtracted the wrong way.')];
  return valQ(`Evaluate \\(\\displaystyle\\iiint_D 2z\\,dV\\), where \\(D\\) is the region between \\(z=\\sqrt{${c}+x^2+y^2}\\) and \\(z=\\sqrt{${d}-x^2-y^2}\\).`,ans,dis,
    'Cylindrical: ∫2z dz = z², so the inner integral is (d − r²) − (c + r²). The surfaces meet where c + r² = d − r².',
    [['They meet at \\(r^2='+mm+'\\).',`\\int_0^{2\\pi}\\!\\int_0^{\\sqrt{${mm}}}\\left[(${d}-r^2)-(${c}+r^2)\\right]r\\,dr\\,d\\theta=${T(ans)}`]],
    CI('2*z*r',[['z',`sqrt(${c} + r^2)`,`sqrt(${d} - r^2)`],['r','0',`sqrt(${mm})`],['t','0','2*pi']]),3);
}
/* ---------- 16.5: a cylinder around the x-axis (F2016-Q8) ---------- */
function P_cylXaxis(){
  const R=pick([1,2,3]), what=pick(['z','x']);
  const ans=what==='z'?Rs(Rr(Math.pow(R,4),8)):mv([Math.pow(R,4),32],1,1);
  const dis=what==='z'?[D_(Rs(Rr(Math.pow(R,4),4)),'Forgot the ½ from ∫sin θ cos θ dθ.'),D_(Rs(Rr(R*R*R,6)),'Forgot the Jacobian r.'),D_(mv([Math.pow(R,4),16],1,1),'Integrated sin² instead of sin·cos.'),
      D_(Rs(Rr(Math.pow(R,4),16)),'Halved twice.'),D_(Rs(Rr(R*R*R,3)),'Integrated z over the quarter disk without the x-length y.'),D_(mv([Math.pow(R,4),8],1,1),'Treated the x-length as constant.')]
    :[D_(mv([Math.pow(R,4),16],1,1),'Forgot the ½ from ∫x dx = x²/2.'),D_(mv([R*R*R,24],1,1),'Forgot the Jacobian r.'),D_(Rs(Rr(Math.pow(R,4),8)),'That is ∭z dV.'),
      D_(mv([Math.pow(R,4),64],1,1),'Halved twice.'),D_(mv([R*R*R,12],1,1),'Used r² instead of r³.'),D_(mv([Math.pow(R,4),8],1,1),'Used cos²θ averaged over a full turn.')];
  return valQ(`Let \\(E\\) be the solid in the first octant bounded by the cylinder \\(y^2+z^2=${R*R}\\) and the planes \\(x=0\\) and \\(x=y\\). Evaluate \\(\\displaystyle\\iiint_E ${what}\\,dV\\).`,ans,dis,
    'The cylinder runs along the x-axis, so use polar coordinates in the yz-plane (y = r cos θ, z = r sin θ) and let x go from 0 to y.',
    [['For each \\((y,z)\\) in the quarter disk, \\(0\\le x\\le y\\).',what==='z'?`\\iint z\\,y\\,dA=\\int_0^{\\pi/2}\\!\\int_0^{${R}}(r\\sin\\theta)(r\\cos\\theta)\\,r\\,dr\\,d\\theta=${T(ans)}`:`\\iint\\frac{y^2}{2}\\,dA=\\int_0^{\\pi/2}\\!\\int_0^{${R}}\\frac{r^2\\cos^2\\theta}{2}\\,r\\,dr\\,d\\theta=${T(ans)}`]],
    CI(what,[['x','0','y'],['z','0',`sqrt(${R*R} - y^2)`],['y','0',String(R)]]),3);
}

/* ---------- 16.5: cone and sphere set-up (F2024-Q6, F2023-Q5, F2016-Q9) ---------- */
const CONES=[{k:'sqrt(3)',kt:'\\sqrt{3x^2+3y^2}',ph:'pi/6',co:'pi/3'},{k:'1',kt:'\\sqrt{x^2+y^2}',ph:'pi/4',co:'pi/4'},{k:'1/sqrt(3)',kt:'\\sqrt{\\tfrac{x^2+y^2}{3}}',ph:'pi/3',co:'pi/6'}];
function P_sphSetup(){
  const C=pick(CONES), R=pick([1,2,3]);
  const Hh=(a,b,c)=>`\\(a=${ANG[a].t},\\ b=${T(b)},\\ c=${c}\\)`;
  const Sp=(a,b,cK)=>CI(`(${cK})*(1 + rho*cos(ph))`,[['rho','0',b],['ph','0',ANG[a].k],['th','0','2*pi']]);   /* × (1 + z): separates set-ups with equal volume */
  const opts=[OK(Hh(C.ph,R,'\\rho^2\\sin\\varphi'),Sp(C.ph,String(R),'rho^2*sin(ph)')),
    NO(Hh(C.co,R,'\\rho^2\\sin\\varphi'),'Used the angle the cone makes with the xy-plane; φ is measured from the positive z-axis.',Sp(C.co,String(R),'rho^2*sin(ph)')),
    NO(Hh(C.ph,R,'\\rho^2\\cos\\varphi'),'The Jacobian is ρ² sin φ.',Sp(C.ph,String(R),'rho^2*cos(ph)')),
    NO(Hh(C.ph,R*R,'\\rho^2\\sin\\varphi'),'ρ runs to the radius '+R+', not '+(R*R)+'.',Sp(C.ph,String(R*R),'rho^2*sin(ph)')),
    NO(Hh(C.ph,R,'\\rho\\sin\\varphi'),'The Jacobian has ρ², not ρ.',Sp(C.ph,String(R),'rho*sin(ph)')),
    NO(Hh(C.co,R,'\\rho^2\\cos\\varphi'),'Wrong cone angle and wrong Jacobian.',Sp(C.co,String(R),'rho^2*cos(ph)')),
    NO(Hh('pi/2',R,'\\rho^2\\sin\\varphi'),'φ up to π/2 is the whole upper half-ball, not the part inside the cone.',Sp('pi/2',String(R),'rho^2*sin(ph)'))];
  const rr=`${R}*${ANG[C.ph].s}`;
  return choiceQ(`The volume of the solid inside the sphere \\(x^2+y^2+z^2=${R*R}\\) and above the cone \\(z=${C.kt}\\) is \\(\\displaystyle\\int_0^{2\\pi}\\!\\int_0^{a}\\!\\int_0^{b}c\\,d\\rho\\,d\\varphi\\,d\\theta\\). Then`,opts,
    'The cone z = k·r makes tan φ = r/z = 1/k with the z-axis; the sphere is ρ = R; dV = ρ² sin φ dρ dφ dθ.',
    [['On the cone \\(z='+C.kt+'\\): \\(\\tan\\varphi=\\tfrac{r}{z}\\), so \\(\\varphi='+ANG[C.ph].t+'\\).',`a=${ANG[C.ph].t},\\quad b=${R},\\quad c=\\rho^2\\sin\\varphi`]],
    CI('r*(1 + z)',[['z',`${C.k}*r`,`sqrt(${R*R} - r^2)`],['r','0',rr],['t','0','2*pi']]),2);
}
/* ---------- 16.5: spherical volumes (S2025-Q1, F2017-Q4) ---------- */
function P_sphVol(){
  const R=pick([1,2,3]), mode=pick(['cone','cone','between']), oct=pick(['full','octant','half']);
  let p1,p2,desc;
  if(mode==='cone'){ const C=pick(CONES); p1='0'; p2=C.ph; desc=`above the cone \\(z=${C.kt}\\)`; }
  else { p1='pi/6'; p2='pi/3'; desc='between the cones \\(\\varphi=\\pi/6\\) and \\(\\varphi=\\pi/3\\)'; }
  const Th={full:[2,1],octant:[1,2],half:[1,1]}[oct], where={full:'',octant:' in the first octant',half:' with \\(y\\ge 0\\)'}[oct];
  const K=Rmul(Th,[R*R*R,3]), cos=v=>trigT(v,'c'), sin=v=>trigT(v,'s');
  const ans=qc([scaleT(cos(p1),K),scaleT(cos(p2),Rneg(K))],'pi');
  const len=angLen(p1,p2);
  const dis=[D_(mv(Rmul(K,len),1,2),'Forgot sin φ in the Jacobian: ∫sin φ dφ = −cos φ.'),D_(qc([scaleT(sin(p2),K),scaleT(sin(p1),Rneg(K))],'pi'),'Integrated sin φ to sin φ (should be −cos φ).'),
    D_(qc([scaleT(cos(p1),Rmul(Th,[R*R*R,1])),scaleT(cos(p2),Rneg(Rmul(Th,[R*R*R,1])))],'pi'),'Forgot the 1/3 from ∫ρ² dρ.'),
    D_(qc([scaleT(cos(p1),Rmul(oct==='full'?[1,2]:[2,1],[R*R*R,3])),scaleT(cos(p2),Rneg(Rmul(oct==='full'?[1,2]:[2,1],[R*R*R,3])))],'pi'),oct==='full'?'Used a quarter turn of θ.':'Used the full turn θ ∈ [0, 2π].'),
    D_(mode==='cone'?qc([[K,1],scaleT(sin(p2),Rneg(K))],'pi'):null,'Measured the cone angle from the xy-plane instead of from the z-axis.'),
    D_(qc([scaleT(cos(p1),Rmul(Th,[R*R,2])),scaleT(cos(p2),Rneg(Rmul(Th,[R*R,2])))],'pi'),'Integrated ρ instead of ρ².')].filter(d=>d.a);
  return valQ(`Find the volume of the solid inside the sphere \\(x^2+y^2+z^2=${R*R}\\) and ${desc}${where}.`,ans,dis,
    'Spherical: V = ∫∫∫ ρ² sin φ dρ dφ dθ = (θ-range)·(R³/3)·(cos φ₁ − cos φ₂).',
    [['\\(0\\le\\rho\\le '+R+'\\), \\('+ANG[p1].t+'\\le\\varphi\\le '+ANG[p2].t+'\\), θ through '+{full:'2π',octant:'π/2',half:'π'}[oct]+'.',`V=${{full:'2\\pi',octant:'\\tfrac{\\pi}{2}',half:'\\pi'}[oct]}\\cdot\\frac{${R*R*R}}{3}\\left(\\cos ${ANG[p1].t}-\\cos ${ANG[p2].t}\\right)=${T(ans)}`]],
    CI('rho^2*sin(ph)',[['rho','0',String(R)],['ph',ANG[p1].k,ANG[p2].k],['th','0',{full:'2*pi',octant:'pi/2',half:'pi'}[oct]]]),2);
}
/* ---------- 16.5: integrals over balls and shells (S2019-Q7, F2018-Q10, S2018-Q6) ---------- */
function P_sphShell(){
  const kind=pick(['xy','xy','rho2','z','exp']);
  if(kind==='z'){
    const R=pick([1,2]), oct=coin(0.5), ans=mv([Math.pow(R,4),oct?16:4],1,1);
    const dis=[D_(mv([Math.pow(R,4),oct?8:2],1,1),'Forgot the ½ from ∫sin φ cos φ dφ.'),D_(mv([Math.pow(R,3),oct?12:3],1,1),'Integrated ρ² instead of ρ³ (z = ρ cos φ adds a ρ).'),D_('0','z ≥ 0 on this region, so the integral is positive.'),
      D_(mv([Math.pow(R,4),oct?4:1],1,1),oct?'Used the whole upper half-ball.':'Doubled the θ-range.'),D_(Rs(Rr(Math.pow(R,4),oct?16:4)),'Lost the π.'),D_(mv([Math.pow(R,4),oct?32:8],1,1),'Halved one time too many.')];
    return valQ(`Evaluate \\(\\displaystyle\\iiint_E z\\,dV\\), where \\(E\\) is the part of the ball \\(x^2+y^2+z^2\\le ${R*R}\\) ${oct?'in the first octant':'with \\(z\\ge 0\\)'}.`,ans,dis,
      'z = ρ cos φ, dV = ρ² sin φ dρ dφ dθ; ∫₀^{π/2} cos φ sin φ dφ = ½.',[['',`\\int\\!\\!\\int_0^{\\pi/2}\\!\\int_0^{${R}}\\rho\\cos\\varphi\\,\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta=${T(ans)}`]],
      CI('rho^3*cos(ph)*sin(ph)',[['rho','0',String(R)],['ph','0','pi/2'],['th','0',oct?'pi/2':'2*pi']]),2);
  }
  if(kind==='exp'){
    const R3=pick([1,2,8]), R=R3===8?'2':R3===1?'1':'2^(1/3)', RT=R3===8?'4':R3===1?'1':'2^{2/3}';
    const ans=`${term([4,3],'pi')}*(e^${R3} - 1)`;
    const dis=[D_(`${term([4,1],'pi')}*(e^${R3} - 1)`,'Forgot the 1/3 from u = ρ³.'),D_(`${term([4,3],'pi')}*e^${R3}`,'Dropped e⁰ = 1.'),D_(`${term([2,3],'pi')}*(e^${R3} - 1)`,'∫₀^π sin φ dφ = 2, not 1.'),
      D_(`${term([4,3],'1')}*(e^${R3} - 1)`,'Lost the π.'),D_(`${term([8,3],'pi')}*(e^${R3} - 1)`,'Doubled.'),D_(`${term([4,3],'pi')}*(e^${R3*R3} - 1)`,'Wrong power of the radius in the exponent.')];
    return valQ(`Evaluate \\(\\displaystyle\\iiint_E e^{(x^2+y^2+z^2)^{3/2}}\\,dV\\), where \\(E\\) is the ball \\(x^2+y^2+z^2\\le ${RT}\\).`,ans,dis,
      'Spherical: (x² + y² + z²)^{3/2} = ρ³, dV = ρ² sin φ dρ dφ dθ, and u = ρ³ gives du = 3ρ² dρ.',[['',`\\int_0^{2\\pi}\\!\\int_0^{\\pi}\\!\\int_0^{${R3===8?2:R3===1?1:'\\sqrt[3]{2}'}}e^{\\rho^3}\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta=2\\pi\\cdot 2\\cdot\\frac{e^{${R3}}-1}{3}`]],
      CI('e^(rho^3)*rho^2*sin(ph)',[['rho','0',R],['ph','0','pi'],['th','0','2*pi']]),2);
  }
  const [a,b]=pick([[1,2],[0,1],[1,3],[2,3],[0,2]]), oct=pick(['octant','half','full']), D5=Math.pow(b,5)-Math.pow(a,5);
  const Om={octant:[1,2],half:[2,1],full:[4,1]}[oct];                        /* solid angle / π */
  const xyF={octant:[1,15],half:[4,15],full:[8,15]}[oct];
  const ans=kind==='xy'?mv(Rmul(xyF,[D5,1]),1,1):mv(Rmul(Om,[D5,5]),1,1);
  const desc=a?`between the spheres \\(x^2+y^2+z^2=${a*a}\\) and \\(x^2+y^2+z^2=${b*b}\\)`:`inside the sphere \\(x^2+y^2+z^2=${b*b}\\)`;
  const gT=kind==='xy'?'x^2+y^2':'x^2+y^2+z^2', gK=kind==='xy'?'rho^4*sin(ph)^3':'rho^4*sin(ph)';
  const dis=kind==='xy'?[D_(mv(Rmul(Om,[D5,5]),1,1),'Used x² + y² = ρ²: in spherical coordinates x² + y² = ρ² sin²φ.'),D_(mv(Rmul(xyF,[Math.pow(b-a,5),1]),1,1),'Used (b − a)⁵ instead of b⁵ − a⁵.'),
      D_(mv(Rmul(xyF,[Math.pow(b,3)-Math.pow(a,3),1]),1,1),'Forgot the ρ² in the Jacobian.'),D_(mv(Rmul(Rmul(xyF,[3,2]),[D5,1]),1,1),'Integrated sin³φ to 1 instead of 2/3 (over 0 to π/2).'),D_(Rs(Rmul(xyF,[D5,1])),'Lost the π.'),
      D_(mv(Rmul(oct==='full'?[1,15]:[8,15],[D5,1]),1,1),oct==='full'?'Used only one octant.':'Used the whole shell; the region is only part of it.')]
    :[D_(mv(Rmul(Om,[D5,3]),1,1),'Integrated ρ⁴ as ρ³/3.'),D_(mv(Rmul(Om,[Math.pow(b,3)-Math.pow(a,3),3]),1,1),'Forgot that the integrand is ρ²: only the Jacobian was used.'),D_(mv(Rmul(Om,[Math.pow(b-a,5),5]),1,1),'Used (b − a)⁵.'),
      D_(Rs(Rmul(Om,[D5,5])),'Lost the π.'),D_(mv(Rmul(Rmul(Om,[1,2]),[D5,5]),1,1),'Halved the solid angle.'),D_(mv(Rmul(Rmul(Om,[2,1]),[D5,5]),1,1),'Doubled the solid angle.')];
  const where={octant:'in the first octant',half:'above the \\(xy\\)-plane',full:''}[oct];
  return valQ(`Evaluate \\(\\displaystyle\\iiint_E (${gT})\\,dV\\), where \\(E\\) is the region ${desc}${where?' '+where:''}.`,ans,dis,
    'Spherical: '+(kind==='xy'?'x² + y² = ρ² sin²φ, ':'x² + y² + z² = ρ², ')+'dV = ρ² sin φ dρ dφ dθ.',
    [['',`\\iiint=\\int\\!\\!\\int\\!\\!\\int_{${a}}^{${b}}${kind==='xy'?'\\rho^4\\sin^3\\varphi':'\\rho^4\\sin\\varphi'}\\,d\\rho\\,d\\varphi\\,d\\theta=${T(ans)}`]],
    CI(gK,[['rho',String(a),String(b)],['ph','0',oct==='full'?'pi':'pi/2'],['th','0',oct==='octant'?'pi/2':'2*pi']]),2);
}
/* ---------- 16.5: spheres that do not sit at the origin (F2019-Q7, S2023-Q11) ---------- */
function P_sphOff(){
  if(coin(0.5)){
    const c=pick([2,4,6,12]), ans=mv([c*c*c,6],1,1);
    const dis=[D_(mv([4*c*c*c,3],1,1),'Took the radius to be '+c+'; ρ = c cos φ is a sphere of DIAMETER c.'),D_(mv([c*c*c,3],1,1),'Integrated cos³φ sin φ to 1/2 instead of 1/4.'),D_(mv([2*c*c*c,3],1,1),'Integrated φ from 0 to π.'),
      D_(mv([c*c*c,12],1,1),'Integrated θ from 0 to π.'),D_(mv([c*c,2],1,1),'Used the area formula.'),D_(mv([c*c*c,24],1,1),'Halved twice.')];
    return valQ(`Find the volume of the solid enclosed by the surface \\(\\rho=${c}\\cos\\varphi\\).`,ans,dis,
      'ρ = c cos φ ⇔ x² + y² + z² = cz: a sphere of radius c/2 centred at (0, 0, c/2), traced for 0 ≤ φ ≤ π/2.',
      [['\\(\\rho^2='+c+'\\rho\\cos\\varphi\\ \\Rightarrow\\ x^2+y^2+\\left(z-'+c/2+'\\right)^2='+(c*c/4)+'\\).',`V=\\frac43\\pi\\left(${c/2}\\right)^3=${T(ans)}`]],
      CI('rho^2*sin(ph)',[['rho','0',`${c}*cos(ph)`],['ph','0','pi/2'],['th','0','2*pi']]),2);
  }
  const a=pick([1,2]), A=String(a);
  const Hs=(p,lo,hi,f)=>`\\(\\displaystyle\\int_0^{2\\pi}\\!\\int_0^{${p}}\\!\\int_{${lo}}^{${hi}}${f}\\,d\\rho\\,d\\varphi\\,d\\theta\\)`;
  const Ss=(p,lo,hi,f)=>CI(f,[['rho',lo,hi],['ph','0',p],['th','0','2*pi']]);
  const tw=`${2*a}\\cos\\varphi`, twK=`${2*a}*cos(ph)`;
  const opts=[OK(Hs('\\frac{\\pi}{3}',A,tw,'\\rho^2\\sin\\varphi'),Ss('pi/3',A,twK,'rho^2*sin(ph)')),
    NO(Hs('\\frac{\\pi}{3}','0',tw,'\\rho^2\\sin\\varphi'),'ρ from 0 includes the part inside the sphere at the origin, which must be left out.',Ss('pi/3','0',twK,'rho^2*sin(ph)')),
    NO(Hs('\\frac{\\pi}{6}',A,tw,'\\rho^2\\sin\\varphi'),'The spheres meet where '+(2*a)+' cos φ = '+a+', at φ = π/3.',Ss('pi/6',A,twK,'rho^2*sin(ph)')),
    NO(Hs('\\frac{\\pi}{3}',A,`${2*a}\\sin\\varphi`,'\\rho^2\\sin\\varphi'),'The sphere centred on the z-axis is ρ = '+(2*a)+' cos φ.',Ss('pi/3',A,`${2*a}*sin(ph)`,'rho^2*sin(ph)')),
    NO(Hs('\\frac{\\pi}{2}',A,tw,'\\rho^2\\sin\\varphi'),'For φ > π/3 the upper limit drops below the lower one.',Ss('pi/2',A,twK,'rho^2*sin(ph)')),
    NO(Hs('\\frac{\\pi}{3}',A,tw,'\\rho\\sin\\varphi'),'The Jacobian is ρ² sin φ.',Ss('pi/3',A,twK,'rho*sin(ph)'))];
  const r1=a*Math.sqrt(3)/2;
  return choiceQ(`Which integral gives the volume of the solid inside the sphere of radius ${a} centred at \\((0,0,${a})\\) and outside the sphere of radius ${a} centred at the origin?`,opts,
    'Write both spheres in spherical form (ρ = 2a cos φ and ρ = a), then ρ runs from the inner sphere to the outer one, for the φ where they are in that order.',
    [['\\(x^2+y^2+(z-'+a+')^2='+(a*a)+'\\ \\Leftrightarrow\\ \\rho='+tw+'\\); they meet where \\('+tw+'='+a+'\\), \\(\\varphi=\\pi/3\\).',opts[0].h.slice(2,-2)]],
    {op:'sum',of:[CI('r',[['z',`sqrt(${a*a} - r^2)`,`${a} + sqrt(${a*a} - r^2)`],['r','0',String(r1)],['t','0','2*pi']]),CI('r',[['z',`${a} - sqrt(${a*a} - r^2)`,`${a} + sqrt(${a*a} - r^2)`],['r',String(r1),A],['t','0','2*pi']])]},3);
}
/* ---------- 16.5: a cone cut by two planes (S2022-Q6) ---------- */
function P_sphPlanes(){
  const h1=pick([1,2]), h2=h1+pick([1,2]), C=pick([CONES[0],CONES[1]]), kq=val(C.k);
  const Hs=(lim,f,d)=>`\\(\\displaystyle\\int_0^{2\\pi}${lim}${f}\\,${d}\\,d\\theta\\)`;
  const ph=ANG[C.ph].t, phK=ANG[C.ph].k;
  const opts=[OK(Hs(`\\!\\int_0^{${ph}}\\!\\int_{${h1===1?'':h1}\\sec\\varphi}^{${h2}\\sec\\varphi}`,'\\rho^2\\sin\\varphi','d\\rho\\,d\\varphi'),CI('rho^2*sin(ph)',[['rho',`${h1}/cos(ph)`,`${h2}/cos(ph)`],['ph','0',phK],['th','0','2*pi']])),
    NO(Hs(`\\!\\int_0^{${ph}}\\!\\int_{${h1}}^{${h2}}`,'\\rho^2\\sin\\varphi','d\\rho\\,d\\varphi'),'ρ = const are spheres; the planes z = c are ρ = c sec φ.',CI('rho^2*sin(ph)',[['rho',String(h1),String(h2)],['ph','0',phK],['th','0','2*pi']])),
    NO(Hs(`\\!\\int_0^{${ph}}\\!\\int_{${h1===1?'':h1}\\sec\\varphi}^{${h2}\\sec\\varphi}`,'d\\rho','d\\varphi'),'Missing the Jacobian ρ² sin φ.',CI('1',[['rho',`${h1}/cos(ph)`,`${h2}/cos(ph)`],['ph','0',phK],['th','0','2*pi']])),
    NO(Hs(`\\!\\int_0^{${ph}}\\!\\int_{${h1===1?'':h1}\\csc\\varphi}^{${h2}\\csc\\varphi}`,'\\rho^2\\sin\\varphi','d\\rho\\,d\\varphi'),'z = ρ cos φ, so z = c is ρ = c / cos φ = c sec φ.',CI('rho^2*sin(ph)',[['rho',`${h1}/sin(ph)`,`${h2}/sin(ph)`],['ph','0',phK],['th','0','2*pi']])),
    NO(Hs(`\\!\\int_{${h1}}^{${h2}}\\!\\int_0^{${ph}}`,'\\rho^2\\sin\\varphi','d\\varphi\\,d\\rho'),'With ρ outside, φ’s limits must depend on ρ; this is a different solid.',CI('rho^2*sin(ph)',[['ph','0',phK],['rho',String(h1),String(h2)],['th','0','2*pi']])),
    NO(Hs(`\\!\\int_0^{${C.co==='pi/4'?'\\frac{\\pi}{2}':ANG[C.co].t}}\\!\\int_{${h1===1?'':h1}\\sec\\varphi}^{${h2}\\sec\\varphi}`,'\\rho^2\\sin\\varphi','d\\rho\\,d\\varphi'),'φ stops at the cone, φ = '+(C.ph==='pi/4'?'π/4':'π/6')+'.',CI('rho^2*sin(ph)',[['rho',`${h1}/cos(ph)`,`${h2}/cos(ph)`],['ph','0',C.co==='pi/4'?'pi/2':ANG[C.co].k],['th','0','2*pi']]))];
  return choiceQ(`Which integral gives the volume of the solid inside the cone \\(z=${C.kt}\\) and between the planes \\(z=${h1}\\) and \\(z=${h2}\\)?`,opts,
    'In spherical coordinates z = ρ cos φ, so the plane z = c is ρ = c sec φ; the cone is φ = const; dV = ρ² sin φ dρ dφ dθ.',
    [['',opts[0].h.slice(2,-2)]],CI('r',[['r','0',`z/${C.k}`],['z',String(h1),String(h2)],['t','0','2*pi']]),3);
}
/* ---------- 16.5: Cartesian → spherical and read off the limits (F2019-Q6) ---------- */
function P_sphConvert(){
  const S=pick([{k:'sqrt(3)',kt:'\\sqrt{3(x^2+y^2)}',R2:4,c:'2',cT:2,b:'pi/6',r:1},{k:'1',kt:'\\sqrt{x^2+y^2}',R2:2,c:'sqrt(2)',cT:'\\sqrt2',b:'pi/4',r:1},{k:'1',kt:'\\sqrt{x^2+y^2}',R2:8,c:'2sqrt(2)',cT:'2\\sqrt2',b:'pi/4',r:2}]);
  const reg=pick(['full','half','quarter']), r=S.r;
  const xyT={full:`\\int_{-${r}}^{${r}}\\!\\int_{-\\sqrt{${r*r}-x^2}}^{\\sqrt{${r*r}-x^2}}`,half:`\\int_{-${r}}^{${r}}\\!\\int_0^{\\sqrt{${r*r}-x^2}}`,quarter:`\\int_0^{${r}}\\!\\int_0^{\\sqrt{${r*r}-x^2}}`}[reg];
  const aR={full:[2,1],half:[1,1],quarter:[1,2]}[reg], bR=toR(angN(S.b)/Math.PI);
  const cs=S.c==='2'?[[2,1],1]:S.c==='sqrt(2)'?[[1,1],2]:[[2,1],2];
  const ans=qc([[Rmul(Rmul(bR,cs[0]),[aR[1],aR[0]]),cs[1]]]);
  const co=toR(0.5-angN(S.b)/Math.PI);
  const W=(bb,cc,aa)=>qc([[Rmul(Rmul(bb,cc[0]),[aa[1],aa[0]]),cc[1]]]);
  const dis=[D_(W(co,cs,aR),'Measured the cone angle from the xy-plane; φ is measured from the z-axis.'),D_(W(bR,[[S.R2,1],1],aR),'Took c = '+S.R2+' (the radius squared) instead of the radius.'),
    D_(W(bR,cs,reg==='full'?[1,1]:[2,1]),reg==='full'?'The xy-limits describe the whole disk: θ runs through 2π.':'Used θ through 2π; the xy-limits describe only part of the disk.'),
    D_(qc([[Rmul(Rmul(bR,cs[0]),aR),cs[1]]],'pi^2'),'Computed b·c·a instead of b·c / a.'),D_(W(bR,[[S.r,1],1],aR),'Took c = '+S.r+', the radius of the shadow disk, instead of the sphere’s radius.'),
    D_(W([1,2],cs,aR),'Used φ up to π/2 (the whole hemisphere).')];
  return valQ(`Converting \\(\\displaystyle${xyT}\\!\\int_{${S.kt}}^{\\sqrt{${S.R2}-x^2-y^2}}f\\,dz\\,dy\\,dx\\) to spherical coordinates gives \\(\\displaystyle\\int_0^{a}\\!\\int_0^{b}\\!\\int_0^{c}f\\,\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta\\). What is \\(\\dfrac{b\\,c}{a}\\)?`,ans,dis,
    'Read off: the top is the sphere ρ = √'+S.R2+', the bottom is the cone z = k r (φ = arctan(1/k)), and the xy-limits fix the θ-range.',
    [['\\(a\\) from the xy-region, \\(b\\) from the cone, \\(c\\) from the sphere.',`a=${{full:'2\\pi',half:'\\pi',quarter:'\\tfrac{\\pi}{2}'}[reg]},\\quad b=${ANG[S.b].t},\\quad c=${S.cT}\\quad\\Rightarrow\\quad \\frac{bc}{a}=${T(ans)}`]],
    {op:'val',e:`(${S.b})*(${S.c})/(${{full:'2*pi',half:'pi',quarter:'pi/2'}[reg]})`,also:CI('1',[['z',`${S.k}*sqrt(x^2 + y^2)`,`sqrt(${S.R2} - x^2 - y^2)`],['y',reg==='full'?`-sqrt(${r*r} - x^2)`:'0',`sqrt(${r*r} - x^2)`],['x',reg==='quarter'?'0':String(-r),String(r)]]),alsoeq:CI('rho^2*sin(ph)',[['rho','0',S.c],['ph','0',S.b],['th','0',{full:'2*pi',half:'pi',quarter:'pi/2'}[reg]]])},3);
}
/* ---------- 16.5: name the surface (S2018-Q8, 16.5 #35–38, #56–57) ---------- */
function P_sphSurf(){
  const a=pick([1,2,3]), A2=a*a;
  const E=pick([
    ['\\rho='+(2*a)+'\\cos\\varphi',['the sphere \\(x^2+y^2+(z-'+a+')^2='+A2+'\\)','the sphere \\(x^2+y^2+z^2='+(4*A2)+'\\)','the sphere \\(x^2+y^2+(z-'+(2*a)+')^2='+(4*A2)+'\\)','the cone \\(z=\\sqrt{x^2+y^2}\\)','the plane \\(z='+(2*a)+'\\)','the cylinder \\(x^2+y^2='+(2*a)+'z\\)'],
      ['','That is ρ = '+(2*a)+'.','Multiply by ρ: x² + y² + z² = '+(2*a)+'z, then complete the square: centre (0,0,'+a+'), radius '+a+'.','A cone is φ = const.','A plane z = c is ρ cos φ = c.','Not a quadric of that shape.']],
    ['\\rho\\sin\\varphi='+a,['the cylinder \\(x^2+y^2='+A2+'\\)','the sphere \\(x^2+y^2+z^2='+A2+'\\)','the plane \\(z='+a+'\\)','the cone \\(z='+a+'\\sqrt{x^2+y^2}\\)','the plane \\(x='+a+'\\)','the cylinder \\(y^2+z^2='+A2+'\\)'],
      ['','ρ = '+a+' is the sphere; ρ sin φ is the distance from the z-axis.','ρ cos φ = '+a+' is the plane z = '+a+'.','A cone is φ = const.','x = ρ sin φ cos θ.','ρ sin φ = r measures distance from the z-axis, not the x-axis.']],
    ['\\rho\\cos\\varphi='+a,['the plane \\(z='+a+'\\)','the cylinder \\(x^2+y^2='+A2+'\\)','the sphere \\(x^2+y^2+z^2='+A2+'\\)','the cone \\(z=\\sqrt{x^2+y^2}\\)','the sphere \\(x^2+y^2+(z-'+a+')^2='+A2+'\\)','the plane \\(x='+a+'\\)'],
      ['','That is ρ sin φ = '+a+'.','That is ρ = '+a+'.','A cone is φ = const.','That is ρ = '+(2*a)+' cos φ.','z = ρ cos φ, not x.']],
    ['\\varphi=\\frac{\\pi}{3}',['the cone \\(z=\\sqrt{\\tfrac{x^2+y^2}{3}}\\)','the cone \\(z=\\sqrt{3(x^2+y^2)}\\)','the cone \\(z=\\sqrt{x^2+y^2}\\)','the half-plane \\(y=\\sqrt3\\,x,\\ x\\ge0\\)','the plane \\(z=\\tfrac12\\)','the sphere \\(x^2+y^2+z^2=\\tfrac{\\pi^2}{9}\\)'],
      ['','That cone has tan φ = r/z = 1/√3, so it is φ = π/6.','That is φ = π/4.','θ = π/3 is the half-plane.','A plane z = c is ρ cos φ = c.','ρ = const is a sphere.']]]);
  const opts=E[1].map((h,i)=>i===0?OK(h):NO(h,E[2][i]));
  return choiceQ(`In spherical coordinates, the surface \\(${E[0]}\\) is`,opts,'Use x = ρ sin φ cos θ, y = ρ sin φ sin θ, z = ρ cos φ, ρ² = x² + y² + z², ρ sin φ = r = √(x² + y²).',[['Translate with the conversion formulas; the answer is '+E[1][0]+'.','']],undefined,1);
}

/* ---------- 16.6: rectangle with density depending on y (F2023-Q7) ---------- */
function P_massRect(){
  const a=pick([2,4,6]), b=pick([2,3,4,6]), c=pick([1,2,3]);
  const yb=Rr(b*(3*c+2*b),3*(2*c+b)), xb=Rr(a,2);
  const P=(x,y)=>`\\(\\left(${T(Rs(x))},\\ ${T(Rs(y))}\\right)\\)`;
  const My=Rr(c*b*b*3+2*b*b*b,6), m=Rr(2*c*b+b*b,2);            /* per unit width in x */
  const opts=[OK(P(xb,yb)),NO(P(xb,[b,2]),'That is the centroid; the density grows with y, so ȳ moves up.'),NO(P(yb,xb),'Swapped the coordinates.'),
    NO(P(xb,Rmul(My,[a,1])),'Used the moment M_x without dividing by the mass.'),NO(P(xb,Rr(c*b*3+2*b*b,6)),'Divided M_x by the area instead of the mass.'),
    NO(P(Rr(a*(3*c+2*a),3*(2*c+a)),[b,2]),'Let the density shift x̄ instead of ȳ: ρ depends on y only.'),NO(P(xb,Rr(b*(2*c+b),2*(c+b))),'Slip in the moment integral ∫y(c + y) dy = cb²/2 + b³/3.')];
  return choiceQ(`Find the center of mass of the rectangle \\(0\\le x\\le ${a},\\ 0\\le y\\le ${b}\\) with density \\(\\rho(x,y)=${c}+y\\).`,opts,
    'x̄ = M_y/m and ȳ = M_x/m. The density does not depend on x, so x̄ is the midpoint; ȳ is pulled toward larger y.',
    [['',`m=\\int_0^{${a}}\\!\\int_0^{${b}}(${c}+y)\\,dy\\,dx=${T(Rs(Rmul(m,[a,1])))},\\qquad M_x=\\iint y(${c}+y)\\,dA=${T(Rs(Rmul(My,[a,1])))}`],['',`\\bar x=${T(Rs(xb))},\\qquad \\bar y=\\frac{M_x}{m}=${T(Rs(yb))}`]],
    {op:'ratio',num:CI(`y*(${c} + y)`,[['y','0',String(b)],['x','0',String(a)]]),den:CI(`${c} + y`,[['y','0',String(b)],['x','0',String(a)]]),pt:1,want:Rs(yb)},2);
}
/* ---------- 16.6: a lamina between two lines through the origin (S2023-Q12) ---------- */
function P_massLam(){
  const p=pick([1,2,3]), q=pick([0,'1/2',1].filter(x=>val(String(x))<p)), a=pick([1,2,3]), n=pick([0,1,2]), k=pick([1,2,3]);
  const qq=val(String(q)), ans=Rs(Rr((n+2)*a,n+3));
  const dis=[D_(Rs(Rr((n+1)*a,n+2)),'Used one power of x too few in the moment.'),D_(Rs(Rr(2*a,3)),n?'Ignored the density: that is the centroid of the triangle.':'—'),D_(Rs(Rr(a,2)),'Used the midpoint of [0, a].'),
    D_(Rs(Rr((n+3)*a,n+4)),'One power of x too many.'),D_(Rs(Rr((n+2)*a*a,n+3)),'Forgot to divide M_y by the mass.'),D_(Rs(Rr((n+2),(n+3))),'Dropped the length a.')].filter(d=>d.why!=='—');
  const lower=q===0?'the \\(x\\)-axis':q===1?'y=x':`y=\\tfrac12x`;
  const rhoT=n===0?String(k):`${k===1?'':k}x${n===1?'':'^{'+n+'}'}`;
  return valQ(`A plate occupies the region between \\(y=${p===1?'':p}x\\) and ${q===0?'the \\(x\\)-axis':'\\('+(q===1?'y=x':'y=\\tfrac12 x')+'\\)'} for \\(0\\le x\\le ${a}\\), with density \\(\\rho=${rhoT}\\)${n===0?' (constant)':''}. Find \\(\\bar x\\).`,
    ans,dis,'x̄ = M_y/m. Every vertical strip has length (p − q)x, so both integrals have the same factor and x̄ depends only on the density’s power of x.',
    [['',`m=\\int_0^{${a}}${k}x^{${n}}(${p}-${T(String(q))})x\\,dx,\\qquad M_y=\\int_0^{${a}}x\\cdot ${k}x^{${n}}(${p}-${T(String(q))})x\\,dx`],['',`\\bar x=\\frac{M_y}{m}=\\frac{${n+2}}{${n+3}}\\cdot ${a}=${T(ans)}`]],
    {op:'ratio',num:CI(`x*${k}*x^${n}`,[['y',`${qq}*x`,`${p}*x`],['x','0',String(a)]]),den:CI(`${k}*x^${n}`,[['y',`${qq}*x`,`${p}*x`],['x','0',String(a)]])},2);
}
/* ---------- 16.6: tetrahedron with variable density (F2019-Q8) ---------- */
function P_massTet(){
  const a=pick([1,2,3]), b=pick([1,2,3,4]), c=pick([2,3,4,6]), k=pick([1,2,3,6]), v=pick(['z','x']);
  const mass=Rr(k*a*b*c*(v==='z'?c:a),24), ans=Rs(mass);
  const s=v==='z'?c:a;
  const dis=[D_(Rs(Rr(k*a*b*c*s,6)),'Used ∭'+v+' dV = abc·'+s+'/6; the average of '+v+' over the tetrahedron is '+s+'/4, so it is abc·'+s+'/24.'),D_(Rs(Rr(k*a*b*c,6)),'That is k × volume; the density is not constant.'),
    D_(Rs(Rr(k*a*b*c*s,12)),'Used '+s+'/2 for the average of '+v+'.'),D_(Rs(Rr(k*a*b*c*(v==='z'?a:c),24)),'Used the wrong intercept for '+v+'.'),D_(Rs(Rr(k*a*b*c*s,18)),'Used '+s+'/3 for the average of '+v+'.'),D_(Rs(Rr(a*b*c*s,24)),'Forgot the constant '+k+'.')];
  return valQ(`Find the mass of the tetrahedron with vertices \\((0,0,0)\\), \\((${a},0,0)\\), \\((0,${b},0)\\) and \\((0,0,${c})\\) if its density is \\(\\rho=${k===1?'':k}${v}\\).`,ans,dis,
    'm = ∭ρ dV. For a linear density, m = volume × (density at the centroid); the centroid of this tetrahedron is (a/4, b/4, c/4).',
    [['',`m=\\iiint ${k===1?'':k}${v}\\,dV=${k}\\cdot\\frac{${a}\\cdot ${b}\\cdot ${c}}{6}\\cdot\\frac{${s}}{4}=${T(ans)}`]],
    CI(`${k}*${v}`,[['z','0',`${c}*(1 - x/${a} - y/${b})`],['y','0',`${b}*(1 - x/${a})`],['x','0',String(a)]]),2);
}
/* ---------- 16.6: unit cube with density αx + βyz (S2022-Q1) ---------- */
function P_massCube(){
  const al=pick([1,2,3]), be=pick([1,2,4]), w=pick(['x','z']);
  const m=Rr(6*al+3*be,12);                                      /* α/2 + β/4 */
  const M=w==='x'?Rr(8*al+3*be,24):Rr(3*al+2*be,12);             /* x: α/3 + β/8 ; z: α/4 + β/6 */
  const ans=Rs(Rmul(M,[m[1],m[0]]));
  const dis=[D_('1/2','That is the centroid; the density is not uniform.'),D_(Rs(M),'That is the moment; divide by the mass.'),D_(Rs(m),'That is the mass.'),
    D_(Rs(Rmul(w==='x'?Rr(3*al+2*be,12):Rr(8*al+3*be,24),[m[1],m[0]])),'Used the moment for the other coordinate.'),D_(Rs(Rmul(M,[2,1])),'Divided by the volume 1/2… instead of the mass.'),D_(Rs(Rmul(Rr(al+be,2),[m[1],m[0]])),'Integrated x·ρ as ρ/2.')];
  return valQ(`A solid cube \\(0\\le x,y,z\\le 1\\) has density \\(\\rho=${al===1?'':al}x+${be===1?'':be}yz\\). Find the \\(${w}\\)-coordinate of its center of mass.`,ans,dis,
    (w==='x'?'x̄ = M_yz/m = ∭xρ dV / ∭ρ dV':'z̄ = M_xy/m = ∭zρ dV / ∭ρ dV')+'; on the unit cube each monomial integrates to a product of 1/(power + 1).',
    [['',`m=\\iiint(${al}x+${be}yz)\\,dV=${T(Rs(m))},\\qquad ${w==='x'?'M_{yz}':'M_{xy}'}=\\iiint ${w}(${al}x+${be}yz)\\,dV=${T(Rs(M))}`],['',`\\bar ${w}=${T(ans)}`]],
    {op:'ratio',num:CI(`${w}*(${al}*x + ${be}*y*z)`,[['z','0','1'],['y','0','1'],['x','0','1']]),den:CI(`${al}*x + ${be}*y*z`,[['z','0','1'],['y','0','1'],['x','0','1']])},2);
}
/* ---------- 16.6: where is the center of mass of a hemisphere? (16.6 #56, #36–38: a conceptual twist) ---------- */
function P_massHemi(){
  const a=pick([1,2,3,4,8]), d=pick(['const','z','rho']);
  const vals={const:Rr(3*a,8),z:Rr(8*a,15),rho:Rr(2*a,5)}, ans=Rs(vals[d]);
  const dT={const:'constant density',z:'density proportional to the height \\(z\\)',rho:'density proportional to the distance from the origin'}[d];
  const nm={const:'uniform',z:'density ∝ z',rho:'density ∝ distance from the centre'};
  const dis=[...Object.keys(vals).filter(k=>k!==d).map(k=>D_(Rs(vals[k]),'That is z̄ for a '+nm[k]+' hemisphere.')),D_(Rs(Rr(a,2)),'Used the midpoint of the height.'),
D_(Rs(Rr(3*a,4)),'Used 3/4: that is a cone measured from its vertex.'),D_(Rs(Rr(a,3)),'Used 1/3 (a triangle or cone from its base).'),D_(Rs(Rr(2*a,3)),'Used 2/3.')].filter(x=>x.why!=='—');
  return valQ(`A solid hemisphere \\(x^2+y^2+z^2\\le ${a*a},\\ z\\ge 0\\) has ${dT}. Find \\(\\bar z\\).`,ans,dis,
    'z̄ = ∭zρ dV / ∭ρ dV in spherical coordinates (z = ρ cos φ, φ from 0 to π/2). Heavier material higher up pushes z̄ up.',
    [['',`\\bar z=\\frac{\\iiint z\\rho\\,dV}{\\iiint\\rho\\,dV}=${T(ans)}`]],
    {op:'ratio',num:CI(`rho*cos(ph)*${d==='const'?'1':d==='z'?'rho*cos(ph)':'rho'}*rho^2*sin(ph)`,[['rho','0',String(a)],['ph','0','pi/2'],['th','0','2*pi']]),den:CI(`${d==='const'?'1':d==='z'?'rho*cos(ph)':'rho'}*rho^2*sin(ph)`,[['rho','0',String(a)],['ph','0','pi/2'],['th','0','2*pi']])},3);
}
/* ---------- 16.6: centroids in polar coordinates (sprint, 16.6 #45–50) ---------- */
function P_massPolar(){
  const R=pick([1,2,3,6]), kind=pick(['semi','quarter']);
  const key=`${4*R}/(3pi)`;
  return valQ(kind==='semi'?`Find \\(\\bar y\\) for the half-disk \\(x^2+y^2\\le ${R*R},\\ y\\ge0\\) (constant density).`:`Find \\(\\bar x\\) for the quarter disk \\(x^2+y^2\\le ${R*R},\\ x,y\\ge0\\) (constant density).`,key,
    [D_(`${R}/2`,'Used the midpoint of the radius.'),D_(`${4*R}/3`,'Lost the π from the area.'),D_(`${2*R}/(3pi)`,'Used half the moment.'),D_(`${R*R}/(3pi)`,'Wrong power of R.')],
    'ȳ = (1/A)∬y dA with A = πR²/'+(kind==='semi'?2:4)+'; in polar ∬ r sin θ · r dr dθ.',[['',`\\bar ${kind==='semi'?'y':'x'}=\\frac{4R}{3\\pi}=${T(key)}`]],
    {op:'ratio',num:CI(kind==='semi'?'r^2*sin(t)':'r^2*cos(t)',[['r','0',String(R)],['t','0',kind==='semi'?'pi':'pi/2']]),den:CI('r',[['r','0',String(R)],['t','0',kind==='semi'?'pi':'pi/2']])},2);
}
