import {
  CURRENCY_DISPLAY,
  EMPTY,
  LOCALE,
  PERCENT_DP,
  PRICE_DP,
  SMALL_PRICE_BELOW,
  SMALL_PRICE_DP,
  type Currency,
} from '@/shared/constants'

/** Format a price without losing small coins — see SMALL_PRICE_BELOW. */
export function formatPrice(value: number | null, currency: Currency): string {
  if (value == null || !Number.isFinite(value)) return EMPTY

  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: currency.toUpperCase(),
    currencyDisplay: CURRENCY_DISPLAY,
    maximumFractionDigits: Math.abs(value) < SMALL_PRICE_BELOW ? SMALL_PRICE_DP : PRICE_DP,
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

/** Large figures like market cap, e.g. "USD 2.17T". */
export function formatCompact(value: number | null, currency: Currency): string {
  if (value == null || !Number.isFinite(value)) return EMPTY

  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: currency.toUpperCase(),
    currencyDisplay: CURRENCY_DISPLAY,
    notation: 'compact',
    maximumFractionDigits: PRICE_DP,
  }).format(value)
}

export type Direction = 'up' | 'down' | 'flat'

/** Null when unknown, so the UI can show a neutral dash instead of a false "flat". */
export function directionOf(value: number | null): Direction | null {
  if (value == null || !Number.isFinite(value)) return null

  // Round first: -0.0004% displays as "0.00%", so a red arrow would contradict it.
  const factor = 10 ** PERCENT_DP
  const rounded = Math.round(value * factor) / factor

  if (rounded > 0) return 'up'
  if (rounded < 0) return 'down'
  return 'flat'
}

/** Y axis labels. Bare numbers — the currency is named in the tooltip and caption. */
export function formatAxisPrice(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    notation: Math.abs(value) >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: Math.abs(value) < SMALL_PRICE_BELOW ? SMALL_PRICE_DP : PRICE_DP,
  }).format(value)
}

/** X axis labels for the chart, e.g. "28 Aug". */
export function formatDay(milliseconds: number): string {
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' }).format(milliseconds)
}

/** Full timestamp for the chart tooltip, e.g. "28 Aug, 3:00 pm". */
export function formatDayTime(milliseconds: number): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(milliseconds)
}

/** Compact age for the feed status, e.g. "8s ago" / "3m ago". */
export function formatAgo(milliseconds: number): string {
  const seconds = Math.max(0, Math.round(milliseconds / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.round(minutes / 60)}h ago`
}
