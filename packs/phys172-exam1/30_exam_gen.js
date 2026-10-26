
/* =====================================================================
   MOCK EXAM · FA26 Exam 1 format: 15 questions × 16 pts = 240, 60 minutes.
   Slot order and variations follow the department's practice key and its
   published "how this could change" list. g = 10 m/s², five options,
   "None of these" is never the key, every distractor is a known trap.
   ===================================================================== */
const XG=10, XPTS=16, XMIN=60;
const XGROUP_FROM=11;   /* index where the shared-setup multipart set starts (Q12); -1 if the exam has none */
/* pace = seconds a well-prepared student should need (total ≈ 47 of the real exam's 60 minutes) */
const XSLOTS=[
  {t:'T05',name:'Average speed / velocity',pace:180},{t:'T08',name:'Direction of Δp or force',pace:150},
  {t:'T04',name:'Crush force',pace:240},{t:'T06',name:'Statics',pace:240},{t:'T10',name:'Boxes in contact',pace:210},
  {t:'T13',name:'Electric force direction',pace:150},{t:'T12',name:'Vertical circle',pace:210},{t:'T02',name:'Buoyancy',pace:210},
  {t:'T07',name:'Young’s modulus',pace:210},{t:'T03',name:'Oscillation period',pace:180},{t:'T16',name:'Static vs kinetic friction',pace:180},
  {t:'T24',name:'Claim, evidence, reasoning',pace:120},{t:'T01',name:'Ramp: net force',pace:180},
  {t:'T01',name:'Ramp: momentum',pace:150},{t:'T01',name:'Ramp: position',pace:180}];
const XTOT=XSLOTS.length*XPTS;
const XPACE=XSLOTS.map(s=>s.pace);
/* the variant a generator built: each sets XV to its own "kind" (69_taxonomy.js labels them) */
let XV=null;

/* exam trig: 37° and 53° use the 3-4-5 values the exams print */
const XS_=d=>d===37?0.6:d===53?0.8:Math.sin(d*D2R);
const XC_=d=>d===37?0.8:d===53?0.6:Math.cos(d*D2R);
const xn=(v,n)=>sci(v,n||3);
const xvec=(a,b,u)=>`⟨${xn(a)}, ${xn(b||0)}, 0⟩${u?' '+u:''}`;
const XNOTA='None of these';
function shuf(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
const farNum=(a,b,rel)=>{ if(a===b)return false; const m=Math.max(Math.abs(a),Math.abs(b)); return m>0&&Math.abs(a-b)/m>=rel; };

/* correct {h,v}; dis [{h,v,why}]. Five options: four real + "None of these", or five real.
   Numeric options must sit at least 5% apart so "closest answer" is never ambiguous. */
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
  const list=shuf([{h:correct.h,v:correct.v,why:null,ok:true}].concat(chosen.slice(0,nota?3:4)));
  if(nota) list.push({h:o.notaText||XNOTA,v:'NOTA',why:o.notaWhy||null,nota:true});
  return {opts:list,key:list.findIndex(x=>x.ok)};
}
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const fracF=(p,q)=>{ const g=gcd(p,q); p/=g; q/=g; return q===1?(p===1?'F':`${p}F`):(p===1?`F/${q}`:`${p}F/${q}`); };

/* ---------------------------------------------------------------- Q1 · T05 */
function xAvg(){
  const kind=pick(['circle','circle','rect','square','tri','trap','jog']);
  const ask=pick(['speed','velocity','velocity']);            /* official tweak: ask for average VELOCITY */
  XV=ask;
  const who=pick(['A runner','A cyclist','A jogger','A skater']);
  const sp=shuf([2,3,4,5,6,8,10,12]);
  let P,order,arc=false,R=0,stem,decoy=null;
  if(kind==='circle'){
    R=pick([20,30,40,50,60]); const n=pick([2,3,3]); arc=true;
    P={A:[-R,0],B:[0,R],C:[R,0],D:[0,-R]}; order=['A','B','C','D'].slice(0,n+1);
    stem=`${who} goes clockwise around a circle of radius ${R} m centered at the origin: from A = (−${R} m, 0) `+
         `to B = (0, ${R} m) to C = (${R} m, 0)${n===3?` to D = (0, −${R} m)`:''}, each leg a quarter circle.`;
  }else if(kind==='rect'||kind==='square'){
    const w=kind==='square'?pick([30,40,50,60,80]):pick([30,40,50,60,80]);
    let h=kind==='square'?w:pick([20,30,40,50,60]); if(kind==='rect'&&h===w) h=w/2;
    P={A:[0,0],B:[0,h],C:[w,h],D:[w,0]}; order=['A','B','C','D'];
    stem=`${who} runs along three sides of a ${kind==='square'?'square':'rectangle'}, in straight lines from A = (0, 0) `+
         `to B = (0, ${h} m) to C = (${w} m, ${h} m) to D = (${w} m, 0).`;
  }else if(kind==='trap'){
    const a=pick([10,20,30]),h=pick([20,30,40]),b=pick([30,40,50]);
    P={A:[0,0],B:[a,h],C:[a+b,h],D:[2*a+b,0]}; order=['A','B','C','D'];
    stem=`${who} runs along three sides of a trapezoid, in straight lines from A = (0, 0) to B = (${a} m, ${h} m) `+
         `to C = (${a+b} m, ${h} m) to D = (${2*a+b} m, 0).`;
  }else if(kind==='tri'){
    const s=pick([30,60,90,120]);
    P={A:[0,0],B:[s/2,s*Math.sqrt(3)/2],C:[s,0]}; order=['A','B','C']; decoy=sp[2];
    stem=`Points A, B and C form an equilateral triangle with ${s} m sides; A is at the origin and C is on the +x axis. `+
         `${who} goes from A to B and then from B to C. (On the way back from C to A the speed is ${decoy} m/s.)`;
  }else{
    const k=pick([10,20,30]);
    P={A:[0,0],B:[0,3*k],C:[4*k,0]}; order=['A','B','C'];
    stem=`${who} runs ${3*k} m due north from A to B, then ${5*k} m in a straight line from B to C, which is due east of A.`;
  }
  const segs=order.slice(1).map((b,i)=>{
    const a=order[i],len=arc?Math.PI*R/2:Math.hypot(P[b][0]-P[a][0],P[b][1]-P[a][1]);
    return {a,b,len,v:sp[i]};
  });
  if(kind==='jog'){ const pr=pick([[6,12],[4,8],[5,10],[3,9],[4,12]]); segs[0].v=pr[0]; segs[1].v=pr[1]; }
  const end=order[order.length-1];
  const Dt=segs.reduce((s,g)=>s+g.len,0), T=segs.reduce((s,g)=>s+g.len/g.v,0), S=Dt/T;
  const dx=P[end][0]-P.A[0], dy=P[end][1]-P.A[1], dm=Math.hypot(dx,dy), ux=dx/dm, uy=dy/dm;
  const vx=dx/T, vy=dy/T, vm=dm/T, mean=segs.reduce((s,g)=>s+g.v,0)/segs.length;
  const legs=segs.map(g=>`${g.v} m/s from ${g.a} to ${g.b}`);
  stem+=` The speed is constant on each leg: ${legs.slice(0,-1).join(', ')}${legs.length>2?',':''} and ${legs[legs.length-1]}. `+
        `What is the average ${ask} from A to ${end}?`;
  const proj=(a,b)=>a*ux+b*uy;
  let r;
  if(ask==='speed'){
    const dis=[{h:xn(mean)+' m/s',v:mean,why:'Averaged the leg speeds. Average speed is total distance ÷ total time, which weights each speed by the time spent at it.'},
      {h:xn(vm)+' m/s',v:vm,why:'Used the displacement instead of the distance. That is the size of the average velocity.'},
      {h:xn(segs[segs.length-1].v)+' m/s',v:segs[segs.length-1].v,why:'Used the speed on the last leg only.'}];
    const eq=segs.length/segs.reduce((s,g)=>s+1/g.v,0);
    if(!arc) dis.push({h:xn(eq)+' m/s',v:eq,why:'Treated the legs as if they had equal length.'});
    if(decoy) dis.push({h:xn((segs[0].v+segs[1].v+decoy)/3)+' m/s',v:(segs[0].v+segs[1].v+decoy)/3,why:'Averaged in the speed on the C-to-A leg, which is not part of this trip.'});
    r=mc({h:xn(S)+' m/s',v:S},dis);
  }else{
    const V=(a,b,why)=>({h:xvec(a,b,'m/s'),v:proj(a,b),why});
    const tl=segs[segs.length-1].len/segs[segs.length-1].v, Tm=Dt/mean;
    const dis=[V(S*ux,S*uy,'Divided the total distance, not the displacement, by the time. That is the average speed pointed along Δr.'),
      V(dx/Tm,dy/Tm,'Found the total time from the mean of the leg speeds.'),
      V(-vx,-vy,'Used r_A − r_end for the displacement: final minus initial is the other way round.'),
      V(dx/tl,dy/tl,'Divided by the time of one leg instead of the total time.')];
    r=mc({h:xvec(vx,vy,'m/s'),v:proj(vx,vy)},dis);
  }
  if(!r) return null;
  const lenTex=arc?X`d=\frac{\pi R}{2}=\frac{\pi(${R})}{2}=${tn(segs[0].len)}\ \text{m for each leg}`
                  :segs.map(g=>X`d_{${g.a}${g.b}}=${tn(g.len)}\ \text{m}`).join(',\\qquad ');
  const tTex=segs.map(g=>X`t_{${g.a}${g.b}}=\frac{${tn(g.len)}}{${g.v}}=${tn(g.len/g.v)}\ \text{s}`).join(',\\qquad ')+X`,\qquad T=${tn(T)}\ \text{s}`;
  const sol=[[arc?'Length of each quarter-circle leg.':'Length of each leg.',lenTex],['Time on each leg, then the total time.',tTex]];
  if(ask==='speed') sol.push(['Average speed is total distance over total time.',X`\bar v=\frac{d_{\text{tot}}}{T}=\frac{${tn(Dt)}}{${tn(T)}}=${tn(S)}${U('m/s')}`]);
  else sol.push(['Displacement is final position minus initial position.',X`\Delta\mathbf r=\mathbf r_${end}-\mathbf r_A=${tv(dx,dy,0)}${U('m')}`],
                ['Average velocity is displacement over total time.',X`\mathbf v_{\text{avg}}=\frac{\Delta\mathbf r}{T}=\frac{${tv(dx,dy,0)}}{${tn(T)}}=${tv(vx,vy,0)}${U('m/s')}`]);
  return {stem,fig:FIG.xPath(P,order,arc,R,decoy!==null),...r,sol,
    how:'Average speed = total distance ÷ total time (never the mean of the speeds). Average velocity = displacement ÷ total time.'};
}

