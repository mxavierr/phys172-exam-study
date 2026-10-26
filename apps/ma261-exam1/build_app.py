"""Build the MA 261 Exam 1 page (its own engine; called by the root build.py).

  python3 -I apps/ma261-exam1/build_app.py <outdir> '<{"class":…,"exam":…} from site.json>'

src/ parts are joined in ORDER into one page (one function scope: partB.js opens it,
partZ.js closes it). The head is the site's shared src/00_head.html; theme.css restyles the
page with the shared palette, and its {{SHARED}} block is copied from src/01_style.css so the
header, mode tiles, welcome dialog and tooltips match the PHYS pages exactly.
Math is MathJax 3.2.2 from cdnjs (the questions and their checks were written for it), so this
page's Content-Security-Policy also allows https://cdnjs.cloudflare.com.
Checks: the joined script parses (node --check); every $('id') the script uses exists.
"""
import json, pathlib, re, subprocess, sys, tempfile
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT))
import build                                   # page(), fill(), write helpers and the shared logo

ORDER = ['partA.html', 'partB.js', 'partM.js', 'g13.js', 'g14.js', 'g15.js', 'gconcept.js', 'xcore.js', 'xphys.js',
         'dcore.js', 'xquad.js', 'qmem.js', 'x13.js', 'x14.js', 'x15.js', 'xreal.js', 'partG.js', 'storecookie.js',
         'partS.js', 'partX.js', 'partD.js', 'partI.js', 'tips.js', 'partZ.js']
RUNTIME_IDS = {'xres', 'xdis', 'dgres', 'dgdis', 'tipbox', 'qmgo'}   # created at runtime

out = pathlib.Path(sys.argv[1]); info = json.loads(sys.argv[2]); cls, ex = info['class'], info['exam']
eng_css = (ROOT / 'src' / '01_style.css').read_text()
def block(start, end):
    a = eng_css.index(start); return eng_css[a:eng_css.index(end, a)]
shared = (block('/* ---------- app header ---------- */', '/* class and exam pickers') +
          block('/* tooltips (13_tips.js) */', '/* formulas inside sentences') +
          block('.modes{display:grid', '.legend i.sug') +
          block('.chips{display:flex', '.chip .cn') +
          block('/* first-visit welcome (dialog)', '/* exam intro: big facts'))
theme = (HERE / 'theme.css').read_text().replace('{{SHARED}}', shared)

parts = [(HERE / 'src' / n).read_text() for n in ORDER]
body = ''.join(parts)
values = {'ROOT': '../../', 'LOGO': build.LOGO, 'MATH': '', 'THEME': theme,
          'TITLE': f"{ex['name']} · {cls['name']} · BoilerCram",
          'DESC': f"Free {cls['name']} {ex['name']} practice: mock exams, the real Fall 2026 exam, diagnostics, sprints. Runs in your browser, no account.",
          'COURSE': cls['name'], 'COURSE_HREF': cls['id'], 'EXAM': ex['name']}
script = build.fill(''.join(p for n, p in zip(ORDER, parts) if n.endswith('.js')), values, 'ma261 script')
markup = parts[0]
errors = []
ids = set(re.findall(r'\bid="([^"]+)"', markup))
used = set(re.findall(r"\$\('([\w-]+)'\)", script))
missing = sorted(used - ids - RUNTIME_IDS)
if missing: errors.append(f'script uses ids missing from the markup: {missing}')
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
    f.write(script.replace('<script>', '', 1).rsplit('</script>', 1)[0]); tmp = f.name   # partB/partZ carry the tags
r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
if r.returncode: errors.append('script does not parse:\n' + r.stderr[-1500:])
if errors:
    print('BUILD FAILED: ma261'); [print(' -', e) for e in errors]; sys.exit(1)

head = (ROOT / 'src' / '00_head.html').read_text()
html = build.page(head, body, values, 'ma261', extra_script_src=('https://cdnjs.cloudflare.com',))
out.mkdir(parents=True, exist_ok=True)
(out / 'index.html').write_text(html)
print(f"built {cls['id']}/{ex['id']}/index.html · {len(html):,} bytes · {len(ORDER)} files")
