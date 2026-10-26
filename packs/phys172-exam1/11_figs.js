
/* =====================================================================
   diagrams: small inline SVGs drawn to scale from the question's own numbers.
   They show only what the text states (angles, attachments, arrangement) and
   never a force or direction the student is meant to work out.
   ===================================================================== */
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

  return {
    _:{f,pt,svg,L,T,ceil,floor,wall,box,arrow,arc,angle,coil,dot},
    /* box on a horizontal rope to a wall and a rope to the ceiling at al from the vertical */
    twoRopes(m,al){
      const W=300,H=180,cy=16,wx=22,px=118,py=104,top=py-cy,dx=top*Math.tan(al*D2R),ex=px+dx;
      let s=ceil(px-26,Math.min(W-6,ex+26),cy)+wall(wx,48,H-10);
      s+=L(wx,py,px,py,'r')+L(px,py,ex,cy,'r')+L(px,py,px,py-64,'d');
      s+=L(px,py,px-16,py+16,'r')+L(px,py,px+16,py+16,'r')+box(px-34,py+16,68,40,`${m} kg`)+dot(px,py,3);
      s+=angle(px,py,30,90-al,90,al,'hi')+T((wx+px)/2,py-8,'rope 1');
      const rl=pt(px,py,top/Math.cos(al*D2R)*0.72,90-al);
      s+=T(rl[0]+9,rl[1],'rope 2',{a:'start'});
      return svg(W,H,s,`Box hanging from rope 1, horizontal to a wall, and rope 2, to the ceiling at ${al} degrees from the vertical`);
    },
    /* knot with a vertical wire to the load and two wires up to the ceiling, angles above the horizontal */
    threeWires(m,t1,t2){
      const W=340,H=196,cy=16,kx=170,ky=86,h=ky-cy;
      const lx=kx-h/Math.tan(t1*D2R),rx=kx+h/Math.tan(t2*D2R);
      let s=ceil(Math.max(6,lx-18),Math.min(W-6,rx+18),cy);
      s+=L(kx-64,ky,kx+64,ky,'d')+L(kx,ky,lx,cy,'r')+L(kx,ky,rx,cy,'r')+L(kx,ky,kx,ky+56,'r');
      s+=box(kx-38,ky+56,76,40,`${m} kg`)+dot(kx,ky,3.5);
      s+=angle(kx,ky,30,180-t1,180,t1)+angle(kx,ky,30,0,t2,t2);
      const lm=pt(kx,ky,h/Math.sin(t1*D2R)*0.62,180-t1),rm=pt(kx,ky,h/Math.sin(t2*D2R)*0.62,t2);
      s+=T(lm[0]-9,lm[1],'left',{a:'end'})+T(rm[0]+9,rm[1],'right',{a:'start'})+T(kx+9,ky+30,'vertical',{a:'start'});
      return svg(W,H,s,`Load hanging from a knot; left wire ${t1} degrees and right wire ${t2} degrees above the horizontal`);
    },
    /* block or cart on a level floor, pulled by a rope at th above the horizontal */
    pull(o){
      const W=300,H=156,fy=144,bw=86,bh=48,bx=48,wh=o.wheels?12:0,by=fy-bh-wh;
      const ax=bx+bw,ay=by+bh/2,e=pt(ax,ay,112,o.th);
      let s=floor(14,W-14,fy)+box(bx,by,bw,bh,`${o.m} kg`);
      if(o.wheels) s+=dot(bx+20,fy-7,7,'w')+dot(bx+bw-20,fy-7,7,'w');
      s+=L(ax,ay,ax+76,ay,'d')+arrow(ax,ay,e[0],e[1])+angle(ax,ay,34,0,o.th,o.th);
      s+=T(e[0],e[1]-10,`${o.lab} = ${o.F} N`,{c:'fl'});
      return svg(W,H,s,`${o.wheels?'Cart':'Block'} on a level floor pulled at ${o.th} degrees above the horizontal`);
    },
    /* crate on a level floor, pushed at th below the horizontal (or straight along it) */
    push(o){
      const W=300,H=150,fy=138,bw=90,bh=52,bx=150,by=fy-bh,tx=bx-2,ty=by+(o.th?14:bh/2),len=104;
      const tl=[tx-len*Math.cos(o.th*D2R),ty-len*Math.sin(o.th*D2R)];
      let s=floor(14,W-14,fy)+box(bx,by,bw,bh,`${o.m} kg`)+arrow(tl[0],tl[1],tx,ty);
      if(o.th) s+=L(tx-80,ty,tx,ty,'d')+angle(tx,ty,34,180-o.th,180,o.th,'hi');
      s+=T(tl[0],tl[1]-10,`F = ${o.F} N`,{c:'fl'});
      return svg(W,H,s,o.th?`Crate pushed at ${o.th} degrees below the horizontal`:'Crate pushed horizontally');
    },
    /* conical pendulum: string at th from the vertical, ball on a horizontal circle */
    conical(Ls,th){
      const W=270,H=190,px=118,py=18,len=124,b=pt(px,py,len,270+th),rx=b[0]-px;
      let s=ceil(px-34,px+34,py)+L(px,py,px,b[1]+Math.max(8,rx*0.28)+10,'d');
      s+=`<ellipse class="d" cx="${f(px)}" cy="${f(b[1])}" rx="${f(rx)}" ry="${f(Math.max(6,rx*0.28))}"/>`;
      s+=L(px,py,b[0],b[1],'r')+dot(b[0],b[1],7,'ball')+angle(px,py,32,270,270+th,th);
      const m=pt(px,py,len*0.55,270+th);
      s+=T(m[0]+10,m[1],`L = ${Ls} m`,{a:'start'});
      return svg(W,H,s,`Conical pendulum, string ${Ls} m long at ${th} degrees from the vertical`);
    },
    /* one block on another; the push goes into the lower block */
    stacked(mt,mb,F,mu1,mu2){
      const W=320,H=150,fy=136,bx=104,bw=132,bh=46,by=fy-bh,uw=76,uh=36,ux=bx+18,uy=by-uh;
      let s=floor(14,W-14,fy)+box(bx,by,bw,bh,`${mb} kg`)+box(ux,uy,uw,uh,`${mt} kg`);
      s+=arrow(bx-86,by+bh/2,bx-2,by+bh/2)+T(bx-86,by+bh/2-10,`F = ${F} N`,{c:'fl',a:'start'});
      s+=T(ux+uw+8,by-5,`μk = ${mu1}`,{c:'t2',a:'start'})+T(bx+bw+8,fy-6,`μk = ${mu2}`,{c:'t2',a:'start'});
      s+=arrow(W-54,20,W-18,20,'v')+T(W-60,21,'+x',{c:'t2',a:'end',b:'central'});
      return svg(W,H,s,`A ${mt} kg block on top of a ${mb} kg block; the push acts on the lower block`);
    },
    /* two blocks in contact; the push goes into block 1 */
    pushTwo(m1,m2,F){
      const W=320,H=140,fy=128,h1=48,h2=40,w1=84,w2=70,x1=112,x2=x1+w1;
      let s=floor(14,W-14,fy)+box(x1,fy-h1,w1,h1,`${m1} kg`)+box(x2,fy-h2,w2,h2,`${m2} kg`);
      s+=T(x1+w1/2,fy-h1-8,'block 1',{c:'t2'})+T(x2+w2/2,fy-h2-8,'block 2',{c:'t2'});
      s+=arrow(x1-90,fy-h1/2,x1-2,fy-h1/2)+T(x1-90,fy-h1/2-10,`F = ${F} N`,{c:'fl',a:'start'});
      return svg(W,H,s,'You push block 1, which pushes block 2 ahead of it');
    },
    /* pulled block tows a second block on a string */
    tow(m1,m2,F){
      const W=320,H=130,fy=118,h=42,w=66,x2=22,x1=146;
      let s=floor(10,W-10,fy)+box(x2,fy-h,w,h,`${m2} kg`)+box(x1,fy-h,w,h,`${m1} kg`);
      s+=L(x2+w,fy-h/2,x1,fy-h/2,'r')+T((x2+w+x1)/2,fy-h/2-8,'string',{c:'t2'});
      s+=arrow(x1+w+2,fy-h/2,x1+w+84,fy-h/2)+T(x1+w+84,fy-h/2-12,`F = ${F} N`,{c:'fl',a:'end'});
      return svg(W,H,s,'You pull one block, which tows a second block on a string');
    },
    /* two blocks hanging in series from an elevator ceiling; only the stated motion is drawn */
    elevator(m1,m2,up){
      const W=260,H=236,cx=14,cw=150,cy=12,ch=212,mx=cx+cw/2,ax=214;
      let s=`<rect class="car" x="${cx}" y="${cy}" width="${cw}" height="${ch}"/>`;
      s+=L(mx,cy,mx,62,'r')+box(mx-30,62,60,36,`${m1} kg`)+L(mx,98,mx,142,'r')+box(mx-34,142,68,40,`${m2} kg`);
      s+=T(mx+8,40,'upper rope',{c:'t2',a:'start'})+T(mx+8,122,'lower rope',{c:'t2',a:'start'});
      s+=up?arrow(ax,168,ax,84,'v'):arrow(ax,84,ax,168,'v');
      s+=T(ax,68,up?'moving up':'moving down',{c:'t2'});
      return svg(W,H,s,`Elevator moving ${up?'up':'down'}; one block hangs from the ceiling and a second hangs from the first`);
    },
    /* parallel chains of springs in series between the ceiling and a bottom rod */
    hanger(N,n,m,d){
      const W=350,H=236,cy=16,ry=140,x0=64,x1=236,mx=(x0+x1)/2;
      let s=ceil(x0-22,x1+22,cy);
      for(let i=0;i<N;i++){
        const x=N===1?mx:x0+(x1-x0)*i/(N-1),seg=(ry-cy)/n;
        for(let j=0;j<n;j++) s+=coil(x,cy+seg*j,cy+seg*(j+1),4.5,3);
        for(let j=1;j<n;j++) s+=dot(x,cy+seg*j,2);
      }
      s+=`<rect class="b" x="${x0-14}" y="${ry}" width="${x1-x0+28}" height="7" rx="1.5"/>`;
      s+=L(mx,ry+7,mx,ry+24,'r')+box(mx-30,ry+24,60,32,`${m} kg`);
      s+=arrow(mx,H-4,mx,ry+60)+T(mx+10,H-10,'your hand',{c:'fl',a:'start'});
      const dx=x1+46;
      s+=L(dx,cy,dx,ry,'dim')+L(dx-5,cy,dx+5,cy,'dim')+L(dx-5,ry,dx+5,ry,'dim')+T(dx+8,(cy+ry)/2,`${d} m`,{a:'start',b:'central'});
      return svg(W,H,s,`${N} parallel chains of ${n} springs each between the ceiling and a rod, holding a ${m} kg mass, with your hand under it`);
    }
  };
})();


