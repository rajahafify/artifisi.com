# QA — Malaysia wages

**Built**: 2026-10-26
**Page**: `reports/malaysia-wages/`
**Gate**: 4

---

## 1. Every figure diffed against the source

Each number on the page was recomputed from `data.json`, which is itself derived from
`source.json` (960 rows, DOSM `wages_industry`).

Note on the `bill` field in `data.json`: it is `share x r25`, a raw product, **not** a
percentage. It sums to 107.9 across the 19 sections. The percentages come from dividing by
the total, which the scene does at render time. Read the field directly and the four bill
leaders look like 59.96% instead of 55.6%.

| Figure on page | Value | Recomputed | Match |
|---|---|---|---|
| National median 2025 | RM2,940 | `nat.med2025` | yes |
| Education median 2025 | RM5,990 | `sections[P].med` | yes |
| Education ratio 2025 | 2.04x | 5990 / 2940 = 2.037 | yes |
| Education ratio 2010 | 1.87x | 2800 / 1500 = 1.867 | yes |
| Education employees | 952,300 / 9.2% | `sections[P].emp` / `share` | yes |
| Below the median | 65.8% | sum of shares where r25 < 1 | yes |
| Employees covered | 10.38 m | `nat.emp2025` 10,381.6k | yes |
| Manufacturing | 18.9% at 0.91x | `sections[C]` | yes |
| Trade | 17.0% at 0.70x | `sections[G]` | yes |
| Spread 2010 / 2019 / 2020 / 2025 | 3.59 / 3.18 / 3.80 / 3.30 | `series.spread` | yes |
| Spread 2010-2016 range | 3.39 to 3.72 | min/max of years 0-6 | yes |
| 2020 national median fall | 15.0% | 2442 -> 2076 = -14.99% | yes |
| 2020 covered employees rise | 2.8% | 9195.2k -> 9456.0k = +2.84% | yes |
| Industries up / down | 10 / 9 | count r25 > r10 / r25 < r10 | yes |
| Health | 1.33x -> 1.69x | `sections[Q]` | yes |
| Public admin | 1.36x -> 1.57x | `sections[O]` | yes |
| Real estate | 1.67x -> 1.29x | `sections[L]` | yes |
| Mining | 1.87x -> 1.57x | `sections[B]` | yes |
| Finance | 1.67x -> 1.42x | `sections[K]` | yes |
| Four-industry bill | 55.6% | 17.4 + 15.9 + 11.2 + 11.0 | yes |
| Individual bills | 17.4 / 15.9 / 11.2 / 11.0 | share x r25, normalised by the total | yes |
| Mean / median | 1.42 / 1.40 / 1.05 / 1.06 | A, F, O, P | yes |
| Agriculture gap | RM762 | 2575 - 1813 | yes |

### Two claims corrected during QA

1. **"The spread sat between 3.56 and 3.72 from 2010 to 2016."** Wrong. 2012 is 3.39.
   Corrected to 3.39-3.72. Same correction applied to `sections.md`.
2. **"Education has held the top of the ladder for the whole series."** Wrong for 2010,
   when education and mining both stood at RM2,800 (1.87x) and mining sorted first.
   Corrected to "every year since 2011", with the 2010 tie stated.

---

## 2. Screenshots

All in `qa/`.

| File | What it shows |
|---|---|
| `desktop-1.png` … `desktop-6.png` | each section at 1280x1150, scenes at t=1 |
| `phone-390.png` | section 2 in a true 390px viewport |
| `nojs.png` | section 1 with JavaScript disabled |
| `shot-lift.png` … `shot-cutaway.png` | each scene full-bleed at 1080x1920, the video frame |
| `reports-front.png` | the reports.artifisi.com front door, full page at 1280 |
| `reports-390.png` | the same page in a true 390px iframe |
| `reports-contact.png` | the Formspree form and its fields, 2x crop |

Note: headless Chrome on Windows clamps `--window-size` to about 485px, so the 390px
check runs the page inside a 390px iframe. A plain `--window-size=390` screenshot is a
crop of a 485px layout and is not a valid mobile test.

---

## 3. Layout checks

- **Label overlaps**: none remaining. Fixed during build — section 1 (education label sat on the
  car), section 4 (drift labels collided in pairs), section 6 (industry name sat on the mean
  label), section 2 (34.2% overlapped the lane border).
- **Clipping**: none at either aspect. Scenes whose labels sit outside the geometry declare an
  invisible `stage.extent()` so the camera fit includes the label band.
- **Framing**: every scene is composed for a square-ish bounding volume so it holds at 4:5
  (desktop column), 16:10 (wide) and 9:16 (video).

---

## 4. Weight

| Asset | Raw | Compressed |
|---|---|---|
| `index.html` | 20.9 KB | 6.5 KB gz |
| `scene.js` | 23.8 KB | 7.8 KB gz |
| `data.json` | 4.1 KB | 1.1 KB gz |
| three.js 0.180 (CDN) | 339 KB | 79.4 KB br |
| three addons: lines (CDN) | — | 4.1 KB br |
| **Total, first load** | | **~99 KB** |

Budget was 200 KB for the scene. It is 99 KB including the engine.

Fonts are the only other request: Fraunces, IBM Plex Mono, IBM Plex Sans, from Google Fonts,
with `preconnect` set. Display text is not blocked on them.

---

## 5. Behaviour

- **Reduced motion**: `prefers-reduced-motion: reduce` skips playback and renders every
  scene at `t = 1`, so the page shows final states and never animates. Verified with
  `--force-prefers-reduced-motion`.
- **No JavaScript**: `html.no-js` hides the canvas and shows a data table per figure.
  Every claim and every number is still on the page in HTML. Verified in `qa/nojs.png`.
- **Keyboard**: each figure is a `role="button"` with `tabindex="0"` and an `aria-label` naming
  its claim. Enter and Space play it. Focus ring is 2px accent with 3px offset.
- **Motion**: click or tap drives playback. Each figure opens at the top of its shot
  (`t = 0`) and runs forward on the first click; a click during playback restarts it.
  Nothing plays on scroll and nothing loops.
- **Click indicator**: a finger that presses over the first figure until the reader clicks any
  chart once (remembered in `localStorage` as `mw-taught`), plus a chip on every figure reading
  `Play the shot` / `Playing` / `Replay`. Coarse pointers get "Tap" instead of "Click".
- **Opening frame**: at `t = 0` the lift, canyon and cutaway fill the frame, because each
  has a static structure around the moving part. Section 4 and section 5 read thin until
  clicked, since their scenes are the growth itself. The camera cannot compensate: the
  bounding box measured at `t = 0` and `t = 1` is the same in all six scenes, because each
  one animates inside a fixed envelope.

---

## 6. Known gaps

- The section 2 figure is two lanes rather than the nineteen bins `sections.md` specifies.
  Nineteen bins at 9:16 forces each bin under 20px wide. The caption was rewritten to describe
  what is actually drawn.
- The 2020 counterpoint in section 3 is in the prose, not burned into the frame. The video
  version needs it as a lower third.
- `?only=` and `?still=` are build and capture helpers left in the page. They are
  inert without the query string, and the canonical tag points at the clean URL.
