# Decisions

**Summary**: Recorded design decisions and tradeoffs made in the project.  
**Sources**: Gemfile, README.md, PROJECT.md, DESIGN.md  
**Last updated**: 2026-05-02

---

## Overview

Key technical and design decisions observed in the codebase.

## Rails 8.1.1 with SQLite

**Decision**: Use Rails 8.1.1 with SQLite as the primary database.  
**Rationale**: Rails 8 ships with SQLite-ready adapters (Solid Cache, Solid Queue, Solid Cable) that eliminate the need for Redis or PostgreSQL for moderate workloads. SQLite is simple, zero-config, and sufficient for a marketing site.  
**Tradeoff**: Not suitable for high-concurrency write workloads; fine for read-heavy content site.

## Import Maps over Node.js Bundler

**Decision**: Use import maps (`importmap-rails`) instead of a Node.js-based bundler (Webpack, esbuild, Vite).  
**Rationale**: Eliminates Node.js dependency, reduces build complexity, and aligns with Rails 8 defaults. Compatible with Hotwire.  
**Tradeoff**: Limited to ES modules; no tree-shaking or advanced transforms. Acceptable for a Stimulus-driven site.

## Blog Posts as Static Views (no DB-backed blog)

**Decision**: Blog posts (`/blogs/:slug`) are static view templates rendered directly by `BlogsController#show`. No Post model lookup.  
**Rationale**: The site has few curated devlog posts; static pages are simpler, faster, and version-controlled alongside the rest of the code.  
**Tradeoff**: Posts without a matching template return 404. Admin-created DB posts are not publicly routable. Adding a new post requires a code change and deploy.

## Hotwire (Turbo + Stimulus)

**Decision**: Use Hotwire for client-side interactivity.  
**Rationale**: Rails-native; provides SPA-like experience without heavy JavaScript frameworks. Turbo handles navigation and form submissions; Stimulus handles discrete UI behaviors.  
**Tradeoff**: Not suitable for complex client-side state; fine for a marketing site with forms and simple interactions.

## Custom Auth (has_secure_password)

**Decision**: Use Rails' built-in `has_secure_password` instead of Devise.  
**Rationale**: Simpler, fewer dependencies, full control over auth flow. The site has a small number of admin users.  
**Tradeoff**: Manual implementation of password reset, email verification, etc. Devise would provide these out of the box.

## Propshaft over Sprockets

**Decision**: Use Propshaft for the asset pipeline.  
**Rationale**: Propshaft is the Rails 8 default, simpler and faster than Sprockets. It only handles digesting and serving; transformations happen elsewhere.  
**Tradeoff**: No built-in asset pre-processing; relies on other tools for CSS/JS transforms.

## Tailwind CSS via tailwindcss-rails

**Decision**: Use Tailwind CSS for all styling.  
**Rationale**: Utility-first approach enables rapid, consistent UI development. The DESIGN.md defines a token system that maps directly to Tailwind classes.  
**Tradeoff**: HTML can become verbose; mitigated by partial usage and component extraction.

## Solid Trifecta (Cache, Queue, Cable)

**Decision**: Use Solid Cache, Solid Queue, and Solid Cable as backend adapters.  
**Rationale**: All three are database-backed (SQLite), eliminating the need for Redis or separate queue processes. Rails 8 default stack.  
**Tradeoff**: Less performant than Redis for high-throughput scenarios; acceptable for low-traffic marketing site.

## Kamal + DigitalOcean Deployment

**Decision**: Deploy via Kamal to a single DigitalOcean droplet.  
**Rationale**: Kamal is the Rails 8 default deployment tool; uses Docker containers with zero-downtime deploys. Single droplet keeps costs low for a marketing site.  
**Tradeoff**: No auto-scaling; manual recovery if the droplet fails.

## Minitest over RSpec

**Decision**: Use Minitest for testing.  
**Rationale**: Rails default; simpler, faster, and sufficient for the project's testing needs.  
**Tradeoff**: RSpec offers more expressive syntax and richer matchers; Minitest is more minimal.

## TDD Methodology

**Decision**: Strict red→green→refactor cycle enforced.  
**Rationale**: Ensures test coverage for all features; aligns with Rails conventions.  
**Source**: PROJECT.md

## Posts by Slug

