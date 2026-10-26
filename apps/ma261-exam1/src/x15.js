
/* ---------------- Chapter 15 exam templates ---------------- */
const xrat=(p,q)=>Rs(Rr(p,q||1));
/* numeric partial derivative, and "is it an integer" */
const nD=(f,env,v,h)=>{ h=h||1e-5; const a={...env},b={...env}; a[v]+=h; b[v]-=h; return (ev(f,a)-ev(f,b))/(2*h); };
const nD2=(f,env,u,v)=>{ const h=1e-3; if(u===v){ const a={...env},b={...env}; a[u]+=h; b[u]-=h; return (ev(f,a)-2*ev(f,env)+ev(f,b))/(h*h); }
  const pp={...env},pm={...env},mp_={...env},mm={...env}; pp[u]+=h;pp[v]+=h; pm[u]+=h;pm[v]-=h; mp_[u]-=h;mp_[v]+=h; mm[u]-=h;mm[v]-=h; return (ev(f,pp)-ev(f,pm)-ev(f,mp_)+ev(f,mm))/(4*h*h); };
const intOf=x=>{ const r=Math.round(x); return Math.abs(r-x)<1e-5?r:null; };
/* c·body with a rational coefficient [p,q], tidy */
const cS=(r,body)=>{ r=Rr(r[0],r[1]); if(r[0]===0) return '0'; if(!body) return Rs(r); const s=r[0]<0?'-':'', P=Math.abs(r[0]);
  return `${s}${P===1?'':P+'*'}${body}${r[1]===1?'':'/'+r[1]}`; };
const LBL=(h,why)=>({h,why});
const plainPt=p=>'('+p.join(', ')+')';

/* =============================== 15.1 LVL =============================== */
/* ★ what shape are the level curves — F2022-Q6, S2018-Q5, F2018-Q7, S2019-Q7, F2024-Q4, S2023-Q7 */
addX('x-lvl-shape','LVL',4,['F2022-Q6','S2018-Q5','F2018-Q7','S2019-Q7','F2024-Q4','S2023-Q7'],()=>{
  const L={par:'Parabolas',hyp:'Hyperbolas',cir:'Circles',ell:'Non-circular ellipses',lin:'Lines',ep:'Sometimes ellipses and sometimes points',cp:'Sometimes circles and sometimes points',hl:'Sometimes hyperbolas and sometimes lines',pp:'Sometimes parabolas and sometimes points'};
  const fam=pick(['sq','sq','sq','exp','cap']);
  let f,key,why={},steps,ban=[];
  if(fam==='sq'){
    const lv=pick(['x','y']), ov=lv==='x'?'y':'x', k=pick([1,2,2,3,4]), a=pick([1,1,4,9,2,3]), c=pick([1,4,9,25,16,2]), type=pick(['par','par','hyp']);
    const b=type==='par'?k*k:ri(0,k*k-1), s=pick([1,-1]);
    const co={[ov]:a,[lv]:b}, Q=sumS([mono(co.x,{x:2}),mono(co.y,{y:2}),String(c)]);
    f=sumS([`sqrt(${Q})`,mono(-s*k,{[lv]:1})]); key=type;
    const r=`${b}${lv}^2-${k*k}${lv}^2`;
    for(const t of ['hyp','par','cir','ell','lin','hl','pp']) why[t]=type==='par'
      ?`Set f = c, isolate the root and square: the ${lv}² terms cancel (\\(${r}=0\\)), leaving one squared variable — parabolas.`
      :`After squaring, the ${lv}² coefficient is \\(${b}-${k*k}<0\\) while the ${ov}² coefficient is positive: opposite signs, and the constant never vanishes — hyperbolas.`;
    steps=[['Set f = c and isolate the root.',X`\sqrt{${tex(Q)}}=c${s>0?'+':'-'}${k===1?'':k}${lv}`],['Square both sides.',X`${tex(Q)}=c^2${s>0?'+':'-'}${2*k}c${lv}+${k*k}${lv}^2`],[type==='par'?`The ${lv}² terms cancel: one squared variable remains, so parabolas.`:`${lv}² and ${ov}² end up with opposite signs: hyperbolas.`,'']];
    ban=['cp','ep'];
  } else if(fam==='exp'){
    const t=pick(['cir','cir','ell','hl']), a=ri(1,3), b=t==='cir'?a:t==='ell'?pick([1,2,3,4].filter(v=>v!==a)):-pick([1,2,3]);
    const lx=pick([0,ri(-4,4)]), ly=nz(-4,4);
    const Q=sumS([mono(a,{x:2}),mono(b,{y:2}),mono(lx,{x:1}),mono(ly,{y:1})]);
    f=pick([`e^(${Q})`,`e^(${Q})`,`ln(1 + e^(${Q}))`]); key=t;
    const W={cir:'The x² and y² coefficients are equal and positive: circles (completing the square just moves the center).',ell:'Same-sign but unequal x² and y² coefficients: ellipses that are not circles.',hl:'x² and y² have opposite signs: hyperbolas, and for one level the constant after completing the square is 0, which gives a pair of lines.'};
    for(const u of Object.keys(L)) why[u]=`The outer function is one-to-one, so f = c is the same as \\(${tex(Q)}=\\text{const}\\). ${W[t]}`;
    steps=[['The outer function is one-to-one.',X`f=c\iff ${tex(Q)}=\text{const}`],['Complete the square. '+W[t],'']];
    ban=['cp','ep','pp'];
  } else {
    const a=ri(1,4), b=pick([a,a,ri(1,4)]), R=pick([2,3,4,5,6]), R2=R*R*pick([1,a*b]);
    f=`sqrt(${sumS([String(R2),mono(-a,{x:2}),mono(-b,{y:2})])})`; key=a===b?'cp':'ep';
    for(const u of Object.keys(L)) why[u]=`f = c ≥ 0 gives \\(${tex(sumS([mono(a,{x:2}),mono(b,{y:2})]))}=${R2}-c^2\\): ${a===b?'circles':'ellipses'} while c² < ${R2}, one point when c² = ${R2}.`;
    steps=[['Set f = c ≥ 0 and square.',X`${tex(sumS([mono(a,{x:2}),mono(b,{y:2})]))}=${R2}-c^2`],[`${a===b?'Circles':'Ellipses'} for c² < ${R2}, the single point (0, 0) when c² = ${R2}.`,'']];
    ban=a===b?['cir']:['ell','cir'];
  }
  const dis=Object.keys(L).filter(u=>u!==key&&!ban.includes(u)).map(u=>LBL(L[u],why[u]));
  const opts=xm({h:L[key]},dis);
  return xq(`The ${fam==='exp'&&key==='cir'?'non-empty ':''}level curves of ${m`f(x,y)=${tex(f)}`} are`,opts,{kind:'choice',lv:2,
    how:'Set f = c, isolate any root, square, and look at the signs of the squared terms.',sol:steps,chk:{op:'lvlshape',e:{f},n:{fam,label:L[key]}}});
});

/* domain of a log / root of a quotient — S2017-Q7 */
addX('x-lvl-domain','LVL',1,['S2017-Q7'],()=>{
  const a=ri(-3,3), b=nz(-3,3), fn=pick(['ln','ln','sqrt']);
  const X_=a===0?'x':`(${shift('x',a)})`, Y_=`(${shift('y',b)})`;
  const f=a===0?`${fn}(x/${Y_})`:`${fn}(${X_}/${Y_})`;
  const gt=fn==='ln'?'>':'\\ge', lt=fn==='ln'?'<':'\\le';
  const H=s=>m`${s}`;
  const key=H(`y>${b},\\ x${gt}${a}\\quad\\text{or}\\quad y<${b},\\ x${lt}${a}`);
  const dis=[LBL(H(`y\\ne ${b},\\ x${gt}${a}`),'When y < '+b+' the denominator is negative, so x − '+a+' must be negative too.'),
    LBL(H(`y>${b},\\ x${gt}${a}`),'That is only one of the two cases: a quotient is also positive when both parts are negative.'),
    LBL(H(`y>0,\\ x${gt}0`),'The conditions involve x − '+a+' and y − '+b+', not x and y.'),
    LBL(H(`y>${b},\\ x${gt}${a}\\quad\\text{or}\\quad y<${b},\\ x${gt}${a}`),'Both parts must have the same sign.'),
    LBL(H(`x\\ne ${a},\\ y\\ne ${b}`),fn==='ln'?'ln needs a positive argument, not just a defined one.':'√ needs a non-negative argument.'),
    LBL(H(`y${gt==='>'?'\\ge':'>'}${b},\\ x${gt}${a}\\quad\\text{or}\\quad y<${b},\\ x${lt}${a}`),'y = '+b+' makes the denominator 0.')];
  const opts=xm({h:key},dis);
  const P=v=>`${v}`;
  const pred=fn==='ln'?`Or(And(x>${a},y>${b}),And(x<${a},y<${b}))`:`Or(And(x>=${a},y>${b}),And(x<=${a},y<${b}))`;
  return xq(`The domain of ${m`f(x,y)=${tex(f)}`} is`,opts,{kind:'choice',lv:1,how:fn==='ln'?'ln u needs u > 0: a quotient is positive when both parts are positive or both negative.':'√u needs u ≥ 0, and the denominator cannot be 0.',
    sol:[['Sign of a quotient.',fn==='ln'?X`\frac{${tex(a?shift('x',a):'x')}}{${tex(shift('y',b))}}>0`:X`\frac{${tex(a?shift('x',a):'x')}}{${tex(shift('y',b))}}\ge0,\ y\ne ${b}`],['Both positive or both negative.',key.slice(2,-2)]],
    chk:{op:'domainpred',e:{f},n:{pred}}});
});

/* level curves ⇄ graph, and contour maps — S2022-Q5, F2017-Q5 */
addX('x-lvl-graph','LVL',1,['S2022-Q5','F2017-Q5'],()=>{
  if(coin()){
    const c=ri(1,4);
    const B=[['families of hyperbolas opening left–right and up–down, separated by the lines \\(y=\\pm x\\) (the level through the origin)','a hyperbolic paraboloid'],
      ['concentric circles about the origin that get closer together as the level increases (radius \\(\\sqrt c\\))','a circular (elliptic) paraboloid'],
      ['concentric circles about the origin, equally spaced for equally spaced levels','a cone'],
      ['parallel straight lines, equally spaced for equally spaced levels','a plane'],
      [`concentric circles about the origin, only for levels \\(0\\le c\\le ${c}\\), crowding together near the outer circle`,'the upper half of a sphere']];
    const i=ri(0,B.length-1);
    const pool=['a hyperbolic paraboloid','a circular (elliptic) paraboloid','a cone','a plane','the upper half of a sphere','a hyperboloid of two sheets','an ellipsoid'];
    const W={'a hyperboloid of two sheets':'A hyperboloid of two sheets is not the graph of a function z = f(x, y) near its vertex region — and its level curves are circles, not this pattern.',
      'an ellipsoid':'An ellipsoid is not the graph of a single function z = f(x, y).'};
    const why=h=>W[h]||`${h[0].toUpperCase()+h.slice(1)} has level curves that are ${B.find(b=>b[1]===h)[0].replace(/\\\(|\\\)/g,'').split(',')[0]}.`;
    const opts=xm({h:B[i][1]},pool.filter(h=>h!==B[i][1]).map(h=>LBL(h,why(h))));
    return xq(`The level curves of ${m`z=f(x,y)`} are ${B[i][0]}. The graph of ${m`f`} could be`,opts,{kind:'choice',lv:1,how:'Match how the level curves look and how their spacing changes with the level.',sol:[[B[i][1][0].toUpperCase()+B[i][1].slice(1)+'.','']],chk:{op:'manual'}});
  }
  const a=ri(2,4);
  const F=[['cos(x)','vertical lines'],['sin(y)','horizontal lines'],[`x + ${a}*y`,'parallel slanted lines'],[`x^2 + ${a}*y^2`,'nested ellipses'],['x*y','hyperbolas in the quadrants, plus the two axes'],['x^2 + y^2','concentric circles']];
  const i=ri(0,F.length-1);
  const opts=xm({h:F[i][1]},F.filter((_,j)=>j!==i).map(g=>LBL(g[1],`Those are the level curves of \\(${tex(g[0])}\\).`)));
  return xq(`Which describes the contour map of ${m`f(x,y)=${tex(F[i][0])}`}?`,opts,{kind:'choice',lv:1,how:'Set f = c and see what set of points that is.',sol:[['Set f = c: '+F[i][1]+'.','']],chk:{op:'manual'}});
});

/* =============================== 15.2 LIM =============================== */
/* factor & cancel, or plug in — S2025-Q1, F2016-Q8 */
addX('x-lim-factor','LIM',3,['S2025-Q1','F2016-Q8'],()=>{
  const fam=pick(['A','A','B','C']);
  let f,a,b,val,dis,steps;
  if(fam==='A'){ const p=ri(1,3), bb=pick([1,2]), x0=ri(-2,2), sw=coin(), u=sw?'y':'x', w=sw?'x':'y', B4=bb**4, sg=pick([1,-1]);
    f=`(${sumS([mono(1,{[w]:4}),mono(p,{[u]:2,[w]:4}),String(-B4),mono(-p*B4,{[u]:2})])})/(${sumS([mono(1,{[w]:2}),String(-bb*bb)])})`;
    const P={[u]:x0,[w]:sg*bb}; a=P.x; b=P.y; val=(1+p*x0*x0)*2*bb*bb;
    dis=[{a:'DNE',why:'0/0 does not mean the limit fails to exist: factor and cancel first.'},{a:'0',why:'The numerator is 0 at the point, but so is the denominator.'},
      {a:String((1+p*x0*x0)*bb*bb),why:`After cancelling, the factor is ${w}² + ${bb*bb}, which is ${2*bb*bb} at the point.`},{a:String(2*bb*bb),why:`Dropped the factor 1 + ${p===1?'':p}${u}².`},{a:String(-val),why:'Sign slip.'},{a:String((1+p*x0*x0)*4*bb*bb),why:'Arithmetic slip.'}];
    steps=[['Factor the numerator.',X`(1+${p===1?'':p}${u}^2)(${w}^4-${B4})=(1+${p===1?'':p}${u}^2)(${w}^2-${bb*bb})(${w}^2+${bb*bb})`],['Cancel and substitute.',X`(1+${p===1?'':p}\cdot${fmtC(x0)}^2)(${bb*bb}+${bb*bb})=${val}`]]; }
  else if(fam==='B'){ const c=nz(-2,2); a=c; b=c; const n=pick([3,4]);
    f=n===3?'(x^3 - y^3)/(x - y)':'(x^4 - y^4)/(x^2 - y^2)'; val=n===3?3*c*c:2*c*c;
    dis=[{a:'DNE',why:'The denominator vanishes on a whole line, but the quotient simplifies: cancel first.'},{a:'0',why:'0/0 is not 0.'},{a:String(n===3?c*c:c*c),why:n===3?'x² + xy + y² at the point is 3c², not c².':'x² + y² at the point is 2c².'},{a:String(n===3?2*c*c:4*c*c),why:'Arithmetic slip after cancelling.'},{a:String(n===3?3*c:2*c),why:'Evaluate the squares.'}];
    steps=[['Factor.',n===3?X`x^3-y^3=(x-y)(x^2+xy+y^2)`:X`x^4-y^4=(x^2-y^2)(x^2+y^2)`],['Cancel and substitute.',String(val)]]; }
  else { const c=nz(-5,5), d=pick([1,2,3,4]), mm=ri(1,3); a=0; b=0; f=`(${sumS([String(c),mono(1,{x:1,y:mm})])})/(${sumS([String(d),'x^2','-y^2'])})`; val=null;
    const key=frac(c,d);
    dis=[{a:'DNE',why:'f is continuous at (0, 0): the denominator is not 0 there, so just substitute.'},{h:'The limit is not defined because f is not defined at (0, 0)',why:'f IS defined at (0, 0) — the denominator is '+d+' there.'},{a:'0',why:'Substitute: the numerator is '+c+', not 0.'},{a:frac(d,c),why:'Upside down.'},{a:String(c),why:'The denominator is '+d+' at (0, 0).'}];
    const opts=xm({a:key},dis);
    return xq(`Let ${m`f(x,y)=${tex(f)}`} on its domain. Compute ${m`\lim_{(x,y)\to(0,0)}f(x,y)`}.`,opts,{kind:'expr',lv:1,how:'Rational functions are continuous wherever the denominator is nonzero: substitute.',
      sol:[['Substitute (0, 0).',X`\frac{${c}}{${d}}=${tex(key)}`]],chk:{op:'lim2',e:{f,a:'0',b:'0'}}}); }
  const opts=xm({a:String(val)},dis);
  return xq(`Compute the limit if it exists: ${m`\lim_{(x,y)\to(${a},${b})}${tex(f)}`}`,opts,{kind:'expr',lv:2,how:'Direct substitution gives 0/0: factor the numerator, cancel the common factor, then substitute.',sol:steps,chk:{op:'lim2',e:{f,a:String(a),b:String(b)}}});
});

