'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2, Pencil, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyBRL, type Income } from '@/lib/expense-store'

interface IncomeListProps {
  incomes: Income[]
  onRemove: (id: string) => void
  onUpdate: (income: Income, makeRecurring?: boolean) => void
}

export function IncomeList({ incomes, onRemove, onUpdate }: IncomeListProps) {
  const i = useTranslations()
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [makeRecurring, setMakeRecurring] = useState(false)

  const sortedIncomes = [...incomes].sort((a, b) => b.amount - a.amount)

  const handleEditClick = (income: Income) => {
    setEditingIncome(income)
    setDescription(income.description)
    setAmount(income.amount.toString())
    setMakeRecurring(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingIncome) return

    const amountNum = parseFloat(amount.replace(',', '.')) || 0
    onUpdate({ ...editingIncome, description, amount: amountNum }, makeRecurring)
    setEditingIncome(null)
  }

  return (
    <>
      <div className="max-h-[320px] space-y-2 overflow-y-auto">
        {sortedIncomes.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            {i('ui.income.noIncome')}
          </p>
        ) : (
          sortedIncomes.map((income) => (
            <div
              key={income.id}
              className="bg-secondary/50 hover:bg-secondary group flex items-center justify-between rounded-lg p-3 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-foreground truncate text-sm font-medium">
                    {income.description}
                  </p>
                  {income.recurringGroupId && (
                    <RefreshCw className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="mt-1 text-xs"
                  style={{ borderColor: '#10b981', color: '#10b981' }}
                >
                  {i('ui.income.income')}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyBRL(income.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleEditClick(income)}
                  aria-label={i('ui.income.editLabel')}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => onRemove(income.id)}
                  aria-label={i('ui.income.removeLabel')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingIncome && (
        <Dialog
          open={editingIncome !== null}
          onOpenChange={(open) => !open && setEditingIncome(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{i('ui.income.editIncome')}</DialogTitle>
              <DialogDescription>{i('ui.income.editDescription')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-description">{i('ui.income.description')}</Label>
                <Input
                  id="edit-description"
                  placeholder={i('ui.income.placeholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">{i('ui.income.amount')}</Label>
                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                    R$
                  </span>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    className="pl-10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3">
                <Checkbox
                  id="make-recurring"
                  checked={makeRecurring}
                  onCheckedChange={(checked) => setMakeRecurring(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="make-recurring"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {i('ui.income.replicateToFuture')}
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    {i('ui.income.replicateDescription')}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingIncome(null)}>
                  {i('common.cancel')}
                </Button>
                <Button type="submit">{i('ui.income.saveChanges')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
