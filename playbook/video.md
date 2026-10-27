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

### The shot list is the argument, so it changes when the rules change

The CPI film had a new opening, a new card shot type and a new ending wall built and shipped,
and the film came out identical, because `shots.json` was never rewritten. The machinery was
ready and nothing called it.

A shot list is the only place the film's argument lives. The rules, the tooling and the shot
list have to land in the same change, or the film does not change and the change is scaffolding.
When you rewrite how a film is made, rewrite the shot list first and check what the new
machinery is for.

The corollary is that a rule nobody enforces is an intention. A new beat, a new shot type or a
new ending has to show up in `shots.json`, and the film has to be re-recorded, before the rule is
a rule.

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
- **a decimal amount is two words, ringgit and sen, and both have to be said.** "four ringgit
  eighteen" collapses into "falling it eighteen". "four ringgit and eighteen sen" is clean.
  "RM4.18" read as digits is worse: "R-M four point eighteen". The caption carries the numeral
  and the voice carries the meaning. This was measured, not preferred. See "A decimal amount is
  ringgit and sen" below.
- never say "Artifisi", the voice mangles it
- **never hand the voice a word it cannot say.** Place names are the trap. The Singapore voice
  says "Negeri Sembilan" as "NED-jree SEM-bih-luhn", the hard g softened into an English dʒ.
  Put the name on screen and in the caption, and say the number instead. If a term has to be
  spoken, find a phrasing the voice can carry. "RON 95" survives, but it comes out as "run
  ninety-five", so the CPI film says "RON 95 petrol" and lets the screen carry the acronym.
- **one idea per sentence.** Fifteen to twenty words, active voice, a connective where the ear
  needs one, and a name where a pronoun would leave the listener guessing.
- end on "Visit our website to learn more"
- 7 to 9 lines, about 110 to 140 words, near 55 seconds

Every figure in the script has to be checked against the shipped data, not the draft. The
`bill` field in `data.json` is a raw product, `share × r25`, and it sums to 107.9. Read raw it
gives 59.96 percent. Normalised, the four bill leaders are 17.4, 15.9, 11.2 and 11.0, which
is 55.6 percent.

Gate: **a stranger has to be able to say what the point is.** Not a transcript check. See "The
script is judged by a stranger" below.

## 6. Voice-over

The recorded audio, its timings, and the timing of every word.

Output: `raw/<slug>/vo/l01.mp3`, `raw/<slug>/vo/dur.json` and `raw/<slug>/vo/words.json`.

```
python playbook/tools/voice.py raw/<slug>/vo
```

This stage exists because **the audio is what sets the shot lengths**. Once the durations are
known, the video can be assembled to the millisecond. Before this stage, every timing in the
plan is an estimate.

It also exists because **the audio is what the picture follows**. `edge-tts` reports where every
word starts and where it ends, and those offsets are what let a chart show its number at the
moment the voice says it. `words.json` keeps them, one list per line, and it is tracked,
because a film that has to be re-cut has to be re-cut the same way.

Gate: every line recorded, none silent, none clipped, and the total within ten seconds of the
script's word count estimate. Then play the recording once and listen to it. Every proper noun
and every technical term has to be heard and confirmed intelligible before the video is cut.
A transcript is not enough, because a mispronounced name transcribes back to the right word
while sounding wrong.

### A pause between sentences is a breath, and the padding is not

`edge-tts` pads every sentence with about nine tenths of a second of silence. Trim the tail of
the line and that padding is still there, between the sentences, and the voice reads as though
it is being chased. Trim it out entirely and the voice is breathless.

The CPI film was first recorded with `silenceremove=stop_periods=-1`, which removes every silent
period wherever it is. The result was a voice with no breath between its sentences: seven
sentences run together with nothing in the gaps. That line measured 6.55 seconds. The same
words, with a third of a second of air in each gap, measured 7.83.

`voice.py` now cuts each long pause back to a third of a second and **keeps** it, and remaps
the word offsets onto the trimmed file, because the offsets `edge-tts` reports are true of the
audio it sent and not of the file on disk. The film got two and a half seconds longer and
sounds like a person.

The trimming rule in general: **cut the tail, never the head.** A cut anywhere but the end
moves every word that comes after it, and the offsets have to move with it.

## 7. Video

The assembly.

Output: `raw/<slug>/video/clips/<id>.mp4`, `raw/<slug>/video/clips.json` and
`raw/<slug>/video/out.mp4`.

```
node   playbook/tools/record-video.js reports/<slug> raw/<slug>/shots.json raw/<slug>/vo raw/<slug>/video
python playbook/tools/mux.py raw/<slug>/video raw/<slug>/vo raw/<slug>/video/out.mp4 raw/<slug>/shots.json
```

The recorder walks the shot list, takes the frames, and the voice-over is laid over them. The
end card closes.

