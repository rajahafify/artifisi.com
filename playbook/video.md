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
end of stage 5 and rejoins after stage 10.

```
page pipeline   1 pick ─ 2 acquire ─ 3 verify ─ 4 analyse ─ 5 section ─ 6 palette ─ 7 viz ─ 8 design ─ 9 mock ─ 10 build ─ 11 qa
                │                                               │                                               │               
video pipeline  └----------- 1 report ---- 2 story ---- 3 shots ┴-----------------------------------------------4 storyboard - 5 script - 6 vo - 7 video
```

Stages 6, 7, 8 and 9 of the page pipeline are page-only. The video needs the built page.

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
compressed to one sentence, the video will not work, and it is a story problem, not a
video problem.

### The five beats

A film has five beats, and they are not the page's sections.

| Beat | What it does |
|---|---|
| the premise | one sentence saying what the report found, before any chart |
| what the data shows | the evidence, the figures, the shape of them |
| what the data meant | the reading, the part the headline hides |
| what the data leads | where this goes. an opportunity, a risk, a decision |
| the ending | the sign-off |

This is the standard arc of a data story and it is not optional. The same order turns up in
every framework worth reading: finding, significance, evidence, implication. Never background,
methodology, data, conclusion. The meaning cannot be read off the evidence until the evidence
is on screen, so the beats are in that order and not the other way round.

The fourth beat is the one a report usually does not have and a film cannot do without. It is
the so-what: the opportunity, the risk, or the decision the data points at. A report that
cannot say what its data leads to does not have a finished story, and a film that skips it is
a recording of a page.

### The premise is a promise, and it comes first

Research on short-form retention puts the scroll-or-stay decision inside the first second and
the value proposition inside the first two. Most of the viewers who leave a video leave it
there. So the opening frame carries the claim, in type, on the first frame, and it has to work
muted.

Two rules, and both of them are about the opening:

- **The first frame shows the claim, not a chart.** A cold open on a chart with no stated
  claim is the commonest reason a good film flops. Setup, logos and dead air in the opening
  second are worse.
- **The baseline comes before the deviation.** Establishing what normal looks like before
  showing what changed is what makes a number mean something, and it is the step most data
  videos skip.

The film also needs its own **order**, and it is not the page's order. The page runs top to
bottom, section by section, because a reader scrolls. A film has an argument, and an argument
has a shape: the surface first, then the fracture, then the cause, then the consequence, then
the landing. Reordering six existing scenes into that shape is the work of this stage, and it
is the difference between a film and a recording of the page.

Two reports from the same publisher must not cut the same way either. The Malaysia CPI film
opens on the flat line and closes on the price level, the opposite of its page order, because
that is the order its argument needs.

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

The order in the file is the order on screen. It is the argument, so write it as the
argument and not as the page order. The shot list records why each shot sits where it does, in
a `beat` field, so a later reader can tell a deliberate sequence from an accident.

### A shot is a scene or a card

A **scene** is a figure from the page. A **card** is a full-frame typographic plate the
recorder builds, the same way it builds the end card. Cards are for the two frames a film
needs and a report does not have: the opening premise and the closing implication. A card
carries its own kicker, its own claim, one or two figures and a line. It gets the frame number
and no caption band, because the text on the card is the text of the shot.

```json
{ "id": "premise", "card": {
    "kicker": "Malaysia · consumer prices · September 2026",
    "claim": ["Inflation eased.", "Fuel did not."],
    "figs": [
      { "n": "1.8%", "l": "headline inflation, year on year", "tone": "cool" },
      { "n": "RM4.18", "l": "average RON95 market price", "tone": "warm" }
    ] }, "vo": "l01", "plan": 6 }
```

`tone` is `cool` or `warm`, the report's two accents. The card's kicker sits at the top of the
frame, in the same place as the scene shots' kicker, so the furniture of the film does not
change when the shot does.

Gate: one claim one shot, the same rule as Gate 2 of the page pipeline. No two **scene** shots
use the same form. If two do, one is padding. The premise card and the leads card are
deliberately the same device, at the two ends of the film, and that repetition is the point:
the viewer sees the same plate at the open and the close and reads them as a pair.

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
- **never hand the voice a word it cannot say.** Place names are the trap. The Singapore voice
  says "Negeri Sembilan" as "NED-jree SEM-bih-luhn", the hard g softened into an English dʒ,
  and "RON 95" comes out as the single word "run". Both were measured on the recorded audio,
  not guessed. Put the name on screen and in the caption, and say the number instead. If a term
  has to be spoken, find a phrasing the voice can carry: "ninety five octane petrol" instead of
  "RON 95", which is intelligible and means the same thing.
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
script's word count estimate. Then play the recording once and listen to it. Every proper noun
and every technical term has to be heard and confirmed intelligible before the video is cut.
A transcript is not enough, because a mispronounced name transcribes back to the right word
while sounding wrong.

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

## The craft of the cut

Five habits, taken from watching short video that holds attention, and all five of which
the first CPI film did not have.

**The caption is the script, not a subtitle.** In a good short, the burned-in caption at the
bottom is the narration itself, three or four words at a time, changing about once a second.
Read in order the captions are the whole video. Turn the sound off and you have lost the
voice, not the argument. Our film held one static line at the bottom of the frame for the
whole eight seconds, which is a title, not a caption.

The timings for this are free and we are throwing them away. `edge-tts` emits a WordBoundary
event for every word it speaks, with the word's offset in the audio. `voice.py` records the
audio and discards those events. It should write them out, and the recorder should burn the
caption from them, one phrase at a time, timed to the voice.

**The first frame carries a proof, not a promise.** The strongest openers do not describe what
is coming. They put the finished thing in the first frame. "I didn't edit a single second of
this" is a claim in display type with the artefact already visible beside it, and the proof
arrives in the same second, not twenty seconds later.

**Hold the frame, change the layers.** The best short video holds one base shot for its whole
length and swaps what is composited on top of it. The camera never moves, so the motion the
viewer feels comes from the layers, and the viewer never loses their place. We have no
presenter, so our base shot is the ground: one palette, one type scale, one camera angle, and
the film changes what sits on top of it.

**Put the type behind the chart, not on top of it.** A label that sits on a filled shape has
to be given a plate of its own, because there is nothing to read it against. A line of display
type hung behind the chart in depth has the same problem solved by the depth instead: the
chart stands in front of the type and the type reads around it. It is the same move as putting
text behind a presenter's head, and it is the reason the scene is a scene and not a table.

**The last frame is the whole report.** The end card does not sit on an empty ground. Every
chart the report drew is laid out as one surface and blurred behind the sign-off, so the film
ends on everything at once instead of a title card in the dark.

Three smaller rules that cost nothing. One accent colour, used for the same job every time.
A small vocabulary of devices, reused, so the fourth idea arrives in a shape the viewer
already recognises. And the payoff is shown, not claimed: the reel says "watch" and then
plays the thing, instead of telling you it works.

## Four traps

**A cold open is a trap.** The CPI film's first version opened straight on the 36 month line.
It was correct, it was the baseline, and it was invisible: the frame carried no claim, so the
first two seconds said nothing to anyone who was not already reading. The premise beat fixes
it, and the fix is a rule, not a taste: the first frame states the claim in type, and the
baseline follows it rather than replacing it.

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
