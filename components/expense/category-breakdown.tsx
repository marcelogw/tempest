'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Expense, type ExpenseCategory, categoryLabels, categoryColors, formatCurrencyBRL } from '@/lib/expense-store'

interface CategoryBreakdownProps {
  expenses: Expense[]
}

export function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<ExpenseCategory, number>)

  const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)

  // Sort by amount (highest first)
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6) as [ExpenseCategory, number][]

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma despesa registrada ainda
          </p>
        ) : (
          sortedCategories.map(([category, amount]) => {
            const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColors[category] }}
                    />
                    <span className="font-medium text-foreground">{categoryLabels[category]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                    <span className="font-semibold text-foreground">{formatCurrencyBRL(amount)}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: categoryColors[category],
                    }}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
