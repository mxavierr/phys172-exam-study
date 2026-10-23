/* ==== 30 · mock exam generators ==========================================
   MOCK EXAM 2 · FA26 format: 15 MC × 16 pts = 240. Slot order = Practice Exam 2;
   each slot applies tweaks seen on the five past Exam 2s. g = 10 m/s² (XG).
   Linked sets: Q8–9 (track) and Q13–15 (spring launch: systems, h_max, t_max).

   Item shape: {stem, fig, opts:[{h, v, why, ok?, nota?, py?}], key, sol, how, chk,
                group?:{setup, fig, from, to}}
     opts[key].ok is true; "None of these" (nota) is never keyed;
     why = what choosing that wrong option usually means (shown in review and drill);
     py  = a Python expression for symbolic options so an outside checker can substitute numbers;
     chk.k (+ fields) names the VARIANT; 70_skills.js xSub() turns it into a variant id.
   Adding a variant: give it a distinct chk.k (or chk field), then add it to xSub, SUBL and
   (if it changes a trait) the tag sets in 70_skills.js. tests/t_content.py fails until you do.
   ======================================================================== */
const XG=10, XPTS=16, XMIN=70;
/* One row per exam slot, in exam order. pace = seconds a well-prepared student should need
   (conceptual slots faster, multi-step slots slower; total ≈ 50 of the real exam's 60 minutes). */
const XSLOTS=[
  {t:'W-sign',name:'Sign of work',pace:150},{t:'W-speed',name:'Work → final speed',pace:240},{t:'W-rod',name:'Work by a rod or seat',pace:210},
  {t:'PE-diag',name:'Potential energy diagram',pace:240},{t:'Q+W',name:'Heat and work',pace:180},{t:'Calor',name:'Calorimetry',pace:210},
  {t:'Charges',name:'Charges released',pace:240},{t:'Track-v',name:'Track: speed',pace:210},{t:'Track-N',name:'Track: normal force',pace:180},
  {t:'Spring',name:'Spring and push',pace:240},{t:'Drag',name:'Air resistance',pace:180},{t:'VSpring',name:'Vertical spring equation',pace:210},
  {t:'Systems',name:'Choosing the system',pace:180},{t:'Launch-h',name:'Launch: maximum height',pace:210},{t:'Launch-t',name:'Launch: time to the top',pace:150}];
