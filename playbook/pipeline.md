# Pipeline: public data to published page

Supersedes the build steps in `instructions.md`. That one assumes the story is already found. This one is about finding it, proving it, and only then drawing it.

Eleven stages, four gates. Every stage produces a file. If a stage has no file, it did not happen.

The video pipeline is `video.md`. It shares stages 1 to 5 with this one, then branches and
rejoins after the page is built.
---

## 1. Pick

One paragraph: topic, audience, why now, what people search for.

Pass: you can name the audience and the question they arrive with.

Output: `raw/<slug>/brief.md`

## 2. Acquire

The source itself. Report PDF, CSV, API dump. Record the licence, the publisher, the publication date and the author. If the licence is not open, stop here.

Output: `raw/<slug>/source.*` and `source.md` with the citation block.

## 3. Verify

Build `numbers.csv` before anything else. One row per figure the page will use:

```
id, value, unit, year, source_ref, wording
```

`source_ref` points at where the figure lives in the source: a page number for a PDF, a field and row key for a dataset (`wages_median`, `section=P`), a sheet and cell for a spreadsheet. `wording` is the label the source itself uses, copied. Not a paraphrase.

**Gate 1.** No number without a source reference. No number taken from a summary, a news article or a model's memory. If a figure cannot be traced to the source, it does not go on the page.

The reference only has to be as precise as the source allows. A report has pages, a dataset has rows. What Gate 1 rules out is a number with no path back to a source at all. The figures are checked against the source at Gate 4, and that diff is recorded in `qa.md`.

## 4. Analyse

What the numbers mean together, not one by one.

Output: `story.md` with four lines:

- the claim, in one sentence, as a headline
- the evidence, which rows from `numbers.csv`
- the counterpoint, what a careful reader would object to
- the so what, why this changes a decision

## 5. Section

Six to eight sections. Each one is one claim and one shape.

```
n, headline, claim, number_ids, viz_type, motion, interaction
```

**Gate 2.** Every section has exactly one claim. No two sections use the same viz type. If two do, one of them is padding.

Output: `sections.md`

## 6. Palette

Before the viz, not after. The palette decides how a scene reads. A dark ground with lit marks
is a different drawing from a cream ground with pale ones, and you cannot design the mechanism
until you know which one you are drawing into.

Two rules, and both of them are about not copying.

**A report does not reuse a previous report's palette.** The pages share a publisher, not a
skin. `palettes.md` is the registry of what has been used. Check it before you start, and add
the new palette to it when you are done.

**The palette comes from the subject.** The colours have to be something this subject could
produce. Not the house colours, not the colours that read as "data report".

### Picking one

The picker is a reference image. Find a photograph of the thing the report is about, the kind
of thing a reader would have seen that morning, and take the palette off it:

1. image search the subject, several candidates
2. read the dominant colours off the best ones, in hex, largest area first
3. keep one that is unmistakably not a palette already in the registry

Then build the working palette from it. It needs a background, a panel, ink, a hairline, a
muted and a dimmed, plus one accent for the subject and one for the comparison.

The accents are not decoration. They are the two halves of the story. The CPI report's accents
are a backlit blue and an LED red because the story is a cooling half and a heating half, and
the palette is the argument before a word is read.

Output: the palette in `tokens.css` and in `playbook/palettes.md`, with the subject it came
from and the reference image it was picked from.

## 7. Viz

Design a viz that fits the story this data is telling. Not a chart that could be about
anything with the data dropped in.

The form is chosen from the mechanism in the story, not from the table below. The table is a
set of answers to questions, not a shopping list.

| Question | Form |
|---|---|
| how big | one object, one reference |
| how does it work | simulation |
| where | terrain |
| spread | dots, then they sort |
| ranking | sorted bars |
| over time | line, or depth as time |
| between things | flow |
| inside something | cutaway |

A sorted bar chart in 3D is a sorted bar chart with worse labels and a heavier download. A
line in 3D is a line. If the section's claim can be made by reading the flat version, draw the
flat version and spend the effort on the sentence.

The test is what moves. In one sentence, say what moves in the scene and what that shows. If
nothing moves, it is a chart. If the reader cannot say what the motion demonstrates, it is
decoration.

3D only when depth, count or motion carries meaning. A flat chart that is precise beats a cube
field that is pretty.

Output: one scene per section in `sections.md`: the claim, the mechanism, the shot, and why not a
chart. The drawn sketch is the mock at stage 9.

## 8. Design

After the viz, never before. Type and motion carry meaning, and both should be decided once the
shapes are known. The colour was decided at stage 6 and does not change here.

### Type

Three roles, no more:

- **display**, for the claim. One per page, at most two sizes.
- **text**, for body and captions
- **mono**, for figures, labels, axes, source lines

Rules:

- figures are set in the mono, never the display face. A number in a display serif reads as decoration.
- one type scale, written down, not improvised per section
- line length 60 to 75 characters
- no more than three weights on the page
- the display face is chosen for the subject. Fraunces suits an argument about people. A grotesque suits an argument about systems.

### Motion

- one easing curve, one duration range
- motion explains a change or it does not happen
- `prefers-reduced-motion` respected, and the page still reads

Output: `tokens.css` with colour, type scale, spacing and motion. One file, shared by every page, so a set of pages reads as a family without looking identical. The colour inside it is the one from stage 6 and is not the same one another report used.

## 9. Mock

One page per section, 1440x900, static. The claim in the real display face, the number in the real mono, the sketch, the palette, the caption. Export as a single PDF.

**Gate 3.** Approved in PDF before a line of code. This is the cheapest place to fail, and the only place where a bad section looks bad rather than merely unfinished.

Output: `mock.pdf`

## 10. Build

Text first. Every number in HTML, every claim in a heading. Then the scene on top.

- progressive: with JavaScript off, the page is still readable and every figure falls back to a data table in the HTML
- the scene reads from `data.json`, which is generated from `numbers.csv`. It does not hardcode figures
- labels pinned in 3D, tracking their object
- motion only where it explains

Output: `<slug>/index.html`, `<slug>/scene.js`, `<slug>/data.json`

## 11. QA

**Gate 4.**

- every figure on the page diffed against `numbers.csv`
- every figure on the page also matched backwards against `numbers.csv`, so no number on the page is unaccounted for
- screenshots, desktop and 390px phone, every section and every view
- the palette is the one in `playbook/palettes.md` and not one already used by another report
- no label overlaps, nothing clipped at the edge, every label readable against whatever it sits on
- loads under 1.5s on 4G, scene under 200kb gzipped
- keyboard reachable, reduced motion respected
- no-JS render checked
- the voice-over played once and listened to, every proper noun heard and confirmed intelligible

Output: `qa.md` with the screenshots.

---

## After

Publish, add to the index, log the change. The `numbers.csv` and `sections.md` are also the shot list for the video, so the video costs almost nothing once the page exists.

## Why the gates matter

Gate 1 stops invented numbers. Gate 2 stops the samey page. Gate 3 stops building the wrong thing. Gate 4 stops shipping a wrong figure.

Stage 6 stops the second page looking like the first. It is not a gate because it is cheap to check: the registry is a table, and a palette that is already in it is visible from across the room.

Everything else in this pipeline is recoverable. Those four are not.
