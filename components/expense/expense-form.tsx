'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { type ExpenseCategory, useExpenseStore, SYSTEM_CATEGORY_ID } from '@/lib/expense-store'

interface ExpenseFormProps {
  type: 'fixed' | 'variable'
  onSubmit: (expense: {
    description: string
    amount: number
    category: ExpenseCategory
    type: 'fixed' | 'variable'
    date: string
  }) => void
  currentMonth: string
}

export function ExpenseForm({ type, onSubmit, currentMonth }: ExpenseFormProps) {
  const i = useTranslations()
  const categories = useExpenseStore((state) => state.categories)
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>(SYSTEM_CATEGORY_ID)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount) return

    onSubmit({
      description,
      amount: parseFloat(amount),
      category,
      type,
      date: currentMonth + '-01',
    })

    setDescription('')
    setAmount('')
    setCategory(SYSTEM_CATEGORY_ID)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 bg-transparent"
          title={`Adicionar Despesa ${type === 'fixed' ? 'Fixa' : 'Variável'}`}
        >
          <Icons.Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Despesa {type === 'fixed' ? 'Fixa' : 'Variavel'}</DialogTitle>
          <DialogDescription>
            Insira os detalhes da sua despesa {type === 'fixed' ? 'fixa' : 'variavel'}. Clique em
            salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Input
              id="description"
              placeholder="ex: Assinatura Netflix"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
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
            <Label htmlFor="category">Categoria</Label>
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar Despesa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