/* ★ squeeze / substitution / sin u over u (no polar coordinates needed) — F2024-Q5, S2020-Q7, F2019-Q7, F2022-Q8 */
addX('x-lim-polar','LIM',4,['F2024-Q5','S2020-Q7','F2019-Q7','F2022-Q8'],()=>{
  const fam=pick(['A','B','C','D']);
  let f,key,dis,steps;
  if(fam==='A'){ const a=nz(-3,3), k=pick([1,2,3,4]);
    f=`(${sumS([mono(a,{x:4}),mono(-a,{y:4}),`sin(${sumS([mono(k,{x:2}),mono(k,{y:2})])})`])})/(x^2 + y^2)`; key=String(k);
    dis=[{a:'DNE',why:`Split it: ${a}(x⁴ − y⁴)/(x² + y²) = ${a}(x² − y²) → 0, and sin(${k}u)/u → ${k}.`},{a:String(a+k),why:`${a}(x² − y²) → 0, not ${a}.`},{a:'0',why:`sin(${k}(x² + y²))/(x² + y²) → ${k}, not 0.`},{a:frac(1,k),why:`sin(ku)/u → k, not 1/k.`},{a:String(k+1),why:'Arithmetic slip.'},{a:String(2*a+k),why:'x² − y² → 0 at the origin.'}];
    steps=[['Split.',X`${a}\frac{x^4-y^4}{x^2+y^2}=${a}(x^2-y^2)\to0`],['With u = x² + y² → 0.',X`\frac{\sin(${k}u)}{u}\to${k}`],['',X`\text{limit}=${k}`]]; }
  else if(fam==='B'){ const a=nz(-3,3), g=pick(['e^(x^2 + y^2)','cos(x^2 + y^2)','e^(x*y)']);
    f=`(${sumS([mono(a,{y:4}),mono(-a,{x:4})])})/(x^2 + y^2)*${g}`; key='0';
    dis=[{a:'DNE',why:'(y⁴ − x⁴)/(x² + y²) = y² − x² → 0, and the other factor → 1.'},{a:String(a),why:'y² − x² → 0.'},{a:String(-a),why:'y² − x² → 0.'},{a:'1',why:'The first factor → 0, so the product → 0.'},{a:String(2*a),why:'The quotient simplifies to a(y² − x²) → 0.'}];
    steps=[['Factor.',X`\frac{y^4-x^4}{x^2+y^2}=y^2-x^2\to0`],['The other factor tends to 1.',X`\text{limit}=0`]]; }
  else if(fam==='C'){ const p=1, q=pick([1,2,3]), k=pick([2,3,4,5]);
    const U=sumS([mono(p,{x:2}),mono(q,{y:2})]); f=`sin(${sumS([mono(k*p,{x:2}),mono(k*q,{y:2})])})/(${U})`; key=String(k);
    dis=[{a:frac(1,k),why:'sin(ku)/u → k, not 1/k.'},{a:'1',why:`The argument is ${k}u, not u.`},{a:'0',why:'sin(ku)/u does not tend to 0.'},{a:String(-k),why:'Sign slip.'},{a:'DNE',why:'With u = '+tex(U).replace(/[{}\\]/g,'')+' → 0 the limit is the one-variable limit sin(ku)/u → k.'}];
    steps=[['Let u = '+tex(U).replace(/[{}\\]/g,'')+' → 0.',X`\frac{\sin(${k}u)}{u}=${k}\cdot\frac{\sin(${k}u)}{${k}u}\to${k}`]]; }
  else { const p=1, q=pick([1,2,3]), c=pick([2,3,5,7]);
    const U=sumS([mono(p,{x:2}),mono(q,{y:2})]); f=`(1 - cos(${U}))/(${sumS([mono(c*p,{x:2}),mono(c*q,{y:2})])})`; key='0';
    dis=[{a:frac(1,c),why:'(1 − cos u)/u → 0, not 1.'},{a:frac(1,2*c),why:'(1 − cos u)/u² → 1/2, but here it is divided by u, not u².'},{a:'1',why:'(1 − cos u)/u → 0.'},{a:'DNE',why:'One variable u = '+tex(U).replace(/[{}\\]/g,'')+' → 0 carries the whole limit.'},{a:frac(1,c*c),why:'(1 − cos u)/u → 0.'}];
    steps=[['Let u = '+tex(U).replace(/[{}\\]/g,'')+' → 0.',X`\frac{1-\cos u}{${c}u}\to0`]]; }
  const opts=xm({a:key},dis);
  return xq(`${fam==='C'?'Assuming the limit exists, compute':'Compute'} ${m`\lim_{(x,y)\to(0,0)}${tex(f)}`}`,opts,{kind:'expr',lv:2,how:'Look for x² + y² (or another single combination) as one quantity u → 0, and factor differences of squares.',sol:steps,chk:{op:'lim2',e:{f,a:'0',b:'0'}}});
});

/* ★ limits that do not exist, and "can f(0,0) be defined" — F2023-Q11, S2016-Q4, S2022-Q3, S2023-Q9, F2017-Q4, F2015-Q5 */
addX('x-lim-dne','LIM',3,['F2023-Q11','S2016-Q4','S2022-Q3','S2023-Q9','F2017-Q4','F2015-Q5'],()=>{
  const fam=pick(['A','B','C','D','E']);
  if(fam==='D'){ const a=pick([1,2,3]), f=`(x + ${a===1?'':a+'*'}y)^2/(x^2 + y^2)`;
    const opts=xm({h:'It is not possible to define f(0, 0) so that f is continuous there'},[LBL(m`f(0,0)=1`,'Along the x-axis the limit is 1, but along y = x it is '+tex(frac((1+a)**2,2))+'.'),LBL(m`f(0,0)=${tex(frac((1+a)**2,2))}`,'That is only the limit along y = x.'),
      LBL(m`f(0,0)=0`,'Along y = −x/'+a+' the limit is 0, but other paths disagree.'),LBL(m`f(0,0)=${a*a}`,'That is the limit along the y-axis only.'),LBL(m`f(0,0)=\tfrac12`,'Different paths give different limits.')]);
    return xq(`How should ${m`f(0,0)`} be defined so that ${m`f(x,y)=${tex(f)}`} is continuous at ${m`(0,0)`}?`,opts,{kind:'choice',lv:2,how:'f can be made continuous only if the limit exists. Compare paths.',
      sol:[['x-axis (y = 0).','limit 1'],['y = x.',X`\frac{${(1+a)**2}x^2}{2x^2}\to${tex(frac((1+a)**2,2))}`],['Different: the limit does not exist.','']],chk:{op:'limdne',e:{f}}});
  }
  let f,W;
  if(fam==='A'||fam==='E'){ const a=pick([1,2,3,-1,-2]), b=pick([1,1,2,3]); f=`${a===1?'':a===-1?'-':a+'*'}x*y/(x^2 + ${b===1?'':b+'*'}y^2)`;
    if(fam==='E'){
      const opts=xm({h:'The limit does not exist, even though the limits along the x-axis and the y-axis are both 0'},[
        LBL('The limit does not exist because the limits along the x-axis and the y-axis are different','Along both axes the function is identically 0.'),
        LBL('The limit does not exist because the limit along the diagonal y = x does not exist','Along y = x the function is constant, so that path limit exists.'),
        LBL('The limit is 0, and the limit along any path is also 0',`Along y = x the value is \\(${tex(frac(a,1+b))}\\), not 0.`),
        LBL('The limit is 0 because the limit along the diagonal y = x is 0',`Along y = x the limit is \\(${tex(frac(a,1+b))}\\).`),
        LBL('The limit is 0 even though the limits along the x-axis and the y-axis are different','If two paths disagree, the limit cannot exist.')]);
      return xq(`Consider ${m`\lim_{(x,y)\to(0,0)}${tex(f)}`}. Which statement is true?`,opts,{kind:'choice',lv:2,how:'Axes give 0; the line y = mx gives am/(1 + bm²), which depends on m.',
        sol:[['Along y = mx.',X`\frac{${a}m}{1+${b}m^2}`],['Depends on m: the limit does not exist.','']],chk:{op:'limdne',e:{f}}});
    }
    W=[{a:'0',why:'Along the axes the limit is 0, but along y = x it is '+frac(a,1+b)+'.'},{a:frac(a,1+b),why:'That is only the limit along y = x.'},{a:String(a),why:'Along y = mx the value is am/(1 + bm²), which depends on m.'},{a:frac(a,b),why:'Different paths give different limits.'},{a:frac(-a,1+b),why:'That is only the limit along y = −x.'},{a:'1',why:'Along y = mx the value is am/(1 + bm²): it depends on m.'}]; }
  else if(fam==='B'){ const a=pick([1,2,3,-1]), b=pick([1,1,2]); f=`${a===1?'':a===-1?'-':a+'*'}x^2*y/(x^4 + ${b===1?'':b+'*'}y^2)`;
    W=[{a:'0',why:'Every straight line gives 0, but along y = x² the limit is '+frac(a,1+b)+'.'},{a:frac(a,1+b),why:'That is only the limit along the parabola y = x².'},{a:frac(a,2),why:'Different paths give different limits.'},{a:String(a),why:'Along y = mx² the value is am/(1 + bm²), which depends on m.'},{a:frac(-a,1+b),why:'That is only the limit along y = −x².'},{a:'1',why:'Different paths give different limits.'}]; }
  else { const c=pick([1,2,3]); f=`(e^(x + y) - 1)/(${c}*x - ${c}*y)`.replace('(1*x - 1*y)','(x - y)');
    W=[{a:'0',why:'Along y = −x the value is 0, but along y = 0 it tends to '+frac(1,c)+'.'},{a:frac(1,c),why:'That is only the limit along the x-axis.'},{a:'1',why:'Different paths give different limits.'},{a:frac(1,2*c),why:'Along y = mx the limit is (1 + m)/('+c+'(1 − m)), which depends on m.'},{a:'-1',why:'Different paths give different limits.'},{a:frac(3,c),why:'That is only the limit along y = x/2.'}]; }
  const opts=xm({a:'DNE'},W);
  return xq(`Compute ${m`\lim_{(x,y)\to(0,0)}${tex(f)}`}, or say it does not exist (DNE).`,opts,{kind:'expr',lv:2,how:fam==='B'?'Straight lines all give 0; try the curve y = mx².':'Try the lines y = mx: the answer depends on m.',
    sol:[['Compare two paths.',fam==='B'?X`y=mx^2:\ \frac{m}{1+m^2}\text{-type value}`:X`y=mx:\ \text{value depends on }m`],['Two different path limits.',X`\text{DNE}`]],chk:{op:'lim2',e:{f,a:'0',b:'0'}}});
});

/* find the parameter that makes the limit equal L — F2018-Q8, S2024-Q8 */
addX('x-lim-param','LIM',2,['F2018-Q8','S2024-Q8'],()=>{
  const n=pick([2,3]), c=pick([2,3,4,8]), k=nz(-4,4), L=-c*k, P=pick(['a','b','c']).replace('c','a');
  const f=`(x^${2*n} - ${c}*${P}*(x^${n} + y^${n}) - y^${2*n})/(x^${n} + y^${n})`;
  const opts=xm({a:String(k)},[{a:String(-k),why:`Sign slip: the limit is −${c}${P}, so ${P} = −L/${c}.`},{a:String(L),why:`The limit equals −${c}${P}; solve for ${P}.`},{a:String(-L),why:`Divide by ${c}.`},{a:frac(L,c*c),why:'Arithmetic slip.'},{a:String(k+(k>0?1:-1)),why:`x^${2*n} − y^${2*n} = (x^${n} − y^${n})(x^${n} + y^${n}); the first factor → 0.`},{a:frac(-L,2*c),why:'The x-part and y-part do not add; they cancel as a difference of squares.'}]);
  return xq(`Suppose ${m`\lim_{(x,y)\to(0,0)}${tex(f)}=${L}`}. Then ${m`${P}=`}`,opts,{kind:'expr',lv:2,how:'Split into (x^{2n} − y^{2n})/(xⁿ + yⁿ) − c·a; the first part is xⁿ − yⁿ → 0.',
    sol:[['Difference of squares.',X`\frac{x^{${2*n}}-y^{${2*n}}}{x^{${n}}+y^{${n}}}=x^{${n}}-y^{${n}}\to0`],['So the limit is −'+c+P+'.',X`-${c}${P}=${L}\ \Rightarrow\ ${P}=${k}`]],chk:{op:'limparam',n:{n,c,L}}});
});

