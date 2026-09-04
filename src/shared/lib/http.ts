import { BASE_URL, OPAQUE_STATUS } from '@/shared/constants'

/** Carries the HTTP status so retry logic can refuse to retry 4xx. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Matched by name, not `instanceof`.
 *
 * A module can be evaluated twice — Vite's HMR appends a query string to
 * invalidated modules — which yields two `ApiError` classes and an `instanceof`
 * that silently fails. That drops the retry policy back to its default, so a
 * rate limit gets retried three times: the exact bug this class exists to stop,
 * reappearing only in development, where it is least likely to be noticed.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === 'ApiError'
}

export async function get<T>(
  path: string,
  params: Record<string, string>,
  /** React Query's, so a superseded request is cancelled rather than discarded. */
  signal?: AbortSignal,
): Promise<T> {
  const url = `${BASE_URL}${path}?${new URLSearchParams(params)}`

  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    // An abort is our own doing; React Query must see it as a cancellation.
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    // Everything else arrives as a bare TypeError with no status: a blocked
    // error response, DNS, TLS or a dropped connection are indistinguishable.
    throw new ApiError(
      OPAQUE_STATUS,
      'Could not reach CoinGecko — most likely its rate limit, which clears within a minute.',
    )
  }

  if (!response.ok) {
    const detail =
      response.status === 429
        ? 'CoinGecko rate limit reached.'
        : `Request failed with status ${response.status}.`
    throw new ApiError(response.status, detail)
  }

  return response.json() as Promise<T>
}
