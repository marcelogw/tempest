'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { loadConfig } from './config'
import { createAdapters } from './factory'
import { setAdapters } from './registry'
import { useWorkspaceSync } from '@/lib/hooks/use-workspace-sync'
import { startBackgroundProcessor } from '@/lib/write-queue'

type AdapterContextType = {
  isReady: boolean
  isConfigured: boolean
}

const AdapterContext = createContext<AdapterContextType>({ isReady: false, isConfigured: false })

export function useAdapterContext() {
  return useContext(AdapterContext)
}

type AdapterProviderProps = {
  children: React.ReactNode
}

export function AdapterProvider({ children }: AdapterProviderProps) {
  const [isReady, setIsReady] = useState(false)

  useWorkspaceSync()

  useEffect(() => {
    const config = loadConfig()
    const { storage, auth } = createAdapters(config)

    void storage.configure().then(() => {
      setAdapters(storage, auth)
      setIsReady(true)
      startBackgroundProcessor()
    })
  }, [])

  const isAmplifyMode = process.env.NEXT_PUBLIC_TEMPEST_STORAGE === 'amplify'

  return (
    <AdapterContext.Provider value={{ isReady, isConfigured: isReady && isAmplifyMode }}>
      {children}
    </AdapterContext.Provider>
  )
}
