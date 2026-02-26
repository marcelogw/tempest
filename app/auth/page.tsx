'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { AuthForm } from '@/components/auth/auth-form'

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSuccess() {
    const from = searchParams.get('from') ?? '/'
    router.push(from.startsWith('/') ? from : '/')
  }

  return <AuthForm onSuccess={handleSuccess} />
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  )
}
