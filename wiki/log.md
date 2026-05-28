# Log

**Summary**: Chronological history of wiki changes and codebase events.  
**Last updated**: 2026-05-28

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
