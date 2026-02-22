'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type Expense, type ExpenseCategory, useExpenseStore } from '@/lib/expense-store'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ExpenseEditDialogProps {
  expense: Expense
  type: 'fixed' | 'variable'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (expense: Expense, makeRecurring?: boolean) => void
  currentMonth: string
}

export function ExpenseEditDialog({
  expense,
  type,
  open,
  onOpenChange,
  onSubmit,
  currentMonth,
}: ExpenseEditDialogProps) {
  const i = useTranslations()
  const categories = useExpenseStore((state) => state.categories)
  const [description, setDescription] = useState(expense.description)
  const [amount, setAmount] = useState(expense.amount.toString())
  const [category, setCategory] = useState<ExpenseCategory>(expense.category)
  const [makeRecurring, setMakeRecurring] = useState(false)

  // Reset form when expense changes
  useEffect(() => {
    setDescription(expense.description)
    setAmount(expense.amount.toString())
    setCategory(expense.category)
    setMakeRecurring(false)
  }, [expense])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount) return

    const updatedExpense: Expense = {
      ...expense,
      description,
      amount: parseFloat(amount),
      category,
      date: currentMonth + '-01',
    }

    onSubmit(updatedExpense, makeRecurring)
    onOpenChange(false)
  }

  const isRecurringFixed = type === 'fixed' && expense.recurringGroupId
  const isNonRecurringFixed = type === 'fixed' && !expense.recurringGroupId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Despesa {type === 'fixed' ? 'Fixa' : 'Variavel'}</DialogTitle>
          <DialogDescription>
            Modifique os detalhes da sua despesa {type === 'fixed' ? 'fixa' : 'variavel'}. Clique em
            salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        {isRecurringFixed && (
          <div className="bg-primary/10 text-primary flex items-start gap-2 rounded-md p-3 text-sm">
            <Icons.Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              Esta é uma despesa recorrente. As alterações serão aplicadas a partir deste mês em
              todos os meses futuros.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descricao</Label>
            <Input
              id="edit-description"
              placeholder="ex: Assinatura Netflix"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-amount">Valor (R$)</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .sort((a, b) => a.order - b.order)
                  .map((cat) => {
                    const IconComponent = cat.icon
                      ? (Icons as unknown as Record<string, LucideIcon>)[cat.icon]
                      : null
                    const displayName = cat.customLabel || i(`categories.${cat.id}`)
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          {IconComponent && (
                            <IconComponent className="h-4 w-4" style={{ color: cat.color }} />
                          )}
                          <span>{displayName}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
              </SelectContent>
            </Select>
          </div>

          {isNonRecurringFixed && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="make-recurring"
                checked={makeRecurring}
                onCheckedChange={(checked) => setMakeRecurring(checked as boolean)}
              />
              <Label
                htmlFor="make-recurring"
                className="text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tornar recorrente (aplicar para meses futuros)
              </Label>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar Alteracoes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