/* ---------------------------------------------------------------- Q2 · T08 */
const XDIAG={A:[1,1],B:[1,-1],C:[-1,-1],D:[-1,1]};
const diagOf=(x,y)=>Object.keys(XDIAG).find(k=>XDIAG[k][0]===Math.sign(x)&&XDIAG[k][1]===Math.sign(y));
const dirWord={'1,0':'+x','-1,0':'−x','0,1':'+y','0,-1':'−y'};
function xDp(){
  const D4=[[1,0],[-1,0],[0,1],[0,-1]];
  let di,df,stem,fig,askF;
  if(Math.random()<0.65){
    di=pick(D4); df=pick(D4.filter(d=>d[0]*di[0]+d[1]*di[1]===0)); askF=Math.random()<0.5;
    stem=`A hockey puck slides on frictionless ice (top view, +x to the right, +y up the page). It moves from 1 to 2 `+
         `with constant momentum in the ${dirWord[di]} direction. At 2 a stick hits it briefly with a constant force, and it then `+
         `moves from 2 to 3 with constant momentum in the ${dirWord[df]} direction; |p| is the same before and after. `+
         `Which arrow best shows the direction of ${askF?'the force the stick exerted on the puck':'the change in momentum Δp'}?`;
    fig=FIG.xPuck(di,df);
  }else{
    const V={1:[0,-1],2:[1,0],3:[0,1],4:[-1,0]}, k=ri(1,4), n=k%4+1; di=V[k]; df=V[n]; askF=false;
    stem=`A satellite moves counterclockwise at constant speed in a circular orbit around a planet (see figure). `+
         `Which arrow best shows the direction of the satellite's change in momentum Δp as it goes from position ${k} to position ${n}?`;
    fig=FIG.xOrbit(k,n);
  }
  const dp=[df[0]-di[0],df[1]-di[1]], key=diagOf(dp[0],dp[1]);
  const sum=diagOf(df[0]+di[0],df[1]+di[1]), rev=diagOf(-dp[0],-dp[1]);
  const why={}; why[sum]='Added p_i instead of subtracting it: Δp = p_f − p_i.'; why[rev]='Found p_i − p_f. Δp is final minus initial.';
  Object.keys(XDIAG).forEach(a=>{ if(a!==key&&!why[a]) why[a]='Flipped one component. Work out p_f − p_i one component at a time.'; });
  const zero=Math.random()<0.5;
  const opts=shuf(Object.keys(XDIAG).map(a=>({h:`Arrow ${a}`,v:a,why:a===key?null:why[a],ok:a===key})));
  opts.push(zero?{h:'Zero: the speed did not change',v:'zero',why:'Δp is a vector. The direction changed even though |p| did not.'}
               :{h:XNOTA,v:'NOTA',why:null,nota:true});
  const sol=[['Momentum principle: the force points along Δp. Subtract the momenta, one component at a time.',
              X`\Delta\mathbf p=\mathbf p_f-\mathbf p_i=p\,${tv(df[0],df[1],0)}-p\,${tv(di[0],di[1],0)}=p\,${tv(dp[0],dp[1],0)}`],
             [`That vector points ${{A:'up and to the right',B:'down and to the right',C:'down and to the left',D:'up and to the left'}[key]}, which is Arrow ${key}. `+
              'Check the answer letters: they do not match the arrow letters.','']];
  return {stem,fig,opts,key:opts.findIndex(o=>o.ok),sol,
    how:'Δp = p_f − p_i (vector subtraction); the net force points along Δp. In uniform circular motion Δp points toward the center.'};
}

/* ---------------------------------------------------------------- Q3 · T04 */
function xCrush(){
  const kind=pick(['car','ball','drop','inverse']); XV=kind;
  let m,v,d,stem,ans,unit='N',dis,sol,how;
  const va=()=>['The force is constant, so the average velocity during the crush is halfway between the initial and final speeds.',X`v_{\text{avg}}=\frac{v_i+v_f}{2}=\frac{${v}+0}{2}=${tn(v/2)}${U('m/s')}`];
  if(kind==='car'){
    m=pick([1000,1200,1500,1800,2000]); v=pick([12,14,15,16,18,20,22,25]);
    const Lb=rf(4.2,4.9,2); d=rf(0.4,0.9,2); const La=rd(Lb-d,2); d=rd(Lb-La,2);
    ans=m*v*v/(2*d);
    stem=`In a crash test a ${m} kg car moving at ${v} m/s hits a rigid barrier and stops without rebounding. `+
         `The car is ${Lb.toFixed(2)} m long before the crash and ${La.toFixed(2)} m long after. Treating the barrier's force as constant, `+
         `what is its magnitude?`;
    dis=[{v:m*v*v/d,why:'Used the full speed instead of the average speed to get the crush time.'},
         {v:m*v*v/(2*Lb),why:'Used the car’s whole length instead of how much it crumpled.'},
         {v:m*v*v/(2*La),why:'Used the car’s final length instead of how much it crumpled.'},
         {v:m*v/d,why:'Divided Δp by the crush distance instead of the crush time.'}];
  }else if(kind==='ball'){
    m=pick([2,3,4,5]); v=pick([10,15,20,25]); const cm=pick([1,2,3,4,5]); d=cm/100;
    ans=m*v*v/(2*d);
    stem=`A ${m} kg ball moving at ${v} m/s hits a wall and stops without rebounding; it is squashed by ${cm} cm while it stops. `+
         `Treating the wall's force as constant, what is its magnitude?`;
    dis=[{v:m*v*v/d,why:'Used the full speed instead of the average speed to get the crush time.'},
         {v:m*v*v/(2*cm),why:'Left the crush distance in centimeters.'},
         {v:m*v/d,why:'Divided Δp by the crush distance instead of the crush time.'},
         {v:m*v*v/(4*d),why:'Halved the speed twice.'}];
  }else if(kind==='drop'){
    m=pick([60,90,120,150,190,250]); v=pick([6,7,8,10,12,15]); d=pick([0.1,0.15,0.18,0.2,0.25,0.3,0.5]);
    const Fn=m*v*v/(2*d); ans=Fn+m*XG;
    stem=`A ${m} kg steel safe falls and hits a concrete sidewalk at ${v} m/s. It does not bounce; the safe ends up ${d} m shorter. `+
         `Treating the force of the concrete as constant, what is its magnitude? Use g = 10 m/s².`;
    dis=[{v:Fn,why:'That is the NET force. The concrete must also cancel the weight, so add mg.'},
         {v:Fn-m*XG,why:'Subtracted mg. The concrete pushes up against both the change in momentum and gravity.'},
         {v:m*v*v/d+m*XG,why:'Used the full speed instead of the average speed to get the crush time.'},
         {v:m*v*v/d,why:'Used the full speed for the crush time and left out gravity.'}];
  }else{
    m=pick([1000,1200,1500,1800,2000]); v=pick([12,15,18,20,24]);
    const Fv=Number((m*v*v/(2*rf(0.45,0.95,2))).toPrecision(2));
    unit='m'; ans=m*v*v/(2*Fv);
    stem=`A ${m} kg car moving at ${v} m/s crashes into a barrier and stops. The barrier's force on the car is roughly constant `+
         `with magnitude ${xn(Fv,2)} N. How far does the front of the car crumple while it stops?`;
    dis=[{v:m*v*v/Fv,why:'Used the full speed instead of the average speed.'},
         {v:m*v/Fv,why:'That is the stopping time Δt, not the distance.'},
         {v:m*v*v/(4*Fv),why:'Halved the speed twice.'},
         {v:v*v/(2*Fv),why:'Left out the mass.'}];
    const dt=m*v/Fv;
    sol=[['Momentum principle: the stopping time follows from the force.',X`\Delta t=\frac{m|\Delta v|}{F}=\frac{(${m})(${v})}{${tn(Fv)}}=${tn(dt)}${U('s')}`],
         va(),['Distance is average velocity times time.',X`d=v_{\text{avg}}\Delta t=(${tn(v/2)})(${tn(dt)})=${tn(ans)}${U('m')}`]];
    how='Run the crush method backwards: Δt = mΔv/F, then d = v_avg·Δt with v_avg = (v_i + v_f)/2.';
  }
  if(!sol){
    const dt=d/(v/2), Fn=m*v/dt;
    sol=[va(),['Time to stop over the crush distance.',X`\Delta t=\frac{d}{v_{\text{avg}}}=\frac{${tn(d)}}{${tn(v/2)}}=${tn(dt)}${U('s')}`],
         ['Momentum principle: average net force is Δp/Δt.',X`|F_{\text{net}}|=\frac{m|\Delta v|}{\Delta t}=\frac{(${m})(${v})}{${tn(dt)}}=${tn(Fn)}${U('N')}`]];
    if(kind==='drop') sol.push(['The concrete also holds up the weight, so its force is the net force plus mg.',X`F_{\text{concrete}}=F_{\text{net}}+mg=${tn(Fn)}+(${m})(10)=${tn(ans)}${U('N')}`]);
    how=kind==='drop'?'v_avg = v/2 → Δt = d/v_avg → F_net = mΔv/Δt; the ground’s force is F_net + mg.'
                     :'v_avg = (v_i+v_f)/2 → Δt = d/v_avg → F = mΔv/Δt (same as mv²/2d).';
  }
  const r=mc({h:`${xn(ans)} ${unit}`,v:ans},dis.map(x=>({h:`${xn(x.v)} ${unit}`,v:x.v,why:x.why})));
  return r&&{stem,fig:'',...r,sol,how};
}

