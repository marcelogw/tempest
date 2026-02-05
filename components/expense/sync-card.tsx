'use client'

import { useSyncStore } from '@/lib/sync-store'
import { Button } from '@/components/ui/button'
import { Cloud, CloudOff, Loader2, AlertCircle } from 'lucide-react'

interface SyncCardProps {
  onConnect: () => void
  onDisconnect: () => void
}

export function SyncCard({ onConnect, onDisconnect }: SyncCardProps) {
  const { status, userEmail, lastSyncTime, errorMessage } = useSyncStore()

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 text-base font-medium">Sincronizacao com a Nuvem</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Sincronize seus dados com a nuvem para acessar de qualquer dispositivo
          </p>

          {/* Status indicator */}
          <div className="flex items-center gap-2 text-sm">
            {status === 'disconnected' && (
              <>
                <CloudOff className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Desconectado</span>
              </>
            )}
            {status === 'connected' && (
              <>
                <Cloud className="h-4 w-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">
                  Conectado{userEmail ? ` - ${userEmail}` : ''}
                </span>
              </>
            )}
            {status === 'syncing' && (
              <>
                <Loader2 className="text-primary h-4 w-4 animate-spin" />
                <span className="text-primary">Sincronizando...</span>
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600 dark:text-red-400">
                  {errorMessage || 'Erro na sincronizacao'}
                </span>
              </>
            )}
          </div>

          {/* Last sync time */}
          {lastSyncTime && status === 'connected' && (
            <p className="text-muted-foreground mt-1 text-xs">
              Ultima sincronizacao:{' '}
              {new Date(lastSyncTime).toLocaleString('pt-BR')}
            </p>
          )}
        </div>

        <div>
          {status === 'disconnected' || status === 'error' ? (
            <Button onClick={onConnect} size="sm">
              Conectar
            </Button>
          ) : status === 'connected' ? (
            <Button onClick={onDisconnect} variant="outline" size="sm">
              Desconectar
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
