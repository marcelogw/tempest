import { describe, it, expect, beforeEach } from 'vitest'
import { useExpenseStore } from '@/lib/expense-store'

describe('Month Logic', () => {
  beforeEach(() => {
    // Reset store before each test
    useExpenseStore.setState({
      monthlyData: {},
      currentMonth: '2025-01',
      currentYear: '2025',
      installments: [],
    })
  })

  describe('setCurrentMonth', () => {
    it('should set current month and sync year', () => {
      const { setCurrentMonth } = useExpenseStore.getState()

      setCurrentMonth('2024-12')

      const state = useExpenseStore.getState()
      expect(state.currentMonth).toBe('2024-12')
      expect(state.currentYear).toBe('2024')
    })

    it('should initialize month if it does not exist', () => {
      const { setCurrentMonth } = useExpenseStore.getState()

      setCurrentMonth('2026-03')

      const state = useExpenseStore.getState()
      expect(state.monthlyData['2026-03']).toBeDefined()
      expect(state.monthlyData['2026-03'].month).toBe('2026-03')
      expect(state.monthlyData['2026-03'].incomes).toEqual([])
      expect(state.monthlyData['2026-03'].fixedExpenses).toEqual([])
      expect(state.monthlyData['2026-03'].variableExpenses).toEqual([])
    })

    it('should not reinitialize existing month', () => {
      const { setCurrentMonth } = useExpenseStore.getState()

      // First, create month with data
      useExpenseStore.setState({
        monthlyData: {
          '2025-05': {
            month: '2025-05',
            incomes: [{ id: '1', description: 'Salário', amount: 5000 }],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 1000,
            savings: 500,
          },
        },
      })

      setCurrentMonth('2025-05')

      const state = useExpenseStore.getState()
      expect(state.monthlyData['2025-05'].incomes[0].amount).toBe(5000)
      expect(state.monthlyData['2025-05'].investments).toBe(1000)
    })
  })

  describe('setCurrentYear', () => {
    it('should set current year', () => {
      const { setCurrentYear } = useExpenseStore.getState()

      setCurrentYear('2024')

      const state = useExpenseStore.getState()
      expect(state.currentYear).toBe('2024')
    })

    it('should adjust month to January when setting different year', () => {
      useExpenseStore.setState({
        currentMonth: '2025-06',
        currentYear: '2025',
      })

      const { setCurrentYear } = useExpenseStore.getState()
      setCurrentYear('2024')

      const state = useExpenseStore.getState()
      expect(state.currentMonth).toBe('2024-01')
      expect(state.currentYear).toBe('2024')
    })

    it('should not change month when setting same year', () => {
      useExpenseStore.setState({
        currentMonth: '2025-06',
        currentYear: '2025',
      })

      const { setCurrentYear } = useExpenseStore.getState()
      setCurrentYear('2025')

      const state = useExpenseStore.getState()
      expect(state.currentMonth).toBe('2025-06')
    })
  })

  describe('getAvailableYears', () => {
    it('should always include current year', () => {
      const { getAvailableYears } = useExpenseStore.getState()
      const currentYear = new Date().getFullYear().toString()

      const years = getAvailableYears()

      expect(years).toContain(currentYear)
    })

    it('should include years from monthlyData', () => {
      useExpenseStore.setState({
        monthlyData: {
          '2023-05': {
            month: '2023-05',
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
      const currentYear = new Date().getFullYear()

      useExpenseStore.setState({
        monthlyData: {
          '2023-05': {
            month: '2023-05',
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
          [`${currentYear}-01`]: {
            month: `${currentYear}-01`,
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

      expect(years[0] >= years[1]).toBeTruthy()
      expect(years[1] >= years[2]).toBeTruthy()
    })

    it('should not duplicate years', () => {
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

      const { getAvailableYears } = useExpenseStore.getState()
      const years = getAvailableYears()

      const year2024Count = years.filter((y) => y === '2024').length
      expect(year2024Count).toBe(1)
    })
  })

  describe('getMonthsForYear', () => {
    it('should filter months by year', () => {
      useExpenseStore.setState({
        monthlyData: {
          '2024-11': {
            month: '2024-11',
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
          '2025-01': {
            month: '2025-01',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
          '2025-02': {
            month: '2025-02',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
        },
      })

      const { getMonthsForYear } = useExpenseStore.getState()
      const months2024 = getMonthsForYear('2024')
      const months2025 = getMonthsForYear('2025')

      expect(months2024).toHaveLength(2)
      expect(months2024[0].month).toBe('2024-11')
      expect(months2024[1].month).toBe('2024-12')

      expect(months2025).toHaveLength(2)
      expect(months2025[0].month).toBe('2025-01')
      expect(months2025[1].month).toBe('2025-02')
    })

    it('should return months in ascending order', () => {
      useExpenseStore.setState({
        monthlyData: {
          '2024-12': {
            month: '2024-12',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
          '2024-03': {
            month: '2024-03',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
          '2024-07': {
            month: '2024-07',
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 0,
            savings: 0,
          },
        },
      })

      const { getMonthsForYear } = useExpenseStore.getState()
      const months = getMonthsForYear('2024')

      expect(months[0].month).toBe('2024-03')
      expect(months[1].month).toBe('2024-07')
      expect(months[2].month).toBe('2024-12')
    })

    it('should return empty array for year without data', () => {
      const { getMonthsForYear } = useExpenseStore.getState()
      const months = getMonthsForYear('2020')

      expect(months).toEqual([])
    })
  })

  describe('initializeMonth', () => {
    it('should create empty month if not exists', () => {
      const { initializeMonth } = useExpenseStore.getState()

      initializeMonth('2026-08')

      const state = useExpenseStore.getState()
      expect(state.monthlyData['2026-08']).toBeDefined()
      expect(state.monthlyData['2026-08'].incomes).toEqual([])
    })

    it('should not overwrite existing month', () => {
      useExpenseStore.setState({
        monthlyData: {
          '2025-05': {
            month: '2025-05',
            incomes: [{ id: '1', description: 'Salário', amount: 3000 }],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 500,
            savings: 200,
          },
        },
      })

      const { initializeMonth } = useExpenseStore.getState()
      initializeMonth('2025-05')

      const state = useExpenseStore.getState()
      expect(state.monthlyData['2025-05'].incomes[0].amount).toBe(3000)
      expect(state.monthlyData['2025-05'].investments).toBe(500)
    })
  })

  describe('getMonthData', () => {
    it('should return existing month data', () => {
      useExpenseStore.setState({
        monthlyData: {
          '2025-03': {
            month: '2025-03',
            incomes: [{ id: '1', description: 'Salário', amount: 4000 }],
            fixedExpenses: [],
            variableExpenses: [],
            investments: 800,
            savings: 300,
          },
        },
      })

      const { getMonthData } = useExpenseStore.getState()
      const data = getMonthData('2025-03')

      expect(data.incomes[0].amount).toBe(4000)
      expect(data.investments).toBe(800)
    })

    it('should return empty month data if not exists without persisting', () => {
      const { getMonthData } = useExpenseStore.getState()
      const data = getMonthData('2026-10')

      expect(data).toBeDefined()
      expect(data.month).toBe('2026-10')
      expect(data.incomes).toEqual([])

      // Verify it was NOT persisted to store
      const state = useExpenseStore.getState()
      expect(state.monthlyData['2026-10']).toBeUndefined()
    })

    it('should create new month data each time for non-existent months', () => {
      const { getMonthData } = useExpenseStore.getState()
      const data1 = getMonthData('2026-11')
      const data2 = getMonthData('2026-11')

      // Should be different object instances
      expect(data1).not.toBe(data2)
      expect(data1.month).toBe('2026-11')
      expect(data2.month).toBe('2026-11')
    })
  })
})
