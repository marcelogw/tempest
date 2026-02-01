'use client'

import { useExpenseStore, type Expense } from '@/lib/expense-store'
import { MonthSelector } from './month-selector'
import { SummaryCards } from './summary-cards'
import { ExpenseList } from './expense-list'
import { IncomeSection } from './income-input'
import { CategoryBreakdown } from './category-breakdown'
import { Installments } from './installments'

export function MonthlyView() {
  const {
    currentMonth,
    setCurrentMonth,
    getMonthData,
    addIncome,
    removeIncome,
    updateIncome,
    updateInvestments,
    updateSavings,
    addExpense,
    removeExpense,
    updateExpense,
    addFixedExpenseWithPropagation,
    removeFixedExpenseFromMonth,
    updateFixedExpenseFromMonth,
    monthlyData,
    getInstallmentsForMonth,
  } = useExpenseStore()

  const monthData = getMonthData(currentMonth)

  // Handlers for fixed expenses with propagation
  const handleAddFixedExpense = (expense: Omit<Expense, 'id'>) => {
    addFixedExpenseWithPropagation(currentMonth, expense)
  }

  const handleUpdateExpense = (expense: Expense, makeRecurring?: boolean) => {
    if (expense.type === 'fixed') {
      if (expense.recurringGroupId || makeRecurring) {
        // Convert to recurring if makeRecurring is true
        const groupId =
          expense.recurringGroupId || `recur_${Math.random().toString(36).substring(2, 9)}`

        // If converting to recurring, first remove the old non-recurring expense
        if (makeRecurring && !expense.recurringGroupId) {
          removeExpense(currentMonth, expense.id, 'fixed')
          // Then add as new recurring expense
          addFixedExpenseWithPropagation(currentMonth, {
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            type: 'fixed',
            date: expense.date,
          })
        } else {
          // Update recurring expense from this month onwards
          updateFixedExpenseFromMonth(currentMonth, groupId, {
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
          })
        }
      } else {
        // Single month edit for non-recurring fixed expense
        updateExpense(currentMonth, expense, 'fixed')
      }
    } else {
      // Variable expense - single month edit only
      updateExpense(currentMonth, expense, 'variable')
    }
  }

  const handleRemoveFixedExpense = (expenseId: string) => {
    const expense = monthData.fixedExpenses.find((e) => e.id === expenseId)
    if (expense?.recurringGroupId) {
      // Remove from this month onwards
      removeFixedExpenseFromMonth(currentMonth, expense.recurringGroupId)
    } else {
      // Remove only from current month
      removeExpense(currentMonth, expenseId, 'fixed')
    }
  }

  // Get previous month data for comparison
  const date = new Date(currentMonth + '-01')
  date.setMonth(date.getMonth() - 1)
  const prevMonthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const prevMonthData = monthlyData[prevMonthKey]
  const prevMonthTotalExpenses = prevMonthData
    ? prevMonthData.fixedExpenses.reduce((sum, e) => sum + e.amount, 0) +
      prevMonthData.variableExpenses.reduce((sum, e) => sum + e.amount, 0)
    : undefined

  // Get installments for current month
  const currentInstallments = getInstallmentsForMonth(currentMonth)
  const installmentsTotal = currentInstallments.reduce(
    (sum, { installment }) => sum + installment.amountPerInstallment,
    0
  )

  const totalExpenses =
    monthData.fixedExpenses.reduce((sum, e) => sum + e.amount, 0) +
    monthData.variableExpenses.reduce((sum, e) => sum + e.amount, 0) +
    installmentsTotal

  const allExpenses = [...monthData.fixedExpenses, ...monthData.variableExpenses]

  const totalIncome = monthData.incomes.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-border bg-card flex-shrink-0 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Visao Mensal</h1>
            <p className="text-muted-foreground text-sm">
              Acompanhe sua renda, despesas e alocacoes
            </p>
          </div>
          <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <SummaryCards
            income={totalIncome}
            totalExpenses={totalExpenses}
            investments={monthData.investments}
            savings={monthData.savings}
            previousMonthExpenses={prevMonthTotalExpenses}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <IncomeSection
                incomes={monthData.incomes}
                investments={monthData.investments}
                savings={monthData.savings}
                onAddIncome={(income, replicate) => addIncome(currentMonth, income, replicate)}
                onRemoveIncome={(id) => removeIncome(currentMonth, id)}
                onUpdateIncome={(income, makeRecurring) =>
                  updateIncome(currentMonth, income, makeRecurring)
                }
                onInvestmentsChange={(value) => updateInvestments(currentMonth, value)}
                onSavingsChange={(value) => updateSavings(currentMonth, value)}
              />
              <Installments currentMonth={currentMonth} />
              <CategoryBreakdown expenses={allExpenses} />
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ExpenseList
                  title="Despesas Fixas"
                  expenses={monthData.fixedExpenses}
                  type="fixed"
                  onAdd={handleAddFixedExpense}
                  onRemove={handleRemoveFixedExpense}
                  onUpdate={handleUpdateExpense}
                  currentMonth={currentMonth}
                />
                <ExpenseList
                  title="Despesas Variaveis"
                  expenses={monthData.variableExpenses}
                  type="variable"
                  onAdd={(expense) => addExpense(currentMonth, expense, 'variable')}
                  onRemove={(id) => removeExpense(currentMonth, id, 'variable')}
                  onUpdate={handleUpdateExpense}
                  currentMonth={currentMonth}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
