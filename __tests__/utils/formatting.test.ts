import { describe, it, expect } from 'vitest'
import { formatCurrencyBRL, formatShortCurrencyBRL, DEFAULT_CATEGORIES } from '@/lib/expense-store'
import {
  formatCurrency,
  formatShortCurrency,
  formatNumber,
  formatPercentage,
} from '@/lib/formatters'

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
  it('should have all default categories with English IDs (i18n keys)', () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(11)

    const groceries = DEFAULT_CATEGORIES.find((c) => c.id === 'groceries')
    expect(groceries).toBeDefined()
    expect(groceries?.customLabel).toBeUndefined() // System categories don't have customLabel

    const transportation = DEFAULT_CATEGORIES.find((c) => c.id === 'transportation')
    expect(transportation).toBeDefined()
    expect(transportation?.customLabel).toBeUndefined()

    const other = DEFAULT_CATEGORIES.find((c) => c.id === 'other')
    expect(other).toBeDefined()
    expect(other?.isSystem).toBe(true)
    expect(other?.customLabel).toBeUndefined()
  })

  it('should have required properties for all categories', () => {
    DEFAULT_CATEGORIES.forEach((category) => {
      expect(category.id).toBeDefined()
      expect(category.id.length).toBeGreaterThan(0)
      // System categories don't have customLabel (they use i18n via id)
      expect(category.customLabel).toBeUndefined()
      expect(category.color).toMatch(/^#[0-9a-f]{6}$/i)
      expect(typeof category.order).toBe('number')
      expect(typeof category.isSystem).toBe('boolean')
    })
  })

  it('should have "other" as system category', () => {
    const systemCategories = DEFAULT_CATEGORIES.filter((c) => c.isSystem)
    expect(systemCategories).toHaveLength(1)
    expect(systemCategories[0].id).toBe('other')
  })
})

describe('formatCurrency', () => {
  it('should format BRL by default', () => {
    expect(formatCurrency(1500)).toBe('R$\u00A01.500')
  })

  it('should format USD', () => {
    const result = formatCurrency(1500, 'en-US', 'USD')
    expect(result).toContain('1,500')
  })

  it('should format EUR', () => {
    const result = formatCurrency(2000, 'en', 'EUR')
    expect(result).toContain('2,000')
  })
})

describe('formatShortCurrency — millions', () => {
  it('should abbreviate values >= 1000000 with M suffix', () => {
    expect(formatShortCurrency(1500000)).toBe('R$1.5M')
    expect(formatShortCurrency(2000000)).toBe('R$2.0M')
  })

  it('should use correct symbol for USD millions', () => {
    expect(formatShortCurrency(1000000, 'en-US', 'USD')).toBe('$1.0M')
  })

  it('should use correct symbol for EUR millions', () => {
    expect(formatShortCurrency(1000000, 'en', 'EUR')).toBe('€1.0M')
  })
})

describe('formatNumber', () => {
  it('should format a number with pt-BR locale by default', () => {
    const result = formatNumber(1234567)
    expect(result).toBe('1.234.567')
  })

  it('should format with en-US locale', () => {
    const result = formatNumber(1234567, 'en-US')
    expect(result).toBe('1,234,567')
  })

  it('should respect custom Intl options', () => {
    const result = formatNumber(1234.5, 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    expect(result).toBe('1,234.50')
  })
})

describe('formatPercentage', () => {
  it('should format a percentage with 1 decimal by default', () => {
    const result = formatPercentage(15.5)
    expect(result).toContain('15')
  })

  it('should format 0% correctly', () => {
    const result = formatPercentage(0)
    expect(result).toContain('0')
  })

  it('should format 100% correctly', () => {
    const result = formatPercentage(100)
    expect(result).toContain('100')
  })

  it('should respect decimals parameter', () => {
    const result = formatPercentage(50, 'en-US', 2)
    expect(result).toContain('50.00')
  })
})