/* ---------------------------------------------------------------- Q4 · T06 */
function xStatics(){
  const kind=pick(['sym','asym','asym','wire','wire','pull']); XV=kind;
  if(kind==='sym'){
    const fromV=Math.random()<0.6, ref=fromV?'from the vertical':'above the horizontal';
    const stem=`A ball of mass M hangs at rest from a vertical string tied to a knot. Two more strings run from the knot `+
      `up to the ceiling, one on each side, each making an angle θ ${ref} (see figure). What is the tension F<sub>T</sub> in each upper string?`;
    const T=fromV?'Mg/(2 cos θ)':'Mg/(2 sin θ)', W=fromV?'Mg/(2 sin θ)':'Mg/(2 cos θ)';
    const r=mc({h:T,v:T},[{h:W,v:W,why:`θ is measured ${ref}, so the vertical part of each tension uses ${fromV?'cos':'sin'} θ.`},
      {h:'Mg/2',v:'Mg/2',why:'Left out the angle: only the vertical parts of the tensions hold up the ball.'},
      {h:'Mg',v:'Mg',why:'Two strings share the load.'},
      {h:fromV?'Mg/cos θ':'Mg/sin θ',v:'one',why:'Forgot there are two upper strings.'},
      {h:fromV?'2Mg cos θ':'2Mg sin θ',v:'mul',why:'Multiplied by the trig factor instead of dividing.'}]);
    return r&&{stem,fig:FIG.xKnot(0,0,fromV,true),...r,
      sol:[['System: the knot. It is at rest, so F<sub>net</sub> = dp/dt = 0. The x parts of the two tensions cancel by symmetry.',''],
           ['Vertical balance at the knot.',fromV?X`2F_T\cos\theta-Mg=0\quad\Rightarrow\quad F_T=\frac{Mg}{2\cos\theta}`:X`2F_T\sin\theta-Mg=0\quad\Rightarrow\quad F_T=\frac{Mg}{2\sin\theta}`]],
      how:'System = the knot, F_net = 0. Check whether θ is from the vertical or the horizontal.'};
  }
  if(kind==='asym'){
    const pr=pick([[30,60],[60,30],[37,53],[53,37],[45,30],[30,45],[45,60],[60,45]]), t1=pr[0], t2=pr[1];
    const M=pick([5,8,10,12,15,20]), W=M*XG;
    const s12=t1+t2===90?1:Math.sin((t1+t2)*D2R);
    const T1=W*XS_(t2)/s12, T2=W*XS_(t1)/s12, left=Math.random()<0.5, ans=left?T1:T2, oth=left?T2:T1;
    const stem=`A ${M} kg lamp hangs at rest from a knot by a vertical cord. Two strings run from the knot up to the ceiling: `+
      `the left one at ${t1}° from the vertical and the right one at ${t2}° from the vertical. What is the tension in the ${left?'left':'right'} string? `+
      `Use g = 10 m/s²${t1===37||t2===37?' (sin 37° = 0.6, cos 37° = 0.8)':''}.`;
    const ta=left?t1:t2;
    const r=mc({h:`${xn(ans)} N`,v:ans},[
      {h:`${xn(oth)} N`,v:oth,why:'That is the other string’s tension: the string closer to vertical carries more.'},
      {h:`${xn(W/(2*XC_(ta)))} N`,v:W/(2*XC_(ta)),why:'Used the symmetric-case formula Mg/(2 cos θ); with unequal angles you need both equations.'},
      {h:`${xn(W*XC_(ta))} N`,v:W*XC_(ta),why:'Took a component of the weight instead of solving the two balance equations.'},
      {h:`${xn(W/XC_(ta))} N`,v:W/XC_(ta),why:'Let one string hold the whole weight.'},
      {h:`${xn(W*XS_(left?t2:t1))} N`,v:W*XS_(left?t2:t1),why:'Dropped the sin(θ₁ + θ₂) denominator.'}]);
    return r&&{stem,fig:FIG.xKnot(t1,t2,true,false,`${M} kg`),...r,
      sol:[['System: the knot, at rest, so F<sub>net</sub> = 0. Horizontal balance:',X`T_L\sin ${t1}^\circ=T_R\sin ${t2}^\circ`],
           ['Vertical balance:',X`T_L\cos ${t1}^\circ+T_R\cos ${t2}^\circ=Mg=${tn(W)}\ \text{N}`],
           ['Substitute one equation into the other and simplify with sin(θ₁ + θ₂).',
            left?X`T_L=\frac{Mg\sin\theta_R}{\sin(\theta_L+\theta_R)}=\frac{(${tn(W)})\sin ${t2}^\circ}{\sin ${t1+t2}^\circ}=${tn(ans)}${U('N')}`
                :X`T_R=\frac{Mg\sin\theta_L}{\sin(\theta_L+\theta_R)}=\frac{(${tn(W)})\sin ${t1}^\circ}{\sin ${t1+t2}^\circ}=${tn(ans)}${U('N')}`]],
      how:'Knot at rest: write both the x and y balance equations, then substitute one into the other.'};
  }
  if(kind==='wire'){
    const th=pick([30,37,45,53,55,60,65]), m=pick([8,10,12,15,20]), W=m*XG, T=W/XS_(th), Fs=W*XC_(th)/XS_(th);
    const askW=Math.random()<0.5, ans=askW?T:Fs;
    const stem=`A ${m} kg block hangs at rest. A wire from the block to the ceiling makes ${th}° above the horizontal, and a `+
      `compressed horizontal spring pushes the block away from the side wall (see figure). What is the magnitude of the force `+
      `${askW?'the wire exerts':'the spring exerts'} on the block? Use g = 10 m/s²${th===37||th===53?' (sin 37° = 0.6, cos 37° = 0.8)':''}.`;
    const r=mc({h:`${xn(ans)} N`,v:ans},[
      {h:`${xn(askW?Fs:T)} N`,v:askW?Fs:T,why:`That is the ${askW?'spring':'wire'} force. The wire’s vertical part holds the weight; its horizontal part balances the spring.`},
      {h:`${xn(W/XC_(th))} N`,v:W/XC_(th),why:'Used cos where the vertical part of the wire needs sin (the angle is above the horizontal).'},
      {h:`${xn(W*XS_(th)/XC_(th))} N`,v:W*XS_(th)/XC_(th),why:'Swapped sin and cos: the angle is measured from the horizontal.'},
      {h:`${xn(W)} N`,v:W,why:'That is just the weight.'},
      {h:`${xn(W*XS_(th))} N`,v:W*XS_(th),why:'Multiplied by the trig factor instead of dividing.'}]);
    return r&&{stem,fig:FIG.xWire(th),...r,
      sol:[['System: the block, at rest, so F<sub>net</sub> = 0. Only the wire has a vertical part to hold the weight.',
            X`T\sin ${th}^\circ=mg\quad\Rightarrow\quad T=\frac{(${m})(10)}{\sin ${th}^\circ}=${tn(T)}${U('N')}`],
           ['Horizontal: the spring balances the wire’s horizontal part.',X`F_s=T\cos ${th}^\circ=\frac{mg}{\tan ${th}^\circ}=${tn(Fs)}${U('N')}`]],
      how:'Wire at θ above horizontal: T = mg/sin θ; horizontal spring F = mg/tan θ. The two are each other’s distractors.'};
  }
  const fromV=Math.random()<0.6, ref=fromV?'from the vertical':'above the horizontal';
  const good=fromV?'F₁ cos θ − mg = 0 and F₂ − F₁ sin θ = 0':'F₁ sin θ − mg = 0 and F₂ − F₁ cos θ = 0';
  const bad=fromV?'F₁ sin θ − mg = 0 and F₂ − F₁ cos θ = 0':'F₁ cos θ − mg = 0 and F₂ − F₁ sin θ = 0';
  const stem=`A block of mass m hangs at rest from a string (tension F₁) tied to the ceiling. You pull the block horizontally with `+
    `force F₂, so the string makes an angle θ ${ref}. Which pair of equations is correct?`;
  const r=mc({h:good,v:good},[{h:bad,v:bad,why:`θ is measured ${ref}, so the vertical part of F₁ is F₁ ${fromV?'cos':'sin'} θ.`},
    {h:'F₂ cos θ − mg = 0 and F₁ − F₂ sin θ = 0',v:'b1',why:'F₂ is horizontal: it has no vertical part to hold the weight.'},
    {h:'F₂ sin θ − mg = 0 and F₁ − F₂ cos θ = 0',v:'b2',why:'F₂ is horizontal: it has no vertical part to hold the weight.'},
    {h:'F₁ − mg = 0 and F₂ − F₁ = 0',v:'b3',why:'Left out the angle; only part of F₁ is vertical.'}]);
  return r&&{stem,fig:FIG.xPull(fromV),...r,
    sol:[['System: the block, at rest, so F<sub>net</sub> = 0 in each direction.',''],
         [`With θ ${ref}, the string’s vertical part is F₁ ${fromV?'cos':'sin'} θ and its horizontal part is F₁ ${fromV?'sin':'cos'} θ.`,
          fromV?X`y:\ F_1\cos\theta-mg=0,\qquad x:\ F_2-F_1\sin\theta=0`:X`y:\ F_1\sin\theta-mg=0,\qquad x:\ F_2-F_1\cos\theta=0`]],
    how:'Resolve the angled force; check whether θ is from the vertical or the horizontal.'};
}

