# Sections

Six sections. Each is **one claim**, **one mechanism**, and **one shot**.

---

## The rule

The hero does not draw charts. It builds things that run. For this report the rule is the same
one the wage report used, and it is stricter here, because the subject is a number that people
have already read in the news and understood as a verdict.

> 3D earns its place when the scene is a **mechanism** — parts that move for a reason, and the
> claim falls out of watching them run. If the scene could be swapped for a flat chart with
> nothing lost, it should be the flat chart.

That rule bites hardest on section 2. A ranked bar chart of thirteen divisions is the obvious
thing, and for this report the obvious thing is not wrong — a ranking is a ranking. So the bars
are line art in space, they grow in rank order, and the August markers slide along them. What the
scene adds is not a chart. It is the *disagreement*: two bars pointing opposite ways, in the
same frame, at the same instant.

## Shared system

- **Frame** 1080x1920. Bottom 16vh reserved for the burned-in caption, top 8vh for the kicker.
  Nothing of the scene enters either band.
- **Vertical first.** The video is portrait, so the scenes that work are the ones that are tall:
  a column, a ladder, a corridor, a drum, a floor, a split.
- **Palette** paper `#f3f0e9`, ink `#1c1e24`, context `#a7a49a`, cool `#26557f`, warm `#bd5320`,
  rule `#d6d1c4`, shade `#e3ded2`. One accent per shot.
- **Colour meaning** blue is the price level and anything cooling. Orange is fuel and anything
  heating. A shot uses one of them, never both at equal weight.
- **Motion** one curve, `smoothstep`. Nothing loops inside a shot. Every shot ends still.
- **Speed** every scene plays in one second on the page. The video stretches a shot to the length
  of its voice line with `?dur=<ms>`, which changes the pace and nothing else.
- **Determinism** each scene is `f(t)`. `__seek(t)` renders any frame exactly.

---

## 1. The column

**Claim** The price level is 37.6% above 2010. One year of that is 1.8%, and it is 6.4% of the
climb.
**Numbers** `index_sep26` 137.6 · `index_sep25` 135.2 · `index_base_2010` 100 ·
`index_rise_since_2010` 37.6 · `index_rise_1y` 2.4 · `year_share_of_climb` 6.4
**Scene** one column standing on the 2010 base, with a reference plate marking September 2025.
**Mechanism** the column rises from the base to 137.6. The sliver between the reference plate
and the top lights up. That sliver is the year.
**Why not a chart** the claim is a *distance* — how much of a sixteen-year climb one year covers.
An index line hides the vertical scale, because the y-axis is the price level and a reader
scans the flatness of the line, not the width of the gap.

**Shot** 1s. Camera static, slightly off axis. One move: the column rises. Text: the index at
the top, the year's share at the sliver. Exit: the sliver holds lit.

---

## 2. The ladder

**Claim** The thirteen divisions do not agree. Transport is heating while housing cools.
**Numbers** `div_07_yoy` 2.5 and `div_07_yoy_aug` 2.0 · `div_04_yoy` 1.4 and `div_04_yoy_aug`
2.1 · `div_08_yoy` 1.8 and `div_08_yoy_aug` 2.6 · `headline_yoy_sep26` 1.8 · all thirteen rows
**Scene** thirteen bars, one per division, sorted by September rate, standing on a national line
at 1.8%.
**Mechanism** the bars grow in rank order, shortest first. Each carries a ghost marker at its
August value. The markers slide to their August position, and where a marker sits to the *right*
of its bar the division heated; to the left, it cooled.
**Why not a chart** the ranking is the chart. What the scene adds is the pair: transport and
housing, pointing opposite ways, in one frame, at the same instant.

**Shot** 1s. Camera static on the ladder, slightly above so the national line reads as a floor.
One move: the bars grow, then the markers slide. Text: two division names and their moves.
Exit: bars hold, markers hold.

---

## 3. The ribbon

**Claim** The headline has not moved. Three years inside a band of 1.1% to 2.0%. Everything
interesting is in what is inside the number.
**Numbers** `path36` 36 monthly rates, 2023-10 to 2026-09 · minimum 1.1% (June 2025) ·
maximum 2.0% (May 2026) · `core_yoy_dec25` 2.3 and `core_yoy_sep26` 1.7
**Scene** thirty-six months receding into depth. Each month is a cross-section. The top edge is
the headline rate; a second edge below it is core inflation.
**Mechanism** the curtain draws itself month by month as the camera recedes into it. The
ceiling barely moves. The core edge falls away from it.
**Why not a chart** a line chart of the headline would show a flat line, which is the finding,
and would hide the second line. The point of this scene is that *two* edges are running at once
and the gap between them is where the story is: core fell 0.6 points in nine months while the
headline went nowhere, so what filled the headline was not the core.

