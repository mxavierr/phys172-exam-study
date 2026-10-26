/* ==== 11 · figures ======================================================
   Small inline SVGs drawn to scale from each question's own numbers. They show
   only what the text states (angles, attachments, arrangement) and never a force
   or direction the student is meant to work out. FIG._ is the drawing kit.
   Classes carry MEANING (colors live in 01_style.css, "figures"):
     structure  s r sp h d  ink lines, springs, hatching, dashed guides
     objects    b ball      marigold fill with ink outline (blocks, balls, seats, star)
     given      dim a ta gl blue: dimension lines, angle arcs, given labels (STIX italic)
     asked      ask ak fl fv rust: ring + label on the point/quantity the question asks about
     neutral    in vl t2 v  point names, variable names, small words, motion arrows (ink)
   ======================================================================== */
const FIG=(()=>{
  const f=v=>(+v).toFixed(1);
  const pt=(cx,cy,r,deg)=>[cx+r*Math.cos(deg*D2R),cy-r*Math.sin(deg*D2R)];      /* math angle, y up */
  const svg=(w,h,body,label)=>`<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-width:${w}px" role="img" `+
                              `aria-label="${label}">${body}</svg>`;
  const L=(x1,y1,x2,y2,c)=>`<line class="${c}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  const T=(x,y,s,o)=>{ o=o||{};
    return `<text class="${o.c||''}" x="${f(x)}" y="${f(y)}" text-anchor="${o.a||'middle'}"`+
           `${o.b?` dominant-baseline="${o.b}"`:''}>${s}</text>`; };
  const ceil=(x1,x2,y)=>{ let s=''; for(let x=x1+6;x<=x2;x+=9) s+=L(x,y,x-7,y-7,'h'); return s+L(x1,y,x2,y,'s'); };
  const floor=(x1,x2,y)=>{ let s=''; for(let x=x1+6;x<=x2;x+=9) s+=L(x,y,x-7,y+7,'h'); return s+L(x1,y,x2,y,'s'); };
  const wall=(x,y1,y2)=>{ let s=''; for(let y=y1+6;y<=y2;y+=9) s+=L(x,y,x-7,y+7,'h'); return s+L(x,y1,x,y2,'s'); };
  const box=(x,y,w,h,s)=>`<rect class="b" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="2"/>`+
                         (s?T(x+w/2,y+h/2+1,s,{c:'in',b:'central'}):'');
  const arrow=(x1,y1,x2,y2,c)=>{
    c=c||'f'; const a=Math.atan2(y2-y1,x2-x1),hl=10,hw=5,bx=x2-hl*Math.cos(a),by=y2-hl*Math.sin(a);
    return L(x1,y1,bx,by,c)+`<polygon class="${c}h" points="${f(x2)},${f(y2)} `+
      `${f(bx+hw*Math.sin(a))},${f(by-hw*Math.cos(a))} ${f(bx-hw*Math.sin(a))},${f(by+hw*Math.cos(a))}"/>`;
  };
  const arc=(cx,cy,r,d0,d1)=>{
    const p=pt(cx,cy,r,d0),q=pt(cx,cy,r,d1);
    return `<path class="a" d="M${f(p[0])} ${f(p[1])} A${r} ${r} 0 ${Math.abs(d1-d0)>180?1:0} ${d1>d0?0:1} `+
           `${f(q[0])} ${f(q[1])}"/>`;
  };
  const angle=(cx,cy,r,d0,d1,deg,side)=>{
    const narrow=Math.abs(d1-d0)<24, at=narrow?(side==='hi'?Math.max(d0,d1)+12:Math.min(d0,d1)-12):(d0+d1)/2;
    const p=pt(cx,cy,r+(narrow?10:15),at);
    return arc(cx,cy,r,d0,d1)+T(p[0],p[1]+1,`${deg}°`,{c:'ta',b:'central'}); };
  const coil=(x,y1,y2,w,coils)=>{
    const lead=3,n=coils*2,h=(y2-y1-2*lead)/n; let d=`M${f(x)} ${f(y1)} L${f(x)} ${f(y1+lead)}`;
    for(let i=0;i<n;i++) d+=` L${f(x+(i%2?-w:w))} ${f(y1+lead+h*(i+0.5))}`;
    return `<path class="sp" d="${d} L${f(x)} ${f(y2-lead)} L${f(x)} ${f(y2)}"/>`;
  };
  const dot=(x,y,r,c)=>`<circle class="${c||'k'}" cx="${f(x)}" cy="${f(y)}" r="${r}"/>`;

  return {_:{f,pt,svg,L,T,ceil,floor,wall,box,arrow,arc,angle,coil,dot}};
})();

