
/* =====================================================================
   QUADRIC SURFACES TRAINER (memorization). The Quadric surfaces sprint
   topic is driven by a spaced-repetition scheduler over 80 facts:
   9 surfaces × 9 kinds of question (how it looks, the recognition rule,
   graph → name, equation → name, traces, name → graph, name → equation,
   axis / opening direction, messy equation → name). New surfaces are
   introduced one at a time with their card shown; a miss stops the clock,
   shows the card (and the card of the surface you picked) and brings the
   fact back a few questions later; right answers push it to longer and
   longer intervals (5 min, 30 min, 4 h, 1 day, 3 days). Box ≥ 3 counts
   as memorized. State: store.qmem (synced with the account).
   ===================================================================== */
const QM_T=['ell','one','two','cone','ep','hp','cyl','hcyl','pcyl'];
const QM_F=['look','rule','g2n','e2n','trace','n2g','n2e','axis','mess'];
const QM_FN={look:'What it looks like',rule:'How to spot it',g2n:'Graph → name',e2n:'Equation → name',trace:'Traces',n2g:'Name → graph',n2e:'Name → equation',axis:'Axis / direction',mess:'Messy equation'};
const QM_TIER={look:1,rule:1,g2n:1,e2n:1,trace:2,n2g:2,n2e:2,axis:3,mess:3};
const QM_IV=[0,5*60e3,30*60e3,4*3600e3,864e5,3*864e5];
const QM_KEYS=[]; QM_T.forEach(t=>QM_F.forEach(f=>{ if(!(f==='axis'&&t==='ell')) QM_KEYS.push(t+'.'+f); }));
/* what to know about each surface (standard forms with the z-axis as the special axis) */
const QM_I={
  ell:{std:X`\frac{x^2}{a^2}+\frac{y^2}{b^2}+\frac{z^2}{c^2}=1`,
    look:'a closed, bounded egg: the only quadric that fits inside a box',
    trZ:'ellipses (smaller toward z = ±c, a point at z = ±c)',trXY:'ellipses',
    axis:'no special axis: a, b, c are the intercepts ±a, ±b, ±c (a sphere when a = b = c)',
    feat:'bounded · one piece · no straight lines',hook:'All plus, equals 1: an egg. Nothing negative, nothing escapes to infinity.'},
  one:{std:X`\frac{x^2}{a^2}+\frac{y^2}{b^2}-\frac{z^2}{c^2}=1`,
    look:'one connected piece with a narrow waist, like a cooling tower or an hourglass that never pinches shut',
    trZ:'ellipses at every height, smallest (the waist) at z = 0, never empty',trXY:'hyperbolas',
    axis:'the axis is the variable with the MINUS sign',
    feat:'unbounded · one piece · contains straight lines (two families)',hook:'ONE minus sign → ONE sheet. The minus variable is the axis it wraps around.'},
  two:{std:X`-\frac{x^2}{a^2}-\frac{y^2}{b^2}+\frac{z^2}{c^2}=1`,
    look:'two separate bowls facing away from each other, with a gap between them',
    trZ:'nothing for |z| < c, a point at z = ±c, ellipses for |z| > c',trXY:'hyperbolas',
    axis:'the axis is the variable with the PLUS sign (once the constant is +1)',
    feat:'unbounded · two pieces · no straight lines',hook:'TWO minus signs → TWO sheets. The lone plus variable is the axis; the gap is |z| < c.'},
  cone:{std:X`\frac{x^2}{a^2}+\frac{y^2}{b^2}=\frac{z^2}{c^2}`,
    look:'two cones meeting tip to tip at the origin (the vertex)',
    trZ:'ellipses, shrinking to a single point at z = 0',trXY:'hyperbolas (two crossing lines when x = 0 or y = 0)',
    axis:'the axis is the variable alone on its side (the odd sign when everything is on one side = 0)',
    feat:'unbounded · two nappes joined at one point · straight lines through the vertex',hook:'Squares but NO constant (= 0): a cone. It sits between the one- and two-sheet hyperboloids.'},
  ep:{std:X`\frac{z}{c}=\frac{x^2}{a^2}+\frac{y^2}{b^2}`,
    look:'a single bowl with a lowest point (the vertex), opening along one axis',
    trZ:'ellipses on the open side, a point at the vertex, nothing on the other side',trXY:'parabolas, all opening the same way',
    axis:'opens along the first-power variable: toward + when that variable and the squares have the same sign',
    feat:'unbounded · one piece · no straight lines',hook:'One variable NOT squared + squares with the SAME sign: a bowl.'},
  hp:{std:X`\frac{z}{c}=\frac{x^2}{a^2}-\frac{y^2}{b^2}`,
    look:'a saddle (a Pringle chip): it rises along one direction and falls along the other',
    trZ:'hyperbolas (two crossing lines at z = 0)',trXY:'parabolas, one family opening up, the other down',
    axis:'the first-power variable is the up/down direction of the saddle',
    feat:'unbounded · one piece · contains straight lines',hook:'One variable NOT squared + squares with OPPOSITE signs: a saddle.'},
  cyl:{std:X`\frac{x^2}{a^2}+\frac{y^2}{b^2}=1`,
    look:'an endless tube with the same ellipse at every height',
    trZ:'the same ellipse at every height',trXY:'pairs of straight lines (parallel to the z-axis)',
    axis:'runs parallel to the axis of the MISSING variable',
    feat:'unbounded · one piece · straight lines along the missing variable',hook:'A variable is MISSING: a cylinder along that axis. Same-sign squares: elliptic.'},
  hcyl:{std:X`\frac{x^2}{a^2}-\frac{y^2}{b^2}=1`,
    look:'two curved walls: a hyperbola copied along a straight line',
    trZ:'the same hyperbola at every height',trXY:'straight lines (parallel to the z-axis)',
    axis:'runs parallel to the axis of the MISSING variable',
    feat:'unbounded · two pieces · straight lines along the missing variable',hook:'A variable is MISSING and the two squares have OPPOSITE signs: hyperbolic cylinder.'},
  pcyl:{std:X`z=a\,x^2`,
    look:'a trough: one parabola copied along a straight line',
    trZ:'pairs of lines (z = k > 0)',trXY:'x = k: one line; y = k: the same parabola every time',
    axis:'runs parallel to the axis of the MISSING variable; the parabola opens along the first-power variable',
    feat:'unbounded · one piece · straight lines along the missing variable',hook:'Only two variables, one squared and one NOT: a parabola swept into a trough.'}
};
const QM_NEAR={ell:['cyl','one','two','cone'],one:['two','cone','hcyl','ell'],two:['one','cone','ep','hcyl'],cone:['one','two','ep','cyl'],
  ep:['hp','pcyl','cone','two'],hp:['ep','hcyl','one','pcyl'],cyl:['ell','hcyl','pcyl','one'],hcyl:['cyl','hp','one','two'],pcyl:['ep','cyl','hp','hcyl']};
