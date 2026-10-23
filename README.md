# Energy Sprint

Free practice for **PHYS 172 Module 2** (HW11–HW15, Exam 2) that runs in your browser.

| mode | what it does |
|---|---|
| **Sprint** | Timed typed-answer recall (3 / 5 / 10 min). 59 problem generators with fresh numbers every time, difficulty scoring, an optional time bonus, and step-by-step solutions for every miss. |
| **Mock exam** | 15 multiple-choice questions, 70 minutes, in the Exam 2 order. Every wrong option is a common trap, explained in the review. You can resume after a reload. |
| **Drill** | Untimed and adaptive. It suggests the problem types you miss and ends when each one is cleared. |
| **Progress** | Exam-weighted skill standing, weak spots, patterns, and the history of every sprint, exam, and drill. |

*Unofficial study tool. Not affiliated with or endorsed by the course or the university.*

## Privacy: where your progress is kept
There are no accounts and no server, and nothing is tracked. Your progress stays in **your browser**:

- **localStorage** holds the full history.
- **One cookie** (`es_save`, under 4 KB) holds a compressed copy of your newest records, your time-bonus setting, and your personal bests. It lasts 400 days and renews each visit. It is scoped to this site's folder and only ever goes back to this site, which ignores it.

Closing the tab or browser keeps your progress. Clearing your browsing data, or using a private window, does not keep it. To move progress to another device or browser, use **Progress → Export** there and **Import** on the other one.

## Run it locally
```
python3 -I build.py                     # → dist/
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
| `src/` | the app, one file per module (map in `docs/DEV_NOTES.md` §2) |
| `build.py` | joins `src/` → `dist/index.html` with a Content-Security-Policy, and copies KaTeX and `static/` |
| `static/` | files copied into the site as is (favicon) |
| `vendor/katex/` | KaTeX 0.16.11 (MIT license, see `vendor/katex/LICENSE.txt`) shipped with the page |
| `tests/` | content, LaTeX, figure, end-to-end UI and storage tests; `run_all.sh` |
| `docs/` | `DEV_NOTES.md` (architecture, saved-data rules), `CHANGELOG.md`, `DESIGN_SPEC.md` |
| `.github/workflows/pages.yml` | tests, then deploys `dist/` to GitHub Pages on every push to `main` |

See `CONTRIBUTING.md` for the rules that keep saved progress safe.

## Course policy
The problems use fresh numbers and never solve homework that is currently assigned. The graded REC 08 Problem 1 scenario is deliberately left out.
