# Source Register

**Summary**: Tracked external sources ingested into the wiki.  
**Last updated**: 2026-10-27

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
| raw/orbwalker-screenshot/ | Real Orbwalker screenshot source pack | ingested | 2026-05-28 | sources/orbwalker-screenshots, features |
| app/assets/images/orbwalker-*.jpeg | Real Orbwalker gameplay screenshots used on project page | ingested | 2026-05-28 | sources/orbwalker-screenshots, features |
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
| `raw/malaysia-wages/` | DOSM Salaries and Wages Survey dataset, catalogue `wages_industry`, CC BY 4.0, 960 rows | ingested | 2026-10-26 | contradictions, features |
| `playbook/pipeline.md` | Ten-stage, four-gate build pipeline | ingested | 2026-10-26 | features, decisions |
| `playbook/instructions.md` | Build and ship playbook, version 2 | ingested | 2026-10-26 | features, known-issues |
| `playbook/video.md` | Seven-stage video pipeline, report to published short | ingested | 2026-10-27 | features, known-issues |
| `playbook/tools/` | Capture and assembly tools for the video pipeline | ingested | 2026-10-27 | known-issues |
| `raw/malaysia-wages/shots.json` | The shot list: six shots and an end card, 1080x1920 portrait | ingested | 2026-10-27 | known-issues |
| `raw/malaysia-wages/vo/` | Voice-over script and per line durations. The recorded tracks are local, not tracked | ingested | 2026-10-27 | known-issues |
| `raw/malaysia-wages/storyboard/` | One 1080x1920 frame per shot, rendered from the live page | ingested | 2026-10-27 | known-issues |
| `raw/malaysia-wages/video/` | The Malaysia wages short, 57.5 seconds, 1080x1920. The video file itself is local, not tracked | ingested | 2026-10-27 | known-issues |
| `raw/malaysia-cpi/` | DOSM Consumer Price Index, September 2026. Seven open API series: `cpi_headline`, `cpi_headline_inflation`, `cpi_state_inflation`, `cpi_core_inflation`, `cpi_lowincome`, `cpi_strata`, `fuelprice`. CC BY 4.0 | ingested | 2026-10-27 | contradictions, features |
| `raw/malaysia-cpi/source.json` | The rows the API returned, trimmed to the ones the report uses. The trim is recorded in its `meta.trim` block | ingested | 2026-10-27 | known-issues |
| `raw/malaysia-cpi/numbers.csv` | The figure register for the CPI report. 115 rows, one per figure on the page, each with the series, row key and field it came from | ingested | 2026-10-27 | features |
| `raw/malaysia-cpi/shots.json` | The shot list for the CPI short: six shots and an end card, 1080x1920 portrait, theme `cpi` | ingested | 2026-10-27 | known-issues |
| `raw/malaysia-cpi/storyboard/` | One 1080x1920 frame per shot for the CPI short, rendered from the live page | ingested | 2026-10-27 | known-issues |
| `raw/malaysia-cpi/video/` | The Malaysia CPI short, 59.26 seconds, 1080x1920. The video file itself is local, not tracked | ingested | 2026-10-27 | known-issues |
| `open.dosm.gov.my/data-catalogue` | The DOSM open data catalogue. The dataset pages carry the field descriptions and the division code map, and the API returns a bare JSON array of rows | ingested | 2026-10-27 | contradictions |
| `playbook/sales/` | Rate card, services agreement, outreach copy | ingested | 2026-10-26 | features |

## Pending Ingestion

- Individual remaining view templates for detailed behavior
- Test files for detailed coverage analysis
- `.kamal/hooks/*.sample` — Hook templates (not yet customized)
- `raw/projects/Orbwalker/Orbwalker.pdf` full text/content comparison (blocked by image-based PDF in current extraction path)
- `reports/` — the reports subdomain has no wiki page. `features.md` and `file-map.md` still describe the removed Rails app.
- The ten-stage pipeline has no dedicated wiki page; it is currently only in `playbook/pipeline.md`.

## Ingestion Notes

- Initial wiki setup performed 2026-05-01 based on repository snapshot.
- Orbwalker raw sources added under `raw/projects/Orbwalker/` and initial ingestion completed.
- Future sources (specs, transcripts, references) should be added to `raw/` and registered here.

## Related Pages

- [[index]]
- [[log]]
