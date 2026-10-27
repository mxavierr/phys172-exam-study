# Energy Sprint · changelog

Newest first. Every published change gets an entry: what changed, why, and how it was checked.

## v4.1 · 2026-10-26 · MA 261 Exam 2
* **New page `/ma261/exam2/`** (15.8, 16.1–16.6, 17.1–17.6 part 1, per the F26 calendar: Lessons 17–31), on the MA 261 engine.
* **Content: 91 problem builders** written from the textbook exercise sets (16.1–17.6 index) and the 2015–2025 Exam 2 archive
  (17 exams read; every template names the archive questions it models). One builder serves both the sprint (typed or choice)
  and the mock exam, so a fix lands everywhere. Exam level adds this term's twists: "which set-up is NOT equal", regions that
  split into two integrals, off-centre circles and spheres, non-conservative look-alikes with an "impossible" key, regions with
  holes, open curves closed for Green, vortex field, density that moves the center of mass.
* **Mock exam: six choices (A–F)** like the Fall 2026 exams (G flags), 60 minutes, blueprint from the archive: Lagrange 1,
  Ch 16 six to eight (triple integrals ≈ 4 of 12), Ch 17 three to five.
* **Drill** (exam templates by topic, feedback after each answer, ends when each topic is cleared) and a **study sheet**.
* Diagnostic concept map rebuilt for Exam 2 (34 concepts); true/false banks for Ch 16–17. Quadric trainer and the real
  Exam 1 removed from this page. Storage namespace `ma261-e2`, cookie `m261e2_save` (Exam 1 progress untouched).
* Display: `tidy()` prints c·(expr) answers as one fraction, only when the value is unchanged.
* Checked: `apps/ma261-exam2/tests/dump.js` (176 ids × 300 runs: 0 structural errors) + `check.py`, an independent sympy
  re-solve from each problem's raw set-up (2,112 samples: 1,992 pass, 0 fail, 120 concept items skipped; 0 answer-string
  conversion mismatches; 1,951 / 1,951 planted wrong keys caught). Set-up questions are checked with a test factor that depends
  on θ, r and z, so two different set-ups cannot pass by integrating to the same number. `tests/t_ma261e2.py` passes (534–712
  rendered questions typeset by MathJax with no error, mock exam, drill, sheet, cookie restore, 390 px). Exam 1 test still passes.
* Build: `build_app.py` now refuses duplicate ids (a clash between the drill screen and a progress button was caught this way).

## v4.0 · 2026-10-25 · more classes: class picker, PHYS 172 Exam 1, MA 261 Exam 1
* **Site map** (`site/site.json`): the home page is a class picker; each class has an exam picker; each exam
  has its own page with the start screen of before. The header logo goes to all classes and a breadcrumb
  (course / exam) leads back. Exam 2 moved to `/phys172/exam2/`; its stored names are unchanged, so progress carries over.
* **Engine and packs.** Everything exam-specific moved out of `src/` into `packs/<exam>/` (generators, figures,
  mock exam, taxonomy, constants, topic groups) plus `pack.json` for labels; `build.py` joins engine + pack per page.
* **PHYS 172 Exam 1** (HW01–HW10) as a pack: 96 sprint generators, figures, the 15-question mock exam at 60 minutes
  (the earlier version ran longer), per-slot pace, every variant tagged so the drill and skills work.
* **MA 261 Exam 1** (`apps/ma261-exam1/`, its own engine): sprint (typed or choice), mock exam, diagnostic, quadric
  trainer, progress, restyled with the shared header, tiles, welcome and tooltips. Mock exam and diagnostic at 1x
  (60 minutes, 5:00 a question). A **"Harder this term"** note on the exam intro. **The Fall 2026
  Midterm 1 (Version A)** to redo: 12 questions as printed, choices A–F, worked solutions; results join progress.
  Removed from the personal version: account sync, the AI analyst and AI answer key, phone photos and zip export.
  Progress: localStorage + a compressed cookie copy (`m261_save`).
* Inline math: braced subscripts with spaces (`F_{A on B}`), formulas before an unclosed parenthesis.
* CI tests every branch and pull request; only `main` deploys.
* Checked: Exam 2 full suite; Exam 1 content (96 generators × 300 + 150 exams), 14 376 KaTeX lines, smoke test;
  MA 261 end-to-end (34 checks incl. the real exam's key, A–F keys, MathJax on every solution, cookie restore, 390 px).

## v3.4 · 2026-10-23 · BoilerCram, 60-minute mock exam, welcome
* Renamed **BoilerCram** (title, header, install name, export file name). Stored names unchanged.
* **Mock exam is 60 minutes** (`XMIN`), matching the real exam. Per-question pace targets (≈ 50 min in
  total) are unchanged. An exam already in progress keeps the deadline it started with.
* **First-visit welcome** (`<dialog id="welcome">`): one line per mode, Mock exam first with a
  "Start here" badge, and where progress is kept. It replaces the separate storage note. Remembered in
  localStorage `energy-sprint:welcome` and cookie `es_welcome`.
* After the welcome, the **Mock exam tile wears a marigold "Start here" ring** until it is opened
  (`energy-sprint:examhint`); never shown to someone who already has a mock exam saved.
* Checked: full suite passes, with new checks for the welcome, its memory, and the ring.

## v3.3 · 2026-10-23 · CRAMM: new name, logo, tooltips, math in sentences
* Renamed **CRAMM** (page title, header, install name). Stored names (`energy-sprint` keys, `es_save`
  cookie) are unchanged, so everyone's saved progress carries over.
* New "Dot Grid B" logo in the header, and it is the **home button** from any screen. A sprint in play
  ends and is saved (as Esc does), and a mock exam in progress is kept and offered for resume. New
  favicon, Apple touch icon, install icons and `site.webmanifest` from the same kit.
* Header: large name next to the logo; "PHYS 172 · Module 2" moved to a small label on the right.
* Footer text removed.
* **Hover explanations** (`13_tips.js`): one shared tooltip for every button, chip, timer, status chip
  and key number, on mouse hover or keyboard focus. Existing `title` hints use it too.
* **Math inside sentences** (`mathText` in `12_ui.js`): key ideas, "why it's tempting" lines, the
  progress table and tooltips render their formulas with KaTeX inline (`K_f` shows as K with subscript f,
  `½mv²` as a fraction), instead of showing raw `_`.
* Checked: full suite passes; `t_latex.py` now also renders every key idea and trap explanation (~420)
  with 0 raw underscores or KaTeX errors; new UI checks for the header, the home button and tooltips.

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
