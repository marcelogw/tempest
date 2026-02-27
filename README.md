# Tempest

Personal expense management application for tracking income, expenses, investments, and savings. Built with a cloud-first architecture — data lives in AWS Amplify, localStorage serves as a read cache.

## Features

- **Dashboard** — 6-month analytics with visual charts and summary statistics
- **Monthly View** — Detailed income and expense tracking per month
- **Credit Card Installments** — Multi-month installment tracking across cards
- **Category Management** — User-configurable categories with drag-to-reorder
- **Workspace Collaboration** — Share your finances with one other person via invite codes
- **Bilingual** — English and Portuguese (Brazil), detected automatically from browser/cookie

## Tech Stack

| Layer     | Technology                                         |
| --------- | -------------------------------------------------- |
| Framework | Next.js 16 (App Router)                            |
| UI        | React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui |
| State     | Zustand 5 + Immer                                  |
| Cloud     | AWS Amplify Gen 2, Cognito (Google OAuth)          |
| i18n      | next-intl 4 (cookie-based, no URL prefixes)        |
| Charts    | Recharts 2                                         |
| Testing   | Vitest 4 (unit), Playwright 1.58 (E2E)             |

## Architecture

**Cloud-only:** Amplify is the source of truth. localStorage is a read cache for instant UI load.

**Workspace model:** each workspace maps to a Cognito Group (`workspace-{uuid}`). All financial data belongs to the workspace, not the individual user. Both members have equal read/write access. Maximum 2 members per workspace.

**Write queue:** mutations update Zustand immediately (optimistic UI), then are queued and sent to Amplify with retry in the background.

**Smart sync:** on mount and on `window.focus`, the app compares `Workspace.lastActivityAt` against the local `lastSyncedAt`. Re-fetches only when the cloud is newer — no polling.

## Getting Started

### Prerequisites

- Node.js ≥ 20
- An AWS account with Amplify configured
- Google OAuth credentials (Client ID + Secret)

### Installation

```bash
git clone git@github.com:marcelogw/tempest.git
cd tempest
npm install
```

### Local development

Create `.env.local`:

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

Open [http://localhost:3000](http://localhost:3000).

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

### First access

1. Unauthenticated users are redirected to `/auth` (Google sign-in)
2. After sign-in, `WorkspaceGate` checks for an existing workspace
3. Users without a workspace are redirected to `/onboarding`

### Onboarding

- **Create workspace** — enter a name → `createWorkspace` Lambda creates the Cognito Group and default categories
- **Join workspace** — enter an invite code → `acceptInvite` Lambda validates the code and adds the user to the group

### Inviting a second member

1. Workspace owner opens Settings → clicks "Generate invite"
2. `generateInviteCode` Lambda creates a time-limited invite record and returns a shareable URL
3. Guest opens the URL, signs in, and accepts — they immediately see all workspace data on next sync

### Removing a member

Owner opens Settings → Members → removes the guest. `removeMember` Lambda removes the user from the Cognito Group.

## Project Structure

```
tempest/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Main dashboard (requires workspace)
│   ├── onboarding/page.tsx     # Create or join a workspace
│   ├── settings/page.tsx       # Workspace, preferences, data management
│   ├── invite/[inviteId]/      # Accept an invite
│   └── auth/                   # Google OAuth callback
│
├── components/
│   ├── expense/                # Domain components (views, forms, charts)
│   └── workspace/              # WorkspaceGate, InviteDialog, MembersList
│
├── lib/
│   ├── expense-store.ts        # Zustand store — runtime source of truth
│   ├── workspace-client.ts     # Amplify CRUD singleton
│   ├── write-queue.ts          # Mutation queue with retry
│   ├── lambda-client.ts        # Lambda mutation wrappers
│   ├── sync-store.ts           # Sync state (workspaceId, lastSyncedAt)
│   └── use-amplify-data.ts     # Hook: loads workspace data on mount
│
├── amplify/
│   ├── data/resource.ts        # Schema (Workspace, UserProfile, Invite + 6 financial models)
│   ├── auth/resource.ts        # Cognito + Google OAuth config
│   └── functions/              # create-workspace, generate-invite-code, accept-invite, remove-member
│
├── messages/
│   ├── en.json                 # English translations
│   └── pt.json                 # Portuguese (Brazil) translations
│
└── __tests__/                  # Unit tests (Vitest + jsdom)
```

## License

MIT
