# Playbook: report to interactive page and short video

Version 3, 27 Oct 2026. Replaces version 2, which was written after the KRI State of Households sample.

What changed in version 3, and why:

- rules 11 to 13 are the Malaysia CPI report's lessons: the type goes behind the chart, a dark ground breaks things a light one hides, and a page declares its own tokens
- a label has a direction, and the camera frame has to cover the direction it runs
- the film is a shot list, so a change to how the film is made has to change the shot list in the same change, or the film does not change
- a branch is rebased onto main before it merges, because a check that appears only on your branch is usually a stale base and not your change

What changed in version 2, and why:

- the scene must be a mechanism, not a chart field
- playback is by click, never by scroll
- scenes are composed for a square volume, so one build survives every frame
- figures are diffed against the source after the build, because two were wrong
- animation is checked in a real browser, because headless cannot run time
- figures open at the first frame, not the last, so the first click reads as a replay and not a reset

Point another agent at this file as its brief, then name the report ("Do this for <report URL>").

## Reference builds

| What | Where | Use it for |
|---|---|---|
| The current best page | `reports/malaysia-wages/` | copy this one |
| The first page | `reports/samples/households/` | the film, not the pattern |
| The engine and click indicator | `tech-sovereignty/scene.js` | `Stage`, `chip`, `finger` |
| The front door | `reports/index.html` | prices and the enquiry form |
| The stages and gates | `playbook/pipeline.md` | read first |
| The video pipeline | `playbook/video.md` | report to short, stage by stage |
| The scripts | `playbook/tools/` | `screenshots.js`, `record-video.js`, `mux.py` |

The scripts have their own dependencies:

```
cd playbook/tools && npm install
```

That installs Playwright and three, and pulls the Chromium build. The capture scripts point
`THREE` at an unpacked three build, because jsDelivr and unpkg are not always reachable:
`npm pack three@0.180.0`, unpack it, and set `THREE=<unpacked>/package`.

`pipeline.md` covers picking, acquiring, verifying, analysing and mocking. This file covers what the two builds taught about building and shipping.

## What you get

1. One static page. Every number sits in plain HTML text. Behind it, a three.js scene per section that plays when the reader clicks it, starting from the first frame of the shot.
2. A vertical 1080x1920 video of up to 60 seconds. A screen recording of the scenes with captions and a TTS voice-over, ending on a card with the page URL.

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
- open at the top of the shot: `this.t = 0; this.done = false` in the constructor. The chart stands in its starting state until someone asks, and the first click runs it forward
- do not open on the finished frame. It was tried: the first click then jumped backwards before running forward, and that read as a reset rather than a replay
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

A label also has a direction, and the box has to cover the direction it runs. The anchors are `l` ends at the point and runs left, `r` starts at it and runs right, `t` above it, `b` below it, `c` centred. The CPI path scene's end label read "Sept 2026 - 1.8%", anchored `r` at the last data point, and it ran off the right edge of the portrait frame: the extent reserved room to the right of the point, but not enough of it for a label that started there and ran right. Either widen the extent by the width of the label, or anchor it the other way and let it run back over the drawing where there is room.

Check this at the video's aspect, not only the page's. The CPI label was fine on the page and clipped in the 9:16 frame, because the frame is a different crop of the same scene.

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

### 11. The type goes behind the chart, not on top of it

A label that sits on a filled shape has to be given a plate of its own, because there is nothing to read it against. A plate is a flat rectangle pasted on top of the drawing, and it says "this is a user interface" in the middle of a scene that was supposed to look like a thing in a room.

Hang the display type behind the chart in depth instead. The CPI column scene carries a ghosted "+37.6%" two and a half units back, and the column's own silhouette cuts across it, so the type reads as something behind the glass of the cabinet. It solves the same problem with depth instead of a rectangle, and the chart's geometry draws over it for free.

Two things it costs. The type is a texture, so the font has to have loaded before the scene paints, and a repaint must not re-register the font request or the page loops forever. And the chart has to be re-measured with the compose transform neutralised, or the framing drifts when the chart is scaled to make room.

