
/* =====================================================================
   17.1 VECTOR FIELDS · 17.2 LINE INTEGRALS · 17.3 CONSERVATIVE FIELDS
   17.4 GREEN'S THEOREM · 17.5 DIVERGENCE & CURL · 17.6 SURFACE INTEGRALS
   ===================================================================== */
/* ---- a tiny symbolic layer: atoms c·u(x)·v(y)·w(z), u ∈ 1, v, v², v³, sin v, cos v, eᵛ ---- */
const FD={'1':[null,0],'v':['1',1],'v2':['v',2],'v3':['v2',3],'sin':['cos',1],'cos':['sin',-1],'exp':['exp',1]};
const facS=(f,v)=>({'1':'','v':v,'v2':`${v}^2`,'v3':`${v}^3`,'sin':`sin(${v})`,'cos':`cos(${v})`,'exp':`e^(${v})`})[f];
const atomKey=a=>{ const body=['x','y','z'].map(v=>facS(a.f[v],v)).filter(Boolean).join('*'); return body?(a.c===1?body:a.c===-1?'-'+body:`${a.c}*${body}`):String(a.c); };
const atomId=a=>['x','y','z'].map(v=>a.f[v]).join('|');
function polyNorm(P){ const m={}; P.forEach(a=>{ const k=atomId(a); if(m[k]) m[k].c+=a.c; else m[k]={c:a.c,f:{...a.f}}; }); return Object.values(m).filter(a=>a.c!==0); }
const polyKey=P=>{ P=polyNorm(P); return P.length?sumS(P.map(atomKey)):'0'; };
function dA(a,v){ const f=a.f[v], d=FD[f]; if(!d[0]) return null; return {c:a.c*d[1],f:{...a.f,[v]:d[0]}}; }
const dP=(P,v)=>polyNorm(P.map(a=>dA(a,v)).filter(Boolean));
const negP=P=>P.map(a=>({c:-a.c,f:{...a.f}}));
const subP=(A,B)=>polyNorm(A.concat(negP(B)));
const atom=(c,fx,fy,fz)=>({c,f:{x:fx||'1',y:fy||'1',z:fz||'1'}});
function randAtom(){
  for(;;){ const F=['1','1','v','v','v2','sin','cos','exp'], a=atom(nz(-3,3),pick(F),pick(F),pick(F));
    const n=['x','y','z'].filter(v=>a.f[v]!=='1').length, trans=['x','y','z'].filter(v=>/sin|cos|exp/.test(a.f[v])).length;
    if(n>=1&&n<=2&&trans<=1) return a; }
}
const vecK=Fs=>V(...Fs.map(polyKey));
const vecTex=Fs=>`\\left\\langle ${Fs.map(P=>T(polyKey(P))).join(',\\ ')}\\right\\rangle`;
const curlP=([P,Q,R])=>[subP(dP(R,'y'),dP(Q,'z')),subP(dP(P,'z'),dP(R,'x')),subP(dP(Q,'x'),dP(P,'y'))];
const divP=([P,Q,R])=>polyNorm(dP(P,'x').concat(dP(Q,'y'),dP(R,'z')));
const gradP=f=>[dP(f,'x'),dP(f,'y'),dP(f,'z')];
const evP=(P,env)=>val(polyKey(P).replace(/\b([xyz])\b/g,m=>`(${env[m]})`));

/* ---- figures: vector-field arrows on a grid, and a winding path ---- */
function vfSVG(Pk,Qk,o){
  o=o||{}; const n=o.n||5, L=2, W=300, pad=26, s=(W-2*pad)/(2*L), X=x=>pad+(x+L)*s, Y=y=>W-pad-(y+L)*s;
  const pts=[]; for(let i=0;i<n;i++) for(let j=0;j<n;j++){ const x=-L+2*L*i/(n-1), y=-L+2*L*j/(n-1);
    let u=0,v=0; try{ u=mEval(mParse(Pk),{x,y}); v=mEval(mParse(Qk),{x,y}); }catch(e){} pts.push([x,y,u,v]); }
  const mx=Math.max(1e-9,...pts.map(p=>Math.hypot(p[2],p[3]))), unit=(2*L/(n-1))*0.42*s;
  let g=`<line class="vax" x1="${X(-L)-8}" y1="${Y(0)}" x2="${X(L)+8}" y2="${Y(0)}"/><line class="vax" x1="${X(0)}" y1="${Y(-L)-8}" x2="${X(0)}" y2="${Y(L)+8}"/>`+
    `<text class="vlab" x="${X(L)+6}" y="${Y(0)-6}">x</text><text class="vlab" x="${X(0)+6}" y="${Y(L)-2}">y</text>`;
  pts.forEach(([x,y,u,v])=>{ const m=Math.hypot(u,v); if(m<1e-9){ g+=`<circle class="vdot" cx="${X(x)}" cy="${Y(y)}" r="2.2"/>`; return; }
    const len=unit*(0.35+0.65*m/mx), dx=u/m*len, dy=-v/m*len, x0=X(x)-dx/2, y0=Y(y)-dy/2, x1=x0+dx, y1=y0+dy, a=Math.atan2(dy,dx), h=6.5;
    g+=`<line class="varr" x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"/>`+
      `<path class="vhead" d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${(x1-h*Math.cos(a-0.45)).toFixed(1)} ${(y1-h*Math.sin(a-0.45)).toFixed(1)} L${(x1-h*Math.cos(a+0.45)).toFixed(1)} ${(y1-h*Math.sin(a+0.45)).toFixed(1)}Z"/>`; });
  return `<svg class="vfig" viewBox="0 0 ${W} ${W}" role="img" aria-label="${esc(o.label||'vector field plot')}">${g}</svg>`;
}
function pathSVG(A,B,lab){
  const W=320,H=220,pad=28, xs=[A[0],B[0]], ys=[A[1],B[1]];
  const x0=Math.min(...xs,0)-1.2, x1=Math.max(...xs,0)+1.2, y0=Math.min(...ys,0)-1, y1=Math.max(...ys,0)+1.4;
  const sx=(W-2*pad)/(x1-x0), sy=(H-2*pad)/(y1-y0), s=Math.min(sx,sy), X=x=>pad+(x-x0)*s, Y=y=>H-pad-(y-y0)*s;
  const mid=[(A[0]+B[0])/2+0.9,(A[1]+B[1])/2+0.8], r=0.45*s;
  const d=`M${X(A[0])} ${Y(A[1])} L${X(A[0]+0.8)} ${Y(A[1]-0.5)} L${X(mid[0])} ${Y(mid[1]-0.6)} A${r} ${r} 0 0 0 ${X(mid[0]-0.9)} ${Y(mid[1]-0.6)} `+
    `L${X(mid[0]-1.1)} ${Y(mid[1]+0.4)} A${r*0.8} ${r*0.8} 0 0 1 ${X(B[0]+0.6)} ${Y(B[1]+0.5)} L${X(B[0])} ${Y(B[1])}`;
  return `<svg class="vfig" viewBox="0 0 ${W} ${H}" role="img" aria-label="a winding path made of segments and semicircles from A to B">`+
    `<line class="vax" x1="${X(x0)}" y1="${Y(0)}" x2="${X(x1)}" y2="${Y(0)}"/><line class="vax" x1="${X(0)}" y1="${Y(y0)}" x2="${X(0)}" y2="${Y(y1)}"/>`+
    `<path class="vpath" d="${d}"/><circle class="vpt" cx="${X(A[0])}" cy="${Y(A[1])}" r="4"/><circle class="vpt" cx="${X(B[0])}" cy="${Y(B[1])}" r="4"/>`+
    `<text class="vlab" x="${X(A[0])-14}" y="${Y(A[1])+16}">${lab[0]}</text><text class="vlab" x="${X(B[0])+8}" y="${Y(B[1])-8}">${lab[1]}</text></svg>`;
}

