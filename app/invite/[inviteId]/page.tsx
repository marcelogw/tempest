'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TempestLogo } from '@/components/brand/tempest-logo'
import { useSyncStore } from '@/lib/sync-store'
import { useExpenseStore } from '@/lib/expense-store'
import { acceptInvite } from '@/lib/lambda-client'

export default function InvitePage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams<{ inviteId: string }>()
  const { setWorkspace } = useSyncStore()
  const { loadWorkspace } = useExpenseStore()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAccept() {
    setError('')
    setIsLoading(true)

    try {
      const { workspaceId, workspaceGroup } = await acceptInvite(params.inviteId)
      setWorkspace(workspaceId, workspaceGroup)
      await loadWorkspace(workspaceId, workspaceGroup)
      router.push('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('expired') || message.includes('used')) {
        setError(t('invite.errorExpired'))
      } else {
        setError(t('invite.errorGeneric'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-3 text-center">
          <TempestLogo variant="icon" size="md" animated />
          <div>
            <CardTitle>{t('invite.title')}</CardTitle>
            <CardDescription>{t('common.appName')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button className="w-full" onClick={() => void handleAccept()} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('invite.loading')}
              </>
            ) : (
              t('invite.accept')
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
