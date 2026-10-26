# QA — Malaysia CPI, September 2026

**Built**: 2026-10-27
**Page**: `reports/malaysia-cpi/`
**Video**: `raw/malaysia-cpi/video/out.mp4`
**Gate**: 4

---

## 1. Every figure diffed against the source

`numbers.csv` holds one row per figure the page uses. Each row was recomputed from
`source.json`, which holds the rows the DOSM open API returned, and the two were diffed.
`source.json` is a trimmed copy of the fetched rows; `meta.trim` records what was cut and why.

```
figures checked : 115
match           : 115
mismatch        : 0
not recomputed  : 0
```

The recompute is a script, not a reading. It re-derives each figure from the published rows
and compares to the CSV, so a typo in either place fails the gate.

| Figure on page | Value | Recomputed from | Match |
|---|---|---|---|
| Headline inflation, Sept 2026 | 1.8% | `cpi_headline_inflation` overall `inflation_yoy` | yes |
| Headline inflation, Aug 2026 | 1.9% | same, one month back | yes |
| Index, Sept 2026 | 137.6 | `cpi_headline` overall `index` | yes |
| Index, Sept 2025 | 135.2 | same, one year back | yes |
| Index, Jan 2010 | 99.4 | same, first month of the base year | yes |
| Above 2010 | 37.6 points | 137.6 − 100 | yes |
| One year of the climb | 2.4 points | 137.6 − 135.2 | yes |
| One year as a share of the climb | 6.4% | 2.4 / 37.6 | yes |
| Transport, Sept | 2.5% | `cpi_headline_inflation` division 07 | yes |
| Transport, Aug | 2.0% | same, one month back | yes |
| Housing, Sept / Aug | 1.4% / 2.1% | division 04 | yes |
| Information and communication, Sept / Aug | 1.8% / 2.6% | division 08 | yes |
| Biggest one-month moves | −0.8, −0.7, +0.5 | Sept yoy minus Aug yoy, divisions 08, 04, 07 | yes |
| All thirteen division rates | 2.8 down to 0.2 | divisions 13 to 03 | yes |
| Core inflation, Sept | 1.7% | `cpi_core_inflation` overall | yes |
| Core inflation, Dec 2025 | 2.3% | same, nine months back | yes |
| RON95 market average, Sept 2026 | RM4.183 | mean of the weekly `ron95` market rows in the month | yes |
| RON95 market average, Dec 2025 | RM2.62 | mean of the weekly rows in that month | yes |
| RON95 rise since December | +59.7% | 4.183 / 2.62 | yes |
| Subsidised RON95 | RM2.05 | mean of the weekly `ron95_skps` rows | yes |
| BUDI 95 | RM1.99 | mean of the weekly `ron95_budi95` rows | yes |
| Market minus subsidised | RM2.13 | 4.183 − 2.05 | yes |
| Latest weekly row, 22 Oct 2026 | RM4.32 / RM4.80 / RM5.07 | last `fuelprice` row, market RON95, RON97, diesel | yes |
| Lowest state, Sarawak | 0.5% | `cpi_state_inflation` | yes |
| Highest states, N. Sembilan and Labuan | 2.4% | same | yes |
| States above the national rate | 8 | count above the published 1.8% headline | yes |
| Urban transport | 2.75% | `cpi_strata` urban division 07, index rows | yes |
| Rural transport | 1.35% | `cpi_strata` rural division 07, index rows | yes |
| Urban overall / rural overall | 1.76% / 1.54% | `cpi_strata` overall, index rows | yes |
| Urban food / rural food | 1.85% / 1.59% | `cpi_strata` division 01, index rows | yes |
| Low-income basket | 1.48% | `cpi_lowincome` overall, index rows | yes |
| National, index-derived | 1.78% | `cpi_headline` overall, index rows | yes |
| Transport gap, urban minus rural | 1.40 points | 2.75 − 1.35 | yes |
| Overall gap, urban minus rural | 0.22 points | 1.76 − 1.54 | yes |
| Fuel window | 56 weeks | weekly `level` rows from 30 Sep 2025 to 22 Oct 2026 | yes |

### The reverse check

Figures can fail in two directions. The diff above catches a figure that is on the page and
wrong. The reverse check catches a figure on the page that is not in `numbers.csv` at all,
which would be a number nobody can trace.

Every numeric token in the rendered page text was matched against `numbers.csv`, allowing for
the ways a number is written in prose: `1.8`, `1.8%`, `RM4.18`, `4.183` rounding to `4.18`,
and a signed value written as its magnitude in words ("down 0.8 points" for −0.8).

Three figures on the page had no row in `numbers.csv`: the 1.40 point transport gap, the 0.22
point overall gap, and the national 1.78%. All three are now registered and recomputed by the
verifier. The wording in the method note was also wrong: it said "these three figures are
computed" about a set of nine, and it did not cover the national 1.78%, which is index-derived
like the others. It now says so.

