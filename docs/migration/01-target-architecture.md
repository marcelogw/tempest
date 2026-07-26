# 01 — Target Architecture

Decisions are recorded ADR-style: context, decision, consequences. They are **closed**
unless this document says otherwise. Do not relitigate them mid-migration.

---

## ADR-001 — Vite + React SPA, not Next.js

### Context

The old app is built on Next.js 16 App Router, but measured against the codebase it does
not use it:

| Measurement                             | Value                                                        |
| --------------------------------------- | ------------------------------------------------------------ |
| Files in `app/`, `components/`, `lib/`  | 131                                                          |
| Files marked `'use client'`             | 91                                                           |
| Components that render on the server    | **2** (`app/layout.tsx`, `app/brand/page.tsx`)               |
| Server-only APIs used in the entire app | `generateMetadata`, next-intl's `cookies()`/`headers()` read |
| Server actions / route handlers         | 0                                                            |

The app is a single-page client application with an SSR shell bolted on. The cost of that
shell is visible as scar tissue throughout the code:

- `lib/expense-store.ts:520` — `shouldUseSampleData()` returns `false` when
  `typeof window === 'undefined'`, with the comment _"prevents hydration mismatch"_.
- `app/layout.tsx:90` — `<html suppressHydrationWarning>`.
- `components/theme-toggle.tsx:11-17` — a `mounted` state gate that renders a placeholder
  on the first pass purely to avoid a hydration mismatch.
- `components/expense/dashboard-view.tsx:51-55` — an `isHydrated` state gate that blanks the
  entire dashboard behind a "Carregando..." card on first render, for the same reason.

That last one is the clearest signal: the app's main screen is hidden from the server
render to stop the server and client disagreeing. The SSR pass produces nothing usable.

### Decision

Build the new app as **Vite + React 19 + TanStack Router**, shipped as an SPA/PWA.

### Consequences

**What carries over unchanged.** Everything visual and interactive is framework-agnostic
with respect to _Next_, not React: shadcn/ui components, Radix primitives, Tailwind v4,
recharts, dnd-kit, react-hook-form, zod, lucide icons. These are copied and restyled for
the new brand, not re-sourced.

**What changes, and how much work each is.**

| Concern          | Old                                                 | New                                                   | Effort                                                   |
| ---------------- | --------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| Routing          | `useState<ActiveView>` in `app/page.tsx`            | TanStack Router file routes                           | Small — see ADR-002                                      |
| i18n             | `next-intl`                                         | `use-intl` (same core library, same message format)   | Mechanical — `messages/*.json` carry over byte-identical |
| Locale detection | `proxy.ts` middleware + `x-next-intl-locale` header | `localStorage` + `navigator.language`                 | Simplification — delete `proxy.ts`                       |
| Metadata         | `generateMetadata()`                                | static `index.html` + a small `useDocumentTitle` hook | Small                                                    |
| Fonts            | `next/font/google`                                  | self-hosted via `@fontsource` or a `<link>`           | Small                                                    |
| Analytics        | `@vercel/analytics/next`                            | `@vercel/analytics` (framework-agnostic entry)        | Trivial                                                  |

**What is gained.**

- An entire class of bug becomes unrepresentable. Every workaround listed above is deleted
  rather than reimplemented.
- Vitest runs on the project's own Vite config — one build pipeline, not two.
- PWA/offline is first-class (`vite-plugin-pwa`), which is the correct shape for a
  local-first personal finance app opened on a phone.
- Faster dev loop and a substantially smaller dependency surface for an open-source project
  that wants outside contributors.

**What is given up.** Server rendering, server actions, and Next's image optimisation —
none of which the app used. If cloud sync later needs a server endpoint, it is added as a
separate small service, not by reintroducing a framework.

> `use-intl` is the runtime `next-intl` is built on, by the same author. Message files,
> the ICU syntax, and the `useTranslations()` API are the same. This is a swap of the
> provider and the locale-resolution layer, not of the i18n system.

---

## ADR-002 — Views become routes

### Context

`app/page.tsx:17` holds the entire navigation model:

```tsx
const [activeView, setActiveView] = useState<ActiveView>('dashboard')
...
{activeView === 'dashboard' && <DashboardView />}
{activeView === 'monthly'   && <MonthlyView />}
{activeView === 'categories'&& <CategoriesView />}
{activeView === 'cards'     && <CreditCardsView />}
{activeView === 'goals'     && <GoalsView />}
{activeView === 'settings'  && <SettingsView />}
```

Six screens live behind one URL (`/`). The consequences are user-visible:

- No deep links. A user cannot bookmark or share Goals.
- The browser back button exits the app instead of returning to the previous screen.
- A reload always lands on the Dashboard, discarding where the user was.
- `/settings` _also_ exists as a real route (`app/settings/page.tsx`), so Settings is
  reachable two different ways with two different behaviours.

### Decision

Each screen is a real route with a real URL. Selected month and year are **URL search
params**, not store state.

```
/                     → redirect to /dashboard
/dashboard            ?year=2026
/months/$month        e.g. /months/2026-07
/categories
/cards
/goals
/goals/$goalId        (the detail sheet becomes addressable)
/settings
```

### Consequences

- Back/forward, deep links, reload-in-place, and shareable URLs all work for free.
- `currentMonth` / `currentYear` leave the store entirely. They are navigation state, and
  keeping them in a persisted store is what forces `setCurrentMonth` to call
  `initializeYear` as a side effect (see pitfall **P-06**).
- TanStack Router's typed params mean an invalid month in the URL is caught at the route
  boundary, not deep inside a selector.
- Route-level code splitting comes for free, which matters because recharts is heavy and
  only the Dashboard needs it.

---

## ADR-003 — Local-first, with no cloud abstraction until cloud exists

### Context

The old app abstracts storage behind `lib/adapters/storage-adapter.ts`: a 17-method
interface plus a 3-method `CollaborativeStorageAdapter` extension. The interface is shaped
entirely around AWS Amplify's data model — `workspaceGroup`, `monthlyDataId`,
`touchWorkspaceActivity`, `createMonthlyData`, cloud-id/local-key translation.

The local implementation (`lib/adapters/local/local-storage-adapter.ts`) is 246 lines, of
which **15 of the 17 methods are stubs**:

```ts
createCategory(_localKey: string, _data: CategoryInput): Promise<void> {
  return Promise.resolve()
}
```

The local adapter does not persist anything — Zustand's `persist` middleware already does.
`fetchWorkspaceData()` reads the Zustand store and reshapes it into Amplify's wire format
so that `loadWorkspace()` can immediately reshape it back. The abstraction costs 246 lines
of local code, ~170 lines of type definitions, and buys nothing in local mode.

There is a second cost. Because the store must serve both modes, every mutation in
`lib/expense-store.ts` carries a cloud tail:

```ts
const { workspaceGroup, workspaceId } = useSyncStore.getState()
if (workspaceGroup && workspaceId) {
  enqueue({
    model: 'Expense',
    operation: 'create',
    data: {
      /* 9 fields */
    },
  })
  enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
}
```

This block, in variations, appears **19 times** and is a large part of why the store is
1,887 lines. It is also where the sync bugs live (**P-01**, **P-02**, **P-03**).

### Decision

Phase 1 has **no storage abstraction at all**. The store persists to IndexedDB via a thin
`persistence` module. There is no `StorageAdapter`, no `SyncStore`, no `write-queue`, no
`workspaceGroup` on any type.

Cloud sync is designed and added in a later phase (see `05`), against a finished and tested
local app — at which point the real requirements are known instead of guessed.

### Consequences

- The store shrinks dramatically. Business logic stops being interleaved with wire-format
  translation.
- Domain types lose their cloud contamination (`workspaceGroup`, `monthlyDataId`,
  `cardId`/`card` duality, `noteCreatedAt` vs `createdAt`). See `03`.
- When cloud sync is designed, it is designed as a **sync layer over a local log**, not as
  a per-mutation RPC fan-out. The old approach enqueues one mutation per affected record,
  which means adding a recurring expense enqueues 25 creates plus a workspace touch
  (**P-04**).
- Nothing about the local app needs to change when cloud arrives, because sync observes
  the store rather than being called from inside it.

**Persistence choice: IndexedDB, not localStorage.** The old app stores everything as a
single JSON blob under the `expense-store` key. A user with three years of data holds
~36 months × (incomes + fixed + variable + savings) in one string that is parsed and
re-serialised on **every** mutation. localStorage is also synchronous and capped around
5 MB. Use IndexedDB (via `idb-keyval` or Dexie) with the Zustand `persist` middleware's
custom storage. Keep the write path async and debounced.

---

## ADR-004 — The store is split by domain

### Context

`lib/expense-store.ts` is 1,887 lines and holds: domain types, default data, a seeded
sample-data generator, date math, kebab-case normalisation, category management, credit
card management, income, expenses, recurring propagation, installments, notes, goals,
savings entries, data deletion, cloud loading, cloud sync-checking, localStorage migration
wiring, and a re-export of the formatters module.

`ExpenseStore` declares **56 members**. Nothing can be tested, reasoned about, or changed
in isolation.

