import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ExpenseCategory = 
  | 'credit_card'
  | 'groceries'
  | 'utilities'
  | 'entertainment'
  | 'transportation'
  | 'healthcare'
  | 'dining'
  | 'shopping'
  | 'subscriptions'
  | 'installment'
  | 'other'

export type CreditCard = 'nubank_pri' | 'nubank_ma' | 'mercadopago' | 'itau'

export interface Expense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  type: 'fixed' | 'variable'
  date: string
  installmentId?: string // Reference to parent installment
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

interface ExpenseStore {
  monthlyData: Record<string, MonthlyData>
  installments: Installment[]
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
  getMonthData: (month: string) => MonthlyData
  initializeMonth: (month: string) => void
  addInstallment: (installment: Omit<Installment, 'id'>) => void
  removeInstallment: (installmentId: string) => void
  getInstallmentsForMonth: (month: string) => Array<{ installment: Installment; currentNumber: number }>
}

const generateId = () => Math.random().toString(36).substring(2, 9)

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
        { id: generateId(), description: 'Aluguel', amount: 2500, category: 'other', type: 'fixed', date: monthKey + '-01' },
        { id: generateId(), description: 'Seguro do Carro', amount: 280, category: 'transportation', type: 'fixed', date: monthKey + '-01' },
        { id: generateId(), description: 'Conta de Celular', amount: 120, category: 'utilities', type: 'fixed', date: monthKey + '-01' },
        { id: generateId(), description: 'Internet', amount: 150, category: 'utilities', type: 'fixed', date: monthKey + '-01' },
        { id: generateId(), description: 'Academia', amount: 120, category: 'healthcare', type: 'fixed', date: monthKey + '-01' },
      ],
      variableExpenses: [
        { id: generateId(), description: 'Cartao de Credito - Amazon', amount: Math.round(350 * variability), category: 'credit_card', type: 'variable', date: monthKey + '-05' },
        { id: generateId(), description: 'Supermercado - Extra', amount: Math.round(850 * variability), category: 'groceries', type: 'variable', date: monthKey + '-08' },
        { id: generateId(), description: 'Combustivel', amount: Math.round(400 * variability), category: 'transportation', type: 'variable', date: monthKey + '-10' },
        { id: generateId(), description: 'Netflix e Spotify', amount: 75, category: 'subscriptions', type: 'variable', date: monthKey + '-12' },
        { id: generateId(), description: 'Restaurantes', amount: Math.round(450 * variability), category: 'dining', type: 'variable', date: monthKey + '-15' },
        { id: generateId(), description: 'Cartao de Credito - Magazine Luiza', amount: Math.round(500 * variability), category: 'credit_card', type: 'variable', date: monthKey + '-18' },
        { id: generateId(), description: 'Cinema', amount: Math.round(120 * variability), category: 'entertainment', type: 'variable', date: monthKey + '-20' },
        { id: generateId(), description: 'Supermercado - Pao de Acucar', amount: Math.round(450 * variability), category: 'groceries', type: 'variable', date: monthKey + '-22' },
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
const getMonthFromOffset = (startMonth: string, offset: number): string => {
  const [year, month] = startMonth.split('-').map(Number)
  const date = new Date(year, month - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      monthlyData: generateSampleData(),
      installments: [],
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

        // Auto-ajustar currentMonth se não estiver no novo ano
        const { currentMonth } = get()
        const [monthYear] = currentMonth.split('-')
        if (monthYear !== year) {
          set({ currentMonth: `${year}-01` })
        }
      },

      getAvailableYears: () => {
        const { monthlyData } = get()
        const currentYear = new Date().getFullYear().toString()
        const years = new Set<string>([currentYear]) // Sempre incluir ano atual

        Object.keys(monthlyData).forEach((month) => {
          const [year] = month.split('-')
          years.add(year)
        })
        return Array.from(years).sort((a, b) => b.localeCompare(a)) // Ordem decrescente
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
    }),
    {
      name: 'expense-store',
    }
  )
)

export const categoryLabels: Record<ExpenseCategory, string> = {
  credit_card: 'Cartao de Credito',
  groceries: 'Supermercado',
  utilities: 'Contas',
  entertainment: 'Entretenimento',
  transportation: 'Transporte',
  healthcare: 'Saude',
  dining: 'Restaurantes',
  shopping: 'Compras',
  subscriptions: 'Assinaturas',
  installment: 'Parcelamento',
  other: 'Outros',
}

export const categoryColors: Record<ExpenseCategory, string> = {
  credit_card: '#3b82f6',
  groceries: '#22c55e',
  utilities: '#f59e0b',
  entertainment: '#ec4899',
  transportation: '#8b5cf6',
  healthcare: '#14b8a6',
  dining: '#f97316',
  shopping: '#6366f1',
  subscriptions: '#06b6d4',
  installment: '#a855f7',
  other: '#64748b',
}

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
