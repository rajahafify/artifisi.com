# Log

**Summary**: Chronological history of wiki changes and codebase events.  
**Last updated**: 2026-10-26

---

## [2026-10-24] change | Rails app replaced by static Astro site

Source: PR #27
Changes:
- Removed the Rails app, Kamal config, Docker files and Ruby CI.
- Added an Astro static site at the repo root, deployed on Cloudflare Pages.
Notes:
- Most wiki pages still describe the Rails app and are now stale.
Verification:
- code checked: yes
- human reviewed: no

## [2026-09-03] content | Update studio address in contact section

Source: project owner correction in chat + `app/views/pages/home.html.erb`

Changes:
- Replaced placeholder studio address `Level 23, Plaza Sentral, Kuala Lumpur, Malaysia 50470` with `8, Jalan Prima Pelangi 3, Bukit Prima Pelangi, 51200 Kuala Lumpur, Malaysia` in the home page contact section.

Notes:
- Old address was an incorrect placeholder; new address confirmed by the project owner.

Verification:
- code checked: yes (view updated)
- human reviewed: no

---

## [2026-05-28] security | Update addressable for Ruby scan

Source: `Gemfile.lock`, `bin/bundler-audit`

Changes:
- Updated `addressable` from `2.8.7` to `2.9.0`.
- Updated transitive dependency `public_suffix` from `6.0.2` to `7.0.5`.

Notes:
- `bin/bundler-audit update && bin/bundler-audit check` flagged `addressable 2.8.7` for `CVE-2026-35611`; the advisory recommends `addressable >= 2.9.0`.

Verification:
- scan: `bin/bundler-audit check` (no vulnerabilities)
- scan: `bin/brakeman --no-pager` (0 warnings)
- tests: `bin/rails test` (65 runs, 628 assertions, 0 failures)
- human reviewed: no

---

## [2026-05-28] content | Add Orbwalker itch.io demo links

Source: `app/views/pages/orbwalker.html.erb`, `test/controllers/pages_controller_test.rb`

Changes:
- Added a primary `Play demo` CTA in the Orbwalker hero linking to `https://rajahafify.itch.io/orbwalker`.
- Added a `Play demo on itch.io` CTA in the follow section beside the studio contact link.
- Updated page controller assertions and `wiki/features.md`.

Verification:
- tests: `bin/rails test test/controllers/pages_controller_test.rb` (4 runs, 124 assertions, 0 failures)
- tests: `bin/rails test` (65 runs, 628 assertions, 0 failures)
- manual: local `/projects/orbwalker` HTML contains both itch.io demo links.
- human reviewed: no

---

## [2026-05-28] content | Add Orbwalker video demo embed

Source: `app/views/pages/orbwalker.html.erb`, `test/controllers/pages_controller_test.rb`

Changes:
- Added a `Watch demo` hero CTA linking to `section#demo`.
- Added a vertical YouTube embed for the Orbwalker short gameplay demo.
- Updated page controller assertions and `wiki/features.md`.

Verification:
- tests: `bin/rails test test/controllers/pages_controller_test.rb` (4 runs, 121 assertions, 0 failures)
- tests: `bin/rails test` (65 runs, 625 assertions, 0 failures)
- manual: local `/projects/orbwalker` HTML contains the `#demo` CTA and YouTube embed URL.
- human reviewed: no

---

## [2026-05-28] content | Replace Orbwalker gameplay art with real screenshots

Source: `raw/orbwalker-screenshot/`, `app/views/pages/orbwalker.html.erb`, `test/controllers/pages_controller_test.rb`

Changes:
- Copied the real Orbwalker combat, shop, relic, and run-summary screenshots into `app/assets/images/`.
- Updated the Orbwalker project page combat section, shop section, and run-loop section to use those real screenshots.
- Kept the previous `orbwalker-hero-keyart.png` image as the page hero banner.
- Added page controller assertions that `/projects/orbwalker` renders the hero key art and real gameplay screenshot assets, and no longer references the old generated combat/shop page images.
- Added `wiki/sources/orbwalker-screenshots.md` and updated `wiki/features.md` and `wiki/source-register.md`.

Notes:
- The `raw/orbwalker-screenshot/mainmenu.jpeg` screenshot is retained as source material but is not currently used on the public page.

Verification:
- tests: `bin/rails test test/controllers/pages_controller_test.rb` (4 runs, 113 assertions, 0 failures)
- tests: `bin/rails test` (65 runs, 617 assertions, 0 failures)
- lint: `bin/rubocop test/controllers/pages_controller_test.rb` (no offenses)
- assets: `bin/rails assets:precompile` (successful; emitted the usual development-mode manifest warning)
- human reviewed: no

---

## [2026-05-28] fix | Add Orbwalker newsletter submission feedback

Source: `app/views/pages/orbwalker.html.erb`, `app/controllers/contacts_controller.rb`, `test/controllers/contacts_controller_test.rb`

Changes:
- Added a dedicated `orbwalker_newsletter_form` Turbo frame with inline success and validation-error states.
- Updated `ContactsController#create` so Orbwalker newsletter submissions replace the Orbwalker frame instead of the home contact form.
- Added controller coverage for Orbwalker newsletter Turbo Stream success, Turbo Stream validation failure, and HTML validation failure.
- Updated `wiki/features.md` and `wiki/source-register.md` for the new feedback behavior and partials.

Notes:
- Existing home contact form Turbo Stream behavior remains covered and unchanged.

Verification:
- tests: `bin/rails test test/controllers/contacts_controller_test.rb test/controllers/pages_controller_test.rb test/integration/home_contact_form_test.rb` (14 runs, 183 assertions, 0 failures)
- lint: `bin/rubocop app/controllers/contacts_controller.rb test/controllers/contacts_controller_test.rb` (no offenses)
- human reviewed: no

---

## [2026-05-28] operations | Production deploy

Source: `config/deploy.yml`, `README.md`, Kamal deploy output

Changes:
- Deployed commit `7f686110de51e9b04e51d01ae0deb30acbc440c9` to production via `bin/kamal deploy`.
- Recorded active deployment-doc contradiction in `wiki/contradictions.md`.

Notes:
- `config/deploy.yml` targets `206.189.32.232` and `www.artifisi.com`; README still references `146.190.83.167`.
- Production responded with `HTTP/2 200` at `https://www.artifisi.com`.

Verification:
- code checked: yes
- human reviewed: no

---

## [2026-05-28] test | Verify DB-backed contact and newsletter flows

Source: `test/controllers/pages_controller_test.rb`, `test/controllers/contacts_controller_test.rb`, `test/integration/home_contact_form_test.rb`

Changes:
- Updated the Orbwalker page controller test to assert the backend newsletter form posts to `POST /contacts` with `source=orbwalker_newsletter` instead of expecting the removed `mailto:` playtest CTA.
- Re-verified the home page contact form, contact controller, and Orbwalker newsletter signup flow.

Verification:
- code checked: yes
- human reviewed: no
- tests: `bin/rails test test/controllers/pages_controller_test.rb test/controllers/contacts_controller_test.rb test/integration/home_contact_form_test.rb` (11 runs, 154 assertions, 0 failures)
- tests: `PARALLEL_WORKERS=0 bin/rails test` (62 runs, 576 assertions, 0 failures)

---

## [2026-05-16] feat | Add Orbwalker backend newsletter signup form

Source: `app/views/pages/orbwalker.html.erb`, `app/controllers/contacts_controller.rb`, `test/controllers/contacts_controller_test.rb`

Changes:
- Replaced Orbwalker `mailto:` playtest CTA with a backend form in the `#follow` section capturing `name` and `email`.
- Wired submissions through existing `POST /contacts` by sending hidden fields for `message` (`"Orbwalker newsletter signup"`) and `company` (`""`), plus `source=orbwalker_newsletter`.
- Updated `ContactsController#create` HTML success redirect logic to return Orbwalker newsletter submissions to `GET /projects/orbwalker#follow` with a newsletter-specific flash notice.
- Added controller test coverage for Orbwalker newsletter signup create + redirect behavior.
- Updated `wiki/features.md` Contact Form section for this new flow.

Verification:
- code checked: yes
- human reviewed: no
- tests: `bin/rails test test/controllers/contacts_controller_test.rb test/integration/home_contact_form_test.rb` (7 runs, 53 assertions, 0 failures)

