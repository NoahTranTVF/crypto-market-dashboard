import type { Currency } from '../api/coingecko'

const LOCALE = 'en-AU'

/** Shown wherever the API gives us null rather than a number. */
export const EMPTY = '—'

/**
 * Format a price without losing small coins.
 *
 * BTC trades around $108,000 while SHIB trades around $0.000012. A fixed two
 * decimal places would render every sub-cent coin as "$0.00", which is a money
 * display bug, so precision widens below $1.
 */
export function formatPrice(value: number | null, currency: Currency): string {
  if (value == null || !Number.isFinite(value)) return EMPTY

  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: Math.abs(value) < 1 ? 8 : 2,
  }).format(value)
}

/** Signed percentage, e.g. "+2.41%". Null for coins too new to have 24h history. */
export function formatPercent(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return EMPTY

  return new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(value / 100)
}

/** Large figures like market cap, e.g. "$2.17T". */
export function formatCompact(value: number | null, currency: Currency): string {
  if (value == null || !Number.isFinite(value)) return EMPTY

  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: currency.toUpperCase(),
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

export type Direction = 'up' | 'down' | 'flat'

/** Null when unknown, so the UI can show a neutral dash instead of a false "flat". */
export function directionOf(value: number | null): Direction | null {
  if (value == null || !Number.isFinite(value)) return null
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'flat'
}

/** Compact age for the feed status, e.g. "8s ago" / "3m ago". */
export function formatAgo(milliseconds: number): string {
  const seconds = Math.max(0, Math.round(milliseconds / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.round(minutes / 60)}h ago`
}
