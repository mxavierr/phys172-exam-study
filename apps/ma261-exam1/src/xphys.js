
/* =====================================================================
   PHYSICS THAT SHOWS UP ON MA 261 EXAM 1 (pattern sheet: MOT "projectile
   max height: vy = 0" S2022-Q6, F2019-Q6; VF "intersection vs collision"
   F2015-Q2, S2017-Q3). Builders serve both the sprint (add) and the mock
   exam (addX). Coverage also follows Briggs 14.3 #41–73 and 13.5 #38.
   ===================================================================== */
const GUNIT=[{g:[49,5],gs:'9.8',u:'m',step:[49,10]},{g:[32,1],gs:'32',u:'ft',step:[16,1]}];
const RD=r=>decS(r[0],r[1]);                                   /* exact rational → terminating decimal or fraction */
const Rdiv=(a,b)=>Rr(a[0]*b[1],a[1]*b[0]);

/* thrown straight up — F2019-Q6 */
function projVert(){
  const U=pick(GUNIT), k=ri(1,4), v=Rmul(U.step,[2*k,1]), h=coin(0.35)?pick(U.u==='m'?[2,5,10,20]:[6,10,16,48]):0;
  const ask=pick(['H','H','top','land']);
  const g=U.g, H=Rdiv(Rmul(v,v),Rmul([2,1],g)), top=Rdiv(v,g);
  let key,dis,how,sol,stemAsk;
  const vS=RD(v);
  if(ask==='H'){ key=Radd(H,[h,1]); stemAsk=`How high above the ground does it rise?`;
    dis=[{a:RD(Radd(Rmul(H,[2,1]),[h,1])),why:'Max height is v₀²/(2g): the ½ from −½gt² is missing.'},{a:RD(top),why:'That is the time to reach the top (in s), not the height.'},
      h?{a:RD(H),why:`That is the rise above the release point; add the ${h} ${U.u} it started at.`}:{a:RD(Rdiv(H,[2,1])),why:'Evaluate y at t = v₀/g: v₀·(v₀/g) − ½g(v₀/g)² = v₀²/(2g).'},
      {a:RD(Radd(Rmul(H,[3,1]),[h,1])),why:'Sign slip: y = v₀t − ½gt², not v₀t + ½gt².'},{a:RD(Radd(Rdiv(Rmul(v,v),Rmul([4,1],g)),[h,1])),why:'Arithmetic slip with the ½.'}];
    how='At the top the vertical velocity is 0: t = v₀/g; then y = h + v₀t − ½gt² = h + v₀²/(2g).';
    sol=[['Top: vertical velocity 0.',X`v_0-gt=0\ \Rightarrow\ t=\frac{${vS}}{${U.gs}}=${RD(top)}`],['Height there.',X`y=${h?h+'+':''}${vS}(${RD(top)})-\tfrac12(${U.gs})(${RD(top)})^2=${RD(key)}`]]; }
  else if(ask==='top'){ key=top; stemAsk='How many seconds does it take to reach its highest point?';
    dis=[{a:RD(Rmul(top,[2,1])),why:'That is the time to come back down to the launch height.'},{a:RD(H),why:'That is the maximum height (above the release point), not a time.'},{a:RD(Rdiv(g,v)),why:'Upside down: v₀ − gt = 0 gives t = v₀/g.'},{a:RD(Rdiv(top,[2,1])),why:'At the top v = 0: t = v₀/g, no factor ½.'}];
    how='Vertical velocity v₀ − gt is 0 at the top.'; sol=[['',X`v_0-gt=0\ \Rightarrow\ t=\frac{${vS}}{${U.gs}}=${RD(top)}`]]; }
  else { if(h) return null; key=Rmul(top,[2,1]); stemAsk='How many seconds until it lands back on the ground?';
    dis=[{a:RD(top),why:'That is only the way up; the way down takes as long.'},{a:RD(Rmul(top,[4,1])),why:'y = v₀t − ½gt² = 0 gives t = 2v₀/g.'},{a:RD(Rmul(H,[2,1])),why:'That is a height-like quantity, not a time.'},{a:RD(Rdiv(g,v)),why:'Solve v₀t − ½gt² = 0 for t.'}];
    how='y(t) = v₀t − ½gt² = 0 at t = 2v₀/g.'; sol=[['',X`t\left(${vS}-\tfrac12(${U.gs})t\right)=0\ \Rightarrow\ t=${RD(key)}`]]; }
  const q=`A ball is thrown straight up from ${h?`a point ${h} ${U.u} above the ground`:'the ground'} with initial speed ${vS} ${U.u}/s. Using ${m`g=${U.gs}\ \text{${U.u}/s}^2`} and no air resistance: ${stemAsk}`;
  return {q,kind:'expr',ans:RD(key),dis,lv:1,how,sol,chk:{op:'projv',n:{v:vS,g:U.gs,h,ask}}};
}

