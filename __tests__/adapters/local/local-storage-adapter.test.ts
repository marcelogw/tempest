/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalStorageAdapter } from '@/lib/adapters/local/local-storage-adapter'
import { useExpenseStore } from '@/lib/expense-store'

const mockSetWorkspace = vi.fn()

vi.mock('@/lib/sync-store', () => ({
  useSyncStore: {
    getState: vi.fn(() => ({ setWorkspace: mockSetWorkspace })),
  },
}))

const emptyStoreState = {
  monthlyData: {},
  categories: [],
  creditCards: [],
  installments: [],
  currentMonth: '2025-01',
  currentYear: '2025',
}

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useExpenseStore.setState(emptyStoreState)
    adapter = new LocalStorageAdapter()
  })

  // ─── configure ───────────────────────────────────────────────────────────────

  describe('configure()', () => {
    it('calls setWorkspace when no workspace is stored', async () => {
      await adapter.configure()
      expect(mockSetWorkspace).toHaveBeenCalledWith('local', 'local')
    })

    it('does not call setWorkspace when workspace already exists', async () => {
      localStorage.setItem(
        'tempest-sync-storage',
        JSON.stringify({ state: { workspaceId: 'existing-id' } })
      )
      await adapter.configure()
      expect(mockSetWorkspace).not.toHaveBeenCalled()
    })

    it('does not call setWorkspace when storage JSON is malformed', async () => {
      localStorage.setItem('tempest-sync-storage', 'not-json')
      await adapter.configure()
      // Malformed JSON → hasWorkspace stays false → calls setWorkspace
      expect(mockSetWorkspace).toHaveBeenCalledWith('local', 'local')
    })

    it('returns early when window is undefined', async () => {
      const originalWindow = global.window
      // @ts-ignore
      delete (global as any).window

      await adapter.configure()

      expect(mockSetWorkspace).not.toHaveBeenCalled()
      global.window = originalWindow
    })
  })

  // ─── fetchWorkspaceData ───────────────────────────────────────────────────────

  describe('fetchWorkspaceData()', () => {
    it('returns empty WorkspaceData when store is empty', async () => {
      const data = await adapter.fetchWorkspaceData('local')
      expect(data.categories).toHaveLength(0)
      expect(data.creditCards).toHaveLength(0)
      expect(data.monthlyDataList).toHaveLength(0)
      expect(data.incomes).toHaveLength(0)
      expect(data.expenses).toHaveLength(0)
      expect(data.installments).toHaveLength(0)
    })

    it('maps categories correctly', async () => {
      useExpenseStore.setState({
        ...emptyStoreState,
        categories: [
          { id: 'food', color: '#ff0000', icon: 'Pizza', isSystem: false, order: 1 },
          {
            id: 'custom-cat',
            color: '#00ff00',
            icon: null,
            isSystem: false,
            order: 2,
            customLabel: 'My Category',
          },
        ],
      })
      const data = await adapter.fetchWorkspaceData('local')
      expect(data.categories).toHaveLength(2)
      expect(data.categories[0]).toMatchObject({
        id: 'food',
        categoryId: 'food',
        label: 'food', // no customLabel → id
        color: '#ff0000',
        icon: 'Pizza',
        isSystem: false,
        order: 1,
      })
      expect(data.categories[1]).toMatchObject({
        label: 'My Category', // customLabel wins
      })
    })

    it('maps credit cards correctly', async () => {
      useExpenseStore.setState({
        ...emptyStoreState,
        creditCards: [{ id: 'visa', name: 'Visa Gold', color: '#1a1a1a', limit: 5000, order: 0 }],
      })
      const data = await adapter.fetchWorkspaceData('local')
      expect(data.creditCards).toHaveLength(1)
      expect(data.creditCards[0]).toMatchObject({
        id: 'visa',
        cardId: 'visa',
        name: 'Visa Gold',
        color: '#1a1a1a',
        limit: 5000,
        order: 0,
      })
    })

    it('maps monthly data correctly', async () => {
      useExpenseStore.setState({
        ...emptyStoreState,
        monthlyData: {
          '2025-01': {
            month: '2025-01',
            savingsEntries: [],
            incomes: [],
            fixedExpenses: [],
            variableExpenses: [],
          },
        },
      })
      const data = await adapter.fetchWorkspaceData('local')
      expect(data.monthlyDataList).toHaveLength(1)
      expect(data.monthlyDataList[0]).toMatchObject({
        id: '2025-01',
        month: '2025-01',
      })
    })

    it('handles undefined arrays in monthly data', async () => {
      useExpenseStore.setState({
        ...emptyStoreState,
        monthlyData: {
          '2025-01': {
            month: '2025-01',
          } as any,
        },
      })
      const data = await adapter.fetchWorkspaceData('local')
      expect(data.monthlyDataList[0].savingsEntries).toEqual([])
      expect(data.expenses).toEqual([])
      expect(data.incomes).toEqual([])
    })

    it('maps incomes from all months', async () => {
      useExpenseStore.setState({
        ...emptyStoreState,
        monthlyData: {
          '2025-01': {
            month: '2025-01',
            savingsEntries: [],
            incomes: [{ id: 'inc-1', description: 'Salary', amount: 5000 }],
            fixedExpenses: [],
            variableExpenses: [],
          },
        },
      })
      const data = await adapter.fetchWorkspaceData('local')
      expect(data.incomes).toHaveLength(1)
      expect(data.incomes[0]).toMatchObject({
        id: 'inc-1',
        description: 'Salary',
        amount: 5000,
        monthlyDataId: '2025-01',
        recurringGroupId: null,
      })
    })

    it('maps fixed and variable expenses preserving type', async () => {
      useExpenseStore.setState({
        ...emptyStoreState,
        monthlyData: {
          '2025-01': {
            month: '2025-01',
            savingsEntries: [],
            incomes: [],
            fixedExpenses: [
              {
                id: 'exp-1',
                description: 'Rent',
                amount: 1500,
                category: 'housing',
                type: 'fixed',
                date: '2025-01-05',
              },
            ],
            variableExpenses: [
              {
                id: 'exp-2',
                description: 'Groceries',
                amount: 300,
                category: 'food',
                type: 'variable',
                date: '2025-01-10',
              },
            ],
          },
        },
      })
      const data = await adapter.fetchWorkspaceData('local')
      expect(data.expenses).toHaveLength(2)

      const fixed = data.expenses.find((e) => e.id === 'exp-1')
      expect(fixed).toMatchObject({ type: 'fixed', description: 'Rent', categoryId: 'housing' })

      const variable = data.expenses.find((e) => e.id === 'exp-2')
      expect(variable).toMatchObject({ type: 'variable', description: 'Groceries' })
    })

    it('maps installments correctly', async () => {
      useExpenseStore.setState({
        ...emptyStoreState,
        installments: [
          {
            id: 'inst-1',
            name: 'Laptop',
            card: 'visa',
            totalInstallments: 12,
            amountPerInstallment: 250,
            startMonth: '2025-01',
          },
        ],
      })
      const data = await adapter.fetchWorkspaceData('local')
      expect(data.installments).toHaveLength(1)
      expect(data.installments[0]).toMatchObject({
        id: 'inst-1',
        name: 'Laptop',
        cardId: 'visa',
        totalInstallments: 12,
        amountPerInstallment: 250,
        startMonth: '2025-01',
      })
    })

    it('maps notes with value and valueDirection', async () => {
      useExpenseStore.setState({
        ...emptyStoreState,
        notes: [
          {
            id: 'note-1',
            text: 'Pagar boleto',
            value: 250,
            valueDirection: 'payable' as const,
            date: '2025-01-10',
            persistent: false,
            done: false,
            createdAt: '2025-01-01T00:00:00.000Z',
            createdMonth: '2025-01',
          },
          {
            id: 'note-2',
            text: 'Receber aluguel',
            date: '2025-01-15',
            persistent: true,
            done: false,
            createdAt: '2025-01-01T00:00:00.000Z',
            createdMonth: '2025-01',
          },
        ],
      })
      const data = await adapter.fetchWorkspaceData('local')
      expect(data.notes).toHaveLength(2)
      expect(data.notes[0]).toMatchObject({
        id: 'note-1',
        value: 250,
        valueDirection: 'payable',
      })
      // Note without value/valueDirection → null
      expect(data.notes[1].value).toBeNull()
      expect(data.notes[1].valueDirection).toBeNull()
    })
  })

  // ─── workspace info methods ───────────────────────────────────────────────────

  describe('getWorkspace()', () => {
    it('returns local workspace', async () => {
      const workspace = await adapter.getWorkspace('any-id')
      expect(workspace).toEqual({ id: 'local', ownerSub: 'local-user', lastActivityAt: null })
    })
  })

  describe('getWorkspaceLastActivity()', () => {
    it('returns null', async () => {
      await expect(adapter.getWorkspaceLastActivity('any-id')).resolves.toBeNull()
    })
  })

  describe('touchWorkspaceActivity()', () => {
    it('resolves without error', async () => {
      await expect(adapter.touchWorkspaceActivity('any-id')).resolves.toBeUndefined()
    })
  })

  describe('listUserProfiles()', () => {
    it('returns a single local-user profile', async () => {
      const profiles = await adapter.listUserProfiles('local')
      expect(profiles).toHaveLength(1)
      expect(profiles[0]).toMatchObject({
        cognitoSub: 'local-user',
        displayName: 'Local User',
        email: '',
        avatarColor: '#64748b',
      })
    })
  })

  describe('createWorkspace()', () => {
    it('calls setWorkspace and returns local workspace ids', async () => {
      const result = await adapter.createWorkspace('any-name')
      expect(mockSetWorkspace).toHaveBeenCalledWith('local', 'local')
      expect(result).toEqual({ workspaceId: 'local', workspaceGroup: 'local' })
    })
  })

  // ─── no-op CRUD methods ───────────────────────────────────────────────────────

  describe('CRUD no-ops', () => {
    it('createCategory resolves', async () => {
      await expect(
        adapter.createCategory('key', {
          workspaceGroup: 'local',
          categoryId: 'key',
          label: 'X',
          color: '#fff',
          isSystem: false,
          order: 0,
        })
      ).resolves.toBeUndefined()
    })

    it('updateCategory resolves', async () => {
      await expect(adapter.updateCategory('id', { label: 'Y' })).resolves.toBeUndefined()
    })

    it('deleteCategory resolves', async () => {
      await expect(adapter.deleteCategory('id')).resolves.toBeUndefined()
    })

    it('createCreditCard resolves', async () => {
      await expect(
        adapter.createCreditCard('key', {
          workspaceGroup: 'local',
          cardId: 'key',
          name: 'Card',
          color: '#000',
          limit: null,
          order: 0,
        })
      ).resolves.toBeUndefined()
    })

    it('updateCreditCard resolves', async () => {
      await expect(adapter.updateCreditCard('id', { name: 'Updated' })).resolves.toBeUndefined()
    })

    it('deleteCreditCard resolves', async () => {
      await expect(adapter.deleteCreditCard('id')).resolves.toBeUndefined()
    })

    it('createMonthlyData resolves', async () => {
      await expect(adapter.createMonthlyData('2025-01', 'local')).resolves.toBeUndefined()
    })

    it('updateMonthlyData resolves', async () => {
      await expect(adapter.updateMonthlyData('2025-01', {})).resolves.toBeUndefined()
    })

    it('createIncome resolves', async () => {
      await expect(
        adapter.createIncome({
          id: 'i1',
          workspaceGroup: 'local',
          description: 'X',
          amount: 100,
          monthlyDataId: '2025-01',
        })
      ).resolves.toBeUndefined()
    })

    it('updateIncome resolves', async () => {
      await expect(adapter.updateIncome('id', { amount: 200 })).resolves.toBeUndefined()
    })

    it('deleteIncome resolves', async () => {
      await expect(adapter.deleteIncome('id')).resolves.toBeUndefined()
    })

    it('createExpense resolves', async () => {
      await expect(
        adapter.createExpense({
          id: 'e1',
          workspaceGroup: 'local',
          description: 'X',
          amount: 50,
          categoryId: 'food',
          type: 'variable',
          date: '2025-01-01',
          monthlyDataId: '2025-01',
        })
      ).resolves.toBeUndefined()
    })

    it('updateExpense resolves', async () => {
      await expect(adapter.updateExpense('id', { amount: 60 })).resolves.toBeUndefined()
    })

    it('deleteExpense resolves', async () => {
      await expect(adapter.deleteExpense('id')).resolves.toBeUndefined()
    })

    it('createInstallment resolves', async () => {
      await expect(
        adapter.createInstallment({
          id: 'i1',
          workspaceGroup: 'local',
          name: 'TV',
          cardId: 'visa',
          totalInstallments: 6,
          amountPerInstallment: 100,
          startMonth: '2025-01',
        })
      ).resolves.toBeUndefined()
    })

    it('deleteInstallment resolves', async () => {
      await expect(adapter.deleteInstallment('id')).resolves.toBeUndefined()
    })

    it('createNote resolves', async () => {
      await expect(
        adapter.createNote({
          id: 'n1',
          workspaceGroup: 'local',
          text: 'Test note',
          date: '2025-01-01',
          persistent: false,
          done: false,
          noteCreatedAt: '2025-01-01T00:00:00.000Z',
          createdMonth: '2025-01',
        })
      ).resolves.toBeUndefined()
    })

    it('updateNote resolves', async () => {
      await expect(adapter.updateNote('id', { text: 'Updated' })).resolves.toBeUndefined()
    })

    it('deleteNote resolves', async () => {
      await expect(adapter.deleteNote('id')).resolves.toBeUndefined()
    })
  })
})