const QM_LOOKS={ell:'closed and bounded',one:'one piece with a waist',two:'two separate pieces',cone:'two cones joined at a point',ep:'a bowl',hp:'a saddle',cyl:'a straight tube',hcyl:'two curved walls',pcyl:'a trough'};
const an=s=>/^[AEIOU]/.test(s)?'an':'a';
const qmName=t=>QG_NAMES[t];

/* ---- random specs and equations ---- */
function qmSpec(t,view){
  if(t==='hcyl'){ const s={t,ax:ri(0,2),v:view===undefined?ri(0,QG_VIEWS.length-1):view,a:ri(1,3),b:ri(1,3),c:1}; return s; }
  return qgRand(t,view);
}
const qmTerm=(v,d,neg)=>(neg?'-':'')+(d===1?`${v}^2`:`${v}^2/${d*d}`);
const qmSide=ts=>ts.map((x,k)=>k===0?x:x[0]==='-'?` - ${x.slice(1)}`:` + ${x}`).join('');
/* the standard form, sometimes rewritten (× −1, everything on one side, sides swapped) so the rule has to be applied, not pattern-matched */
function qmEq(s,variant){
  const R=[0,1,2].filter(i=>i!==s.ax), U=AXL[R[0]], V=AXL[R[1]], W=AXL[s.ax], a=s.a||1, b=s.b||1, c=s.c||1, sg=s.sg||1;
  const v=variant===undefined?(coin(.45)?ri(1,3):0):variant;
  switch(s.t){
    case 'ell': return v===1?`${qmSide([qmTerm(U,a,1),qmTerm(V,b,1),qmTerm(W,c,1)])} = -1`:`${qmSide([qmTerm(U,a),qmTerm(V,b),qmTerm(W,c)])} = 1`;
    case 'one': return v===1?`${qmSide([qmTerm(W,c),qmTerm(U,a,1),qmTerm(V,b,1)])} = -1`:v===2?`${qmSide([qmTerm(U,a),qmTerm(V,b)])} = 1 + ${qmTerm(W,c)}`:`${qmSide([qmTerm(U,a),qmTerm(V,b),qmTerm(W,c,1)])} = 1`;
    case 'two': return v===1?`${qmSide([qmTerm(U,a),qmTerm(V,b),qmTerm(W,c,1)])} = -1`:v===2?`${qmTerm(W,c)} = 1 + ${qmSide([qmTerm(U,a),qmTerm(V,b)])}`:`${qmSide([qmTerm(U,a,1),qmTerm(V,b,1),qmTerm(W,c)])} = 1`;
    case 'cone': return v===1?`${qmSide([qmTerm(U,a),qmTerm(V,b),qmTerm(W,c,1)])} = 0`:v===2?`${qmTerm(W,c)} - ${qmTerm(U,a)} = ${qmTerm(V,b)}`:`${qmSide([qmTerm(U,a),qmTerm(V,b)])} = ${qmTerm(W,c)}`;
    case 'ep': return v===1?`${qmSide([qmTerm(U,a,sg<0),qmTerm(V,b,sg<0)])} = ${W}`:v===2?`${sg<0?'':'-'}${W} + ${qmSide([qmTerm(U,a),qmTerm(V,b)])} = 0`.replace('+ -','- '):`${W} = ${qmSide([qmTerm(U,a,sg<0),qmTerm(V,b,sg<0)])}`;
    case 'hp': return v===1?`${qmSide([qmTerm(V,b,sg>0),qmTerm(U,a,sg<0)])} = ${W}`:`${W} = ${qmSide([qmTerm(U,a,sg<0),qmTerm(V,b,sg>0)])}`;
    case 'cyl': return v===1?`${qmSide([qmTerm(U,a,1),qmTerm(V,b,1)])} = -1`:`${qmSide([qmTerm(U,a),qmTerm(V,b)])} = 1`;
    case 'hcyl': return v===1?`${qmSide([qmTerm(V,b),qmTerm(U,a,1)])} = -1`:`${qmSide([qmTerm(U,a),qmTerm(V,b,1)])} = 1`;
    case 'pcyl': { const Q=AXL[s.sq]; return v===1?`${qmTerm(Q,a,sg<0)} = ${W}`:`${W} = ${qmTerm(Q,a,sg<0)}`; }
  }
}
/* integer coefficients, shifted centers, terms spread over both sides: complete the square, then use the rule */
function qmMessy(t){
  const p=shuf([0,1,2]), U=p[0], V=p[1], W=p[2], A=ri(1,5), B=ri(1,5), C=ri(1,5), D=ri(2,30);
  const q=[0,0,0], l=[0,0,0]; let k=0; const done=[];
  const sq=(i,co,h)=>{ q[i]+=co; l[i]+=-2*co*h; k+=co*h*h; done.push({i,co,h}); };
  const h=()=>coin(.6)?pick([-3,-2,-1,1,2,3]):0;
  switch(t){
    case 'ell': sq(U,A,h()); sq(V,B,h()); sq(W,C,h()); k-=D; break;
    case 'one': sq(U,A,h()); sq(V,B,h()); sq(W,-C,h()); k-=D; break;
    case 'two': sq(U,-A,h()); sq(V,-B,h()); sq(W,C,h()); k-=D; break;
    case 'cone': sq(U,A,h()); sq(V,B,h()); sq(W,-C,h()); break;
    case 'ep': sq(U,A,h()); sq(V,B,h()); l[W]+=-1; k+=ri(-6,6); break;
    case 'hp': sq(U,A,h()); sq(V,-B,h()); l[W]+=-1; k+=ri(-6,6); break;
    case 'cyl': sq(U,A,h()); sq(V,B,h()); k-=D; break;
    case 'hcyl': sq(U,A,h()); sq(V,-B,h()); k-=D; break;
    case 'pcyl': sq(U,A,h()); l[V]+=-1; k+=ri(-6,6); break;
  }
  if(coin(.35)){ for(let i=0;i<3;i++){ q[i]=-q[i]; l[i]=-l[i]; } k=-k; }
  /* the polynomial = 0; move a random subset (always the constant) to the right side */
  const terms=[]; for(let i=0;i<3;i++){ if(q[i]) terms.push({c:q[i],v:AXL[i],e:2}); if(l[i]) terms.push({c:l[i],v:AXL[i],e:1}); } if(k) terms.push({c:k,v:'',e:0});
  const L=[], Rr=[]; terms.forEach(x=>{ if(x.e===0||(x.e===2&&coin(.3))||(x.e===1&&coin(.35))) Rr.push({...x,c:-x.c}); else L.push(x); });
  if(!L.length){ const x=Rr.shift(); L.push({...x,c:-x.c}); }
  const str=ts=>ts.length?sumS(ts.map(x=>x.e===0?String(x.c):mono(x.c,{[x.v]:x.e}))):'0';
  const eq=`${str(L)} = ${str(Rr)}`;
  const done2=done.map(d=>d.h?`${d.co<0?'-':''}${Math.abs(d.co)===1?'':Math.abs(d.co)}(${AXL[d.i]}${d.h>0?'-':'+'}${Math.abs(d.h)})^2`:`${d.co<0?'-':''}${Math.abs(d.co)===1?'':Math.abs(d.co)}${AXL[d.i]}^2`);
  return {eq,shape:done2,lin:l.map((c,i)=>q[i]===0&&c?AXL[i]:'').filter(Boolean)};
}

