import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { YearSelector } from '@/components/expense/year-selector'

describe('YearSelector', () => {
  it('calls onYearChange with next year when next button is clicked', () => {
    const onYearChange = vi.fn()
    render(
      <YearSelector
        currentYear="2026"
        availableYears={['2025', '2026', '2027']}
        onYearChange={onYearChange}
      />
    )

    // There are two buttons, the second one is next (ChevronRight)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[buttons.length - 1]) // Usually next button is last

    expect(onYearChange).toHaveBeenCalledWith('2027')
  })

  it('calls onYearChange with prev year when prev button is clicked', () => {
    const onYearChange = vi.fn()
    render(
      <YearSelector
        currentYear="2026"
        availableYears={['2025', '2026', '2027']}
        onYearChange={onYearChange}
      />
    )

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0]) // Usually prev button is first

    expect(onYearChange).toHaveBeenCalledWith('2025')
  })
})
