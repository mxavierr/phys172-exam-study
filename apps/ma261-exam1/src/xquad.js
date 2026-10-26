
/* =====================================================================
   QUADRIC SURFACES IN 3-D: a small renderer (shaded mesh → SVG) and
   graph questions: equation → graph, graph → equation, graph → name,
   graph → traces, graph → which variable is special. Graphs travel as
   compact specs in <span class="qg" data-q='…'> and are drawn on display,
   so saved sessions and zips stay small.
   ===================================================================== */
const QG_NAMES={ell:'Ellipsoid',one:'Hyperboloid of one sheet',two:'Hyperboloid of two sheets',cone:'Elliptic cone',ep:'Elliptic paraboloid',hp:'Hyperbolic paraboloid',cyl:'Elliptic cylinder',pcyl:'Parabolic cylinder',hcyl:'Hyperbolic cylinder'};
const QG_SIG={ell:'all three squares with the same sign, equal to a positive constant',one:'three squares, exactly one negative, equal to a positive constant',two:'three squares, exactly two negative, equal to a positive constant',
  cone:'three squares and constant 0 (two squares equal to the third)',ep:'one variable to the first power and two squares with the SAME sign',hp:'one variable to the first power and two squares with OPPOSITE signs (a saddle)',
  cyl:'only two variables, both squared with the same sign (the third is missing)',pcyl:'only two variables: one squared, one to the first power',
  hcyl:'only two variables, both squared with opposite signs (the third is missing)'};
