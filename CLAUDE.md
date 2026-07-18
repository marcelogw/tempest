# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.

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
The pre-push hook runs `npm run test:coverage` to enforce the 75% coverage threshold.

### Updating dependencies

When adding or bumping any package in `package.json`, **always** regenerate the lock file with:

```bash
npm install --package-lock-only --ignore-scripts
```

**Never** rely on a plain `npm install` (with existing `node_modules`) to update the lock file — it only updates what changed and leaves transitive dependencies incomplete, causing `npm ci` to fail in CI with EUSAGE errors.

After regenerating, verify locally before pushing:

```bash
npm ci --ignore-scripts   # must exit 0
npm install               # restore node_modules for local dev
```

## Architecture

### State Management — Zustand Store

`lib/expense-store.ts` is the **runtime source of truth** for all financial data. In local mode, localStorage is the persistence layer. In cloud mode, Amplify is the source of truth and localStorage acts as a read cache. Key shapes:

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

### Adapter System

Tempest abstracts Storage and Auth behind swappable interfaces so it can run without AWS. The active pair is set in `tempest.config.yml` (or env vars `TEMPEST_STORAGE` / `TEMPEST_AUTH`, which take precedence):

| `TEMPEST_STORAGE` | `TEMPEST_AUTH` | Mode                              |
| ----------------- | -------------- | --------------------------------- |
| `local` (default) | `none`         | Single-user, zero config          |
| `amplify`         | `amplify`      | Multi-user, AWS Amplify + Cognito |

**Key files:**

- `lib/adapters/storage-adapter.ts` — `StorageAdapter` interface (17 methods); `CollaborativeStorageAdapter` extends it with `acceptInvite`, `generateInviteCode`, `removeMember`
- `lib/adapters/auth-adapter.ts` — `AuthAdapter` interface
- `lib/adapters/registry.ts` — `getStorage()` / `getAuth()` / `getCollaborativeStorage()` singletons
- `lib/adapters/context.tsx` — `AdapterProvider`; initializes adapters on mount, starts write queue
- `lib/adapters/local/` — `LocalStorageAdapter` + `NoAuthAdapter` (default, reads from Zustand store)
- `lib/adapters/amplify/` — `AmplifyStorageAdapter` + `AmplifyAuthAdapter` (delegates to `workspace-client` and `lambda-client`)

**Rules:**

- Application code must only use `getStorage()` / `getAuth()` from the registry — never import Amplify directly
- Collaborative features (`acceptInvite`, `generateInviteCode`, `removeMember`) require `getCollaborativeStorage()` — TypeScript prevents calling them via the base `getStorage()`
- `write-queue.ts` dispatch uses `getStorage()` from the registry

### Cloud Mode — Amplify Gen 2

Only relevant when `TEMPEST_STORAGE=amplify`.

**Key files:**

- `lib/workspace-client.ts` — `getAmplifyClient()` singleton; all Amplify CRUD calls (used by `AmplifyStorageAdapter`)
- `lib/write-queue.ts` — queues mutations with retry; dispatch delegates to `getStorage()`
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

#### Mandatory testing rules — apply to every feature

These are non-negotiable. A feature is not done until all of these pass:

1. **Run `npm run quality` and `npm run test` before every push.** Never skip. The pre-commit hook runs `quality` and the pre-push hook runs `test:coverage`, but run them manually before marking work as complete.

2. **Every new component that uses a Radix primitive (Select, Dialog, Sheet, AlertDialog, DropdownMenu) must have at least one render test** that opens/activates the component and asserts it renders without crashing. Radix enforces runtime invariants (e.g. `SelectItem` cannot have `value=""`) that TypeScript does not catch — only a render test will surface them.

   Minimum test pattern:

   ```typescript
   it('renders without crashing', async () => {
     render(<MyComponent open={true} ... />)
     expect(screen.getByRole('dialog')).toBeInTheDocument()
   })
   ```

3. **Every new route/screen must have at least one Playwright E2E smoke test** that navigates to the screen, performs the primary user action, and asserts no crash occurs. A crash in production that could have been caught by opening the page in a test is unacceptable.

4. **Store logic extracted into utility files (e.g. `lib/goal-utils.ts`) must have unit tests** covering all branches. Use `vi.setSystemTime()` for any function that calls `new Date()`.

5. **Do not rely on the 75% coverage threshold as a proxy for test completeness.** The threshold only counts files that are imported by at least one test — new files with zero tests are invisible to it. Write tests because the logic requires it, not to satisfy a number.

### UI & Design Rules

#### Before building any new form or modal

1. **Read at least 2 existing similar components first.** For forms: read `expense-form.tsx` and `income-input.tsx`. For dialogs: read `expense-edit-dialog.tsx`. Copy their structure, spacing, and field patterns — do not invent a new layout from scratch.

2. **Use only shadcn/ui primitives.** Never create custom UI components for things shadcn already solves — color pickers, icon selectors, dropdowns, date inputs. Use `Select`, `Popover`, `Command`, `Input`, `Checkbox` from `components/ui/`. Custom primitives produce inconsistent UX and sizing.

3. **Follow these field conventions:**
   - Currency inputs: `type="number" step="1" min="0"` with `R$` prefix span — never `step="0.01"` (useless micro-increments)
   - Date/deadline selectors: use a single `<Input type="month">` or constrain `<Select>` options to future dates only — never allow past dates for deadlines
   - Text inputs that are not login fields: always add `autoComplete="off"` to prevent password managers from hijacking them

#### Visual validation — mandatory before marking UI work as done

4. **Take a Playwright screenshot and review it before pushing.** The AI has no eyes by default — a screenshot closes the feedback loop. Process:

   ```bash
   # 1. start dev server in background
   npm run dev &
   # 2. open the component/screen in the browser via Playwright
   # 3. take screenshot, review visually
   # 4. fix issues, repeat until acceptable
   # 5. kill dev server
   ```

   Use `npx playwright screenshot` or a quick Playwright script. A form or modal is not done until a screenshot confirms it looks consistent with the rest of the app.

5. **Compare against existing screens.** Before calling UI done, open an existing similar screen (e.g. the expense form) alongside the new one and verify spacing, font sizes, and component sizes are consistent.

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

- Use `type` keyword, not `interface` — exception: adapter contracts (`StorageAdapter`, `AuthAdapter`, `CollaborativeStorageAdapter`) use `interface` intentionally
- All store types exported from `lib/expense-store.ts`
- Component props must be explicitly typed

## Vercel Analytics

`@vercel/analytics` is in the root layout. Do not remove it.

## Code Navigation & Editing

Use Serena MCP tools for code navigation and editing: `find_symbol`, `get_symbols_overview`, `replace_symbol_body`, `find_referencing_symbols`, `insert_after_symbol`. Use `Read`/`Grep`/`Edit` only for line-level changes within a symbol.
