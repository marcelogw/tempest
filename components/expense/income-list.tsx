'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, RefreshCw } from 'lucide-react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { Income } from '@/lib/expense-store'

interface IncomeListProps {
  incomes: Income[]
  onAdd: (income: Omit<Income, 'id'>, replicate: boolean) => void
  onRemove: (id: string) => void
  onUpdate: (income: Income, makeRecurring?: boolean) => void
}

export function IncomeList({ incomes, onAdd, onRemove, onUpdate }: IncomeListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)

  // Form state
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [replicate, setReplicate] = useState(false)

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setReplicate(false)
    setEditingIncome(null)
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) resetForm()
  }

  const handleEditClick = (income: Income) => {
    setEditingIncome(income)
    setDescription(income.description)
    setAmount(income.amount.toString())
    setReplicate(false) // Reset checking
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = parseFloat(amount.replace(',', '.')) || 0

    if (editingIncome) {
      onUpdate(
        { ...editingIncome, description, amount: amountNum },
        replicate // pass as makeRecurring if checking
      )
    } else {
      onAdd({ description, amount: amountNum }, replicate)
    }

    handleOpenChange(false)
  }

  const sortedIncomes = [...incomes].sort((a, b) => b.amount - a.amount)

  const totalIncome = sortedIncomes.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-lg font-medium">Fontes de Renda</h3>
        <span className="text-muted-foreground text-sm">
          Total:{' '}
          <span className="text-foreground font-semibold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              totalIncome
            )}
          </span>
        </span>
      </div>

      <div className="space-y-2">
        {sortedIncomes.map((income) => (
          <div
            key={income.id}
            className="group bg-card flex items-center justify-between rounded-lg border p-3 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{income.description}</p>
                  {income.recurringGroupId && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Recorrente
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    income.amount
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditClick(income)}
                className="text-muted-foreground hover:text-foreground h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(income.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {incomes.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground text-sm">Nenhuma fonte de renda cadastrada.</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Renda
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingIncome ? 'Editar Renda' : 'Nova Renda'}</DialogTitle>
            <DialogDescription>Adicione uma fonte de renda para este mês.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Salário, Freelance..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                  R$
                </span>
                <Input
                  id="amount"
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
                id="replicate"
                checked={replicate}
                onCheckedChange={(checked) => setReplicate(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="replicate"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Replicar para meses seguintes
                </Label>
                <p className="text-muted-foreground text-xs">
                  Se marcado, esta renda será adicionada/atualizada nos próximos 24 meses.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingIncome ? 'Salvar Alterações' : 'Adicionar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