/* ---------- 17.1: which field is pictured (F2023-Q10, S2022-Q4, F2017-Q8) ---------- */
const VF2=[['x','-y'],['-y','x'],['y','x'],['1','y'],['y','1'],['x','1'],['1','x'],['-x','-y'],['x','y'],['y','-x'],['-y','1'],['1','-y'],['0','x'],['y','0'],['x - y','x + y'],['x','0'],['0','y'],['-1','x']];
function P_vfPic(){
  const K=pick(VF2), others=shuf(VF2.filter(f=>f!==K)).filter(f=>f[0]===K[0]||f[1]===K[1]||coin(0.35)).slice(0,5);
  if(others.length<5) return null;
  const h=f=>`\\(\\mathbf F(x,y)=\\langle ${T(f[0])},\\ ${T(f[1])}\\rangle\\)`;
  const why=f=>{ const p=[[1,1],[1,-1],[-1,1],[2,1],[1,2],[-1,-1]].map(([x,y])=>[x,y,val(f[0].replace(/x/g,`(${x})`).replace(/y/g,`(${y})`)),val(f[1].replace(/x/g,`(${x})`).replace(/y/g,`(${y})`)),
      val(K[0].replace(/x/g,`(${x})`).replace(/y/g,`(${y})`)),val(K[1].replace(/x/g,`(${x})`).replace(/y/g,`(${y})`))]).find(r=>Math.abs(r[2]*r[5]-r[3]*r[4])>1e-9||r[2]*r[4]+r[3]*r[5]<0)||[1,1,0,0];
    return `At (${p[0]}, ${p[1]}) this field is ⟨${p[2]}, ${p[3]}⟩, which does not point the way the arrow there does.`; };
  const opts=[OK(h(K),{F:K})].concat(others.map(f=>NO(h(f),why(f),{F:f})));
  const o=choiceQ(`Which vector field is pictured?${figBox(vfSVG(K[0],K[1],{label:'arrows of a planar vector field on a 5 by 5 grid from −2 to 2'}))}`,opts,
    'Test a few points: the arrows on the x-axis (y = 0) and on the y-axis (x = 0) usually settle it; then check the sign of each component in one quadrant.',
    [['Check points on the axes, then one point in a quadrant: at \\((1,1)\\) the pictured arrow is \\(\\langle '+T(String(val(K[0].replace(/[xy]/g,'(1)'))))+','+T(String(val(K[1].replace(/[xy]/g,'(1)'))))+'\\rangle\\) (up to length).',`\\mathbf F=\\langle ${T(K[0])},\\ ${T(K[1])}\\rangle`]],undefined,2);
  o.chk={op:'fields',key:K,opts:o.opts.map(x=>x.s&&x.s.F)}; return o;
}
/* ---------- 17.1: gradient fields are normal to level curves (F2024-Q10, 17.1 #43–52) ---------- */
function P_vfNormal(){
  const G=pick([['x^2 - 2*y^2','x^2-2y^2',['2x','-4y'],['4y','2x']],['x^2 + 3*y^2','x^2+3y^2',['2x','6y'],['-6y','2x']],['y - x^2','y-x^2',['-2x','1'],['-1','-2x']],
    ['x*y','xy',['y','x'],['-x','y']],['x^2*y','x^2y',['2xy','x^2'],['-x^2','2xy']],['x - y^2','x-y^2',['1','-2y'],['2y','1']]]);
  const tangent=coin(0.3), gr=G[2], tg=G[3], neg=s=>s[0]==='-'?s.slice(1):'-'+s;
  const key=tangent?tg:gr, other=tangent?gr:tg;
  const h=f=>`\\(\\mathbf F(x,y)=\\left\\langle ${T(f[0])},\\ ${T(f[1])}\\right\\rangle\\)`;
  const C=[[key,''],[other,tangent?'That is ∇g, perpendicular to the curves.':'That field is TANGENT to the curves: it is ∇g rotated by 90°.'],
    [[key[0],neg(key[1])],'One component has the wrong sign.'],[[key[1],key[0]],'Swapped the components.'],[['2','-4'],'A constant field cannot follow the curves.'],
    [[`(${key[0]})^2`,`(${key[1]})^2`],'Squared the components.'],[[neg(key[0]),key[1]],'One component has the wrong sign.']];
  const seen=new Set(), opts=[];
  C.forEach((c,i)=>{ const hh=h(c[0]); if(seen.has(hh)) return; seen.add(hh); opts.push(i===0?OK(hh,{F:c[0]}):NO(hh,c[1],{F:c[0]})); });
  const o=choiceQ(`Let \\(C\\) be any curve \\(${G[1]}=k\\) (\\(k\\) a constant). Which vector field is ${tangent?'tangent':'orthogonal'} to \\(C\\) at every point of \\(C\\)?`,opts,
    'The gradient of g is perpendicular to the level curves g = k; rotating it by 90° gives a tangent field.',
    [['',`\\nabla(${G[1]})=\\left\\langle ${T(gr[0])},\\ ${T(gr[1])}\\right\\rangle`]],undefined,2);
  o.chk={op:'normal',g:G[0],tangent:tangent?1:0,opts:o.opts.map(x=>x.s.F)}; return o;
}
/* ---------- 17.1: equipotential curves from the gradient (S2025-Q7) ---------- */
function P_vfEquip(){
  const C=pick([[['2x','2y'],'Circles','φ = x² + y² + C: level curves are circles.'],[['ax','by'],'Non-circular ellipses',''],[['ax','-by'],'Hyperbolas',''],[['a','by'],'Parabolas',''],[['a','b'],'Lines',''],[['y','x'],'Hyperbolas','φ = xy: level curves xy = c are hyperbolas.']]);
  const a=pick([2,4,6]), b=pick([2,4,6].filter(x=>x!==a)), sub=s=>s.replace('a',a).replace('b',b);
  const g=C[0].map(sub), name=C[1];
  const phi={Circles:'x^2+y^2',['Non-circular ellipses']:`${a/2===1?'':a/2}x^2+${b/2===1?'':b/2}y^2`,Hyperbolas:C[0][0]==='y'?'xy':`${a/2===1?'':a/2}x^2-${b/2===1?'':b/2}y^2`,Parabolas:`${a}x+${b/2===1?'':b/2}y^2`,Lines:`${a}x+${b}y`}[name];
  const all=['Lines','Isolated points','Non-circular ellipses','Hyperbolas','Circles','Parabolas'];
  const W={Lines:'Lines come from a constant gradient (φ linear).','Isolated points':'Level curves of a nonconstant φ are curves, not points.','Non-circular ellipses':'Ellipses need both squares with the same sign and different coefficients.',
    Hyperbolas:'Hyperbolas need the squares with opposite signs (or φ = xy).',Circles:'Circles need equal coefficients on x² and y².',Parabolas:'A parabola needs one variable squared and the other to the first power.'};
  const opts=[OK(name)].concat(all.filter(x=>x!==name).map(x=>NO(x,W[x])));
  return choiceQ(`If \\(\\nabla\\varphi=\\left\\langle ${T(g[0])},\\ ${T(g[1])}\\right\\rangle\\), then the equipotential curves (level curves of \\(\\varphi\\)) are`,opts,
    'Integrate to find φ (up to a constant), then name its level curves φ = c.',[['',`\\varphi=${phi}+C`]],undefined,2);
}
/* ---------- 17.1: gradient field at a point (sprint, 17.1 #35–42) ---------- */
function P_vfGrad(){
  const F=['1','v','v2'], A=()=>atom(nz(-3,3),pick(F),pick(F),pick(F));
  const f=[A(),A()], P=[ri(-2,2),ri(-2,2),ri(-1,2)], g=gradP(f), env={x:P[0],y:P[1],z:P[2]};
  if(g.every(c=>!c.length)) return null;
  const vals=g.map(c=>c.length?evP(c,env):0); if(vals.some(v=>!Number.isFinite(v)||Math.abs(v)>200)) return null;
  const ans=V(...vals.map(v=>String(Math.round(v))));
  return valQ(`Let \\(\\varphi(x,y,z)=${T(polyKey(f))}\\). Find the gradient field \\(\\mathbf F=\\nabla\\varphi\\) at \\(${ptx(P)}\\).`,ans,[D_(V(...vals.map(v=>String(-Math.round(v)))),'Sign error.')],
    '∇φ = ⟨φ_x, φ_y, φ_z⟩, then plug in the point.',[['',`\\nabla\\varphi=${vecTex(g)}`],['',`\\nabla\\varphi${ptx(P)}=${T(ans)}`]],{op:'grad',f:polyKey(f),at:P,want:vals.map(v=>Math.round(v))},1,{kind:'vec'});
}
/* ---------- 17.2: scalar line integral on a segment (F2023-Q4, F2017-Q9) ---------- */
const DIRS=[[2,1,2,3],[1,2,2,3],[2,3,6,7],[4,0,3,5],[0,3,4,5],[2,-1,2,3],[1,4,8,9],[3,4,0,5]];
function P_lsSeg(){
  if(coin(0.4)){
    for(;;){
      const [dx,dy,,L]=pick([[3,4,0,5],[4,3,0,5],[6,8,0,10],[5,12,0,13],[3,-4,0,5]]), P=[ri(-1,3),ri(-2,2)], al=pick([1,2,-1]), be=pick([1,-1,2]);
      const u0=al*P[0]+be*P[1], u1=al*(P[0]+dx)+be*(P[1]+dy);
      if(u0<=0||u1<=0||u0===u1) continue;
      const ans=Rs(Rr(L,u0*u1)), Q=[P[0]+dx,P[1]+dy], uT=linTex([al,be],['x','y']);
      const dis=[D_(Rs(Rr(1,u0*u1)),'Forgot ds = |r′(t)| dt = '+L+' dt.'),D_(Rs(Rr(L*L,u0*u1)),'Used |r′|² instead of |r′|.'),D_(Rs(Rr(L*(u1-u0),u0*u1)),'Forgot the 1/Δu from the substitution.'),
        D_(Rs(Rr(L,u1*u1)),'Used the value of f at the end point times the length.'),D_(Rs(Rr(-L,u0*u1)),'A scalar line integral does not change sign with direction, and f > 0 here.'),D_(Rs(Rr(L,u0*u0)),'Used f at the start point times the length.')];
      return valQ(`Evaluate \\(\\displaystyle\\int_C\\frac{1}{(${uT})^2}\\,ds\\), where \\(C\\) is the line segment from \\(${ptx(P)}\\) to \\(${ptx(Q)}\\).`,ans,dis,
        'Parametrize r(t) = P + t(Q − P), 0 ≤ t ≤ 1; ds = |Q − P| dt.',
        [['',`\\mathbf r(t)=${ptx(P)}+t\\langle ${dx},${dy}\\rangle,\\quad ds=${L}\\,dt,\\quad ${uT}=${u0}+${u1-u0}t`],['',`\\int_0^1\\frac{${L}}{(${u0}+${u1-u0}t)^2}\\,dt=\\frac{${L}}{${u0}\\cdot ${u1}}=${T(ans)}`]],
        {op:'ls',f:`1/(${linKey([al,be],['x','y'])})^2`,r:[`${P[0]} + ${dx}*t`,`${P[1]} + ${dy}*t`],t:['0','1']},2);
    }
  }
  const [dx,dy,dz,L]=pick(DIRS), P=[ri(-1,2),ri(-1,2),ri(-1,2)], Q=[P[0]+dx,P[1]+dy,P[2]+dz], c=[nz(-2,3),nz(-2,3),pick([1,2,-1])], k=ri(0,3);
  const f=v=>c[0]*v[0]+c[1]*v[1]+c[2]*v[2]+k, fM=Rr(f(P)+f(Q),2), ans=Rs(Rmul(fM,[L,1]));
  if(fM[0]===0) return null;
  const fk=sumS([mono(c[0],{x:1}),mono(c[1],{y:1}),mono(c[2],{z:1}),String(k)]);
  const dis=[D_(Rs(fM),'Forgot ds = |Q − P| dt = '+L+' dt.'),D_(String(L*f(Q)),'Used f at the end point instead of integrating.'),D_(String(L*(f(P)+f(Q))),'Forgot the ½ from ∫t dt.'),
    D_(Rs(Rmul(fM,[L*L,1])),'Used |r′|² instead of |r′|.'),D_(Rs(Rmul(fM,[-L,1])),'Reversed direction changes nothing for a scalar line integral.'),D_(String(L*f(P)),'Used f at the start point instead of integrating.')];
  return valQ(`Evaluate \\(\\displaystyle\\int_C(${T(fk)})\\,ds\\), where \\(C\\) is the line segment from \\(${ptx(P)}\\) to \\(${ptx(Q)}\\).`,ans,dis,
    'r(t) = P + t(Q − P), ds = |Q − P| dt. For a linear f this equals length × f(midpoint).',
    [['',`|Q-P|=|\\langle ${dx},${dy},${dz}\\rangle|=${L}`],['',`\\int_0^1 f(\\mathbf r(t))\\,${L}\\,dt=${L}\\cdot\\frac{f(P)+f(Q)}{2}=${L}\\cdot\\frac{${f(P)}+${f(Q)}}{2}=${T(ans)}`]],
    {op:'ls',f:fk,r:[`${P[0]} + ${dx}*t`,`${P[1]} + ${dy}*t`,`${P[2]} + ${dz}*t`],t:['0','1']},2);
}
/* ---------- 17.2: on a helix (S2022-Q2, F2019-Q10, S2018-Q10, S2017-Q9) ---------- */
function P_lsHelix(){
  const [a,b,sc,sr]=pick([[3,4,5,1],[4,3,5,1],[5,12,13,1],[1,1,1,2],[2,2,2,2]]), kind=pick(['z','r2','xy','x']);
  const Tm={z:pick(['pi','2pi','pi/2']),r2:pick(['pi','2pi','pi/2']),xy:pick(['pi/2','pi/4']),x:'pi/2'}[kind];
  const tr=toR(val(Tm)/Math.PI);
  let ans,f,ft,int,wr;
  if(kind==='z'){ f='z'; ft='z'; ans=mv(Rmul([sc*b,2],Rmul(tr,tr)),sr,2); int=`${b}t`; wr=[mv(Rmul([b,2],Rmul(tr,tr)),1,2),'Forgot ds = |r′(t)| dt.']; }
  else if(kind==='r2'){ f='x^2 + y^2'; ft='x^2+y^2'; ans=mv(Rmul([sc*a*a,1],tr),sr,1); int=`${a*a}`; wr=[mv(Rmul([a*a,1],tr),1,1),'Forgot ds = |r′(t)| dt.']; }
  else if(kind==='xy'){ f='x*y'; ft='xy'; const s2=Tm==='pi/2'?[1,1]:[1,2]; ans=mv(Rmul([sc*a*a,2],s2),sr,0); int=`${a*a}\\cos t\\sin t`; wr=[Rs(Rmul([a*a,2],s2)),'Forgot ds = |r′(t)| dt.']; }
  else { f='x'; ft='x'; ans=mv([sc*a,1],sr,0); int=`${a}\\cos t`; wr=[String(a),'Forgot ds = |r′(t)| dt.']; }
  const S=sr===1?String(sc):sc===1?'sqrt(2)':`${sc}sqrt(2)`, S2=sc*sc*sr;
  const ansN=val(ans), alt=r=>mv(r,1,0);
  const dis=[D_(wr[0],wr[1]),D_(`${S2}*(${wr[0]})`,'Used |r′|² instead of |r′|.'),D_(`${a}*(${wr[0]})`,'Used the circle’s radius '+a+' as the speed; the helix also climbs.'),
    D_(`-(${ans})`,'A scalar line integral does not depend on direction.'),D_(kind==='z'?`2*(${ans})`:kind==='xy'?'0':`2*(${ans})`,kind==='z'?'Forgot the ½ in ∫t dt = t²/2.':kind==='xy'?'Over this range sin t cos t is not symmetric about 0.':'Doubled the range of t.'),
    D_(`${b}*(${wr[0]})`,'Used the climb rate '+b+' as the speed.')];
  const Tt=ANG[Tm].t;
  return valQ(`Evaluate \\(\\displaystyle\\int_C ${ft}\\,ds\\), where \\(C\\) is the helix \\(\\mathbf r(t)=\\langle ${a===1?'':a}\\cos t,\\ ${a===1?'':a}\\sin t,\\ ${b===1?'':b}t\\rangle\\), \\(0\\le t\\le ${Tt}\\).`,ans,dis,
    'ds = |r′(t)| dt, and for a helix |r′| = √(a² + b²) is constant.',
    [['',`|\\mathbf r'(t)|=\\sqrt{${a*a}+${b*b}}=${T(S)}`],['',`\\int_0^{${Tt}}${int}\\cdot ${T(S)}\\,dt=${T(ans)}`]],
    {op:'ls',f,r:[`${a}*cos(t)`,`${a}*sin(t)`,`${b}*t`],t:['0',ANG[Tm].k]},2);
}
/* ---------- 17.2: the integrand cancels the speed (S2025-Q2, F2024-Q11, S2019-Q10) ---------- */
function P_lsCancel(){
  const fam=pick(['3d','2d','2dnocancel','cubic']);
  if(fam==='3d'){ const T_=pick([1,2]), k=pick([1,2,3,6]), ans=Rs(Rr(k*Math.pow(T_,6),6));
    return valQ(`Evaluate \\(\\displaystyle\\int_C\\frac{${k===1?'':k}xyz}{\\sqrt{1+8y}}\\,ds\\), where \\(C\\) is \\(\\mathbf r(t)=\\langle t,\\ t^2,\\ t^2\\rangle\\), \\(0\\le t\\le ${T_}\\).`,ans,
      [D_(Rs(Rr(k*Math.pow(T_,6),5)),'Integrated t⁵ to t⁶/5.'),D_(Rs(Rr(k*Math.pow(T_,5),5)),'Used xyz = t⁴ (it is t·t²·t² = t⁵).'),D_(Rs(Rr(k*Math.pow(T_,6),3)),'Doubled: |r′| = √(1 + 8t²) cancels exactly.'),
       D_(Rs(Rr(k*Math.pow(T_,7),7)),'Used t⁶ for xyz.'),D_(Rs(Rr(k*Math.pow(T_,6),12)),'Halved: there is no ½ here.'),D_(Rs(Rr(-k*Math.pow(T_,6),6)),'Sign error.')],
      'ds = |r′(t)| dt = √(1 + 4t² + 4t²) dt = √(1 + 8t²) dt, and on C, 1 + 8y = 1 + 8t²: the square roots cancel.',
      [['',`|\\mathbf r'(t)|=\\sqrt{1+8t^2},\\qquad \\sqrt{1+8y}=\\sqrt{1+8t^2}`],['',`\\int_0^{${T_}}${k===1?'':k}t\\cdot t^2\\cdot t^2\\,dt=${T(ans)}`]],{op:'ls',f:`${k}*x*y*z/sqrt(1 + 8*y)`,r:['t','t^2','t^2'],t:['0',String(T_)]},2); }
  if(fam==='2d'){ const T_=pick([1,2,3]), k=pick([2,4,6]), ans=Rs(Rr(k*T_*T_,2));
    return valQ(`Evaluate \\(\\displaystyle\\int_C\\frac{${k}x}{\\sqrt{1+4y}}\\,ds\\), where \\(C\\) is the parabola \\(y=x^2\\) from \\((0,0)\\) to \\((${T_},${T_*T_})\\).`,ans,
      [D_(String(k*T_*T_),'Forgot the ½ in ∫t dt.'),D_(Rs(Rr(k*T_,1)),'Integrated as if f were constant.'),D_(Rs(Rr(k*T_*T_*T_,3)),'Used x = t² on the parabola; with x = t, y = t².'),
       D_(Rs(Rr(k*T_*T_,4)),'Halved twice.'),D_(Rs(Rr(-k*T_*T_,2)),'Sign error.'),D_(Rs(Rr(k*(Math.pow(1+4*T_*T_,1.5)-1),12)).replace(/\.\d+/,''),'—')].filter(d=>d.why!=='—'),
      'Parametrize x = t, y = t²: |r′| = √(1 + 4t²) = √(1 + 4y), which cancels.',[['',`\\int_0^{${T_}}\\frac{${k}t}{\\sqrt{1+4t^2}}\\sqrt{1+4t^2}\\,dt=${T(ans)}`]],{op:'ls',f:`${k}*x/sqrt(1 + 4*y)`,r:['t','t^2'],t:['0',String(T_)]},2); }
  if(fam==='2dnocancel'){ const T_=pick([1,2]), k=pick([1,2,4]), ans=Rs(Rmul([k,1],Radd(Rr(T_*T_,2),[Math.pow(T_,4),1])));
    return valQ(`Evaluate \\(\\displaystyle\\int_C ${k===1?'':k}x\\sqrt{1+4y}\\,ds\\), where \\(C\\) is the parabola \\(y=x^2\\) from \\((0,0)\\) to \\((${T_},${T_*T_})\\).`,ans,
      [D_(Rs(Rr(k*T_*T_,2)),'Thought the roots cancel: here they multiply, giving 1 + 4t².'),D_(Rs(Rmul([k,1],Radd(Rr(T_*T_,2),Rr(Math.pow(T_,4),2)))),'Integrated 4t³ to t⁴/2.'),D_(Rs(Rmul([k,1],Radd([T_*T_,1],[Math.pow(T_,4),1]))),'Integrated t to t².'),
       D_(Rs(Rmul([k,1],Radd(Rr(T_*T_,2),Rr(4*Math.pow(T_,4),3)))),'Integrated 4t³ to 4t⁴/3.'),D_(Rs(Rmul([k,1],Rr(Math.pow(T_,4),1))),'Dropped the t term.'),D_(Rs(Rmul([-k,1],Radd(Rr(T_*T_,2),[Math.pow(T_,4),1]))),'Sign error.')],
      'x = t, y = t²: ds = √(1 + 4t²) dt and √(1 + 4y) = √(1 + 4t²), so the integrand becomes t(1 + 4t²).',[['',`\\int_0^{${T_}}${k===1?'':k}t\\,(1+4t^2)\\,dt=${T(ans)}`]],{op:'ls',f:`${k}*x*sqrt(1 + 4*y)`,r:['t','t^2'],t:['0',String(T_)]},2); }
  const k=pick([3,9]), c=Rr(4*k,9), ans=`${Rs(c)}*(5sqrt(5) - 2sqrt(2))`.replace(/^1\*/,'');
  return valQ(`Evaluate \\(\\displaystyle\\int_C\\frac{${k}x}{y}\\,ds\\), where \\(C\\) is \\(x=\\dfrac{t^3}{3},\\ y=\\dfrac{t^4}{4}\\), \\(1\\le t\\le 2\\).`,ans,
    [D_(`${Rs(c)}*(5sqrt(5) - 2)`,'Evaluated (1 + t²)^{3/2} at t = 1 as 1.'),D_(`${Rs(Rmul(c,[3,1]))}*(5sqrt(5) - 2sqrt(2))`,'Forgot the 1/3 from ∫t√(1 + t²) dt.'),D_(`${Rs(Rmul(c,[1,2]))}*(5sqrt(5) - 2sqrt(2))`,'Extra ½.'),
     D_(`${Rs(c)}*(2sqrt(2) - 5sqrt(5))`,'Upper and lower limits swapped.'),D_(`${Rs(Rr(4*k,3))}*ln(2)`,'Forgot ds: ∫(4/(3t)) dt is a log.'),D_(`${Rs(c)}*(5sqrt(5) - 1)`,'Used t from 0.')],
    '|r′| = √(t⁴ + t⁶) = t²√(1 + t²); x/y = 4/(3t).',[['',`\\int_1^2\\frac{${4*k}}{3t}\\,t^2\\sqrt{1+t^2}\\,dt=\\frac{${4*k}}{3}\\cdot\\frac13(1+t^2)^{3/2}\\Big|_1^2=${T(ans)}`]],{op:'ls',f:`${k}*x/y`,r:['t^3/3','t^4/4'],t:['1','2']},3);
}
/* ---------- 17.2: arcs of circles (F2019-Q11) ---------- */
function P_lsArc(){
  const R=pick([1,2,3]), arc=pick([['-pi/2','pi/2','the right half of the circle'],['0','pi','the upper half of the circle'],['0','pi/2','the quarter of the circle in the first quadrant']]), g=pick(['x','y','x2','r2','x','y']);
  const [t0,t1,words]=arc, s=v=>val(ANG[v].s), c=v=>val(ANG[v].c), len=toR((val(ANG[t1].k)-val(ANG[t0].k))/Math.PI);
  let ans,gt,gk;
  if(g==='x'){ gt='x'; gk='x'; ans=String(R*R*(s(t1)-s(t0))); }
  else if(g==='y'){ gt='y'; gk='y'; ans=String(R*R*(c(t0)-c(t1))); }
  else if(g==='x2'){ gt='x^2'; gk='x^2'; ans=mv(Rmul(len,[R*R*R,2]),1,1); }
  else { gt='x^2+y^2'; gk='x^2 + y^2'; ans=mv(Rmul(len,[R*R*R,1]),1,1); }
  const lin=g==='x'||g==='y';
  const dis=lin?[D_(String(R*(lin?(g==='x'?s(t1)-s(t0):c(t0)-c(t1)):1)),'Forgot ds = R dθ.'),D_(ans==='0'?String(2*R*R):'0',ans==='0'?'By symmetry the positive and negative values cancel here.':'The integrand does not change sign on this arc, so it cannot be 0.'),
      D_(String(-val(ans)||-R*R),'A scalar line integral does not change sign with orientation.'),D_(String(R*R*R),'Wrong power of R.'),D_(mv([R*R,1],1,1),'Integrated as if the integrand were R.'),D_(String(2*R*R*(g==='x'?1:1)+1),'—')].filter(d=>d.why!=='—')
    :[D_(mv(Rmul(len,[R*R,g==='x2'?2:1]),1,1),'Forgot ds = R dθ.'),D_(mv([R*R*R*(g==='x2'?1:2),1],1,1),'Used the whole circle.'),D_(mv(Rmul(len,[R*R*R,g==='x2'?1:2]),1,1),g==='x2'?'Used cos²θ ≈ 1: its average is ½.':'Halved.'),
      D_(mv(Rmul(len,[R*R,1]),1,1),'Used R² for the arc length element.'),D_(Rs(Rmul(len,[R*R*R,g==='x2'?2:1])),'Lost the π.'),D_(mv(Rmul(len,[Math.pow(R,4),g==='x2'?2:1]),1,1),'One power of R too many.')];
  return valQ(`Evaluate \\(\\displaystyle\\int_C ${gt}\\,ds\\), where \\(C\\) is ${words} \\(x^2+y^2=${R*R}\\).`,ans,dis,
    'x = R cos θ, y = R sin θ, ds = R dθ.',[['\\(\\theta\\) from \\('+ANG[t0].t+'\\) to \\('+ANG[t1].t+'\\).',`\\int ${g==='x'?'R\\cos\\theta':g==='y'?'R\\sin\\theta':g==='x2'?'R^2\\cos^2\\theta':'R^2'}\\cdot R\\,d\\theta=${T(ans)}`]],
    {op:'ls',f:gk,r:[`${R}*cos(t)`,`${R}*sin(t)`],t:[ANG[t0].k,ANG[t1].k]},2);
}
/* ---------- 17.2: average value along a curve (17.2 #37–38) ---------- */
function P_lsAvg(){
  const R=pick([1,2,3,4,6]), kind=pick(['semiy','quarterx','fullx2']);
  const ans={semiy:`${2*R}/pi`,quarterx:`${2*R}/pi`,fullx2:Rs(Rr(R*R,2))}[kind];
  const q={semiy:`the upper half of the circle \\(x^2+y^2=${R*R}\\)`,quarterx:`the quarter of the circle \\(x^2+y^2=${R*R}\\) in the first quadrant`,fullx2:`the circle \\(x^2+y^2=${R*R}\\)`}[kind];
  const f={semiy:'y',quarterx:'x',fullx2:'x^2'}[kind];
  const dis=kind==='fullx2'?[D_(String(R*R),'Averaged cos²θ to 1; its average is ½.'),D_(mv([R*R*R,1],1,1),'That is the integral; divide by the length 2πR.'),D_(Rs(Rr(R,2)),'Wrong power of R.'),D_('0','x² ≥ 0, so its average is positive.'),D_(Rs(Rr(R*R,4)),'Divided by 2 twice.')]
    :[D_(String(2*R*R),'That is the integral; divide by the arc length.'),D_(Rs(Rr(R,2)),'Used the midpoint of [0, R].'),D_(`${R}/pi`,'Divided by twice the length.'),D_(`${4*R}/(3pi)`,'That is the centroid of the REGION (the half-disk), not of the curve.'),D_(`${4*R}/pi`,'Divided by half the length.'),D_(String(R),'Used the radius.')];
  return valQ(`Find the average value of \\(f=${f}\\) on ${q}.`,ans,dis,'Average on a curve = ∫_C f ds / (length of C).',
    [['',`\\bar f=\\frac{1}{L}\\int_C ${f}\\,ds=${T(ans)}`]],{op:'ratio',num:{op:'ls',f,r:[`${R}*cos(t)`,`${R}*sin(t)`],t:kind==='quarterx'?['0','pi/2']:kind==='semiy'?['0','pi']:['0','2*pi']},den:{op:'val',e:kind==='quarterx'?`pi*${R}/2`:kind==='semiy'?`pi*${R}`:`2*pi*${R}`}},2);
}

