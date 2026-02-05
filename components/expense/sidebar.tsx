'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Shapes,
  TrendingUp,
  PiggyBank,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { YearSelector } from './year-selector'

interface SidebarProps {
  activeView: 'dashboard' | 'monthly' | 'categories' | 'cards' | 'settings'
  onViewChange: (view: 'dashboard' | 'monthly' | 'categories' | 'cards' | 'settings') => void
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
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Painel',
      icon: LayoutDashboard,
    },
    {
      id: 'monthly' as const,
      label: 'Visao Mensal',
      icon: Calendar,
    },
    {
      id: 'categories' as const,
      label: 'Categorias',
      icon: Shapes,
    },
    {
      id: 'cards' as const,
      label: 'Cartões',
      icon: CreditCard,
    },
  ]

  const infoItems = [
    { label: 'Investimentos', icon: TrendingUp },
    { label: 'Poupanca', icon: PiggyBank },
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
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="text-primary-foreground text-sm font-bold">T</span>
            </div>
            <span className="text-lg font-semibold">Tempest</span>
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
            Período
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
              Navegacao
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

        <div className="mt-6 space-y-1">
          {!collapsed && (
            <p className="text-sidebar-foreground/60 px-3 py-2 text-xs font-medium tracking-wider uppercase">
              Acesso Rapido
            </p>
          )}
          {infoItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Configurações (bottom) */}
      <div className="border-sidebar-border border-t p-2">
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
          {!collapsed && <span>Configurações</span>}
        </button>
      </div>
    </aside>
  )
}
