# Orbwalker Raw Sources (Initial Ingestion)

**Summary**: Compiled notes from the new Orbwalker project sources under `raw/projects/Orbwalker/`.  
**Sources**: `raw/projects/Orbwalker/game_design_document.md`, `raw/projects/Orbwalker/Orbwalker.pdf`  
**Last updated**: 2026-05-02

---

## Overview

The new raw project folder introduces an early game design draft for a match-3 roguelike project associated with Orbwalker.

Primary playable concept from the Markdown source:

- Turn-based match-3 combat with free orb dragging under a timer.
- Roguelike run structure with shops, boosters, equipment, mastery, consumables, and relics.
- Fantasy-themed progression inspired by Puzzle & Dragons/Tower of Saviors movement and Balatro/Slay the Spire style build decisions.

## Key Design Facts

- Board size: `5x6`; gravity down; cascades enabled. (source: `raw/projects/Orbwalker/game_design_document.md`)
- Move timer target: `5 seconds`. (source: `raw/projects/Orbwalker/game_design_document.md`)
- Core orb types: Fire, Ice, Earth, Heart, Armor, Gold. (source: `raw/projects/Orbwalker/game_design_document.md`)
- Prototype progression target: 3-level vertical slice before full 10-level run. (source: `raw/projects/Orbwalker/game_design_document.md`)
- Economy loop emphasizes in-combat gold matching and shop decisions after fights. (source: `raw/projects/Orbwalker/game_design_document.md`)

## Source Quality Notes

- `game_design_document.md` is fully machine-readable and detailed.
- `Orbwalker.pdf` appears image-based in this environment (text extraction returned no readable content). (needs verification)
- PDF metadata: title `Orbwalker Game Design Booklet`, 5 pages, created on 2026-05-02. (source: `raw/projects/Orbwalker/Orbwalker.pdf` metadata)

## Open Questions

- Confirm whether the PDF and Markdown are content-equivalent or if one is newer. (needs verification)

## Resolved Notes

- `Orbwalker` is the canonical project name. `Matchatro` was a temporary name used in early draft material. (source: project owner confirmation on 2026-05-02)

## Related Pages

- [[features]]
- [[contradictions]]
- [[open-questions]]
- [[source-register]]