**Decision**: Use `slug` as the URL parameter for posts instead of numeric ID.  
**Rationale**: SEO-friendly URLs; human-readable blog post paths (`/blogs/my-post-slug`).  
**Tradeoff**: Slugs must be unique and stable; changing a slug breaks existing links.

## Design Token System

**Decision**: Formalized design tokens in `DESIGN.md` with explicit Tailwind class combinations.  
**Rationale**: Ensures visual consistency across all pages; acts as a single source of truth for frontend implementation.  
**Tradeoff**: Requires discipline to keep DESIGN.md and actual code in sync.

## Project Naming: Orbwalker

**Decision**: Use `Orbwalker` as the canonical public and internal project name in wiki and website content.  
**Rationale**: Project owner confirmed `Matchatro` was only a temporary draft name during early design documentation.  
**Tradeoff**: Early raw documents may still contain `Matchatro`; those references should be treated as historical aliases to avoid confusion.

## One Report, One Palette

**Decision**: Every report picks its own palette, from a reference image of its own subject, and no report may reuse a palette another report has used. `playbook/palettes.md` is the registry. The palette is stage 6 of `playbook/pipeline.md`, before the viz is designed, not after.  
**Rationale**: The CPI report shipped a warm cream that was a shade off the wages report's cream, and on a phone the two were the same product. `pipeline.md` already said pages should not share a palette and it was not enough, because nothing made anyone check. A registry does: the palette is a row, and a row that is already there is visible from across the room. Picking the palette before the viz matters because the ground decides how a scene reads. A dark ground with lit marks is a different drawing from a cream ground with pale ones, and you cannot design the mechanism until you know which one you are drawing into.  
**Tradeoff**: One more stage, and one more file to keep current. The method costs an image search and a palette extraction per report.  
**Context**: The CPI palette came from a fuel price board at night, which is the subject of the report's loudest beat. Its two accents, a backlit blue and an LED red, are the cooling half and the heating half of the story.

## The Film Has Its Own Order, Not the Page's

**Decision**: The video lands a single claim and is cut in the order that claim needs. It is not the page's order, and it does not reuse the structure of the previous report's film.  
**Rationale**: A page is scrolled and a film is watched. `video.md` said the video needs one claim the page does not have, but nothing stopped the film from being a recording of the page in order, which is what the CPI film first was, and what the wages film is. The CPI film now opens on the flat line and closes on the price level, the opposite of its page order, because that is the order the argument needs.  
**Tradeoff**: The shot list and the page are no longer in the same order, so the film has to be read on its own. Each shot records the `beat` it plays so a later reader can tell a deliberate sequence from an accident.

## A Film Has Five Beats

**Decision**: A film runs premise, what the data shows, what the data meant, what the data leads, and the ending. Never background, then method, then data, then conclusion.  
**Rationale**: Six ways of describing the shape of an explanatory video, from the Eurographics paper on narrated visualisation through the practitioner guides, all land on the same order and all warn against the same thing: the conclusion-last shape makes the viewer sit through the evidence before it learns why the evidence matters. The CPI film was cold-opened on a flat price line and told the viewer why it mattered forty seconds later, and the complaint was that it started too abruptly. A cold open is a trap. The premise is a promise, and it has to be made in the first seconds, in type, and it has to work muted.  
**Tradeoff**: The premise spends a shot on the claim, so the film carries one more shot than the page does, and the claim is on screen before the evidence that supports it.  
**Context**: The research is recorded in `playbook/video.md` under "The five beats", with the sources that agree on it.

## A Card Is a Shot Type

**Decision**: A shot is either a scene from the page or a card. A card is a full-frame typographic plate the recorder builds, like the end card, and it exists for the two frames a film needs and a report does not have: the opening premise and the closing implication. Cards are film-only and leave the page untouched.  
**Rationale**: The opening premise and the closing implication are both type, not chart. Forcing them into a scene means inventing a mechanism to carry words, and the words get small. A card is the one place in the pipeline where the typography is the whole shot, so it is the right place for the claim and the so-what. The page is a scrolled set of claims and does not need either.  
**Tradeoff**: The card markup lives in the capture tools rather than in the report, so it is not visible in the page's own source and cannot be checked by the page QA. It is checked by the storyboard and by the rendered frame.

## The Type Goes Behind the Chart, Not on Top of It

