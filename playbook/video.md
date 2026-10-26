# Video pipeline: report to published short

**Status**: draft, 2026-10-26. Never run end to end. The page pipeline is `pipeline.md`; this
is the sibling that turns the same report into a vertical video.

```
report → story → shots → storyboard → script → vo → video
```

Seven stages. Every stage produces a file. If a stage has no file, it did not happen.

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

One shot per claim. The shot list is the unit of the whole video pipeline.

Output: `raw/<slug>/shots.md`, one row per shot.

```
id | claim | scene | duration | caption | vo
```

| id | claim | scene | duration | caption | vo |
|---|---|---|---|---|---|
| lift | Education pays twice the national median | `lift` | 5s | The lift climbs from the national median to the education median. | l01 |
| floor | Two in three workers are below the median | `floor` | 7s | The workforce forks at the median. Most of it goes left. | l02 |
| canyon | It narrowed, broke in 2020, never recovered | `canyon` | 6s | The walls are the spread. In 2020 they slam apart. | l03 |
| section | The public sector climbed, resource and finance fell | `section` | 6s | Nineteen lift cars, one year counter. | l04 |
| city | Four industries carry more than half the wage bill | `city` | 8s | Lights fill in proportion to each industry's share of the bill. | l05 |
| cutaway | Where pay is lowest, the average sits furthest above | `cutaway` | 6s | The lift stops at the median, then continues to the mean. | l06 |

`sections.md` already carries most of this in prose, under a `**Shot**` line per section: the
duration, the camera, the one move, the on-scene text, the exit. The shot list is that, in a
form a recorder can read.

Two things to keep apart. The **caption** is the line burned into the frame, and it is what the
voice says. The **on-scene text** from `sections.md` is the labels inside the 3D scene, the
numbers on the axes. Mixing them up is how a video ends up with two layers of text saying
different things.

Gate: one claim one shot, the same rule as Gate 2 of the page pipeline. No two shots use the
same form. If two do, one is padding.

## 4. Storyboard

One frame per shot, at 1080x1920, rendered from the **real scene**.

Output: `raw/<slug>/storyboard.json`, `raw/<slug>/storyboard/*.png`, `raw/<slug>/storyboard.png`.

```json
{
  "size": [1080, 1920],
  "fps": 30,
  "shots": [
    { "id": "lift", "scene": "lift", "duration": 5.0, "t": 0.62, "caption": "…", "vo": "l01" }
  ],
  "endCard": { "duration": 2.5, "kicker": "…", "title": "…", "url": "…" }
}
```

Render each frame with the page's own capture switch, which isolates one section full-bleed and
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

Gate: every shot renders full-bleed at 1080x1920, nothing clipped at the edge, no label
overlapping another, and the caption legible over the scene. This is the video's Gate 4.

## 5. Script

The spoken words. One line per shot, plus an opening and an end.

Output: `vo/script.txt`, the format the recorder already reads.

```
l01|The lift climbs from the national median to the education median.
l02|The workforce forks at the median. Most of it goes left.
```

The captions from stage 3 are the starting copy. They are already written, in the Gate 3 mock,
one caption band per frame, marked "BURNED IN AT DELIVERY". Do not rewrite them at this stage.
Write the opening and the end around them.

Rules that are not negotiable, because they were all learned the hard way:

- numbers as words, "seven thousand and seventeen ringgit", never digits
- never say "Artifisi", the voice mangles it
- end on "Visit our website to learn more"
- 7 to 9 lines, about 110 words, near 45 seconds

## 6. Voice-over

The recorded audio, and its timings.

Output: `vo/l01.mp3` and `vo/dur.json`, the two files `record-video.js` already reads.

```
edge-tts --voice en-SG-LunaNeural --rate=-3% --text "<line>" --write-media vo/l01.mp3
```

This stage exists because **the audio is what sets the shot lengths**. Once the durations are
known, the video can be assembled to the millisecond. Before this stage, every timing in the
plan is an estimate.

