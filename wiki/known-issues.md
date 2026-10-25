# Known Issues

**Summary**: Bugs, risks, and known problems in the project.  
**Last updated**: 2026-10-26

---

## Overview

Tracked issues discovered during codebase ingestion and development.

## Active Issues

### The wiki is broadly stale

- `features.md`, `file-map.md`, `architecture.md`, `setup.md`, `decisions.md` and `open-questions.md` still describe the Rails 8 app that was removed on 2026-10-24. `index.md` Quick Reference was corrected on 2026-10-26; the rest was not.
- The `reports/` subdomain has no wiki page at all.
- Owner: unassigned. A full wiki refresh is a separate piece of work.

### The pipeline tools are hardcoded to the households sample

- `playbook/tools/screenshots.js` maps section names `house, districts, squeeze, plate, ageing`. The wages report uses `lift, floor, canyon, section, city, cutaway`, so the view count silently falls back to 1 per section.
- `playbook/tools/record-video.js` has a hardcoded `SHOTS` array and an end card reading "The State of Households 2026 / artifisi.com/samples/households".
- The instructions say to edit `SHOTS` by hand, but do not flag the screenshots view map or the end card.

### Known gaps in the wages report

Recorded in `raw/malaysia-wages/qa.md`:

- Section 2 is two lanes, not the nineteen bins `sections.md` specifies. Nineteen bins at 9:16 forces each under 20px. The caption was rewritten to match what is drawn.
- Sections 4 and 5 read thin at `t = 0`, because their claim is the growth itself. The camera cannot compensate: the bounding box at `t = 0` and `t = 1` is identical.
- The 2020 counterpoint in section 3 is in the prose, not burned into the frame. The video version needs it as a lower third.
- `?only=` and `?still=` are build helpers left in the shipped page. Inert without the query string.

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
