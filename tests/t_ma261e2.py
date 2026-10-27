"""End-to-end test of the MA 261 Exam 2 page in headless Chromium.

Run:  python3 -I tests/t_ma261e2.py <dist/ma261/exam2/index.html or URL> [samples per template, default 3]
MathJax loads from cdnjs, so this test needs the network (everything else stays blocked).
Covers: boot without errors or CSP violations, welcome + "start here" ring, breadcrumb, a typed sprint answer,
a full mock exam at 60:00 with six choices A–F (F picks F, G flags), review with a worked solution per question,
EVERY exam template and sprint generator typeset by MathJax without an error (several samples each),
progress + cookie restore, diagnostic, drill (start → answer → feedback → save), study sheet, 390 px layout.
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); from _serve import page_url

PAGE, ORIGIN = page_url(sys.argv[1])
K = int(sys.argv[2]) if len(sys.argv) > 2 else 3
fails = []
def check(name, cond, info=''):
    print(('OK   ' if cond else 'FAIL ') + name + (f'  [{info}]' if info else ''))
    if not cond: fails.append(name)

def allow(r):
    u = r.request.url
    r.continue_() if u.startswith(ORIGIN) or u.startswith('https://cdnjs.cloudflare.com/') or 'fonts.g' in u else r.abort()

def new_page(ctx, errs, welcome=True):
    pg = ctx.new_page()
    if welcome: pg.add_init_script("localStorage.setItem('boilercram:welcome:ma261e2','1')")
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('CSP: ' + m.text) if 'Content Security Policy' in m.text else None)
    pg.route('**/*', allow)
    return pg

M = lambda pg, expr: pg.evaluate(f'()=>{{const A=window.MA261; return ({expr});}}')
phase = lambda pg: pg.evaluate("()=>[...document.querySelectorAll('section')].filter(s=>!s.hidden).map(s=>s.id)")
hscroll = lambda pg: pg.evaluate('()=>document.documentElement.scrollWidth-document.documentElement.clientWidth')

def take_exam(pg):
    xe = M(pg, 'A._xe()')
    for i, it in enumerate(xe['items']):
        pg.keyboard.press('ABCDEF'[it['key']]); pg.wait_for_timeout(30)
        if i < len(xe['items']) - 1: pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(30)
    after = M(pg, 'A._xe()')
    pg.click('#xsubmit'); pg.click('#xsubmit'); pg.wait_for_timeout(600)
    return xe, after

GALLERY = """async (k)=>{
  const A=window.MA261, box=document.createElement('div'); box.id='texgallery'; document.querySelector('.wrap').appendChild(box);
  const items=[], TX=s=>{ try{ return A.tex(s); }catch(e){ return '\\\\text{BAD KEY}'; } };
  const sol=o=>(o.sol||[]).map(s=>(s[0]?'<p>'+s[0]+'</p>':'')+(s[1]?'<div class="eq">\\\\['+s[1]+'\\\\]</div>':'')).join('');
  for(const g of A.XGEN){ for(let i=0;i<k;i++){ let o=null; for(let t=0;t<40&&!o;t++){ try{ o=g.fn(); }catch(e){ o=null; } } if(!o) continue;
    items.push(['x:'+g.id,'<div>'+o.stem+'</div>'+o.opts.map(x=>'<span>'+x.h+'</span>').join('')+sol(o)]); } }
  for(const g of A.GEN){ for(let i=0;i<k;i++){ let o=null; for(let t=0;t<40&&!o;t++){ try{ o=g.fn(); }catch(e){ o=null; } } if(!o) continue;
    const opts=o.kind==='choice'?o.opts.map(x=>'<span>'+x.h+'</span>').join(''):'\\\\('+TX(o.ans)+'\\\\)'+(o.dis||[]).filter(d=>d.a).map(d=>'<span>\\\\('+TX(d.a)+'\\\\)</span>').join('');
    items.push(['s:'+g.id,'<div>'+o.q+'</div>'+opts+sol(o)]); } }
  box.innerHTML=items.map(([id,h])=>'<div class="gi" data-id="'+id+'">'+h+'</div>').join('');
  await MathJax.typesetPromise([box]);
  const bad=[...box.querySelectorAll('.gi')].filter(d=>d.querySelector('mjx-merror')||/\\\\\\(|\\\\\\[|\\\\frac|\\\\int|\\\\langle/.test([...d.childNodes].map(n=>n.nodeType===3?n.textContent:(n.tagName==='MJX-CONTAINER'?'':n.textContent)).join('')))
    .map(d=>d.dataset.id+': '+((d.querySelector('mjx-merror')||{}).getAttribute?d.querySelector('mjx-merror').getAttribute('data-mjx-error'):'raw TeX left'));
  const und=[...box.querySelectorAll('.gi')].filter(d=>/undefined|NaN/.test(d.textContent)).map(d=>d.dataset.id);
  box.remove(); return {n:items.length,bad:[...new Set(bad)].slice(0,12),und:[...new Set(und)].slice(0,12)};
}"""

with sync_playwright() as p:
    b = p.chromium.launch()
    errs = []
    c = b.new_context(viewport={'width': 1280, 'height': 900})
    pg = new_page(c, errs, welcome=False); pg.goto(PAGE); pg.wait_for_timeout(1500)
    check('boot: welcome on first visit, six mode tiles', pg.evaluate("()=>document.getElementById('welcome').open") and len(pg.query_selector_all('#start .mode')) == 6)
    check('boot: breadcrumb MA 261 / Exam 2', ''.join(pg.inner_text('.crumbs').upper().split()) == 'MA261/EXAM2', pg.inner_text('.crumbs'))
    pg.click('#welcomeok'); pg.wait_for_timeout(200)
    check('welcome: closes and rings the Mock exam tile', 'hint' in pg.get_attribute('#toExam', 'class'))
    pg.reload(); pg.wait_for_timeout(1200)
    check('welcome: not shown again', not pg.evaluate("()=>document.getElementById('welcome').open"))

    # ---- every template and generator typesets (MathJax), no undefined/NaN
    pg.wait_for_function('()=>window.MathJax&&MathJax.typesetPromise', timeout=20000)
    g = pg.evaluate(GALLERY, K)
    check(f'gallery: {g["n"]} rendered questions (stem, choices, solution) typeset without MathJax errors or raw TeX', not g['bad'], g['bad'])
    check('gallery: no "undefined" or "NaN" in any question', not g['und'], g['und'])

    # ---- sprint: one typed answer, graded, then end
    pg.click('#goTop'); pg.wait_for_timeout(400)
    cur = M(pg, 'A._cur()')
    check('sprint: starts', phase(pg) == ['play'] and cur, cur and cur.get('ui'))
    if cur['ui'] == 'type': pg.fill('#ans', cur['ans']); pg.keyboard.press('Enter')
    else: pg.keyboard.press('ABCDEF'[[o.get('ok') for o in cur['opts']].index(True)])
    pg.wait_for_timeout(300)
    check('sprint: the key is graded right', M(pg, 'A._results()')[0]['ok'] is True, M(pg, 'A._results()')[0].get('given'))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
    check('sprint: run saved', phase(pg) == ['done'] and M(pg, 'A._state()')['runs'] == 1)
    pg.click('#back'); pg.wait_for_timeout(200)

    # ---- mock exam: 60 minutes, six choices
    pg.click('#toExam'); pg.wait_for_timeout(200)
    check('mock: intro says Mock Exam 2, A–F, harder-this-term note', pg.inner_text('#xititle') == 'Mock Exam 2' and pg.inner_text('#xiopts') == 'A–F'
          and 'Harder this term' in pg.inner_text('.hardnote'))
    pg.click('#xbegin'); pg.wait_for_timeout(500)
    t = pg.inner_text('#xtime')
    check('mock: 60-minute clock', phase(pg) == ['exam'] and t[:2] in ('59', '60'), t)
    pg.keyboard.press('G'); pg.wait_for_timeout(50)
    check('mock: G flags the question', M(pg, 'A._xe()')['flag'][0] is True)
    pg.keyboard.press('G')
    xe, after = take_exam(pg)
    check('mock: 12 questions, 6 choices each, one key', len(xe['items']) == 12 and all(len(i['opts']) == 6 and sum(o['ok'] for o in i['opts']) == 1 for i in xe['items']))
    check('mock: all keys entered by keyboard (F picks choice F)', after['ans'] == [i['key'] for i in xe['items']])
    check('mock: 100 / 100 with every key', phase(pg) == ['xdone'] and pg.inner_text('#xhead').startswith('100'), pg.inner_text('#xhead'))
    check('mock: review shows a worked solution per question', len(pg.query_selector_all('#xreview li.xq details.sol')) == 12)
    pg.wait_for_timeout(2500)
    bad = pg.evaluate("()=>[...document.querySelectorAll('#xreview mjx-merror, #xreview .eq.raw')].length")
    check('mock: review typesets without MathJax errors', bad == 0, bad)

    # ---- progress + cookie
    pg.click('#toProg3'); pg.wait_for_timeout(500)
    check('progress: the exam is counted', pg.query_selector('#xprog').is_visible() and '1 exam' in pg.inner_text('#xprogline'), pg.inner_text('#xprogline'))
    ck = next((k for k in c.cookies() if k['name'] == 'm261e2_save'), None)
    check('cookie: progress copy written, one cookie', ck is not None and len(ck['value']) <= 3800, ck and len(ck['value']))
    pg.evaluate("()=>localStorage.removeItem('ma261-e2:progress')"); pg.reload(); pg.wait_for_timeout(1500)
    check('cookie: exam restored after local storage was cleared', len(M(pg, 'A._store()')['exams']) == 1)

    # ---- diagnostic
    pg.click('#toDiag'); pg.wait_for_timeout(600)
    check('diagnostic: intro', phase(pg) == ['dgintro'])
    pg.click('#dgbegin'); pg.wait_for_timeout(600)
    check('diagnostic: first question with six choices', phase(pg) == ['dg'] and len(pg.query_selector_all('#dgopts .xopt')) == 6)
    pg.click('#examhome'); pg.wait_for_timeout(300)

    # ---- drill
    pg.click('#toDrill'); pg.wait_for_timeout(600)
    check('drill: topic picker', phase(pg) == ['dintro'] and len(pg.query_selector_all('#dintro .chip')) >= 15)
    pg.click('#drbegin'); pg.wait_for_timeout(1200)
    check('drill: a question with six choices', phase(pg) == ['drill'] and len(pg.query_selector_all('#drill .xopt')) == 6)
    pg.keyboard.press('A'); pg.wait_for_timeout(600)
    check('drill: feedback with a worked solution after answering', len(pg.query_selector_all('#drill details.sol')) >= 1)
    pg.wait_for_timeout(400)
    check('drill: saved after one answer', len(M(pg, 'A._store()').get('drills') or []) >= 1)
    pg.click('#examhome'); pg.wait_for_timeout(300)

    # ---- study sheet
    pg.click('#toSheet'); pg.wait_for_timeout(2500)
    check('sheet: opens and typesets', phase(pg) == ['sheet'] and len(pg.query_selector_all('#sheet mjx-container')) > 30 and not pg.query_selector('#sheet mjx-merror'))
    pg.click('#examhome'); pg.wait_for_timeout(300)

    # ---- header navigation
    pg.click('#toExam'); pg.click('#xbegin'); pg.wait_for_timeout(300); pg.keyboard.press('B')
    pg.click('#examhome'); pg.wait_for_timeout(300)
    check('home: Exam 2 crumb leaves the exam for the start screen, offers resume', phase(pg) == ['start'] and pg.is_visible('#xresume'))
    with pg.expect_navigation(): pg.click('#home')
    check('logo: goes to the class picker', pg.is_visible('.hubgrid'), pg.url)
    check('no page errors or CSP violations', not errs, errs[:3])
    c.close()

    # ---- phone layout
    for scheme in ('light', 'dark'):
        c = b.new_context(viewport={'width': 390, 'height': 844}, color_scheme=scheme); e2 = []
        q = new_page(c, e2); q.goto(PAGE); q.wait_for_timeout(1200)
        worst = {}
        for opener in (None, '#toExam', '#toProg', '#toDrill', '#toSheet'):
            if opener: q.click(opener); q.wait_for_timeout(400)
            worst[opener or 'start'] = hscroll(q)
            if opener: q.click('#examhome'); q.wait_for_timeout(200)
        check(f'layout {scheme} 390 px: no horizontal scroll', all(v == 0 for v in worst.values()), worst)
        c.close()
    b.close()
print('RESULT', 'PASS' if not fails else f'FAIL ({len(fails)}): ' + '; '.join(fails))
sys.exit(1 if fails else 0)
