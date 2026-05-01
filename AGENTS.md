# AGENTS.md

# LLM Wiki — Compiled Project Memory

This file defines how agents should understand, maintain, and use a persistent wiki for this repository.

The wiki is a **compiled knowledge layer** that sits between raw sources and day-to-day work.

---

## Core Model

```text
raw/       = immutable source material (specs, notes, transcripts, references)
src/       = executable truth (codebase)
docs/      = human-written documentation
wiki/      = compiled understanding (maintained by agents)
AGENTS.md  = operating system for agents
```

Key idea:

- RAG = search at query time
- LLM Wiki = compile once, reuse forever

The wiki accumulates knowledge over time instead of rediscovering it on every task.

---

## Source of Truth Priority

Always resolve conflicts using this order:

1. Source code and tests
2. Raw sources (`raw/`)
3. Official docs (`README.md`, `/docs`)
4. Wiki (`/wiki`)
5. Chat instructions

Rules:

- Code defines actual behavior
- Raw sources define intended behavior
- Wiki explains and connects knowledge
- If sources disagree → record the contradiction
- If unsure → mark `needs verification`

---

## Purpose of the Wiki

The wiki should:

- Explain how the system works
- Map features → code
- Track decisions and tradeoffs
- Record setup and workflows
- Capture bugs, risks, and unknowns
- Preserve useful answers over time

The human curates and decides.

The agent maintains, links, updates, and verifies.

---

## Folder Structure

```text
raw/                     -- immutable sources
wiki/
  index.md               -- map of all pages
  log.md                 -- chronological history
  source-register.md     -- tracked sources
  contradictions.md      -- conflicting claims
  setup.md
  architecture.md
  file-map.md
  features.md
  decisions.md
  known-issues.md
  open-questions.md

  sources/               -- summaries of raw inputs
  concepts/              -- reusable ideas/entities
  systems/               -- technical systems
  workflows/             -- repeatable processes
  context/               -- task-specific packs
  decisions/             -- decision records
```

---

## Initial Setup

### New Project

1. Read `AGENTS.md`
2. Create `raw/` and `wiki/`
3. Create core pages:
   - index, log, setup, architecture, features, decisions, open-questions
4. Record unknowns instead of inventing details
5. Log the setup

### Existing Project

1. Read `AGENTS.md`
2. Inspect repo structure
3. Identify:
   - language, framework, package manager
   - run, build, test commands
4. Read configs and docs
5. Scan key code paths
6. Create/update wiki pages
7. Log ingestion

Do not change code during ingestion.

---

## Ingest Workflow

When ingesting a source or repo:

1. Read source
2. Extract key facts, systems, decisions
3. Update relevant wiki pages
4. Create new pages if needed
5. Add `[[wiki-links]]`
6. Update `index.md`
7. Update `source-register.md`
8. Append to `log.md`

A single source may update many pages.

---

## Codebase Ingestion

1. Identify entry points
2. Identify modules and responsibilities
3. Map features → files
4. Record commands (run/test/build)
5. Record dependencies
6. Record risks and unknowns
7. Update wiki

Do not refactor.

---

## Page Types

Use clear page roles:

```text
sources/   = summaries of inputs
concepts/  = reusable ideas
systems/   = architecture components
workflows/ = how to do things
decisions/ = why choices were made
context/   = task-specific instructions
```

---

## Page Format

```markdown
# Title

**Summary**: Short description  
**Sources**: file paths or docs  
**Last updated**: YYYY-MM-DD  

---

## Overview

## Details

## Important Files

## Open Questions

## Related Pages
```

Optional frontmatter:

```yaml
status: draft | reviewed | canonical | deprecated
confidence: low | medium | high
```

---

## Citation Rules

Always cite sources:

```text
This uses Vite. (source: package.json)
```

If uncertain:

```text
May require Redis. (needs verification)
```

If conflicting:

```text
README says npm, repo uses pnpm. Record contradiction.
```

---

## Source Register

Track all ingested sources:

```md
| Source | Type | Status | Last Ingested | Page |
```

Prevents duplicate ingestion and tracks freshness.

---

## Contradictions

Record conflicts in:

```text
wiki/contradictions.md
```

Never silently resolve conflicting information.

---

## Context Packs

Agents should not read the whole wiki every time.

Use:

```text
wiki/context/
  frontend-changes.md
  backend-changes.md
  testing.md
```

Each pack includes:

- relevant pages
- key files
- validation steps

---

## Question Answering

1. Read `index.md`
2. Read relevant pages
3. Check code if needed
4. Answer concisely
5. Cite sources
6. If useful → save to wiki

---

## Saveback Rule

If an answer is reusable, store it.

Save when it explains:

- workflows
- feature behavior
- debugging steps
- decisions
- comparisons

Knowledge should compound.

---

## Development Workflow

1. Read relevant wiki pages
2. Inspect code
3. Make minimal change
4. Validate (tests/lint/manual)
5. Update wiki if behavior changed
6. Update index if needed
7. Append log entry

---

## Re-ingestion Rules

Re-ingest when:

- source changed
- code changed
- contradiction found
- page is stale

Steps:

1. compare old vs new
2. update wiki
3. mark deprecated info
4. log change

---

## Log Format

Append-only:

```md
## [YYYY-MM-DD] type | title

Source: path
Changes:
- updated pages
Notes:
- uncertainties
Verification:
- code checked: yes/no
- human reviewed: yes/no
```

---

## Index Rules

`index.md` should:

- list all major pages
- group by category
- include one-line summaries
- act as navigation entry point

---

## Lint / Audit

Check for:

- contradictions
- stale info
- missing sources
- orphan pages
- missing concepts
- weak linking

Output numbered fixes.

---

## Coding Rules

Prefer:

- clarity
- small changes
- existing patterns

Avoid:

- large rewrites
- hidden side effects
- unnecessary abstractions

---

## Safety Rules

Do not:

- delete data
- modify `raw/`
- commit secrets
- rewrite configs blindly
- break working code

---

## Anti-Bloat Rule

Do not over-document.

- no imaginary systems
- no speculative architecture
- create pages only when useful

---

## Completion Criteria

A task is complete when:

- change is implemented
- validated where possible
- wiki updated if needed
- index updated if needed
- log updated
- uncertainties recorded

---

## Summary

```text
Code = reality
Raw = intent
Wiki = compiled understanding
AGENTS.md = rules of operation
```

The agent maintains the wiki.

The human provides direction.

The system improves over time.