const XTOT=XSLOTS.length*XPTS;
const XPACE=XSLOTS.map(s=>s.pace);
const XNOTA='None of these';
function shuf(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
const farNum=(a,b,rel)=>{ if(a===b)return false; const m=Math.max(Math.abs(a),Math.abs(b)); return m>0&&Math.abs(a-b)/m>=rel; };
/* correct {h,v,py?}; dis [{h,v,why,py?}] → five options (four + "None of these", or five); numeric v's ≥5% apart.
   py = a Python expression for the option, so the independent checker can verify symbolic answers by substitution. */
function mc(correct,dis,o){
  o=o||{}; const rel=o.rel==null?0.05:o.rel;
  const ok=(x,y)=>x.h!==y.h&&(typeof x.v!=='number'||typeof y.v!=='number'||farNum(x.v,y.v,rel));
  const chosen=[];
  shuf(dis).forEach(d=>{
    if(!d||d.v===undefined||(typeof d.v==='number'&&!Number.isFinite(d.v)))return;
    if(ok(correct,d)&&chosen.every(c=>ok(c,d))) chosen.push(d);
  });
  let nota=o.nota==null?Math.random()<0.5:o.nota;
  if(chosen.length<3) return null;
  if(chosen.length<4) nota=true;
  const list=shuf([{h:correct.h,v:correct.v,why:null,ok:true,py:correct.py}].concat(chosen.slice(0,nota?3:4)));
  if(nota) list.push({h:o.notaText||XNOTA,v:'NOTA',why:o.notaWhy||null,nota:true});
  return {opts:list,key:list.findIndex(x=>x.ok)};
}
const fixed=(list,last)=>{ const o=shuf(list); if(last) o.push(last); return {opts:o,key:o.findIndex(x=>x.ok)}; };
const O=(h,why,ok)=>({h,v:h,why:ok?null:why,ok:!!ok});
const xn=(v,n)=>sci(v,n||3);
const rt=n=>`√${+(+n).toPrecision(3)}`;                     /* √n display */
const xroll=fn=>{ for(let i=0;i<80;i++){ try{ const r=fn(); if(r) return r; }catch(e){ if(i>70) throw e; } } throw new Error('could not build '+fn.name); };

/* ---------------------------------------------------------------- Q1 · sign of work */
function x1(){
  const kind=pick(['circ','ellipse','ellipse','ball']);
  if(kind==='circ'){
    const who=pick([['the Moon','Earth\'s gravity','Earth'],['a satellite','Earth\'s gravity','Earth'],['a ball whirled on a string in a horizontal circle','the string','string']]);
    const isStr=who[2]==='string';
    const r=fixed([O(`No work is done on ${who[0]} by ${who[1]}.`,null,true),
      O(`${who[1][0].toUpperCase()+who[1].slice(1)} does positive work, keeping ${who[0]} moving.`,'That force is perpendicular to the velocity at every instant, so W = F·Δr = 0.'),
      O(`No work is done because the net force on ${who[0]} is zero.`,'The net force is not zero: it points to the center. The work is zero because it is perpendicular to the motion.'),
      O(`${who[1][0].toUpperCase()+who[1].slice(1)} does negative work, slowly pulling ${who[0]} inward.`,'A circular path at constant speed keeps the same radius and kinetic energy: no work.'),
      O(`The work done by ${who[1]} is what makes ${who[0]} move in a circle.`,'Turning needs a force, not work: a perpendicular force changes direction, not speed.')]);
    return {stem:`${who[0][0].toUpperCase()+who[0].slice(1)} moves at constant speed in a circle${isStr?'':' around Earth'}. Which statement is most correct?`,fig:'',...r,
      sol:[[`${who[1][0].toUpperCase()+who[1].slice(1)} points to the center, perpendicular to the velocity, so F·Δr = 0 over every small step.`,X`W=|\mathbf F||\Delta\mathbf r|\cos 90^\circ=0`]],
      how:'W = F·Δr; a force perpendicular to the motion does no work (circular orbit, string tension).',chk:{k:'x1-circ'}};
  }
  if(kind==='ball'){
    const air=Math.random()<0.4;
    const r=fixed(air?[O('Negative on the way up and negative on the way down.',null,true),
        O('Negative on the way up and positive on the way down.','That is gravity. Air resistance always opposes the velocity, so its work is negative both ways.'),
        O('Positive on the way up and negative on the way down.','Air resistance points opposite the motion, so it is never positive.'),
        O('Zero, because the ball returns to the same height.','Only gravity\'s round-trip work cancels; air resistance takes energy out both ways.')]
      :[O('Negative on the way up and positive on the way down.',null,true),
        O('Positive on the way up and negative on the way down.','Going up, gravity (down) is opposite the displacement (up): negative.'),
        O('Negative on the way up and negative on the way down.','Coming down, gravity and the displacement point the same way: positive.'),
        O('Zero in both directions, because gravity is conservative.','Conservative means the round trip adds to zero; each half is not zero.')],O(XNOTA,null,false));
    r.opts[4].nota=true;
    return {stem:`A ball is thrown straight up and falls back to the thrower's hand. What is the sign of the work done on the ball by ${air?'air resistance':'Earth\'s gravity'}?`,fig:'',...r,
      sol:[[air?'Air resistance points opposite the velocity in both halves of the trip.':'Up: force down, displacement up (θ = 180°). Down: both downward (θ = 0°).',X`W=|\mathbf F||\Delta\mathbf r|\cos\theta`]],
      how:'Sign of W: + when F and Δr point the same way, − when opposite; slowing down ⇔ W < 0.',chk:{k:'x1-ball',air}};
  }
  const dir=pick(['ccw','cw']), t0=pick([0,60,120,180,240,300]), ts=[0,60,120,180,240,300].map((t,i)=>({n:i+1,t:(t+t0)%360}));
  /* star at the left focus: moving ccw, the planet approaches the star for 0 < t < 180 */
  const sign=t=>{ const a=118,b=72,c=Math.sqrt(a*a-b*b), x=a*Math.cos(t*D2R), y=b*Math.sin(t*D2R), vx=-a*Math.sin(t*D2R)*(dir==='ccw'?1:-1), vy=b*Math.cos(t*D2R)*(dir==='ccw'?1:-1);
    const d=(-c-x)*vx+(0-y)*vy; return Math.abs(d)<1e-6?0:Math.sign(d); };
  ts.forEach(p=>p.s=sign(p.t));
  const want=pick([1,-1,0]), set=ts.filter(p=>p.s===want).map(p=>p.n), opp=ts.filter(p=>p.s===-want&&want!==0).map(p=>p.n), zer=ts.filter(p=>p.s===0).map(p=>p.n);
  const nm=a=>a.length===2?`${a[0]} and ${a[1]}`:a.join(', ');
  const word={1:'positive',[-1]:'negative',0:'zero'}[want];
  const cands=[O(`Points ${nm(set)}`,null,true)];
  if(want!==0) cands.push(O(`Points ${nm(opp)}`,'Check the direction of motion: the work is positive where the planet is moving toward the star (speeding up).'));
  if(want!==0) cands.push(O(`Points ${nm(zer)}`,'At the ends of the long axis the velocity is perpendicular to the force, so the work there is zero.'));
  else { const pos=ts.filter(p=>p.s===1).map(p=>p.n), neg=ts.filter(p=>p.s===-1).map(p=>p.n);
    cands.push(O(`Points ${nm(pos)}`,'There the planet is moving toward the star, so gravity does positive work.'));
    cands.push(O(`Points ${nm(neg)}`,'There the planet is moving away from the star, so gravity does negative work.')); }
  cands.push(O('All six points','The sign changes around the orbit: positive approaching the star, negative moving away.'));
  cands.push(O('None of the points','Over a whole orbit the work adds to zero, but not at each point.'));
  const r=fixed(cands.slice(0,5));
  return {stem:`A planet moves in an elliptical orbit around a star (see figure; the arrow shows the direction of motion). At which numbered points is the work done on the planet by the star's gravity, over a short time interval, ${word}?`,
    fig:FIG.eOrbit(ts,dir),...r,
    sol:[['Gravity points from the planet to the star. The work is positive where the angle between that force and the velocity is less than 90° (the planet is approaching the star and speeding up), negative where it is greater, and zero at the two ends of the long axis.',''],
         [`Here that makes points ${nm(set)} ${word}.`,'']],
    how:'Elliptical orbit: W > 0 approaching the star, W < 0 receding, W = 0 at closest and farthest points.',chk:{k:'x1-ellipse',dir,pts:ts.map(p=>[p.n,p.t]),want}};
}

/* ---------------------------------------------------------------- Q2 · work → final speed */
function x2(){
  const kind=pick(['sqrt','sqrt','num','3d']);
  if(kind==='3d'){
    const m=pick([200,300,400]), vi=pick([1,2,3]), r0=[ri(1,5),ri(1,5),ri(0,3)], d1=[ri(1,3),ri(1,3),ri(1,2)], d2=[ri(1,3),ri(-1,3),ri(1,2)];
    const F1=[pick([100,150,200]),pick([100,200,250]),pick([50,100])], F2=[pick([150,200,250]),pick([100,200]),pick([50,100,150])];
    const r1=r0.map((x,i)=>x+d1[i]), r2=r1.map((x,i)=>x+d2[i]), W1=F1[0]*d1[0]+F1[1]*d1[1]+F1[2]*d1[2], W2=F2[0]*d2[0]+F2[1]*d2[1]+F2[2]*d2[2];
    const v=Math.sqrt(vi*vi+2*(W1+W2)/m), H=x=>`${xn(x)} m/s`, V=(x,why)=>({h:H(x),v:x,why});
    const r=mc({h:H(v),v},[V(Math.sqrt(vi*vi+2*W1/m),'Left out the second thruster\'s work.'),V(Math.sqrt(2*(W1+W2)/m),'Forgot the initial kinetic energy.'),
      V(Math.sqrt(vi*vi+(W1+W2)/m),'Dropped the ½ in K = ½mv² on one side.'),V(vi+Math.sqrt(2*(W1+W2)/m),'Added speeds; energies add, speeds do not.'),
      V(Math.sqrt(vi*vi+2*(Math.hypot(...F1)*Math.hypot(...d1)+Math.hypot(...F2)*Math.hypot(...d2))/m),'Multiplied magnitudes; use the dot product F·Δr.')]);
    return r&&{stem:`A ${m} kg spacecraft moving at ${vi} m/s is at ${vec(...r0)} m. Thruster 1 exerts a constant ${vec(...F1)} N while it moves to ${vec(...r1)} m; thruster 2 then exerts ${vec(...F2)} N while it moves to ${vec(...r2)} m. What is its final speed?`,
      fig:'',...r,sol:[['Work in each stage is a dot product.',X`W_1=${tn(W1)}\ \text{J},\qquad W_2=${tn(W2)}\ \text{J}`],
        ['Energy Principle for the spacecraft.',X`\tfrac12mv_f^2=\tfrac12mv_i^2+W_1+W_2\quad\Rightarrow\quad v_f=${tn(v)}${U('m/s')}`]],
      how:'K_f = K_i + Σ F·Δr',chk:{k:'x2-3d',m,vi,r0,r1,r2,F1,F2}};
  }
  let m,v0,F1,d1,F2,d2,v2,tries=0;
  do{ m=pick(kind==='num'?[120,150,170,200]:[50,100,200]); v0=kind==='num'?rf(3,7,1):pick([2,3,4,5,6]);
      F1=pick([10,20,40,62,80]); d1=pick([2,4,5,8.8,10]); F2=pick([15,34.6,35,50,60]); d2=pick([2.8,5,8,10]);
      v2=v0*v0+2*(F1*d1-F2*d2)/m; tries++;
  }while((v2<=1||(kind==='sqrt'&&Math.abs(v2-Math.round(v2))>1e-9))&&tries<400);
  if(v2<=1||(kind==='sqrt'&&Math.abs(v2-Math.round(v2))>1e-9)) return null;
  const W1=F1*d1, W2=F2*d2;
  const alt=[[v0*v0+2*(W1+W2)/m,'Counted the backward push as positive work; a push against the motion does negative work.'],
             [2*(W1-W2)/m,'Forgot the crate\'s initial kinetic energy.'],[v0*v0+2*(W2-W1)/m,'Swapped the signs of the two works.'],
             [v0*v0+(W1-W2)/m,'Dropped a factor of 2 from K = ½mv².'],[v0*v0+2*(F1-F2)/m,'Used the forces instead of the work (force × distance).']];
  const sq=kind==='sqrt';
  const H=x=>sq?`${rt(x)} m/s`:`${xn(Math.sqrt(x))} m/s`;
  const r=mc({h:H(v2),v:sq?v2:Math.sqrt(v2),py:sq?null:null},alt.filter(a=>a[0]>0).map(a=>({h:H(a[0]),v:sq?a[0]:Math.sqrt(a[0]),why:a[1]})));
  return r&&{stem:`A ${m} kg crate glides through a space station at ${v0} m/s. An astronaut pushes it from behind with a constant ${F1} N through ${d1} m, then from the front, backward, with ${F2} N through ${d2} m. What is the crate's final speed?`,
    fig:'',...r,sol:[['Work: the push from behind is along the motion, the push from the front opposes it.',X`W=(${F1})(${d1})-(${F2})(${d2})=${tn(W1-W2)}${U('J')}`],
      ['Energy Principle for the crate.',X`\tfrac12mv_f^2=\tfrac12(${m})(${v0})^2+${tp(W1-W2)}\quad\Rightarrow\quad v_f^2=${tn(v2)}\ \text{m}^2/\text{s}^2,\quad v_f=${sq?rt(v2):tn(Math.sqrt(v2))}${U('m/s')}`]],
    how:'K_f = K_i + W₁ − W₂ (the push against the motion does negative work)',chk:{k:'x2-push',m,v0,F1,d1,F2,d2}};
}

/* ---------------------------------------------------------------- Q3 · work by a rod or seat */
function x3(){
  const seat=Math.random()<0.45, m=seat?pick([60,80,90]):pick([2,4,5,6,8]), R=seat?pick([5,6,12]):pick([1,1.5,2,3]), v=pick([3,4,6,8]);
  const Y={A:1,B:0,C:-1,D:0}, from=pick(['A','B','C','D']), to=pick(['A','B','C','D'].filter(x=>x!==from&&!(Y[x]===Y[from]&&Math.random()<0.7))), dir=pick(['cw','ccw']);
  const dy=R*(Y[to]-Y[from]), W=m*XG*dy, H=x=>`${x>0?'+':''}${xn(x)} J`;
  const dis=[{h:H(-W),v:-W,why:'That is gravity\'s work. The rod cancels it, because ΔK = 0.'},{h:H(0.5*m*v*v),v:0.5*m*v*v,why:'The speed never changes, so ΔK = 0; the speed is a distractor.'},
    {h:H(m*XG*R*Math.PI/2*Math.sign(W||1)),v:m*XG*R*Math.PI/2*Math.sign(W||1),why:'Gravity\'s work depends only on the change in height, not on the arc length.'},
    {h:H(W/2),v:W/2,why:'Use the full change in height between the two points.'},{h:H(2*W||2*m*XG*R),v:2*W||2*m*XG*R,why:'Read the heights from the figure: compare the two points\' heights.'}];
  if(W!==0) dis.push({h:'0 J',v:0,why:'The rod is not perpendicular to the motion here: to keep the speed constant against gravity it must push along the path too.'});
  else dis.push({h:H(m*XG*R),v:m*XG*R,why:'The two points are at the same height, so gravity\'s net work, and the rod\'s, is zero.'},{h:H(-m*XG*R),v:-m*XG*R,why:'The two points are at the same height.'});
  const r=mc({h:W===0?'0 J':H(W),v:W},dis);
  const who=seat?`A ${m} kg rider sits in a seat on a Ferris wheel of radius ${R} m that turns at a constant speed of ${v} m/s`:`A ${m} kg ball on a light rigid rod swings in a vertical circle of radius ${R} m at a constant speed of ${v} m/s`;
  return r&&{stem:`${who} (see figure). What is the work done by the ${seat?'seat on the rider':'rod on the ball'} as it moves from ${from} to ${to}? Use g = 10 m/s².`,
    fig:FIG.eCircle(from,dir,seat),...r,
    sol:[['System: the ball; surroundings: rod and Earth. The speed is constant, so ΔK = 0.',X`0=W_{\text{${seat?'seat':'rod'}}}+W_{\text{grav}}\quad\Rightarrow\quad W_{\text{${seat?'seat':'rod'}}}=+mg\,\Delta y`],
         [`From ${from} to ${to}, Δy = ${tn(dy)} m.`,X`W=(${m})(10)(${tn(dy)})=${tn(W)}${U('J')}`]],
    how:'Constant speed: W_rod = −W_grav = +mgΔy (positive going up, zero for equal heights).',chk:{k:'x3',m,R,from,to,seat}};
}

/* ---------------------------------------------------------------- Q4 · potential energy diagram */
function x4(){
  const D=rd(pick([1.2,1.4,1.5,1.6,1.8]),1), E=-rd(pick([0.2,0.3,0.4,0.5]),1);
  let U1=-rd(rf(E*-1+0.4,D-0.2,1),1); if(U1<=-D) U1=rd(-D+0.2,1); if(U1>=E-0.2) return null;
  const s1=pick(['in','out']), kind=pick(['triple','triple','dK','unbind']);
  const U2=-D, pts=[{u:U1,side:s1,guide:true},{u:U2,side:'out',guide:true},{u:E,side:'out'}];
  const fig=FIG.eWell({D,E,pts}), f1=v=>v.toFixed(1).replace('-','−');
  const intro=`The figure shows the potential energy U(r) of two interacting neutral atoms. The pair is in the state shown by the horizontal line (K + U).`;
  if(kind==='triple'){
    const T=(a)=>a.map((p,i)=>`At r${['₁','₂','₃'][i]}: K = ${f1(p[0])} eV, U = ${f1(p[1])} eV`).join('<br>');
    const good=[[E-U1,U1],[E-U2,U2],[0,E]];
    const cands=[{h:T(good),v:'good',py:null},
      {h:T([[-U1,U1],[-U2,U2],[-E,E]]),v:'abs',why:'K is the gap between the line and the curve, K = (K + U) − U, not |U|.'},
      {h:T([[E-U1,U1],[E-U2,U2],[0,0]]),v:'u3',why:'At r₃ the curve meets the line, so U = K + U there, not zero.'},
      {h:T([[E-U1+0.2,rd(U1-0.2,1)],[E-U2,U2],[0,E]]),v:'misread',why:'Read U at r₁ from the curve directly below the mark; K + U must equal the line at every r.'},
      {h:T([[E-U1-0.2,U1],[E-U2-0.2,U2],[0,E]]),v:'shift',why:'Check K + U at each point: it must equal the horizontal line.'},
      {h:T([[U1-E,U1],[U2-E,U2],[0,E]]),v:'neg',why:'K can never be negative: it is the line minus the curve.'}];
    const r=mc(cands[0],cands.slice(1));
    return r&&{stem:intro+' What are the approximate kinetic energy K and potential energy U at each of r₁, r₂ and r₃?',fig,...r,
      sol:[['Read U from the curve below each mark; K is the gap up to the line.',X`K=(K+U)-U=${tn(E)}-U`],
           ['',X`r_1:\ K=${tn(E-U1)},\ U=${tn(U1)};\qquad r_2:\ K=${tn(E-U2)},\ U=${tn(U2)};\qquad r_3:\ K=0,\ U=${tn(E)}\ \text{(eV)}`]],
      how:'U from the curve; K + U is the horizontal line; K = gap ≥ 0; K = 0 at the turning point.',chk:{k:'x4-triple',E,U:[U1,U2,E]}};
  }
  if(kind==='dK'){
    const dK=U1-U2, dU=U2-U1, P=(a,b)=>`ΔK = ${a>0?'+':''}${f1(a)} eV, ΔU = ${b>0?'+':''}${f1(b)} eV`;
    const r=mc({h:P(dK,dU),v:'g'},[{h:P(-dK,-dU),v:'s',why:'Moving from r₁ to r₂ the curve goes down, so U decreases and K increases by the same amount.'},
      {h:P(dK,dK),v:'b',why:'Total energy is constant, so ΔK = −ΔU: they have opposite signs.'},{h:P(E-U2,U2),v:'v',why:'Those are the values at r₂, not the changes from r₁.'},
      {h:P(dK,0),v:'x',why:'U changes too; with K + U constant, ΔU = −ΔK.'}]);
    return r&&{stem:intro+' What are the changes in kinetic and potential energy, ΔK and ΔU, as the separation goes from r₁ to r₂?',fig,...r,
      sol:[['Read U at both points; K + U stays on the line.',X`\Delta U=U_2-U_1=${tn(U2)}-(${tn(U1)})=${tn(dU)}\ \text{eV},\qquad\Delta K=-\Delta U=${tn(dK)}\ \text{eV}`]],
      how:'K + U is constant, so ΔK = −ΔU.',chk:{k:'x4-dK',E,U:[U1,U2]}};
  }
  const H=x=>`${f1(x)} eV`;
  const r=mc({h:H(-E),v:-E},[{h:H(-U2),v:-U2,why:'That would be needed starting from the bottom of the well at rest; this pair already has K + U = '+f1(E)+' eV.'},
    {h:H(E-U1),v:E-U1,why:'That is the kinetic energy at r₁, not the energy needed to separate the atoms.'},{h:H(-U1),v:-U1,why:'Use the total energy line, not U at one point.'},
    {h:H(0),v:0,why:'The pair is bound (K + U < 0), so it needs energy to separate.'},{h:H(-2*E),v:-2*E,why:'Only enough to bring K + U up to zero.'}]);
  return r&&{stem:intro+' What is the minimum energy that must be added to break the pair apart?',fig,...r,
    sol:[['Unbound means K + U ≥ 0 (U → 0 far apart). Raise the total energy from the line to zero.',X`E_{\min}=0-(${tn(E)})=${tn(-E)}${U('eV')}`]],
    how:'Minimum energy to unbind = −(K + U).',chk:{k:'x4-unbind',E}};
}

/* ---------------------------------------------------------------- Q5 · heat and work */
function x5(){
  const kind=pick(['sum','sum','lost','dT']);
  if(kind==='sum'){
    const Q=pick([5000,4000,3000,-1500,-2500]), W=pick([2000,1500,3000,4500]), H=x=>`${xn(x)} J`;
    const r=mc({h:H(Q+W),v:Q+W},[{h:H(Q-W),v:Q-W,why:'Stirring does positive work ON the water: ΔE = Q + W.'},{h:H(W-Q),v:W-Q,why:'Watch the sign of Q: heat in is positive, heat out negative.'},
      {h:H(Math.abs(Q)),v:Math.abs(Q),why:'The stirring work also adds thermal energy.'},{h:H(W),v:W,why:'The heat also changes the thermal energy.'},{h:H(Math.abs(Q)+W),v:Math.abs(Q)+W,why:'Heat flowing OUT of the water is negative.'}]);
    return r&&{stem:`1 kg of water in a pot ${Q>0?`absorbs ${Q} J of heat from a fire`:`loses ${-Q} J of heat to the room`} while you stir it, doing ${W} J of work on it. What is the change in the water's thermal energy?`,fig:'',...r,
      sol:[['Energy Principle with heat: work done on the system and heat into it both add.',X`\Delta E_{\text{int}}=Q+W=${tn(Q)}+${W}=${tn(Q+W)}${U('J')}`]],how:'ΔE_int = Q + W_surr; Q < 0 when heat leaves.',chk:{k:'x5-sum',Q,W}};
  }
  const M=pick([0.6,1,2,2.5]), C=pick([3800,4200,4400]), dT=pick([0.2,0.4,0.5,1]), W=pick([5300,7000,8000,9000]), dE=M*C*dT;
  if(kind==='lost'){ const Ql=W-dE; if(Ql<=0) return null; const H=x=>`${xn(x)} J`;
    const r=mc({h:H(Ql),v:Ql},[{h:H(dE),v:dE,why:'That is the thermal energy the liquid kept; the rest of the work leaked out.'},{h:H(W),v:W,why:'Not all the work leaked out: some warmed the liquid.'},
      {h:H(W+dE),v:W+dE,why:'Q = MCΔT − W; heat lost is the difference, not the sum.'},{h:H(dE/2),v:dE/2,why:'Use ΔE = MCΔT in full.'}]);
    return r&&{stem:`In a poorly insulated container, a paddle does ${W} J of work stirring ${M} kg of liquid (C = ${C} J/(kg·K)). The liquid's temperature rises by only ${dT} K. How much heat, |Q|, leaked out?`,fig:'',...r,
      sol:[['Thermal energy gained.',X`\Delta E=MC\Delta T=(${M})(${C})(${dT})=${tn(dE)}${U('J')}`],['ΔE = Q + W, so the heat is negative: energy leaked out.',X`Q=\Delta E-W=${tn(dE)}-${W}=${tn(-Ql)}\ \text{J}\quad\Rightarrow\quad|Q|=${tn(Ql)}${U('J')}`]],
      how:'MCΔT = Q + W, so Q = MCΔT − W.',chk:{k:'x5-lost',M,C,dT,W}}; }
  const Q=pick([2000,3000,5000]), dTr=(Q+W)/(M*C), H=x=>`${xn(x)} K`;
  const r=mc({h:H(dTr),v:dTr},[{h:H(Q/(M*C)),v:Q/(M*C),why:'The stirring work also raises the temperature.'},{h:H((W-Q)/(M*C)),v:(W-Q)/(M*C),why:'Heat into the liquid adds: Q + W.'},
    {h:H(W/(M*C)),v:W/(M*C),why:'The heat also raises the temperature.'},{h:H((Q+W)/C),v:(Q+W)/C,why:'Divide by the mass too: ΔE = MCΔT.'}]);
  return r&&{stem:`${M} kg of liquid (C = ${C} J/(kg·K)) absorbs ${Q} J of heat from a burner while a paddle does ${W} J of work stirring it. By how much does its temperature rise?`,fig:'',...r,
    sol:[['',X`MC\Delta T=Q+W\quad\Rightarrow\quad\Delta T=\frac{${Q}+${W}}{(${M})(${C})}=${tn(dTr)}${U('K')}`]],how:'ΔT = (Q + W)/(MC).',chk:{k:'x5-dT',M,C,Q,W}};
}

/* ---------------------------------------------------------------- Q6 · calorimetry */
function x6(){
  const kind=pick(['eq','eq','ratio','Tf','same']);
  if(kind==='eq'){
    const S=(a,b)=>`${a}<sub>${b}</sub>`, L_='L', P_='P';
    const t=(x,y)=>`(${S('T','f')} − ${S('T',y)})`, tr=(y)=>`(${S('T',y)} − ${S('T','f')})`, mc_=y=>`${S('M',y)}${S('C',y)}`;
    const good=pick([{h:`${mc_(L_)}${t(0,L_)} + ${mc_(P_)}${t(0,P_)} = 0`,py:'ML*CL*(T-TL)+MP*CP*(T-TP)'},
                     {h:`${mc_(L_)}${tr(L_)} = ${mc_(P_)}${t(0,P_)}`,py:'ML*CL*(TL-T)-MP*CP*(T-TP)'}]);
    const r=mc({h:good.h,v:good.h,py:good.py},[
      {h:`${mc_(L_)}${t(0,L_)} = ${mc_(P_)}${t(0,P_)}`,v:1,py:'ML*CL*(T-TL)-MP*CP*(T-TP)',why:'One object warms and the other cools: their energy changes have opposite signs, so they add to zero.'},
      {h:`${mc_(L_)}${t(0,L_)} + ${mc_(P_)}${tr(P_)} = 0`,v:2,py:'ML*CL*(T-TL)+MP*CP*(TP-T)',why:'Write every ΔT as final minus initial; this flips one of them.'},
      {h:`${mc_(L_)}${S('T',L_)} + ${mc_(P_)}${S('T',P_)} = 0`,v:3,py:'ML*CL*TL+MP*CP*TP',why:'Use temperature changes, not temperatures.'},
      {h:`${S('M',L_)}${t(0,L_)} + ${S('M',P_)}${t(0,P_)} = 0`,v:4,py:'ML*(T-TL)+MP*(T-TP)',why:'The specific heats matter: different materials need different energy per degree.'},
      {h:`${mc_(L_)}${t(0,L_)} + ${mc_(P_)}${t(0,P_)} = ${mc_(L_)}${S('T',L_)}`,v:5,py:'ML*CL*(T-TL)+MP*CP*(T-TP)-ML*CL*TL',why:'With no heat in or out and no work, the total change is zero.'}]);
    return r&&{stem:`A liquid (mass ${S('M',L_)}, specific heat ${S('C',L_)}, temperature ${S('T',L_)}) is poured into a pan (${S('M',P_)}, ${S('C',P_)}, ${S('T',P_)}). No heat leaves the pair and no work is done. Which equation gives their common final temperature ${S('T','f')}?`,
      fig:'',...r,sol:[['Closed system, Q = 0 and W = 0: the thermal energy changes add to zero, each written as final minus initial.',X`M_LC_L(T_f-T_L)+M_PC_P(T_f-T_P)=0`]],
      how:'Σ mC(T_f − T_i) = 0 for a closed, insulated system.',chk:{k:'x6-eq'}};
  }
  if(kind==='ratio'){
    const MA=pick([2,5,10,19]), MB=pick([4,8,23,5]), dA=pick([4,6,7,10]), dB=pick([1.2,2,10,19]); if(MA*dA===MB*dB) return null;
    const ans=MA*dA/(MB*dB), H=x=>xn(x);
    const r=mc({h:H(ans),v:ans},[{h:H(1/ans),v:1/ans,why:'Inverted: the object with the smaller temperature change has the larger mC.'},{h:H(dA/dB),v:dA/dB,why:'Include the masses.'},
      {h:H(MA/MB),v:MA/MB,why:'Include the temperature changes.'},{h:H(MA*dB/(MB*dA)),v:MA*dB/(MB*dA),why:'Pair each mass with its own temperature change.'},{h:H(MB*dB/(MA*dA)),v:MB*dB/(MA*dA),why:'That is C_A/C_B.'}]);
    return r&&{stem:`Object A (${MA} kg) and object B (${MB} kg) reach thermal equilibrium in an insulated box. A's temperature falls by ${dA} K and B's rises by ${dB} K. What is C<sub>B</sub>/C<sub>A</sub>?`,fig:'',...r,
      sol:[['Energy lost by A equals energy gained by B.',X`M_AC_A|\Delta T_A|=M_BC_B|\Delta T_B|\quad\Rightarrow\quad\frac{C_B}{C_A}=\frac{(${MA})(${dA})}{(${MB})(${dB})}=${tn(ans)}`]],how:'M_A C_A|ΔT_A| = M_B C_B|ΔT_B|.',chk:{k:'x6-ratio',MA,MB,dA,dB}};
  }
  if(kind==='same'){
    const pr=pick([[['aluminum',900],['iron',450]],[['aluminum',900],['copper',385]],[['glass',840],['iron',450]]]), d1=pick([10,20,30]), ans=d1*pr[0][1]/pr[1][1], H=x=>`${xn(x)} °C`;
    const r=mc({h:H(ans),v:ans},[{h:H(d1*pr[1][1]/pr[0][1]),v:d1*pr[1][1]/pr[0][1],why:'The lower specific heat warms MORE for the same energy.'},{h:H(d1),v:d1,why:'Different specific heats give different temperature changes.'},
      {h:H(2*d1),v:2*d1,why:'Use the ratio of the specific heats exactly.'},{h:H(d1/2),v:d1/2,why:'The lower specific heat warms more.'}]);
    return r&&{stem:`Equal masses of ${pr[0][0]} (C = ${pr[0][1]} J/(kg·K)) and ${pr[1][0]} (C = ${pr[1][1]} J/(kg·K)) each absorb the same amount of heat. The ${pr[0][0]} warms by ${d1} °C. By how much does the ${pr[1][0]} warm?`,fig:'',...r,
      sol:[['Same Q and m, so CΔT is the same for both.',X`\Delta T_2=\Delta T_1\frac{C_1}{C_2}=(${d1})\frac{${pr[0][1]}}{${pr[1][1]}}=${tn(ans)}\ ^\circ\text{C}`]],how:'C₁ΔT₁ = C₂ΔT₂ for the same Q and m.',chk:{k:'x6-same',d1,C1:pr[0][1],C2:pr[1][1]}};
  }
  const ma=pick([0.4,0.5,0.6]), Ca=900, Ta=20, mw=pick([0.3,0.4,0.5]), Cw=4200, Tw=pick([80,90,100]), Tf=(ma*Ca*Ta+mw*Cw*Tw)/(ma*Ca+mw*Cw), H=x=>`${xn(x)} °C`;
  const r=mc({h:H(Tf),v:Tf},[{h:H((ma*Ta+mw*Tw)/(ma+mw)),v:(ma*Ta+mw*Tw)/(ma+mw),why:'Weight each temperature by mC, not just by mass.'},{h:H((Ta+Tw)/2),v:(Ta+Tw)/2,why:'The water\'s much larger mC pulls the final temperature toward its own.'},
    {h:H((Ca*Ta+Cw*Tw)/(Ca+Cw)),v:(Ca*Ta+Cw*Tw)/(Ca+Cw),why:'Include the masses as well as the specific heats.'},{h:H(Tw-(Tw-Ta)*ma*Ca/(mw*Cw)),v:Tw-(Tw-Ta)*ma*Ca/(mw*Cw),why:'Both temperatures change; solve Σ mC(T_f − T_i) = 0 for T_f.'}]);
  return r&&{stem:`${mw*1000} g of water (C = 4200 J/(kg·K)) at ${Tw} °C is poured into a ${ma*1000} g aluminum pan (C = 900 J/(kg·K)) at 20 °C. Neglecting heat loss, what is the final temperature?`,fig:'',...r,
    sol:[['Closed system: the thermal energy changes add to zero.',X`m_wC_w(T_f-T_w)+m_aC_a(T_f-T_a)=0\quad\Rightarrow\quad T_f=\frac{m_wC_wT_w+m_aC_aT_a}{m_wC_w+m_aC_a}=${tn(Tf)}\ ^\circ\text{C}`]],
    how:'T_f = Σ mCT / Σ mC.',chk:{k:'x6-Tf',ma,Ca,Ta,mw,Cw,Tw}};
}

/* ---------------------------------------------------------------- Q7 · charges released from rest */
function x7(){
  const N=pick([3,3,4,4,2]), kind=pick(['eq','eq','num']);
  const geo=N===2?'a distance d apart':N===3?'at the corners of an equilateral triangle of side d':'at the corners of a square of side d';
  if(kind==='eq'){
    const lhs=n=>`${n===1?'':n}(½mv²)`, E={2:[`${lhs(2)} = ke²/d`,'2*(0.5*m*v**2)-k*e**2/d'],3:[`${lhs(3)} = 3ke²/d`,'3*(0.5*m*v**2)-3*k*e**2/d'],
      4:[`${lhs(4)} = 4ke²/d + 2ke²/(√2 d)`,'4*(0.5*m*v**2)-4*k*e**2/d-2*k*e**2/(2**0.5*d)']}[N];
    const D=N===2?[[`${lhs(1)} = ke²/d`,'0.5*m*v**2-k*e**2/d','Both protons move, so the energy is shared between two kinetic energies.'],[`${lhs(2)} = 2ke²/d`,'2*(0.5*m*v**2)-2*k*e**2/d','Two charges make one pair, so one potential-energy term.'],
                    [`${lhs(2)} = ke²/d²`,'2*(0.5*m*v**2)-k*e**2/d**2','Potential energy goes as 1/r; 1/r² is the force.'],[`${lhs(2)} = 0`,'2*(0.5*m*v**2)','The initial potential energy becomes the final kinetic energy.']]
      :N===3?[[`${lhs(1)} = 3ke²/d`,'0.5*m*v**2-3*k*e**2/d','All three protons fly off with the same speed: three kinetic energies.'],[`${lhs(3)} = ke²/d`,'3*(0.5*m*v**2)-k*e**2/d','Three charges make three pairs: count every pair.'],
              [`${lhs(3)} = 3ke²/d²`,'3*(0.5*m*v**2)-3*k*e**2/d**2','Potential energy goes as 1/r; 1/r² is the force.'],[`${lhs(3)} = 6ke²/d`,'3*(0.5*m*v**2)-6*k*e**2/d','Each pair counts once: N(N−1)/2 = 3 pairs.']]
      :[[`${lhs(4)} = 4ke²/d`,'4*(0.5*m*v**2)-4*k*e**2/d','Do not forget the two diagonal pairs, √2 d apart.'],[`${lhs(4)} = 6ke²/d`,'4*(0.5*m*v**2)-6*k*e**2/d','The two diagonal pairs are √2 d apart, not d.'],
        [`${lhs(4)} = 4ke²/d + 2ke²/(2d)`,'4*(0.5*m*v**2)-4*k*e**2/d-2*k*e**2/(2*d)','The diagonal of a square of side d is √2 d.'],[`${lhs(1)} = 4ke²/d + 2ke²/(√2 d)`,'0.5*m*v**2-4*k*e**2/d-2*k*e**2/(2**0.5*d)','All four protons share the energy.']];
    const r=mc({h:E[0],v:E[0],py:E[1]},D.map(d=>({h:d[0],v:d[0],py:d[1],why:d[2]})));
    return r&&{stem:`${['','','Two','Three','Four'][N]} protons, each of mass m and charge +e, are held ${geo} and released from rest. Which equation gives the speed v of each proton when they are very far apart? (k = 1/4πε₀)`,fig:'',...r,
      sol:[[`System: all the protons; nothing outside does work. Count the pairs: ${N*(N-1)/2}.`,''],
           ['Initial potential energy becomes final kinetic energy, shared equally by symmetry.',E[0].includes('√2')?X`4\left(\tfrac12mv^2\right)=4\frac{ke^2}{d}+2\frac{ke^2}{\sqrt2\,d}`:N===3?X`3\left(\tfrac12mv^2\right)=3\frac{ke^2}{d}`:X`2\left(\tfrac12mv^2\right)=\frac{ke^2}{d}`]],
      how:'Sum U over all N(N−1)/2 pairs; each particle gets an equal share of the kinetic energy.',chk:{k:'x7-eq',N}};
  }
  const q=pick([1,2,3])*1e-9, m=pick([1,2,5])*1e-9, d=pick([1,2,3])*1e-8, n3=N===2?3:N, pairs=n3===3?3:4+2/Math.SQRT2, v=Math.sqrt(2*pairs*K.ke*q*q/(d*n3*m));
  const H=x=>`${xn(x)} m/s`, V=(x,why)=>({h:H(x),v:x,why});
  const r=mc(V(v),[V(Math.sqrt(2*K.ke*q*q/(d*n3*m)),'Count every pair of charges.'),V(Math.sqrt(2*pairs*K.ke*q*q/(d*m)),'Every particle moves: share the energy among all of them.'),
    V(Math.sqrt(2*pairs*K.ke*q*q/(d*d*n3*m)),'Potential energy uses 1/r, not 1/r².'),V(Math.sqrt(pairs*K.ke*q*q/(d*n3*m)),'K = ½mv²: keep the factor of 2 when solving for v.'),
    V(Math.sqrt(2*(n3===4?6:3)*K.ke*q*q/(d*n3*m)),n3===4?'The diagonal pairs are √2 d apart.':'Each pair counts once.')]);
  return r&&{stem:`${n3===3?'Three':'Four'} small charged beads, each of mass ${sci(m,3)} kg and charge +${q*1e9} nC, are held ${n3===3?'at the corners of an equilateral triangle':'at the corners of a square'} with side ${sci(d,3)} m and released from rest. How fast is each moving when they are very far apart? (k = 9×10<sup>9</sup> N·m²/C²)`,
    fig:'',...r,sol:[[`Count the pairs${n3===4?' (4 sides at d, 2 diagonals at √2 d)':''}.`,X`U_i=${n3===3?X`3\frac{kq^2}{d}`:X`4\frac{kq^2}{d}+2\frac{kq^2}{\sqrt2 d}`}=${tn(pairs*K.ke*q*q/d)}${U('J')}`],
      ['All of it becomes kinetic energy, shared equally.',X`${n3}\left(\tfrac12mv^2\right)=U_i\quad\Rightarrow\quad v=${tn(v)}${U('m/s')}`]],how:'Σ pairs kq²/r = N·½mv².',chk:{k:'x7-num',n:n3,q,m,d}};
}

/* ---------------------------------------------------------------- Q8–9 · track (linked) */
function x89(){
  const kind=pick(['bowl','bowl','roll','loop','loop']);
  if(kind==='bowl'||kind==='roll'){
    const roll=kind==='roll', f=roll?1:pick([1,1,0.5]);
    const vF=roll?{h:'√(10gR/7)',py:'(10*g*R/7)**0.5'}:f===1?{h:'√(2gR)',py:'(2*g*R)**0.5'}:{h:'√(gR)',py:'(g*R)**0.5'};
    const vAll=[['√(2gR)','(2*g*R)**0.5'],['√(gR)','(g*R)**0.5'],['2√(gR)','2*(g*R)**0.5'],['√(gR/2)','(g*R/2)**0.5'],['√(3gR)','(3*g*R)**0.5'],['√(10gR/7)','(10*g*R/7)**0.5'],['√(5gR/7)','(5*g*R/7)**0.5']];
    const vWhy=h=>roll&&h==='√(2gR)'?'That ignores rotation: a rolling ball puts part of mgR into spinning, ½Mv² + ½(⅖MR²)(v/R)² = (7/10)Mv².'
      :h==='2√(gR)'?'The drop is '+(f===1?'R':'R/2')+', not 2R.':roll?'Rolling without slipping: mgR = (7/10)Mv².':'Use ½mv² = mgh with h = '+(f===1?'R':'R/2')+'; the normal force does no work.';
    const q8=mc({h:vF.h,v:vF.h,py:vF.py},vAll.filter(a=>a[0]!==vF.h).map(a=>({h:a[0],v:a[0],py:a[1],why:vWhy(a[0])})));
    const nC=roll?17/7:1+2*f, nHtml=x=>x===17/7?'(17/7)mg':x===10/7?'(10/7)mg':`${x===1?'':x}mg`;
    const nAll=[1,2,3,4,10/7,17/7].filter(x=>Math.abs(x-nC)>1e-9);
    const nWhy=x=>x===1?'At the bottom the block moves on a circle, so the net force mv²/R points up: N > mg.'
      :Math.abs(x-(nC-1))<1e-9?'That is only mv²/R; the normal force must also hold up the weight: N = mg + mv²/R.'
      :roll&&x===3?'That uses the sliding speed; the rolling ball is slower, so mv²/R is smaller.':'Use N − mg = mv²/R with v² from the energy step.';
    const q9=mc({h:nHtml(nC),v:nHtml(nC),py:`m*g*${nC}`},nAll.map(x=>({h:nHtml(x),v:nHtml(x),py:`m*g*${x}`,why:nWhy(x)})));
    if(!q8||!q9) return null;
    const setup=roll?`A small solid ball (I = ⅖MR² about its center, radius much smaller than R) is released from rest at location 1, the rim of a semicircular track of radius R, and rolls without slipping down to location 2 at the bottom (see figure).`
      :`A small block of ice is released from rest on a smooth semicircular track of radius R, at a point ${f===1?'on the rim (location 1), a height R':'a height R/2'} above the bottom (location 2) (see figure). Friction is negligible.`;
    const v2=roll?X`Mg R=\tfrac12Mv^2+\tfrac12\left(\tfrac25MR_b^2\right)\left(\frac{v}{R_b}\right)^2=\tfrac{7}{10}Mv^2\quad\Rightarrow\quad v=\sqrt{\tfrac{10}{7}gR}`
                  :X`mg${f===1?'R':'\\tfrac R2'}=\tfrac12mv^2\quad\Rightarrow\quad v=${f===1?'\\sqrt{2gR}':'\\sqrt{gR}'}`;
    return {setup,fig:FIG.eTrack('bowl',{roll,ask:'2'}),items:[
      {stem:'What is the speed at location 2?',...q8,sol:[[roll?'System: ball + Earth. Static friction at the contact point does no work (the point is momentarily at rest).':'System: block + Earth. The normal force is perpendicular to the motion and does no work.',v2]],
        how:roll?'Rolling: mgh = ½(1 + β)Mv² with β = 2/5.':'½mv² = mgh; the normal force does no work.',chk:{k:'x8-sym',roll,f}},
      {stem:'What is the magnitude of the normal force on it at location 2?',...q9,
        sol:[['At the bottom the center of the circle is straight up, so the net force mv²/R points up.',X`N-mg=\frac{mv^2}{R}=${roll?X`\tfrac{10}{7}mg`:f===1?'2mg':'mg'}\quad\Rightarrow\quad N=${roll?X`\tfrac{17}{7}mg`:(1+2*f)+'mg'}`]],
        how:'Bottom of a circle: N = mg + mv²/R.',chk:{k:'x9-sym',roll,f}}]};
  }
  const m=pick([200,300,400,500]), R=pick([5,10,15,20,24]), h=Math.round(R*rf(2.6,3.6,2)), at=pick(['C','D']), y=at==='C'?2*R:R;
  const v=Math.sqrt(2*XG*(h-y)), N=at==='C'?m*v*v/R-m*XG:m*v*v/R, Hv=x=>`${xn(x)} m/s`, HN=x=>`${xn(x)} N`;
  const q8=mc({h:Hv(v),v},[{h:Hv(Math.sqrt(2*XG*h)),v:Math.sqrt(2*XG*h),why:'That is the speed at the bottom (B); '+at+' is '+y+' m up.'},
    {h:Hv(Math.sqrt(2*XG*(h-(at==='C'?R:2*R)))),v:Math.sqrt(2*XG*(h-(at==='C'?R:2*R))),why:at==='C'?'The top of the loop is 2R above the bottom, not R.':'The side point D is R above the bottom, not 2R.'},
    {h:Hv(Math.sqrt(XG*(h-y))),v:Math.sqrt(XG*(h-y)),why:'From ½mv² = mgΔh, v = √(2gΔh).'},{h:Hv(2*XG*(h-y)/Math.sqrt(2*XG*h)),v:2*XG*(h-y)/Math.sqrt(2*XG*h),why:'Solve ½mv² = mg(h − y) directly for v.'}]);
  const dN=at==='C'?[{h:HN(m*v*v/R),v:m*v*v/R,why:'At the top gravity also points to the center: N + mg = mv²/R.'},{h:HN(m*v*v/R+m*XG),v:m*v*v/R+m*XG,why:'At the top both N and mg point down, toward the center: N = mv²/R − mg.'},
      {h:HN(m*XG),v:m*XG,why:'The car is moving in a circle, so N ≠ mg.'},{h:HN(m*v*v/(2*R)),v:m*v*v/(2*R),why:'Centripetal force is mv²/R.'}]
    :[{h:HN(m*v*v/R-m*XG),v:m*v*v/R-m*XG,why:'At the side point gravity is tangent to the circle; only N points to the center.'},{h:HN(m*v*v/R+m*XG),v:m*v*v/R+m*XG,why:'Gravity is vertical, the radius horizontal: gravity contributes nothing toward the center here.'},
      {h:HN(m*XG),v:m*XG,why:'Only the normal force points to the center at D.'},{h:HN(Math.hypot(m*v*v/R,m*XG)),v:Math.hypot(m*v*v/R,m*XG),why:'That is the net force; the normal force alone is mv²/R.'}];
  const q9=mc({h:HN(N),v:N},dN);
  if(!q8||!q9||N<=0) return null;
  return {setup:`A ${m} kg roller-coaster car starts from rest at A, ${h} m above the bottom of a frictionless track, and goes around a vertical loop of radius ${R} m. B is the bottom, C the top of the loop and D the side of the loop level with its center (see figure). Use g = 10 m/s².`,
    fig:FIG.eTrack('loop',{h,R,at}),items:[
    {stem:`What is the car's speed at ${at}?`,...q8,sol:[[`${at} is ${y} m above the bottom. System car + Earth; the normal force does no work.`,X`\tfrac12mv^2=mg(h-${y})\quad\Rightarrow\quad v=\sqrt{2(10)(${h}-${y})}=${tn(v)}${U('m/s')}`]],
      how:at==='C'?'v_C = √(2g(h − 2R))':'v_D = √(2g(h − R))',chk:{k:'x8-loop',m,R,h,at}},
    {stem:`What is the magnitude of the normal force on the car at ${at}?`,...q9,
      sol:[[at==='C'?'At the top N and mg both point down, toward the center.':'At D only N points toward the center; gravity is tangent.',at==='C'?X`N=\frac{mv^2}{R}-mg=${tn(N)}${U('N')}`:X`N=\frac{mv^2}{R}=${tn(N)}${U('N')}`]],
      how:at==='C'?'Top: N + mg = mv²/R':'Side: N = mv²/R',chk:{k:'x9-loop',m,R,h,at}}]};
}

/* ---------------------------------------------------------------- Q10 · spring with an initial push */
function x10(){
  const kind=pick(['sqrt','sqrt','vwork','fric']);
  if(kind==='vwork'){
    const m=pick([2,5,8]), vi=pick([5,6,7,8]), vf=pick([3,4,5].filter(x=>x<vi)), dy=pick([0.2,0.3,0.4,0.5]), dK=0.5*m*(vf*vf-vi*vi), W=dK+m*XG*dy, H=x=>`${xn(x)} J`;
    const r=mc({h:H(W),v:W},[{h:H(dK),v:dK,why:'Earth also does work (negative, the mass rises): W_spring = ΔK − W_Earth.'},{h:H(dK-m*XG*dy),v:dK-m*XG*dy,why:'Rising means W_Earth = −mgΔy, so W_spring = ΔK + mgΔy.'},
      {h:H(-W),v:-W,why:'Sign: solve ΔK = W_spring + W_Earth for W_spring.'},{h:H(m*XG*dy),v:m*XG*dy,why:'Include the change in kinetic energy.'}]);
    return r&&{stem:`An ${m} kg block hangs from a vertical spring. Moving upward, it rises ${dy} m while its speed drops from ${vi} m/s to ${vf} m/s. How much work does the spring do on the block over this motion? Use g = 10 m/s².`,fig:'',...r,
      sol:[['System: block; surroundings: spring and Earth. Earth does −mgΔy as the block rises.',X`\Delta K=W_{\text{spring}}+W_{\text{Earth}}\quad\Rightarrow\quad W_{\text{spring}}=\tfrac12(${m})\big((${vf})^2-(${vi})^2\big)+(${m})(10)(${dy})=${tn(W)}${U('J')}`]],
      how:'W_spring = ΔK − W_Earth, with W_Earth = −mgΔy going up.',chk:{k:'x10-vwork',m,vi,vf,dy}};
  }
  const M=pick([2,5,10]), k=pick([200,500,1000]), s0=pick([0.1,0.2,0.3]), v0=pick([1,2,3]), mu=kind==='fric'?pick([0.1,0.2,0.3]):0;
  const v2=v0*v0+k*s0*s0/M-2*mu*XG*s0; if(v2<=0.5) return null;
  const sq=kind==='sqrt', H=x=>sq?`${rt(x)} m/s`:`${xn(Math.sqrt(x))} m/s`;
  const alt=[[v0*v0-k*s0*s0/M,'Kinetic energy is a scalar: the direction of the initial push does not matter.'],[k*s0*s0/M,'Include the block\'s initial kinetic energy.'],
    [v0*v0+k*s0/M,'Spring energy is ½k_s s², with s squared.'],[Math.pow(v0+s0*Math.sqrt(k/M),2),'Energies add; speeds do not.'],[v0*v0+2*k*s0*s0/M,'The ½ in ½k_s s² and in ½Mv² cancel; do not double the spring term.']];
  if(mu) alt.push([v0*v0+k*s0*s0/M,'Friction does negative work over the distance s₀.'],[v0*v0+k*s0*s0/M+2*mu*XG*s0,'Friction always takes energy out of the block.']);
  const r=mc({h:H(v2),v:sq?v2:Math.sqrt(v2)},alt.filter(a=>a[0]>0).map(a=>({h:H(a[0]),v:sq?a[0]:Math.sqrt(a[0]),why:a[1]})));
  return r&&{stem:`A ${M} kg block on a ${mu?`floor with μ<sub>k</sub> = ${mu}`:'frictionless floor'} is attached to a horizontal spring (k<sub>s</sub> = ${k} N/m), initially relaxed. You pull the block so the spring stretches ${s0} m, then give it a speed of ${v0} m/s ${mu?'back toward the relaxed position':'directed so it stretches the spring further'}. What is its speed when the spring ${mu?'reaches':'next returns to'} its relaxed length?${mu?' Use g = 10 m/s².':''}`,
    fig:'',...r,sol:[['System: block + spring'+(mu?'; friction from the floor is outside and acts over the s₀ the block slides back.':'. Energy is a scalar: the push direction does not matter.'),
      X`\tfrac12Mv^2=\tfrac12Mv_0^2+\tfrac12k_ss_0^2${mu?'-\\mu_kMg\\,s_0':''}`],['',X`v^2=${tn(v2)}\ \text{m}^2/\text{s}^2,\quad v=${sq?rt(v2):tn(Math.sqrt(v2))}${U('m/s')}`]],
    how:'½Mv² = ½Mv₀² + ½k_s s₀² (block + spring system)',chk:{k:'x10-spring',M,ks:k,s0,v0,mu}};
}

/* ---------------------------------------------------------------- Q11 · air resistance */
function x11(){
  const kind=pick(['compare','compare','force','air']);
  if(kind==='compare'){
    const ph=pick(['terminal','terminal','speeding','slowing']);
    const what={terminal:'has reached terminal speed and falls at constant velocity',speeding:'has just been released and is still speeding up',slowing:'has just opened a parachute and is slowing down toward a new, lower terminal speed'}[ph];
    const right={terminal:'|F<sub>air</sub>| = |F<sub>grav</sub>|',speeding:'|F<sub>air</sub>| < |F<sub>grav</sub>|',slowing:'|F<sub>air</sub>| > |F<sub>grav</sub>|'}[ph];
    const why={terminal:'Constant velocity means zero net force.',speeding:'It is speeding up, so the net force points down: gravity wins.',slowing:'It is slowing down, so the net force points up: air resistance wins.'}[ph];
    const all=['|F<sub>air</sub>| = |F<sub>grav</sub>|','|F<sub>air</sub>| < |F<sub>grav</sub>|','|F<sub>air</sub>| > |F<sub>grav</sub>|','F<sub>air</sub> = 0','It depends on the mass'];
    const r=fixed(all.map(h=>O(h,h==='F<sub>air</sub> = 0'?'A moving object in air always feels drag, opposite to its velocity.':h==='It depends on the mass'?'Whatever the mass, the change in momentum fixes the net force.':why,h===right)));
    return {stem:`A ${pick(['coffee filter','skydiver','raindrop'])} ${what}. How does the magnitude of the air-resistance force compare with the gravitational force on it?`,fig:'',...r,
      sol:[[why,X`\vec F_{\text{net}}=\vec F_{\text{grav}}+\vec F_{\text{air}}=\frac{d\vec p}{dt}`]],how:'Terminal speed: F_air = F_grav. Speeding up: F_air < F_grav. Slowing down: F_air > F_grav.',chk:{k:'x11-compare',ph}};
  }
  if(kind==='force'){
    const m=pick([60,70,80,90]), v=pick([45,50,55,60]), H=x=>`${xn(x)} N`;
    const r=mc({h:H(m*XG),v:m*XG},[{h:H(0.5*m*v*v),v:0.5*m*v*v,why:'That is a kinetic energy (J), not a force. The speed is a distractor.'},{h:H(m*v),v:m*v,why:'That is momentum, not force.'},
      {h:H(m*XG+m*v),v:m*XG+m*v,why:'At terminal speed the net force is zero, so F_air = mg.'},{h:H(m*XG/2),v:m*XG/2,why:'Constant velocity: the two forces balance exactly.'}]);
    return r&&{stem:`A ${m} kg skydiver falls at a constant terminal speed of ${v} m/s. What is the magnitude of the air-resistance force on the skydiver? Use g = 10 m/s².`,fig:'',...r,
      sol:[['Constant velocity: the momentum does not change, so the net force is zero.',X`F_{\text{air}}=mg=(${m})(10)=${m*XG}${U('N')}`]],how:'Terminal speed: F_air = mg; the speed does not enter.',chk:{k:'x11-force',m,v}};
  }
  const m=pick([0.15,0.2,0.4,0.5]), vi=pick([12,15,18,20]), vf=pick([8,10,11,13,14].filter(x=>x<vi)), W=0.5*m*(vf*vf-vi*vi), H=x=>`${xn(x)} J`;
  const r=mc({h:H(W),v:W},[{h:H(-W),v:-W,why:'Air resistance always opposes the motion: its work is negative.'},{h:H(-0.5*m*vf*vf),v:-0.5*m*vf*vf,why:'Use the change in kinetic energy, final minus initial.'},
    {h:H(-0.5*m*vi*vi),v:-0.5*m*vi*vi,why:'The ball still has kinetic energy when it returns.'},{h:H(0.5*m*(vf-vi)*(vf-vi)*-1),v:-0.5*m*(vf-vi)*(vf-vi),why:'ΔK = ½m(v_f² − v_i²), not ½m(v_f − v_i)².'}]);
  return r&&{stem:`A ${m} kg ball is thrown straight up at ${vi} m/s and caught at the same height moving at ${vf} m/s. How much work did air resistance do on it over the whole trip?`,fig:'',...r,
    sol:[['System: ball; surroundings: Earth and air. Same height at both ends, so gravity\'s net work is zero.',X`W_{\text{air}}=\Delta K=\tfrac12(${m})\big((${vf})^2-(${vi})^2\big)=${tn(W)}${U('J')}`]],how:'Round trip: W_grav = 0, so W_air = ΔK < 0.',chk:{k:'x11-air',m,vi,vf}};
}

/* ---------------------------------------------------------------- Q12 · vertical spring, which equation */
function x12(){
  const kind=pick(['max','max','speed','relaxed']);
  const sb=(a,b)=>`${a}<sub>${b}</sub>`, half='½';
  if(kind==='max'||kind==='speed'){
    const mx=kind==='max';
    const good=mx?{h:`(0 − ${half}m${sb('v','i')}²) + (${half}${sb('k','s')}${sb('s','max')}² − ${half}${sb('k','s')}${sb('s','i')}²) = 0`,py:'(0-0.5*m*vi**2)+(0.5*k*smax**2-0.5*k*si**2)'}
                 :{h:`(${half}m${sb('v','eq')}² − ${half}m${sb('v','i')}²) + (0 − ${half}${sb('k','s')}${sb('s','i')}²) = 0`,py:'(0.5*m*veq**2-0.5*m*vi**2)+(0-0.5*k*si**2)'};
    const D=mx?[[`(0 − ${half}m${sb('v','i')}²) + (${half}${sb('k','s')}${sb('s','max')}² − ${half}${sb('k','s')}${sb('s','i')}²) + mg(${sb('s','max')} + ${sb('s','i')}) = 0`,'(0-0.5*m*vi**2)+(0.5*k*smax**2-0.5*k*si**2)+m*g*(smax+si)','Measured from the equilibrium position, gravity is already built in: spring + gravity energy is ½k_s y² + constant. A separate mg term double counts it.'],
      [`(${half}m${sb('v','i')}² − 0) + (${half}${sb('k','s')}${sb('s','max')}² − ${half}${sb('k','s')}${sb('s','i')}²) = 0`,'(0.5*m*vi**2-0)+(0.5*k*smax**2-0.5*k*si**2)','ΔK is final minus initial: 0 − ½mv_i².'],
      [`(0 − ${half}m${sb('v','i')}²) + ${half}${sb('k','s')}(${sb('s','max')} + ${sb('s','i')})² = 0`,'(0-0.5*m*vi**2)+0.5*k*(smax+si)**2','A change in spring energy is ½k_s s_f² − ½k_s s_i², not ½k_s(Δs)².'],
      [`(0 − ${half}m${sb('v','i')}²) + (${half}${sb('k','s')}${sb('s','max')}² − ${half}${sb('k','s')}${sb('s','i')}²) − mg(${sb('s','max')} + ${sb('s','i')}) = 0`,'(0-0.5*m*vi**2)+(0.5*k*smax**2-0.5*k*si**2)-m*g*(smax+si)','No separate gravity term when y is measured from equilibrium.']]
     :[[`(${half}m${sb('v','eq')}² − ${half}m${sb('v','i')}²) + (0 − ${half}${sb('k','s')}${sb('s','i')}²) + mg${sb('s','i')} = 0`,'(0.5*m*veq**2-0.5*m*vi**2)+(0-0.5*k*si**2)+m*g*si','Measured from equilibrium, the gravity term is already absorbed into ½k_s y².'],
       [`(${half}m${sb('v','eq')}² − ${half}m${sb('v','i')}²) + (${half}${sb('k','s')}${sb('s','i')}² − 0) = 0`,'(0.5*m*veq**2-0.5*m*vi**2)+(0.5*k*si**2-0)','Final minus initial: at equilibrium the y-term is 0, at the start it is ½k_s s_i².'],
       [`(${half}m${sb('v','eq')}² − ${half}m${sb('v','i')}²) = 0`,'(0.5*m*veq**2-0.5*m*vi**2)','The spring term changes between the two positions.'],
       [`(${half}m${sb('v','eq')}² − ${half}m${sb('v','i')}²) + (0 − ${half}${sb('k','s')}${sb('s','i')}²) − mg${sb('s','i')} = 0`,'(0.5*m*veq**2-0.5*m*vi**2)+(0-0.5*k*si**2)-m*g*si','No separate gravity term when y is measured from equilibrium.']];
    const r=mc({h:good.h,v:good.h,py:good.py},D.map(d=>({h:d[0],v:d[0],py:d[1],why:d[2]})));
    return r&&{stem:`A mass m hangs at rest on a vertical spring (stiffness ${sb('k','s')}). It is pulled down a further distance ${sb('s','i')} below this equilibrium position and given an upward speed ${sb('v','i')}. `+
      `Take the system to be spring + mass + Earth, and measure positions from the <b>equilibrium</b> position. Which equation gives ${mx?`the greatest height ${sb('s','max')} the mass reaches above equilibrium`:`the speed ${sb('v','eq')} as it passes through equilibrium`}?`,fig:'',...r,
      sol:[['With y measured from equilibrium, the spring and gravity energies combine into ½k_s y² + constant: the linear mg terms cancel against the spring\'s equilibrium stretch (k_s s_eq = mg).',X`U_{\text{spring}}+U_{\text{grav}}=\tfrac12k_sy^2+\text{const}`],
           ['So the Energy Principle has only kinetic and ½k_s y² terms.',mx?X`(0-\tfrac12mv_i^2)+(\tfrac12k_ss_{\max}^2-\tfrac12k_ss_i^2)=0`:X`(\tfrac12mv_{eq}^2-\tfrac12mv_i^2)+(0-\tfrac12k_ss_i^2)=0`]],
      how:'From equilibrium: ΔK + Δ(½k_s y²) = 0, no separate mg term.',chk:{k:'x12-eq',mode:kind}};
  }
  const good={h:`(${half}m${sb('v','f')}² − ${half}m${sb('v','i')}²) + (${half}${sb('k','s')}${sb('s','2')}² − ${half}${sb('k','s')}${sb('s','1')}²) + mg(${sb('s','1')} − ${sb('s','2')}) = 0`,py:'(0.5*m*vf**2-0.5*m*vi**2)+(0.5*k*s2**2-0.5*k*s1**2)+m*g*(s1-s2)'};
  const D=[[`(${half}m${sb('v','f')}² − ${half}m${sb('v','i')}²) + (${half}${sb('k','s')}${sb('s','2')}² − ${half}${sb('k','s')}${sb('s','1')}²) = 0`,'(0.5*m*vf**2-0.5*m*vi**2)+(0.5*k*s2**2-0.5*k*s1**2)','Measured from the relaxed length, gravity\'s energy change must appear: the mass rises s₁ − s₂.'],
    [`(${half}m${sb('v','f')}² − ${half}m${sb('v','i')}²) + (${half}${sb('k','s')}${sb('s','2')}² − ${half}${sb('k','s')}${sb('s','1')}²) − mg(${sb('s','1')} − ${sb('s','2')}) = 0`,'(0.5*m*vf**2-0.5*m*vi**2)+(0.5*k*s2**2-0.5*k*s1**2)-m*g*(s1-s2)','Rising increases U_grav: ΔU_grav = +mg(s₁ − s₂).'],
    [`(${half}m${sb('v','f')}² − ${half}m${sb('v','i')}²) + (${half}${sb('k','s')}${sb('s','1')}² − ${half}${sb('k','s')}${sb('s','2')}²) + mg(${sb('s','1')} − ${sb('s','2')}) = 0`,'(0.5*m*vf**2-0.5*m*vi**2)+(0.5*k*s1**2-0.5*k*s2**2)+m*g*(s1-s2)','ΔU_spring is final minus initial: ½k_s s₂² − ½k_s s₁².'],
    [`(${half}m${sb('v','f')}² − ${half}m${sb('v','i')}²) + (${half}${sb('k','s')}${sb('s','2')}² − ${half}${sb('k','s')}${sb('s','1')}²) + mg(${sb('s','1')} − ${sb('s','2')}) = −mg(${sb('s','1')} − ${sb('s','2')})`,'(0.5*m*vf**2-0.5*m*vi**2)+(0.5*k*s2**2-0.5*k*s1**2)+m*g*(s1-s2)+m*g*(s1-s2)','Earth is inside the system: it contributes ΔU_grav, never work as well.']];
  const r=mc({h:good.h,v:good.h,py:good.py},D.map(d=>({h:d[0],v:d[0],py:d[1],why:d[2]})));
  return r&&{stem:`A mass m hangs from a vertical spring (stiffness ${sb('k','s')}). At first the spring is stretched ${sb('s','1')} beyond its <b>relaxed</b> length and the mass moves upward at ${sb('v','i')}; later the stretch is ${sb('s','2')} (< ${sb('s','1')}) and the speed is ${sb('v','f')}. With the system spring + mass + Earth, which equation is correct?`,fig:'',...r,
    sol:[['Stretches measured from the relaxed length: write spring and gravity energy separately. The mass rises by s₁ − s₂.',X`\Delta K+\Delta U_{\text{spring}}+\Delta U_{\text{grav}}=0`],
         ['',X`(\tfrac12mv_f^2-\tfrac12mv_i^2)+(\tfrac12k_ss_2^2-\tfrac12k_ss_1^2)+mg(s_1-s_2)=0`]],
    how:'From the relaxed length: ΔK + ΔU_spring + ΔU_grav = 0, all three terms needed.',chk:{k:'x12-eq',mode:'relaxed'}};
}

/* ---------------------------------------------------------------- Q13–15 · spring launch (linked) */
function xLaunchData(){
  const kind=pick(['sym','num','inc','inc']);
  if(kind==='sym') return {kind,incline:false};
  const inc=kind==='inc', M=inc?pick([20,30,40]):pick([0.5,1,2]), ks=inc?pick([1100,1200,1300,1400]):pick([300,400,600]), L0=inc?pick([5,6,7]):pick([0.3,0.4,0.5]);
  const s=inc?pick([1,2,3]):pick([0.1,0.15,0.2]), L=rd(L0-s,2), th=inc?pick([48,52,56]):90, mu=inc?pick([0.1,0.2,0.3]):0;
  const v2=ks*s*s/M-2*XG*s*(Math.sin(th*D2R)+mu*Math.cos(th*D2R)); if(v2<=4) return null;
  return {kind,incline:inc,M,ks,L0,L,s,th,mu,v0:Math.sqrt(v2)};
}
const XOBJ={spring:['ΔU of the spring','work by the spring'],Earth:['ΔU of the block–Earth interaction','work by Earth'],ramp:['ΔE<sub>thermal</sub> of the block and ramp','work by friction from the ramp']};
function x13(d){
  if(Math.random()<0.25){
    const bank={C:['We chose the block, spring and Earth as the system.','We treat the spring as ideal and massless.','We neglect air resistance.'],
      E:[d.incline?`Because the problem gives μ<sub>k</sub> = ${d.mu} between the block and the ramp.`:'Because the problem says the block is not attached to the spring.','The problem gives the spring\'s relaxed length and its compressed length.'],
      R:['So the normal force does no work, because it is perpendicular to the displacement.','Therefore the spring\'s energy appears as ΔU, not as work, because it is inside the system.']};
    const want=pick(['C','R','E']), pair=Math.random()<0.4&&bank[want].length>1, other=pick(['C','E','R'].filter(k=>k!==want));
    let st=pair?shuf(bank[want]).slice(0,2).map(t=>({k:want,t})).concat([{k:other,t:pick(bank[other])}]):['C','E','R'].map(k=>({k,t:pick(bank[k])}));
    st=shuf(st);
    const ids=st.map((s,i)=>s.k===want?i+1:0).filter(Boolean), keyH=ids.length===1?`Statement ${ids[0]}`:`Statements ${ids[0]} and ${ids[1]}`;
    const N={C:'CLAIM',E:'EVIDENCE',R:'REASONING'}, W={C:'a decision made in setting up the solution',E:'information given in the problem or a known fact',R:'an explanation that links evidence to a claim (“so…”, “therefore…”)'};
    const ALL=['Statement 1','Statement 2','Statement 3','Statements 1 and 2','Statements 2 and 3','Statements 1 and 3'];
    const sets={'Statement 1':[1],'Statement 2':[2],'Statement 3':[3],'Statements 1 and 2':[1,2],'Statements 2 and 3':[2,3],'Statements 1 and 3':[1,3]};
    const whyOf=h=>sets[h].filter(i=>st[i-1].k!==want).map(i=>`Statement ${i} is ${N[st[i-1].k]}: ${W[st[i-1].k]}.`).concat(ids.filter(i=>sets[h].indexOf(i)<0).map(i=>`Statement ${i} is also ${N[want]}.`)).join(' ');
    const opts=shuf([keyH].concat(shuf(ALL.filter(h=>h!==keyH)).slice(0,4))).map(h=>({h,v:h,why:h===keyH?null:whyOf(h),ok:h===keyH}));
    return {stem:`A student solving this problem writes:<ol class="cer">${st.map(s=>`<li>“${s.t}”</li>`).join('')}</ol>Which statement(s) are <b>${{C:'CLAIMS',E:'EVIDENCE',R:'REASONING'}[want]}</b>?`,
      opts,key:opts.findIndex(o=>o.ok),sol:st.map((s,i)=>[`Statement ${i+1} is <b>${N[s.k]}</b>: ${W[s.k]}.`,'']),
      how:'CLAIM = a setup decision; EVIDENCE = a given or known fact; REASONING = why the evidence supports the claim.',chk:{k:'x13-cer',want,st:st.map(s=>s.t)}};
  }
  const objs=d.incline?['spring','Earth','ramp']:['spring','Earth'];
  const names=pick([['Amy','Beth','Cathy'],['Dev','Eli','Fay'],['Ghada','Heba','Ivan']]);
  const stud=names.map(nm=>{
    const inside=objs.filter(()=>Math.random()<0.5), terms=['ΔK of the block'];
    objs.forEach(o=>terms.push(inside.indexOf(o)>=0?XOBJ[o][0]:XOBJ[o][1]));
    let ok=true, err='';
    if(Math.random()<0.5){
      const o=pick(objs), i=terms.indexOf(inside.indexOf(o)>=0?XOBJ[o][0]:XOBJ[o][1]);
      const e=pick(inside.indexOf(o)>=0?['asWork','both']:['asU','missing']);
      if(e==='asWork'){ terms[i]=XOBJ[o][1]; err=`The ${o==='Earth'?'Earth':o} is inside ${nm}'s system, so it contributes ${XOBJ[o][0]}, not work.`; }
      if(e==='both'){ terms.splice(i+1,0,XOBJ[o][1]); err=`${nm} counts the ${o==='Earth'?'Earth':o} twice: an object inside the system gives ${XOBJ[o][0]} and does no work.`; }
      if(e==='asU'){ terms[i]=XOBJ[o][0]; err=`The ${o==='Earth'?'Earth':o} is outside ${nm}'s system, so it does work on it instead of contributing ${XOBJ[o][0]}.`; }
      if(e==='missing'){ terms.splice(i,1); err=`${nm} leaves out the ${XOBJ[o][1]}: the ${o==='Earth'?'Earth':o} is outside the system and acts on the block.`; }
      ok=false;
    }
    return {nm,inside,terms,ok,err};
  });
  const right=stud.filter(s=>s.ok).map(s=>s.nm), lab=a=>a.length===0?'None of them':a.length===3?'All three':a.length===1?`Only ${a[0]}`:`${a[0]} and ${a[1]} only`;
  const combos=[[],[0],[1],[2],[0,1],[0,2],[1,2],[0,1,2]].map(c=>c.map(i=>names[i]));
  const keyH=lab(right);
  const cand=shuf(combos.map(lab).filter(h=>h!==keyH)).slice(0,4);
  const whyFor=h=>{ const pickd=combos.find(c=>lab(c)===h), bad=stud.filter(s=>!s.ok&&pickd.indexOf(s.nm)>=0), miss=stud.filter(s=>s.ok&&pickd.indexOf(s.nm)<0);
    return bad.map(s=>s.err).concat(miss.map(s=>`${s.nm}'s accounting is consistent with that system choice.`)).join(' '); };
  const opts=shuf([keyH].concat(cand)).map(h=>({h,v:h,why:h===keyH?null:whyFor(h),ok:h===keyH}));
  const sysTxt=s=>['block'].concat(s.inside).join(' + ').replace('Earth','Earth');
  const desc=stud.map(s=>`<li><b>${s.nm}</b>: system = ${sysTxt(s)}${objs.filter(o=>s.inside.indexOf(o)<0).length?`; surroundings: ${objs.filter(o=>s.inside.indexOf(o)<0).join(', ')}`:'; nothing relevant in the surroundings'}. Writes the Energy Principle with: ${s.terms.join(', ')}.</li>`).join('');
  return {stem:`Three students set up the Energy Principle for the block from the moment it is released until it leaves the spring${d.incline?' (the ramp exerts a normal force and kinetic friction)':''}:<ol class="cer">${desc}</ol>Which students' set-ups are correct?`,
    opts,key:opts.findIndex(o=>o.ok),
    sol:stud.map(s=>[`<b>${s.nm}</b>: ${s.ok?'correct. Every object inside the system appears as a ΔU (or ΔE<sub>thermal</sub>) term, every object outside as work.':s.err}`,'']),
    how:'Inside the system → ΔU (or ΔE_thermal), never work. Outside → work. Never both. The normal force does no work.',chk:{k:'x13-sys',incline:d.incline,stud:stud.map(s=>({inside:s.inside,terms:s.terms}))}};
}
function x1415(d){
  if(d.kind==='sym'){
    const hO=[['v₀²/(2g)','v0**2/(2*g)'],['v₀²/g','v0**2/g','Kinetic energy is ½Mv₀², so h = v₀²/(2g).'],['v₀/(2g)','v0/(2*g)','Check units: a height needs v₀²/g.'],['2v₀²/g','2*v0**2/g','Mgh = ½Mv₀².'],['v₀²/(2g) + (L₀ − L)','v0**2/(2*g)+(L0-L)','Measured from the launch point at L₀, not from the release point.']];
    const tO=[['v₀/g','v0/g'],['2v₀/g','2*v0/g','That is the time up and back down.'],['v₀/(2g)','v0/(2*g)','Momentum Principle: 0 = Mv₀ − Mgt.'],['v₀²/g','v0**2/g','Check units: time is v₀/g.'],['√(2v₀/g)','(2*v0/g)**0.5','Use the Momentum Principle: the momentum drops at a steady rate Mg.']];
    const q14=mc({h:hO[0][0],v:hO[0][0],py:hO[0][1]},hO.slice(1).map(a=>({h:a[0],v:a[0],py:a[1],why:a[2]}))), q15=mc({h:tO[0][0],v:tO[0][0],py:tO[0][1]},tO.slice(1).map(a=>({h:a[0],v:a[0],py:a[1],why:a[2]})));
    if(!q14||!q15) return null;
    return [{stem:'What is the maximum height h<sub>max</sub> reached by the block above the point where it leaves the spring, in terms of v₀?',...q14,
      sol:[['After launch only gravity acts. System block + Earth.',X`\tfrac12Mv_0^2=Mgh_{\max}\quad\Rightarrow\quad h_{\max}=\frac{v_0^2}{2g}`]],how:'h_max = v₀²/2g',chk:{k:'x14-sym'}},
      {stem:'How long after leaving the spring does the block reach its highest point, in terms of v₀?',...q15,
      sol:[['Momentum Principle: the upward momentum drops to zero at the top.',X`0=Mv_0-Mgt\quad\Rightarrow\quad t_{\max}=\frac{v_0}{g}`]],how:'t_max = v₀/g',chk:{k:'x15-sym'}}];
  }
  const vy=d.v0*Math.sin(d.th*D2R), h=vy*vy/(2*XG), t=vy/XG, inc=d.incline, s=d.s;
  const vNoF=Math.sqrt(d.ks*s*s/d.M-2*XG*s*Math.sin(d.th*D2R)), vNoG=Math.sqrt(d.ks*s*s/d.M), Hh=x=>`${xn(x)} m`, Ht=x=>`${xn(x)} s`;
  const hd=[{h:Hh(d.v0*d.v0/(2*XG)),v:d.v0*d.v0/(2*XG),why:'Only the vertical part of the launch velocity, v₀ sin θ, is used up by gravity.'},{h:Hh(Math.pow(vNoG*Math.sin(d.th*D2R),2)/(2*XG)),v:Math.pow(vNoG*Math.sin(d.th*D2R),2)/(2*XG),why:'While the spring pushes, the block also rises against gravity'+(inc?' and loses energy to friction':'')+'.'},
    {h:Hh(vy*vy/XG),v:vy*vy/XG,why:'h = (v₀ sin θ)²/(2g): keep the ½.'},{h:Hh(h+s*Math.sin(d.th*D2R)),v:h+s*Math.sin(d.th*D2R),why:'Measure from the launch point, not from where the block was released.'}];
  if(inc) hd.push({h:Hh(Math.pow(vNoF*Math.sin(d.th*D2R),2)/(2*XG)),v:Math.pow(vNoF*Math.sin(d.th*D2R),2)/(2*XG),why:'Friction does negative work while the block slides up the ramp.'});
  hd.push({h:Hh(d.ks*s*s/(d.M*XG)),v:d.ks*s*s/(d.M*XG),why:'The spring stores ½k_s s², and the block also rises against gravity while the spring pushes.'});
  const td=[{h:Ht(d.v0/XG),v:d.v0/XG,why:'Only the vertical velocity component goes to zero at the top: t = v₀ sin θ/g.'},{h:Ht(2*t),v:2*t,why:'That is the time to go up and come back to launch height.'},
    {h:Ht(vNoG*Math.sin(d.th*D2R)/XG),v:vNoG*Math.sin(d.th*D2R)/XG,why:'Find v₀ including gravity'+(inc?' and friction':'')+' during the push.'},{h:Ht(t/2),v:t/2,why:'Momentum Principle: 0 = Mv₀ sin θ − Mgt.'}];
  if(inc) td.push({h:Ht(vNoF*Math.sin(d.th*D2R)/XG),v:vNoF*Math.sin(d.th*D2R)/XG,why:'Include friction\'s negative work in finding v₀.'});
  if(!inc){ hd.splice(0,1); td.splice(0,1); }
  const q14=mc({h:Hh(h),v:h},hd), q15=mc({h:Ht(t),v:t},td);
  if(!q14||!q15) return null;
  const v0step=['Speed at launch: system block + spring + Earth'+(inc?' (friction from the ramp does negative work)':'')+'; it travels s = L₀ − L while the spring pushes.',
    X`\tfrac12Mv_0^2=\tfrac12k_ss^2-Mgs${inc?X`\sin\theta-\mu_kMg\cos\theta\,s`:''}\quad\Rightarrow\quad v_0=${tn(d.v0)}${U('m/s')}`];
  return [{stem:'What maximum height above the launch point does the block reach?',...q14,
      sol:[v0step,[inc?'In flight only gravity acts; only the vertical component v₀ sin θ slows.':'In flight only gravity acts.',X`h_{\max}=\frac{(v_0${inc?'\\sin\\theta':''})^2}{2g}=${tn(h)}${U('m')}`]],how:inc?'h_max = (v₀ sin θ)²/(2g)':'h_max = v₀²/(2g)',chk:{k:'x14-num',...d}},
    {stem:'How long after launch does the block reach its highest point?',...q15,
      sol:[v0step,['Momentum Principle for the vertical motion.',X`0=Mv_0${inc?'\\sin\\theta':''}-Mgt\quad\Rightarrow\quad t_{\max}=${tn(t)}${U('s')}`]],how:inc?'t_max = v₀ sin θ/g':'t_max = v₀/g',chk:{k:'x15-num',...d}}];
}
function xLaunchSetup(d){
  if(d.kind==='sym') return `A spring of stiffness k<sub>s</sub> and relaxed length L₀ stands vertically on the floor. A block of mass M is held at rest pressing down on it, so the spring is compressed to length L. The block is not attached: when released, the spring pushes it up to the relaxed length L₀, where it leaves the spring with speed v₀ and flies straight up (see figure).`;
  if(!d.incline) return `A spring (k<sub>s</sub> = ${d.ks} N/m, relaxed length ${d.L0} m) stands vertically on the floor. A ${d.M} kg block is held at rest on top, compressing it to ${d.L} m. When released, the block leaves the spring at its relaxed length and flies straight up (see figure). Use g = 10 m/s².`;
  return `A spring (k<sub>s</sub> = ${d.ks} N/m, relaxed length ${d.L0} m) lies along a ramp inclined at ${d.th}°, fixed at the bottom. A ${d.M} kg block (not attached) is held at rest against it, compressing it to ${d.L} m. When released it slides up the ramp (μ<sub>k</sub> = ${d.mu}) and is launched off the end of the ramp, where the spring reaches its relaxed length, moving along the incline (see figure). Use g = 10 m/s².`;
}

/* ---------------------------------------------------------------- build one exam */
/* the two linked sets, shared by buildExam and the drill */
function xTrackSet(){ for(let i=0;i<120;i++){ const t=x89(); if(t) return t; } throw new Error('could not build the track set'); }
function xLaunchSet(){
  for(let i=0;i<200;i++){ const d=xLaunchData(); const l=d&&x1415(d);
    if(l) return {d,parts:l,setup:xLaunchSetup(d),fig:FIG.eLaunch({incline:d.incline,th:d.th,mu:d.mu})}; }
  throw new Error('could not build the launch set');
}
const XSINGLE=[x1,x2,x3,x4,x5,x6,x7,null,null,x10,x11,x12];   /* slots built on their own (null: linked set) */
function buildExam(){
  const t=xTrackSet(), L=xLaunchSet();
  const g1={setup:t.setup,fig:t.fig,from:7,to:8}, g2={setup:L.setup,fig:L.fig,from:12,to:14};
  const items=[x1,x2,x3,x4,x5,x6,x7].map(xroll).concat(t.items.map(x=>({...x,group:g1})))
    .concat([x10,x11,x12].map(xroll)).concat([x13(L.d)].concat(L.parts).map(x=>({...x,group:g2})));
  return items.map((it,i)=>({fig:'',...it,n:i+1,slot:XSLOTS[i]}));
}