### 12. A dark ground breaks things a light one hides

The CPI report is the first one on a near-black ground, and it found three things that a cream ground had been hiding.

- body text hardcoded darker than the ink, which reads as body text on cream and reads as unreadable on black. Move those rules to the muted token instead of a fixed grey
- `color-scheme` has to flip with the ground, or the browser renders the scrollbars and form controls for the wrong scheme
- a label on a saturated fill has no contrast against it. It needs its own plate, in the shade token, and the plate needs to be declared against a token the page defines

### 13. A page declares its own tokens

The fuel price label sat on the red fill and needed a plate, and the plate was written against a `--shade` token the page's own `:root` never declared. `var(--shade)` resolved to nothing and the plate rendered transparent.

A page carries its own token block, and a token used by a class in that page has to be declared in that page. The shared file is a starting point, not a dependency.

### 14. The rules, the machinery and the cut land together

The CPI film got a new opening, a new card shot type and a new ending wall built and shipped, and the film itself came out identical, because the shot list was never rewritten. The machinery was ready and nothing called it.

When you change how the film is made, change the shot list in the same change. A mechanism with no caller is not shipped work, it is scaffolding. The shot list is the thing that carries the argument, so it is the first thing to change and the last thing to leave unchanged.

The same applies to a rule written into the playbook: a rule that nothing enforces is an intention. Give it a gate, or give it a file it has to change.

## Files a report needs

```
reports/<slug>/
  index.html     all text and figures, the palette, the click indicator CSS
  scene.js       Stage, six scene functions, attach(), __seek()
  data.json      one object per section, plus the national block and the series
```

Plus `raw/<slug>/qa.md` with the figure diff, the screenshots, the weight table and the known gaps.

The working folder beside it holds the film: `shots.json` (the shot list, the input to every tool), `vo/script.txt` and `vo/dur.json` (the voice-over and the durations that set the shot lengths), and `storyboard/` (one frame per shot plus the contact sheet). The video and the recorded voice tracks are not tracked; those four rebuild the file in about three minutes.

Two switches matter for capture and QA:

- `?shot=<name>&t=<t>` and `window.__seek(t, name)` freeze a scene at a point, for video
- `?still=1` freezes everything for screenshots, `?only=<n>` isolates one section

## Steps

Keep the eleven stages in `pipeline.md`. In practice, with the video's three stages folded in at the end:

1. **Pick.** One paragraph: topic, audience, why now, what people search for.
2. **Acquire.** Record the licence, publisher, date and author. If the licence is not open, stop.
3. **Verify.** `numbers.csv`, one row per figure, with the exact sentence and a page number. Gate 1.
4. **Analyse.** `story.md`: the claim, the evidence, the counterpoint, the so what.
5. **Section.** `sections.md`: `n, headline, claim, number_ids, viz, motion, interaction`. Gate 2.
6. **Palette.** Pick the palette off a reference image of the subject and check `palettes.md` first. It decides how the scene reads, so it comes before the viz.
7. **Viz.** The form comes from the mechanism in the story. Say in one sentence what moves and what that shows. If nothing moves, it is a chart.
8. **Design.** `tokens.css`: three type roles, one scale, one easing curve.
9. **Mock.** `_mock.cjs` generating one SVG page per section, exported to a single PDF. Gate 3.
10. **Build.** Copy the closest existing report. Replace `data.json`, then the six scene functions. Keep the `Stage` class.
11. **QA.** Figure diff, screenshots at 1440x900 and in a 390px iframe, no-JS, reduced motion, keyboard, weight. Gate 4.
12. **Voice-over.** One line per shot, numbers as words. About 110 words, near 45 seconds.
13. **Record and mux.** `record-video.js`, then `mux.py`.
14. **Ship.** Rebase onto main, PR, preview, merge, then the sales note.

The video stages are in `video.md`, and they branch from stage 5 and rejoin after the page is built.

### Voice-over and video, in detail

The full pipeline is `video.md`. This is the working detail for its stages 5 to 7.

