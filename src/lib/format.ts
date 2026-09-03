import type { Currency } from '../api/coingecko'

const LOCALE = 'en-AU'

/** Percentages are shown to two places; direction must agree with what is shown. */
const PERCENT_DP = 2

/**
 * Always name the currency rather than printing a bare "$".
 *
 * With both USD and AUD selectable, a lone dollar sign is ambiguous, and an
 * ambiguous price is the one defect a money display cannot afford.
 */
const CURRENCY_DISPLAY = 'code' as const

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
    currencyDisplay: CURRENCY_DISPLAY,
    maximumFractionDigits: Math.abs(value) < 1 ? 8 : 2,
  }).format(value)
}

/** Signed percentage, e.g. "+2.41%". Null for coins too new to have 24h history. */
export function formatPercent(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return EMPTY

  return new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    minimumFractionDigits: PERCENT_DP,
    maximumFractionDigits: PERCENT_DP,
    signDisplay: 'exceptZero',
  }).format(value / 100)
}

/** Large figures like market cap, e.g. "$2.17T". */
export function formatCompact(value: number | null, currency: Currency): string {
  if (value == null || !Number.isFinite(value)) return EMPTY

  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: currency.toUpperCase(),
    currencyDisplay: CURRENCY_DISPLAY,
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

export type Direction = 'up' | 'down' | 'flat'

/** Null when unknown, so the UI can show a neutral dash instead of a false "flat". */
export function directionOf(value: number | null): Direction | null {
  if (value == null || !Number.isFinite(value)) return null

  // Decide from the rounded value, not the raw one. A -0.0004% change displays
  // as "0.00%", so a red down arrow beside it would contradict the number.
  const factor = 10 ** PERCENT_DP
  const rounded = Math.round(value * factor) / factor

  if (rounded > 0) return 'up'
  if (rounded < 0) return 'down'
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
