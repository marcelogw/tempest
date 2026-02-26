'use client'

import { Suspense } from 'react'
import { Sidebar } from '@/components/expense/sidebar'
import { SettingsView } from '@/components/expense/settings-view'
import { useExpenseStore } from '@/lib/expense-store'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { WorkspaceGate } from '@/components/workspace/workspace-gate'

export default function SettingsPage() {
  const router = useRouter()
  const { currentYear, setCurrentYear, getAvailableYears } = useExpenseStore()
  const availableYears = getAvailableYears()

  return (
    <WorkspaceGate>
      <div className="bg-background flex h-screen">
        <Sidebar
          activeView="settings"
          onViewChange={(_view) => {
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
    </WorkspaceGate>
  )
}
