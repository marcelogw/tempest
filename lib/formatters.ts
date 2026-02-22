/**
 * Locale-aware formatting utilities
 *
 * These functions provide currency and number formatting
 * based on the current locale and currency settings.
 */

export type SupportedCurrency = 'BRL' | 'USD' | 'EUR'
export type SupportedLocale = 'pt' | 'pt-BR' | 'en' | 'en-US'

/**
 * Format a number as currency with full precision
 *
 * @param value - The number to format
 * @param locale - The locale to use (default: 'pt-BR')
 * @param currency - The currency to use (default: 'BRL')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  locale: SupportedLocale = 'pt-BR',
  currency: SupportedCurrency = 'BRL'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format a number as short currency (e.g., R$1.5k, $2.3k)
 *
 * @param value - The number to format
 * @param locale - The locale to use (default: 'pt-BR')
 * @param currency - The currency to use (default: 'BRL')
 * @returns Shortened currency string
 */
export function formatShortCurrency(
  value: number,
  _locale: SupportedLocale = 'pt-BR',
  currency: SupportedCurrency = 'BRL'
): string {
  // Currency symbols by currency code
  const currencySymbols: Record<SupportedCurrency, string> = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
  }

  const symbol = currencySymbols[currency]

  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`
  }

  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}k`
  }

  return `${symbol}${value}`
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use formatCurrency(value, 'pt-BR', 'BRL') instead
 */
export function formatCurrencyBRL(value: number): string {
  return formatCurrency(value, 'pt-BR', 'BRL')
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use formatShortCurrency(value, 'pt-BR', 'BRL') instead
 */
export function formatShortCurrencyBRL(value: number): string {
  return formatShortCurrency(value, 'pt-BR', 'BRL')
}

/**
 * Format a number with locale-specific formatting
 *
 * @param value - The number to format
 * @param locale - The locale to use (default: 'pt-BR')
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: SupportedLocale = 'pt-BR',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

/**
 * Format a percentage value
 *
 * @param value - The value to format (0-100 scale, e.g., 15.5 for 15.5%)
 * @param locale - The locale to use (default: 'pt-BR')
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  locale: SupportedLocale = 'pt-BR',
  decimals: number = 1
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}