**Shot** 1s. Camera high, looking down the corridor. One move: the camera recedes as the
curtain draws. Text: "1.1% to 2.0%, three years" once. Exit: the corridor holds.

---

## 4. The drum

**Claim** The fuel shock is a subsidy wedge. RON95 averaged RM4.18 in September 2026. The
subsidised price was RM2.05 and had not moved.
**Numbers** `ron95_market_avg_sep26` 4.18 · `ron95_market_avg_dec25` 2.62 ·
`ron95_market_avg_sep26_change` +59.7% · `ron95_subsidised_sep26` 2.05 · `ron95_budi95_sep26`
1.99 · `ron95_gap_sep26` 2.13 · `ron95_market_last` 4.32 and `ron95_subsidised_last` 2.05 at
2026-10-22
**Scene** one drum, cut open, holding one litre of RON95.
**Mechanism** the market surface inside the drum rises week by week, fifty-six times, from the
December 2025 level to the September 2026 average. A level is cut into the drum at the
subsidised price and does not move. The material between the cut and the surface is what you do
not pay.
**Why not a chart** two lines and the gap between them is exactly what a chart shows. A drum
turns the gap into a volume: the thing you do not pay has a size, and it is nearly half the
drum.

**Shot** 1s. Camera static on the cut face, slightly above. One move: the surface rises. Text:
the two prices, and the September average. Exit: the surface holds at 4.18, the cut holds at
2.05.

---

## 5. The dots

**Claim** The national number hides a five-to-one spread. 0.5% in Sarawak, 2.4% in Negeri
Sembilan and Labuan.
**Numbers** all seventeen state rows for September 2026 · minimum 0.5% · maximum 2.4% ·
`headline_yoy_sep26` 1.8 · eight states above the national rate, one exactly on it
**Scene** seventeen dots on a floor, dropped unsorted.
**Mechanism** the dots find their place along the floor and sort themselves by value. A national
line runs through the floor at 1.8%, and the dots that stop above it are the ones running hotter.
**Why not a chart** a ranked bar chart of seventeen states is the obvious thing. The claim is
about *spread*, and a spread is a crowd first and a ranking second. The dots arrive as a crowd.

**Shot** 1s. Camera high, looking down at the floor, then settling as the dots sort. One move:
the sort. Text: the two ends of the range. Exit: the dots hold, sorted.

---

## 6. The split

**Claim** The same fuel shock does not land evenly. Urban transport prices rose 2.75% year on
year; rural transport prices rose 1.35%.
**Numbers** `urban_transport_yoy_sep26` 2.75 · `rural_transport_yoy_sep26` 1.35 ·
`urban_yoy_sep26` 1.76 · `rural_yoy_sep26` 1.54 · `urban_transport_index_sep26` 127.0 and
`rural_transport_index_sep26` 120.1
**Scene** one stream of fuel price enters from the top and splits into two channels, city and
countryside.
**Mechanism** the stream divides. The city channel is wide and fills fast; the countryside
channel is narrow and slow. Each ends in a column that rises to its own transport rate.
**Why not a chart** two bars would show the 1.4 point gap and stop. The scene shows the shape of
the gap: the overall urban and rural rates are only 0.22 points apart (1.76 against 1.54), so
the transport gap has to be diluted, which means transport carries a smaller weight in the rural
basket than in the urban one. That is a deduction from the published rates, not a forecast.

**Shot** 1s. Camera static on the split, looking slightly down the two channels. One move: the
stream divides and the columns rise. Text: the two transport rates. Exit: the columns hold.

---

## Notes section

- Nothing on this page is a forecast. Every figure is a published rate or index, or a rate
  computed from two published index rows, and `numbers.csv` says which.
- The CPI is an average of a basket whose weights are not in these datasets. The page never
  claims how much a division contributed to the headline.
- The market price of RON95 only exists from 30 September 2025. Every "how much it has risen"
  figure starts from December 2025.
- Monthly fuel prices are means of the weekly `level` rows in that month. September 2026 and
  December 2025 have four observations each.