/* =============================== 15.3 PD =============================== */
/* ★ mixed partial at a point — F2019-Q8, F2023-Q9, S2018-Q8 */
addX('x-pd-mixed','PD',3,['F2019-Q8','F2023-Q9','S2018-Q8'],()=>{
  if(coin(0.6)){
    const a=pick([1,2,4]), n=pick([2,4]), c=pick([1,2,4]), x0=nz(-2,2), y0=nz(-2,2), Q0=x0*x0+a*y0**n+c;
    const f=`ln(${sumS(['x^2',mono(a,{y:n}),String(c)])})`, num=-2*a*n*x0*y0**(n-1), yx=coin();
    const key=frac(num,Q0*Q0);
    const opts=xm({a:key},[{a:frac(num,Q0),why:'(1/u)′ = −u′/u²: the denominator is squared.'},{a:frac(-num,Q0*Q0),why:'Sign slip: differentiating 1/u gives a minus sign.'},{a:frac(2*x0,Q0),why:'That is f_x, not the mixed partial.'},{a:frac(a*n*y0**(n-1),Q0),why:'That is f_y (missing its numerator factor too).'},{a:frac(2*(Q0-2*x0*x0),Q0*Q0),why:'That is f_xx.'},{a:frac(num*2,Q0*Q0),why:'Arithmetic slip.'}]);
    return xq(`Let ${m`f(x,y)=${tex(f)}`}. Compute ${m`f_{${yx?'yx':'xy'}}(${x0},${y0})`}.`,opts,{kind:'expr',lv:2,how:'f_x = 2x/u with u the inside; differentiate that in y (quotient/chain rule). Mixed partials are equal.',
      sol:[['First partial.',X`f_x=\frac{2x}{${tex(sumS(['x^2',mono(a,{y:n}),String(c)]))}}`],['Differentiate in y.',X`f_{xy}=\frac{-2x\cdot${a*n===1?'':a*n}y^{${n-1}}}{(\cdots)^2}=\frac{${num}}{${Q0*Q0}}=${tex(key)}`]],chk:{op:'pdx',e:{f},n:{v:['x','y'],P:[String(x0),String(y0)]}}});
  }
  const T=pick(['sin','cos']), q=pick([1,2]), x0=pick(['pi','pi/2']);
  const val={sin:{pi:[0,-1,0],'pi/2':[1,0,-1]},cos:{pi:[-1,0,1],'pi/2':[0,-1,0]}}[T][x0];   /* T, T′, T″ at x0 */
  const xc=x0==='pi'?[1,1]:[1,2];
  const f=`x*${T}(x*y${q===1?'':'^'+q})`;
  /* f_xy at (x0, 1) = 2q·x0·T′ + q·x0²·T″ */
  const A1=Rmul([2*q*val[1],1],xc), A2=Rmul([q*val[2],1],Rmul(xc,xc));
  const S=(r1,r2)=>sumS([cS(r1,'pi'),cS(r2,'pi^2')]);
  const key=S(A1,A2);
  const opts=xm({a:key},[{a:S(Rmul(A1,[1,2]),A2),why:'The product rule gives the x·(…) term twice: once from f_x and once more from differentiating in y.'},{a:S(Rneg(A1),Rneg(A2)),why:'Sign slip in the derivative of '+T+'.'},{a:S(A1,[0,1]),why:'Missed the term from differentiating the inner x·y'+(q>1?'^'+q:'')+' a second time.'},
    {a:sumS([String(val[0]),cS(Rmul(xc,[val[1],1]),'pi')]),why:'That is f_x at the point, not f_xy.'},{a:S(A2,A1),why:'Coefficients mixed up.'},{a:'0',why:'Not every term vanishes: evaluate cos and sin at the point carefully.'}]);
  return xq(`Let ${m`f(x,y)=${tex(f)}`}. Compute ${m`f_{xy}(${tex(x0)},1)`}.`,opts,{kind:'expr',lv:2,how:`f_x = ${T}(u) + x·y${q>1?'^'+q:''}·${T}′(u) with u = xy${q>1?'^'+q:''}; differentiate again in y.`,
    sol:[['First partial (product + chain rule).',X`f_x=${'\\'+T}(xy${q>1?'^'+q:''})+xy${q>1?'^'+q:''}\,(${'\\'+T})'(xy${q>1?'^'+q:''})`],['Differentiate in y and substitute.',X`f_{xy}(${tex(x0)},1)=${tex(key)}`]],chk:{op:'pdx',e:{f},n:{v:['x','y'],P:[x0,'1']}}});
});

/* ★ third-order partials with Clairaut — F2022-Q7, S2024-Q4, S2019-Q8 */
addX('x-pd-clairaut','PD',3,['F2022-Q7','S2024-Q4','S2019-Q8'],()=>{
  const d=ri(2,9), e=ri(2,7);
  const bank=[`e^(x*y^2)`,`sin(x^3 + y^3)`,`ln(y^${e})`,`tan(${d}*x^3)`,`sin(z*y)`,`e^(y^2*z^3)`,`sec(${d}*y^2)`,`ln(${d}*z^${e})`,`cos(x*z^2)`,`e^(x + z^2)`,`sqrt(1 + y^2*z^2)`,`x^${e}*z^2`];
  const terms=shuf(bank).slice(0,4);
  const full=coin(0.35);
  let P=[ri(0,2),ri(1,3),ri(1,7)], key='0', extra=null;
  if(full){ const c=nz(-3,3), a=ri(1,2), b=ri(1,2), dd=ri(1,2); extra=mono(c,{x:a,y:b,z:dd}); terms.splice(ri(0,4),0,extra);
    P=[nz(-2,2),nz(-2,2),nz(-2,2)]; key=String(c*a*b*dd*P[0]**(a-1)*P[1]**(b-1)*P[2]**(dd-1)); }
  const f=sumS(terms), ord=pick(['xyz','yxz','zyx','xzy']);
  const nums=shuf([1,-1,2,3,6,7,9,-2,4,12].map(String).filter(s=>s!==key));
  const dis=full?[{a:'0',why:`The term \\(${tex(extra)}\\) contains x, y and z, so it survives all three derivatives.`},{a:String(-(+key)),why:'Sign slip.'},{a:String(+key*2),why:'Arithmetic slip with an exponent.'},{a:String(+key+1),why:'Arithmetic slip.'},{a:nums[0],why:'Only the term with all three variables contributes; recompute it.'}]
    :nums.slice(0,5).map(v=>({a:v,why:'Every term is missing at least one of x, y, z. By Clairaut, differentiate first with respect to a variable the term lacks: each term contributes 0.'}));
  const opts=xm({a:key},dis);
  const Pd=P.map(String);
  return xq(`Let ${m`f(x,y,z)=${tex(f)}`}. Compute ${m`f_{${ord}}(${Pd.join(',')})`}.`,opts,{kind:'expr',lv:2,how:'Mixed partials can be taken in any order (Clairaut). A term missing a variable dies when differentiated in that variable.',
    sol:[['Differentiate each term first in a variable it does not contain.',full?X`${tex(extra)}\text{ is the only surviving term}`:X`\text{every term}\to0`],['',X`f_{${ord}}=${key}`]],chk:{op:'pdx',e:{f},n:{v:ord.split(''),P:Pd}}});
});

/* f_x of x^y + y^x — S2025-Q6 */
addX('x-pd-power','PD',1,['S2025-Q6'],()=>{
  const a=pick([2,3]), b=pick([2,3,4].filter(v=>v!==a)), wrt=pick(['x','y']);
  let key,dis;
  if(wrt==='x'){ key=`${b*a**(b-1)} + ${b**a}*ln(${b})`;
    dis=[{a:String(b*a**(b-1)+a*b**(a-1)),why:'yˣ is an exponential in x: its x-derivative is yˣ ln y, not x·y^{x−1}.'},{a:`${a**b}*ln(${a}) + ${b**a}*ln(${b})`,why:'x^y is a power in x: its x-derivative is y·x^{y−1}.'},{a:String(b*a**(b-1)),why:'Forgot the yˣ term.'},{a:`${b*a**(b-1)} + ${b**a}`,why:'d/dx yˣ = yˣ ln y: the ln is missing.'},{a:`${b*a**(b-1)} + ${b**a}*ln(${a})`,why:'The log is ln y = ln '+b+'.'}]; }
  else { key=`${a**b}*ln(${a}) + ${a*b**(a-1)}`;
    dis=[{a:String(b*a**(b-1)+a*b**(a-1)),why:'x^y is an exponential in y: its y-derivative is x^y ln x.'},{a:`${a**b}*ln(${a}) + ${b**a}*ln(${b})`,why:'yˣ is a power in y: its y-derivative is x·y^{x−1}.'},{a:String(a*b**(a-1)),why:'Forgot the x^y term.'},{a:`${a**b} + ${a*b**(a-1)}`,why:'d/dy x^y = x^y ln x: the ln is missing.'},{a:`${a**b}*ln(${b}) + ${a*b**(a-1)}`,why:'The log is ln x = ln '+a+'.'}]; }
  const opts=xm({a:key},dis);
  return xq(`Let ${m`f(x,y)=x^y+y^x`} for ${m`x>0,\ y>0`}. Compute ${m`f_${wrt}(${a},${b})`}.`,opts,{kind:'expr',lv:2,how:'In each term decide: is the variable in the base (power rule) or in the exponent (exponential rule)?',
    sol:[['Partial.',wrt==='x'?X`f_x=yx^{y-1}+y^x\ln y`:X`f_y=x^y\ln x+xy^{x-1}`],['Evaluate.',tex(key)]],chk:{op:'pdx',e:{f:'x^y + y^x'},n:{v:[wrt],P:[String(a),String(b)]}}});
});

/* second partials in symbols, ln trick, slope of a trace — S2023-Q10, S2017-Q9, S2017-Q11 */
addX('x-pd-second','PD',2,['S2023-Q10','S2017-Q9','S2017-Q11'],()=>{
  const fam=pick(['A','B','C']);
  if(fam==='A'){ const a=pick([1,2,3]), n=pick([2,3]), c=ri(1,9);
    const E=`e^(${mono(a,{x:2})})`, f=sumS([mono(1,{x:1,y:n}),`y*${E}`,String(c)]);
    const key=`${2*a}*y*${E}*(1 + ${mono(2*a,{x:2})})`;
    const opts=xm({a:key},[{a:`${2*a}*y*${E}`,why:'Product rule: 2axy·e^{ax²} differentiates to more than one term.'},{a:`${2*a}*x*y*${E}`,why:'That is f_x, not f_xx.'},{a:`${2*a}*y*${E}*(1 + ${mono(a,{x:2})})`,why:`Chain rule: d/dx e^{ax²} = 2ax·e^{ax²}, giving 2a·x² ·2a… recheck the factor.`},{a:sumS([`${2*a}*x*${E}`,mono(1,{y:n})]),why:'That is f_y-like; differentiate twice in x.'},{a:`${4*a*a}*x^2*y*${E}`,why:'Missed the product-rule term 2a·y·e^{ax²}.'}],{kind:'expr',vars:['x','y']});
    return xq(`Let ${m`f(x,y)=${tex(f)}`}. Find ${m`f_{xx}`}.`,opts,{kind:'expr',vars:['x','y'],lv:2,how:'f_x = y^n + 2axy e^{ax²}; differentiate again with the product rule.',
      sol:[['',X`f_x=y^{${n}}+${2*a}xy\,${tex(E)}`],['',X`f_{xx}=${tex(key)}`]],chk:{op:'pdx',e:{f},n:{v:['x','x']}}});
  }
  if(fam==='B'){ const c=pick([1,2,3,4]), p=pick([1,2]);
    const u=`${mono(1,{x:p,y:2})} + ${mono(c,{x:p})}`, f=`ln(${u})`;
    const opts=xm({a:'0'},[{a:`(-y^2 - ${c})/(${u})^2`,why:`ln(xᵖ(y² + ${c})) = p ln x + ln(y² + ${c}): the mixed partial is 0.`},{a:`-2*y/(${u})^2`,why:'Split the log first: nothing depends on both x and y.'},{a:`-2*x*y/(${u})^2`,why:'Split the log first.'},{a:`2*y/(${u})`,why:'That is (almost) f_y.'},{a:`${p}/x`,why:'That is f_x.'}],{kind:'expr',vars:['x','y']});
    return xq(`Let ${m`f(x,y)=${tex(f)}`}. Find ${m`f_{xy}`}.`,opts,{kind:'expr',vars:['x','y'],lv:2,how:'Factor inside the log and split: ln(xᵖ(y² + c)) = p ln x + ln(y² + c).',
      sol:[['Split the log.',X`f=${p===1?'':p}\ln x+\ln(y^2+${c})`],['No term depends on both variables.',X`f_{xy}=0`]],chk:{op:'pdx',e:{f},n:{v:['x','y']}}});
  }
  const cs=[ri(-3,3),ri(-3,3),nz(-3,3),nz(-2,2)], x0=ri(-2,2), y0=nz(-2,2);
  const poly=polyS(cs,'y'), d=polyE(polyD(cs),y0);
  const opts=xm({a:String(d)},[{a:String(polyE(cs,y0)),why:'That is g(x₀, y₀), the height, not the slope.'},{a:String(polyE(polyD(polyD(cs)),y0)),why:'That is the second derivative.'},{h:'It cannot be determined without a formula for g',why:`Along x = ${x0}, g(${x0}, y) = ${poly.replace(/\*/g,'')}, so g_y is its y-derivative.`},{a:String(d+cs[1]),why:'Arithmetic slip differentiating.'},{a:String(-d),why:'Sign slip.'}]);
  return xq(`The graph of ${m`z=g(x,y)`} meets the plane ${m`x=${x0}`} along the curve ${m`z=${tex(poly)}`}. Find ${m`g_y(${x0},${y0})`}.`,opts,{kind:'expr',lv:1,how:'On x = x₀ the curve is z = g(x₀, y); its slope in y is g_y(x₀, y).',
    sol:[['',X`g_y(${x0},y)=\frac{d}{dy}\left(${tex(poly)}\right)`],['At y = '+y0+'.',String(d)]],chk:{op:'polyslope',e:{p:poly.replace(/y/g,'x')},n:{y0}}});
});