const QG_VIEWS=[[32,22],[48,20],[22,28],[58,26],[38,14]];      /* camera azimuth / elevation, degrees */
const AXL=['x','y','z'];
/* local (u, v, w) → global (x, y, z): w is the special axis `ax`; u, v are the other two in order (pcyl: u is the squared one) */
function qgMap(s){ const R=[0,1,2].filter(i=>i!==s.ax); if(s.t==='pcyl'&&s.sq!==undefined&&s.sq!==R[0]) R.reverse(); return p=>{ const g=[0,0,0]; g[R[0]]=p[0]; g[R[1]]=p[1]; g[s.ax]=p[2]; return g; }; }
function qgMesh(s){
  const a=s.a||1, b=s.b||1, c=s.c||1, sg=s.sg||1, ch=Math.cosh, sh=Math.sinh, P=Math.PI, grids=[];
  const G=(n,m,f)=>{ const g=[]; for(let i=0;i<=n;i++){ const row=[]; for(let j=0;j<=m;j++) row.push(f(i/n,j/m)); g.push(row); } grids.push(g); };
  switch(s.t){
    case 'ell': G(12,20,(i,j)=>{ const ph=P*i, th=2*P*j; return [a*Math.cos(th)*Math.sin(ph),b*Math.sin(th)*Math.sin(ph),c*Math.cos(ph)]; }); break;
    case 'one': G(10,20,(i,j)=>{ const u=-1.15+2.3*i, th=2*P*j; return [a*Math.cos(th)*ch(u),b*Math.sin(th)*ch(u),c*sh(u)]; }); break;
    case 'two': [1,-1].forEach(k=>G(7,20,(i,j)=>{ const u=1.3*i, th=2*P*j; return [a*Math.cos(th)*sh(u),b*Math.sin(th)*sh(u),k*c*ch(u)]; })); break;
    case 'cone': G(12,18,(i,j)=>{ const r=-1.3+2.6*i, th=2*P*j; return [a*r*Math.cos(th),b*r*Math.sin(th),c*r]; }); break;
    case 'ep': G(9,18,(i,j)=>{ const r=1.6*i, th=2*P*j; return [a*r*Math.cos(th),b*r*Math.sin(th),sg*r*r]; }); break;
    case 'hp': G(12,12,(i,j)=>{ const u=-1.4+2.8*i, v=-1.4+2.8*j; return [a*u,b*v,sg*(u*u-v*v)]; }); break;
    case 'cyl': G(8,20,(i,j)=>{ const w=(-1+2*i)*1.6*Math.max(a,b), th=2*P*j; return [a*Math.cos(th),b*Math.sin(th),w]; }); break;
    case 'pcyl': G(12,8,(i,j)=>{ const u=-1.3+2.6*i, v=(-1+2*j)*1.6*a; return [a*u,v,sg*u*u]; }); break;
    case 'hcyl': [1,-1].forEach(k=>G(10,8,(i,j)=>{ const u=-1.25+2.5*i, w=(-1+2*j)*1.8*Math.max(a,b); return [k*a*ch(u),b*sh(u),w]; })); break;
  }
  const map=qgMap(s); return grids.map(g=>g.map(row=>row.map(map)));
}
function qgSVG(s,px){
  const V_=QG_VIEWS[(s.v||0)%QG_VIEWS.length], al=V_[0]*Math.PI/180, be=V_[1]*Math.PI/180;
  const C=[Math.cos(al)*Math.cos(be),Math.sin(al)*Math.cos(be),Math.sin(be)], Rt=[-Math.sin(al),Math.cos(al),0], Up=[-Math.cos(al)*Math.sin(be),-Math.sin(al)*Math.sin(be),Math.cos(be)];
  const dot=(p,q)=>p[0]*q[0]+p[1]*q[1]+p[2]*q[2];
  /* display box: stretch a flat direction so nothing renders as a sliver (shape and orientation are what the questions test) */
  const grids=qgMesh(s), E=[0,0,0];
  grids.forEach(g=>g.forEach(r=>r.forEach(p=>{ for(let k=0;k<3;k++) E[k]=Math.max(E[k],Math.abs(p[k])); })));
  const Em=Math.max(...E), S=E.map(e=>e>0?Math.max(1,(Em/1.45)/e):1);
  grids.forEach(g=>g.forEach(r=>r.forEach(p=>{ for(let k=0;k<3;k++) p[k]*=S[k]; })));
  const Ed=E.map((e,k)=>e*S[k]), L=Math.max(...Ed)*1.32;
  const pr=p=>[dot(p,Rt),-dot(p,Up),dot(p,C)];
  /* light from the upper left, a little in front */
  let Lt=[C[0]+.7*Up[0]-.45*Rt[0],C[1]+.7*Up[1]-.45*Rt[1],C[2]+.7*Up[2]-.45*Rt[2]]; const ll=Math.hypot(...Lt); Lt=Lt.map(v=>v/ll);
  const quads=[];
  grids.forEach(g=>{ for(let i=0;i<g.length-1;i++) for(let j=0;j<g[i].length-1;j++){
    const q=[g[i][j],g[i+1][j],g[i+1][j+1],g[i][j+1]];
    const d1=[q[2][0]-q[0][0],q[2][1]-q[0][1],q[2][2]-q[0][2]], d2=[q[3][0]-q[1][0],q[3][1]-q[1][1],q[3][2]-q[1][2]];
    let n=[d1[1]*d2[2]-d1[2]*d2[1],d1[2]*d2[0]-d1[0]*d2[2],d1[0]*d2[1]-d1[1]*d2[0]]; const nl=Math.hypot(...n); if(nl<1e-12) continue; n=n.map(v=>v/nl);
    const c4=[(q[0][0]+q[2][0])/2,(q[0][1]+q[2][1])/2,(q[0][2]+q[2][2])/2], ea=[0,0,0]; ea[s.ax]=1;
    const ref=s.t==='ell'||s.t==='two'?c4:s.t==='hp'||s.t==='pcyl'?ea:c4.map((v,k)=>k===s.ax?0:v);
    if(dot(n,ref)<0) n=n.map(v=>-v);                                           /* n points outward (or up) */
    const front=dot(n,C)>=0; if(!front) n=n.map(v=>-v);                       /* front: you see the outer side */
    const k=Math.max(0,dot(n,Lt)), lvl=Math.min(6,Math.round(1+5.2*k*k+.6*k)), P2=q.map(pr);
    quads.push({pts:P2,d:P2.reduce((a,p)=>a+p[2],0)/4,cls:(front?'f':'b')+lvl}); } });
  quads.sort((x,y)=>x.d-y.d);
  /* axes: sample each axis, test whether the surface covers it (point in a nearer quad), draw covered runs dashed, open runs solid */
  const inQ=(pt,q)=>{ let c=false; const P=q.pts; for(let a=0,b=3;a<4;b=a++){ const [xa,ya]=P[a],[xb,yb]=P[b]; if(((ya>pt[1])!==(yb>pt[1]))&&(pt[0]<(xb-xa)*(pt[1]-ya)/(yb-ya)+xa)) c=!c; } return c; };
  const axes=[0,1,2].map(i=>{ const lo=-Math.max(L*.72,Ed[i]*1.3), N=48, pts=[];
    for(let k=0;k<=N;k++){ const t=lo+(L-lo)*k/N, p3=[0,0,0]; p3[i]=t; const p=pr(p3); const hid=quads.some(q=>q.d>p[2]+1e-6&&inQ(p,q)); pts.push({p,hid}); }
    const e=[0,0,0]; e[i]=L; const m=[0,0,0]; m[i]=lo; return {pts,e:pr(e),m:pr(m)}; });
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; const grow=p=>{ x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); y0=Math.min(y0,p[1]); y1=Math.max(y1,p[1]); };
  quads.forEach(q=>q.pts.forEach(grow)); axes.forEach(a=>{ grow(a.m); grow(a.e); });
  const pad=.16*Math.max(x1-x0,y1-y0), W=x1-x0+2*pad, H=y1-y0+2*pad, sc=240/Math.max(W,H), f=v=>(v*sc).toFixed(1);
  const X=v=>f(v-x0+pad), Y=v=>f(v-y0+pad), vw=(W*sc).toFixed(0), vh=(H*sc).toFixed(0);
  const poly=quads.map(q=>`<path class="${q.cls}" d="M${q.pts.map(p=>X(p[0])+' '+Y(p[1])).join('L')}Z"/>`).join('');
  const runs=a=>{ const out=[]; let cur=null; a.pts.forEach((s_,k)=>{ if(!cur||cur.hid!==s_.hid){ if(cur) cur.pts.push(s_.p); cur={hid:s_.hid,pts:[s_.p]}; out.push(cur); } else cur.pts.push(s_.p); }); return out; };
  const over=axes.map((a,i)=>{ const {e,m}=a, dx=e[0]-m[0], dy=e[1]-m[1], dl=Math.hypot(dx,dy)||1, ux=dx/dl, uy=dy/dl, h=11/sc;
    const l=[e[0]-h*ux+h*.42*uy,e[1]-h*uy-h*.42*ux], r=[e[0]-h*ux-h*.42*uy,e[1]-h*uy+h*.42*ux];
    const lines=runs(a).map(R=>{ const A=R.pts[0], B=R.pts[R.pts.length-1]; return `<line class="${R.hid?'hid':'vis'}" x1="${X(A[0])}" y1="${Y(A[1])}" x2="${X(B[0])}" y2="${Y(B[1])}"/>`; }).join('');
    return lines+`<path class="ah" d="M${X(e[0])} ${Y(e[1])}L${X(l[0])} ${Y(l[1])}L${X(r[0])} ${Y(r[1])}Z"/>`+
      `<text x="${X(e[0]+ux*17/sc)}" y="${Y(e[1]+uy*17/sc)}" dy="6" text-anchor="middle">${AXL[i]}</text>`; }).join('');
  const under='';
  return `<svg class="qgsvg" viewBox="0 0 ${vw} ${vh}" style="width:${px||170}px;max-width:100%" role="img" aria-label="3-D graph of a surface"><g class="qga">${under}</g><g class="qgm">${poly}</g><g class="qga">${over}</g></svg>`;
}
const qgSpan=(s,px)=>`<span class="qg" data-px="${px||170}" data-q='${JSON.stringify(s)}'></span>`;
function qgHydrate(root){ (root||document).querySelectorAll('.qg[data-q]:not([data-done])').forEach(el=>{ try{ el.innerHTML=qgSVG(JSON.parse(el.dataset.q),+el.dataset.px||170); el.dataset.done='1'; }catch(e){} }); }
function qgDescribe(s){ return `${QG_NAMES[s.t]}, ${s.t==='cyl'||s.t==='hcyl'?'axis':s.t==='pcyl'?'first-power variable':'axis'} along the ${AXL[s.ax]}-axis${s.t==='pcyl'?`, free variable ${AXL[3-s.ax-s.sq]}`:''}${(s.t==='ep'||s.t==='pcyl')?(s.sg>0?', opening toward +':', opening toward −')+AXL[s.ax]:''}`; }

