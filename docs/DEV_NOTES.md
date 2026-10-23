# Energy Sprint · developer notes

Read this before changing anything. It is the map of the code, the rules that keep saved data
safe, and the checklist for common changes. Every change goes in `docs/CHANGELOG.md`.
Contributor rules in short: `CONTRIBUTING.md`.

The app is a static site: one HTML page plus KaTeX files, no server, no accounts. Progress is
kept in each student's own browser (cookie + localStorage, §4).

## 1. Build and test

```
python3 -I build.py                 # → dist/index.html, dist/katex/, dist/favicon.svg
python3 -m http.server -d dist 8000 # open http://localhost:8000
bash tests/run_all.sh               # build + every check (npm install first to include the lint)
```

* `dist/` is the whole site; upload it as is. `00_head.html` + `01_style.css` go in `<head>`, the rest in `<body>`.
* Open it over http, not by double-clicking: browsers disable cookies on `file://`, and the CSP
  treats `file://` differently. The tests serve `dist/` on a local port for the same reason (`tests/_serve.py`).
* `build.py` stops on duplicate element ids, ids the script uses that the markup lacks, or a script
  that does not parse. It writes a Content-Security-Policy that allows the one inline script by its
  SHA-256 hash, so any other inline script (or injected markup) cannot run.

| test | what it proves |
|---|---|
| `t_content.py` | every sprint generator (59) and exam slot: finite answers, solution shows the graded answer, one correct key, no keyed "None of these", options ≥5% apart, every exam variant classified and reachable from the drill |
| `t_latex.py` | every equation line as displayed (after given/find/result marking) renders in KaTeX strict mode |
| `t_figs.py` | 73 figure variants × light/dark: no label outside the viewBox, no overlapping labels, asked-point highlight exactly when requested; `outdir` arg saves galleries |
| `t_ui.py` | ~70 end-to-end checks: sprint, progress (synthetic data), drill, mock exam, cookie + localStorage storage, cleaning of tampered data, export/import, sprint resume, first-visit note, no CSP violations, layout at 390 px |
| `t_shots.py` | screenshots of every screen for a by-eye check (`width`, `light`/`dark` args) |

## 2. Module map (`src/`, joined in file-name order)

All `.js` modules share ONE function scope: `10_core.js` opens `(function(){`, `95_boot.js`
closes it. Order matters only for code that runs at load time (e.g. `TOPICS` reads `GEN`).

| file | owns |
|---|---|
| `00_head.html` | charset, viewport, CSP placeholder (`{{CSP}}`, filled by build.py), title + description, favicon, Google Fonts (Host Grotesk, IBM Plex Mono, STIX Two Text), KaTeX |
| `01_style.css` | the whole design system: tokens (light + warm dark), components, figures, phone layout |
| `02_body.html` | markup for every screen. Each `<section>` directly in `.wrap` is one screen; its id is the phase name |
| `10_core.js` | `APP` (storage names), `LS()`, `lsGet/Set/Del`, `cookieGet/Set`, constants `K`, random + number formatting (`sci`, `tn`, `U`), generator registry `add()` |
| `11_figs.js` | `FIG` SVG figures (see §5) |
| `12_ui.js` | `show()` + named timers, `armButton`, semantic marking (`markGivens`, `markFinal`), `solHTML`, `typeset` (KaTeX), `showFigure`, multiple-choice helpers, `lineChart` |
| `20–23_gen_*.js` | sprint generators by homework |
| `30_exam_gen.js` | `XSLOTS` (name + pace per slot), `x1…x1415` slot generators, `xTrackSet`, `xLaunchSet`, `buildExam` |
| `40_sprint.js` | sprint engine; pace constants `TARGET`, `BUDGET` |
| `50_store.js` | saved data: merge, validation (`cleanStore`), size budget, cookie codec, `saveRecords`, `clearStore`, `exportStore`/`importStore` |
| `51_progress.js` | progress page (sprint history, mock-exam history) |
| `60_exam_ui.js` | mock exam screens; in-progress exam in localStorage |
| `70_skills.js` | taxonomy (variants, traits) and analytics (`statOf`, `findPatterns`, `recommend`); no DOM |
| `71_skills_ui.js` | exam-skills section of the progress page; "by problem type" on exam results |
| `72_drill.js` | adaptive drill |
| `90_wiring.js` | every static button handler + the single keyboard dispatcher |
| `95_boot.js` | boot, sprint resume snapshot, test hook `window.EnergySprint` |

