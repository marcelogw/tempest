'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import * as Icons from 'lucide-react'
import { Check, type LucideIcon } from 'lucide-react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { CATEGORY_COLOR_PALETTE, type Goal } from '@/lib/expense-store'

const GOAL_ICONS = [
  'Target',
  'Star',
  'TrendingUp',
  'Home',
  'Car',
  'Plane',
  'GraduationCap',
  'Heart',
  'Wallet',
  'Banknote',
  'DollarSign',
  'PiggyBank',
  'Trophy',
  'Award',
  'Gift',
  'ShoppingCart',
  'Laptop',
  'Smartphone',
  'Watch',
  'Camera',
  'Music',
  'Gamepad2',
  'Bike',
  'Train',
  'Coffee',
  'Utensils',
  'Dog',
  'Cat',
  'Baby',
  'Leaf',
  'Flower2',
  'Sparkles',
  'Zap',
  'Flame',
  'Lightbulb',
  'BookOpen',
  'Package',
  'Headphones',
  'Wrench',
  'Users',
  'Building2',
  'Tent',
  'Anchor',
  'Mountain',
  'Globe',
  'Sailboat',
  'Sunset',
  'Dumbbell',
  'Stethoscope',
  'Brush',
]

type GoalFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => void
  goal?: Goal
}

export function GoalFormDialog({ open, onOpenChange, onSubmit, goal }: GoalFormDialogProps) {
  const i = useTranslations()
  const [iconOpen, setIconOpen] = useState(false)

  const currentMonth = new Date().toISOString().slice(0, 7)

  const [name, setName] = useState(goal?.name ?? '')
  const [icon, setIcon] = useState(goal?.icon ?? 'Target')
  const [color, setColor] = useState(goal?.color ?? CATEGORY_COLOR_PALETTE[0])
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() ?? '')
  const [deadline, setDeadline] = useState(goal?.deadline ?? '')

  useEffect(() => {
    if (open) {
      setName(goal?.name ?? '')
      setIcon(goal?.icon ?? 'Target')
      setColor(goal?.color ?? CATEGORY_COLOR_PALETTE[0])
      setTargetAmount(goal?.targetAmount?.toString() ?? '')
      setDeadline(goal?.deadline ?? '')
      setIconOpen(false)
    }
  }, [open, goal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(targetAmount.replace(',', '.')) || 0
    if (!name.trim() || amount <= 0) return
    onSubmit({
      name: name.trim(),
      icon,
      color,
      targetAmount: amount,
      deadline: deadline || undefined,
    })
    onOpenChange(false)
  }

  const IconComponent = (Icons[icon as keyof typeof Icons] ?? Icons.Target) as LucideIcon
  const isEditing = !!goal

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? i('goals.editGoal') : i('goals.add')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-name">{i('goals.name')}</Label>
            <Input
              id="goal-name"
              autoComplete="off"
              placeholder={i('goals.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Icon + Color */}
          <div className="space-y-1.5">
            <Label>{i('ui.selectors.icon')}</Label>
            <div className="flex items-start gap-3">
              {/* Compact icon picker */}
              <Popover open={iconOpen} onOpenChange={setIconOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    aria-label={i('ui.selectors.selectIcon')}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                  <ScrollArea className="h-44">
                    <div className="grid grid-cols-7 gap-1">
                      {GOAL_ICONS.map((iconName) => {
                        const Ic = (Icons[iconName as keyof typeof Icons] ??
                          null) as LucideIcon | null
                        if (!Ic) return null
                        return (
                          <Button
                            key={iconName}
                            type="button"
                            variant={icon === iconName ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setIcon(iconName)
                              setIconOpen(false)
                            }}
                            title={iconName}
                          >
                            <Ic className="h-4 w-4" />
                          </Button>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {/* Color swatches */}
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      'relative h-7 w-7 rounded-md border-2 transition-all hover:scale-110 focus:ring-2 focus:ring-offset-1 focus:outline-none',
                      color === c ? 'border-foreground' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  >
                    {color === c && (
                      <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-amount">{i('goals.targetAmount')}</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                R$
              </span>
              <Input
                id="goal-amount"
                type="number"
                step="1"
                min="1"
                placeholder="0"
                className="pl-10"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-deadline">
              {i('goals.deadline')}{' '}
              <span className="text-muted-foreground text-xs font-normal">
                ({i('goals.deadlineOptional')})
              </span>
            </Label>
            <Input
              id="goal-deadline"
              type="month"
              min={currentMonth}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
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
