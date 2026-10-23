# Contributing to Energy Sprint

Read `docs/DEV_NOTES.md` before any change; log every change in `docs/CHANGELOG.md`.

## Commands
- Build: `python3 -I build.py` → `dist/` (`index.html`, `katex/`, `favicon.svg`)
- Run locally: `python3 -m http.server -d dist 8000`, then open http://localhost:8000
  (not `file://`: browsers disable cookies there)
- Test everything: `bash tests/run_all.sh` (needs `pip install -r requirements-dev.txt`,
  `python3 -m playwright install chromium`, and `npm install` for the lint)

## Rules that must not break
- `src/` is the source of truth; `dist/` is generated. Modules are joined in file-name order into ONE
  function scope (`10_core.js` opens it, `95_boot.js` closes it).
- Never rename stored identifiers: `APP.ns` (`energy-sprint`), `APP.cookie` (`es_save`), generator ids,
  exam slot order/indices, variant ids (`SUBL` keys). Saved progress refers to them.
- All saving goes through `saveRecords()` / `persist()` in `50_store.js`; records merge by `ts`.
  A new saved field must also be added to `cleanStore()`, or it is dropped on load.
- No server, no tracking, no third-party scripts. The page's CSP allows only its own files, its own
  inline script (by hash) and Google Fonts; keep it that way.
- Color = meaning (`docs/DESIGN_SPEC.md`): `--bad` red always comes with ✕ and a text label; marigold
  only for "you are here" and figure objects.
- Minimal words on screen: prefer chips, tiles, numbers, icons; secondary info in `title` or a collapsed `<details>`.
- Question HTML numbers use `sci/fm/vec`; LaTeX helpers (`tn`, `U`) only inside `sol`; units with `·²³` go through `U()`.
- After touching generators run `t_content.py` + `t_latex.py`; after touching figures run `t_figs.py`;
  before finishing run `bash tests/run_all.sh`.
- Course AI policy: problems use fresh numbers and never solve currently assigned homework; the graded
  REC 08 Problem 1 scenario (skater/loop minimum height) is deliberately excluded. Keep it that way.
