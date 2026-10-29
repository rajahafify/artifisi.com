# Design and motion skills for website work

fify asked on 29 Oct 2026 that agents working on any of the sites (the main site, `reports/`, `tech-sovereignty/`, the proposals) install and use these six skills first.

## Install

```
playbook/skills/install.sh
```

It fetches each skill at the commit pinned in `skills.lock` into `.claude/skills/`, which git ignores. Start a new agent session afterwards so the skills are picked up. To run it automatically, add it as a SessionStart hook in `.claude/settings.json`. The repo owner has to do that step, because agents are not allowed to edit their own settings.

## Which one, when

| Skill | Source | Use it for |
|---|---|---|
| `impeccable` | pbakaus/impeccable | Start here. Shape, critique, audit and polish a page: hierarchy, type, colour, layout, accessibility. Its `audit` and `critique` commands are the review step before a PR. |
| `design-taste-frontend` (folder `taste-skill`) | Leonxlnx/taste-skill | Art direction for a new page or a redesign: composition, type, palette and section blueprints drawn from curated gallery sites. |
| `ui-ux-pro-max` | nextlevelbuilder/ui-ux-pro-max-skill | Look things up: palettes, font pairings, chart types, UX rules, GSAP presets. Its search script needs Python 3. |
| `gsap-*` (8 skills) | greensock/gsap-skills | Official GSAP guidance: timelines, ScrollTrigger, plugins, performance. Use for scroll-driven scenes and chart animation. |
| `transitions-dev`, `transitions-polish`, `transitions-ui-generation` | jakubantalik/transitions.dev | Small UI motion: dropdowns, tabs, toasts, number pop-ins, text reveals, loaders. Keeps durations and easing consistent. |
| `playwright-cli` | microsoft/playwright-cli | Drive a real browser to check the page: open, click, snapshot, screenshot at phone and desktop sizes. |

## Order for a page

1. `design-taste-frontend` and `ui-ux-pro-max` to set the direction.
2. Build. Use `gsap-*` for scroll and scene motion and `transitions-*` for UI motion.
3. Check every view at 390 and 1440 wide with `playwright-cli`.
4. Run `impeccable` audit and critique, fix what it finds, then open the PR.

The house rules still win over any skill: the voice rules in the project's `docs/writing.html` (no em dashes, no AI word list), every figure as real HTML text, and sources named on the page.

## Licences

impeccable and playwright-cli are Apache 2.0. taste-skill, gsap-skills and ui-ux-pro-max are MIT. transitions.dev has its own licence. It allows use in commercial sites and in coding agents, but not republishing the library, which is why these skills are fetched and never committed.
