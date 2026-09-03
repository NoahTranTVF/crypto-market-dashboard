import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchMarkets, type Currency } from '../api/coingecko'
import { REFETCH_INTERVAL_MS } from '../lib/queryClient'

/**
 * The live market feed.
 *
 * Deliberately the only place that knows the data arrives by polling. Swapping
 * in a websocket would replace this hook and leave every component untouched.
 */
export function useMarkets(currency: Currency) {
  return useQuery({
    queryKey: ['markets', currency],
    queryFn: () => fetchMarkets(currency),
    refetchInterval: REFETCH_INTERVAL_MS,
    // Switching currency reads as a re-price, not a reload: the board keeps the
    // previous rows on screen instead of collapsing to skeletons.
    placeholderData: keepPreviousData,
  })
}
