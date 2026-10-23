# Energy Sprint · changelog

Newest first. Every published change gets an entry: what changed, why, and how it was checked.

## v3.2 · 2026-10-23 · public static site
* **Storage without accounts.** Account sync is gone; progress stays in the student's browser.
  The full history is in localStorage, and a compressed copy (newest records first, mock exams kept
  longest, plus the time-bonus setting and personal bests) is kept in one cookie (`es_save`, ≤ 3.8 KB,
  scoped to the site's folder, 400-day lifetime renewed on each visit). On load the two copies are
  merged, so either one alone restores what it holds.
* **Export / Import** on the progress page: a JSON backup file, the way to move progress to another
  browser or device. Imports merge record by record; other files are refused.
* **Saved data is validated.** `cleanStore()` rebuilds every record read from storage, the cookie or
  a file from known fields with the right types (it is rendered on screen).
* **Sprint resume.** A sprint in play is saved when the page is hidden or closed and resumes on the
  next visit within an hour.
* **Hosting.** The build writes `dist/index.html` (standards mode, viewport, description, favicon)
  with a Content-Security-Policy that allows only the page's own inline script (by hash), its own files,
  and Google Fonts. A GitHub Actions workflow tests and deploys `dist/` to GitHub Pages.
* First-visit note on how progress is kept; footer: unofficial, not affiliated with the course or university.
* Tests run against a local http server (cookies and CSP need http); the account-sync tests are
  replaced by storage tests; the progress fixture is synthetic.
* Checked: full suite (59 generators × 300 + 150 exams, 10 180 KaTeX lines, 73 figures × 2 themes,
  ~70 UI checks, ESLint) passes.

## v3.1 · 2026-10-22 · fewer words, more visual language
* Start screen: four mode tiles with icons (Sprint, Mock exam, Drill, Progress) replace the hero text and the
  8-item rule list; sprint settings are chips only (duration, + Time bonus, topic chips with ● when on).
* Sprint: visible **Skip** button; answer-box placeholder shows the number format; overtime shown on the clock.
* Mock exam intro: four big numbers (15 · 70:00 · 240 · g 10) and a question map where linked sets are
  bracketed; no paragraphs. Exam results drop the duplicate question-by-question table.
* Drill picker: chips only; suggested types ringed in marigold (reason on hover); standing shown on each chip.
* Feedback copy cut to a few words (`Correct · 1:20 · over pace`, `Answer C`, `+20 pts · +3:10 clock`).
* Progress: one-line rows per type (name · standing · bar · exams/drills), pattern cards = title + stat +
  question chips, weak spots grouped by topic (top 5, key idea on hover), sync status as an icon line.
* Removed explainer elements and their code (pace paragraph, difficulty table, projection footnote, drill notes,
  legacy-exam note, skills explainer); unused helpers removed.
* Checked: full suite (content, KaTeX, figures, 49 UI checks, lint) passes; screens reviewed at 1280 light and 390 dark.

## v3 · 2026-10-22 · audit, restructure, "Warm Swiss" redesign

### Bugs fixed
| # | bug | effect for the student | fix |
|---|---|---|---|
| 1 | The drill screen and the sprint "drill these concepts" button shared the id `drill` | Opening the progress page (with any sprint misses saved) overwrote the whole drill screen with the button's label, and a click inside a drill could start a sprint | Button renamed `sprintWeak` ("Sprint on these concepts"); `build.py` now refuses duplicate ids |
| 2 | Sprint `makeQ` read `.ans` of a generator result without checking for `null` | The sprint froze, sometimes on the first question (`ep-two` returns null 43% of the time) | `rollGen()` treats null or a thrown error as "roll again" |
| 3 | Time-bonus setting saved under `energy-sprint:bonus`, read back from `momentum-sprint:bonus` | Turning the bonus off never stuck after a reload | One `LS()` helper names every key |
| 4 | Enter on a focused "Next" button fired both the button and the keyboard handler | Skipped a drill question | Keyboard dispatcher leaves Enter to focused buttons |
| 5 | Drill suggestions computed before saved progress had loaded were never refreshed | First suggestions could ignore your history | Picker redraws after load unless you already changed the selection |
| 6 | `fitStore` ignored drills | Drills could crowd out sprint history, or push the document past its size limit | Drops old sprint detail → old drills → old runs; exams kept |
| 7 | Account merge replaced memory with the local copy | A record saved while the account was loading could be lost | Merge memory + local + account record by record |
| 8 | Reloading the page mid-sprint in overtime dropped the run | Lost a finished run | Resume any sprint that was in play |
| 9 | "Begin exam" silently discarded an exam in progress | Lost exam | Asks for a second tap |
| 10 | Raw `·` inside `\text{kg·m/s}` (fan cart) and `\text{kg·m}^2` (rotational KE) | Equation error under KaTeX | Units go through `U()` |
| 11 | Figure labels: "moving counterclockwise" overlapped point A; staggered r labels could leave the frame; the μk label crossed the ramp edge; rolling-ball caption touched the asked point | Hard-to-read figures | Moved; `t_figs.py` checks every variant |
| 12 | `ds-terminal` paired masses and speeds at random (a 70 kg "coffee filter" at 1.2 m/s); `rot-up` printed a LaTeX-formatted number in question text | Odd or garbled questions | Fixed pairs; `sci()` for question text (tests now flag LaTeX in question HTML) |

### Restructure (internals behave the same)
* One 3 000-line file → 21 modules in `src/` + `build.py` (byte-identical build verified before any edit).
* Consolidated: storage keys (`APP`, `LS`), one generic `mergeBy`, `saveRecords`/`clearStore`;
  `XSLOTS` now carries each slot's pace (was a separate array); shared linked-set builders
  `xTrackSet`/`xLaunchSet` for the exam and the drill; shared multiple-choice helpers; all static
  wiring and one keyboard dispatcher in `90_wiring.js`; named screen timers that stop on leaving
  a screen; screens found from the markup instead of a hard-coded list.
* Removed dead code (`AX`, `plain`, unused physics helpers, `dPrimary`, `XGROUPS`, `XS_`/`XC_`,
  unused figure helpers and variables). ESLint `no-undef`/`no-unused-vars` clean.
* Test hook renamed `window.EnergySprint`.

### Redesign: "Warm Swiss"
* Paper/ink palette with semantic color (given blue, find rust, correct green, revisit red with ✕
  and label, marigold for "you are here" and objects); warm dark mode with the same meanings.
* Host Grotesk / IBM Plex Mono / STIX Two Text; flush-left 7/5 question layout with the figure in
  a tinted, dotted panel on the right; 96 px light question numerals; ink rules instead of boxes;
  pill buttons; rounded answer rows with "✓ Answer" / "✕ Your pick"; friendly feedback copy.
* Math moved from MathJax (CDN) to KaTeX 0.16.11 shipped with the page (`katex/`), with
  `\given` `\find` `\result` macros; givens in question text are marked automatically.
* Figures: ink outlines, marigold objects, blue given dimensions, rust ring on the asked point.

### Checked
`bash tests/run_all.sh` → build ok · 59 generators × 300 + 150 exams ok · 10 171 equation lines
render in KaTeX strict mode · 73 figures × 2 themes with no clipped/overlapping labels · 49 UI
checks · ESLint clean. Screens reviewed by eye at 1280 px light and 390 px dark.

## v2 · 2026-10-22 · exam skills + adaptive drill
Problem-type tracking for mock exams (category, variant, traits), exam-weighted mastery,
patterns after each exam, and the untimed adaptive drill. Exams saved before v2 stay readable at
category level (they predate variant tracking).

## v1 · 2026-10-17 · first release
Sprint (HW11–HW15), progress tracking with account sync, Mock Exam 2.
