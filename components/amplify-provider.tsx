'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { configureAmplify } from '@/lib/amplify-config'
import { useWorkspaceSync } from '@/lib/hooks/use-workspace-sync'
import { startBackgroundProcessor } from '@/lib/write-queue'

type AmplifyContextType = {
  isConfigured: boolean
  isLoading: boolean
}

const AmplifyContext = createContext<AmplifyContextType>({
  isConfigured: false,
  isLoading: true,
})

export function useAmplify() {
  return useContext(AmplifyContext)
}

type AmplifyProviderProps = {
  children: React.ReactNode
}

/**
 * AmplifyProvider - Initializes AWS Amplify configuration
 *
 * This component should wrap your application at the root level
 * to ensure Amplify is properly configured before any components
 * attempt to use it.
 *
 * Provides context to check if Amplify is configured via useAmplify() hook.
 */
export function AmplifyProvider({ children }: AmplifyProviderProps) {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useWorkspaceSync()

  useEffect(() => {
    const result = configureAmplify()
    setIsConfigured(result)
    setIsLoading(false)
    startBackgroundProcessor()
  }, [])

  return (
    <AmplifyContext.Provider value={{ isConfigured, isLoading }}>
      {children}
    </AmplifyContext.Provider>
  )
}
