import { describe, it, expect, beforeEach } from 'vitest'
import { useExpenseStore } from '@/lib/expense-store'

describe('Credit Card Management', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }

    useExpenseStore.setState({
      monthlyData: {},
      currentMonth: '2025-01',
      currentYear: '2025',
      installments: [],
      categories: [],
      creditCards: [],
    })
  })

  describe('addCreditCard', () => {
    it('should add credit card with generated kebab-case ID', () => {
      const { addCreditCard } = useExpenseStore.getState()

      addCreditCard('Nubank Pri', '#8b5cf6', 3000)

      const state = useExpenseStore.getState()
      expect(state.creditCards).toHaveLength(1)
      expect(state.creditCards[0].id).toBe('nubank-pri')
      expect(state.creditCards[0].name).toBe('Nubank Pri')
      expect(state.creditCards[0].color).toBe('#8b5cf6')
      expect(state.creditCards[0].limit).toBe(3000)
      expect(state.creditCards[0].order).toBe(0)
    })

    it('should handle null limit for cards without limit', () => {
      const { addCreditCard } = useExpenseStore.getState()

      addCreditCard('Itaú Sem Limite', '#f97316', null)

      const state = useExpenseStore.getState()
      expect(state.creditCards[0].limit).toBeNull()
    })

    it('should default to null limit if not provided', () => {
      const { addCreditCard } = useExpenseStore.getState()

      addCreditCard('MercadoPago', '#3b82f6')

      const state = useExpenseStore.getState()
      expect(state.creditCards[0].limit).toBeNull()
    })

    it('should assign incremental order to multiple cards', () => {
      const { addCreditCard } = useExpenseStore.getState()

      addCreditCard('Card A', '#ff0000', 1000)
      addCreditCard('Card B', '#00ff00', 2000)
      addCreditCard('Card C', '#0000ff', 3000)

      const state = useExpenseStore.getState()
      expect(state.creditCards[0].order).toBe(0)
      expect(state.creditCards[1].order).toBe(1)
      expect(state.creditCards[2].order).toBe(2)
    })

    it('should throw error for duplicate names', () => {
      const { addCreditCard } = useExpenseStore.getState()

      addCreditCard('Nubank', '#8b5cf6', 3000)

      expect(() => {
        addCreditCard('Nubank', '#a855f7', 5000)
      }).toThrow('Já existe um cartão com esse nome')
    })

    it('should normalize names to kebab-case IDs correctly', () => {
      const { addCreditCard } = useExpenseStore.getState()

      addCreditCard('Cartão Master 123!', '#ff0000', 1000)

      const state = useExpenseStore.getState()
      expect(state.creditCards[0].id).toBe('cartao-master-123')
    })
  })

  describe('updateCreditCard', () => {
    beforeEach(() => {
      const { addCreditCard } = useExpenseStore.getState()
      addCreditCard('Nubank', '#8b5cf6', 3000)
    })

    it('should update card name', () => {
      const { updateCreditCard } = useExpenseStore.getState()

      updateCreditCard('nubank', { name: 'Nubank Platinum' })

      const state = useExpenseStore.getState()
      expect(state.creditCards[0].name).toBe('Nubank Platinum')
    })

    it('should update card color', () => {
      const { updateCreditCard } = useExpenseStore.getState()

      updateCreditCard('nubank', { color: '#a855f7' })

      const state = useExpenseStore.getState()
      expect(state.creditCards[0].color).toBe('#a855f7')
    })

    it('should update card limit', () => {
      const { updateCreditCard } = useExpenseStore.getState()

      updateCreditCard('nubank', { limit: 5000 })

      const state = useExpenseStore.getState()
      expect(state.creditCards[0].limit).toBe(5000)
    })

    it('should set limit to null', () => {
      const { updateCreditCard } = useExpenseStore.getState()

      updateCreditCard('nubank', { limit: null })

      const state = useExpenseStore.getState()
      expect(state.creditCards[0].limit).toBeNull()
    })

    it('should update multiple fields at once', () => {
      const { updateCreditCard } = useExpenseStore.getState()

      updateCreditCard('nubank', {
        name: 'Nubank Black',
        color: '#000000',
        limit: 10000,
      })

      const state = useExpenseStore.getState()
      expect(state.creditCards[0].name).toBe('Nubank Black')
      expect(state.creditCards[0].color).toBe('#000000')
      expect(state.creditCards[0].limit).toBe(10000)
    })

    it('should throw error for non-existent card', () => {
      const { updateCreditCard } = useExpenseStore.getState()

      expect(() => {
        updateCreditCard('fake-card', { name: 'Test' })
      }).toThrow('Cartão não encontrado')
    })
  })

  describe('deleteCreditCard', () => {
    beforeEach(() => {
      const { addCreditCard } = useExpenseStore.getState()
      addCreditCard('Nubank', '#8b5cf6', 3000)
      addCreditCard('Itaú', '#f97316', 2000)
    })

    it('should delete card without installments', () => {
      const { deleteCreditCard } = useExpenseStore.getState()

      deleteCreditCard('nubank')

      const state = useExpenseStore.getState()
      expect(state.creditCards).toHaveLength(1)
      expect(state.creditCards[0].id).toBe('itau')
    })

    it('should throw error when deleting card with installments without reassignment', () => {
      const { addInstallment, deleteCreditCard } = useExpenseStore.getState()

      addInstallment({
        name: 'Notebook',
        card: 'nubank',
        totalInstallments: 12,
        amountPerInstallment: 300,
        startMonth: '2025-01',
      })

      expect(() => {
        deleteCreditCard('nubank')
      }).toThrow('Este cartão possui 1 parcelamento(s) ativo(s)')
    })

    it('should reassign installments when deleting card', () => {
      const { addInstallment, deleteCreditCard } = useExpenseStore.getState()

      addInstallment({
        name: 'Notebook',
        card: 'nubank',
        totalInstallments: 12,
        amountPerInstallment: 300,
        startMonth: '2025-01',
      })

      addInstallment({
        name: 'TV',
        card: 'nubank',
        totalInstallments: 6,
        amountPerInstallment: 500,
        startMonth: '2025-02',
      })

      deleteCreditCard('nubank', 'itau')

      const state = useExpenseStore.getState()
      expect(state.creditCards).toHaveLength(1)
      expect(state.creditCards[0].id).toBe('itau')
      expect(state.installments).toHaveLength(2)
      expect(state.installments[0].card).toBe('itau')
      expect(state.installments[1].card).toBe('itau')
    })

    it('should throw error for non-existent card', () => {
      const { deleteCreditCard } = useExpenseStore.getState()

      expect(() => {
        deleteCreditCard('fake-card')
      }).toThrow('Cartão não encontrado')
    })
  })

  describe('reorderCreditCards', () => {
    beforeEach(() => {
      const { addCreditCard } = useExpenseStore.getState()
      addCreditCard('Card A', '#ff0000', 1000)
      addCreditCard('Card B', '#00ff00', 2000)
      addCreditCard('Card C', '#0000ff', 3000)
    })

    it('should reorder cards based on provided IDs', () => {
      const { reorderCreditCards } = useExpenseStore.getState()

      reorderCreditCards(['card-c', 'card-a', 'card-b'])

      const state = useExpenseStore.getState()
      expect(state.creditCards[0].id).toBe('card-c')
      expect(state.creditCards[0].order).toBe(0)
      expect(state.creditCards[1].id).toBe('card-a')
      expect(state.creditCards[1].order).toBe(1)
      expect(state.creditCards[2].id).toBe('card-b')
      expect(state.creditCards[2].order).toBe(2)
    })

    it('should handle partial reordering', () => {
      const { reorderCreditCards } = useExpenseStore.getState()

      // Only reorder 2 cards (ignoring card-c)
      reorderCreditCards(['card-b', 'card-a'])

      const state = useExpenseStore.getState()
      expect(state.creditCards).toHaveLength(2)
      expect(state.creditCards[0].id).toBe('card-b')
      expect(state.creditCards[1].id).toBe('card-a')
    })
  })

  describe('getCreditCardById', () => {
    beforeEach(() => {
      const { addCreditCard } = useExpenseStore.getState()
      addCreditCard('Nubank', '#8b5cf6', 3000)
      addCreditCard('Itaú', '#f97316', 2000)
    })

    it('should return card by ID', () => {
      const { getCreditCardById } = useExpenseStore.getState()

      const card = getCreditCardById('nubank')

      expect(card).toBeDefined()
      expect(card?.name).toBe('Nubank')
      expect(card?.limit).toBe(3000)
    })

    it('should return undefined for non-existent card', () => {
      const { getCreditCardById } = useExpenseStore.getState()

      const card = getCreditCardById('fake-card')

      expect(card).toBeUndefined()
    })
  })

  describe('getCardUsageForMonth', () => {
    beforeEach(() => {
      const { addCreditCard, addInstallment } = useExpenseStore.getState()

      addCreditCard('Nubank', '#8b5cf6', 3000)
      addCreditCard('Itaú', '#f97316', 2000)

      // Nubank: 2 installments in Jan 2025
      addInstallment({
        name: 'Notebook',
        card: 'nubank',
        totalInstallments: 12,
        amountPerInstallment: 300,
        startMonth: '2025-01',
      })

      addInstallment({
        name: 'TV',
        card: 'nubank',
        totalInstallments: 6,
        amountPerInstallment: 500,
        startMonth: '2024-12',
      })

      // Itaú: 1 installment in Jan 2025
      addInstallment({
        name: 'Sofa',
        card: 'itau',
        totalInstallments: 10,
        amountPerInstallment: 250,
        startMonth: '2025-01',
      })
    })

    it('should calculate usage for month with multiple installments', () => {
      const { getCardUsageForMonth } = useExpenseStore.getState()

      const usage = getCardUsageForMonth('nubank', '2025-01')

      // 300 (Notebook) + 500 (TV month 2)
      expect(usage).toBe(800)
    })

    it('should calculate usage for month with single installment', () => {
      const { getCardUsageForMonth } = useExpenseStore.getState()

      const usage = getCardUsageForMonth('itau', '2025-01')

      expect(usage).toBe(250)
    })

    it('should return 0 for month without installments', () => {
      const { getCardUsageForMonth } = useExpenseStore.getState()

      const usage = getCardUsageForMonth('nubank', '2026-01')

      expect(usage).toBe(0)
    })

    it('should return 0 for non-existent card', () => {
      const { getCardUsageForMonth } = useExpenseStore.getState()

      const usage = getCardUsageForMonth('fake-card', '2025-01')

      expect(usage).toBe(0)
    })
  })

  describe('getCardTotalCommitment', () => {
    beforeEach(() => {
      const { addCreditCard, addInstallment } = useExpenseStore.getState()

      addCreditCard('Nubank', '#8b5cf6', 3000)

      // 12 x 300 = 3600
      addInstallment({
        name: 'Notebook',
        card: 'nubank',
        totalInstallments: 12,
        amountPerInstallment: 300,
        startMonth: '2025-01',
      })

      // 6 x 500 = 3000
      addInstallment({
        name: 'TV',
        card: 'nubank',
        totalInstallments: 6,
        amountPerInstallment: 500,
        startMonth: '2024-12',
      })
    })

    it('should calculate total commitment across all installments', () => {
      const { getCardTotalCommitment } = useExpenseStore.getState()

      const commitment = getCardTotalCommitment('nubank')

      // 3600 + 3000 = 6600
      expect(commitment).toBe(6600)
    })

    it('should return 0 for card without installments', () => {
      const { addCreditCard, getCardTotalCommitment } = useExpenseStore.getState()

      addCreditCard('Itaú', '#f97316', 2000)

      const commitment = getCardTotalCommitment('itau')

      expect(commitment).toBe(0)
    })

    it('should return 0 for non-existent card', () => {
      const { getCardTotalCommitment } = useExpenseStore.getState()

      const commitment = getCardTotalCommitment('fake-card')

      expect(commitment).toBe(0)
    })
  })

  describe('getCardUsagePercentage', () => {
    beforeEach(() => {
      const { addCreditCard, addInstallment } = useExpenseStore.getState()

      // Card with limit
      addCreditCard('Nubank', '#8b5cf6', 5000)

      // Card without limit
      addCreditCard('Itaú', '#f97316', null)

      // Current month usage: 300 (month 1 of 12)
      // Total commitment: 12 x 300 = 3600
      addInstallment({
        name: 'Notebook',
        card: 'nubank',
        totalInstallments: 12,
        amountPerInstallment: 300,
        startMonth: '2025-01',
      })
    })

    it('should calculate percentage using total commitment', () => {
      const { getCardUsagePercentage } = useExpenseStore.getState()

      const percentage = getCardUsagePercentage('nubank')

      // Total commitment: 3600 (12 installments x 300)
      // Percentage: (3600 / 5000) * 100 = 72%
      expect(percentage).toBe(72)
    })

    it('should return null for card without limit', () => {
      const { getCardUsagePercentage } = useExpenseStore.getState()

      const percentage = getCardUsagePercentage('itau')

      expect(percentage).toBeNull()
    })

    it('should return null for non-existent card', () => {
      const { getCardUsagePercentage } = useExpenseStore.getState()

      const percentage = getCardUsagePercentage('fake-card')

      expect(percentage).toBeNull()
    })

    it('should handle 0% usage correctly', () => {
      const { addCreditCard, getCardUsagePercentage } = useExpenseStore.getState()

      addCreditCard('MercadoPago', '#3b82f6', 1000)

      const percentage = getCardUsagePercentage('mercadopago')

      expect(percentage).toBe(0)
    })

    it('should handle over 100% usage', () => {
      const { addCreditCard, addInstallment, getCardUsagePercentage } = useExpenseStore.getState()

      addCreditCard('Small Card', '#ff0000', 1000)

      // 12 x 300 = 3600 total
      addInstallment({
        name: 'Expensive Item',
        card: 'small-card',
        totalInstallments: 12,
        amountPerInstallment: 300,
        startMonth: '2025-01',
      })

      const percentage = getCardUsagePercentage('small-card')

      // 3600 / 1000 = 360%
      expect(percentage).toBe(360)
    })
  })
})
