# Landing Page Review — Fresh Audit

**Summary**: External review of artifisi.com positioning, copy, and conversion paths. Source is a human reviewer's live-site audit dated 2026-05-02.
**Sources**: Live site review (parsed from [artifisi.com](https://www.artifisi.com), [Orbwalker page](https://www.artifisi.com/projects/orbwalker), [Login page](https://www.artifisi.com/login))
**Last updated**: 2026-05-02

---

## Overview

The reviewer audited the live site and found the core positioning — an independent Malaysian game studio — is clear and much stronger than the previous AI/company/services messaging. However, several leftover SaaS-era artifacts undermine the credibility of that positioning.

## What's Working

1. **Clearer positioning than before** — Artifisi is now understandable as a game studio based in Malaysia, founded in 2024, building original IP.
2. **Orbwalker has a good concept hook** — "Fantasy match-3 roguelike" is specific and marketable. The mechanics description (free orb movement, enemy intent, elements, cascades, shop/build systems) is well done.
3. **Coherent emotional lane** — "Malaysian creativity," "original IP," "craftsmanship," and "player-first design" fit together well. The site feels like it's trying to build a genuine studio identity.

## Main Problems

### 1. CTA Language Is Wrong for a Game Studio

- **Nav**: Still has "Request a demo" and "Log in" — SaaS/product-company language.
- **Login page** (`/login`): Talks about "AI dashboards," "AI performance," "adoption metrics," "roles," and "team collaboration."
- **Code locations**: `app/views/layouts/_public_header.html.erb` (lines 13-14), `app/views/sessions/new.html.erb` (lines 8-10, 14-17).

**Recommended fix**: Replace "Request a demo" with "Contact Us" or "Follow Orbwalker." Remove "Log in" unless there's a real player/community/admin purpose. Rewrite or delete the login page.

### 2. Privacy Page 404

The footer Privacy link returns a 404. No `privacy` route exists in `config/routes.rb`.

**Fix**: Create a working privacy policy page before collecting contact form data. Basic trust infrastructure.

### 3. Homepage Says "Services" but Positioning Says "We Build Our Own Games"

The site says Artifisi designs, develops, and publishes original games in-house, but the "Our Services" section lists game development, art, design, and QA as services for hire.

**Code location**: `app/views/pages/home.html.erb` lines 76-99.

**Recommended fix**: Rename "Our Services" to "Our Capabilities" if Artifisi is mainly an IP studio. If you want paid client work, say that clearly: "We selectively partner on game development, art, and QA projects."

### 4. Orbwalker Needs Stronger Conversion

The Orbwalker page explains mechanics well, but there's no obvious high-value action: no Steam wishlist, playtest signup, mailing list, Discord, press kit, trailer, or screenshots gallery.

**Best CTA stack**: Wishlist on Steam, Join Playtest, Join Discord, Download Press Kit, Follow Development. Until Steam is ready, use a simple email capture: "Get playtest updates."

### 5. Site Lacks Proof

The copy is polished but needs more real-world signals:
- Team/founder section
- Gameplay video or GIF
- Screenshots
- Development updates
- Build logs
- Studio photos
- Press/media kit
- Real phone/address or remove if placeholder

**Phone number**: `+60 12-345 6789` (`app/views/pages/home.html.erb` line 158) looks placeholder-like.

## Suggested Homepage Hero Rewrite

**Headline**: Original games from Malaysia

**Subheadline**: Artifisi is an independent game studio building original IP with Malaysian creativity and global ambition. Our first title, Orbwalker, is a fantasy match-3 roguelike about free orb movement, tactical combat, and build-driven runs.

**Primary CTA**: Follow Orbwalker
**Secondary CTA**: Contact the Studio

## Suggested Nav

- Home
- Orbwalker
- About
- Devlog
- Contact

**Remove**: Request a demo, Log in

## Verdict

The site is much better as a game-studio site. The biggest remaining issue is leftover SaaS/AI language, especially the login page and "Request a demo." Clean that up, add a real Orbwalker conversion path, and the site will feel significantly more credible.

## Related Pages

- [[../log]]
- [[../features]]
- [[landing-page-review-todo]]
