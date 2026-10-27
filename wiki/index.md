# Wiki Index

**Summary**: Navigation entry point for the artifisi.com LLM Wiki.  
**Last updated**: 2026-10-27

---

## Core Pages

- [[setup]] — Development environment, commands, and onboarding.
- [[architecture]] — High-level system architecture and design.
- [[file-map]] — Feature-to-file mapping across the codebase.
- [[features]] — Feature documentation and behavior.
- [[decisions]] — Recorded design decisions and tradeoffs.
- [[known-issues]] — Bugs, risks, and known problems.
- [[open-questions]] — Unresolved questions and unknowns.
- [[source-register]] — Tracked external sources ingested into the wiki.
- [[contradictions]] — Conflicting claims found in sources or code.

## Subdirectories

- [[sources/]] — Summaries of ingested raw inputs.
- [[concepts/]] — Reusable ideas and domain entities.
- [[systems/]] — Technical systems and subsystems.
- [[workflows/]] — Repeatable processes and how-to guides.
- [[context/]] — Task-specific context packs.
- [[decisions/]] — Individual decision records.

## Recent Additions

- [[sources/orbwalker-gdd]] — Ingested Orbwalker game design source pack from `raw/projects/Orbwalker/`.
- [[sources/orbwalker-screenshots]] — Real Orbwalker screenshot source pack used by gameplay sections on the project page.
- [[context/orbwalker-website-update-todo]] — Temporary handoff TODO for featuring Orbwalker on the website.
- [[context/landing-page-review]] — External audit of live-site positioning, copy, and conversion paths.
- [[context/landing-page-review-todo]] — Prioritized action items derived from the landing page review.
- `reports/` — The reports subdomain (`reports.artifisi.com`), a separate Cloudflare Pages project. Not yet documented in a wiki page.
- `playbook/pipeline.md` — The eleven-stage, four-gate pipeline for turning a published report into an interactive page.
- `playbook/instructions.md` — Build and ship playbook, version 2.
- `playbook/video.md` — The video pipeline: report to story to shots to storyboard to script to voice-over to video, plus the five-beat arc a film runs and the craft rules for the cut. Run end to end on 2026-10-27.
- `playbook/palettes.md` — The palette registry. One report, one palette, and the method for picking the next one. The CPI report's palette is a fuel price board at night.
- `playbook/tools/` — Capture and assembly tools for the video pipeline. The theme is a parameter: `browser.js` exports `THEMES` and `overlayCSS(theme)`, and `shots.json` names the theme. A shot is a scene or a card, and the recorder builds the card, the clean wall capture and the ending.
- `reports/malaysia-cpi/` — The Malaysia Consumer Price Index report, September 2026. Six three.js scenes, one claim each, all playing in one second. Built from seven DOSM open API series.
- `raw/malaysia-cpi/` — The working folder for the CPI report. The source, the story, the sections, a 115-row figure register, the shots, the script, the storyboard and the QA record.
- `raw/malaysia-cpi/video/` — The Malaysia CPI short. 58.10 seconds, 1080x1920, 30fps. The video and the voice tracks are local artefacts and are not tracked in git; `shots.json`, the script and the durations are.
- `raw/malaysia-wages/video/` — The Malaysia wages short. 57.5 seconds, 1080x1920, 30fps. The video and the voice tracks are local artefacts and are not tracked in git; `shots.json`, the script and the durations are.

## Quick Reference

- **Stack**: Astro static site, three.js, vanilla ES modules. No build step for `reports/`; the main site builds with Astro.
- **Hosts**: Cloudflare Pages. Two projects: `artifisi-com` (main site) and `reports` (output dir `reports/`).
- **Domains**: `www.artifisi.com`, `artifisi.com`, `reports.artifisi.com`, `tech-sovereignty.artifisi.com`
- **Sales**: `playbook/sales/` — rate card, services agreement, outreach. Prices are duplicated in `reports/index.html`; change both together. The promised video length is "up to 60 seconds" in the rate card and the front door; the services agreement still says "40 to 55 seconds".
- **Video**: one report, one video. The chain is `report → story → shots → storyboard → script → vo → video`, and the tools are in `playbook/tools/`. Two reports have been through it: wages and CPI.
- **Reports**: `reports/malaysia-wages/` and `reports/malaysia-cpi/`. Twelve scenes across two DOSM datasets. The front door lists both.
- **Test**: no test suite. Manual QA only, recorded in `raw/<slug>/qa.md`.
