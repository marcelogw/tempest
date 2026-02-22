import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { routing } from './routing'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headersList = await headers()

  // Read locale from cookie, then from x-next-intl-locale header set by middleware
  let locale =
    cookieStore.get('NEXT_LOCALE')?.value ||
    headersList.get('x-next-intl-locale') ||
    routing.defaultLocale

  // Ensure that the incoming locale is valid
  if (!routing.locales.includes(locale as 'en' | 'pt')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: ((await import(`@/messages/${locale}.json`)) as { default: Record<string, unknown> })
      .default,
  }
})
