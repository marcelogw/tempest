'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
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
import { useExpenseStore, type CreditCard } from '@/lib/expense-store'
import { formatCurrency } from '@/lib/formatters'
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
  const i = useTranslations()
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
        title: i('errors.generic'),
        description: i('forms.creditCard.cardNameRequired'),
        variant: 'destructive',
      })
      return
    }

    const limit = limitInput.trim() === '' ? null : parseFloat(limitInput)

    if (limit !== null && (isNaN(limit) || limit <= 0)) {
      toast({
        title: i('errors.generic'),
        description: i('forms.creditCard.limitValidation'),
        variant: 'destructive',
      })
      return
    }

    try {
      if (mode === 'edit' && card) {
        updateCreditCard(card.id, { name, color, limit })
        toast({
          title: i('toast.success.updated'),
          description: i('forms.creditCard.updateSuccess'),
        })
      } else {
        addCreditCard(name, color, limit)
        toast({
          title: i('toast.success.created'),
          description: i('forms.creditCard.createSuccess'),
        })
      }
      onOpenChange(false)
    } catch (error) {
      toast({
        title: i('errors.generic'),
        description: error instanceof Error ? error.message : i('forms.creditCard.saveError'),
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
          <DialogTitle>
            {mode === 'edit' ? i('forms.creditCard.editCard') : i('forms.creditCard.newCard')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? i('forms.creditCard.editDescription')
              : i('forms.creditCard.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="card-name">{i('forms.creditCard.cardName')}</Label>
            <Input
              id="card-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={i('forms.creditCard.cardNamePlaceholder')}
              required
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          <ColorSelector selectedColor={color} onColorSelect={setColor} />

          <div className="space-y-2">
            <Label htmlFor="card-limit">{i('forms.creditCard.monthlyLimitOptional')}</Label>
            <Input
              id="card-limit"
              type="number"
              step="0.01"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              placeholder={i('forms.creditCard.limitPlaceholder')}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
            <p className="text-muted-foreground text-sm">{i('forms.creditCard.limitHelp')}</p>
          </div>

          <div className="space-y-2">
            <Label>{i('forms.creditCard.preview')}</Label>
            <div className="flex items-center gap-3 rounded-md border p-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <div className="flex flex-col gap-1">
                <span className="font-medium">{name || i('forms.creditCard.previewCardName')}</span>
                <span className="text-muted-foreground text-sm">
                  {limitValid && limit !== null
                    ? `${i('forms.creditCard.previewLimit')} ${formatCurrency(limit)}`
                    : i('forms.creditCard.noLimit')}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {i('common.cancel')}
            </Button>
            <Button type="submit">
              {mode === 'edit' ? i('common.save') : i('forms.creditCard.createCard')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