/* ---------------------------------------------------------------- Q5 · T10 */
function xBoxes(){
  if(Math.random()<0.5){
    const pr=pick([[60,20],[20,60],[30,10],[10,30],[20,30],[30,20],[40,10],[10,40]]), m1=pr[0], m2=pr[1], M=m1+m2;
    const fromLeft=Math.random()<0.5, i=pick([1,2]), mi=i===1?m1:m2, mo=i===1?m2:m1;
    const ask=pick(['net','contact']); XV=ask;
    const pushed=fromLeft?1:2, pushedM=fromLeft?m1:m2, farM=fromLeft?m2:m1;
    let ans,ansP,stem;
    const base=`Two boxes sit side by side on frictionless ice: box 1 (${m1} kg) on the left and box 2 (${m2} kg) on the right. `+
      `A horizontal force of magnitude F pushes ${fromLeft?'box 1 toward +x (applied from the left)':'box 2 toward −x (applied from the right)'}, and the boxes move together. `;
    if(ask==='net'){ ansP=mi; stem=base+`What is the magnitude of the net force on box ${i}?`; }
    else{ ansP=farM; stem=base+`What is the magnitude of the force box ${pushed} exerts on box ${3-pushed}?`; }
    const h=p=>fracF(p,M), val=p=>p/M;
    const cand=[{h:h(ask==='net'?mo:pushedM),v:val(ask==='net'?mo:pushedM),why:ask==='net'?'Used the other box’s mass.':'Used the mass of the box you push, not the box being pushed.'},
      {h:'F',v:1,why:ask==='net'?'The push is not the only horizontal force on a box: the boxes push on each other.':'The contact force only has to accelerate the box beyond the contact.'},
      {h:'F/2',v:0.5,why:'Split F equally between unequal masses.'},
      {h:fracF(Math.min(mi,mo),Math.max(mi,mo)),v:Math.min(mi,mo)/Math.max(mi,mo),why:'Used a ratio of the two masses instead of mass ÷ total mass.'},
      {h:'0',v:0,why:'The boxes accelerate, so the net force on each is not zero.'}];
    const r=mc({h:h(ansP),v:val(ansP)},cand,{rel:0.02});
    const a=X`a=\frac{F}{m_1+m_2}=\frac{F}{${M}\ \text{kg}}`;
    return r&&{stem,fig:FIG.xBoxes([m1,m2],fromLeft,'F'),...r,
      sol:[['System: both boxes. The forces between them are internal and cancel, so the push alone accelerates the pair.',a],
           ask==='net'?[`Now take box ${i} alone as the system: its net force is its mass times the shared acceleration.`,X`F_{\text{net},${i}}=m_${i}a=\frac{${mi}}{${M}}F=${h(ansP).replace('F','\\,F')}`]
                      :[`Box ${3-pushed} has only the contact force on it horizontally, so that force gives it the shared acceleration.`,X`F_{${pushed}\text{ on }${3-pushed}}=m_${3-pushed}a=\frac{${farM}}{${M}}F=${h(ansP).replace('F','\\,F')}`]],
      how:'System = both boxes → a = F/M. Then isolate one box: net force = m_i·a; contact force = (mass beyond the contact)·a.'};
  }
  const ms=[pick([2,4,6]),pick([2,4,6,8]),pick([4,6,8])], F=pick([120,200,240,300,400,600]), M=ms[0]+ms[1]+ms[2], a=F/M;
  const q=pick(['2on3','3on2','1on2','net2']); XV=q;
  let ans,stem,expl,tex;
  const base=`Three blocks sit in a row on a frictionless table: m₁ = ${ms[0]} kg (left), m₂ = ${ms[1]} kg, m₃ = ${ms[2]} kg (right). `+
             `A force <b>F</b> = ⟨${F}, 0, 0⟩ N pushes on m₁. `;
  if(q==='2on3'){ ans=ms[2]*a; stem=base+'What force does block 2 exert on block 3?'; tex=X`\mathbf F_{2\text{ on }3}=m_3a=(${ms[2]})(${tn(a)})`; expl='Block 3 has only block 2’s push on it, so that push gives it the shared acceleration.'; }
  else if(q==='3on2'){ ans=-ms[2]*a; stem=base+'What force does block 3 exert on block 2?'; tex=X`\mathbf F_{3\text{ on }2}=-m_3a=-(${ms[2]})(${tn(a)})`; expl='Block 2 pushes block 3 forward with m₃a; by reciprocity block 3 pushes back on block 2 with the same size, toward −x.'; }
  else if(q==='1on2'){ ans=(ms[1]+ms[2])*a; stem=base+'What force does block 1 exert on block 2?'; tex=X`\mathbf F_{1\text{ on }2}=(m_2+m_3)a=(${ms[1]+ms[2]})(${tn(a)})`; expl='Block 1’s push has to accelerate everything beyond the contact: blocks 2 and 3.'; }
  else{ ans=ms[1]*a; stem=base+'What is the net force on block 2?'; tex=X`\mathbf F_{\text{net},2}=m_2a=(${ms[1]})(${tn(a)})`; expl='The net force on one block is its own mass times the shared acceleration.'; }
  const V=(x,why)=>({h:xvec(x,0,'N'),v:x,why});
  const r=mc(V(ans),[V(-ans,'Sign flipped: F_{A on B} and F_{B on A} point opposite ways; check which block pushes which.'),
    V((ms[1]+ms[2])*a*(ans<0?-1:1),'That is the force block 1 exerts on block 2: it moves blocks 2 and 3.'),
    V(ms[1]*a*(ans<0?-1:1),'Used block 2’s mass.'),V(ms[2]*a*(ans<0?-1:1),'Used block 3’s mass.'),
    V(F/3*(ans<0?-1:1),'Split the force equally among the blocks.'),V((F-ms[2]*a)*(ans<0?-1:1),'Subtracted instead of using the mass beyond the contact.')]);
  return r&&{stem,fig:FIG.xBoxes(ms,true,`${F} N`),...r,
    sol:[['System: all three blocks. Internal forces cancel.',X`a=\frac{F}{m_1+m_2+m_3}=\frac{${F}}{${M}}=${tn(a)}${U('m/s²')}`],
         [expl,X`${tex}=${tv(ans,0,0)}${U('N')}`]],
    how:'a = F/M_total. Contact force = (mass downstream of the contact)·a. "3 on 2" is negative when F is +x.'};
}

