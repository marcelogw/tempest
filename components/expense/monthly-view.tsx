'use client'

import { useExpenseStore } from '@/lib/expense-store'
import { MonthSelector } from './month-selector'
import { SummaryCards } from './summary-cards'
import { ExpenseList } from './expense-list'
import { IncomeInput } from './income-input'
import { CategoryBreakdown } from './category-breakdown'
import { Installments } from './installments'

export function MonthlyView() {
  const {
    currentMonth,
    setCurrentMonth,
    getMonthData,
    updateIncome,
    updateInvestments,
    updateSavings,
    addExpense,
    removeExpense,
    monthlyData,
    getInstallmentsForMonth,
  } = useExpenseStore()

  const monthData = getMonthData(currentMonth)
  
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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Visao Mensal</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe sua renda, despesas e alocacoes
            </p>
          </div>
          <MonthSelector 
            currentMonth={currentMonth} 
            onMonthChange={setCurrentMonth} 
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <SummaryCards
            income={monthData.income}
            totalExpenses={totalExpenses}
            investments={monthData.investments}
            savings={monthData.savings}
            previousMonthExpenses={prevMonthTotalExpenses}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <IncomeInput
                income={monthData.income}
                investments={monthData.investments}
                savings={monthData.savings}
                onIncomeChange={(value) => updateIncome(currentMonth, value)}
                onInvestmentsChange={(value) => updateInvestments(currentMonth, value)}
                onSavingsChange={(value) => updateSavings(currentMonth, value)}
              />
              <Installments currentMonth={currentMonth} />
              <CategoryBreakdown expenses={allExpenses} />
            </div>
            
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExpenseList
                  title="Despesas Fixas"
                  expenses={monthData.fixedExpenses}
                  type="fixed"
                  onAdd={(expense) => addExpense(currentMonth, expense, 'fixed')}
                  onRemove={(id) => removeExpense(currentMonth, id, 'fixed')}
                  currentMonth={currentMonth}
                />
                <ExpenseList
                  title="Despesas Variaveis"
                  expenses={monthData.variableExpenses}
                  type="variable"
                  onAdd={(expense) => addExpense(currentMonth, expense, 'variable')}
                  onRemove={(id) => removeExpense(currentMonth, id, 'variable')}
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
