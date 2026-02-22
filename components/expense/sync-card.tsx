'use client'

import { useTranslations } from 'next-intl'
import { useSyncStore } from '@/lib/sync-store'
import type { SyncScenario } from '@/lib/sync-manager'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cloud, CloudOff, Loader2, AlertCircle, Download, Upload } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SyncCardProps {
  onConnect: () => void
  onDisconnect: () => void
  /** Set to 'both' to show the conflict resolution dialog */
  pendingScenario?: SyncScenario | null
  /** Called when the user picks a side to resolve the conflict */
  onResolveConflict?: (strategy: 'use-cloud' | 'use-local') => void
}

/**
 * SyncCard - Visual card in Settings for connecting/disconnecting cloud sync
 *
 * States:
 * - disconnected: Gray badge, "Conectar Conta" button
 * - connected:    Green badge, email visible, "Desconectar" button
 * - syncing:      Yellow badge with spinner (upload or download in progress)
 * - error:        Red badge with error message
 *
 * Conflict dialog appears when pendingScenario === 'both' and lets the user
 * choose whether to keep local or cloud data (last-write-wins).
 */
export function SyncCard({
  onConnect,
  onDisconnect,
  pendingScenario,
  onResolveConflict,
}: SyncCardProps) {
  const i = useTranslations()
  const { status, userEmail, lastSyncTime, errorMessage } = useSyncStore()

  // Status badge configuration
  const statusConfig = {
    disconnected: {
      icon: CloudOff,
      label: i('ui.sync.disconnected'),
      variant: 'secondary' as const,
      color: 'text-muted-foreground',
      spin: false,
    },
    connected: {
      icon: Cloud,
      label: i('ui.sync.connected'),
      variant: 'default' as const,
      color: 'text-green-500',
      spin: false,
    },
    syncing: {
      icon: Loader2,
      label: i('ui.sync.syncing'),
      variant: 'secondary' as const,
      color: 'text-yellow-500',
      spin: true,
    },
    error: {
      icon: AlertCircle,
      label: i('ui.sync.errorSync'),
      variant: 'destructive' as const,
      color: 'text-red-500',
      spin: false,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const conflictOpen = pendingScenario === 'both'

  return (
    <>
      <div className="rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${config.color} ${config.spin ? 'animate-spin' : ''}`} />
            <div>
              <h3 className="text-base font-medium">{i('ui.sync.cloudSync')}</h3>
              <p className="text-muted-foreground text-sm">
                {status === 'disconnected' && i('ui.sync.disconnectedDesc')}
                {status === 'connected' &&
                  userEmail &&
                  i('ui.sync.connectedAs', { email: userEmail })}
                {status === 'syncing' &&
                  (conflictOpen ? i('ui.sync.conflictPending') : i('ui.sync.syncingData'))}
                {status === 'error' && errorMessage}
              </p>
            </div>
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>

        {/* Connected state: Show last sync time */}
        {status === 'connected' && lastSyncTime && (
          <div className="text-muted-foreground mb-4 text-xs">
            {i('ui.sync.lastSync', { date: new Date(lastSyncTime).toLocaleString('pt-BR') })}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {status === 'disconnected' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onConnect} className="w-full" size="sm">
                    <Cloud className="mr-2 h-4 w-4" />
                    {i('ui.sync.connectAccount')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{i('ui.sync.loginTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {status === 'connected' && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={onDisconnect} variant="outline" className="w-full" size="sm">
                      <CloudOff className="mr-2 h-4 w-4" />
                      {i('ui.sync.disconnect')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{i('ui.sync.disconnectTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {status === 'error' && (
            <Button onClick={onConnect} variant="destructive" className="w-full" size="sm">
              <AlertCircle className="mr-2 h-4 w-4" />
              {i('ui.sync.tryAgain')}
            </Button>
          )}

          {status === 'syncing' && (
            <Button disabled className="w-full" size="sm">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {i('ui.sync.syncing')}
            </Button>
          )}
        </div>

        {/* Info message */}
        {status === 'disconnected' && (
          <p className="text-muted-foreground mt-4 text-xs">{i('ui.sync.localDataInfo')}</p>
        )}
      </div>

      {/* Conflict resolution dialog */}
      <AlertDialog open={conflictOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{i('ui.sync.conflictTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{i('ui.sync.conflictDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => onResolveConflict?.('use-local')}
            >
              <Upload className="h-4 w-4 shrink-0" />
              <div className="text-left">
                <div className="font-medium">{i('ui.sync.useLocal')}</div>
                <div className="text-muted-foreground text-xs font-normal">
                  {i('ui.sync.useLocalDesc')}
                </div>
              </div>
            </Button>
            <Button
              className="w-full justify-start gap-2"
              onClick={() => onResolveConflict?.('use-cloud')}
            >
              <Download className="h-4 w-4 shrink-0" />
              <div className="text-left">
                <div className="font-medium">{i('ui.sync.useCloud')}</div>
                <div className="text-muted-foreground text-xs font-normal">
                  {i('ui.sync.useCloudDesc')}
                </div>
              </div>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
