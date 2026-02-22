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

`lib/expense-store.ts` is the **single source of truth** for all financial data, persisted to localStorage. Key shapes:

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
- Middleware: `middleware.ts` reads `NEXT_LOCALE` cookie or Accept-Language header, sets `x-next-intl-locale`
- Default locale: `pt`

All new user-facing strings must be added to **both** message files. Use `useTranslations()` from `next-intl` in components.

### Formatting Utilities

`lib/formatters.ts` provides locale-aware formatting:

- `formatCurrency(value, locale, currency)` — full currency format
- `formatShortCurrency(value, locale, currency)` — compact (e.g., `R$1.5k`)
- `formatPercentage(value, locale, decimals)`
- `formatCurrencyBRL()` / `formatShortCurrencyBRL()` — **deprecated** wrappers, avoid in new code

### AWS Amplify Backend Sync

`lib/sync-manager.ts` handles optional cloud sync via AWS Amplify Gen 2:

- Schema defined in `amplify/data/resource.ts` — models: `Category`, `CreditCard`, `MonthlyData`, `Income`, `Expense`, `Installment`
- Auth in `amplify/auth/resource.ts` — owner-based authorization on all models
- Upload order matters (foreign key constraints): Categories/CreditCards/MonthlyData → Incomes/Expenses/Installments
- `SyncManager` is a singleton (`getSyncManager()`); sync state is in `lib/sync-store.ts`
- Download/merge (Phase 1.1) is not yet implemented

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
