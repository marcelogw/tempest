import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Category types for dynamic user-configurable categories
export type CategoryIcon = string | null

export type Category = {
  id: string // unique identifier (kebab-case)
  label: string // display name (Portuguese)
  color: string // hex color from palette
  icon: CategoryIcon // optional lucide icon name
  isSystem: boolean // true for 'outros' (can't be deleted)
  order: number // for custom ordering
}

// Changed from union type to string for dynamic categories
export type ExpenseCategory = string

export type CreditCard = 'nubank_pri' | 'nubank_ma' | 'mercadopago' | 'itau'

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
  card: CreditCard
  totalInstallments: number
  amountPerInstallment: number
  startMonth: string // YYYY-MM format
}

export interface MonthlyData {
  month: string // Format: YYYY-MM
  income: number
  fixedExpenses: Expense[]
  variableExpenses: Expense[]
  investments: number
  savings: number
}

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
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'mercado',
    label: 'Mercado',
    color: '#10b981',
    icon: 'ShoppingCart',
    isSystem: false,
    order: 0,
  },
  {
    id: 'transporte',
    label: 'Transporte',
    color: '#3b82f6',
    icon: 'Car',
    isSystem: false,
    order: 1,
  },
  { id: 'saude', label: 'Saúde', color: '#ef4444', icon: 'Heart', isSystem: false, order: 2 },
  { id: 'lazer', label: 'Lazer', color: '#f59e0b', icon: 'PartyPopper', isSystem: false, order: 3 },
  {
    id: 'alimentacao',
    label: 'Alimentação',
    color: '#ec4899',
    icon: 'Utensils',
    isSystem: false,
    order: 4,
  },
  {
    id: 'educacao',
    label: 'Educação',
    color: '#8b5cf6',
    icon: 'GraduationCap',
    isSystem: false,
    order: 5,
  },
  { id: 'moradia', label: 'Moradia', color: '#06b6d4', icon: 'Home', isSystem: false, order: 6 },
  {
    id: 'assinaturas',
    label: 'Assinaturas',
    color: '#14b8a6',
    icon: 'RefreshCw',
    isSystem: false,
    order: 7,
  },
  {
    id: 'cartao-credito',
    label: 'Cartão de Crédito',
    color: '#6366f1',
    icon: 'CreditCard',
    isSystem: false,
    order: 8,
  },
  {
    id: 'parcelamento',
    label: 'Parcelamento',
    color: '#f97316',
    icon: 'Calendar',
    isSystem: false,
    order: 9,
  },
  {
    id: 'outros',
    label: 'Outros',
    color: '#64748b',
    icon: 'MoreHorizontal',
    isSystem: true,
    order: 10,
  },
]

interface ExpenseStore {
  monthlyData: Record<string, MonthlyData>
  installments: Installment[]
  categories: Category[]
  currentMonth: string
  currentYear: string
  setCurrentMonth: (month: string) => void
  setCurrentYear: (year: string) => void
  getAvailableYears: () => string[]
  getMonthsForYear: (year: string) => MonthlyData[]
  updateIncome: (month: string, income: number) => void
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
  addInstallment: (installment: Omit<Installment, 'id'>) => void
  removeInstallment: (installmentId: string) => void
  getInstallmentsForMonth: (
    month: string
  ) => Array<{ installment: Installment; currentNumber: number }>
  // Category management actions
  initializeCategories: () => void
  addCategory: (label: string, color: string, icon?: string | null) => void
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'isSystem'>>) => void
  deleteCategory: (id: string) => void
  reorderCategories: (orderedIds: string[]) => void
  getCategoryById: (id: string) => Category | undefined
  validateCategory: (categoryId: string) => string
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const generateRecurringGroupId = () => `recur_${generateId()}`

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
  income: 0,
  fixedExpenses: [],
  variableExpenses: [],
  investments: 0,
  savings: 0,
})

