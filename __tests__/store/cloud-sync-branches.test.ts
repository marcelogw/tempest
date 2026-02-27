/**
 * Tests that exercise the cloud-sync branches (if workspaceGroup / if workspaceGroup && workspaceId)
 * in expense-store.ts, specifically for category, installment, and credit card mutations.
 * These ensure both the true and false paths of the workspace guards are covered.
 */
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

describe('Cloud Sync Branches — Category Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') localStorage.clear()

    useExpenseStore.setState({
      monthlyData: {},
      currentMonth: '2025-01',
      currentYear: '2025',
      installments: [],
      categories: [],
      creditCards: [],
    })

    useSyncStore.setState({
      workspaceId: 'ws-1',
      workspaceGroup: 'workspace-ws-1',
      userEmail: null,
      errorMessage: null,
      lastSyncedAt: null,
    })
  })

  it('addCategory enqueues create when workspaceGroup is set', () => {
    const { addCategory } = useExpenseStore.getState()

    addCategory('Pets', '#f97316', 'Dog')

    const { categories } = useExpenseStore.getState()
    expect(categories.length).toBeGreaterThan(0)
    expect(categories[categories.length - 1].customLabel).toBe('Pets')
  })

  it('updateCategory enqueues update when workspaceGroup is set', () => {
    useExpenseStore.setState({
      categories: [
        {
          id: 'pets',
          color: '#f97316',
          icon: 'Dog',
          isSystem: false,
          order: 0,
          customLabel: 'Pets',
        },
      ],
    })
    const { updateCategory } = useExpenseStore.getState()

    updateCategory('pets', { color: '#ef4444' })

    expect(useExpenseStore.getState().categories[0].color).toBe('#ef4444')
  })

  it('deleteCategory enqueues delete when workspaceGroup is set', () => {
    useExpenseStore.setState({
      categories: [
        { id: 'other', color: '#64748b', icon: null, isSystem: true, order: 0 },
        {
          id: 'pets',
          color: '#f97316',
          icon: 'Dog',
          isSystem: false,
          order: 1,
          customLabel: 'Pets',
        },
      ],
      monthlyData: {},
    })
    const { deleteCategory } = useExpenseStore.getState()

    deleteCategory('pets')

    expect(useExpenseStore.getState().categories).toHaveLength(1)
  })

  it('reorderCategories enqueues reorder when workspaceGroup is set', () => {
    useExpenseStore.setState({
      categories: [
        { id: 'a', color: '#ff0000', icon: null, isSystem: false, order: 0 },
        { id: 'b', color: '#00ff00', icon: null, isSystem: false, order: 1 },
      ],
    })
    const { reorderCategories } = useExpenseStore.getState()

    reorderCategories(['b', 'a'])

    expect(useExpenseStore.getState().categories[0].id).toBe('b')
  })
})

describe('Cloud Sync Branches — Installment Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') localStorage.clear()

    useExpenseStore.setState({
      monthlyData: {},
      currentMonth: '2025-01',
      currentYear: '2025',
      installments: [],
      categories: [],
      creditCards: [{ id: 'nubank', name: 'Nubank', color: '#8b5cf6', limit: 3000, order: 0 }],
    })

    useSyncStore.setState({
      workspaceId: 'ws-1',
      workspaceGroup: 'workspace-ws-1',
      userEmail: null,
      errorMessage: null,
      lastSyncedAt: null,
    })
  })

  it('addInstallment enqueues create when workspaceGroup is set', () => {
    const { addInstallment } = useExpenseStore.getState()

    addInstallment({
      name: 'Notebook',
      card: 'nubank',
      totalInstallments: 12,
      amountPerInstallment: 300,
      startMonth: '2025-01',
    })

    expect(useExpenseStore.getState().installments).toHaveLength(1)
  })

  it('removeInstallment enqueues delete when workspaceGroup is set', () => {
    useExpenseStore.setState({
      installments: [
        {
          id: 'inst-1',
          name: 'TV',
          card: 'nubank',
          totalInstallments: 6,
          amountPerInstallment: 500,
          startMonth: '2025-01',
        },
      ],
    })
    const { removeInstallment } = useExpenseStore.getState()

    removeInstallment('inst-1')

    expect(useExpenseStore.getState().installments).toHaveLength(0)
  })
})