/* launched with a velocity vector from a platform — Briggs 14.3 #41–46, #58–61 */
function projVec(){
  const U=pick(GUNIT), T=ri(2,5), j=ri(1,T), a=pick(U.u==='m'?[10,15,20,25,40]:[20,30,40,50,60]);
  const b=Rmul(U.step,[j,1]), g=U.g;                                    /* b = (g/2)·j so that landing is at t = T */
  const h=Rmul(Rmul(U.step,[T,1]),[T-j,1]);                             /* h = (g/2)T² − bT = (g/2)T(T − j) */
  const ask=pick(['H','T','R','R']);
  const top=Rdiv(b,g), H=Radd(h,Rdiv(Rmul(b,b),Rmul([2,1],g))), Tg=Rmul(top,[2,1]);
  const bS=RD(b), hS=RD(h); let key,dis,how,sol,stemAsk;
  if(ask==='H'){ key=H; stemAsk='What is its maximum height above the ground?';
    dis=[{a:RD(Rdiv(Rmul(b,b),Rmul([2,1],g))),why:`That is the rise above the platform; add its height ${hS}.`},{a:RD(Radd(h,Rdiv(Rmul(b,b),g))),why:'Max rise is b²/(2g): the ½ is missing.'},{a:RD(Radd(h,Rdiv(Rmul([a,1],b),g))),why:'Only the vertical velocity matters for the height.'},{a:RD(Radd(h,top)),why:'That adds a time to a height.'}];
    how='Vertical velocity b − gt = 0 at the top, t = b/g; height = h + b²/(2g). The horizontal velocity plays no part.';
    sol=[['Top.',X`t=\frac{${bS}}{${U.gs}}=${RD(top)}`],['Height.',X`y=${hS}+${bS}(${RD(top)})-\tfrac12(${U.gs})(${RD(top)})^2=${RD(H)}`]]; }
  else if(ask==='T'){ key=[T,1]; stemAsk='How long is it in the air?';
    dis=[{a:RD(Tg),why:`2b/g is the time back to launch height; it still has ${hS} ${U.u} to fall.`},{a:RD(top),why:'That is the time to the top.'},{a:RD(Radd([T,1],[-1,1])),why:'Check y(t) = 0: the positive root of h + bt − ½gt² = 0.'},{a:RD(Radd([T,1],[1,1])),why:'Arithmetic slip solving the quadratic.'}];
    how='Solve y(t) = h + bt − ½gt² = 0 and keep the positive root.';
    sol=[['',X`${hS}+${bS}t-\tfrac12(${U.gs})t^2=0`],['Positive root.',X`t=${T}`]]; }
  else { key=[a*T,1]; stemAsk='How far from the base of the platform does it land (horizontal distance)?';
    dis=[{a:RD(Rmul([a,1],Tg)),why:`Using 2b/g ignores the ${hS} ${U.u} drop below launch height.`},{a:RD(Rmul(b,[T,1])),why:'Horizontal distance uses the horizontal velocity '+a+'.'},{a:RD(Rmul([a,1],top)),why:'That is where it is at the top, not where it lands.'},{a:String(a*(T+1)),why:'Arithmetic slip in the landing time.'}];
    how='Find the landing time from y(t) = 0, then x = (horizontal speed) × time.';
    sol=[['Landing time.',X`${hS}+${bS}t-\tfrac12(${U.gs})t^2=0\ \Rightarrow\ t=${T}`],['Horizontal distance.',X`x=${a}\cdot${T}=${a*T}`]]; }
  const q=`A projectile is launched from a platform ${hS} ${U.u} above level ground with initial velocity ${m`\langle ${a},\ ${bS}\rangle`} ${U.u}/s (horizontal, vertical). Using ${m`g=${U.gs}\ \text{${U.u}/s}^2`} and no forces other than gravity: ${stemAsk}`;
  return {q,kind:'expr',ans:RD(key),dis,lv:2,how,sol,chk:{op:'projvec',n:{a,b:bS,g:U.gs,h:hS,ask}}};
}