/* =============================== 15.4 CHAIN =============================== */
/* ★ chain rule from given values — S2025-Q11, S2022-Q12, S2018-Q9 */
addX('x-chain-values','CHAIN',3,['S2025-Q11','S2022-Q12','S2018-Q9'],()=>{
  const fam=pick(['pow','gamma','explicit']);
  if(fam==='pow'){ const g=rv(3,-4,5,true), p=[pick([1,2,3]),pick([2,3,4]),pick([3,4,5])], key=dotA(g,p);
    const opts=xm(xnum(key),[{a:String(g[0]+g[1]+g[2]),why:'Chain rule: each partial is multiplied by dx/dt, dy/dt, dz/dt.'},{a:String(dotA(g,p.map(k=>k-1))),why:'d/dt tⁿ = n·tⁿ⁻¹, which is n at t = 1.'},{a:String(dotA(g,[1,1,1])*dotA(p,[1,1,1])),why:'The chain rule is a dot product, not a product of sums.'},{a:String(key+g[0]),why:'Arithmetic slip.'},{a:String(-key),why:'Sign slip.'}]);
    return xq(`Suppose ${m`f(x,y,z)`} is differentiable with ${m`f_x(1,1,1)=${g[0]}`}, ${m`f_y(1,1,1)=${g[1]}`}, ${m`f_z(1,1,1)=${g[2]}`}. If ${m`x=t^{${p[0]}},\ y=t^{${p[1]}},\ z=t^{${p[2]}}`}, find ${m`\frac{df}{dt}`} at ${m`t=1`}.`.replace('t^{1}','t'),opts,{kind:'expr',lv:1,
      how:'df/dt = f_x x′ + f_y y′ + f_z z′ evaluated at t = 1 (where (x, y, z) = (1, 1, 1)).',sol:[['Derivatives at t = 1.',X`x'=${p[0]},\ y'=${p[1]},\ z'=${p[2]}`],['',X`\frac{df}{dt}=${g[0]}\cdot${p[0]}+${fmtC(g[1])}\cdot${p[1]}+${fmtC(g[2])}\cdot${p[2]}=${key}`]],chk:{op:'chainv',n:{g,d:p}}});
  }
  if(fam==='gamma'){ const g=rv(3,-6,3,true), v=rv(3,-3,3,true), P=rv(3,-2,2), key=dotA(g,v);
    const opts=xm(xnum(key),[{a:String(g[0]+g[1]+g[2]),why:'Multiply each partial by the matching component of γ′(0).'},{a:String(dotA(g,P)),why:'Dot ∇f with γ′(0), not with γ(0).'},{a:String(-key),why:'Sign slip.'},{a:String(key+2*g[1]),why:'Arithmetic slip.'},{a:String(dotA(v,[1,1,1])),why:'The partials of f matter too.'}]);
    return xq(`${m`f`} is differentiable at ${mp(P)} with ${m`f_x=${g[0]},\ f_y=${g[1]},\ f_z=${g[2]}`} there. A curve ${m`\gamma(t)`} has ${m`\gamma(0)=${ptx(P)}`} and ${m`\gamma'(0)=${tex(sumS([mono(v[0],{i:1}),mono(v[1],{j:1}),mono(v[2],{k:1})]))}`}. Find ${m`\frac{d}{dt}f(\gamma(t))`} at ${m`t=0`}.`,opts,{kind:'expr',lv:1,
      how:'d/dt f(γ(t)) = ∇f(γ(0)) · γ′(0).',sol:[['',X`${vt(g)}\cdot${vt(v)}=${key}`]],chk:{op:'chainv',n:{g,d:v}}});
  }
  const F=pick([{f:'e^x*(y + z)',n:3},{f:'x*e^y + z^2',n:3},{f:'e^(x*y) + z',n:3},{f:'x^2*y - z',n:3}]);
  const P=[0,ri(-2,3),ri(-2,3)], D=[nz(-3,3),nz(-3,4),ri(-2,5)], env={x:P[0],y:P[1],z:P[2]};
  const g=['x','y','z'].map(v=>intOf(nD(F.f,env,v))); if(g.some(v=>v===null)) return null;
  const key=dotA(g,D);
  const opts=xm(xnum(key),[{a:String(g[0]+g[1]+g[2]),why:'Multiply each partial by dx/dt, dy/dt, dz/dt.'},{a:String(dotA(g,P)),why:'Use the derivatives dx/dt, … not the values x, y, z.'},{a:String(D[0]+D[1]+D[2]),why:'The partials of f are needed too.'},{a:String(key+g[0]),why:'Arithmetic slip.'},{a:String(-key),why:'Sign slip.'}]);
  return xq(`Let ${m`f(x,y,z)=${tex(F.f)}`}, where ${m`x,y,z`} are functions of ${m`s,t`}. At ${m`s=0,\ t=0`}: ${m`x=${P[0]},\ \tfrac{\partial x}{\partial t}=${D[0]},\ y=${P[1]},\ \tfrac{\partial y}{\partial t}=${D[1]},\ z=${P[2]},\ \tfrac{\partial z}{\partial t}=${D[2]}`}. Find ${m`\frac{\partial f}{\partial t}`} at ${m`s=t=0`}.`,opts,{kind:'expr',lv:2,
    how:'∂f/∂t = f_x x_t + f_y y_t + f_z z_t, with the partials of f evaluated at (x, y, z).',sol:[['Partials of f at the point.',X`\nabla f=${vt(g)}`],['',X`\frac{\partial f}{\partial t}=${key}`]],chk:{op:'chainv',e:{f:F.f},n:{P,d:D}}});
});

/* ★ table chain rule: evaluate the inner point first — F2018-Q10, F2017-Q6, F2015-Q8 */
addX('x-chain-table','CHAIN',3,['F2018-Q10','F2017-Q6','F2015-Q8'],()=>{
  const XB=['s*t^2','s^2 - t','s + 2*t','s*t + 1','e^s - t*e^t','t*sin(pi*s/2)','e^(s*t) - 1','t - s^2','2*s - t^2','(s + 2*t)^3 + 1'];
  for(let tries=0;tries<40;tries++){
    const xs=pick(XB), ys=pick(XB.filter(v=>v!==xs)), s0=ri(-1,2), t0=ri(-1,2), env={s:s0,t:t0};
    let x0,y0,xS,xT,yS,yT; try{ x0=intOf(ev(xs,env)); y0=intOf(ev(ys,env)); xS=intOf(nD(xs,env,'s')); xT=intOf(nD(xs,env,'t')); yS=intOf(nD(ys,env,'s')); yT=intOf(nD(ys,env,'t')); }catch(e){ continue; }
    if([x0,y0,xS,xT,yS,yT].some(v=>v===null)) continue;
    if(Math.abs(x0)>6||Math.abs(y0)>6||(x0===s0&&y0===t0)) continue;
    const wrt=pick(['s','t']), dx=wrt==='s'?xS:xT, dy=wrt==='s'?yS:yT; if(!dx&&!dy) continue;
    const inner=[nz(-5,7),nz(-5,7)], outer=[nz(-5,9),nz(-5,9)];
    const key=inner[0]*dx+inner[1]*dy, trap=outer[0]*dx+outer[1]*dy; if(key===trap) continue;
    const odx=wrt==='s'?xT:xS, ody=wrt==='s'?yT:yS;
    const rows=shuf([[s0,t0,outer],[x0,y0,inner]]);
    const tbl=`<table class="xtab"><tr><th>\\((x,y)\\)</th><th>\\(f_x\\)</th><th>\\(f_y\\)</th></tr>${rows.map(r=>`<tr><td>\\((${r[0]},${r[1]})\\)</td><td>\\(${r[2][0]}\\)</td><td>\\(${r[2][1]}\\)</td></tr>`).join('')}</table>`;
    const opts=xm(xnum(key),[{a:String(trap),why:`Evaluate f_x, f_y at the inner point (x, y) = (${x0}, ${y0}), not at (s, t) = (${s0}, ${t0}).`},{a:String(inner[0]*odx+inner[1]*ody),why:`That uses ∂/∂${wrt==='s'?'t':'s'} of the inner functions.`},{a:String(inner[0]*dx),why:'The f_y term is missing.'},{a:String(inner[0]*dy+inner[1]*dx),why:'Paired f_x with ∂y and f_y with ∂x.'},{a:String(-key),why:'Sign slip.'},{a:String(inner[0]+inner[1]),why:'Multiply by the inner partial derivatives.'}]);
    if(!opts) continue;
    return xq(`Let ${m`g(s,t)=f\big(x(s,t),\,y(s,t)\big)`} with ${m`x=${tex(xs)}`} and ${m`y=${tex(ys)}`}, where ${m`f`} is differentiable. Use the table to find ${m`g_${wrt}(${s0},${t0})`}.${tbl}`,opts,{kind:'expr',lv:3,
      how:'First compute the inner point (x, y) at (s, t); read f_x, f_y from THAT row. Then g_s = f_x x_s + f_y y_s.',
      sol:[['Inner point.',X`(x,y)=(${x0},${y0})`],['Inner partials.',X`x_${wrt}=${dx},\qquad y_${wrt}=${dy}`],['',X`g_${wrt}=${inner[0]}\cdot${fmtC(dx)}+${fmtC(inner[1])}\cdot${fmtC(dy)}=${key}`]],
      chk:{op:'chaintab',e:{x:xs,y:ys},n:{s0,t0,wrt,rows:rows.map(r=>[r[0],r[1],r[2][0],r[2][1]])}}});
  }
  return null;
});

/* composite chain rules — S2023-Q12, S2020-Q8. The polar-coordinate version (F2023-Q5) was removed at the student's request:
   polar coordinates were not taught in this section, so no question needs them. */
addX('x-chain-polar','CHAIN',2,['S2023-Q12','S2020-Q8'],()=>{
  const a=nz(-2,2), b=nz(-2,2), c=nz(-2,2);
  const u=sumS([mono(a,{p:2}),mono(b,{q:2}),mono(c,{r:1})]);
  const IN=pick([['x*y','y^2','x*z'],['x + y','y*z','x^2'],['x*z','y - x','y*z']]);
  const P=[nz(-2,2),nz(-2,2),nz(-2,3)], env={x:P[0],y:P[1],z:P[2]};
  const comp=u.replace(/p/g,`(${IN[0]})`).replace(/q/g,`(${IN[1]})`).replace(/\br\b/g,`(${IN[2]})`);
  const wrt=pick(['x','y','z']), key=intOf(nD(comp,env,wrt)); if(key===null) return null;
  const pv=ev(IN[0],env), qv=ev(IN[1],env), pd=[IN[0],IN[1],IN[2]].map(s=>intOf(nD(s,env,wrt)));
  const opts=xm(xnum(key),[{a:String(2*a*pd[0]+2*b*pd[1]+c*pd[2]),why:'∂u/∂p = 2ap: the factor p (its value at the point) is missing.'},{a:String(2*a*pv+2*b*qv+c),why:`Multiply each ∂u/∂(·) by the inner derivative with respect to ${wrt}.`},{a:String(-key),why:'Sign slip.'},{a:String(key+2),why:'Arithmetic slip.'},{a:String(key-c*pd[2]+c),why:`∂r/∂${wrt} was replaced by 1.`}]);
  return xq(`Let ${m`u(p,q,r)=${tex(u)}`} where ${m`p=${tex(IN[0])},\ q=${tex(IN[1])},\ r=${tex(IN[2])}`}. Find ${m`\frac{\partial u}{\partial ${wrt}}`} at ${m`x=${P[0]},\ y=${P[1]},\ z=${P[2]}`}.`,opts,{kind:'expr',lv:2,
    how:`∂u/∂${wrt} = u_p p_${wrt} + u_q q_${wrt} + u_r r_${wrt}, all at the point.`,sol:[['Inner values.',X`p=${pv},\ q=${qv}`],['',X`\frac{\partial u}{\partial ${wrt}}=${key}`]],chk:{op:'pdx',e:{f:comp},n:{v:[wrt],P:P.map(String)}}});
});

/* =============================== 15.4 IMPL =============================== */
/* ★ ∂z/∂x = −F_x/F_z — F2024-Q6, S2024-Q7, S2018-Q12, F2017-Q10, S2017-Q12 */
addX('x-impl-z','IMPL',4,['F2024-Q6','S2024-Q7','S2018-Q12','F2017-Q10','S2017-Q12'],()=>{
  const fam=pick(['poly','poly','trig','tan','cosexp']);
  const w=pick(['x','y']);
  let LHS,RHS,P,Pd,key,dis,steps;
  const Fs=()=>`${LHS} - (${RHS})`;
  if(fam==='poly'){
    const P0=[ri(-1,2),ri(-1,2),nz(-1,2)], env={x:P0[0],y:P0[1],z:P0[2]};
    const t1=mono(nz(-2,2),{x:ri(0,2),y:ri(0,2),z:ri(1,3)}), t2=mono(nz(-3,3),{x:ri(0,2),y:ri(0,1),z:ri(0,2)});
    const r1=mono(nz(-2,2),{x:ri(0,2),y:ri(0,1)}), r2=mono(ri(-2,2),{[w]:1});
    LHS=sumS([t1,t2]); const rv0=sumS([r1,r2]); const C=Math.round(ev(LHS,env)-ev(rv0,env)); RHS=sumS([rv0,String(C)]);
    const F=Fs(), Fw=intOf(nD(F,env,w)), Fz=intOf(nD(F,env,'z')), Fo=intOf(nD(F,env,w==='x'?'y':'x')), Lw=intOf(nD(LHS,env,w)), Lz=intOf(nD(LHS,env,'z'));
    if(!Fz||Fw===null||Fo===null||!Fw||Math.abs(Fw)>30||Math.abs(Fz)>30) return null;
    P=P0; Pd=P0.map(String); key=frac(-Fw,Fz);
    dis=[{a:frac(Fw,Fz),why:'∂z/∂'+w+' = −F_'+w+'/F_z: the minus sign is missing.'},{a:frac(-Fz,Fw),why:'Upside down: F_'+w+' goes on top.'},{a:frac(-Fo,Fz),why:'That is ∂z/∂'+(w==='x'?'y':'x')+'.'},Lz?{a:frac(-Lw,Lz),why:'Move everything to one side first: F = left side − right side.'}:null,{a:frac(-Fw,Fz+1),why:'Arithmetic slip in F_z.'}].filter(Boolean);
    steps=[['Write F = 0.',X`F=${tex(F)}`],['Partials at the point.',X`F_${w}=${Fw},\qquad F_z=${Fz}`],['',X`\frac{\partial z}{\partial ${w}}=-\frac{F_${w}}{F_z}=${tex(key)}`]];
  } else if(fam==='trig'){
    const a=nz(-3,3), b=nz(-3,3), c=nz(-3,3), pt=pick([[1,1,'pi/2',0],[1,1,'pi',-1],[2,1,'pi/2',-1],[1,2,'pi/2',-1]]);   /* x, y, z, cos(xyz) */
    const zv=pt[2]==='pi'?Math.PI:Math.PI/2, env={x:pt[0],y:pt[1],z:zv};
    LHS=sumS([mono(a,{x:1}),mono(b,{y:1}),mono(c,{z:1}),'sin(x*y*z)']); RHS=sumS([String(a*pt[0]+b*pt[1]+(pt[3]===0?1:0)),cS([c,pt[2]==='pi'?1:2],'pi')]);
    P=[pt[0],pt[1],zv]; Pd=[String(pt[0]),String(pt[1]),pt[2]]; const cz=pt[3];
    /* F_x = a + yz cos, F_y = b + xz cos, F_z = c + xy cos */
    const zR=pt[2]==='pi'?[1,1]:[1,2];
    const Fw=w==='x'?sumS([String(a),cS(Rmul([pt[1]*cz,1],zR),'pi')]):sumS([String(b),cS(Rmul([pt[0]*cz,1],zR),'pi')]);
    const Fz=String(c+pt[0]*pt[1]*cz); if(Fz==='0') return null;
    key=`-(${Fw})/(${Fz})`;
    dis=[{a:`(${Fw})/(${Fz})`,why:'The minus sign is missing.'},{a:`-(${Fz})/(${Fw})`,why:'Upside down.'},{a:`-(${w==='x'?a:b})/(${Fz})`,why:'The sin(xyz) term contributes to F_'+w+' too (chain rule).'},{a:`-(${Fw})/(${c})`,why:'The sin(xyz) term contributes to F_z too.'},{a:`-(${w==='x'?b:a})/(${c})`,why:'Wrong variable.'}];
    steps=[['',X`F_${w}=${tex(Fw)},\qquad F_z=${Fz}`],['',X`\frac{\partial z}{\partial ${w}}=${tex(key)}`]];
  } else if(fam==='tan'){
    const yv=nz(-2,2), zs=pick([1,-1]), pt=[1,yv,zs], env={x:1,y:yv,z:zs};
    LHS='tan(pi*x*y*z)'; RHS='x^2 - z^2'; P=pt; Pd=pt.map(String);
    /* F = tan(πxyz) − x² + z²; sec² = 1 at the point */
    const Fw=w==='x'?sumS([cS([yv*zs,1],'pi'),'-2']):cS([zs,1],'pi'), Fz=sumS([cS([yv,1],'pi'),String(2*zs)]);
    key=`-(${Fw})/(${Fz})`;
    dis=[{a:`(${Fw})/(${Fz})`,why:'The minus sign is missing.'},{a:`-(${Fz})/(${Fw})`,why:'Upside down.'},{a:`-(${Fw})/(${cS([yv,1],'pi')})`,why:'Move x² − z² to the left: it contributes +2z to F_z.'},{a:`-(${w==='x'?cS([yv*zs,1],'pi'):cS([zs,1],'pi')})/(${Fz})`,why:w==='x'?'Moving x² to the left contributes −2x to F_x.':'Recheck F_y.'},{a:`(${Fz})/(${Fw})`,why:'Upside down and sign.'}];
    steps=[['F = tan(πxyz) − x² + z²; sec²(πxyz) = 1 at the point.',X`F_${w}=${tex(Fw)},\qquad F_z=${tex(Fz)}`],['',X`\frac{\partial z}{\partial ${w}}=${tex(key)}`]];
  } else {
    const a=pick([2,3,4]), b=pick([1,2,3]), pt=pick([[1,'pi/2',1],[3,'pi/2',-1],[1,'3*pi/2',-1],[2,'pi/4',1]]);   /* x, y, sin(xy) */
    const yv={'pi/2':Math.PI/2,'3*pi/2':3*Math.PI/2,'pi/4':Math.PI/4}[pt[1]], sg=pt[2];
    LHS=`${a}*cos(x*y)`; RHS=`e^(${mono(b,{z:1})}) - 1`; P=[pt[0],yv,0]; Pd=[String(pt[0]),pt[1],'0'];
    /* F = a cos(xy) − e^{bz} + 1: F_x = −a y sin, F_y = −a x sin, F_z = −b */
    const yR={'pi/2':[1,2],'3*pi/2':[3,2],'pi/4':[1,4]}[pt[1]];
    key=w==='x'?cS(Rmul([-a*sg,b],yR),'pi'):frac(-a*pt[0]*sg,b);
    const alt=w==='x'?cS(Rmul([a*sg,b],yR),'pi'):frac(a*pt[0]*sg,b);
    dis=[{a:alt,why:'Sign slip: F_z = −'+b+'e^{'+b+'z} is negative.'},{a:w==='x'?cS(Rmul([-a*sg*b,1],yR),'pi'):String(-a*pt[0]*sg*b),why:'Divide by F_z; don’t multiply.'},{a:w==='x'?frac(-a*pt[0]*sg,b):cS(Rmul([-a*sg,b],yR),'pi'),why:'That is the other partial.'},{a:'0',why:'sin(xy) ≠ 0 at this point.'},{a:w==='x'?cS(Rmul([-sg,b],yR),'pi'):frac(-pt[0]*sg,b),why:'The factor '+a+' is missing.'}];
    steps=[['F = '+a+'cos(xy) − e^{'+b+'z} + 1.',X`F_${w}=-${a}${w==='x'?'y':'x'}\sin(xy),\qquad F_z=-${b}e^{${b}z}`],['At the point.',X`\frac{\partial z}{\partial ${w}}=${tex(key)}`]];
  }
  const opts=xm({a:key},dis);
  return xq(`Suppose ${m`z`} is defined implicitly as a function of ${m`x,y`} by ${m`${tex(LHS)}=${tex(RHS)}`}. Find ${m`\frac{\partial z}{\partial ${w}}`} at ${m`(x,y,z)=(${Pd.map(s=>tex(s)).join(',')})`}.`,opts,{kind:'expr',lv:2,
    how:`Move everything to one side, F(x, y, z) = 0; then ∂z/∂${w} = −F_${w}/F_z.`,sol:steps,chk:{op:'implicit3',e:{F:Fs()},n:{w:'z'===w?'z':w,P:Pd}}});
});

