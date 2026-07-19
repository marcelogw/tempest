/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

vi.mock('@/components/ui/avatar', async (importOriginal) => {
  const actual = await importOriginal<any>()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...actual,
    AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="avatar-image" />,
  }
})

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

  it('renders user info and picture when authenticated', () => {
    vi.mocked(useSyncStore).mockImplementation((selector: any) =>
      selector
        ? selector({
            userName: 'teste@example.com',
            userPicture: 'avatar.png',
            workspaceId: 'cloud-id',
          })
        : { userName: 'teste@example.com', userPicture: 'avatar.png', workspaceId: 'cloud-id' }
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

    // Capitalized first letter of email (fallback) might still render, but AvatarImage should be present.
    // We can just check that the displayName is rendered
    expect(screen.getByText('teste@example.com')).toBeInTheDocument()

    // Check if AvatarImage is rendered by checking the alt text
    const avatarImg = screen.getByAltText('teste@example.com')
    expect(avatarImg).toBeInTheDocument()
    expect(avatarImg).toHaveAttribute('src', 'avatar.png')
  })

  it('calls onViewChange when a nav item is clicked', async () => {
    vi.mocked(useSyncStore).mockImplementation((selector: any) =>
      selector
        ? selector({ userName: null, workspaceId: 'local' })
        : { userName: null, workspaceId: 'local' }
    )

    const onViewChangeMock = vi.fn()
    const user = userEvent.setup()

    render(
      <SidebarProvider>
        <AppSidebar
          activeView="dashboard"
          onViewChange={onViewChangeMock}
          currentYear="2026"
          availableYears={['2026']}
          onYearChange={() => {}}
        />
      </SidebarProvider>
    )

    const button = screen.getByText('ui.sidebar.monthlyView')
    await user.click(button)

    expect(onViewChangeMock).toHaveBeenCalledWith('monthly')
  })

  it('calls onViewChange when settings is clicked', async () => {
    vi.mocked(useSyncStore).mockImplementation((selector: any) =>
      selector
        ? selector({ userName: null, workspaceId: 'local' })
        : { userName: null, workspaceId: 'local' }
    )

    const onViewChangeMock = vi.fn()
    const user = userEvent.setup()

    render(
      <SidebarProvider>
        <AppSidebar
          activeView="dashboard"
          onViewChange={onViewChangeMock}
          currentYear="2026"
          availableYears={['2026']}
          onYearChange={() => {}}
        />
      </SidebarProvider>
    )

    const button = screen.getByText('ui.sidebar.settings')
    await user.click(button)

    expect(onViewChangeMock).toHaveBeenCalledWith('settings')
  })
})
