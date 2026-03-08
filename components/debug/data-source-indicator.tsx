'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import { Badge } from '@/components/ui/badge'
import { Database, Cloud, AlertCircle } from 'lucide-react'
import { useAmplify } from '@/components/amplify-provider'

/**
 * DataSourceIndicator - Shows which data source is active
 *
 * Helps debug and understand whether data is coming from:
 * - localStorage (Zustand)
 * - AWS (Amplify)
 * - Both
 */
export function DataSourceIndicator() {
  const { isConfigured } = useAmplify()
  const [dataSource, setDataSource] = useState<'local' | 'aws' | 'both' | 'checking'>('checking')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function checkDataSource() {
      if (!isConfigured) {
        const localData = localStorage.getItem('expense-store')
        const hasLocalData =
          localData &&
          (JSON.parse(localData) as { state?: { monthlyData?: unknown } }).state?.monthlyData
        setDataSource(hasLocalData ? 'local' : 'checking')
        return
      }

      try {
        const user = await getCurrentUser()
        setUserEmail(user.signInDetails?.loginId || 'Unknown')

        const localData = localStorage.getItem('expense-store')
        const hasLocalData =
          localData &&
          (JSON.parse(localData) as { state?: { monthlyData?: unknown } }).state?.monthlyData

        setDataSource(hasLocalData ? 'both' : 'aws')
      } catch {
        const localData = localStorage.getItem('expense-store')
        const hasLocalData =
          localData &&
          (JSON.parse(localData) as { state?: { monthlyData?: unknown } }).state?.monthlyData

        setDataSource(hasLocalData ? 'local' : 'checking')
      }
    }

    void checkDataSource()
  }, [isConfigured])

  if (dataSource === 'checking') {
    return null
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {dataSource === 'local' && (
        <Badge
          variant="outline"
          className="gap-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
        >
          <Database className="h-3 w-3" />
          <span className="text-xs">localStorage (Zustand)</span>
        </Badge>
      )}

      {dataSource === 'aws' && (
        <Badge variant="outline" className="gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Cloud className="h-3 w-3" />
          <span className="text-xs">AWS Cloud ({userEmail})</span>
        </Badge>
      )}

      {dataSource === 'both' && (
        <Badge
          variant="outline"
          className="gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-400"
        >
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs">Local + AWS ({userEmail})</span>
        </Badge>
      )}
    </div>
  )
}
