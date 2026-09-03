import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/coingecko'

/** CoinGecko's free tier is itself ~1-2 minutes stale, so polling faster only burns quota. */
export const REFETCH_INTERVAL_MS = 60_000

/** Past this, the board is showing prices old enough that we should say so. */
export const STALE_AFTER_MS = 150_000

const MAX_RETRIES = 3

/**
 * Retry network and 5xx failures, never 4xx.
 *
 * A 429 means we are already asking too often, so retrying makes it strictly
 * worse, and a 404 will never succeed. Both are surfaced to the user instead.
 */
export function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return failureCount < MAX_RETRIES
}

export const retryDelay = (attempt: number) => Math.min(1000 * 2 ** attempt, 30_000)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay,
      staleTime: REFETCH_INTERVAL_MS,
      refetchOnWindowFocus: false,
    },
  },
})
