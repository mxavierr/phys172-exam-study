"""Every worked-solution equation, exactly as the page shows it, through KaTeX in strict error mode.

Run: python3 -I tests/t_latex.py <dist/index.html> [samples per generator]
Builds solution HTML with the page's own solHTML() (so the \\given/\\find/\\result marking is
included), takes every equation line, and renders it with katex.renderToString(throwOnError:true).
Also counts how many solutions got a \\result (final answer colored green) and a \\find.
Then every plain-text key idea ("how") and trap explanation ("why") goes through mathText(): each
must come out with its formulas rendered by KaTeX, no raw "_" left, and no KaTeX error.
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); from _serve import page_url
URL, ORIGIN = page_url(sys.argv[1]); N = int(sys.argv[2]) if len(sys.argv) > 2 else 60
JS = r'''async (N)=>{
  for(let i=0;i<100&&!window.katex;i++) await new Promise(r=>setTimeout(r,100));
  if(!window.katex) return {err:'KaTeX did not load'};
  const A=window.EnergySprint, T=A._tex, opts={...T.TEX_OPTS,throwOnError:true};
  const box=document.createElement('div'); let lines=0, sols=0, withResult=0, withFind=0; const bad=[];
  const check=(r,extra)=>{ box.innerHTML=T.solHTML(r,true,extra); sols++;
    const eqs=[...box.querySelectorAll('.eq')].map(e=>e.textContent);
    if(eqs.some(t=>t.includes('\\result{'))) withResult++;
    if(eqs.some(t=>t.includes('\\find{'))) withFind++;
    eqs.forEach(t=>{ lines++; try{ katex.renderToString(t,opts); }catch(e){ if(bad.length<15) bad.push(String(e.message||e).slice(0,140)+' :: '+t.slice(0,140)); } }); };
  A.GEN.forEach(g=>{ for(let i=0;i<N;i++){ let o=null; try{ o=g.fn(); }catch(e){} if(o) check(o); } });
  for(let i=0;i<Math.max(20,N/2);i++) A.buildExam().forEach(it=>check(it,it.group&&it.group.setup));
  /* plain sentences with formulas: key ideas + "why it's tempting" */
  const texts=new Set();
  A.GEN.forEach(g=>{ for(let i=0;i<20;i++){ let o=null; try{ o=g.fn(); }catch(e){} if(o&&o.how) texts.add(o.how); } });
  for(let i=0;i<40;i++) A.buildExam().forEach(it=>{ if(it.how) texts.add(it.how); (it.opts||[]).forEach(o=>{ if(o.why) texts.add(o.why); }); });
  const mbad=[]; let mrend=0;
  texts.forEach(t=>{ box.innerHTML=T.mathText(t); mrend+=box.querySelectorAll('.katex').length;
    const plain=[...box.childNodes].filter(n=>!(n.classList&&n.classList.contains('tx'))).map(n=>n.textContent).join('');
    if(box.querySelector('.katex-error,.tx.raw')||/_/.test(plain)||(/_/.test(t)&&!box.querySelector('.katex')))
      if(mbad.length<15) mbad.push(t); });
  return {lines,sols,withResult,withFind,bad,mtexts:texts.size,mrend,mbad};
}'''
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
    pg.goto(URL); pg.wait_for_timeout(300)
    r = pg.evaluate(JS, N); b.close()
if 'err' in r: print('FAIL', r['err']); sys.exit(1)
print(f"latex: {r['sols']} solutions, {r['lines']} equation lines, {len(r['bad'])} failed; "
      f"final answer marked green in {r['withResult']}, unknown marked rust in {r['withFind']}")
for x in r['bad']: print('  FAIL', x)
print(f"sentences: {r['mtexts']} key ideas / trap explanations, {r['mrend']} formulas rendered, {len(r['mbad'])} not clean")
for x in r['mbad']: print('  FAIL', x)
ok = not r['bad'] and not r['mbad']
print('RESULT', 'PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
