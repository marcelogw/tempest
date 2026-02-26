'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useSyncStore } from '@/lib/sync-store'
import { useExpenseStore } from '@/lib/expense-store'

type WorkspaceGateProps = {
  children: React.ReactNode
}

export function WorkspaceGate({ children }: WorkspaceGateProps) {
  const { workspaceId, workspaceGroup } = useSyncStore()
  const { isLoading, loadWorkspace } = useExpenseStore()
  const router = useRouter()

  useEffect(() => {
    if (!workspaceId || !workspaceGroup) {
      router.push('/onboarding')
    } else {
      void loadWorkspace(workspaceId, workspaceGroup)
    }
  }, [workspaceId, workspaceGroup, router, loadWorkspace])

  if (!workspaceId || !workspaceGroup || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
