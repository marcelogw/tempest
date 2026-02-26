'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/expense/sidebar'
import { DashboardView } from '@/components/expense/dashboard-view'
import { MonthlyView } from '@/components/expense/monthly-view'
import { CategoriesView } from '@/components/expense/categories-view'
import { CreditCardsView } from '@/components/expense/credit-cards-view'
import { SettingsView } from '@/components/expense/settings-view'
import { useExpenseStore } from '@/lib/expense-store'
import { WorkspaceGate } from '@/components/workspace/workspace-gate'

export default function ExpenseManagementApp() {
  const [activeView, setActiveView] = useState<
    'dashboard' | 'monthly' | 'categories' | 'cards' | 'settings'
  >('dashboard')
  const { currentYear, setCurrentYear, getAvailableYears } = useExpenseStore()
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
        {activeView === 'settings' && <SettingsView />}
      </div>
    </WorkspaceGate>
  )
}
