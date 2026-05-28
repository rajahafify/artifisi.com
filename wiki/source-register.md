# Source Register

**Summary**: Tracked external sources ingested into the wiki.  
**Last updated**: 2026-05-28

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
| app/controllers/ | All controllers | ingested | 2026-05-02 | architecture, features |
| app/models/ | All models | ingested | 2026-05-02 | architecture, features |
| app/views/layouts/ | Layout templates | ingested | 2026-05-02 | architecture, features |
| app/views/pages/home.html.erb | Landing page | ingested | 2026-05-02 | features |
| app/views/pages/orbwalker.html.erb | Orbwalker project page | ingested | 2026-05-28 | features |
| app/views/pages/_orbwalker_newsletter_form.html.erb | Orbwalker newsletter form partial | ingested | 2026-05-28 | features |
| app/views/pages/_orbwalker_newsletter_success.html.erb | Orbwalker newsletter success partial | ingested | 2026-05-28 | features |
| app/controllers/contacts_controller.rb | Contact submissions controller | ingested | 2026-05-28 | features |
| app/views/contacts/_form.html.erb | Contact form partial | ingested | 2026-05-02 | features |
| test/controllers/contacts_controller_test.rb | Contact controller tests | ingested | 2026-05-28 | features |
| test/controllers/pages_controller_test.rb | Page controller tests | ingested | 2026-05-28 | features |
| app/assets/stylesheets/app.css | Liquid glass + lexxy CSS | ingested | 2026-05-02 | architecture, features |
| app/helpers/application_helper.rb | View helpers | ingested | 2026-05-02 | features |
| app/javascript/controllers/ | Stimulus controllers | ingested | 2026-05-02 | features |
| config/importmap.rb | Import map config | ingested | 2026-05-02 | architecture |
| docker-compose.yml | Docker Compose config | ingested | 2026-05-02 | setup |
| Dockerfile | Production Docker image | ingested | 2026-05-02 | setup, architecture |
| .kamal/ | Kamal deployment hooks | ingested | 2026-05-02 | setup |
| .aider.conf.yml | Aider configuration | ingested | 2026-05-02 | setup |
| raw/projects/Orbwalker/game_design_document.md | Raw game design source | ingested | 2026-05-02 | sources/orbwalker-gdd, features, open-questions |
| raw/projects/Orbwalker/Orbwalker.pdf | Raw PDF design booklet | partial (metadata only) | 2026-05-02 | sources/orbwalker-gdd, contradictions |
| app/assets/images/orbwalker-hero-keyart.png | Project key art | ingested | 2026-05-02 | features |

## Pending Ingestion

- Individual remaining view templates for detailed behavior
- Test files for detailed coverage analysis
- `.kamal/hooks/*.sample` — Hook templates (not yet customized)
- `raw/projects/Orbwalker/Orbwalker.pdf` full text/content comparison (blocked by image-based PDF in current extraction path)

## Ingestion Notes

- Initial wiki setup performed 2026-05-01 based on repository snapshot.
- Orbwalker raw sources added under `raw/projects/Orbwalker/` and initial ingestion completed.
- Future sources (specs, transcripts, references) should be added to `raw/` and registered here.

## Related Pages

- [[index]]
- [[log]]
