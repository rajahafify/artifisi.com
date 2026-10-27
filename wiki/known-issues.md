# Known Issues

**Summary**: Bugs, risks, and known problems in the project.  
**Last updated**: 2026-10-28

---

## Overview

Tracked issues discovered during codebase ingestion and development.

## Active Issues

### The pipeline writes derived files into `raw/`, which AGENTS.md calls immutable

- `AGENTS.md` calls `raw/` "immutable source material" and puts "modify `raw/`" in the Safety Rules.
- `playbook/pipeline.md` puts eight stage outputs in `raw/<slug>/`: `brief.md`, `source.md`, `numbers.csv`, `story.md`, `sections.md`, `tokens.css`, `mock.pdf`, `qa.md`. Only `source.*` is actually a source. The rest are working files that get rewritten.
- The cost is visible in `raw/malaysia-wages/`: `story.md` and `story-v2.md` both sit there, `mock.html` and `mock2.html` both sit there, plus `viz.html`, a superseded prototype. Nothing in AGENTS.md's model has a place for a per-report working directory.
- Partly mitigated on 2026-10-26: `raw/malaysia-wages/README.md` now marks which file is current for each stage, and `story.md` carries a superseded banner naming the withdrawn claim.
- Raised again on 2026-10-27 by the CPI report, which followed the same precedent: `raw/malaysia-cpi/` holds the fetched rows in `source.json` beside eleven derived artefacts. Fifth time raised.
- Unresolved: whether the fix is a fifth folder in AGENTS.md's model, or a relaxation of the `raw/` rule. Recorded in [[contradictions]].

### The wiki is broadly stale

- `features.md`, `file-map.md`, `architecture.md`, `setup.md`, `decisions.md` and `open-questions.md` still describe the Rails 8 app that was removed on 2026-10-24. `index.md` Quick Reference was corrected on 2026-10-26; the rest was not.
- The `reports/` subdomain has no wiki page at all.
- Owner: unassigned. A full wiki refresh is a separate piece of work.

### The pipeline tools are partly hardcoded to the households sample

- `playbook/tools/screenshots.js` maps section names `house, districts, squeeze, plate, ageing`. The wages report uses `lift, floor, canyon, section, city, cutaway`, so the view count silently falls back to 1 per section.
- `playbook/tools/record-video.js` was rebuilt on 2026-10-27 and no longer hardcodes anything about the households sample. It reads the shot list, the voice-over durations and the overlay from `raw/<slug>/shots.json` and the page.
- Dependencies are declared in `playbook/tools/package.json` (Playwright 1.64.1, three 0.180.0). They were previously undeclared.

### The video is produced, but the tooling was rebuilt to get there

Resolved on 2026-10-27. The Malaysia wages short is 57.5 seconds, portrait 1080x1920, 30fps, with the voice-over laid on the shot boundaries. `playbook/video.md` was rewritten to match what actually ran.

The finished video and the recorded voice tracks are local artefacts and are not tracked in git. One report makes one video, and tracking them would add six megabytes of incompressible blob to the history for every report that ships. The shot list, the script, the durations and the storyboard are tracked, so `voice.py` and `mux.py` rebuild the file in about three minutes.

What the first run found, which the plan had not:

- **Playwright records at CSS resolution and never scales up.** The screencast is the viewport size in CSS pixels, so a 540 wide viewport recorded into a 1080 wide video leaves the page in the top left corner with the rest of the frame empty. The capture viewport has to be the frame size. `frameContext()` in `playbook/tools/browser.js` is now the single place that knows this.
- **edge-tts pads every line with about a second of silence.** Seven lines added six and a half seconds of dead air to a 57 second video. `voice.py` trims the tail as it writes, so `dur.json` holds the length of what is actually spoken.
- **The headless rAF trap does not apply to Playwright.** Measured at 45fps in the headless shell and 41fps in the full Chromium channel, so the recorder captures live animation rather than static frames. The trap was real for `--virtual-time-budget`, not for Playwright.
- **Two scene framing bugs the storyboard caught.** The lift cropped its tick labels at 9:16 and the city walked out of the left edge of the portrait canvas, because it orbits the camera after it fits. Both are fixed in `reports/malaysia-wages/scene.js`.