/* dy/dx on a curve — F2022-Q9 */
addX('x-impl-2d','IMPL',1,['F2022-Q9'],()=>{
  let F,LHS,RHS,P;
  if(coin()){ const n=pick([2,3]), sx=pick([1,-1]), sy=pick([1,-1]), c=2**n; LHS=`(x^2 + y^2)^${n}`; RHS=`${c}*x^2*y^2`; P=[sx,sy]; }
  else { for(let k=0;k<30;k++){ const x0=nz(-2,2), y0=nz(-2,2), t=[mono(nz(-2,2),{x:ri(1,3)}),mono(nz(-2,2),{x:ri(0,2),y:ri(1,2)}),mono(nz(-2,2),{y:ri(1,3)})];
      const s0=sumS(t), C=ev(s0,{x:x0,y:y0}); LHS=s0; RHS=String(C); P=[x0,y0];
      const Fy=intOf(nD(s0,{x:x0,y:y0},'y')); if(Fy) break; P=null; } if(!P) return null; }
  F=`${LHS} - (${RHS})`; const env={x:P[0],y:P[1]}, Fx=intOf(nD(F,env,'x')), Fy=intOf(nD(F,env,'y'));
  if(Fx===null||!Fy) return null;
  const key=frac(-Fx,Fy);
  const opts=xm({a:key},[{a:frac(Fx,Fy),why:'dy/dx = −F_x/F_y: sign missing.'},{a:Fx?frac(-Fy,Fx):'1/2',why:'Upside down.'},{a:'DNE',why:'F_y ≠ 0 at this point, so the curve has a tangent with a finite slope.'},{a:'0',why:'F_x ≠ 0 here.'.replace('≠',Fx?'≠':'=')},{a:frac(-Fx,Fy*2),why:'Arithmetic slip.'},{a:frac(-Fx+Fy,Fy),why:'Slip with the chain-rule factor y′.'}]);
  return xq(`The curve ${m`${tex(LHS)}=${tex(RHS)}`} passes through ${mp(P)}. Find ${m`y'`} there.`,opts,{kind:'expr',lv:2,how:'F(x, y) = left − right; y′ = −F_x/F_y.',
    sol:[['Partials at the point.',X`F_x=${Fx},\qquad F_y=${Fy}`],['',X`y'=-\frac{F_x}{F_y}=${tex(key)}`]],chk:{op:'implicit',e:{F},n:{P}}});
});

/* =============================== 15.5 DD =============================== */
/* gradient banks with exact values: g rational [p,q][], fac = common factor ('1','e','1/e','e^2') */
function ddBank(three){
  const fac=k=>k===0?'1':k===1?'e':k===-1?'1/e':`e^(${k})`;
  const B=three?[
    ()=>{ const P=[ri(-2,2),ri(-2,2),ri(-2,2)], env={x:P[0],y:P[1],z:P[2]}; const f=sumS([mono(nz(-3,3),{x:ri(1,2),y:ri(1,2)}),mono(nz(-3,3),{y:ri(0,2),z:ri(1,2)}),mono(nz(-3,3),{x:1,z:ri(1,2)})]);
      const g=['x','y','z'].map(v=>intOf(nD(f,env,v))); if(g.some(v=>v===null)||!n2(g)||Math.max(...g.map(Math.abs))>20) return null; return {f,P,Pd:P.map(String),g:g.map(v=>[v,1]),fac:'1'}; },
    ()=>{ const A=pick([1,2]), x0=nz(-2,2), yz=pick([[1,-1],[1,0],[0,1],[1,1],[-1,1],[2,0]]), k=yz[0]*yz[1];
      return {f:`${A===1?'':A+'*'}x*e^(y*z)`,P:[x0,...yz],Pd:[x0,...yz].map(String),g:[A,A*x0*yz[1],A*x0*yz[0]].map(v=>[v,1]),fac:fac(k)}; },
    ()=>{ const y0=nz(-2,2), xz=pick([[3,2],[1,1],[2,1],[1,2],[0,1],[2,2]]), k=xz[0]-xz[1];
      return {f:'y^2*e^(x - z)',P:[xz[0],y0,xz[1]],Pd:[xz[0],y0,xz[1]].map(String),g:[y0*y0,2*y0,-y0*y0].map(v=>[v,1]),fac:fac(k)}; },
    ()=>{ const mm=pick([2,3,4]), b=nz(-3,3), c=nz(-3,3), zp=pick([['0',0,1],['pi/2',1,0],['pi',0,-1],['3*pi/2',-1,0]]), P=[nz(-2,2),nz(-2,2)];
      const tr=pick(['cos','sin']), d=ri(1,5), dz=tr==='cos'?-c*zp[1]:c*zp[2];
      return {f:sumS([mono(1,{x:mm}),mono(b,{y:2}),`${c}*${tr}(z)`.replace(/^1\*/,'').replace(/^-1\*/,'-'),String(d)]),P:[...P,null],Pd:[...P.map(String),zp[0]],g:[[mm*P[0]**(mm-1),1],[2*b*P[1],1],[dz,1]],fac:'1'}; },
    ()=>{ const P=[nz(-2,2),nz(-2,2)], D=2+P[0]*P[0]+P[1]*P[1];
      return {f:'ln(1 + x^2 + y^2 + e^z)',P:[...P,0],Pd:[...P.map(String),'0'],g:[Rr(2*P[0],D),Rr(2*P[1],D),Rr(1,D)],fac:'1'}; },
    ()=>{ const x0=nz(-3,3), c=nz(-3,3), z0=pick([1,-1]);
      return {f:`x*ln(abs(y)) + ${c}/z`,P:[x0,1,z0],Pd:[String(x0),'1',String(z0)],g:[[0,1],[x0,1],[-c,1]],fac:'1'}; }
  ]:[
    ()=>{ const P=[ri(-2,2),ri(-2,2)], env={x:P[0],y:P[1]}; const f=sumS([mono(nz(-3,3),{x:ri(1,3),y:ri(0,2)}),mono(nz(-3,3),{x:ri(0,1),y:ri(1,2)}),mono(ri(-3,3),{x:ri(1,3)})]);
      const g=['x','y'].map(v=>intOf(nD(f,env,v))); if(g.some(v=>v===null)||!n2(g)||Math.max(...g.map(Math.abs))>20) return null; return {f,P,Pd:P.map(String),g:g.map(v=>[v,1]),fac:'1'}; },
    ()=>{ const mm=pick([2,3]), b=nz(-3,3), x0=nz(-2,2); return {f:`x^${mm}*e^(${b}*y)`,P:[x0,0],Pd:[String(x0),'0'],g:[[mm*x0**(mm-1),1],[b*x0**mm,1]],fac:'1'}; },
    ()=>{ const R=pick([25,30,16,10]), P=[nz(-4,4),nz(-4,4)]; return {f:`${R} - x^2 - y^2`,P,Pd:P.map(String),g:[[-2*P[0],1],[-2*P[1],1]],fac:'1'}; }
  ];
  for(let i=0;i<20;i++){ const o=pick(B)(); if(o) return o; }
  return null;
}
const ddVec=o=>{ const L=lcmR(o.g); return reduceInt(o.g.map(r=>r[0]*L/r[1])); };
const facMul=(s,fac)=>fac==='1'?s:s==='0'?'0':fac==='1/e'?`(${s})/e`:`(${s})*${fac}`;
const gradS=o=>V(...o.g.map(r=>facMul(Rs(r),o.fac)));

/* ★ directional derivative (normalize!) — F2024-Q10, S2024-Q10, F2022-Q10, S2022-Q9, S2020-Q12, S2016-Q9, S2015-Q11, F2018-Q11, F2016-Q12 */
addX('x-dd-dir','DD',4,['F2024-Q10','S2024-Q10','F2022-Q10','S2022-Q9','S2020-Q12','S2016-Q9','F2018-Q11','F2016-Q12'],()=>{
  const three=coin(0.65), o=ddBank(three); if(!o) return null;
  const nv=three?3:2;
  const toward=o.fac==='1'&&o.P.every(v=>v!==null)&&coin(0.3);
  let v, Q=null;
  if(toward){ Q=rv(nv,-3,4); v=subA(Q,o.P); if(!n2(v)) return null; } else v=rv(nv,-3,3);
  const n=n2(v);
  const L=lcmR(o.g), gi=o.g.map(r=>r[0]*L/r[1]), dot=dotA(gi,v);            /* g·v = dot/L */
  if(dot===0) return null;
  const key=facMul(surd(dot,L*n,n),o.fac);
  const opts=xm({a:key},[{a:facMul(frac(dot,L),o.fac),why:'The direction must be a UNIT vector: divide by |v| = √'+n+'.'},{a:facMul(frac(dot,L*n),o.fac),why:'Divided by |v|² instead of |v|.'},{a:facMul(surd(1,L,n2(gi)),o.fac),why:'That is |∇f|, the maximum rate — not the rate in this direction.'},
    o.fac!=='1'?{a:surd(dot,L*n,n),why:'The factor '+o.fac+' from the exponential is missing.'}:{a:surd(-dot,L*n,n),why:'Sign slip.'},{a:facMul(surd(dot+L,L*n,n),o.fac),why:'Arithmetic slip in the dot product.'},toward?{a:facMul(surd(dotA(gi,Q),L*n2(Q),n2(Q)),o.fac),why:'The direction toward Q is Q − P, not Q itself.'}:null].filter(Boolean));
  const dirTxt=toward?`toward the point ${mp(Q)}`:`in the direction of ${m`${nv===3?tex(sumS([mono(v[0],{i:1}),mono(v[1],{j:1}),mono(v[2],{k:1})])):vt(v)}`}`;
  const vars=nv===3?'x,y,z':'x,y';
  return xq(`Find the directional derivative of ${m`f(${vars})=${tex(o.f)}`} at ${m`(${o.Pd.map(s=>tex(s)).join(',')})`} ${dirTxt}.`,opts,{kind:'expr',lv:2,
    how:'D_u f = ∇f(P) · v/|v|. Always normalize the direction.',
    sol:[['Gradient at the point.',X`\nabla f=${tex(gradS(o))}`],['Unit direction.',X`\mathbf u=\frac{${vt(v)}}{\sqrt{${n}}}`],['',X`D_{\mathbf u}f=${tex(key)}`]],
    chk:{op:'dd',e:{f:o.f},n:{P:o.Pd,v,ask:'dir'}}});
});

