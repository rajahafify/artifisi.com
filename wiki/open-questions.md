# Open Questions

**Summary**: Unresolved questions and unknowns about the project.  
**Last updated**: 2026-10-27

---

## Overview

Questions that arose during codebase ingestion that could not be answered from available sources.

## Unresolved

### Is `raw/` immutable, or is it the working folder?

- **Status**: Unresolved. Raised five times, most recently on 2026-10-27.
- **Context**: `AGENTS.md` calls `raw/` immutable source material and forbids modifying it. `playbook/pipeline.md` writes eight stage outputs into `raw/<slug>/`, and the video pipeline adds six more. Both shipped reports follow that: `raw/malaysia-wages/` and `raw/malaysia-cpi/` each hold the fetched source beside derived artefacts.
- **Needs verification**: The project owner picks one. Either a fifth folder joins AGENTS.md's model and the pipeline moves its outputs there, or the `raw/` rule is relaxed to "append-only, and the fetched source inside it is immutable" so derived stage outputs may live beside it. The second matches what the code already does. See [[contradictions]].

### Should the services agreement match the rate card on video length?

- **Status**: Unresolved as of 2026-10-27.
- **Context**: `playbook/sales/rate-card.md` says the videos run "up to 60 seconds", which is what the pipeline produces. `playbook/sales/services-agreement.md` still commits to "[n] vertical videos, 40 to 55 seconds, captioned". The front door used to be a third copy of the promise; it stopped being a sales page on 2026-10-27 and says nothing about videos now.
- **Needs verification**: The owner's call. It is a contract template, so it was not changed on the CPI branch.
- **Also open**: with the sales sections gone from the front door, there is no public page that sells the custom report service. The rate card and the agreement still describe it, and enquiries arrive through the general contact form. Whether the service needs a page of its own is the owner's call.

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
