# Setup

**Summary**: Development environment setup, common commands, and onboarding guide.  
**Sources**: README.md, PROJECT.md, Gemfile  
**Last updated**: 2026-05-01

---

## Overview

artifisi.com is a Rails 8.1.1 application for the marketing/landing site. Development uses Ruby 3.4.7, SQLite, and Hotwire for frontend interactivity.

## Prerequisites

- Ruby 3.4.7 (via `rbenv` or `asdf`)
- Bundler (`gem install bundler`)
- SQLite 3
- Optional: Docker for Kamal deployment stack

## Quick Start

```bash
# 1. Install dependencies and set up database
bin/setup

# 2. Start development server with hot reloading
bin/dev
```

`bin/dev` runs the Rails server and Propshaft watcher so CSS/JS changes are picked up automatically.

## Common Commands

| Command | Purpose |
|---|---|
| `bin/dev` | Start dev server + asset watcher |
| `bin/rails server` | Rails web process only |
| `bin/rails console` | Interactive Rails console |
| `bin/rails db:migrate` | Apply pending migrations |
| `bin/rails db:rollback` | Rollback last migration |
| `bin/rails test` | Run test suite |
| `bin/rails test:system` | Run system tests (Capybara + Selenium) |
| `bin/rails assets:precompile` | Build production assets |
| `bin/rubocop` | Lint and style check |
| `bin/brakeman` | Security vulnerability scan |
| `bin/bundler-audit` | Audit gems for CVEs |

## Testing

- Framework: Minitest
- Methodology: TDD (red → green → refactor)
- System tests: Capybara + Selenium
- Run all: `bin/rails test`
- System tests: `bin/rails test:system`

## Deployment (Kamal)

Kamal config lives under `.kamal/`. Target: DigitalOcean droplet at `146.190.83.167`.

1. Precompile assets: `bin/rails assets:precompile`
2. Sync secrets: `bin/rake kamal:env:pull`
3. First deploy: `bin/kamal setup`
4. Subsequent: `bin/kamal deploy`

### Docker Compose (local)

```bash
cp .env.docker.example .env.docker
# Fill in RAILS_MASTER_KEY from config/master.key
docker compose up --build
# Visit http://localhost:3000
```

## Important Files

- `Gemfile` / `Gemfile.lock` — dependency declarations
- `config/routes.rb` — route definitions
- `config/database.yml` — database configuration
- `config/deploy.yml` — Kamal deployment target
- `db/schema.rb` — current database schema

## Open Questions

- None recorded.

## Related Pages

- [[architecture]]
- [[file-map]]
- [[decisions]]
