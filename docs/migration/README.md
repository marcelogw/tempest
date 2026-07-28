# Migration Guide

This directory is the complete specification for rebuilding Tempest as a new, clean,
open-source-from-day-zero application.

It is written to be executed by an AI agent working **one feature at a time**, across many
sessions, without losing quality or context between them.

> **Scope note.** The new app has a new brand and a fully redesigned UI. The _functionality_
> is intentionally unchanged. That is why this is called a migration and not a rewrite:
> behaviour is the spec, code is not. Every improvement — i18n, tests, naming, structure —
> is made **during** the migration of the part it belongs to, never as a follow-up pass.

---

## Read this first

| #   | Document                                                   | Read when                                                       |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| —   | **README.md** (this file)                                  | Always. Start of every session.                                 |
| 01  | [`01-target-architecture.md`](./01-target-architecture.md) | Once, before writing any code. Then when touching structure.    |
| 02  | [`02-feature-inventory.md`](./02-feature-inventory.md)     | Before migrating any feature. Read only that feature's section. |
| 03  | [`03-domain-model.md`](./03-domain-model.md)               | Before touching types, store, or persistence.                   |
| 04  | [`04-pitfalls.md`](./04-pitfalls.md)                       | Before migrating a feature — check its entries. Non-negotiable. |
| 05  | [`05-phase-plan.md`](./05-phase-plan.md)                   | Start of every session, to know what phase you are in.          |
| 06  | [`06-quality-bar.md`](./06-quality-bar.md)                 | Before opening a PR. Definition of done.                        |
| 07  | [`07-agent-tooling.md`](./07-agent-tooling.md)             | Once, when setting up the repo. Then only when adding a tool.   |

**Minimum read for one feature migration:** this README → the feature's section in `02` →
its listed entries in `04` → `06`. That is roughly 400 lines, not the whole guide.
`07` is setup-time only — it is not part of the per-feature read path.

---

## The three rules

Everything else in this guide is detail. These three are the guide.

### 1. Behaviour is ported. Code is not.

The old codebase is a **behavioural reference**, not a source to copy. When migrating a
feature, read the old implementation to learn _what it does and which edge cases it
handles_, then write the new implementation from the spec in `02` and the model in `03`.

Copy-pasting from the old repo is the single most likely way to fail this migration,
because the old code carries the exact defects catalogued in `04`.

### 2. Every feature arrives complete or not at all.

A feature is migrated when **all** of these are true — not four of five:

- Behaviour matches the spec in `02`, including the listed edge cases.
- Every user-visible string is in `en.json` **and** `pt.json`. Zero hardcoded copy.
- Unit tests cover the logic branches; a render test exists for every Radix-based component.
- An E2E smoke test drives the primary user action on the screen.
- `npm run quality` and `npm run test` pass.
- The relevant `04` pitfalls are verified as _not_ reproduced.

Half-migrated features are worse than unmigrated ones: they look done and hide gaps.

### 3. Local-first is the architecture, not a mode.

The new app is a client-side application whose source of truth is the user's own device.
Cloud sync is a **later, optional layer** added on top of a finished local app — it is not
an abstraction to design around now.

The old app inverted this: it defined a 17-method `StorageAdapter` interface shaped entirely
around AWS Amplify, then implemented it locally with 15 methods that do nothing but
`return Promise.resolve()`. Do not build that. See `01` for what to build instead.

---

## How to run one migration session

```
1. Read this README.
2. Read 05-phase-plan.md → identify the current phase and the next unchecked task.
3. Read that feature's section in 02-feature-inventory.md.
4. Read the pitfall entries that section links to in 04-pitfalls.md.
5. Implement. Write tests alongside, not after.
6. Run: npm run quality && npm run test && npm run test:e2e
7. Verify against the checklist in 06-quality-bar.md.
8. Tick the task in 05-phase-plan.md. Commit.
```

If a step cannot be completed, **stop and record why in the phase plan** rather than
shipping a partial feature and moving on.

---

## What this guide is not

- It is not a design spec. The new visual design lives with the brand work; this guide
  covers behaviour, data, and structure. Where the two meet (component conventions, form
  field rules), `06` sets the constraints the design must be implemented within.
- It is not a line-by-line port map. There is deliberately no "old file → new file" table,
  because the target structure is different by design (see `01`).
- It is not exhaustive about the old code's _implementation_. It is exhaustive about the
  old code's _behaviour and defects_.

---

## Provenance

Every factual claim in `02`, `03`, and `04` was verified against the Tempest codebase at
the commit this guide was written from — file paths and line numbers are cited so they can
be re-checked. Where the old code is wrong, `04` states the evidence and the required
behaviour in the new app.

If you find a discrepancy between this guide and the old code, the guide's _intent_ wins,
but **record the discrepancy** — it usually means a behaviour was missed during mapping.