### The film is captured frame by frame, not recorded

This is the one piece of machinery that had to be rewritten from scratch, and it was rewritten
because a screencast could not be made to line up with the audio.

A screencast has to be trimmed from the end, because the browser's clock and the film's clock
drift apart and the tail of the recording is where the flush lands. So a clip cut from the end
**begins after the shot has already started**. Measured on the CPI film: the first second of
every chart's animation was missing and the last second was a frozen frame, in every shot,
and nobody noticed, because a chart that starts ten percent in still looks like a chart.

The fix is to stop recording and start asking. Every scene is a function of `t`, so the
recorder seeks it to the frame it wants and photographs it. Every frame is asked for at the
time it belongs, so the first frame of a clip is the first frame of the shot, the last frame is
the last frame, and the voice lands on the word it names.

The cost was the reason this was not done the first time. The old playbook said a frame by
frame render is too slow: "57 seconds at 30fps is 1700 screenshots and swiftshader is slow".
Measured, it is **67 milliseconds a frame**, so the whole film takes under two minutes. The
screencast was not faster. It was just wrong, and the wrongness cost a second of every shot.

A card is not a scene, so it is not captured like one. Its reveal is a CSS animation, so the
recorder pauses the animation and moves it to the frame's own time with the Web Animations
API. The same handles the wall behind the end card.

Gate: watch the whole thing once. Then pull eight to ten frames and check them. A mux that
succeeds can still produce a video with the audio half a second out.

Pull the frames from across the whole runtime, not from the ends. The storyboard is one frame
per shot at `t = 1`, so any frame that only appears while the scene is animating has never been
looked at by anybody.

Two capture rules, and both of them cost a frame.

**Never capture while the page is still swapping scenes.** The page builds all six scenes and
only then marks the one in the shot as the only one on. A frame taken in between carries one
scene's geometry and its labels on top of another's, and it looks like a rendering bug rather
than a timing one. `openShot` waits for the page to have settled on exactly one section before
anything is captured.

**A card is captured like a scene, not like a still.** The card's reveal is a sequence, so it
needs the same wait the scene needs, and the frame number goes on the card and not on a caption
band. The card's kicker sits at the top of the frame, in the same place as a scene's, so the
furniture of the film does not change when the shot does.

### The page runs at one second, the video runs at the length of the words

The page's scenes play in one second. The video plays the same scene over its whole shot, and
the scene's internal timings are all in normalised `t`, so the choreography plays out across
nine seconds instead of one. The page and the video are deliberately at different rates.

What the video does with `t` is the point of the next section.

---

## The picture follows the voice

A film where the chart finishes its animation while the voice is still on the first clause is a
recording with a chart in it. The chart has to be **on the word**.

`edge-tts` gives the timing of every word, so the chart can be told which word it belongs to.
The report's scene code asks for a phrase and gets a moment:

```js
const aLevel = T.at("Thirty seven point six percent", 0.12);
const aBody = T.end("Thirty seven point six percent", 0.42);
```

`T.at` is the moment the phrase starts and `T.end` the moment it is finished. The second
argument is the fraction the scene has always used, and **it is not a fallback, it is the
page's own timing**. The page has no voice, so it plays the scene exactly as it always has;
the film has a voice, so the same scene plays when the voice says the thing.

That is the whole trick, and it is worth the trouble: **one scene, two clocks, one set of
numbers.** A page reader and a film viewer are looking at the same chart, and the only
difference is when the pieces of it arrive.

Three rules for writing a cue:

- **A cue is a phrase from the voice line, written the way it is spoken.** "four ringgit and
  eighteen sen", not "RM4.18". The matcher compares the letters that carry sound, so a cue with
  different numerals still finds its word.
- **A cue has to be unique in its line.** "one point eight percent" appears twice in the CPI
  path line and matches the first one. "percent now" matches the second.
- **Every cue has to hit.** A scene cue that misses falls back to the page's fraction, which is
  a silent failure. A card cue that misses means the part **never appears at all**, and a
  caption cue that misses means the caption is dropped from the band. The film still builds.

That last one is why there is a gate. `check-cues.py` resolves every cue in the shot list and
every cue in the scene code against the recorded words, and fails when one misses, when the
parts of a card fall out of the order the voice says them, or when the finished film runs past
the length the rate card allows.

```
python playbook/tools/check-cues.py raw/<slug>/vo raw/<slug>/shots.json reports/<slug>/scene.js
```

Run it after the voice-over is recorded and before the film is cut. It is the difference
between a missing cue being caught and a missing cue shipping.

The cards work the same way. A card's parts each name a cue and arrive when the voice says
them, so the premise card's two lines land on "Inflation eased" and "Fuel did not" instead of
on a fixed stagger. A card can also change its layout, so the leads card puts its two numbers
before its verdict, because the voice names the numbers first.

