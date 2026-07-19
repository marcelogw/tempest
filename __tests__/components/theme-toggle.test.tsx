/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from 'next-themes'

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}))

describe('ThemeToggle', () => {
  it('toggles theme when clicked', async () => {
    const setThemeMock = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock,
    } as any)

    const user = userEvent.setup()
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(setThemeMock).toHaveBeenCalledWith('dark')
  })

  it('toggles to light when currently dark', async () => {
    const setThemeMock = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: setThemeMock,
    } as any)

    const user = userEvent.setup()
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(setThemeMock).toHaveBeenCalledWith('light')
  })
})
