import { describe, it, expect, beforeEach } from 'vitest'
import { useExpenseStore } from '@/lib/expense-store'

describe('Recurring Fixed Expenses', () => {
  beforeEach(() => {
    // Reset store antes de cada teste
    useExpenseStore.setState({
      monthlyData: {},
      currentMonth: '2026-01',
      currentYear: '2026',
      installments: [],
    })
  })

  describe('addFixedExpenseWithPropagation', () => {
    it('should add fixed expense to current month with recurringGroupId', () => {
      const { addFixedExpenseWithPropagation, getMonthData } = useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Plano de Celular',
        amount: 100,
        category: 'utilities',
        type: 'fixed',
        date: '2026-01-01',
      })

      const monthData = getMonthData('2026-01')
      expect(monthData.fixedExpenses).toHaveLength(1)
      expect(monthData.fixedExpenses[0].description).toBe('Plano de Celular')
      expect(monthData.fixedExpenses[0].amount).toBe(100)
      expect(monthData.fixedExpenses[0].recurringGroupId).toBeDefined()
      expect(monthData.fixedExpenses[0].recurringGroupId).toMatch(/^recur_/)
    })

    it('should propagate fixed expense to 24 future months', () => {
      const { addFixedExpenseWithPropagation, getMonthData } = useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Plano de Celular',
        amount: 100,
        category: 'utilities',
        type: 'fixed',
        date: '2026-01-01',
      })

      // Verificar mês atual
      const jan2026 = getMonthData('2026-01')
      expect(jan2026.fixedExpenses).toHaveLength(1)

      // Verificar propagação para meses futuros
      const feb2026 = getMonthData('2026-02')
      expect(feb2026.fixedExpenses).toHaveLength(1)
      expect(feb2026.fixedExpenses[0].description).toBe('Plano de Celular')

      const dec2026 = getMonthData('2026-12')
      expect(dec2026.fixedExpenses).toHaveLength(1)

      const jan2027 = getMonthData('2027-01')
      expect(jan2027.fixedExpenses).toHaveLength(1)

      const dec2027 = getMonthData('2027-12')
      expect(dec2027.fixedExpenses).toHaveLength(1)

      // Verificar que todos têm o mesmo recurringGroupId
      const recurringGroupId = jan2026.fixedExpenses[0].recurringGroupId
      expect(feb2026.fixedExpenses[0].recurringGroupId).toBe(recurringGroupId)
      expect(dec2026.fixedExpenses[0].recurringGroupId).toBe(recurringGroupId)
      expect(jan2027.fixedExpenses[0].recurringGroupId).toBe(recurringGroupId)
    })

    it('should propagate exactly 24 months (not 25)', () => {
      const { addFixedExpenseWithPropagation, getMonthData } = useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Academia',
        amount: 120,
        category: 'healthcare',
        type: 'fixed',
        date: '2026-01-01',
      })

      // Mês 24 (Jan 2028) deve ter
      const jan2028 = getMonthData('2028-01')
      expect(jan2028.fixedExpenses).toHaveLength(1)

      // Mês 25 (Fev 2028) não deve ter (não foi propagado)
      const state = useExpenseStore.getState()
      expect(state.monthlyData['2028-02']).toBeUndefined()
    })

    it('should create unique IDs for each month but same recurringGroupId', () => {
      const { addFixedExpenseWithPropagation, getMonthData } = useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Internet',
        amount: 150,
        category: 'utilities',
        type: 'fixed',
        date: '2026-01-01',
      })

      const jan2026 = getMonthData('2026-01')
      const feb2026 = getMonthData('2026-02')
      const mar2026 = getMonthData('2026-03')

      // IDs devem ser diferentes
      expect(jan2026.fixedExpenses[0].id).not.toBe(feb2026.fixedExpenses[0].id)
      expect(feb2026.fixedExpenses[0].id).not.toBe(mar2026.fixedExpenses[0].id)

      // recurringGroupId deve ser o mesmo
      expect(jan2026.fixedExpenses[0].recurringGroupId).toBe(
        feb2026.fixedExpenses[0].recurringGroupId
      )
      expect(feb2026.fixedExpenses[0].recurringGroupId).toBe(
        mar2026.fixedExpenses[0].recurringGroupId
      )
    })

    it('should handle year boundaries correctly', () => {
      const { addFixedExpenseWithPropagation, getMonthData } = useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-12', {
        description: 'Aluguel',
        amount: 2500,
        category: 'other',
        type: 'fixed',
        date: '2026-12-01',
      })

      const dec2026 = getMonthData('2026-12')
      const jan2027 = getMonthData('2027-01')
      const feb2027 = getMonthData('2027-02')

      expect(dec2026.fixedExpenses).toHaveLength(1)
      expect(jan2027.fixedExpenses).toHaveLength(1)
      expect(feb2027.fixedExpenses).toHaveLength(1)

      // Verificar recurringGroupId atravessa anos
      const recurringGroupId = dec2026.fixedExpenses[0].recurringGroupId
      expect(jan2027.fixedExpenses[0].recurringGroupId).toBe(recurringGroupId)
      expect(feb2027.fixedExpenses[0].recurringGroupId).toBe(recurringGroupId)
    })
  })

  describe('removeFixedExpenseFromMonth', () => {
    it('should remove recurring expense from current month onwards', () => {
      const { addFixedExpenseWithPropagation, removeFixedExpenseFromMonth, getMonthData } =
        useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Plano de Celular',
        amount: 100,
        category: 'utilities',
        type: 'fixed',
        date: '2026-01-01',
      })

      const jan2026 = getMonthData('2026-01')
      const recurringGroupId = jan2026.fixedExpenses[0].recurringGroupId!

      // Remover a partir de Março
      removeFixedExpenseFromMonth('2026-03', recurringGroupId)

      // Jan e Fev devem ter a despesa
      expect(getMonthData('2026-01').fixedExpenses).toHaveLength(1)
      expect(getMonthData('2026-02').fixedExpenses).toHaveLength(1)

      // Mar e meses futuros não devem ter
      expect(getMonthData('2026-03').fixedExpenses).toHaveLength(0)
      expect(getMonthData('2026-04').fixedExpenses).toHaveLength(0)
      expect(getMonthData('2026-05').fixedExpenses).toHaveLength(0)
      expect(getMonthData('2027-01').fixedExpenses).toHaveLength(0)
    })

    it('should only remove expenses with matching recurringGroupId', () => {
      const { addFixedExpenseWithPropagation, removeFixedExpenseFromMonth, getMonthData } =
        useExpenseStore.getState()

      // Adicionar duas despesas recorrentes diferentes
      addFixedExpenseWithPropagation('2026-01', {
        description: 'Plano de Celular',
        amount: 100,
        category: 'utilities',
        type: 'fixed',
        date: '2026-01-01',
      })

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Academia',
        amount: 120,
        category: 'healthcare',
        type: 'fixed',
        date: '2026-01-01',
      })

      const jan2026 = getMonthData('2026-01')
      expect(jan2026.fixedExpenses).toHaveLength(2)

      const cellphoneGroupId = jan2026.fixedExpenses[0].recurringGroupId!

      // Remover apenas plano de celular a partir de Fev
      removeFixedExpenseFromMonth('2026-02', cellphoneGroupId)

      // Jan deve ter ambas
      expect(getMonthData('2026-01').fixedExpenses).toHaveLength(2)

      // Fev deve ter apenas academia
      const feb2026 = getMonthData('2026-02')
      expect(feb2026.fixedExpenses).toHaveLength(1)
      expect(feb2026.fixedExpenses[0].description).toBe('Academia')
    })

    it('should handle removal across year boundaries', () => {
      const { addFixedExpenseWithPropagation, removeFixedExpenseFromMonth, getMonthData } =
        useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Netflix',
        amount: 50,
        category: 'subscriptions',
        type: 'fixed',
        date: '2026-01-01',
      })

      const jan2026 = getMonthData('2026-01')
      const recurringGroupId = jan2026.fixedExpenses[0].recurringGroupId!

      // Remover a partir de Dez 2026
      removeFixedExpenseFromMonth('2026-12', recurringGroupId)

      // Meses antes de Dez 2026 devem ter
      expect(getMonthData('2026-11').fixedExpenses).toHaveLength(1)

      // Dez 2026 e 2027 não devem ter
      expect(getMonthData('2026-12').fixedExpenses).toHaveLength(0)
      expect(getMonthData('2027-01').fixedExpenses).toHaveLength(0)
      expect(getMonthData('2027-06').fixedExpenses).toHaveLength(0)
    })
  })

  describe('updateFixedExpenseFromMonth', () => {
    it('should update recurring expense from current month onwards', () => {
      const { addFixedExpenseWithPropagation, updateFixedExpenseFromMonth, getMonthData } =
        useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Plano de Celular',
        amount: 100,
        category: 'utilities',
        type: 'fixed',
        date: '2026-01-01',
      })

      const jan2026 = getMonthData('2026-01')
      const recurringGroupId = jan2026.fixedExpenses[0].recurringGroupId!

      // Atualizar valor a partir de Abril
      updateFixedExpenseFromMonth('2026-04', recurringGroupId, {
        amount: 120,
      })

      // Jan, Fev, Mar devem ter valor antigo
      expect(getMonthData('2026-01').fixedExpenses[0].amount).toBe(100)
      expect(getMonthData('2026-02').fixedExpenses[0].amount).toBe(100)
      expect(getMonthData('2026-03').fixedExpenses[0].amount).toBe(100)

      // Abr e meses futuros devem ter novo valor
      expect(getMonthData('2026-04').fixedExpenses[0].amount).toBe(120)
      expect(getMonthData('2026-05').fixedExpenses[0].amount).toBe(120)
      expect(getMonthData('2027-01').fixedExpenses[0].amount).toBe(120)
    })

    it('should update description and category', () => {
      const { addFixedExpenseWithPropagation, updateFixedExpenseFromMonth, getMonthData } =
        useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Plano Velho',
        amount: 100,
        category: 'utilities',
        type: 'fixed',
        date: '2026-01-01',
      })

      const jan2026 = getMonthData('2026-01')
      const recurringGroupId = jan2026.fixedExpenses[0].recurringGroupId!

      // Atualizar descrição e categoria a partir de Mar
      updateFixedExpenseFromMonth('2026-03', recurringGroupId, {
        description: 'Plano Novo Premium',
        category: 'subscriptions',
      })

      // Jan e Fev devem ter dados antigos
      expect(getMonthData('2026-01').fixedExpenses[0].description).toBe('Plano Velho')
      expect(getMonthData('2026-01').fixedExpenses[0].category).toBe('utilities')

      // Mar e futuros devem ter dados novos
      const mar2026 = getMonthData('2026-03')
      expect(mar2026.fixedExpenses[0].description).toBe('Plano Novo Premium')
      expect(mar2026.fixedExpenses[0].category).toBe('subscriptions')
      expect(mar2026.fixedExpenses[0].amount).toBe(100) // Valor não mudou
    })

    it('should preserve recurringGroupId after update', () => {
      const { addFixedExpenseWithPropagation, updateFixedExpenseFromMonth, getMonthData } =
        useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Internet',
        amount: 150,
        category: 'utilities',
        type: 'fixed',
        date: '2026-01-01',
      })

      const jan2026 = getMonthData('2026-01')
      const originalGroupId = jan2026.fixedExpenses[0].recurringGroupId!

      updateFixedExpenseFromMonth('2026-02', originalGroupId, {
        amount: 180,
      })

      // recurringGroupId deve permanecer o mesmo
      expect(getMonthData('2026-01').fixedExpenses[0].recurringGroupId).toBe(originalGroupId)
      expect(getMonthData('2026-02').fixedExpenses[0].recurringGroupId).toBe(originalGroupId)
      expect(getMonthData('2026-03').fixedExpenses[0].recurringGroupId).toBe(originalGroupId)
    })

    it('should update date to match target month', () => {
      const { addFixedExpenseWithPropagation, updateFixedExpenseFromMonth, getMonthData } =
        useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Aluguel',
        amount: 2500,
        category: 'other',
        type: 'fixed',
        date: '2026-01-01',
      })

      const jan2026 = getMonthData('2026-01')
      const recurringGroupId = jan2026.fixedExpenses[0].recurringGroupId!

      updateFixedExpenseFromMonth('2026-06', recurringGroupId, {
        amount: 2700,
      })

      // Verificar que dates são atualizadas corretamente
      expect(getMonthData('2026-05').fixedExpenses[0].date).toBe('2026-05-01')
      expect(getMonthData('2026-06').fixedExpenses[0].date).toBe('2026-06-01')
      expect(getMonthData('2026-07').fixedExpenses[0].date).toBe('2026-07-01')
    })
  })

  describe('Backward Compatibility', () => {
    it('should handle fixed expenses without recurringGroupId', () => {
      const { addExpense, getMonthData } = useExpenseStore.getState()

      // Adicionar despesa fixa sem propagação (legacy)
      addExpense(
        '2026-01',
        {
          description: 'Despesa Antiga',
          amount: 200,
          category: 'other',
          type: 'fixed',
          date: '2026-01-01',
        },
        'fixed'
      )

      const jan2026 = getMonthData('2026-01')
      expect(jan2026.fixedExpenses).toHaveLength(1)
      expect(jan2026.fixedExpenses[0].recurringGroupId).toBeUndefined()

      // Não deve aparecer em meses futuros
      const state = useExpenseStore.getState()
      expect(state.monthlyData['2026-02']).toBeUndefined()
    })

    it('should allow mixing recurring and non-recurring fixed expenses', () => {
      const { addExpense, addFixedExpenseWithPropagation, getMonthData } =
        useExpenseStore.getState()

      // Adicionar despesa não-recorrente
      addExpense(
        '2026-01',
        {
          description: 'Despesa Unica',
          amount: 100,
          category: 'other',
          type: 'fixed',
          date: '2026-01-01',
        },
        'fixed'
      )

      // Adicionar despesa recorrente
      addFixedExpenseWithPropagation('2026-01', {
        description: 'Despesa Recorrente',
        amount: 200,
        category: 'utilities',
        type: 'fixed',
        date: '2026-01-01',
      })

      const jan2026 = getMonthData('2026-01')
      expect(jan2026.fixedExpenses).toHaveLength(2)

      const feb2026 = getMonthData('2026-02')
      expect(feb2026.fixedExpenses).toHaveLength(1)
      expect(feb2026.fixedExpenses[0].description).toBe('Despesa Recorrente')
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple recurring expenses independently', () => {
      const { addFixedExpenseWithPropagation, getMonthData } = useExpenseStore.getState()

      addFixedExpenseWithPropagation('2026-01', {
        description: 'Internet',
        amount: 150,
        category: 'utilities',
        type: 'fixed',
        date: '2026-01-01',
      })

      addFixedExpenseWithPropagation('2026-03', {
        description: 'Academia',
        amount: 120,
        category: 'healthcare',
        type: 'fixed',
        date: '2026-03-01',
      })

      // Jan deve ter apenas Internet
      expect(getMonthData('2026-01').fixedExpenses).toHaveLength(1)
      expect(getMonthData('2026-01').fixedExpenses[0].description).toBe('Internet')

      // Fev deve ter apenas Internet
      expect(getMonthData('2026-02').fixedExpenses).toHaveLength(1)

      // Mar e futuros devem ter ambas
      const mar2026 = getMonthData('2026-03')
      expect(mar2026.fixedExpenses).toHaveLength(2)
      expect(mar2026.fixedExpenses.map((e) => e.description).sort()).toEqual([
        'Academia',
        'Internet',
      ])
    })

    it('should not propagate to past months', () => {
      const { addFixedExpenseWithPropagation, getMonthData } = useExpenseStore.getState()

      // Adicionar despesa em Março
      addFixedExpenseWithPropagation('2026-03', {
        description: 'Nova Assinatura',
        amount: 50,
        category: 'subscriptions',
        type: 'fixed',
        date: '2026-03-01',
      })

      // Verificar que meses passados não têm a despesa
      const state = useExpenseStore.getState()
      expect(state.monthlyData['2026-01']).toBeUndefined()
      expect(state.monthlyData['2026-02']).toBeUndefined()

      // Mar e futuros devem ter
      expect(getMonthData('2026-03').fixedExpenses).toHaveLength(1)
      expect(getMonthData('2026-04').fixedExpenses).toHaveLength(1)
    })
  })
})