And the caption band works the same way again, one level down: the caption is a phrase, and
each phrase names a cue.

**A card is not a page.** A card's plate is opaque from the first frame, because a plate that
fades in shows the page behind it, and the page behind a card is a report the film has already
left.

---

## The script is judged by a stranger

The CPI film shipped once with a voice-over that the person watching it called gibberish. The
script had been checked: every figure diffed against `numbers.csv`, every line read, the
recording transcribed, the transcript matched. The film still made no sense to the person
watching it.

The reason is that **a transcript is not a comprehension test.** A transcript says the words were
right. It cannot say the listener understood them. Cold, with no picture, the fuel line was
heard as "the fuel Easter lull passed. 95 octane petrol average fouring it 18 a litre". A
listener invented a story, because the words were mangled in a way that still sounded like
words, and the currency had gone missing entirely.

So the gate for a voice-over is not a transcript. It is a stranger.

**The test.** Concatenate the voice lines into one file, the way a listener hears them, and hand
that file to something that has never seen the script and has no picture. Ask it four questions.

1. What is the point of this video?
2. Every number you remember hearing, with its unit.
3. Any stretch you could not follow, word for word.
4. Rate the clarity out of ten, and say what made it unclear.

Then read the answers against the claim the film is making.

The CPI film, rewritten and re-recorded, scores 8.5 out of 10 on that test. It restates the
claim in its own words — "the headline inflation rate appears steady at 1.8%, actual price
levels have climbed significantly, hidden by contrasting sector movements and a large gap
between market-rate and subsidized fuel prices" — and it comes back with every figure in the
right unit, all three currency amounts included, and "none; the entire narration was
intelligible". The same test on the shipped film produced "the fuel Easter lull passed" and
lost the currency.

**A number the listener cannot repeat is a number the film does not have.** That is the whole
lesson. It is why the currency is said as ringgit and sen, why every figure carries its unit,
and why the opening line names the frozen pump price instead of describing it.

**A stretch the listener cannot follow is pointing at a word.** "The market price of run
ninety-five" is the finding that bought "RON 95 petrol". The script was worth one word.

**A complaint about density is a picture problem, not a script problem.** A voice-over carrying
seven figures in a minute is dense on its own. The test is run on the audio alone because that
is the harder case, and the film has the chart and the caption band to make up the difference.

### A decimal amount is ringgit and sen

Measured, not preferred. The same price was synthesised three ways and each was played cold.

| Said as | Heard as |
|---|---|
| "RM4.18" | "R-M four point eighteen" |
| "four ringgit eighteen" | "falling it eighteen" |
| "four ringgit and eighteen sen" | "4 ringgit and 18 sen", clean, twice out of two |

The house rule was "numbers as words", and it is what destroyed the currency: "four ringgit
eighteen" leaves the voice to guess where the amount ends, and it guesses wrong. "RM4.18" read
as digits is worse, because a retail price read as an abstract decimal is a known mistake in
Malaysian usage. "Ringgit and sen" is also the way the amount is said out loud, so the voice is
finally saying what a person would say.

Two rules fall out of it. Every decimal amount is ringgit then sen, and the sen is never
dropped: "two ringgit five" is heard as an amount with no sen in it. And the caption carries the
numeral in the reader's form, "RM4.18", while the voice carries the meaning. The band is not
the narration.

Percentages are read the way they are written, "one point eight percent", and they survive.

---

## The craft of the cut

Five habits, taken from watching short video that holds attention, and all five of which
the first CPI film did not have.

**The caption is the script, not a subtitle.** In a good short, the burned-in caption at the
bottom is the narration itself, changing as the voice moves. Read in order the captions are
the whole video. Turn the sound off and you have lost the voice, not the argument. Our film
held one static line at the bottom of the frame for the whole eight seconds, which is a title,
not a caption.

The timings for this are free and we were throwing them away. `edge-tts` emits a WordBoundary
event for every word it speaks, with the word's offset in the audio. `voice.py` records the
audio and discarded those events. It writes them out now, and the recorder burns the caption
from them, one phrase at a time, timed to the voice.

**But not the narration itself.** The script spells every figure out, because the voice reads
digits as digits, so a caption taken straight from the voice says "one point eight percent"
where a reader wants "1.8%". So the caption is written separately, in the numerals a reader
wants, and each phrase is pinned to a cue in the voice:

```json
"captions": [
  { "cue": "four ringgit eighteen", "text": "RON95 averaged RM4.18." },
  { "cue": "up fifty nine point seven percent", "text": "Up 59.7% since December." }
]
```

The voice says the number and the caption says the number, in the two forms each of them
wants, and they arrive together. A shot with timed captions starts with an empty band: the
static line is never the first thing in it, or the band shows a sentence the voice is not
saying for a frame.

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

## Seven traps

