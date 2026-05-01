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

## Important Files

- `Gemfile` — Dependency choices
- `config/importmap.rb` — Import map configuration
- `DESIGN.md` — Design token system

## Related Pages

- [[architecture]]
- [[setup]]
