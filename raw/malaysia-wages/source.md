# Source

**Publisher** Department of Statistics Malaysia (DOSM)
**Dataset** Salaries and Wages Survey, wages by industry
**Catalogue id** `wages_industry`
**Endpoint** https://api.data.gov.my/data-catalogue?id=wages_industry
**Retrieved** 2026-10-25, re-acquired in full 2026-10-26
**Licence** CC BY 4.0, confirmed on the catalogue page
**Stored** `source.json`, 960 rows, 113,923 bytes

## Shape

| Field | Meaning |
|---|---|
| `section` | MSIC 2008 single letter, A to S, plus `overall` |
| `date` | annual, 2010 to 2025 |
| `sex` | both, male, female |
| `recipients` | employees covered, thousand persons |
| `wages_mean` | mean monthly wage, RM |
| `wages_median` | median monthly wage, RM |

960 rows: 20 sections, 16 years, 3 sexes. Verified after download.

The endpoint redirects (301) to `/data-catalogue/` with a trailing slash; `curl` needs `-L`.

## Caveats

- Wages are **nominal**. Every claim uses a ratio against the national median in the same
  year, which cancels inflation. No claim of real growth is made.
- 2025 is the latest available year.
- `recipients` counts employees covered by the survey, not total employment.
- **2020 is a real break, not an artefact.** National median fell RM2,442 to RM2,076
  (-15.0%) and the mean fell RM3,224 to RM2,954 (-8.4%). Covered employees rose 2.8%
  (9,195.2k to 9,456.0k), so it is not a coverage change. The mean/median ratio jumped
  to 1.423, the highest in the series. Any claim that crosses 2020 has to say so.
- Section letters: A agriculture, B mining, C manufacturing, D electricity, E water,
  F construction, G trade, H transport, I accommodation and food, J information and
  communication, K finance, L real estate, M professional services, N administrative
  support, O public administration, P education, Q health, R arts, S other services.