// Generate sample data for the last 6 months
const generateSampleData = (): Record<string, MonthlyData> => {
  const data: Record<string, MonthlyData> = {}
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    const baseIncome = 8000 + Math.random() * 4000
    const variability = 0.8 + Math.random() * 0.4

    data[monthKey] = {
      month: monthKey,
      income: Math.round(baseIncome),
      fixedExpenses: [
        {
          id: generateId(),
          description: 'Aluguel',
          amount: 2500,
          category: 'moradia',
          type: 'fixed',
          date: monthKey + '-01',
        },
        {
          id: generateId(),
          description: 'Seguro do Carro',
          amount: 280,
          category: 'transporte',
          type: 'fixed',
          date: monthKey + '-01',
        },
        {
          id: generateId(),
          description: 'Conta de Celular',
          amount: 120,
          category: 'outros',
          type: 'fixed',
          date: monthKey + '-01',
        },
        {
          id: generateId(),
          description: 'Internet',
          amount: 150,
          category: 'outros',
          type: 'fixed',
          date: monthKey + '-01',
        },
        {
          id: generateId(),
          description: 'Academia',
          amount: 120,
          category: 'saude',
          type: 'fixed',
          date: monthKey + '-01',
        },
      ],
      variableExpenses: [
        {
          id: generateId(),
          description: 'Cartao de Credito - Amazon',
          amount: Math.round(350 * variability),
          category: 'cartao-credito',
          type: 'variable',
          date: monthKey + '-05',
        },
        {
          id: generateId(),
          description: 'Supermercado - Extra',
          amount: Math.round(850 * variability),
          category: 'mercado',
          type: 'variable',
          date: monthKey + '-08',
        },
        {
          id: generateId(),
          description: 'Combustivel',
          amount: Math.round(400 * variability),
          category: 'transporte',
          type: 'variable',
          date: monthKey + '-10',
        },
        {
          id: generateId(),
          description: 'Netflix e Spotify',
          amount: 75,
          category: 'assinaturas',
          type: 'variable',
          date: monthKey + '-12',
        },
        {
          id: generateId(),
          description: 'Restaurantes',
          amount: Math.round(450 * variability),
          category: 'alimentacao',
          type: 'variable',
          date: monthKey + '-15',
        },
        {
          id: generateId(),
          description: 'Cartao de Credito - Magazine Luiza',
          amount: Math.round(500 * variability),
          category: 'cartao-credito',
          type: 'variable',
          date: monthKey + '-18',
        },
        {
          id: generateId(),
          description: 'Cinema',
          amount: Math.round(120 * variability),
          category: 'lazer',
          type: 'variable',
          date: monthKey + '-20',
        },
        {
          id: generateId(),
          description: 'Supermercado - Pao de Acucar',
          amount: Math.round(450 * variability),
          category: 'mercado',
          type: 'variable',
          date: monthKey + '-22',
        },
      ],
      investments: Math.round(800 + Math.random() * 400),
      savings: Math.round(600 + Math.random() * 600),
    }
  }

  return data
}

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Helper to calculate month difference
const getMonthDiff = (startMonth: string, targetMonth: string): number => {
  const [startYear, startM] = startMonth.split('-').map(Number)
  const [targetYear, targetM] = targetMonth.split('-').map(Number)
  return (targetYear - startYear) * 12 + (targetM - startM)
}

