# Orbwalker Website Update TODO (Temporary Handoff)

**Summary**: Temporary task list for a follow-up agent to feature Orbwalker in Artifisi projects on the website.  
**Sources**: `raw/projects/Orbwalker/game_design_document.md`, `wiki/sources/orbwalker-gdd.md`  
**Last updated**: 2026-05-02

---

## Objective

Add Orbwalker to the public projects showcase in the website landing page and align the copy with available source material.

## TODO

1. Locate the current projects section in the landing page template (`app/views/pages/home.html.erb`).
2. Add a new project card/entry for Orbwalker using existing design patterns and layout classes.
3. Draft short marketing-safe copy from ingested sources:
   - genre: fantasy match-3 roguelike
   - core hook: free orb movement + build-driven progression
   - platform intent: PC and mobile (draft source, verify before hard claim)
4. Avoid exposing unconfirmed implementation details as shipped facts (use "in development" wording).
5. If project ordering matters, place Orbwalker according to current portfolio priority and keep visual balance.
6. Verify page renders correctly on desktop and mobile breakpoints.
7. Run relevant checks/tests for the view change (at minimum targeted Rails view/system check available in repo workflow).
8. Update wiki pages after code change:
   - `wiki/features.md` (projects section behavior/content)
   - `wiki/log.md` (append website update entry)
   - `wiki/source-register.md` if new sources are consulted.

## Constraints

- Preserve existing brand voice and component style.
- Make minimal, focused edits (no unrelated refactors).
- If copy conflicts with source naming (`Matchatro` vs `Orbwalker`), use `Orbwalker` publicly and record the discrepancy in wiki if still unresolved.

## Related Pages

- [[sources/orbwalker-gdd]]
- [[features]]
- [[log]]
