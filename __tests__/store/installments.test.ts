import { describe, it, expect, beforeEach } from 'vitest'
import { useExpenseStore } from '@/lib/expense-store'

describe('Installment Logic', () => {
  beforeEach(() => {
    // Reset store antes de cada teste
    useExpenseStore.setState({
      monthlyData: {},
      currentMonth: '2025-01',
      currentYear: '2025',
      installments: [],
    })
  })

  describe('addInstallment', () => {
    it('should add installment with generated ID', () => {
      const { addInstallment } = useExpenseStore.getState()

      addInstallment({
        name: 'Notebook',
        card: 'nubank_pri',
        totalInstallments: 12,
        amountPerInstallment: 300,
        startMonth: '2025-01',
      })

      const state = useExpenseStore.getState()
      expect(state.installments).toHaveLength(1)
      expect(state.installments[0].name).toBe('Notebook')
      expect(state.installments[0].id).toBeDefined()
      expect(state.installments[0].id.length).toBeGreaterThan(0)
    })

    it('should preserve all installment fields', () => {
      const { addInstallment } = useExpenseStore.getState()

      addInstallment({
        name: 'Geladeira',
        card: 'itau',
        totalInstallments: 10,
        amountPerInstallment: 250,
        startMonth: '2024-11',
      })

      const state = useExpenseStore.getState()
      const installment = state.installments[0]

      expect(installment.name).toBe('Geladeira')
      expect(installment.card).toBe('itau')
      expect(installment.totalInstallments).toBe(10)
      expect(installment.amountPerInstallment).toBe(250)
      expect(installment.startMonth).toBe('2024-11')
    })

    it('should add multiple installments', () => {
      const { addInstallment } = useExpenseStore.getState()

      addInstallment({
        name: 'TV',
        card: 'nubank_ma',
        totalInstallments: 6,
        amountPerInstallment: 400,
        startMonth: '2025-02',
      })

      addInstallment({
        name: 'Sofá',
        card: 'mercadopago',
        totalInstallments: 8,
        amountPerInstallment: 350,
        startMonth: '2025-03',
      })

      const state = useExpenseStore.getState()
      expect(state.installments).toHaveLength(2)
      expect(state.installments[0].name).toBe('TV')
      expect(state.installments[1].name).toBe('Sofá')
    })
  })

  describe('removeInstallment', () => {
    it('should remove installment by ID', () => {
      const { addInstallment, removeInstallment } = useExpenseStore.getState()

      addInstallment({
        name: 'Celular',
        card: 'nubank_pri',
        totalInstallments: 10,
        amountPerInstallment: 200,
        startMonth: '2025-01',
      })

      const { installments } = useExpenseStore.getState()
      const installmentId = installments[0].id

      removeInstallment(installmentId)

      const state = useExpenseStore.getState()
      expect(state.installments).toHaveLength(0)
    })

    it('should not affect other installments', () => {
      const { addInstallment, removeInstallment } = useExpenseStore.getState()

      addInstallment({
        name: 'Item 1',
        card: 'nubank_pri',
        totalInstallments: 5,
        amountPerInstallment: 100,
        startMonth: '2025-01',
      })

      addInstallment({
        name: 'Item 2',
        card: 'itau',
        totalInstallments: 6,
        amountPerInstallment: 150,
        startMonth: '2025-02',
      })

      const { installments } = useExpenseStore.getState()
      const firstId = installments[0].id

      removeInstallment(firstId)

      const state = useExpenseStore.getState()
      expect(state.installments).toHaveLength(1)
      expect(state.installments[0].name).toBe('Item 2')
    })
  })

  describe('getInstallmentsForMonth', () => {
    it('should return installment for current month', () => {
      const { addInstallment, getInstallmentsForMonth } = useExpenseStore.getState()

      addInstallment({
        name: 'Celular',
        card: 'nubank_pri',
        totalInstallments: 10,
        amountPerInstallment: 200,
        startMonth: '2024-12',
      })

      // 2º mês (2025-01)
      const result = getInstallmentsForMonth('2025-01')

      expect(result).toHaveLength(1)
      expect(result[0].installment.name).toBe('Celular')
      expect(result[0].currentNumber).toBe(2)
    })

    it('should show all 12 installments across year', () => {
      const { addInstallment, getInstallmentsForMonth } = useExpenseStore.getState()

      addInstallment({
        name: 'Geladeira',
        card: 'nubank_ma',
        totalInstallments: 12,
        amountPerInstallment: 250,
        startMonth: '2025-01',
      })

      // Testa todos os 12 meses
      for (let month = 1; month <= 12; month++) {
        const monthKey = `2025-${String(month).padStart(2, '0')}`
        const installments = getInstallmentsForMonth(monthKey)

        expect(installments).toHaveLength(1)
        expect(installments[0].currentNumber).toBe(month)
        expect(installments[0].installment.name).toBe('Geladeira')
      }
    })

    it('should not show installment before start month', () => {
      const { addInstallment, getInstallmentsForMonth } = useExpenseStore.getState()

      addInstallment({
        name: 'TV',
        card: 'mercadopago',
        totalInstallments: 6,
        amountPerInstallment: 400,
        startMonth: '2025-03',
      })

      // Antes do período (Janeiro e Fevereiro)
      expect(getInstallmentsForMonth('2025-01')).toHaveLength(0)
      expect(getInstallmentsForMonth('2025-02')).toHaveLength(0)

      // Durante o período (Março)
      const march = getInstallmentsForMonth('2025-03')
      expect(march).toHaveLength(1)
      expect(march[0].currentNumber).toBe(1)
    })

    it('should not show installment after end month', () => {
      const { addInstallment, getInstallmentsForMonth } = useExpenseStore.getState()

      addInstallment({
        name: 'Notebook',
        card: 'itau',
        totalInstallments: 6,
        amountPerInstallment: 300,
        startMonth: '2025-01',
      })

      // 6 meses = até junho
      const june = getInstallmentsForMonth('2025-06')
      expect(june).toHaveLength(1)
      expect(june[0].currentNumber).toBe(6)

      // Depois do período (Julho em diante)
      expect(getInstallmentsForMonth('2025-07')).toHaveLength(0)
      expect(getInstallmentsForMonth('2025-08')).toHaveLength(0)
    })

    it('should handle multiple overlapping installments', () => {
      const { addInstallment, getInstallmentsForMonth } = useExpenseStore.getState()

      addInstallment({
        name: 'Item A',
        card: 'nubank_pri',
        totalInstallments: 12,
        amountPerInstallment: 100,
        startMonth: '2025-01',
      })

      addInstallment({
        name: 'Item B',
        card: 'itau',
        totalInstallments: 6,
        amountPerInstallment: 200,
        startMonth: '2025-03',
      })

      // Janeiro: apenas Item A
      const jan = getInstallmentsForMonth('2025-01')
      expect(jan).toHaveLength(1)
      expect(jan[0].installment.name).toBe('Item A')

      // Março: ambos
      const mar = getInstallmentsForMonth('2025-03')
      expect(mar).toHaveLength(2)
      expect(mar.find((i) => i.installment.name === 'Item A')?.currentNumber).toBe(3)
      expect(mar.find((i) => i.installment.name === 'Item B')?.currentNumber).toBe(1)

      // Agosto: ambos ainda (Item B é o 6º/último mês)
      const aug = getInstallmentsForMonth('2025-08')
      expect(aug).toHaveLength(2)
      expect(aug.find((i) => i.installment.name === 'Item A')?.currentNumber).toBe(8)
      expect(aug.find((i) => i.installment.name === 'Item B')?.currentNumber).toBe(6)

      // Setembro: Item B terminou
      const sep = getInstallmentsForMonth('2025-09')
      expect(sep).toHaveLength(1)
      expect(sep[0].installment.name).toBe('Item A')
    })

    it('should handle installments spanning year boundary', () => {
      const { addInstallment, getInstallmentsForMonth } = useExpenseStore.getState()

      addInstallment({
        name: 'Sofá',
        card: 'mercadopago',
        totalInstallments: 12,
        amountPerInstallment: 250,
        startMonth: '2024-10',
      })

      // Outubro 2024 (mês 1)
      const oct2024 = getInstallmentsForMonth('2024-10')
      expect(oct2024).toHaveLength(1)
      expect(oct2024[0].currentNumber).toBe(1)

      // Janeiro 2025 (mês 4)
      const jan2025 = getInstallmentsForMonth('2025-01')
      expect(jan2025).toHaveLength(1)
      expect(jan2025[0].currentNumber).toBe(4)

      // Setembro 2025 (mês 12 - último)
      const sep2025 = getInstallmentsForMonth('2025-09')
      expect(sep2025).toHaveLength(1)
      expect(sep2025[0].currentNumber).toBe(12)

      // Outubro 2025 (fora do período)
      expect(getInstallmentsForMonth('2025-10')).toHaveLength(0)
    })

    it('should return empty array for month without installments', () => {
      const { getInstallmentsForMonth } = useExpenseStore.getState()

      const result = getInstallmentsForMonth('2025-05')

      expect(result).toEqual([])
    })
  })
})
