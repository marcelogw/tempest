'use client'

import { useSyncStore } from '@/lib/sync-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cloud, CloudOff, Loader2, AlertCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SyncCardProps {
  onConnect: () => void
  onDisconnect: () => void
}

/**
 * SyncCard - Visual card in Settings for connecting/disconnecting cloud sync
 *
 * States:
 * - disconnected: Gray badge, "Conectar Conta" button
 * - connected: Green badge, email visible, "Desconectar" button
 * - syncing: Yellow badge with spinner
 * - error: Red badge with error message
 */
export function SyncCard({ onConnect, onDisconnect }: SyncCardProps) {
  const { status, userEmail, lastSyncTime, errorMessage } = useSyncStore()

  // Status badge configuration
  const statusConfig = {
    disconnected: {
      icon: CloudOff,
      label: 'Desconectado',
      variant: 'secondary' as const,
      color: 'text-muted-foreground',
      spin: false,
    },
    connected: {
      icon: Cloud,
      label: 'Conectado',
      variant: 'default' as const,
      color: 'text-green-500',
      spin: false,
    },
    syncing: {
      icon: Loader2,
      label: 'Sincronizando...',
      variant: 'secondary' as const,
      color: 'text-yellow-500',
      spin: true,
    },
    error: {
      icon: AlertCircle,
      label: 'Erro na Sincronização',
      variant: 'destructive' as const,
      color: 'text-red-500',
      spin: false,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${config.color} ${config.spin ? 'animate-spin' : ''}`} />
          <div>
            <h3 className="text-base font-medium">Sincronização na Nuvem</h3>
            <p className="text-muted-foreground text-sm">
              {status === 'disconnected' && 'Faça backup dos seus dados e acesse de qualquer lugar'}
              {status === 'connected' && userEmail && `Conectado como ${userEmail}`}
              {status === 'syncing' && 'Enviando dados para a nuvem...'}
              {status === 'error' && errorMessage}
            </p>
          </div>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      {/* Connected state: Show last sync time */}
      {status === 'connected' && lastSyncTime && (
        <div className="text-muted-foreground mb-4 text-xs">
          Última sincronização: {new Date(lastSyncTime).toLocaleString('pt-BR')}
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
                  Conectar Conta
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Faça login com Google ou Email para sincronizar seus dados</p>
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
                    Desconectar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Seus dados locais serão mantidos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}

        {status === 'error' && (
          <Button onClick={onConnect} variant="destructive" className="w-full" size="sm">
            <AlertCircle className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        )}

        {status === 'syncing' && (
          <Button disabled className="w-full" size="sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sincronizando...
          </Button>
        )}
      </div>

      {/* Info message */}
      {status === 'disconnected' && (
        <p className="text-muted-foreground mt-4 text-xs">
          💡 Seus dados são salvos localmente no navegador. Conecte uma conta para fazer backup e
          acessar de outros dispositivos.
        </p>
      )}
    </div>
  )
}
