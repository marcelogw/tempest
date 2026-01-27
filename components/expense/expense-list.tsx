'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Lock, Shuffle } from 'lucide-react'
import { type Expense, categoryLabels, categoryColors, formatCurrencyBRL } from '@/lib/expense-store'
import { ExpenseForm } from './expense-form'
import { cn } from '@/lib/utils'

interface ExpenseListProps {
  title: string
  expenses: Expense[]
  type: 'fixed' | 'variable'
  onAdd: (expense: Omit<Expense, 'id'>) => void
  onRemove: (id: string) => void
  currentMonth: string
}

export function ExpenseList({ 
  title, 
  expenses, 
  type, 
  onAdd, 
  onRemove,
  currentMonth 
}: ExpenseListProps) {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const Icon = type === 'fixed' ? Lock : Shuffle

  return (
    <Card className="h-full border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-1.5 rounded-md',
              type === 'fixed' ? 'bg-primary/10' : 'bg-chart-3/10'
            )}>
              <Icon className={cn(
                'h-4 w-4',
                type === 'fixed' ? 'text-primary' : 'text-chart-3'
              )} />
            </div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          <ExpenseForm type={type} onSubmit={onAdd} currentMonth={currentMonth} />
        </div>
        <div className="flex items-center justify-between text-sm pt-2">
          <span className="text-muted-foreground">{expenses.length} itens</span>
          <span className="font-semibold text-foreground">{formatCurrencyBRL(total)}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-[320px] overflow-y-auto">
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma despesa {type === 'fixed' ? 'fixa' : 'variavel'} ainda. Clique em "Adicionar {type === 'fixed' ? 'Fixa' : 'Variavel'}" para adicionar.
            </p>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                data-testid="expense-item"
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {expense.description}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-1 text-xs"
                    style={{
                      borderColor: categoryColors[expense.category],
                      color: categoryColors[expense.category],
                    }}
                  >
                    {categoryLabels[expense.category]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrencyBRL(expense.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
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
    </Card>
  )
}
