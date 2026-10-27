#!/usr/bin/env bash
# Build the whole site, then run every check. Exit code is non-zero if anything fails.
#   bash tests/run_all.sh            (from the project root)
# Needs: python3 + playwright (Chromium) and node. The tests serve dist/ on a local http port
# (cookies and the Content-Security-Policy need http, not file://). t_ma261.py also needs the
# network for MathJax (cdnjs). ESLint runs if `npm install` has been done (node_modules/.bin/eslint)
# or ESLINT_DIR points at a folder with eslint installed. PYTHON overrides the interpreter.
set -e
cd "$(dirname "$0")/.."
PY="${PYTHON:-python3}"
"$PY" -I build.py
E2=dist/phys172/exam2/index.html; E1=dist/phys172/exam1/index.html; M1=dist/ma261/exam1/index.html; M2=dist/ma261/exam2/index.html
echo "=== PHYS 172 Exam 2"
"$PY" -I tests/t_content.py "$E2" 300
"$PY" -I tests/t_latex.py   "$E2" 80
"$PY" -I tests/t_figs.py    "$E2"
"$PY" -I tests/t_ui.py      "$E2"
"$PY" -I tests/t_smoke.py   "$E2"
echo "=== PHYS 172 Exam 1"
"$PY" -I tests/t_content.py "$E1" 300
"$PY" -I tests/t_latex.py   "$E1" 60
"$PY" -I tests/t_smoke.py   "$E1"
echo "=== MA 261 Exam 1"
"$PY" -I tests/t_ma261.py   "$M1"
echo "=== MA 261 Exam 2"
node apps/ma261-exam2/tests/dump.js 150 "${MA261_SAMPLES:-4}" && "$PY" -I apps/ma261-exam2/tests/check.py --jobs 4     # sympy re-solve, 4 samples per id (MA261_SAMPLES=12 for the full run)
"$PY" -I tests/t_ma261e2.py "$M2"
echo "=== lint (engine + each pack, joined as the build joins them)"
LINT=()
if [ -x node_modules/.bin/eslint ]; then LINT=(node_modules/.bin/eslint); elif [ -n "$ESLINT_DIR" ]; then LINT=(npx --prefix "$ESLINT_DIR" eslint); fi
if [ ${#LINT[@]} -gt 0 ]; then
  for pack in packs/*/; do
    JOINED="$(mktemp -d)/$(basename "$pack").js"
    "$PY" -I -c "import pathlib,sys; s={p.name:p for p in pathlib.Path('src').glob('*.js')}; s.update({p.name:p for p in pathlib.Path(sys.argv[1]).glob('*.js')}); open(sys.argv[2],'w').write(''.join(s[n].read_text() for n in sorted(s)))" "$pack" "$JOINED"
    "${LINT[@]}" --no-eslintrc -c tests/eslint.config.json --global katex "$JOINED"     # set -e: a lint error stops here
    echo "lint ok: $pack"
  done
else
  echo "lint skipped (run npm install to enable)"
fi
echo "ALL CHECKS PASSED"
