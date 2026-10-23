"""Content sweep: every sprint generator, every exam slot, every drill variant.

Run:  python3 -I tests/t_content.py <dist/index.html or URL> [samples]
Checks (prints FAIL lines and a summary; exit code 1 on any failure):
  sprint  - each generator: exception rate, null rate (nulls are allowed: makeQ retries),
            finite answer, unit is a string, lv in 1..3, sol is a list of [text, latex],
            the last LaTeX of the solution shows the graded answer (tn(ans) appears),
            question text has no raw LaTeX (\\times, \\frac) leaking into HTML.
  exam    - buildExam(): 15 items, one key, key option has ok:true, NOTA never keyed,
            option labels distinct, numeric options at least 5% apart, every item classifies.
  drill   - genCat(c, variant) can produce every variant of every type.
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); from _serve import page_url

URL, ORIGIN = page_url(sys.argv[1])
N = int(sys.argv[2]) if len(sys.argv) > 2 else 300
here = pathlib.Path(__file__).resolve().parent
fails = []

JS_SPRINT = r'''(N)=>{
  const A=window.EnergySprint||window.MomentumSprint, out={};
  const latex=[];
  A.GEN.forEach(g=>{
    const r=out[g.id]={n:0,nul:0,exc:0,bad:[],mism:0,leak:0,ex:null};
    for(let i=0;i<N;i++){
      let o; try{ o=g.fn(); }catch(e){ r.exc++; r.ex=String(e); continue; }
      if(o==null){ r.nul++; continue; }
      r.n++;
      if(!Number.isFinite(o.ans)) r.bad.push('ans '+o.ans);
      if(typeof o.unit!=='string') r.bad.push('unit');
      if(!(o.lv>=1&&o.lv<=3)) r.bad.push('lv '+o.lv);
      if(!Array.isArray(o.sol)||!o.sol.length||!o.sol.every(s=>Array.isArray(s)&&s.length===2)) r.bad.push('sol shape');
      if(/\\(times|frac|text)/.test(o.q)) r.leak++;
      const tex=(o.sol||[]).map(s=>s[1]).filter(Boolean);
      tex.forEach(t=>latex.push(t));
      const last=tex.join(' ');
      if(Number.isFinite(o.ans)&&last.indexOf(A.tn(o.ans))<0&&last.indexOf(A.tn(o.ans,3))<0) r.mism++;
      if(r.bad.length>3) r.bad=r.bad.slice(0,3);
    }
  });
  return {out,latex};
}'''

JS_EXAM = r'''(N)=>{
  const A=window.EnergySprint||window.MomentumSprint, S=A._skills, probs=[], latex=[], subs={};
  for(let n=0;n<N;n++){
    let ex; try{ ex=A.buildExam(); }catch(e){ probs.push('buildExam threw '+e); continue; }
    if(ex.length!==15) probs.push('length '+ex.length);
    ex.forEach((it,i)=>{
      const keyed=it.opts.filter(o=>o.ok);
      if(keyed.length!==1) probs.push(`Q${i+1} ${keyed.length} ok options`);
      if(!it.opts[it.key]||!it.opts[it.key].ok) probs.push(`Q${i+1} key does not point at the ok option`);
      if(it.opts[it.key]&&it.opts[it.key].nota) probs.push(`Q${i+1} NOTA keyed`);
      const hs=it.opts.map(o=>o.h); if(new Set(hs).size!==hs.length) probs.push(`Q${i+1} duplicate labels`);
      const nums=it.opts.map(o=>o.v).filter(v=>typeof v==='number');
      for(let a=0;a<nums.length;a++) for(let b=a+1;b<nums.length;b++){ const m=Math.max(Math.abs(nums[a]),Math.abs(nums[b]));
        if(m>0&&Math.abs(nums[a]-nums[b])/m<0.05) probs.push(`Q${i+1} options ${nums[a]} and ${nums[b]} too close (${it.chk&&it.chk.k})`); }
      if(it.opts.length<4||it.opts.length>5) probs.push(`Q${i+1} has ${it.opts.length} options`);
      const s=S.xSub(i,it); if(!s||S.CSUBS[i].indexOf(s)<0) probs.push(`Q${i+1} unclassified ${s}`); else subs[s]=(subs[s]||0)+1;
      (it.sol||[]).forEach(x=>x[1]&&latex.push(x[1]));
    });
  }
  const missing=Object.keys(S.SUBL).filter(s=>!subs[s]);
  const gen=[]; S.CSUBS.forEach((list,c)=>list.forEach(s=>{ const g=S.genCat(c,s); const last=g.parts[g.parts.length-1]; if(last.c!==c||S.xSub(c,last.it)!==s) gen.push(c+':'+s); }));
  return {probs:[...new Set(probs)].slice(0,40),nprobs:probs.length,missing,gen,latex};
}'''

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if not r.request.url.startswith(ORIGIN) else r.continue_())
    pg.goto(URL); pg.wait_for_timeout(300)
    res = pg.evaluate(JS_SPRINT, N)
    print(f'sprint generators: {len(res["out"])}')
    for gid, r in res['out'].items():
        line = f'  {gid:14} ok {r["n"]:4}  null {r["nul"]:4}  exc {r["exc"]}  mism {r["mism"]}  leak {r["leak"]}  {r["bad"] or ""}'
        if r['exc'] or r['bad'] or r['mism'] or r['leak'] or r['n'] == 0:
            fails.append(line); print('FAIL' + line)
        elif r['nul'] > 0.5 * N:
            print('WARN' + line + '  (more than half null: wasteful retries)')
    ex = pg.evaluate(JS_EXAM, max(100, N // 2))
    print(f'exam: {ex["nprobs"]} problems; variants never generated: {ex["missing"] or "none"}; drill variants not reachable: {ex["gen"] or "none"}')
    for x in ex['probs']: fails.append('exam ' + x); print('FAIL exam', x)
    if ex['missing'] or ex['gen']: fails.append('variant coverage')
    if errs: fails.append('page errors ' + str(errs)); print('FAIL page errors', errs)
    b.close()
print('RESULT', 'PASS' if not fails else f'FAIL ({len(fails)})')
sys.exit(1 if fails else 0)