/* ---- option builders ---- */
function qmNameOpts(t){
  const others=QM_NEAR[t].slice(0,2).concat(shuf(QM_T.filter(x=>x!==t&&!QM_NEAR[t].slice(0,2).includes(x)))).slice(0,4);
  return [{h:qmName(t),ok:true,why:'',t}].concat(others.map(o=>({h:qmName(o),ok:false,why:`${qmName(o)}: ${QG_SIG[o]}. It looks like ${QM_I[o].look}.`,t:o})));
}
const qmCardMini=t=>`<b>${qmName(t)}</b>: \\(${QM_I[t].std}\\) — ${QM_I[t].look}.`;
/* each builder: (t) → question */
const QM_B={
  look:t=>{
    if(coin(.5)) return {q:`Which surface is ${QM_I[t].look}?`,opts:qmNameOpts(t),ans:qmName(t),lv:1,
      how:`${qmName(t)}: ${QM_I[t].look}.`,sol:[[QM_I[t].hook,QM_I[t].std]]};
    const others=QM_NEAR[t].slice(0,2).concat(shuf(QM_T.filter(x=>x!==t&&!QM_NEAR[t].slice(0,2).includes(x)))).slice(0,4);
    return {q:`What does ${an(qmName(t))} <b>${qmName(t).toLowerCase()}</b> look like?`,opts:[{h:QM_I[t].look,ok:true,why:'',t}].concat(others.map(o=>({h:QM_I[o].look,ok:false,why:`That is the ${qmName(o).toLowerCase()}.`,t:o}))),
      ans:QM_I[t].look,lv:1,how:QM_I[t].hook,sol:[[`${qmName(t)}: ${QM_I[t].look}.`,QM_I[t].std]]};
  },
  rule:t=>{
    if(coin(.5)) return {q:`An equation has ${QG_SIG[t]}. Which surface is it?`,opts:qmNameOpts(t),ans:qmName(t),lv:1,how:QM_I[t].hook,sol:[[QM_I[t].hook,QM_I[t].std]]};
    const others=QM_NEAR[t].slice(0,2).concat(shuf(QM_T.filter(x=>x!==t&&!QM_NEAR[t].slice(0,2).includes(x)))).slice(0,4);
    return {q:`How do you recognize the equation of ${an(qmName(t))} <b>${qmName(t).toLowerCase()}</b>?`,opts:[{h:QG_SIG[t].replace(/^./,c=>c.toUpperCase()),ok:true,why:'',t}].concat(others.map(o=>({h:QG_SIG[o].replace(/^./,c=>c.toUpperCase()),ok:false,why:`That rule describes the ${qmName(o).toLowerCase()}.`,t:o}))),
      ans:QG_SIG[t],lv:1,how:QM_I[t].hook,sol:[[QM_I[t].hook,QM_I[t].std]]};
  },
  g2n:t=>{ const s=qmSpec(t);
    return {q:`Which surface is shown?<div class="qgfig">${qgSpan(s,290)}</div>`,opts:qmNameOpts(t),ans:qmName(t),lv:1,
      how:`${qmName(t)}: ${QM_I[t].look}.`,sol:[[`${qgDescribe(s)}.`,tex(qgEq(s))]],chk:{op:'qmname',e:{eq:qgEq(s)},n:{t,name:qmName(t)}}}; },
  e2n:t=>{ const s=qmSpec(t), eq=qmEq(s);
    return {q:`Identify the surface ${mk(eq)}.`,opts:qmNameOpts(t),ans:qmName(t),lv:1,
      how:`Get the constant to +1 (or 0) on the right, then read the signs: ${QG_SIG[t]}.`,sol:[[QM_I[t].hook,tex(eq)]],chk:{op:'qmname',e:{eq},n:{t,name:qmName(t)}}}; },
  trace:t=>{ const s=qmSpec(t), v=ri(0,2), tr=qgTrace(s,v), eq=qmEq(s,0);
    const all=['Ellipses','Hyperbolas','Parabolas','Lines','Single points'];
    const opts=[{h:tr,ok:true,why:''}].concat(all.filter(x=>x!==tr).map(x=>({h:x,ok:false,why:`Set ${AXL[v]} = k: what is left is ${tr.toLowerCase()}. Same-sign squares give ellipses, opposite signs hyperbolas, one first-power variable parabolas, one variable alone lines.`})));
    return {q:`Traces of ${mk(eq)} in the planes ${m`${AXL[v]}=k`} (for a typical ${m`k`} that gives a curve) are`,opts,ans:tr,lv:2,
      how:`Replace ${AXL[v]} by a constant and classify what is left in the other two variables.`,
      sol:[[`This is ${an(qmName(t))} ${qgDescribe(s).replace(/^./,c=>c.toLowerCase())}. With ${AXL[v]} = k the equation keeps only the other two variables: ${tr.toLowerCase()}.`,tex(eq)]],chk:{op:'qmtrace',e:{eq},n:{v:AXL[v],trace:tr}}}; },
  n2g:t=>{ const view=ri(0,QG_VIEWS.length-1), ax=ri(0,2), key=qmSpec(t,view); key.ax=ax; if(t==='pcyl') key.sq=[0,1,2].filter(i=>i!==ax)[ri(0,1)];
    const others=QM_NEAR[t].slice(0,2).concat(shuf(QM_T.filter(x=>x!==t&&!QM_NEAR[t].slice(0,2).includes(x)))).slice(0,3);
    const opts=[{h:qgSpan(key,150),ok:true,why:'',t}].concat(others.map(o=>{ const d=qmSpec(o,view); d.ax=ax; if(o==='pcyl') d.sq=[0,1,2].find(i=>i!==ax); return {h:qgSpan(d,150),ok:false,why:`That graph is ${an(qmName(o))} ${qmName(o).toLowerCase()}: ${QM_I[o].look}.`,t:o}; }));
    return {q:`Which graph is ${an(qmName(t))} <b>${qmName(t).toLowerCase()}</b>?`,opts,ans:qmName(t),lv:2,how:`${qmName(t)}: ${QM_I[t].look}.`,sol:[[QM_I[t].hook,QM_I[t].std]]}; },
  n2e:t=>{ const ax=ri(0,2), key=qmSpec(t); key.ax=ax; if(t==='pcyl') key.sq=[0,1,2].filter(i=>i!==ax)[ri(0,1)];
    const others=QM_NEAR[t].slice(0,2).concat(shuf(QM_T.filter(x=>x!==t&&!QM_NEAR[t].slice(0,2).includes(x)))).slice(0,4);
    const ke=qmEq(key,0), seen=[ke];
    const opts=[{h:mk(ke),ok:true,why:'',t}];
    others.forEach(o=>{ const d=qmSpec(o); d.ax=ax; if(o==='pcyl') d.sq=[0,1,2].filter(i=>i!==ax)[ri(0,1)]; const e=qmEq(d,0); if(seen.includes(e)) return; seen.push(e); opts.push({h:mk(e),ok:false,why:`That equation is ${an(qmName(o))} ${qmName(o).toLowerCase()}: ${QG_SIG[o]}.`,t:o}); });
    return {q:`Which equation describes ${an(qmName(t))} <b>${qmName(t).toLowerCase()}</b>?`,opts,ans:ke,lv:2,how:QG_SIG[t],sol:[[QM_I[t].hook,tex(ke)]],chk:{op:'qmname',e:{eq:ke},n:{t,name:qmName(t)}}}; },
  axis:t=>{ const s=qmSpec(t), eq=qmEq(s);
    if(t==='ep'){ const W=AXL[s.ax], key=`Opens toward ${s.sg>0?'+':'−'}${W}`;
      const opts=[key].concat(shuf(['+x','−x','+y','−y','+z','−z'].map(d=>`Opens toward ${d}`).filter(x=>x!==key)).slice(0,4)).map((h,i)=>({h,ok:i===0,why:i?`The first-power variable is ${W}; ${W} = (positive squares) opens toward +${W}, ${W} = −(squares) toward −${W}.`:''}));
      return {q:`Which way does the bowl ${mk(eq)} open?`,opts,ans:key,lv:2,how:QM_I.ep.axis,sol:[[`First-power variable ${W}; ${s.sg>0?'the squares are positive, so it opens toward +':'the squares are negative, so it opens toward −'}${W}.`,tex(eq)]],chk:{op:'qmaxis',e:{eq},n:{t,ax:W,sg:s.sg}}}; }
    const target=t==='pcyl'?AXL[3-s.ax-s.sq]:AXL[s.ax];
    const what={one:'Which axis does it wrap around?',two:'Along which axis do its two sheets lie?',cone:'What is its axis?',hp:'Which variable is the up/down direction of the saddle?',cyl:'Which axis does the cylinder run parallel to?',hcyl:'Which axis do its walls run parallel to?',pcyl:'Which axis does the trough run parallel to?'}[t];
    const opts=['x','y','z'].map(a=>({h:`the ${a}-axis`,ok:a===target,why:`${qmName(t)}: ${QM_I[t].axis}. Here that is ${target}.`}));
    opts.push({h:'It has no special axis',ok:false,why:`Only the ellipsoid has no special axis. ${QM_I[t].axis}.`});
    return {q:`${mk(eq)} is ${an(qmName(t))} ${qmName(t).toLowerCase()}. ${what}`,opts,ans:`the ${target}-axis`,lv:2,how:QM_I[t].axis,sol:[[`${QM_I[t].axis.replace(/^./,c=>c.toUpperCase())}: ${target}.`,tex(eq)]],chk:{op:'qmaxis',e:{eq},n:{t,ax:target}}}; },
  mess:t=>{ const M=qmMessy(t);
    return {q:`Identify the surface ${mk(M.eq)}.`,opts:qmNameOpts(t),ans:qmName(t),lv:3,
      how:'Move everything to one side, complete the square in each variable that has both a square and a linear term, then read the signs.',
      sol:[['Collect terms and complete the square: the squared pieces are',M.shape.join(',\\ ')+(M.lin.length?`\\quad\\text{with } ${M.lin[0]} \\text{ to the first power}`:'')],[QM_I[t].hook,'']],chk:{op:'qmname',e:{eq:M.eq},n:{t,name:qmName(t)}}}; }
};
function qmBuild(f,t){
  for(let i=0;i<30;i++){ let o=null; try{ o=QM_B[f](t); }catch(e){ o=null; }
    if(!o||!o.opts||o.opts.filter(x=>x.ok).length!==1||new Set(o.opts.map(x=>x.h)).size!==o.opts.length||o.opts.length<4) continue;
    o.opts=shuf(o.opts); return Object.assign({kind:'choice',noShuffle:true,chk:o.chk||{op:'none'},qm:{t,f,key:t+'.'+f}},o); }
  return null;
}
/* the facets are also registered as ordinary generators (diagnostic fallbacks, logs, tests) */
QM_F.forEach(f=>add('qm-'+f,'Quadric surfaces','13.6',()=>qmBuild(f,pick(QM_T.filter(t=>!(f==='axis'&&t==='ell'))))));

