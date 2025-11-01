# artifisi.com landing page

This repository hosts the marketing site for artifisi.com, implemented as a Rails 8 application. It uses import maps with Hotwire for frontend interactivity and ships with a Kamal deployment workflow.

## Prerequisites
- Ruby 3.4.7 (install via `rbenv` or `asdf`)
- Bundler (`gem install bundler`)
- SQLite 3 for local storage
- Optional: Docker if you plan to use the provided Kamal stack

## Getting Started
1. Install dependencies and set up the database:
   ```bash
   bin/setup
   ```
2. Start the development stack with hot reloading:
   ```bash
   bin/dev
   ```
   This runs the Rails server and propshaft watcher so CSS/JS changes are picked up automatically.

## Project Layout
- `app/` contains controllers, views, stimulus controllers, and assets for the landing experience.
- `config/` stores environment configuration, credentials, and deploy hooks.
- `db/` holds migrations and the SQLite databases under `storage/`.
- `test/` uses Minitest for unit, integration, and system coverage.
- `public/` can serve static marketing artifacts that do not require Rails routing.

## Testing & Quality
- Run the suite with `bin/rails test`.
- Execute system tests (Capybara + Selenium) with `bin/rails test:system`.
- Check style and security before opening a PR:
  ```bash
  bin/rubocop
  bin/brakeman
  bin/bundler-audit
  ```

## Deployment
Kamal configuration lives under `.kamal/`. Before deploying, ensure assets are precompiled (`bin/rails assets:precompile`) and secrets are synced (`bin/rake kamal:env:pull`). Production uses SQLite databases stored in persistent volumes defined in `config/deploy.yml`.

See [Repository Guidelines](AGENTS.md) for contributor practices and project conventions.
