'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, Home, Key, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TempestLogo } from '@/components/brand/tempest-logo'
import { useSyncStore } from '@/lib/sync-store'
import { useExpenseStore } from '@/lib/expense-store'
import { createWorkspace, acceptInvite } from '@/lib/lambda-client'

type View = 'choice' | 'create' | 'join'

type WorkspaceFormProps = {
  title: string
  fieldLabel: string
  fieldPlaceholder: string
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  submitLabel: string
  error: string
  isLoading: boolean
  loadingLabel: string
  backLabel: string
  onBack: () => void
}

function WorkspaceForm({
  title,
  fieldLabel,
  fieldPlaceholder,
  value,
  onChange,
  onSubmit,
  submitLabel,
  error,
  isLoading,
  loadingLabel,
  backLabel,
  onBack,
}: WorkspaceFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            void onSubmit(e)
          }}
          className="space-y-4"
        >
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="workspace-field">{fieldLabel}</Label>
            <Input
              id="workspace-field"
              placeholder={fieldPlaceholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingLabel}
              </>
            ) : (
              submitLabel
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={isLoading}
          >
            {backLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function OnboardingPage() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const { setWorkspace } = useSyncStore()
  const { loadWorkspace } = useExpenseStore()

  const [view, setView] = useState<View>('choice')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  function goBack() {
    setView('choice')
    setError('')
  }

  async function handleWorkspaceAction(
    e: React.FormEvent,
    resolve: () => Promise<{ workspaceId: string; workspaceGroup: string }>
  ) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { workspaceId, workspaceGroup } = await resolve()
      setWorkspace(workspaceId, workspaceGroup)
      await loadWorkspace(workspaceId, workspaceGroup)
      router.push('/')
    } catch {
      setError(t('errorGeneric'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    await handleWorkspaceAction(e, () => createWorkspace(workspaceName))
  }

  async function handleJoin(e: React.FormEvent) {
    await handleWorkspaceAction(e, () => acceptInvite(inviteCode))
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <TempestLogo variant="icon" size="md" animated />
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('title')}
            </h1>
            <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
          </div>
        </div>

        {view === 'choice' && (
          <div className="grid gap-4">
            <Card
              className="hover:bg-accent cursor-pointer transition-colors"
              onClick={() => setView('create')}
            >
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <Home className="text-primary h-8 w-8 flex-shrink-0" />
                <div>
                  <CardTitle className="text-base">{t('createOption')}</CardTitle>
                  <CardDescription>{t('createDescription')}</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card
              className="hover:bg-accent cursor-pointer transition-colors"
              onClick={() => setView('join')}
            >
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <Key className="text-primary h-8 w-8 flex-shrink-0" />
                <div>
                  <CardTitle className="text-base">{t('joinOption')}</CardTitle>
                  <CardDescription>{t('joinDescription')}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {view === 'create' && (
          <WorkspaceForm
            title={t('createOption')}
            fieldLabel={t('workspaceNameLabel')}
            fieldPlaceholder={t('workspaceNamePlaceholder')}
            value={workspaceName}
            onChange={setWorkspaceName}
            onSubmit={handleCreate}
            submitLabel={t('createButton')}
            error={error}
            isLoading={isLoading}
            loadingLabel={t('loading')}
            backLabel={t('back')}
            onBack={goBack}
          />
        )}

        {view === 'join' && (
          <WorkspaceForm
            title={t('joinOption')}
            fieldLabel={t('inviteCodeLabel')}
            fieldPlaceholder={t('inviteCodePlaceholder')}
            value={inviteCode}
            onChange={setInviteCode}
            onSubmit={handleJoin}
            submitLabel={t('joinButton')}
            error={error}
            isLoading={isLoading}
            loadingLabel={t('loading')}
            backLabel={t('back')}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  )
}