- Write 7 to 9 lines, one per shot, plain sentences, numbers as words ("seven thousand and seventeen ringgit"). Do not say "Artifisi", because the voice mispronounces it. End on "Visit our website to learn more."
- the captions are already written. The mock carries a caption band on every frame, marked "BURNED IN AT DELIVERY". Start from that copy, do not rewrite it at this stage
- `shots.json` is the shot list and it is the input to every tool. `storyboard.js`, `record-video.js` and `mux.py` all read it. Nothing about a report is hardcoded in a tool
- a shot is a scene or a card. A card is a full-frame typographic plate the recorder builds, and it is where the opening premise and the closing implication live
- the voice-over goes in `script.txt` (`l01|text`), one line per shot, in shot order
- record with `python voice.py <vo dir> --force`. It speaks each line with `edge-tts` (`en-SG-LunaNeural`, rate `-3%`), trims the trailing silence off each one, and writes `dur.json`, which is what sets the shot lengths
- record and mux with `node record-video.js <page folder> <shots.json> <vo dir> <video dir>` then `python mux.py <video dir> <vo dir> out.mp4 <shots.json>`
- pull 8 to 10 frames and check them, then listen to the whole thing once
- a figure has to be checked at the video's aspect as well as the page's. A label can be fine on the page and clipped in the 9:16 frame

## Shipping

- `reports/` is its own Cloudflare Pages project: build command `exit 0`, output directory `reports`, custom domain `reports.artifisi.com`, CNAME `reports` to `reports.pages.dev`.
- The main site keeps `/samples/*` as a 301 to `reports.artifisi.com/samples/:splat`.
- Custom work is sold from `reports/index.html`, with a Formspree form. Prices there and in `playbook/sales/rate-card.md` must match.
- never commit straight to `main`. Branch, push, open a PR, and merge with a merge commit. Never squash and never rebase-merge, because the branch is the record of what was tried
- **fetch and rebase onto `origin/main` immediately before merging.** The CPI film branch was based on a main that was two commits behind, and the `ikhlas-proposal` Pages check failed on the branch because the project had no root directory in a tree that did not have the folder yet. The rebase fixed it, and the check passed
- a check that appears on your branch and on nothing else is usually a stale base, not your change. Rebase, and read it again
- the video and the recorded voice tracks are not tracked. `shots.json`, `script.txt`, `dur.json` and the storyboard are, and they rebuild the file in about three minutes

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
- `ffmpeg` and `ffprobe` have to be the real binary, not the WinGet link. The link at `%LOCALAPPDATA%\Microsoft\WinGet\Links\ffmpeg.exe` is a zero-byte alias, and Python's `subprocess` finds it first and fails with `WinError 193`, "%1 is not a valid Win32 application". Put the package's `bin` folder first on `PATH`:
  `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin`
- a capture must not be taken while the page is still swapping scenes. The CPI page builds all six scenes and only then marks the one in the shot as the only one on, so `openShot` waits for the page to have settled on exactly one section. Without that wait a frame can carry one scene's geometry and its labels on top of another's
- `edge-tts` writes a WordBoundary event for every word it speaks and the CLI throws them away. The Python `Communicate().stream()` API exposes them. The CLI's `--write-subtitles` gives sentence-level cues only, and there is no `--words-in-cue` in 7.3.1

**Windows**

- killing a dev server can leave the folder locked, and `git mv` then fails with "Device or resource busy". Stop the server properly, or move the children one at a time
- `git mv` refuses a folder git does not track yet. Use `mv`
- the repo stores CRLF with no BOM and `core.autocrlf = true`. PowerShell's `Set-Content -Encoding UTF8` writes a BOM, so write with `[System.IO.File]::WriteAllText($f, $text, (New-Object System.Text.UTF8Encoding($false)))`
- `git show <blob> > file` in PowerShell corrupts the file, because the redirect writes text. Use `git archive --format=tar` and `tar -x` when a binary has to come out of git
- the local safety policy blocks a `cd` followed by a write. Use `git -C <path>` and absolute paths
- for recoverable deletion, run `mavis-trash.cmd -- '<path>'`. The extensionless `mavis-trash` does not run from PowerShell, and the local policy blocks `Remove-Item`
