# Features

**Summary**: Feature documentation and behavior of the artifisi.com application.  
**Sources**: app/, config/routes.rb, db/schema.rb  
**Last updated**: 2026-05-01

---

## Overview

artifisi.com is the marketing landing site for Artifisi Sdn Bhd, an independent gaming studio. It features a blog, contact form, user authentication, and admin dashboard.

## Landing Page

- **Route**: `GET /` → `pages#home`
- **Description**: Gaming studio landing page with hero, about (mission/vision/approach), core values, game development services, in-house game project showcases, blog teasers, and contact section.
- **Design**: Follows DESIGN.md tokens (hero, cards, CTA banners, icon tiles).
- **Template**: `app/views/pages/home.html.erb`

## Blog

- **Route**: `GET /blogs/:slug` → `blogs#show`
- **Description**: Public blog post display. Posts are identified by unique slug.
- **Rich Text**: Uses Action Text for post body content.
- **Status**: Posts have a status enum (default: draft) for publishing control.

## Contact Form

- **Routes**: `GET /contacts/new`, `POST /contacts`, `GET /contacts`
- **Description**: Public contact form with name, email, company, and message fields.
- **Model Validations**: Name, email, and message are required.
- **Testing**: Controller tests + integration test for home page contact form flow.

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
- **Description**: Admin overview with three data tables: contacts, posts, users.
- **Layout**: Dashboard-specific layout with sidebar navigation (`app/views/layouts/dashboard.html.erb`).
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

## Important Files

- `config/routes.rb` — Complete route definitions
- `db/schema.rb` — Current schema with all tables
- `DESIGN.md` — Design system and component tokens
- `app/views/pages/home.html.erb` — Main landing page

## Open Questions

- Is the PWA feature intended to be enabled?
- What is the purpose of `lexxy` gem?

## Related Pages

- [[architecture]]
- [[file-map]]
