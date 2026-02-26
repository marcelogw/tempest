'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { fetchAuthSession } from 'aws-amplify/auth'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { useToast } from '@/hooks/use-toast'
import { useSyncStore } from '@/lib/sync-store'
import { getAmplifyClient } from '@/lib/workspace-client'
import { removeMember } from '@/lib/lambda-client'

type Member = {
  sub: string
  displayName: string
  email: string
  avatarColor: string
}

function Avatar({ displayName, avatarColor }: { displayName: string; avatarColor: string }) {
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ backgroundColor: avatarColor }}
    >
      {initials}
    </div>
  )
}

export function MembersList() {
  const t = useTranslations('ui.workspace')
  const tCommon = useTranslations('common')
  const { workspaceId, workspaceGroup } = useSyncStore()
  const { toast } = useToast()

  const [members, setMembers] = useState<Member[]>([])
  const [ownerSub, setOwnerSub] = useState<string | null>(null)
  const [currentUserSub, setCurrentUserSub] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    if (workspaceId && workspaceGroup) {
      void load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, workspaceGroup])

  async function load() {
    setIsLoading(true)

    try {
      const session = await fetchAuthSession()
      const sub = session.tokens?.idToken?.payload.sub
      setCurrentUserSub(sub ?? null)

      const client = getAmplifyClient()

      const [workspaceResult, profilesResult] = await Promise.all([
        client.models.Workspace.get({ id: workspaceId! }),
        client.models.UserProfile.list({
          filter: { workspaceGroup: { eq: workspaceGroup! } },
        }),
      ])

      setOwnerSub(workspaceResult.data?.ownerSub ?? null)
      setMembers(
        (profilesResult.data ?? []).map((p) => ({
          sub: p.cognitoSub,
          displayName: p.displayName,
          email: p.email,
          avatarColor: p.avatarColor,
        }))
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRemove() {
    if (!memberToRemove || !workspaceId) return
    setIsRemoving(true)

    try {
      await removeMember(workspaceId, memberToRemove.sub)
      setMembers((prev) => prev.filter((m) => m.sub !== memberToRemove.sub))
      toast({ description: t('removeSuccess') })
    } catch {
      toast({ variant: 'destructive', description: t('removeError') })
    } finally {
      setIsRemoving(false)
      setMemberToRemove(null)
    }
  }

  const isOwner = currentUserSub === ownerSub

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {members.map((member) => {
          const isMemberOwner = member.sub === ownerSub
          const canRemove = isOwner && !isMemberOwner

          return (
            <div key={member.sub} className="flex items-center gap-3">
              <Avatar displayName={member.displayName} avatarColor={member.avatarColor} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{member.displayName}</span>
                  <Badge variant={isMemberOwner ? 'default' : 'secondary'} className="text-xs">
                    {isMemberOwner ? t('owner') : t('guest')}
                  </Badge>
                </div>
                <p className="text-muted-foreground truncate text-xs">{member.email}</p>
              </div>
              {canRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive flex-shrink-0"
                  onClick={() => setMemberToRemove(member)}
                >
                  {t('remove')}
                </Button>
              )}
            </div>
          )
        })}

        {members.length < 2 && <p className="text-muted-foreground pt-1 text-sm">{t('noGuest')}</p>}
      </div>

      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRemoveTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmRemoveDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleRemove()}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
