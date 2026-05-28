# Features

**Summary**: Feature documentation and behavior of the artifisi.com application.  
**Sources**: app/, config/routes.rb, db/schema.rb, raw/projects/Orbwalker/game_design_document.md  
**Last updated**: 2026-05-28

---

## Overview

artifisi.com is the marketing landing site for Artifisi Sdn Bhd, an independent gaming studio. It features a blog, contact form, user authentication, and admin dashboard.

## Landing Page

- **Route**: `GET /` → `pages#home`
- **Description**: Gaming studio landing page with hero, about (mission/vision/approach), core values, game development services, a single in-development project showcase (Orbwalker — fantasy match-3 roguelike), blog teasers, and contact section. Previous placeholder projects (Project Aether, Tactica) were removed on 2026-05-02.
- **Design**: Follows DESIGN.md tokens (hero, cards, CTA banners, icon tiles).
- **Template**: `app/views/pages/home.html.erb`

### Project Source Pipeline (Raw → Website)

- New project references can be added first under `raw/projects/` and ingested into wiki before website copy updates. (source: `AGENTS.md`, `raw/projects/Orbwalker/game_design_document.md`)
- Orbwalker raw sources (`raw/projects/Orbwalker/`) have been ingested and used to create live website copy as of 2026-05-02. The project card on the landing page uses marketing-safe copy drawn from the GDD.

## Orbwalker Project Page

- **Route**: `GET /projects/orbwalker` → `pages#orbwalker`
- **Description**: Public project detail page for Orbwalker with hero, embedded YouTube demo, combat, orb system, shop, relic/run-loop, design pillars, and newsletter signup sections.
- **Playable demo**: The page links to the playable itch.io demo at `https://rajahafify.itch.io/orbwalker` from the hero and follow sections. External links open in a new tab with `rel="noopener"`. (source: `app/views/pages/orbwalker.html.erb`)
- **Video demo**: The hero includes a `Watch demo` CTA that jumps to `section#demo`, which embeds the YouTube Short at `https://www.youtube.com/embed/IIFmoNhv2NM`. (source: `app/views/pages/orbwalker.html.erb`)
- **Images**: The page hero uses `orbwalker-hero-keyart.png`. Gameplay sections use real portrait screenshots from `raw/orbwalker-screenshot/`, copied into `app/assets/images/` as `orbwalker-combat.jpeg`, `orbwalker-shop.jpeg`, `orbwalker-relic.jpeg`, and `orbwalker-run-summary.jpeg`. (source: `raw/orbwalker-screenshot/`, `app/views/pages/orbwalker.html.erb`)
- **Testing**: `test/controllers/pages_controller_test.rb` asserts the hero key art and real gameplay screenshot assets render on `/projects/orbwalker`, while the old generated combat and shop page images are no longer referenced.

## Blog

- **Route**: `GET /blogs/:slug` → `blogs#show`
- **Description**: Public blog post display. Posts are identified by unique slug. Uses `Post.published` scope to ensure only published posts are visible.
- **Related Posts**: Loads up to 3 other published posts (excluding the current one) ordered by `created_at:desc`.
- **Rich Text**: Uses Action Text for post body content, rendered via `render_post_body` helper which sanitizes HTML to allowed tags.
- **Excerpts**: `post_excerpt` helper strips HTML tags and truncates to a configurable length (default 120 chars).
- **Status**: Posts have a status enum (`draft: 0, published: 1`) for publishing control.

## Contact Form

- **Routes**: `GET /contacts/new`, `POST /contacts`, `GET /contacts`
- **Description**: Public contact form with name, email, company, and message fields. Embedded in the home page via a Turbo Frame (`turbo_frame_tag "contact_form"`).
- **Orbwalker newsletter variant**: The Orbwalker follow section includes a backend signup form (`name`, `email`) that posts to `POST /contacts` with `source=orbwalker_newsletter` and hidden contact metadata. The form is wrapped in `turbo_frame_tag "orbwalker_newsletter_form"`; Turbo Stream success replaces it with an inline "You're on the list" confirmation, and validation failure re-renders the same frame with field errors. Successful HTML submissions redirect to `GET /projects/orbwalker#follow` with a newsletter-specific confirmation notice that renders the same success state in the follow section. (source: `app/views/pages/orbwalker.html.erb`, `app/views/pages/_orbwalker_newsletter_form.html.erb`, `app/views/pages/_orbwalker_newsletter_success.html.erb`, `app/controllers/contacts_controller.rb`)
- **Turbo Stream Support**: `ContactsController#create` handles both `turbo_stream` (inline form replacement on the home page and Orbwalker newsletter form) and `html` format responses. On success, replaces the relevant form with a success partial; on failure, re-renders the relevant form with validation errors.
- **Cookie-based dedup**: Sets `cookies[:contact_submission]` (1-year expiry) after successful submission. Home page checks this cookie to show the success state instead of the form on return visits.
- **Model Validations**: Name, email, and message are required.
- **Testing**: Controller tests + integration test for home page contact form flow (`test/integration/home_contact_form_test.rb`, `test/controllers/contacts_controller_test.rb`).