/* ★ maximum rate of change = |∇f| — S2025-Q5, S2023-Q11, F2015-Q9 */
addX('x-dd-max','DD',3,['S2025-Q5','S2023-Q11','F2015-Q9'],()=>{
  const o=ddBank(coin(0.6)); if(!o) return null;
  const L=lcmR(o.g), gi=o.g.map(r=>r[0]*L/r[1]), N=n2(gi);
  const key=facMul(surd(1,L,N),o.fac);
  const nv=o.g.length, vars=nv===3?'x,y,z':'x,y', wordy=coin(0.35);
  const opts=xm({a:key},[{a:facMul(frac(N,L*L),o.fac),why:'That is |∇f|²; take the square root.'},{a:facMul(frac(gi.reduce((s,v)=>s+v,0),L),o.fac),why:'The maximum rate is the LENGTH of ∇f, not the sum of its components.'},{h:m`${tex(gradS(o))}`,why:'That is the direction (∇f); the rate is its length |∇f|.'},
    {a:facMul(frac(gi.reduce((s,v)=>s+Math.abs(v),0),L),o.fac),why:'|∇f| = √(f_x² + f_y² + …), not |f_x| + |f_y| + ….'},o.fac!=='1'?{a:surd(1,L,N),why:'The exponential factor is missing.'}:{a:surd(1,L,N+1),why:'Arithmetic slip in a partial derivative.'}]);
  return xq(wordy?`Compute the directional derivative of ${m`f(${vars})=${tex(o.f)}`} at ${m`(${o.Pd.map(s=>tex(s)).join(',')})`} in the direction of greatest increase of ${m`f`}.`
                 :`What is the maximum rate of increase of ${m`f(${vars})=${tex(o.f)}`} at ${m`(${o.Pd.map(s=>tex(s)).join(',')})`} (over all directions)?`,opts,{kind:'expr',lv:1,
    how:'The greatest rate of increase is |∇f(P)|, attained in the direction of ∇f(P).',sol:[['Gradient.',X`\nabla f=${tex(gradS(o))}`],['Its length.',X`|\nabla f|=${tex(key)}`]],chk:{op:'dd',e:{f:o.f},n:{P:o.Pd,ask:'max'}}});
});

/* steepest ascent / descent direction — F2023-Q3, F2019-Q9, S2019-Q10 */
addX('x-dd-steep','DD',2,['F2023-Q3','F2019-Q9','S2019-Q10'],()=>{
  const o=ddBank(false); if(!o) return null;
  const gr=ddVec(o), n=n2(gr), up=coin(0.4), sg=up?1:-1, unit=coin(0.6);
  const U=a=>unit?V(...a.map(x=>rsq(x,n))):vint(a);
  const key=U(gr.map(x=>sg*x));
  const opts=xm({a:key},[{a:U(gr.map(x=>-sg*x)),why:up?'Steepest ascent is along +∇f.':'Steepest descent is along −∇f.'},{a:U([-gr[1],gr[0]]),why:'That is perpendicular to ∇f: the rate of change is 0 there.'},{a:U([gr[1],gr[0]].map(x=>sg*x)),why:'Components swapped.'},{a:U([gr[0],-gr[1]].map(x=>sg*x)),why:'Sign slip in one component.'},unit?{a:vint(gr.map(x=>sg*x)),why:'Right direction, but not a unit vector.'}:{a:U([gr[1],-gr[0]]),why:'Perpendicular to ∇f.'}],{kind:'vec'});
  return xq(`${unit?'Find the unit vector in':'Which vector points in'} the direction of steepest ${up?'ascent':'descent'} of ${m`f(x,y)=${tex(o.f)}`} at ${mp(o.P)}?`,opts,{kind:'vec',lv:1,
    how:`Steepest ${up?'ascent: +':'descent: −'}∇f${unit?', divided by its length':''}.`,sol:[['Gradient.',X`\nabla f=${tex(gradS(o))}\ \parallel\ ${vt(gr)}`],['',tex(key)]],chk:{op:'dd',e:{f:o.f},n:{P:o.Pd,ask:up?'up':'down',unit}}});
});

/* =============================== 15.6 TP =============================== */
/* ★ tangent plane to a level surface — S2025-Q12, F2023-Q8, S2022-Q1, F2017-Q11 */
addX('x-tp-level','TP',4,['S2025-Q12','F2023-Q8','S2022-Q1','F2017-Q11'],()=>{
  const fam=pick(['quad','cone','mono','zsq']);
  let LHS,RHS,P;
  if(fam==='quad'){ const A=[nz(-3,3),nz(-3,3),nz(-3,3)]; if(A.every(a=>a>0)&&coin()) A[ri(0,2)]*=-1; P=rv(3,-3,3,true);
    LHS=sumS(['x','y','z'].map((v,i)=>mono(A[i],{[v]:2}))); RHS=String(A.reduce((s,a,i)=>s+a*P[i]*P[i],0)); }
  else if(fam==='cone'){ const tr=pick([[3,4,5],[4,3,5],[6,8,10],[1,2,Math.sqrt(5)]]); const a=pick([1,4]), b=a===4?1:pick([1,4]);
    /* b·y² + a·z² = x², pick y, z so that x is an integer */
    const y0=nz(-4,4), z0=nz(-2,2), X2=b*y0*y0+a*z0*z0, x0=Math.round(Math.sqrt(X2)); if(x0*x0!==X2) return null;
    P=[pick([1,-1])*x0,y0,z0]; LHS=sumS([mono(b,{y:2}),mono(a,{z:2})]); RHS='x^2'; }
  else if(fam==='mono'){ const e=[1,ri(1,2),ri(1,3)]; P=[nz(1,3),nz(-2,2),nz(-2,2)]; LHS=mono(1,{x:e[0],y:e[1],z:e[2]}); RHS=String(P[0]**e[0]*P[1]**e[1]*P[2]**e[2]); if(RHS==='0') return null; }
  else { const c=pick([2,4,1]); const x0=nz(-2,2), y0=nz(-3,3), Z2=c*x0*y0, z0=Math.round(Math.sqrt(Math.abs(Z2))); if(Z2<=0||z0*z0!==Z2) return null;
    P=[x0,y0,pick([1,-1])*z0]; LHS='z^2'; RHS=mono(c,{x:1,y:1}); }
  const F=`${LHS} - (${RHS})`, env={x:P[0],y:P[1],z:P[2]};
  const g=['x','y','z'].map(v=>intOf(nD(F,env,v))); if(g.some(v=>v===null)||!n2(g)) return null;
  const nn=reduceInt(g), d=dotA(nn,P), key=planeKey(nn,d);
  const gL=['x','y','z'].map(v=>intOf(nD(LHS,env,v)));
  const dis=[{a:planeKey(P,n2(P)),why:'Used the point as the normal vector; the normal is ∇F(P).'},{a:planeKey(nn,d?-d:n2(nn)),why:'Sign slip in the constant: ∇F·(X − P) = 0 means ∇F·X = ∇F·P.'},
    {a:planeKey(nn,+RHS===+RHS&&!isNaN(+RHS)&&+RHS!==d?+RHS:d+1),why:'The constant is ∇F(P)·P, not the level value.'},
    fam!=='quad'&&gL.some(v=>v)?{a:planeKey(reduceInt(gL),dotA(reduceInt(gL),P)),why:'Move everything to one side first: the right-hand side contributes to ∇F.'}:{a:planeKey(nn.map((v,i)=>i===0?-v:v),dotA(nn.map((v,i)=>i===0?-v:v),P)),why:'Sign slip in one component of ∇F.'},
    {a:planeKey(nn.map((v,i)=>i===2?v+1:v),dotA(nn.map((v,i)=>i===2?v+1:v),P)),why:'Arithmetic slip in F_z.'}];
  const opts=xm({a:key},dis,{kind:'eq'});
  const name={quad:'the surface',cone:'the elliptic cone',mono:'the level surface',zsq:'the surface'}[fam];
  return xq(`Find an equation of the tangent plane to ${name} ${m`${tex(LHS)}=${tex(RHS)}`} at ${mp(P)}.`,opts,{kind:'eq',lv:2,
    how:'F = left − right; the normal is ∇F(P); plane: ∇F(P)·(X − P) = 0.',sol:[['Gradient of F at P.',X`\nabla F=${vt(g)}\ \parallel\ ${vt(nn)}`],['Plane.',tex(key)]],chk:{op:'tpsurf',e:{F},n:{P}}});
});

/* ★ tangent plane to a graph z = f(x,y) — S2020-Q9, S2019-Q11, S2017-Q10, S2015-Q12, F2018-Q9 */
addX('x-tp-graph','TP',3,['S2020-Q9','S2019-Q11','S2017-Q10','S2015-Q12','S2018-Q10'],()=>{
  const fam=pick(['poly','cbrt','root','quot','ln']);
  if(fam==='ln'){ const k=pick([1,2,3]), c=ri(-2,3); const f=sumS([`ln(x*y${k===1?'':'^'+k})`,mono(c,{y:1})]);
    const B=k+c, lhs=(xs,b,zs)=>sumS([xs,mono(b,{y:1}),zs]);
    const key=`${lhs('x/e',B,'-z')} = ${k}`;
    const opts=xm({a:key},[{a:`${lhs('x',B,'-z')} = ${sumS(['e',String(k-1)])}`,why:'f_x = 1/x = 1/e at x = e, not 1.'},{a:`${lhs('x/e',B,'z')} = ${k+2+2*c}`,why:'The z term has the wrong sign.'},{a:`${lhs('x/e',k,'-z')} = ${k-c}`,why:`f_y = ${k}/y + ${c}: the ${c} from ${c}y is missing.`},{a:`${lhs('x/e',B,'-z')} = ${k+2}`,why:'Slip in the constant: plug in the point.'},{a:`${lhs('x/e',B,'-z')} = 0`,why:'The plane must pass through (e, 1, '+(1+c)+').'}],{kind:'eq'});
    return xq(`Find the tangent plane to the graph of ${m`f(x,y)=${tex(f)}`} at ${m`(e,1,${1+c})`}.`,opts,{kind:'eq',lv:2,how:'z − f(a,b) = f_x(a,b)(x − a) + f_y(a,b)(y − b).',
      sol:[['Partials.',X`f_x=\frac1x=\frac1e,\qquad f_y=\frac{${k}}{y}${c<0?c:'+'+c}=${B}`],['',X`z-${1+c}=\frac{x-e}{e}+${B}(y-1)\ \Rightarrow\ ${tex(key)}`]],chk:{op:'tpgraph',e:{f},n:{P:['E','1']}}});
  }
  let f,P,f0,fx,fy;
  if(fam==='poly'){ const a=nz(-2,3), b=ri(-2,2), c=nz(-2,3), d=ri(-3,3); f=sumS([mono(a,{x:2}),mono(b,{x:1,y:1}),mono(c,{y:2}),String(d)]); P=[nz(-2,2),nz(-2,2)];
    f0=[a*P[0]**2+b*P[0]*P[1]+c*P[1]**2+d,1]; fx=[2*a*P[0]+b*P[1],1]; fy=[b*P[0]+2*c*P[1],1]; }
  else if(fam==='cbrt'){ P=pick([[2,2],[2,-2],[-2,2],[1,0],[0,1],[0,-2]]); const S=P[0]**2+P[1]**2, R=Math.round(Math.cbrt(S)); if(R**3!==S) return null;
    f='(x^2 + y^2)^(1/3)'; f0=[R,1]; fx=Rr(2*P[0],3*R*R); fy=Rr(2*P[1],3*R*R); }
  else if(fam==='root'){ const t=pick([[3,4,5],[4,3,5],[6,8,10],[1,2,'h'],[2,1,'h'],[2,2,'h']]); if(t[2]==='h'){ const K=9; P=[t[0],t[1]]; const S=K-P[0]**2-P[1]**2, R=Math.round(Math.sqrt(S)); if(R*R!==S||!R) return null; f=`sqrt(${K} - x^2 - y^2)`; f0=[R,1]; fx=Rr(-P[0],R); fy=Rr(-P[1],R); }
    else { P=[t[0]*pick([1,-1]),t[1]]; f='sqrt(x^2 + y^2)'; f0=[t[2],1]; fx=Rr(P[0],t[2]); fy=Rr(P[1],t[2]); } }
  else { const c=pick([6,9,12,18]); P=[ri(1,3),nz(-2,2)]; const D=P[0]+P[1]**2; if(c%D) return null; f=`${c}/(x + y^2)`; f0=[c/D,1]; fx=Rr(-c,D*D); fy=Rr(-2*c*P[1],D*D); }
  const Lc=lcmR([fx,fy,f0]), A=fx[0]*Lc/fx[1], B=fy[0]*Lc/fy[1], F0=f0[0]*Lc/f0[1];
  const key=planeKey([A,B,-Lc],A*P[0]+B*P[1]-F0);
  const opts=xm({a:key},[{a:planeKey([A,B,-Lc],A*P[0]+B*P[1]+F0),why:'Sign slip with f(a,b): z − f(a,b) = f_x(x − a) + f_y(y − b).'},{a:planeKey([B||1,A||2,-Lc],(B||1)*P[0]+(A||2)*P[1]-F0),why:'Swapped f_x and f_y.'},
    {a:planeKey([A,B,-Lc],-F0),why:'Forgot to shift x and y by the point: (x − a), (y − b).'},{a:planeKey([A,B,Lc],A*P[0]+B*P[1]+F0),why:'The z term has the wrong sign.'},{a:planeKey([A||1,B,0],A*P[0]+B*P[1]),why:'That plane is vertical; the tangent plane to a graph contains a z term.'}],{kind:'eq'});
  return xq(`Find an equation of the plane tangent to ${m`z=${tex(f)}`} at ${m`(${P[0]},${P[1]},${tex(Rs(f0))})`}.`,opts,{kind:'eq',lv:2,how:'z − f(a,b) = f_x(a,b)(x − a) + f_y(a,b)(y − b)',
    sol:[['Partials at the point.',X`f_x=${tex(Rs(fx))},\qquad f_y=${tex(Rs(fy))}`],['Plane.',tex(key)]],chk:{op:'tpgraph',e:{f},n:{P:P.map(String)}}});
});

/* horizontal tangent planes — S2024-Q1, F2022-Q11 */
addX('x-tp-horiz','TP',2,['S2024-Q1','F2022-Q11'],()=>{
  if(coin()){ const a=pick([1,1,2]), b=pick([1,1,2]), p=ri(-3,3), q=nz(-3,3), c=ri(-4,6), sg=pick([1,-1]);
    /* z = c + sg(−a(x−p)² − b(y−q)²) expanded */
    const Z=sumS([mono(-sg*a,{x:2}),mono(2*sg*a*p,{x:1}),mono(-sg*b,{y:2}),mono(2*sg*b*q,{y:1}),String(c-sg*a*p*p-sg*b*q*q)]);
    const key=P3(p,q,c);
    const opts=xm({a:key},[{a:P3(p,q,c-sg*a*p*p-sg*b*q*q),why:'That is the constant term, not z at the point.'},{a:P3(q,p,c),why:'Coordinates swapped.'},{a:P3(-p,-q,c),why:'Sign slip solving f_x = 0, f_y = 0.'},{a:P3(p,q,-c||3),why:'Sign slip computing z.'},{a:P3(p,0,c-sg*b*q*q),why:'Both f_x and f_y must be 0.'}],{kind:'point'});
    return xq(`At what point on the surface ${m`z=${tex(Z)}`} is the tangent plane horizontal?`,opts,{kind:'point',lv:1,how:'Horizontal ⇔ f_x = f_y = 0; then compute z.',
      sol:[['',X`f_x=0,\ f_y=0\ \Rightarrow\ (x,y)=(${p},${q})`],['',X`z=${c}`]],chk:{op:'horiz',e:{g:`z - (${Z})`}}});
  }
  const a=pick([1,2,3]), p=nz(-3,3), b=nz(-5,5), d=ri(-8,8);
  const S=sumS([mono(a,{x:2}),mono(-2*a*p,{x:1}),mono(b,{y:3}),'z',String(d)]), z0=a*p*p-d;
  const opts=xm({a:P3(p,0,z0)},[{a:P3(p,0,-z0||2),why:'Solve F = 0 for z carefully (sign).'},{a:P3(0,0,-d),why:'x must make F_x = 0.'},{a:P3(p,1,z0-b),why:`F_y = ${3*b}y² = 0 forces y = 0.`},{a:P3(-p,0,z0),why:'Sign slip solving F_x = 0.'},{a:P3(2*p,0,-d),why:'Arithmetic slip.'}],{kind:'point'});
  return xq(`Find the point(s) on the surface ${m`${tex(S)}=0`} where the tangent plane is parallel to the xy-plane.`,opts,{kind:'point',lv:2,how:'The normal ∇F must be parallel to k: F_x = F_y = 0.',
    sol:[['',X`F_x=${2*a}x-${2*a*p}=0,\quad F_y=${3*b}y^2=0`],['',X`(x,y)=(${p},0),\quad z=${z0}`]],chk:{op:'horiz',e:{g:S}}});
});

