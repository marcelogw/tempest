# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tempest** - Personal expense management application for tracking income, expenses, investments, and savings across months. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## Essential Commands

### Development

```bash
npm run dev          # Start development server
npm run build        # Production build (TypeScript errors ignored)
npm start           # Start production server
npm run lint        # Run ESLint (currently not configured)
```

Note: TypeScript validation is disabled during builds (`ignoreBuildErrors: true` in next.config.mjs).

## Architecture

### State Management - Zustand Store Pattern

The application uses a single centralized Zustand store (`lib/expense-store.ts`) with localStorage persistence for all financial data. This is the **single source of truth** for:

- **Monthly data**: Income, expenses (fixed/variable), investments, savings per month (keyed by YYYY-MM)
- **Installments**: Credit card installment tracking across multiple months
- **Current month**: Active month for views and operations

**Critical patterns**:

- All month data access goes through `getMonthData(month)` which auto-initializes missing months
- Never mutate store state directly - use provided actions (`addExpense`, `updateIncome`, etc.)
- Store includes sample data generator for last 6 months (useful for development)
- Helper functions: `getMonthDiff()`, `getMonthFromOffset()` for month arithmetic

### Component Organization

```
components/
├── expense/           # Domain-specific expense tracking components
│   ├── dashboard-view.tsx    # 6-month analytics with charts (recharts)
│   ├── monthly-view.tsx      # Single month detailed view
│   ├── expense-list.tsx      # Display/edit expense items
│   ├── expense-form.tsx      # Add new expense dialog
│   ├── income-input.tsx      # Month income input
│   ├── installments.tsx      # Credit card installment manager
│   ├── category-breakdown.tsx # Expense category pie chart
│   ├── summary-cards.tsx     # Summary statistics cards
│   ├── month-selector.tsx    # Month navigation
│   └── sidebar.tsx           # Main navigation (Dashboard/Monthly toggle)
├── ui/                # shadcn/ui components (60+ components)
└── theme-provider.tsx # next-themes wrapper
```

**Component patterns**:

- All expense components are client components (`'use client'`)
- Components access store via `useExpenseStore()` hook
- Form components use controlled inputs with local state, then submit to store
- Charts use recharts library with Portuguese labels and BRL currency formatting

### Data Model

**Expense Categories**: `credit_card`, `groceries`, `utilities`, `entertainment`, `transportation`, `healthcare`, `dining`, `shopping`, `subscriptions`, `installment`, `other`

**Credit Cards**: `nubank_pri`, `nubank_ma`, `mercadopago`, `itau`

**Expense Types**:

- `fixed` - recurring monthly (rent, insurance, subscriptions)
- `variable` - one-time or irregular expenses

**Installments**: Separate tracking for multi-month credit card installments with auto-calculation of which installments apply to each month.

### Styling System

- **Tailwind CSS v4** (PostCSS plugin, not traditional config)
- **shadcn/ui** design system (New York style variant)
- CSS variables for theming in `app/globals.css`
- `cn()` utility (clsx + tailwind-merge) for conditional classes
- All colors and spacing use design tokens, not hardcoded values

### Path Aliases

```typescript
@/components → /components
@/lib        → /lib
@/hooks      → /hooks
@/           → / (project root)
```

### Type Safety

- Strict TypeScript enabled but build errors ignored
- All store types exported from `lib/expense-store.ts`
- Component props should be explicitly typed
- Use `type` keyword for type aliases, not `interface` (matches codebase style)

## Development Guidelines

### When Adding Features

1. **New expense categories**: Update `ExpenseCategory` type, `categoryLabels`, and `categoryColors` in `expense-store.ts`
2. **New charts/analytics**: Add to `dashboard-view.tsx`, use recharts library
3. **New forms**: Follow pattern in `expense-form.tsx` (Dialog wrapper, controlled inputs, store submission)
4. **New UI components**: Use shadcn/ui components from `components/ui/`, never create custom primitives

### Store Modifications

- Always use immer-friendly patterns (store uses Zustand middleware)
- Month keys must be `YYYY-MM` format (e.g., "2026-01")
- Call `initializeMonth()` before accessing month data in new contexts
- Installment calculations rely on `getMonthDiff()` - don't bypass this logic

### Internationalization

All user-facing text is in **Brazilian Portuguese**:

- Currency: BRL (R$) using `formatCurrencyBRL()` and `formatShortCurrencyBRL()`
- Date formats: Use `pt-BR` locale
- Labels and descriptions: Portuguese only

## Vercel Analytics

The app includes `@vercel/analytics` integration in the root layout. This is production-ready and should not be removed.