/* ---------- 17.2: work along a segment, and why the path matters (S2022-Q11) ---------- */
function P_wSeg(){
  const [a,b,c]=[pick([1,2,3]),pick([1,2,3]),pick([1,2,4])], [al,be,ga]=[nz(-2,3),nz(-2,3),nz(-2,3)];
  const S=al*a*b+be*b*c+ga*c*a, ans=Rs(Rr(S,2)); if(S===0) return null;
  const F=`\\left\\langle ${T(mono(al,{y:1}))},\\ ${T(mono(be,{z:1}))},\\ ${T(mono(ga,{x:1}))}\\right\\rangle`;
  const dis=[D_(String(ga*a*c),'That is the work along the axes (x first, then y, then z). This field is not conservative, so the path matters.'),D_(String(S),'Forgot the ½ from ∫t dt.'),
    D_(Rs(Rr(-S,2)),'Sign error.'),D_(Rs(Rr(S,3)),'Integrated t² instead of t.'),D_('0','The field is not conservative and the path is not closed, so there is no reason for 0.'),D_(String(al*a+be*b+ga*c),'Dotted F with the direction without the positions.')];
  return valQ(`Find the work done by \\(\\mathbf F(x,y,z)=${F}\\) on a particle moving along the line segment from \\((0,0,0)\\) to \\((${a},${b},${c})\\).`,ans,dis,
    'W = ∫F · dr with r(t) = t⟨a, b, c⟩, 0 ≤ t ≤ 1.',[['',`\\mathbf F(\\mathbf r(t))\\cdot\\mathbf r'(t)=(${al}\\cdot ${b}t)(${a})+(${be}\\cdot ${c}t)(${b})+(${ga}\\cdot ${a}t)(${c})=${S}t`],['',`W=\\int_0^1 ${S}t\\,dt=${T(ans)}`]],
    {op:'lv',F:[mono(al,{y:1}),mono(be,{z:1}),mono(ga,{x:1})],r:[`${a}*t`,`${b}*t`,`${c}*t`],t:['0','1']},2);
}
/* ---------- 17.2: a rotation field on an ellipse (F2023-Q12, S2018-Q9, S2025-Q10) ---------- */
function P_wRot(){
  const a=pick([1,2,3]), b=pick([1,2,3,4]), k=pick([1,2,3]), arc=pick([['0','pi/2','from \\(('+a+',0)\\) to \\((0,'+b+')\\) (counterclockwise)'],['0','pi','from \\(('+a+',0)\\) to \\((-'+a+',0)\\) through \\((0,'+b+')\\)'],['0','2pi','once around counterclockwise'],['pi/2','0','from \\((0,'+b+')\\) to \\(('+a+',0)\\) (clockwise)']]);
  const len=toR((val(ANG[arc[1]].k)-val(ANG[arc[0]].k))/Math.PI), ans=mv(Rmul(len,[k*a*b,1]),1,1);
  const F=k===1?'\\langle -y,\\ x\\rangle':`\\langle -${k}y,\\ ${k}x\\rangle`;
  const dis=[D_('0','⟨−y, x⟩ is not conservative: its curl is 2, so the work is not 0.'),D_(mv(Rmul(len,[k*(a*a+b*b),2]),1,1),'Used (a² + b²)/2 for xy′ − yx′; on the ellipse x y′ − y x′ = ab.'),D_(mv(Rmul(len,[-k*a*b,1]),1,1),'Orientation sign.'),
    D_(mv(Rmul(len,[k*a*b,2]),1,1),'Halved.'),D_(mv(Rmul(len,[k*(a+b),1]),1,1),'Used a + b instead of ab.'),D_(Rs(Rmul(len,[k*a*b,1])),'Lost the π.')];
  return valQ(`Find the work done by \\(\\mathbf F(x,y)=${F}\\) along the ellipse \\(\\mathbf r(t)=\\langle ${a===1?'':a}\\cos t,\\ ${b===1?'':b}\\sin t\\rangle\\) ${arc[2]}.`,ans,dis,
    'F(r(t)) · r′(t) = k(−y x′ + x y′) = k·ab(sin²t + cos²t) = kab, a constant.',[['',`\\mathbf F\\cdot\\mathbf r'=${k===1?'':k}\\left(${a*b}\\sin^2t+${a*b}\\cos^2t\\right)=${k*a*b}`],['',`W=${k*a*b}\\,\\Delta t=${T(ans)}`]],
    {op:'lv',F:[`-${k}*y`,`${k}*x`],r:[`${a}*cos(t)`,`${b}*sin(t)`],t:[ANG[arc[0]].k,ANG[arc[1]].k]},2);
}
/* ---------- 17.2/17.3: a radial field on a helix (S2024-Q2) ---------- */
function P_wRadial(){
  const R=pick([1,2,3]), h=pick([1,2,3,4]), k=pick([1,2,3]), Tm=pick(['2pi','pi','4pi']), m={pi:1,'2pi':2,'4pi':4}[Tm];
  const zEnd=Rr(h*m,2), ans=Rs(Rmul([k,2],Rmul(zEnd,zEnd)));
  const Tt=Tm==='pi'?'\\pi':Tm==='2pi'?'2\\pi':'4\\pi', Tk=Tm==='pi'?'pi':Tm==='2pi'?'2*pi':'4*pi';
  const dis=[D_(Rs(Rmul([k,1],Rmul(zEnd,zEnd))),'Forgot the ½ in φ = ½(x² + y² + z²).'),D_('0','The curve is not closed: it starts at height 0 and ends at height '+Rs(zEnd)+'.'),
    D_(Rs(Rmul([k,2],Radd([R*R,1],Rmul(zEnd,zEnd)))),'Forgot φ at the start point (R, 0, 0).'),D_(Rs(Rmul([k,1],zEnd)),'Used z instead of z²/2.'),D_(mv(Rmul([k*m,1],Rmul(zEnd,zEnd)),1,1),'Multiplied by the parameter length.'),D_(Rs(Rmul([-k,2],Rmul(zEnd,zEnd))),'Sign error.')];
  return valQ(`Find the work done by \\(\\mathbf F=${k===1?'':k}\\langle x,y,z\\rangle\\) along the helix \\(\\mathbf r(t)=\\left\\langle ${R}\\cos t,\\ ${R}\\sin t,\\ \\frac{${h}t}{2\\pi}\\right\\rangle\\), \\(0\\le t\\le ${Tt}\\).`,ans,dis,
    'F = ∇φ with φ = (k/2)(x² + y² + z²): use the endpoints. The x² + y² part is the same at both ends.',
    [['',`\\varphi=\\tfrac{${k}}{2}(x^2+y^2+z^2)`],['',`W=\\varphi(\\mathbf r(${Tt}))-\\varphi(\\mathbf r(0))=\\tfrac{${k}}{2}\\left(${R*R}+\\left(${T(Rs(zEnd))}\\right)^2\\right)-\\tfrac{${k}}{2}\\cdot ${R*R}=${T(ans)}`]],
    {op:'lv',F:[`${k}*x`,`${k}*y`,`${k}*z`],r:[`${R}*cos(t)`,`${R}*sin(t)`,`${h}*t/(2*pi)`],t:['0',Tk]},2);
}
/* ---------- 17.2: ∫P dx + Q dy along a segment or a parabola (S2019-Q9, F2017-Q10, S2017-Q10) ---------- */
function P_wDxDy(){
  if(coin(0.5)){
    const a=pick([1,2,3]), b=pick([1,2,3,6]), al=nz(-3,3), be=nz(-3,3), S=Rr(al*a*a*b+be*b*b*b,3), ans=Rs(S);
    const dis=[D_(Rs(Rr(al*a*b+be*b*b,3)),'Forgot dx = a dt and dy = b dt.'),D_(Rs(Rr(al*a*a*b+be*b*b*b,2)),'Integrated t² to t²/2.'),D_(Rs(Rneg(S)),'Sign error.'),
      D_(Rs(Rr(al*a*b*b+be*a*b*b,3)),'Swapped dx and dy.'),D_(String(al*a*a*b+be*b*b*b),'Forgot the 1/3.'),D_(Rs(Rr(al*a*a*b,3)),'Dropped the dy term.')];
    return valQ(`Evaluate \\(\\displaystyle\\int_C ${T(mono(al,{x:1,y:1}))}\\,dx${be<0?'':'+'}${T(mono(be,{y:2}))}\\,dy\\), where \\(C\\) is the line segment from \\((0,0)\\) to \\((${a},${b})\\).`,ans,dis,
      'x = at, y = bt, dx = a dt, dy = b dt.',[['',`\\int_0^1\\left(${al}(${a}t)(${b}t)(${a})+${be}(${b}t)^2(${b})\\right)dt=${T(ans)}`]],{op:'lv',F:[mono(al,{x:1,y:1}),mono(be,{y:2})],r:[`${a}*t`,`${b}*t`],t:['0','1']},2);
  }
  const c=pick([1,2]), al=nz(-3,3), be=nz(-3,3), S=Rr((al+2*be)*Math.pow(c,4),4), ans=Rs(S);
  if(S[0]===0) return null;
  const dis=[D_(Rs(Radd(Rr(al*Math.pow(c,4),4),Rr(be*c*c*c,3))),'Forgot dy = 2t dt.'),D_(Rs(Rr((al+be)*Math.pow(c,4),4)),'Dropped the 2 from dy = 2t dt.'),D_(Rs(Rneg(S)),'Sign error.'),
    D_(Rs(Rr((al*c*c+be*c*c)*c,3)),'Integrated along the straight segment instead of the parabola.'),D_(Rs(Rr((al+2*be)*Math.pow(c,3),3)),'Wrong power of t.'),D_(Rs(Rr((2*al+be)*Math.pow(c,4),4)),'Put the 2 on the dx term.')];
  return valQ(`Evaluate \\(\\displaystyle\\int_C\\mathbf F\\cdot d\\mathbf r\\) for \\(\\mathbf F(x,y)=\\left\\langle ${T(mono(al,{x:1,y:1}))},\\ ${T(mono(be,{y:1}))}\\right\\rangle\\) along \\(\\mathbf r(t)=\\langle t,\\ t^2\\rangle\\), \\(0\\le t\\le ${c}\\).`,ans,dis,
    'F(r(t)) · r′(t) with r′ = ⟨1, 2t⟩.',[['',`\\mathbf F\\cdot\\mathbf r'=${al}t^3+${be}t^2\\cdot 2t=${al+2*be}t^3`],['',`\\int_0^{${c}}${al+2*be}t^3\\,dt=${T(ans)}`]],{op:'lv',F:[mono(al,{x:1,y:1}),mono(be,{y:1})],r:['t','t^2'],t:['0',String(c)]},2);
}
/* ---------- 17.2/17.4: flux across a closed curve (F2024-Q12, 17.2 #59–60) ---------- */
function P_wFlux(){
  const a=pick([1,2,3]), b=pick([1,2,3]), p=pick([1,2,3]), q=pick([1,2,-1]), ask=pick(['flux','flux','circ']);
  const rot=coin(0.3);
  const F=rot?`\\langle -${p===1?'':p}y,\\ ${p===1?'':p}x\\rangle`:`\\langle ${p===1?'':p}x,\\ ${q===1?'':q===-1?'-':q}y\\rangle`;
  const val_=rot?(ask==='flux'?'0':mv([2*p*a*b,1],1,1)):(ask==='flux'?mv([(p+q)*a*b,1],1,1):'0');
  if(val_==='0'&&ask==='flux'&&!rot&&p+q===0) return null;
  const other=rot?(ask==='flux'?mv([2*p*a*b,1],1,1):'0'):(ask==='flux'?'0':mv([(p+q)*a*b,1],1,1));
  const dis=[D_(other,ask==='flux'?'That is the circulation ∮F·T ds; the flux is ∮F·n ds.':'That is the flux ∮F·n ds; the circulation is ∮F·T ds.'),
    D_(mv([(rot?2*p:p+q)*a*b,2],1,1),'Halved.'),D_(mv([(rot?2*p:p+q)*(a*a+b*b),2],1,1),'Used (a² + b²)/2 instead of ab.'),D_(mv([2*(rot?2*p:p+q)*a*b,1],1,1),'Doubled.'),
    D_(mv([-(rot?2*p:p+q)*a*b,1],1,1),'Used the inward normal.'),D_(Rs(Rr((rot?2*p:p+q)*a*b,1)),'Lost the π.')];
  return valQ(`Let \\(C\\) be the ellipse \\(\\mathbf r(t)=\\langle ${a===1?'':a}\\cos t,\\ ${b===1?'':b}\\sin t\\rangle\\), \\(0\\le t\\le 2\\pi\\). Find the ${ask==='flux'?'outward flux \\(\\oint_C\\mathbf F\\cdot\\mathbf n\\,ds\\)':'circulation \\(\\oint_C\\mathbf F\\cdot d\\mathbf r\\)'} of \\(\\mathbf F=${F}\\).`,val_,dis,
    'Flux = ∮(P dy − Q dx) = ∬div F dA; circulation = ∮(P dx + Q dy) = ∬(Q_x − P_y) dA. The ellipse encloses area πab.',
    [['',ask==='flux'?`\\oint\\mathbf F\\cdot\\mathbf n\\,ds=\\iint(P_x+Q_y)\\,dA=${rot?0:p+q}\\cdot\\pi(${a})(${b})`:`\\oint\\mathbf F\\cdot d\\mathbf r=\\iint(Q_x-P_y)\\,dA=${rot?2*p:0}\\cdot\\pi(${a})(${b})`],['',`=${T(val_)}`]],
    ask==='flux'?{op:'fluxc',F:rot?[`-${p}*y`,`${p}*x`]:[`${p}*x`,`${q}*y`],r:[`${a}*cos(t)`,`${b}*sin(t)`],t:['0','2*pi']}:{op:'lv',F:rot?[`-${p}*y`,`${p}*x`]:[`${p}*x`,`${q}*y`],r:[`${a}*cos(t)`,`${b}*sin(t)`],t:['0','2*pi']},2);
}
/* ---------- 17.2/17.3: which statements are true (a conceptual twist in the F2016-Q4 format) ---------- */
const STMT=[
  [1,'\\(\\displaystyle\\int_{-C}f\\,ds=\\int_C f\\,ds\\) for every continuous \\(f\\).'],[1,'\\(\\displaystyle\\int_{-C}\\mathbf F\\cdot d\\mathbf r=-\\int_C\\mathbf F\\cdot d\\mathbf r\\).'],
  [0,'\\(\\displaystyle\\int_C\\mathbf F\\cdot d\\mathbf r\\) changes if \\(C\\) is traced at a different speed (same direction).'],[0,'If \\(\\mathbf F\\) is conservative then \\(\\displaystyle\\int_C f\\,ds\\) is path-independent for every \\(f\\).'],
  [1,'If \\(\\mathbf F=\\nabla\\varphi\\) and \\(C\\) is closed, then \\(\\displaystyle\\oint_C\\mathbf F\\cdot d\\mathbf r=0\\).'],[0,'If \\(\\displaystyle\\oint_C\\mathbf F\\cdot d\\mathbf r=0\\) for ONE closed curve \\(C\\), then \\(\\mathbf F\\) is conservative.'],
  [1,'The work done by a force that is always perpendicular to the path is 0.'],[0,'\\(\\displaystyle\\int_C f\\,ds\\) is the length of \\(C\\) for every \\(f\\).'],
  [1,'If \\(\\mathbf F\\) is a gradient field, \\(\\nabla\\times\\mathbf F=\\mathbf 0\\).'],[0,'\\(\\mathbf F=\\langle -y,x\\rangle\\) is conservative.'],
  [1,'\\(\\displaystyle\\int_C\\mathbf F\\cdot d\\mathbf r=\\int_C\\mathbf F\\cdot\\mathbf T\\,ds\\).'],[0,'Green’s Theorem applies to any curve, closed or not.']];
