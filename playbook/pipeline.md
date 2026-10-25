# Pipeline: public data to published page

Supersedes the build steps in `instructions.md`. That one assumes the story is already found. This one is about finding it, proving it, and only then drawing it.

Ten stages, four gates. Every stage produces a file. If a stage has no file, it did not happen.

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
id, value, unit, year, page, exact_wording, checked
```

`exact_wording` is the sentence in the source, copied. Not a paraphrase.

**Gate 1.** No number without a page reference. No number taken from a summary, a news article or a model's memory. If a figure cannot be traced to the source, it does not go on the page.

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

## 6. Viz

Pick the form from the question, not from the engine.

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

3D only when depth, count or motion carries meaning. A flat chart that is precise beats a cube field that is pretty.

Output: one sketch per section, in `sections.md`.

## 7. Design

After the viz, never before. Colour, type and motion all carry meaning, and all three should be decided once the shapes are known.

### Colour

- one accent for the subject
- one second colour for the comparison
- grey for context
- background, ink, hairline

Pick from the subject. A page about household money and a page about road deaths should not share a palette. Avoid the default dark navy plus coral unless the subject earns it.

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

Output: `tokens.css` with colour, type scale, spacing and motion. One file, shared by every page, so a set of pages reads as a family without looking identical.

## 8. Mock

One page per section, 1440x900, static. The claim in the real display face, the number in the real mono, the sketch, the palette, the caption. Export as a single PDF.

**Gate 3.** Approved in PDF before a line of code. This is the cheapest place to fail, and the only place where a bad section looks bad rather than merely unfinished.

Output: `mock.pdf`

## 9. Build

Text first. Every number in HTML, every claim in a heading. Then the scene on top.

- progressive: with JavaScript off, the page is still readable and the charts fall back to CSS
- the scene reads from `numbers.csv`, it does not hardcode figures
- labels pinned in 3D, tracking their object
- motion only where it explains

Output: `<slug>/index.html`, `<slug>/scene.js`

## 10. QA

**Gate 4.**

- every figure on the page diffed against `numbers.csv`
- screenshots, desktop and 390px phone, every section and every view
- no label overlaps, nothing clipped at the edge
- loads under 1.5s on 4G, scene under 200kb gzipped
- keyboard reachable, reduced motion respected
- no-JS render checked

Output: `qa.md` with the screenshots.

---

## After

Publish, add to the index, log the change. The `numbers.csv` and `sections.md` are also the shot list for the video, so the video costs almost nothing once the page exists.

## Why the gates matter

Gate 1 stops invented numbers. Gate 2 stops the samey page. Gate 3 stops building the wrong thing. Gate 4 stops shipping a wrong figure.

Everything else in this pipeline is recoverable. Those four are not.