Still open:

- The city scene carries no annotations. The Gate 3 mock has "four industries carry 55.6%" over the skyline and the live scene does not, so the video shot is plainer than the mock.
- `ffmpeg` is installed but only the real binary in the WinGet package folder. The link at `%LOCALAPPDATA%\Microsoft\WinGet\Links\ffmpeg.exe` is still a zero-byte file, so `ffmpeg` and `ffprobe` have to be on `PATH` for `voice.py` and `mux.py` to find them. The link being zero bytes is not enough: Python's `subprocess` finds it first and fails with `WinError 193`, "%1 is not a valid Win32 application". The fix is to put the real binary first on `PATH`: `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin`.
- Whether the video is published anywhere, or only handed over, is not settled.

### Known gaps in the wages report

Recorded in `raw/malaysia-wages/qa.md`:

- Section 2 is two lanes, not the nineteen bins `sections.md` specifies. Nineteen bins at 9:16 forces each under 20px. The caption was rewritten to match what is drawn.
- Sections 4 and 5 read thin at `t = 0`, because their claim is the growth itself. The camera cannot compensate: the bounding box at `t = 0` and `t = 1` is identical.
- The 2020 counterpoint in section 3 is in the prose, not burned into the frame. The video version needs it as a lower third.
- `?only=` and `?still=` are build helpers left in the shipped page. Inert without the query string.
- The "loads under 1.5s on 4G" check in stage 10 of the pipeline was never measured. `qa.md` records the weight table, 99 KB on first load, and nothing about load time.

### Known gaps in the CPI report

Recorded in `raw/malaysia-cpi/qa.md`:

- The ladder scene draws thirteen division rates with their August ticks. The month-on-month column is only in the fallback table, so those figures are read from the table.
- Four of the six CPI scenes are still charts in 3D rather than mechanisms: sorted bars, a 36 month line, state dots and two columns. `playbook/pipeline.md` stage 7 and `playbook/instructions.md` rule 1 both say the form has to come from the mechanism in the story. These four were kept for now and are the next thing to rebuild.
- The 36 month path scene draws the headline and core lines. The band rails are labelled rather than drawn as filled area.
- The path scene's end label used to run off the right edge of the portrait frame. The camera was framing the extent box, and the extent reserved less room on the right than the label needed. Fixed on 2026-10-27 by widening the right edge of the extent.
- `?dur=<ms>` and `?only=` are capture helpers left in the page. Inert without the query string.
- The "loads under 1.5s on 4G" check in stage 11 of the pipeline was not measured. `qa.md` records the weight table, about 21 KB gzipped on first load, and nothing about load time.

### Six WebGL contexts on one page can be dropped by Chromium

- The CPI report puts six three.js canvases on one page. Chromium drops the oldest contexts when a page holds too many, and the first storyboard came back with blank frames and `CONTEXT_LOST_WEBGL` in the console.
- `openShot` in `playbook/tools/browser.js` now waits for `!gl.isContextLost()` before it captures, and the CPI `Stage` listens for `webglcontextrestored` and redraws. Both guards are load-bearing. Removing either brings the blank storyboard frames back.
- A report with more than about six scenes needs a different approach, probably one canvas that swaps scenes rather than one canvas each.

### A storyboard PNG is not a regression signal

