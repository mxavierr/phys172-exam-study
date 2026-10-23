"""Screenshots of every screen for a visual check (not pass/fail).

Run: python3 -I tests/t_shots.py <page.html> <outdir> [width=1280] [scheme=light]
Google Fonts are allowed through if the network permits; everything else stays blocked.
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); from _serve import page_url
URL, ORIGIN = page_url(sys.argv[1]); out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
W = int(sys.argv[3]) if len(sys.argv) > 3 else 1280
scheme = sys.argv[4] if len(sys.argv) > 4 else 'light'
SAMPLE = {"v": 1, "exams": [{"right": 10, "score": 160, "slots": [1,-1,1,1,0,1,1,1,-1,1,1,0,1,-1,1], "timeUp": 0, "ts": 1790400000000, "used": 3100}],
          "runs": [{"att": 2, "right": 1, "slow": 1, "t": {"ic-binding": [1,1,1,0,800.0], "pw-power": [1,0,0,0,60.0]}, "time": 860, "ts": 1790200000000, "pts": 20}]}   # synthetic
def allow(r):
    u = r.request.url
    (r.continue_() if u.startswith(ORIGIN) or 'fonts.googleapis.com' in u or 'fonts.gstatic.com' in u else r.abort())
with sync_playwright() as p:
    b = p.chromium.launch()
    c = b.new_context(viewport={'width': W, 'height': 900}, color_scheme=scheme)
    c.add_init_script(f"if(!localStorage.getItem('energy-sprint:progress'))localStorage.setItem('energy-sprint:progress',{json.dumps(json.dumps(SAMPLE))});")
    pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.route('**/*', allow)
    pg.goto(URL); pg.wait_for_timeout(1500)
    tag = f'{W}_{scheme}'
    pg.screenshot(path=str(out / f'01_start_{tag}.png'), full_page=True)
    # mock exam: go to a figure question (Q4 potential-energy diagram) and to the loop/bowl pair (Q8)
    pg.click('#toExam'); pg.click('#xbegin'); pg.wait_for_timeout(300)
    pg.keyboard.press('B')
    for q in (3, 7, 13):
        pg.evaluate(f'()=>{{document.querySelectorAll("#xnav button")[{q}].click();}}'); pg.wait_for_timeout(250)
        pg.screenshot(path=str(out / f'02_exam_q{q+1}_{tag}.png'), full_page=True)
    # drill with feedback (wrong answer) on Track: normal force
    pg.evaluate('()=>{document.getElementById("toDrill").click();}'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{document.querySelectorAll('#dchips .chip.on').forEach(c=>c.click()); document.querySelectorAll('#dchips .chip')[3].click();}")
    pg.click('#dbegin'); pg.wait_for_timeout(200)
    k = pg.evaluate('()=>{const R=EnergySprint._drill();return R.set.parts[R.pi].it.key;}')
    pg.keyboard.press('ABCDE'[(k + 1) % 5]); pg.wait_for_timeout(900)
    pg.screenshot(path=str(out / f'03_drill_wrong_{tag}.png'), full_page=True)
    pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
    k = pg.evaluate('()=>{const R=EnergySprint._drill();return R.set.parts[R.pi].it.key;}')
    pg.keyboard.press('ABCDE'[k]); pg.wait_for_timeout(900)
    pg.screenshot(path=str(out / f'04_drill_right_{tag}.png'), full_page=True)
    # sprint with a figure question if one comes up
    pg.click('#dstop'); pg.wait_for_timeout(200); pg.click('#dhome')
    pg.click('#go'); pg.wait_for_timeout(200)
    for _ in range(40):
        if pg.evaluate('()=>!!EnergySprint._cur().fig'): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(30)
    pg.screenshot(path=str(out / f'05_sprint_{tag}.png'), full_page=True)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(1200)
    pg.screenshot(path=str(out / f'06_sprint_results_{tag}.png'), full_page=True)
    pg.click('#toProg2'); pg.wait_for_timeout(500)
    pg.evaluate("()=>document.querySelector('#slist details.skill').open=true")
    pg.screenshot(path=str(out / f'07_progress_{tag}.png'), full_page=True)
    print('errors:', errs or 'none')
    b.close()
