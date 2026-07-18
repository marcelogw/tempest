'use client'

import { useTranslations } from 'next-intl'
import { LayoutDashboard, Calendar, Shapes, CreditCard, Settings, Target } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { YearSelector } from './year-selector'
import { ThemeToggle } from '@/components/theme-toggle'
import { TempestIconMark } from '@/components/brand/tempest-logo'

export type ActiveView = 'dashboard' | 'monthly' | 'categories' | 'cards' | 'goals' | 'settings'

interface AppSidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  currentYear: string
  availableYears: string[]
  onYearChange: (year: string) => void
}

export function AppSidebar({
  activeView,
  onViewChange,
  currentYear,
  availableYears,
  onYearChange,
}: AppSidebarProps) {
  const i = useTranslations()

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
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center">
          <TempestIconMark size={28} />
          <span
            className="text-lg font-bold group-data-[collapsible=icon]:hidden"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Tempest
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>{i('ui.sidebar.period')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <YearSelector
              currentYear={currentYear}
              availableYears={availableYears}
              onYearChange={onYearChange}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        <SidebarGroup>
          <SidebarGroupLabel>{i('ui.sidebar.navigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    tooltip={item.label}
                    onClick={() => onViewChange(item.id)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:justify-center">
          <span className="text-sidebar-foreground/80 text-sm font-medium group-data-[collapsible=icon]:hidden">
            {i('ui.sidebar.theme')}
          </span>
          <ThemeToggle />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeView === 'settings'}
              tooltip={i('ui.sidebar.settings')}
              onClick={() => onViewChange('settings')}
            >
              <Settings />
              <span>{i('ui.sidebar.settings')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
