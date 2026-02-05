'use client'

import { Suspense } from 'react'
import { Sidebar } from '@/components/expense/sidebar'
import { SettingsView } from '@/components/expense/settings-view'
import { useExpenseStore } from '@/lib/expense-store'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * Settings Page
 * Dedicated route for settings accessed via OAuth callback
 */
export default function SettingsPage() {
  const router = useRouter()
  const { currentYear, setCurrentYear, getAvailableYears } = useExpenseStore()
  const availableYears = getAvailableYears()

  return (
    <div className="bg-background flex h-screen">
      <Sidebar
        activeView="settings"
        onViewChange={(_view) => {
          // Navigate back to home when changing views
          router.push('/')
        }}
        currentYear={currentYear}
        availableYears={availableYears}
        onYearChange={setCurrentYear}
      />
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        }
      >
        <SettingsView />
      </Suspense>
    </div>
  )
}
