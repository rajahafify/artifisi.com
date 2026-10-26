# Source

**Publisher** Department of Statistics Malaysia (DOSM)
**Title** Consumer Price Index, September 2026
**Catalogue** https://open.dosm.gov.my/data-catalogue/
**Endpoint** `https://api.data.gov.my/data-catalogue?id=<id>`
**Retrieved** 2026-10-27
**Licence** CC BY 4.0, confirmed on the catalogue page
**Published** 2026-10-19 13:12 · **Data as of** 2026-09 · **Next update** 2026-11-19 12:30
**Stored** `source.json`, 994 KB

## Datasets used

| Catalogue id | What it is | Rows kept |
|---|---|---|
| `cpi_headline` | National CPI index by division, 2010 = 100 | 2,814 (2010-01 onwards) |
| `cpi_headline_inflation` | National inflation by division, month on month and year on year | 1,974 (2015-01 onwards) |
| `cpi_state_inflation` | Inflation by state | 561 (2024-01 onwards, `division=overall`) |
| `cpi_core_inflation` | Core inflation by division | 1,456 |
| `cpi_lowincome` | CPI index for low-income households | 603 |
| `cpi_strata` | CPI index, urban and rural | 1,206 |
| `fuelprice` | Weekly pump prices, RON95 / RON97 / diesel | 484 (`series_type=level`) |
| `mcoicop` | COICOP classification lookup, English and Malay | 343 |

Nothing was edited. Every retained row is a row the API returned, with its values untouched. The
trim only removed rows the report does not use.

## Shape

`cpi_headline_inflation` and `cpi_state_inflation` carry `date`, `division`, `inflation_mom` and
`inflation_yoy`. The index datasets carry `date`, `index` and `division`, plus `strata` for
`cpi_strata`. `fuelprice` carries a weekly `date`, the pump prices, and a `series_type` of `level`
or `change_weekly`; only `level` rows are used here.

The endpoint redirects (301) to `/data-catalogue/` with a trailing slash, so `curl` needs `-L`.
The response is a bare JSON array of row objects, not a `{metadata, data}` envelope.

## Division codes

`division` is a two-digit code or `overall`. The names come from the catalogue's own
`translations` block for the dataset:

| Code | Division | Code | Division |
|---|---|---|---|
| 01 | Food & Beverages | 08 | Information & Communication |
| 02 | Alcoholic Beverages & Tobacco | 09 | Recreation, Sport & Culture |
| 03 | Clothing & Footwear | 10 | Education |
| 04 | Housing, Utilities, Gas & Other Fuels | 11 | Restaurant & Accommodation Services |
| 05 | Household Furnishings, Equipment & Maintenance | 12 | Insurance & Financial Services |
| 06 | Health | 13 | Personal Care, Social Protection & Miscellaneous Goods and Services |
| 07 | Transport | overall | Overall |

The classification is deliberately consistent with the UN COICOP standard, for international
comparability.

## Caveats

- **The CPI is an average.** DOSM's own caveat: the rate of inflation experienced by a specific
  individual may be higher or lower than the published number. The page says so in the method
  section and never claims that the headline describes any one household.
- **No weights are published in these datasets.** The page therefore never says how much a
  division contributed to the headline. Where the page shows a gap between a division and the
  overall rate, it is a gap between two published rates, not a contribution.
- **The index base is 2010 = 100**, and January 2010 prints 99.4. The base *year* is the anchor
  on the page, not the month.
- **Derived year-on-year rates.** The urban, rural and low-income figures are computed from the
  published index rows (September 2026 over September 2025) because those datasets carry an index
  and no inflation field. Every such row in `numbers.csv` says `computed` in its `source_ref` and
  names the two rows.
- **Monthly averages of weekly fuel prices are computed.** `fuelprice` is a weekly series, so a
  monthly figure on this page is the mean of the weekly `level` rows in that month. September
  2026 has four weekly observations; December 2025 has four.
- **The RON95 market price only exists from 30 September 2025.** Before that, RON95 was fixed at
  RM2.05. The `ron95` column is the market price from that date onward; `ron95_skps` is the
  subsidised price (RM2.05) and `ron95_budi95` the BUDI 95 price (RM1.99).
- **The dataset carries prices, not volumes.** It cannot say how much fuel is bought at the
  market price rather than the subsidised price, so the page does not claim how much of the
  transport inflation a given household carries.
