# Log

**Summary**: Chronological history of wiki changes and codebase events.  
**Last updated**: 2026-05-01

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
