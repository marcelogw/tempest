'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IconSelector } from './icon-selector'
import { ColorSelector } from './color-selector'
import { CATEGORY_COLOR_PALETTE, type Goal } from '@/lib/expense-store'

interface GoalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => void
  goal?: Goal
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => (CURRENT_YEAR + i).toString())
const MONTH_VALUES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

export function GoalFormDialog({ open, onOpenChange, onSubmit, goal }: GoalFormDialogProps) {
  const i = useTranslations()

  const [name, setName] = useState(goal?.name ?? '')
  const [icon, setIcon] = useState<string | null>(goal?.icon ?? 'Target')
  const [color, setColor] = useState(goal?.color ?? CATEGORY_COLOR_PALETTE[0])
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() ?? '')
  const [deadlineYear, setDeadlineYear] = useState(
    goal?.deadline ? goal.deadline.split('-')[0] : ''
  )
  const [deadlineMonth, setDeadlineMonth] = useState(
    goal?.deadline ? goal.deadline.split('-')[1] : ''
  )

  useEffect(() => {
    if (open) {
      setName(goal?.name ?? '')
      setIcon(goal?.icon ?? 'Target')
      setColor(goal?.color ?? CATEGORY_COLOR_PALETTE[0])
      setTargetAmount(goal?.targetAmount?.toString() ?? '')
      setDeadlineYear(goal?.deadline ? goal.deadline.split('-')[0] : '')
      setDeadlineMonth(goal?.deadline ? goal.deadline.split('-')[1] : '')
    }
  }, [open, goal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(targetAmount.replace(',', '.')) || 0
    if (!name.trim() || amount <= 0) return

    const deadline = deadlineYear && deadlineMonth ? `${deadlineYear}-${deadlineMonth}` : undefined

    onSubmit({ name: name.trim(), icon: icon ?? 'Target', color, targetAmount: amount, deadline })
    onOpenChange(false)
  }

  const isEditing = !!goal

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? i('goals.editGoal') : i('goals.add')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">{i('goals.name')}</Label>
            <Input
              id="goal-name"
              placeholder={i('goals.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <IconSelector selectedIcon={icon} onIconSelect={setIcon} />
            <ColorSelector selectedColor={color} onColorSelect={setColor} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-amount">{i('goals.targetAmount')}</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                R$
              </span>
              <Input
                id="goal-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                className="pl-10"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{i('goals.deadline')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={deadlineMonth} onValueChange={setDeadlineMonth}>
                <SelectTrigger>
                  <SelectValue placeholder={i('goals.noDeadline')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{i('goals.noDeadline')}</SelectItem>
                  {MONTH_VALUES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {i(`goals.months.${v}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={deadlineYear} onValueChange={setDeadlineYear}>
                <SelectTrigger>
                  <SelectValue placeholder={i('goals.deadline')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">—</SelectItem>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent"
            >
              {i('common.cancel')}
            </Button>
            <Button type="submit">{i('goals.saveChanges')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
