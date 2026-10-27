# Malaysia CPI, September 2026

Working files for the Malaysia CPI report, one per stage of `playbook/pipeline.md`, so you can
see what was produced when and which one is current.

Only `source.json` is a source. Everything else here is derived and was rewritten as the report
changed. That matters because the folder keeps superseded files rather than deleting them, so
nothing here is current by default.

| File | Stage | Status |
|---|---|---|
| `brief.md` | 1. Pick | current. The dataset, the news cycle, and why this one |
| `source.json` | 2. Acquire | the source. Trimmed rows from seven DOSM open API series |
| `source.md` | 2. Acquire | current. Citation block, field shapes, division table, caveats |
| `story.md` | 4. Analyse | current. Claim, evidence, counterpoint, so-what |
| `sections.md` | 5. Section | current. Six sections, one claim and one mechanism each |
| `tokens.css` | 6. Palette | current. The palette, the type scale and the motion tokens |
| `numbers.csv` | 3. Verify | current. 115 rows, one per figure on the page |
| `qa.md` | 11. QA | current. The figure diff, the palette audit and the known gaps |
| `qa/` | 11. QA | current. Desktop, phone, no-JS screenshots, page text, video frames |
| `shots.json` | video 3. Shots | current. Six shots and an end card, in the film's own order |
| `storyboard/` | video 4. Storyboard | current. One 1080x1920 frame per shot, from the live page |
| `storyboard/storyboard.png` | video 4. Storyboard | current. The contact sheet |
| `vo/script.txt` | video 5. Script | current. Seven voice lines, `l01\|text` |
| `vo/dur.json` | video 6. Voice-over | current. Per line durations. These set the shot lengths |
| `vo/*.mp3` | video 6. Voice-over | the recorded lines, tail silence trimmed. Local, not tracked |
| `video/out.mp4` | video 7. Video | 58.10 seconds, 1080x1920, 30fps. Local, not tracked |
| `video/clips/` | video 7. Video | the per shot captures. Local, not tracked |
| `video/clips.json` | video 7. Video | current. What was captured and how long |
| `video/tmp/` | video 7. Video | the ffmpeg working files. Local, not tracked |

## The story is the composition, not the headline

The headline number is 1.8%, down from 1.9%. That is a dull sentence. What is interesting is
what sits underneath it: transport heated to 2.5% while housing cooled to 1.4%, and the 1.8% is
the net of two opposite shocks. Volatile fuel went up, government-administered tariffs went
down, and the headline barely moved.

So the page never leads with the headline rate. It leads with the price level (37.6% above
2010, and one year of that is only 1.8%), then opens the basket up, then follows the fuel,
then the spread between states, then the split between city and countryside.

The page also never says how much any division *contributed* to the headline, because these
datasets do not publish the basket weights. It says what each division did, never what it
caused.

## The palette is a fuel price board at night

The palette is not the house style. It was picked by searching for the subject — a fuel price
board at night — and reading the dominant colours off the best photographs, then building the
working palette from them. The ground is a near-black panel, the ink is illuminated acrylic
white, and the two accents are a backlit blue and an LED red, which are the cooling half and
the heating half of the story.

The first build reused the wages report's warm cream and was wrong. `playbook/pipeline.md`
now has a palette stage before the viz, and `playbook/palettes.md` is the registry of what has
been used, so the next report cannot do the same thing.

## The film is not the page in order

The page runs `column → ladder → path → drum → dots → split`. The film runs
`path → ladder → drum → dots → split → column`: the surface, the fracture, the cause, the
spread, the uneven landing, and the level. It opens on the flat line and closes on the price
level.

A page is scrolled and a film is watched, so they do not have the same shape. The captions in
`shots.json` are the film's own argument, not the page's section headings, and each shot
records the `beat` it plays.

## The voice never says a word it cannot say

Every recorded line was played and judged on the audio. Five defects were found that way, and
none of them would have shown up in a transcript: "Negeri Sembilan" came out as
"NED-jree SEM-bih-luhn", "RON 95" came out as the single word "run", "headline" came out as
"hate line", and two lines ended on a number with no unit.

The fix is the same rule the pipeline already had for "Artifisi". The place names are out of
the voice and stay on screen and in the caption, and the fuel grade is spoken as "ninety five
octane petrol", which is intelligible and means the same thing.

## Core is not "fuel minus non-fuel"

DOSM's core CPI excludes items with volatile prices **and** items with government-administered
prices. The first draft of the story described core as the basket without fuel, which was
wrong. It is corrected in `story.md`, `sections.md`, the page and the voice-over script.

## Every figure is recomputed, and so is the national one

Most figures on the page are published by DOSM as they stand. The urban, rural and low-income
series publish an index and not a rate, so their rates are computed from the published index
rows for September 2026 and September 2025. The national 1.78% that the low-income figure is
compared against is computed the same way, so the comparison is like for like. The published
headline of 1.8% and the index-derived 1.78% are the same number at different rounding, and
the page says so where it uses each.

Monthly fuel prices are means of the weekly rows in that month. The RON95 market price only
exists from 30 September 2025; before that RON95 was fixed at RM2.05. Every "how much it has
risen" figure starts from December 2025 for that reason.

`numbers.csv` is the register. One row per figure, with the series, the row and the field it
came from. The verifier recomputes all 115 rows from `source.json` and fails on any mismatch.
`qa.md` has the diff.

## The page plays in one second, the video plays for the length of the words

Every scene on the page runs for one second. The video stretches the same scene across its
whole shot with `?dur=<ms>`, so the choreography plays out over nine seconds instead of one.
The scene's internal timings are all in normalised `t`, so the change stretches them
proportionally and nothing breaks. The two rates are deliberate and they are not the same.

## The video is not tracked in git

`out.mp4` and the recorded voice lines are built artefacts, and one report makes one video.
Tracking them would put six megabytes of incompressible blob into the history for every
report that ships, and git keeps every version forever. The root `.gitignore` leaves them out.

Everything needed to rebuild them is committed: `shots.json`, `vo/script.txt`, `vo/dur.json`,
the page and the tools. `voice.py` and `mux.py` put the file back in about three minutes.
The storyboard PNGs stay tracked, so the shots can be reviewed without running anything.

## The theme is a parameter now

`playbook/tools/browser.js` exports `THEMES` and `overlayCSS(theme)` instead of one fixed
overlay. The capture and storyboard tools read `shots.json`, which carries a `theme` field.
This report uses `cpi`, which is a different palette and a different display face from the
wages report. Adding a report with its own house style is now a data change, not a code
change.