### Decision

Split into focused stores plus a pure domain layer:

```
src/
  domain/               ← pure functions, zero React, zero storage. 100% unit-testable.
    money.ts            ← Money type + arithmetic (see ADR-005)
    month.ts            ← MonthKey type, parsing, offsets, ranges, diffs
    recurrence.ts       ← recurring group expansion + propagation rules
    installments.ts     ← schedule computation, occurrence-in-month
    goals.ts            ← progress, status, monthly-needed  (old lib/goal-utils.ts)
    categories.ts       ← id normalisation, system-category rules
  stores/
    ledger-store.ts     ← monthlyData: incomes, expenses, savings entries
    catalog-store.ts    ← categories + credit cards (user configuration)
    planning-store.ts   ← installments, goals, notes
  persistence/
    db.ts               ← IndexedDB adapter
    migrate.ts          ← versioned schema migrations
```

### Consequences

- `domain/` has no dependencies and no mocking requirements. Recurring propagation and
  installment scheduling — the two places the old app actually gets things wrong — become
  directly testable.
- Stores hold state and orchestrate; they do not compute. Any function longer than a few
  lines inside a store action belongs in `domain/`.
- The old store's habit of calling `get()` mid-action to re-read state it just wrote
  (`lib/expense-store.ts:998-1001` reads `monthlyData`, calls `initializeYear`, then reads
  `get().monthlyData` again) disappears, because propagation is computed as a pure function
  and applied once.

**Keep Zustand.** It is the right size for this app and the team knows it. The problem was
never Zustand; it was putting 56 members in one store. Use `immer` middleware consistently
— the old store mixes manual spread-copying with Immer-style intent and gets it wrong in
places (`lib/expense-store.ts:762` mutates `monthData.incomes` through a shallow copy).

---

## ADR-005 — Money is integer cents

### Context

Every amount in the old app is a JavaScript `number` holding a decimal currency value, and
they are summed freely:

```ts
month.fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
```

Meanwhile `lib/formatters.ts:27-28` formats with `minimumFractionDigits: 0` and
`maximumFractionDigits: 0` — cents are never displayed. The UI therefore hides the
rounding drift that float arithmetic introduces, rather than preventing it.

The forms compound this: per `CLAUDE.md`, currency inputs use `step="1"` specifically to
avoid "useless micro-increments", so the app is _already_ de-facto integer-valued while
storing floats.

### Decision

Store money as **integer cents** (`type Cents = number & { readonly __brand: 'Cents' }`).
All arithmetic in `domain/money.ts`. Format at the edge only.

### Consequences

- `0.1 + 0.2` problems become impossible. Sums, averages, percentages, and goal progress
  are exact.
- Formatting takes `Cents` and produces a string; parsing takes user input and produces
  `Cents`. Neither is done inline in components.
- Decide explicitly whether the UI accepts cents. Recommended: **yes** — accept
  `1.234,56`, store `123456`, display with 2 decimals. The old app's decision to hide cents
  was a workaround for float drift, not a product choice.
- Migration from old data multiplies by 100 and rounds once, at import. See `03`.

---

## ADR-006 — i18n is enforced, not encouraged

### Context

The old app has a complete i18n setup — 502 keys, `en.json` and `pt.json` at near-perfect
parity (2 keys missing from `en`) — and then does not use it in the places that matter:

- `components/expense/dashboard-view.tsx` imports `useTranslations` on line 4 and then
  hardcodes **every single string in Portuguese**: `"Painel"`, `"Media de Despesas
Mensais"`, `"Renda vs Despesas"`, `"Poupanca e Investimentos"`, `"Pendencias
Financeiras"`. The `ui.dashboard.*` keys exist in both message files and are dead.
- All **36** `formatCurrency` / `formatShortCurrency` call sites pass no locale, so every
  amount renders as `pt-BR`/`BRL` regardless of language.
- `components/expense/settings-view.tsx:102` gates destructive confirmation on the literal
  string `'DELETAR TUDO'` while the English UI instructs the user to type `DELETE ALL`.
  **An English-language user cannot delete their data.** See **P-05**.
- Error messages thrown from the store are hardcoded Portuguese
  (`lib/expense-store.ts:1468`, `1504`, `1527`).

The setup was correct; nothing enforced its use.

### Decision

1. **No user-visible string literal in any component.** Enforced by ESLint
   (`react/jsx-no-literals` with a curated allowlist for symbols and numerals).
2. **Message parity is a CI check**, not a review habit. A script diffs the key sets of
   `en.json` and `pt.json` and fails the build on asymmetry or on keys defined but never
   referenced.
