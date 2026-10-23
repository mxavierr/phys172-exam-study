"""Build Energy Sprint: join src/* in file-name order into one self-contained web page.

  python3 -I build.py [outdir]          (default: dist/)

Output (everything a static host such as GitHub Pages needs; upload the folder as is):
  index.html   the app: standards-mode page with a Content-Security-Policy
  katex/       KaTeX 0.16.11 script, stylesheet, woff2 fonts (from vendor/katex/)
  favicon.svg  and anything else in static/

The numeric prefixes ARE the load order (00 head, 01 css, 02 markup, 10..95 script, 99 close).
00_head.html and 01_style.css go in <head>; the rest in <body>.
All .js modules share one function scope: 10_core.js opens it, 95_boot.js closes it.
Checks run on every build and stop it on failure:
  - duplicate element ids in the markup (two elements with one id broke the drill once)
  - every $('id') / on('id') used by the script exists in the markup (or is created at runtime)
  - the joined script parses (node --check)
The inline script is allowed by its SHA-256 hash in the CSP, so no other inline script can run.
"""
import base64, hashlib, pathlib, re, shutil, subprocess, sys, tempfile
ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
RUNTIME_IDS = {'xres', 'xdis'}          # created by xBoot() at runtime
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'dist'

parts = sorted(p for p in SRC.iterdir() if p.suffix in ('.html', '.css', '.js'))
text = {p.name: p.read_text() for p in parts}
head = ''.join(t for n, t in text.items() if n[:2] in ('00', '01'))
body = ''.join(t for n, t in text.items() if n[:2] not in ('00', '01'))
script = ''.join(t for n, t in text.items() if n.endswith('.js'))
markup = ''.join(t for n, t in text.items() if n.endswith('.html'))

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

# the one inline script = everything between the last <script> and </script> of the body
m = re.search(r'<script>(.*)</script>\s*$', body, re.S)
if not m or body.count('<script>') != 1: errors.append('expected exactly one inline <script> in the body')
if '{{CSP}}' not in head: errors.append('00_head.html lost its {{CSP}} placeholder')
if errors:
    print('BUILD FAILED'); [print(' -', e) for e in errors]; sys.exit(1)

sha = base64.b64encode(hashlib.sha256(m.group(1).encode('utf-8')).digest()).decode()
CSP = '; '.join([
    "default-src 'none'",
    f"script-src 'self' 'sha256-{sha}'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",   # KaTeX and the figures set inline styles
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
])
page = ('<!doctype html>\n<html lang="en">\n<head>\n' + head.replace('{{CSP}}', CSP) +
        '</head>\n<body>\n' + body + '</body>\n</html>\n')

out.mkdir(parents=True, exist_ok=True)
(out / 'index.html').write_text(page)
# KaTeX ships WITH the page, so equations render without any outside server
shutil.copytree(ROOT / 'vendor' / 'katex', out / 'katex', dirs_exist_ok=True)
shutil.copytree(ROOT / 'static', out, dirs_exist_ok=True)
print(f'built {out / "index.html"} · {len(page):,} bytes · {len(parts)} modules · {len(set(ids))} ids')
