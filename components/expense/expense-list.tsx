'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import * as LucideIcons from 'lucide-react'
import { Trash2, Lock, Shuffle, Pencil, Repeat, type LucideIcon } from 'lucide-react'
import {
  type Expense,
  formatCurrencyBRL,
  useExpenseStore,
  SYSTEM_CATEGORY_ID,
} from '@/lib/expense-store'
import { ExpenseForm } from './expense-form'
import { ExpenseEditDialog } from './expense-edit-dialog'
import { cn } from '@/lib/utils'

interface ExpenseListProps {
  title: string
  expenses: Expense[]
  type: 'fixed' | 'variable'
  onAdd: (expense: Omit<Expense, 'id'>) => void
  onRemove: (id: string) => void
  onUpdate: (expense: Expense, makeRecurring?: boolean) => void
  currentMonth: string
}

export function ExpenseList({
  title,
  expenses,
  type,
  onAdd,
  onRemove,
  onUpdate,
  currentMonth,
}: ExpenseListProps) {
  const getCategoryById = useExpenseStore((state) => state.getCategoryById)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const Icon = type === 'fixed' ? Lock : Shuffle

  return (
    <Card className="border-border/50 h-full shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'rounded-md p-1.5',
                type === 'fixed' ? 'bg-primary/10' : 'bg-chart-3/10'
              )}
            >
              <Icon className={cn('h-4 w-4', type === 'fixed' ? 'text-primary' : 'text-chart-3')} />
            </div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          <ExpenseForm type={type} onSubmit={onAdd} currentMonth={currentMonth} />
        </div>
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-muted-foreground">{expenses.length} itens</span>
          <span className="text-foreground font-semibold">{formatCurrencyBRL(total)}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="max-h-[320px] space-y-2 overflow-y-auto">
          {expenses.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Nenhuma despesa {type === 'fixed' ? 'fixa' : 'variavel'} ainda. Clique em "Adicionar{' '}
              {type === 'fixed' ? 'Fixa' : 'Variavel'}" para adicionar.
            </p>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                data-testid="expense-item"
                className="bg-secondary/50 hover:bg-secondary group flex items-center justify-between rounded-lg p-3 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-foreground truncate text-sm font-medium">
                      {expense.description}
                    </p>
                    {expense.recurringGroupId && (
                      <Repeat className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                    )}
                  </div>
                  {(() => {
                    const category =
                      getCategoryById(expense.category) || getCategoryById(SYSTEM_CATEGORY_ID)
                    const IconComponent = category?.icon
                      ? (LucideIcons as unknown as Record<string, LucideIcon>)[category.icon]
                      : null
                    return (
                      <Badge
                        variant="outline"
                        className="mt-1 text-xs"
                        style={{
                          borderColor: category?.color || '#64748b',
                          color: category?.color || '#64748b',
                        }}
                      >
                        {IconComponent && <IconComponent className="mr-1 h-3 w-3" />}
                        {category?.label || 'Outros'}
                      </Badge>
                    )
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm font-semibold">
                    {formatCurrencyBRL(expense.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-secondary h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => setEditingExpense(expense)}
                    aria-label="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onRemove(expense.id)}
                    aria-label="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {editingExpense && (
        <ExpenseEditDialog
          expense={editingExpense}
          type={type}
          open={editingExpense !== null}
          onOpenChange={(open) => !open && setEditingExpense(null)}
          onSubmit={onUpdate}
          currentMonth={currentMonth}
        />
      )}
    </Card>
  )
}
