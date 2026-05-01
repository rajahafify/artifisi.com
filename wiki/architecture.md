# Architecture

**Summary**: High-level system architecture of the artifisi.com Rails application.  
**Sources**: README.md, Gemfile, config/, app/  
**Last updated**: 2026-05-01

---

## Overview

artifisi.com is a Rails 8.1.1 landing site for Artifisi Sdn Bhd, an independent gaming studio. It features a blog, contact form, user authentication, and admin dashboard. It follows a standard Rails MVC pattern with Hotwire for client-side interactivity.

## Technology Stack

| Layer | Technology |
|---|---|
| Language | Ruby 3.4.7 |
| Framework | Rails 8.1.1 |
| Database | SQLite 3 (Active Record) |
| Asset Pipeline | Propshaft |
| JS Bundling | Import maps (no Node.js required) |
| Frontend | Hotwire (Turbo + Stimulus) |
| CSS | Tailwind CSS (via `tailwindcss-rails`) |
| Caching | Solid Cache |
| Job Queue | Solid Queue |
| WebSockets | Solid Cable |
| File Uploads | Active Storage |
| Rich Text | Action Text |
| Web Server | Puma + Thruster |
| Deployment | Kamal → DigitalOcean |
| Security | Brakeman, Bundler Audit, Rails credentials |

## System Components

### Web Layer
- **Controllers** (`app/controllers/`): Request handling and response rendering.
- **Views** (`app/views/`): ERB templates with Tailwind CSS.
- **Layouts** (`app/views/layouts/`): Public layout, dashboard layout, mailer layouts.
- **Stimulus Controllers** (`app/javascript/controllers/`): Client-side interactivity.

### Data Layer
- **Models** (`app/models/`): Active Record models for business logic.
- **Migrations** (`db/migrate/`): Schema evolution.
- **Schema** (`db/schema.rb`): Current database structure (SQLite).

### Background Processing
- **Solid Queue**: Database-backed job queue (`config/queue.yml`, `config/recurring.yml`).
- **Solid Cable**: Database-backed Action Cable adapter.

### Asset Pipeline
- **Propshaft**: Modern asset pipeline, replaces Sprockets.
- **Import Maps** (`config/importmap.rb`): Maps JS module names to CDN/files.
- **Tailwind CSS**: Utility-first CSS via `tailwindcss-rails`.

## Database Schema

Three application models:

- **users** — email, name, password_digest, password_salt (has_secure_password)
- **posts** — title, slug (unique), body (ActionText), author_id (FK→users), status (enum)
- **contacts** — name, email, company, message

Plus Active Storage and Action Text internal tables.

## Route Structure

| Route | Controller#Action | Purpose |
|---|---|---|
| `GET /` | `pages#home` | Landing page |
| `GET /up` | `rails/health#show` | Health check |
| `GET /dashboard` | `dashboard#show` | Admin dashboard |
| `GET /login` | `sessions#new` | Login form |
| `POST /session` | `sessions#create` | Authenticate |
| `DELETE /session` | `sessions#destroy` | Logout |
| `GET /registration` | `registrations#new` | Sign-up form |
| `GET /profile` | `users#profile` | User profile |
| `GET /blogs/:slug` | `blogs#show` | Public blog post |
| Resources: contacts, users, posts (by slug) | | |

## Authentication

- `has_secure_password` on User model
- Sessions controller for login/logout
- Registrations controller for sign-up
- No Devise; custom lightweight auth
- `ApplicationController#current_user` memoized lookup via `session[:user_id]`
- `ApplicationController#require_login` redirects to `/login` with alert

## Layout System

- `ApplicationController#determine_layout` dynamically selects layout:
  - `"application"` for the home page (`pages#home`), blog, and unauthenticated users
  - `"dashboard"` for authenticated users on all other controllers
- `ApplicationController#allow_browser versions: :modern` restricts to modern browsers supporting webp, import maps, CSS nesting, and `:has`
- `stale_when_importmap_changes` invalidates ETags when importmap changes

## Design System

Defined in `DESIGN.md`. Key tokens:
- **Fonts**: Inter (body), Manrope (display)
- **Colors**: Primary gradient `#615bff`→`#3d32ff`, slate scale for surfaces
- **Corners**: `rounded-2xl` (cards/buttons), `rounded-xl` (inputs)
- **Shadows**: `shadow-sm` default, `shadow-md` on hover
- **Motion**: `transition-all duration-200`

### Liquid Glass Toasts
Custom CSS notification system in `app/assets/stylesheets/app.css`:
- `.liquid-glass` base class with backdrop-blur and animated gradient glints
- `data-tone="emerald"` for success, `data-tone="rose"` for error
- Integrated with Stimulus `Alert` controller for auto-dismiss

### Lexxy Editor
- Rich text editor for ActionText, pinned via importmap (`pin "lexxy"`)
- Stylesheet loaded via `stylesheet_link_tag "lexxy"`
- Fallback styles in `app.css` (`.lexxy-fallback-editor`)

## Important Files

- `config/application.rb` — Rails app configuration
- `config/routes.rb` — Route definitions
- `db/schema.rb` — Database schema
- `config/deploy.yml` — Kamal deployment config
- `DESIGN.md` — Design system reference

## Open Questions

- None recorded.

## Related Pages

- [[file-map]] — Feature-to-file mapping
- [[features]] — Feature documentation
- [[setup]] — Development setup