/* ---------------------------------------------------------------- Q6 · T13 */
function xElec(){
  const kind=pick(['line','line','sys3','oval']); XV=kind;
  const force=(mem,ext)=>mem.reduce((s,c)=>s+ext.reduce((t,e)=>{const d=c.x-e.x;return t+c.q*e.q*Math.sign(d)/(d*d);},0),0);
  let chg,sys=[],stem,ask;
  const dir=f=>f<0?'left':'right';
  if(kind==='line'){
    const D=rf(2.4,3.4,1), p=rd(Math.random()<0.5?rf(0.6,D/2-0.35,1):rf(D/2+0.35,D-0.6,1),1);
    chg=[{q:-1,x:0,l:'−'},{q:1,x:p,l:'+'},{q:-1,x:D,l:'−'}];
    sys=[1]; stem=`Three charges sit on a horizontal line (see figure): equal negative charges at x = 0 and x = ${D} m, and a positive charge `+
      `at x = ${p} m. What is the direction of the net electric force on the positive charge?`;
  }else if(kind==='sys3'){
    const D=rf(2.4,3.4,1), p=rd(Math.random()<0.5?rf(0.6,D/2-0.35,1):rf(D/2+0.35,D-0.6,1),1);
    chg=[{q:-1,x:0,l:'−'},{q:1,x:p,l:'+'},{q:-1,x:D,l:'−'}];
    sys=Math.random()<0.5?[0,1]:[1,2];
    const nm=i=>`the ${chg[i].q>0?'positive':'negative'} charge at x = ${chg[i].x} m`;
    stem=`Three charges sit on a horizontal line (see figure): equal negative charges at x = 0 and x = ${D} m, and a positive charge `+
      `(same magnitude) at x = ${p} m. Take ${nm(sys[0])} and ${nm(sys[1])} together as the system (inside the dashed oval). `+
      `What is the direction of the net force on the system?`;
  }else{
    const s=rf(0.8,1.4,1), gap=rf(1.2,2.4,1), extQ=pick([1,-1]), extLeft=Math.random()<0.5;
    const pair=Math.random()<0.5?[1,-1]:[-1,1];
    chg=[{q:pair[0],x:0,l:pair[0]>0?'+Q':'−Q'},{q:pair[1],x:s,l:pair[1]>0?'+Q':'−Q'}];
    chg.push({q:extQ,x:extLeft?-gap:s+gap,l:extQ>0?'+Q':'−Q'});
    sys=[0,1];
    const nq=q=>q>0?'+Q':'−Q';
    stem=`A system (inside the dashed oval) is made of a ${nq(pair[0])} charge and, ${s} m to its right, a ${nq(pair[1])} charge. A third charge ${extQ>0?'+Q':'−Q'} sits `+
      `${gap} m to the ${extLeft?'left':'right'} of the system on the same line (see figure). What is the direction of the net force on the system?`;
  }
  const mem=sys.map(i=>chg[i]), ext=chg.filter((c,i)=>sys.indexOf(i)<0), F=force(mem,ext);
  const key=dir(F), other=key==='left'?'right':'left';
  const O=(h,why,ok)=>({h,v:h,why,ok});
  const opts=shuf([O(`Horizontal to the ${key}`,null,true),
    O(`Horizontal to the ${other}`,kind==='line'?'The nearer negative charge pulls harder (force ∝ 1/r²).':'The member closer to the outside charge dominates (force ∝ 1/r²).'),
    O('Zero',kind==='line'?'The two negative charges are at different distances, so their pulls don’t cancel.':'The system’s net charge is zero, but its members sit at different distances from the outside charge, so the forces don’t cancel.'),
    O('Not enough information','Relative distances are enough: each force scales as 1/r².')]);
  opts.push(Math.random()<0.5?O(XNOTA,null):O('Vertically up','All the charges lie on one horizontal line, so every force is horizontal.'));
  if(opts[4].h===XNOTA) opts[4].nota=true;
  const sol=[];
  if(sys.length>1) sol.push(['Only forces from outside the system count: the forces between the two members are internal and cancel.','']);
  mem.forEach(c=>ext.forEach(e=>{ const d=Math.abs(c.x-e.x), f=c.q*e.q*Math.sign(c.x-e.x);
    sol.push([`On ${c.l} at x = ${c.x} m from ${e.l} at x = ${e.x} m: ${c.q*e.q<0?'attraction':'repulsion'} toward the ${f<0?'left':'right'}, strength ∝ 1/r².`,
      X`\frac{1}{r^2}=\frac{1}{(${tn(d)})^2}=${tn(1/(d*d))}`]); }));
  sol.push([`Add them with signs (right positive): the sum is ${F<0?'negative':'positive'}, so the net force points to the ${key}.`,
    X`\textstyle\sum \pm\frac{1}{r^2}=${tn(F)}`]);
  return {stem,fig:FIG.xCharges(chg,sys),opts,key:opts.findIndex(o=>o.ok),sol,
    how:'Force ∝ 1/r²: the nearer charge wins. For a system, add only the external forces on each member.'};
}

/* ---------------------------------------------------------------- Q7 · T12 */
function xCirc(){
  const kind=pick(['dip','crest','tarzan','bucket','baby','plane']); XV=kind;
  let m,R,v,top,who,force,stem;
  if(kind==='dip'||kind==='crest'){
    m=pick([1000,1500,2000,2500]); R=pick([20,25,40,50,80]); top=kind==='crest';
    v=top?rd(Math.sqrt(XG*R*rf(0.25,0.75,2)),0):pick([10,15,20,25]); force='normal force from the road';
    stem=`A car and its occupants (total mass ${m} kg) drive at a constant ${v} m/s ${top?'over the top of a hill':'through the bottom of a dip'} `+
         `whose shape is a circle of radius ${R} m. What is the magnitude of the ${force} at that point? Use g = 10 m/s².`;
  }else if(kind==='plane'){
    m=pick([60,70,80,90,100]); R=pick([2000,3000,4000,5000]); top=true; v=Math.round(Math.sqrt(XG*R*rf(0.2,0.7,2))/10)*10; force='force the seat exerts on the passenger';
    stem=`A ${m} kg passenger rides in a plane flying a vertical circular arc of radius ${R} m at a constant ${v} m/s. At the `+
         `highest point of the arc, what is the magnitude of the ${force}? Use g = 10 m/s².`;
  }else{
    top=false;
    if(kind==='tarzan'){ m=pick([60,70,80,90,100]); R=pick([3,4,5,6]); v=pick([4,5,6,7]); who=`Tarzan (${m} kg) swings on a ${R} m vine`; force='tension in the vine'; }
    else if(kind==='baby'){ m=pick([8,10,12,15]); R=pick([1.5,2,2.5]); v=pick([2,3,4]); who=`A ${m} kg baby rides a swing on ${R} m ropes`; force='total tension in the ropes'; }
    else { m=pick([2,3,4,5]); R=pick([0.8,1,1.2]); v=pick([4,5,6]); who=`You swing a ${m} kg bucket of water in a vertical circle of radius ${R} m`; force='tension in the rope'; }
    stem=`${who}. At the lowest point the speed is ${v} m/s. What is the magnitude of the ${force} there? Use g = 10 m/s².`;
  }
  const W=m*XG, C=m*v*v/R, ans=top?W-C:W+C;
  const U_='N', H=x=>`${xn(x)} ${U_}`;
  const r=mc({h:H(ans),v:ans},[{h:H(top?W+C:W-C),v:top?W+C:W-C,why:`Sign error: at the ${top?'top the center is below, so the net force points down':'bottom the center is above, so the net force points up'}.`},
    {h:H(C),v:C,why:'That is only the net force mv²/R; gravity also acts.'},
    {h:H(W),v:W,why:'Ignored the circular motion: the net force is not zero.'},
    {h:H(Math.abs(C-W)),v:Math.abs(C-W),why:'Subtracted the weight from mv²/R the wrong way round.'},
    {h:H(W+m*v*v),v:W+m*v*v,why:'Forgot to divide mv² by R.'}]);
  return r&&{stem,fig:'',...r,
    sol:[[`Moving in a circle at constant speed, the net force is mv²/R toward the center, which is ${top?'below':'above'} the object.`,X`\frac{mv^2}{R}=\frac{(${m})(${v})^2}{${R}}=${tn(C)}${U('N')}`],
         [top?'At the top: gravity down minus the upward push equals mv²/R.':'At the bottom: the upward force minus gravity equals mv²/R.',
          top?X`mg-F=\frac{mv^2}{R}\quad\Rightarrow\quad F=${tn(W)}-${tn(C)}=${tn(ans)}${U('N')}`:X`F-mg=\frac{mv^2}{R}\quad\Rightarrow\quad F=${tn(W)}+${tn(C)}=${tn(ans)}${U('N')}`]],
    how:'Bottom (dip, vine, swing, bucket): F = mg + mv²/R. Top (hill, plane seat): F = mg − mv²/R.'};
}

