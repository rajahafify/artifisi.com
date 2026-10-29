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

## Redesign, 29 Oct 2026 (later)

New figures on the redesigned page, checked against data.json:

| Page says | Computed | Result |
|---|---|---|
| Share column: Maybank 27.3%, CIMB 20.2%, Public Bank 14.6%, the other nine 38.0% | 27.30, 20.18, 14.55, 37.97 | OK |
| Bank sheet ranks for all 12 banks (page.js computes them; ties read "equal") | recomputed in Python, same ranks | OK |
| Maybank sheet as written in the HTML: 1st 27.3%, 1st 27.0%, ROE 2nd equal, ROA 3rd equal, CIR 4th leanest, CAR 2nd | page.js output in the browser, identical | OK |
| Hong Leong sheet: 5th largest, ROA 1st, CIR Leanest, CAR 12th | browser, after a real click | OK |
| Bank Central Asia is smaller than Maybank, CIMB or Public Bank | BCA 94,997 vs Public Bank 138,341 | OK |
| League, cost to income order: Hong Leong 30.0 first, AFFIN 68.2 last | browser, after a real click on the tab | OK |
| ROE line at 4.0%: 1 of 12 under it (MBSB 2.2) | browser, slider | OK |

## Corrections made while building

- AFFIN Bank is a conventional bank with an Islamic arm, not an Islamic bank. The page says "four of the five" low-ROE banks are Islamic (Bank Islam, Bank Muamalat, Bank Rakyat, MBSB). The source report's wording was fixed to match.

## Motion pass (29 Oct 2026, evening)

- Charts autoplay: scrolling at 1440 with real wheel input, each chart went from t=0 to t=1 when its block came into view, in order (swap, blocks, dials, tanks, lanes). Clicks still replay.
- Skyline (`skyline.js`): heights are each bank's assets over Maybank's. Labels read Maybank 27.3%, CIMB 20.2%, Public Bank 14.6%, same as data.json.
- Film: `?shot=skyline&t=0.5` and `&t=1` at 540x960 show the section alone with the full street in frame. `window.__seek(t, "skyline")` works.
- PDF: printed with Chromium to A4 (20 pages). Count-ups print their real figures (62%, 1.4%, 3.8%), each chart prints inside its own text block at its end frame with its table open, and the skyline prints across the page.
- taste-skill inspect: 0 FAIL at 1440, 768 and 390.

## Browser checks (redesign, playwright-cli)

- Real clicks: bank tab, measure tab, chart click to play (chip "1 / 5 · playing", then "1 / 5 · click to replay"), each chart's control (share of profit, Islamic banks, ROE slider, Indonesia, assets and profit). Each control brings its own chart forward and runs it to the end.
- Reduced motion at 390: no motion class, all five charts at their end state with "Still frame" chips, nothing left hidden.
- No script at 1440: charts, controls, bank list and league bars are hidden; every number stays in the text and the tables.
- taste-skill inspect at 1440, 768 and 390: 0 FAIL.

## Browser checks (first build)

- Desktop 1440 and phone 390 (Chromium, swiftshader): every figure at its end state, labels inside the frame, no overlaps left.
- 9:16 capture frames (`?shot=<name>&t=0.5` and end) for all six scenes.
- Real click on Fig 5: t went 0 to 0.31 at 500 ms to 1 at end. Chip read "5 / 6 · click to play", then "playing", then "click to replay". Enter restarts it.
- Reduced motion: no play, every chart seeks to its end state.
- impeccable detect: four "cramped padding" warnings on sections whose padding is a clamp(); the static detector cannot resolve it. The rendered padding is 72 to 150 px.
