'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { type SavingsEntry, type Goal } from '@/lib/expense-store'

interface SavingsEntryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (entry: Omit<SavingsEntry, 'id'>) => void
  entry?: SavingsEntry
  currentMonth: string
  activeGoals: Goal[]
}

export function SavingsEntryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  entry,
  currentMonth,
  activeGoals,
}: SavingsEntryFormDialogProps) {
  const i = useTranslations()
  const today = new Date().toISOString().split('T')[0]

  const [amount, setAmount] = useState(entry?.amount?.toString() ?? '')
  const [source, setSource] = useState(entry?.source ?? '')
  const [note, setNote] = useState(entry?.note ?? '')
  const [goalId, setGoalId] = useState(entry?.goalId ?? '')
  const [confirmed, setConfirmed] = useState(entry?.confirmed ?? false)
  const [date, setDate] = useState(entry?.date ?? today)

  useEffect(() => {
    if (open) {
      setAmount(entry?.amount?.toString() ?? '')
      setSource(entry?.source ?? '')
      setNote(entry?.note ?? '')
      setGoalId(entry?.goalId ?? '')
      setConfirmed(entry?.confirmed ?? false)
      setDate(entry?.date ?? today)
    }
  }, [open, entry, today])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount.replace(',', '.')) || 0
    if (parsedAmount <= 0) return

    onSubmit({
      amount: parsedAmount,
      date,
      source: source.trim() || undefined,
      note: note.trim() || undefined,
      goalId: goalId || undefined,
      confirmed,
      monthKey: currentMonth,
    })
    onOpenChange(false)
  }

  const isEditing = !!entry

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? i('savings.editEntry') : i('savings.add')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="entry-amount">{i('savings.amount')}</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                R$
              </span>
              <Input
                id="entry-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-source">{i('savings.source')}</Label>
            <Input
              id="entry-source"
              placeholder={i('savings.sourcePlaceholder')}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-note">{i('savings.note')}</Label>
            <Input
              id="entry-note"
              placeholder=""
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {activeGoals.length > 0 && (
            <div className="space-y-2">
              <Label>{i('savings.goal')}</Label>
              <Select value={goalId} onValueChange={setGoalId}>
                <SelectTrigger>
                  <SelectValue placeholder={i('savings.noGoal')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{i('savings.noGoal')}</SelectItem>
                  {activeGoals.map((goal) => {
                    const IconComponent = (Icons[goal.icon as keyof typeof Icons] ??
                      Icons.Target) as LucideIcon
                    return (
                      <SelectItem key={goal.id} value={goal.id}>
                        <div className="flex items-center gap-2">
                          <IconComponent
                            className="h-4 w-4 flex-shrink-0"
                            style={{ color: goal.color }}
                          />
                          {goal.name}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="entry-date">{i('notes.date')}</Label>
            <Input
              id="entry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex items-start space-x-3 rounded-md border p-3">
            <Checkbox
              id="entry-confirmed"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              className="mt-0.5"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="entry-confirmed"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {i('savings.confirmed')}
              </Label>
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
            <Button type="submit">{i('savings.add')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
