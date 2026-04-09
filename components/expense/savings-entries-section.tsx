'use client'

import { useTranslations } from 'next-intl'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { type SavingsEntry, type Goal } from '@/lib/expense-store'

interface SavingsEntriesSectionProps {
  entries: SavingsEntry[]
  activeGoals: Goal[]
  onAddClick: () => void
  onEditEntry: (entry: SavingsEntry) => void
  onRemove: (entryId: string) => void
}

export function SavingsEntriesSection({
  entries,
  activeGoals,
  onAddClick,
  onEditEntry,
  onRemove,
}: SavingsEntriesSectionProps) {
  const i = useTranslations()

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const total = entries.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-teal-500/10 p-1.5">
              <Icons.PiggyBank className="h-4 w-4 text-teal-600" />
            </div>
            <CardTitle className="text-base font-semibold">{i('savings.title')}</CardTitle>
            {entries.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {entries.length}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 bg-transparent text-xs"
            onClick={onAddClick}
          >
            <Icons.Plus className="mr-1 h-3 w-3" />
            {i('savings.add')}
          </Button>
        </div>
        {entries.length > 0 && (
          <div className="flex items-center justify-between pt-1 text-sm">
            <span className="text-muted-foreground">{entries.length} itens</span>
            <span className="font-semibold text-teal-600 dark:text-teal-400">
              {formatCurrency(total)}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="max-h-[320px] space-y-2 overflow-y-auto">
          {sorted.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {i('savings.noEntries')}
            </p>
          ) : (
            sorted.map((entry) => {
              const linkedGoal = activeGoals.find((g) => g.id === entry.goalId)
              const GoalIcon = linkedGoal
                ? ((Icons[linkedGoal.icon as keyof typeof Icons] ?? Icons.Target) as LucideIcon)
                : null

              return (
                <div
                  key={entry.id}
                  className={cn(
                    'bg-secondary/50 hover:bg-secondary group flex items-center gap-2 rounded-lg p-3 transition-colors',
                    !entry.confirmed && 'opacity-70'
                  )}
                >
                  {GoalIcon && linkedGoal && (
                    <GoalIcon
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: linkedGoal.color }}
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatCurrency(entry.amount)}</span>
                      {!entry.confirmed && (
                        <Badge
                          variant="outline"
                          className="border-yellow-400 py-0 text-[10px] text-yellow-600 dark:text-yellow-400"
                        >
                          {i('savings.pendingBadge')}
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                      {entry.source && <span>{entry.source}</span>}
                      {linkedGoal && (
                        <span className="text-muted-foreground/70">→ {linkedGoal.name}</span>
                      )}
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
                      className="text-muted-foreground hover:text-foreground hover:bg-secondary h-7 w-7"
                      onClick={() => onEditEntry(entry)}
                      aria-label={i('common.edit')}
                    >
                      <Icons.Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                      onClick={() => onRemove(entry.id)}
                      aria-label={i('common.delete')}
                    >
                      <Icons.Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
