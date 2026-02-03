import { describe, it, expect, beforeEach } from 'vitest'
import { useExpenseStore } from '@/lib/expense-store'

describe('Recurring Fixed Expenses', () => {
  beforeEach(() => {
    // Clear localStorage to prevent persist middleware from loading old data
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }

    // Reset store before each test with all required fields
    useExpenseStore.setState({
      monthlyData: {},
      currentMonth: '2026-01',
      currentYear: '2026',
      installments: [],
      categories: [],
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

      // Verify current month
      const jan2026 = getMonthData('2026-01')
      expect(jan2026.fixedExpenses).toHaveLength(1)

      // Verify propagation to future months
      const feb2026 = getMonthData('2026-02')
      expect(feb2026.fixedExpenses).toHaveLength(1)
      expect(feb2026.fixedExpenses[0].description).toBe('Plano de Celular')

      const dec2026 = getMonthData('2026-12')
      expect(dec2026.fixedExpenses).toHaveLength(1)

      const jan2027 = getMonthData('2027-01')
      expect(jan2027.fixedExpenses).toHaveLength(1)

      const dec2027 = getMonthData('2027-12')
      expect(dec2027.fixedExpenses).toHaveLength(1)

      // Verify that all have the same recurringGroupId
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

      // Month 24 (Jan 2028) should have
      const jan2028 = getMonthData('2028-01')
      expect(jan2028.fixedExpenses).toHaveLength(1)

      // Month 25 (Feb 2028) should not have (was not propagated)
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

      // IDs should be different
      expect(jan2026.fixedExpenses[0].id).not.toBe(feb2026.fixedExpenses[0].id)
      expect(feb2026.fixedExpenses[0].id).not.toBe(mar2026.fixedExpenses[0].id)

      // recurringGroupId should be the same
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

      // Verify recurringGroupId crosses years
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

      // Remove from March onwards
      removeFixedExpenseFromMonth('2026-03', recurringGroupId)

      // Jan and Feb should have the expense
      expect(getMonthData('2026-01').fixedExpenses).toHaveLength(1)
      expect(getMonthData('2026-02').fixedExpenses).toHaveLength(1)

      // Mar and future months should not have
      expect(getMonthData('2026-03').fixedExpenses).toHaveLength(0)
      expect(getMonthData('2026-04').fixedExpenses).toHaveLength(0)
      expect(getMonthData('2026-05').fixedExpenses).toHaveLength(0)
      expect(getMonthData('2027-01').fixedExpenses).toHaveLength(0)
    })

    it('should only remove expenses with matching recurringGroupId', () => {
      const { addFixedExpenseWithPropagation, removeFixedExpenseFromMonth, getMonthData } =
        useExpenseStore.getState()

      // Add two different recurring expenses
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

      // Remove only cellphone plan from Feb onwards
      removeFixedExpenseFromMonth('2026-02', cellphoneGroupId)

      // Jan should have both
      expect(getMonthData('2026-01').fixedExpenses).toHaveLength(2)

      // Feb should have only gym
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

      // Remove from Dec 2026 onwards
      removeFixedExpenseFromMonth('2026-12', recurringGroupId)

      // Months before Dec 2026 should have
      expect(getMonthData('2026-11').fixedExpenses).toHaveLength(1)

      // Dec 2026 and 2027 should not have
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

      // Update value from April onwards
      updateFixedExpenseFromMonth('2026-04', recurringGroupId, {
        amount: 120,
      })

      // Jan, Feb, Mar should have old value
      expect(getMonthData('2026-01').fixedExpenses[0].amount).toBe(100)
      expect(getMonthData('2026-02').fixedExpenses[0].amount).toBe(100)
      expect(getMonthData('2026-03').fixedExpenses[0].amount).toBe(100)

      // Apr and future months should have new value
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

      // Update description and category from Mar onwards
      updateFixedExpenseFromMonth('2026-03', recurringGroupId, {
        description: 'Plano Novo Premium',
        category: 'subscriptions',
      })

      // Jan and Feb should have old data
      expect(getMonthData('2026-01').fixedExpenses[0].description).toBe('Plano Velho')
      expect(getMonthData('2026-01').fixedExpenses[0].category).toBe('utilities')

      // Mar and future should have new data
      const mar2026 = getMonthData('2026-03')
      expect(mar2026.fixedExpenses[0].description).toBe('Plano Novo Premium')
      expect(mar2026.fixedExpenses[0].category).toBe('subscriptions')
      expect(mar2026.fixedExpenses[0].amount).toBe(100) // Value did not change
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

      // recurringGroupId should remain the same
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

      // Verify that dates are updated correctly
      expect(getMonthData('2026-05').fixedExpenses[0].date).toBe('2026-05-01')
      expect(getMonthData('2026-06').fixedExpenses[0].date).toBe('2026-06-01')
      expect(getMonthData('2026-07').fixedExpenses[0].date).toBe('2026-07-01')
    })
  })

  describe('Backward Compatibility', () => {
    it('should handle fixed expenses without recurringGroupId', () => {
      const { addExpense, getMonthData } = useExpenseStore.getState()

      // Add fixed expense without propagation (legacy)
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

      // Should not appear in future months
      const state = useExpenseStore.getState()
      expect(state.monthlyData['2026-02']).toBeUndefined()
    })

    it('should allow mixing recurring and non-recurring fixed expenses', () => {
      const { addExpense, addFixedExpenseWithPropagation, getMonthData } =
        useExpenseStore.getState()

      // Add non-recurring expense
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

      // Add recurring expense
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

      // Jan should have only Internet
      expect(getMonthData('2026-01').fixedExpenses).toHaveLength(1)
      expect(getMonthData('2026-01').fixedExpenses[0].description).toBe('Internet')

      // Feb should have only Internet
      expect(getMonthData('2026-02').fixedExpenses).toHaveLength(1)

      // Mar and future should have both
      const mar2026 = getMonthData('2026-03')
      expect(mar2026.fixedExpenses).toHaveLength(2)
      expect(mar2026.fixedExpenses.map((e) => e.description).sort()).toEqual([
        'Academia',
        'Internet',
      ])
    })

    it('should not propagate to past months', () => {
      const { addFixedExpenseWithPropagation, getMonthData } = useExpenseStore.getState()

      // Add expense in March
      addFixedExpenseWithPropagation('2026-03', {
        description: 'Nova Assinatura',
        amount: 50,
        category: 'subscriptions',
        type: 'fixed',
        date: '2026-03-01',
      })

      // Verify that past months exist but don't have the expense
      // (months are created when year is initialized, but expense only propagates forward)
      expect(getMonthData('2026-01').fixedExpenses).toHaveLength(0)
      expect(getMonthData('2026-02').fixedExpenses).toHaveLength(0)

      // Mar and future should have the expense
      expect(getMonthData('2026-03').fixedExpenses).toHaveLength(1)
      expect(getMonthData('2026-04').fixedExpenses).toHaveLength(1)
    })
  })
})
