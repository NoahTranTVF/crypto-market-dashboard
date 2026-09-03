const BASE_URL = 'https://api.coingecko.com/api/v3'

/** The brief pins USD; AUD is offered because the audience is Australian. */
export const CURRENCIES = ['usd', 'aud'] as const
export type Currency = (typeof CURRENCIES)[number]

/**
 * The subset of `/coins/markets` we actually render.
 *
 * CoinGecko returns ~30 fields per coin; typing the ones we don't use would be
 * noise that drifts out of date. Numeric fields are nullable in practice for
 * newly listed coins, so they are typed honestly rather than optimistically.
 */
export interface CoinMarket {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number | null
  market_cap: number | null
  market_cap_rank: number | null
  total_volume: number | null
  high_24h: number | null
  low_24h: number | null
  price_change_percentage_24h: number | null
  last_updated: string
}

/** Carries the HTTP status so retry logic can refuse to retry 4xx. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `${BASE_URL}${path}?${new URLSearchParams(params)}`
  // A network failure rejects with TypeError, which react-query treats as retryable.
  const response = await fetch(url)

  if (!response.ok) {
    const detail =
      response.status === 429
        ? 'CoinGecko rate limit reached.'
        : `Request failed with status ${response.status}.`
    throw new ApiError(response.status, detail)
  }

  return response.json() as Promise<T>
}

export const MARKETS_PER_PAGE = 20

export function fetchMarkets(currency: Currency): Promise<CoinMarket[]> {
  return get<CoinMarket[]>('/coins/markets', {
    vs_currency: currency,
    order: 'market_cap_desc',
    per_page: String(MARKETS_PER_PAGE),
    page: '1',
    sparkline: 'false',
  })
}

/** `prices` is a list of [unixMillis, price] pairs. */
export interface MarketChart {
  prices: [number, number][]
}

export function fetchMarketChart(id: string, currency: Currency, days = 7): Promise<MarketChart> {
  return get<MarketChart>(`/coins/${id}/market_chart`, {
    vs_currency: currency,
    days: String(days),
  })
}
