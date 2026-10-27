# QA — Malaysia CPI, September 2026

**Built**: 2026-10-27, rebuilt the same day three times: after the palette, after the type went
behind the chart, and after the film was re-cut around the five beats
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

## 2. The palette

The palette was wrong on the first build and was redone. The first one reused the wages
report's warm cream (`#f3f0e9` against `#f6f2ea`), which `playbook/pipeline.md` forbids in as
many words: *"A page about household money and a page about road deaths should not share a
palette."* On a phone, scrolling from one report to the other, they were the same product.

The new palette is a **fuel price board at night**, which is the subject of the report's
loudest beat. It was picked by searching for that object and reading the dominant colours off
the best photographs, then building the working palette from them.

| Role | Hex | What it is |
|---|---|---|
| ground | `#0e1114` | the unlit board, near-black and neutral |
| panel | `#161a20` | a raised area, one step off the ground |
| ink | `#e9edf2` | illuminated acrylic white |
| muted | `#9aa5b2` | painted steel grey-blue |
| rule | `#2b323b` | the hairline between panels |
| dimmed | `#78828e` | axis and scale labels |
| accent | `#2e86de` | the backlit board blue, the cooling half |
| comparison | `#e8452c` | the LED red, the heating half |

The two accents are the two halves of the story, so the palette is the argument before a word
is read. It shares nothing with the wages cream and nothing with the front door's navy.

The palette now lives in four places and all four were changed together: `scene.js` (`const C`),
`index.html` (`:root`), `tokens.css`, and `THEME.cpi` in `playbook/tools/browser.js`.

### What the dark ground broke, and how it was fixed

- **A label sitting on a fill.** "RM2.13 you do not pay" was `--warm` red text on the red
  market surface, inside a solid `--paper` chip. Red on red. It now uses a new `onfill` class,
  which gives it a `--shade` plate and `--ink` text.
- **Body text set darker than the ink.** Three rules in `index.html` hardcoded `#3a3c44` and
  `#42444c`, which are *darker* than the old ink. On a dark ground they have to be lighter, so
  they now use `--muted`.
- **`color-scheme`.** Was `light`. Now `dark`, so the browser's own scrollbars and form
  controls follow the page.

---

## 3. Screenshots

All in `qa/`.

| File | What it shows |
|---|---|
| `page-desktop.png` | the whole page at 1440 wide, full height |
| `page-phone-390.png` | the whole page at 390 wide, device scale 2 |
| `page-nojs.png` | the whole page with JavaScript disabled |
| `page-text.txt` | the rendered text, the input to the reverse check |
| `reports-front.png` | the front door with the CPI card, full page at 1440 |
| `reports-390.png` | the same front door at 390 wide |
| `vidsheet.png` | seven frames pulled across the finished video |
| `vidframe1.png` … `vidframe7.png` | those frames on their own |

---

## 4. Render checks

- **Scene timing**: each scene was played and timed in the browser. All six finish at
  1016–1017 ms against a declared duration of 1000 ms.
  `column 1016`, `ladder 1017`, `path 1016`, `drum 1017`, `dots 1017`, `split 1016`.
- **Label plates**: the fuel price label that sits on the red fill gets its own dark plate
  (`.scene-label.onfill`). The plate colour is the `--shade` token, and that token has to exist
  in the page's own `:root` block. It was missing on the first pass, so the plate resolved to
  nothing and the label sat straight on the fill.
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

## 5. Weight

| Asset | Raw | Gzip |
|---|---|---|
| `index.html` | 27.7 KB | 8.3 KB |
| `scene.js` | 30.8 KB | 9.8 KB |
| `data.json` | 22.8 KB | 3.0 KB |
| **Total, first load** | | **~21 KB** |

`data.json` carries every figure the page can show, which is why it is larger than the wages
report's. It is fetched once and reused by all six scenes.

Fonts are the only other request: Space Grotesk, IBM Plex Sans and IBM Plex Mono from Google
Fonts, with `preconnect` set. Display text is not blocked on them.

---

## 6. The voice-over

Every recorded line was played and judged on the audio itself, not read from the script. Five
defects were found and fixed. All of them were measured, not guessed.

| What was said | How it was heard | Fix |
|---|---|---|
| "Negeri Sembilan" | `[ˈnɛdʒ.riː ˈsɛm.bɪ.læn]` — "NED-jree SEM-bih-luhn", the hard g softened to an English dʒ | the name is out of the voice. It is on screen and in the caption. The voice says the number |
| "Sarawak" | strained, final vowel anglicised | same |
| "Labuan" | strained, vowel reduction | same |
| "RON 95" | `[rʌn ˈnaɪnti faɪv]` — the single word "run" | now "ninety five octane petrol", which is `[ˈnaɪnti faɪv ˈɒkteɪn ˈpɛtrəl]` and fully intelligible |
| "headline" | `[ˈheɪt.laɪn]`, read as "hate line" | the line now says "the rate" |
| "one point three five" with no unit | the line ends abruptly and the figure sounds truncated | "percent" added |

