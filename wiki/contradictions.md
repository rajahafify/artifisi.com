# Contradictions

**Summary**: Conflicting claims found in sources or code that cannot be silently resolved.  
**Last updated**: 2026-05-28

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
- Status: active contradiction; README deployment notes need verification/update.

## Resolved Contradictions

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