## 3. Design system: "Warm Swiss"

Swiss grid/typography on warm paper. **Color = meaning, never decoration**, and the same
color means the same thing in text, equations and figures.

| token | light | meaning |
|---|---|---|
| `--given` | #2A5DA8 | known/given quantities |
| `--find` | #B4461A | the unknown / the point the question asks about |
| `--ok` | #2B7048 | correct, final answer |
| `--bad` | #B83A3A | revisit / wrong — **always with ✕ and a text label** (CSS adds the ✕) |
| `--mari` | #E9A93A | "you are here" (current exam question) and physical objects in figures only |
| `--paper` `--ink` `--graphite` `--hair` | #F3EDE2 #1F1D1A #5E584F #D8CFBF | everything else |
| `--tblue` `--tgreen` `--trose` | tints | figure panel, correct feedback, revisit feedback |

Dark mode redefines the same tokens (warm dark ground, lighter hues). Type: Host Grotesk (UI),
IBM Plex Mono (labels, counts, timers; uppercase, .12em tracking), STIX Two Text italic (math
variables). Layout: flush-left, 7/5 split for question screens (figure in the right column from
920 px; inline below the question on phones), 1.5–2 px ink rules instead of boxes, no shadows,
96 px light numerals for question numbers, 12 px rounded rows, pill buttons.
Timers past pace or nearly out are shown **inverted (ink pill)**, never red: red means wrong.

**Words are a cost.** Screens carry no instructions or rule lists: a choice is shown as a tile, chip or
number, state as color/icon (✓ ✕, ● on-chip, marigold ring = suggested, blue bracket = shared setup),
and anything secondary goes in a tooltip (`title`) or a collapsed `<details>`. Feedback is a few words
(`Correct · 1:20`, `Answer C`). Before adding a sentence, ask whether a label, number or icon says it.

### Semantic marking (automatic; generators never call it)
* Question HTML → `markGivens()`: number+unit (`2.0 kg`, `30°`, `1.6×10<sup>−19</sup> C`) and
  `= value` become `<span class="gv">` (blue). Options are never marked (they are candidates).
* Solution LaTeX → `solHTML()`: KaTeX macros `\given{}` `\find{}` `\result{}` (classes
  `tx-given/find/result`, so dark mode works).
  * `(number)` that appears in the question, or is a constant (9.8, 10, 9×10⁹ …) → `\given`.
  * last equation line: a simple left-hand symbol (`v_f`, `\Delta U`, `W_{\text{rod}}`) → `\find`,
    everything after the last top-level `=` → `\result`. Lines with `;` or `:` are left alone;
    with `\qquad` only the last statement is marked.
  * Known limit: a computed number that happens to equal a given number is also colored blue.

## 4. Saved data (no server: everything stays in the student's browser)

```
store = { v:2, updated, runs:[run], exams:[exam], drills:[drill] }      (v1 docs load as-is)
run   = { ts, dur, bonus, scope, att, right, slow, skip, pts, time, t:{genId:[seen,right,slow,skip,secs]} }
exam  = { ts, score, right, used, timeUp, slots:[1|0|-1 ×15],            ← v1 shape, kept
          q:[{c:slot, s:variantId|null, r:1|0|-1, t:secs}] }             ← v2; absent on old exams
drill = { ts, cats:[c], q:[{c, s, r, t, at}], cleared:[c], end, reason:'cleared'|'stopped'|'' }
```

Where it lives:

| place | contents |
|---|---|
| `localStorage['energy-sprint:progress']` | the full store |
| cookie `es_save` | `{s:store, p:{bonus, best}}`, deflate-compressed + base64url (`z…`; plain JSON `j…` where `CompressionStream` is missing), trimmed to ≤ 3 800 characters (`APP.cookieMax`): newest records first, mock exams kept longest. Path = the page's folder, `SameSite=Lax`, `Secure` on https, 400-day lifetime renewed on every visit |
| `localStorage` other keys | `energy-sprint:exam` (exam in progress; the clock keeps running while closed), `:sprint` (sprint in play, resumed within 1 h), `:bonus`, `:points:<dur>:<scope>:<b\|f>` (personal bests), `:noted` (first-visit note dismissed; also cookie `es_noted`) |
| backup file | Progress → Export writes `{app:'energy-sprint', schema, exported, store, prefs}`; Import merges one back. This replaces account sync for moving between devices |

On load the localStorage copy and the cookie copy are merged record by record, then both are
written back, so either one alone restores everything it holds.

**Invariants — breaking these loses or corrupts students' history**
1. Never rename `APP.ns`, `APP.cookie`, a generator id, an exam slot index, or a variant id (`SUBL` key).
   They are stored. Add new ones; retire old ones by leaving them readable.
2. Every write goes through `saveRecords(kind, recs)` or `persist()`. Merging is by `ts`:
   exams keep the copy with `q`, drills keep the longest copy.
3. Everything read back (localStorage, cookie, imported file) goes through `cleanStore()`, which
   rebuilds each record from known fields with the right types. **A new record field must be added
   there too, or it is silently dropped on the next load.** Saved data is rendered with innerHTML,
   so this is also what keeps a tampered file or cookie from injecting markup.
4. Old records stay readable: `events()` turns a v1 exam's `slots` into category-only answers.
5. Size budget `MAXB` 200 000 chars for localStorage: `fitStore` drops old sprint detail, then old
   drills, then old runs. Mock exams are never dropped there. The cookie uses the same function with
   `deep` set, which may finally drop old exam detail and old exams.

## 5. Figures (`11_figs.js`)
Drawn from the question's own numbers; show only what the text states. Classes carry meaning:
structure `s r sp h d` (ink), objects `b ball` (marigold), given `dim a ta gl` (blue), asked
`ask ak fl fv` (rust), neutral `in vl t2 v`. Options that mark the asked thing:
`eTrack('bowl',{roll,ask:'2'})`, `eTrack('loop',{h,R,at:'C'|'D'})`, `eLaunch({…,find:'v'})`.
`t_figs.py` must pass after any figure change.

## 6. How to …

**Add a sprint generator** — `add('id','Topic',hw,()=>{…})` in the matching `2x_gen` file, returning
the shape documented above `GEN` in `10_core.js`. Numbers in `q` via `sci/fm/vec`; LaTeX via `tn/U`
only inside `sol`; units with `·`, `²`, `³` must go through `U()`. Return `null` for unusable numbers.
Run `t_content.py` and `t_latex.py`.

**Add an exam variant** — give it a distinct `chk.k` (or chk field) in its `x*` generator, then add
it to `xSub`, `SUBL` and, if it changes a trait, the tag sets in `70_skills.js`. `t_content.py`
fails until the variant is classified and reachable from the drill.

**Change pace / weights / status thresholds** — `XSLOTS[].pace` (30_exam_gen), `TARGET`/`BUDGET`
(40_sprint), `W_DRILL`, `HALF_DAYS`, `SLOW_CREDIT` and the status rules (70_skills header). Update
this file and the in-app rule text in `02_body.html`.

**Add a screen** — a `<section id="name" hidden>` inside `.wrap`; `show('name')` finds it; name any
timer after the screen (`every('name',fn,ms)`) so leaving the screen stops it; wire buttons in
`90_wiring.js`.

**Restyle** — tokens at the top of `01_style.css`; keep the color-meaning table above true.

## 7. Publishing (GitHub Pages)
`.github/workflows/pages.yml` runs `bash tests/run_all.sh` on every push to `main` and, only if it
passes, publishes `dist/` to GitHub Pages. One-time setup: repository Settings → Pages → Source:
"GitHub Actions". Any other static host works too: upload `dist/` as is. Log each release in the changelog.
