# Known Issues

**Summary**: Bugs, risks, and known problems in the project.  
**Last updated**: 2026-10-26

---

## Overview

Tracked issues discovered during codebase ingestion and development.

## Active Issues

### The pipeline writes derived files into `raw/`, which AGENTS.md calls immutable

- `AGENTS.md` calls `raw/` "immutable source material" and puts "modify `raw/`" in the Safety Rules.
- `playbook/pipeline.md` puts eight stage outputs in `raw/<slug>/`: `brief.md`, `source.md`, `numbers.csv`, `story.md`, `sections.md`, `tokens.css`, `mock.pdf`, `qa.md`. Only `source.*` is actually a source. The rest are working files that get rewritten.
- The cost is visible in `raw/malaysia-wages/`: `story.md` and `story-v2.md` both sit there, `mock.html` and `mock2.html` both sit there, plus `viz.html`, a superseded prototype. Nothing in AGENTS.md's model has a place for a per-report working directory.
- Partly mitigated on 2026-10-26: `raw/malaysia-wages/README.md` now marks which file is current for each stage, and `story.md` carries a superseded banner naming the withdrawn claim.
- Unresolved: whether the fix is a fifth folder in AGENTS.md's model, or a relaxation of the `raw/` rule.

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
- `ffmpeg` is installed but only the real binary in the WinGet package folder. The link at `%LOCALAPPDATA%\Microsoft\WinGet\Links\ffmpeg.exe` is still a zero-byte file, so `ffmpeg` and `ffprobe` have to be on `PATH` for `voice.py` and `mux.py` to find them.
- Whether the video is published anywhere, or only handed over, is not settled.

### Known gaps in the wages report

Recorded in `raw/malaysia-wages/qa.md`:

- Section 2 is two lanes, not the nineteen bins `sections.md` specifies. Nineteen bins at 9:16 forces each under 20px. The caption was rewritten to match what is drawn.
- Sections 4 and 5 read thin at `t = 0`, because their claim is the growth itself. The camera cannot compensate: the bounding box at `t = 0` and `t = 1` is identical.
- The 2020 counterpoint in section 3 is in the prose, not burned into the frame. The video version needs it as a lower third.
- `?only=` and `?still=` are build helpers left in the shipped page. Inert without the query string.
- The "loads under 1.5s on 4G" check in stage 10 of the pipeline was never measured. `qa.md` records the weight table, 99 KB on first load, and nothing about load time.

### Prices live in two places

- `playbook/sales/rate-card.md` and `reports/index.html` both carry the price list. Nothing enforces that they match. Both say so in a comment; neither is generated from the other.

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

## Important Files

- `playbook/pipeline.md` — the ten stages and four gates
- `playbook/instructions.md` — build and ship rules
- `raw/malaysia-wages/qa.md` — figure diff and screenshots for the wages report
- `reports/index.html` — the customer-facing prices and enquiry form
- `public/_redirects` — `/samples/*` 301 to the reports subdomain

## Related Pages

- [[open-questions]]
