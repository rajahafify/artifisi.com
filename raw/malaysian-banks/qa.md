# QA: Malaysia's banks, six ways

Checked 29 Oct 2026.

## Source

TAB Insights, World's 1000 Largest Banks 2026 (FY2025), https://tabinsights.com/ab1000/largest-banks-in-the-world, read 29 Oct 2026. The table was read row by row into the source report at `/mnt/project-files/research/reports/malaysian-banks-tab-global-1000-2026.md` (project files), then into `reports/malaysian-banks/data.json`.

## Figure diff

data.json against the source rows: 12 banks, 6 fields each (assets, profit, ROE, ROA, CIR, CAR). 0 mismatches. Totals recomputed: assets US$950,546m, profit US$9,372m.

| Page says | Computed from data.json | Result |
|---|---|---|
| US$950.5b, all twelve | 950,546 | OK |
| Top 3 hold 62%, US$589.7b | 62.03%, 589,660 | OK |
| Top 5 hold 80% (80.2%) | 80.17% | OK |
| Seven others 19.8% | 19.83% | OK |
| Maybank 27.3% | 27.30% | OK |
| DBS 73% of assets | 73.41% | OK |
| DBS 89% of profit | 89.32% | OK |
| DBS US$697.8b, US$8.37b | 697,766, 8,371 | OK |
| Twelve banks' profit US$9.37b | 9,372 | OK |
| SG three US$1.67t, 1.75 times | 1,667,848, 1.755 | OK |
| ICBC eight times | 8.04 | OK |
| Asset share and profit share, all 12 rows of Fig 2's table | recomputed | OK |
| ROE and CIR, all 12 rows of Fig 3 and Fig 4 tables | TAB's own | OK |
| ROA, 16 banks in Fig 6's table | TAB's own | OK |

## Corrections made while building

- AFFIN Bank is a conventional bank with an Islamic arm, not an Islamic bank. The page says "four of the five" low-ROE banks are Islamic (Bank Islam, Bank Muamalat, Bank Rakyat, MBSB). The source report's wording was fixed to match.

## Browser checks

- Desktop 1440 and phone 390 (Chromium, swiftshader): every figure at its end state, labels inside the frame, no overlaps left.
- 9:16 capture frames (`?shot=<name>&t=0.5` and end) for all six scenes.
- Real click on Fig 5: t went 0 to 0.31 at 500 ms to 1 at end. Chip read "5 / 6 · click to play", then "playing", then "click to replay". Enter restarts it.
- Reduced motion: no play, every chart seeks to its end state.
- impeccable detect: four "cramped padding" warnings on sections whose padding is a clamp(); the static detector cannot resolve it. The rendered padding is 72 to 150 px.
