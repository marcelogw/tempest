'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Shapes,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Settings,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { YearSelector } from './year-selector'
import { ThemeToggle } from '@/components/theme-toggle'
import { TempestIconMark } from '@/components/brand/tempest-logo'

interface SidebarProps {
  activeView: 'dashboard' | 'monthly' | 'categories' | 'cards' | 'goals' | 'settings'
  onViewChange: (
    view: 'dashboard' | 'monthly' | 'categories' | 'cards' | 'goals' | 'settings'
  ) => void
  currentYear: string
  availableYears: string[]
  onYearChange: (year: string) => void
}

export function Sidebar({
  activeView,
  onViewChange,
  currentYear,
  availableYears,
  onYearChange,
}: SidebarProps) {
  const i = useTranslations()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    {
      id: 'dashboard' as const,
      label: i('ui.sidebar.dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'monthly' as const,
      label: i('ui.sidebar.monthlyView'),
      icon: Calendar,
    },
    {
      id: 'categories' as const,
      label: i('ui.sidebar.categories'),
      icon: Shapes,
    },
    {
      id: 'cards' as const,
      label: i('ui.sidebar.cards'),
      icon: CreditCard,
    },
    {
      id: 'goals' as const,
      label: i('ui.sidebar.goals'),
      icon: Target,
    },
  ]

  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground border-sidebar-border flex flex-col border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="border-sidebar-border flex items-center justify-between border-b p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <TempestIconMark size={32} />
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              Tempest
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Seção de Ano */}
      {!collapsed && (
        <div className="border-sidebar-border border-b p-4">
          <p className="text-sidebar-foreground/60 px-1 py-2 text-xs font-medium tracking-wider uppercase">
            {i('ui.sidebar.period')}
          </p>
          <YearSelector
            currentYear={currentYear}
            availableYears={availableYears}
            onYearChange={onYearChange}
          />
        </div>
      )}

      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-sidebar-foreground/60 px-3 py-2 text-xs font-medium tracking-wider uppercase">
              {i('ui.sidebar.navigation')}
            </p>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                activeView === item.id
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Configurações (bottom) */}
      <div className="border-sidebar-border space-y-1 border-t p-2">
        {!collapsed ? (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sidebar-foreground/80 text-sm font-medium">
              {i('ui.sidebar.theme')}
            </span>
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <ThemeToggle />
          </div>
        )}
        <button
          onClick={() => onViewChange('settings')}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            activeView === 'settings'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>{i('ui.sidebar.settings')}</span>}
        </button>
      </div>
    </aside>
  )
}
