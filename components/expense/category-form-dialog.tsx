'use client'

import { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
import { IconSelector } from './icon-selector'
import { useExpenseStore, type Category, CATEGORY_COLOR_PALETTE } from '@/lib/expense-store'
import { useToast } from '@/hooks/use-toast'

type CategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category // If provided, dialog is in edit mode
  mode: 'add' | 'edit'
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  mode,
}: CategoryFormDialogProps) {
  const { addCategory, updateCategory } = useExpenseStore()
  const { toast } = useToast()

  const [label, setLabel] = useState('')
  const [color, setColor] = useState(CATEGORY_COLOR_PALETTE[0])
  const [icon, setIcon] = useState<string | null>(null)

  // Initialize form when category changes or dialog opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && category) {
        setLabel(category.label)
        setColor(category.color)
        setIcon(category.icon)
      } else {
        setLabel('')
        setColor(CATEGORY_COLOR_PALETTE[0])
        setIcon(null)
      }
    }
  }, [open, mode, category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!label.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da categoria é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (mode === 'edit' && category) {
        updateCategory(category.id, { label, color, icon })
        toast({
          title: 'Sucesso',
          description: 'Categoria atualizada com sucesso!',
        })
      } else {
        addCategory(label, color, icon)
        toast({
          title: 'Sucesso',
          description: 'Categoria criada com sucesso!',
        })
      }
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar categoria.',
        variant: 'destructive',
      })
    }
  }

  const IconComponent = icon ? (Icons as unknown as Record<string, LucideIcon>)[icon] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Modifique os detalhes da categoria.'
              : 'Crie uma nova categoria personalizada para suas despesas.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="label">Nome da Categoria</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Transporte, Alimentação..."
              required
            />
          </div>

          <ColorSelector selectedColor={color} onColorSelect={setColor} />

          <IconSelector selectedIcon={icon} onIconSelect={setIcon} />

          {/* Preview */}
          <div className="space-y-2">
            <Label>Pré-visualização</Label>
            <div className="flex items-center gap-2 rounded-md border p-3">
              {IconComponent && <IconComponent className="h-5 w-5" style={{ color }} />}
              <span className="font-medium" style={{ color }}>
                {label || 'Nome da Categoria'}
              </span>
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