/* linear approximation, tangent-plane intercept, differentials — S2016-Q7, S2015-Q9, F2018-Q9, F2017-Q7, F2016-Q10 */
addX('x-tp-approx','TP',2,['S2016-Q7','S2015-Q9','F2018-Q9','F2017-Q7','F2016-Q10'],()=>{
  const fam=pick(['lin','lin','int','err']);
  if(fam==='lin'){
    const opt=pick([[4,3,3,5],[1,1,8,3],[2,4,3,4],[3,2,8,5],[6,4,16,10],[1,3,8,5]]);   /* x0, y0, k, √(x0² + k y0) */
    const [x0,y0,k,R]=opt; if(x0*x0+k*y0!==R*R) return null;
    const dx=pick([2,-2,3,-3,1,-1]), dy=pick([2,-2,3,-3,1,-1]);        /* hundredths */
    /* L = R + (x0/R)dx + (k/(2R))dy */
    const q=2*R*100, p=2*R*R*100+2*x0*dx+k*dy;
    const key=decS(p,q), bad=(s1,s2)=>decS(2*R*R*100+s1*2*x0*dx+s2*k*dy,q);
    const opts=xm({a:key},[{a:bad(1,-1),why:'Sign slip on Δy.'},{a:String(R),why:'That is f(a,b); add f_x Δx + f_y Δy.'},{a:decS(2*x0*dx+k*dy,q),why:'That is only the change dz; add it to f(a,b).'},{a:decS(2*R*R*100+2*x0*dy+k*dx,q),why:'Paired f_x with Δy.'},{a:decS(2*R*R*100+x0*dx+k*dy,q),why:'f_x = x/√(…): the chain-rule factor 2x/2 gives x/R.'}]);
    const X1=(x0+dx/100).toFixed(2), Y1=(y0+dy/100).toFixed(2);
    return xq(`Use the linear approximation of ${m`f(x,y)=\sqrt{x^2+${k}y}`} at ${mp([x0,y0])} to estimate ${m`\sqrt{(${X1})^2+${k}(${Y1})}`}.`,opts,{kind:'expr',lv:2,how:'f(a+Δx, b+Δy) ≈ f(a,b) + f_x(a,b)Δx + f_y(a,b)Δy.',
      sol:[['',X`f=${R},\ f_x=\frac{x}{\sqrt{\cdots}}=\frac{${x0}}{${R}},\ f_y=\frac{${k}}{2\sqrt{\cdots}}=\frac{${k}}{${2*R}}`],['',X`L=${R}+\frac{${x0}}{${R}}(${dx/100})+\frac{${k}}{${2*R}}(${dy/100})=${key}`]],chk:{op:'linapprox',e:{f:`sqrt(x^2 + ${k}*y)`},n:{P:[x0,y0],dx:dx/100,dy:dy/100}}});
  }
  if(fam==='int'){ const a=nz(-2,3), b=ri(-2,2), c=nz(-2,3), P=[nz(-2,2),nz(-2,2)];
    const f=sumS([mono(a,{x:2}),mono(b,{x:1,y:1}),mono(c,{y:2})]), f0=a*P[0]**2+b*P[0]*P[1]+c*P[1]**2, fx=2*a*P[0]+b*P[1], fy=b*P[0]+2*c*P[1]; if(!fx) return null;
    /* 0 = f0 + fx(X − x0) + fy(0 − y0) */
    const key=Rs(Radd([P[0],1],Rr(fy*P[1]-f0,fx)));
    const opts=xm({a:key},[{a:Rs(Radd([P[0],1],Rr(f0-fy*P[1],fx))),why:'Sign slip solving for x.'},{a:fy?Rs(Radd([P[1],1],Rr(fx*P[0]-f0,fy))):'7',why:'That is where the plane meets the y-axis.'},{a:Rs(Rr(f0,fx)),why:'Keep the (x − x₀) and (y − y₀) shifts.'},{a:Rs(Radd([P[0],1],Rr(-f0,fx))),why:'Set y = 0 too: the fy(0 − y₀) term is missing.'},{a:Rs(Radd([P[0],1],Rr(fy*P[1]-f0,fx)).map((v,i)=>i?v:v+1)),why:'Arithmetic slip.'}]);
    return xq(`The tangent plane to ${m`z=${tex(f)}`} at ${m`(${P[0]},${P[1]},${f0})`} intersects the x-axis at ${m`(a,0,0)`}. Find ${m`a`}.`,opts,{kind:'expr',lv:2,how:'Build the tangent plane, then set y = 0 and z = 0.',
      sol:[['Plane.',X`z=${f0}+${fx}(x-${fmtC(P[0])})+${fmtC(fy)}(y-${fmtC(P[1])})`],['y = z = 0.',X`a=${tex(key)}`]],chk:{op:'tpxint',e:{f},n:{P}}});
  }
  const sh=pick(['rect','tri','cyl']), del=pick([1,2,5]), dd=del/10;
  let f,P,key,dis,stem,sol;
  if(sh==='rect'){ P=[ri(4,12),ri(2,8)]; f='x*y'; key=decS((P[0]+P[1])*del,10);
    dis=[{a:decS(P[0]*del,10),why:'Both measurements contribute: dA = W dL + L dW.'},{a:decS(del*del,100),why:'That is (0.1)², a second-order term.'},{a:decS((P[0]+P[1])*del,20),why:'No factor ½ in dA.'},{a:decS(2*(P[0]+P[1])*del,10),why:'That is the error in the perimeter.'},{a:decS((P[0]*P[1])*del,10),why:'Differentials: multiply each partial by its error, not the area.'}];
    stem=`A rectangle is measured to be ${P[0]} cm long and ${P[1]} cm wide, each with error at most ${dd} cm. Use differentials to estimate the maximum error in the computed area (cm²).`;
    sol=[['',X`dA=W\,dL+L\,dW=${P[1]}(${dd})+${P[0]}(${dd})=${tex(key)}`]]; }
  else if(sh==='tri'){ P=[ri(4,12),ri(2,10)]; f='x*y/2'; key=decS((P[0]+P[1])*del,20);
    dis=[{a:decS((P[0]+P[1])*del,10),why:'A = ½bh: the ½ carries through.'},{a:decS(P[0]*del,20),why:'Both measurements contribute.'},{a:decS(del*del,200),why:'That is a second-order term.'},{a:decS(P[0]*P[1]*del,20),why:'Multiply each partial by its error.'},{a:decS((P[0]+P[1])*del,40),why:'Arithmetic slip.'}];
    stem=`A triangle has base ${P[0]} cm and height ${P[1]} cm, each measured with error at most ${dd} cm. Use differentials to estimate the maximum error in its area (cm²).`;
    sol=[['',X`dA=\tfrac12(h\,db+b\,dh)=\tfrac12(${P[1]}+${P[0]})(${dd})=${tex(key)}`]]; }
  else { P=[ri(1,5),ri(2,10)]; f='pi*x^2*y'; const cf=(2*P[0]*P[1]+P[0]*P[0])*del; key=`${decS(cf,10)}*pi`;
    dis=[{a:`${decS(2*P[0]*P[1]*del,10)}*pi`,why:'The height error contributes πr² dh too.'},{a:`${decS(P[0]*P[0]*del,10)}*pi`,why:'The radius error contributes 2πrh dr too.'},{a:`${decS((P[0]*P[1]+P[0]*P[0])*del,10)}*pi`,why:'∂V/∂r = 2πrh (the 2 is missing).'},{a:decS(cf,10),why:'The π is missing.'},{a:`${decS(P[0]*P[0]*P[1],1)}*pi`,why:'That is the volume, not its error.'}];
    stem=`A cylinder has radius ${P[0]} in and height ${P[1]} in, each measured with error at most ${dd} in. Use differentials to estimate the maximum error in its volume (in³).`;
    sol=[['',X`dV=2\pi rh\,dr+\pi r^2\,dh=${tex(key)}`]]; }
  const opts=xm({a:key},dis);
  return xq(stem,opts,{kind:'expr',lv:1,how:'Maximum error ≈ |f_x|·|Δx| + |f_y|·|Δy|.',sol,chk:{op:'differential',e:{f},n:{P,dx:dd,dy:dd}}});
});

/* =============================== 15.7 CRIT =============================== */
const CLS2={'max,max':'Two local maximums','min,min':'Two local minimums','max,saddle':'One local max and one saddle point','min,saddle':'One local min and one saddle point','max,min':'One local max and one local min','saddle,saddle':'Two saddle points'};
const critCls=(f,p)=>{ const env={x:p[0],y:p[1]}, a=nD2(f,env,'x','x'), b=nD2(f,env,'y','y'), c=nD2(f,env,'x','y'), D=a*b-c*c;
  if(Math.abs(D)<1e-4) return 'inc'; return D<0?'saddle':a>0?'min':'max'; };
const clsKey=cs=>cs.slice().sort().join(',');
const cntLabel=cs=>{ const n={max:0,min:0,saddle:0}; cs.forEach(c=>n[c]++); const W=['','One','Two','Three','Four'];
  const part=(k,s,p)=>n[k]?`${W[n[k]].toLowerCase()} ${n[k]===1?s:p}`:null;
  const t=[part('saddle','saddle point','saddle points'),part('max','local max','local maxima'),part('min','local min','local minima')].filter(Boolean);
  const s=t.length===1?t[0]:t.slice(0,-1).join(', ')+' and '+t[t.length-1]; return s[0].toUpperCase()+s.slice(1); };

/* ★ classify two (or four) critical points — S2025-Q2, S2022-Q11, S2016-Q11, F2015-Q10, S2020-Q10 */
addX('x-crit-classify','CRIT',5,['S2025-Q2','S2022-Q11','S2016-Q11','F2015-Q10','S2020-Q10','F2022-Q12'],()=>{
  const fam=pick(['sym','sym2','cubic','cubic','prod','quart']);
  let f,pts,all=true;
  if(fam==='sym'){ const k=nz(-3,3); f=sumS(['x^3','y^3',mono(-3*k,{x:1,y:1})]); pts=[[0,0],[k,k]]; }
  else if(fam==='sym2'){ const k=nz(-2,2); f=sumS(['x^3','-y^3',mono(-3*k,{x:1,y:1})]); pts=[[0,0],[-k,k]]; }
  else if(fam==='cubic'){ let ok=false;
    for(let i=0;i<30&&!ok;i++){ const a=pick([1,2,-1,-2,3]), b=pick([2,3,4,6,-2,-4,-6]), c=pick([1,2,3,-1,-2,-3]);
      const x2n=b*b, x2d=6*a*c; if(x2n%x2d) continue; const x2=x2n/x2d; const y2n=-b*x2; if(y2n%(2*c)) continue; if(Math.abs(x2)>4) continue;
      f=sumS([mono(a,{x:3}),mono(b,{x:1,y:1}),mono(c,{y:2})]); pts=[[0,0],[x2,y2n/(2*c)]]; ok=true; }
    if(!ok) return null; }
  else if(fam==='prod'){ const p=pick([2,4,-2,6]), q=pick([2,4,-6,-2,6]);
    f=`x*y*(${shift('x',p)})*(${shift('y',q)})`; pts=[pick([[0,0],[0,q],[p,0],[p,q]]),[p/2,q/2]]; all=false; }
  else { const p=pick([1,2]), q=pick([1,2,3]), C=ri(0,30);
    f=sumS(['x^4','y^4',mono(-2*p*p,{x:2}),mono(-2*q*q,{y:2}),String(C)]);
    const xs=[0,p,-p], ys=[0,q,-q], allp=[]; xs.forEach(x=>ys.forEach(y=>allp.push([x,y]))); pts=shuf(allp).slice(0,4); all=false; }
  const cs=pts.map(p=>critCls(f,p)); if(cs.includes('inc')) return null;
  let key,pool;
  if(pts.length===2){ key=CLS2[clsKey(cs)]; pool=Object.values(CLS2); }
  else { key=cntLabel(cs); const set=new Set([key]); pool=[key];
    for(let i=0;i<60&&pool.length<8;i++){ const r=Array.from({length:4},()=>pick(['max','min','saddle'])); const l=cntLabel(r); if(!set.has(l)){ set.add(l); pool.push(l); } } }
  const W={saddle:'D < 0 there: a saddle.',min:'D > 0 and f_xx > 0: a local min.',max:'D > 0 and f_xx < 0: a local max.'};
  const detail=pts.map((p,i)=>`(${p.join(', ')}): ${W[cs[i]]}`).join(' ');
  const opts=xm({h:key},pool.filter(h=>h!==key).map(h=>LBL(h,'Compute D = f_xx f_yy − f_xy² at each point. '+detail)));
  const ptsTxt=pts.map(p=>mp(p));
  const stem=all&&coin(0.5)?`Classify all critical points of ${m`f(x,y)=${tex(f)}`}.`
    :`${ptsTxt.slice(0,-1).join(', ')}${pts.length>2?',':''} and ${ptsTxt[ptsTxt.length-1]} are critical points of ${m`f(x,y)=${tex(f)}`}. ${pts.length>2?'Which is correct about these points?':'Classify them.'}`;
  return xq(stem,opts,{kind:'choice',lv:2,how:'D = f_xx f_yy − f_xy². D < 0: saddle. D > 0: min if f_xx > 0, max if f_xx < 0.',
    sol:pts.map((p,i)=>[`At (${p.join(', ')}).`,X`\text{${cs[i]==='saddle'?'saddle point':cs[i]==='min'?'local minimum':'local maximum'}}`]),chk:{op:'critcls',e:{f},n:{pts,all:all&&/Classify all/.test(stem)}}});
});

