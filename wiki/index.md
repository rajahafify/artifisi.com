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

## Quick Reference

- **Stack**: Rails 8.1.1, Ruby 3.4.7, SQLite, Hotwire (Turbo + Stimulus), Propshaft, Kamal
- **Test**: Minitest, Capybara, Selenium; TDD (red→green→refactor)
- **Style**: rubocop-rails-omakase (Ruby); ES modules, kebab-case (JS)
- **Deploy**: Kamal → DigitalOcean droplet (146.190.83.167)