---

## [2026-05-02] fix | Fix empty devlog section and remove duplicate combat image from orbwalker hero

Source: `bugfix/orbwalker-page` branch

Changes:
- Removed duplicate `combat.png` from orbwalker hero section (`app/views/pages/orbwalker.html.erb`). The same image already appears in the COMBAT section immediately below.
- Fixed devlog section on home page showing "No posts published yet" in production. Replaced DB-backed `@featured_posts = Post.recent_published` with a static "Introducing Orbwalker" card linking to `/blogs/introducing-orbwalker`.
- Updated `PagesController#home` — removed `@featured_posts` query.
- Updated `test/controllers/pages_controller_test.rb` — removed Post creation fixtures and updated assertions for static blog link and single article count; removed combat.png hero assertion.

Verification:
- code checked: yes
- human reviewed: no
- tests: 61 runs, 560 assertions, 0 failures

---

## [2026-05-02] feat | Devlog static pages — Introducing Orbwalker

Source: `devlog/introducing-orbwalker` branch

Changes:
- Replaced dynamic blog system (Post model) with static views served by `BlogsController#show`. Controller now renders templates by slug.
- Created `app/views/blogs/introducing_orbwalker.html.erb` — static devlog page with light theme, "Devlog" badge, author/date metadata, and full Orbwalker introduction.
- Removed `devlog` listing route/action/view from `PagesController` and routes.
- Home page devlog section links use `blog_path(post)`; "View all posts" link removed.
- Commits: `cc89e16`, `1e4ff5c`, `1633fe6`

Verification:
- code checked: yes (BlogsController, static view, routes, home page verified)
- human reviewed: no

---

## [2026-05-02] fix | Priority 4 — Proof & Trust Signals completed

Source: `wiki/context/landing-page-review-todo.md`

Changes:
- **4.1** Added "The Team" section on homepage after about section with founder mention.
- **4.2** Removed placeholder phone number `+60 12-345 6789` from contact section.
- **4.3** Renamed blog section: `#blog` → `#devlog`, "From the Blog" → "Devlog". Updated nav anchor. The site already had posts/blogs infrastructure; this aligns labeling with the "Devlog" nav link.
- **4.4** Added "Press Kit" placeholder link in footer.
- Updated `test/controllers/pages_controller_test.rb` with assertions for all four items.

Verification:
- code checked: yes (61 tests, 564 assertions, 0 failures. rubocop clean.)
- human reviewed: no

---

## [2026-05-02] fix | Priority 3 — Orbwalker Conversion completed

Source: `wiki/context/landing-page-review-todo.md`

Changes:
- **3.1** Added "Wishlist on Steam" and "Join Discord" placeholder CTAs to the #follow section on the Orbwalker page. Replaced "Back to Artifisi" and "Get in touch" buttons. Added small "Back to Artifisi" tertiary text link.
- **3.2** Added combat gameplay screenshot (`combat.png`) above the fold in the Orbwalker hero section with rounded-2xl styling.
- Updated `test/controllers/pages_controller_test.rb` with CTA and gameplay media assertions.

Verification:
- code checked: yes (60 tests, 553 assertions, 0 failures. rubocop clean.)
- human reviewed: no

---

## [2026-05-02] fix | Priority 2 — Positioning Consistency completed

Source: `wiki/context/landing-page-review-todo.md`

