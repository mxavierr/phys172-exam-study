"""Smoke test for any exam page built from the shared engine (src/ + a pack), and the pickers.

Run:  python3 -I tests/t_smoke.py <dist/<class>/<exam>/index.html or URL>
For the exam page: boot without errors or CSP violations, breadcrumb, a sprint answered and
saved, a full mock exam (every slot answered with its key) scored at full marks with a by-type
row per slot, a drill question answered, the progress page, the progress cookie.
For the pickers: the class picker and this class's exam picker load, and every tile opens a page.
"""
import json, sys, pathlib, urllib.request
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); from _serve import page_url

PAGE, ORIGIN = page_url(sys.argv[1])
fails = []
def check(name, cond, info=''):
    print(('OK   ' if cond else 'FAIL ') + name + (f'  [{info}]' if info else ''))
    if not cond: fails.append(name)
hook = lambda pg, expr: pg.evaluate(f'()=>{{const A=window.EnergySprint; return ({expr});}}')
visible = lambda pg: pg.evaluate("()=>[...document.querySelectorAll('.wrap > section')].filter(s=>!s.hidden).map(s=>s.id)")

with sync_playwright() as p:
    b = p.chromium.launch(); c = b.new_context(viewport={'width': 1280, 'height': 900}); errs = []
    pg = c.new_page()
    pg.add_init_script("localStorage.setItem('boilercram:welcome:phys','1')")
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('CSP: ' + m.text) if 'Content Security Policy' in m.text else None)
    pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
    pg.goto(PAGE); pg.wait_for_timeout(500)
    A = hook(pg, '({ns:A.APP.ns,n:A.XSLOTS.length,gens:A.GEN.length})')
    check('boot: start screen, engine loaded', visible(pg) == ['start'] and A['gens'] > 0, A)
    crumbs = ''.join(pg.inner_text('.crumbs').split())
    check('boot: breadcrumb names the course and exam', '/' in crumbs and 'EXAM' in crumbs.upper(), crumbs)
    pg.click('#go'); pg.wait_for_timeout(150)
    pg.fill('#ans', str(hook(pg, 'A._cur()')['ans'])); pg.keyboard.press('Enter'); pg.wait_for_timeout(100)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    check('sprint: answered right and saved', visible(pg) == ['done'] and hook(pg, 'A._state()')['runs'] == 1)
    pg.click('#back'); pg.click('#toExam'); pg.click('#xbegin'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const E=window.EnergySprint._exam(); E.items.forEach((it,i)=>{ E.ans[i]=it.key; E.spent[i]=90; });}")
    pg.click('#xsubmit'); pg.click('#xsubmit'); pg.wait_for_timeout(500)
    head = pg.inner_text('#xhead')
    check('exam: full marks with every key', visible(pg) == ['xdone'] and head.split('/')[0].strip() == head.split('/')[1].strip(), head)
    check('exam: one by-type row per slot', pg.eval_on_selector_all('#xttable tbody tr', 'n=>n.length') == A['n'])
    last = hook(pg, 'A._store().exams.slice(-1)[0]')
    check('exam: every answer filed under a variant', all(q['s'] for q in last['q']), [q['s'] for q in last['q']][:5])
    pg.click('#xhome'); pg.click('#toDrill'); pg.wait_for_timeout(300); pg.click('#dbegin'); pg.wait_for_timeout(200)
    d = hook(pg, '(()=>{const R=A._drill(),p=R.set.parts[R.pi];return {key:p.it.key};})()')
    pg.keyboard.press('ABCDE'[d['key']]); pg.wait_for_timeout(100)
    check('drill: question answered and saved', hook(pg, 'A._store().drills.length') == 1)
    pg.click('#dstop'); pg.wait_for_timeout(200); pg.click('#toProg4'); pg.wait_for_timeout(300)
    check('progress: skills, mock exams and sprints shown', all(pg.is_visible(s) for s in ('#skills', '#xprog', '#proghas')))
    check('cookie: progress copy written', any(k['value'] and k['name'].endswith('_save') for k in c.cookies()))
    check('no page errors or CSP violations', not errs, errs[:3])
    # pickers
    root = ORIGIN + '/'
    pg.goto(root); pg.wait_for_timeout(300)
    classes = pg.eval_on_selector_all('.hubtile', 'n=>n.map(a=>a.href)')
    check('class picker: one tile per class', len(classes) >= 2, classes)
    ok = True
    for href in classes:
        pg.goto(href); pg.wait_for_timeout(200)
        for ex in pg.eval_on_selector_all('.hubtile', 'n=>n.map(a=>a.href)'):
            try: ok = ok and urllib.request.urlopen(ex).status == 200
            except Exception: ok = False
    check('exam pickers: every exam tile opens a page', ok)
    b.close()
print('RESULT', 'PASS' if not fails else f'FAIL ({len(fails)}): ' + '; '.join(fails))
sys.exit(1 if fails else 0)
