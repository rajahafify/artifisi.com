# Sections

Six sections. Each is **one claim**, **one mechanism**, and **one shot**.
Rewritten 2026-10-26 against the full 16-year series and against the hero's grammar.

---

## The rule

The hero does not draw charts. It builds things that run: seventy agents wander a street
grid and get captured into a lattice; cars lap a track with a lidar fan sweeping ahead;
a robot arm solves IK to pick a cube up and put it down. The data is a **consequence of
the mechanism**, not a picture of it.

So, for every section:

> 3D earns its place when the scene is a **mechanism** — parts that move for a reason, and
> the claim falls out of watching them run. If the scene could be swapped for a flat chart
> with nothing lost, it should be the flat chart.

That rule kills most of what I had planned last round. Below, each section is a mechanism
first and a picture second.

## Shared system

- **Frame** 1080x1920. Bottom 16vh reserved for the burned-in caption, top 8vh for the
  kicker. Nothing of the scene enters either band.
- **Vertical first.** The video is portrait, so the scenes that work are the ones that
  are tall: a shaft, a section, a corridor, a tower. This is a reason to choose a
  mechanism, not just a constraint to survive.
- **Palette** paper `#f6f2ea`, ink `#332d26`, context `#b6ab96`, accent `#1e5b49`,
  warning `#a6442a`. One accent per shot.
- **Motion** one curve, `smoothstep`. Nothing loops inside a shot. Every shot ends still.
- **Determinism** each scene is `f(t)`. `__seek(t)` renders any frame exactly.

---

## 1. The lift

**Claim** Education pays twice the national median.
**Numbers** `med_P_2025` 5,990 · `nat_median_2025` 2,940 · `ratio_P_2025` 2.04
**Scene** one tower in section, cut open. Floor heights are ringgit. The ground floor is
the national median; the top floor is education.
**Mechanism** a lift car. It starts at 2,940 and climbs to 5,990. Floors tick past as it
rises, each tagged with the ringgit value at that height.
**Why not a chart** the claim is "twice as high", and the scene makes you *travel* the
distance rather than compare two bar lengths. The ride is the argument.

**Shot** 5s. Camera rides inside the shaft, looking up. One move: up. Text: the two
figures, tagged to their floors. Exit: the car stops at the top floor and holds.

---

## 2. The sorting floor

**Claim** Two in three workers are in an industry that pays below the national median.
**Numbers** `ratio_*_2025` and `share_*_2025` for 19 sections · 65.8% combined
**Scene** a floor with nineteen bins along one wall, each bin sized by that industry's
share of employees. A line of workers enters and is sorted.
**Mechanism** agents walking a conveyor, each diverted into a bin. Bins fill at different
rates because they are different sizes and get different flows. The median is a red line
painted across the floor.
**Why not a chart** the percentage is a *count of people*, so the scene should count
people. Watching the floor fill is the claim; a 65.8% bar is a summary of it.

**Shot** 7s. Camera high, looking down the line of bins. One move: a slow dolly along the
wall. Text: "65.8% of employees" once, when the left-hand bins are visibly fuller.

---

## 3. The canyon

**Claim** The wage ladder narrowed for a decade, broke in 2020, and never got back to 2019.
**Numbers** spread 3.59 (2010) · 3.72 (2013) · 3.18 (2019) · 3.80 (2020) · 3.30 (2025)
**Scene** a canyon cut across the frame, time running left to right. The two walls are the
best-paid and worst-paid industry. The gap between them is the spread.
**Mechanism** the walls move. 2010-2016 is near-flat, between 3.39 and 3.72. Then a slide to
3.18 by 2019. In 2020 the walls slam apart to 3.80 in a single step, then close again but
stop at 3.30 — below 2010, above the 2019 floor.
**Why not a chart** the claim is about a space people move through getting narrower. A
line chart reports the number; a canyon is the thing the number describes.

**Shot** 6s. Camera above the near wall, looking down the cut, static. The walls do the
moving. Text: the year, ticking, along the floor. Exit: walls hold at 3.30.

**Why not perspective** an earlier pass put the camera inside a one-point-perspective
corridor. Perspective shrink (58% over the run) swamped the ±10% width change, so the
pinch and the 2020 break were invisible. Measured on screen the far and near openings came
out the same width and the shape read as an hourglass. The canyon keeps width literal.

**Counterpoint, burned in as a footnote** the 2020 jolt is a real fall in the national
median (-15.0%), not a coverage change: covered employees rose 2.8% that year.

---

## 4. The section

**Claim** The public sector climbed and the resource and finance sectors fell.
**Numbers** `ratio_*_2010` against `ratio_*_2025` for all 19
**Scene** a building in section: nineteen lift shafts side by side, each shaft one
industry. Every floor is a wage level. Windows on each floor light when that industry's
median is at or above it.
**Mechanism** nineteen cars, all moving at once as the year advances. Health's car climbs
past three floors. Real estate's drops two. The lights follow the cars.
**Why not a chart** a slope chart draws the same information, but the section lets you see
*who passes whom* as it happens — the crossing is the story, and crossings are motion.

**Shot** 6s. Camera static, frontal, whole section in frame. The cars move; nothing else
does. Text: the year counter, and four labels on the biggest movers. Exit: cars hold at
2025.

---

## 5. The city

**Claim** Four industries carry more than half the wage bill.
**Numbers** `bill_P` 17.4 · `bill_C` 15.9 · `bill_O` 11.2 · `bill_G` 11.0 · 55.6%
**Scene** a city of nine blocks. Footprint is share of employees, height is pay, so the
volume of each block is its share of the wage bill.
**Mechanism** lights. Each block carries a window grid whose lit count tracks its bill.
The four largest fill first; the rest stay mostly dark. A slow orbit reveals the mass.
**Why not a chart** volume is a product of two encodings and a bar chart cannot show it.
This is the one section where the third dimension is a quantity.

**Shot** 8s. Camera orbits about 30 degrees, no cut. Blocks rise in bill order, then the
four fill with light. Text: "55.6%" once. Exit: orbit stops, the four stay lit.

---

## 6. The cutaway

**Claim** Where pay is lowest, the average sits furthest above the typical wage.
**Numbers** `mm_A_2025` 1.42 · `mm_F_2025` 1.40 · `mm_O_2025` 1.05 · `mm_P_2025` 1.06
**Scene** one building, cut open, two floors marked: the median floor and the mean floor.
**Mechanism** a lift stops at the median, then continues to the mean. In agriculture the
second stop is far above the first; in public administration it is almost the same floor.
The gap between the two stops is the claim.
**Why not a chart** a dumbbell is two dots and a line. A cutaway makes the gap a *distance
you ride*, which is what it is.

**Shot** 6s. Camera static on the cut face. The car moves twice. Text: the industry name
and the two floors. Exit: the car holds at the mean floor.

---

## Notes section

- Ratios are against the national median **in the same year**, which cancels inflation.
  No claim of real growth is made anywhere.
- `recipients` counts employees covered by the survey, not total employment.
- Sections B, D, E, L and R cover 1% or less of covered employees each (D is exactly 1.0%).
  Their medians are volatile and no claim rests on them alone.
