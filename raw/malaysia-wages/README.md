# Malaysia wages

Working files for the Malaysia wages report, one per stage of `playbook/pipeline.md`, so you
can see what was produced when and which one is current.

Only `source.json` is a source. Everything else here is derived and was rewritten as the report
changed. That matters because the folder keeps superseded files rather than deleting them, so
nothing here is current by default.

| File | Stage | Status |
|---|---|---|
| `brief.md` | 1. Pick | current. Reconstructed after the fact, and labelled as such |
| `source.json` | 2. Acquire | the source. 960 rows, DOSM `wages_industry` |
| `source.md` | 2. Acquire | current. Citation block, field shapes, caveats |
| `numbers.csv` | 3. Verify | current. 70 rows, one per figure on the page |
| `story-v2.md` | 4. Analyse | current. "The ladder got shorter" |
| `story.md` | 4. Analyse | **superseded**. Holds a claim that was withdrawn. Do not use |
| `sections.md` | 5. Section | current. Six sections, one claim and one mechanism each |
| `tokens.css` | 7. Design | current. The palette, type scale and motion tokens |
| `_mock.cjs` | 8. Mock | the generator. Reads `data.json` and writes `mock2.html` |
| `mock2.html` | 8. Mock | current. Six frames at 1080x1920, the Gate 3 mock |
| `mock2.pdf` | 8. Mock | current. The approved Gate 3 artefact |
| `mock.html`, `mock.pdf` | 8. Mock | superseded, version 1 |
| `data.json` | 9. Build | working copy of `reports/malaysia-wages/data.json`. See below |
| `viz.html` | — | superseded. The single 48 second film prototype, replaced by six scenes |
| `qa.md` | 10. QA | current. The figure diff and the known gaps |
| `qa/` | 10. QA | current. Screenshots, desktop, phone, no-JS and the video frames |
| `shots.json` | video 3. Shots | current. Six shots and an end card, 1080x1920 portrait |
| `vo/script.txt` | video 5. Script | current. Seven voice lines, `l01\|text` |
| `vo/*.mp3` | video 6. Voice-over | the recorded lines, tail silence trimmed. Local, not tracked |
| `vo/dur.json` | video 6. Voice-over | current. Per line durations. These set the shot lengths |
| `storyboard/` | video 4. Storyboard | current. One 1080x1920 frame per shot, from the live page |
| `storyboard/storyboard.png` | video 4. Storyboard | current. The contact sheet |
| `video/out.mp4` | video 7. Video | 57.5 seconds, 1080x1920, 30fps. Local, not tracked |
| `video/clips/` | video 7. Video | the per shot captures. Local, not tracked |
| `video/clips.json` | video 7. Video | current. What was captured and how long |

## The two copies of data.json

`data.json` here is the working copy that `_mock.cjs` reads. The page loads the copy at
`reports/malaysia-wages/data.json`. They must be identical.

They drifted once already. The working copy was missing the `bill` field on every section, which
`_mock.cjs` reads six times. A stale copy does not error, it silently draws the wage bill
figures wrong. Both copies were re-synced on 2026-10-26.

## How to read data.json

`bill` is `share x r25`. It is a raw product, **not** a percentage, and it sums to 107.9 across
the 19 sections. The scene divides by the total at render time, which is where 55.6% comes from.

Read the field directly and the four bill leaders look like 59.96% instead of 55.6%. Recomputing
the ratio gives 17.4, 15.9, 11.2 and 11.0, which matches the page and `qa.md`. `share` also sums
to 99.8 rather than 100, which is rounding in the source.

## The video captions already exist

`mock2.html` carries a caption band on each frame, marked "BURNED IN AT DELIVERY". That copy is
the starting point for the voice-over script in step 8 of the pipeline:

1. The lift climbs from the national median to the education median.
2. The workforce forks at the median. Most of it goes left.
3. The walls are the spread. In 2020 they slam apart.
4. Nineteen lift cars, one year counter.
5. Lights fill in proportion to each industry's share of the bill.
6. The lift stops at the median, then continues to the mean.

They became `vo/script.txt` and the caption burned into each frame. The burned caption and the
spoken line are the same sentence, deliberately. The voice-over script in `vo/script.txt` is
longer, because it has to carry the figures as words.

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

## Superseded files

Kept because the audit trail is the point, but do not build from them. `story.md` holds a claim
that was withdrawn; `wiki/contradictions.md` records why and what replaced it.
