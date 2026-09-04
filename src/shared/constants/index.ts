/** Every tuning knob in the app, grouped by concern. */

/* ── CoinGecko API ──────────────────────────────────────────────────────── */

export const BASE_URL = 'https://api.coingecko.com/api/v3'

/** Pinned by the brief. */
export const MARKETS_PER_PAGE = 20

/** USD is the brief; AUD because the audience is Australian. */
export const CURRENCIES = ['usd', 'aud'] as const
export type Currency = (typeof CURRENCIES)[number]

export const CHART_DAYS = 7

/* ── Cache and retry policy ─────────────────────────────────────────────── */

/** The free tier's own data is 1-2 min stale, so polling faster only burns quota. */
export const REFETCH_INTERVAL_MS = 60_000

/** Past this, the board is showing prices old enough that we should say so. */
export const STALE_AFTER_MS = 150_000

export const MAX_RETRIES = 3

/**
 * CoinGecko's 429 carries no `access-control-allow-origin`, so the browser
 * blocks it and fetch rejects without a status. ApiError records that as status
 * 0: a rate limit and a dropped connection are the same event at this layer.
 */
export const OPAQUE_STATUS = 0

/** One retry covers a genuine blip; three would only deepen a rate limit. */
export const MAX_OPAQUE_RETRIES = 1

export const MAX_RETRY_DELAY_MS = 30_000

/* ── Search and sort ────────────────────────────────────────────────────── */

export const SORT_KEYS = ['market_cap_rank', 'current_price', 'price_change_percentage_24h'] as const
export type SortKey = (typeof SORT_KEYS)[number]

export const SORT_LABELS: Record<SortKey, string> = {
  market_cap_rank: 'Market cap',
  current_price: 'Price',
  price_change_percentage_24h: '24h change',
}

export const SORT_DIRECTIONS = ['asc', 'desc'] as const
export type SortDirection = (typeof SORT_DIRECTIONS)[number]

/* ── Formatting ─────────────────────────────────────────────────────────── */

export const LOCALE = 'en-AU'

/** directionOf must round to the same places formatPercent displays. */
export const PERCENT_DP = 2

/** SHIB trades at ~$0.000012; two decimals would render it "0.00". */
export const SMALL_PRICE_BELOW = 1
export const SMALL_PRICE_DP = 8
export const PRICE_DP = 2

/** Name the currency: with USD and AUD both selectable, a bare "$" is ambiguous. */
export const CURRENCY_DISPLAY = 'code' as const

/** Shown wherever the API gives us null rather than a number. */
export const EMPTY = '—'

/* ── UI timings ─────────────────────────────────────────────────────────── */

/** Must match the tick animation duration in index.css. */
export const TICK_DURATION_MS = 800

/** How often the "updated Ns ago" label refreshes. */
export const FEED_CLOCK_MS = 5000
