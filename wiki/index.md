# Wiki Index

**Summary**: Navigation entry point for the artifisi.com LLM Wiki.  
**Last updated**: 2026-05-02

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
- `playbook/pipeline.md` — The ten-stage, four-gate pipeline for turning a published report into an interactive page.
- `playbook/instructions.md` — Build and ship playbook, version 2.
- `playbook/video.md` — The seven-stage video pipeline: report to story to shots to storyboard to script to voice-over to video.

## Quick Reference

- **Stack**: Astro static site, three.js, vanilla ES modules. No build step for `reports/`; the main site builds with Astro.
- **Hosts**: Cloudflare Pages. Two projects: `artifisi-com` (main site) and `reports` (output dir `reports/`).
- **Domains**: `www.artifisi.com`, `artifisi.com`, `reports.artifisi.com`, `tech-sovereignty.artifisi.com`
- **Sales**: `playbook/sales/` — rate card, services agreement, outreach. Prices are duplicated in `reports/index.html`; change both together.
- **Test**: no test suite. Manual QA only, recorded in `raw/<slug>/qa.md`.
