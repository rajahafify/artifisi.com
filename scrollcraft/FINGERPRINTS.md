# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|

*(empty: your first build has nothing to clear, so build whatever the interview
points at. From the second onwards, this table is the constraint.)*

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

Nothing is taken yet.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| artifisi-home (30 Oct 2026) | Split stage | Fixed divider labelled Games and AI, fills with progress, counts rows crossed | Existing three.js scene split into a games half and an AI half | hero, pin (kinetic), pin (cue crossfade, divider leans), pin (reveal + crossing), pin (collapse), flow; 5 acts after the hero, about 11.6 vh pinned | Divider sweeps off the left edge, the AI column takes the screen with the Dunia film; contact form after a quiet founder note | Gameplay squares leave each game screenshot, cross the divider and land as rows in a sample data sheet | Flat teal and blue grounds, real game screenshots, Drive-embedded film | Astro page, artifisi.com repo |
| artifisi-dunia (30 Oct 2026) | Live surface | Recorder window bar: view tabs (Watch, Record, Export, Status) that jump the playhead, record light | Shared three.js hero opened on the AI side | hero, one long pin (phase-driven surface, 5.2 vh), flow (interactive episode sheets), flow close; 3 parts after the hero | Pilot application as a real form in the recorder's idiom, question changes with the applicant | Scroll is the playhead: a sample flight records at 10 Hz, channels light, steps write, RLDS tree builds | Dark app surface, the Drive-embedded film as the main pane, mono telemetry | Astro page, artifisi.com repo |