The instruction to record on a specific PC was about the cloud container not being able to
reach the TTS service. A desktop usually can. Test it before assuming.

Gate: every line recorded, none silent, none clipped, and the total within ten seconds of the
script's word count estimate.

## 7. Video

The assembly.

Output: `out.mp4`, plus the per-shot captures and `log.json` from the recorder.

The recorder walks the shot list, the voice-over is laid over it, the end card closes.

Gate: watch the whole thing once. Then pull eight to ten frames and check them. A mux that
succeeds can still produce a video with the audio half a second out.

---

## The recorder needs rebuilding, not patching

`playbook/tools/record-video.js` drives the households sample. It scrolls to `.vizpage`, clicks
`button[data-view]`, and holds each shot for `dur[i] + 0.35s`. None of that works on a page
built on the shot-mode switches.

What replaces it:

- **Read `storyboard.json`.** The hardcoded `SHOTS` array goes away.
- **Navigate per shot.** One page load per shot at `?shot=<scene>`, not one long scroll.
- **Play the scene.** `window.__stages[i].play()` runs it. The page already exposes the stages.
- **Hold the exact duration.** The shot length comes from the storyboard, enforced by ffmpeg,
  not by a timer that drifts.
- **Burn the caption from the storyboard**, and the end card from its config.
- **Capture one file per shot**, then concatenate. One continuous capture cannot be trimmed
  accurately, because the browser and the audio clock drift apart.

Capture stays a screen recording rather than a frame-by-frame render, because 45 seconds at
30fps is 1350 screenshots and swiftshader is slow. The scenes are deterministic functions of
`t`, so `__seek` still gives you exact frames for the storyboard stills.

## Two traps to design around

**Headless Chrome may not animate.** `requestAnimationFrame` does not tick without a
compositor, and `performance.now()` is frozen under `--virtual-time-budget`. Every screenshot
of a broken animation looked fine. Record headed, or with a Chromium build that composites.
This is rule 7 of `instructions.md` and it applies to the recorder as much as to the page.

**The voice-over is longer than the animation.** The six wages shots total 38 seconds of
scene. The voice-over targets 45. The extra seven seconds have to land somewhere, and if the
shot is held on its final frame it is dead air. Either the voice-over lines fill their shot
with the pause baked in, or the scene loops once, or the end card takes the slack. Decide this
before recording, not after.

## The numbers do work out

Six captions, 60 words. At about 2.4 words a second that is roughly 25 seconds of speech.
The scene has 38. Every caption fits its own shot with room to spare:

| shot | caption words | scene duration | budget at 2.4 wps |
|---|---|---|---|
| lift | 11 | 5s | 12 words |
| floor | 11 | 7s | 16 words |
| canyon | 10 | 6s | 14 words |
| section | 6 | 6s | 14 words |
| city | 11 | 8s | 19 words |
| cutaway | 11 | 6s | 14 words |

So the opening line and the end line have about 30 to 50 words between them, and the shot
lengths are set by the scenes, not by the speech. That is the comfortable way round.

## Files a video needs

```
raw/<slug>/shots.md          the shot list, one row per shot
raw/<slug>/storyboard.json   machine readable, with timings and captions
raw/<slug>/storyboard/       one PNG per shot, 1080x1920
raw/<slug>/storyboard.png    contact sheet, for review

vo/script.txt                l01|text, one line per voice line
vo/dur.json                  per line durations in seconds
vo/l01.mp3                   the audio

out.mp4                      the video
```

The page itself still needs `index.html` and `scene.js`, because the storyboard is rendered
from the page and the recorder drives the page.

## Open

- One video per story, or one per shot. The chain above assumes one per story: a shot list
  becomes one video.
- How many videos the service actually sells. The rate card says three at Standard and six at
  Flagship, each 40 to 55 seconds. The wages report has 38 seconds of scene in total, so three
  45 second videos cannot come from these six shots without either re-chunking the story or
  padding. The sales kit and the pipeline have to agree on this before either is used again.
