# Log

**Summary**: Chronological history of wiki changes and codebase events.  
**Last updated**: 2026-05-02

---

## [2026-05-01] setup | Initial LLM Wiki Setup

Source: AGENTS.md, README.md, PROJECT.md, DESIGN.md, Gemfile, config/routes.rb, db/schema.rb

Changes:
- Created `raw/` directory
- Created `wiki/` directory with subdirectories: sources, concepts, systems, workflows, context, decisions
- Created core pages: index, setup, architecture, file-map, features, decisions, known-issues, open-questions, source-register, contradictions, log

Notes:
- Codebase inspected: Rails 8.1.1 marketing site with Hotwire, SQLite, Kamal deployment
- No contradictions found between sources
- Several open questions identified: lexxy gem purpose, PWA enablement, backup strategy, monitoring
- raw/ directory is empty; no external sources ingested yet

Verification:
- code checked: yes (app/, config/, db/, test/ directories reviewed)
- human reviewed: no

---

## [2026-05-02] website | Replace placeholder projects with Orbwalker showcase

Source: `wiki/context/orbwalker-website-update-todo.md`, `raw/projects/Orbwalker/game_design_document.md`

Changes:
- Replaced Project Aether and Tactica placeholder cards in `app/views/pages/home.html.erb` with a single Orbwalker project card
- Added `app/assets/images/orbwalker-hero-keyart.png` from raw project sources
- Used marketing-safe copy: fantasy match-3 roguelike with free orb movement and build-driven progression
- CTA links to #contact with "In development — follow our journey →"

Notes:
- All placeholder project references removed from the homepage
- Image sourced from `raw/projects/Orbwalker/images/orbwalker-hero-keyart.png`

Verification:
- code checked: yes
- human reviewed: no

---

## [2026-05-01] rebrand | Rebrand landing page to independent gaming studio

Source: app/views/pages/home.html.erb

Changes:
- Rebranded entire landing page from AI startup to independent gaming studio
- Hero: "Building Original Games with Malaysian Creativity"
- About: "independent gaming studio based in Malaysia. We design, develop, and publish our own games in-house"
- Updated Mission, Vision, Approach to gaming context
- Replaced Core Values: Craftsmanship, Player-First Design, Collaboration, Agility, Continuous Learning, Malaysian Roots/Global Reach
- Replaced Services: Game Development, Art & Animation, Game Design, Quality Assurance
- Replaced Projects: Project Aether (action-adventure), Tactica (multiplayer tactics)
- Updated blog tagline and contact CTA

Notes:
- Branch: `game-studio`
- Two commits: `feat: rebrand landing page to independent gaming studio` + `fix: update contact section CTA`

Verification:
- code checked: yes
- human reviewed: no

---

## [2026-05-02] ingestion | Deep codebase ingestion — controllers, views, layouts, helpers, JS, CSS, deployment configs

Source: All files under app/, config/importmap.rb, docker-compose.yml, Dockerfile, .kamal/, .aider.conf.yml

Changes:
- Updated features.md: added Turbo Stream contact form details, blog controller behavior, dynamic layout system, liquid glass toasts, cookie-based contact dedup
- Updated architecture.md: added layout system (determine_layout), liquid glass toasts, lexxy editor section
- Updated open-questions.md: partially resolved lexxy gem question (now known to be an ActionText editor with importmap pin and CSS fallback)
- Updated source-register.md: registered 15 newly inspected files/sections
- Updated log.md: this entry

Notes:
- Lexxy gem confirmed as rich text editor for ActionText — pinned in importmap, stylesheet loaded in both layouts, CSS fallback defined. Exact relationship to Trix still unclear.
- Contact form uses Turbo Stream for inline replacement on the home page, with cookie-based dedup for return visitors
- Dashboard layout uses extensive content_for blocks for customization
- Liquid glass toast system is a custom CSS animation with Stimulus Alert integration
- Kamal hooks are all .sample files — not yet customized
- .aider.conf.yml only reads AGENTS.md

Verification:
- code checked: yes (every controller, model, layout, helper, and config file reviewed)
- human reviewed: no

---

## [2026-05-02] ingestion | Orbwalker raw project source ingestion + website handoff TODO

Source: `raw/projects/Orbwalker/game_design_document.md`, `raw/projects/Orbwalker/Orbwalker.pdf`

Changes:
- Added `wiki/sources/orbwalker-gdd.md` summarizing Orbwalker source pack
- Added `wiki/context/orbwalker-website-update-todo.md` as temporary handoff instructions for a follow-up website update agent
- Updated `wiki/source-register.md` with two new raw sources and PDF partial-ingestion status
- Updated `wiki/contradictions.md` with project naming mismatch (`Matchatro` vs `Orbwalker`)
- Updated `wiki/open-questions.md` with Orbwalker naming and source-equivalence verification questions
- Updated `wiki/index.md` and `wiki/features.md` to reflect newly ingested project context

Notes:
- PDF text extraction returned empty output in current environment, likely image-based pages; only metadata was ingested.
- Canonical project naming should be confirmed before public website copy is finalized.

Verification:
- code checked: yes (raw sources + wiki files reviewed and updated)
- human reviewed: no

---

## [2026-05-02] decision | Canonicalize Orbwalker naming

Source: project owner confirmation in chat + `raw/projects/Orbwalker/game_design_document.md`

Changes:
- Updated `wiki/contradictions.md` to resolve `Matchatro` vs `Orbwalker`
- Updated `wiki/open-questions.md` to remove naming uncertainty and add resolved note
- Updated `wiki/sources/orbwalker-gdd.md` with resolved naming note
- Updated `wiki/decisions.md` with explicit naming decision

Notes:
- `Matchatro` should be treated as a temporary/historical alias only.

Verification:
- code checked: yes (wiki updates reviewed)
- human reviewed: no
