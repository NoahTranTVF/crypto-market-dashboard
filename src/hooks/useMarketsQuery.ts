import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchMarkets } from '@/shared/api/coingecko'
import { REFETCH_INTERVAL_MS, type Currency } from '@/shared/constants'

/** The live market feed — the only module that knows the data arrives by polling. */
export function useMarketsQuery(currency: Currency) {
  return useQuery({
    queryKey: ['markets', currency],
    queryFn: ({ signal }) => fetchMarkets(currency, signal),
    refetchInterval: REFETCH_INTERVAL_MS,
    placeholderData: keepPreviousData,
  })
}
