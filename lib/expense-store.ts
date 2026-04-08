import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { addMonths, differenceInMonths } from 'date-fns'
import {
  runMigrations,
  needsMigration,
  createBackup,
  cleanupOldBackups,
  CURRENT_SCHEMA_VERSION,
} from './migrations'
import { useSyncStore } from './sync-store'
import { enqueue } from './write-queue'
import {
  categoryKeyToCloudId,
  categoryCloudIdToKey,
  cardKeyToCloudId,
  cardCloudIdToKey,
} from './workspace-client'
import { getStorage } from '@/lib/adapters/registry'

// Category types for dynamic user-configurable categories
export type CategoryIcon = string | null

export type Category = {
  id: string // unique identifier - used as i18n key (e.g., 'groceries', 'transportation')
  color: string // hex color from palette
  icon: CategoryIcon // optional lucide icon name
  isSystem: boolean // true for SYSTEM_CATEGORY_ID (can't be deleted)
  order: number // for custom ordering
  customLabel?: string // optional custom label for user-created categories (not translated)
}

// Changed from union type to string for dynamic categories
export type ExpenseCategory = string

// Credit card management interface
export type CreditCard = {
  id: string // unique identifier (kebab-case from name)
  name: string // display name
  color: string // hex color from palette
  limit: number | null // monthly limit in BRL (null = no limit)
  order: number // for custom ordering
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  type: 'fixed' | 'variable'
  date: string
  installmentId?: string // Reference to parent installment
  recurringGroupId?: string // Groups recurring fixed expenses across months
}

export interface Installment {
  id: string
  name: string
  card: string // cardId reference (changed from union type)
  totalInstallments: number
  amountPerInstallment: number
  startMonth: string // YYYY-MM format
}

export interface Income {
  id: string
  description: string
  amount: number
  recurringGroupId?: string
}

export interface Note {
  id: string
  text: string
  value?: number
  valueDirection?: 'payable' | 'receivable'
  date: string // YYYY-MM-DD (data do evento)
  persistent: boolean // aparece nos meses futuros
  done: boolean // quando true, para de aparecer nos meses futuros
  createdAt: string // ISO string
  createdMonth: string // YYYY-MM — mês de origem
}

export interface MonthlyData {
  month: string // Format: YYYY-MM
  incomes: Income[]
  fixedExpenses: Expense[]
  variableExpenses: Expense[]
  investments: number
  savings: number
}

// System category ID constant
export const SYSTEM_CATEGORY_ID = 'other' as const

// Predefined color palette for categories (15-20 colors from design system)
export const CATEGORY_COLOR_PALETTE = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#64748b',
  '#78716c',
  '#71717a',
]

// Default categories on first initialization
// NOTE: IDs are technical keys used for i18n lookups (e.g., categories.groceries)
// Labels are NOT stored - they come from i18n at runtime based on user locale
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'groceries',
    color: '#10b981',
    icon: 'ShoppingCart',
    isSystem: false,
    order: 0,
  },
  {
    id: 'transportation',
    color: '#3b82f6',
    icon: 'Car',
    isSystem: false,
    order: 1,
  },
  { id: 'health', color: '#ef4444', icon: 'Heart', isSystem: false, order: 2 },
  { id: 'leisure', color: '#f59e0b', icon: 'PartyPopper', isSystem: false, order: 3 },
  {
    id: 'food',
    color: '#ec4899',
    icon: 'Utensils',
    isSystem: false,
    order: 4,
  },
  {
    id: 'education',
    color: '#8b5cf6',
    icon: 'GraduationCap',
    isSystem: false,
    order: 5,
  },
  { id: 'housing', color: '#06b6d4', icon: 'Home', isSystem: false, order: 6 },
  {
    id: 'subscriptions',
    color: '#14b8a6',
    icon: 'RefreshCw',
    isSystem: false,
    order: 7,
  },
  {
    id: 'credit-card',
    color: '#6366f1',
    icon: 'CreditCard',
    isSystem: false,
    order: 8,
  },
  {
    id: 'installment',
    color: '#f97316',
    icon: 'Calendar',
    isSystem: false,
    order: 9,
  },
  {
    id: SYSTEM_CATEGORY_ID,
    color: '#64748b',
    icon: 'MoreHorizontal',
    isSystem: true,
    order: 10,
  },
]

interface ExpenseStore {
  monthlyData: Record<string, MonthlyData>
  installments: Installment[]
  notes: Note[]
  categories: Category[]
  creditCards: CreditCard[]
  currentMonth: string
  currentYear: string
  isLoading: boolean
  workspaceId: string | null
  setCurrentMonth: (month: string) => void
  setCurrentYear: (year: string) => void
  getAvailableYears: () => string[]
  getMonthsForYear: (year: string) => MonthlyData[]

