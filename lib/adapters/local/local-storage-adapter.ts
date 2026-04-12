import type { StorageAdapter } from '../storage-adapter'
import type {
  WorkspaceData,
  UserProfile,
  Workspace,
  CreatedWorkspace,
  CategoryInput,
  CreditCardInput,
  IncomeInput,
  ExpenseInput,
  InstallmentInput,
  MonthlyDataUpdate,
  NoteInput,
} from '../types'
import { useExpenseStore } from '@/lib/expense-store'

const LOCAL_WORKSPACE_ID = 'local'
const LOCAL_WORKSPACE_GROUP = 'local'

export class LocalStorageAdapter implements StorageAdapter {
  async configure(): Promise<void> {
    if (typeof window === 'undefined') return

    // Auto-initialize local workspace in sync store if not already set
    const raw = localStorage.getItem('tempest-sync-storage')
    let hasWorkspace = false
    if (raw) {
      try {
        const data = JSON.parse(raw) as { state?: { workspaceId?: string | null } }
        hasWorkspace = !!data.state?.workspaceId
      } catch {
        // ignore
      }
    }

    if (!hasWorkspace) {
      const { useSyncStore } = await import('@/lib/sync-store')
      useSyncStore.getState().setWorkspace(LOCAL_WORKSPACE_ID, LOCAL_WORKSPACE_GROUP)
    }
  }

  fetchWorkspaceData(_workspaceGroup: string): Promise<WorkspaceData> {
    const store = useExpenseStore.getState()

    const categories = store.categories.map((cat) => ({
      id: cat.id,
      categoryId: cat.id,
      label: cat.customLabel ?? cat.id,
      color: cat.color,
      icon: cat.icon ?? null,
      isSystem: cat.isSystem,
      order: cat.order,
    }))

    const creditCards = store.creditCards.map((cc) => ({
      id: cc.id,
      cardId: cc.id,
      name: cc.name,
      color: cc.color,
      limit: cc.limit,
      order: cc.order,
    }))

    const monthlyDataMap = store.monthlyData
    const monthlyDataList = Object.values(monthlyDataMap).map((md) => ({
      id: md.month,
      month: md.month,
      savingsEntries: md.savingsEntries ?? [],
    }))

    const incomes = Object.values(monthlyDataMap).flatMap((md) =>
      (md.incomes ?? []).map((i) => ({
        id: i.id,
        description: i.description,
        amount: i.amount,
        recurringGroupId: i.recurringGroupId ?? null,
        monthlyDataId: md.month,
      }))
    )

    const expenses = Object.values(monthlyDataMap).flatMap((md) => [
      ...(md.fixedExpenses ?? []).map((e) => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        categoryId: e.category,
        type: 'fixed' as const,
        date: e.date,
        installmentId: e.installmentId ?? null,
        recurringGroupId: e.recurringGroupId ?? null,
        monthlyDataId: md.month,
      })),
      ...(md.variableExpenses ?? []).map((e) => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        categoryId: e.category,
        type: 'variable' as const,
        date: e.date,
        installmentId: e.installmentId ?? null,
        recurringGroupId: e.recurringGroupId ?? null,
        monthlyDataId: md.month,
      })),
    ])

    const installments = store.installments.map((inst) => ({
      id: inst.id,
      name: inst.name,
      cardId: inst.card,
      totalInstallments: inst.totalInstallments,
      amountPerInstallment: inst.amountPerInstallment,
      startMonth: inst.startMonth,
    }))

    const notes = store.notes.map((n) => ({
      id: n.id,
      text: n.text,
      value: n.value ?? null,
      valueDirection: n.valueDirection ?? null,
      date: n.date,
      persistent: n.persistent,
      done: n.done,
      noteCreatedAt: n.createdAt,
      createdMonth: n.createdMonth,
    }))

    return Promise.resolve({
      categories,
      creditCards,
      monthlyDataList,
      incomes,
      expenses,
      installments,
      notes,
    })
  }

  getWorkspaceLastActivity(_workspaceId: string): Promise<Date | null> {
    return Promise.resolve(null)
  }

  touchWorkspaceActivity(_workspaceId: string): Promise<void> {
    return Promise.resolve()
  }

  getWorkspace(_id: string): Promise<Workspace> {
    return Promise.resolve({
      id: LOCAL_WORKSPACE_ID,
      ownerSub: 'local-user',
      lastActivityAt: null,
    })
  }

  listUserProfiles(_workspaceGroup: string): Promise<UserProfile[]> {
    return Promise.resolve([
      {
        cognitoSub: 'local-user',
        displayName: 'Local User',
        email: '',
        avatarColor: '#64748b',
      },
    ])
  }

  async createWorkspace(_name: string): Promise<CreatedWorkspace> {
    const { useSyncStore } = await import('@/lib/sync-store')
    useSyncStore.getState().setWorkspace(LOCAL_WORKSPACE_ID, LOCAL_WORKSPACE_GROUP)
    return { workspaceId: LOCAL_WORKSPACE_ID, workspaceGroup: LOCAL_WORKSPACE_GROUP }
  }

  createCategory(_localKey: string, _data: CategoryInput): Promise<void> {
    return Promise.resolve()
  }

  updateCategory(_id: string, _data: Partial<CategoryInput>): Promise<void> {
    return Promise.resolve()
  }

  deleteCategory(_id: string): Promise<void> {
    return Promise.resolve()
  }

  createCreditCard(_localKey: string, _data: CreditCardInput): Promise<void> {
    return Promise.resolve()
  }

  updateCreditCard(_id: string, _data: Partial<CreditCardInput>): Promise<void> {
    return Promise.resolve()
  }

  deleteCreditCard(_id: string): Promise<void> {
    return Promise.resolve()
  }

  createMonthlyData(_month: string, _workspaceGroup: string): Promise<void> {
    return Promise.resolve()
  }

  updateMonthlyData(_month: string, _data: MonthlyDataUpdate): Promise<void> {
    return Promise.resolve()
  }

  createIncome(_data: IncomeInput): Promise<void> {
    return Promise.resolve()
  }

  updateIncome(_id: string, _data: Partial<IncomeInput>): Promise<void> {
    return Promise.resolve()
  }

  deleteIncome(_id: string): Promise<void> {
    return Promise.resolve()
  }

  createExpense(_data: ExpenseInput): Promise<void> {
    return Promise.resolve()
  }

  updateExpense(_id: string, _data: Partial<ExpenseInput>): Promise<void> {
    return Promise.resolve()
  }

  deleteExpense(_id: string): Promise<void> {
    return Promise.resolve()
  }

  createInstallment(_data: InstallmentInput): Promise<void> {
    return Promise.resolve()
  }

  deleteInstallment(_id: string): Promise<void> {
    return Promise.resolve()
  }

  createNote(_data: NoteInput): Promise<void> {
    return Promise.resolve()
  }

  updateNote(_id: string, _data: Partial<NoteInput>): Promise<void> {
    return Promise.resolve()
  }

  deleteNote(_id: string): Promise<void> {
    return Promise.resolve()
  }
}