/* ---------------------------------------------------------------- Q8 · T02 */
function xBuoy(){
  const kind=pick(['liq','obj','vol','down','down','up']); XV=kind;
  let stem,ans,unit,dis,sol,how;
  if(kind==='liq'||kind==='obj'){
    const f=pick([0.6,0.7,0.75,0.8,0.9]), ro=pick([600,700,800,900,1000,1100]), rl=kind==='liq'?ro/f:pick([900,1000,1100,1200,1300]);
    const rob=kind==='liq'?ro:f*rl; unit='kg/m³';
    if(kind==='liq'){ ans=rl; stem=`A ball floats with ${Math.round(f*100)}% of its volume submerged. The ball's density is ${ro} kg/m³. What is the density of the liquid?`;
      dis=[{v:ro*f,why:'Multiplied instead of dividing: the liquid must be denser than a floating object.'},{v:ro/(1-f),why:'Used the fraction above the surface.'},{v:ro*(1-f),why:'Used the fraction above the surface and multiplied.'},{v:ro,why:'A floating object is less dense than the liquid.'}];
      sol=[['Floating: the buoyant force equals the weight, so ρ_obj·V_tot = ρ_liq·V_sub.',X`\rho_{\text{liq}}=\frac{\rho_{\text{obj}}}{f}=\frac{${ro}}{${f}}=${tn(ans)}${U('kg/m³')}`]];
    }else{ ans=rob; stem=`A block floats in a liquid of density ${rl} kg/m³ with ${Math.round(f*100)}% of its volume submerged. What is the density of the block?`;
      dis=[{v:rl/f,why:'Divided instead of multiplying: a floating object is less dense than the liquid.'},{v:rl*(1-f),why:'Used the fraction above the surface.'},{v:rl,why:'A floating object is less dense than the liquid.'},{v:rl/(1-f),why:'Used the fraction above the surface and divided.'}];
      sol=[['Floating: ρ_obj·V_tot = ρ_liq·V_sub, so the object density is the submerged fraction times the liquid density.',X`\rho_{\text{obj}}=f\rho_{\text{liq}}=(${f})(${rl})=${tn(ans)}${U('kg/m³')}`]];
    }
    how='Floating: ρ_obj = f·ρ_liq (f = submerged fraction). The liquid is always the denser one.';
  }else if(kind==='vol'){
    const Vt=pick([1,2,3,4,5])*1e-3, ro=pick([400,500,600,700,800]), rl=pick([1000,1100,1200]); ans=Vt*ro/rl; unit='m³';
    stem=`A ${xn(Vt)} m³ block of density ${ro} kg/m³ floats in a liquid of density ${rl} kg/m³. What volume of the block is below the surface?`;
    dis=[{v:Vt*rl/ro,why:'Flipped the density ratio: the submerged volume is smaller than the whole block.'},{v:Vt-ans,why:'That is the volume above the surface.'},{v:Vt,why:'A floating block is only partly submerged.'},{v:Vt*ro/1000*(rl===1000?0.5:1),why:'Mixed up the liquid density.'}];
    sol=[['Floating: buoyant force = weight, so V_sub·ρ_liq·g = V_tot·ρ_obj·g.',X`V_{\text{sub}}=V_{\text{tot}}\frac{\rho_{\text{obj}}}{\rho_{\text{liq}}}=(${tn(Vt)})\frac{${ro}}{${rl}}=${tn(ans)}${U('m³')}`]];
    how='Flotation: V_sub·ρ_liq = V_tot·ρ_obj. Know three, find the fourth.';
  }else if(kind==='down'){
    const ro=pick([150,200,250,400,500]), m=pick([0.01,0.02,0.03,0.05,0.1]), V=m/ro, B=1000*V*XG, W=m*XG; ans=B-W; unit='N';
    const what=ro<=250?'cork':'foam';
    stem=`A piece of ${what} (density ${ro} kg/m³, mass ${m} kg) is held completely under water (1000 kg/m³) by a string tied to the bottom of the container. What is the tension in the string? Use g = 10 m/s².`;
    dis=[{v:B,why:'That is the buoyant force alone; the weight also pulls down.'},{v:B+W,why:'The string and gravity both pull down, so the string supplies B − mg, not B + mg.'},{v:W,why:'That is the weight.'},{v:1000*m*XG/ro/2,why:'Halved the buoyant force.'}];
    sol=[['Volume from the density.',X`V=\frac{m}{\rho}=\frac{${m}}{${ro}}=${tn(V)}${U('m³')}`],
         ['Buoyant force from the water it displaces.',X`F_B=\rho_wVg=(1000)(${tn(V)})(10)=${tn(B)}${U('N')}`],
         ['At rest: buoyant force up, weight and string down.',X`F_B-mg-T=0\quad\Rightarrow\quad T=${tn(B)}-${tn(W)}=${tn(ans)}${U('N')}`]];
    how='V = m/ρ_obj; B = ρ_water·V·g; held down by a string: T = B − mg.';
  }else{
    const mat=pick([['aluminum',2700],['iron',7900],['copper',8900],['zinc',7100]]), m=pick([0.27,0.54,0.81,1.2,2]), V=m/mat[1], B=1000*V*XG, W=m*XG; ans=W-B; unit='N';
    stem=`A ${m} kg block of ${mat[0]} (density ${mat[1]} kg/m³) hangs from a string and is completely under water (1000 kg/m³). What is the tension in the string? Use g = 10 m/s².`;
    dis=[{v:W,why:'Left out the buoyant force: the water helps hold the block up.'},{v:W+B,why:'Buoyancy points up, so it reduces the tension.'},{v:B,why:'That is the buoyant force alone.'},{v:W-B*0.5,why:'Halved the buoyant force.'}];
    sol=[['Volume from the density.',X`V=\frac{m}{\rho}=\frac{${m}}{${mat[1]}}=${tn(V)}${U('m³')}`],
         ['Buoyant force.',X`F_B=\rho_wVg=(1000)(${tn(V)})(10)=${tn(B)}${U('N')}`],
         ['At rest: tension and buoyancy up, weight down.',X`T+F_B-mg=0\quad\Rightarrow\quad T=${tn(W)}-${tn(B)}=${tn(ans)}${U('N')}`]];
    how='Dense object hung under water: T = mg − B.';
  }
  const r=mc({h:`${xn(ans)} ${unit}`,v:ans},dis.map(d=>({h:`${xn(d.v)} ${unit}`,v:d.v,why:d.why})));
  return r&&{stem,fig:'',...r,sol,how};
}

/* ---------------------------------------------------------------- Q9 · T07 */
function xYoung(){
  const round=Math.random()<0.55, dimW=round?'diameter':'side';
  const m1=pick([10,20,30]), L1=pick([1,1.5,2]), d1=pick([1,2]), s1=pick([2,3,4,5]);
  const m2=m1*pick([1,2,3,0.5,4]), L2=L1*pick([1,2,1.5,0.5]), d2=d1*pick([1,2,0.5]);
  if(m2===m1&&L2===L1&&d2===d1) return null;
  const mr=m2/m1, lr=L2/L1, ar=(d1/d2)**2, ans=s1*mr*lr*ar;
  const shape=round?`round wire with a ${d1} mm diameter`:`bar with a ${d1} mm × ${d1} mm square cross-section`;
  const shape2=round?`${d2} mm diameter`:`${d2} mm × ${d2} mm cross-section`;
  const stem=`A ${L1} m long platinum ${shape} stretches ${s1} mm when a ${m1} kg mass hangs from it. A second piece of the same `+
    `platinum is ${L2} m long with a ${shape2}, and a ${m2} kg mass hangs from it. How much does it stretch?`;
  const H=x=>`${xn(x)} mm`;
  const r=mc({h:H(ans),v:ans},[{h:H(s1*mr*lr*(d1/d2)),v:s1*mr*lr*(d1/d2),why:`Area goes as the ${dimW} squared; you used the plain ${dimW} ratio.`},
    {h:H(s1*mr*lr/ar),v:s1*mr*lr/ar,why:'Inverted the area ratio: a thicker wire stretches less.'},
    {h:H(s1*lr*ar),v:s1*lr*ar,why:'Left out the change in hanging mass.'},{h:H(s1*mr*ar),v:s1*mr*ar,why:'Left out the change in length.'},
    {h:H(s1*mr/lr*ar),v:s1*mr/lr*ar,why:'Inverted the length ratio: a longer wire stretches more.'}]);
  return r&&{stem,fig:'',...r,
    sol:[['Same material, so Young’s modulus Y = (F/A)/(ΔL/L) is the same. Solve for the stretch: ΔL = FL/(AY) ∝ mL/A.',X`\frac{\Delta L_2}{\Delta L_1}=\frac{m_2}{m_1}\cdot\frac{L_2}{L_1}\cdot\frac{A_1}{A_2}`],
         [`Area ∝ ${dimW}², so A₁/A₂ = (${d1}/${d2})².`,X`\Delta L_2=${s1}\cdot\frac{${m2}}{${m1}}\cdot\frac{${L2}}{${L1}}\cdot\left(\frac{${d1}}{${d2}}\right)^2=${tn(ans)}${U('mm')}`]],
    how:'Same Y: ΔL ∝ m·L/A, and A ∝ (diameter or side)².'};
}

