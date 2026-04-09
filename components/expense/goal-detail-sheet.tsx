'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Plus, Pencil, Trash2, CheckCircle2, RotateCcw } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { type Goal, type SavingsEntry } from '@/lib/expense-store'
import {
  getConfirmedTotal,
  getPendingTotal,
  getProgressPercent,
  getMonthlyNeeded,
} from '@/lib/goal-utils'
import { SavingsEntryFormDialog } from './savings-entry-form-dialog'

interface GoalDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: Goal
  allEntries: SavingsEntry[]
  activeGoals: Goal[]
  onAddEntry: (month: string, entry: Omit<SavingsEntry, 'id'>) => void
  onUpdateEntry: (month: string, entry: SavingsEntry) => void
  onRemoveEntry: (month: string, entryId: string) => void
  onComplete: () => void
  onReactivate: () => void
}

export function GoalDetailSheet({
  open,
  onOpenChange,
  goal,
  allEntries,
  activeGoals,
  onAddEntry,
  onUpdateEntry,
  onRemoveEntry,
  onComplete,
  onReactivate,
}: GoalDetailSheetProps) {
  const i = useTranslations()
  const [addEntryOpen, setAddEntryOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<SavingsEntry | null>(null)

  const IconComponent = (Icons[goal.icon as keyof typeof Icons] ?? Icons.Target) as LucideIcon

  const goalEntries = allEntries.filter((e) => e.goalId === goal.id)
  const confirmedTotal = getConfirmedTotal(goal.id, allEntries)
  const pendingTotal = getPendingTotal(goal.id, allEntries)
  const progress = getProgressPercent(goal, allEntries)
  const monthlyNeeded = getMonthlyNeeded(goal, allEntries)

  const confirmedPercent = goal.targetAmount > 0 ? (confirmedTotal / goal.targetAmount) * 100 : 0
  const pendingPercent =
    goal.targetAmount > 0 ? Math.min(100 - confirmedPercent, (pendingTotal / goal.targetAmount) * 100) : 0

  const sorted = [...goalEntries].sort((a, b) => b.date.localeCompare(a.date))

  const currentMonth = new Date().toISOString().slice(0, 7)

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: `${goal.color}20` }}
              >
                <IconComponent className="h-5 w-5" style={{ color: goal.color }} />
              </div>
              <div>
                <SheetTitle>{goal.name}</SheetTitle>
                <Badge
                  variant={goal.status === 'completed' ? 'secondary' : 'outline'}
                  className="mt-1 text-[10px]"
                >
                  {goal.status === 'completed' ? i('goals.completedSection') : 'Ativa'}
                </Badge>
              </div>
            </div>
          </SheetHeader>

          {/* Progress */}
          <div className="space-y-3 py-4">
            <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, confirmedPercent)}%`, backgroundColor: goal.color }}
              />
              <div
                className="absolute top-0 h-full rounded-full transition-all"
                style={{
                  left: `${Math.min(100, confirmedPercent)}%`,
                  width: `${pendingPercent}%`,
                  backgroundColor: `${goal.color}60`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-semibold">{formatCurrency(confirmedTotal)}</span>
                <span className="text-muted-foreground"> confirmado</span>
              </div>
              <span className="font-semibold" style={{ color: goal.color }}>
                {progress.toFixed(0)}%
              </span>
            </div>

            {pendingTotal > 0 && (
              <p className="text-muted-foreground text-xs">
                + {formatCurrency(pendingTotal)} em previsão
              </p>
            )}

            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>{formatCurrency(goal.targetAmount)} alvo</span>
              {monthlyNeeded !== null && (
                <span>
                  {i('goals.monthlyNeeded')}: {formatCurrency(monthlyNeeded)}/mês
                </span>
              )}
              {goal.deadline && !monthlyNeeded && (
                <span className="text-destructive font-medium">{i('goals.overdue')}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 py-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setAddEntryOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              {i('savings.add')}
            </Button>
            {goal.status === 'active' ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    {i('goals.complete')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{i('goals.completeConfirm')}</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{i('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={onComplete}>{i('common.confirm')}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button size="sm" variant="outline" className="bg-transparent" onClick={onReactivate}>
                <RotateCcw className="mr-1 h-4 w-4" />
                {i('goals.reactivate')}
              </Button>
            )}
          </div>

          {/* Entries list */}
          <div className="mt-4 space-y-2">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Contribuições ({goalEntries.length})
            </p>
            {sorted.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                {i('savings.noEntries')}
              </p>
            ) : (
              sorted.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'bg-secondary/50 hover:bg-secondary group flex items-center gap-2 rounded-lg p-3 transition-colors',
                    !entry.confirmed && 'opacity-50'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatCurrency(entry.amount)}</span>
                      {!entry.confirmed && (
                        <Badge
                          variant="outline"
                          className="border-yellow-400 py-0 text-[10px] text-yellow-600"
                        >
                          {i('savings.pendingBadge')}
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-0.5 text-xs">
                      {entry.source && <span>{entry.source} · </span>}
                      <span>{entry.date}</span>
                    </div>
                    {entry.note && (
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">{entry.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-7 w-7"
                      onClick={() => setEditingEntry(entry)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                      onClick={() => onRemoveEntry(entry.monthKey ?? currentMonth, entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <SavingsEntryFormDialog
        open={addEntryOpen}
        onOpenChange={setAddEntryOpen}
        onSubmit={(entry) => onAddEntry(entry.monthKey ?? currentMonth, { ...entry, goalId: goal.id })}
        currentMonth={currentMonth}
        activeGoals={activeGoals}
      />

      {editingEntry && (
        <SavingsEntryFormDialog
          open={editingEntry !== null}
          onOpenChange={(open) => !open && setEditingEntry(null)}
          onSubmit={(updates) => {
            onUpdateEntry(editingEntry.monthKey ?? currentMonth, {
              ...editingEntry,
              ...updates,
            })
          }}
          entry={editingEntry}
          currentMonth={editingEntry.monthKey ?? currentMonth}
          activeGoals={activeGoals}
        />
      )}
    </>
  )
}
