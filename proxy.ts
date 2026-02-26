import { type NextRequest, NextResponse } from 'next/server'
import { fetchAuthSession } from 'aws-amplify/auth/server'
import { getLocaleFromHeaders } from '@/lib/locale-cookie'
import { routing } from './i18n/routing'

// Lazily loaded Amplify server runner — null when amplify_outputs.json is absent
let runWithAmplifyServerContext:
  | ((args: {
      nextServerContext: { request: NextRequest; response: NextResponse }
      operation: (ctx: unknown) => Promise<unknown>
    }) => Promise<unknown>)
  | null = null

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const outputs = require('./amplify_outputs.json') as Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createServerRunner } = require('@aws-amplify/adapter-nextjs') as {
    createServerRunner: (args: { resourcesConfig: unknown }) => {
      runWithAmplifyServerContext: typeof runWithAmplifyServerContext
    }
  }
  runWithAmplifyServerContext = createServerRunner({
    resourcesConfig: outputs,
  }).runWithAmplifyServerContext
} catch {
  // Amplify not configured — auth checks disabled
}

// Public routes bypass auth check (/_next and /api are excluded by the matcher already)
const PUBLIC_PREFIXES = ['/auth', '/invite', '/brand']

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function resolveLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  return cookieLocale && routing.locales.includes(cookieLocale as 'en' | 'pt')
    ? cookieLocale
    : getLocaleFromHeaders(request.headers)
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Redirect legacy /en/* and /pt/* URLs to non-prefixed URLs
  const localeMatch = pathname.match(/^\/(en|pt)(\/|$)/)
  if (localeMatch) {
    const newPath = pathname.replace(/^\/(en|pt)/, '') || '/'
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  const locale = resolveLocale(request)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-next-intl-locale', locale)
  const baseResponse = NextResponse.next({ request: { headers: requestHeaders } })

  // Skip auth check when Amplify is not configured or route is public
  if (!runWithAmplifyServerContext || isPublicRoute(pathname)) {
    return baseResponse
  }

  // Server-side session check via Amplify adapter
  try {
    const isAuthenticated = await runWithAmplifyServerContext({
      nextServerContext: { request, response: baseResponse },
      operation: async (ctx) => {
        try {
          const session = await fetchAuthSession(ctx as Parameters<typeof fetchAuthSession>[0])
          return !!session.tokens
        } catch {
          return false
        }
      },
    })

    if (!isAuthenticated) {
      const authUrl = new URL('/auth', request.url)
      authUrl.searchParams.set('from', pathname)
      const redirect = NextResponse.redirect(authUrl)
      redirect.headers.set('x-next-intl-locale', locale)
      return redirect
    }
  } catch {
    // On error, fail open
    return baseResponse
  }

  return baseResponse
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
