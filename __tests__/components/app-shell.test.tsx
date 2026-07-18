import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { AppShell } from '@/components/expense/app-shell'
import ptMessages from '@/messages/pt.json'

function mockMatchMedia(isMobile: boolean) {
  window.innerWidth = isMobile ? 375 : 1024
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: isMobile,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

const baseProps = {
  activeView: 'dashboard' as const,
  onViewChange: vi.fn(),
  currentYear: '2026',
  availableYears: ['2025', '2026'],
  onYearChange: vi.fn(),
}

describe('AppShell', () => {
  it('renders the desktop sidebar without crashing', () => {
    mockMatchMedia(false)

    render(
      <AppShell {...baseProps}>
        <div>conteudo</div>
      </AppShell>,
      { messages: ptMessages }
    )

    expect(screen.getAllByText('Painel').length).toBeGreaterThan(0)
    expect(screen.getByText('conteudo')).toBeInTheDocument()
  })

  it('opens the mobile Sheet drawer without crashing', async () => {
    mockMatchMedia(true)
    const user = userEvent.setup()

    render(
      <AppShell {...baseProps}>
        <div>conteudo</div>
      </AppShell>,
      { messages: ptMessages }
    )

    await user.click(document.querySelector('[data-sidebar="trigger"]') as HTMLElement)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getAllByText('Painel').length).toBeGreaterThan(0)
  })
})
