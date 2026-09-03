import { useQuery } from '@tanstack/react-query'
import { fetchMarketChart, type Currency } from '../api/coingecko'

export const CHART_DAYS = 7

/** Inherits retry, backoff and staleTime from the shared query client. */
export function useMarketChart(id: string, currency: Currency) {
  return useQuery({
    queryKey: ['market-chart', id, currency, CHART_DAYS],
    queryFn: () => fetchMarketChart(id, currency, CHART_DAYS),
  })
}
