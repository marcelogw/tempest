'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorSelector } from './color-selector'
import { useExpenseStore, type CreditCard, formatCurrencyBRL } from '@/lib/expense-store'
import { useToast } from '@/hooks/use-toast'

type CreditCardFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  card?: CreditCard
  mode: 'add' | 'edit'
}

export function CreditCardFormDialog({
  open,
  onOpenChange,
  card,
  mode,
}: CreditCardFormDialogProps) {
  const { addCreditCard, updateCreditCard } = useExpenseStore()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [color, setColor] = useState('#8b5cf6')
  const [limitInput, setLimitInput] = useState('')

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && card) {
        setName(card.name)
        setColor(card.color)
        setLimitInput(card.limit !== null ? card.limit.toString() : '')
      } else {
        setName('')
        setColor('#8b5cf6')
        setLimitInput('')
      }
    }
  }, [open, mode, card])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome do cartão é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    const limit = limitInput.trim() === '' ? null : parseFloat(limitInput)

    if (limit !== null && (isNaN(limit) || limit <= 0)) {
      toast({
        title: 'Erro',
        description: 'O limite deve ser um valor maior que zero ou deixado vazio.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (mode === 'edit' && card) {
        updateCreditCard(card.id, { name, color, limit })
        toast({
          title: 'Sucesso',
          description: 'Cartão atualizado com sucesso!',
        })
      } else {
        addCreditCard(name, color, limit)
        toast({
          title: 'Sucesso',
          description: 'Cartão criado com sucesso!',
        })
      }
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar cartão.',
        variant: 'destructive',
      })
    }
  }

  const limit = limitInput.trim() === '' ? null : parseFloat(limitInput)
  const limitValid = limit === null || (!isNaN(limit) && limit > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Editar Cartão' : 'Novo Cartão'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Modifique os detalhes do cartão de crédito.'
              : 'Crie um novo cartão de crédito para rastreamento de parcelamentos.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="card-name">Nome</Label>
            <Input
              id="card-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nubank Pri, Itaú..."
              required
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          <ColorSelector selectedColor={color} onColorSelect={setColor} />

          <div className="space-y-2">
            <Label htmlFor="card-limit">Limite (opcional)</Label>
            <Input
              id="card-limit"
              type="number"
              step="0.01"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              placeholder="0.00"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
            <p className="text-muted-foreground text-sm">
              Deixe vazio para cartões sem limite definido.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Pré-visualização</Label>
            <div className="flex items-center gap-3 rounded-md border p-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <div className="flex flex-col gap-1">
                <span className="font-medium">{name || 'Nome do Cartão'}</span>
                <span className="text-muted-foreground text-sm">
                  {limitValid && limit !== null
                    ? `Limite: ${formatCurrencyBRL(limit)}`
                    : 'Sem limite'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{mode === 'edit' ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
