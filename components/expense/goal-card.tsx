'use client'

import { useTranslations } from 'next-intl'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { type Goal, type SavingsEntry } from '@/lib/expense-store'
import { getProgressPercent, getMonthlyNeeded, getGoalStatus } from '@/lib/goal-utils'

interface GoalCardProps {
  goal: Goal
  allEntries: SavingsEntry[]
  onView: () => void
  onEdit: () => void
  onComplete: () => void
  onReactivate: () => void
  onDelete: () => void
}

export function GoalCard({
  goal,
  allEntries,
  onView,
  onEdit,
  onComplete,
  onReactivate,
  onDelete,
}: GoalCardProps) {
  const i = useTranslations()

  const IconComponent = (Icons[goal.icon as keyof typeof Icons] ?? Icons.Target) as LucideIcon
  const progress = getProgressPercent(goal, allEntries)
  const monthlyNeeded = getMonthlyNeeded(goal, allEntries)
  const status = getGoalStatus(goal, allEntries)
  const isCompleted = goal.status === 'completed'

  const confirmedTotal = allEntries
    .filter((e) => e.goalId === goal.id && e.confirmed)
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <Card
      className={cn(
        'border-border/50 cursor-pointer shadow-sm transition-shadow hover:shadow-md',
        isCompleted && 'opacity-60'
      )}
      onClick={onView}
    >
      <div className="flex overflow-hidden rounded-lg">
        <div className="w-1 flex-shrink-0 rounded-l-lg" style={{ backgroundColor: goal.color }} />
        <CardContent className="min-w-0 flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className="flex-shrink-0 rounded-md p-1.5"
                style={{ backgroundColor: `${goal.color}20` }}
              >
                <IconComponent className="h-4 w-4" style={{ color: goal.color }} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{goal.name}</p>
                {isCompleted && (
                  <Badge variant="secondary" className="mt-0.5 text-[10px]">
                    {i('goals.completedSection')}
                  </Badge>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icons.MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={onView}>
                  <Icons.Eye className="mr-2 h-4 w-4" />
                  {i('goals.viewDetails')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Icons.Pencil className="mr-2 h-4 w-4" />
                  {i('common.edit')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isCompleted ? (
                  <DropdownMenuItem onClick={onReactivate}>
                    <Icons.RotateCcw className="mr-2 h-4 w-4" />
                    {i('goals.reactivate')}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={onComplete}>
                    <Icons.CheckCircle2 className="mr-2 h-4 w-4" />
                    {i('goals.complete')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Icons.Trash2 className="mr-2 h-4 w-4" />
                  {i('goals.deleteGoal')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 space-y-2">
            <Progress
              value={progress}
              className="h-2"
              style={
                {
                  '--progress-foreground': goal.color,
                } as React.CSSProperties
              }
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {formatCurrency(confirmedTotal)} / {formatCurrency(goal.targetAmount)}
              </span>
              <span className="font-medium" style={{ color: goal.color }}>
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>

          {!isCompleted && (
            <div className="text-muted-foreground mt-2 text-xs">
              {status === 'overdue' && (
                <span className="text-destructive font-medium">{i('goals.overdue')}</span>
              )}
              {goal.deadline && status !== 'overdue' && monthlyNeeded !== null && (
                <span>
                  {i('goals.monthlyNeeded')}: {formatCurrency(monthlyNeeded)}
                  {i('goals.perMonth')}
                </span>
              )}
              {!goal.deadline && <span>{i('goals.noDeadline')}</span>}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
