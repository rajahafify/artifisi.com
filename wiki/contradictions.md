# Contradictions

**Summary**: Conflicting claims found in sources or code that cannot be silently resolved.  
**Last updated**: 2026-10-26

---

## Overview

Record of contradictions discovered during codebase analysis. AGENTS.md rule: "If sources disagree → record the contradiction."

## Active Contradictions

### Malaysia wages: "government sectors won" is a 2020 effect, not a trend

- `raw/malaysia-wages/sections.md` v1 (2026-10-25) claimed: "The sectors pulling ahead are the ones the government pays for." It was built from two snapshots, 2010 and 2025.
- The full 16-year series (`source.json`, 960 rows) shows the public sector peaked in 2020 and fell back: education 2.43 (2020) to 2.04 (2025), public administration 1.82 to 1.57. Both are still above their 2010 ratios, but most of the "pull" is a single pandemic year.
- 2020 is a genuine break, not a coverage change: national median -15.0%, mean -8.4%, covered employees +2.8%.
- Status: v1 claim withdrawn. `sections.md` rewritten 2026-10-26 with the 2020 break as the explicit counterpoint in section 3. No section now rests on the 2020 spike alone.

### Production deploy target mismatch

- `config/deploy.yml` targets web host `206.189.32.232`, registry `localhost:5555`, and proxy host `www.artifisi.com`.
- `README.md` says the Kamal deployment targets `root@146.190.83.167` with registry `146.190.83.167:5000`.
- Current deployment on 2026-05-28 used `config/deploy.yml` successfully against `206.189.32.232`.
- Status: **obsolete**. The Rails app, `config/deploy.yml`, Kamal and the Docker files were removed on 2026-10-24 when the site moved to a static Astro build on Cloudflare Pages. Both sides of this contradiction no longer exist. Recorded here rather than deleted, per the AGENTS.md rule against silently resolving conflicts.

## Resolved Contradictions

### Playbook rule 3 contradicted the shipped scene code

- `playbook/instructions.md` rule 3 said to open each figure on the finished frame: `this.t = 1; this.done = true`.
- Commit `ad50b92` (2026-10-26) changed the shipped `reports/malaysia-wages/scene.js` to open at `this.t = 0; this.done = false`, because the first click was jumping backwards before running forward and reading as a reset rather than a replay.
- The playbook was not updated with the code, so it contradicted the behaviour it documented.
- Resolution: the project owner confirmed the first-frame behaviour is intended. `playbook/instructions.md` updated 2026-10-26 to specify `t = 0`, with the reason recorded so it is not "fixed" back.

### The rate card promised scroll animation the product does not have

- `playbook/sales/rate-card.md` said "the charts are drawn in three.js and re-form as the reader scrolls".
- `playbook/instructions.md` rule 3 rejects scroll-triggered playback, and the shipped page is click-to-play only.
- The rate card is customer-facing, so it described an interaction the client would not receive.
- Resolution: rate card corrected 2026-10-26 to "play when the reader clicks them".

### Gate 1 required a page reference that a dataset cannot supply

- `playbook/pipeline.md` Gate 1 required "no number without a page reference", and specified a `numbers.csv` with `page` and `checked` columns.
- The wages source is an API dataset, not a PDF. The actual `raw/malaysia-wages/numbers.csv` has `source_ref` (`wages_median`, `section=P`, `computed`) and no `checked` column, so the artifact never met the rule as written.
- Resolution: the project owner set the rule as "as long as we have a data source". Gate 1 now requires a source reference at the precision the source allows — page for a PDF, field and row key for a dataset — and the CSV spec matches the artifact. The figure-by-figure diff stays at Gate 4 in `qa.md`.

### Orbwalker temporary naming (`Matchatro` -> `Orbwalker`)

- `raw/projects/Orbwalker/game_design_document.md` title uses `Matchatro Game Design Document`.
- Project owner confirmed `Matchatro` was a temporary name and `Orbwalker` is canonical.
- Resolution date: 2026-05-02.

## Notes

- The codebase appears internally consistent. README, PROJECT.md, DESIGN.md, and the actual code align on the tech stack, conventions, and architecture.
- If contradictions are discovered in future analysis, they should be recorded here with source references.

## Related Pages

- [[open-questions]]
- [[known-issues]]