/* ---------------------------------------------------------------- Q10 · T03 */
function xShm(){
  const mm=pick([1,2,3,4,9]), kk=pick([1,2,4,7,8,9]); if(mm===1&&kk===1) return null;
  const givenT=Math.random()<0.5, askT=Math.random()<0.5;
  const g0=givenT?pick([1,2,3,4,6,8,9]):pick([1,2,4,5,6,8]);
  const T0=givenT?g0:1/g0, T1=T0*Math.sqrt(mm/kk), ans=askT?T1:1/T1, u=askT?'s':'Hz';
  const chg=[mm>1?`the mass is made ${mm} times larger`:'',kk>1?`the spring is replaced by one ${kk} times stiffer`:''].filter(Boolean).join(' and ');
  const stem=`A block on a spring oscillates with ${givenT?`period ${g0} s`:`frequency ${g0} Hz`}. If ${chg}, what is the new ${askT?'period':'frequency'}?`;
  const lin=T0*(mm/kk), H=x=>`${xn(x)} ${u}`;
  const r=mc({h:H(ans),v:ans},[{h:H(askT?lin:1/lin),v:askT?lin:1/lin,why:'Missing the square root: T = 2π√(m/k).'},
    {h:H(askT?1/T1:T1),v:askT?1/T1:T1,why:`Gave the ${askT?'frequency':'period'}; f = 1/T.`},
    {h:H(askT?T0*Math.sqrt(kk/mm):1/(T0*Math.sqrt(kk/mm))),v:askT?T0*Math.sqrt(kk/mm):1/(T0*Math.sqrt(kk/mm)),why:'Inverted the ratio: more mass means a longer period, a stiffer spring a shorter one.'},
    {h:H(askT?T0:1/T0),v:askT?T0:1/T0,why:'The period depends on m and k.'}]);
  return r&&{stem,fig:'',...r,
    sol:[['T = 2π√(m/k), so the period scales with √(m/k) and the frequency with √(k/m).',X`\frac{T_2}{T_1}=\sqrt{\frac{m_2/m_1}{k_2/k_1}}=\sqrt{\frac{${mm}}{${kk}}}=${tn(Math.sqrt(mm/kk))}`],
         [givenT?'Start from the given period.':'Convert the given frequency to a period, T = 1/f.',
          X`T_2=(${tn(T0)})(${tn(Math.sqrt(mm/kk))})=${tn(T1)}\ \text{s}`+(askT?'':X`,\qquad f_2=\frac{1}{T_2}=${tn(ans)}${U('Hz')}`)]],
    how:'T = 2π√(m/k); f = 1/T. Mass × n → T × √n; stiffness × n → f × √n.'};
}

/* ---------------------------------------------------------------- Q11 · T16 */
function xFric(){
  const m=pick([60,80,100,120,150,170]), mus=pick([0.4,0.5,0.6]), muk=rd(mus-pick([0.04,0.1,0.2]),2);
  const fs=mus*m*XG, fk=muk*m*XG, P1=Math.round(fs*rf(0.4,0.85,2)/10)*10, P2=Math.round(fs*rf(1.15,1.6,2)/10)*10;
  if(P1<=0||P1>=fs||P2<=fs) return null;
  const n=v=>Math.round(v), O=(a,b,why)=>({h:`${n(a)} N and ${n(b)} N`,v:`${n(a)}/${n(b)}`,why});
  const r=mc({h:`${P1} N and ${n(fk)} N`,v:`${P1}/${n(fk)}`},[
    O(fs,fk,'For the smaller push the crate stays put, so static friction only matches the push; μs·mg is its maximum.'),
    O(fs,fs,'Static friction only reaches μs·mg at the threshold; once sliding, friction is kinetic.'),
    O(fk,fk,'The first push can’t move the crate, so its friction is static, not kinetic.'),
    O(P1,P2,'Friction matches the push only while the crate is at rest.'),
    O(P1,fs,'Once the crate slides, friction is kinetic: μk·mg.')]);
  return r&&{stem:`A ${m} kg crate rests on a level floor with μs = ${mus} and μk = ${muk}. What is the magnitude of the friction force `+
      `on the crate when you push it horizontally with ${P1} N, and when you push it horizontally with ${P2} N? Use g = 10 m/s².`,fig:'',...r,
    sol:[['The most static friction can supply.',X`f_{s,\max}=\mu_s mg=(${mus})(${m})(10)=${tn(fs)}${U('N')}`],
         [`${P1} N is less than that, so the crate stays at rest and static friction just matches the push.`,X`f=${P1}${U('N')}`],
         [`${P2} N exceeds it, so the crate slides and kinetic friction acts.`,X`f=\mu_k mg=(${muk})(${m})(10)=${tn(fk)}${U('N')}`]],
    how:'f_s,max = μs·mg. Push below it → f = push. Push at or above it → f = μk·mg.'};
}

/* ---------------------------------------------------------------- Q12–15 · ramp set (T01 + T24) */
function xRampData(){
  const top=Math.random()<0.5, stretched=Math.random()<0.5, fric=Math.random()<0.45;
  const th=pick([30,37,45,60]), s=XS_(th), c=XC_(th), m=pick([1,2,3,4,5,10]), ks=pick([50,100,150,200,250,300]);
  const L0=pick([0.5,0.8,1.0,1.2,1.4]), dL=pick([0.1,0.2,0.3,0.4]); if(dL>=L0) return null;
  const L=rd(stretched?L0+dL:L0-dL,2), vi=pick([-3,-2,-1,1,2,3,4,5]), mu=fric?pick([0.2,0.3,0.4]):0, dt=pick([0.05,0.1,0.15]);
  const sDir=(top===stretched)?1:-1, Fs=sDir*ks*dL, Fg=-m*XG*s, fN=m*XG*c, f=fric?-Math.sign(vi)*mu*fN:0;
  const F=Fs+Fg+f, xi=top?-L:L, pi=m*vi, pf=pi+F*dt, xf=xi+pf/m*dt;
  if(Math.abs(F)<1||Math.abs(pf)<0.05||Math.abs(F*dt)<0.05) return null;
  return {top,stretched,fric,th,s,c,m,ks,L0,dL,L,vi,mu,dt,sDir,Fs,Fg,fN,f,F,xi,pi,pf,xf};
}
function xRampSetup(d){
  const trig=d.th===37?' (sin 37° = 0.6, cos 37° = 0.8)':'';
  return `A ${d.m} kg block sits on a ramp inclined at θ = ${d.th}°${trig}. One end of a spring (k<sub>s</sub> = ${d.ks} N/m, relaxed length `+
    `L<sub>0</sub> = ${d.L0} m) is fixed to a wall at the <b>${d.top?'top':'bottom'}</b> of the ramp and the other end to the block; right now the spring is `+
    `<b>${d.stretched?'stretched':'compressed'}</b> to length L = ${d.L} m. The +x axis points up the incline, with the origin at the wall `+
    `where the spring is attached, so <b>r</b><sub>i</sub> = ⟨${xn(d.xi)}, 0, 0⟩ m. At t = 0 the block's velocity is `+
    `<b>v</b><sub>i</sub> = ⟨${d.vi}, 0, 0⟩ m/s (moving ${d.vi>0?'up':'down'} the ramp). `+
    (d.fric?`The coefficient of kinetic friction between block and ramp is μ<sub>k</sub> = ${d.mu}. `:'The ramp is slippery (no friction). ')+
    `Use g = 10 m/s² and a time step Δt = ${d.dt} s.`;
}
const XCER={
  C:[['We chose the block as the system.'],['We chose the spring, ramp, and Earth to be the surroundings.'],['There are no relativistic effects.'],
     ['We neglect air resistance.'],['We treat friction between the block and the ramp as negligible.','slip']],
  E:[['Because the problem mentions the ramp is slippery.','slip'],['Because the spring, ramp and Earth all exert forces on the block.'],
     ['The block’s speed (§v m/s) is much smaller than the speed of light.'],['The problem gives the spring’s relaxed length and its §L length.'],
     ['Because the problem gives μk = §mu between the block and the ramp.','fric']],
  R:[['Therefore, they produce the effect that causes the change in motion that the block experiences.'],['Therefore, the friction force can be left out of the net force.','slip'],
     ['So p ≈ mv is valid for the block.'],['Thus the net force is the vector sum of the forces on the block, which changes the block’s momentum.'],
     ['Therefore, friction points opposite the block’s velocity and must be included in the net force.','fric']]};