  addIncome: (month: string, income: Omit<Income, 'id'>, replicate: boolean) => void
  removeIncome: (month: string, incomeId: string) => void
  updateIncome: (month: string, income: Income, makeRecurring?: boolean) => void
  updateInvestments: (month: string, investments: number) => void
  updateSavings: (month: string, savings: number) => void
  addExpense: (month: string, expense: Omit<Expense, 'id'>, type: 'fixed' | 'variable') => void
  removeExpense: (month: string, expenseId: string, type: 'fixed' | 'variable') => void
  updateExpense: (month: string, expense: Expense, type: 'fixed' | 'variable') => void
  addFixedExpenseWithPropagation: (
    month: string,
    expense: Omit<Expense, 'id' | 'recurringGroupId'>
  ) => void
  removeFixedExpenseFromMonth: (startMonth: string, recurringGroupId: string) => void
  updateFixedExpenseFromMonth: (
    startMonth: string,
    recurringGroupId: string,
    updates: Partial<Omit<Expense, 'id' | 'recurringGroupId'>>
  ) => void
  getMonthData: (month: string) => MonthlyData
  initializeMonth: (month: string) => void
  initializeYear: (year: string) => void
  addInstallment: (installment: Omit<Installment, 'id'>) => void
  removeInstallment: (installmentId: string) => void
  getInstallmentsForMonth: (
    month: string
  ) => Array<{ installment: Installment; currentNumber: number }>
  // Category management actions
  initializeCategories: () => void
  addCategory: (customLabel: string, color: string, icon?: string | null) => void
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'isSystem'>>) => void
  deleteCategory: (id: string) => void
  reorderCategories: (orderedIds: string[]) => void
  getCategoryById: (id: string) => Category | undefined
  validateCategory: (categoryId: string) => string
  // Credit card management actions
  addCreditCard: (name: string, color: string, limit?: number | null) => void
  updateCreditCard: (id: string, updates: Partial<Omit<CreditCard, 'id'>>) => void
  deleteCreditCard: (id: string, reassignToCardId?: string) => void
  reorderCreditCards: (orderedIds: string[]) => void
  getCreditCardById: (id: string) => CreditCard | undefined
  getCardUsageForMonth: (cardId: string, month: string) => number
  getCardTotalCommitment: (cardId: string) => number
  getCardUsagePercentage: (cardId: string) => number | null
  // Notes actions
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void
  removeNote: (id: string) => void
  getNotesForMonth: (month: string) => Note[]
  // Data management actions
  deleteYearData: (year: string) => void
  deleteAllData: () => void
  // Cloud sync actions
  loadWorkspace: (workspaceId: string, workspaceGroup: string) => Promise<void>
  checkAndSync: () => Promise<void>
}

const generateRecurringGroupId = () => `recur_${crypto.randomUUID()}`

// Helper to normalize strings to kebab-case IDs (handles Portuguese accents)
const normalizeToKebabCase = (str: string): string => {
  return str
    .normalize('NFD') // Decompose accents
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/[^\w-]/g, '') // Remove non-word chars except hyphens
}

// Helper to get future months for propagation
const getFutureMonths = (startMonth: string, count: number = 24): string[] => {
  const months: string[] = []
  for (let i = 1; i <= count; i++) {
    months.push(getMonthFromOffset(startMonth, i))
  }
  return months
}

const createEmptyMonth = (month: string): MonthlyData => ({
  month,
  incomes: [],
  fixedExpenses: [],
  variableExpenses: [],
  investments: 0,
  savings: 0,
})

// Generate sample data for the last 6 months
const generateSampleData = (): Record<string, MonthlyData> => {
  const data: Record<string, MonthlyData> = {}
  const now = new Date()

  // Simple deterministic random number generator
  let seed = 123456
  const random = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  const generateSampleId = () => Math.floor(random() * 10000000).toString(36)

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    const baseIncome = 8000 + random() * 4000
    const variability = 0.8 + random() * 0.4

    data[monthKey] = {
      month: monthKey,
      incomes: [
        {
          id: generateSampleId(),
          description: 'Salário',
          amount: Math.round(baseIncome),
          recurringGroupId: generateRecurringGroupId(),
        },
      ],
      fixedExpenses: [
        {
          id: generateSampleId(),
          description: 'Aluguel',
          amount: 2500,
          category: 'housing',
          type: 'fixed',
          date: monthKey + '-01',
        },
        {
          id: generateSampleId(),
          description: 'Seguro do Carro',
          amount: 280,
          category: 'transportation',
          type: 'fixed',
          date: monthKey + '-01',
        },
        {
          id: generateSampleId(),
          description: 'Conta de Celular',
          amount: 120,
          category: SYSTEM_CATEGORY_ID,
          type: 'fixed',
          date: monthKey + '-01',
        },
        {
          id: generateSampleId(),
          description: 'Internet',
          amount: 150,
          category: SYSTEM_CATEGORY_ID,
          type: 'fixed',
          date: monthKey + '-01',
        },
        {
          id: generateSampleId(),
          description: 'Academia',
          amount: 120,
          category: 'health',
          type: 'fixed',
          date: monthKey + '-01',
        },
      ],
      variableExpenses: [
        {
          id: generateSampleId(),
          description: 'Cartao de Credito - Amazon',
          amount: Math.round(350 * variability),
          category: 'credit-card',
          type: 'variable',
          date: monthKey + '-05',
        },
        {
          id: generateSampleId(),
          description: 'Supermercado - Extra',
          amount: Math.round(850 * variability),
          category: 'groceries',
          type: 'variable',
          date: monthKey + '-08',
        },
        {
          id: generateSampleId(),
          description: 'Combustivel',
          amount: Math.round(400 * variability),
          category: 'transportation',
          type: 'variable',
          date: monthKey + '-10',
        },
        {
          id: generateSampleId(),
          description: 'Netflix e Spotify',
          amount: 75,
          category: 'subscriptions',
          type: 'variable',
          date: monthKey + '-12',
        },
        {
          id: generateSampleId(),
          description: 'Restaurantes',
          amount: Math.round(450 * variability),
          category: 'food',
          type: 'variable',
          date: monthKey + '-15',
        },
        {
          id: generateSampleId(),
          description: 'Cartao de Credito - Magazine Luiza',
          amount: Math.round(500 * variability),
          category: 'credit-card',
          type: 'variable',
          date: monthKey + '-18',
        },
        {
          id: generateSampleId(),
          description: 'Cinema',
          amount: Math.round(120 * variability),
          category: 'leisure',
          type: 'variable',
          date: monthKey + '-20',
        },
        {
          id: generateSampleId(),
          description: 'Supermercado - Pao de Acucar',
          amount: Math.round(450 * variability),
          category: 'groceries',
          type: 'variable',
          date: monthKey + '-22',
        },
      ],
      investments: Math.round(800 + random() * 400),
      savings: Math.round(600 + random() * 600),
    }
  }

  return data
}

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Helper to calculate month difference using date-fns
const getMonthDiff = (startMonth: string, targetMonth: string): number => {
  const [startYear, startM] = startMonth.split('-').map(Number)
  const [targetYear, targetM] = targetMonth.split('-').map(Number)
  const startDate = new Date(startYear, startM - 1, 1) // month is 0-indexed
  const targetDate = new Date(targetYear, targetM - 1, 1)
  return differenceInMonths(targetDate, startDate)
}

