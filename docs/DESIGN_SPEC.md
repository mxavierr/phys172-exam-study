# Design spec: "Warm Swiss"

Implementation: `src/01_style.css` (tokens at the top) and the semantic-marking code in `src/12_ui.js`.
See DEV_NOTES §3.

```
STYLE: "Warm Swiss" — Swiss grid/typography + warm paper surface + semantic color.

COLOR = MEANING, never decoration. Same color in text, equations, and figures.
  Given/known  #2A5DA8   Find/unknown #B4461A   Correct #2B7048
  Revisit/wrong #B83A3A (always with ✕ icon + text label)
  Paper #F3EDE2  Ink #1F1D1A  Graphite #5E584F  Hairline #D8CFBF
  Marigold #E9A93A = "you are here" marker / objects in figures only
  Tints for panels/feedback: blue #DCE6F2, green #D8E8DA, rose #F2D9D2
Keep saturation muted; most of the screen is paper + ink.

TYPE: Host Grotesk (UI), IBM Plex Mono (labels, counts, timers; uppercase,
0.12em tracking), STIX Two Text italic for math variables.

LAYOUT: flush-left, asymmetric grid (7/5 split), 1.5–2px ink rules instead
of boxes, no shadows, big light-weight numerals for question numbers.
WARMTH: rounded 12px rows, pill buttons, tinted figure panels with a faint
halftone dot texture, friendly feedback copy.

MATH: render with KaTeX. Define macros \given{}, \find{}, \result{} mapped
to the colors above so equations match diagrams.
DIAGRAMS: flat SVG, ink outlines, one tinted panel, color only on the
quantities the question asks about.
```

Follow-up direction (v3.1): screens carry minimal words. Remove anything obvious;
express the rest visually (tiles, chips, numbers, icons, color); any text present must be important.
