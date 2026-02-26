'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSyncStore } from '@/lib/sync-store'
import { generateInviteCode } from '@/lib/lambda-client'

type InviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type State = 'loading' | 'ready' | 'error'

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const t = useTranslations('ui.workspace')
  const { workspaceId } = useSyncStore()

  const [state, setState] = useState<State>('loading')
  const [inviteUrl, setInviteUrl] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && workspaceId) {
      void generate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function generate() {
    setState('loading')
    setCopied(false)

    try {
      const result = await generateInviteCode(workspaceId!)
      const fullUrl = window.location.origin + result.inviteUrl
      setInviteUrl(fullUrl)
      setExpiresAt(
        new Date(result.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
      setState('ready')
    } catch {
      setState('error')
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('inviteDialogTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {state === 'loading' && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
            </div>
          )}

          {state === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t('generateError')}</AlertDescription>
            </Alert>
          )}

          {state === 'ready' && (
            <>
              <div>
                <p className="text-muted-foreground mb-2 text-sm">{t('inviteUrl')}</p>
                <div className="flex gap-2">
                  <Input value={inviteUrl} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => void handleCopy()}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">{t('expiresAt', { date: expiresAt })}</p>
            </>
          )}

          {state !== 'loading' && (
            <Button variant="outline" size="sm" className="w-full" onClick={() => void generate()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('regenerate')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
