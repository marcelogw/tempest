# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tempest** - Personal expense management application for tracking income, expenses, investments, and savings across months. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## Essential Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Run Prettier
npm run typecheck    # Run TypeScript validation
npm run quality      # typecheck + lint + format:check (run before committing)

npm run test                    # Run unit tests (Vitest)
npm run test:ui                 # Vitest browser UI
npm run test:coverage           # With coverage (75% threshold enforced)
npx vitest run path/to/test     # Run a single test file
npm run test:e2e                # Playwright E2E tests
```

Husky pre-commit hook runs lint-staged (ESLint + Prettier) on `*.{ts,tsx}` files automatically.

## Architecture

### State Management — Zustand Store

`lib/expense-store.ts` is the **runtime source of truth** for all financial data. Data is persisted to localStorage as a read cache; Amplify is the cloud source of truth. Key shapes:

- `monthlyData`: Record keyed by `YYYY-MM` → `{ fixedExpenses, variableExpenses, incomes, investments, savings }`
- `categories`: User-configurable list (system + custom); includes `isSystem`, `color`, `icon`, `order`
- `creditCards`: User-configurable list with `limit`, `color`, `order`
- `installments`: Global installment plans tracking multi-month credit card purchases
- `currentMonth`: Active month string

**Critical rules**:

- Access month data only via `getMonthData(month)` — it auto-initializes missing months
- Month keys must be `YYYY-MM` format
- Installment calculations depend on `getMonthDiff()` — never bypass
- Store uses Zustand + Immer; write mutation-style updates inside `set()`

### Internationalization (next-intl)

The app supports **English (`en`) and Portuguese (`pt`)** via `next-intl`:

- Message files: `messages/en.json`, `messages/pt.json`
- Routing config: `i18n/routing.ts` — locales use cookie-based detection, **no URL prefixes**
- Proxy: `proxy.ts` reads `NEXT_LOCALE` cookie or Accept-Language header, sets `x-next-intl-locale`
- Default locale: `pt`

All new user-facing strings must be added to **both** message files. Use `useTranslations()` from `next-intl` in components.

### Formatting Utilities

`lib/formatters.ts` provides locale-aware formatting:

- `formatCurrency(value, locale, currency)` — full currency format
- `formatShortCurrency(value, locale, currency)` — compact (e.g., `R$1.5k`)
- `formatPercentage(value, locale, decimals)`
- `formatCurrencyBRL()` / `formatShortCurrencyBRL()` — **deprecated** wrappers, avoid in new code

### Cloud Architecture — Amplify Gen 2

Tempest is **cloud-only**: Amplify is the source of truth; `localStorage` is a read cache.

**Key files:**

- `lib/workspace-client.ts` — `getAmplifyClient()` singleton; all Amplify CRUD calls
- `lib/write-queue.ts` — `getWriteQueue()` singleton; queues mutations with retry
- `lib/sync-store.ts` — runtime sync state: `workspaceId`, `workspaceGroup`, `status`, `userEmail`, `lastSyncedAt`
- `lib/lambda-client.ts` — wrappers for Lambda-backed mutations (`createWorkspace`, `acceptInvite`, `generateInviteCode`, `removeMember`)
- `lib/use-amplify-data.ts` — hook that loads workspace data into the store on mount

**Workspace model:**

- Each workspace maps to a Cognito Group (`workspace-{uuid}`)
- All financial models include `workspaceGroup: string` and use `allow.groupDefinedIn('workspaceGroup')`
- Max 2 members per workspace (enforced in `acceptInvite` Lambda)
- `UserProfile` stores `cognitoSub`, `displayName`, `email`, `avatarColor`, `workspaceGroup`

**Schema:** `amplify/data/resource.ts` — models: `Workspace`, `UserProfile`, `Invite`, `Category`, `CreditCard`, `MonthlyData`, `Income`, `Expense`, `Installment`

**Smart sync:** On mount/focus, compares `Workspace.lastActivityAt` against `lastSyncedAt` — re-fetches only when cloud is newer.

**Upload order** (foreign key constraints): Categories/CreditCards/MonthlyData → Incomes/Expenses/Installments

### Testing

Unit tests live in `__tests__/` (Vitest + jsdom). All tests requiring i18n must use the custom render wrapper from `__tests__/test-utils.tsx` instead of `@testing-library/react` directly:

```typescript
import { render, screen } from '@/__tests__/test-utils'
// This wraps with NextIntlClientProvider using mock Portuguese messages
```

E2E tests use Playwright (`test:e2e`); they are excluded from Vitest runs.

### Styling

- Tailwind CSS v4 via PostCSS plugin (no `tailwind.config.*` file)
- shadcn/ui (New York variant) — consume from `components/ui/`, never create custom primitives
- CSS variables for theming in `app/globals.css`
- `cn()` utility (clsx + tailwind-merge) for conditional classes

### Path Aliases

```typescript
@/components → /components
@/lib        → /lib
@/hooks      → /hooks
@/           → / (project root)
```

## Development Guidelines

### Adding Features

- **New categories**: Categories are now user-configurable in the store — add system defaults in `expense-store.ts` (`defaultCategories`)
- **New translations**: Add keys to both `messages/en.json` and `messages/pt.json`
- **New forms**: Follow `expense-form.tsx` pattern — Dialog wrapper, controlled local state, submit to store
- **New charts**: Add to `dashboard-view.tsx` using recharts; labels must come from i18n messages
- **New formatters**: Use `lib/formatters.ts`; pass locale from component context

### Type Conventions

- Use `type` keyword, not `interface`
- All store types exported from `lib/expense-store.ts`
- Component props must be explicitly typed

## Vercel Analytics

`@vercel/analytics` is in the root layout. Do not remove it.
