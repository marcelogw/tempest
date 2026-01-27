import { describe, it, expect } from 'vitest'
import { formatCurrencyBRL, formatShortCurrencyBRL, categoryLabels } from '@/lib/expense-store'

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

describe('Category Labels', () => {
  it('should have all category labels in Portuguese', () => {
    expect(categoryLabels.credit_card).toBe('Cartao de Credito')
    expect(categoryLabels.groceries).toBe('Supermercado')
    expect(categoryLabels.utilities).toBe('Contas')
    expect(categoryLabels.entertainment).toBe('Entretenimento')
    expect(categoryLabels.transportation).toBe('Transporte')
    expect(categoryLabels.healthcare).toBe('Saude')
    expect(categoryLabels.dining).toBe('Restaurantes')
    expect(categoryLabels.shopping).toBe('Compras')
    expect(categoryLabels.subscriptions).toBe('Assinaturas')
    expect(categoryLabels.installment).toBe('Parcelamento')
    expect(categoryLabels.other).toBe('Outros')
  })

  it('should have labels for all category types', () => {
    const categories = [
      'credit_card',
      'groceries',
      'utilities',
      'entertainment',
      'transportation',
      'healthcare',
      'dining',
      'shopping',
      'subscriptions',
      'installment',
      'other',
    ]

    categories.forEach((category) => {
      expect(categoryLabels[category as keyof typeof categoryLabels]).toBeDefined()
      expect(categoryLabels[category as keyof typeof categoryLabels].length).toBeGreaterThan(0)
    })
  })
})
