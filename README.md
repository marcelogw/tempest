# Tempest

Personal expense management application for tracking income, expenses, investments, and savings across months.

## Features

- 📊 **Dashboard View** - 6-month analytics with visual charts
- 💰 **Monthly View** - Detailed monthly expense tracking
- 💳 **Credit Card Installments** - Multi-month installment tracking
- 📈 **Category Breakdown** - Expense analysis by category
- 💾 **Local Storage** - All data persisted in browser
- 🌓 **Dark Mode** - Theme support with next-themes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **State**: Zustand with localStorage persistence
- **Charts**: Recharts
- **Testing**: Vitest (unit), Playwright (e2e)

## Getting Started

### Prerequisites

- Node.js 18+ or compatible runtime
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:marcelogw/tempest.git
cd tempest

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint

# Testing
npm run test         # Run unit tests (Vitest)
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run e2e tests (Playwright)
npm run test:e2e:ui  # Run e2e tests with UI
npm run test:all     # Run all tests
```

## Project Structure

```
tempest/
├── app/                    # Next.js App Router pages
├── components/
│   ├── expense/           # Domain-specific components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── expense-store.ts   # Zustand store (single source of truth)
│   └── utils.ts           # Utility functions
├── __tests__/             # Unit tests (Vitest)
├── e2e/                   # E2E tests (Playwright)
└── public/                # Static assets
```

## State Management

The application uses a centralized Zustand store (`lib/expense-store.ts`) with localStorage persistence:

- **Monthly data**: Income, expenses, investments, savings (keyed by YYYY-MM)
- **Installments**: Credit card installment tracking
- **Current month**: Active month for views

All components access state through the `useExpenseStore()` hook.

## Expense Categories

- Credit Card
- Groceries
- Utilities
- Entertainment
- Transportation
- Healthcare
- Dining
- Shopping
- Subscriptions
- Installments
- Other

## Supported Credit Cards

- Nubank Primary
- Nubank MA
- Mercado Pago
- Itaú

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs and issues
- 💡 Suggest new features or improvements
- 🔧 Submit pull requests
- 📖 Improve documentation

Please ensure your code follows the existing patterns and includes appropriate tests.