Changes:
- **2.1** Renamed "Our Services" → "Our Capabilities" on homepage. Changed section id `#services` → `#capabilities` and updated links. Updated subheader to "We build every part of our games in-house."
- **2.2** Updated homepage hero: H1 → "Original Games from Malaysia", subcopy includes Orbwalker description, primary CTA → "Follow Orbwalker" (links to orbwalker path), secondary CTA → "Contact the Studio" (links to #contact).
- **2.3** Updated nav links to: Home, Orbwalker, About, Devlog, Contact.
- Updated `test/controllers/pages_controller_test.rb` assertions to match new copy and nav links.

Verification:
- code checked: yes (60 tests, 547 assertions, 0 failures. rubocop clean. brakeman 0 warnings.)
- human reviewed: no

---

## [2026-05-02] fix | Priority 1 — Critical Trust & Credibility completed

Source: `wiki/context/landing-page-review-todo.md`

Changes:
- **1.1** Added `/privacy` route (`config/routes.rb`), controller action (`app/controllers/pages_controller.rb`), privacy policy view (`app/views/pages/privacy.html.erb`). Updated footer to use `privacy_path`.
- **1.2** Rewrote login page (`app/views/sessions/new.html.erb`) — removed left-panel AI/SaaS marketing ("AI performance," "adoption metrics," "team collaboration"). Centered minimal sign-in form.
- **1.3** Changed "Request a demo" → "Contact Us" in header CTA (`app/views/layouts/_public_header.html.erb`).
- **1.4** Removed "Log in" link from public nav (`app/views/layouts/_public_header.html.erb`). Route remains for admin access.

Added tests:
- `test/controllers/pages_controller_test.rb`: privacy page test, "Request a demo" / "Log in" absence assertions
- `test/controllers/sessions_controller_test.rb`: AI/SaaS language absence test

Verification:
- code checked: yes (60 tests, 542 assertions, 0 failures. rubocop clean. brakeman 0 warnings.)
- human reviewed: no

---

## [2026-05-02] review | External landing page review ingested

Source: Human reviewer live-site audit of artifisi.com, orbwalker project page, and login page.

Changes:
- Added `wiki/context/landing-page-review.md` — full review notes including what works, main problems, suggested hero rewrite, and suggested nav.
- Added `wiki/context/landing-page-review-todo.md` — prioritized action items in four tiers: critical trust (privacy 404, login AI language, CTA language), positioning consistency, Orbwalker conversion, and proof/trust signals.
- Updated `wiki/index.md` with links to new context pages.

Notes:
- Confirmed that login page (`app/views/sessions/new.html.erb`) still contains SaaS-era AI dashboard copy.
- Confirmed nav (`app/views/layouts/_public_header.html.erb`) still shows "Request a demo" and "Log in".
- Confirmed no `/privacy` route exists in `config/routes.rb` (footer 404).
- Confirmed "Our Services" on homepage (`app/views/pages/home.html.erb` lines 76-99) clashes with IP-studio positioning.
- Phone number `+60 12-345 6789` confirmed as placeholder-looking.
- Branch: `review/landing-page`

Verification:
- code checked: yes (key files inspected to confirm review claims)
- human reviewed: no

---

## [2026-05-01] setup | Initial LLM Wiki Setup

Source: AGENTS.md, README.md, PROJECT.md, DESIGN.md, Gemfile, config/routes.rb, db/schema.rb

Changes:
- Created `raw/` directory
- Created `wiki/` directory with subdirectories: sources, concepts, systems, workflows, context, decisions
- Created core pages: index, setup, architecture, file-map, features, decisions, known-issues, open-questions, source-register, contradictions, log

Notes:
- Codebase inspected: Rails 8.1.1 marketing site with Hotwire, SQLite, Kamal deployment
- No contradictions found between sources
- Several open questions identified: lexxy gem purpose, PWA enablement, backup strategy, monitoring
- raw/ directory is empty; no external sources ingested yet

Verification:
- code checked: yes (app/, config/, db/, test/ directories reviewed)
- human reviewed: no

---

## [2026-05-02] website | Replace placeholder projects with Orbwalker showcase

Source: `wiki/context/orbwalker-website-update-todo.md`, `raw/projects/Orbwalker/game_design_document.md`

Changes:
- Replaced Project Aether and Tactica placeholder cards in `app/views/pages/home.html.erb` with a single Orbwalker project card
- Added `app/assets/images/orbwalker-hero-keyart.png` from raw project sources
- Used marketing-safe copy: fantasy match-3 roguelike with free orb movement and build-driven progression
- CTA links to #contact with "In development — follow our journey →"

Notes:
- All placeholder project references removed from the homepage
- Image sourced from `raw/projects/Orbwalker/images/orbwalker-hero-keyart.png`

Verification:
- code checked: yes
- human reviewed: no

---

## [2026-05-01] rebrand | Rebrand landing page to independent gaming studio

Source: app/views/pages/home.html.erb

Changes:
- Rebranded entire landing page from AI startup to independent gaming studio
- Hero: "Building Original Games with Malaysian Creativity"
- About: "independent gaming studio based in Malaysia. We design, develop, and publish our own games in-house"
- Updated Mission, Vision, Approach to gaming context
- Replaced Core Values: Craftsmanship, Player-First Design, Collaboration, Agility, Continuous Learning, Malaysian Roots/Global Reach
- Replaced Services: Game Development, Art & Animation, Game Design, Quality Assurance
- Replaced Projects: Project Aether (action-adventure), Tactica (multiplayer tactics)
- Updated blog tagline and contact CTA

Notes:
- Branch: `game-studio`
- Two commits: `feat: rebrand landing page to independent gaming studio` + `fix: update contact section CTA`

Verification:
- code checked: yes
- human reviewed: no

---

## [2026-05-02] ingestion | Deep codebase ingestion — controllers, views, layouts, helpers, JS, CSS, deployment configs

Source: All files under app/, config/importmap.rb, docker-compose.yml, Dockerfile, .kamal/, .aider.conf.yml

Changes:
- Updated features.md: added Turbo Stream contact form details, blog controller behavior, dynamic layout system, liquid glass toasts, cookie-based contact dedup
- Updated architecture.md: added layout system (determine_layout), liquid glass toasts, lexxy editor section
- Updated open-questions.md: partially resolved lexxy gem question (now known to be an ActionText editor with importmap pin and CSS fallback)
- Updated source-register.md: registered 15 newly inspected files/sections
- Updated log.md: this entry

Notes:
- Lexxy gem confirmed as rich text editor for ActionText — pinned in importmap, stylesheet loaded in both layouts, CSS fallback defined. Exact relationship to Trix still unclear.
- Contact form uses Turbo Stream for inline replacement on the home page, with cookie-based dedup for return visitors
- Dashboard layout uses extensive content_for blocks for customization
- Liquid glass toast system is a custom CSS animation with Stimulus Alert integration
- Kamal hooks are all .sample files — not yet customized
- .aider.conf.yml only reads AGENTS.md

Verification:
- code checked: yes (every controller, model, layout, helper, and config file reviewed)
- human reviewed: no

---

## [2026-05-02] ingestion | Orbwalker raw project source ingestion + website handoff TODO

Source: `raw/projects/Orbwalker/game_design_document.md`, `raw/projects/Orbwalker/Orbwalker.pdf`

Changes:
- Added `wiki/sources/orbwalker-gdd.md` summarizing Orbwalker source pack
- Added `wiki/context/orbwalker-website-update-todo.md` as temporary handoff instructions for a follow-up website update agent
- Updated `wiki/source-register.md` with two new raw sources and PDF partial-ingestion status
- Updated `wiki/contradictions.md` with project naming mismatch (`Matchatro` vs `Orbwalker`)
- Updated `wiki/open-questions.md` with Orbwalker naming and source-equivalence verification questions
- Updated `wiki/index.md` and `wiki/features.md` to reflect newly ingested project context

Notes:
- PDF text extraction returned empty output in current environment, likely image-based pages; only metadata was ingested.
- Canonical project naming should be confirmed before public website copy is finalized.

Verification:
- code checked: yes (raw sources + wiki files reviewed and updated)
- human reviewed: no

---

## [2026-05-02] decision | Canonicalize Orbwalker naming

Source: project owner confirmation in chat + `raw/projects/Orbwalker/game_design_document.md`

Changes:
- Updated `wiki/contradictions.md` to resolve `Matchatro` vs `Orbwalker`
- Updated `wiki/open-questions.md` to remove naming uncertainty and add resolved note
- Updated `wiki/sources/orbwalker-gdd.md` with resolved naming note
- Updated `wiki/decisions.md` with explicit naming decision

Notes:
- `Matchatro` should be treated as a temporary/historical alias only.

Verification:
- code checked: yes (wiki updates reviewed)
- human reviewed: no


---

## [2026-10-25] decision | Package the report-to-page service as a sellable line

Source: `playbook/instructions.md`, `public/samples/households/`

Changes:
- added `playbook/sales/rate-card.md`
- added `playbook/sales/services-agreement.md`

Notes:
- Prices come from the playbook: RM4,500 standard, RM2,900 pilot. Flagship and Calendar tiers are new and untested.
- Positioning decision: this is a cash-flow line for Dunia, not a second business. Target 2 to 3 retainers, keep sales effort low.
- Service tax treatment is unverified. Needs an accountant.
- The agreement is a template, not legal advice.

Verification:
- code checked: no
- human reviewed: no


---

## [2026-10-25] feature | Consultancy front door at consultancy.artifisi.com

Source: user request, `playbook/sales/`

Changes:
- added `consultancy/index.html` (standalone page, own styles, no three.js), plus `favicon.svg` and `og.png`
- added `consultancy/README.md` with the deploy steps

Notes:
- Deploy shape follows tech-sovereignty: a separate Pages project from the same repo, build command `exit 0`, output directory `consultancy`, its own custom domain and CNAME. The main site build does not include it.
- Sample links in the page are absolute (`https://artifisi.com/samples/households`). A relative link would 404 on the subdomain.
- Prices are duplicated in `rate-card.md` and `consultancy/index.html`. Change both together.
- `public/samples/households/README.md` is copied into `dist/` and published. Consider moving internal notes out of `public/`.

Verification:
- code checked: yes (`npm run build` passes, desktop 1440 and 390 viewport screenshots reviewed)
- human reviewed: no

## [2026-10-26] build | Wage-bill city: third 3D attempt, now with hover

Source: `raw/malaysia-wages/{data.json,viz.html}`

Changes:
- rewrote `viz.html`: 9 blocks (8 named industries + a residual) instead of 19
- encoding: footprint area = share of employees, height = median wage / national median, so **volume = share of the wage bill**
- ordered by wage bill ascending; residual "Other 11 industries" pinned left, separated, drawn in light stone
- per-sector hover: lift + animated glyph + readout. Education pages, Manufacturing conveyor, Public admin registry pins, Trade crates, Health pulse, Finance stairs, Food steam, Construction frame, Others scatter

Notes:
- **Depth-as-time does not work at this camera.** At 33° elevation a block 1.2 units behind reads ~0.48 world units higher regardless of its height, which swamps a 2010→2025 difference of 0.1–0.3. Only works top-down, which kills the height encoding. Dropped the two-date comparison from this figure.
- 19 blocks was an interaction failure, not just a density one: the thin ones render ~10px wide, below any usable hover target. 9 blocks gives ~160px each.
- The residual is 22.4% of the bill — the second-largest single block. It sits at the left, outside the ranked run, so it does not compete with the Education crescendo.
- Hover state is forced with `?hover=N` for screenshot QA.

Verification:
- code checked: yes (headless Chrome, swiftshader; static + 4 hover states rendered)
- human reviewed: no


## [2026-10-26] build | viz becomes a time-driven film, framed for both web and video

Source: `raw/malaysia-wages/viz.html`

Changes:
- replaced the hover-only figure with a 48s timeline; every visual is now `f(t)` (camera keys, build stagger, datum draw, footprint outlines, volume outlines, glyph cues, captions)
- six acts: build 0-3, establish 3-11, height 11-19, width 19-27, volume 27-34, travel 34-44, return 44-48
- `window.__seek(t)` for frame-accurate capture; `?t=` renders a still and disables CSS transitions
- responsive framing: landscape shows the whole row, portrait crops to the high end and the travel act covers the rest

Notes:
- **The video is portrait, not 16:9.** `playbook/tools/record-video.js` captures 540x960 at DPR 2 with `isMobile`, so output is 1080x1920. Composed with the bottom ~16vh clear for the recorder's burned-in `#cap`.
- **Latent bug, portrait only:** `renderer.setSize(w, h, false)` never set a CSS size on the canvas, so at DPR 2 the canvas laid out at buffer size (1048px) inside a 524px viewport and we saw the top-left quarter. Fixed with explicit `width:100vw;height:100vh`.
- Fog is now relative to shot distance (`D*1.02` to `D*1.60`) so the depth fade stays constant across framings; a fixed 70-130 range fogged the portrait camera (D=74) to blank.
- Camera elevation must be near 0 for a true elevation shot. At 10 degrees with a 40-unit throw the camera sits at y=10.5, above the tallest block (4.5), so it still reads as a 3/4 view.
- Travel keyframes were double-tapering zoom (key `k` tapering 0.88 to 0.62 multiplied by a second 0.80), which cropped both ends.
- Hover is gone. The hero keeps hover and timeline together; if the web version wants both, the raycast layer can be re-added on top of `apply()`.

Verification:
- code checked: yes (headless Chrome + swiftshader, stills at t=8/16/24/30/33/39 landscape and t=8 portrait)
- human reviewed: no


## [2026-10-26] pipeline | Stage 2 completed, sections rebuilt, one shot per section

Source: `raw/malaysia-wages/source.json`

Changes:
- acquired the full dataset (960 rows, 20 sections x 16 years x 3 sexes) and stored it. Stage 2 had only ever stored a summary, so no claim could be re-derived from the source.
- rebuilt `raw/malaysia-wages/sections.md`: six sections, each one claim, one shape, and one shot in the video. Each section now carries its own frame, camera, motion, text and exit.
- rewrote `source.md` with the stored file, the 301 redirect note, and the 2020 break.
- recorded the withdrawn v1 claim in `contradictions.md`.

Notes:
- **The 16-year series changes the story.** The spread was 3.59 (2010), fell to 3.18 (2019), spiked to 3.80 (2020), and is 3.30 (2025). It is not a smooth convergence. A single 2020 point carries most of the movement.
- 2020 is real: national median -15.0%, mean -8.4%, covered employees +2.8%. Not a coverage change.
- Public sector ratios peaked in 2020 and fell back by 2025. The earlier "government sectors won" line was a two-snapshot artefact.
- Previous turn built a single 48s film covering the whole argument. That was wrong: the pipeline's unit is the section, and `sections.md` is the shot list. The film is superseded by six independent scenes.

Verification:
- code checked: yes (960 rows counted, field names and year range asserted after download; spread and 2020 deltas recomputed from the stored file)
- human reviewed: no


## [2026-10-26] pipeline | Sections restaged as mechanisms, not charts

Source: `raw/malaysia-wages/sections.md`

Changes:
- rewrote all six sections as scenes with a running mechanism: lift, sorting floor,
  corridor, lift-bank section, city, cutaway.
- added "The rule" at the top: 3D earns its place only when the scene is a mechanism and
  the claim falls out of watching it run.

Notes:
- Prior version mapped the pipeline's form table onto flat charts and only made section 5
  dimensional. That missed how `src/scripts/hero.js` actually works: agents on a street
  grid captured into a lattice, cars lapping a track with a lidar fan, a robot arm solving
  IK. The 3D there is a machine, not a renderer.
- Portrait framing is now a reason for choosing a mechanism (shaft, section, corridor)
  rather than a constraint to survive.

Verification:
- code checked: no (plan only)
- human reviewed: no


## [2026-10-26] mock | Six frames mocked, Gate 3

Source: `raw/malaysia-wages/_mock.cjs` -> `mock2.html` -> `mock2.pdf`

Changes:
- completed Stage 2 properly: `source.json` (960 rows) is now the stored source; added
  `series.spread` to `data.json` computed from all 20 sections per year.
- rebuilt section 3 as a canyon seen from above, time left to right. The earlier
  one-point-perspective corridor was geometrically wrong: the far and near openings came
  out the same width and it read as an hourglass. Perspective shrink (58%) also swamped
  the +/-10% spread, so the pinch and the 2020 break were invisible.
- rebuilt section 5 with real footprint variation. Widths were near-uniform, so
  "footprint x height = volume" was false and the city was a bar chart in 3D costume.
  Footprint now uses share^0.7; the four bill leaders are visibly massive.
- fixed section 4: the y-scale divided by 2.10 but the tallest industry sits at 2.43, so
  the top car was drawn above the building. Now divides by 2.50. Drift labels moved to a
  staggered band at the floor.
- fixed label collisions in 1 (3,000 tick struck through by the 2,940 median line),
  2 (34.2% clipped on the lane border) and 6 (industry names on top of the mean labels).
- corrected the section 3 claim: "has not recovered" was wrong. 2025 sits at 3.30, below
  2010 (3.59) but above the 2019 floor (3.18). Claim is now "never got back to 2019".

Notes:
- The 16-year series is not a smooth convergence: 3.56-3.72 through 2016, then 3.18 by
  2019, 3.80 in 2020, 3.30 in 2025. The story is a decade of slow narrowing, one violent
  break, and a partial recovery that stops short.
- Screenshots must use an absolute `--screenshot` path; a relative path fails with
  "Access is denied" under the sandbox.

Verification:
- code checked: yes (all six frames rendered at 1080x1920 and inspected)
- human reviewed: no (Gate 3 pending)

## [2026-10-26] build | Report page shipped, Gate 4

Source: `consultancy/reports/malaysia-wages/`

Changes:
- built `index.html`, `scene.js`, `data.json` for the six approved sections.
- six three.js scenes, each `f(t)` with a shared stage: fit-to-box camera, fat lines via
  `Line2`, DOM labels pinned by projection, `__seek(t)` for capture.
- `?shot=<name>&t=<0..1>` renders one scene full-bleed at 1080x1920 for the video pass.
- `?still=1` pins every scene to its final frame for QA screenshots.
- wrote `raw/malaysia-wages/qa.md` with the figure diff and the two claim corrections.

Notes:
- Two claims were wrong and were fixed during QA, not before: the 2010-2016 spread range
  (3.39-3.72, not 3.56-3.72) and "education top for the whole series" (mining tied in 2010).
- Composition had to be redone once. Six wide-and-flat scenes were fitted into a 9:16 frame
  and each came out as a thin strip with 60% empty. Every scene is now composed for a
  square-ish bounding volume, and the canyon runs along Z so its width stays literal on
  screen without perspective shrink.
- The canyon needed a near-orthographic camera (fov 14). At fov 34 the near end of a 13-unit
  object overflowed the frame by about 15%.
- Section 2 is two lanes, not nineteen bins. Nineteen bins at 9:16 gives each bin under
  20px. Caption rewritten to match what is drawn; the gap is recorded in `qa.md`.
- Section 5 blocks needed opaque paper bodies. Wireframe-only blocks showed every edge
  through every other block and read as a tangle.

Verification:
- code checked: yes
- figures diffed: yes (23 rows, `qa.md`)
- desktop, 390px, no-JS, reduced-motion screenshots: yes (`raw/malaysia-wages/qa/`)
- human reviewed: no

## [2026-10-26] fix | Animation never ran; scroll replaced by click

Source: `consultancy/reports/malaysia-wages/scene.js`

Changes:
- fixed the play loop: it divided by `duration * 1000` while `duration` was already in
  milliseconds, so every shot advanced 1000x too slowly. A 5s shot took 83 minutes.
- removed the IntersectionObserver. Playback is now click or tap, per the reader's call.
- figures open on their finished frame so the page reads untouched; a click replays.
- added the click indicator from `tech-sovereignty`: a pressing finger until the first click,
  remembered in localStorage, and a chip per figure reading Play / Playing / Replay.
- figure wrappers are now `role="button"`, focusable, Enter and Space to play.
- chip and finger are hidden in `?shot=` mode so they do not enter the video capture.

Notes:
- The scroll trigger was invisible in testing because headless Chrome does not tick
  requestAnimationFrame without a compositor, and `performance.now()` is frozen under
  `--virtual-time-budget`. The duration bug only showed up in a real browser.

Verification:
- code checked: yes (mid-play frame captured, chip and finger confirmed)
- human reviewed: no

## [2026-10-26] rename | consultancy to reports.artifisi.com, playbook v2

Source: `reports/`, `playbook/instructions.md`

Changes:
- moved `consultancy/` to `reports/`, the folder is now the whole site for
  `reports.artifisi.com`, a separate Cloudflare Pages project with output directory `reports`.
- moved the wages report up from `reports/reports/malaysia-wages/` to `reports/malaysia-wages/`,
  so the URL is `reports.artifisi.com/malaysia-wages/` and not a doubled path.
- rewrote `reports/index.html` around three things: published reports, custom work, contact.
  the old page only sold the service.
- added a Formspree contact form in the `#contact` section, with a honeypot, `_next` back to
  `#sent`, and a `:target` success banner. `YOUR_FORM_ID` is still a placeholder.
- updated `public/_redirects` so `/samples/*` on the main site 301s to `reports.artifisi.com`.
- rebranded canonicals, `og:url` and `og:image` on the report page, plus the sales kit and
  `sample-households.md`.
- rewrote `playbook/instructions.md` as version 2. Ten rules in the order they cost time:
  the scene must be a mechanism, compose for a square volume, click not scroll, teach the
  click once, `stage.extent()` for labels outside the geometry, diff figures after the build,
  test animation in a real browser, keep the units honest, text first, one claim one shape.

Notes:
- `reports/` is its own Pages project so the main site build never depends on it.
- the doubled path was worth fixing while the folder was untracked and cheap to move.
- the Formspree id has to be created by a human before the form works. Until then the mailto
  link is the working path.

Verification:
- code checked: yes
- human reviewed: no

---

## [2026-10-26] fix | Reconcile the playbook with the shipped code, rebuild the missing brief

Source: project owner answers, `playbook/`, `raw/malaysia-wages/`, `reports/index.html`

Changes:
- `playbook/instructions.md` rule 3 now opens figures at `t = 0`, matching commit `ad50b92`. The reason
  is recorded in the rule so the first-frame behaviour is not "fixed" back to the finished frame.
- `playbook/instructions.md` changelog and the "What you get" line updated to match.
- `playbook/pipeline.md` Gate 1 now requires a source reference at the precision the source allows,
  page for a PDF and field plus row key for a dataset. The `numbers.csv` column spec now matches the
  artifact: `id, value, unit, year, source_ref, wording`.
- wrote `raw/malaysia-wages/brief.md`, the stage 1 output that had been skipped. Reconstructed from
  `source.md`, `story-v2.md` and `sections.md`, and labelled as a reconstruction.
- `playbook/sales/rate-card.md` no longer says the charts "re-form as the reader scrolls". It now
  says they play when the reader clicks them, which is what the product does.
- `reports/index.html` step 2 no longer says "seven numbers", which contradicted the 7, 10 and 14
  chart tiers sold on the same page.
- `wiki/contradictions.md` records the three conflicts as resolved, and marks the Kamal deploy
  mismatch obsolete now that the Rails app is gone.
- `wiki/known-issues.md` rewritten around the current state. `wiki/index.md` Quick Reference now
  describes Astro, Cloudflare Pages and the two domains instead of Rails and Kamal.
- `wiki/source-register.md` registers the DOSM dataset and the playbook files.

Notes:
- The open question is whether the figure trigger stays click-only or gains a hybrid. The owner
  prefers click. Not decided, not implemented.
- The wiki pages other than `index.md`, `known-issues.md`, `contradictions.md` and
  `source-register.md` still describe the removed Rails app. A full refresh is separate work.
- Prices remain duplicated between `playbook/sales/rate-card.md` and `reports/index.html`.

Verification:
- code checked: yes (docs and one HTML string; no behaviour change)
- human reviewed: no

---

## [2026-10-26] fix | Make the pipeline match what it actually produces

Source: `playbook/pipeline.md`, `playbook/instructions.md`, `raw/malaysia-wages/`

Changes:
- `raw/malaysia-wages/data.json` was a stale copy missing the `bill` field on every section.
  `_mock.cjs` reads `bill` six times, so the Gate 3 generator was drawing the wage bill figures
  from data that could not produce them. Re-synced with `reports/malaysia-wages/data.json`.
- `raw/malaysia-wages/story.md` now carries a superseded banner. It holds the withdrawn v1 claim,
  "the sectors pulling ahead are the ones the government pays for", with nothing in the file to
  say so. A reader could have taken it for the current story.
- added `raw/malaysia-wages/README.md`, a table of which file is current for each stage.
  `story.md`, `story-v2.md`, `mock.html`, `mock2.html` and `viz.html` all sat in one folder with
  no marker. The README also records the two copies of `data.json` and the drift that happened.
- `playbook/pipeline.md` stage 9 now says the scene reads `data.json`, not `numbers.csv`, and
  that the no-JavaScript fallback is a data table, not CSS charts. `instructions.md` rule 9
  already said table, so the two documents disagreed.
- `playbook/pipeline.md` stage 6 now says the output is a scene description per section, and that
  the drawn sketch is the mock at stage 8. There is no separate sketch artefact.
- `playbook/tools/package.json` added. Playwright and three were undeclared dependencies, so
  nothing said what version the capture scripts expect. Pinned to Playwright 1.64.1 and three
  0.180.0, which is the version both pages load from the CDN.
- `playbook/instructions.md` now gives the install step for the scripts and the `THREE` env var.
- `playbook/instructions.md` notes that the video captions already exist in the Gate 3 mock,
  one caption band per frame, so step 8 starts from that copy.

Notes:
- **The pipeline writes derived files into `raw/`, which AGENTS.md calls immutable.** Eight stage
  outputs land in `raw/<slug>/` and only `source.*` is a source. This is why two generations of
  every artefact sit side by side. Recorded in `known-issues.md`. Not resolved: it needs a
  decision on where a per-report working directory lives.
- No video has ever been produced. `origin/vo-audio` is an orphan branch holding 38 mp3 files and
  no `script.txt` or `dur.json`, which are the two inputs `record-video.js` reads.
- The recorder still drives the households sample. It scrolls to `.vizpage` and clicks
  `button[data-view]`, neither of which exists on the wages page. The wages page has a shot mode
  and `window.__stages[i].play()` that the recorder does not use.

Verification:
- code checked: yes (data.json re-synced and re-parsed, 19 sections, `bill` present)
- code checked: yes (mock2.html caption bands read, six frames)
- not run: `npm run build`, dependencies are not installed in this checkout
- human reviewed: no

---

## [2026-10-26] plan | Draft the video pipeline

Source: user request, `playbook/`, `raw/malaysia-wages/`, `reports/malaysia-wages/`

Changes:
- added `playbook/video.md`, a seven stage pipeline: report, story, shots, storyboard, script,
  voice-over, video.
- `playbook/instructions.md` and `playbook/pipeline.md` now point at it.

Notes:
- **The first four stages are shared with the page pipeline.** Report is stages 1 to 3, story is
  stage 4, shots is stage 5 plus a shot list. The video branches at the end of stage 5 and
  rejoins after stage 9, because a storyboard frame is a frame of the real scene, not a drawing
  of one. Page stages 6 to 8 are page-only.
- **The storyboard is rendered from the page**, with `?shot=<scene>&t=<0..1>`, not from the Gate 3
  mock. The mock is a second SVG renderer for the same six sections, and two renderers for one
  story drift. It also catches build failures: if the mock shows a lift and the storyboard
  shows a bar chart, the build did not realise the design.
- **The recorder needs rebuilding, not patching.** `record-video.js` scrolls to `.vizpage` and
  clicks `button[data-view]`, neither of which exists on a page built on the shot mode switches.
  It should read `storyboard.json`, load one page per shot, play the scene with
  `window.__stages[i].play()`, hold the exact duration from the storyboard, and capture one file
  per shot so ffmpeg can concatenate them without clock drift.
- **The voice-over is what sets the shot lengths.** That is why script and voice-over are two
  stages rather than one. Before the audio exists, every timing in the plan is an estimate.
- The timings work. Six captions, 60 words, about 25 seconds of speech at 2.4 words a second,
  against 38 seconds of scene. Every caption fits inside its own shot with room to spare, so
  the shot lengths are set by the scenes and the voice-over has to fill them.
- Two traps designed around but not solved. Headless Chrome does not tick `requestAnimationFrame`
  without a compositor, so the recorder may capture static frames unless it runs headed. And the
  voice-over targets 45 seconds against 38 seconds of scene, so about seven seconds have to land
  deliberately rather than as dead air.

Open:
- One video per story, or one per shot. The chain assumes one per story.
- How many videos the service sells. The rate card says three at Standard and six at Flagship,
  each 40 to 55 seconds, but the wages report has 38 seconds of scene in total. The sales kit
  and the pipeline have to agree before either is used again.

Verification:
- code checked: yes (caption word counts and the per shot budget recomputed; `?shot=`,
  `__seek` and `__stages` confirmed in `reports/malaysia-wages/scene.js`)
- not run: the pipeline has never been executed
- human reviewed: no
---

## [2026-10-27] feature | Run the video pipeline end to end, and cut the page animations to one second

Source: owner instruction, 2026-10-27. The wages report and `raw/malaysia-wages/`.

Changes:
- Every scene on the wages page now plays in one second, was five to eight. `scene.js` carries a
  `?dur=<ms>` override, so the video can stretch the same scene across a whole shot while the
  page stays at one second. The two rates are deliberate.
- New `raw/malaysia-wages/shots.json`, the shot list: six shots and an end card, 1080x1920
  portrait, 30fps, with the claim, the caption and the voice line for each.
- New `raw/malaysia-wages/vo/`, the script and `dur.json`. The recorded tracks are local.
- New `raw/malaysia-wages/storyboard/`, one 1080x1920 frame per shot rendered from the live page,
  plus a contact sheet.
- New `raw/malaysia-wages/video/`, the clip index and the finished short, 57.5 seconds, 1080x1920,
  h264 and aac, the voice-over laid on the shot boundaries. The video file is local.
- New `playbook/tools/browser.js` and `playbook/tools/storyboard.js`. `record-video.js` and
  `mux.py` rebuilt to read the shot list. New `playbook/tools/voice.py`.
- `playbook/video.md` rewritten to match what actually ran.
- `raw/malaysia-wages/qa.md`: the claim "Clipping: none at either aspect" was wrong and is
  replaced with what the video found.

Notes:
- **Three traps cost real time and are worth keeping.**
- *Playwright records at CSS resolution and never scales up.* The screencast is the viewport size
  in CSS pixels, so a 540 wide viewport recorded into a 1080 wide video leaves the page in the top
  left corner with the rest of the frame empty. The capture viewport has to be the frame size.
  `frameContext()` in `browser.js` is now the one place that knows this.
- *edge-tts pads every line with about a second of silence.* Left in, seven lines added six and a
  half seconds of dead air to a 57 second video. `voice.py` trims the tail as it writes.
- *The headless rAF trap does not apply to Playwright.* Measured 45fps in the headless shell and
  41fps in the full Chromium channel. The trap was real for `--virtual-time-budget`, not for
  Playwright, and `video.md` said otherwise.
- **The storyboard caught two framing bugs in the shipped page.** The lift cropped its tick labels
  at 9:16, which the Gate 4 reference screenshot `qa/shot-lift.png` shows too, so it was never
  caught at the gate. The city orbits the camera after it fits and walked out of the left edge of
  a narrow canvas, cutting a building in half. The lift now declares an `extent()` that reaches
  past its labels, and the city scales its sweep to the aspect it has. The page's own 16:10 city
  figure is unchanged.
- **One report, one video.** The rate card's three and six video tiers are out of scope.
- The video's canvas is 1080x1459, the same portrait canvas for all six shots. The page gives each
  figure its own aspect for the reading layout, so shot mode overrides it.
- The voice-over sets the shot lengths. Seven lines, 140 words, 53.6 seconds of speech, plus a
  0.4 second gap after each and a 1.5 second end hold, is 57.5 seconds.
- **The finished video and the recorded voice tracks are not tracked in git.** One report makes
  one video, and the video is six megabytes of incompressible blob that git would keep forever.
  The root `.gitignore` leaves `raw/*/video/out.mp4` and `raw/*/vo/*.mp3` out, and the shot
  list, the script, the durations and the storyboard stay in, so the file can be rebuilt in
  about three minutes. The storyboard PNGs stay tracked for review.

Open:
- The city scene carries no annotations. The Gate 3 mock has "four industries carry 55.6%" over
  the skyline and the live scene does not, so the video shot is plainer than the mock.
- Whether the video is published anywhere or only handed over is not settled.

Verification:
- code checked: yes. Every figure in the voice-over recomputed against `data.json`, the spread
  series, the bill share and the industry ratios. The city framing was measured in NDC, not
  eyeballed, at each angle of the camera sweep.
- video checked: yes. ffprobe on the output, nine frames pulled across the runtime, the audio
  mapped with silencedetect against the shot boundaries.
- human reviewed: no
## [2026-10-27] feature | Build the Malaysia CPI report and its video from the DOSM September 2026 release

Source: `raw/malaysia-cpi/` — DOSM open API, seven catalogue series, CC BY 4.0
Changes:
- added the report page at `reports/malaysia-cpi/`, six three.js scenes, one claim each, all playing in one second
- added the working folder `raw/malaysia-cpi/` with the source, the story, the sections, a 115-row figure register, the shots, the script, the storyboard and the QA record
- parameterised the capture tools by theme, so `browser.js` exports `THEMES` and `overlayCSS(theme)` and `shots.json` names the theme
- added the report to the front door at `reports/index.html` and widened its card grid to fit three
- corrected the promised video length from "40 to 55 seconds" to "up to 60 seconds" in the rate card, the front door and `playbook/instructions.md`
- registered the CPI source, the tooling change and the report artefacts in `source-register.md`

Notes:
- **The story is the composition, not the headline.** Headline inflation eased to 1.8% from 1.9%, and the report opens on the price level instead. Transport heated to 2.5% while housing cooled to 1.4%, and the 1.8% is the net of two opposite shocks. The page never says how much a division contributed, because these datasets publish no basket weights.
- **Core is not "fuel minus non-fuel".** DOSM's core CPI removes items with volatile prices and items with government-administered prices. The first draft said otherwise and was corrected in the story, the sections, the page and the voice-over.
- **The RON95 market price only exists from 30 September 2025.** Before that RON95 was fixed at RM2.05, so every "how much it has risen" figure starts from December 2025.
- **Three figures were on the page with no row in the register.** The reverse check, which matches every numeric token in the rendered page against `numbers.csv`, found the 1.40 point transport gap, the 0.22 point overall gap and the index-derived national 1.78% unaccounted for. All three are now registered and recomputed by the verifier. The method note said "these three figures are computed" about a set of nine and did not cover the national figure; it now does.
- **Six WebGL contexts on one page is enough for Chromium to drop some of them.** The first storyboard came back with blank frames and `CONTEXT_LOST_WEBGL`. `openShot` now waits for `!gl.isContextLost()` and the scene redraws on `webglcontextrestored`. Both guards stay.
- The video is 59.26 seconds at 1080x1920, 30fps, with 55.36 seconds of speech across seven lines. The voice-over sets the shot lengths. It is a local artefact and is not tracked in git.
- `playbook/sales/services-agreement.md` still promises "40 to 55 seconds" for the videos. That is a contract template and was not changed on this branch; the difference is recorded in `contradictions.md`.

Verification:
- code checked: yes. All 115 figures in `numbers.csv` recomputed from `source.json`: 115 match, 0 mismatch, 0 not recomputed. The reverse check leaves no numeric token on the page that the register cannot account for.
- video checked: yes. ffprobe on the output, the audio profiled per shot window, every gap between shots digital silence.
- human reviewed: no

## [2026-10-27] fix | Redo the CPI palette, cut the film as its own argument, and make the pipeline enforce both

Source: `raw/malaysia-cpi/` and `playbook/palettes.md`
Changes:
- replaced the CPI palette, which reused the wages report's warm cream, with one picked from a fuel price board at night
- rewrote the CPI film so it lands one claim and runs in its own order, `path` to `column`, which is the reverse of the page order
- rewrote the voice-over script: the place names are out of the voice, the fuel grade is spoken as "ninety five octane petrol", and "headline" is now "the rate"
- added stage 6 to `playbook/pipeline.md`, pick a palette, and moved the colour rules out of the old design stage
- added `playbook/palettes.md`, the registry of palettes already used, so the next report cannot repeat this
- added a rule to `playbook/video.md` that the film has its own order and its own argument, and that the voice is never handed a word it cannot say
- added a reverse figure check and a palette check to Gate 4, and a listen-to-the-recording check to the voice stage

Notes:
- **The palette was wrong and the pipeline let it through.** `playbook/pipeline.md` already said a page about household money and a page about road deaths should not share a palette. The CPI page shipped a cream a shade off the wages cream, and on a phone the two were the same product. The rule existed and nothing made anyone check it, so the palette is now a stage with a registry behind it. The new palette is a fuel price board at night, which is the subject of the report's loudest beat: a near-black panel, illuminated acrylic white, a backlit blue and an LED red. The two accents are the cooling half and the heating half of the story.
- **The film was the page in order.** `video.md` says the video needs a single claim the page does not have, and the CPI film replayed the page's six claims in sequence, which is the same shape as the wages film. The CPI film now opens on the flat line and closes on the price level, the reverse of the page order, and each shot records the beat it plays.
- **The voice was mangling the place names, and a transcript did not show it.** Playing the recording and listening to it found "Negeri Sembilan" said as "NED-jree SEM-bih-luhn", the hard g softened into an English dʒ, "RON 95" said as the single word "run", "headline" heard as "hate line", and two lines ending on a number with no unit so the figure sounded truncated. A transcript gives the right words back for a mispronounced name, so the check has to be done by listening. The fix follows the rule the playbook already had for "Artifisi": keep the names on screen and in the caption, and say the number instead.
- **A dark ground breaks things that a light one hid.** Three body-text rules were hardcoded darker than the ink and had to move to the muted token, `color-scheme` had to flip, and one label sat red on the red fuel fill until it got its own plate. The plate then failed a second time because it was written against a `--shade` token that the report page's own `:root` never defined, so `var(--shade)` resolved to nothing and the plate rendered transparent. The page carries its own token block, and a token used by a class in that page has to be declared in that page.
- The pipeline is eleven stages now, four gates still. The "ten stages" wording in `instructions.md` and the wiki was updated with it.

Verification:
- code checked: yes. All 115 figures recomputed from `source.json`: 115 match, 0 mismatch, 0 not recomputed. The reverse check leaves no numeric token on the page the register cannot account for. Six scenes timed at 1005 to 1017 ms with no console errors, on desktop and at 390 px.
- video checked: yes. ffprobe on the output, 58.10 seconds at 1080x1920 and 30 fps. `silencedetect` confirms a gap at every one of the six shot boundaries and no silence anywhere else. Seven frames pulled across the runtime and reviewed.
- audio checked: yes. Every recorded line played and judged on the audio itself, with the phonetics quoted for each defect.
- human reviewed: no

## [2026-10-27] feature | Hang the type behind the chart, build the card shot, and end the film on the whole report

Source: `playbook/video.md`, `playbook/tools/`, `reports/malaysia-cpi/scene.js`
Changes:
- rewrote `playbook/video.md` around the five beats a film runs, the rules that make a premise a promise, a card shot specification, a section on the craft of the cut, and a fourth trap, that a cold open is a trap
- added the card shot type to the capture tools: a full-frame typographic plate the recorder builds, like the end card, for the two frames a film needs and a report does not have
- added `Stage.backdrop()` and `Stage.compose()` to the CPI scene file, and hung a ghosted "+37.6%" behind the column in depth with the column scaled down to make room for it
- added the wall: every scene captured clean before the overlay goes on, tiled, blurred and scrimmed behind the end card
- recorded four decisions in `wiki/decisions.md`, and updated `wiki/file-map.md`, `wiki/index.md` and `wiki/known-issues.md`
Notes:
- **The film started too abruptly, and the reason was structural.** The complaint was right. The film opened on a flat price line and made the viewer wait forty seconds to learn why the line mattered. Six descriptions of the shape of an explanatory video, from the Eurographics paper on narrated visualisation through the practitioner guides, agree on the same order and warn against the same thing: premise, what the data shows, what the data meant, what the data leads, the ending. The shape the CPI film used, background then method then data then conclusion, is the one they all warn against. The rule is now in `video.md`, and the premise has to be made in type, in the first seconds, and it has to work muted.
- **The opening frame and the closing implication have no scene.** Both are type, not chart, and the page has neither. Forcing them into a scene means inventing a mechanism to carry words and the words get small. A card is the one place in the pipeline where the typography is the whole shot, so it is the right place for the claim and the so-what. Cards are film-only and leave the page untouched.
- **A label on a filled shape needed a plate, and the plate broke the drawing.** A flat rectangle sitting on top of the chart says "this is a user interface". Hanging the display type behind the chart in depth says "this is a thing in a room". The column scene now carries a ghosted "+37.6%" two and a half units back, and the column's own silhouette cuts across it, so the type reads as something behind the glass of the cabinet.
- **The ending is the whole report.** All six scene frames, captured clean before the overlay goes on, tiled, blurred and scrimmed behind the sign-off, so the last frame shows what the film was made of rather than one more chart. The first attempt blurred at 26 pixels under a heavy scrim and the wall was too faint to read; the shipped version is 11 pixels with a light scrim.
- **Three bugs on the way.** `buildBackdrop()` re-registered `document.fonts.load` on every repaint, which looped the page forever, hung the tab and killed the capture. The material map was null on the first paint, so the canvas died on `map.dispose`. And the type ran off both edges of the frame until the backdrop took a `cover` fraction of the frame width and an `at` offset.
- **Re-recording the film found two more defects, both in the frame.** The path scene's end label, "Sept 2026 · 1.8%", ran off the right edge of the portrait frame. The camera frames an extent box, and the extent had reserved less room on the right than the label needed, so the fix was to widen the right edge of the extent. And one storyboard frame came back carrying the column scene's plate and label on top of the path scene. The page builds all six scenes and only then marks the one in the shot as the only one on, and the capture was waiting on the wrong signal, so it could take a frame while the page was still swapping. `openShot` now waits for the page to have settled on exactly one section before anything is captured.
- **`ffmpeg` on `PATH` is not enough.** The link in the WinGet `Links` folder is a zero-byte alias, and Python's `subprocess` finds it first and fails with `WinError 193`. The real binary in the package folder has to come first on `PATH`.
- **The three structural questions are still open**: the leads beat, whether it is a risk, an opportunity or both; the opening frame; and the shot count. The card machinery and the wall are built for all three answers, but the shot list is not written yet.

Verification:
- code checked: yes. Six scenes on the CPI page timed at 1015 to 1018 ms with no console errors, on desktop and at 390 px. All 115 figures recomputed from `source.json`: 115 match, 0 mismatch, 0 not recomputed. Two card designs and the ending wall were rendered and reviewed, the wall in the recorded film and not only in a mock. The storyboard was rendered twice and the frames compared.
- video checked: yes. ffprobe on the output, 58.10 seconds at 1080x1920 and 30 fps. `silencedetect` confirms a gap at every one of the six shot boundaries and no silence anywhere else.
- human reviewed: no
## [2026-10-27] feature | Re-cut the CPI film around the five beats, and open it on the claim

Source: `raw/malaysia-cpi/shots.json`, `raw/malaysia-cpi/vo/script.txt`
Changes:
- wrote the film's premise into a card and the film's so-what into a second card, so the film now runs the five beats it was supposed to run
- re-ordered the film to `premise, path, ladder, column, drum, leads` and dropped the state spread and the urban split, which stayed on the page
- rewrote the voice-over: seven lines, 137 words, the premise and the so-what are new and the price level line was rewritten to sit before the fuel
- moved the card's kicker to the top of the frame, so a card and a scene carry the same furniture
- fixed the wall grid, which stacked four frames in one column instead of making a two by two grid
- recorded the new decision in `wiki/decisions.md`, and updated `raw/malaysia-cpi/qa.md` and `wiki/index.md`
Notes:
- **The machinery shipped and the film did not use it.** The last change built the card shot type and the wall and wrote the five beats into the playbook, and then stopped, because three structural questions were put to the owner and never answered. The result was a film that was almost identical to the one before it, with a new mechanism behind it. That was the wrong shape of work: the rules, the machinery and the cut have to land together or the cut is not a cut.
- **The three questions had answers in the report all along.** The leads beat was in `story.md` under "The so what", the opening frame was the rule already written into `video.md`, and the shot count was a consequence of the rate card's sixty seconds. They did not need the owner. What did need judgement was how many scenes to drop, and that fell out of the arithmetic: six claims and two cards do not fit in a minute, so two scenes had to go, and the two that went are the ones whose numbers belong in the so-what.
- **A card is a bookend, not a repeat.** The premise card and the leads card are the same device at the two ends of the film. The gate that says no two shots use the same form had to be reworded: it is no two *scene* shots, and the repetition of the plate at the open and the close is deliberate, so the viewer reads them as a pair.
- **The voice was listened to, not transcribed.** The finished film was run through the video understanding tool and every figure was checked against the script, because a transcript gives the right words back for a mispronounced name and the rule in `video.md` is that the recording has to be judged by ear. Every number came back as written.

Verification:
- code checked: yes. The film is 53.39 seconds at 1080x1920 and 30 fps, H.264 with AAC mono at 24 kHz, 360 kbps. `silencedetect` confirms a gap at every one of the six shot boundaries and none anywhere else. The page is untouched by this change and its six scenes still finish in 1007 to 1018 ms with no console errors.
- audio checked: yes. The transcript of the finished film matches the script line for line, and every figure is spoken as written.
- human reviewed: no
## [2026-10-27] feature | Write today's lessons into the playbook, so the next build inherits them

Source: `playbook/instructions.md`, `playbook/pipeline.md`, `playbook/video.md`
Changes:
- `playbook/instructions.md` is version 3: four new rules, the label-direction and 9:16 traps, the git discipline for shipping, and the environment traps that cost time today
- `playbook/pipeline.md`: stage 4 now says the so what has to name a number, and Gate 4 gained four checks, the mechanism, the page's own tokens, the portrait frame and the one-second timing
- `playbook/video.md`: two capture rules, and the rule that the shot list changes when the rules change
- fixed the stale parts of `instructions.md`, which still described editing a `SHOTS` array in `record-video.js` and a ten step build list
- recorded two decisions in `wiki/decisions.md`, and updated `wiki/file-map.md` and `wiki/index.md`
Notes:
- **The playbook is the only thing the next agent is guaranteed to read.** The wiki records what happened and it is a good record, but an agent pointed at a report is pointed at `instructions.md`. A lesson that lives only in the wiki is a lesson the next build will not read, and the CPI report's dark ground rules, its token rules and its label rules were all learned the hard way in a session that will not be remembered.
- **The new rules are numbered in the order they cost us time**, so the expensive ones sit near the top and the list can grow without being rewritten. The CPI report's lessons are 11 to 14.
- **Two of the new rules are about the shape of the work, not the drawing.** The rules, the machinery and the cut land together, and every lesson goes into the playbook. The first one exists because the CPI film got a new opening, a new card shot type and a new wall built and shipped, and the film came out identical, because the shot list was never rewritten. The second is the owner's standing instruction.
- **Gate 4 is where a rule becomes mechanical.** The CPI report shipped four chart scenes that stage 7 forbids, and nothing checked it. The mechanism, the page's tokens, the portrait crop and the one second are now written down as checks, so the next report cannot fail them quietly.
- **The stale parts of the playbook were traps.** `instructions.md` still told the next agent to edit a `SHOTS` array in `record-video.js` that has not existed since the shot list moved into `shots.json`, and to record the voice on another machine by hand. Both were removed and replaced with the pipeline that actually runs.

Verification:
- code checked: yes. The three playbook files were read end to end after the edit and every command they name was run today: `voice.py`, `record-video.js`, `mux.py`, `storyboard.js`, and the page QA.
- human reviewed: no

## [2026-10-27] feature | Let the picture follow the voice, and capture the film frame by frame

Source: `playbook/tools/voice.py`, `playbook/tools/record-video.js`, `playbook/tools/mux.py`, `playbook/tools/browser.js`, `reports/malaysia-cpi/scene.js`, `raw/malaysia-cpi/shots.json`
Changes:
- `voice.py` now asks `edge-tts` for word boundaries, keeps them in `raw/malaysia-cpi/vo/words.json`, cuts each pause between sentences back to a breath, and remaps the word offsets onto the trimmed file
- `record-video.js` captures the film one frame at a time instead of recording the page and trimming the recording, and resolves each scene's, card's and caption's cues against the voice before the frames are taken
- `mux.py` concatenates the clips it is given instead of trimming each one from the end
- `scene.js` gained `makeTimeline()`: a scene's reveal steps now ask for a phrase and get a moment, with the fraction the page has always used as the fallback
- the cards are built on the voice, and the leads card puts its two numbers before its verdict, because the voice names the numbers first
- the caption band is a list of phrases, each pinned to a cue, and it changes as the voice moves
- re-recorded the voice, the storyboard and the film; the film is 55.86 seconds
- wrote the lessons into `playbook/video.md` and `playbook/instructions.md`, and recorded three decisions in `wiki/decisions.md`
Notes:
- **The film was a second out on every shot and nobody could tell.** The recorder recorded the page and cut the recording from the end, because the browser's clock and the film's clock drift apart and the tail is where the flush lands. So every shot began about a second after it had actually started and held a frozen frame at the end. A chart that starts ten percent in still looks like a chart. The old playbook explained the screencast by saying a frame by frame render would be too slow, and that was the reason it was never measured: a frame is 67 milliseconds, so the whole film takes under two minutes either way. Asking for the frames is the only way to put a frame at a known time, and a known time is the whole basis of the voice-driven work.
- **The voice had no breath in it.** `edge-tts` pads every sentence with about nine tenths of a second of silence, and the old trim removed every silent period, so the seven sentences ran together with nothing in the gaps. The line measured 6.55 seconds; with a third of a second of air in each gap the same words measured 7.83. The film is two and a half seconds longer for it. A cut anywhere but the tail moves every word after it, so the offsets have to move with it, and that is the part that can be got wrong quietly.
- **One scene, two clocks, one set of numbers.** Every cue carries the fraction the scene has always used, so the page plays exactly as it always has and the film plays the moment the voice says the thing. That is what made the change safe to ship: the page did not move.
- **The caption is not the narration.** The script spells every figure out, because the voice reads digits as digits, so a caption taken straight from the voice says "one point eight percent" where a reader wants "1.8%". The caption is written separately and pinned to a cue, so the voice says the number and the caption says the number in the form each of them wants, and they arrive together.
- **A card is not a page.** The card's plate used to fade in, which showed the report's page behind it for the first second of the shot. The plate is now opaque from the first frame and only the parts animate.
Verification:
- code checked: yes. The film is 55.86 seconds at 1080x1920 and 30 fps, 1675 frames, H.264 with AAC mono at 24 kHz. Every cue in the four film scenes and in the two cards resolves against the voice's own words, and `window.__timeline.misses` holds only the cues belonging to the other scenes, which the page builds but does not show. The page is unchanged by this work: its six scenes still finish in 1007 to 1018 ms with no console errors.
- audio checked: yes. The finished film was run through the video understanding tool. The transcript matches the script line for line, every figure is spoken as written, and the on-screen numbers land on the words: RM4.18 at 0:03 with "Fuel did not", the band at 0:09 with "The rate has not moved", "Transport rose 2.5%" at 0:20, "Housing fell to 1.4%" at 0:23, RM2.05 subsidised at 0:37 with "Ninety five octane petrol", and RM2.13 at 0:47 with "The gap at the pump".
- human reviewed: no

## [2026-10-27] fix | Settle the storyboard PNG difference, and say what a PNG diff is worth

Source: `reports/malaysia-cpi/scene.js`, `raw/malaysia-cpi/storyboard/ladder.png`, `playbook/video.md`
Changes:
- checked why the ladder's storyboard frame changed during the voice work, and found nothing wrong with it
- recorded the finding as a trap in `playbook/video.md` and as a known issue in `wiki/known-issues.md`
Notes:
- **A storyboard PNG is not evidence of a code change.** The scene's labels are DOM elements over the canvas, and the browser rasterises their text a little differently from one capture session to the next. The ladder's fourteen division names moved by 8883 antialiased pixels against the committed frame while the value labels beside them did not move at all, which is the tell: a scene that really changed moves the chart and the labels together. The old code, rendered in the same session, did not reproduce its own committed PNG either, so the PNG was never the evidence.
- The new code rendered in one session reproduced the working tree's frame exactly, and differed from the old code's frame only in the caption band, which is the intended change. The column frame is byte-identical across the whole change.
Verification:
- code checked: yes. Every cue's fallback fraction was read against the constant it replaced and all of them match, which is why the page did not move.
- human reviewed: no
