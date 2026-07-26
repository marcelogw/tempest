# 05 — Phase Plan

The execution order. **This file is living state** — tick tasks as they complete and record
blockers inline, so the next session resumes in one read.

Each phase ends with a **shippable app**. Nothing is left half-wired between phases.

---

## Status

| Phase | Name                         | State                                |
| ----- | ---------------------------- | ------------------------------------ |
| 0     | Foundation & shell           | ☐ not started                        |
| 1     | Domain core & persistence    | ☐ not started                        |
| 2     | Catalog — categories & cards | ☐ not started                        |
| 3     | Ledger — income & expenses   | ☐ not started                        |
| 4     | Installments                 | ☐ not started                        |
| 5     | Savings & goals              | ☐ not started                        |
| 6     | Notes                        | ☐ not started                        |
| 7     | Monthly view assembly        | ☐ not started                        |
| 8     | Dashboard                    | ☐ not started                        |
| 9     | Settings, data & release     | ☐ not started                        |
| 10    | Cloud sync                   | ⛔ blocked by design doc — see below |

---

## Dependency order

```
0 ──▶ 1 ──▶ 2 ──▶ 3 ──▶ 4 ──▶ 7 ──▶ 8 ──▶ 9
             └──▶ 5 ──┘
             └──▶ 6 ──┘
```

Phases 3, 5, and 6 all depend on 2 (categories) and on 1. Phase 4 depends on 2 (cards).
Phase 7 assembles what 3–6 produced. **5 and 6 can be built in parallel with 4** if two
agents are working; otherwise follow the numeric order.

Each feature phase mounts its own panel into the `/months/$month` route as it is built, so
the app is usable and demoable from Phase 3 onward.

---

## Phase 0 — Foundation & shell

**Goal.** An empty but real application: it builds, routes, translates, themes, tests, and
ships to CI.

- [ ] Vite + React 19 + TypeScript (`strict`, `noUncheckedIndexedAccess`)
- [ ] TanStack Router with the route tree from ADR-002; every route renders a placeholder
- [ ] Tailwind v4 + the new brand tokens in `globals.css`
- [ ] shadcn/ui initialised — **port primitives on first use, not wholesale** (the old repo
      vendors 63; the app uses a fraction)
- [ ] `use-intl` provider; `messages/en.json` + `pt.json` copied over verbatim
- [ ] Locale detection: `localStorage` → `navigator.language` → `pt`
- [ ] Theme: `prefers-color-scheme` + explicit override + blocking inline script (no flash).
      **No `next-themes`, no `mounted` gate** — that gate is an SSR workaround with nothing
      left to work around → ADR-001, **F-13**
- [ ] Vitest + Testing Library + the custom render wrapper (i18n provider included)
- [ ] **`TZ='America/Sao_Paulo'` set in the Vitest config and in CI** → **P-13**
- [ ] Playwright, one smoke spec: app loads, sidebar renders, routes navigate
- [ ] ESLint: `react/jsx-no-literals` with a curated allowlist → **P-08**
- [ ] CI on pull requests, **no secrets** (must pass for fork PRs) → ADR-007
- [ ] CI check: message-file key parity + no unreferenced keys → **P-08**
- [ ] CI check: no `.skip` / `.only` in committed specs → **P-23**
- [ ] `README`, `CONTRIBUTING`, `LICENSE`, `CODE_OF_CONDUCT`, issue/PR templates
- [ ] App shell: sidebar, navigation, theme toggle, year selector

**Exit criteria**
`npm install && npm run dev` works on a clean clone with no accounts or env vars.
`npm run quality && npm run test && npm run test:e2e` are green in CI.
Every route is reachable by URL, back/forward works, a reload keeps you on the same screen.

---

## Phase 1 — Domain core & persistence

**Goal.** The data foundation, fully tested, with nothing rendering it yet.

- [ ] `domain/money.ts` — `Cents`, parse, format, arithmetic → ADR-005
- [ ] `domain/month.ts` — `MonthKey`, parse, offset, diff, range, previous/next.
      **Local `Date` constructor only; never `new Date(string)`** → **P-13**
- [ ] `domain/ids.ts` — one `newId()` using `crypto.randomUUID()` → **P-14**
- [ ] Branded types + boundary parsers for `Cents`, `MonthKey`, `IsoDate` → `03`
- [ ] Store skeletons: `ledger`, `catalog`, `planning` (Zustand + Immer) → ADR-004
- [ ] `persistence/db.ts` — IndexedDB via the `persist` middleware, async, debounced
- [ ] `persistence/migrate.ts` — versioned registry, **pure** migrations, backup + retention
- [ ] JSON **export** — full state, versioned, human-readable
- [ ] JSON **import** — validate-then-commit, all-or-nothing → `03`
- [ ] **Importer for old Tempest localStorage data**, including recurrence reconstruction
      from `recurringGroupId` and the cents conversion → `03`

**Exit criteria**
`domain/` is 100% covered and has no React, storage, or i18n imports.
Round-trip test: export → wipe → import → deep-equal.
Old-app fixture imports cleanly, **including a series whose value changes mid-way** → `03`.
Every invariant in `03` has a test.

