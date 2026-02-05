'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * OAuth Callback Page
 *
 * Handles redirect from Google OAuth after authentication
 * Amplify automatically processes the OAuth code in the URL
 *
 * Flow:
 * 1. Google redirects to /auth/callback?code=...
 * 2. Amplify SDK automatically exchanges code for tokens
 * 3. Redirect to /settings?auth=success
 * 4. Settings page triggers sync upload
 */

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if there's an error from OAuth provider
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      console.error('OAuth error:', error, errorDescription)
      router.push(`/settings?auth=error&message=${encodeURIComponent(errorDescription || error)}`)
      return
    }

    // Amplify automatically handles the OAuth code exchange
    // After a short delay, redirect to settings
    const timer = setTimeout(() => {
      router.push('/settings?auth=success')
    }, 1000)

    return () => clearTimeout(timer)
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
        <p className="text-muted-foreground mt-4">Autenticando...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
            <p className="text-muted-foreground mt-4">Carregando...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
