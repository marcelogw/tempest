'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
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
  const i = useTranslations()
  const { addCategory, updateCategory } = useExpenseStore()
  const { toast } = useToast()

  const [customLabel, setCustomLabel] = useState('')
  const [color, setColor] = useState(CATEGORY_COLOR_PALETTE[0])
  const [icon, setIcon] = useState<string | null>(null)

  // Initialize form when category changes or dialog opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && category) {
        setCustomLabel(category.customLabel || '')
        setColor(category.color)
        setIcon(category.icon)
      } else {
        setCustomLabel('')
        setColor(CATEGORY_COLOR_PALETTE[0])
        setIcon(null)
      }
    }
  }, [open, mode, category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customLabel.trim()) {
      toast({
        title: i('toast.error.saveFailed'),
        description: i('validation.required', { field: i('ui.categories.categoryName') }),
        variant: 'destructive',
      })
      return
    }

    try {
      if (mode === 'edit' && category) {
        updateCategory(category.id, { customLabel, color, icon })
        toast({
          title: i('toast.success.updated'),
          description: i('ui.categories.updateSuccess'),
        })
      } else {
        addCategory(customLabel, color, icon)
        toast({
          title: i('toast.success.created'),
          description: i('ui.categories.createSuccess'),
        })
      }
      onOpenChange(false)
    } catch (error) {
      toast({
        title: i('toast.error.saveFailed'),
        description: error instanceof Error ? error.message : i('errors.generic'),
        variant: 'destructive',
      })
    }
  }

  const IconComponent = icon ? (Icons as unknown as Record<string, LucideIcon>)[icon] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? i('ui.categories.editCategory') : i('ui.categories.addCategory')}
          </DialogTitle>
          <DialogDescription>{i('ui.categories.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="customLabel">{i('ui.categories.categoryName')}</Label>
            <Input
              id="customLabel"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder={i('ui.categories.categoryName')}
              required
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          <ColorSelector selectedColor={color} onColorSelect={setColor} />

          <IconSelector selectedIcon={icon} onIconSelect={setIcon} />

          {/* Preview */}
          <div className="space-y-2">
            <Label>{i('ui.categories.selectIcon')}</Label>
            <div className="flex items-center gap-2 rounded-md border p-3">
              {IconComponent && <IconComponent className="h-5 w-5" style={{ color }} />}
              <span className="font-medium" style={{ color }}>
                {customLabel || i('ui.categories.categoryName')}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {i('common.cancel')}
            </Button>
            <Button type="submit">{mode === 'edit' ? i('common.save') : i('common.add')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
