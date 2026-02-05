'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/expense/sidebar'
import { DashboardView } from '@/components/expense/dashboard-view'
import { MonthlyView } from '@/components/expense/monthly-view'
import { CategoriesView } from '@/components/expense/categories-view'
import { CreditCardsView } from '@/components/expense/credit-cards-view'
import { useExpenseStore } from '@/lib/expense-store'

export default function ExpenseManagementApp() {
  const [activeView, setActiveView] = useState<'dashboard' | 'monthly' | 'categories' | 'cards'>(
    'dashboard'
  )
  const { currentYear, setCurrentYear, getAvailableYears } = useExpenseStore()
  const availableYears = getAvailableYears()

  return (
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
    </div>
  )
}
