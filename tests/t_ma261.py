"""End-to-end test of the MA 261 Exam 1 page in headless Chromium.

Run:  python3 -I tests/t_ma261.py <dist/ma261/exam1/index.html or URL>
MathJax loads from cdnjs, so this test needs the network (everything else stays blocked).
Covers: boot without errors or CSP violations, welcome + "start here" ring, breadcrumb,
a typed sprint answer, a full mock exam at 60:00 (A–E), the Fall 2026 exam (A–F, the F key
picks choice F), both saved and labelled in progress, the cookie copy restores history after
site storage is cleared, diagnostic and quadric screens, logo → class picker, 390 px layout.
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); from _serve import page_url

PAGE, ORIGIN = page_url(sys.argv[1])
fails = []
def check(name, cond, info=''):
    print(('OK   ' if cond else 'FAIL ') + name + (f'  [{info}]' if info else ''))
    if not cond: fails.append(name)

def allow(r):
    u = r.request.url
    r.continue_() if u.startswith(ORIGIN) or u.startswith('https://cdnjs.cloudflare.com/') or 'fonts.g' in u else r.abort()

def new_page(ctx, errs, welcome=True):
    pg = ctx.new_page()
    if welcome: pg.add_init_script("localStorage.setItem('boilercram:welcome:ma261','1')")
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('CSP: ' + m.text) if 'Content Security Policy' in m.text else None)
    pg.route('**/*', allow)
    return pg

M = lambda pg, expr: pg.evaluate(f'()=>{{const A=window.MA261; return ({expr});}}')
phase = lambda pg: pg.evaluate("()=>[...document.querySelectorAll('section')].filter(s=>!s.hidden).map(s=>s.id)")
hscroll = lambda pg: pg.evaluate('()=>document.documentElement.scrollWidth-document.documentElement.clientWidth')

def take_exam(pg, keys_from_page=True):
    """answer every question with its key using the letter keys, then submit (two taps)"""
    xe = M(pg, 'A._xe()')
    for i, it in enumerate(xe['items']):
        pg.keyboard.press('ABCDEF'[it['key']]); pg.wait_for_timeout(30)
        if i < len(xe['items']) - 1: pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(30)
    after = M(pg, 'A._xe()')
    pg.click('#xsubmit'); pg.click('#xsubmit'); pg.wait_for_timeout(600)
    return xe, after

with sync_playwright() as p:
    b = p.chromium.launch()
    errs = []
    c = b.new_context(viewport={'width': 1280, 'height': 900})
    pg = new_page(c, errs, welcome=False); pg.goto(PAGE); pg.wait_for_timeout(1500)
    check('boot: welcome on first visit, six mode tiles', pg.evaluate("()=>document.getElementById('welcome').open") and len(pg.query_selector_all('#start .mode')) == 6)
    check('boot: breadcrumb MA 261 / Exam 1', ''.join(pg.inner_text('.crumbs').upper().split()) == 'MA261/EXAM1', pg.inner_text('.crumbs'))
    pg.click('#welcomeok'); pg.wait_for_timeout(200)
    check('welcome: closes and rings the Mock exam tile', 'hint' in pg.get_attribute('#toExam', 'class'))
    pg.reload(); pg.wait_for_timeout(1200)
    check('welcome: not shown again', not pg.evaluate("()=>document.getElementById('welcome').open"))

    # ---- sprint: one typed answer, graded, then end
    pg.click('#goTop'); pg.wait_for_timeout(400)
    cur = M(pg, 'A._cur()')
    check('sprint: starts (typed mode; true/false and quadric items are always choice)', phase(pg) == ['play'] and cur and pg.evaluate("()=>document.querySelector('#modechips .chip.on').dataset.mode") == 'type', cur and cur.get('ui'))
    if cur['ui'] == 'type': pg.fill('#ans', cur['ans']); pg.keyboard.press('Enter')
    else: pg.keyboard.press('ABCDEF'[[o.get('ok') for o in cur['opts']].index(True)])
    pg.wait_for_timeout(300)
    check('sprint: the key is graded right', M(pg, 'A._results()')[0]['ok'] is True, M(pg, 'A._results()')[0].get('given'))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
    check('sprint: run saved', phase(pg) == ['done'] and M(pg, 'A._state()')['runs'] == 1)
    pg.click('#back'); pg.wait_for_timeout(200)

    # ---- mock exam at 1x time
    pg.click('#toExam'); pg.wait_for_timeout(200)
    check('mock: intro says Mock Exam 1, A–E, harder-this-term note', pg.inner_text('#xititle') == 'Mock Exam 1' and pg.inner_text('#xiopts') == 'A–E'
          and 'Harder this term' in pg.inner_text('.hardnote'))
    check('mock: ring gone once opened', 'hint' not in (pg.get_attribute('#toExam', 'class') or ''))
    pg.click('#xbegin'); pg.wait_for_timeout(500)
    t = pg.inner_text('#xtime')
    check('mock: 60-minute clock', phase(pg) == ['exam'] and t[:2] in ('59', '60'), t)
    xe, after = take_exam(pg)
    check('mock: 12 questions, 5 choices each', len(xe['items']) == 12 and all(len(i['opts']) == 5 for i in xe['items']))
    check('mock: all keys entered by keyboard', after['ans'] == [i['key'] for i in xe['items']])
    check('mock: 100 / 100 with every key', phase(pg) == ['xdone'] and pg.inner_text('#xhead').startswith('100'), pg.inner_text('#xhead'))

    # ---- the Fall 2026 exam
    pg.click('#xhome'); pg.wait_for_timeout(200); pg.click('#toReal'); pg.wait_for_timeout(200)
    check('real: intro says Fall 2026 Exam 1, A–F', pg.inner_text('#xititle') == 'Fall 2026 Exam 1' and pg.inner_text('#xiopts') == 'A–F')
    pg.click('#xbegin'); pg.wait_for_timeout(500)
    try: pg.wait_for_selector('#xstem mjx-container', timeout=15000); typeset = True
    except Exception: typeset = False
    check('real: question math typeset by MathJax', typeset)
    check('real: keys hint names A–F', 'A–F' in pg.inner_text('#xkeys'))
    xe, after = take_exam(pg)
    keys = [1, 4, 3, 5, 5, 1, 0, 3, 3, 0, 5, 5]
    check('real: the 12 printed questions with six choices and the graded key', [i['key'] for i in xe['items']] == keys and all(len(i['opts']) == 6 for i in xe['items']))
    check('real: F picks choice F, never flags', after['ans'] == keys and not any(after['flag']), (after['ans'], after['flag']))
    check('real: scored 100 and named in the verdict', pg.inner_text('#xhead').startswith('100') and 'Fall 2026 Exam 1' in pg.inner_text('#xverdict'))
    pg.click('#xreview li.xq summary') if pg.query_selector('#xreview li.xq summary') else None
    check('real: review shows a worked solution per question', len(pg.query_selector_all('#xreview li.xq details.sol')) == 12)
    pg.wait_for_timeout(2500)
    bad = pg.evaluate("()=>[...document.querySelectorAll('#xreview mjx-merror, #xreview .eq.raw')].map(e=>e.closest('li')&&e.closest('li').querySelector('.meta')&&e.closest('li').querySelector('.meta').textContent)")
    check('real: every stem, choice and solution step typesets without a MathJax error', not bad, bad[:3])

    # ---- progress
    pg.click('#toProg3'); pg.wait_for_timeout(500)
    check('progress: both exams counted, the real one labelled', 'Fall 2026 Exam 1' in pg.inner_text('#xprogline') and pg.query_selector('#xprog').is_visible(), pg.inner_text('#xprogline'))
    check('progress: storage note mentions the browser, not an account', 'this browser' in pg.inner_text('#storenote'))
    st = M(pg, 'A._store()')
    check('progress: exam records saved (real flagged)', len(st['exams']) == 2 and [e.get('real', 0) for e in st['exams']] == [0, 1])
    ck = next((k for k in c.cookies() if k['name'] == 'm261_save'), None)
    check('cookie: progress copy written, one cookie', ck is not None and len(ck['value']) <= 3800, ck and len(ck['value']))
    pg.evaluate("()=>localStorage.removeItem('ma261-sprint:progress')"); pg.reload(); pg.wait_for_timeout(1500)
    check('cookie: exams restored after local storage was cleared', len(M(pg, 'A._store()')['exams']) == 2)

    # ---- diagnostic + quadrics screens
    pg.click('#toDiag'); pg.wait_for_timeout(600)
    check('diagnostic: intro with the focus line', phase(pg) == ['dgintro'] and len(pg.inner_text('#dglast')) > 20, pg.inner_text('#dglast')[:80])
    pg.click('#dgbegin'); pg.wait_for_timeout(600)
    check('diagnostic: first question with choices', phase(pg) == ['dg'] and len(pg.query_selector_all('#dgopts .xopt, #dgopts button')) >= 4)
    pg.click('#examhome'); pg.wait_for_timeout(300)
    pg.click('#toQuad'); pg.wait_for_timeout(500)
    check('quadrics: study sheet with the memory line', phase(pg) == ['qstudy'] and len(pg.inner_text('#qmline')) > 10)

    # ---- header navigation
    pg.click('#examhome'); pg.click('#toExam'); pg.click('#xbegin'); pg.wait_for_timeout(300); pg.keyboard.press('B')
    pg.click('#examhome'); pg.wait_for_timeout(300)
    check('home: Exam 1 crumb leaves the exam for the start screen, offers resume', phase(pg) == ['start'] and pg.is_visible('#xresume'))
    with pg.expect_navigation(): pg.click('#home')
    check('logo: goes to the class picker', pg.is_visible('.hubgrid'), pg.url)
    check('no page errors or CSP violations', not errs, errs[:3])
    c.close()

    # ---- phone layout
    for scheme in ('light', 'dark'):
        c = b.new_context(viewport={'width': 390, 'height': 844}, color_scheme=scheme); e2 = []
        q = new_page(c, e2); q.goto(PAGE); q.wait_for_timeout(1200)
        worst = {}
        for opener, sec in [(None, 'start'), ('#toExam', 'xintro'), ('#toProg', 'prog')]:
            if opener: q.click('#examhome') if sec != 'xintro' else None; q.click(opener); q.wait_for_timeout(300)
            worst[sec] = hscroll(q)
            if opener: q.click('#examhome'); q.wait_for_timeout(200)
        check(f'layout {scheme} 390 px: no horizontal scroll', all(v == 0 for v in worst.values()), worst)
        c.close()
    b.close()
print('RESULT', 'PASS' if not fails else f'FAIL ({len(fails)}): ' + '; '.join(fails))
sys.exit(1 if fails else 0)