/* =====================================================================
   Module 2 figures, drawn from each question's own numbers.
   Rule: show what the text states (points, heights, angles, set-up); never a
   force, sign or speed the student is meant to work out.
   ===================================================================== */
(()=>{
  const {f,pt,svg,L,T,floor,box,arrow,angle,dot}=FIG._;
  const dcoil=(p,q,w,coils)=>{ const dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,nx=-uy,ny=ux,lead=4,n=coils*2,h=(len-2*lead)/n;
    const P=(s,o)=>`${f(p[0]+ux*s+nx*o)} ${f(p[1]+uy*s+ny*o)}`; let d=`M${P(0,0)} L${P(lead,0)}`;
    for(let i=0;i<n;i++) d+=` L${P(lead+h*(i+0.5),i%2?-w:w)}`; return `<path class="sp" d="${d} L${P(len-lead,0)} L${P(len,0)}"/>`; };
  const SUBI=['','₁','₂','₃'];
  const ring=(x,y)=>`<circle class="ask" cx="${f(x)}" cy="${f(y)}" r="11"/>`;
  const mbox=(x,y,w,h)=>box(x,y,w,h,'')+T(x+w/2,y+h/2+1,'M',{c:'vl',b:'central'});
  Object.assign(FIG,{
    /* ball on a rod (or a Ferris-wheel seat) moving around a vertical circle; A top, B right, C bottom, D left */
    eCircle(from,dir,seat){
      const W=300,H=246,cx=140,cy=112,R=82,ang={A:90,B:0,C:270,D:180};
      let s=`<circle class="d" cx="${cx}" cy="${cy}" r="${R}"/>`+L(cx-R-14,cy,cx+R+14,cy,'h')+L(cx,cy-R-14,cx,cy+R+14,'h');
      Object.keys(ang).forEach(k=>{ const p=pt(cx,cy,R,ang[k]),l=pt(cx,cy,R+17,ang[k]); s+=dot(p[0],p[1],2.5)+T(l[0],l[1]+1,k,{c:'in',b:'central'}); });
      const b=pt(cx,cy,R,ang[from]);
      s+=L(cx,cy,b[0],b[1],seat?'d':'r')+dot(cx,cy,3)+(seat?box(b[0]-11,b[1]-9,22,18,''):dot(b[0],b[1],8,'ball'));
      const a0=ang[from]+(dir==='cw'?-22:22), a1=ang[from]+(dir==='cw'?-48:48), m0=pt(cx,cy,R+30,a0), m1=pt(cx,cy,R+30,a1);
      s+=arrow(m0[0],m0[1],m1[0],m1[1],'v');
      const r=pt(cx,cy,R*0.5,ang[from]+(ang[from]===90||ang[from]===270?25:65)); s+=T(r[0],r[1],'R',{c:'gl'});
      s+=T(W-4,H-6,dir==='cw'?'moving clockwise':'moving counterclockwise',{c:'t2',a:'end'});
      return svg(W,H,s,`${seat?'Seat':'Ball'} on a vertical circle at ${from}, moving ${dir==='cw'?'clockwise':'counterclockwise'}; A top, B right, C bottom, D left`);
    },
    /* frictionless track: a half-pipe bowl, or a hill feeding a vertical loop */
    eTrack(kind,o){
      if(kind==='bowl'){
        const W=300,H=170,cx=150,cy=26,R=120;
        let s=`<path class="r" fill="none" d="M${cx-R} ${cy} A${R} ${R} 0 0 0 ${cx+R} ${cy}"/>`+L(cx-R,cy,cx+R,cy,'d')+dot(cx,cy,2.5);
        const p1=[cx-R,cy], p2=[cx,cy+R];
        const ask2=o&&o.ask==='2';
        s+=dot(p1[0],p1[1],7,'ball')+T(p1[0]-14,p1[1]-9,'1',{c:'in'})+(ask2?ring(p2[0],p2[1]):'')+dot(p2[0],p2[1],3.5)+T(p2[0],p2[1]-14,'2',{c:ask2?'ak':'in'});
        s+=L(cx,cy,cx+R*0.71,cy+R*0.71,'dim')+T(cx+R*0.42,cy+R*0.36,'R',{c:'gl'});
        if(o&&o.roll) s+=T(W-8,14,'solid ball, rolls without slipping',{c:'t2',a:'end'});
        return svg(W,H,s,'Smooth semicircular track of radius R; location 1 at the rim, location 2 at the bottom');
      }
      const W=340,H=230,gy=206,R=48,lx=230,sc=Math.min(1,150/(o.h/o.R*R)), hp=o.h/o.R*R*sc, Rp=R*sc;
      const cxL=lx, cyL=gy-Rp, top=gy-hp;
      let s=floor(10,W-10,gy);
      s+=`<path class="r" fill="none" d="M30 ${f(top)} C 80 ${f(top)}, 110 ${gy}, 160 ${gy} L ${cxL} ${gy}"/>`;
      s+=`<circle class="r" fill="none" cx="${f(cxL)}" cy="${f(cyL)}" r="${f(Rp)}"/>`+L(cxL,gy,W-20,gy,'r');
      const at=o.at, pC=[cxL,cyL-Rp], pD=[cxL+Rp,cyL];
      s+=dot(30,top,7,'ball')+T(30,top-14,'A',{c:'in'})+dot(160,gy,3.5)+T(160,gy+17,'B',{c:'in'});
      s+=(at==='C'?ring(pC[0],pC[1]):'')+dot(pC[0],pC[1],3.5)+T(pC[0],pC[1]-14,'C',{c:at==='C'?'ak':'in'});
      s+=(at==='D'?ring(pD[0],pD[1]):'')+dot(pD[0],pD[1],3.5)+T(pD[0]+16,pD[1]+5,'D',{c:at==='D'?'ak':'in'});
      s+=L(18,top,18,gy,'dim')+L(13,top,23,top,'dim')+L(13,gy,23,gy,'dim')+T(26,(top+gy)/2+5,'h',{c:'gl',a:'start'});
      s+=L(cxL,cyL,cxL-Rp*0.7,cyL+Rp*0.7,'dim')+dot(cxL,cyL,2)+T(cxL-Rp*0.55,cyL+Rp*0.28,'R',{c:'gl'});
      return svg(W,H,s,'Frictionless roller coaster: start A at height h, bottom B, top of the loop C, side of the loop D, loop radius R');
    },
    /* block launched by a compressed spring: vertical (three snapshots) or up an incline */
    eLaunch(d){
      const vc=d.find==='v'?'fv':'v', vlab=d.find==='v'?'fl':'vl';     /* v₀ is rust only when it is what the question asks */
      if(!d.incline){
        const W=330,H=246,gy=214,s0=110,sc=46,lc=s0-sc;
        let s=floor(10,W-10,gy);
        const col=(x,len,lab)=>FIG._.coil(x,gy-len,gy,9,len>80?9:7)+T(x,gy+16,lab,{c:'t2'});
        s+=col(60,s0,'relaxed')+L(38,gy-s0,82,gy-s0,'d')+T(30,gy-s0/2,'L₀',{c:'gl',a:'end'})+L(34,gy-s0,34,gy,'dim');
        s+=col(150,lc,'held')+mbox(130,gy-lc-30,40,30)+L(118,gy-lc,118,gy,'dim')+T(112,gy-lc/2,'L',{c:'gl',a:'end'});
        s+=col(250,s0,'launch')+mbox(230,gy-s0-30,40,30)+arrow(282,gy-s0-6,282,gy-s0-50,vc)+T(288,gy-s0-30,'v₀',{c:vlab,a:'start'});
        s+=L(222,gy-s0,300,gy-s0,'d');
        return svg(W,H,s,'Vertical spring: relaxed length L0; block of mass M held with the spring compressed to L; released, it leaves the spring at the relaxed length with speed v0');
      }
      const W=340,H=214,th=d.th,bx=34,by=194,len=Math.min(220,112/Math.sin(d.th*D2R)),u=[Math.cos(th*D2R),-Math.sin(th*D2R)],n=[-Math.sin(th*D2R),-Math.cos(th*D2R)];
      const P=(a,o)=>[bx+u[0]*a+n[0]*(o||0),by+u[1]*a+n[1]*(o||0)], top=P(len);
      let s=`<path class="ramp" d="M${bx} ${by} L${f(top[0])} ${f(top[1])} L${f(top[0])} ${by} Z"/>`+floor(10,W-10,by)+angle(bx,by,38,0,th,th);
      const w0=P(8,0),w1=P(8,36); s+=`<line class="s" x1="${f(w0[0])}" y1="${f(w0[1])}" x2="${f(w1[0])}" y2="${f(w1[1])}" style="stroke-width:3"/>`;
      const sL=len*0.42, sL0=len-8;
      s+=dcoil(P(8,12),P(8+sL,12),5,7);
      const c=P(8+sL+16,12); s+=`<g transform="translate(${f(c[0])} ${f(c[1])}) rotate(${-th})"><rect class="b" x="-16" y="-12" width="32" height="24" rx="3"/></g>`+T(c[0]+n[0]*2,c[1]+n[1]*2+1,'M',{c:'vl',b:'central'});
      const e=P(sL0,12); s+=L(e[0]+n[0]*-10,e[1]+n[1]*-10,e[0]+n[0]*18,e[1]+n[1]*18,'d');
      s+=T(top[0]+10,top[1]+30,'spring relaxed here',{c:'t2',a:'start'});
      const v1=P(sL0+4,22),v2=P(sL0+38,22); s+=arrow(v1[0],v1[1],v2[0],v2[1],vc)+T(v2[0]+8,v2[1]+6,'v₀',{c:vlab,a:'start'});
      s+=T(top[0]+10,by-12,d.mu?`μ<tspan baseline-shift="sub" font-size="12">k</tspan> = ${d.mu}`:'frictionless',{c:d.mu?'gl':'t2',a:'start'});
      return svg(W,H,s,`Spring on a ${th} degree incline compressed to L; the block leaves the end of the ramp, where the spring is relaxed, at speed v0`);
    },
    /* potential-energy well (Morse shape) with the total-energy line and marked separations */
    eWell(c){
      const W=340,H=244,x0=58,y0=34,pw=262,ph=190, Umin=-c.D-0.2, ytop=0.1;
      const Y=u=>y0+(ytop-u)/(ytop-Umin)*ph, re=0.32, a=6.2, X=r=>x0+r*pw;
      const U=r=>c.D*Math.pow(1-Math.exp(-a*(r-re)),2)-c.D;
      const rOf=(u,side)=>{ const q=Math.sqrt((u+c.D)/c.D); return re+(side==='in'?-Math.log(1+q):-Math.log(1-q))/a; };
      let s='';
      for(let v=0;v>=Umin-1e-9;v=+(v-0.2).toFixed(2)){ s+=L(x0-4,Y(v),x0,Y(v),'dim')+T(x0-7,Y(v)+4,`${v===0?'0':v.toFixed(1).replace('-','−')} eV`,{c:'t2',a:'end'}); }
      s+=L(x0,y0,x0,y0+ph,'s')+L(x0,Y(0),x0+pw,Y(0),'h')+T(x0+pw-2,Y(0)-6,'r',{c:'vl',a:'end'})+T(x0+6,y0+4,'U',{c:'vl',a:'start'});
      let d='', first=true; for(let r=0.205;r<=1.0;r+=0.004){ const u=U(r); if(u>ytop+0.05) continue; d+=`${first?'M':'L'}${f(X(r))} ${f(Y(Math.min(u,ytop+0.05)))} `; first=false; }
      s+=`<path class="well" d="${d}"/>`;
      const rl=rOf(c.E,'in'), rr=rOf(c.E,'out'); s+=`<line class="eline" x1="${f(X(rl))}" y1="${f(Y(c.E))}" x2="${f(X(rr))}" y2="${f(Y(c.E))}"/>`+T(X(rr)+8,Y(c.E)+4,'K + U',{c:'gl',a:'start'});
      const xs=[];
      c.pts.forEach((p,i)=>{ const r=p.u===c.E?rr:rOf(p.u,p.side), x=X(r);
        const lift=xs.some(px=>Math.abs(px-x)<20)?16:0; xs.push(x);    /* stagger labels that would touch */
        s+=L(x,Y(0)-8-lift,x,Y(p.u),'d')+T(x,Y(0)-12-lift,`r${SUBI[i+1]}`,{c:'fl'});
        if(p.u!==c.E&&p.guide) s+=L(x0,Y(p.u),x,Y(p.u),'d'); });
      return svg(W,H,s,'Potential energy U versus separation r, with the total energy K + U drawn as a horizontal line and separations r1, r2, r3 marked');
    },
    /* elliptical orbit, star at one focus, numbered points, direction of motion */
    eOrbit(pts,dir){
      const W=320,H=200,cx=150,cy=100,a=118,b=72,c=Math.sqrt(a*a-b*b),sx=cx-c;
      let s=`<ellipse class="d" cx="${cx}" cy="${cy}" rx="${a}" ry="${b}"/>`+dot(sx,cy,9,'ball')+T(sx,cy+22,'star',{c:'t2'});
      pts.forEach(p=>{ const x=cx+a*Math.cos(p.t*D2R), y=cy-b*Math.sin(p.t*D2R), lx=cx+(a+16)*Math.cos(p.t*D2R), ly=cy-(b+15)*Math.sin(p.t*D2R);
        s+=dot(x,y,4.5)+T(lx,ly+1,String(p.n),{c:'in',b:'central'}); });
      const t0=dir==='ccw'?35:145, t1=dir==='ccw'?55:125, A=t=>[cx+(a+28)*Math.cos(t*D2R),cy-(b+26)*Math.sin(t*D2R)];
      const p0=A(t0),p1=A(t1); s+=arrow(p0[0],p0[1],p1[0],p1[1],'v');
      return svg(W,H,s,`Planet on an elliptical orbit, moving ${dir==='ccw'?'counterclockwise':'clockwise'}, star at one focus, numbered positions`);
    }
  });
})();