3. **Locale reaches formatting through context, not defaults.** `formatCurrency` has no
   default locale parameter — omitting it is a type error. A `useFormatters()` hook binds
   the active locale once and components call `format.currency(cents)`.
4. **Domain and store code never produce user-facing text.** They throw typed errors
   (`class DuplicateCategoryError extends DomainError`); the UI maps error types to
   messages.

### Consequences

- The `ui.dashboard.*` keys get used, and dead keys (`totalInvestments`, `investmentRate` —
  leftovers from the removed investments feature) are deleted.
- Adding a locale becomes a translation task, not an audit.
- The `DELETAR TUDO` class of bug cannot recur, because the confirmation phrase comes from
  the same message file as the instruction that asks for it.

---

## ADR-007 — Open source from day zero

### Context

The old repo is `"private": true` in `package.json`, ships a `LICENSE`, and contains an
`amplify/` backend directory that only the original author can deploy. A contributor
cloning it cannot run the cloud half at all, and the local half prints
`"Amplify not configured — run npx ampx sandbox"` at them from the Settings screen.

### Decision

The new repo is public from the first commit and **fully functional with `npm install &&
npm run dev`** — no accounts, no cloud, no environment variables.

### Consequences

- No backend directory in the main repo until cloud sync ships; when it does, it is
  optional and clearly separated, and its absence must never surface in the UI as an error
  or a disabled control.
- `README`, `CONTRIBUTING`, `LICENSE`, `CODE_OF_CONDUCT`, and issue/PR templates land in
  Phase 0, not "later".
- CI runs on pull requests from forks — which means it cannot depend on secrets.
- All code comments, identifiers, commit messages, and documentation in **English**.
  Portuguese remains a first-class _product_ language via `pt.json`; it is not a code
  language. The old repo mixes both (`// Seção: Preferências` inside
  `settings-view.tsx:128`, Portuguese error strings in `lib/`).

---

## Dependency decisions

| Keep                                | Why                                          |
| ----------------------------------- | -------------------------------------------- |
| React 19, TypeScript (strict)       | Unchanged foundation                         |
| Tailwind v4, shadcn/ui, Radix       | Ports directly; restyled for the new brand   |
| Zustand + Immer                     | Right-sized; split by domain per ADR-004     |
| zod                                 | Keep — but actually use it (see below)       |
| react-hook-form                     | Keep; pair with zod resolver on every form   |
| recharts                            | Keep; lazy-load with the Dashboard route     |
| dnd-kit                             | Keep — used for category and card reordering |
| date-fns                            | Keep; confine to `domain/month.ts`           |
| lucide-react                        | Keep                                         |
| Vitest, Playwright, Testing Library | Keep                                         |

| Add                            | Why                            |
| ------------------------------ | ------------------------------ |
| `@tanstack/react-router`       | ADR-002                        |
| `use-intl`                     | ADR-001 — replaces `next-intl` |
| `vite`, `@vitejs/plugin-react` | ADR-001                        |
| `vite-plugin-pwa`              | Offline/installable            |
| `idb-keyval` or `dexie`        | ADR-003 persistence            |

| Drop                                                                                       | Why                                                                          |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `next`, `next-intl`, `next-themes`                                                         | ADR-001. Theme handling is ~30 lines against `prefers-color-scheme`.         |
| `aws-amplify`, `@aws-amplify/*`, `aws-cdk-lib`, `constructs`                               | ADR-003 — deferred to the cloud phase                                        |
| `@dnd-kit` extras, `embla-carousel`, `input-otp`, `react-resizable-panels`, `vaul`, `cmdk` | Audit before porting: several are pulled in only by unused shadcn primitives |
| `use-sync-external-store`                                                                  | Redundant with React 19                                                      |
| `autoprefixer`                                                                             | Tailwind v4 handles this                                                     |

> **On `components/ui/`.** The old repo vendors **63** shadcn primitives; the app imports a
> fraction of them. Port on first use, not wholesale. Every ported primitive must be
> restyled to the new brand and have at least one render test if it wraps a Radix
> primitive.

### A note on `zod`

`lib/validations.ts` exists, defines five schemas, and is imported by **zero files** —
verified by grep across the repo. Forms validate inline instead. The file has drifted so
far that `installmentSchema` still enumerates a hardcoded card list
(`'nubank_pri' | 'nubank_ma' | 'mercadopago' | 'itau'`) from before credit cards became
user-configurable, and all its messages are hardcoded Portuguese.

In the new app: one schema per form, colocated with the form, wired through
`@hookform/resolvers/zod`, with messages resolved from i18n keys rather than literals. A
schema that is not wired to a resolver must not be written.
