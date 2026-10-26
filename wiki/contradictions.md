# Contradictions

**Summary**: Conflicting claims found in sources or code that cannot be silently resolved.  
**Last updated**: 2026-10-27

---

## Overview

Record of contradictions discovered during codebase analysis. AGENTS.md rule: "If sources disagree → record the contradiction."

## Active Contradictions

### `raw/` is immutable in AGENTS.md and a working folder in the pipeline

- `AGENTS.md` describes `raw/` as "immutable source material (specs, notes, transcripts, references)" and puts "do not modify `raw/`" under Safety Rules.
- `playbook/pipeline.md` puts derived stage outputs in `raw/<slug>/`: `brief.md`, `source.json`, `numbers.csv`, `sections.md`, `qa.md`, `tokens.css`, and for the video `shots.json`, `vo/`, `storyboard/`, `video/`. It also says to write them there, not in a `docs/` or `build/` folder.
- The wages report already did this. `raw/malaysia-wages/` holds both the fetched DOSM rows and eleven derived artefacts, and its `README.md` states that only `source.json` is a source.
- The CPI report followed the same precedent. `raw/malaysia-cpi/` holds the fetched rows in `source.json` and the derived stages beside them.
- Status: **unresolved**. Raised five times since the wages report shipped, most recently on 2026-10-27. The project owner has to choose one of two readings: either `raw/` gains a fifth folder for derived output and the pipeline moves there, or the AGENTS.md rule is relaxed to "raw/ is append-only, and the fetched source inside it is immutable, but derived stage outputs may live beside it". The second reading matches what the pipeline actually does and what the wages report shipped. It was not changed unilaterally, because AGENTS.md is the operating system for every agent in the repo and the meaning of the word "immutable" is the owner's call, not the agent's.

### The sales pages promise different video lengths

- `playbook/sales/rate-card.md` and `reports/index.html` said "40 to 55 seconds" for the videos until 2026-10-27. The pipeline actually produced 57.5 seconds for the wages short and 59.26 seconds for the CPI short, so the sales copy was describing something shorter than what ships.
- On 2026-10-27 the rate card and the front door were changed to "up to 60 seconds", and `playbook/instructions.md` was changed to match.
- `playbook/sales/services-agreement.md` still says "[n] vertical videos, 40 to 55 seconds, captioned" in Deliverable 2. It was left alone on this branch because it is a contract template and changing a contractual commitment is the owner's decision, not an agent's.
- Status: **unresolved**. The two readings are not strictly contradictory, since promising 40 to 55 and delivering 40 to 55 is no breach. But the front door now advertises a longer video than the agreement promises, and the pricing page sells "3 vertical videos" against a deliverable of "[n]". Needs the owner's decision on whether the agreement moves to "up to 60 seconds" too.

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