## Authentication

- **Routes**: `GET /login`, `POST /session`, `DELETE /session`, `GET /registration`
- **Description**: Custom lightweight authentication using `has_secure_password`.
- **User Model**: email (unique, case-insensitive), name, password_digest, password_salt.
- **No external gem**: No Devise; Rails built-in `has_secure_password`.

## User Management (Admin)

- **Routes**: RESTful `resources :users`
- **Description**: Admin CRUD for user accounts. Includes profile page (`GET /profile`).
- **Views**: index, show, new, edit, profile.

## Posts Management (Admin)

- **Routes**: RESTful `resources :posts, param: :slug`
- **Description**: Admin CRUD for blog posts. Slug-based URLs instead of numeric IDs.
- **Views**: index, show, new, edit, plus shared `_form` partial.

## Admin Dashboard

- **Route**: `GET /dashboard` → `dashboard#show`
- **Description**: Admin overview with three data tables (5 most recent each): contacts, posts (with author), users. Requires authentication (`before_action :require_login`).
- **Dynamic Layout**: `ApplicationController#determine_layout` switches between `application` (public) and `dashboard` (authenticated) layouts based on controller and login state.
- **Layout**: Dashboard-specific layout with sidebar navigation (`app/views/layouts/dashboard.html.erb`). Uses `content_for` blocks extensively to allow child views to customize: `sidebar_active`, `sidebar_actions`, `header_label`, `header_title`, `header_subtitle`, `header_actions`, `main_wrapper_class`.
- **Partials**: header, sidebar, section wrapper, contacts_table, posts_table, users_table.

## Health Check

- **Route**: `GET /up` → `rails/health#show`
- **Description**: Returns 200 if app boots without exceptions; used by load balancers and uptime monitors.

## Design System

- **Document**: `DESIGN.md`
- **Implementation**: Tailwind CSS utility classes following standardized tokens.
- **Component Inventory** (11 components): Header, Hero, Section header, Card, Icon tile, Badge, Buttons, Form controls, CTA banner, Footer, Sidebar nav.

## PWA

- **Files**: `app/views/pwa/manifest.json.erb`, `app/views/pwa/service-worker.js`
- **Status**: PWA files present but routes commented out in `config/routes.rb`.

## Notification Toasts (Liquid Glass)

- **Description**: Custom CSS-based toast notification system with animated gradient glints and backdrop-blur effects.
- **CSS**: Defined in `app/assets/stylesheets/app.css` as `.liquid-glass` with `::before` and `::after` pseudo-elements for the animated glint effect.
- **Variants**: Supports `data-tone="emerald"` (success) and `data-tone="rose"` (error) color variants.
- **Stimulus Integration**: Uses `tailwindcss-stimulus-components` Alert controller for auto-dismiss (5s for notice, 7s for alert).
- **Usage**: Rendered in both layouts (`application.html.erb` and `dashboard.html.erb`) when `notice` or `alert` flash messages are present.

## Important Files

- `config/routes.rb` — Complete route definitions
- `db/schema.rb` — Current schema with all tables
- `DESIGN.md` — Design system and component tokens
- `app/views/pages/home.html.erb` — Main landing page
- `app/assets/stylesheets/app.css` — Liquid glass toast CSS and lexxy fallback styles
- `app/helpers/application_helper.rb` — Helper methods (render_public_header, render_post_body, post_excerpt)
- `app/assets/images/orbwalker-hero-keyart.png` — Orbwalker project card key art

## Open Questions

- Is the PWA feature intended to be enabled?
- What is the purpose of `lexxy` gem?

## Related Pages

- [[architecture]]
- [[file-map]]
