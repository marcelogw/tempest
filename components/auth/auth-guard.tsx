'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'
import { AuthForm } from './auth-form'
import { AmplifySetupRequired } from './amplify-setup-required'

type AuthGuardProps = {
  children: React.ReactNode
  /**
   * If true, bypasses authentication and renders children directly.
   * Useful for development when Amplify is not configured.
   */
  bypass?: boolean
}

/**
 * AuthGuard - Protects routes requiring authentication
 *
 * Checks if user is authenticated and shows login form if not.
 * Once authenticated, renders the protected content.
 *
 * If Amplify is not configured, shows setup instructions.
 */
export function AuthGuard({ children, bypass = false }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isAmplifyConfigured, setIsAmplifyConfigured] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void checkAuth()
  }, [])

  async function checkAuth() {
    try {
      // Check if Amplify is configured by trying to get current user
      await getCurrentUser()
      const session = await fetchAuthSession()
      setIsAmplifyConfigured(true)
      setIsAuthenticated(!!session.tokens)
    } catch (error) {
      // Check if error is due to missing configuration or just not authenticated
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (
        errorMessage.includes('Auth') &&
        (errorMessage.includes('not configured') || errorMessage.includes('No credentials'))
      ) {
        setIsAmplifyConfigured(false)
        setIsAuthenticated(null)
      } else {
        setIsAmplifyConfigured(true)
        setIsAuthenticated(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Bypass authentication if requested (for development)
  if (bypass) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground text-sm">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Show setup instructions if Amplify is not configured
  if (isAmplifyConfigured === false) {
    return <AmplifySetupRequired />
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AuthForm onSuccess={() => setIsAuthenticated(true)} />
  }

  return <>{children}</>
}
