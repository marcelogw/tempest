'use client'

import { cn } from '@/lib/utils'

type GoalProgressBarProps = {
  confirmedPercent: number
  pendingPercent: number
  color: string
  className?: string
}

export function GoalProgressBar({
  confirmedPercent,
  pendingPercent,
  color,
  className,
}: GoalProgressBarProps) {
  return (
    <div className={cn('bg-secondary relative overflow-hidden rounded-full', className)}>
      <div
        className="absolute top-0 left-0 h-full rounded-full transition-all"
        style={{
          width: `${Math.min(100, confirmedPercent)}%`,
          backgroundColor: color,
        }}
      />
      <div
        className="absolute top-0 h-full rounded-full transition-all"
        style={{
          left: `${Math.min(100, confirmedPercent)}%`,
          width: `${Math.min(100 - Math.min(100, confirmedPercent), pendingPercent)}%`,
          backgroundColor: `${color}60`,
        }}
      />
    </div>
  )
}
