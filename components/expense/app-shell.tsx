'use client'

import type { ReactNode } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar, type ActiveView } from './sidebar'
import { TempestIconMark } from '@/components/brand/tempest-logo'

interface AppShellProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  currentYear: string
  availableYears: string[]
  onYearChange: (year: string) => void
  children: ReactNode
}

export function AppShell({
  activeView,
  onViewChange,
  currentYear,
  availableYears,
  onYearChange,
  children,
}: AppShellProps) {
  return (
    <SidebarProvider className="h-screen">
      <AppSidebar
        activeView={activeView}
        onViewChange={onViewChange}
        currentYear={currentYear}
        availableYears={availableYears}
        onYearChange={onYearChange}
      />
      <SidebarInset>
        <header className="border-border bg-card flex h-14 flex-shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
          <TempestIconMark size={24} />
          <span className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Tempest
          </span>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
