'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useExpenseStore } from '@/lib/expense-store'
import { useSyncStore } from '@/lib/sync-store'
import { useAmplify } from '@/components/amplify-provider'
import { Button } from '@/components/ui/button'
import { SyncCard } from './sync-card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { AlertTriangle, Globe, Users } from 'lucide-react'
import { setLocaleCookie } from '@/lib/locale-cookie'
import { fetchAuthSession } from 'aws-amplify/auth'
import { InviteDialog } from '@/components/workspace/invite-dialog'
import { MembersList } from '@/components/workspace/members-list'

export function SettingsView() {
  const i = useTranslations()
  const currentLocale = useLocale()
  const { isConfigured } = useAmplify()
  const { deleteYearData, deleteAllData, getAvailableYears } = useExpenseStore()
  const { toast } = useToast()
  const { setStatus, setUserEmail } = useSyncStore()
  const router = useRouter()

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [deleteYearDialogOpen, setDeleteYearDialogOpen] = useState(false)
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [confirmationText, setConfirmationText] = useState('')

  const availableYears = getAvailableYears()

  function handleLanguageChange(newLocale: string) {
    setLocaleCookie(newLocale as 'en' | 'pt')
    localStorage.setItem('locale', newLocale)
    window.location.reload()
  }

  // Populate sync store with authenticated user info on mount
  useEffect(() => {
    if (isConfigured) {
      void checkAuthStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured])

  async function checkAuthStatus() {
    if (!isConfigured) return

    try {
      const session = await fetchAuthSession()
      if (session.tokens?.idToken) {
        const email = session.tokens.idToken.payload.email as string
        setStatus('connected')
        setUserEmail(email)
      }
    } catch (_error) {
      // Not authenticated, stay disconnected
    }
  }

  function handleConnect() {
    router.push('/onboarding')
  }

  const handleDeleteYear = () => {
    if (!selectedYear) return

    deleteYearData(selectedYear)
    setDeleteYearDialogOpen(false)
    setSelectedYear('')

    toast({
      title: i('ui.settings.dataDeleted'),
      description: i('ui.settings.allYearDataDeleted', { year: selectedYear }),
    })
  }

  const handleDeleteAll = () => {
    if (confirmationText !== 'DELETAR TUDO') return

    deleteAllData()
    setDeleteAllDialogOpen(false)
    setConfirmationText('')

    toast({
      title: i('ui.settings.dataDeleted'),
      description: i('ui.settings.appReset'),
    })
  }

  return (
    <>
      <div className="bg-background flex flex-1 flex-col overflow-hidden">
        {/* Header Section (sticky) */}
        <div className="border-b p-6">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold tracking-tight">{i('ui.settings.title')}</h1>
            <p className="text-muted-foreground mt-1">{i('ui.settings.managingDataPreferences')}</p>
          </div>
        </div>

        {/* Content Section (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Seção: Preferências */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-6 text-xl font-semibold">{i('ui.settings.preferences')}</h2>

              <div className="space-y-4">
                {/* Card: Idioma */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Globe className="text-muted-foreground mt-1 h-5 w-5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="mb-2 text-base font-medium">{i('ui.language.label')}</h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {i('ui.settings.languageDescription')}
                      </p>
                      <Select value={currentLocale} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt">🇧🇷 {i('ui.language.pt')}</SelectItem>
                          <SelectItem value="en">🇺🇸 {i('ui.language.en')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Minha Casa */}
            {isConfigured && (
              <div className="bg-card rounded-lg border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="text-primary h-5 w-5" />
                    <h2 className="text-xl font-semibold">{i('ui.workspace.title')}</h2>
                  </div>
                  <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
                    {i('ui.workspace.generateInvite')}
                  </Button>
                </div>
                <MembersList />
              </div>
            )}

            {/* Seção: Gerenciamento de Dados */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-6 text-xl font-semibold">{i('ui.settings.dataManagementTitle')}</h2>

              <div className="space-y-4">
                {/* Sync Card */}
                <SyncCard onConnect={handleConnect} />

                {/* Card: Deletar Ano Específico */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 text-base font-medium">{i('ui.settings.deleteYearData')}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {i('ui.settings.deleteYearDesc')}
                  </p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-muted-foreground mb-2 block text-sm">
                        {i('ui.settings.selectYear')}
                      </label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger>
                          <SelectValue placeholder={i('ui.settings.chooseYear')} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteYearDialogOpen(true)}
                      disabled={!selectedYear}
                    >
                      {i('ui.settings.deleteYear')}
                    </Button>
                  </div>
                </div>

                {/* Card: Deletar Todos os Dados */}
                <div className="border-destructive/50 rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-destructive mb-2 text-base font-medium">
                        {i('ui.settings.dangerZone')}
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {i('ui.settings.deleteAllDesc')}
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteAllDialogOpen(true)}
                        className="w-full sm:w-auto"
                      >
                        {i('ui.settings.deleteAllTitle')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InviteDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />

      {/* Diálogo de Confirmação - Deletar Ano */}
      <AlertDialog open={deleteYearDialogOpen} onOpenChange={setDeleteYearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {i('ui.settings.confirmDeleteYear', { year: selectedYear })}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>{i('ui.settings.confirmDeleteYear', { year: selectedYear })}</p>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-medium">{i('ui.settings.willBeDeleted')}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• {i('ui.settings.allIncomeFrom', { year: selectedYear })}</li>
                    <li>• {i('ui.settings.allExpenses')}</li>
                    <li>• {i('ui.settings.allInstallments')}</li>
                  </ul>
                </div>
                <p className="text-destructive font-medium">{i('ui.settings.cannotBeUndone')}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteYear}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {i('ui.settings.deleteYear')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Confirmação - Deletar Todos os Dados */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {i('ui.settings.deleteAllWarning')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>{i('ui.settings.irreversible')}</p>
                <div className="bg-destructive/10 border-destructive/50 rounded-lg border p-3">
                  <p className="text-sm font-medium">{i('ui.settings.permanentlyDeleted')}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• {i('ui.settings.allMonthsData')}</li>
                    <li>• {i('ui.settings.allInstallmentsData')}</li>
                    <li>• {i('ui.settings.allCategories')}</li>
                    <li>• {i('ui.settings.allCreditCards')}</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{i('ui.settings.typeDeleteAll')}</p>
                  <Input
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={i('ui.settings.typeDeleteAllPlaceholder')}
                    className="font-mono"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmationText('')}>
              {i('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={confirmationText !== 'DELETAR TUDO'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {i('ui.settings.deleteAllButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
