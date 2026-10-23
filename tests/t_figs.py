"""Figure check: every figure family over its parameter space, in light and dark.

Run: python3 -I tests/t_figs.py <dist/index.html> [outdir]
For every figure it measures each <text> label with getBBox and fails when a label
  - sticks out of the viewBox (clipped on the page), or
  - overlaps another label by more than 3 px in both directions.
It also checks that the asked-about highlight is drawn exactly when requested, then saves
gallery screenshots (one per theme) for a by-eye check of colors and geometry.
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); from _serve import page_url
URL, ORIGIN = page_url(sys.argv[1]); out = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else None
JS = r'''()=>{
  const F=window.EnergySprint.FIG, figs=[];
  ['A','B','C','D'].forEach(fr=>['cw','ccw'].forEach(dir=>[false,true].forEach(seat=>figs.push([`circle ${fr} ${dir} ${seat?'seat':'rod'}`,F.eCircle(fr,dir,seat)]))));
  [false,true].forEach(roll=>[undefined,'2'].forEach(ask=>figs.push([`bowl roll=${roll} ask=${ask}`,F.eTrack('bowl',{roll,ask})])));
  [[60,20],[30,10],[48,12],[100,24],[90,30]].forEach(([h,R])=>['C','D',undefined].forEach(at=>figs.push([`loop h=${h} R=${R} at=${at}`,F.eTrack('loop',{h,R,at})])));
  ['','v'].forEach(find=>figs.push([`launch vertical find=${find}`,F.eLaunch({incline:false,find})]));
  [48,52,56].forEach(th=>[0,0.1,0.3].forEach(mu=>['','v'].forEach(find=>figs.push([`launch incline th=${th} mu=${mu} find=${find}`,F.eLaunch({incline:true,th,mu,find})]))));
  [1.2,1.5,1.8].forEach(D=>[-0.2,-0.5].forEach(E=>['in','out'].forEach(side=>{
    const U1=Math.max(-D+0.2,Math.min(E-0.3,-0.9)); figs.push([`well D=${D} E=${E} ${side}`,F.eWell({D,E,pts:[{u:U1,side,guide:true},{u:-D,side:'out',guide:true},{u:E,side:'out'}]})]); })));
  ['ccw','cw'].forEach(dir=>[0,60,120].forEach(t0=>figs.push([`orbit ${dir} t0=${t0}`,F.eOrbit([0,60,120,180,240,300].map((t,i)=>({n:i+1,t:(t+t0)%360})),dir)])));
  const box=document.createElement('div'); box.id='gallery';
  box.style.cssText='display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;padding:18px';
  box.innerHTML=figs.map(([n,svg])=>`<div><div class="figlabel">${n}</div><figure class="figpanel">${svg}</figure></div>`).join('');
  document.querySelector('.wrap').prepend(box);
  const probs=[]; let asked=0;
  box.querySelectorAll('svg.fig').forEach((svg,i)=>{
    const vb=svg.viewBox.baseVal, name=figs[i][0], bbs=[];
    svg.querySelectorAll('text').forEach(t=>{ const b=t.getBBox();
      if(b.x<-1||b.y<-1||b.x+b.width>vb.width+1||b.y+b.height>vb.height+1) probs.push(`${name}: "${t.textContent}" outside the viewBox`);
      bbs.push({t:t.textContent,b}); });
    for(let a=0;a<bbs.length;a++) for(let c=a+1;c<bbs.length;c++){ const A=bbs[a].b,B=bbs[c].b;
      const ox=Math.min(A.x+A.width,B.x+B.width)-Math.max(A.x,B.x), oy=Math.min(A.y+A.height,B.y+B.height)-Math.max(A.y,B.y);
      if(ox>3&&oy>3) probs.push(`${name}: labels "${bbs[a].t}" and "${bbs[c].t}" overlap`); }
    const wants=/at=C|at=D|ask=2|find=v/.test(name), has=!!svg.querySelector('.ask,.ak,.fv');
    if(wants!==has) probs.push(`${name}: asked highlight ${has?'drawn but not requested':'missing'}`); else if(has) asked++;
  });
  return {n:figs.length,asked,probs};
}'''
fails = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for scheme in ('light', 'dark'):
        pg = b.new_page(viewport={'width': 1280, 'height': 900}, color_scheme=scheme)
        pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(ORIGIN) or 'fonts.g' in r.request.url else r.abort())
        pg.goto(URL); pg.wait_for_timeout(1200)
        res = pg.evaluate(JS)
        print(f'{scheme}: {res["n"]} figures, {res["asked"]} with an asked highlight, {len(res["probs"])} problems')
        for x in res['probs'][:30]: print('  FAIL', x)
        fails += len(res['probs'])
        if out:
            out.mkdir(parents=True, exist_ok=True)
            pg.locator('#gallery').screenshot(path=str(out / f'figs_{scheme}.png'))
    b.close()
print('RESULT', 'PASS' if not fails else 'FAIL')
sys.exit(1 if fails else 0)
