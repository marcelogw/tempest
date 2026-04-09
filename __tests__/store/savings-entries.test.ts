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

describe('Savings Entries Management', () => {
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
      goals: [],
    })

    useSyncStore.setState({
      workspaceId: null,
      workspaceGroup: null,
      userEmail: null,
      errorMessage: null,
      lastSyncedAt: null,
    })
  })

  describe('addSavingsEntry', () => {
    it('should add an entry to the month', () => {
      const { addSavingsEntry, getMonthData } = useExpenseStore.getState()

      addSavingsEntry('2025-01', {
        amount: 500,
        date: '2025-01-15',
        confirmed: true,
      })

      const monthData = getMonthData('2025-01')
      expect(monthData.savingsEntries).toHaveLength(1)
      expect(monthData.savingsEntries[0].amount).toBe(500)
      expect(monthData.savingsEntries[0].confirmed).toBe(true)
    })

    it('should auto-generate an id for the entry', () => {
      const { addSavingsEntry, getMonthData } = useExpenseStore.getState()

      addSavingsEntry('2025-01', {
        amount: 300,
        date: '2025-01-10',
        confirmed: false,
      })

      const monthData = getMonthData('2025-01')
      expect(monthData.savingsEntries[0].id).toBeDefined()
      expect(typeof monthData.savingsEntries[0].id).toBe('string')
    })

    it('should auto-initialize month when adding entry to new month', () => {
      const { addSavingsEntry, getMonthData } = useExpenseStore.getState()

      addSavingsEntry('2025-09', {
        amount: 1000,
        date: '2025-09-05',
        confirmed: true,
      })

      const monthData = getMonthData('2025-09')
      expect(monthData.savingsEntries).toHaveLength(1)
    })

    it('should support optional source, note, and goalId fields', () => {
      const { addSavingsEntry, getMonthData } = useExpenseStore.getState()

      addSavingsEntry('2025-01', {
        amount: 200,
        date: '2025-01-20',
        confirmed: true,
        source: 'Nubank',
        note: 'Reserva de emergência',
        goalId: 'goal-1',
      })

      const entry = getMonthData('2025-01').savingsEntries[0]
      expect(entry.source).toBe('Nubank')
      expect(entry.note).toBe('Reserva de emergência')
      expect(entry.goalId).toBe('goal-1')
    })

    it('should accumulate multiple entries in the same month', () => {
      const { addSavingsEntry, getMonthData } = useExpenseStore.getState()

      addSavingsEntry('2025-01', { amount: 500, date: '2025-01-01', confirmed: true })
      addSavingsEntry('2025-01', { amount: 300, date: '2025-01-15', confirmed: false })

      const monthData = getMonthData('2025-01')
      expect(monthData.savingsEntries).toHaveLength(2)
    })
  })

  describe('updateSavingsEntry', () => {
    it('should update an existing entry by id', () => {
      const { addSavingsEntry, updateSavingsEntry, getMonthData } = useExpenseStore.getState()

      addSavingsEntry('2025-01', { amount: 500, date: '2025-01-15', confirmed: false })
      const entry = getMonthData('2025-01').savingsEntries[0]

      updateSavingsEntry('2025-01', { ...entry, amount: 800, confirmed: true })

      const updated = getMonthData('2025-01').savingsEntries[0]
      expect(updated.amount).toBe(800)
      expect(updated.confirmed).toBe(true)
    })

    it('should not affect other entries when updating one', () => {
      const { addSavingsEntry, updateSavingsEntry, getMonthData } = useExpenseStore.getState()

      addSavingsEntry('2025-01', { amount: 100, date: '2025-01-01', confirmed: true })
      addSavingsEntry('2025-01', { amount: 200, date: '2025-01-10', confirmed: true })
      const entries = getMonthData('2025-01').savingsEntries

      updateSavingsEntry('2025-01', { ...entries[0], amount: 999 })

      const result = getMonthData('2025-01').savingsEntries
      expect(result).toHaveLength(2)
      expect(result.find((e) => e.id === entries[1].id)?.amount).toBe(200)
    })
  })

  describe('removeSavingsEntry', () => {
    it('should remove an entry by id', () => {
      const { addSavingsEntry, removeSavingsEntry, getMonthData } = useExpenseStore.getState()

      addSavingsEntry('2025-01', { amount: 400, date: '2025-01-05', confirmed: true })
      const entry = getMonthData('2025-01').savingsEntries[0]

      removeSavingsEntry('2025-01', entry.id)

      expect(getMonthData('2025-01').savingsEntries).toHaveLength(0)
    })

    it('should only remove the targeted entry', () => {
      const { addSavingsEntry, removeSavingsEntry, getMonthData } = useExpenseStore.getState()

      addSavingsEntry('2025-01', { amount: 100, date: '2025-01-01', confirmed: true })
      addSavingsEntry('2025-01', { amount: 200, date: '2025-01-10', confirmed: true })
      const entries = getMonthData('2025-01').savingsEntries

      removeSavingsEntry('2025-01', entries[0].id)

      const result = getMonthData('2025-01').savingsEntries
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(entries[1].id)
    })
  })
})
