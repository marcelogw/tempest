'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useSyncStore } from '@/lib/sync-store'
import { useExpenseStore } from '@/lib/expense-store'

type WorkspaceGateProps = {
  children: React.ReactNode
}

export function WorkspaceGate({ children }: WorkspaceGateProps) {
  // Zustand persist hydrates asynchronously — block routing decisions until hydration settles
  const [hasHydrated, setHasHydrated] = useState(false)
  const { workspaceId, workspaceGroup } = useSyncStore(
    useShallow((s) => ({ workspaceId: s.workspaceId, workspaceGroup: s.workspaceGroup }))
  )
  const loadWorkspace = useExpenseStore((s) => s.loadWorkspace)
  const router = useRouter()

  useEffect(() => {
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    if (!workspaceId || !workspaceGroup) {
      router.push('/onboarding')
    } else {
      void loadWorkspace(workspaceId, workspaceGroup)
    }
  }, [hasHydrated, workspaceId, workspaceGroup, router, loadWorkspace])

  if (!hasHydrated || !workspaceId || !workspaceGroup) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