**Decision**: Where a scene needs a large number, the display type is hung behind the chart in depth, and the chart is scaled and offset to make room for it. It is never drawn on top of the chart, and it never sits on a plate.  
**Rationale**: A label on a filled shape needs a plate behind it, and a plate is a flat rectangle that sits on top of the drawing and breaks the illusion that the chart is a thing in a room. Hanging the type in the scene, behind the geometry, solves the same problem with depth: the chart's own edges draw over the type, so the type reads as something behind the glass of the cabinet. The CPI column scene carries a ghosted "+37.6%" two and a half units behind the column, and the column's silhouette cuts across it.  
**Tradeoff**: The type is a texture, so it needs a font that has loaded before the scene paints, and a repaint must not re-register the font load or the page loops forever. The scale of the chart has to be re-measured with the compose transform neutralised, or the framing drifts.  
**Context**: `Stage.backdrop()`, `Stage.compose()` and `Stage.fit()` in `reports/malaysia-cpi/scene.js`. The scene also had to state the claim in its heading, because the type on the canvas is not in the page's text.

## The Last Frame Is the Whole Report

**Decision**: The ending shot puts every chart in the film on screen at once, blurred, behind the sign-off. It is a wall, not a single scene and not a black frame.  
**Rationale**: The end of an explanatory film is the one moment the viewer can see that the thing they watched was made of more than the last frame they saw. A blur is enough: the wall has to read as one surface with everything on it, not as six readable charts competing with the words. The CPI ending catches all six scene frames clean, before the overlay goes on, tiles them, and scrims them.  
**Tradeoff**: The wall needs a clean capture of every scene, so the recorder takes a second frame per shot. A heavy blur makes the wall unreadable and the words lose their ground, so the blur and the scrim have to stay light.

## One Report, One Video

**Decision**: Every report produces exactly one vertical video, and the video file and its recorded voice tracks are **not** tracked in git. The shot list, the voice-over script, the per-line durations and the storyboard PNGs are tracked.  
**Rationale**: One report makes one video, and the video is six megabytes of incompressible blob. Git keeps every version forever, so tracking it would add that weight to the history of every report that ships. Everything needed to rebuild it is small and text. `voice.py` and `mux.py` put the file back in about three minutes.  
**Tradeoff**: A clone of the repo has no video in it. If the video is the deliverable, it has to be copied out of the working tree. The root `.gitignore` carries the rule as `raw/*/video/out.mp4`, `raw/*/video/clips/`, `raw/*/video/tmp/` and `raw/*/vo/*.mp3`.  
**Context**: The rate card's three and six video tiers are out of scope. The video is one per report.

## The Capture Tools Take Their Theme From the Shot List

**Decision**: `playbook/tools/browser.js` exports a `THEMES` map and an `overlayCSS(theme)` function, and `shots.json` names the theme. The capture and storyboard tools read it from there.  
**Rationale**: The tools were hard-wired to the wages palette, so a second report with a different house style meant editing the tools. The CPI report uses a different palette and a different display face from the wages report. Making the theme a data field means a new house style is a data change, not a code change.  
**Tradeoff**: A theme is a small set of colours and one display face. A report that wants a genuinely different chart language still has to change `scene.js`, which is expected.

## The Page Plays in One Second, the Video Plays for the Length of the Words

**Decision**: Every scene runs for one second on the page. The video passes `?dur=<ms>` to stretch the same scene to the length of its voice line.  
**Rationale**: The page is read, not watched. A one-second shot is a summary that a reader can re-trigger by clicking, and six of them do not cost a reader a minute of their life. The video is watched, so its shot length has to match the sentence being spoken over it. The scene's internal timings are all in normalised `t`, so stretching the duration stretches the choreography proportionally and nothing breaks.  
**Tradeoff**: Two rates to reason about, and the video frame is not the page frame. The composition has to hold at both.

## Important Files

- `playbook/pipeline.md` — the eleven stages and four gates
- `playbook/video.md` — the seven-stage video pipeline
- `playbook/tools/browser.js` — route, launch flags, themes, `openShot`, `frameContext`
- `raw/malaysia-cpi/qa.md` — figure diff, render checks and screenshots for the CPI report
- `raw/malaysia-wages/qa.md` — figure diff and screenshots for the wages report
- `Gemfile` — Dependency choices
- `config/importmap.rb` — Import map configuration
- `DESIGN.md` — Design token system

## Related Pages

- [[architecture]]
- [[setup]]
