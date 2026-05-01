# Open Questions

**Summary**: Unresolved questions and unknowns about the project.  
**Last updated**: 2026-05-02

---

## Overview

Questions that arose during codebase ingestion that could not be answered from available sources.

## Unresolved

### What is the `lexxy` gem used for?

- **Status**: Partially resolved
- **Context**: `gem "lexxy", "~> 0.1.4.beta"` is declared in the Gemfile. It is pinned in the importmap (`pin "lexxy"` in `config/importmap.rb`) and its stylesheet is loaded in both layouts (`<%= stylesheet_link_tag "lexxy" %>`). CSS in `app/assets/stylesheets/app.css` provides `.lexxy-fallback-editor` styles (min-height 320px, rounded-xl, focus ring). Appears to be a rich text editor for ActionText post bodies.
- **Needs verification**: Confirm whether lexxy replaces or enhances ActionText's default Trix editor.

### Is PWA support intended to be enabled?

- **Status**: Unknown
- **Context**: PWA manifest and service worker files exist (`app/views/pwa/`), but the routes are commented out in `config/routes.rb`.
- **Needs verification**: Check with project owner whether PWA is planned.

### What is the production backup strategy?

- **Status**: Unknown
- **Context**: No backup configuration found for SQLite database or Active Storage uploads.
- **Needs verification**: Check `.kamal/` configs and deployment documentation.

### Is there monitoring/alerting for production?

- **Status**: Unknown
- **Context**: No monitoring configuration (e.g., Sentry, Honeybadger, health checks beyond `/up`) found.
- **Needs verification**: Check production environment config and `.kamal/` hooks.

### What is the intended audience/scale?

- **Status**: Unknown
- **Context**: The architecture suggests a low-traffic marketing site, but no explicit scaling expectations found.
- **Needs verification**: Discuss with project owner.

### Are the Orbwalker Markdown and PDF versions equivalent?

- **Status**: Unknown
- **Context**: The PDF appears image-based in current environment and text extraction returned empty content.
- **Needs verification**: Compare PDF and Markdown content directly from original editable source or OCR path.

## Resolved

- Orbwalker naming is canonical; `Matchatro` was a temporary internal name. (confirmed by project owner on 2026-05-02)

## Important Files

- `Gemfile` — lexxy dependency
- `config/routes.rb` — PWA routes commented out
- `config/deploy.yml` — Deployment configuration
- `raw/projects/Orbwalker/game_design_document.md` — New game design source
- `raw/projects/Orbwalker/Orbwalker.pdf` — New design booklet PDF

## Related Pages

- [[known-issues]]
- [[features]]