---

## Phase 2 — Catalog: categories & credit cards

**Goal.** The configuration surface everything else references. → **F-05**, **F-06**

- [ ] Category CRUD, 11 defaults, `other` as the protected system category
- [ ] Dual-label resolution `customLabel ?? t('categories.' + id)` → `03`
- [ ] Colour palette picker + Lucide icon picker (shadcn primitives only)
- [ ] Drag-and-drop reorder; `order` contiguous from 0
- [ ] Delete reassigns expenses to `other` — never deletes them
- [ ] ID normalisation **with derived-ID validation** → **P-12**
- [ ] Credit card CRUD, colour, optional limit (`null` ≠ `0`)
- [ ] Card reorder
- [ ] Card delete with **reassignment**, and copy that says so → **P-16**
- [ ] Card usage: pick one well-defined metric and name it precisely → **P-15**
- [ ] Typed domain errors, mapped to i18n in the UI → **P-08**

**Exit criteria**
`/categories` and `/cards` fully usable. No `.sort()` on selector output → **P-09**.
Render test for every Radix-based dialog and select. E2E smoke for both routes.

---

## Phase 3 — Ledger: income & expenses

**Goal.** The core of the app, on a rule-based recurrence model. → **F-02**, **F-03**

- [ ] `domain/recurrence.ts` — `Recurrence`, expansion for a month, exceptions field → `03`
- [ ] **One** recurrence implementation shared by income and fixed expenses
- [ ] Income CRUD within a month
- [ ] Expense CRUD, fixed and variable, with category assignment
- [ ] Recurring create → **one rule, not 25 rows** → **P-04**
- [ ] Edit-from-month → close the old rule, open a new one → `03`
- [ ] Delete-from-month → set `endMonth`, or delete when at the start
- [ ] Convert single ↔ recurring
- [ ] **Open-ended recurrence** — no 24-month horizon → **P-07**
- [ ] Forms: zod schema + `@hookform/resolvers`, messages from i18n → ADR-006
- [ ] Currency input per `CLAUDE.md` conventions; `autoComplete="off"` on non-login text
- [ ] Income and expense panels mounted into `/months/$month`

**Exit criteria**
Recurrence is covered by unit tests for: create, edit-from-middle, delete-from-middle,
convert both ways, and expansion beyond 24 months.
**E2E for replication exists and is not skipped** → **P-23**.
History is never rewritten by a forward edit.

---

## Phase 4 — Installments

**Goal.** Multi-month card purchases, projected rather than stored. → **F-04**

- [ ] `domain/installments.ts` — occurrence-in-month, derived, never persisted
- [ ] Create with **required** card, 2–48 validated in the schema → **P-11**
- [ ] Form reset clears to empty — no literal card IDs → **P-11**
- [ ] Delete; decide edit explicitly (implement, or state its absence in the UI)
- [ ] Projection into month totals and the category breakdown, under the **`installment`**
      category → **P-10**
- [ ] Panel mounted into `/months/$month`

**Exit criteria**
A plan starting in month _M_ appears in exactly `totalInstallments` consecutive months,
numbered 1..n. A month containing an installment shows an `installment` breakdown entry,
**not** `other` → **P-10**. Card reassignment on delete keeps every plan resolvable.

---

## Phase 5 — Savings & goals

**Goal.** Reserves and the goals they feed. → **F-07**, **F-08**

- [ ] Savings entry CRUD with a **single** API → **P-17**
- [ ] `confirmed` flag; confirmed vs forecast treated distinctly throughout
- [ ] Goal CRUD, icon, colour, target, optional deadline
- [ ] `domain/goals.ts` — port `lib/goal-utils.ts` near-verbatim, converted to cents
- [ ] Progress from **confirmed entries only**; forecast shown separately
- [ ] Complete / reactivate; `completedAt` set iff completed (invariant 10)
- [ ] Deleting a goal unlinks entries without deleting them
- [ ] Resolve the `ahead` status: rename to `reached`, or implement it properly → **P-18**
- [ ] Deadline picker rejects past months (per `CLAUDE.md`)
- [ ] `/goals` and `/goals/$goalId` routes (the detail sheet becomes addressable)

**Exit criteria**
All five goal statuses covered by tests using `vi.setSystemTime()`.
`targetAmount = 0` and a deadline in the current month are both covered.
Deleting a goal preserves its savings entries.

---

## Phase 6 — Notes

**Goal.** Month-scoped reminders that follow the user forward. → **F-09**

- [ ] Note CRUD, value + direction, event date, persistent, done
- [ ] **One** implementation of the visibility rule, in `domain/notes.ts` → `03`
- [ ] Carried-forward notes pinned and badged
- [ ] Inline done toggle
- [ ] All dates through the locale-bound formatter → **P-19**
- [ ] Decide whether `value: 0` is valid, and align the list and dashboard filters → **F-09**
- [ ] Panel mounted into `/months/$month`