/* symbolic g and h — S2022-Q6 */
function projSym(){
  const a=pick([5,10,20,30]), b=pick([10,20,30]), ask=pick(['top','top','land','H']);
  const D=`${b*b} + 2*g*h`, R=`sqrt(${D})`;
  let key,kind='expr',dis,how,sol,stemAsk;
  if(ask==='top'){ kind='point'; key=`(${a*b}/g, (${D})/(2*g))`; stemAsk='Where is the ball when it reaches its maximum height?';
    dis=[{a:`(${a*b}/g, (${b*b} + g*h)/g)`,why:'Max rise is b²/(2g), not b²/g.'},{a:`(${a*b}/g, ${b}/g)`,why:'b/g is the TIME to the top, not its height.'},{a:`(${2*a*b}/g, (${D})/(2*g))`,why:'x at the top uses t = b/g, not 2b/g.'},
      {a:`(${a}*(${b} + ${R})/g, (${D})/(2*g))`,why:'That x uses the landing time; at the top t = b/g.'},{a:`(${a*b}/g, ${b*b}/(2*g))`,why:'The launch height h is missing.'}];
    how='At the top the vertical velocity is 0: t = b/g. Then x = a·t, y = h + bt − ½gt².';
    sol=[['Top.',X`${b}-gt=0\ \Rightarrow\ t=\frac{${b}}{g}`],['Position.',X`x=\frac{${a*b}}{g},\qquad y=h+\frac{${b*b}}{g}-\frac{${b*b}}{2g}=\frac{${b*b}+2gh}{2g}`]]; }
  else if(ask==='H'){ key=`h + ${b*b}/(2*g)`; stemAsk='What is its maximum height?';
    dis=[{a:`h + ${b*b}/g`,why:'The ½ from −½gt² is missing.'},{a:`${b*b}/(2*g)`,why:'Add the launch height h.'},{a:`h + ${b}/g`,why:'b/g is a time.'},{a:`h + ${a*a+b*b}/(2*g)`,why:'Only the vertical velocity controls the height.'}];
    how='t = b/g at the top; y = h + b²/(2g).'; sol=[['',X`y\left(\tfrac{${b}}{g}\right)=h+\frac{${b*b}}{2g}`]]; }
  else { key=`(${b} + ${R})/g`; stemAsk='At what time does it hit the ground?';
    dis=[{a:`${2*b}/g`,why:'2b/g is when it returns to launch height; it started h above the ground.'},{a:`${b}/g`,why:'That is the time to the top.'},{a:`(${b} + sqrt(${b*b} + g*h))/g`,why:'The discriminant of −½gt² + bt + h is b² + 2gh.'},{a:`(${b} + ${R})/(2*g)`,why:'Quadratic formula: divide by 2·(g/2) = g.'}];
    how='Solve h + bt − ½gt² = 0 with the quadratic formula; keep the positive root.'; sol=[['',X`-\tfrac12gt^2+${b}t+h=0\ \Rightarrow\ t=\frac{${b}+\sqrt{${b*b}+2gh}}{g}`]]; }
  const q=`A ball is launched from ${m`(0,h)`}, ${m`h>0`}, with initial velocity ${m`\langle ${a},\ ${b}\rangle`}. Gravity ${m`g>0`} acts in the negative y-direction and nothing else acts on the ball. ${stemAsk}`;
  return {q,kind,vars:['g','h'],ans:key,dis,lv:3,how,sol,chk:{op:'projsym',n:{a,b,ask}}};
}

