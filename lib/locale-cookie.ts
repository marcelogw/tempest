import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'
const SUPPORTED_LOCALES = ['en', 'pt'] as const
const DEFAULT_LOCALE = 'pt'

type Locale = (typeof SUPPORTED_LOCALES)[number]

/**
 * Server-side: Read locale from Next.js cookies()
 */
export function getLocaleFromCookie(cookieStore: ReadonlyRequestCookies): string | undefined {
  const cookie = cookieStore.get(LOCALE_COOKIE_NAME)
  return cookie?.value
}

/**
 * Client-side: Set locale cookie with 1-year expiry
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return

  const maxAge = 31536000 // 1 year in seconds
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${maxAge}; SameSite=lax`
}

/**
 * Fallback to Accept-Language header
 */
export function getLocaleFromHeaders(headers: Headers): string {
  const acceptLanguage = headers.get('accept-language')
  if (!acceptLanguage) return DEFAULT_LOCALE

  // Parse Accept-Language header (e.g., "pt-BR,pt;q=0.9,en;q=0.8")
  const languages = acceptLanguage.split(',').map((lang) => {
    const [code] = lang.trim().split(';')
    return code.split('-')[0] // Extract base language code
  })

  // Find first supported language
  for (const lang of languages) {
    if (SUPPORTED_LOCALES.includes(lang as Locale)) {
      return lang
    }
  }

  return DEFAULT_LOCALE
}

/**
 * Validate and return default locale
 */
export function getDefaultLocale(): Locale {
  return DEFAULT_LOCALE
}

/**
 * Sync localStorage to cookie on mount (client-side)
 */
export function initializeLocaleFromStorage(): void {
  if (typeof window === 'undefined') return

  const storedLocale = localStorage.getItem('locale')
  if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale as Locale)) {
    setLocaleCookie(storedLocale as Locale)
  }
}

/**
 * Validate locale against supported locales
 */
export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale)
}

export { LOCALE_COOKIE_NAME, SUPPORTED_LOCALES, DEFAULT_LOCALE }
export type { Locale }