/* ---- the scheduler ---- */
let QM_S={again:[],lastT:'',lastKey:''};
function qmState(){ const S=store.qmem||(store.qmem={f:{},intro:{},v:1}); S.f=S.f||{}; S.intro=S.intro||{}; return S; }
const qmBox=k=>{ const e=qmState().f[k]; return e?e.b:-1; };
function qmUnlocked(){ const S=qmState(); return QM_T.filter(t=>S.intro[t]); }
function qmNext(qn){
  const S=qmState(), now=Date.now(), F=S.f;
  /* 1. a miss from this session comes back a few questions later */
  const ag=QM_S.again.filter(a=>a.at<=qn).sort((a,b)=>a.at-b.at)[0];
  if(ag){ QM_S.again=QM_S.again.filter(a=>a!==ag); return {key:ag.key}; }
  /* 2. reviews that are due, lowest box first */
  const due=Object.keys(F).filter(k=>F[k].due<=now&&k!==QM_S.lastKey).sort((a,b)=>F[a].b-F[b].b||F[a].due-F[b].due);
  const learning=Object.keys(F).filter(k=>F[k].b<2).length;
  const dueOther=due.filter(k=>k.split('.')[0]!==QM_S.lastT);
  if(due.length&&(learning>=5||coin(.75))) return {key:(dueOther[0]||due[0])};
  /* 3. something new: next facet tier of an unlocked surface, or the next surface */
  const ready=t=>f=>QM_F.filter(g=>QM_TIER[g]<QM_TIER[f]&&!(g==='axis'&&t==='ell')).every(g=>qmBox(t+'.'+g)>=1);
  const fresh=[];
  qmUnlocked().forEach(t=>QM_F.forEach(f=>{ const k=t+'.'+f; if(!F[k]&&QM_KEYS.includes(k)&&ready(t)(f)) fresh.push(k); }));
  fresh.sort((a,b)=>QM_TIER[a.split('.')[1]]-QM_TIER[b.split('.')[1]]||QM_T.indexOf(a.split('.')[0])-QM_T.indexOf(b.split('.')[0]));
  const tier1Open=qmUnlocked().some(t=>['look','rule','g2n','e2n'].some(f=>qmBox(t+'.'+f)<1));
  const nextT=QM_T.find(t=>!S.intro[t]);
  if(learning<6){
    if(nextT&&!tier1Open&&(!fresh.length||QM_TIER[fresh[0].split('.')[1]]>1)) return {key:nextT+'.look',intro:nextT};
    if(fresh.length) return {key:fresh[0]};
    if(nextT) return {key:nextT+'.look',intro:nextT};
  }
  if(due.length) return {key:dueOther[0]||due[0]};
  /* 4. nothing due: practise ahead on the weakest seen facts */
  const seen=Object.keys(F).filter(k=>k!==QM_S.lastKey).sort((a,b)=>F[a].b-F[b].b||F[a].due-F[b].due);
  if(seen.length) return {key:seen[0]};
  return {key:'ell.look',intro:'ell'};
}
function qmQuestion(qn){
  for(let tries=0;tries<6;tries++){
    const n=qmNext(qn), [t,f]=n.key.split('.'); const o=qmBuild(f,t); if(!o) continue;
    if(n.intro){ const S=qmState(); S.intro[t]=Date.now(); o.q=`<div class="qmnew"><span class="flag ok">New surface</span>${qmCardHTML(t,'intro')}</div>`+o.q; o.intro=t; }
    QM_S.lastT=t; QM_S.lastKey=n.key;
    return o;
  }
  return null;
}
function qmUpdate(qm,ok,spent){
  const S=qmState(), now=Date.now(), e=S.f[qm.key]||(S.f[qm.key]={b:0,due:now,s:0,r:0,w:0,l:0});
  e.s++; e.l=now;
  if(ok){ e.r++; e.b=Math.min(5,e.b+1); e.due=now+QM_IV[e.b]; QM_S.again=QM_S.again.filter(a=>a.key!==qm.key); }
  else{ e.w++; e.b=0; e.due=now; QM_S.again.push({key:qm.key,at:qi+ri(3,4)}); }
  persist();
}
function qmCounts(){ const F=qmState().f, ks=QM_KEYS; const mem=ks.filter(k=>F[k]&&F[k].b>=3).length, learn=ks.filter(k=>F[k]&&F[k].b<3).length, due=ks.filter(k=>F[k]&&F[k].due<=Date.now()).length;
  return {mem,learn,due,total:ks.length,fresh:ks.length-mem-learn}; }

