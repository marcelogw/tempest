'use client'

import { useEffect } from 'react'
import { configureAmplify } from '@/lib/amplify-config'

type AmplifyProviderProps = {
  children: React.ReactNode
}

/**
 * AmplifyProvider - Initializes AWS Amplify configuration
 *
 * This component should wrap your application at the root level
 * to ensure Amplify is properly configured before any components
 * attempt to use it.
 */
export function AmplifyProvider({ children }: AmplifyProviderProps) {
  useEffect(() => {
    configureAmplify()
  }, [])

  return <>{children}</>
}
