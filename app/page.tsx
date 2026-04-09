'use client'

import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Sidebar } from '@/components/expense/sidebar'
import { DashboardView } from '@/components/expense/dashboard-view'
import { MonthlyView } from '@/components/expense/monthly-view'
import { CategoriesView } from '@/components/expense/categories-view'
import { CreditCardsView } from '@/components/expense/credit-cards-view'
import { SettingsView } from '@/components/expense/settings-view'
import { GoalsView } from '@/components/expense/goals-view'
import { useExpenseStore } from '@/lib/expense-store'
import { WorkspaceGate } from '@/components/workspace/workspace-gate'

export default function ExpenseManagementApp() {
  const [activeView, setActiveView] = useState<
    'dashboard' | 'monthly' | 'categories' | 'cards' | 'goals' | 'settings'
  >('dashboard')
  const { currentYear, setCurrentYear } = useExpenseStore(
    useShallow((s) => ({ currentYear: s.currentYear, setCurrentYear: s.setCurrentYear }))
  )
  const getAvailableYears = useExpenseStore((s) => s.getAvailableYears)
  const availableYears = getAvailableYears()

  return (
    <WorkspaceGate>
      <div className="bg-background flex h-screen">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          currentYear={currentYear}
          availableYears={availableYears}
          onYearChange={setCurrentYear}
        />
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'monthly' && <MonthlyView />}
        {activeView === 'categories' && <CategoriesView />}
        {activeView === 'cards' && <CreditCardsView />}
        {activeView === 'goals' && <GoalsView />}
        {activeView === 'settings' && <SettingsView />}
      </div>
    </WorkspaceGate>
  )
}