**Exit criteria**
Visibility rule tested across origin month, future months, done, and not-persistent.
No raw ISO string and no `toLocaleDateString()` outside the formatters.

---

## Phase 7 — Monthly view assembly

**Goal.** The panels become one coherent screen. → **F-11**

- [ ] Layout matching the redesign: summary, left column, expense lists, notes
- [ ] `domain/totals.ts` — **one** `monthExpenseTotal`, used everywhere → **P-21**
- [ ] Summary cards: income, expenses, reserves, net balance
- [ ] Month-over-month change using the **same** total on both sides → **P-21**
- [ ] `0` as a valid previous-month baseline, not "no data" → **F-11**
- [ ] Category breakdown, installments included
- [ ] Month selector driving the URL → ADR-002

**Exit criteria**
A month with installments compared against an identical previous month reports **0%**.
Previous-month resolution is correct under `TZ='America/Sao_Paulo'` → **P-13**.
No blank frame on first paint — no `null` return while a month "initialises" → **P-06**.

---

## Phase 8 — Dashboard

**Goal.** The analytics screen, rebuilt as tested pure functions plus thin charts. → **F-10**

- [ ] Every aggregation as a pure function in `domain/analytics.ts`, each tested → **P-20**
- [ ] Stat tiles: average expenses, MoM change, total saved, savings rate
- [ ] Pending notes panel (payable / receivable)
- [ ] Charts: income vs expenses, fixed vs variable, category distribution, savings trend
- [ ] Category averages grid
- [ ] **Every string from i18n** — `ui.dashboard.*` keys finally used → **P-08**
- [ ] Month labels from `monthsShort.*` or the locale-bound formatter → **P-13**
- [ ] One component per chart; no 700-line files
- [ ] Route lazy-loaded (recharts is heavy)
- [ ] Decide the pie's top-6 story: add an "other" bucket or label it as top-N → **F-10**
- [ ] Document or fix the per-row denominator in category averages → **F-10**
- [ ] **No `isHydrated` gate** — there is no server render to mismatch → ADR-001

**Exit criteria**
Every rendered number is covered by a unit test, including the empty, single-month, and
installment cases → **P-20**. Zero hardcoded strings. Charts readable in light and dark.

---

## Phase 9 — Settings, data & release

**Goal.** Data ownership, and a real 1.0. → **F-12**

- [ ] Language switch **without a page reload**; one source of truth for locale
- [ ] Export / import wired into the UI (built in Phase 1) → **F-12**
- [ ] **Import from old Tempest** as a guided flow, not a hidden dev tool
- [ ] Delete year, delete all — copy matching behaviour **exactly** → **P-22**
- [ ] Delete-all resets categories and cards too, or says it does not → **P-22**
- [ ] Confirmation phrase from i18n, verified in **both** locales → **P-05**
- [ ] Prompt an export before any destructive action
- [ ] PWA: manifest, service worker, offline shell, installable
- [ ] Accessibility pass: keyboard navigation, focus traps, contrast, labels
- [ ] Performance: route-level splitting, bundle budget in CI
- [ ] `README` with screenshots, and a real `CHANGELOG`

**Exit criteria**
A user can move from the old app to the new one **without losing data**, and can get their
data back out again. The destructive-confirmation E2E passes in `en` **and** `pt` → **P-05**.
The app works fully offline after first load.

---

## Phase 10 — Cloud sync ⛔

**Blocked.** Do not start until a design document exists and is reviewed.

Per ADR-003, sync is designed against a **finished** local app. The old implementation is a
catalogue of what not to do; that catalogue is the input to the design, not the design.

**The design document must answer, before any code:**

1. What is the conflict model? Last-write-wins per field, per record, or CRDT? The old app
   asked the user to discard one entire dataset — decide if that is acceptable.
2. What is the sync unit? An outbox of operations, or a state diff? ADR-003 recommends a
   diff, because omission is what lost bulk deletes → **P-02**.
3. How does every entity get a sync path, enforced at compile time? → **P-01**
4. How is the outbox made concurrency-safe and its failures made visible? → **P-03**
5. How does one user action stay one mutation? → **P-04**
6. Does multi-user collaboration stay in scope? The old model capped a workspace at 2
   members. If it is dropped, sync becomes single-user multi-device and dramatically simpler.
7. Which backend? Deferring this decision was the point of ADR-003 — decide it with the
   finished local model in hand, not before.

**Prerequisite:** Phase 9 complete and released.

---

## Session protocol

At the **start** of a session:

1. Read `README.md`, then this file's Status table.
2. Pick the first unticked task in the current phase.
3. Read that feature's section in `02` and its linked entries in `04`.

At the **end** of a session:

1. Tick what is done. Add a dated note for anything blocked, with the reason.
2. Update the Status table if the phase changed state.
3. Commit. A phase is never left with a half-wired feature.

**If a phase cannot complete**, finish every other task in it, then record precisely what is
outstanding and why. Do not advance the Status table past a phase with open work — and do not
quietly narrow a phase's scope to make it fit.