/* find the critical point / the local minimum — F2024-Q12, F2017-Q8, S2019-Q12 */
addX('x-crit-find','CRIT',2,['F2024-Q12','F2017-Q8','S2019-Q12'],()=>{
  if(coin(0.55)){ const k=pick([1,2]), y1=ri(-3,2*k*k+3), y2=2*k*k-y1; if(y1===y2) return null; const p=2*nz(-3,3), q=y1*y2+k*p;
    const f=sumS(['y^3/3','x^2',mono(2*k,{x:1,y:1}),mono(p,{x:1}),mono(q,{y:1}),String(ri(-9,9))]);
    const X_=y=>-(p+2*k*y)/2, mn=y1>k*k?y1:y2, sd=mn===y1?y2:y1;
    const key=P3(X_(mn),mn);
    const opts=xm({a:key},[{a:P3(X_(sd),sd),why:'That critical point is a saddle (D < 0 there).'},{a:P3(mn,X_(mn)),why:'Coordinates swapped.'},{a:P3(-X_(mn),mn),why:'Sign slip solving f_x = 0 for x.'},{a:P3(X_(mn),-mn),why:'Sign slip.'},{a:P3(-X_(sd),-sd),why:'Solve f_x = 0 and f_y = 0 together.'}],{kind:'point'});
    return xq(`Find the local minimum point ${m`(x,y)`} of ${m`f(x,y)=${tex(f)}`}.`,opts,{kind:'point',lv:3,how:'Solve f_x = 0 for x, substitute into f_y = 0, then use the second-derivative test on both solutions.',
      sol:[['',X`f_x=2x+${2*k}y${p<0?p:'+'+p}=0,\quad f_y=y^2+${2*k}x${q<0?q:'+'+q}=0`],['',X`y=${y1}\text{ or }${y2}`],['D = 4y − '+4*k*k+' > 0 only at y = '+mn+'.',tex(key)]],chk:{op:'critmin',e:{f}}});
  }
  const a=pick([1,2,3]), b=pick([1,2,3]), c=pick([1,2,-1,-2]); if(a*b<=0) return null;
  const f=sumS([mono(a,{x:2,y:1}),mono(b,{y:1}),mono(c,{y:2})]), y0=Rr(-b,2*c);
  const key=P3(0,Rs(y0));
  const opts=xm({a:key},[{a:P3(0,Rs(Rneg(y0))),why:'Sign slip solving f_y = 0.'},{a:P3(Rs(y0),0),why:'Coordinates swapped.'},{a:P3(0,Rs(Rr(-b,c))),why:'f_y = '+a+'x² + '+b+' + '+2*c+'y: the 2 from y² is missing.'},{h:'There are no critical points',why:'x = 0 works: f_x = '+2*a+'xy = 0.'},{a:P3(Rs(y0),Rs(y0)),why:'Arithmetic slip.'}],{kind:'point'});
  return xq(`Find the critical point(s) of ${m`f(x,y)=${tex(f)}`}.`,opts,{kind:'point',lv:1,how:'f_x = 2axy = 0 gives x = 0 or y = 0; check each case in f_y = 0.',
    sol:[['',X`f_x=${2*a}xy,\qquad f_y=${a}x^2+${b}+${2*c}y`],['y = 0 needs x² < 0: impossible. x = 0:',tex(key)]],chk:{op:'crit',e:{f}}});
});

/* given second partials, or an inconclusive test — F2018-Q12, F2023-Q7 */
addX('x-crit-given','CRIT',2,['F2018-Q12','F2023-Q7'],()=>{
  if(coin(0.4)){
    const B=[['cos(x)*(2 + x^2) - y^3','inc'],['e^(x^2) - x^2 + y^3','inc'],[`x^4 + ${ri(1,3)}*y^2`,'inc'],[`${ri(2,4)}*cos(x) + y^2`,'saddle'],[`x^2*e^y + ${ri(1,3)}*y^2`,'min'],[`cos(x) + cos(y)`,'max']];
    const [f,c]=pick(B);
    const L={inc:'The test is inconclusive',min:'Local minimum',max:'Local maximum',saddle:'Saddle point',either:'Either a local max or a local min'};
    const opts=xm({h:L[c]},Object.keys(L).filter(k=>k!==c).map(k=>LBL(L[k],k==='inc'?'D ≠ 0 here, so the test decides.':k==='either'?'The test says either a max or a min only when D > 0 — and then f_xx decides which.':c==='inc'?'At (0,0), D = f_xx f_yy − f_xy² = 0: the second-derivative test says nothing.':'Compute D and the sign of f_xx at (0, 0).')));
    return xq(`${m`(0,0)`} is a critical point of ${m`f(x,y)=${tex(f)}`}. What does the second derivative test say about it?`,opts,{kind:'choice',lv:2,how:'Compute f_xx, f_yy, f_xy at (0, 0) and D = f_xx f_yy − f_xy².',
      sol:[['',X`D=f_{xx}f_{yy}-f_{xy}^2\text{ at }(0,0)`],[L[c]+'.','']],chk:{op:'critgiven',e:{f},n:{label:L[c]}}});
  }
  const mk2=()=>{ const t=pick(['max','min','saddle']); for(;;){ const a=nz(-6,6), b=nz(-6,6), c=ri(-4,4), D=a*b-c*c; const cl=D<0?'saddle':D>0?(a>0?'min':'max'):'inc'; if(cl===t) return {a,b,c,cl}; } };
  const A=mk2(), B=mk2(); const Pp=[ri(-3,3),ri(-3,3)], Qp=[ri(-3,3),ri(-3,3)]; if(Pp.join()===Qp.join()) return null;
  const nm={max:'local max',min:'local min',saddle:'saddle'}, lab=(x,y)=>`${nm[x][0].toUpperCase()+nm[x].slice(1)} at \\((${Pp.join(',')})\\) and ${nm[y]} at \\((${Qp.join(',')})\\)`;
  const key=lab(A.cl,B.cl), pool=[];
  ['max','min','saddle'].forEach(x=>['max','min','saddle'].forEach(y=>{ if(x!==A.cl||y!==B.cl) pool.push(LBL(lab(x,y),`At (${Pp}): D = ${A.a*A.b-A.c*A.c}; at (${Qp}): D = ${B.a*B.b-B.c*B.c}. D < 0 ⇒ saddle; D > 0 ⇒ min if g_xx > 0, max if g_xx < 0.`)); }));
  const opts=xm({h:key},pool);
  return xq(`${m`g(x,y)`} has critical points ${mp(Pp)} and ${mp(Qp)}. At ${mp(Pp)}: ${m`g_{xx}=${A.a},\ g_{yy}=${A.b},\ g_{xy}=${A.c}`}. At ${mp(Qp)}: ${m`g_{xx}=${B.a},\ g_{yy}=${B.b},\ g_{xy}=${B.c}`}. Classify them.`,opts,{kind:'choice',lv:1,
    how:'D = g_xx g_yy − g_xy² at each point.',sol:[['',X`D_1=${A.a*A.b-A.c*A.c},\qquad D_2=${B.a*B.b-B.c*B.c}`],[key+'.','']],chk:{op:'critgiven2',n:{A:[A.a,A.b,A.c],B:[B.a,B.b,B.c],cls:[A.cl,B.cl]}}});
});

/* =============================== 15.7 ABS =============================== */
/* ★ disk: f = x² + y² − 2py + c — S2024-Q9, S2022-Q2 */
addX('x-abs-disk','ABS',3,['S2024-Q9','S2022-Q2'],()=>{
  const p=nz(-3,3), R=pick([3,4,5].filter(r=>r>Math.abs(p))), c=ri(-4,6), v=pick(['x','y']);
  const f=sumS(['x^2','y^2',mono(-2*p,{[v]:1}),String(c)]);
  const M=R*R+2*Math.abs(p)*R+c, mn=c-p*p, bmin=R*R-2*Math.abs(p)*R+c;
  const ask=pick(['sum','pair','pair','M']);
  let opts,stem;
  if(ask==='sum'){ opts=xm(xnum(M+mn),[{a:String(M+bmin),why:'The minimum is at the interior critical point, not on the boundary.'},{a:String(M-mn),why:'M + m, not M − m.'},{a:String(M),why:'Add m.'},{a:String(bmin+mn),why:`The maximum is at the boundary point where ${v} = ${-Math.sign(p)*R}.`},{a:String(M+mn+2),why:'Arithmetic slip.'}]);
    stem=`Let ${m`M`} and ${m`m`} be the absolute maximum and minimum of ${m`f(x,y)=${tex(f)}`} on the disk ${m`x^2+y^2\le ${R*R}`}. Find ${m`M+m`}.`; }
  else if(ask==='M'){ opts=xm(xnum(M),[{a:String(bmin),why:`That is on the boundary at ${v} = ${Math.sign(p)*R}; the other end is larger.`},{a:String(R*R+c),why:'The −2p term matters on the boundary.'},{a:String(mn),why:'That is the minimum.'},{a:String(M+1),why:'Arithmetic slip.'},{a:String(R*R),why:'Evaluate f, not x² + y².'}]);
    stem=`Find the absolute maximum of ${m`f(x,y)=${tex(f)}`} on the closed disk ${m`x^2+y^2\le ${R*R}`}.`; }
  else { const H=(a,b)=>m`M=${a},\ m=${b}`; const Ms=[M,bmin,R*R+c], ms=[mn,bmin,c];
    const dis=[]; Ms.forEach(a=>ms.forEach(b=>{ if(a!==M||b!==mn) dis.push(LBL(H(a,b),'Candidates: interior critical point (value '+mn+'), and on the circle f = '+R*R+(p>0?' − ':' + ')+2*Math.abs(p)+v+' + '+c+' for −'+R+' ≤ '+v+' ≤ '+R+'.')); }));
    opts=xm({h:H(M,mn)},dis);
    stem=`Find the absolute maximum ${m`M`} and minimum ${m`m`} of ${m`f(x,y)=${tex(f)}`} on the closed disk ${m`x^2+y^2\le ${R*R}`}.`; }
  return xq(stem,opts,{kind:ask==='pair'?'choice':'expr',lv:3,how:'Interior: ∇f = 0. Boundary: substitute x² + y² = R² and optimize over the allowed range. Compare.',
    sol:[['Interior critical point.',X`(${v==='x'?p:0},${v==='y'?p:0}),\ f=${mn}`],['Boundary.',X`f=${R*R}${p>0?'-':'+'}${2*Math.abs(p)}${v}${c<0?c:'+'+c},\ -${R}\le ${v}\le ${R}`],['',X`M=${M},\qquad m=${mn}`]],chk:{op:'absdisk',e:{f},n:{R,ask,M,m:mn}}});
});

/* triangle and ellipse regions — S2020-Q11, S2018-Q11, S2016-Q12 */
addX('x-abs-region','ABS',2,['S2020-Q11','S2018-Q11','S2016-Q12'],()=>{
  const fam=pick(['tri','ellreg','ellcurve']);
  if(fam==='tri'){ const k=pick([3,4,5,6,7]), a=pick([1,1,2]); const f=`x^2 + y^2 + ${k}*x*y`, key=frac(a*a*(k+2),4);
    const opts=xm({a:key},[{a:String(a*a),why:'The vertices are not the only candidates: the hypotenuse has an interior maximum at its midpoint.'},{a:frac(a*a*(k+2),2),why:'At x = y = a/2 the value is a²(2 + k)/4.'},{a:frac(a*a*k,4),why:'x² + y² contributes a²/2 at the midpoint too.'},{a:frac(k+2,2),why:'Arithmetic slip.'},{a:'0',why:'That is the minimum.'},{a:frac(a*a*(k+1),4),why:'At x = y = a/2: x² + y² = a²/2 plus k·a²/4.'},{a:String(2*a*a),why:'Arithmetic slip.'}]);
    return xq(`The absolute minimum of ${m`f(x,y)=${tex(f)}`} on the triangle with vertices ${mp([0,0])}, ${mp([a,0])}, ${mp([0,a])} is 0. What is its absolute maximum there?`,opts,{kind:'expr',lv:2,how:'Check the interior, each edge (one-variable problems), and the vertices.',
      sol:[['On x + y = '+a+':',X`g(x)=x^2+(${a}-x)^2+${k}x(${a}-x)`],['Max at the midpoint.',X`g(${tex(frac(a,2))})=${tex(key)}`]],chk:{op:'absext',e:{f},n:{R:{type:'tri',a},ask:'max'}}});
  }
  if(fam==='ellreg'){ const a=pick([2,3,4,8]), c=ri(1,5); const f=`${c} + x^2*y^2`, key=frac(4*c+a,4);
    const opts=xm({a:key},[{a:String(c+a),why:'On the boundary x²y² = '+a+'(1 − y²)y², maximized at y² = ½.'},{a:frac(2*c+a,2),why:'At y² = ½ the product is '+a+'·½·½ = '+frac(a,4)+'.'},{a:frac(4*c+1,4),why:'x² = '+a+'(1 − y²), not 1 − y².'},{a:String(c+1),why:'Arithmetic slip.'},{a:frac(4*c+a*a,4),why:'x² = '+a+'(1 − y²): the factor is '+a+', not '+a*a+'.'},{a:String(c),why:'That is the minimum.'},{a:frac(8*c+a,8),why:'Arithmetic slip.'}]);
    return xq(`The absolute minimum of ${m`f(x,y)=${tex(f)}`} on the region ${m`\frac{x^2}{${a}}+y^2\le1`} is ${c}. What is its absolute maximum on that region?`,opts,{kind:'expr',lv:2,how:'Interior critical points give f = '+c+'; on the boundary substitute x² = '+a+'(1 − y²).',
      sol:[['Boundary.',X`f=${c}+${a}(1-y^2)y^2`],['Max at y² = ½.',X`${tex(key)}`]],chk:{op:'absell',e:{f},n:{a,b:1,region:true,ask:'max'}}});
  }
  const R=pick([2,3]), q=nz(-(R-1),R-1);
  const f=sumS(['x^2','y^2',mono(2*q,{y:1})]), M=2*R*R+q*q, mn=R*R-2*Math.abs(q)*R;
  const H=(a,b)=>`Max ${a}, min ${b}`;
  const dis=[[M,0],[2*R*R,mn],[M,R*R+2*Math.abs(q)*R],[2*R*R,0],[R*R+2*Math.abs(q)*R,mn],[M,mn-2],[M,R*R],[M-q*q,mn],[R*R,mn]].filter(p=>p[0]!==M||p[1]!==mn).map(p=>LBL(H(...p),'On the ellipse x² = '+2*R*R+' − 2y², so f = '+2*R*R+' − y² + '+2*q+'y for −'+R+' ≤ y ≤ '+R+': check the vertex y = '+q+' and both ends.'));
  const opts=xm({h:H(M,mn)},dis);
  return xq(`Find the absolute maximum and minimum of ${m`f(x,y)=${tex(f)}`} on the ellipse ${m`x^2+2y^2=${2*R*R}`}.`,opts,{kind:'choice',lv:2,how:'Eliminate x² with the constraint, then optimize in y over its allowed interval.',
    sol:[['',X`f=${2*R*R}-y^2${q<0?'-':'+'}${2*Math.abs(q)}y,\quad -${R}\le y\le ${R}`],[H(M,mn)+'.','']],chk:{op:'absell',e:{f},n:{a:2*R*R,b:R*R,region:false,ask:'pair',M,m:mn}}});
});
