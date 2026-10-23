"""End-to-end UI test in headless Chromium (phone size, dark mode), network blocked.

Run:  python3 -I tests/t_ui.py <dist/index.html or URL> [screenshot_dir]
Each check prints OK/FAIL; exit code 1 on any failure. Covers:
  boot      no page errors, no duplicate ids, sections exist
  sprint    play right/wrong/skip, 300 quick skips (generators that return null must not
            freeze the game), overtime ends the run, results, run saved, bonus setting survives a reload
  progress  synthetic saved data with misses: skills section, legacy exam rows, patterns,
            the sprint "weak concepts" button does not touch the drill screen (the old id clash)
  drill     suggestions, miss then clear, Enter on a focused button advances exactly once,
            linked pair, stop mid-drill saves, summary
  exam      answer/flag/keys, reload resumes, discard guard, submit, by-type + patterns,
            record has per-question variants, time-up path
  storage   progress cookie written and size-capped, restores after site storage is cleared,
            union of cookie + localStorage, settings restored, tampered data cleaned,
            export/import file, sprint resumes after a reload, first-visit note, no CSP violations
  layout    no horizontal scroll on every screen at 390 px, dark and light; screenshots
"""
import json, sys, pathlib, time
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); from _serve import page_url

PAGE, ORIGIN = page_url(sys.argv[1])
SHOTS = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else None
fails = []
def check(name, cond, info=''):
    print(('OK   ' if cond else 'FAIL ') + name + (f'  [{info}]' if info else ''))
    if not cond: fails.append(name)

# synthetic saved progress (made up for the tests): one v1 exam without per-question detail and two
# sprint runs with misses, so the skills section, patterns, weak spots and drill suggestions all have data
SAMPLE = {"v": 1, "updated": 1790500000000,
  "exams": [{"right": 10, "score": 160, "slots": [1,-1,1,1,0,1,1,1,-1,1,1,0,1,-1,1], "timeUp": 0, "ts": 1790400000000, "used": 3100}],
  "runs": [{"att": 4, "bonus": 1, "dur": 300, "pts": 60, "right": 4, "scope": "ab", "skip": 0, "slow": 3, "t": {"ep-compare": [1,1,0,0,110.0], "ep-friend": [1,1,1,0,290.0]}, "time": 700, "ts": 1790100000000},
           {"att": 2, "bonus": 1, "dur": 600, "pts": 20, "right": 1, "scope": "ab", "skip": 0, "slow": 1, "t": {"ic-binding": [1,1,1,0,800.0], "pw-power": [1,0,0,0,60.0]}, "time": 860, "ts": 1790200000000}]}
COOKIE = 'es_save'


def new_page(ctx, errs):
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('CSP: ' + m.text) if 'Content Security Policy' in m.text else None)
    pg.route('**/*', lambda r: r.abort() if not r.request.url.startswith(ORIGIN) else r.continue_())
    return pg

def hook(pg, expr): return pg.evaluate(f'()=>{{const A=window.EnergySprint; return ({expr});}}')
def visible(pg): return pg.evaluate("()=>[...document.querySelectorAll('.wrap > section')].filter(s=>!s.hidden).map(s=>s.id)")
def hscroll(pg): return pg.evaluate('()=>document.documentElement.scrollWidth-document.documentElement.clientWidth')
def shot(pg, name):
    if SHOTS: SHOTS.mkdir(parents=True, exist_ok=True); pg.screenshot(path=str(SHOTS / f'{name}.png'), full_page=True)