// Helper to get month key from start month and offset using date-fns
export const getMonthFromOffset = (startMonth: string, offset: number): string => {
  const [year, month] = startMonth.split('-').map(Number)
  const startDate = new Date(year, month - 1, 1) // month is 0-indexed in Date constructor
  const resultDate = addMonths(startDate, offset)
  return `${resultDate.getFullYear()}-${String(resultDate.getMonth() + 1).padStart(2, '0')}`
}

// Helper to convert installments to synthetic expenses for category breakdown
export const mapInstallmentsToExpenses = (
  installments: Array<{ installment: Installment; currentNumber: number }>,
  month: string,
  categoryId: string = 'parcelamento'
): Expense[] => {
  return installments.map(({ installment, currentNumber }) => ({
    id: `installment-${installment.id}`,
    description: `${installment.name} (${currentNumber}/${installment.totalInstallments})`,
    amount: installment.amountPerInstallment,
    category: categoryId,
    type: 'variable' as const,
    date: month + '-01',
    installmentId: installment.id,
  }))
}

// Check if we should initialize with sample data
const shouldUseSampleData = () => {
  // Never use sample data on server (prevents hydration mismatch)
  if (typeof window === 'undefined') {
    return false
  }

  // Never use sample data in test environment
  if (process.env.NODE_ENV === 'test' || (typeof process !== 'undefined' && process.env.VITEST)) {
    return false
  }

  // Don't use sample data in production or if user has explicitly disabled it
  const stored = localStorage.getItem('expense-store')
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { state?: { monthlyData?: Record<string, unknown> } }
      // If user already has data, don't override
      if (parsed.state?.monthlyData && Object.keys(parsed.state.monthlyData).length > 0) {
        return false
      }
    } catch {
      // If parsing fails, use sample data in development only
      return process.env.NODE_ENV === 'development'
    }
  }
  // Use sample data in development by default
  return process.env.NODE_ENV === 'development'
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      monthlyData: shouldUseSampleData() ? generateSampleData() : {},
      installments: [],
      notes: [],
      categories: DEFAULT_CATEGORIES,
      creditCards: [],
      currentMonth: getCurrentMonth(),
      currentYear: new Date().getFullYear().toString(),
      isLoading: false,
      workspaceId: null,

      setCurrentMonth: (month) => {
        const [year] = month.split('-')
        const { initializeYear } = get()

        // Initialize entire year to avoid gaps in months
        initializeYear(year)

        set({
          currentMonth: month,
          currentYear: year,
        })
      },

      setCurrentYear: (year) => {
        set({ currentYear: year })

        // Auto-adjust currentMonth if not in the new year
        const { currentMonth } = get()
        const [monthYear] = currentMonth.split('-')
        if (monthYear !== year) {
          set({ currentMonth: `${year}-01` })
        }
      },

      getAvailableYears: () => {
        const { monthlyData } = get()
        const currentYear = new Date().getFullYear().toString()
        const years = new Set<string>([currentYear]) // Always include current year

        Object.keys(monthlyData).forEach((month) => {
          const [year] = month.split('-')
          years.add(year)
        })
        return Array.from(years).sort((a, b) => b.localeCompare(a)) // Descending order
      },

      getMonthsForYear: (year) => {
        const { monthlyData } = get()
        return Object.values(monthlyData)
          .filter((month) => month.month.startsWith(year))
          .sort((a, b) => a.month.localeCompare(b.month))
      },

      initializeMonth: (month) => {
        const { monthlyData } = get()
        if (!monthlyData[month]) {
          set({
            monthlyData: {
              ...monthlyData,
              [month]: createEmptyMonth(month),
            },
          })
          const { workspaceGroup } = useSyncStore.getState()
          if (workspaceGroup) {
            enqueue({
              model: 'MonthlyData',
              operation: 'create',
              data: { id: month, workspaceGroup },
            })
          }
        }
      },

      initializeYear: (year) => {
        const { monthlyData } = get()
        const updatedData = { ...monthlyData }
        const newMonths: string[] = []
        let hasChanges = false

        // Create all 12 months for the year if they don't exist
        for (let monthNum = 1; monthNum <= 12; monthNum++) {
          const monthKey = `${year}-${String(monthNum).padStart(2, '0')}`
          if (!updatedData[monthKey]) {
            updatedData[monthKey] = createEmptyMonth(monthKey)
            newMonths.push(monthKey)
            hasChanges = true
          }
        }

        if (hasChanges) {
          set({ monthlyData: updatedData })
          const { workspaceGroup } = useSyncStore.getState()
          if (workspaceGroup) {
            newMonths.forEach((month) => {
              enqueue({
                model: 'MonthlyData',
                operation: 'create',
                data: { id: month, workspaceGroup },
              })
            })
          }
        }
      },

      getMonthData: (month) => {
        const { monthlyData } = get()
        // Return existing data or create empty month without state update
        // This prevents setState during render errors
        // Components should call initializeMonth in useEffect instead
        return monthlyData[month] || createEmptyMonth(month)
      },

      addIncome: (month, income, replicate) => {
        const { initializeYear } = get()
        const [year] = month.split('-')
        initializeYear(year)

        const recurringGroupId = replicate ? generateRecurringGroupId() : undefined
        const newIncome: Income = {
          ...income,
          id: crypto.randomUUID(),
          recurringGroupId,
        }

        const { monthlyData } = get()
        const updatedData = { ...monthlyData }

        // Add to current month
        if (!updatedData[month]) {
          updatedData[month] = createEmptyMonth(month)
        }
        updatedData[month] = {
          ...updatedData[month],
          incomes: [...updatedData[month].incomes, newIncome],
        }

        // Track replicated incomes for cloud sync
        const replicatedIncomes: Array<{ id: string; targetMonth: string }> = []

        if (replicate) {
          const futureMonths = getFutureMonths(month, 24)
          futureMonths.forEach((targetMonth) => {
            if (!updatedData[targetMonth]) {
              updatedData[targetMonth] = createEmptyMonth(targetMonth)
            }
            const replicaId = crypto.randomUUID()
            replicatedIncomes.push({ id: replicaId, targetMonth })
            updatedData[targetMonth] = {
              ...updatedData[targetMonth],
              incomes: [
                ...updatedData[targetMonth].incomes,
                {
                  ...income,
                  id: replicaId,
                  recurringGroupId,
                },
              ],
            }
          })
        }

        set({ monthlyData: updatedData })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          enqueue({
            model: 'Income',
            operation: 'create',
            data: {
              id: newIncome.id,
              workspaceGroup,
              description: newIncome.description,
              amount: newIncome.amount,
              recurringGroupId: newIncome.recurringGroupId ?? null,
              monthlyDataId: month,
            },
          })
          replicatedIncomes.forEach(({ id, targetMonth }) => {
            enqueue({
              model: 'Income',
              operation: 'create',
              data: {
                id,
                workspaceGroup,
                description: income.description,
                amount: income.amount,
                recurringGroupId: recurringGroupId ?? null,
                monthlyDataId: targetMonth,
              },
            })
          })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      removeIncome: (month, incomeId) => {
        const { monthlyData } = get()
        const currentData = monthlyData[month]
        if (!currentData) return

        const incomeToRemove = currentData.incomes.find((i) => i.id === incomeId)
        if (!incomeToRemove) return

        const updatedData = { ...monthlyData }
        const deletedIds: string[] = []

        if (incomeToRemove.recurringGroupId) {
          // Remove from this month onwards
          Object.keys(updatedData).forEach((monthKey) => {
            if (monthKey >= month) {
              const monthData = updatedData[monthKey]
              monthData.incomes
                .filter((i) => i.recurringGroupId === incomeToRemove.recurringGroupId)
                .forEach((i) => deletedIds.push(i.id))
              updatedData[monthKey] = {
                ...monthData,
                incomes: monthData.incomes.filter(
                  (i) => i.recurringGroupId !== incomeToRemove.recurringGroupId
                ),
              }
            }
          })
        } else {
          deletedIds.push(incomeId)
          updatedData[month] = {
            ...currentData,
            incomes: currentData.incomes.filter((i) => i.id !== incomeId),
          }
        }

        set({ monthlyData: updatedData })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          deletedIds.forEach((id) => {
            enqueue({ model: 'Income', operation: 'delete', data: { id } })
          })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      updateIncome: (month, income, makeRecurring) => {
        const { monthlyData, removeIncome, addIncome } = get()

        if (makeRecurring && !income.recurringGroupId) {
          // Convert to recurring: remove old and add new with replication
          const { description, amount } = income
          removeIncome(month, income.id)
          addIncome(month, { description, amount }, true)
          return // enqueue handled by removeIncome/addIncome
        }

        const updatedData = { ...monthlyData }
        const updatedIds: string[] = []

        if (income.recurringGroupId) {
          // Update this and future months
          Object.keys(updatedData).forEach((monthKey) => {
            if (monthKey >= month) {
              const monthData = updatedData[monthKey]
              monthData.incomes.forEach((i) => {
                if (i.recurringGroupId === income.recurringGroupId) {
                  updatedIds.push(i.id)
                }
              })
              updatedData[monthKey] = {
                ...monthData,
                incomes: monthData.incomes.map((i) =>
                  i.recurringGroupId === income.recurringGroupId
                    ? { ...i, description: income.description, amount: income.amount }
                    : i
                ),
              }
            }
          })
        } else {
          updatedIds.push(income.id)
          const currentData = monthlyData[month]
          if (currentData) {
            updatedData[month] = {
              ...currentData,
              incomes: currentData.incomes.map((i) => (i.id === income.id ? income : i)),
            }
          }
        }

        set({ monthlyData: updatedData })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          updatedIds.forEach((id) => {
            enqueue({
              model: 'Income',
              operation: 'update',
              data: { id, description: income.description, amount: income.amount },
            })
          })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      updateInvestments: (month, investments) => {
        const { monthlyData, initializeYear } = get()
        const [year] = month.split('-')
        initializeYear(year)
        set({
          monthlyData: {
            ...monthlyData,
            [month]: {
              ...get().monthlyData[month],
              investments,
            },
          },
        })
        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          enqueue({ model: 'MonthlyData', operation: 'update', data: { id: month, investments } })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      updateSavings: (month, savings) => {
        const { monthlyData, initializeYear } = get()
        const [year] = month.split('-')
        initializeYear(year)
        set({
          monthlyData: {
            ...monthlyData,
            [month]: {
              ...get().monthlyData[month],
              savings,
            },
          },
        })
        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          enqueue({ model: 'MonthlyData', operation: 'update', data: { id: month, savings } })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      addExpense: (month, expense, type) => {
        const { monthlyData, initializeYear } = get()
        const [year] = month.split('-')
        initializeYear(year)
        const currentData = get().monthlyData[month]
        const newExpense = { ...expense, id: crypto.randomUUID() }

        set({
          monthlyData: {
            ...monthlyData,
            [month]: {
              ...currentData,
              [type === 'fixed' ? 'fixedExpenses' : 'variableExpenses']: [
                ...currentData[type === 'fixed' ? 'fixedExpenses' : 'variableExpenses'],
                newExpense,
              ],
            },
          },
        })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          const categoryCloudId = categoryKeyToCloudId[newExpense.category] ?? newExpense.category
          enqueue({
            model: 'Expense',
            operation: 'create',
            data: {
              id: newExpense.id,
              workspaceGroup,
              description: newExpense.description,
              amount: newExpense.amount,
              categoryId: categoryCloudId,
              type: newExpense.type,
              date: newExpense.date,
              installmentId: newExpense.installmentId ?? null,
              recurringGroupId: newExpense.recurringGroupId ?? null,
              monthlyDataId: month,
            },
          })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      removeExpense: (month, expenseId, type) => {
        const { monthlyData } = get()
        const currentData = monthlyData[month]
        if (!currentData) return

        set({
          monthlyData: {
            ...monthlyData,
            [month]: {
              ...currentData,
              [type === 'fixed' ? 'fixedExpenses' : 'variableExpenses']: currentData[
                type === 'fixed' ? 'fixedExpenses' : 'variableExpenses'
              ].filter((e) => e.id !== expenseId),
            },
          },
        })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          enqueue({ model: 'Expense', operation: 'delete', data: { id: expenseId } })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      updateExpense: (month, expense, type) => {
        const { monthlyData } = get()
        const currentData = monthlyData[month]
        if (!currentData) return

        set({
          monthlyData: {
            ...monthlyData,
            [month]: {
              ...currentData,
              [type === 'fixed' ? 'fixedExpenses' : 'variableExpenses']: currentData[
                type === 'fixed' ? 'fixedExpenses' : 'variableExpenses'
              ].map((e) => (e.id === expense.id ? expense : e)),
            },
          },
        })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          const categoryCloudId = categoryKeyToCloudId[expense.category] ?? expense.category
          enqueue({
            model: 'Expense',
            operation: 'update',
            data: {
              id: expense.id,
              description: expense.description,
              amount: expense.amount,
              categoryId: categoryCloudId,
              date: expense.date,
            },
          })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      addFixedExpenseWithPropagation: (month, expense) => {
        const recurringGroupId = generateRecurringGroupId()
        const futureMonths = getFutureMonths(month, 24)
        const { initializeYear } = get()

        const [year] = month.split('-')
        initializeYear(year)

        const { monthlyData } = get()

        const newExpense: Expense = {
          ...expense,
          id: crypto.randomUUID(),
          recurringGroupId,
          type: 'fixed',
        }

        const updatedData = {
          ...monthlyData,
          [month]: {
            ...monthlyData[month],
            fixedExpenses: [...monthlyData[month].fixedExpenses, newExpense],
          },
        }

        const allCreatedExpenses: Array<{ expense: Expense; targetMonth: string }> = [
          { expense: newExpense, targetMonth: month },
        ]

        futureMonths.forEach((targetMonth) => {
          if (!updatedData[targetMonth]) {
            updatedData[targetMonth] = createEmptyMonth(targetMonth)
          }

          const futureExpense: Expense = {
            ...expense,
            id: crypto.randomUUID(),
            recurringGroupId,
            type: 'fixed',
            date: targetMonth + '-01',
          }
          allCreatedExpenses.push({ expense: futureExpense, targetMonth })

          updatedData[targetMonth] = {
            ...updatedData[targetMonth],
            fixedExpenses: [...updatedData[targetMonth].fixedExpenses, futureExpense],
          }
        })

        set({ monthlyData: updatedData })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          const categoryCloudId = categoryKeyToCloudId[expense.category] ?? expense.category
          allCreatedExpenses.forEach(({ expense: e, targetMonth }) => {
            enqueue({
              model: 'Expense',
              operation: 'create',
              data: {
                id: e.id,
                workspaceGroup,
                description: e.description,
                amount: e.amount,
                categoryId: categoryCloudId,
                type: 'fixed',
                date: e.date,
                installmentId: e.installmentId ?? null,
                recurringGroupId,
                monthlyDataId: targetMonth,
              },
            })
          })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      removeFixedExpenseFromMonth: (startMonth, recurringGroupId) => {
        const { monthlyData } = get()
        const updatedData = { ...monthlyData }
        const deletedIds: string[] = []

        Object.keys(updatedData).forEach((monthKey) => {
          if (monthKey >= startMonth) {
            const monthData = updatedData[monthKey]
            monthData.fixedExpenses
              .filter((e) => e.recurringGroupId === recurringGroupId)
              .forEach((e) => deletedIds.push(e.id))
            updatedData[monthKey] = {
              ...monthData,
              fixedExpenses: monthData.fixedExpenses.filter(
                (e) => e.recurringGroupId !== recurringGroupId
              ),
            }
          }
        })

        set({ monthlyData: updatedData })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          deletedIds.forEach((id) => {
            enqueue({ model: 'Expense', operation: 'delete', data: { id } })
          })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      updateFixedExpenseFromMonth: (startMonth, recurringGroupId, updates) => {
        const { monthlyData } = get()
        const updatedData = { ...monthlyData }
        const updatedExpenses: Expense[] = []

        Object.keys(updatedData).forEach((monthKey) => {
          if (monthKey >= startMonth) {
            const monthData = updatedData[monthKey]
            updatedData[monthKey] = {
              ...monthData,
              fixedExpenses: monthData.fixedExpenses.map((expense) => {
                if (expense.recurringGroupId === recurringGroupId) {
                  const updated = { ...expense, ...updates, date: monthKey + '-01' }
                  updatedExpenses.push(updated)
                  return updated
                }
                return expense
              }),
            }
          }
        })

        set({ monthlyData: updatedData })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          updatedExpenses.forEach((e) => {
            const categoryCloudId = categoryKeyToCloudId[e.category] ?? e.category
            enqueue({
              model: 'Expense',
              operation: 'update',
              data: {
                id: e.id,
                description: e.description,
                amount: e.amount,
                categoryId: categoryCloudId,
                date: e.date,
              },
            })
          })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      addInstallment: (installment) => {
        const newInstallment: Installment = {
          ...installment,
          id: crypto.randomUUID(),
        }
        set({
          installments: [...get().installments, newInstallment],
        })
        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          const cardCloudId = cardKeyToCloudId[newInstallment.card] ?? newInstallment.card
          enqueue({
            model: 'Installment',
            operation: 'create',
            data: {
              id: newInstallment.id,
              workspaceGroup,
              name: newInstallment.name,
              cardId: cardCloudId,
              totalInstallments: newInstallment.totalInstallments,
              amountPerInstallment: newInstallment.amountPerInstallment,
              startMonth: newInstallment.startMonth,
            },
          })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      removeInstallment: (installmentId) => {
        set({
          installments: get().installments.filter((i) => i.id !== installmentId),
        })
        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          enqueue({ model: 'Installment', operation: 'delete', data: { id: installmentId } })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      getInstallmentsForMonth: (month) => {
        const { installments } = get()
        const result: Array<{ installment: Installment; currentNumber: number }> = []

        for (const inst of installments) {
          const diff = getMonthDiff(inst.startMonth, month)
          // Check if this month is within the installment period
          if (diff >= 0 && diff < inst.totalInstallments) {
            result.push({
              installment: inst,
              currentNumber: diff + 1,
            })
          }
        }

        return result
      },

      // Category management actions
      initializeCategories: () => {
        const { categories } = get()
        if (categories.length === 0) {
          set({ categories: DEFAULT_CATEGORIES })
        }
      },

      addCategory: (customLabel, color, icon = null) => {
        const { categories } = get()
        const id = normalizeToKebabCase(customLabel)

        if (categories.find((c) => c.id === id)) {
          throw new Error('Category with this name already exists')
        }

        const newCategory: Category = {
          id,
          customLabel,
          color,
          icon,
          isSystem: false,
          order: categories.length,
        }

        set({ categories: [...categories, newCategory] })

        const { workspaceGroup } = useSyncStore.getState()
        if (workspaceGroup) {
          enqueue({
            model: 'Category',
            operation: 'create',
            data: {
              id,
              workspaceGroup,
              categoryId: id,
              label: customLabel,
              color,
              icon: icon ?? null,
              isSystem: false,
              order: newCategory.order,
            },
          })
        }
      },

      updateCategory: (id, updates) => {
        const { categories } = get()
        const category = categories.find((c) => c.id === id)

        if (!category) {
          throw new Error('Category not found')
        }

        if (category.isSystem && updates.customLabel) {
          throw new Error('Cannot rename system category')
        }

        set({
          categories: categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })

        const { workspaceGroup } = useSyncStore.getState()
        if (workspaceGroup) {
          const cloudId = categoryKeyToCloudId[id] ?? id
          enqueue({
            model: 'Category',
            operation: 'update',
            data: {
              id: cloudId,
              ...(updates.customLabel !== undefined && { label: updates.customLabel }),
              ...(updates.color !== undefined && { color: updates.color }),
              ...(updates.icon !== undefined && { icon: updates.icon }),
              ...(updates.order !== undefined && { order: updates.order }),
            },
          })
        }
      },

      deleteCategory: (id) => {
        const { categories, monthlyData } = get()
        const category = categories.find((c) => c.id === id)

        if (!category) {
          throw new Error('Category not found')
        }

        if (category.isSystem) {
          throw new Error('Cannot delete system category')
        }

        // Reassign all expenses to system category
        const updatedMonthlyData = { ...monthlyData }
        Object.keys(updatedMonthlyData).forEach((month) => {
          const monthData = updatedMonthlyData[month]

          updatedMonthlyData[month] = {
            ...monthData,
            fixedExpenses: monthData.fixedExpenses.map((e) =>
              e.category === id ? { ...e, category: SYSTEM_CATEGORY_ID } : e
            ),
            variableExpenses: monthData.variableExpenses.map((e) =>
              e.category === id ? { ...e, category: SYSTEM_CATEGORY_ID } : e
            ),
          }
        })

        set({
          categories: categories.filter((c) => c.id !== id),
          monthlyData: updatedMonthlyData,
        })

        const { workspaceGroup } = useSyncStore.getState()
        if (workspaceGroup) {
          const cloudId = categoryKeyToCloudId[id] ?? id
          enqueue({ model: 'Category', operation: 'delete', data: { id: cloudId } })
        }
      },

      reorderCategories: (orderedIds) => {
        const { categories } = get()
        const reordered = orderedIds
          .map((id, index) => {
            const category = categories.find((c) => c.id === id)
            if (!category) return null
            return { ...category, order: index }
          })
          .filter(Boolean) as Category[]

        set({ categories: reordered })

        const { workspaceGroup } = useSyncStore.getState()
        if (workspaceGroup) {
          reordered.forEach((cat) => {
            const cloudId = categoryKeyToCloudId[cat.id] ?? cat.id
            enqueue({
              model: 'Category',
              operation: 'update',
              data: { id: cloudId, order: cat.order },
            })
          })
        }
      },

      getCategoryById: (id) => {
        const { categories } = get()
        return categories.find((c) => c.id === id)
      },

      validateCategory: (categoryId) => {
        const { categories } = get()
        const exists = categories.find((c) => c.id === categoryId)
        return exists ? categoryId : SYSTEM_CATEGORY_ID
      },

      // Credit card management actions
      addCreditCard: (name, color, limit = null) => {
        const { creditCards } = get()
        const id = normalizeToKebabCase(name)

        if (creditCards.find((c) => c.id === id)) {
          throw new Error('Já existe um cartão com esse nome')
        }

        const newCard: CreditCard = {
          id,
          name,
          color,
          limit,
          order: creditCards.length,
        }

        set({ creditCards: [...creditCards, newCard] })

        const { workspaceGroup } = useSyncStore.getState()
        if (workspaceGroup) {
          enqueue({
            model: 'CreditCard',
            operation: 'create',
            data: {
              id,
              workspaceGroup,
              cardId: id,
              name,
              color,
              limit: limit ?? null,
              order: newCard.order,
            },
          })
        }
      },

      updateCreditCard: (id, updates) => {
        const { creditCards } = get()
        const index = creditCards.findIndex((c) => c.id === id)

        if (index === -1) {
          throw new Error('Cartão não encontrado')
        }

        const updated = [...creditCards]
        updated[index] = { ...updated[index], ...updates }
        set({ creditCards: updated })

        const { workspaceGroup } = useSyncStore.getState()
        if (workspaceGroup) {
          const cloudId = cardKeyToCloudId[id] ?? id
          enqueue({
            model: 'CreditCard',
            operation: 'update',
            data: { id: cloudId, ...updates },
          })
        }
      },

      deleteCreditCard: (id, reassignToCardId) => {
        const { creditCards, installments } = get()
        const cardIndex = creditCards.findIndex((c) => c.id === id)

        if (cardIndex === -1) {
          throw new Error('Cartão não encontrado')
        }

        const affectedInstallments = installments.filter((inst) => inst.card === id)

        if (affectedInstallments.length > 0 && !reassignToCardId) {
          throw new Error(
            `Este cartão possui ${affectedInstallments.length} parcelamento(s) ativo(s)`
          )
        }

        const updatedInstallments = installments.map((inst) =>
          inst.card === id ? { ...inst, card: reassignToCardId! } : inst
        )

        const updatedCards = creditCards.filter((c) => c.id !== id)

        set({
          creditCards: updatedCards,
          installments: updatedInstallments,
        })

        const { workspaceGroup } = useSyncStore.getState()
        if (workspaceGroup) {
          const cloudId = cardKeyToCloudId[id] ?? id
          enqueue({ model: 'CreditCard', operation: 'delete', data: { id: cloudId } })
        }
      },

      reorderCreditCards: (orderedIds) => {
        const { creditCards } = get()
        const reordered = orderedIds
          .map((id) => creditCards.find((c) => c.id === id))
          .filter(Boolean)
          .map((card, index) => ({ ...card!, order: index }))

        set({ creditCards: reordered })

        const { workspaceGroup } = useSyncStore.getState()
        if (workspaceGroup) {
          reordered.forEach((card) => {
            const cloudId = cardKeyToCloudId[card.id] ?? card.id
            enqueue({
              model: 'CreditCard',
              operation: 'update',
              data: { id: cloudId, order: card.order },
            })
          })
        }
      },

      getCreditCardById: (id) => {
        return get().creditCards.find((c) => c.id === id)
      },

      getCardUsageForMonth: (cardId, month) => {
        const { getInstallmentsForMonth } = get()
        const installmentsInMonth = getInstallmentsForMonth(month)

        return installmentsInMonth
          .filter(({ installment }) => installment.card === cardId)
          .reduce((sum, { installment }) => sum + installment.amountPerInstallment, 0)
      },

      getCardTotalCommitment: (cardId) => {
        const { installments } = get()

        return installments
          .filter((inst) => inst.card === cardId)
          .reduce((sum, inst) => {
            const totalValue = inst.amountPerInstallment * inst.totalInstallments
            return sum + totalValue
          }, 0)
      },

      getCardUsagePercentage: (cardId) => {
        const { creditCards } = get()
        const card = creditCards.find((c) => c.id === cardId)

        if (!card || card.limit === null) return null

        const totalCommitment = get().getCardTotalCommitment(cardId)

        return (totalCommitment / card.limit) * 100
      },

      // Notes actions
      addNote: (note) => {
        const newNote: Note = {
          ...note,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set({ notes: [...get().notes, newNote] })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          enqueue({
            model: 'Note',
            operation: 'create',
            data: {
              id: newNote.id,
              workspaceGroup,
              text: newNote.text,
              value: newNote.value ?? null,
              valueDirection: newNote.valueDirection ?? null,
              date: newNote.date,
              persistent: newNote.persistent,
              done: newNote.done,
              noteCreatedAt: newNote.createdAt,
              createdMonth: newNote.createdMonth,
            },
          })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      updateNote: (id, updates) => {
        set({ notes: get().notes.map((n) => (n.id === id ? { ...n, ...updates } : n)) })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          enqueue({ model: 'Note', operation: 'update', data: { id, ...updates } })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      removeNote: (id) => {
        set({ notes: get().notes.filter((n) => n.id !== id) })

        const { workspaceGroup, workspaceId } = useSyncStore.getState()
        if (workspaceGroup && workspaceId) {
          enqueue({ model: 'Note', operation: 'delete', data: { id } })
          enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
        }
      },

      getNotesForMonth: (month) => {
        const { notes } = get()
        return notes.filter(
          (n) => n.createdMonth === month || (n.persistent && !n.done && n.createdMonth < month)
        )
      },

      // Data management actions
      deleteYearData: (year) => {
        const { monthlyData, installments } = get()
        const updatedMonthlyData = { ...monthlyData }

        // Remove all months from the specified year
        Object.keys(updatedMonthlyData).forEach((monthKey) => {
          if (monthKey.startsWith(year)) {
            delete updatedMonthlyData[monthKey]
          }
        })

        // Remove installments that start in the deleted year
        const updatedInstallments = installments.filter((inst) => {
          const [instYear] = inst.startMonth.split('-')
          return instYear !== year
        })

        set({
          monthlyData: updatedMonthlyData,
          installments: updatedInstallments,
        })

        // Reset current month if it was in the deleted year
        const { currentMonth } = get()
        const [currentYear] = currentMonth.split('-')
        if (currentYear === year) {
          set({ currentMonth: getCurrentMonth() })
        }
      },

      deleteAllData: () => {
        set({
          monthlyData: {},
          installments: [],
          notes: [],
          currentMonth: getCurrentMonth(),
          currentYear: new Date().getFullYear().toString(),
        })
      },

      // Cloud sync actions
      loadWorkspace: async (workspaceId, workspaceGroup) => {
        set({ isLoading: true, workspaceId })
        useSyncStore.getState().setWorkspace(workspaceId, workspaceGroup)

        try {
          const raw = await getStorage().fetchWorkspaceData(workspaceGroup)

          const categories: Category[] = raw.categories.map((c) => ({
            id: c.categoryId,
            color: c.color,
            icon: c.icon ?? null,
            isSystem: c.isSystem,
            order: c.order,
            customLabel: c.isSystem ? undefined : c.label,
          }))

          const creditCards: CreditCard[] = raw.creditCards.map((cc) => ({
            id: cc.cardId,
            name: cc.name,
            color: cc.color,
            limit: cc.limit,
            order: cc.order,
          }))

          // Reconstruct denormalized MonthlyData
          const monthlyDataMap: Record<string, MonthlyData> = {}
          raw.monthlyDataList.forEach((md) => {
            monthlyDataMap[md.month] = {
              month: md.month,
              investments: md.investments,
              savings: md.savings,
              incomes: raw.incomes
                .filter((i) => i.monthlyDataId === md.id)
                .map((i) => ({
                  id: i.id,
                  description: i.description,
                  amount: i.amount,
                  recurringGroupId: i.recurringGroupId ?? undefined,
                })),
              fixedExpenses: raw.expenses
                .filter((e) => e.monthlyDataId === md.id && e.type === 'fixed')
                .map((e) => ({
                  id: e.id,
                  description: e.description,
                  amount: e.amount,
                  category: categoryCloudIdToKey[e.categoryId] ?? e.categoryId,
                  type: 'fixed' as const,
                  date: e.date,
                  installmentId: e.installmentId ?? undefined,
                  recurringGroupId: e.recurringGroupId ?? undefined,
                })),
              variableExpenses: raw.expenses
                .filter((e) => e.monthlyDataId === md.id && e.type === 'variable')
                .map((e) => ({
                  id: e.id,
                  description: e.description,
                  amount: e.amount,
                  category: categoryCloudIdToKey[e.categoryId] ?? e.categoryId,
                  type: 'variable' as const,
                  date: e.date,
                  installmentId: e.installmentId ?? undefined,
                  recurringGroupId: e.recurringGroupId ?? undefined,
                })),
            }
          })

          const installments: Installment[] = raw.installments.map((inst) => ({
            id: inst.id,
            name: inst.name,
            card: cardCloudIdToKey[inst.cardId] ?? inst.cardId,
            totalInstallments: inst.totalInstallments,
            amountPerInstallment: inst.amountPerInstallment,
            startMonth: inst.startMonth,
          }))

          const notes: Note[] = raw.notes.map((n) => ({
            id: n.id,
            text: n.text,
            value: n.value ?? undefined,
            valueDirection: (n.valueDirection as Note['valueDirection']) ?? undefined,
            date: n.date,
            persistent: n.persistent,
            done: n.done,
            createdAt: n.noteCreatedAt,
            createdMonth: n.createdMonth,
          }))

          set({
            categories,
            creditCards,
            monthlyData: monthlyDataMap,
            installments,
            notes,
            isLoading: false,
          })
          useSyncStore.getState().setLastSyncedAt(Date.now())
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      checkAndSync: async () => {
        const { workspaceId, workspaceGroup, lastSyncedAt } = useSyncStore.getState()
        if (!workspaceId || !workspaceGroup) return

        const lastActivity = await getStorage().getWorkspaceLastActivity(workspaceId)
        if (!lastSyncedAt || (lastActivity && lastActivity.getTime() > lastSyncedAt)) {
          await get().loadWorkspace(workspaceId, workspaceGroup)
        }
      },
    }),
    {
      name: 'expense-store',
      version: CURRENT_SCHEMA_VERSION,
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const item = localStorage.getItem(name)
          if (!item) return null

          try {
            const parsed = JSON.parse(item) as Record<string, unknown>

            // Check if migration is needed
            if (needsMigration(parsed)) {
              console.warn('[Store] Migration needed, running migrations...')

              // Create backup before migrating
              try {
                createBackup(parsed)
                cleanupOldBackups()
              } catch (error) {
                console.error('[Store] Failed to create backup:', error)
                // Continue anyway - migration is important
              }

              // Run migrations
              const migrated = runMigrations(parsed, (parsed.version as number) || 1)

              // Save migrated data immediately
              localStorage.setItem(name, JSON.stringify(migrated))

              console.warn('[Store] Migration completed successfully')
              return JSON.stringify(migrated)
            }

            return item
          } catch (error) {
            console.error('[Store] Error reading/migrating storage:', error)
            return item
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, value)
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      })),
    }
  )
)

export {
  formatCurrency,
  formatShortCurrency,
  formatNumber,
  formatPercentage,
  type SupportedCurrency,
  type SupportedLocale,
} from './formatters'
