import { differenceInMonths } from 'date-fns'
import type { Goal, SavingsEntry } from './expense-store'

export type GoalDisplayStatus = 'on-track' | 'behind' | 'ahead' | 'overdue' | 'completed'

export function getConfirmedTotal(goalId: string, allEntries: SavingsEntry[]): number {
  return allEntries
    .filter((e) => e.goalId === goalId && e.confirmed)
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getPendingTotal(goalId: string, allEntries: SavingsEntry[]): number {
  return allEntries
    .filter((e) => e.goalId === goalId && !e.confirmed)
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getProgressPercent(goal: Goal, allEntries: SavingsEntry[]): number {
  if (goal.targetAmount <= 0) return 0
  const confirmed = getConfirmedTotal(goal.id, allEntries)
  return Math.min(100, (confirmed / goal.targetAmount) * 100)
}

export function getMonthlyNeeded(goal: Goal, allEntries: SavingsEntry[]): number | null {
  if (!goal.deadline) return null

  const now = new Date()
  const [deadlineYear, deadlineMonth] = goal.deadline.split('-').map(Number)
  const deadlineDate = new Date(deadlineYear, deadlineMonth - 1, 1)

  const monthsLeft = differenceInMonths(deadlineDate, now)
  if (monthsLeft <= 0) return null

  const confirmed = getConfirmedTotal(goal.id, allEntries)
  const remaining = Math.max(0, goal.targetAmount - confirmed)
  return remaining / monthsLeft
}

export function getGoalStatus(goal: Goal, allEntries: SavingsEntry[]): GoalDisplayStatus {
  if (goal.status === 'completed') return 'completed'

  if (!goal.deadline) return 'on-track'

  const now = new Date()
  const [deadlineYear, deadlineMonth] = goal.deadline.split('-').map(Number)
  const deadlineDate = new Date(deadlineYear, deadlineMonth - 1, 1)

  if (now >= deadlineDate) return 'overdue'

  const monthsLeft = differenceInMonths(deadlineDate, now)
  const confirmed = getConfirmedTotal(goal.id, allEntries)
  const remaining = Math.max(0, goal.targetAmount - confirmed)

  // Calculate months elapsed since goal creation
  const createdDate = new Date(goal.createdAt)
  const totalMonths = differenceInMonths(deadlineDate, createdDate)
  const monthsElapsed = Math.max(0, totalMonths - monthsLeft)

  if (totalMonths <= 0) return 'on-track'

  const expectedByNow = (goal.targetAmount / totalMonths) * monthsElapsed
  const monthlyNeeded = remaining / monthsLeft

  if (confirmed >= goal.targetAmount) return 'ahead'
  if (monthlyNeeded <= goal.targetAmount / totalMonths) return 'on-track'
  if (confirmed >= expectedByNow * 0.9) return 'on-track'
  return 'behind'
}