function P_wConcept(){
  const S=shuf(STMT).slice(0,3); const tv=S.map(s=>s[0]);
  const lab=m=>{ const on=[0,1,2].filter(i=>m&(1<<i)).map(i=>['I','II','III'][i]); return on.length===0?'None of them':on.length===3?'I, II and III':on.length===1?on[0]+' only':on.join(' and ')+' only'; };
  const keyM=tv.reduce((m,v,i)=>m|(v?1<<i:0),0);
  const masks=[keyM].concat(shuf([0,1,2,3,4,5,6,7].filter(m=>m!==keyM)));
  const opts=masks.map((m,i)=>i===0?OK(lab(m)):NO(lab(m),[0,1,2].filter(j=>((m>>j)&1)!==tv[j]).map(j=>['I','II','III'][j]+' is '+(tv[j]?'true':'false')).join('; ')+'.'));
  return choiceQ(`Which of the following statements are true? (\\(C\\) is a smooth oriented curve, \\(-C\\) is \\(C\\) with the opposite orientation.)<br>I. ${S[0][1]}<br>II. ${S[1][1]}<br>III. ${S[2][1]}`,opts,
    'Scalar line integrals ignore orientation; vector line integrals flip sign with it and do not depend on the speed; gradient fields have zero circulation on closed curves.',[['I is '+(tv[0]?'true':'false')+', II is '+(tv[1]?'true':'false')+', III is '+(tv[2]?'true':'false')+'.','']],undefined,3);
}

/* ---------- 17.3: find a potential (F2024-Q1, F2019-Q9, 17.3 #17–30) ---------- */
const POTA=[{p:'x*e^(y*z)',t:'xe^{yz}',F:['e^(y*z)','x*z*e^(y*z)','x*y*e^(y*z)']},{p:'y*e^(x*z)',t:'ye^{xz}',F:['y*z*e^(x*z)','e^(x*z)','x*y*e^(x*z)']},{p:'z*e^(x*y)',t:'ze^{xy}',F:['y*z*e^(x*y)','x*z*e^(x*y)','e^(x*y)']},
  {p:'x*y*z^2',t:'xyz^2',F:['y*z^2','x*z^2','2*x*y*z']},{p:'x^2*y*z',t:'x^2yz',F:['2*x*y*z','x^2*z','x^2*y']},{p:'y*sin(x*z)',t:'y\\sin(xz)',F:['y*z*cos(x*z)','sin(x*z)','x*y*cos(x*z)']}];
const POTB=[{p:'cos(x*y)',t:'\\cos(xy)',F:['-y*sin(x*y)','-x*sin(x*y)','0'],w:'sin(x*y)',wt:'\\sin(xy)'},{p:'sin(y*z)',t:'\\sin(yz)',F:['0','z*cos(y*z)','y*cos(y*z)'],w:'cos(y*z)',wt:'\\cos(yz)'},
  {p:'x^2*y',t:'x^2y',F:['2*x*y','x^2','0'],w:'x*y^2',wt:'xy^2'},{p:'y*z^2',t:'yz^2',F:['0','z^2','2*y*z'],w:'y^2*z',wt:'y^2z'},{p:'e^(x+z)',t:'e^{x+z}',F:['e^(x+z)','0','e^(x+z)'],w:'e^(x*z)',wt:'e^{xz}'}];
