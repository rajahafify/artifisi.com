# Landing Page Review — Action Items

**Summary**: Prioritized todo list derived from the external landing page review.  
**Sources**: `wiki/context/landing-page-review.md`, live-site audit 2026-05-02  
**Last updated**: 2026-05-02 (Priority 1 completed)  

---

## Objective

Remove leftover SaaS/AI language, fix broken infrastructure, and add real game-studio conversion paths to the Artifisi website.

## Priority 1 — Critical Trust & Credibility

- [x] **1.1** Fix Privacy page 404 — create a working `/privacy` route and view with a basic privacy policy. The footer link is currently dead. (`config/routes.rb` has no privacy route)
- [x] **1.2** Remove or rewrite the login page — it still contains AI dashboard language ("AI performance," "adoption metrics," "team collaboration") that conflicts with game-studio positioning. File: `app/views/sessions/new.html.erb`
- [x] **1.3** Replace "Request a demo" CTA in the nav with "Contact Us" or "Follow Orbwalker." File: `app/views/layouts/_public_header.html.erb` (line 13)
- [x] **1.4** Remove "Log in" from the nav unless there is a real player/community/admin purpose. File: `app/views/layouts/_public_header.html.erb` (line 14)

## Priority 2 — Positioning Consistency

- [x] **2.1** Rename "Our Services" to "Our Capabilities" on the homepage — currently the site says it builds its own games but the section reads like a service-for-hire menu. File: `app/views/pages/home.html.erb` (lines 76-99)
- [x] **2.2** Update the homepage hero to the suggested rewrite (or a derivative) to front-load the Orbwalker hook and studio identity. File: `app/views/pages/home.html.erb` (lines 10-16)
- [x] **2.3** Update suggested nav to: Home, Orbwalker, About, Devlog, Contact. File: `app/views/layouts/_public_header.html.erb` (lines 7-11)

## Priority 3 — Orbwalker Conversion

- [x] **3.1** Add a playtest/wishlist CTA to the Orbwalker project page — currently only has "In development — follow our journey →." Evaluate creating email capture, Steam wishlist link placeholder, or Discord invite.
- [x] **3.2** Add gameplay media (screenshots, video/GIF, or key art) above the fold on the Orbwalker page.

## Priority 4 — Proof & Trust Signals

- [ ] **4.1** Add team/founder section to the about area or as a separate page.
- [ ] **4.2** Replace or remove the placeholder phone number `+60 12-345 6789` in the contact section. File: `app/views/pages/home.html.erb` (line 158)
- [ ] **4.3** Add development updates / devlog capability to the site.
- [ ] **4.4** Add press/media kit link (can be a placeholder until assets are ready).

## Constraints

- Preserve existing brand voice and component style.
- Make minimal, focused edits (no unrelated refactors).
- Follow Rails 8.1.1 conventions and existing project patterns (Hotwire, Tailwind, etc.).
- All copy changes should pass the "does this sound like a game studio?" test.

## Related Pages

- [[landing-page-review]]
- [[../features]]
- [[../log]]
