# Source Register

**Summary**: Tracked external sources ingested into the wiki.  
**Last updated**: 2026-05-01

---

## Ingested Sources

| Source | Type | Status | Last Ingested | Page(s) |
|---|---|---|---|---|
| README.md | Project doc | ingested | 2026-05-01 | setup, architecture, features |
| DESIGN.md | Design spec | ingested | 2026-05-01 | features, decisions |
| PROJECT.md | Convention doc | ingested | 2026-05-01 | setup, decisions, features |
| AGENTS.md | Agent rules | active | 2026-05-01 | (operating system) |
| Gemfile | Dependency manifest | ingested | 2026-05-01 | architecture, decisions, setup |
| config/routes.rb | Route definitions | ingested | 2026-05-01 | architecture, features, file-map |
| db/schema.rb | Database schema | ingested | 2026-05-01 | architecture, features |
| app/ | Application code | ingested | 2026-05-01 | file-map, features |

## Pending Ingestion

- `.kamal/` — Kamal deployment hooks
- `config/deploy.yml` — Detailed deploy configuration
- `docker-compose.yml` / `Dockerfile` — Container configuration
- Individual controller/model files for detailed behavior

## Ingestion Notes

- Initial wiki setup performed 2026-05-01 based on repository snapshot.
- No external/raw sources ingested yet; `raw/` directory is empty.
- Future sources (specs, transcripts, references) should be added to `raw/` and registered here.

## Related Pages

- [[index]]
- [[log]]
