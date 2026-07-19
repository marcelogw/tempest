import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TempestLogo, TempestIconMark } from '@/components/brand/tempest-logo'

describe('TempestLogo', () => {
  it('renders default variant (full)', () => {
    const { container } = render(<TempestLogo />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    // Default full logo has width 220 for md
    expect(svg).toHaveAttribute('width', '220')
  })

  it('renders icon variant', () => {
    const { container } = render(<TempestLogo variant="icon" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '48')
  })

  it('renders wordmark variant', () => {
    const { container } = render(<TempestLogo variant="wordmark" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '172')
  })

  it('renders animated and different color schemes', () => {
    const { container } = render(<TempestLogo animated colorScheme="mono-dark" size="lg" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('tempest-logo-animated')
    expect(svg).toHaveAttribute('width', '280') // lg full
  })
})

describe('TempestIconMark', () => {
  it('renders', () => {
    const { container } = render(<TempestIconMark animated />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
