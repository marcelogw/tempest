'use client'

import { useTranslations } from 'next-intl'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type Expense,
  type ExpenseCategory,
  formatCurrencyBRL,
  useExpenseStore,
  SYSTEM_CATEGORY_ID,
} from '@/lib/expense-store'

interface CategoryBreakdownProps {
  expenses: Expense[]
}

export function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  const i = useTranslations()
  const getCategoryById = useExpenseStore((state) => state.getCategoryById)

  // Group expenses by category
  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<ExpenseCategory, number>
  )

  const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)

  // Sort by amount (highest first)
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {i('ui.dashboard.categoryBreakdown')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedCategories.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {i('ui.dashboard.noDataAvailable')}
          </p>
        ) : (
          sortedCategories.map(([categoryId, amount]) => {
            const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
            const category = getCategoryById(categoryId) || getCategoryById(SYSTEM_CATEGORY_ID)
            const IconComponent = category?.icon
              ? (Icons as unknown as Record<string, LucideIcon>)[category.icon]
              : null
            const color = category?.color || '#64748b'
            const label = category?.customLabel || i(`categories.${category?.id || 'other'}`)

            return (
              <div key={categoryId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {IconComponent ? (
                      <IconComponent className="h-4 w-4" style={{ color }} />
                    ) : (
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    )}
                    <span className="text-foreground font-medium">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                    <span className="text-foreground font-semibold">
                      {formatCurrencyBRL(amount)}
                    </span>
                  </div>
                </div>
                <div className="bg-secondary h-2 overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
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
