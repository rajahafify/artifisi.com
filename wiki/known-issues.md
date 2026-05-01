# Known Issues

**Summary**: Bugs, risks, and known problems in the project.  
**Last updated**: 2026-05-01

---

## Overview

Tracked issues discovered during codebase ingestion and development.

## No Known Issues

No bugs or risks have been identified during initial wiki setup.

## Potential Risks to Monitor

- **Single point of failure**: Single DigitalOcean droplet for production. If the droplet goes down, the site is unavailable until manual recovery.
- **SQLite in production**: While Rails 8 solid adapters make SQLite viable, concurrent writes may cause locking issues under unexpected load spikes.
- **No automated backups**: No backup strategy evident in the repository. Database and uploaded files (Active Storage) need backup configuration.
- **Custom auth limitations**: No password reset flow, email verification, or rate limiting on login attempts.
- **lexxy gem**: Purpose unclear; pre-release version (`0.1.4.beta`) may have stability issues.

## Open Questions

- What is the backup strategy for production data?
- Is there a monitoring/alerting setup for the production droplet?
- What is the `lexxy` gem used for?

## Important Files

- `config/deploy.yml` — Deployment target
- `Gemfile` — Dependency health

## Related Pages

- [[open-questions]]
