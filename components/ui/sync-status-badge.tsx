'use client'

import { useSyncStore } from '@/lib/sync-store'
import { Badge } from '@/components/ui/badge'
import { Cloud, Database, Loader2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * SyncStatusBadge - Fixed footer badge showing sync status
 * 
 * Variants:
 * - local: "💾 localStorage" (gray) - disconnected
 * - cloud: "☁️ AWS Cloud (email)" (green) - connected
 * - syncing: "🔄 Sincronizando..." (yellow) - syncing
 */
export function SyncStatusBadge() {
  const { status, userEmail } = useSyncStore()

  // Don't show during error state (handled in SyncCard)
  if (status === 'error') {
    return null
  }

  const variants = {
    disconnected: {
      icon: Database,
      label: 'localStorage',
      tooltip: 'Dados salvos localmente no navegador',
      variant: 'secondary' as const,
      color: 'text-muted-foreground',
      spin: false,
    },
    connected: {
      icon: Cloud,
      label: userEmail ? `Cloud (${userEmail.split('@')[0]})` : 'Cloud',
      tooltip: `Conectado como ${userEmail}`,
      variant: 'default' as const,
      color: 'text-green-500',
      spin: false,
    },
    syncing: {
      icon: Loader2,
      label: 'Sincronizando...',
      tooltip: 'Enviando dados para a nuvem',
      variant: 'secondary' as const,
      color: 'text-yellow-500',
      spin: true,
    },
  }

  const config = variants[status]
  const Icon = config.icon

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={config.variant} className="cursor-help px-3 py-1.5">
              <Icon
                className={`mr-2 h-3.5 w-3.5 ${config.color} ${config.spin ? 'animate-spin' : ''}`}
              />
              <span className="text-xs">{config.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}