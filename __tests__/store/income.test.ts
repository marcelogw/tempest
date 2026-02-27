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

describe('Income Management', () => {
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

  describe('addIncome', () => {
    it('should add income to the correct month', () => {
      const { addIncome } = useExpenseStore.getState()

      addIncome('2025-01', { description: 'Salário', amount: 5000 }, false)

      const monthData = useExpenseStore.getState().getMonthData('2025-01')
      expect(monthData.incomes).toHaveLength(1)
      expect(monthData.incomes[0].description).toBe('Salário')
      expect(monthData.incomes[0].amount).toBe(5000)
    })

    it('should generate a unique ID for the income', () => {
      const { addIncome } = useExpenseStore.getState()

      addIncome('2025-01', { description: 'Salário', amount: 5000 }, false)
      addIncome('2025-01', { description: 'Freelance', amount: 1200 }, false)

      const monthData = useExpenseStore.getState().getMonthData('2025-01')
      const ids = monthData.incomes.map((i) => i.id)
      expect(new Set(ids).size).toBe(2)
    })

    it('should add income to a new month (auto-initialize)', () => {
      const { addIncome, getMonthData } = useExpenseStore.getState()

      addIncome('2025-07', { description: 'Bônus', amount: 2000 }, false)

      const monthData = getMonthData('2025-07')
      expect(monthData.incomes).toHaveLength(1)
      expect(monthData.incomes[0].description).toBe('Bônus')
    })

    it('should replicate income across future months when replicate=true', () => {
      const { addIncome } = useExpenseStore.getState()

      addIncome('2025-01', { description: 'Salário Recorrente', amount: 6000 }, true)

      const jan = useExpenseStore.getState().getMonthData('2025-01')
      const feb = useExpenseStore.getState().getMonthData('2025-02')
      expect(jan.incomes.length).toBeGreaterThan(0)
      expect(feb.incomes.length).toBeGreaterThan(0)
      expect(feb.incomes[0].description).toBe('Salário Recorrente')
    })

    it('should enqueue cloud create when workspaceGroup is set', () => {
      useSyncStore.setState({ workspaceId: 'ws-1', workspaceGroup: 'workspace-ws-1' })
      const { addIncome } = useExpenseStore.getState()

      addIncome('2025-01', { description: 'Salário', amount: 5000 }, false)

      const monthData = useExpenseStore.getState().getMonthData('2025-01')
      expect(monthData.incomes).toHaveLength(1)
    })
  })

  describe('removeIncome', () => {
    it('should remove income by ID', () => {
      const { addIncome } = useExpenseStore.getState()

      addIncome('2025-01', { description: 'Salário', amount: 5000 }, false)

      const incomeId = useExpenseStore.getState().getMonthData('2025-01').incomes[0].id
      useExpenseStore.getState().removeIncome('2025-01', incomeId)

      const monthData = useExpenseStore.getState().getMonthData('2025-01')
      expect(monthData.incomes).toHaveLength(0)
    })

    it('should only remove the targeted income', () => {
      const { addIncome } = useExpenseStore.getState()

      addIncome('2025-01', { description: 'Salário', amount: 5000 }, false)
      addIncome('2025-01', { description: 'Freelance', amount: 1200 }, false)

      const incomes = useExpenseStore.getState().getMonthData('2025-01').incomes
      useExpenseStore.getState().removeIncome('2025-01', incomes[0].id)

      const remaining = useExpenseStore.getState().getMonthData('2025-01').incomes
      expect(remaining).toHaveLength(1)
      expect(remaining[0].description).toBe('Freelance')
    })

    it('should enqueue delete when workspaceGroup is set', () => {
      useSyncStore.setState({ workspaceId: 'ws-1', workspaceGroup: 'workspace-ws-1' })
      const { addIncome } = useExpenseStore.getState()

      addIncome('2025-01', { description: 'Salário', amount: 5000 }, false)

      const incomeId = useExpenseStore.getState().getMonthData('2025-01').incomes[0].id
      useExpenseStore.getState().removeIncome('2025-01', incomeId)

      expect(useExpenseStore.getState().getMonthData('2025-01').incomes).toHaveLength(0)
    })
  })

  describe('updateIncome', () => {
    it('should update income description and amount', () => {
      const { addIncome } = useExpenseStore.getState()

      addIncome('2025-01', { description: 'Salário', amount: 5000 }, false)

      const income = useExpenseStore.getState().getMonthData('2025-01').incomes[0]
      useExpenseStore
        .getState()
        .updateIncome('2025-01', { ...income, description: 'Salário Ajustado', amount: 5500 })

      const updated = useExpenseStore.getState().getMonthData('2025-01').incomes[0]
      expect(updated.description).toBe('Salário Ajustado')
      expect(updated.amount).toBe(5500)
    })

    it('should enqueue update when workspaceGroup is set', () => {
      useSyncStore.setState({ workspaceId: 'ws-1', workspaceGroup: 'workspace-ws-1' })
      const { addIncome } = useExpenseStore.getState()

      addIncome('2025-01', { description: 'Salário', amount: 5000 }, false)

      const income = useExpenseStore.getState().getMonthData('2025-01').incomes[0]
      useExpenseStore.getState().updateIncome('2025-01', { ...income, amount: 5500 })

      expect(useExpenseStore.getState().getMonthData('2025-01').incomes[0].amount).toBe(5500)
    })
  })
})
