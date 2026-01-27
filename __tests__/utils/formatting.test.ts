import { describe, it, expect } from 'vitest'
import { formatCurrencyBRL, formatShortCurrencyBRL, DEFAULT_CATEGORIES } from '@/lib/expense-store'

describe('Currency Formatting', () => {
  describe('formatCurrencyBRL', () => {
    it('should format positive values correctly', () => {
      expect(formatCurrencyBRL(1500)).toBe('R$\u00A01.500')
      expect(formatCurrencyBRL(2500.5)).toBe('R$\u00A02.501')
      expect(formatCurrencyBRL(10000)).toBe('R$\u00A010.000')
    })

    it('should format zero correctly', () => {
      expect(formatCurrencyBRL(0)).toBe('R$\u00A00')
    })

    it('should round to nearest integer (no decimals)', () => {
      expect(formatCurrencyBRL(1500.49)).toBe('R$\u00A01.500')
      expect(formatCurrencyBRL(1500.51)).toBe('R$\u00A01.501')
      expect(formatCurrencyBRL(999.99)).toBe('R$\u00A01.000')
    })

    it('should format large values correctly', () => {
      expect(formatCurrencyBRL(100000)).toBe('R$\u00A0100.000')
      expect(formatCurrencyBRL(1000000)).toBe('R$\u00A01.000.000')
    })

    it('should handle small values', () => {
      expect(formatCurrencyBRL(1)).toBe('R$\u00A01')
      expect(formatCurrencyBRL(99)).toBe('R$\u00A099')
      expect(formatCurrencyBRL(100)).toBe('R$\u00A0100')
    })
  })

  describe('formatShortCurrencyBRL', () => {
    it('should abbreviate values >= 1000', () => {
      expect(formatShortCurrencyBRL(1500)).toBe('R$1.5k')
      expect(formatShortCurrencyBRL(2000)).toBe('R$2.0k')
      expect(formatShortCurrencyBRL(5000)).toBe('R$5.0k')
    })

    it('should not abbreviate values < 1000', () => {
      expect(formatShortCurrencyBRL(999)).toBe('R$999')
      expect(formatShortCurrencyBRL(500)).toBe('R$500')
      expect(formatShortCurrencyBRL(100)).toBe('R$100')
      expect(formatShortCurrencyBRL(0)).toBe('R$0')
    })

    it('should show one decimal place for thousands', () => {
      expect(formatShortCurrencyBRL(1234)).toBe('R$1.2k')
      expect(formatShortCurrencyBRL(5678)).toBe('R$5.7k')
      expect(formatShortCurrencyBRL(9999)).toBe('R$10.0k')
    })

    it('should handle exact thousands', () => {
      expect(formatShortCurrencyBRL(1000)).toBe('R$1.0k')
      expect(formatShortCurrencyBRL(3000)).toBe('R$3.0k')
      expect(formatShortCurrencyBRL(10000)).toBe('R$10.0k')
    })
  })
})

describe('Default Categories', () => {
  it('should have all default categories with labels in Portuguese', () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(11)

    const mercado = DEFAULT_CATEGORIES.find((c) => c.id === 'mercado')
    expect(mercado?.label).toBe('Mercado')

    const transporte = DEFAULT_CATEGORIES.find((c) => c.id === 'transporte')
    expect(transporte?.label).toBe('Transporte')

    const outros = DEFAULT_CATEGORIES.find((c) => c.id === 'outros')
    expect(outros?.label).toBe('Outros')
    expect(outros?.isSystem).toBe(true)
  })

  it('should have required properties for all categories', () => {
    DEFAULT_CATEGORIES.forEach((category) => {
      expect(category.id).toBeDefined()
      expect(category.id.length).toBeGreaterThan(0)
      expect(category.label).toBeDefined()
      expect(category.label.length).toBeGreaterThan(0)
      expect(category.color).toMatch(/^#[0-9a-f]{6}$/i)
      expect(typeof category.order).toBe('number')
      expect(typeof category.isSystem).toBe('boolean')
    })
  })

  it('should have "outros" as system category', () => {
    const systemCategories = DEFAULT_CATEGORIES.filter((c) => c.isSystem)
    expect(systemCategories).toHaveLength(1)
    expect(systemCategories[0].id).toBe('outros')
  })
})
