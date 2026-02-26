'use client'

import { useEffect } from 'react'
import { useExpenseStore } from '@/lib/expense-store'

export function useWorkspaceSync() {
  const checkAndSync = useExpenseStore((s) => s.checkAndSync)

  useEffect(() => {
    const handler = () => {
      void checkAndSync()
    }
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [checkAndSync])
}
