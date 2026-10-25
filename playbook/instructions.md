# Playbook: report to interactive page and short video

Version 2, 26 Oct 2026. Replaces version 1, which was written after the KRI State of Households sample.

What changed in version 2, and why:

- the scene must be a mechanism, not a chart field
- playback is by click, never by scroll
- scenes are composed for a square volume, so one build survives every frame
- figures are diffed against the source after the build, because two were wrong
- animation is checked in a real browser, because headless cannot run time

Point another agent at this file as its brief, then name the report ("Do this for <report URL>").

## Reference builds

| What | Where | Use it for |
|---|---|---|
| The current best page | `reports/malaysia-wages/` | copy this one |
| The first page | `reports/samples/households/` | the film, not the pattern |
| The engine and click indicator | `tech-sovereignty/scene.js` | `Stage`, `chip`, `finger` |
| The front door | `reports/index.html` | prices and the enquiry form |
| The stages and gates | `playbook/pipeline.md` | read first |
| The scripts | `playbook/tools/` | `screenshots.js`, `record-video.js`, `mux.py` |

`pipeline.md` covers picking, acquiring, verifying, analysing and mocking. This file covers what the two builds taught about building and shipping.

## What you get

1. One static page. Every number sits in plain HTML text. Behind it, a three.js scene per section that plays when the reader clicks it, and sits on its finished frame until they do.
2. A vertical 1080x1920 video of 40 to 55 seconds. A screen recording of the scenes with captions and a TTS voice-over, ending on a card with the page URL.

## The rules, in the order they cost us time

### 1. 3D earns its place only when the scene is a mechanism

A bar chart in 3D is a bar chart with worse labels and a heavier download. The wages report works because each scene is a machine that visibly does something: a lift rises off a floor, a floor splits into two lanes, a canyon deepens, a section drifts apart, a city grows, a block is cut open.

The claim has to fall out of watching it run. If you cannot say in one sentence what moves and what that shows, draw it flat and spend the effort on the sentence instead.

### 2. Compose for a square, not for a wide screen

One scene is seen at 9:16 (phone, video), 4:5 (Instagram), 1:1 (thumbnail) and 16:10 (desktop). A long flat object that looks right at 1440x900 becomes a one pixel line in portrait.

- build inside a roughly cubic bounding volume: height and depth within about 60% of width
- camera `fov` near 14 for anything long. At `fov` 34 a 13 unit object overflowed the frame by 15%
- check 4:5 and 9:16 before you check desktop, because they fail first

### 3. Click to play, never scroll

Scroll-triggered playback was rejected on sight. It also fights the reader: they scroll past a section before it starts, and it finishes while they are looking somewhere else.

- `play()` on `click`, and on Enter or Space, so keyboard gets the same thing
- open on the finished frame: `this.t = 1; this.done = true` in the constructor. The page reads as a still page until someone asks
- no `IntersectionObserver`
- a token guards restarts, so a second click mid play cannot leave two loops running

```js
play() {
  if (this.spec.reduced) return;
  this.playing = true; this.done = false; this.t = 0;
  this.start = performance.now();
  const tok = (this.run = (this.run || 0) + 1);
  const step = (now) => {
    if (tok !== this.run) return;
    const t = clamp01((now - this.start) / this.spec.duration); // duration is already ms
    this.t = t; this.draw();
    if (t >= 1) { this.playing = false; this.done = true; return; }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
```

### 4. Teach the click once, then get out of the way

Each chart carries a chip (`1 / 6 · click to play`) and, until the first click, a finger with a ripple. Copy both from `tech-sovereignty/scene.js`.

- `attach(st, fig, index)` builds the chip and finger, sets `role="button"`, `tabindex="0"` and an `aria-label`
- after the first click set `localStorage` `mw-taught` and hide the finger. Keep the chip
- one `.hint` line under the hero stats: "Click any chart to play its shot. Six charts, one per claim."
- never let either into the video: `body.shot-mode .chip, body.shot-mode .finger { display: none }`

### 5. Labels outside the geometry need `stage.extent()`

The camera fit is a `Box3` over the scene. A label floating past the last bar is not in that box, so it gets clipped, and it looks like a rendering bug rather than a framing one.

`extent(a, b)` adds a zero opacity line only to widen the box. Call it for every label that sits outside the object it describes. This bit us twice, on the drift labels in section 4 and the ratios in section 6.

### 6. Check the figures after the build, with the source open

Two claims in the wages report were wrong, and both survived the mock and the build:

- the 2010 to 2016 spread was written as 3.56 to 3.72 when it is 3.39 to 3.72
- "education paid most for the whole series" was false, because mining tied at RM2,800 in 2010

Both were caught only in the Gate 4 diff, one row at a time, page against source. Do the diff last, on the built page, and when a figure moves, rewrite the claim sentence. A correct number under a wrong claim is still a wrong page.

### 7. Test animation in a real browser

Headless Chrome cannot exercise time. `performance.now()` is frozen under `--virtual-time-budget`, and `requestAnimationFrame` does not tick without a compositor. Every screenshot of a broken animation looked fine.

A shot that should take 5 seconds took about 83 minutes, and no screenshot could have shown it. Open the page in a real browser and watch a shot run before you say it works.

### 8. Keep the units honest

That bug was `(now - start) / (duration * 1000)` where `duration` was already milliseconds. Name time variables by unit (`durationMs`) or do the arithmetic where the unit is visible, so a wrong unit cannot type check.

