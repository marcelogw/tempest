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

describe('Notes Management', () => {
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
      notes: [],
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

  describe('addNote', () => {
    it('should add a note with generated id and createdAt', () => {
      const { addNote } = useExpenseStore.getState()

      addNote({
        text: 'Emprestei para meu irmão',
        date: '2025-01-10',
        persistent: false,
        done: false,
        createdMonth: '2025-01',
      })

      const { notes } = useExpenseStore.getState()
      expect(notes).toHaveLength(1)
      expect(notes[0].text).toBe('Emprestei para meu irmão')
      expect(notes[0].id).toBeTruthy()
      expect(notes[0].createdAt).toBeTruthy()
    })

    it('should add a note with value and direction', () => {
      const { addNote } = useExpenseStore.getState()

      addNote({
        text: 'Devo para minha irmã',
        value: 30,
        valueDirection: 'payable',
        date: '2025-01-05',
        persistent: false,
        done: false,
        createdMonth: '2025-01',
      })

      const { notes } = useExpenseStore.getState()
      expect(notes[0].value).toBe(30)
      expect(notes[0].valueDirection).toBe('payable')
    })

    it('should generate unique IDs for multiple notes', () => {
      const { addNote } = useExpenseStore.getState()

      addNote({
        text: 'Nota 1',
        date: '2025-01-01',
        persistent: false,
        done: false,
        createdMonth: '2025-01',
      })
      addNote({
        text: 'Nota 2',
        date: '2025-01-02',
        persistent: false,
        done: false,
        createdMonth: '2025-01',
      })

      const { notes } = useExpenseStore.getState()
      const ids = notes.map((n) => n.id)
      expect(new Set(ids).size).toBe(2)
    })
  })

  describe('getNotesForMonth', () => {
    it('should return notes created in the given month', () => {
      const { addNote, getNotesForMonth } = useExpenseStore.getState()

      addNote({
        text: 'Janeiro',
        date: '2025-01-01',
        persistent: false,
        done: false,
        createdMonth: '2025-01',
      })
      addNote({
        text: 'Fevereiro',
        date: '2025-02-01',
        persistent: false,
        done: false,
        createdMonth: '2025-02',
      })

      expect(getNotesForMonth('2025-01')).toHaveLength(1)
      expect(getNotesForMonth('2025-01')[0].text).toBe('Janeiro')
    })

    it('should include persistent non-done notes from previous months', () => {
      const { addNote, getNotesForMonth } = useExpenseStore.getState()

      addNote({
        text: 'Dívida pendente',
        date: '2024-12-01',
        persistent: true,
        done: false,
        createdMonth: '2024-12',
      })

      const notes = getNotesForMonth('2025-01')
      expect(notes).toHaveLength(1)
      expect(notes[0].text).toBe('Dívida pendente')
    })

    it('should NOT include persistent done notes from previous months', () => {
      const { addNote, getNotesForMonth } = useExpenseStore.getState()

      addNote({
        text: 'Dívida quitada',
        date: '2024-12-01',
        persistent: true,
        done: true,
        createdMonth: '2024-12',
      })

      expect(getNotesForMonth('2025-01')).toHaveLength(0)
    })

    it('should NOT include non-persistent notes from previous months', () => {
      const { addNote, getNotesForMonth } = useExpenseStore.getState()

      addNote({
        text: 'Nota pontual',
        date: '2024-12-01',
        persistent: false,
        done: false,
        createdMonth: '2024-12',
      })

      expect(getNotesForMonth('2025-01')).toHaveLength(0)
    })

    it('should return combined notes from current month and persistent past', () => {
      const { addNote, getNotesForMonth } = useExpenseStore.getState()

      addNote({
        text: 'Nota de dezembro',
        date: '2024-12-01',
        persistent: true,
        done: false,
        createdMonth: '2024-12',
      })
      addNote({
        text: 'Nota de janeiro',
        date: '2025-01-15',
        persistent: false,
        done: false,
        createdMonth: '2025-01',
      })

      expect(getNotesForMonth('2025-01')).toHaveLength(2)
    })
  })

  describe('updateNote', () => {
    it('should update the correct note', () => {
      const { addNote, updateNote } = useExpenseStore.getState()

      addNote({
        text: 'Original',
        date: '2025-01-01',
        persistent: false,
        done: false,
        createdMonth: '2025-01',
      })

      const { notes } = useExpenseStore.getState()
      const id = notes[0].id

      updateNote(id, { text: 'Atualizado', done: true })

      const updated = useExpenseStore.getState().notes[0]
      expect(updated.text).toBe('Atualizado')
      expect(updated.done).toBe(true)
    })

    it('should only update the targeted note', () => {
      const { addNote, updateNote } = useExpenseStore.getState()

      addNote({
        text: 'Nota A',
        date: '2025-01-01',
        persistent: false,
        done: false,
        createdMonth: '2025-01',
      })
      addNote({
        text: 'Nota B',
        date: '2025-01-02',
        persistent: false,
        done: false,
        createdMonth: '2025-01',
      })

      const { notes } = useExpenseStore.getState()
      updateNote(notes[0].id, { done: true })

      const { notes: updated } = useExpenseStore.getState()
      expect(updated[0].done).toBe(true)
      expect(updated[1].done).toBe(false)
    })
  })

  describe('removeNote', () => {
    it('should remove the correct note', () => {
      const { addNote, removeNote } = useExpenseStore.getState()

      addNote({
        text: 'Para remover',
        date: '2025-01-01',
        persistent: false,
        done: false,
        createdMonth: '2025-01',
      })
      addNote({
        text: 'Para manter',
        date: '2025-01-02',
        persistent: false,
        done: false,
        createdMonth: '2025-01',
      })

      const { notes } = useExpenseStore.getState()
      removeNote(notes[0].id)

      const { notes: remaining } = useExpenseStore.getState()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].text).toBe('Para manter')
    })
  })
})
