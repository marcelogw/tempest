# Contributing to Tempest

Thank you for your interest in contributing. This document covers everything you need to get started.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Conventions](#code-conventions)
- [Testing](#testing)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs](#reporting-bugs)

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm

### Setup

```bash
git clone git@github.com:marcelogw/tempest.git
cd tempest
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs in local mode by default — no cloud account needed.

## Development Workflow

1. **Fork** the repository and create a feature branch from `main`:

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes.** Run quality checks before committing:

   ```bash
   npm run quality   # typecheck + lint + format:check
   npm run test      # unit tests
   ```

3. The pre-commit hook (Husky + lint-staged) runs ESLint and Prettier automatically on staged `*.ts` / `*.tsx` files.

4. **Open a pull request** against `main`. Fill in the PR template.

### Branch naming

| Type     | Pattern                      |
| -------- | ---------------------------- |
| Feature  | `feat/short-description`     |
| Bug fix  | `fix/short-description`      |
| Refactor | `refactor/short-description` |
| Docs     | `docs/short-description`     |

## Code Conventions

### Language

- **TypeScript** everywhere. No `any` unless unavoidable.
- Use `type` keyword for type aliases. Use `interface` only for adapter contracts (`StorageAdapter`, `AuthAdapter`).

### i18n

- All user-facing strings must go through `useTranslations()` from `next-intl`.
- Add keys to **both** `messages/en.json` and `messages/pt.json`.
- Never hardcode Portuguese or English text in components.

### State

- Access monthly data only via `getMonthData(month)` from the store — it auto-initialises missing months.
- Write mutations inside Zustand `set()` using Immer-style updates.

### Formatting

- Currency: use `formatCurrency()` / `formatShortCurrency()` from `@/lib/formatters`.
- Never use the deprecated `formatCurrencyBRL` / `formatShortCurrencyBRL`.

### Adapters

- Application code must only use `getStorage()` / `getAuth()` from `@/lib/adapters/registry`.
- Never import Amplify directly from components or the store.

## Testing

```bash
npm run test              # Unit tests (Vitest)
npm run test:coverage     # Coverage report — 75% threshold enforced
npm run test:e2e          # E2E tests (Playwright)
npm run test:all          # Unit + E2E
```

### Unit tests

- Live in `__tests__/`.
- Components that use i18n must use the custom render wrapper from `__tests__/test-utils.tsx`.
- Store tests must mock `write-queue` and `workspace-client` — see existing tests for the pattern.

### E2E tests

- Live in `e2e/`.
- Workspace data is seeded via `e2e/setup/storage-state.json`.
- Run against a production build (`npm run build` before `npm run test:e2e`).

## Submitting a Pull Request

- Keep PRs focused. One concern per PR.
- Run `npm run quality` and `npm run test` locally before pushing.
- Update both translation files if any UI strings changed.
- The PR template checklist must be completed before review.

## Reporting Bugs

Use the [bug report template](https://github.com/marcelogw/tempest/issues/new?template=bug_report.yml). Include steps to reproduce, expected vs actual behaviour, and your browser/OS.

## License

By contributing you agree that your contributions will be licensed under the [MIT License](./LICENSE).
