# Orbwalker Screenshot Source Pack

**Summary**: Real in-game screenshot pack used for gameplay sections on the Orbwalker project page.  
**Sources**: `raw/orbwalker-screenshot/`  
**Last updated**: 2026-05-28  

---

## Overview

The `raw/orbwalker-screenshot/` folder contains five portrait gameplay screenshots from Orbwalker. The combat, shop, relic, and run-summary shots are copied into Rails assets with explicit `orbwalker-*` names and used on the public Orbwalker project page. The main menu screenshot remains in `raw/` but the page hero uses the previous `orbwalker-hero-keyart.png` image.

## Details

- `mainmenu.jpeg` is retained in `raw/orbwalker-screenshot/`; not currently used on the page.
- `combat.jpeg` → `app/assets/images/orbwalker-combat.jpeg`, used in the Turn-Based Combat section.
- `shop.jpeg` → `app/assets/images/orbwalker-shop.jpeg`, used in the Build Your Arsenal section.
- `relic.jpeg` → `app/assets/images/orbwalker-relic.jpeg`, used in the relic/reward run-loop section.
- `runsummary.jpeg` → `app/assets/images/orbwalker-run-summary.jpeg`, used in the relic/reward run-loop section.
- All screenshots are JPEG images at `490x1080`. (source: `file raw/orbwalker-screenshot/*.jpeg`)

## Important Files

- `raw/orbwalker-screenshot/`
- `app/assets/images/orbwalker-combat.jpeg`
- `app/assets/images/orbwalker-shop.jpeg`
- `app/assets/images/orbwalker-relic.jpeg`
- `app/assets/images/orbwalker-run-summary.jpeg`
- `app/views/pages/orbwalker.html.erb`

## Open Questions

- Whether the home page project card should also move from generated key art to a real screenshot. (needs verification)

## Related Pages

- [[features]]
- [[source-register]]