### 9. Text first, canvas second

Every number in HTML, every claim in a heading, a `<table>` behind every figure.

- `html.no-js .fig .canvas-wrap { display: none }` so an empty canvas never shows without JavaScript
- the page still tells the story with the scene gone
- this is also what makes it indexable and readable by a screen reader, which is the actual product promise

### 10. One claim, one shape

Six scenes, six claims. No two sections use the same form. If two do, one of them is padding, and the page is longer without being fuller. This is Gate 2 in `pipeline.md` and it is the cheapest edit you will ever make.

## Files a report needs

```
reports/<slug>/
  index.html     all text and figures, the palette, the click indicator CSS
  scene.js       Stage, six scene functions, attach(), __seek()
  data.json      one object per section, plus the national block and the series
```

Plus `raw/<slug>/qa.md` with the figure diff, the screenshots, the weight table and the known gaps.

Two switches matter for capture and QA:

- `?shot=<name>&t=<t>` and `window.__seek(t, name)` freeze a scene at a point, for video
- `?still=1` freezes everything for screenshots, `?only=<n>` isolates one section

## Steps

Keep the ten stages in `pipeline.md`. In practice:

1. **Pick and acquire.** Record the licence, publisher, date and author. If the licence is not open, stop.
2. **Verify.** `numbers.csv`, one row per figure, with the exact sentence and a page number. Gate 1.
3. **Analyse.** `story.md`: the claim, the evidence, the counterpoint, the so what.
4. **Section.** `sections.md`: `n, headline, claim, number_ids, viz, motion, interaction`. Gate 2.
5. **Mock.** `_mock.cjs` generating one SVG page per section, exported to a single PDF. Gate 3.
6. **Build.** Copy the closest existing report. Replace `data.json`, then the six scene functions. Keep the `Stage` class.
7. **QA.** Figure diff, screenshots at 1440x900 and in a 390px iframe, no-JS, reduced motion, keyboard, weight. Gate 4.
8. **Voice-over.** One line per shot, numbers as words. About 110 words, near 45 seconds.
9. **Record and mux.** `record-video.js`, then `mux.py`.
10. **Ship.** PR, preview, merge, then the sales note.

### Voice-over and video, in detail

- Write 7 to 9 lines, one per shot, plain sentences, numbers as words ("seven thousand and seventeen ringgit"). Do not say "Artifisi", because the voice mispronounces it. End on "Visit our website to learn more."
- Record on fify's PC (DESKTOP-30IVP4M), since the cloud cannot reach the TTS service:
  `edge-tts --voice en-SG-LunaNeural --rate=-3% --text "<line>" --write-media D:\artifisi\video-edit\<slug>-vo\l01.mp3`
- Copy the mp3s back, then get each length with `ffprobe`.
- Edit `SHOTS` in `record-video.js`: one entry per voice line, `[section index, view, 'viz' | 'text']`, plus `[null]` last for the end card. The script holds each shot for its line's length plus 0.35 s, burns in captions and hides the click hints.
- Put `script.txt` (`l01|text`) and `dur.json` in the VO folder, then run `THREE=<path> node record-video.js <page folder> <rec dir> <vo dir>`, then `python3 mux.py <rec dir> <vo dir> out.mp4 <lines>`.
- Pull 8 to 10 frames and check them, then listen to the whole thing once.

## Shipping

- `reports/` is its own Cloudflare Pages project: build command `exit 0`, output directory `reports`, custom domain `reports.artifisi.com`, CNAME `reports` to `reports.pages.dev`.
- The main site keeps `/samples/*` as a 301 to `reports.artifisi.com/samples/:splat`.
- Custom work is sold from `reports/index.html`, with a Formspree form. Prices there and in `playbook/sales/rate-card.md` must match.

## Known traps

**Headless Chrome**

- `--window-size` clamps to about 485px on Windows, so a "390px" screenshot is a crop, not a reflow. Test small screens in a 390px iframe instead
- `--screenshot` needs an absolute path or fails with "Access is denied"
- screenshots always capture from the top of the document, so an anchor in the URL does not scroll
- software WebGL (`--use-gl=swiftshader`) is slow but fine. About a minute per screenshot run

**three.js**

- `three/addons/` needs its own importmap entry, not just `three`
- `LineMaterial.resolution` must be set again on every resize, or fat lines blur
- a group returned by a helper must be added to `this.root` before you return it. Ours was not, and every standalone box was invisible with no error
- `Line2` wants `line(x1,y1,x2,y2,...)`. Passing a number where `y2` belongs throws `y2.toFixed is not a function`
- a wireframe block seen through other wireframe blocks reads as a tangle. Give bodies an opaque fill

**Sources and tooling**

- the cloud container cannot reach `.gov.my`, krinstitute.org, jsDelivr, unpkg or the TTS service. `npm pack three@0.180.0` and point `THREE` at the unpacked build
- WebFetch summarises, and long PDFs get cut off. Check every number you did not read yourself
- the DOSM catalogue API needs `curl -L` (it 301s) and a User-Agent
- a Remote Control session on fify's PC turns off folder access until it is stopped

**Windows**

- killing a dev server can leave the folder locked, and `git mv` then fails with "Device or resource busy". Stop the server properly, or move the children one at a time
- `git mv` refuses a folder git does not track yet. Use `mv`
