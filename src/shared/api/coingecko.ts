import { MARKETS_PER_PAGE, type Currency } from '@/shared/constants'
import { get } from '@/shared/lib/http'
import type { CoinMarket, MarketChart } from '@/shared/types/coin'

export function fetchMarkets(currency: Currency, signal?: AbortSignal): Promise<CoinMarket[]> {
  return get<CoinMarket[]>(
    '/coins/markets',
    {
      vs_currency: currency,
      order: 'market_cap_desc',
      per_page: String(MARKETS_PER_PAGE),
      page: '1',
      sparkline: 'false',
    },
    signal,
  )
}

export function fetchMarketChart(
  id: string,
  currency: Currency,
  // No default: CHART_DAYS is the single source of truth for the window.
  days: number,
  signal?: AbortSignal,
): Promise<MarketChart> {
  return get<MarketChart>(
    `/coins/${id}/market_chart`,
    { vs_currency: currency, days: String(days) },
    signal,
  )
}
