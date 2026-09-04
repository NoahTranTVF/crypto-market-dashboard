import { QueryClient } from '@tanstack/react-query'

import {
  MAX_OPAQUE_RETRIES,
  MAX_RETRIES,
  MAX_RETRY_DELAY_MS,
  OPAQUE_STATUS,
  REFETCH_INTERVAL_MS,
} from '@/shared/constants'
import { isApiError } from '@/shared/lib/http'

/** Never retry 4xx: a 429 means we are already asking too often, a 404 never succeeds. */
export function shouldRetry(failureCount: number, error: Error): boolean {
  if (!isApiError(error)) return failureCount < MAX_RETRIES
  if (error.status === OPAQUE_STATUS) return failureCount < MAX_OPAQUE_RETRIES
  if (error.status >= 400 && error.status < 500) return false
  return failureCount < MAX_RETRIES
}

export const retryDelay = (attempt: number) => Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay,
      // Left refetchOnWindowFocus at its default true: background tabs throttle
      // timers, so the poll may not have fired while the user was away.
      staleTime: REFETCH_INTERVAL_MS,
    },
  },
})