function P_cPot(){
  const A=pick(POTA), B=pick(POTB), F=A.F.map((s,i)=>B.F[i]==='0'?s:`${s} + ${B.F[i]}`.replace('+ -','- '));
  const bad=coin(0.25);
  let Fs=F.slice(), changed=-1;
  if(bad){ changed=ri(0,2); Fs[changed]=`${Fs[changed]} + ${['y','z','x'][changed]}`; }
  const FT=`\\left\\langle ${Fs.map(T).join(',\\ ')}\\right\\rangle`;
  const keyP=`${A.p} + ${B.p}`, keyT=`${A.t}+${B.t}`;
  const NP='No potential function exists.';
  const cands=[[keyP,keyT,'Correct: its gradient is F.'],[A.p,A.t,'Missing the '+B.t+' part: φ_'+(B.F[0]!=='0'?'x':'y')+' would not match.'],[`${A.p} - ${B.p}`,`${A.t}-${B.t}`,'Sign error: differentiate '+B.t+' to check.'],
    [`${A.p} + ${B.w}`,`${A.t}+${B.wt}`,'The derivative of '+B.wt+' does not give the extra terms in F.'],[B.p,B.t,'Missing the '+A.t+' part.'],[`${A.p} + ${B.p} + x*y*z`,`${A.t}+${B.t}+xyz`,'The extra xyz would add yz, xz, xy to F.']];
  let opts;
  if(!bad) opts=[OK(`\\(\\varphi=${keyT}\\)`,{phi:keyP})].concat(cands.slice(1).map(c=>NO(`\\(\\varphi=${c[1]}\\)`,c[2],{phi:c[0]})),[NO(NP,'The cross-partials agree (∂P/∂y = ∂Q/∂x, …), so F is conservative.',{phi:null})]);
  else opts=[OK(NP,{phi:null})].concat(cands.slice(0,5).map(c=>NO(`\\(\\varphi=${c[1]}\\)`,'Check the cross-partials: one pair does not match, so no φ can work.',{phi:c[0]})));
  const o=choiceQ(`Find a potential function \\(\\varphi\\) for \\(\\mathbf F=${FT}\\), if one exists.`,opts,
    'Integrate P with respect to x, then fix the "constant" g(y, z) with Q and R. Check the cross-partials first: if one pair disagrees, no potential exists.',
    bad?[['Cross-partials: '+['∂R/∂y ≠ ∂Q/∂z','∂P/∂z ≠ ∂R/∂x','∂Q/∂x ≠ ∂P/∂y'][[1,2,0][changed]]+' because of the extra term.','\\text{not conservative}']]:[['',`\\varphi=${keyT}+C`]],undefined,3);
  o.chk={op:'pot',F:Fs,opts:o.opts.map(x=>x.s.phi)}; return o;
}
/* ---------- 17.3: the curve is unknown (F2023-Q2, S2022-Q5) ---------- */
function P_cFTLI(){
  for(let tries=0;tries<20;tries++){
    const ms=shuf([[1,1,0],[2,1,0],[1,1,1],[0,1,2],[1,0,2],[0,2,1],[2,0,1],[1,0,0],[0,0,1]]).slice(0,pick([2,3])).map(p=>({c:nz(-3,3),p}));
    const phiK=sumS(ms.map(m=>mono(m.c,{x:m.p[0],y:m.p[1],z:m.p[2]})));
    const dm=(m,i)=>m.p[i]===0?'0':mono(m.c*m.p[i],{x:m.p[0]-(i===0),y:m.p[1]-(i===1),z:m.p[2]-(i===2)});
    let F=[0,1,2].map(i=>sumS(ms.map(m=>dm(m,i))));
    if(F.some(s=>s==='0')&&coin(0.5)) continue;
    const bad=coin(0.3); let Fb=F.slice();
    if(bad){ const i=ri(0,2), j=(i+1)%3; Fb[i]=sumS([F[i],mono(pick([1,-1,2]),{[['x','y','z'][j]]:1})]); }
    const A=[ri(-1,2),ri(-1,2),ri(-1,1)], B=[ri(-1,3),ri(-1,3),ri(-2,2)]; if(A.join()===B.join()) continue;
    const ph=P=>val(phiK.replace(/\b([xyz])\b/g,m=>`(${P['xyz'.indexOf(m)]})`)), W=ph(B)-ph(A);
    if(!bad&&W===0) continue;
    const IMP='Impossible to answer without knowing \\(C\\).';
    const FT=`\\langle ${Fb.map(T).join(',\\ ')}\\rangle`;
    const q=`Find \\(\\displaystyle\\int_C\\mathbf F\\cdot d\\mathbf r\\), where \\(\\mathbf F(x,y,z)=${FT}\\) and \\(C\\) is some smooth curve from \\(${ptx(A)}\\) to \\(${ptx(B)}\\).`;
    if(!bad){
      const dis=[D_(String(-W),'Subtracted in the wrong order: φ(B) − φ(A).'),D_(String(ph(B)),'Forgot to subtract φ at the starting point.'),H_(IMP,'F is conservative (its curl is 0 everywhere), so the integral depends only on the endpoints.'),
        D_('0','The curve is not closed, so there is no reason for 0.'),D_(String(Fb.reduce((s,c,i)=>s+val(c.replace(/\b([xyz])\b/g,m=>`(${B['xyz'.indexOf(m)]})`))*(B[i]-A[i]),0)),'Dotted F at the end point with B − A; that is not the line integral.'),D_(String(ph(A)),'Used φ at the start point only.')];
      return valQ(q,String(W),dis,'Check that F is conservative (curl F = 0), find φ with ∇φ = F, then ∫_C F·dr = φ(B) − φ(A) for EVERY curve from A to B.',
        [['',`\\varphi=${T(phiK)}`],['',`\\varphi${ptx(B)}-\\varphi${ptx(A)}=${ph(B)}-(${ph(A)})=${W}`]],{op:'ftli',F:Fb,A,B,cons:1},2);
    }
    const opts=[OK(IMP)].concat([[String(W),'That is what φ = '+phiK+' would give, but F is not ∇φ: check the cross-partials.'],[String(-W),'F is not conservative; the endpoints alone do not determine the integral.'],['0','F is not conservative, and C is not closed.'],[String(ph(B)),'F is not conservative.'],[String(W+1),'F is not conservative.']]
      .filter((x,i,a)=>a.findIndex(y=>y[0]===x[0])===i).map(([v,w])=>NO(mk(v),w)));
    const o=choiceQ(q,opts,'Check the cross-partials before using the Fundamental Theorem: if curl F ≠ 0 the integral depends on the path.',[['One cross-partial pair disagrees, so \\(\\mathbf F\\) is not conservative and the path matters.','']],undefined,3);
    o.chk={op:'ftli',F:Fb,A,B,cons:0}; return o;
  }
  return null;
}
/* ---------- 17.3: an odd path (S2024-Q9, S2018-Q11, S2017-Q12) ---------- */
function P_cSpiral(){
  const a=nz(-7,7), b=nz(-4,4), c=nz(-3,3), d=pick([0,0,ri(-2,2)]), Tm=pick(['2pi','pi']);
  const Y=Tm==='2pi'?'e^(2pi)':'-e^(pi)', Y2=Tm==='2pi'?'e^(4pi)':'e^(2pi)';
  const W=sumS([`${c}*(${Y2} - 1)`,d?`${d}*(${Y} - 1)`:'0']);
  const P=sumS([String(a),mono(b,{y:1})]), Q=sumS([mono(b,{x:1}),mono(2*c,{y:1}),d?String(d):'0']);
  const Tt=Tm==='2pi'?'2\\pi':'\\pi';
  const dis=[D_(`${c}*${Y2}`,'Dropped φ at the start point (0, 1).'),D_(`${c}*(${Tm==='2pi'?'e^(2pi)':'e^(pi)'} - 1)`,'Forgot to square y in φ.'),D_('0','The path is not closed: it starts at (0, 1) and ends at (0, '+(Tm==='2pi'?'e^{2π}':'−e^π')+').'),
    D_(`-(${W})`,'Subtracted in the wrong order.'),D_(`${c}*(${Y2} + 1)`,'Sign slip at the start point.'),D_(`${2*c}*(${Y2} - 1)`,'Used 2cy² for φ (that is ∂φ/∂y·y).')];
  return valQ(`\\(\\mathbf F=\\langle ${T(P)},\\ ${T(Q)}\\rangle\\) is conservative. Evaluate \\(\\displaystyle\\int_C\\mathbf F\\cdot d\\mathbf r\\) along \\(\\mathbf r(t)=\\langle e^t\\sin t,\\ e^t\\cos t\\rangle\\), \\(0\\le t\\le ${Tt}\\).`,W,dis,
    'Never integrate along the spiral: find φ and evaluate it at r(0) and r(T).',
    [['',`\\varphi=${T(sumS([mono(a,{x:1}),mono(b,{x:1,y:1}),mono(c,{y:2}),d?mono(d,{y:1}):'0']))}`],['Endpoints: \\(\\mathbf r(0)=(0,1)\\), \\(\\mathbf r('+Tt+')=(0,'+(Tm==='2pi'?'e^{2\\pi}':'-e^{\\pi}')+')\\).',`\\varphi(\\text{end})-\\varphi(0,1)=${T(W)}`]],
    {op:'lv',F:[P,Q],r:['e^t*sin(t)','e^t*cos(t)'],t:['0',Tm==='2pi'?'2*pi':'pi']},2);
}
/* ---------- 17.3: a winding pictured path (S2025-Q9) ---------- */
function P_cPath(){
  const C=pick([{phi:'e^y*cos(x)',F:['-e^y*sin(x)','e^y*cos(x)'],B:pick([[[0,1],'e - 1'],[[0,2],'e^2 - 1']])},{phi:'e^x*sin(y)',F:['e^x*sin(y)','e^x*cos(y)'],B:pick([[[1,'pi/2'],'e'],[[2,'pi/2'],'e^2']])},
    {phi:'x*e^y + y',F:['e^y','x*e^y + 1'],B:pick([[[1,1],'e + 1'],[[2,1],'2e + 1'],[[1,2],'e^2 + 2']])}]);
  const [B,W]=C.B, Bn=B.map(v=>val(String(v))), BT=B.map(v=>v==='pi/2'?'\\tfrac{\\pi}{2}':v);
  const phB=val(C.phi.replace(/x/g,`(${B[0]})`).replace(/y/g,`(${B[1]})`)), phA=val(C.phi.replace(/x/g,'(0)').replace(/y/g,'(0)'));
  const fig=pathSVG([0,0],Bn,['A','B']);
  const dis=[phA!==0?D_(toFrac(phB,1)||C.phi.replace(/x/g,`(${B[0]})`).replace(/y/g,`(${B[1]})`),'Forgot to subtract φ(A) = '+phA+'.'):null,D_(`-(${W})`,'Subtracted in the wrong order.'),D_('0','The path does not return to A.'),
    H_('Cannot be found without parametrizing every piece of the path.','F is a gradient field, so only the endpoints matter.'),D_(`${W} + 1`,'Added φ(A) instead of subtracting.'),D_(`2*(${W})`,'Doubled for the back-and-forth pieces; the endpoints decide everything.')];
  return valQ(`Find \\(\\displaystyle\\int_C\\mathbf F\\cdot d\\mathbf r\\), where \\(\\mathbf F(x,y)=\\langle ${T(C.F[0])},\\ ${T(C.F[1])}\\rangle\\) and \\(C\\) is the pictured path (segments and semicircles) from \\(A=(0,0)\\) to \\(B=(${BT[0]},${BT[1]})\\).${figBox(fig)}`,W,dis,
    'Check that F = ∇φ; then the line integral is φ(B) − φ(A), whatever the path looks like.',[['',`\\varphi=${T(C.phi)}`],['',`\\varphi(B)-\\varphi(A)=${T(W)}`]],
    {op:'ftli2',F:C.F,A:[0,0],B:B.map(String)},2);
}
/* ---------- 17.3/17.4: the vortex field (17.3 #59–62: curl 0, yet not conservative) ---------- */
function P_cVortex(){
  const inside=coin(0.6), ccw=coin(0.65), h=inside?pick([0,1,-1]):pick([3,4,-3]), k=inside?pick([0,1]):pick([0,2]), r=inside?pick([2,3,4]):1;
  const ans=inside?(ccw?'2pi':'-2pi'):'0';
  const dis=[D_(inside?'0':'2pi',inside?'Green’s Theorem does not apply: F is undefined at the origin, which is inside C.':'The origin is outside the circle, so Green’s Theorem applies and gives 0.'),
    D_(inside?(ccw?'-2pi':'2pi'):'-2pi','Orientation sign.'),D_(`${2*r*r}pi`,'Treated F as ⟨−y, x⟩ without the denominator.'),D_('pi','Half a turn.'),D_('4pi','Counted the turn twice.'),D_(`${2*r}pi`,'Multiplied by the radius: the value does not depend on the size of the circle.')];
  return valQ(`Let \\(\\mathbf F=\\left\\langle\\dfrac{-y}{x^2+y^2},\\ \\dfrac{x}{x^2+y^2}\\right\\rangle\\) and let \\(C\\) be the circle of radius ${r} centred at \\((${h},${k})\\), traced once ${ccw?'counterclockwise':'clockwise'}. Find \\(\\displaystyle\\oint_C\\mathbf F\\cdot d\\mathbf r\\).`,ans,dis,
    'curl F = 0 wherever F is defined, but F is undefined at the origin. A loop that does not enclose the origin gives 0 (Green); a loop once around it gives ±2π.',
    [[inside?'The origin is inside \\(C\\): the integral equals the one around a small circle about the origin.':'The origin is outside \\(C\\): on the region inside \\(C\\), \\(Q_x-P_y=0\\).',`\\oint_C\\mathbf F\\cdot d\\mathbf r=${T(ans)}`]],
    {op:'lv',F:['-y/(x^2 + y^2)','x/(x^2 + y^2)'],r:[`${h} + ${r}*cos(${ccw?'':'-'}t)`,`${k} + ${r}*sin(${ccw?'':'-'}t)`],t:['0','2*pi']},3);
}
/* ---------- 17.3: make it conservative, then integrate (a two-step twist, 17.3 #71–75) ---------- */
function P_cConst(){
  const k=pick([1,2,3]), m=nz(-3,3), Pq=[pick([1,2]),pick([1,2,-1])], Qq=[pick([2,1]),pick([1,2,3])];
  const ph=P=>k*P[0]*P[0]*P[1]*P[1]+m*P[0], ans=String(ph(Qq)-ph(Pq)), wrong=P=>(k/2)*P[0]*P[0]*P[1]*P[1]+m*P[0];
  if(ans==='0') return null;
  const dis=[D_(String(wrong(Qq)-wrong(Pq)),'Used a = '+k+' (matching coefficients instead of cross-partials); then φ has k/2·x²y².'),D_(String(ph(Qq)),'Forgot to subtract φ at the start.'),D_(String(-(ph(Qq)-ph(Pq))),'Subtracted in the wrong order.'),
    D_(String(k*(Qq[0]*Qq[0]*Qq[1]*Qq[1]-Pq[0]*Pq[0]*Pq[1]*Pq[1])),'Dropped the '+m+'x term of φ.'),D_(String(2*k*(Qq[0]*Qq[0]*Qq[1]*Qq[1]-Pq[0]*Pq[0]*Pq[1]*Pq[1])+m*(Qq[0]-Pq[0])),'Used φ = 2k x²y²: integrate P = 2k x y² in x to get k x²y².'),D_('0','The path is not closed.')];
  return valQ(`For one value of \\(a\\), \\(\\mathbf F(x,y)=\\langle a\\,xy^2${m<0?'':'+'}${m},\\ ${2*k}x^2y\\rangle\\) is conservative. For that \\(a\\), evaluate \\(\\displaystyle\\int_C\\mathbf F\\cdot d\\mathbf r\\) along any curve from \\(${ptx(Pq)}\\) to \\(${ptx(Qq)}\\).`,ans,dis,
    'Conservative ⇔ P_y = Q_x: 2a xy = '+(4*k)+'xy, so a = '+(2*k)+'. Then φ = '+k+'x²y² + '+m+'x.',
    [['',`P_y=2axy,\\quad Q_x=${4*k}xy\\ \\Rightarrow\\ a=${2*k}`],['',`\\varphi=${k===1?'':k}x^2y^2${m<0?'':'+'}${m}x,\\qquad \\varphi${ptx(Qq)}-\\varphi${ptx(Pq)}=${ans}`]],
    {op:'ftli2',F:[`${2*k}*x*y^2 + ${m}`,`${2*k}*x^2*y`],A:Pq.map(String),B:Qq.map(String)},3);
}
/* ---------- 17.3: which field is conservative (17.3 #9–16) ---------- */
function P_cWhich(){
  const make=()=>gradP([randAtom(),randAtom()]);
  const good=make(); if(good.filter(c=>c.length).length<2) return null;
  const bads=[];
  for(let i=0;i<20&&bads.length<5;i++){
    const g=make(), j=ri(0,2), other=['y','z','x'][j], extra=atom(pick([1,-1,2,-2]),other==='x'?'v':'1',other==='y'?'v':'1',other==='z'?'v':'1');
    g[j]=polyNorm(g[j].concat([extra]));
    if(curlP(g).some(c=>c.length)&&g.filter(c=>c.length).length>=2) bads.push(g);
  }
  if(bads.length<5) return null;
  const h=F=>`\\(\\mathbf F=${vecTex(F)}\\)`;
  const opts=[OK(h(good),{F:good.map(polyKey)})].concat(bads.map(F=>NO(h(F),'Its cross-partials disagree (curl F ≠ 0), so it is not a gradient field.',{F:F.map(polyKey)})));
  const o=choiceQ('Which vector field is conservative on all of \\(\\mathbb R^3\\)?',opts,'On ℝ³, F is conservative exactly when curl F = 0: P_y = Q_x, P_z = R_x, Q_z = R_y.',[['',`\\nabla\\times${vecTex(good)}=\\mathbf 0`]],undefined,2);
  o.chk={op:'conswhich',opts:o.opts.map(x=>x.s.F)}; return o;
}
/* ---------- 17.4: Green on a rectangle or triangle (S2025-Q4, S2022-Q12) ---------- */
function P_gPoly(){
  const a=pick([1,2,3]), b=pick([1,2,3]), tri=coin(0.35), cw=coin(0.3);
  const terms=()=>shuf([[1,0],[0,1],[2,0],[1,1],[0,2],[0,0]]).slice(0,2).map(([m,n])=>({c:nz(-3,3),m,n}));
  const Pt=terms(), Qt=terms();
  const key=t=>sumS(t.map(u=>mono(u.c,{x:u.m,y:u.n})));
  const curl=[]; Qt.forEach(u=>{ if(u.m) curl.push({c:u.c*u.m,m:u.m-1,n:u.n}); }); Pt.forEach(u=>{ if(u.n) curl.push({c:-u.c*u.n,m:u.m,n:u.n-1}); });
  const div=[]; Pt.forEach(u=>{ if(u.m) div.push({c:u.c*u.m,m:u.m-1,n:u.n}); }); Qt.forEach(u=>{ if(u.n) div.push({c:u.c*u.n,m:u.m,n:u.n-1}); });
  const fac=n=>n<=1?1:n*fac(n-1);
  const I=t=>t.reduce((s,u)=>Radd(s,tri?Rr(u.c*Math.pow(a,u.m+1)*Math.pow(b,u.n+1)*fac(u.m)*fac(u.n),fac(u.m+u.n+2)):Rr(u.c*Math.pow(a,u.m+1)*Math.pow(b,u.n+1),(u.m+1)*(u.n+1))),[0,1]);
  const v=I(curl), sg=cw?-1:1, ans=Rs(Rmul(v,[sg,1]));
  if(v[0]===0) return null;
  const reg=tri?`the triangle with vertices \\((0,0)\\), \\((${a},0)\\), \\((0,${b})\\)`:`the rectangle with vertices \\((0,0)\\), \\((${a},0)\\), \\((${a},${b})\\), \\((0,${b})\\)`;
  const dis=[D_(Rs(Rmul(v,[-sg,1])),cw?'C is clockwise: Green’s Theorem gives −∬(Q_x − P_y) dA.':'Used P_y − Q_x; the integrand is Q_x − P_y.'),D_(Rs(Rmul(I(div),[sg,1])),'Used the flux form P_x + Q_y.'),
    D_(Rs(Rmul(v,[sg*2,1])),'Doubled.'),D_(Rs(Rmul(v,[sg,2])),'Halved.'),D_(Rs(Rmul(I(curl.map(u=>({...u,c:u.c}))).map((x,i)=>i?x:x),[-sg*2,1])),'Sign and factor slip.'),D_('0','Green’s Theorem does not make every closed-curve integral 0; that needs Q_x = P_y.')];
  const poly=tri?[[0,0],[a,0],[0,b],[0,0]]:[[0,0],[a,0],[a,b],[0,b],[0,0]];
  return valQ(`Use Green’s Theorem to evaluate \\(\\displaystyle\\oint_C(${T(key(Pt))})\\,dx+(${T(key(Qt))})\\,dy\\), where \\(C\\) is the boundary of ${reg}, oriented ${cw?'clockwise':'counterclockwise'}.`,ans,dis,
    '∮_C P dx + Q dy = ∬_R (Q_x − P_y) dA for C counterclockwise; clockwise flips the sign.',
    [['',`Q_x-P_y=${T(sumS(curl.map(u=>mono(u.c,{x:u.m,y:u.n}))))}`],['',`${cw?'-':''}\\iint_R(Q_x-P_y)\\,dA=${T(ans)}`]],
    {op:'lvpoly',F:[key(Pt),key(Qt)],poly:cw?poly.slice().reverse():poly},2);
}
/* ---------- 17.4: Green on a triangle with an exponential (F2024-Q2) ---------- */
function P_gTri(){
  const c=pick([1,2]), g=pick(['exp','sq']), P=pick(['cos(x)^3','sin(x^2)','e^(x^2)']), PT={'cos(x)^3':'\\cos^3x','sin(x^2)':'\\sin(x^2)','e^(x^2)':'e^{x^2}'}[P];
  const Q=g==='exp'?'e^x':'x^2', ans=g==='exp'?`(e^${c} - 1)^2`:String(2*c*c*c);
  const dis=g==='exp'?[D_(`e^${2*c} - 1`,'Integrated eˣ over [0, '+2*c+'] ignoring the slanted sides.'),D_(`e^${2*c} - 2e^${c}`,'Lost the +1: (e^c − 1)² = e^{2c} − 2e^c + 1.'),D_(`e^${c} - 1`,'Integrated over only half the triangle.'),
      D_(`-(e^${c} - 1)^2`,'Sign error: ∮ = ∬(Q_x − P_y) for counterclockwise C.'),D_(`2*(e^${c} - 1)^2`,'Doubled.'),D_(`e^${2*c} + 1`,'Algebra slip expanding the square.')]
    :[D_(String(c*c*c),'Forgot the 2 in Q_x = 2x.'),D_(String(4*c*c*c),'Doubled.'),D_(String(2*c*c),'Used the area times 2 (x̄ = c was dropped).'),D_(String(-2*c*c*c),'Sign error.'),D_(String(8*c*c*c/3),'Integrated over the wrong triangle.'),D_('0','P has no y, but Q has x: the integrand is 2x, not 0.')];
  return valQ(`Let \\(C\\) be the boundary of the triangle with vertices \\((0,0)\\), \\((${2*c},0)\\) and \\((${c},${c})\\), oriented counterclockwise. Compute \\(\\displaystyle\\oint_C ${PT}\\,dx+${g==='exp'?'e^x':'x^2'}\\,dy\\).`,ans,dis,
    'Green: ∬(Q_x − P_y) dA. P depends only on x, so P_y = 0; integrate Q_x over the triangle with x from y to '+(2*c)+' − y.',
    [['',`\\iint_R ${g==='exp'?'e^x':'2x'}\\,dA=\\int_0^{${c}}\\!\\int_{y}^{${2*c}-y}${g==='exp'?'e^x':'2x'}\\,dx\\,dy=${T(ans)}`]],
    {op:'lvpoly',F:[P,Q],poly:[[0,0],[2*c,0],[c,c],[0,0]]},2);
}
/* ---------- 17.4: area as a line integral (S2024-Q1, 17.4 #21–26) ---------- */
function P_gArea(){
  const k=pick([2,3,4,5]), notQ=coin(0.65);
  const good=()=>{ const al=ri(-4,4); return [al,al+k]; }, badP=()=>{ const al=ri(-4,4), d=pick([-k,2*k,k+1,-1,0].filter(x=>x!==k)); return [al,al+d]; };
  const fmt=([al,be])=>`\\(\\displaystyle\\frac1{${k}}\\oint_C ${al===0?'':`${al===1?'':al===-1?'-':al}y\\,dx`}${al!==0&&be>=0?'+':''}${be===0?'':`${be===1?'':be===-1?'-':be}x\\,dy`}\\)`;
  const seen=new Set(), take=f=>{ for(let i=0;i<40;i++){ const v=f(); const h=fmt(v); if(!seen.has(h)&&!(v[0]===0&&v[1]===0)){ seen.add(h); return v; } } return null; };
  const key=take(notQ?badP:good), others=Array.from({length:6},()=>take(notQ?good:badP)).filter(Boolean);
  if(!key||others.length<5) return null;
  const opts=[OK(fmt(key),{c:key,k})].concat(others.map(v=>NO(fmt(v),notQ?`(${v[1]} − (${v[0]}))/${k} = 1, so this one IS the area.`:`(${v[1]} − (${v[0]}))/${k} = ${Rs(Rr(v[1]-v[0],k))} ≠ 1, so this is not the area.`,{c:v,k})));
  const o=choiceQ(`According to Green’s Theorem, which line integral is ${notQ?'NOT ':''}equal to the area of the region enclosed by a simple closed curve \\(C\\) oriented counterclockwise?`,opts,
    '∮(αy dx + βx dy) = ∬(β − α) dA = (β − α)·Area. Divided by k it is the area exactly when β − α = k.',[['',`\\frac1{${k}}\\oint_C\\alpha y\\,dx+\\beta x\\,dy=\\frac{\\beta-\\alpha}{${k}}\\,\\text{Area}`]],undefined,2);
  o.chk={op:'area',not:notQ?1:0,opts:o.opts.map(x=>x.s)}; return o;
}
/* ---------- 17.4: a circle and cubes (17.4 #31–40) ---------- */
function P_gCircle(){
  const R=pick([1,2,3]), al=pick([1,2,3]), be=pick([1,2,3]), ans=mv([3*(al+be)*Math.pow(R,4),4],1,1);
  const dis=[D_(mv([3*(al+be)*Math.pow(R,4),2],1,1),'Used ∬x² dA = πR⁴/2; over the disk ∬x² dA = πR⁴/4.'),D_(mv([(al+be)*Math.pow(R,4),4],1,1),'Forgot the 3 from differentiating the cube.'),D_(mv([-3*(al+be)*Math.pow(R,4),4],1,1),'Sign error in Q_x − P_y.'),
    D_(mv([3*(be-al)*Math.pow(R,4),4],1,1),'Used −P_y with the wrong sign on P.'),D_(mv([3*(al+be)*R*R*R,3],1,1),'Forgot the Jacobian r.'),D_(mv([3*(al+be)*R*R,4],1,1),'Wrong power of R.')].filter(d=>d.a!==ans);
  return valQ(`Evaluate \\(\\displaystyle\\oint_C ${al===1?'-':`-${al}`}y^3\\,dx+${be===1?'':be}x^3\\,dy\\), where \\(C\\) is the circle \\(x^2+y^2=${R*R}\\), counterclockwise.`,ans,dis,
    'Green: Q_x − P_y = 3βx² + 3αy²; then polar, where ∬x² dA = ∬y² dA = πR⁴/4.',[['',`\\iint(${3*be}x^2+${3*al}y^2)\\,dA=${3*(al+be)}\\cdot\\frac{\\pi\\cdot ${Math.pow(R,4)}}{4}=${T(ans)}`]],
    {op:'lv',F:[`-${al}*y^3`,`${be}*x^3`],r:[`${R}*cos(t)`,`${R}*sin(t)`],t:['0','2*pi']},2);
}
/* ---------- 17.4: a region with a hole (17.4: a twist no past exam asked) ---------- */
function P_gHole(){
  const r1=pick([1,2]), r2=r1+pick([1,2]), c=pick([1,2,3,-1]), K=pick([2,3,5,-4,'2pi','pi']);
  const Kpi=K==='2pi'?2:K==='pi'?1:null, Kk=String(K), A=r2*r2-r1*r1;
  const plus=co=>Kpi!==null?mv([Kpi+co,1],1,1):sumS([Kk,mv([co,1],1,1)]);
  const ans=plus(c*A);
  const dis=[D_(mv([c*r2*r2,1],1,1),'Used the whole disk and ignored the inner circle.'),D_(plus(-c*A),'Subtracted: going from the inner to the outer circle ADDS ∬(Q_x − P_y) over the ring.'),
    D_(mv([c*A,1],1,1),'Forgot the given inner integral.'),D_(plus(c*(r2-r1)*(r2-r1)),'Used (r₂ − r₁)² for the ring; its area is π(r₂² − r₁²).'),D_(plus(c*r2*r2),'Added the whole disk instead of the ring.'),D_(Kk,'The two integrals are equal only if Q_x − P_y = 0 on the ring.')].filter(d=>d.a!==ans);
  const Kv=val(Kk)-c*Math.PI*r1*r1;
  return valQ(`On the region \\(${r1*r1}\\le x^2+y^2\\le ${r2*r2}\\), a vector field \\(\\mathbf F=\\langle P,Q\\rangle\\) has \\(Q_x-P_y=${c}\\). If \\(\\displaystyle\\oint_{C_1}\\mathbf F\\cdot d\\mathbf r=${T(Kk)}\\) for the circle \\(C_1\\) of radius ${r1} (counterclockwise), find \\(\\displaystyle\\oint_{C_2}\\mathbf F\\cdot d\\mathbf r\\) for the circle \\(C_2\\) of radius ${r2} (counterclockwise).`,ans,dis,
    'Green on the ring: its boundary is C₂ counterclockwise plus C₁ clockwise, so ∮_{C₂} − ∮_{C₁} = ∬_ring (Q_x − P_y) dA.',
    [['',`\\oint_{C_2}-\\oint_{C_1}=\\iint_{\\text{ring}}${c}\\,dA=${c}\\pi(${r2*r2}-${r1*r1})`],['',`\\oint_{C_2}=${T(ans)}`]],
    {op:'lv',F:[`(${-c/2})*y - (${Kv})/(2*pi)*y/(x^2 + y^2)`,`(${c/2})*x + (${Kv})/(2*pi)*x/(x^2 + y^2)`],r:[`${r2}*cos(t)`,`${r2}*sin(t)`],t:['0','2*pi']},3);
}
/* ---------- 17.4: outward flux across a square (17.4 #27–30) ---------- */
function P_gFlux(){
  const a=pick([1,2,3]), b=pick([1,2]), al=nz(-3,3), be=nz(-3,3);
  const P=`x^2 + ${al}*y`, Q=`y^2 + ${be}*x`, fl=Rr(a*a*b+a*b*b,1), ans=Rs(fl), circ=String((be-al)*a*b);
  const dis=[D_(circ,'That is the circulation ∬(Q_x − P_y) dA; flux uses P_x + Q_y.'),D_(Rs(Rr(a*a*b+a*b*b,2)),'Forgot the 2 in ∂(x²)/∂x = 2x.'),D_(Rs(Rneg(fl)),'Used the inward normal.'),
    D_(Rs(Rr(2*(a*a*b+a*b*b),1)),'Doubled.'),D_(String(a*a*b),'Dropped the ∂(y²)/∂y term.'),D_(String(2*a*b),'Evaluated the divergence at (1, 1) times the area.')].filter(d=>d.a!==ans);
  return valQ(`Find the outward flux of \\(\\mathbf F=\\langle ${T(P)},\\ ${T(Q)}\\rangle\\) across the boundary of the rectangle \\(0\\le x\\le ${a},\\ 0\\le y\\le ${b}\\).`,ans,dis,
    'Flux form of Green: ∮F·n ds = ∬(P_x + Q_y) dA.',[['',`\\iint(2x+2y)\\,dA=${T(ans)}`]],{op:'fluxpoly',F:[P,Q],poly:[[0,0],[a,0],[a,b],[0,b],[0,0]]},2);
}
/* ---------- 17.4: an open curve, closed with a segment (a twist) ---------- */
function P_gOpen(){
  const R=pick([1,2,3]), al=pick([1,2,3]), be=pick([1,2]), ga=pick([1,2,3]);
  const ans=sumS([mv([(be+ga)*R*R,2],1,1),Rs(Rr(-2*al*R*R*R,3))]);
  const dis=[D_(mv([(be+ga)*R*R,2],1,1),'That is ∮ around the closed half-disk; subtract the integral along the diameter.'),D_(sumS([mv([(be+ga)*R*R,2],1,1),Rs(Rr(2*al*R*R*R,3))]),'Added the diameter piece; the closed loop = C + segment, so C = loop − segment.'),
    D_(sumS([mv([(be+ga)*R*R,1],1,1),Rs(Rr(-2*al*R*R*R,3))]),'Used the full disk.'),D_(sumS([mv([(ga-be)*R*R,2],1,1),Rs(Rr(-2*al*R*R*R,3))]),'Q_x − P_y = γ − (−β) = γ + β.'),
    D_(Rs(Rr(-2*al*R*R*R,3)),'Only kept the segment.'),D_(sumS([mv([(be+ga)*R*R,2],1,1),Rs(Rr(-al*R*R*R,3))]),'Integrated x² on [−R, R] to R³/3.')];
  return valQ(`Let \\(C\\) be the upper half of the circle \\(x^2+y^2=${R*R}\\) from \\((${R},0)\\) to \\((-${R},0)\\). Evaluate \\(\\displaystyle\\int_C(${al===1?'':al}x^2-${be===1?'':be}y)\\,dx+${ga===1?'':ga}x\\,dy\\).`,ans,dis,
    'C is not closed. Close it with the segment from (−R, 0) to (R, 0), apply Green to the half-disk, then subtract the segment.',
    [['Closed loop (C + segment) is counterclockwise around the half-disk.',`\\oint=\\iint(${ga}+${be})\\,dA=\\frac{${be+ga}\\pi\\cdot ${R*R}}{2}`],['On the segment \\(y=0,\\ dy=0\\).',`\\int_{-${R}}^{${R}}${al}x^2\\,dx=${T(Rs(Rr(2*al*R*R*R,3)))}`],['',`\\int_C=${T(ans)}`]],
    {op:'lv',F:[`${al}*x^2 - ${be}*y`,`${ga}*x`],r:[`${R}*cos(t)`,`${R}*sin(t)`],t:['0','pi']},3);
}

