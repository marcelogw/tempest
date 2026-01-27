'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/expense/sidebar'
import { DashboardView } from '@/components/expense/dashboard-view'
import { MonthlyView } from '@/components/expense/monthly-view'
import { useExpenseStore } from '@/lib/expense-store'

export default function ExpenseManagementApp() {
  const [activeView, setActiveView] = useState<'dashboard' | 'monthly'>('dashboard')
  const { currentYear, setCurrentYear, getAvailableYears } = useExpenseStore()
  const availableYears = getAvailableYears()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        currentYear={currentYear}
        availableYears={availableYears}
        onYearChange={setCurrentYear}
      />
      {activeView === 'dashboard' ? <DashboardView /> : <MonthlyView />}
    </div>
  )
}