/* ---- mock-exam figures (same drawing kit as the practice diagrams) ---- */
(()=>{
  const {f,pt,svg,L,T,ceil,floor,wall,box,arrow,arc,angle,dot}=FIG._;
  const hcoil=(x1,x2,y,w,coils)=>{ const lead=4,n=coils*2,h=(x2-x1-2*lead)/n; let d=`M${f(x1)} ${f(y)} L${f(x1+lead)} ${f(y)}`;
    for(let i=0;i<n;i++) d+=` L${f(x1+lead+h*(i+0.5))} ${f(y+(i%2?-w:w))}`; return `<path class="sp" d="${d} L${f(x2-lead)} ${f(y)} L${f(x2)} ${f(y)}"/>`; };
  const dcoil=(p,q,w,coils)=>{ const dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,nx=-uy,ny=ux,lead=5,n=coils*2,h=(len-2*lead)/n;
    const P=(s,o)=>`${f(p[0]+ux*s+nx*o)} ${f(p[1]+uy*s+ny*o)}`; let d=`M${P(0,0)} L${P(lead,0)}`;
    for(let i=0;i<n;i++) d+=` L${P(lead+h*(i+0.5),i%2?-w:w)}`; return `<path class="sp" d="${d} L${P(len-lead,0)} L${P(len,0)}"/>`; };
  const rose=(cx,cy)=>{ let s=''; [['A',45],['B',-45],['C',-135],['D',135]].forEach(a=>{ const e=pt(cx,cy,30,a[1]),l=pt(cx,cy,43,a[1]);
      s+=arrow(cx,cy,e[0],e[1],'v')+T(l[0],l[1]+1,a[0],{c:'ta',b:'central'}); }); return s+dot(cx,cy,2.5); };

  Object.assign(FIG,{
    /* path with labelled points; clockwise quarter arcs for the circle */
    xPath(P,order,isArc,R,decoy){
      const names=Object.keys(P), xs=names.map(k=>P[k][0]).concat([0]), ys=names.map(k=>P[k][1]).concat([0]);
      const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
      const W=320,pad=34,sc=Math.min((W-2*pad)/Math.max(1,x1-x0),170/Math.max(1,y1-y0)),H=Math.round((y1-y0)*sc+2*pad);
      const X_=x=>pad+(x-x0)*sc, Y_=y=>H-pad-(y-y0)*sc;
      let s=L(X_(x0)-14,Y_(0),X_(x1)+14,Y_(0),'d')+L(X_(0),Y_(y0)-0+12,X_(0),Y_(y1)-14,'d');
      s+=T(X_(x1)+20,Y_(0)+4,'x',{c:'t2'})+T(X_(0)+8,Y_(y1)-16,'y',{c:'t2',a:'start'});
      if(isArc){
        s+=`<circle class="d" cx="${f(X_(0))}" cy="${f(Y_(0))}" r="${f(R*sc)}"/>`;
        const ang={A:180,B:90,C:0,D:270};
        order.slice(1).forEach((b,i)=>{ const a=order[i],pa=[X_(P[a][0]),Y_(P[a][1])],pb=[X_(P[b][0]),Y_(P[b][1])];
          s+=`<path class="r" fill="none" d="M${f(pa[0])} ${f(pa[1])} A${f(R*sc)} ${f(R*sc)} 0 0 1 ${f(pb[0])} ${f(pb[1])}"/>`;
          const am=(ang[a]-45)*D2R, m=[X_(R*Math.cos(am)),Y_(R*Math.sin(am))], tx=Math.sin(am),ty=Math.cos(am);
          s+=arrow(m[0]-tx*7,m[1]-ty*7,m[0]+tx*7,m[1]+ty*7,'r'); });
        s+=dot(X_(0),Y_(0),2.5)+L(X_(0),Y_(0),X_(R*Math.cos(-0.5)),Y_(R*Math.sin(-0.5)),'dim')+
           T(X_(R*0.55*Math.cos(-0.5))+4,Y_(R*0.55*Math.sin(-0.5))-6,`R = ${R} m`,{c:'t2',a:'start'});
      }else{
        order.slice(1).forEach((b,i)=>{ const a=order[i],pa=[X_(P[a][0]),Y_(P[a][1])],pb=[X_(P[b][0]),Y_(P[b][1])];
          s+=L(pa[0],pa[1],pb[0],pb[1],'r'); const mx=(pa[0]+pb[0])/2,my=(pa[1]+pb[1])/2,dx=pb[0]-pa[0],dy=pb[1]-pa[1],l=Math.hypot(dx,dy);
          s+=arrow(mx-dx/l*7,my-dy/l*7,mx+dx/l*7,my+dy/l*7,'r'); });
        if(decoy){ const a=P[order[order.length-1]],b=P.A; s+=L(X_(a[0]),Y_(a[1]),X_(b[0]),Y_(b[1]),'d'); }
      }
      const cx=names.reduce((t,k)=>t+P[k][0],0)/names.length, cy=names.reduce((t,k)=>t+P[k][1],0)/names.length;
      names.forEach(k=>{ const x=X_(P[k][0]),y=Y_(P[k][1]); let dx=P[k][0]-cx,dy=P[k][1]-cy; const l=Math.hypot(dx,dy)||1;
        s+=dot(x,y,3.5)+T(x+dx/l*15,y-dy/l*15+1,k,{c:'in',b:'central'}); });
      return svg(W,H,s,'Path from A through the labelled points');
    },
    /* puck, top view, with the arrow key */
    xPuck(di,df){
      const W=340,H=190,c=[112,98],len=72;
      const p1=[c[0]-di[0]*len,c[1]+di[1]*len],p3=[c[0]+df[0]*len,c[1]-df[1]*len];
      let s=L(p1[0],p1[1],c[0],c[1],'d')+L(c[0],c[1],p3[0],p3[1],'d');
      s+=arrow(p1[0],p1[1],p1[0]+(c[0]-p1[0])*0.62,p1[1]+(c[1]-p1[1])*0.62,'f')+arrow(c[0],c[1],c[0]+(p3[0]-c[0])*0.62,c[1]+(p3[1]-c[1])*0.62,'f');
      const lab=(p,q,t)=>{ const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,vx=q[0]-p[0],vy=q[1]-p[1],l=Math.hypot(vx,vy);
        return T(mx-vy/l*14,my+vx/l*14+4,t,{c:'fl'}); };
      s+=lab(p1,c,'p<tspan baseline-shift="sub" font-size="9">i</tspan>')+lab(c,p3,'p<tspan baseline-shift="sub" font-size="9">f</tspan>');
      [[p1,'1'],[c,'2'],[p3,'3']].forEach(q=>{ s+=dot(q[0][0],q[0][1],4.5)+T(q[0][0]+10,q[0][1]-9,q[1],{a:'start'}); });
      s+=rose(W-66,H/2)+T(W-66,H-10,'arrow key',{c:'t2'});
      return svg(W,H,s,'Puck positions 1, 2 and 3 with the initial and final momentum directions, and the arrow key');
    },
    /* satellite on a counterclockwise orbit, with the arrow key */
    xOrbit(){
      const W=340,H=200,cx=112,cy=100,R=70;
      let s=`<circle class="d" cx="${cx}" cy="${cy}" r="${R}"/>`+dot(cx,cy,12,'ball');
      [45,135,225,315].forEach(a=>{ const m=pt(cx,cy,R,a),tx=-Math.sin(a*D2R),ty=-Math.cos(a*D2R); s+=arrow(m[0]-tx*6,m[1]-ty*6,m[0]+tx*6,m[1]+ty*6,'v'); });
      [[1,180],[2,270],[3,0],[4,90]].forEach(p=>{ const q=pt(cx,cy,R,p[1]),l=pt(cx,cy,R+15,p[1]); s+=dot(q[0],q[1],5)+T(l[0],l[1]+1,String(p[0]),{c:'in',b:'central'}); });
      s+=rose(W-66,H/2)+T(W-66,H-10,'arrow key',{c:'t2'});
      return svg(W,H,s,'Counterclockwise circular orbit with positions 1 (left), 2 (bottom), 3 (right), 4 (top), and the arrow key');
    },
    /* knot with two upper strings and a hanging mass */
    xKnot(t1,t2,fromV,sym,lab){
      const W=340,H=196,cy=16,kx=170,ky=96,h=ky-cy;
      const a1=sym?(fromV?35:55):t1, a2=sym?(fromV?35:55):t2;          /* drawing angles */
      const v1=sym&&!fromV?90-a1:a1, v2=sym&&!fromV?90-a2:a2;            /* from vertical */
      const lx=kx-h*Math.tan(v1*D2R),rx=kx+h*Math.tan(v2*D2R);
      let s=ceil(Math.max(6,lx-18),Math.min(W-6,rx+18),cy)+L(kx,ky,lx,cy,'r')+L(kx,ky,rx,cy,'r')+L(kx,ky,kx,ky+48,'r');
      s+=(lab&&lab.length>1?box(kx-30,ky+48,60,32,lab):`<circle class="b" cx="${kx}" cy="${ky+64}" r="16"/>`+T(kx,ky+65,lab||'M',{c:'in',b:'central'}))+dot(kx,ky,3.5);
      if(fromV){ s+=L(kx,ky,kx,ky-62,'d');
        s+=sym?arc(kx,ky,30,90,90+v1)+arc(kx,ky,30,90-v2,90)+T(kx-18,ky-44,'θ',{c:'ta'})+T(kx+18,ky-44,'θ',{c:'ta'})
              :angle(kx,ky,30,90,90+v1,t1)+angle(kx,ky,30,90-v2,90,t2);
      }else{ s+=L(kx-64,ky,kx+64,ky,'d')+arc(kx,ky,30,180-a1,180)+arc(kx,ky,30,0,a2);
        const q1=pt(kx,ky,44,180-a1/2),q2=pt(kx,ky,44,a2/2); s+=T(q1[0],q1[1]+1,'θ',{c:'ta',b:'central'})+T(q2[0],q2[1]+1,'θ',{c:'ta',b:'central'}); }
      if(!sym){ const m1=pt(kx,ky,h/Math.cos(v1*D2R)*0.65,90+v1),m2=pt(kx,ky,h/Math.cos(v2*D2R)*0.65,90-v2);
        s+=T(m1[0]-9,m1[1],'left',{a:'end'})+T(m2[0]+9,m2[1],'right',{a:'start'}); }
      return svg(W,H,s,sym?`Knot with two symmetric strings at θ ${fromV?'from the vertical':'above the horizontal'}`:`Knot with strings at ${t1} and ${t2} degrees from the vertical`);
    },
    /* wire above the horizontal + horizontal compressed spring from the side wall */
    xWire(th){
      const W=320,H=190,wx=16,cy=18,bx=214,by=112,bw=52,bh=40,ax=bx+bw/2,ay=by;
      const run=(ay-cy)/Math.tan(th*D2R), ex=ax-run;
      let s=wall(wx,40,H-12)+ceil(Math.max(wx+4,ex-24),Math.min(W-6,ax+30),cy);
      s+=hcoil(wx,bx,by+bh/2,6,7)+box(bx,by,bw,bh,'')+L(ax,ay,ex,cy,'r')+L(ax,ay,ax-70,ay,'d')+angle(ax,ay,32,180-th,180,th,'hi');
      const wm=[(ax+ex)/2,(ay+cy)/2];
      s+=T((wx+bx)/2,by+bh/2+22,'compressed spring',{c:'t2'})+T(wm[0]+8,wm[1]-6,'wire',{a:'start',c:'t2'});
      return svg(W,H,s,`Block held by a wire at ${th} degrees above the horizontal and a horizontal compressed spring from the wall`);
    },
    /* string to the ceiling + horizontal pull */
    xPull(fromV){
      const W=300,H=190,cy=18,top=[110,cy],a=30,len=120,b=pt(top[0],top[1],len,270+a);
      let s=ceil(60,170,cy)+L(top[0],top[1],b[0],b[1],'r')+box(b[0]-18,b[1],36,30,'m');
      s+=arrow(b[0]+18,b[1]+15,b[0]+98,b[1]+15)+T(b[0]+100,b[1]+10,'F₂',{c:'fl',a:'start'});
      const m=pt(top[0],top[1],len*0.5,270+a); s+=T(m[0]+10,m[1],'F₁',{a:'start'});
      if(fromV){ s+=L(b[0],b[1],b[0],b[1]-70,'d')+arc(b[0],b[1],28,90,90+a)+T(b[0]-10,b[1]-40,'θ',{c:'ta',a:'end'}); }
      else{ s+=L(b[0],b[1],b[0]-70,b[1],'d')+arc(b[0],b[1],28,90+a,180)+T(b[0]-40,b[1]-12,'θ',{c:'ta'}); }
      return svg(W,H,s,`Block on a string at θ ${fromV?'from the vertical':'above the horizontal'}, pulled horizontally`);
    },
    /* boxes in a row on ice, pushed from one end */
    xBoxes(ms,fromLeft,flab){
      const W=340,H=130,fy=112,mx=Math.max(...ms), ws=ms.map(m=>36+44*m/mx), hs=ms.map(m=>34+20*m/mx), tot=ws.reduce((a,b)=>a+b,0);
      let x=(W-tot)/2+(fromLeft?30:-30), s=floor(10,W-10,fy);
      ms.forEach((m,i)=>{ s+=box(x,fy-hs[i],ws[i],hs[i],`${m} kg`)+T(x+ws[i]/2,fy-hs[i]-8,`${ms.length===2?'box':'m'}${ms.length===2?' '+(i+1):['₁','₂','₃'][i]}`,{c:'t2'}); x+=ws[i]; });
      const x0=(W-tot)/2+(fromLeft?30:-30), yh=fy-hs[fromLeft?0:ms.length-1]/2;
      s+=fromLeft?arrow(x0-74,yh,x0-2,yh)+T(x0-74,yh-10,flab,{c:'fl',a:'start'}):arrow(x+74,yh,x+2,yh)+T(x+74,yh-10,flab,{c:'fl',a:'end'});
      s+=T(W-12,fy+15,'frictionless',{c:'t2',a:'end'});
      return svg(W,H,s,`${ms.length} boxes in a row, pushed from the ${fromLeft?'left':'right'}`);
    },
    /* charges on a line with measured gaps and an optional system oval */
    xCharges(chg,sys){
      const xs=chg.map(c=>c.x), x0=Math.min(...xs), x1=Math.max(...xs), W=340, pad=40, sc=(W-2*pad)/(x1-x0), cy=62, H=124;
      const X_=x=>pad+(x-x0)*sc;
      let s=L(12,cy,W-12,cy,'d');
      if(sys&&sys.length>1){ const a=X_(Math.min(...sys.map(i=>chg[i].x))),b=X_(Math.max(...sys.map(i=>chg[i].x)));
        s+=`<ellipse class="oval" cx="${f((a+b)/2)}" cy="${cy}" rx="${f((b-a)/2+30)}" ry="30"/>`; }
      const sorted=chg.slice().sort((a,b)=>a.x-b.x);
      sorted.forEach((c,i)=>{ if(i){ const a=X_(sorted[i-1].x)+16,b=X_(c.x)-16,y=cy+44;
          s+=L(a,y,b,y,'dim')+L(a,y-4,a,y+4,'dim')+L(b,y-4,b,y+4,'dim')+T((a+b)/2,y-6,`${rd(c.x-sorted[i-1].x,2)} m`,{c:'t2'}); } });
      chg.forEach(c=>{ s+=`<circle class="${c.q>0?'qp':'qn'}" cx="${f(X_(c.x))}" cy="${cy}" r="15"/>`+T(X_(c.x),cy+1,c.l,{c:'in',b:'central'}); });
      return svg(W,H,s,'Charges on a horizontal line with the distances between them');
    },
    /* ramp with a spring at the top or bottom wall, block, axes and velocity */
    xRamp(d){
      const W=340,H=206,th=d.th,bx=24,by=188,len=Math.min(292,150/Math.sin(th*D2R),226/Math.cos(th*D2R)),u=[Math.cos(th*D2R),-Math.sin(th*D2R)],nrm=[-Math.sin(th*D2R),-Math.cos(th*D2R)];
      const P=(sAlong,off)=>[bx+u[0]*sAlong+nrm[0]*(off||0),by+u[1]*sAlong+nrm[1]*(off||0)], top=P(len);
      let s=`<path class="ramp" d="M${bx} ${by} L${f(top[0])} ${f(top[1])} L${f(top[0])} ${by} Z"/>`+angle(bx,by,40,0,th,th);
      const wallAt=sAlong=>{ const a=P(sAlong,0),b=P(sAlong,40); return `<line class="s" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" style="stroke-width:3"/>`; };
      const bw=40,bh=26,sLen=len*0.34, wallS=d.top?len-6:6, blockC=d.top?wallS-sLen-bw/2:wallS+sLen+bw/2;
      s+=wallAt(wallS);
      const sp1=P(wallS,bh/2),sp2=P(d.top?blockC+bw/2:blockC-bw/2,bh/2); s+=dcoil(sp1,sp2,5,6);
      const c=P(blockC,bh/2);
      s+=`<g transform="translate(${f(c[0])} ${f(c[1])}) rotate(${-th})"><rect class="b" x="${-bw/2}" y="${-bh/2}" width="${bw}" height="${bh}" rx="2"/></g>`;
      const o=P(wallS,0); s+=dot(o[0],o[1],3.5)+T(o[0]+(d.top?-6:10),o[1]+(d.top?-8:16),'x = 0',{c:'t2',a:d.top?'end':'start'});
      const vs=d.vi>0?1:-1, v1=P(blockC-vs*16,bh+14), v2=P(blockC+vs*16,bh+14);
      s+=arrow(v1[0],v1[1],v2[0],v2[1],'v')+T((v1[0]+v2[0])/2+nrm[0]*14,(v1[1]+v2[1])/2+nrm[1]*14+4,'v',{c:'ta'});
      const ax=[W-54,84]; s+=arrow(ax[0],ax[1],ax[0]+u[0]*34,ax[1]+u[1]*34,'r')+arrow(ax[0],ax[1],ax[0]+nrm[0]*28,ax[1]+nrm[1]*28,'r');
      s+=T(ax[0]+u[0]*42,ax[1]+u[1]*42+4,'+x',{c:'t2'})+T(ax[0]+nrm[0]*36,ax[1]+nrm[1]*36+4,'+y',{c:'t2'});
      const lb=P(len*0.5,-14); s+=T(lb[0]+10,lb[1]+10,d.fric?`μk = ${d.mu}`:'slippery',{c:'t2',a:'start'});
      return svg(W,H,s,`Block on a ${th} degree ramp, spring attached to the wall at the ${d.top?'top':'bottom'}, +x up the incline`);
    }
  });
})();