/* ---------- 17.5: curl (F2024-Q3, 17.5 #27–34) ---------- */
function P_dcCurl(){
  const F=[0,1,2].map(()=>coin(0.3)?[randAtom(),randAtom()]:[randAtom()]).map(polyNorm);
  const C=curlP(F); if(C.filter(c=>c.length).length<2) return null;
  const [P,Q,R]=F, d=(A,v)=>dP(A,v);
  const vk=v=>V(...v.map(polyKey));
  const W=[[curlP(F),''],[[C[0],negP(C[1]),C[2]],'Forgot the minus sign on the middle (j) component of the determinant.'],[C.map(negP),'Subtracted in the wrong order in every component (that is −curl F).'],
    [[d(P,'x'),d(Q,'y'),d(R,'z')],'Those are the terms of the divergence, not the curl.'],[[d(R,'y'),d(P,'z'),d(Q,'x')],'Dropped the subtracted partials.'],[[C[2],C[1],C[0]],'Components in the wrong order.'],[[d(Q,'z'),d(R,'x'),d(P,'y')],'Kept only the subtracted partials.']];
  const opts=W.map(([v,w],i)=>i===0?OK(`\\(${vecTex(v)}\\)`,{v:vk(v)}):NO(`\\(${vecTex(v)}\\)`,w,{v:vk(v)}));
  const o=choiceQ(`If \\(\\mathbf F=${vecTex(F)}\\), then \\(\\operatorname{curl}\\mathbf F\\) is`,opts,'curl F = ⟨R_y − Q_z, P_z − R_x, Q_x − P_y⟩ (the determinant with i, j, k; mind the minus on j).',
    [['',`\\nabla\\times\\mathbf F=\\left\\langle R_y-Q_z,\\ P_z-R_x,\\ Q_x-P_y\\right\\rangle=${vecTex(C)}`]],undefined,2);
  o.chk={op:'curl',F:F.map(polyKey),opts:o.opts.map(x=>x.s.v)}; return o;
}
/* ---------- 17.5: div of a gradient = Laplacian (S2024-Q10, 17.5 #56–58) ---------- */
function P_dcLap(){
  const p=ri(1,3), q=ri(0,3), s=ri(1,3), k=pick([1,2,-1]), P=[pick([1,2,-1]),pick([1,-1,2]),pick([1,-1,2])];
  const f=atom(k,{1:'v',2:'v2',3:'v3'}[p],{0:'1',1:'v',2:'v2',3:'v3'}[q],{1:'v',2:'v2',3:'v3'}[s]);
  const env={x:P[0],y:P[1],z:P[2]}, lap=polyNorm(dP(dP([f],'x'),'x').concat(dP(dP([f],'y'),'y'),dP(dP([f],'z'),'z'))), L=evP(lap,env);
  const g=gradP([f]), sumG=g.reduce((t,c)=>t+evP(c,env),0), fv=evP([f],env), part=evP(dP(dP([f],'x'),'x'),env)+evP(dP(dP([f],'y'),'y'),env);
  const dis=[D_(String(sumG),'Added the first partials: div(∇f) needs the SECOND partials f_xx + f_yy + f_zz.'),D_(String(part),'Left out f_zz.'),D_(String(fv),'That is f itself.'),
    D_(String(L-evP(dP(dP([f],'y'),'y'),env)),'Left out f_yy.'),D_(String(-L),'Sign error.'),D_(String(evP(dP(dP([f],'x'),'y'),env)+evP(dP(dP([f],'y'),'z'),env)+evP(dP(dP([f],'x'),'z'),env)),'Used mixed partials.')];
  return valQ(`If \\(f(x,y,z)=${T(polyKey([f]))}\\), then \\(\\operatorname{div}(\\nabla f)\\) at \\(${ptx(P)}\\) equals`,String(L),dis,'div(∇f) = f_xx + f_yy + f_zz (the Laplacian).',
    [['',`f_{xx}+f_{yy}+f_{zz}=${T(polyKey(lap))}`],['',`\\text{at }${ptx(P)}:\\ ${L}`]],{op:'lap',f:polyKey([f]),at:P},2);
}
/* ---------- 17.5: identities (17.5 #35–41) ---------- */
function P_dcIdent(){
  const V_=pick(['zerovec','meaningless','zeroscalar']);
  const E={grad:'\\nabla f',curlgrad:'\\operatorname{curl}(\\nabla f)',divcurl:'\\operatorname{div}(\\operatorname{curl}\\mathbf F)',graddiv:'\\nabla(\\operatorname{div}\\mathbf F)',curlcurl:'\\operatorname{curl}(\\operatorname{curl}\\mathbf F)',
    curldiv:'\\operatorname{curl}(\\operatorname{div}\\mathbf F)',divgrad:'\\operatorname{div}(\\nabla f)',divF:'\\operatorname{div}\\mathbf F',curlF:'\\operatorname{curl}\\mathbf F',graddivgrad:'\\operatorname{div}(f\\mathbf F)',gradcurl:'\\nabla(\\operatorname{curl}\\mathbf F)'};
  const M=x=>`\\(${E[x]}\\)`;
  let q,key,rest;
  if(V_==='zerovec'){ q='Which expression is the zero VECTOR for every smooth function \\(f\\) and field \\(\\mathbf F\\)?'; key='curlgrad';
    rest=[['divcurl','div(curl F) = 0 too, but it is a scalar, not a vector.'],['graddiv','∇(div F) is not zero in general (try F = ⟨x², 0, 0⟩).'],['curlcurl','curl(curl F) is not zero in general.'],['curlF','Only for conservative fields.'],['grad','∇f is zero only for constant f.']]; }
  else if(V_==='meaningless'){ q='Which expression is meaningless (not defined)?'; key='curldiv';
    rest=[['divcurl','curl F is a vector field, so its divergence makes sense.'],['graddiv','div F is a scalar function, so its gradient makes sense.'],['curlgrad','∇f is a vector field, so its curl makes sense (it is 0).'],['divgrad','∇f is a vector field; its divergence is the Laplacian.'],['graddivgrad','fF is a vector field, so its divergence makes sense.']]; }
  else { q='Which expression equals the scalar 0 for every smooth field \\(\\mathbf F\\)?'; key='divcurl';
    rest=[['curlgrad','curl(∇f) = 0 is a VECTOR identity.'],['divgrad','div(∇f) is the Laplacian, not 0 in general.'],['divF','Only for incompressible fields.'],['graddiv','That is a vector, and not 0 in general.'],['curlcurl','A vector, not 0 in general.']]; }
  const opts=[OK(M(key))].concat(rest.map(([x,w])=>NO(M(x),w)));
  return choiceQ(q,opts,'Track the type: ∇ takes a scalar to a vector, curl takes a vector to a vector, div takes a vector to a scalar. curl(∇f) = 0 and div(curl F) = 0 always.',[[{zerovec:'curl(∇f) = ⟨f_zy − f_yz, f_xz − f_zx, f_yx − f_xy⟩ = 0 because mixed partials are equal.',meaningless:'div F is a scalar function, and curl only applies to vector fields.',zeroscalar:'div(curl F) = (R_yx − Q_zx) + (P_zy − R_xy) + (Q_xz − P_yz) = 0: the mixed partials cancel in pairs.'}[V_],'']],undefined,2);
}
/* ---------- 17.5: rotation fields (17.5 #23–26, #42–45, #52–55) ---------- */
function P_dcRot(){
  const a=[ri(-3,3),ri(-3,3),nz(-3,3)], ask=pick(['curl','speed','div']);
  const F=[sumS([mono(a[1],{z:1}),mono(-a[2],{y:1})]),sumS([mono(a[2],{x:1}),mono(-a[0],{z:1})]),sumS([mono(a[0],{y:1}),mono(-a[1],{x:1})])];
  const nrm=n2(a), cv=a.map(x=>2*x);
  const FT=`\\langle ${F.map(T).join(',\\ ')}\\rangle`;
  if(ask==='curl') return valQ(`Find \\(\\nabla\\times\\mathbf F\\) for the rotation field \\(\\mathbf F=${FT}\\).`,V(...cv),
    [D_(V(...a),'Forgot the factor 2: for F = a × r, curl F = 2a.'),D_(V(...cv.map(x=>-x)),'Sign error.'),D_(V(...a.map(x=>4*x)),'Doubled twice.'),D_('<0, 0, 0>','A rotation field is not irrotational.'),D_(V(cv[0],-cv[1],cv[2]),'Forgot the minus on the j-component.'),D_(V(cv[2],cv[1],cv[0]),'Components in the wrong order.'),D_(V(cv[0],cv[1],-cv[2]),'Sign error in the k-component.'),D_(V(...a.map(x=>x*3)),'Used 3a: the factor is 2.')],
    'F = a × r for a = ⟨'+a.join(', ')+'⟩, and curl(a × r) = 2a.',[['',`\\nabla\\times\\mathbf F=${vt(cv)}`]],{op:'curl1',F,want:cv},2,{kind:'vec'});
  if(ask==='div') return valQ(`Find \\(\\nabla\\cdot\\mathbf F\\) for \\(\\mathbf F=${FT}\\).`,'0',[D_(String(2*(a[0]+a[1]+a[2])),'Added the curl components.'),D_(String(a[0]+a[1]+a[2])||'1','Added the components of a.'),D_('3','That is ∇·r; each component of a × r has no derivative in its own variable.'),D_(String(-2*(a[0]+a[1]+a[2])||-2),'Took a sign-flipped sum of curl components.'),D_('2','Counted the 2 from curl(a × r) = 2a.')],
    'Each component of a rotation field a × r does not contain its own variable, so every term of the divergence is 0.',[['','\\nabla\\cdot\\mathbf F=0']],{op:'div',F,at:[1,1,1]},1);
  const sp=surd(1,1,nrm);
  return valQ(`A small paddle wheel is placed in the flow \\(\\mathbf F=${FT}\\). With its axis aligned for the fastest spin, what is its angular speed?`,sp,
    [D_(surd(2,1,nrm),'That is |curl F|; the angular speed is half of it.'),D_(String(nrm),'Forgot the square root.'),D_(surd(1,2,nrm),'Halved twice.'),D_(surd(1,1,a[0]*a[0]+a[1]*a[1]),'Left out a component.'),D_(surd(4,1,nrm),'Doubled |curl F|.'),D_(String(Math.abs(a[0])+Math.abs(a[1])+Math.abs(a[2])),'Added the components instead of taking the length.')],
    'The paddle wheel spins at |curl F|/2, with the axis along curl F.',[['',`\\tfrac12|\\nabla\\times\\mathbf F|=\\tfrac12|${vt(cv)}|=${T(sp)}`]],{op:'curlmag',F,half:1},2);
}
/* ---------- 17.5: radial fields (17.5 #17–20) ---------- */
function P_dcRadial(){
  const [P,r]=pick([[[1,2,2],3],[[2,3,6],7],[[0,3,4],5],[[1,0,0],1],[[2,1,2],3],[[0,0,2],2]]), p=pick([1,2,4,3]);
  const ans=Rs(Rr(3-p,Math.pow(r,p)));
  const dis=[D_(Rs(Rr(3,Math.pow(r,p))),'Forgot the derivative of 1/|r|^p (it contributes −p/|r|^p).'),D_(Rs(Rr(-p,Math.pow(r,p+1))),'Only kept the derivative of the denominator.'),D_(Rs(Rr(3+p,Math.pow(r,p))),'Sign error in the derivative of |r|^{−p}.'),
    D_(Rs(Rr(2-p,Math.pow(r,p))),'Used the 2-D formula (2 − p)/|r|^p.'),D_(Rs(Rr(3-p,Math.pow(r,p-1))),'Wrong power of |r|.'),D_(p===3?'1':'0',p===3?'For p = 3 the divergence is 0 (away from the origin).':'Only p = 3 gives 0.')].filter(d=>d.a!==ans);
  return valQ(`Let \\(\\mathbf F=\\dfrac{\\mathbf r}{|\\mathbf r|^{${p}}}\\), where \\(\\mathbf r=\\langle x,y,z\\rangle\\). Find \\(\\nabla\\cdot\\mathbf F\\) at \\(${ptx(P)}\\).`,ans,dis,
    'In 3-D, ∇·(r/|r|^p) = (3 − p)/|r|^p.',[['',`|\\mathbf r|=${r},\\qquad \\nabla\\cdot\\mathbf F=\\frac{3-${p}}{${r}^{${p}}}=${T(ans)}`]],{op:'div',F:[`x/(x^2 + y^2 + z^2)^(${p}/2)`,`y/(x^2 + y^2 + z^2)^(${p}/2)`,`z/(x^2 + y^2 + z^2)^(${p}/2)`],at:P},2);
}
/* ---------- 17.5: divergence at a point (sprint) ---------- */
function P_dcDiv(){
  const F=[0,1,2].map(()=>[randAtom()]), P=[ri(-2,2),ri(-2,2),ri(-2,2)], env={x:P[0],y:P[1],z:P[2]}, d=divP(F), v=evP(d,env);
  if(!Number.isFinite(v)||Math.abs(v-Math.round(v))>1e-9) return null;
  return valQ(`Find \\(\\nabla\\cdot\\mathbf F\\) at \\(${ptx(P)}\\) for \\(\\mathbf F=${vecTex(F)}\\).`,String(v),[D_(String(-v),'Sign error.')],'div F = P_x + Q_y + R_z.',
    [['',`\\nabla\\cdot\\mathbf F=${T(polyKey(d))}`]],{op:'div',F:F.map(polyKey),at:P},1);
}

