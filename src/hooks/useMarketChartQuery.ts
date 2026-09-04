import { useQuery } from '@tanstack/react-query'

import { fetchMarketChart } from '@/shared/api/coingecko'
import { CHART_DAYS, type Currency } from '@/shared/constants'

/** Inherits retry, backoff and staleTime from the shared query client. */
export function useMarketChartQuery(id: string, currency: Currency) {
  return useQuery({
    queryKey: ['market-chart', id, currency, CHART_DAYS],
    queryFn: ({ signal }) => fetchMarketChart(id, currency, CHART_DAYS, signal),
  })
}
