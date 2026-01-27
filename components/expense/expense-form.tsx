'use client'

import { useState } from 'react'
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
import { Plus } from 'lucide-react'
import { type ExpenseCategory, categoryLabels } from '@/lib/expense-store'

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
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('other')

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
    setCategory('other')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 bg-transparent">
          <Plus className="h-4 w-4" />
          Adicionar {type === 'fixed' ? 'Fixa' : 'Variavel'}
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
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
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