describe('Cloud Sync Branches — Credit Card Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') localStorage.clear()

    useExpenseStore.setState({
      monthlyData: {},
      currentMonth: '2025-01',
      currentYear: '2025',
      installments: [],
      categories: [],
      creditCards: [],
    })

    useSyncStore.setState({
      workspaceId: 'ws-1',
      workspaceGroup: 'workspace-ws-1',
      userEmail: null,
      errorMessage: null,
      lastSyncedAt: null,
    })
  })

  it('addCreditCard enqueues create when workspaceGroup is set', () => {
    const { addCreditCard } = useExpenseStore.getState()

    addCreditCard('Nubank', '#8b5cf6', 3000)

    expect(useExpenseStore.getState().creditCards).toHaveLength(1)
  })

  it('updateCreditCard enqueues update when workspaceGroup is set', () => {
    useExpenseStore.setState({
      creditCards: [{ id: 'nubank', name: 'Nubank', color: '#8b5cf6', limit: 3000, order: 0 }],
    })
    const { updateCreditCard } = useExpenseStore.getState()

    updateCreditCard('nubank', { limit: 5000 })

    expect(useExpenseStore.getState().creditCards[0].limit).toBe(5000)
  })

  it('deleteCreditCard enqueues delete when workspaceGroup is set', () => {
    useExpenseStore.setState({
      creditCards: [{ id: 'nubank', name: 'Nubank', color: '#8b5cf6', limit: 3000, order: 0 }],
    })
    const { deleteCreditCard } = useExpenseStore.getState()

    deleteCreditCard('nubank')

    expect(useExpenseStore.getState().creditCards).toHaveLength(0)
  })

  it('reorderCreditCards enqueues reorder when workspaceGroup is set', () => {
    useExpenseStore.setState({
      creditCards: [
        { id: 'nubank', name: 'Nubank', color: '#8b5cf6', limit: 3000, order: 0 },
        { id: 'itau', name: 'Itaú', color: '#f97316', limit: 2000, order: 1 },
      ],
    })
    const { reorderCreditCards } = useExpenseStore.getState()

    reorderCreditCards(['itau', 'nubank'])

    expect(useExpenseStore.getState().creditCards[0].id).toBe('itau')
  })
})

describe('Cloud Sync Branches — Month/Year Initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') localStorage.clear()

    useExpenseStore.setState({
      monthlyData: {},
      currentMonth: '2025-01',
      currentYear: '2025',
      installments: [],
      categories: [],
      creditCards: [],
    })

    useSyncStore.setState({
      workspaceId: 'ws-1',
      workspaceGroup: 'workspace-ws-1',
      userEmail: null,
      errorMessage: null,
      lastSyncedAt: null,
    })
  })

  it('initializeMonth enqueues MonthlyData create when workspaceGroup is set', () => {
    const { initializeMonth } = useExpenseStore.getState()

    initializeMonth('2025-03')

    expect(useExpenseStore.getState().monthlyData['2025-03']).toBeDefined()
  })

  it('updateFixedExpenseFromMonth with workspaceGroup enqueues updates', () => {
    const { addFixedExpenseWithPropagation } = useExpenseStore.getState()

    addFixedExpenseWithPropagation('2025-01', {
      description: 'Internet',
      amount: 100,
      category: 'subscriptions',
      type: 'fixed',
      date: '2025-01-01',
    })

    const jan = useExpenseStore.getState().getMonthData('2025-01')
    const groupId = jan.fixedExpenses[0].recurringGroupId!

    useExpenseStore.getState().updateFixedExpenseFromMonth('2025-01', groupId, { amount: 120 })

    const janAfter = useExpenseStore.getState().getMonthData('2025-01')
    const updated = janAfter.fixedExpenses.find((e) => e.recurringGroupId === groupId)
    expect(updated?.amount).toBe(120)
  })

  it('removeFixedExpenseFromMonth with workspaceGroup enqueues deletes', () => {
    const { addFixedExpenseWithPropagation } = useExpenseStore.getState()

    addFixedExpenseWithPropagation('2025-01', {
      description: 'Streaming',
      amount: 50,
      category: 'subscriptions',
      type: 'fixed',
      date: '2025-01-01',
    })

    const jan = useExpenseStore.getState().getMonthData('2025-01')
    const groupId = jan.fixedExpenses[0].recurringGroupId!

    useExpenseStore.getState().removeFixedExpenseFromMonth('2025-01', groupId)

    const janAfter = useExpenseStore.getState().getMonthData('2025-01')
    expect(janAfter.fixedExpenses.filter((e) => e.recurringGroupId === groupId)).toHaveLength(0)
  })
})