// Helper to get month key from start month and offset
export const getMonthFromOffset = (startMonth: string, offset: number): string => {
  const [year, month] = startMonth.split('-').map(Number)
  const date = new Date(year, month - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      monthlyData: generateSampleData(),
      installments: [],
      categories: DEFAULT_CATEGORIES,
      currentMonth: getCurrentMonth(),
      currentYear: new Date().getFullYear().toString(),

      setCurrentMonth: (month) => {
        const { monthlyData } = get()
        const [year] = month.split('-')

        // Initialize month if it doesn't exist
        if (!monthlyData[month]) {
          set({
            currentMonth: month,
            currentYear: year,
            monthlyData: {
              ...monthlyData,
              [month]: createEmptyMonth(month),
            },
          })
        } else {
          set({
            currentMonth: month,
            currentYear: year,
          })
        }
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
        }
      },

      getMonthData: (month) => {
        const { monthlyData, initializeMonth } = get()
        if (!monthlyData[month]) {
          initializeMonth(month)
          return get().monthlyData[month]
        }
        return monthlyData[month]
      },

      updateIncome: (month, income) => {
        const { monthlyData, initializeMonth } = get()
        initializeMonth(month)
        set({
          monthlyData: {
            ...monthlyData,
            [month]: {
              ...get().monthlyData[month],
              income,
            },
          },
        })
      },

      updateInvestments: (month, investments) => {
        const { monthlyData, initializeMonth } = get()
        initializeMonth(month)
        set({
          monthlyData: {
            ...monthlyData,
            [month]: {
              ...get().monthlyData[month],
              investments,
            },
          },
        })
      },

      updateSavings: (month, savings) => {
        const { monthlyData, initializeMonth } = get()
        initializeMonth(month)
        set({
          monthlyData: {
            ...monthlyData,
            [month]: {
              ...get().monthlyData[month],
              savings,
            },
          },
        })
      },

      addExpense: (month, expense, type) => {
        const { monthlyData, initializeMonth } = get()
        initializeMonth(month)
        const currentData = get().monthlyData[month]
        const newExpense = { ...expense, id: generateId() }

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
      },

      addFixedExpenseWithPropagation: (month, expense) => {
        const recurringGroupId = generateRecurringGroupId()
        const futureMonths = getFutureMonths(month, 24)
        const { initializeMonth } = get()

        // Initialize current month
        initializeMonth(month)

        // Get updated state after initialization
        const { monthlyData } = get()

        // Add to current month with recurringGroupId
        const newExpense: Expense = {
          ...expense,
          id: generateId(),
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

        // Propagate to future months
        futureMonths.forEach((targetMonth) => {
          // Initialize month if it doesn't exist
          if (!updatedData[targetMonth]) {
            updatedData[targetMonth] = createEmptyMonth(targetMonth)
          }

          updatedData[targetMonth] = {
            ...updatedData[targetMonth],
            fixedExpenses: [
              ...updatedData[targetMonth].fixedExpenses,
              {
                ...expense,
                id: generateId(), // New ID for each month
                recurringGroupId, // Same group ID
                type: 'fixed',
                date: targetMonth + '-01',
              },
            ],
          }
        })

        set({ monthlyData: updatedData })
      },

      removeFixedExpenseFromMonth: (startMonth, recurringGroupId) => {
        const { monthlyData } = get()
        const updatedData = { ...monthlyData }

        // Remove from startMonth and all future months
        Object.keys(updatedData).forEach((monthKey) => {
          if (monthKey >= startMonth) {
            // String comparison works for YYYY-MM format
            const monthData = updatedData[monthKey]
            updatedData[monthKey] = {
              ...monthData,
              fixedExpenses: monthData.fixedExpenses.filter(
                (e) => e.recurringGroupId !== recurringGroupId
              ),
            }
          }
        })

        set({ monthlyData: updatedData })
      },

      updateFixedExpenseFromMonth: (startMonth, recurringGroupId, updates) => {
        const { monthlyData } = get()
        const updatedData = { ...monthlyData }

        // Update from startMonth onwards
        Object.keys(updatedData).forEach((monthKey) => {
          if (monthKey >= startMonth) {
            const monthData = updatedData[monthKey]
            updatedData[monthKey] = {
              ...monthData,
              fixedExpenses: monthData.fixedExpenses.map((expense) =>
                expense.recurringGroupId === recurringGroupId
                  ? { ...expense, ...updates, date: monthKey + '-01' }
                  : expense
              ),
            }
          }
        })

        set({ monthlyData: updatedData })
      },

      addInstallment: (installment) => {
        const newInstallment: Installment = {
          ...installment,
          id: generateId(),
        }
        set({
          installments: [...get().installments, newInstallment],
        })
      },

      removeInstallment: (installmentId) => {
        set({
          installments: get().installments.filter((i) => i.id !== installmentId),
        })
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

      addCategory: (label, color, icon = null) => {
        const { categories } = get()
        const id = label
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '')

        // Check for duplicate IDs
        if (categories.find((c) => c.id === id)) {
          throw new Error('Category with this name already exists')
        }

        const newCategory: Category = {
          id,
          label,
          color,
          icon,
          isSystem: false,
          order: categories.length,
        }

        set({ categories: [...categories, newCategory] })
      },

      updateCategory: (id, updates) => {
        const { categories } = get()
        const category = categories.find((c) => c.id === id)

        if (!category) {
          throw new Error('Category not found')
        }

        if (category.isSystem && updates.label) {
          throw new Error('Cannot rename system category')
        }

        set({
          categories: categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })
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

        // Reassign all expenses to 'outros'
        const updatedMonthlyData = { ...monthlyData }
        Object.keys(updatedMonthlyData).forEach((month) => {
          const monthData = updatedMonthlyData[month]

          updatedMonthlyData[month] = {
            ...monthData,
            fixedExpenses: monthData.fixedExpenses.map((e) =>
              e.category === id ? { ...e, category: 'outros' } : e
            ),
            variableExpenses: monthData.variableExpenses.map((e) =>
              e.category === id ? { ...e, category: 'outros' } : e
            ),
          }
        })

        set({
          categories: categories.filter((c) => c.id !== id),
          monthlyData: updatedMonthlyData,
        })
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
      },

      getCategoryById: (id) => {
        const { categories } = get()
        return categories.find((c) => c.id === id)
      },

      validateCategory: (categoryId) => {
        const { categories } = get()
        const exists = categories.find((c) => c.id === categoryId)
        return exists ? categoryId : 'outros'
      },
    }),
    {
      name: 'expense-store',
    }
  )
)

export const creditCardLabels: Record<CreditCard, string> = {
  nubank_pri: 'Nubank Pri',
  nubank_ma: 'Nubank Ma',
  mercadopago: 'MercadoPago',
  itau: 'Itau',
}

export const creditCardColors: Record<CreditCard, string> = {
  nubank_pri: '#8b5cf6',
  nubank_ma: '#a855f7',
  mercadopago: '#3b82f6',
  itau: '#f97316',
}

export const formatCurrencyBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatShortCurrencyBRL = (value: number) => {
  if (value >= 1000) {
    return `R$${(value / 1000).toFixed(1)}k`
  }
  return `R$${value}`
}
