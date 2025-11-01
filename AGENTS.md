# Repository Guidelines

## Project Structure & Module Organization
The app follows a standard Rails layout. Domain logic, controllers, and views live under `app/`, with assets split into `app/assets` for styles/images and `app/javascript` for client behavior. Shared Ruby helpers and background jobs sit in `app/helpers` and `app/jobs`. Configuration and environment-specific settings are under `config/`, while persistence changes belong in `db/migrate`. Feature tests and fixtures stay in `test/`, and any reusable service objects should go into `lib/`. Place static marketing content in `public/` when it does not require Rails routing.

## Build, Test, and Development Commands
- `bin/setup` installs gems, prepares the database, and seeds defaults for a fresh checkout.
- `bin/dev` runs the local server with the Procfile-defined processes (Rails server, asset watcher).
- `bin/rails server` launches Rails if you only need the web process.
- `bin/rails db:migrate` applies pending schema changes; pair new migrations with rollback coverage.
- `bin/rails assets:precompile` builds production assets; verify before deploying via Kamal.

## Coding Style & Naming Conventions
Follow TDD - Adhere to a strict `RED → GREEN → REFACTOR` cycle: write a failing test first, make it pass with the simplest implementation, then clean up while keeping the suite green.
Ruby code follows the `rubocop-rails-omakase` rules: two-space indentation, snake_case method and variable names, and CamelCase classes/modules. Run `bin/rubocop` before submitting to catch style and lint issues. JavaScript adheres to ES modules in `app/javascript`, with files named via kebab-case and default exports kept small. Favor view components or partials for shared UI fragments and place SCSS alongside the component that owns it.

## Testing Guidelines
The repository uses Minitest; unit and integration tests live alongside feature areas (e.g., `test/controllers/*_test.rb`). Name tests after the behavior under scrutiny, such as `renders_header_links`. Run `bin/rails test` locally and ensure new logic includes coverage. For jobs or services, add tests under `test/jobs` or `test/lib` respectively. When adding system-level flows, use `bin/rails test:system` and rely on Capybara assertions.


## Commit & Pull Request Guidelines
Write commits in imperative mood (`Add hero animation`) and keep them focused on a single concern. Reference related issues in the body with `Refs #123` when applicable. Pull requests should summarize the change, list testing performed (`bin/rails test`, `bin/rubocop`), and include screenshots or screen recordings for visual updates. Note any migrations, environment variables, or manual deployment steps so reviewers can validate them. Aim for one PR per discrete feature or bug fix.

## Security & Configuration Tips
Before deploys, run `bin/brakeman` and `bin/bundler-audit` to surface security regressions. Secrets are managed via Rails credentials; avoid committing `.env` files or plaintext keys. For Kamal-based deployments, confirm `.kamal/secrets` entries are updated and avoid logging sensitive payloads in controllers or jobs.
