import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useExpenseStore } from '@/lib/expense-store'
import { useSyncStore } from '@/lib/sync-store'
import type { WorkspaceData } from '@/lib/workspace-client'

vi.mock('@/lib/write-queue', () => ({ enqueue: vi.fn() }))
vi.mock('@/lib/workspace-client', () => ({
  fetchWorkspaceData: vi.fn(),
  categoryKeyToCloudId: {},
  categoryCloudIdToKey: {},
  cardKeyToCloudId: {},
  cardCloudIdToKey: {},
  getWorkspaceLastActivity: vi.fn(),
}))

const mockFetchWorkspaceData = vi.fn()
const mockGetWorkspaceLastActivity = vi.fn()

vi.mock('@/lib/adapters/registry', () => ({
  getStorage: vi.fn(() => ({
    fetchWorkspaceData: mockFetchWorkspaceData,
    getWorkspaceLastActivity: mockGetWorkspaceLastActivity,
  })),
  getAuth: vi.fn(),
  setAdapters: vi.fn(),
}))

describe('Store Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

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

  describe('setCurrentMonth', () => {
    it('should update currentMonth and currentYear', () => {
      const { setCurrentMonth } = useExpenseStore.getState()

      setCurrentMonth('2026-03')

      const state = useExpenseStore.getState()
      expect(state.currentMonth).toBe('2026-03')
      expect(state.currentYear).toBe('2026')
    })

    it('should update currentYear when month is in a different year', () => {
      const { setCurrentMonth } = useExpenseStore.getState()

      setCurrentMonth('2027-12')

      expect(useExpenseStore.getState().currentYear).toBe('2027')
    })
  })

  describe('setCurrentYear', () => {
    it('should update currentYear', () => {
      const { setCurrentYear } = useExpenseStore.getState()

      setCurrentYear('2027')

      expect(useExpenseStore.getState().currentYear).toBe('2027')
    })

    it('should adjust currentMonth when it is not in the new year', () => {
      useExpenseStore.setState({ currentMonth: '2025-06', currentYear: '2025' })
      const { setCurrentYear } = useExpenseStore.getState()

      setCurrentYear('2027')

      const { currentMonth } = useExpenseStore.getState()
      expect(currentMonth.startsWith('2027')).toBe(true)
    })
  })

  describe('getAvailableYears', () => {
    it('should always include current real year', () => {
      const { getAvailableYears } = useExpenseStore.getState()

      const years = getAvailableYears()
      const currentYear = new Date().getFullYear().toString()
      expect(years).toContain(currentYear)
    })

    it('should include years from existing monthlyData', () => {
      useExpenseStore.setState({
        monthlyData: {
          '2023-01': {
            month: '2023-01',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
          '2024-06': {
            month: '2024-06',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
        },
      })
      const { getAvailableYears } = useExpenseStore.getState()

      const years = getAvailableYears()
      expect(years).toContain('2023')
      expect(years).toContain('2024')
    })

    it('should return years in descending order', () => {
      useExpenseStore.setState({
        monthlyData: {
          '2023-01': {
            month: '2023-01',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
          '2025-01': {
            month: '2025-01',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
        },
      })
      const { getAvailableYears } = useExpenseStore.getState()

      const years = getAvailableYears()
      expect(years.indexOf('2025')).toBeLessThan(years.indexOf('2023'))
    })
  })

  describe('getMonthsForYear', () => {
    it('should return months for a given year', () => {
      useExpenseStore.setState({
        monthlyData: {
          '2025-01': {
            month: '2025-01',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
          '2025-03': {
            month: '2025-03',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
          '2024-12': {
            month: '2024-12',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
        },
      })
      const { getMonthsForYear } = useExpenseStore.getState()

      const months = getMonthsForYear('2025')
      expect(months).toHaveLength(2)
      expect(months.every((m) => m.month.startsWith('2025'))).toBe(true)
    })

    it('should return empty array if no months for year', () => {
      const { getMonthsForYear } = useExpenseStore.getState()

      const months = getMonthsForYear('2099')
      expect(months).toHaveLength(0)
    })
  })

  describe('deleteYearData', () => {
    it('should remove all monthlyData for the given year', () => {
      useExpenseStore.setState({
        monthlyData: {
          '2024-01': {
            month: '2024-01',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
          '2024-06': {
            month: '2024-06',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
          '2025-01': {
            month: '2025-01',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
        },
      })
      const { deleteYearData } = useExpenseStore.getState()

      deleteYearData('2024')

      const state = useExpenseStore.getState()
      expect(state.monthlyData['2024-01']).toBeUndefined()
      expect(state.monthlyData['2024-06']).toBeUndefined()
      expect(state.monthlyData['2025-01']).toBeDefined()
    })

    it('should also remove installments starting in the deleted year', () => {
      useExpenseStore.setState({
        monthlyData: {
          '2024-01': {
            month: '2024-01',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
        },
        installments: [
          {
            id: 'inst-1',
            name: 'Old Installment',
            card: 'nubank',
            totalInstallments: 12,
            amountPerInstallment: 100,
            startMonth: '2024-01',
          },
          {
            id: 'inst-2',
            name: 'Current Installment',
            card: 'nubank',
            totalInstallments: 12,
            amountPerInstallment: 200,
            startMonth: '2025-01',
          },
        ],
      })
      const { deleteYearData } = useExpenseStore.getState()

      deleteYearData('2024')

      const state = useExpenseStore.getState()
      expect(state.installments).toHaveLength(1)
      expect(state.installments[0].id).toBe('inst-2')
    })
  })

  describe('deleteAllData', () => {
    it('should clear all monthly data and installments', () => {
      useExpenseStore.setState({
        monthlyData: {
          '2025-01': {
            month: '2025-01',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
          '2024-12': {
            month: '2024-12',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
        },
        installments: [
          {
            id: 'i1',
            name: 'Test',
            card: 'card',
            totalInstallments: 3,
            amountPerInstallment: 100,
            startMonth: '2025-01',
          },
        ],
      })
      const { deleteAllData } = useExpenseStore.getState()

      deleteAllData()

      const state = useExpenseStore.getState()
      expect(Object.keys(state.monthlyData)).toHaveLength(0)
      expect(state.installments).toHaveLength(0)
    })
  })

  describe('initializeCategories', () => {
    it('should populate categories with defaults when empty', () => {
      const { initializeCategories } = useExpenseStore.getState()

      initializeCategories()

      const { categories } = useExpenseStore.getState()
      expect(categories.length).toBeGreaterThan(0)
      expect(categories.find((c) => c.id === 'other')).toBeDefined()
    })

    it('should not overwrite existing categories', () => {
      useExpenseStore.setState({
        categories: [{ id: 'custom', color: '#ff0000', icon: null, isSystem: false, order: 0 }],
      })
      const { initializeCategories } = useExpenseStore.getState()

      initializeCategories()

      const { categories } = useExpenseStore.getState()
      expect(categories).toHaveLength(1)
      expect(categories[0].id).toBe('custom')
    })
  })

  describe('deleteYearData — currentMonth in deleted year', () => {
    it('should reset currentMonth when deleting the year that contains it', () => {
      useExpenseStore.setState({
        currentMonth: '2023-06',
        currentYear: '2023',
        monthlyData: {
          '2023-06': {
            month: '2023-06',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
        },
        installments: [],
      })
      const { deleteYearData } = useExpenseStore.getState()

      deleteYearData('2023')

      const state = useExpenseStore.getState()
      expect(state.currentMonth).not.toBe('2023-06')
    })
  })

  describe('loadWorkspace', () => {
    const emptyWorkspaceData: WorkspaceData = {
      categories: [],
      creditCards: [],
      monthlyDataList: [],
      incomes: [],
      expenses: [],
      installments: [],
      notes: [],
    }

    it('should load workspace data into the store', async () => {
      mockFetchWorkspaceData.mockResolvedValueOnce({
        ...emptyWorkspaceData,
        categories: [
          {
            id: 'cat-1',
            categoryId: 'groceries',
            color: '#10b981',
            icon: 'ShoppingCart',
            isSystem: false,
            order: 0,
            label: 'Groceries',
          },
        ],
        creditCards: [
          { id: 'cc-1', cardId: 'nubank', name: 'Nubank', color: '#8b5cf6', limit: 3000, order: 0 },
        ],
        monthlyDataList: [{ id: '2025-01', month: '2025-01', investments: 1000, savings: 500 }],
        incomes: [
          {
            id: 'inc-1',
            monthlyDataId: '2025-01',
            description: 'Salário',
            amount: 5000,
            recurringGroupId: null,
          },
        ],
        expenses: [
          {
            id: 'exp-1',
            monthlyDataId: '2025-01',
            type: 'fixed',
            description: 'Aluguel',
            amount: 1500,
            categoryId: 'housing',
            date: '2025-01-01',
            installmentId: null,
            recurringGroupId: null,
          },
        ],
        installments: [],
      })

      await useExpenseStore.getState().loadWorkspace('ws-id', 'workspace-ws-id')

      const state = useExpenseStore.getState()
      expect(state.categories).toHaveLength(1)
      expect(state.creditCards).toHaveLength(1)
      expect(state.creditCards[0].name).toBe('Nubank')
      expect(state.monthlyData['2025-01']).toBeDefined()
      expect(state.monthlyData['2025-01'].incomes).toHaveLength(1)
      expect(state.isLoading).toBe(false)
    })

    it('should set isLoading to false and rethrow on error', async () => {
      mockFetchWorkspaceData.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        useExpenseStore.getState().loadWorkspace('ws-id', 'workspace-ws-id')
      ).rejects.toThrow('Network error')

      expect(useExpenseStore.getState().isLoading).toBe(false)
    })
  })

  describe('checkAndSync', () => {
    it('should return early when workspaceId is not set', async () => {
      useSyncStore.setState({ workspaceId: null, workspaceGroup: null })

      await expect(useExpenseStore.getState().checkAndSync()).resolves.toBeUndefined()
    })

    it('should not sync when lastActivity is older than lastSyncedAt', async () => {
      const now = Date.now()
      useSyncStore.setState({
        workspaceId: 'ws-1',
        workspaceGroup: 'workspace-ws-1',
        lastSyncedAt: now,
      })
      const oldDate = new Date(now - 10000)
      mockGetWorkspaceLastActivity.mockResolvedValueOnce(oldDate)

      await useExpenseStore.getState().checkAndSync()

      // No load should have been triggered (fetchWorkspaceData should not have been called)
      expect(mockFetchWorkspaceData).not.toHaveBeenCalled()
    })

    it('should sync when lastSyncedAt is null', async () => {
      useSyncStore.setState({
        workspaceId: 'ws-1',
        workspaceGroup: 'workspace-ws-1',
        lastSyncedAt: null,
      })
      mockGetWorkspaceLastActivity.mockResolvedValueOnce(new Date())
      mockFetchWorkspaceData.mockResolvedValueOnce({
        categories: [],
        creditCards: [],
        monthlyDataList: [],
        incomes: [],
        expenses: [],
        installments: [],
        notes: [],
      })

      await useExpenseStore.getState().checkAndSync()

      expect(mockFetchWorkspaceData).toHaveBeenCalledWith('workspace-ws-1')
    })
  })
})
