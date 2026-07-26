# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-07-26

## User Preferences

- [2026-07-26] Speaks Portuguese; wants **documentation and code in English** (open-source
  audience). Portuguese stays a product language via `pt.json`, not a code language.
- [2026-07-26] When asked for a technical opinion ("should we move to Svelte?"), wants a
  **direct recommendation with reasoning grounded in this codebase**, not a survey of options.
  Measure the codebase first, then recommend.
- [2026-07-26] Values incremental, phased delivery over big-bang. Explicitly wants every
  improvement (i18n, tests, refactors) made **during** the migration of that part — never
  deferred to a cleanup pass.
- [2026-07-26] Wants quality guardrails that are **enforced, not aspirational**, and explicitly
  asked for this "sem complicar" — prefer a few machine-checked rules over long checklists.
- [2026-07-26] Documents are meant to be consumed by **AI agents across many sessions**, so
  they need an index, a per-session read path, and living state — not prose essays.

## Key Learnings

- **Project:** tempest — personal expense management (income, expenses, investments, savings).
- **Being replaced** by a new open-source app: new brand, redesigned UI, same features.
  Spec lives in `docs/migration/`; start at its `README.md`.
- **Architecture reality vs intent:** despite being a Next.js App Router app, 89 of 91
  component files are `'use client'`. Only `app/layout.tsx` and `app/brand/page.tsx` render on
  the server. It is a SPA wearing a Next.js costume — and it pays for that with hydration
  workarounds (`suppressHydrationWarning`, `mounted` gates, `isHydrated` gates).
- **Navigation is `useState`, not routes.** All 6 views live behind `/` in `app/page.tsx`, so
  there are no deep links and the back button exits the app. `/settings` confusingly exists as
  a real route *as well*.
- **Category labels are dual-sourced and this is load-bearing:** default categories have no
  stored label — their `id` IS the i18n key, so they translate. Custom categories store
  `customLabel` and never translate. Resolution is always
  `customLabel ?? t('categories.' + id)`. Do not flatten this.
- **Recurrence is materialised, not modelled.** One recurring income writes 25 rows (current
  month + 24). That single decision causes the 24-month cliff, the 25-mutation cloud fan-out,
  and most of the store's complexity.
- **The i18n setup is complete and largely unused.** 502 keys at near-parity across en/pt,
  while `dashboard-view.tsx` hardcodes every string in Portuguese and all 36 `formatCurrency`
  call sites pass no locale. Infrastructure without enforcement decays.
- **Coverage config hides the risky code.** `vitest.config.ts` excludes `migrations.ts`,
  `write-queue.ts`, `sync-store.ts`, `workspace-client.ts` and all Amplify adapters from the
  75% threshold — i.e. everything most likely to be wrong.
- `lib/validations.ts` exists, exports 5 zod schemas, and is imported by **zero** files. Always
  grep for importers before trusting that a module is live.
- `lib/goal-utils.ts` is the one genuinely clean module — pure, testable, no side effects. It
  is the model for what the new `domain/` layer should look like.

## Do-Not-Repeat

- [2026-07-18] NUNCA subestime o impacto de alterações na interface (como mudanças simples de
  texto ou componentes). O projeto possui uma suíte extensa de testes unitários e E2E
  (Playwright) que cobrem praticamente todos os fluxos. Qualquer modificação nos componentes
  visuais ou textos pode e vai quebrar seletores de testes.
- [2026-07-18] SEMPRE trate processos obrigatórios (como linter e testes passando) como
  verdades absolutas. Não pergunte ao usuário se deve ou não consertar o código para que o
  linter ou testes passem. Se houver falhas, corrija ativamente.
- [2026-07-26] **NEVER `new Date(dateOnlyString)`.** Date-only ISO strings parse as UTC per
  ECMA-262, so in `America/Sao_Paulo` (this app's default market) they render as the previous
  day — and therefore the previous *month* for `YYYY-MM-01`. Reproduced: dashboard labels off
  by one, `previousMonth('2026-07')` returns `2026-05`. Always use
  `new Date(year, month - 1, day)`. Run tests under a non-UTC `TZ`.
- [2026-07-26] **Never compute the same total two different ways.** `monthly-view.tsx`
  includes installments in the current month's total but excludes them from the previous
  month's, so the month-over-month percentage is wrong for anyone with an installment plan.
  One function, called twice.
- [2026-07-26] **Never use a magic-string default for an ID.** `mapInstallmentsToExpenses`
  defaults `categoryId` to `'parcelamento'`, which the v1→v2 migration renamed to
  `'installment'`. Every installment has silently been counted as `other` ever since.
- [2026-07-26] **Never compare against a hardcoded phrase that has a translated counterpart.**
  `settings-view.tsx` gates delete-all on `'DELETAR TUDO'` while the English UI instructs the
  user to type `DELETE ALL` — English users cannot delete their data at all.
- [2026-07-26] **Never `.sort()` a value from a store selector.** `expense-form.tsx` sorts the
  categories array in place during render, mutating store state outside `set()`.
- [2026-07-26] **Do not build an abstraction for a backend that is not there yet.** The
  17-method `StorageAdapter` is shaped entirely around Amplify; its local implementation has
  15 methods that just `return Promise.resolve()`.
- [2026-07-26] **Never leave `test.skip` in a committed spec.** All three income-replication
  E2E tests are skipped — the riskiest logic in the app — while the file still looks like
  coverage in a directory listing.
- [2026-07-26] Before claiming a module is used, `grep` for its importers. Before claiming a
  bug exists, reproduce it.

## Decision Log

- [2026-07-26] **Vite + React 19 + TanStack Router (SPA/PWA) over Next.js** for the new app.
  Evidence: 89/91 files are client components, zero server actions, and the only server APIs
  used are `generateMetadata` and next-intl's cookie read. Dropping Next deletes an entire
  class of hydration bug rather than reimplementing the workarounds. shadcn/Radix/recharts/
  dnd-kit port unchanged; only routing, i18n provider, and metadata change. (ADR-001)
- [2026-07-26] **Rejected Svelte 5 + SvelteKit.** Three reasons: (1) it converts a migration
  into a rewrite by discarding the UI layer that ports for free; (2) Svelte 5 runes are recent
  enough that agents regress to Svelte 4 syntax, which is a real risk to an AI-executed
  migration held to an absolute quality bar; (3) none of this codebase's actual problems are
  React's fault — they are a god store, a leaky adapter, and unenforced i18n.
- [2026-07-26] **Local-first first; cloud is a later, optional layer** (user's choice). No
  storage abstraction exists in Phase 1. Sync is designed against a *finished* local app, so
  the requirements are known rather than guessed. (ADR-003)
- [2026-07-26] **Money becomes integer cents.** The old app stores floats and hides the drift
  by formatting with `maximumFractionDigits: 0`. (ADR-005)
- [2026-07-26] **Recurrence becomes a rule, not materialised rows.** Removes the 24-month
  cliff, the 25-writes-per-action fan-out, and most of the store's size. (03-domain-model)
- [2026-07-26] **Views become real routes** with month/year as URL search params, so deep
  links, the back button, and reload-in-place all work. (ADR-002)
- [2026-07-26] Migration docs in `docs/migration/`, in **English**, structured for AI
  consumption: numbered docs, stable IDs (F-xx features, P-xx pitfalls, ADR-xxx decisions),
  and `05-phase-plan.md` as the single living state file.