with sync_playwright() as p:
    b = p.chromium.launch()
    # ------------------------------------------------------------------ boot + sprint
    errs = []
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, color_scheme='dark')
    pg = new_page(ctx, errs); pg.goto(PAGE); pg.wait_for_timeout(300)
    ids = pg.evaluate("()=>{const c={};document.querySelectorAll('[id]').forEach(e=>c[e.id]=(c[e.id]||0)+1);return Object.keys(c).filter(k=>c[k]>1);}")
    check('boot: no duplicate ids in the live DOM', not ids, ids)
    check('boot: start screen only', visible(pg) == ['start'], visible(pg))
    pg.click('#go'); pg.wait_for_timeout(100)
    cur = hook(pg, 'A._cur()')
    pg.fill('#ans', str(cur['ans'])); pg.keyboard.press('Enter'); pg.wait_for_timeout(50)
    pg.fill('#ans', str(hook(pg, 'A._cur()')['ans'] * 3 + 7)); pg.keyboard.press('Enter'); pg.wait_for_timeout(50)
    pg.fill('#ans', 'abc'); pg.keyboard.press('Enter')
    st = hook(pg, 'A._state()')
    check('sprint: non-number is rejected without moving on', st['qi'] == 3, st['qi'])
    pg.fill('#ans', '')
    for _ in range(300): pg.keyboard.press('Enter')       # skip a lot: rolls every generator many times
    st = hook(pg, 'A._state()')
    check('sprint: 300 skips without freezing', st['qi'] >= 300 and not errs, f"qi {st['qi']} errs {errs[:1]}")
    check('sprint: time bonus banked for the right answer', st['bank'] > 0, st['bank'])
    hook(pg, 'A._advance(100000)'); pg.wait_for_timeout(200)
    check('sprint: overtime flagged', hook(pg, 'A._state()')['over'])
    pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check('sprint: answering in overtime ends the run', visible(pg) == ['done'], visible(pg))
    check('sprint: run saved', hook(pg, 'A._state()')['runs'] == 1)
    check('sprint: timers stopped on results', hook(pg, 'A._state()')['timers'] == [], hook(pg, 'A._state()')['timers'])
    pg.click('#back'); pg.click('#bonuschip')
    pg.reload(); pg.wait_for_timeout(300)
    check('sprint: bonus setting survives a reload', hook(pg, 'A._state()')['bonusOn'] is False)
    ctx.close()

    # ------------------------------------------------------------------ progress with real-shaped data
    errs = []
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, color_scheme='dark')
    ctx.add_init_script(f"if(!localStorage.getItem('energy-sprint:progress'))localStorage.setItem('energy-sprint:progress',{json.dumps(json.dumps(SAMPLE))});")
    pg = new_page(ctx, errs); pg.goto(PAGE); pg.wait_for_timeout(300)
    pg.click('#toProg'); pg.wait_for_timeout(300)
    check('progress: skills section shown', pg.is_visible('#skills'))
    check('progress: legacy exam rows say the variant was not recorded', pg.evaluate("()=>{document.querySelector('#slist details.skill').open=true;return document.querySelector('#slist .skillin').innerText.includes('Variant not recorded');}"))
    pats = pg.eval_on_selector_all('#spat .pat b', 'n=>n.map(x=>x.textContent)')
    check('progress: blanks pattern found', any('left blank' in x for x in pats), pats)
    check('progress: 15 type rows', pg.eval_on_selector_all('#slist details.skill', 'n=>n.length') == 15)
    check('progress: sprint weak-concept button shown', pg.is_visible('#sprintWeak'), pg.inner_text('#sprintWeak') if pg.is_visible('#sprintWeak') else '')
    check('progress: drill screen untouched by progress render', pg.evaluate("()=>!!document.querySelector('#drill #dopts')&&!!document.querySelector('#drill #drail')"))
    check('progress: no horizontal scroll', hscroll(pg) == 0, hscroll(pg))
    pg.click('#slist details.skill summary'); shot(pg, 'progress_dark')
    check('progress: no page errors', not errs, errs[:2])
    pg.click('#sprintWeak'); pg.wait_for_timeout(100)
    check('progress: weak-concepts button starts a sprint', visible(pg) == ['play'])
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)

    # ------------------------------------------------------------------ drill
    pg.click('#back'); pg.click('#toDrill'); pg.wait_for_timeout(300)
    sel = pg.eval_on_selector_all('#dchips .chip.on', 'n=>n.map(x=>x.querySelector(".cn").textContent+" "+x.childNodes[1].textContent)')
    check('drill: two suggested types preselected', len(sel) == 2, sel)
    check('drill: suggestions are the two wrong-answer types', sorted(sel) == ['Q12 Vertical spring equation', 'Q5 Heat and work'], sel)
    shot(pg, 'drill_picker')
    pg.click('#dbegin'); pg.wait_for_timeout(150)
    seen = set(); steps = 0
    while visible(pg) == ['drill'] and steps < 40:
        d = hook(pg, '(()=>{const R=A._drill(),p=R.set.parts[R.pi];return {c:p.c,key:p.it.key,n:p.it.opts.length,q:R.q.length,cats:R.cats};})()')
        first = d['c'] not in seen; seen.add(d['c'])
        k = (d['key'] + 1) % d['n'] if first else d['key']
        pg.keyboard.press('ABCDE'[k]); pg.wait_for_timeout(40)
        if steps == 1: shot(pg, 'drill_feedback')
        if steps == 2:                          # Enter with the Next button focused must advance once, not twice
            before = hook(pg, 'A._drill().q.length'); pg.focus('#dnext'); pg.keyboard.press('Enter'); pg.wait_for_timeout(60)
            after = hook(pg, '(()=>{const R=A._drill();return {q:R.q.length,picked:R.picked};})()')
            check('drill: Enter on focused Next advances exactly once', after['q'] == before and after['picked'] is False, after)
        else:
            pg.keyboard.press('Enter'); pg.wait_for_timeout(60)
        steps += 1
    check('drill: ends by itself once both types are cleared', visible(pg) == ['ddone'], f'{visible(pg)} after {steps}')
    rec = hook(pg, 'A._store().drills.slice(-1)[0]')
    check('drill: saved with reason cleared', rec and rec['reason'] == 'cleared' and len(rec['cleared']) == 2, rec and rec['reason'])
    shot(pg, 'drill_summary')
    # linked pair + stop mid-drill
    pg.evaluate("()=>{}"); pg.click('#dagain'); pg.wait_for_timeout(200)
    pg.evaluate("()=>{document.querySelectorAll('#dchips .chip.on').forEach(c=>c.click()); document.querySelectorAll('#dchips .chip')[8].click();}")
    pg.click('#dbegin'); pg.wait_for_timeout(150)
    d = hook(pg, '(()=>{const R=A._drill();return {parts:R.set.parts.map(p=>p.c),setup:!!R.set.setup};})()')
    check('drill: Track: normal force asks Track: speed first, with the setup', d['parts'] == [7, 8] and d['setup'], d)
    pg.keyboard.press('A'); pg.click('#dstop'); pg.wait_for_timeout(200)
    check('drill: stopping mid-drill saves the answer', hook(pg, 'A._store().drills.length') == 2 and visible(pg) == ['ddone'])
    ctx.close()

    # ------------------------------------------------------------------ exam
    errs2 = []
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, color_scheme='light')
    ctx.add_init_script(f"if(!localStorage.getItem('energy-sprint:progress'))localStorage.setItem('energy-sprint:progress',{json.dumps(json.dumps(SAMPLE))});")
    pg = new_page(ctx, errs2); pg.goto(PAGE); pg.wait_for_timeout(300)
    pg.click('#toExam'); pg.click('#xbegin'); pg.wait_for_timeout(200)
    pg.keyboard.press('B'); pg.keyboard.press('ArrowRight'); pg.keyboard.press('F'); pg.keyboard.press('C')
    xe = hook(pg, 'A._exam()')
    check('exam: keys answer, move and flag', xe['ans'][0] == 1 and xe['flag'][1] and xe['ans'][1] == 2 and xe['cur'] == 1)
    shot(pg, 'exam_light')
    pg.reload()
    try: pg.wait_for_selector('#xres', state='visible', timeout=8000); ok = True
    except Exception: ok = False
    check('exam: reload offers resume', ok)
    pg.click('#toExam'); pg.click('#xbegin')
    check('exam: Begin asks before discarding the exam in progress', 'discards' in pg.inner_text('#xbegin') and visible(pg) == ['xintro'])
    pg.click('#xback'); pg.click('#xres'); pg.wait_for_timeout(200)
    check('exam: resumed with answers intact', hook(pg, 'A._exam().ans[1]') == 2 and visible(pg) == ['exam'])
    pg.evaluate("()=>{const E=window.EnergySprint._exam(); E.items.forEach((it,i)=>{ E.ans[i]= i%4===0?(it.key+1)%it.opts.length:it.key; E.spent[i]=60+i*25; });}")
    pg.click('#xsubmit'); check('exam: submit needs a second tap', visible(pg) == ['exam'])
    pg.click('#xsubmit'); pg.wait_for_timeout(400)
    check('exam: results shown', visible(pg) == ['xdone'])
    check('exam: by-type table has 15 rows', pg.eval_on_selector_all('#xttable tbody tr', 'n=>n.length') == 15)
    check('exam: patterns rendered', pg.eval_on_selector_all('#xpat .pat', 'n=>n.length') >= 1)
    last = hook(pg, 'A._store().exams.slice(-1)[0]')
    check('exam: record has 15 classified answers with times', len(last['q']) == 15 and all(x['s'] and x['t'] >= 60 for x in last['q']))
    check('exam: v1 slots kept for old readers', len(last['slots']) == 15)
    check('exam: in-progress copy removed', pg.evaluate("()=>localStorage.getItem('energy-sprint:exam')") is None)
    check('exam: no horizontal scroll on results', hscroll(pg) == 0, hscroll(pg))
    shot(pg, 'exam_results_light')
    pg.click('#xdrill'); pg.wait_for_timeout(200)
    check('exam: "Drill these" opens the picker with suggestions', visible(pg) == ['dintro'] and pg.eval_on_selector_all('#dchips .chip.on', 'n=>n.length') >= 1)
    pg.click('#dback'); pg.click('#toExam'); pg.click('#xbegin'); pg.wait_for_timeout(100)
    hook(pg, 'A._xage(70*60+5)'); pg.wait_for_timeout(500)
    check('exam: time-up submits by itself', visible(pg) == ['xdone'] and hook(pg, 'A._store().exams.filter(e=>e.timeUp===1).length') == 1)   # aging the clock moves t0 back, so this exam sorts first
    check('exam: no page errors', not errs2, errs2[:2])
    ctx.close()

    # ------------------------------------------------------------------ storage: cookie + localStorage, no server
    def cookie_of(c):
        return next((k['value'] for k in c.cookies() if k['name'] == COOKIE), None)
    def unpack(q):
        return q.evaluate("async()=>{const A=window.EnergySprint; return await A._cookie.unpack(A._cookie.get());}")
    seed = lambda o: f"if(!sessionStorage.getItem('seeded')){{localStorage.setItem('energy-sprint:progress',{json.dumps(json.dumps(o))});sessionStorage.setItem('seeded','1');}}"
    run = lambda ts, **k: {'ts': ts, 'att': 2, 'right': 1, 'slow': 0, 'skip': 0, 'pts': 10, 'time': 300, 'dur': 300, 'bonus': 1, 'scope': 'ab', **k}

    errs3 = []
    c = b.new_context(viewport={'width': 390, 'height': 844})
    c.add_init_script(seed({'v': 2, 'runs': [run(1000)], 'exams': [], 'drills': []}))
    q = new_page(c, errs3); q.goto(PAGE); q.wait_for_timeout(500)
    v = cookie_of(c)
    check('storage: progress cookie written on load', v is not None and v[0] in 'zj' and len(v) <= 3800, v and len(v))
    ck = [k for k in c.cookies() if k['name'] == COOKIE][0]
    check('storage: cookie is path-scoped, SameSite=Lax, ~400-day lifetime',
          ck['path'] == '/' and ck['sameSite'] == 'Lax' and ck['expires'] - time.time() > 390 * 86400, ck)
    check('storage: cookie holds the saved runs', [r['ts'] for r in unpack(q)['s']['runs']] == [1000])
    check('storage: status says saved in this browser', (q.click('#toProg'), q.wait_for_timeout(200), 'Saved in this browser' in q.inner_text('#storenote'))[-1], q.inner_text('#storenote'))
    q.click('#progback'); q.click('#bonuschip'); q.wait_for_timeout(50)      # bonus off; persisted on the next save
    hook(q, "A._seed({ts:2000,att:1,right:1,slow:0,skip:0,pts:10,time:100,dur:300,bonus:0,scope:'ab'})"); q.evaluate('()=>window.EnergySprint._persistDone()')
    q.evaluate("()=>localStorage.clear()"); q.reload(); q.wait_for_timeout(600)
    st = hook(q, 'A._state()'); mem = hook(q, 'A._store()')
    check('storage: history restored from the cookie after site storage was cleared', [r['ts'] for r in mem['runs']] == [1000, 2000], [r['ts'] for r in mem['runs']])
    check('storage: localStorage rewritten from the cookie', q.evaluate("()=>JSON.parse(localStorage.getItem('energy-sprint:progress')).runs.length") == 2)
    check('storage: time-bonus setting restored from the cookie', st['bonusOn'] is False, st['bonusOn'])
    # union: the cookie knows 1000+2000; put a different record in localStorage only
    q.evaluate(f"()=>localStorage.setItem('energy-sprint:progress',{json.dumps(json.dumps({'v':2,'runs':[run(3000)],'exams':[],'drills':[]}))})")
    q.reload(); q.wait_for_timeout(600)
    check('storage: union of cookie and localStorage', [r['ts'] for r in hook(q, 'A._store()')['runs']] == [1000, 2000, 3000])
    # big history: the cookie stays under one cookie's size and keeps the newest records + every exam it can
    ex = lambda ts: {'ts': ts, 'score': 160, 'right': 10, 'used': 3000, 'timeUp': 0, 'slots': [1, 0, -1] * 5,
                     'q': [{'c': i, 's': None, 'r': [1, 0, -1][i % 3], 't': 120 + i} for i in range(15)]}
    tt = {g: [3, 2, 1, 0, 400.5] for g in ['ep-compare', 'ep-friend', 'ic-binding', 'pw-power', 'ke-basic', 'w-const']}
    BIG = {'v': 2, 'runs': [run(10000 + i, t=dict(tt)) for i in range(120)], 'exams': [ex(5000 + i) for i in range(40)],
           'drills': [{'ts': 20000 + i, 'cats': [1, 2], 'q': [{'c': 1, 's': 'x2-push', 'r': 1, 't': 30, 'at': 20000 + i}] * 12, 'cleared': [1], 'end': 0, 'reason': 'stopped'} for i in range(60)]}
    q.evaluate(f"()=>localStorage.setItem('energy-sprint:progress',{json.dumps(json.dumps(BIG))})")
    q.reload(); q.wait_for_timeout(1500)
    v = cookie_of(c); cs = unpack(q)['s']
    check('storage: big history still fits one cookie', v and len(v) <= 3800, v and len(v))
    check('storage: cookie keeps the newest run and newest exam', cs['runs'] and cs['runs'][-1]['ts'] == 10119 and cs['exams'][-1]['ts'] == 5039,
          (len(cs['runs']), len(cs['exams']), len(cs['drills'])))
    check('storage: localStorage keeps the full history', len(hook(q, 'A._store()')['exams']) == 40)
    check('storage: no page errors / CSP violations', not errs3, errs3[:2])
    c.close()

    # tampered saved data is rebuilt field by field (it is rendered on screen)
    errs4 = []
    BAD = {'v': 2, 'runs': [{'ts': 7000, 'att': '<img src=x onerror=window.__pwned=1>', 'right': 1, 'time': 50, 'scope': '<b>x</b>',
                             't': {'ep-compare': [1, 1, 0, 0, 9], '<script>': [1, 1, 1, 1, 1]}}, {'ts': 'nope'}],
           'exams': [{'ts': 8000, 'score': '<i>9</i>', 'right': 1, 'used': 10, 'slots': [1, 'x'], 'q': [{'c': 99, 'r': 1}, {'c': 2, 's': '<x>', 'r': 1, 't': 5}]}],
           'drills': 'not a list'}
    c = b.new_context(viewport={'width': 390, 'height': 844})
    c.add_init_script(seed(BAD))
    q = new_page(c, errs4); q.goto(PAGE); q.wait_for_timeout(500)
    q.click('#toProg'); q.wait_for_timeout(300)
    mem = hook(q, 'A._store()')
    r0, e0 = mem['runs'][0], mem['exams'][0]
    check('clean: bad fields coerced, bad keys and records dropped',
          len(mem['runs']) == 1 and r0['att'] == 0 and r0['scope'] == 'ab' and list(r0['t']) == ['ep-compare'] and e0['score'] == 0
          and e0['q'] == [{'c': 2, 's': None, 'r': 1, 't': 5}] and mem['drills'] == [], (r0, e0))
    check('clean: no injected markup ran', q.evaluate('()=>!window.__pwned') and not errs4, errs4[:2])
    # export -> import round trip, and a file that is not a progress file
    with q.expect_download() as dl: q.click('#exporthist')
    path = dl.value.path(); data = json.loads(pathlib.Path(path).read_text())
    check('export: backup file has the app tag and the store', data.get('app') == 'energy-sprint' and data['store']['runs'][0]['ts'] == 7000, dl.value.suggested_filename)
    imp = pathlib.Path(path).with_name('import.json')
    imp.write_text(json.dumps({'app': 'energy-sprint', 'store': {'runs': [run(9000)], 'exams': [], 'drills': []}}))
    q.set_input_files('#importfile', str(imp)); q.wait_for_timeout(400)
    check('import: records merged and reported', [r['ts'] for r in hook(q, 'A._store()')['runs']] == [7000, 9000] and '1 records merged' in q.inner_text('#storenote'), q.inner_text('#storenote'))
    imp = imp.with_name('other.json'); imp.write_text('{"hello": 1}'); q.set_input_files('#importfile', str(imp)); q.wait_for_timeout(300)
    check('import: other files refused', 'Not a progress file' in q.inner_text('#storenote') and len(hook(q, 'A._store()')['runs']) == 2)
    c.close()

    # sprint in play survives a reload; first-visit note
    errs5 = []
    c = b.new_context(viewport={'width': 390, 'height': 844})
    q = new_page(c, errs5); q.goto(PAGE); q.wait_for_timeout(300)
    check('note: first-visit storage note shown', q.is_visible('#cookienote'))
    q.click('#cookieok'); q.reload(); q.wait_for_timeout(300)
    check('note: stays dismissed after a reload', not q.is_visible('#cookienote'))
    q.click('#go'); q.wait_for_timeout(100)
    q.fill('#ans', str(hook(q, 'A._cur()')['ans'])); q.keyboard.press('Enter'); q.wait_for_timeout(50)
    before = hook(q, 'A._state()')
    q.reload(); q.wait_for_timeout(500)
    after = hook(q, 'A._state()')
    check('resume: sprint in play resumes after a reload', visible(q) == ['play'] and after['qi'] == before['qi'] == 2, (visible(q), before['qi'], after['qi']))
    q.keyboard.press('Escape'); q.wait_for_timeout(200)
    check('resume: finished sprint saved, snapshot cleared', hook(q, 'A._state()')['runs'] == 1 and q.evaluate("()=>localStorage.getItem('energy-sprint:sprint')") is None)
    check('resume: no page errors', not errs5, errs5[:2])
    c.close()

    # ------------------------------------------------------------------ layout sweep
    for scheme in ('dark', 'light'):
        c = b.new_context(viewport={'width': 390, 'height': 844}, color_scheme=scheme)
        c.add_init_script(f"if(!localStorage.getItem('energy-sprint:progress'))localStorage.setItem('energy-sprint:progress',{json.dumps(json.dumps(SAMPLE))});")
        q = new_page(c, []); q.goto(PAGE); q.wait_for_timeout(300)
        worst = {}
        for sec in ['start', 'xintro', 'dintro', 'prog']:
            q.evaluate(f"()=>{{document.querySelectorAll('.wrap > section').forEach(s=>s.hidden=s.id!=='{sec}');}}")
            if sec == 'prog': q.click('#progback') if False else q.evaluate("()=>document.getElementById('toProg').click()")
            if sec == 'dintro': q.evaluate("()=>document.getElementById('toDrill').click()")
            q.wait_for_timeout(200); worst[sec] = hscroll(q)
        check(f'layout {scheme}: no horizontal scroll on any screen', all(v == 0 for v in worst.values()), worst)
        c.close()
    b.close()
print('RESULT', 'PASS' if not fails else f'FAIL ({len(fails)}): ' + '; '.join(fails))
sys.exit(1 if fails else 0)