/* ---------- 17.6: surface area of a plane piece (S2024-Q11, S2019-Q4) ---------- */
function P_sPlane(){
  if(coin(0.35)){
    const al=pick([1,2,3]), be=pick([1,2,-1,3]), k=pick([1,2,3]), N=1+al*al+be*be, ans=surd(1,k+1,N);
    const dis=[D_(Rs(Rr(1,k+1)),'That is the area of the shadow; multiply by √(1 + z_x² + z_y²).'),D_(surd(1,k+1,al*al+be*be),'Forgot the 1 under the root.'),D_(surd(1,k,N),'∫₀¹ xᵏ dx = 1/(k + 1).'),
      D_(Rs(Rr(N,k+1)),'Forgot the square root.'),D_(surd(1,k+2,N),'Integrated x^{k+1}.')];
    return valQ(`Find the area of the part of the plane \\(z=${T(linKey([al,be],['x','y']))}\\) that lies above the region bounded by \\(x=1\\), \\(y=0\\) and \\(y=x^{${k}}\\).`.replace('x^{1}','x'),ans,dis,
      'Area = ∬_D √(1 + z_x² + z_y²) dA; for a plane the root is constant.',[['',`\\sqrt{1+${al*al}+${be*be}}\\cdot\\int_0^1 x^{${k}}\\,dx=${T(ans)}`]],
      {op:'surf',f:'1',r:['u','v',`${al}*u + ${be}*v`],lim:[['v','0',`u^${k}`],['u','0','1']]},2);
  }
  const [a,b,c,d]=pick([[2,5,1,10],[3,2,1,6],[1,2,2,4],[6,3,2,6],[1,1,1,1],[4,2,1,8],[2,1,2,4],[1,2,3,6]]);
  const N=a*a+b*b+c*c, ans=surd(d*d,2*a*b*c,N);
  const dis=[D_(Rs(Rr(d*d,2*a*b)),'That is the area of the shadow in the xy-plane.'),D_(surd(d*d,2*a*b,1+a*a+b*b),c===1?'Forgot the 1… (check: z = (d − ax − by)/c).':'Used √(1 + a² + b²) without dividing by c: z_x = −a/c, z_y = −b/c.'),
    D_(surd(d*d,2*a*b*c,a*a+b*b),'Left out c² under the root.'),D_(surd(d*d,a*b*c,N),'Forgot the ½ in the triangle’s area.'),D_(surd(d,2,N),'Used d instead of d²/(abc).'),D_(surd(d*d,6*a*b*c,N),'Used ⅙ (a volume formula).')].filter(x=>x.a!==ans);
  return valQ(`Find the area of the part of the plane \\(${a===1?'':a}x+${b===1?'':b}y+${c===1?'':c}z=${d}\\) that lies in the first octant.`,ans,dis,
    'Area = ∬_D √(1 + z_x² + z_y²) dA over the shadow triangle D; for a plane that is |n|/|c| times the area of D.',
    [['Shadow: the triangle with intercepts \\('+Rs(Rr(d,a))+'\\) and \\('+Rs(Rr(d,b))+'\\), area \\('+T(Rs(Rr(d*d,2*a*b)))+'\\).',`\\sqrt{1+\\tfrac{${a*a}}{${c*c}}+\\tfrac{${b*b}}{${c*c}}}=\\frac{\\sqrt{${N}}}{${c}}\\quad\\Rightarrow\\quad A=${T(ans)}`]],
    {op:'surf',f:'1',r:['u','v',`(${d} - ${a}*u - ${b}*v)/${c}`],lim:[['v','0',`(${d} - ${a}*u)/${b}`],['u','0',`${d}/${a}`]]},2);
}
/* ---------- 17.6: a paraboloid cap (S2018-Q7, F2017-Q7) ---------- */
function P_sParab(){
  const R2=pick([2,6,12,1,3]), c=pick([R2+1,R2+2,R2+4,R2]), d=c-R2, m=1+4*R2, sq=isSq(m), M=sq?Math.round(Math.sqrt(m)):0;
  const ans=sq?mv([m*M-1,6],1,1):`pi*(${m}sqrt(${m}) - 1)/6`;
  const w=(fac,minus)=>sq?mv([minus?m*M-1:m*M,fac],1,1):`pi*(${m}sqrt(${m})${minus?' - 1':''})/${fac}`;
  const dis=[D_(w(6,false),'Dropped the −1 from the lower limit r = 0.'),D_(w(12,true),'Integrated with an extra ½.'),D_(w(4,true),'Used ∫r√(1 + 4r²) dr = (1 + 4r²)^{3/2}/8·… with the wrong constant (it is /12).'),
    D_(mv([R2,1],1,1),'That is the area of the flat disk underneath.'),D_(w(3,true),'Forgot the ½ from θ… (2π·(1/12) = π/6).'),D_(sq?mv([m-1,6],1,1):`pi*(${m} - 1)/6`,'Used power 1 instead of 3/2.')];
  return valQ(`Find the area of the part of the paraboloid \\(z=${c}-x^2-y^2\\) that lies above the plane \\(z=${d}\\).`,ans,dis,
    'Area = ∬√(1 + 4x² + 4y²) dA over the disk r² ≤ '+R2+'; in polar ∫∫√(1 + 4r²) r dr dθ.',
    [['The cap sits over \\(x^2+y^2\\le '+R2+'\\).',`A=\\int_0^{2\\pi}\\!\\int_0^{\\sqrt{${R2}}}\\sqrt{1+4r^2}\\,r\\,dr\\,d\\theta=\\frac{\\pi}{6}\\left(${m}^{3/2}-1\\right)=${T(ans)}`]],
    {op:'surf',f:'1',r:['u*cos(v)','u*sin(v)',`${c} - u^2`],lim:[['u','0',`sqrt(${R2})`],['v','0','2*pi']]},2);
}
/* ---------- 17.6: a cone (17.6 #58) ---------- */
function P_sCone(){
  const k=pick([1,2,3]), h=pick([k,2*k,3*k,2]), N=1+k*k, ans=mv(Rr(h*h,k*k),N,1);
  const dis=[D_(mv(Rr(h*h,k*k),1,1),'That is the disk underneath; multiply by √(1 + k²).'),D_(mv([h*h,1],N,1),'Used radius h; the cone reaches radius h/k at height h.'),D_(mv(Rr(h*h,k*k),k*k,1),'Used √(k²) instead of √(1 + k²).'),
    D_(mv(Rr(2*h*h,k*k),N,1),'Doubled.'),D_(mv(Rr(h*h,2*k*k),N,1),'Halved.'),D_(mv(Rr(h,k),N,1),'Wrong power of h.')];
  return valQ(`Find the surface area of the cone \\(z=${k===1?'':k}\\sqrt{x^2+y^2}\\) for \\(0\\le z\\le ${h}\\).`,ans,dis,'Area = ∬√(1 + z_x² + z_y²) dA = √(1 + k²)·(area of the shadow disk of radius h/k).',
    [['',`A=\\sqrt{1+${k*k}}\\cdot\\pi\\left(\\tfrac{${h}}{${k}}\\right)^2=${T(ans)}`]],{op:'surf',f:'1',r:['u*cos(v)','u*sin(v)',`${k}*u`],lim:[['u','0',`${h}/${k}`],['v','0','2*pi']]},2);
}
/* ---------- 17.6: scalar surface integrals on a sphere (17.6 #25–28, #39–42) ---------- */
function P_sSphere(){
  const a=pick([1,2,3]), K=pick(['z2','xy2','r2','zhemi','onehemi']);
  const A4=Math.pow(a,4);
  const D={z2:['z^2','the sphere',mv([4*A4,3],1,1)],xy2:['x^2+y^2','the sphere',mv([8*A4,3],1,1)],r2:['x^2+y^2+z^2','the sphere',mv([4*A4,1],1,1)],zhemi:['z','the upper hemisphere (z ≥ 0) of',mv([a*a*a,1],1,1)],onehemi:['1','the upper hemisphere (z ≥ 0) of',mv([2*a*a,1],1,1)]}[K];
  const ans=D[2];
  const dis=[D_(mv([4*A4,1],1,1),'That is ∬(x² + y² + z²) dS; by symmetry ∬z² dS is one third of it.'),D_(mv([4*a*a*a*a*a,15],1,1),'That is the volume integral ∭z² dV.'),D_(mv([4*a*a*a,3],1,1),'That is the volume of the ball.'),
    D_(mv([2*A4,3],1,1),'Used the hemisphere.'),D_(mv([4*a*a,1],1,1),'That is the area of the whole sphere.'),D_(mv([A4,1],1,1),'Forgot the a² sin φ in dS.'),D_('0','The integrand is not odd over this surface.')].filter(d=>d.a!==ans);
  const fk=K==='z2'?'z^2':K==='xy2'?'x^2 + y^2':K==='r2'?'x^2 + y^2 + z^2':K==='zhemi'?'z':'1';
  return valQ(`Evaluate \\(\\displaystyle\\iint_S ${/[+]/.test(D[0])?'('+D[0]+')':D[0]}\\,dS\\), where \\(S\\) is ${D[1]} \\(x^2+y^2+z^2=${a*a}\\).`,ans,dis,
    'On the sphere ρ = a: dS = a² sin φ dφ dθ. Symmetry helps: ∬x² = ∬y² = ∬z² = ⅓∬(x² + y² + z²) = ⅓a²·4πa².',
    [['',`\\iint_S=${T(ans)}`]],{op:'surf',f:fk,r:[`${a}*sin(u)*cos(v)`,`${a}*sin(u)*sin(v)`,`${a}*cos(u)`],lim:[['u','0',K==='zhemi'||K==='onehemi'?'pi/2':'pi'],['v','0','2*pi']]},2);
}
/* ---------- 17.6: on a plane (17.6 #35–38) ---------- */
function P_sGraph(){
  const c=pick([1,2,3,6]), K=pick(['z','sum']), ans=K==='z'?surd(c*c*c,6,3):surd(c*c*c,2,3);
  const dis=K==='z'?[D_(Rs(Rr(c*c*c,6)),'Forgot dS = √3 dA.'),D_(surd(c*c*c,2,3),'That is ∬(x + y + z) dS.'),D_(surd(c*c,2,3),'That is the area of S.'),D_(surd(c*c*c,3,3),'Used ⅓ instead of ⅙.'),D_(Rs(Rr(c*c*c,2)),'Forgot dS and used the wrong integrand.')]
    :[D_(Rs(Rr(c*c*c,2)),'Forgot dS = √3 dA.'),D_(surd(c*c*c,6,3),'Integrated z only.'),D_(surd(c*c,2,3),'That is the area; multiply by the constant value '+c+'.'),D_(surd(c*c*c,1,3),'Doubled.'),D_(surd(c*c*c,2,2),'Used √2 for dS.')];
  return valQ(`Let \\(S\\) be the part of the plane \\(x+y+z=${c}\\) in the first octant. Evaluate \\(\\displaystyle\\iint_S ${K==='z'?'z':'(x+y+z)'}\\,dS\\).`,ans,dis,
    K==='z'?'z = c − x − y and dS = √(1 + 1 + 1) dA = √3 dA over the shadow triangle.':'On S, x + y + z = c is constant: the integral is c times the area of S.',
    [['',`dS=\\sqrt3\\,dA,\\qquad \\iint_S=${T(ans)}`]],{op:'surf',f:K==='z'?'z':'x + y + z',r:['u','v',`${c} - u - v`],lim:[['v','0',`${c} - u`],['u','0',String(c)]]},2);
}
/* ---------- 17.6: parametrize a surface (17.6 #9–18) ---------- */
function P_sParam(){
  const h=pick([1,2,3]), a=pick([1,2,3]);
  const S=pick([
    [`the cone \\(z=\\sqrt{x^2+y^2}\\) for \\(0\\le z\\le ${h}\\)`,`\\langle u\\cos v,\\ u\\sin v,\\ u\\rangle,\\ 0\\le u\\le ${h},\\ 0\\le v\\le 2\\pi`,[
      [`\\langle u\\cos v,\\ u\\sin v,\\ u^2\\rangle,\\ 0\\le u\\le ${h}`,'z = u² is the paraboloid z = x² + y².'],[`\\langle ${h}\\cos v,\\ ${h}\\sin v,\\ u\\rangle,\\ 0\\le u\\le ${h}`,'That is a cylinder of radius '+h+'.'],[`\\langle u\\cos v,\\ u\\sin v,\\ ${h}\\rangle,\\ 0\\le u\\le ${h}`,'That is a flat disk at height '+h+'.'],
      [`\\langle ${h}\\sin u\\cos v,\\ ${h}\\sin u\\sin v,\\ ${h}\\cos u\\rangle`,'That is a sphere.'],[`\\langle u\\cos v,\\ u\\sin v,\\ u\\rangle,\\ 0\\le u\\le ${h*h}`,'u is the height, so it stops at '+h+'.']]],
    [`the cylinder \\(x^2+y^2=${a*a}\\) for \\(0\\le z\\le ${h}\\)`,`\\langle ${a}\\cos u,\\ ${a}\\sin u,\\ v\\rangle,\\ 0\\le u\\le 2\\pi,\\ 0\\le v\\le ${h}`,[
      [`\\langle v\\cos u,\\ v\\sin u,\\ v\\rangle,\\ 0\\le v\\le ${h}`,'That is a cone.'],[`\\langle ${a}\\cos u,\\ ${a}\\sin u,\\ v\\rangle,\\ 0\\le v\\le ${a}`,'The height runs to '+h+'.'],[`\\langle ${a*a}\\cos u,\\ ${a*a}\\sin u,\\ v\\rangle,\\ 0\\le v\\le ${h}`,'The radius is '+a+', not '+(a*a)+'.'],
      [`\\langle ${a}\\cos u,\\ v,\\ ${a}\\sin u\\rangle,\\ 0\\le v\\le ${h}`,'That cylinder runs along the y-axis.'],[`\\langle v\\cos u,\\ v\\sin u,\\ ${h}\\rangle,\\ 0\\le v\\le ${a}`,'That is the lid, a flat disk.']]],
    [`the paraboloid \\(z=x^2+y^2\\) for \\(z\\le ${h*h}\\)`,`\\langle v\\cos u,\\ v\\sin u,\\ v^2\\rangle,\\ 0\\le v\\le ${h},\\ 0\\le u\\le 2\\pi`,[
      [`\\langle v\\cos u,\\ v\\sin u,\\ v\\rangle,\\ 0\\le v\\le ${h}`,'That is a cone.'],[`\\langle v\\cos u,\\ v\\sin u,\\ v^2\\rangle,\\ 0\\le v\\le ${h*h}`,'v is the radius; it stops where v² = '+(h*h)+', at v = '+h+'.'],[`\\langle \\cos u,\\ \\sin u,\\ v^2\\rangle,\\ 0\\le v\\le ${h}`,'That is a cylinder of radius 1.'],
      [`\\langle v^2\\cos u,\\ v^2\\sin u,\\ v\\rangle,\\ 0\\le v\\le ${h}`,'That is x² + y² = z⁴.'],[`\\langle v\\cos u,\\ v\\sin u,\\ -v^2\\rangle,\\ 0\\le v\\le ${h}`,'That paraboloid opens downward.']]]]);
  const opts=[OK(`\\(\\mathbf r(u,v)=${S[1]}\\)`)].concat(S[2].map(([h_,w])=>NO(`\\(\\mathbf r(u,v)=${h_}\\)`,w)));
  return choiceQ(`Which is a parametrization of ${S[0]}?`,opts,'Check two things: the components satisfy the surface’s equation, and the parameter ranges cover exactly the given part.',[['',`\\mathbf r(u,v)=${S[1]}`]],undefined,1);
}
/* ---------- 17.6 (part 2, after the exam cut-off on the F26 calendar): flux (sprint only) ---------- */
function P_sFlux(){
  const a=pick([1,2,3]), K=pick(['radial','zup']);
  if(K==='radial'){ const ans=mv([4*a*a*a,1],1,1);
    return valQ(`Find the outward flux of \\(\\mathbf F=\\langle x,y,z\\rangle\\) across the sphere \\(x^2+y^2+z^2=${a*a}\\).`,ans,[D_(mv([4*a*a,1],1,1),'That is the area; F·n = a on the sphere.'),D_(mv([4*a*a*a,3],1,1),'That is the volume of the ball.'),D_('0','F points outward everywhere, so the flux is positive.')],
      'On the sphere n = r/a, so F·n = |r|²/a = a, constant: flux = a × area.',[['',`\\iint_S\\mathbf F\\cdot\\mathbf n\\,dS=${a}\\cdot 4\\pi\\cdot ${a*a}=${T(ans)}`]],{op:'val',e:`4*pi*${a}^3`},2); }
  const ans=mv([2*a*a*a,3],1,1);
  return valQ(`Find the upward flux of \\(\\mathbf F=\\langle 0,0,z\\rangle\\) across the hemisphere \\(z=\\sqrt{${a*a}-x^2-y^2}\\).`,ans,[D_(mv([4*a*a*a,3],1,1),'That is the flux through the whole sphere.'),D_(mv([a*a*a,1],1,1),'Used F·n = z instead of z²/a.'),D_('0','F points up above the xy-plane.')],
    'Upward normal n = r/a, so F·n = z²/a; then ∬z² dS over the hemisphere = 2πa⁴/3.',[['',`\\iint_S\\frac{z^2}{${a}}\\,dS=${T(ans)}`]],{op:'surf',f:`z^2/${a}`,r:[`${a}*sin(u)*cos(v)`,`${a}*sin(u)*sin(v)`,`${a}*cos(u)`],lim:[['u','0','pi/2'],['v','0','2*pi']]},2);
}
