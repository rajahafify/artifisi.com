# Video pipeline: report to published short

**Status**: run end to end, 2026-10-27. The Malaysia wages report produced a 57.5 second
portrait short. The page pipeline is `pipeline.md`; this is the sibling that turns the same
report into a vertical video.

```
report → story → shots → storyboard → script → vo → video
```

Seven stages. Every stage produces a file. If a stage has no file, it did not happen.

One report, one video. The shot list becomes a single video.

---

## Where it meets the page pipeline

The first three stages are shared outright. The fourth is shared. The fifth is shared plus a
shot list.

The storyboard comes **after** the page is built, because a storyboard frame is a frame of the
real scene, not a drawing of one. So the video pipeline branches from the page pipeline at the
end of stage 5 and rejoins after stage 9.

```
page pipeline   1 pick ─ 2 acquire ─ 3 verify ─ 4 analyse ─ 5 section ─ 6 viz ─ 7 design ─ 8 mock ─ 9 build ─ 10 qa
                                                                                      │                                    │
video pipeline  └──────────── 1 report ──── 2 story ──── 3 shots ────────────────────┴─ 4 storyboard ─ 5 script ─ 6 vo ─ 7 video
```

Stages 6, 7 and 8 of the page pipeline are page-only. The video needs the built page.

Both pipelines read the same source and the same numbers. There is one set of figures, and it
is checked once, at Gate 4 of the page pipeline.

---

## 1. Report

The source. A published PDF, a dataset, a spreadsheet.

Output: `raw/<slug>/source.md` and `numbers.csv`. **Shared with the page pipeline. No new work.**

Gate: Gate 1 of the page pipeline. Every number traces to the source.

## 2. Story

The narrative. What the numbers mean together, and the one claim the video is making.

Output: `raw/<slug>/story.md`. **Shared with the page pipeline. No new work.**

The video needs one thing the page does not: a single claim it can land. A report has six
claims and no ending. A video has one argument and a button to press. If the story cannot be
compressed to one sentence, the video will not work, and that is a story problem, not a
video problem.

## 3. Shots

One shot per claim. The shot list is the unit of the whole video pipeline, and it is the file
every tool downstream reads.

Output: `raw/<slug>/shots.json`.

```json
{
  "report": "malaysia-wages",
  "size": [1080, 1920],
  "fps": 30,
  "kicker": "Malaysia · wages by industry · 2025",
  "gap": 0.4,
  "endCard": { "id": "end", "vo": "l07", "endHold": 1.5, "title": "…", "url": "…" },
  "shots": [
    { "id": "lift", "scene": "lift", "claim": "…", "caption": "…", "vo": "l01", "plan": 8.6, "t": 1.0 }
  ]
}
```

`plan` is the shot length before the voice-over exists. It is a fallback only. Once the
voice-over is recorded, `vo/dur.json` sets the real length and `plan` is just the record of
what was expected.

Two things to keep apart. The **caption** is the line burned into the frame, and it is what the
voice says. The **on-scene text** from `sections.md` is the labels inside the 3D scene, the
numbers on the axes. Mixing them up is how a video ends up with two layers of text saying
different things.

Gate: one claim one shot, the same rule as Gate 2 of the page pipeline. No two shots use the
same form. If two do, one is padding.

## 4. Storyboard

One frame per shot, at 1080x1920, rendered from the **real scene**.

Output: `raw/<slug>/storyboard/<id>.png` and `raw/<slug>/storyboard/storyboard.png`.

```
node playbook/tools/storyboard.js reports/<slug> raw/<slug>/shots.json raw/<slug>/vo raw/<slug>/storyboard
```

The frame comes from the page's own capture switch, which isolates one section full-bleed and
hides the chrome:

```
reports/<slug>/index.html?shot=<scene>&t=<0..1>
```

Three reasons this comes from the page and not from the mock:

- **It is the truth.** The Gate 3 mock is a separate SVG renderer for the same six sections.
  Two renderers for one story drift, and the wiki log records the mock being rebuilt three
  times while the scene was rebuilt separately. The storyboard has to be the thing the reader
  will actually see.
- **It catches build failures.** If the mock shows a lift and the storyboard shows a bar
  chart, the build did not realise the design. Nothing else would notice.
- **It is already built.** `?shot=` and `window.__seek(t, name)` exist for exactly this.

### Shot mode reserves the caption bands

The frame is 1080x1920. The top 8vh carries the kicker and the bottom 16vh carries the burned
in caption, so nothing from the scene enters either band. That leaves a 1080x1459 canvas, the
same portrait canvas for all six shots, whatever aspect the page gives each figure.

The overlay geometry is the mock's, at 1080x1920: the kicker at 96px down, the rule at 1613px,
the caption at 1682px. It is written in `vw` and `vh` so it cannot drift from the frame size.

Gate: every shot renders full-bleed at 1080x1920, nothing clipped at the edge, no label
overlapping another, and the caption legible over the scene. This is the video's Gate 4.

## 5. Script

The spoken words. One line per shot, plus the end.

Output: `raw/<slug>/vo/script.txt`, the format the recorder reads.

```
l01|The median monthly wage here is two thousand nine hundred and forty ringgit.
l02|Two in three workers are in an industry paying below the national median.
```

The captions from stage 3 are the starting copy. They are already written, in the Gate 3 mock,
one caption band per frame, marked "BURNED IN AT DELIVERY". Do not rewrite them at this stage.

Rules that are not negotiable, because they were all learned the hard way:

