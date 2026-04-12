'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Target, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useExpenseStore, type Goal } from '@/lib/expense-store'
import { GoalCard } from './goal-card'
import { GoalFormDialog } from './goal-form-dialog'
import { GoalDetailSheet } from './goal-detail-sheet'

export function GoalsView() {
  const i = useTranslations()
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    reactivateGoal,
    getSavingsEntriesForGoal,
    addSavingsEntry,
    updateSavingsEntryById,
    removeSavingsEntryById,
  } = useExpenseStore()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [completedOpen, setCompletedOpen] = useState(false)

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  const currentMonth = new Date().toISOString().slice(0, 7)

  const handleUpdateGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => {
    if (!editingGoal) return
    updateGoal(editingGoal.id, goal)
    if (selectedGoal?.id === editingGoal.id) {
      setSelectedGoal({ ...editingGoal, ...goal })
    }
    setEditingGoal(null)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-border bg-card flex-shrink-0 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">{i('goals.title')}</h1>
            <p className="text-muted-foreground text-sm">{i('goals.subtitle')}</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {i('goals.add')}
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Active goals */}
          {activeGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <div className="bg-muted mb-4 rounded-full p-4">
                <Target className="text-muted-foreground h-8 w-8" />
              </div>
              <p className="text-foreground font-medium">{i('goals.noGoals')}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {i('goals.noGoalsCreate', { add: i('goals.add') })}
              </p>
              <Button onClick={() => setAddDialogOpen(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                {i('goals.add')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  goalEntries={getSavingsEntriesForGoal(goal.id)}
                  onView={() => setSelectedGoal(goal)}
                  onEdit={() => setEditingGoal(goal)}
                  onComplete={() => completeGoal(goal.id)}
                  onReactivate={() => reactivateGoal(goal.id)}
                  onDelete={() => deleteGoal(goal.id)}
                />
              ))}
            </div>
          )}

          {/* Completed goals */}
          {completedGoals.length > 0 && (
            <Collapsible open={completedOpen} onOpenChange={setCompletedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="gap-2 px-0 text-sm font-medium">
                  {completedOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {i('goals.completedSection')} ({completedGoals.length})
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      goalEntries={getSavingsEntriesForGoal(goal.id)}
                      onView={() => setSelectedGoal(goal)}
                      onEdit={() => setEditingGoal(goal)}
                      onComplete={() => completeGoal(goal.id)}
                      onReactivate={() => reactivateGoal(goal.id)}
                      onDelete={() => deleteGoal(goal.id)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </main>

      <GoalFormDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSubmit={addGoal} />

      {editingGoal && (
        <GoalFormDialog
          open={editingGoal !== null}
          onOpenChange={(open) => !open && setEditingGoal(null)}
          onSubmit={handleUpdateGoal}
          goal={editingGoal}
        />
      )}

      {selectedGoal && (
        <GoalDetailSheet
          open={selectedGoal !== null}
          onOpenChange={(open) => !open && setSelectedGoal(null)}
          goal={selectedGoal}
          goalEntries={getSavingsEntriesForGoal(selectedGoal.id)}
          activeGoals={activeGoals}
          onAdd={(entry) => addSavingsEntry(currentMonth, entry)}
          onUpdate={(entry) => updateSavingsEntryById(entry.id, entry)}
          onRemove={removeSavingsEntryById}
          onComplete={() => {
            completeGoal(selectedGoal.id)
            setSelectedGoal(null)
          }}
          onReactivate={() => {
            reactivateGoal(selectedGoal.id)
            setSelectedGoal(null)
          }}
        />
      )}
    </div>
  )
}