A transcript is not enough to catch this. A mispronounced name transcribes back to the right
word while sounding wrong, so the check has to be done by listening.

### The script

Seven lines, 141 words, 20 to 25 words a line. Durations are
`[7.396, 8.762, 9.146, 7.860, 9.944, 8.788, 2.300]`, which is 54.20 seconds of speech.

---

## 7. The film

| Property | Value |
|---|---|
| Length | 55.86 seconds |
| Frame | 1080 x 1920, portrait, 30 fps, 1,675 frames |
| Video codec | H.264 |
| Audio | AAC, mono, 24 kHz |
| Size | 2,711,496 bytes |
| Bit rate | 388 kbps |
| Speech total | 51.96 seconds across seven lines |

The voice-over sets the shot lengths. Each shot holds its scene for exactly its own line,
with a 0.4 second gap between shots. The last line is the 2.31 second end card, followed by a
1.5 second hold.

The audio was profiled with `silencedetect`. Six of the silences are the shot boundaries, and
the rest are the breaths between sentences:

```
6.72 → 7.57    15.04 → 15.82   24.66 → 25.53
34.55 → 35.35  44.40 → 45.25   51.45 → 52.24   54.09 → 55.86
```

### The film is not the page in order

The page runs `column → ladder → path → drum → dots → split`, because a reader scrolls.
The film runs `premise → path → ladder → column → drum → leads`: a card that states the claim
in type before any chart, the baseline, the fracture, the level under the rate, the cause, and
a card that says what the data leads to. `shots.json` records the beat each shot plays, so a
later reader can tell a deliberate sequence from an accident.

Two of the page's six scenes are not in the film. A minute is not long enough for six claims
and two cards, so the state spread and the urban split stayed on the page and their numbers
moved onto the leads card.

### The picture follows the voice

Every reveal in the film is anchored to a phrase in the voice line. The chart's label, the
card's parts and the caption band all arrive on the word that names them:

| On screen | Arrives with |
|---|---|
| RM4.18 on the premise card | "Fuel did not" |
| "the band: 1.1% to 2.0%" | "The rate has not moved" |
| "Transport rose 2.5%" | "Transport rose" |
| "Housing fell to 1.4%" | "Housing fell" |
| RM2.05 subsidised | "Ninety five octane petrol" |
| RM4.18 on the drum | "four ringgit eighteen" |
| RM2.13 you do not pay | "up fifty nine point seven percent" |
| RM2.13 on the leads card | "The gap at the pump" |

The page runs the same scenes and is unchanged: every cue carries the fraction the scene has
always used, and with no voice the page falls back to it. The page's six scenes still finish
at 1012 to 1017 ms, with no console errors and no label off the canvas.

### The last frame is the whole report

The four charts the film drew are captured clean, before the caption band goes on, tiled two
by two, blurred and scrimmed behind the sign-off. The wall shows what the film drew, not what
the report drew.

### The voice was listened to, not transcribed

The finished film was run through the video understanding tool and the transcript was checked
against the script. Every figure is spoken as written: one point eight percent, two point five
percent, one point four, thirty seven point six percent, twenty ten, ninety five octane
petrol, four ringgit eighteen a litre, fifty nine point seven percent. The name of the site is
never said, and the film ends on "Visit our website to learn more."

The tool was also asked when each number appeared on screen, and the answers are the table
above: RM4.18 at 0:03 with "Fuel did not", the band at 0:09 with "The rate has not moved",
"Transport rose 2.5%" at 0:20, "Housing fell to 1.4%" at 0:23, RM2.05 subsidised at 0:37 with
"Ninety five octane petrol", and RM2.13 at 0:47 with "The gap at the pump".

### The voice has to breathe

`edge-tts` pads every sentence with about nine tenths of a second of silence. The first
recording of this film removed every silent period, and the result was a voice with no breath
between its sentences. The line measured 6.55 seconds; with a third of a second of air in each
gap the same words measured 7.83. The film is two and a half seconds longer for it.

---

## 8. Known gaps

- The ladder scene draws thirteen division rates with their August ticks. The month-on-month
  column is only in the fallback table, so those figures are read from the table.
- The 36 month path scene draws the headline and core lines. The band rails are labelled
  rather than drawn as filled area.
- `?dur=<ms>` and `?only=` are capture helpers left in the page. They are inert without the
  query string, and the canonical tag points at the clean URL.
- Four of the six scenes are still charts in 3D rather than mechanisms. `playbook/pipeline.md`
  now says the form has to come from the mechanism in the story, and `playbook/instructions.md`
  rule 1 says the same. These four were kept for now and are the next thing to rebuild.
- The video is local and is not tracked in git. The file is rebuilt from `shots.json`,
  `vo/script.txt` and `vo/dur.json` in about three minutes.