- numbers as words, "two thousand nine hundred and forty ringgit", never digits
- never say "Artifisi", the voice mangles it
- end on "Visit our website to learn more"
- 7 to 9 lines, about 110 to 140 words, near 55 seconds

Every figure in the script has to be checked against the shipped data, not the draft. The
`bill` field in `data.json` is a raw product, `share × r25`, and it sums to 107.9. Read raw it
gives 59.96 percent. Normalised, the four bill leaders are 17.4, 15.9, 11.2 and 11.0, which
is 55.6 percent.

## 6. Voice-over

The recorded audio, and its timings.

Output: `raw/<slug>/vo/l01.mp3` and `raw/<slug>/vo/dur.json`, the two files `record-video.js`
reads.

```
python playbook/tools/voice.py raw/<slug>/vo
```

This stage exists because **the audio is what sets the shot lengths**. Once the durations are
known, the video can be assembled to the millisecond. Before this stage, every timing in the
plan is an estimate.

Gate: every line recorded, none silent, none clipped, and the total within ten seconds of the
script's word count estimate.

## 7. Video

The assembly.

Output: `raw/<slug>/video/clips/<id>.webm`, `raw/<slug>/video/clips.json` and
`raw/<slug>/video/out.mp4`.

```
node   playbook/tools/record-video.js reports/<slug> raw/<slug>/shots.json raw/<slug>/vo raw/<slug>/video
python playbook/tools/mux.py raw/<slug>/video raw/<slug>/vo raw/<slug>/video/out.mp4 raw/<slug>/shots.json
```

The recorder walks the shot list, the voice-over is laid over it, the end card closes.

Gate: watch the whole thing once. Then pull eight to ten frames and check them. A mux that
succeeds can still produce a video with the audio half a second out.

### The page runs at one second, the video runs at the length of the words

The page's scenes play in one second. The video stretches the same scene over its whole shot
with `?dur=<ms>`, so the choreography plays out across nine seconds instead of one. The page
and the video are deliberately at different rates. The scene's internal timings are all in
normalised `t`, so changing the duration stretches the choreography proportionally and nothing
breaks.

---

## Three traps

**Playwright records at CSS resolution and never scales up.** The screencast is the viewport
size in CSS pixels. Ask for a 540 wide viewport and a 1080 wide video and the page lands in
the top left corner with the rest of the frame empty. The capture viewport therefore has to
be the frame size, 1080x1920, at device scale one. `frameContext()` in `playbook/tools/browser.js`
is the one place that knows this, and both the storyboard and the recorder use it.

**edge-tts pads every line with about a second of silence.** Left in, that padding is dead air
and it pushes the runtime past the target on its own: seven lines added six and a half seconds
to a 57 second video. `voice.py` trims the tail as it writes, so `dur.json` holds the length
of what is actually spoken.

**A camera sweep needs room.** The city scene orbits the camera. On the page's wide canvas
the block stays in frame; in a narrow portrait canvas it walks out of the left edge and the
building is cut in half. The scene now scales its sweep to the aspect it has, so the page's
wide figure gets the full sweep and a narrow canvas gets what it can hold. The same fix
belongs to any scene that moves the camera after it fits.

---

## Files a video needs

```
raw/<slug>/shots.json         the shot list, machine readable
raw/<slug>/storyboard/*.png   one PNG per shot, 1080x1920
raw/<slug>/storyboard.png     contact sheet, for review

raw/<slug>/vo/script.txt      l01|text, one line per voice line
raw/<slug>/vo/dur.json        per line durations in seconds
raw/<slug>/vo/l01.mp3         the audio, local, not tracked

raw/<slug>/video/clips/*.webm the per shot captures, local, not tracked
raw/<slug>/video/clips.json   what was captured and how long
raw/<slug>/video/out.mp4      the video, local, not tracked
```

The page itself still needs `index.html` and `scene.js`, because the storyboard is rendered
from the page and the recorder drives the page.

## The video is not tracked in git

One report makes one video, and the video is six megabytes of incompressible blob that git
would keep in the history forever. The root `.gitignore` leaves `raw/*/video/out.mp4`,
`raw/*/video/clips/`, `raw/*/video/tmp/` and `raw/*/vo/*.mp3` out.

Everything needed to rebuild them is committed: the shot list, the script, the durations, the
storyboard and the tools. `voice.py` and `mux.py` put the file back in about three minutes.
The storyboard PNGs stay tracked, so the shots can be reviewed without running anything.

## The toolchain

```
playbook/tools/browser.js        route handler, overlay CSS, the capture context
playbook/tools/storyboard.js     frames plus contact sheet
playbook/tools/record-video.js   one clip per shot
playbook/tools/voice.py          edge-tts, trimmed, measured
playbook/tools/mux.py            trim, concatenate, lay the voice over
playbook/tools/package.json      playwright and three
```

`ffmpeg` and `ffprobe` have to be on `PATH` for the last two. `edge-tts` is a pip install.
`three` is served from a local unpacked build, pointed at by the `THREE` environment
variable, so a run cannot quietly depend on the network.

Capture stays a screen recording rather than a frame-by-frame render, because 57 seconds at
30fps is 1700 screenshots and swiftshader is slow. The scenes are deterministic functions of
`t`, so `__seek` still gives exact frames for the storyboard stills.

## Open

- The city scene carries no annotations. The Gate 3 mock has "four industries carry 55.6%"
  over the skyline and the live scene does not, so the video shot is plainer than the mock.
- Whether the video is published anywhere yet, or only handed over, is not settled here.