/* ---- cards, grid, study sheet, the miss panel ---- */
function qmCardHTML(t,kind){
  const I=QM_I[t], s={t,ax:2,v:1,a:t==='pcyl'?1:2,b:t==='ep'||t==='hp'||t==='pcyl'?1:3,c:t==='ep'||t==='hp'||t==='pcyl'?1:2,sg:1,sq:0};
  if(t==='ell'){ s.a=3; s.b=2; s.c=2; }
  return `<div class="qmc${kind==='intro'?' qmc-intro':''}"><div class="qmc-g">${qgSpan(s,kind==='study'?220:180)}</div><div class="qmc-b">`+
    `<h4>${qmName(t)}</h4><p class="qmc-eq">\\(${I.std}\\)</p>`+
    `<p><b>Spot it:</b> ${QG_SIG[t]}.</p><p><b>Looks like:</b> ${I.look}.</p>`+
    `<p><b>Traces</b> (z is the special axis): z = k: ${I.trZ}; x = k, y = k: ${I.trXY}.</p>`+
    `<p><b>Axis:</b> ${I.axis}.</p><p><b>Facts:</b> ${I.feat}.</p><p class="qmc-hook">${I.hook}</p></div></div>`;
}
function qmGrid(){
  const F=qmState().f, now=Date.now();
  return `<div class="tablebox"><table class="qmgrid"><thead><tr><th>Surface</th>${QM_F.map(f=>`<th title="${QM_FN[f]}">${QM_FN[f].replace(' → ','→')}</th>`).join('')}</tr></thead><tbody>`+
    QM_T.map(t=>`<tr><td>${qmName(t)}</td>${QM_F.map(f=>{ const k=t+'.'+f; if(!QM_KEYS.includes(k)) return '<td class="na">·</td>'; const e=F[k];
      const c=!e?'new':e.b>=3?'mem':e.b>=1?'ok':'bad'; return `<td class="${c}" title="${QM_FN[f]}: ${!e?'not asked yet':`box ${e.b}, ${e.r} right / ${e.w} wrong${e.due<=now?', due now':''}`}"></td>`; }).join('')}</tr>`).join('')+
    `</tbody></table></div><p class="fine qmlegend"><i class="mem"></i> memorized <i class="ok"></i> learning <i class="bad"></i> missed last time <i class="new"></i> not asked yet</p>`;
}
function qmPaintStart(){
  const el=$('qmline'); if(!el) return; const c=qmCounts();
  el.textContent=c.mem+c.learn?`${c.mem} of ${c.total} facts memorized, ${c.learn} in progress${c.due?`, ${c.due} due for review now`:''}.`:`${c.total} facts about the 9 surfaces: what they look like, how to spot the equation, traces, axes. New surfaces come in one at a time.`;
}
function openQmStudy(){
  show('qstudy'); window.scrollTo(0,0);
  const box=$('qmcards'); try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([box]); }catch(e){}
  box.innerHTML=QM_T.map(t=>qmCardHTML(t,'study')).join('');
  $('qmgridstudy').innerHTML=qmGrid(); typeset($('qstudy'));
}
let QM_PAUSE=0;
/* a miss: stop the clock, show the right surface's card (and the one picked), wait for Continue */
function qmTeach(picked){
  const t=cur.qm.t, p=picked&&picked.t&&picked.t!==t?picked.t:null, el=$('qmteach');
  try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([el]); }catch(e){}
  el.innerHTML=`<p class="qmteach-h">Learn it: this one is ${an(qmName(t))} <b>${qmName(t).toLowerCase()}</b>. It will come back in a few questions.</p>${qmCardHTML(t,'teach')}`+
    (p?`<p class="qmteach-h">You picked ${an(qmName(p))} ${qmName(p).toLowerCase()}:</p><p class="qmteach-p">${qmCardMini(p)} Its rule: ${QG_SIG[p]}.</p>`:'')+
    `<div class="btnrow"><button id="qmgo">Continue</button><span class="fine">Enter also continues; the clock is stopped.</span></div>`;
  el.hidden=false; QM_PAUSE=Date.now(); typeset(el);
  $('qmgo').onclick=qmContinue; setTimeout(()=>{ try{ $('qmgo').focus(); }catch(e){} },50);
}
function qmContinue(){ if(!QM_PAUSE) return; t0+=Date.now()-QM_PAUSE; QM_PAUSE=0; $('qmteach').hidden=true; $('qmteach').innerHTML=''; finishQ(); }
