# Tempest

[![Quality](https://github.com/marcelogw/tempest/actions/workflows/quality.yml/badge.svg)](https://github.com/marcelogw/tempest/actions/workflows/quality.yml)
[![Tests](https://github.com/marcelogw/tempest/actions/workflows/test.yml/badge.svg)](https://github.com/marcelogw/tempest/actions/workflows/test.yml)
[![E2E](https://github.com/marcelogw/tempest/actions/workflows/e2e.yml/badge.svg)](https://github.com/marcelogw/tempest/actions/workflows/e2e.yml)
[![Coverage](https://codecov.io/gh/marcelogw/tempest/branch/main/graph/badge.svg)](https://codecov.io/gh/marcelogw/tempest)
[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/v0-tempest)](https://v0-tempest.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)

Personal expense management application for tracking income, expenses, investments, and savings. Runs locally without any cloud account (default) or against AWS Amplify for multi-user collaboration.

## Features

- **Dashboard** — 6-month analytics with visual charts and summary statistics
- **Monthly View** — Detailed income and expense tracking per month
- **Credit Card Installments** — Multi-month installment tracking across cards
- **Category Management** — User-configurable categories with drag-to-reorder
- **Goals & Savings** — Define financial goals with a target amount and optional deadline; track contributions (confirmed or forecast) with a dual-band progress bar; monitor monthly pacing and on-track/behind/overdue status
- **Workspace Collaboration** — Share your finances with one other person via invite codes
- **Monthly Notes** — Annotate months with contextual notes: optional monetary value (payable/receivable), event date, and a persistent flag so pending notes carry forward to future months until marked done
- **Bilingual** — English and Portuguese (Brazil), detected automatically from browser/cookie

## Tech Stack

| Layer     | Technology                                           |
| --------- | ---------------------------------------------------- |
| Framework | Next.js 16 (App Router)                              |
| UI        | React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui   |
| State     | Zustand 5 + Immer                                    |
| Cloud     | AWS Amplify Gen 2, Cognito (Google OAuth) (optional) |
| i18n      | next-intl 4 (cookie-based, no URL prefixes)          |
| Charts    | Recharts 2                                           |
| Testing   | Vitest 4 (unit), Playwright 1.58 (E2E)               |

## Architecture

Tempest runs in two modes:

- **Local** (default) — data stays in your browser. No account required, zero config.
- **Cloud** (optional) — data syncs to AWS Amplify, enabling workspace sharing with one other person. Mutations are applied optimistically and synced in the background. Smart sync on focus prevents unnecessary re-fetches.

## Getting Started

### Prerequisites

- Node.js ≥ 20

### Installation

```bash
git clone git@github.com:marcelogw/tempest.git
cd tempest
npm install
```

### Local mode (default — no cloud account needed)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Data is stored in localStorage. No sign-in required.

### Cloud mode (AWS Amplify + Google OAuth)

Set `tempest.config.yml` to use Amplify:

```yaml
storage: amplify
auth: amplify
```

Create `.env.local` with your OAuth credentials:

```env
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-secret>
```

Start the Amplify sandbox (generates `amplify_outputs.json`):

```bash
npx ampx sandbox
```

Start the dev server:

```bash
npm run dev
```

## Scripts

```bash
npm run dev           # Development server
npm run build         # Production build
npm run quality       # typecheck + lint + format:check (run before committing)

npm run test          # Unit tests (Vitest)
npm run test:coverage # Coverage report (75% threshold enforced)
npm run test:e2e      # E2E tests (Playwright)
npm run test:all      # Unit + E2E
```

Husky runs ESLint + Prettier automatically on pre-commit via lint-staged.

## User Flows

### Local mode

Open the app and start tracking immediately — no sign-in or setup required. All data lives in your browser.

### Cloud mode

#### First access

1. Unauthenticated users are redirected to `/auth` (Google sign-in)
2. After sign-in, `WorkspaceGate` checks for an existing workspace
3. Users without a workspace are redirected to `/onboarding`

#### Onboarding

- **Create workspace** — enter a name → workspace is provisioned and default categories are created
- **Join workspace** — enter an invite code → user is added to the shared workspace

#### Inviting a second member

1. Workspace owner opens Settings → clicks "Generate invite"
2. A time-limited invite URL is created and shared
3. Guest opens the URL, signs in, and accepts — they immediately see all workspace data on next sync

#### Removing a member

Owner opens Settings → Members → removes the guest.

## License

MIT
