import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useExpenseStore } from '@/lib/expense-store'
import { useSyncStore } from '@/lib/sync-store'

vi.mock('@/lib/write-queue', () => ({ enqueue: vi.fn() }))
vi.mock('@/lib/workspace-client', () => ({
  fetchWorkspaceData: vi.fn(),
  categoryKeyToCloudId: {},
  categoryCloudIdToKey: {},
  cardKeyToCloudId: {},
  cardCloudIdToKey: {},
  getWorkspaceLastActivity: vi.fn(),
}))

describe('Expense Management', () => {
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

    useSyncStore.setState({
      workspaceId: null,
      workspaceGroup: null,
      userEmail: null,
      errorMessage: null,
      lastSyncedAt: null,
    })
  })

  describe('addExpense (fixed)', () => {
    it('should add a fixed expense to the correct month', () => {
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-01',
        {
          description: 'Aluguel',
          amount: 1500,
          category: 'housing',
          type: 'fixed',
          date: '2025-01-01',
        },
        'fixed'
      )

      const state = useExpenseStore.getState()
      const monthData = state.getMonthData('2025-01')
      expect(monthData.fixedExpenses).toHaveLength(1)
      expect(monthData.fixedExpenses[0].description).toBe('Aluguel')
      expect(monthData.fixedExpenses[0].amount).toBe(1500)
      expect(monthData.fixedExpenses[0].type).toBe('fixed')
    })

    it('should generate a unique ID for the expense', () => {
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-01',
        {
          description: 'Aluguel',
          amount: 1500,
          category: 'housing',
          type: 'fixed',
          date: '2025-01-01',
        },
        'fixed'
      )
      addExpense(
        '2025-01',
        {
          description: 'Internet',
          amount: 100,
          category: 'subscriptions',
          type: 'fixed',
          date: '2025-01-01',
        },
        'fixed'
      )

      const monthData = useExpenseStore.getState().getMonthData('2025-01')
      const ids = monthData.fixedExpenses.map((e) => e.id)
      expect(new Set(ids).size).toBe(2)
    })

    it('should not put fixed expense into variableExpenses', () => {
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-01',
        {
          description: 'Aluguel',
          amount: 1500,
          category: 'housing',
          type: 'fixed',
          date: '2025-01-01',
        },
        'fixed'
      )

      const monthData = useExpenseStore.getState().getMonthData('2025-01')
      expect(monthData.variableExpenses).toHaveLength(0)
    })

    it('should enqueue cloud sync when workspaceGroup is set', () => {
      useSyncStore.setState({ workspaceId: 'ws-1', workspaceGroup: 'workspace-ws-1' })
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-01',
        {
          description: 'Aluguel',
          amount: 1500,
          category: 'housing',
          type: 'fixed',
          date: '2025-01-01',
        },
        'fixed'
      )

      const monthData = useExpenseStore.getState().getMonthData('2025-01')
      expect(monthData.fixedExpenses).toHaveLength(1)
    })
  })

  describe('addExpense (variable)', () => {
    it('should add a variable expense to the correct month', () => {
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-02',
        {
          description: 'Mercado',
          amount: 350,
          category: 'groceries',
          type: 'variable',
          date: '2025-02-05',
        },
        'variable'
      )

      const monthData = useExpenseStore.getState().getMonthData('2025-02')
      expect(monthData.variableExpenses).toHaveLength(1)
      expect(monthData.variableExpenses[0].description).toBe('Mercado')
      expect(monthData.variableExpenses[0].amount).toBe(350)
    })

    it('should not put variable expense into fixedExpenses', () => {
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-02',
        {
          description: 'Mercado',
          amount: 350,
          category: 'groceries',
          type: 'variable',
          date: '2025-02-05',
        },
        'variable'
      )

      const monthData = useExpenseStore.getState().getMonthData('2025-02')
      expect(monthData.fixedExpenses).toHaveLength(0)
    })

    it('should auto-initialize month when adding expense to new month', () => {
      const { addExpense, getMonthData } = useExpenseStore.getState()

      addExpense(
        '2025-06',
        {
          description: 'Gasolina',
          amount: 200,
          category: 'transportation',
          type: 'variable',
          date: '2025-06-10',
        },
        'variable'
      )

      const monthData = getMonthData('2025-06')
      expect(monthData.variableExpenses).toHaveLength(1)
    })
  })

  describe('removeExpense (fixed)', () => {
    it('should remove a fixed expense by ID', () => {
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-01',
        {
          description: 'Aluguel',
          amount: 1500,
          category: 'housing',
          type: 'fixed',
          date: '2025-01-01',
        },
        'fixed'
      )

      const expenseId = useExpenseStore.getState().getMonthData('2025-01').fixedExpenses[0].id
      useExpenseStore.getState().removeExpense('2025-01', expenseId, 'fixed')

      const monthData = useExpenseStore.getState().getMonthData('2025-01')
      expect(monthData.fixedExpenses).toHaveLength(0)
    })

    it('should only remove the targeted fixed expense', () => {
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-01',
        {
          description: 'Aluguel',
          amount: 1500,
          category: 'housing',
          type: 'fixed',
          date: '2025-01-01',
        },
        'fixed'
      )
      addExpense(
        '2025-01',
        {
          description: 'Internet',
          amount: 100,
          category: 'subscriptions',
          type: 'fixed',
          date: '2025-01-01',
        },
        'fixed'
      )

      const expenses = useExpenseStore.getState().getMonthData('2025-01').fixedExpenses
      useExpenseStore.getState().removeExpense('2025-01', expenses[0].id, 'fixed')

      const remaining = useExpenseStore.getState().getMonthData('2025-01').fixedExpenses
      expect(remaining).toHaveLength(1)
      expect(remaining[0].description).toBe('Internet')
    })

    it('should enqueue delete when workspaceGroup is set', () => {
      useSyncStore.setState({ workspaceId: 'ws-1', workspaceGroup: 'workspace-ws-1' })
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-01',
        {
          description: 'Aluguel',
          amount: 1500,
          category: 'housing',
          type: 'fixed',
          date: '2025-01-01',
        },
        'fixed'
      )

      const expenseId = useExpenseStore.getState().getMonthData('2025-01').fixedExpenses[0].id
      useExpenseStore.getState().removeExpense('2025-01', expenseId, 'fixed')

      expect(useExpenseStore.getState().getMonthData('2025-01').fixedExpenses).toHaveLength(0)
    })
  })

  describe('removeExpense (variable)', () => {
    it('should remove a variable expense by ID', () => {
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-03',
        {
          description: 'Restaurante',
          amount: 80,
          category: 'food',
          type: 'variable',
          date: '2025-03-15',
        },
        'variable'
      )

      const expenseId = useExpenseStore.getState().getMonthData('2025-03').variableExpenses[0].id
      useExpenseStore.getState().removeExpense('2025-03', expenseId, 'variable')

      const monthData = useExpenseStore.getState().getMonthData('2025-03')
      expect(monthData.variableExpenses).toHaveLength(0)
    })
  })

  describe('updateExpense (fixed)', () => {
    it('should update a fixed expense fields', () => {
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-01',
        {
          description: 'Aluguel',
          amount: 1500,
          category: 'housing',
          type: 'fixed',
          date: '2025-01-01',
        },
        'fixed'
      )

      const expense = useExpenseStore.getState().getMonthData('2025-01').fixedExpenses[0]
      useExpenseStore
        .getState()
        .updateExpense(
          '2025-01',
          { ...expense, amount: 1700, description: 'Aluguel Novo' },
          'fixed'
        )

      const updated = useExpenseStore.getState().getMonthData('2025-01').fixedExpenses[0]
      expect(updated.amount).toBe(1700)
      expect(updated.description).toBe('Aluguel Novo')
    })

    it('should enqueue update when workspaceGroup is set', () => {
      useSyncStore.setState({ workspaceId: 'ws-1', workspaceGroup: 'workspace-ws-1' })
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-01',
        {
          description: 'Aluguel',
          amount: 1500,
          category: 'housing',
          type: 'fixed',
          date: '2025-01-01',
        },
        'fixed'
      )

      const expense = useExpenseStore.getState().getMonthData('2025-01').fixedExpenses[0]
      useExpenseStore.getState().updateExpense('2025-01', { ...expense, amount: 1700 }, 'fixed')

      expect(useExpenseStore.getState().getMonthData('2025-01').fixedExpenses[0].amount).toBe(1700)
    })
  })

  describe('updateExpense (variable)', () => {
    it('should update a variable expense fields', () => {
      const { addExpense } = useExpenseStore.getState()

      addExpense(
        '2025-04',
        {
          description: 'Cinema',
          amount: 40,
          category: 'leisure',
          type: 'variable',
          date: '2025-04-20',
        },
        'variable'
      )

      const expense = useExpenseStore.getState().getMonthData('2025-04').variableExpenses[0]
      useExpenseStore
        .getState()
        .updateExpense('2025-04', { ...expense, amount: 50, category: 'food' }, 'variable')

      const updated = useExpenseStore.getState().getMonthData('2025-04').variableExpenses[0]
      expect(updated.amount).toBe(50)
      expect(updated.category).toBe('food')
    })
  })

  describe('addFixedExpenseWithPropagation', () => {
    it('should propagate fixed expense to future months', () => {
      const { addFixedExpenseWithPropagation } = useExpenseStore.getState()

      addFixedExpenseWithPropagation('2025-01', {
        description: 'Plano Saúde',
        amount: 300,
        category: 'health',
        type: 'fixed',
        date: '2025-01-01',
      })

      const jan = useExpenseStore.getState().getMonthData('2025-01')
      const feb = useExpenseStore.getState().getMonthData('2025-02')
      expect(jan.fixedExpenses.length).toBeGreaterThan(0)
      expect(feb.fixedExpenses.length).toBeGreaterThan(0)
      expect(jan.fixedExpenses[0].recurringGroupId).toBeDefined()
      expect(feb.fixedExpenses[0].recurringGroupId).toBe(jan.fixedExpenses[0].recurringGroupId)
    })

    it('should enqueue cloud creates when workspaceGroup is set', () => {
      useSyncStore.setState({ workspaceId: 'ws-1', workspaceGroup: 'workspace-ws-1' })
      const { addFixedExpenseWithPropagation } = useExpenseStore.getState()

      addFixedExpenseWithPropagation('2025-01', {
        description: 'Plano Saúde',
        amount: 300,
        category: 'health',
        type: 'fixed',
        date: '2025-01-01',
      })

      const jan = useExpenseStore.getState().getMonthData('2025-01')
      expect(jan.fixedExpenses.length).toBeGreaterThan(0)
    })
  })

  describe('removeFixedExpenseFromMonth', () => {
    it('should remove expense with matching recurringGroupId from current and future months', () => {
      const { addFixedExpenseWithPropagation } = useExpenseStore.getState()

      addFixedExpenseWithPropagation('2025-01', {
        description: 'Academia',
        amount: 100,
        category: 'health',
        type: 'fixed',
        date: '2025-01-01',
      })

      const jan = useExpenseStore.getState().getMonthData('2025-01')
      const groupId = jan.fixedExpenses[0].recurringGroupId!

      useExpenseStore.getState().removeFixedExpenseFromMonth('2025-01', groupId)

      const janAfter = useExpenseStore.getState().getMonthData('2025-01')
      const febAfter = useExpenseStore.getState().getMonthData('2025-02')
      expect(janAfter.fixedExpenses.filter((e) => e.recurringGroupId === groupId)).toHaveLength(0)
      expect(febAfter.fixedExpenses.filter((e) => e.recurringGroupId === groupId)).toHaveLength(0)
    })
  })

  describe('getMonthData auto-initialization', () => {
    it('should return empty expense lists for uninitialized month', () => {
      const { getMonthData } = useExpenseStore.getState()

      const monthData = getMonthData('2030-12')
      expect(monthData.fixedExpenses).toEqual([])
      expect(monthData.variableExpenses).toEqual([])
    })
  })
})
