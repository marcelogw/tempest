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

describe('Savings and Investments Management', () => {
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

  describe('updateInvestments', () => {
    it('should set investments for a month', () => {
      const { updateInvestments, getMonthData } = useExpenseStore.getState()

      updateInvestments('2025-01', 2000)

      const monthData = getMonthData('2025-01')
      expect(monthData.investments).toBe(2000)
    })

    it('should update investments value for an existing month', () => {
      const { updateInvestments, getMonthData } = useExpenseStore.getState()

      updateInvestments('2025-01', 1000)
      updateInvestments('2025-01', 3500)

      const monthData = getMonthData('2025-01')
      expect(monthData.investments).toBe(3500)
    })

    it('should auto-initialize month when setting investments', () => {
      const { updateInvestments, getMonthData } = useExpenseStore.getState()

      updateInvestments('2025-09', 5000)

      const monthData = getMonthData('2025-09')
      expect(monthData.investments).toBe(5000)
    })

    it('should not affect savings when updating investments', () => {
      const { updateInvestments, updateSavings, getMonthData } = useExpenseStore.getState()

      updateSavings('2025-01', 800)
      updateInvestments('2025-01', 2000)

      const monthData = getMonthData('2025-01')
      expect(monthData.savings).toBe(800)
      expect(monthData.investments).toBe(2000)
    })

    it('should enqueue update when workspaceGroup is set', () => {
      useSyncStore.setState({ workspaceId: 'ws-1', workspaceGroup: 'workspace-ws-1' })
      const { updateInvestments, getMonthData } = useExpenseStore.getState()

      updateInvestments('2025-01', 4000)

      expect(getMonthData('2025-01').investments).toBe(4000)
    })
  })

  describe('updateSavings', () => {
    it('should set savings for a month', () => {
      const { updateSavings, getMonthData } = useExpenseStore.getState()

      updateSavings('2025-01', 1500)

      const monthData = getMonthData('2025-01')
      expect(monthData.savings).toBe(1500)
    })

    it('should update savings value for an existing month', () => {
      const { updateSavings, getMonthData } = useExpenseStore.getState()

      updateSavings('2025-01', 500)
      updateSavings('2025-01', 1200)

      const monthData = getMonthData('2025-01')
      expect(monthData.savings).toBe(1200)
    })

    it('should auto-initialize month when setting savings', () => {
      const { updateSavings, getMonthData } = useExpenseStore.getState()

      updateSavings('2025-10', 3000)

      const monthData = getMonthData('2025-10')
      expect(monthData.savings).toBe(3000)
    })

    it('should not affect investments when updating savings', () => {
      const { updateInvestments, updateSavings, getMonthData } = useExpenseStore.getState()

      updateInvestments('2025-02', 4000)
      updateSavings('2025-02', 600)

      const monthData = getMonthData('2025-02')
      expect(monthData.investments).toBe(4000)
      expect(monthData.savings).toBe(600)
    })

    it('should enqueue update when workspaceGroup is set', () => {
      useSyncStore.setState({ workspaceId: 'ws-1', workspaceGroup: 'workspace-ws-1' })
      const { updateSavings, getMonthData } = useExpenseStore.getState()

      updateSavings('2025-02', 750)

      expect(getMonthData('2025-02').savings).toBe(750)
    })
  })
})
