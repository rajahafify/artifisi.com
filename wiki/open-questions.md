# Open Questions

**Summary**: Unresolved questions and unknowns about the project.  
**Last updated**: 2026-05-01

---

## Overview

Questions that arose during codebase ingestion that could not be answered from available sources.

## Unresolved

### What is the `lexxy` gem used for?

- **Status**: Unknown
- **Context**: `gem "lexxy", "~> 0.1.4.beta"` is declared in the Gemfile but its usage is not evident from controller or model code.
- **Needs verification**: Check `Gemfile.lock` or search for `Lexxy` references in the codebase.

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

## Resolved

- None yet.

## Important Files

- `Gemfile` — lexxy dependency
- `config/routes.rb` — PWA routes commented out
- `config/deploy.yml` — Deployment configuration

## Related Pages

- [[known-issues]]
- [[features]]