- The scene's labels are DOM elements over the canvas, and the browser rasterises their text slightly differently from one capture session to the next. A re-rendered storyboard therefore differs from the committed PNG by a few hundred antialiased pixels in each label row, with the glyphs in the same place.
- Measured on 2026-10-27: the CPI ladder's fourteen division names changed by 8883 pixels when the scene was re-rendered, while the value labels beside them changed by none. The old code rendered in the same session did not reproduce its own committed PNG either. Rendering the old and new code in one session showed the scene was byte-identical apart from the caption band.
- A scene that actually changed moves the chart and its labels together. Rasterisation noise moves only the type. Compare two renders made in the same session, never a fresh render against a PNG made weeks ago.

### A correct script can still be unintelligible in the ear

- The CPI film shipped on 2026-10-27 with a voice-over the person watching it called gibberish. Every check the pipeline had passed: the figures were diffed against `numbers.csv`, the lines were read, the recording was transcribed, and the transcript matched.
- The gate was wrong, not the script. A transcript says the words were right; only a listener can say the words were understood. A cold listener with no picture heard "the fuel Easter lull passed" in the middle of the fuel line and lost the currency entirely.
- The house rule "numbers as words" turned out to be what destroyed the currency. "four ringgit eighteen" is heard as "falling it eighteen"; "four ringgit and eighteen sen" is clean. Reading a retail price as an abstract decimal is a documented common mistake in Malaysian usage, so "RM4.18" as digits is worse still.
- Fixed on 2026-10-28. The script was rewritten, every decimal amount is now spoken as ringgit and sen, `playbook/tools/check-cues.py` resolves every cue against the recorded words, and the script is gated on a cold listen. The rewritten film scores 8.5 out of 10 for clarity and the listener restates the claim in its own words.
- The lesson that generalises: a script written for an ear needs a listener in the loop, and a cue-driven film needs its cues checked against the recording. Neither is checkable by reading.

### Prices live in two places

- Was: `playbook/sales/rate-card.md` and `reports/index.html` both carried the price list. Nothing enforced that they match. Both said so in a comment; neither was generated from the other.
- Resolved on 2026-10-27. The front door at reports.artifisi.com became a library of published reports with a general contact form and no prices, so the rate card is the only copy. The duplication risk is gone with the second copy.

### Service tax treatment is unverified

- `playbook/sales/rate-card.md` says "Service tax is charged where the law requires it" and `reports/index.html` says "Prices exclude service tax where it applies". Nobody has confirmed the treatment. Needs an accountant.

## Risks to Monitor

- **No automated tests.** Nothing fails if a report page breaks. QA is manual and recorded in `raw/<slug>/qa.md`.
- **One shared Formspree form.** The main site and `reports.artifisi.com` both post to `xeaaobag`. A problem with that id takes down both enquiry forms, and both land in one inbox.
- **Two Cloudflare Pages projects.** A change to the main site build can affect the reports project unless `reports/*` is in its exclude list. Set up on the dashboard, not in the repo.
- **Playwright, three.js and fonts are not vendored.** The capture scripts need `THREE` pointed at an unpacked local build, because the environment cannot reach jsDelivr or unpkg.

## Open Questions

- Should the figure trigger stay click-only, or gain a hybrid that runs without the reader clicking? Open question as of 2026-10-26.
- Is there a monitoring or alerting setup for the Pages projects?
- Should `raw/malaysia-wages/` keep both generations of `story.md` and `mock.pdf`?
- Should `playbook/sales/services-agreement.md` move from "40 to 55 seconds" to "up to 60 seconds" to match the rate card and the front door? See [[contradictions]].
- Should the CPI report carry a `core` claim of its own, given core is the cleanest read on the composition story? It is currently one line inside the path scene rather than a scene of its own.

## Important Files

- `playbook/pipeline.md` — the eleven stages and four gates
- `playbook/instructions.md` — build and ship rules
- `raw/malaysia-wages/qa.md` — figure diff and screenshots for the wages report
- `raw/malaysia-cpi/qa.md` — figure diff, render checks and screenshots for the CPI report
- `reports/index.html` — the customer-facing prices and enquiry form
- `public/_redirects` — `/samples/*` 301 to the reports subdomain

## Related Pages

- [[open-questions]]
