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

describe('Goals Management', () => {
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

  describe('addGoal', () => {
    it('should add a goal with active status and a createdAt timestamp', () => {
      const { addGoal } = useExpenseStore.getState()

      addGoal({
        name: 'Viagem para Europa',
        icon: 'Plane',
        color: '#3b82f6',
        targetAmount: 10000,
      })

      const { goals } = useExpenseStore.getState()
      expect(goals).toHaveLength(1)
      expect(goals[0].name).toBe('Viagem para Europa')
      expect(goals[0].status).toBe('active')
      expect(goals[0].createdAt).toBeDefined()
      expect(goals[0].id).toBeDefined()
    })

    it('should auto-generate a unique id for each goal', () => {
      const { addGoal } = useExpenseStore.getState()

      addGoal({ name: 'Meta 1', icon: 'Target', color: '#f00', targetAmount: 1000 })
      addGoal({ name: 'Meta 2', icon: 'Target', color: '#0f0', targetAmount: 2000 })

      const { goals } = useExpenseStore.getState()
      expect(goals[0].id).not.toBe(goals[1].id)
    })

    it('should support optional deadline', () => {
      const { addGoal } = useExpenseStore.getState()

      addGoal({
        name: 'Com prazo',
        icon: 'Target',
        color: '#000',
        targetAmount: 5000,
        deadline: '2026-12',
      })

      const { goals } = useExpenseStore.getState()
      expect(goals[0].deadline).toBe('2026-12')
    })
  })

  describe('completeGoal', () => {
    it('should set status to completed and set completedAt', () => {
      const { addGoal, completeGoal } = useExpenseStore.getState()
      addGoal({ name: 'Meta', icon: 'Target', color: '#000', targetAmount: 1000 })
      const goalId = useExpenseStore.getState().goals[0].id

      completeGoal(goalId)

      const goal = useExpenseStore.getState().goals[0]
      expect(goal.status).toBe('completed')
      expect(goal.completedAt).toBeDefined()
    })
  })

  describe('reactivateGoal', () => {
    it('should set status back to active and clear completedAt', () => {
      const { addGoal, completeGoal, reactivateGoal } = useExpenseStore.getState()
      addGoal({ name: 'Meta', icon: 'Target', color: '#000', targetAmount: 1000 })
      const goalId = useExpenseStore.getState().goals[0].id

      completeGoal(goalId)
      reactivateGoal(goalId)

      const goal = useExpenseStore.getState().goals[0]
      expect(goal.status).toBe('active')
      expect(goal.completedAt).toBeUndefined()
    })
  })

  describe('deleteGoal', () => {
    it('should remove the goal from the array', () => {
      const { addGoal, deleteGoal } = useExpenseStore.getState()
      addGoal({ name: 'Meta', icon: 'Target', color: '#000', targetAmount: 1000 })
      const goalId = useExpenseStore.getState().goals[0].id

      deleteGoal(goalId)

      expect(useExpenseStore.getState().goals).toHaveLength(0)
    })

    it('should unlink savings entries from the deleted goal', () => {
      const { addGoal, addSavingsEntry, deleteGoal, getMonthData } = useExpenseStore.getState()
      addGoal({ name: 'Meta', icon: 'Target', color: '#000', targetAmount: 1000 })
      const goalId = useExpenseStore.getState().goals[0].id

      addSavingsEntry('2025-01', {
        amount: 500,
        date: '2025-01-10',
        confirmed: true,
        goalId,
        monthKey: '2025-01',
      })

      deleteGoal(goalId)

      const entries = getMonthData('2025-01').savingsEntries
      expect(entries[0].goalId).toBeUndefined()
    })

    it('should only remove the targeted goal', () => {
      const { addGoal, deleteGoal } = useExpenseStore.getState()
      addGoal({ name: 'Meta 1', icon: 'Target', color: '#000', targetAmount: 1000 })
      addGoal({ name: 'Meta 2', icon: 'Target', color: '#111', targetAmount: 2000 })
      const goals = useExpenseStore.getState().goals
      const firstId = goals[0].id

      deleteGoal(firstId)

      const remaining = useExpenseStore.getState().goals
      expect(remaining).toHaveLength(1)
      expect(remaining[0].name).toBe('Meta 2')
    })
  })

  describe('getSavingsEntriesForGoal', () => {
    it('should return all entries across months that match the goalId', () => {
      const { addGoal, addSavingsEntry, getSavingsEntriesForGoal } = useExpenseStore.getState()
      addGoal({ name: 'Meta', icon: 'Target', color: '#000', targetAmount: 5000 })
      const goalId = useExpenseStore.getState().goals[0].id

      addSavingsEntry('2025-01', {
        amount: 500,
        date: '2025-01-10',
        confirmed: true,
        goalId,
        monthKey: '2025-01',
      })
      addSavingsEntry('2025-02', {
        amount: 600,
        date: '2025-02-05',
        confirmed: true,
        goalId,
        monthKey: '2025-02',
      })
      addSavingsEntry('2025-01', {
        amount: 200,
        date: '2025-01-20',
        confirmed: false,
        monthKey: '2025-01',
        // no goalId — different entry
      })

      const entries = getSavingsEntriesForGoal(goalId)
      expect(entries).toHaveLength(2)
      expect(entries.every((e) => e.goalId === goalId)).toBe(true)
    })

    it('should return empty array when no entries match', () => {
      const { addGoal, getSavingsEntriesForGoal } = useExpenseStore.getState()
      addGoal({ name: 'Meta', icon: 'Target', color: '#000', targetAmount: 1000 })
      const goalId = useExpenseStore.getState().goals[0].id

      const entries = getSavingsEntriesForGoal(goalId)
      expect(entries).toHaveLength(0)
    })
  })
})
