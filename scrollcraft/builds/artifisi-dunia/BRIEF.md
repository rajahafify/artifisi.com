# Artifisi Dunia page: brief

Written from what fify said in the website thread on 29 and 30 Oct 2026, not from a new interview. Anything fify did not decide is marked **Authored**.

## What fify said
- "Dunia page still feels bad" (30 Oct), after accepting the home page rebuild.
- Earlier: "dont hide our video. i want it to be front and center", "can include detail alreay in the video".
- Keep the approved hero with its line "Gameplay in, training data out."

## What the visitor must believe by the end
Dunia is a real recorder that already works inside a game, and the data it writes is the kind a robotics team trains on.

## The one action
Apply as a pilot partner, either as an AI or robotics team or as a game studio.

## Grammar
**Live surface.** The honest pitch for Dunia is "watch what it does", and Dunia is a tool, so the page below the hero is the recorder window itself. It has a window bar, view tabs, a record light, the film, a channel inspector, a timeline, a log and an export tree. The scroll is the playhead.

Why the other grammars lost:
- Split stage: it is the home page's grammar.
- Filmic one-shot: needs scrub footage we don't have.
- Typographic poster: buries the film.
- Chaptered editorial: this is close to the page fify rejected.
- Gallery: Dunia is one thing, not a range.
- Continuous world: there is no geography.
- Cutlist: the wrong energy for a technical buyer.

Honesty rule: every readout and row is computed in dunia.js from a sample flight array. The window footer says the values are sample and the film is real.

## Feeling curve
| Part | Feeling | Cause |
|---|---|---|
| Hero | curiosity | the shared three.js scene, opened on the AI side |
| Watch | orientation | the film fills the main pane, and a help note says what Dunia does |
| Record (peak) | absorption | the record light blinks, six channels light one by one, the playhead runs and steps write themselves at 10 Hz |
| Export | recognition | the RLDS episode tree writes itself line by line |
| Status | trust | a plain statement of where it stands today: a capture demo, with the SDK next |
| Episodes | play | the existing sheets, one of them a car you can steer |
| Pilot | resolve | a real form in the recorder's idiom, with the question changing by who is applying |

## Signature move
**Scroll is the playhead.** Scrolling records a 30 second sample flight at 10 Hz. 300 steps are written, and the readouts, log and export tree are computed from the step under the playhead. The view tabs in the window bar jump the playhead.

## Timing
View changes are timed CSS transitions (480 ms) triggered at phase thresholds, not opacity tied to scroll position, so they look the same at any scroll speed. This follows fify's 30 Oct note that text changing while scrolling felt abrupt.

## Status wording
The 30 Oct Dunia project update says the SDK is still a plan, so the copy says "working capture demo", with the SDK named as the next step.
