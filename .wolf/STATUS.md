# STATUS — tempest

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-07-26

---

## 🧭 Context

This repo (`tempest`) is being **replaced** by a new, clean, open-source-from-day-zero app:
new brand, fully redesigned UI, **same features**. Hence "migration", not "rewrite".

The migration runs incrementally, one feature at a time, executed by AI agents. Every
improvement (i18n, tests, naming, structure) is made **during** the migration of the part it
belongs to — never deferred to a cleanup pass.

**The migration guide lives in `docs/migration/`. It is the spec.** Start at
`docs/migration/README.md`.

---

## ✅ Done

- **Migration guide written** (`docs/migration/`, 7 documents, ~23k tokens total)
  - `README.md` — index, the three rules, per-session protocol
  - `01-target-architecture.md` — 7 ADRs, all closed
  - `02-feature-inventory.md` — 15 features mapped (F-01..F-15)
  - `03-domain-model.md` — canonical types, invariants, old→new import map
  - `04-pitfalls.md` — 24 verified defects (P-01..P-24) with evidence
  - `05-phase-plan.md` — phases 0-10, **this is living state, tick tasks there**
  - `06-quality-bar.md` — definition of done
- Cross-references validated: 24/24 pitfalls, 15/15 features, 7/7 ADRs, no dead links
- Stack decision made and closed: **Vite + React 19 + TanStack Router (SPA/PWA)**

---

## 🚀 Next phase

**Goal:** Execute **Phase 0 — Foundation & shell** of the migration, in the *new* repository.

### Where the work happens

Phases 0+ are executed in the **new repo**, not here. This repo is now the behavioural
reference and the home of the guide. The new repo does not exist yet — creating it is the
first act of Phase 0.

### Acceptance criteria (Phase 0)

1. `npm install && npm run dev` works on a clean clone — no accounts, no env vars
2. `npm run quality && npm run test && npm run test:e2e` green in CI, **no secrets** (must
   pass for fork PRs)
3. Every route reachable by URL; back/forward works; reload keeps you on the same screen
4. `TZ='America/Sao_Paulo'` set in Vitest config **and** CI → catches pitfall P-13
5. CI checks in place: i18n key parity, no `.skip`/`.only`, JSX literal lint

Full checklist: `docs/migration/05-phase-plan.md` → Phase 0.

### Closed decisions

- **Vite + React + TanStack Router**, not Next.js — the old app is 89/91 `'use client'`, uses
  no SSR, and carries hydration workarounds for a server render that produces nothing (ADR-001)
- **Not Svelte** — would convert a migration into a rewrite, discards the one layer that ports
  for free (shadcn/Radix/recharts/dnd-kit), and is the weakest ground for AI-executed work
- **Local-first, no cloud abstraction until cloud exists** (ADR-003) — the old 17-method
  `StorageAdapter` has 15 no-op stubs in local mode
- **Money as integer cents** (ADR-005)
- **Docs in English**; Portuguese stays a product language via `pt.json`, not a code language
- Cloud sync is **Phase 10 and blocked** pending a design doc answering 7 listed questions

### Open decisions (ask the user before coding)

- New repo name / brand identity — not yet chosen
- Whether the redesign introduces new screens beyond the 6 existing views
- Currency: ship a real currency setting, or hardcode BRL honestly? (F-14)
- Whether multi-user collaboration stays in scope at all (it caps at 2 members today)

---

## 📁 Active architecture (this repo — the reference implementation)

- **Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui, Zustand +
  Immer, next-intl, recharts, AWS Amplify Gen 2 (optional cloud mode)
- **Runtime source of truth:** `lib/expense-store.ts` (1,887 lines, 56 store members)
- **Key modules:** `lib/expense-store.ts`, `lib/adapters/`, `lib/write-queue.ts`,
  `lib/migrations.ts`, `lib/goal-utils.ts`, `lib/formatters.ts`, `messages/{en,pt}.json`
- **Patterns:** adapter registry for storage/auth; localStorage write queue for cloud sync;
  month keys `YYYY-MM`; categories as i18n keys with `customLabel` override for custom ones

---

## ⚠️ External blockers (don't block coding)

- New repository not yet created (needs the brand decision first)
- `node_modules` is not installed in the remote session container — `npm run quality` and
  `npm test` cannot run here without `npm ci` first

---

## 🔧 Useful commands

```bash
npm run quality          # typecheck + lint + format:check — run before committing
npm run test             # Vitest
npm run test:coverage    # enforces 75% (but see pitfall P-24 — the threshold is misleading)
npm run test:e2e         # Playwright

# format the migration docs with the repo's own style (no tailwind plugin needed)
npx prettier@3.8.1 --no-config --no-semi --single-quote --print-width 100 \
  --tab-width 2 --trailing-comma es5 --arrow-parens always --bracket-spacing \
  --end-of-line lf --write "docs/migration/*.md"
```

---

## 📚 References (read IF needed)

- `docs/migration/` — **the migration spec; start at README.md**
- `.wolf/cerebrum.md` — User Preferences + Do-Not-Repeat + Decision Log
- `.wolf/anatomy.md` — token-efficient file index
- `.wolf/buglog.json` — known bugs + fixes
