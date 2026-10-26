"""Build the BoilerCram site into dist/.

  python3 -I build.py [outdir]          (default: dist/)

Site map (site/site.json): a class picker at the root, an exam picker per class, one page per exam.
  dist/index.html                     class picker
  dist/<class>/index.html             exam picker
  dist/<class>/<exam>/index.html      an exam page, one of two kinds:
     "pack": the shared engine (src/) + that exam's content (packs/<pack>/). A pack file with the
             same name as an engine file replaces it; pack.json fills the {{PLACEHOLDERS}}.
     "app":  a page with its own engine (apps/<app>/, built by its build_app.py).
  dist/katex/, favicons, site.webmanifest: shared by every page (static/, vendor/katex/).

Engine + pack files are joined in file-name order (00 head, 01 css, 02 markup, 10..95 script, 99 close);
00_head.html and 01_style.css go in <head>, the rest in <body>. All .js share one function scope:
src/10_core.js opens it, src/95_boot.js closes it. Checks run on every exam page and stop the build:
  - duplicate element ids in the markup
  - every $('id') / on('id') used by the script exists in the markup (or is created at runtime)
  - the joined script parses (node --check)
  - no {{PLACEHOLDER}} is left unfilled
Every page gets a Content-Security-Policy that allows its inline scripts by SHA-256 hash only.
"""
import base64, hashlib, html, json, pathlib, re, shutil, subprocess, sys, tempfile
ROOT = pathlib.Path(__file__).resolve().parent
SRC, PACKS, APPS, SITE = ROOT / 'src', ROOT / 'packs', ROOT / 'apps', ROOT / 'site'
RUNTIME_IDS = {'xres', 'xdis'}          # created by xBoot() at runtime
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'dist'
site = json.loads((SITE / 'site.json').read_text())
LOGO = (SITE / 'logo.svg').read_text().strip()
KATEX = '<link rel="stylesheet" href="{{ROOT}}katex/katex.min.css">\n<script src="{{ROOT}}katex/katex.min.js" defer></script>'


def csp(scripts, extra_script_src=()):
    hashes = ' '.join("'sha256-%s'" % base64.b64encode(hashlib.sha256(s.encode()).digest()).decode() for s in scripts)
    return '; '.join([
        "default-src 'none'",
        "script-src 'self' " + ' '.join(extra_script_src) + (' ' if extra_script_src else '') + hashes,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",   # KaTeX, MathJax and the figures set inline styles
        "font-src 'self' https://fonts.gstatic.com" + (' https://cdnjs.cloudflare.com' if extra_script_src else ''),
        "img-src 'self' data: blob:",
        "connect-src 'self'" + (' https://cdnjs.cloudflare.com' if extra_script_src else ''),
        "manifest-src 'self'",
        "base-uri 'none'",
        "form-action 'none'",
        "object-src 'none'",
    ])


def fill(text, values, where, keep=()):
    out = re.sub(r'\{\{([A-Z_]+)\}\}', lambda m: str(values[m.group(1)]) if m.group(1) in values else m.group(0), text)
    left = sorted(set(re.findall(r'\{\{([A-Z_]+)\}\}', out)) - set(keep))
    if left: sys.exit(f'BUILD FAILED: {where}: unfilled placeholders {left}')
    return out


def page(head, body, values, where, extra_script_src=()):
    """Wrap head + body in a standards-mode document with a CSP hashing every inline <script>."""
    head, body = fill(head, values, where, keep=('CSP',)), fill(body, values, where)
    inline = re.findall(r'<script>(.*?)</script>', head + body, re.S)
    head = head.replace('{{CSP}}', csp(inline, extra_script_src))
    return '<!doctype html>\n<html lang="en">\n<head>\n' + head + '</head>\n<body>\n' + body + '</body>\n</html>\n'


def write(rel, text):
    p = OUT / rel / 'index.html'
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text)
    return p


