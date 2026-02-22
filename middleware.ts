import { type NextRequest, NextResponse } from 'next/server'
import { getLocaleFromHeaders } from '@/lib/locale-cookie'
import { routing } from './i18n/routing'

export function middleware(request: NextRequest) {
  // Redirect legacy /en/* and /pt/* URLs to non-prefixed URLs
  const pathname = request.nextUrl.pathname
  const localeMatch = pathname.match(/^\/(en|pt)(\/|$)/)

  if (localeMatch) {
    const newPath = pathname.replace(/^\/(en|pt)/, '') || '/'
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  // Detect locale from cookie or headers
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const locale =
    cookieLocale && routing.locales.includes(cookieLocale as 'en' | 'pt')
      ? cookieLocale
      : getLocaleFromHeaders(request.headers)

  // Set header for next-intl to read
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-next-intl-locale', locale)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