/* equation of a spec, input syntax, written in x, y, z order */
function qgEq(s){
  const a=s.a||1, b=s.b||1, c=s.c||1, sg=s.sg||1, R=[0,1,2].filter(i=>i!==s.ax);
  const sq=(i,d)=>d===1?`${AXL[i]}^2`:`${AXL[i]}^2/${d*d}`;
  const T=(i,d,neg)=>({i,t:(neg?'-':'')+sq(i,d)});
  const side=ts=>ts.sort((p,q)=>p.i-q.i).map((x,k)=>k===0?x.t:x.t[0]==='-'?` - ${x.t.slice(1)}`:` + ${x.t}`).join('');
  switch(s.t){
    case 'ell': return `${side([T(R[0],a),T(R[1],b),T(s.ax,c)])} = 1`;
    case 'one': return `${side([T(R[0],a),T(R[1],b),T(s.ax,c,true)])} = 1`;
    case 'two': return `${side([T(R[0],a,true),T(R[1],b,true),T(s.ax,c)])} = 1`;
    case 'cone': return `${side([T(R[0],a),T(R[1],b)])} = ${sq(s.ax,c)}`;
    case 'ep': return `${AXL[s.ax]} = ${side([T(R[0],a,sg<0),T(R[1],b,sg<0)])}`;
    case 'hp': return `${AXL[s.ax]} = ${side([T(R[0],a,sg<0),T(R[1],b,sg>0)])}`;
    case 'cyl': return `${side([T(R[0],a),T(R[1],b)])} = 1`;
    case 'hcyl': return `${side([T(R[0],a),T(R[1],b,true)])} = 1`;
    case 'pcyl': return `${AXL[s.ax]} = ${sg<0?'-':''}${sq(s.sq,a)}`;
  }
}
/* traces in planes <var> = k */
function qgTrace(s,v){
  const along=v===s.ax;
  switch(s.t){
    case 'ell': return 'Ellipses';
    case 'one': return along?'Ellipses':'Hyperbolas';
    case 'two': return along?'Ellipses':'Hyperbolas';
    case 'cone': return along?'Ellipses':'Hyperbolas';
    case 'ep': return along?'Ellipses':'Parabolas';
    case 'hp': return along?'Hyperbolas':'Parabolas';
    case 'cyl': return along?'Ellipses':'Lines';
    case 'hcyl': return along?'Hyperbolas':'Lines';
    case 'pcyl': return along?'Lines':v===s.sq?'Lines':'Parabolas';
  }
}
function qgRand(t,view){
  const s={t:t||pick(['ell','one','two','cone','ep','hp','cyl','pcyl']),ax:ri(0,2),v:view===undefined?ri(0,QG_VIEWS.length-1):view};
  const circ=coin(.4); s.a=ri(1,3); s.b=circ?s.a:ri(1,3); s.c=ri(1,3);
  if(s.t==='ell'&&s.a===s.b&&s.b===s.c) s.c=s.a===3?1:s.a+1;
  if(s.t==='ep'||s.t==='hp'||s.t==='pcyl'){ s.c=1; s.sg=pick([1,-1]); s.a=ri(1,2); s.b=circ?s.a:ri(1,2); }
  if(s.t==='pcyl'){ s.sq=pick([0,1,2].filter(i=>i!==s.ax)); s.b=1; }
  return s;
}
const qgSame=(p,q)=>qgEq(p)===qgEq(q);
function qgWhy(d,key){
  if(d.t===key.t) return `That is also ${/^[AEIOU]/.test(QG_NAMES[d.t])?'an':'a'} ${QG_NAMES[d.t].toLowerCase()}, but ${d.t==='pcyl'||d.t==='ep'?(d.ax!==key.ax?`its first-power variable is ${AXL[d.ax]}`:'it opens the other way'):d.t==='hp'?(d.ax!==key.ax?`its first-power variable is ${AXL[d.ax]}`:'its up and down directions are swapped'):`its axis is the ${AXL[d.ax]}-axis`}; in this equation the special variable is ${AXL[key.ax]}.`;
  return `That graph is ${/^[AEIOU]/.test(QG_NAMES[d.t])?'an':'a'} ${QG_NAMES[d.t].toLowerCase()}: its equation has ${QG_SIG[d.t]}.`;
}
/* distractor specs: same shape turned onto other axes, and neighbouring shapes on the same axis */
function qgNeighbours(key){
  const near={ell:['one','cyl','two','cone'],one:['two','cone','cyl','ell'],two:['one','cone','ep','ell'],cone:['one','two','ep','cyl'],ep:['hp','cone','two','pcyl'],hp:['ep','one','pcyl','cone'],cyl:['one','ell','pcyl','cone'],pcyl:['cyl','ep','hp','one']}[key.t];
  const out=[];
  if(key.t!=='ell') [0,1,2].filter(i=>i!==key.ax).forEach(ax=>{ const d={...key,ax}; if(key.t==='pcyl') d.sq=pick([0,1,2].filter(i=>i!==ax)); out.push(d); });
  if(key.sg&&key.t!=='hp') out.push({...key,sg:-key.sg});
  near.forEach(t=>{ const d=qgRand(t,key.v); d.ax=key.ax; d.a=key.a; d.b=t==='pcyl'?1:key.b; if(t==='pcyl') d.sq=[0,1,2].find(i=>i!==key.ax); if(d.t==='ell'&&d.a===d.b&&d.b===d.c) d.c=d.a===3?1:d.a+1; out.push(d); });
  return out;
}

