#!/usr/bin/env bash
# Build, then run every check. Exit code is non-zero if anything fails.
#   bash tests/run_all.sh            (from the project root)
# Needs: python3 + playwright (Chromium) and node. The tests serve dist/ on a local http port
# (cookies and the Content-Security-Policy need http, not file://).
# ESLint runs if `npm install` has been done (node_modules/.bin/eslint) or ESLINT_DIR points at
# a folder with eslint installed. PYTHON overrides the interpreter (e.g. a virtualenv).
set -e
cd "$(dirname "$0")/.."
PY="${PYTHON:-python3}"
"$PY" -I build.py
P=dist/phys172/exam2/index.html
"$PY" -I tests/t_content.py "$P" 300
"$PY" -I tests/t_latex.py   "$P" 80
"$PY" -I tests/t_figs.py    "$P"
"$PY" -I tests/t_ui.py      "$P"
JOINED="$(mktemp -d)/joined.js"
cat src/*.js > "$JOINED"
if [ -x node_modules/.bin/eslint ]; then
  node_modules/.bin/eslint --no-eslintrc -c tests/eslint.config.json --global katex "$JOINED"
elif [ -n "$ESLINT_DIR" ]; then
  (cd "$ESLINT_DIR" && npx eslint --no-eslintrc -c "$OLDPWD/tests/eslint.config.json" --global katex "$JOINED")
else
  echo "lint skipped (run npm install to enable)"
fi
echo "ALL CHECKS PASSED"
