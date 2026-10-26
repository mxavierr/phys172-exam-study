# BoilerCram

Free exam practice for Purdue classes that runs in your browser. Pick a class, then an exam:

| class | exam | modes |
|---|---|---|
| **PHYS 172** | Exam 1 (HW01–HW10), Exam 2 (HW11–HW15) | Sprint · Mock exam (15 Q, 60 min) · Drill · Progress |
| **MA 261** | Exam 1 (12.1, Ch 13–15) | Mock exam (12 Q, 60 min) · the real Fall 2026 exam · Diagnostic · Sprint · Quadric surfaces · Progress |

Every mock exam is timed like the real one (60 minutes). Problems use fresh numbers every time, every wrong
choice in a mock exam is a common trap with an explanation, and every miss has a worked solution.

## Privacy: where your progress is kept
There are no accounts and no server, and nothing is tracked. Your progress stays in **your browser**:

- **localStorage** holds the full history.
- **One cookie** (`es_save`, under 4 KB) holds a compressed copy of your newest records, your time-bonus setting, and your personal bests. It lasts 400 days and renews each visit. It is scoped to this site's folder and only ever goes back to this site, which ignores it.

Closing the tab or browser keeps your progress. Clearing your browsing data, or using a private window, does not keep it. To move progress to another device or browser, use **Progress → Export** there and **Import** on the other one.

## Run it locally
```
python3 -I build.py                     # → dist/ (the whole site)
python3 -m http.server -d dist 8000     # open http://localhost:8000
```
Open it over http rather than double-clicking the file, because browsers turn off cookies for `file://` pages.

## Develop
```
pip install -r requirements-dev.txt && python3 -m playwright install chromium
npm install                             # ESLint + KaTeX (lint / refreshing vendor/katex)
bash tests/run_all.sh                   # build + every check
```
| path | contents |
|---|---|
| `site/site.json` | the site map: classes, their exams, and what builds each exam page |
| `src/` | the shared engine for the PHYS pages, one file per module (map in `docs/DEV_NOTES.md` §2) |
| `packs/<exam>/` | one exam's content for that engine: generators, figures, mock exam, taxonomy, `pack.json` labels |
| `apps/ma261-exam1/` | the MA 261 page, which has its own engine (`build_app.py`, `theme.css`, `src/`) |
| `build.py` | builds the class picker, the exam pickers and every exam page into `dist/`, each with a Content-Security-Policy |
| `static/` | files copied into the site as is (favicon) |
| `vendor/katex/` | KaTeX 0.16.11 (MIT license, see `vendor/katex/LICENSE.txt`) shipped with the page |
| `tests/` | content, LaTeX, figure, UI, storage and MA 261 tests for every page; `run_all.sh` |
| `docs/` | `DEV_NOTES.md` (architecture, saved-data rules), `CHANGELOG.md`, `DESIGN_SPEC.md` |
| `.github/workflows/pages.yml` | tests every push and pull request; only a push to `main` deploys `dist/` to GitHub Pages |

See `CONTRIBUTING.md` for the rules that keep saved progress safe.

## Course policy
The problems use fresh numbers and never solve homework that is currently assigned. The graded REC 08 Problem 1 scenario is deliberately left out.
