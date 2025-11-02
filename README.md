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
- Every push to `master` and all pull requests trigger GitHub Actions jobs that run `bin/rails db:test:prepare test` and `bin/brakeman --no-pager` to catch regressions early.

## Deployment
Kamal configuration lives under `.kamal/`. Before deploying, ensure assets are precompiled (`bin/rails assets:precompile`) and secrets are synced (`bin/rake kamal:env:pull`). Production uses SQLite databases stored in persistent volumes defined in `config/deploy.yml`.

### DigitalOcean droplet + local registry
- `config/deploy.yml` targets the droplet (`root@146.190.83.167`) and a registry running on that same host (`146.190.83.167:5000`).
- Boot the registry accessory _once_ after provisioning the droplet: `bin/kamal accessory boot registry`. The container persists data under the `registry_data` volume.
- If Kamal tries to log in before the registry exists, bootstrap it with the slim config: `bin/kamal accessory boot registry -c config/deploy.registry.yml`.
- Allow inbound traffic on ports 22, 80, 443, and 5000 in the droplet firewall/security groups so the registry is reachable from the build machine.
- Export a throwaway password so Kamal can satisfy `docker login`: `export KAMAL_REGISTRY_PASSWORD=unused` (or any non-empty string).
- Mark the registry as insecure on the Docker daemon that executes Kamal builds (usually your laptop). Add `{"insecure-registries":["146.190.83.167:5000"]}` to `/etc/docker/daemon.json` (Linux) or Docker Desktop settings, then restart Docker.
- Keep `config/master.key` handy so `RAILS_MASTER_KEY` can be loaded from `.kamal/secrets`.
- Run `bin/kamal setup` for the first deploy; use `bin/kamal deploy` for subsequent releases. HTTPS can be enabled later by uncommenting the `proxy` block, pointing `host` at your domain, and updating DNS to `146.190.83.167`.

### Running with Docker Compose
1. Copy `.env.docker.example` to `.env.docker` and fill in `RAILS_MASTER_KEY` (copy from `config/master.key`).
2. Build and start the container locally:
   ```bash
   docker compose up --build
   ```
3. Visit `http://localhost:3000`. Containers mount `log/`, `tmp/`, and `storage/` so data persists between runs.

See [Repository Guidelines](AGENTS.md) for contributor practices and project conventions.