**A cold open is a trap.** The CPI film's first version opened straight on the 36 month line.
It was correct, it was the baseline, and it was invisible: the frame carried no claim, so the
first two seconds said nothing to anyone who was not already reading. The premise beat fixes
it, and the fix is a rule, not a taste: the first frame states the claim in type, and the
baseline follows it rather than replacing it.

**A script can be correct and still be gibberish.** Every figure in the shipped CPI script was
diffed against the source, every line was read, the recording was transcribed and the
transcript matched. A listener with no picture still heard "the fuel Easter lull passed" and
lost the currency. Correctness is not comprehension, and only a listener can tell the two
apart. See "The script is judged by a stranger".

**Playwright records at CSS resolution and never scales up.** The screencast is the viewport
size in CSS pixels. Ask for a 540 wide viewport and a 1080 wide video and the page lands in
the top left corner with the rest of the frame empty. The capture viewport therefore has to
be the frame size, 1080x1920, at device scale one. `frameContext()` in `playbook/tools/browser.js`
is the one place that knows this, and both the storyboard and the recorder use it.

**edge-tts pads every sentence, not just the line.** The tail of the line is padded with about
a second of silence, and left in it is dead air that pushes the runtime past the target on its
own. But the gap between two sentences is padded with about nine tenths of a second too, and
that one is not obvious: the line still plays, still sounds fine in isolation, and reads as
though it is being chased. `voice.py` cuts the tail and cuts each long pause back to a breath,
and remaps the word offsets onto the trimmed file, because a cut anywhere but the end moves
every word that comes after it.

**A screencast cannot be lined up with the audio.** The recorder used to record the page and
trim the recording from the end, because the browser's clock and the film's clock drift apart
and the tail is where the flush lands. So every shot began about a second after it had
actually started and held a frozen frame at the end, and the charts all looked fine. Capture
the frames instead: ask for each one at the time it belongs.

**A camera sweep needs room.** The city scene orbits the camera. On the page's wide canvas
the block stays in frame; in a narrow portrait canvas it walks out of the left edge and the
building is cut in half. The scene now scales its sweep to the aspect it has, so the page's
wide figure gets the full sweep and a narrow canvas gets what it can hold. The same fix
belongs to any scene that moves the camera after it fits.

**A storyboard PNG is not evidence of a code change.** The scene's labels are DOM elements
sitting over the canvas, and the browser rasterises their text a little differently from one
capture session to the next. A re-rendered storyboard therefore differs from the committed one
by a few hundred antialiased pixels in every label row, with the glyphs in the same place, even
when the code has not moved. The CPI ladder's fourteen division names changed by exactly that
much when the scene was re-rendered for the voice work, and the value labels beside them did not
change at all, which is the tell: a scene that actually changed moves the chart and the labels
together, and a change in rasterisation moves only the type. Do not settle this by diffing a
fresh render against a PNG that was made weeks ago. Render the old code and the new code in the
same session and compare those, and if the old code does not reproduce its own committed PNG
either, the PNG was never the evidence.

---

## Files a video needs

```
raw/<slug>/shots.json         the shot list, machine readable
raw/<slug>/storyboard/*.png   one PNG per shot, 1080x1920
raw/<slug>/storyboard.png     contact sheet, for review

raw/<slug>/vo/script.txt      l01|text, one line per voice line
raw/<slug>/vo/dur.json        per line durations in seconds
raw/<slug>/vo/words.json      per line word offsets, and the sentences they make
raw/<slug>/vo/l01.mp3         the audio, local, not tracked

raw/<slug>/video/clips/*.mp4  the per shot captures, local, not tracked
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
playbook/tools/record-video.js   one clip per shot, captured frame by frame
playbook/tools/voice.py          edge-tts, trimmed, measured, timed to the word
playbook/tools/check-cues.py     every cue lands, and the film fits the rate card
playbook/tools/mux.py            concatenate, lay the voice over
playbook/tools/package.json      playwright and three
```

`ffmpeg` and `ffprobe` have to be on `PATH` for the last two. `edge-tts` is a pip install.
`three` is served from a local unpacked build, pointed at by the `THREE` environment
variable, so a run cannot quietly depend on the network.

Capture is a frame by frame render, not a screen recording. This used to be the other way
round, on the grounds that "57 seconds at 30fps is 1700 screenshots and swiftshader is slow".
Measured, a frame is 67 milliseconds, so the whole film is under two minutes, and the frame by
frame render is the only way to put a frame at a known time. The scenes are deterministic
functions of `t`, so `__seek` gives exact frames for the storyboard stills as well.

## Open

- The city scene carries no annotations. The Gate 3 mock has "four industries carry 55.6%"
  over the skyline and the live scene does not, so the video shot is plainer than the mock.
- Whether the video is published anywhere yet, or only handed over, is not settled here.