/* ---- question builders: return {q, opts:[{h,ok,why}], ans, how, sol, chk} ---- */
function qgEqToGraph(){
  const key=qgRand(); const eq=qgEq(key), seen=[eq], opts=[{h:qgSpan(key,150),ok:true,why:'',spec:key}];
  for(const d of shuf(qgNeighbours(key)).sort((p,q)=>(q.t===key.t)-(p.t===key.t))){ const e=qgEq(d); if(seen.includes(e)) continue; seen.push(e); opts.push({h:qgSpan(d,200),ok:false,why:qgWhy(d,key),spec:d}); if(opts.length===5) break; }
  if(opts.length<4) return null;
  return {q:`Which graph shows the surface ${mk(eq)}?`,opts,ans:qgSpan(key,200),lv:2,
    how:`Read the equation: ${QG_SIG[key.t]} → ${QG_NAMES[key.t].toLowerCase()}. The ${key.t==='cyl'?'missing':key.t==='ep'||key.t==='hp'||key.t==='pcyl'?'first-power':'odd-one-out'} variable ${AXL[key.ax]} sets the orientation.`,
    sol:[[`${QG_NAMES[key.t]} (${qgDescribe(key)}).`,tex(eq)]],chk:{op:'qgraph',n:{mode:'eq2g',key,opts:opts.map(o=>o.spec),eqs:opts.map(o=>qgEq(o.spec))}}};
}
function qgGraphToEq(){
  const key=qgRand(); const eq=qgEq(key), seen=[eq], opts=[{h:mk(eq),ok:true,why:''}], specs=[key];
  for(const d of shuf(qgNeighbours(key))){ const e=qgEq(d); if(seen.includes(e)) continue; seen.push(e); specs.push(d); opts.push({h:mk(e),ok:false,why:qgWhy(d,key).replace('That graph is','That equation describes').replace('That is also','That is also'),}); if(opts.length===5) break; }
  if(opts.length<4) return null;
  return {q:`Which equation matches this surface?<div class="qgfig">${qgSpan(key,290)}<span class="qglegend">blue: outer side · tan: inner side · dashed: axis behind the surface</span></div>`,opts,ans:mk(eq),lv:2,
    how:`Identify the shape (${QG_NAMES[key.t].toLowerCase()}), then the special axis from the picture: ${AXL[key.ax]}.`,
    sol:[[`The picture is ${/^[AEIOU]/.test(QG_NAMES[key.t])?'an':'a'} ${qgDescribe(key).replace(/^./,c=>c.toLowerCase())}.`,tex(eq)]],chk:{op:'qgraph',n:{mode:'g2e',key,opts:specs,eqs:seen}}};
}
function qgGraphToName(){
  const key=qgRand(), nm=QG_NAMES[key.t];
  const opts=[{h:nm,ok:true,why:''}].concat(shuf(Object.keys(QG_NAMES).filter(t=>t!==key.t)).slice(0,4).map(t=>({h:QG_NAMES[t],ok:false,why:`${QG_NAMES[t]}: ${QG_SIG[t]}. Compare with the picture: ${{ell:'a closed, bounded surface',one:'one connected piece with a waist',two:'two separate pieces',cone:'two nappes meeting at a single point',ep:'a bowl',hp:'a saddle',cyl:'a tube of constant cross-section',pcyl:'a parabola swept along a line',hcyl:'two curved walls: a hyperbola swept along a line'}[t]}.`})));
  return {q:`Which surface is shown?<div class="qgfig">${qgSpan(key,290)}<span class="qglegend">blue: outer side · tan: inner side · dashed: axis behind the surface</span></div>`,opts,ans:nm,lv:1,
    how:'Closed and bounded: ellipsoid. One piece with a waist: one sheet. Two pieces: two sheets. Two nappes touching at a point: cone. Bowl: elliptic paraboloid. Saddle: hyperbolic paraboloid. Straight lines along one direction: cylinder.',
    sol:[[`${nm}: ${qgDescribe(key)}.`,'']],chk:{op:'qgraph',n:{mode:'name',key,name:nm,eqs:[eq0(key)]}}};
}
function qgGraphToTrace(){
  const key=qgRand(); const v=ri(0,2), tr=qgTrace(key,v);
  const all=['Ellipses','Hyperbolas','Parabolas','Lines','Single points'];
  const opts=[{h:tr,ok:true,why:''}].concat(all.filter(x=>x!==tr).slice(0,4).map(x=>({h:x,ok:false,why:`Slice the picture with planes ${AXL[v]} = k: for this ${QG_NAMES[key.t].toLowerCase()} the cross-sections are ${tr.toLowerCase()}.`})));
  return {q:`What are the traces of this surface in the planes ${m`${AXL[v]}=k`} (for values of ${m`k`} that give a nonempty curve, other than special values)?<div class="qgfig">${qgSpan(key,290)}<span class="qglegend">blue: outer side · tan: inner side · dashed: axis behind the surface</span></div>`,opts,ans:tr,lv:2,
    how:'Imagine slicing the surface with planes perpendicular to that axis, or set that variable to a constant in the equation.',
    sol:[[`This is ${/^[AEIOU]/.test(QG_NAMES[key.t])?'an':'a'} ${qgDescribe(key).replace(/^./,c=>c.toLowerCase())}; its equation is below. Setting ${AXL[v]} = k leaves ${tr.toLowerCase()}.`,tex(qgEq(key))]],chk:{op:'qgraph',n:{mode:'trace',key,v,trace:tr,eqs:[eq0(key)]}}};
}
function qgGraphToAxis(){
  const key=qgRand(pick(['one','two','cone','ep','hp','cyl']));
  const what={one:'Along which axis does the negative squared term sit?',two:'Which variable’s square has the positive sign (the other two are negative)?',cone:'Which variable is alone on one side of the equation (the cone’s axis)?',ep:'Which variable appears to the first power?',hp:'Which variable appears to the first power?',cyl:'Which variable is missing from the equation?'}[key.t];
  const opts=['x','y','z'].map(a=>({h:m`${a}`,ok:a===AXL[key.ax],why:`The picture’s special direction is the ${AXL[key.ax]}-axis: ${key.t==='cyl'?'the tube runs along it':key.t==='ep'?'the bowl opens along it':key.t==='hp'?'the saddle rises and falls along it':'the surface is symmetric around it'}.`})).concat([{h:'It cannot be read from the graph',ok:false,why:'The orientation of the surface shows which variable is special.'}]);
  return {q:`This is ${/^[AEIOU]/.test(QG_NAMES[key.t])?'an':'a'} ${QG_NAMES[key.t].toLowerCase()}. ${what}<div class="qgfig">${qgSpan(key,290)}<span class="qglegend">blue: outer side · tan: inner side · dashed: axis behind the surface</span></div>`,opts,ans:m`${AXL[key.ax]}`,lv:1,
    how:'The special variable of a quadric points along the surface’s axis (or the direction a paraboloid opens, or the direction a cylinder runs).',
    sol:[[`The special direction is the ${AXL[key.ax]}-axis.`,tex(qgEq(key))]],chk:{op:'qgraph',n:{mode:'axis',key,eqs:[eq0(key)]}}};
}
const eq0=qgEq;
const QG_BUILD={eq2g:qgEqToGraph,g2e:qgGraphToEq,name:qgGraphToName,trace:qgGraphToTrace,axis:qgGraphToAxis};
const qgMake=mode=>{ const o=(QG_BUILD[mode]||pick([qgEqToGraph,qgEqToGraph,qgGraphToEq,qgGraphToEq,qgGraphToName,qgGraphToTrace,qgGraphToAxis]))(); if(!o) return null;
  o.opts=o.opts.map(({h,ok,why})=>({h,ok,why})); return o; };