/* intersection vs collision — F2015-Q2 (curve & line), Briggs 13.5 #38 (two lines) */
const COLL_L={'2,0':'2 intersection points and no points of collision','1,1':'1 intersection point, which is a point of collision','2,1':'2 intersection points, one of which is a point of collision','1,0':'1 intersection point and no points of collision','2,2':'2 intersection points, both of which are points of collision'};
function collCurve(wantPoint){
  const r1=V('t','t^2','t^3'), C=t=>[t,t*t,t*t*t];
  for(let tries=0;tries<60;tries++){
    const two=wantPoint||coin(0.65);
    let comp,nI,nC,colPt=null,other=null,times=null;
    if(two){ const a=ri(-2,2), b=ri(-2,2); if(a===b) continue; const s1=ri(-2,3), s2=ri(-2,3); if(s1===s2) continue;
      const P=C(a), Q=C(b), k=Q.map((q,i)=>(q-P[i])/(s2-s1)); if(k.some(x=>!Number.isInteger(x))) continue;
      comp=P.map((p,i)=>sumS([String(p-k[i]*s1),mono(k[i],{t:1})])); nI=2; nC=(s1===a?1:0)+(s2===b?1:0);
      if(wantPoint){ if(nC!==1) continue; colPt=s1===a?P:Q; other=s1===a?Q:P; times={a,b,s1,s2}; } }
    else { const a=ri(-2,2), s1=ri(-2,3), d=[0,ri(-3,3),ri(-3,3)]; if(!d[1]&&!d[2]) continue; const P=C(a);
      comp=P.map((p,i)=>sumS([String(p-d[i]*s1),mono(d[i],{t:1})])); nI=1; nC=s1===a?1:0; }
    const r2=V(...comp);
    return {r1,r2,nI,nC,colPt,other,times};
  }
  return null;
}
function collideQ(){
  if(coin(0.7)){ const K=collCurve(false); if(!K) return null;
    const key=COLL_L[K.nI+','+K.nC];
    const W={'2,0':'Two crossings, but at each one the particles arrive at different times.','1,1':'One crossing, reached at the same time by both.','2,1':'Two crossings; only one is reached by both at the same time.','1,0':'One crossing, reached at different times.','2,2':'Two crossings, each reached at the same time by both.'};
    const opts=Object.keys(COLL_L).map(k=>({h:COLL_L[k],ok:COLL_L[k]===key,why:`Actually: ${W[K.nI+','+K.nC]} Intersections solve r₁(t) = r₂(s); collisions need r₁(t) = r₂(t) at the same t.`}));
    return {q:`Two particles move along ${m`\mathbf r_1(t)=${tex(K.r1)}`} and ${m`\mathbf r_2(t)=${tex(K.r2)}`}, where ${m`t`} is time. Which statement is true?`,kind:'choice',opts,ans:key,lv:3,
      how:'Paths intersect where r₁(t) = r₂(s) for some t and s; the particles collide only where that happens with s = t.',
      sol:[['Intersections: solve r₁(t) = r₂(s) (match the x-components first).',''],[`${key}.`,'']],chk:{op:'collide',e:{r1:K.r1,r2:K.r2}}};
  }
  /* two straight-line paths */
  for(let i=0;i<40;i++){
    const Xp=rv(3,-4,6), d1=rv(3,-3,3), d2=rv(3,-3,3); if(!n2(crossA(d1,d2))) continue;
    const t0=ri(1,3), s0=pick([t0,t0,ri(1,4)]), skew=coin(0.25);
    const p1=subA(Xp,mulA(t0,d1)); let p2=subA(Xp,mulA(s0,d2)); if(skew){ const n=reduceInt(crossA(d1,d2)); p2=addA(p2,n); }
    const L1=lineKey(p1,d1), L2=lineKey(p2,d2), Y=addA(p1,mulA(s0,d1));
    const key=skew?'The paths never meet (the lines are skew)':t0===s0?`The particles collide at \\(${ptx(Xp)}\\)`:`The paths cross at \\(${ptx(Xp)}\\), but the particles get there at different times`;
    const pool=[`The particles collide at \\(${ptx(Xp)}\\)`,`The paths cross at \\(${ptx(Xp)}\\), but the particles get there at different times`,'The paths never meet (the lines are skew)','The paths are parallel, so they never meet',`The particles collide at \\(${ptx(t0===s0||skew?addA(Xp,d1):Y)}\\)`];
    const opts=[...new Set(pool)].map(h=>({h,ok:h===key,why:'Solve r(t) = R(s): if there is a solution the paths cross; the particles collide only if it has t = s. Directions that are not multiples rule out parallel.'}));
    if(opts.filter(o=>o.ok).length!==1||opts.length<5) continue;
    return {q:`Particles move along ${m`\mathbf r(t)=${tex(L1)}`} and ${m`\mathbf R(t)=${tex(L2)}`} for ${m`t\ge0`} (t is time). Which is true?`,kind:'choice',opts,ans:key,lv:2,
      how:'Solve r(t) = R(s). A solution means the paths cross; a solution with t = s means a collision.',
      sol:[['Solve r(t) = R(s) component by component.',''],[key.replace(/\\\(|\\\)/g,'')+'.','']],chk:{op:'collide',e:{r1:L1,r2:L2},n:{lines:1,t0:skew?null:t0}}};
  }
  return null;
}
function collidePoint(){
  const K=collCurve(true); if(!K) return null;
  const {a,b,s1,s2}=K.times, C=t=>[t,t*t,t*t*t];
  const colT=s1===a?a:b, nonT=s1===a?b:a, nonS=s1===a?s2:s1;
  const key=P3(...K.colPt);
  const dis=[{a:P3(...K.other),why:'The paths cross there too, but particle 1 gets there at t = '+nonT+' and particle 2 at t = '+nonS+'.'},{a:P3(...C(nonS)),why:'That is where particle 1 is when particle 2 reaches the other crossing.'},
    {a:P3(...K.colPt.map(x=>-x)),why:'Sign slip.'},{a:P3(...C(colT+1)),why:'Solve r₁(t) = r₂(t) for t first.'},{a:P3(colT,colT,colT),why:'That is not on the first path unless t = 0 or 1.'}];
  return {q:`Two particles move along ${m`\mathbf r_1(t)=${tex(K.r1)}`} and ${m`\mathbf r_2(t)=${tex(K.r2)}`}, where ${m`t`} is time. Their paths cross twice. At what point do the particles collide?`,kind:'point',ans:key,dis,lv:3,
    how:'A collision needs the same point at the SAME time: solve r₁(t) = r₂(t).',sol:[['Set r₁(t) = r₂(t).',X`t=${colT}`],['Point.',tex(key)]],chk:{op:'collpt',e:{r1:K.r1,r2:K.r2}}};
}

/* ---- sprint ---- */
add('proj','Motion','14.3',()=>pick([projVert,projVec,projVec,projSym])());
add('collide','Vector functions','14.1',()=>coin(0.75)?collideQ():collidePoint());

/* ---- mock exam ---- */
const xFrom=o=>{ if(!o) return null;
  if(o.kind==='choice'){ const k=o.opts.find(x=>x.ok); return xq(o.q,xm({h:k.h},o.opts.filter(x=>!x.ok).map(x=>({h:x.h,why:x.why}))),{kind:'choice',lv:o.lv,how:o.how,sol:o.sol,chk:o.chk}); }
  return xq(o.q,xm({a:o.ans},o.dis,{kind:o.kind,vars:o.vars||[]}),{kind:o.kind,vars:o.vars,lv:o.lv,how:o.how,sol:o.sol,chk:o.chk}); };
addX('x-mot-proj','MOT',2,['S2022-Q6','F2019-Q6'],()=>xFrom(pick([projSym,projSym,projVert,projVec])()));
addX('x-vf-collide','VF',1,['F2015-Q2','S2017-Q3'],()=>xFrom(coin(0.7)?collideQ():collidePoint()));
