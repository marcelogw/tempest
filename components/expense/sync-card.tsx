'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSyncStore } from '@/lib/sync-store'
import { useExpenseStore } from '@/lib/expense-store'
import { getPendingCount } from '@/lib/write-queue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cloud, CloudOff, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SyncCardProps {
  onConnect: () => void
}

export function SyncCard({ onConnect }: SyncCardProps) {
  const i = useTranslations()
  const locale = useLocale()
  const { status, userEmail, lastSyncedAt } = useSyncStore()
  const checkAndSync = useExpenseStore((s) => s.checkAndSync)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    setPendingCount(getPendingCount())
  }, [status])

  async function handleSyncNow() {
    setIsSyncing(true)
    try {
      await checkAndSync()
      setPendingCount(getPendingCount())
    } finally {
      setIsSyncing(false)
    }
  }

  const statusConfig = {
    disconnected: {
      icon: CloudOff,
      label: i('ui.sync.disconnected'),
      variant: 'secondary' as const,
      color: 'text-muted-foreground',
    },
    connected: {
      icon: Cloud,
      label: i('ui.sync.connected'),
      variant: 'default' as const,
      color: 'text-green-500',
    },
    syncing: {
      icon: Loader2,
      label: i('ui.sync.syncing'),
      variant: 'secondary' as const,
      color: 'text-yellow-500',
    },
    error: {
      icon: AlertCircle,
      label: i('ui.sync.errorSync'),
      variant: 'destructive' as const,
      color: 'text-red-500',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon
  const isSpinning = status === 'syncing' || isSyncing

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${config.color} ${isSpinning ? 'animate-spin' : ''}`} />
          <div>
            <h3 className="text-base font-medium">{i('ui.sync.cloudSync')}</h3>
            <p className="text-muted-foreground text-sm">
              {status === 'disconnected' && i('ui.sync.disconnectedDesc')}
              {status === 'connected' &&
                userEmail &&
                i('ui.sync.connectedAs', { email: userEmail })}
              {status === 'syncing' && i('ui.sync.syncingData')}
              {status === 'error' && i('ui.sync.errorSync')}
            </p>
          </div>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      {/* Last sync time + pending writes */}
      {status === 'connected' && (
        <div className="text-muted-foreground mb-4 space-y-1 text-xs">
          {lastSyncedAt && (
            <p>
              {i('ui.sync.lastSync', {
                date: new Date(lastSyncedAt).toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US'),
              })}
            </p>
          )}
          {pendingCount > 0 && (
            <p className="text-yellow-600 dark:text-yellow-400">
              {pendingCount} {pendingCount === 1 ? 'escrita pendente' : 'escritas pendentes'}
            </p>
          )}
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
          <Button
            onClick={() => void handleSyncNow()}
            variant="outline"
            className="w-full"
            size="sm"
            disabled={isSyncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {i('ui.sync.syncNow')}
          </Button>
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

      {status === 'disconnected' && (
        <p className="text-muted-foreground mt-4 text-xs">{i('ui.sync.localDataInfo')}</p>
      )}
    </div>
  )
}
