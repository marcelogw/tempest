'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { YearSelector } from './year-selector'

interface SidebarProps {
  activeView: 'dashboard' | 'monthly'
  onViewChange: (view: 'dashboard' | 'monthly') => void
  currentYear: string
  availableYears: string[]
  onYearChange: (year: string) => void
}

export function Sidebar({ activeView, onViewChange, currentYear, availableYears, onYearChange }: SidebarProps) {
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
  ]

  const infoItems = [
    { label: 'Investimentos', icon: TrendingUp },
    { label: 'Poupanca', icon: PiggyBank },
    { label: 'Cartoes', icon: CreditCard },
  ]

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">GF</span>
            </div>
            <span className="font-semibold text-lg">GestaoFinanceira</span>
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
        <div className="p-4 border-b border-sidebar-border">
          <p className="px-1 py-2 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
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
            <p className="px-3 py-2 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
              Navegacao
            </p>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
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
            <p className="px-3 py-2 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
              Acesso Rapido
            </p>
          )}
          {infoItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Configuracoes</span>}
        </button>
      </div>
    </aside>
  )
}