What is left on the page and is not a data claim: the index axis ticks 110, 120 and 130; the
inflation axis tick 1.0; the date fragments in the 36 month axis; and `4.0` in the licence line.

### Three claims corrected during QA

1. **"Core is the same basket without fuel."** Wrong. DOSM's definition removes items with
   volatile prices *and* items with government-administered prices. Corrected in `story.md`,
   `sections.md`, the page and the voice-over script.
2. **"The RON95 market price is up 59.7%."** True but needs its start date. The market price
   only exists from 30 September 2025; before that RON95 was fixed at RM2.05. Every "how much
   it has risen" figure now starts from December 2025.
3. **"Housing fell 0.7 points."** True, but the same page also said transport rose 0.5 points
   while the table showed a larger move elsewhere. The three biggest one-month moves are now
   named in the order of their size, and the direction is in the sentence rather than in the
   reader's head.

---

## 2. Screenshots

All in `qa/`.

| File | What it shows |
|---|---|
| `page-desktop.png` | the whole page at 1440 wide, full height |
| `page-phone-390.png` | the whole page at 390 wide, device scale 2 |
| `page-nojs.png` | the whole page with JavaScript disabled |
| `page-text.txt` | the rendered text, the input to the reverse check |

---

## 3. Render checks

- **Scene timing**: each scene was played and timed in the browser. All six finish at
  1010–1017 ms against a declared duration of 1000 ms.
  `column 1010`, `ladder 1015`, `path 1017`, `drum 1017`, `dots 1015`, `split 1017`.
- **Console**: no page errors and no console errors on desktop or on the phone viewport.
- **No JavaScript**: `html.no-js` hides each canvas and shows a data table instead. Every claim
  and every number is still on the page as HTML. Verified in `qa/page-nojs.png`.
- **Reduced motion**: `prefers-reduced-motion: reduce` skips playback, renders every scene at
  `t = 1`, drops the finger indicator and labels each figure "Still frame".
- **Keyboard**: each figure wrapper is `role="button"` with `tabindex="0"` and an `aria-label`
  naming its claim. Enter and Space play it.
- **Click indicator**: a finger over the first figure until the reader clicks any chart once,
  remembered in `localStorage` as `mc-taught`. Coarse pointers get "Tap" instead of "Click".

### The failure mode worth knowing

Six WebGL contexts on one page is enough for Chromium to drop some of them. The first render
came back with blank storyboard frames and `CONTEXT_LOST_WEBGL` in the console. The capture
tool now waits for `!gl.isContextLost()` before it shoots, and the scene listens for
`webglcontextrestored` and redraws. Do not remove either. A page with this many canvases needs
both the guard at capture time and the recovery at runtime.

---

## 4. Weight

| Asset | Raw | Gzip |
|---|---|---|
| `index.html` | 27.3 KB | 8.3 KB |
| `scene.js` | 29.7 KB | 9.6 KB |
| `data.json` | 21.4 KB | 3.0 KB |
| **Total, first load** | | **~21 KB** |

`data.json` carries every figure the page can show, which is why it is larger than the wages
report's. It is fetched once and reused by all six scenes.

Fonts are the only other request: Space Grotesk, IBM Plex Sans and IBM Plex Mono from Google
Fonts, with `preconnect` set. Display text is not blocked on them.

---

## 5. The video

| Property | Value |
|---|---|
| Length | 59.26 seconds |
| Frame | 1080 x 1920, portrait, 30 fps |
| Video codec | H.264 |
| Audio | AAC, mono, 24 kHz |
| Size | 2,474,493 bytes |
| Bit rate | 334 kbps |
| Speech total | 55.36 seconds across seven lines |

The voice-over sets the shot lengths. Line durations are `[9.755, 8.827, 7.018, 9.162, 8.623,
9.674, 2.300]` and each shot holds its scene for exactly its own line, with a 0.4 second gap
between shots. The last line is the 2.3 second end card.

Audio was profiled for level per window: every line sits inside its own shot and every gap
between shots is digital silence. There is no bleed across a cut.

Two things had to be fixed to get here. The first script ran 38 words per line, which produced
13.7 second lines and 79 seconds of speech. Lines are now 21 to 25 words, which is 7 to 10
seconds each. And the first attempt at per-channel silence used an ffmpeg `adelay` list longer
than the channel count, which ffmpeg rejects; mono takes a single delay.

---

## 6. Known gaps

- The ladder scene draws thirteen division rates with their August ticks. The month-on-month
  column in the fallback table is not drawn in 3D, so those figures are read from the table.
- The 36 month path scene draws the headline and core lines, but the band rails are labelled
  rather than drawn as filled area. The label is on the frame.
- `?dur=<ms>` and `?only=` are capture helpers left in the page. They are inert without the
  query string, and the canonical tag points at the clean URL.
- The video is local and is not tracked in git. The file is rebuilt from `shots.json`,
  `vo/script.txt` and `vo/dur.json` in about three minutes.