/* ---- sprint ---- */
add('quad-graph','Quadric surfaces','13.6',()=>{ const o=qgMake(); if(!o) return null; return {q:o.q,kind:'choice',opts:o.opts,ans:o.ans,lv:o.lv,how:o.how,sol:o.sol,chk:o.chk}; });
/* ---- mock exam: pick the surface / equation from a figure — S2022-Q5, F2016-Q3 ---- */
addX('x-quad-graph','QUAD',2,['S2022-Q5','F2016-Q3'],()=>{ const o=qgMake(pick(['eq2g','g2e','g2e','name'])); if(!o) return null;
  const k=o.opts.find(x=>x.ok); return xq(o.q,xm({h:k.h},o.opts.filter(x=>!x.ok).map(x=>({h:x.h,why:x.why}))),{kind:'choice',lv:o.lv,how:o.how,sol:o.sol,chk:o.chk}); });
/* ---- diagnostic ---- */
if(typeof addI==='function'){
  addI('quad',()=>{ const o=qgMake(pick(['name','eq2g'])); if(!o) return null; return {q:o.q,kind:'choice',opts:o.opts,ans:o.ans,lv:1,how:o.how,sol:o.sol}; });
  addI('quad',()=>{ const o=qgMake(pick(['g2e','axis','trace'])); if(!o) return null; return {q:o.q,kind:'choice',opts:o.opts,ans:o.ans,lv:o.lv,how:o.how,sol:o.sol}; });
}
