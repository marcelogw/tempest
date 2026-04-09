'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useExpenseStore, type Expense, mapInstallmentsToExpenses } from '@/lib/expense-store'
import { MonthSelector } from './month-selector'
import { SummaryCards } from './summary-cards'
import { ExpenseList } from './expense-list'
import { IncomeSection } from './income-input'
import { CategoryBreakdown } from './category-breakdown'
import { Installments } from './installments'
import { NotesSection } from './notes-section'

export function MonthlyView() {
  const i = useTranslations()
  const {
    currentMonth,
    setCurrentMonth,
    initializeMonth,
    addIncome,
    removeIncome,
    updateIncome,
    addSavingsEntry,
    updateSavingsEntry,
    removeSavingsEntry,
    addExpense,
    removeExpense,
    updateExpense,
    addFixedExpenseWithPropagation,
    removeFixedExpenseFromMonth,
    updateFixedExpenseFromMonth,
    monthlyData,
    goals,
    getInstallmentsForMonth,
    addNote,
    updateNote,
    removeNote,
    getNotesForMonth,
  } = useExpenseStore()

  // Initialize month data in effect to avoid setState during render
  useEffect(() => {
    initializeMonth(currentMonth)
  }, [currentMonth, initializeMonth])

  const monthData = monthlyData[currentMonth]

  // Guard: return null if month data not yet initialized
  if (!monthData) {
    return null
  }

  // Handlers for fixed expenses with propagation
  const handleAddFixedExpense = (expense: Omit<Expense, 'id'>) => {
    addFixedExpenseWithPropagation(currentMonth, expense)
  }

  const handleUpdateExpense = (expense: Expense, makeRecurring?: boolean) => {
    if (expense.type === 'fixed') {
      if (expense.recurringGroupId || makeRecurring) {
        const groupId =
          expense.recurringGroupId || `recur_${Math.random().toString(36).substring(2, 9)}`

        if (makeRecurring && !expense.recurringGroupId) {
          removeExpense(currentMonth, expense.id, 'fixed')
          addFixedExpenseWithPropagation(currentMonth, {
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            type: 'fixed',
            date: expense.date,
          })
        } else {
          updateFixedExpenseFromMonth(currentMonth, groupId, {
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
          })
        }
      } else {
        updateExpense(currentMonth, expense, 'fixed')
      }
    } else {
      updateExpense(currentMonth, expense, 'variable')
    }
  }

  const handleRemoveFixedExpense = (expenseId: string) => {
    const expense = monthData.fixedExpenses.find((e) => e.id === expenseId)
    if (expense?.recurringGroupId) {
      removeFixedExpenseFromMonth(currentMonth, expense.recurringGroupId)
    } else {
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

  // Get installments and notes for current month
  const currentInstallments = getInstallmentsForMonth(currentMonth)
  const currentNotes = getNotesForMonth(currentMonth)
  const installmentsTotal = currentInstallments.reduce(
    (sum, { installment }) => sum + installment.amountPerInstallment,
    0
  )

  const totalExpenses =
    monthData.fixedExpenses.reduce((sum, e) => sum + e.amount, 0) +
    monthData.variableExpenses.reduce((sum, e) => sum + e.amount, 0) +
    installmentsTotal

  // Convert installments to synthetic expenses for category breakdown
  const installmentExpenses = mapInstallmentsToExpenses(currentInstallments, currentMonth)

  // Combine all expenses including installments for category analysis
  const allExpenses = [
    ...monthData.fixedExpenses,
    ...monthData.variableExpenses,
    ...installmentExpenses,
  ]

  const totalIncome = monthData.incomes.reduce((sum, i) => sum + i.amount, 0)
  const activeGoals = goals.filter((g) => g.status === 'active')

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-border bg-card flex-shrink-0 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">{i('ui.monthly.title')}</h1>
            <p className="text-muted-foreground text-sm">{i('ui.monthly.subtitle')}</p>
          </div>
          <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <SummaryCards
            income={totalIncome}
            totalExpenses={totalExpenses}
            savingsEntries={monthData.savingsEntries ?? []}
            previousMonthExpenses={prevMonthTotalExpenses}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <IncomeSection
                incomes={monthData.incomes}
                savingsEntries={monthData.savingsEntries ?? []}
                activeGoals={activeGoals}
                currentMonth={currentMonth}
                onAddIncome={(income, replicate) => addIncome(currentMonth, income, replicate)}
                onRemoveIncome={(id) => removeIncome(currentMonth, id)}
                onUpdateIncome={(income, makeRecurring) =>
                  updateIncome(currentMonth, income, makeRecurring)
                }
                onAddEntry={(entry) => addSavingsEntry(currentMonth, entry)}
                onUpdateEntry={(entry) => updateSavingsEntry(currentMonth, entry)}
                onRemoveEntry={(entryId) => removeSavingsEntry(currentMonth, entryId)}
              />
              <Installments currentMonth={currentMonth} />
              <CategoryBreakdown expenses={allExpenses} />
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ExpenseList
                  title={i('ui.monthly.fixedExpenses')}
                  expenses={monthData.fixedExpenses}
                  type="fixed"
                  onAdd={handleAddFixedExpense}
                  onRemove={handleRemoveFixedExpense}
                  onUpdate={handleUpdateExpense}
                  currentMonth={currentMonth}
                />
                <ExpenseList
                  title={i('ui.monthly.variableExpenses')}
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

          <NotesSection
            notes={currentNotes}
            currentMonth={currentMonth}
            onAdd={addNote}
            onUpdate={updateNote}
            onRemove={removeNote}
          />
        </div>
      </main>
    </div>
  )
}
