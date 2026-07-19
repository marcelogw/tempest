/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AppSidebar } from '@/components/expense/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useSyncStore } from '@/lib/sync-store'

// Mock dependencies
vi.mock('@/lib/sync-store', () => ({
  useSyncStore: vi.fn(),
}))

vi.mock('@/components/workspace/workspace-gate', () => ({
  useWorkspaceGate: () => ({ status: 'connected' }),
}))

vi.mock('@/lib/expense-store', () => ({
  useExpenseStore: () => ({
    currentYear: 2026,
    currentMonth: 7,
    availableYears: [2026],
    expenses: [],
    updateTheme: vi.fn(),
    themeColor: 'zinc',
  }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/lib/adapters/context', () => ({
  useAdapterContext: () => ({ isConfigured: true }),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders visitor fallback when user is not authenticated', () => {
    vi.mocked(useSyncStore).mockImplementation((selector: any) =>
      selector
        ? selector({ userName: null, workspaceId: 'local' })
        : { userName: null, workspaceId: 'local' }
    )

    render(
      <SidebarProvider>
        <AppSidebar
          activeView="dashboard"
          onViewChange={() => {}}
          currentYear="2026"
          availableYears={['2026']}
          onYearChange={() => {}}
        />
      </SidebarProvider>
    )

    expect(screen.getByText('V')).toBeInTheDocument()
    expect(screen.getByText('Visitante')).toBeInTheDocument()
  })

  it('renders user info when authenticated', () => {
    vi.mocked(useSyncStore).mockImplementation((selector: any) =>
      selector
        ? selector({ userName: 'teste@example.com', workspaceId: 'cloud-id' })
        : { userName: 'teste@example.com', workspaceId: 'cloud-id' }
    )

    render(
      <SidebarProvider>
        <AppSidebar
          activeView="dashboard"
          onViewChange={() => {}}
          currentYear="2026"
          availableYears={['2026']}
          onYearChange={() => {}}
        />
      </SidebarProvider>
    )

    // Capitalized first letter of email
    expect(screen.getByText('T')).toBeInTheDocument()
    expect(screen.getByText('teste@example.com')).toBeInTheDocument()
  })
})