const XCER_NAME={C:'CLAIM',E:'EVIDENCE',R:'REASONING'};
const XCER_WHY={C:'a choice or assumption the solver makes',E:'information given in the problem or a known fact',R:'a consequence that links the evidence to the claim (“Therefore…”, “So…”)'};
function xCer(d){
  const ctx=s=>!s[1]||(s[1]==='slip'&&!d.fric)||(s[1]==='fric'&&d.fric);
  const fill=t=>t.replace('§v',Math.abs(d.vi)).replace('§L',d.stretched?'stretched':'compressed').replace('§mu',d.mu);
  const want=pick(['C','C','R','R','E']), pair=Math.random()<0.4; XV=want;
  const draw=(k,n,avoid)=>shuf(XCER[k].filter(ctx).filter(s=>avoid.indexOf(s[0])<0)).slice(0,n).map(s=>({k,t:fill(s[0])}));
  let st;
  if(pair){ const other=pick(['C','E','R'].filter(k=>k!==want)); st=draw(want,2,[]).concat(draw(other,1,[])); }
  else st=['C','E','R'].map(k=>draw(k,1,[])[0]);
  st=shuf(st);
  const keySet=st.map((s,i)=>s.k===want?i+1:0).filter(Boolean), keyH=keySet.length===1?`Statement ${keySet[0]}`:`Both ${keySet[0]} and ${keySet[1]}`;
  const ALL=['Statement 1','Statement 2','Statement 3','Both 1 and 2','Both 2 and 3','Both 1 and 3'];
  const sets={'Statement 1':[1],'Statement 2':[2],'Statement 3':[3],'Both 1 and 2':[1,2],'Both 2 and 3':[2,3],'Both 1 and 3':[1,3]};
  const whyOf=h=>{ const ids=sets[h], wrong=ids.filter(i=>st[i-1].k!==want), miss=keySet.filter(i=>ids.indexOf(i)<0);
    const parts=wrong.map(i=>`Statement ${i} is ${XCER_NAME[st[i-1].k]} (${XCER_WHY[st[i-1].k]}).`);
    if(miss.length) parts.push(`Statement ${miss.join(' and ')} is also ${XCER_NAME[want]}.`);
    return parts.join(' '); };
  const others=shuf(ALL.filter(h=>h!==keyH)).slice(0,4);
  const opts=shuf([keyH].concat(others)).map(h=>({h,v:h,why:h===keyH?null:whyOf(h),ok:h===keyH}));
  const noun={C:'CLAIMS',E:'EVIDENCE',R:'REASONING'}[want];
  const stem=`While solving this problem, a student writes these statements:<ol class="cer">`+st.map(s=>`<li>“${s.t}”</li>`).join('')+
    `</ol>Which statement(s) are <b>${noun}</b>?`;
  return {stem,fig:'',opts,key:opts.findIndex(o=>o.ok),
    sol:st.map((s,i)=>[`Statement ${i+1} is <b>${XCER_NAME[s.k]}</b>: ${XCER_WHY[s.k]}.`,'']).concat([[`So the ${XCER_NAME[want]} statement${keySet.length>1?'s are':' is'} ${keySet.join(' and ')}.`,'']]),
    how:'CLAIM = a decision made while setting up (system, surroundings, assumptions). EVIDENCE = given or known facts. REASONING = explains why, linking evidence to claim.'};
}
function xRampQs(d){
  const V=(x,u,why)=>({h:xvec(x,0,u),v:x,why});
  const sp=d.sDir>0?'+x':'−x', gs=X`-mg\sin\theta`;
  const fTex=d.fric?X`+${tp(d.f)}`:'';
  const Fsol=[[`Spring force: it is ${d.stretched?'stretched':'compressed'} at the ${d.top?'top':'bottom'}, so it pushes or pulls the block toward its relaxed length, along ${sp}.`,
               X`|F_s|=k_s|L-L_0|=(${d.ks})(${tn(d.dL)})=${tn(Math.abs(d.Fs))}\ \text{N}\quad\Rightarrow\quad F_{s,x}=${tn(d.Fs)}${U('N')}`],
              ['Gravity along the incline points down the ramp; the normal force cancels mg cos θ.',X`F_{g,x}=-mg\sin\theta=-(${d.m})(10)\sin ${d.th}^\circ=${tn(d.Fg)}${U('N')}`]];
  if(d.fric) Fsol.push([`Kinetic friction opposes the velocity, so it points ${d.f>0?'+x (the block moves down)':'−x (the block moves up)'}.`,
    X`|f|=\mu_k mg\cos\theta=(${d.mu})(${d.m})(10)\cos ${d.th}^\circ=${tn(Math.abs(d.f))}\ \text{N},\qquad f_x=${tn(d.f)}${U('N')}`]);
  Fsol.push(['Add the x components.',X`F_{\text{net},x}=${tn(d.Fs)}+${tp(d.Fg)}${fTex}=${tn(d.F)}${U('N')}`]);
  const mgc=-d.m*XG*d.c, fs_=d.fric?-Math.sign(d.vi)*d.mu*d.m*XG*d.s:0;
  const q13=mc(V(d.F,'N'),[V(d.Fg+d.f,'N','Left out the spring force.'),V(d.Fs+d.f,'N','Left out gravity’s component along the ramp.'),
    V(-d.Fs+d.Fg+d.f,'N','Pointed the spring force the wrong way. A compressed spring pushes away from its wall; a stretched one pulls toward it.'),
    V(d.Fs+mgc+fs_,'N','Swapped sin θ and cos θ: gravity’s component along the ramp is mg sin θ.'),
    d.fric?V(d.Fs+d.Fg-d.f,'N','Pointed friction along the motion instead of against it.'):null,
    d.fric?V(d.Fs+d.Fg,'N','Left out friction.'):V(d.Fs-d.Fg,'N','Pointed gravity’s component up the ramp.')].filter(Boolean));
  const dp=d.F*d.dt;
  const q14=mc(V(d.pf,'kg·m/s'),[V(dp,'kg·m/s','That is Δp = F·Δt, not the final momentum.'),V(d.pi,'kg·m/s','That is the initial momentum: add F·Δt.'),
    V(d.pi-dp,'kg·m/s','Sign error: p_f = p_i + F_net·Δt.'),V(d.pi+(d.Fg+d.f)*d.dt,'kg·m/s','Carried a net force that left out the spring.'),
    V(d.pf/d.m,'kg·m/s','That is the velocity, not the momentum.')]);
  const q15=mc(V(d.xf,'m'),[V(d.pf/d.m*d.dt,'m','That is Δx, not the new position: add r_i.'),V(d.xi,'m','That is the initial position.'),
    V(d.xi+dp/d.m*d.dt,'m','Used Δp instead of the updated p_f.'),V(d.xi+d.pi/d.m*d.dt,'m','Used the old momentum; the course updates p first, then r.'),
    V(-d.xi+d.pf/d.m*d.dt,'m','Put the origin at the wrong end of the spring.')]);
  if(!q13||!q14||!q15) return null;
  const psol=[['Momentum principle over one time step.',X`p_{f,x}=p_{i,x}+F_{\text{net},x}\Delta t=(${d.m})(${d.vi})+${tp(d.F)}(${d.dt})=${tn(d.pf)}${U('kg·m/s')}`]];
  const xsol=psol.concat([['Update the position with the NEW momentum.',X`x_f=x_i+\frac{p_{f,x}}{m}\Delta t=${tn(d.xi)}+\frac{${tn(d.pf)}}{${d.m}}(${d.dt})=${tn(d.xf)}${U('m')}`]]);
  const ask=['What is the net force acting on the block?',`What is the momentum of the block after the time interval of ${d.dt} s?`,
             `What is the position of the block after the time interval of ${d.dt} s?`];
  const howF='F_net,x = spring (toward relaxed length) − mg sin θ ± μk·mg cos θ (against v).';
  return [{stem:ask[0],...q13,sol:Fsol,how:howF},{stem:ask[1],...q14,sol:psol,how:'p_f = p_i + F_net·Δt, with p_i = m·v_i.'},
          {stem:ask[2],...q15,sol:xsol,how:'r_f = r_i + (p_f/m)·Δt, using the UPDATED momentum.'}];
}

/* ---------------------------------------------------------------- build one exam */
const xroll=fn=>{ for(let i=0;i<80;i++){ try{ const r=fn(); if(r) return r; }catch(e){ if(i>70) throw e; } } throw new Error('could not build '+fn.name); };
/* every slot built on its own tags its item with the variant: chk.k = 'x<slot>-<kind>' ('x<slot>-all' if one kind) */
const tagged=(fn,c)=>()=>{ XV=null; const r=fn(); return r&&{...r,chk:{k:'x'+(c+1)+'-'+(XV||'all')}}; };
const XSINGLE=[xAvg,xDp,xCrush,xStatics,xBoxes,xElec,xCirc,xBuoy,xYoung,xShm,xFric].map(tagged);
/* the ramp set (Q12 claim/evidence/reasoning + Q13–15) shares one setup and figure */
function xRampSet(){
  for(let i=0;i<120;i++){
    const d=xRampData(); const qs=d&&xRampQs(d); if(!qs) continue;
    XV=null; const cer=xCer(d), k=XV;
    const parts=[{...cer,chk:{k:'x12-'+k}}].concat(qs.map((q,j)=>({...q,chk:{k:'x'+(13+j)+'-all'}})));
    return {d,setup:xRampSetup(d),fig:FIG.xRamp(d),parts};
  }
  throw new Error('could not build the ramp set');
}
function buildExam(){
  const singles=XSINGLE.map(xroll), R=xRampSet(), g={setup:R.setup,fig:R.fig,from:XGROUP_FROM,to:XSLOTS.length-1};
  return singles.concat(R.parts.map(it=>({...it,group:g,fig:''}))).map((it,i)=>({fig:'',...it,n:i+1,slot:XSLOTS[i]}));
}

/* ---- drill: one question set for slot c (src/72_drill.js) ---- */
function genOne(c){
  if(XSINGLE[c]) return {parts:[{c,it:{fig:'',...xroll(XSINGLE[c])}}]};
  const R=xRampSet();
  return {setup:R.setup,fig:R.fig,parts:[{c,it:{fig:'',...R.parts[c-XGROUP_FROM]}}]};
}