def build_pack(cls, ex):
    pack = PACKS / ex['pack']
    conf = json.loads((pack / 'pack.json').read_text())
    files = {p.name: p for p in SRC.iterdir() if p.suffix in ('.html', '.css', '.js')}
    files.update({p.name: p for p in pack.iterdir() if p.suffix in ('.html', '.css', '.js')})
    parts = [files[n] for n in sorted(files)]
    root = '../../'
    values = {
        'ROOT': root, 'LOGO': LOGO, 'MATH': KATEX.replace('{{ROOT}}', root),
        'TITLE': f"{ex['name']} · {cls['name']} · BoilerCram",
        'DESC': f"Free {cls['name']} {ex['name']} practice: timed sprint, mock exam, adaptive drill and progress. Runs in your browser, no account.",
        'COURSE': cls['name'], 'COURSE_HREF': cls['id'], 'EXAM': conf['exam'], 'NS': conf['ns'], 'COOKIE': conf['cookie'],
        'WELCOME': conf['welcome'], 'XQ': conf['xq'], 'XMIN': conf['xmin'], 'XPTS': conf['xpts'], 'XG': conf['xg'],
        'HWTAG': conf['hwtag'], 'FOCUS_LABEL': conf['focusLabel'], 'FOCUS_TIP': html.escape(conf['focusTip']),
        'XNOTE': conf['xnote'], 'CONSTS': '\n'.join('      ' + c for c in conf['consts']),
    }
    text = {p: p.read_text() for p in parts}
    head = ''.join(t for p, t in text.items() if p.name[:2] in ('00', '01'))
    body = ''.join(t for p, t in text.items() if p.name[:2] not in ('00', '01'))
    script = fill(''.join(t for p, t in text.items() if p.suffix == '.js'), values, ex['pack'])
    markup = ''.join(t for p, t in text.items() if p.suffix == '.html')
    errors = []
    ids = re.findall(r'\bid="([^"]+)"', markup)
    dups = sorted({i for i in ids if ids.count(i) > 1})
    if dups: errors.append(f'duplicate ids in markup: {dups}')
    used = set(re.findall(r"\$\('([\w-]+)'\)", script)) | set(re.findall(r"\bon\('([\w-]+)'", script))
    missing = sorted(used - set(ids) - RUNTIME_IDS)
    if missing: errors.append(f'script uses ids missing from the markup: {missing}')
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
        f.write(script); tmp = f.name
    r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
    if r.returncode: errors.append('script does not parse:\n' + r.stderr[-1500:])
    if body.count('<script>') != 1: errors.append('expected exactly one inline <script> in the body')
    if errors:
        print(f'BUILD FAILED: {ex["pack"]}'); [print(' -', e) for e in errors]; sys.exit(1)
    p = write(f"{cls['id']}/{ex['id']}", page(head, body, values, ex['pack']))
    return p, len(parts)


def build_hubs():
    head = (SRC / '00_head.html').read_text() + (SRC / '01_style.css').read_text()
    hub = (SITE / 'hub.html').read_text()
    arrow = '<span class="hubgo" aria-hidden="true">→</span>'
    tiles = '\n'.join(
        f'''    <a class="hubtile" href="{c['id']}/"><span class="hubcode">{c['name']}</span><span class="hubname">{c['full']}</span>'''
        f'''<span class="hubmeta">{len(c['exams'])} exam{'s' if len(c['exams']) > 1 else ''}{arrow}</span></a>''' for c in site['classes'])
    write('', page(head, hub, {'ROOT': '', 'LOGO': LOGO, 'MATH': '', 'TITLE': 'BoilerCram · Purdue exam practice',
          'DESC': 'Free practice for Purdue exams: mock exams, timed sprints, drills and progress tracking. Runs in your browser, no account.',
          'CRUMBS': '', 'HEADING': 'Pick a class', 'TILES': tiles}, 'class picker'))
    for c in site['classes']:
        tiles = '\n'.join(
            f'''    <a class="hubtile" href="{e['id']}/" data-ns="{e['ns']}" data-total="{e['total']}"><span class="hubcode">{e['name']}</span>'''
            f'''<span class="hubname">{e['topics']}</span><span class="hubmeta">{e['tag']}<span class="hubbest" hidden></span>{arrow}</span></a>'''
            for e in c['exams'])
        write(c['id'], page(head, hub, {'ROOT': '../', 'LOGO': LOGO, 'MATH': '', 'TITLE': f"{c['name']} · BoilerCram",
              'DESC': f"Free {c['name']} exam practice. Runs in your browser, no account.",
              'CRUMBS': f'<a href="../" data-tip="All classes">All classes</a><span aria-hidden="true">/</span><span>{c["name"]}</span>',
              'HEADING': f"{c['name']} · pick an exam", 'TILES': tiles}, c['id']))


if __name__ == '__main__':
    if OUT.exists(): shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    shutil.copytree(ROOT / 'vendor' / 'katex', OUT / 'katex')     # KaTeX ships with the site: no outside math server
    shutil.copytree(ROOT / 'static', OUT, dirs_exist_ok=True)
    build_hubs()
    for c in site['classes']:
        for e in c['exams']:
            if 'pack' in e and (PACKS / e['pack']).exists():
                p, n = build_pack(c, e)
                print(f'built {p.relative_to(OUT)} · {p.stat().st_size:,} bytes · {n} files')
            elif 'app' in e and (APPS / e['app'] / 'build_app.py').exists():
                r = subprocess.run([sys.executable, '-I', str(APPS / e['app'] / 'build_app.py'), str(OUT / c['id'] / e['id']),
                                    json.dumps({'class': c, 'exam': e})], capture_output=True, text=True)
                if r.returncode: sys.exit(f'BUILD FAILED: {e["app"]}\n{r.stdout}{r.stderr}')
                print(r.stdout.strip())
            else:
                print(f'skipped {c["id"]}/{e["id"]} (not built yet)')
    print(f'built {OUT}/index.html and {len(site["classes"])} class pages')
