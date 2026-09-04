import { describe, expect, it } from 'vitest'
import { OPAQUE_STATUS } from '@/shared/constants'
import { ApiError } from '@/shared/lib/http'
import { retryDelay, shouldRetry } from '@/shared/lib/queryClient'

describe('shouldRetry', () => {
  it('never retries a rate limit, because retrying is what caused it', () => {
    expect(shouldRetry(0, new ApiError(429, 'rate limited'))).toBe(false)
  })

  it('never retries other client errors, which cannot succeed on a repeat', () => {
    expect(shouldRetry(0, new ApiError(404, 'not found'))).toBe(false)
    expect(shouldRetry(0, new ApiError(400, 'bad request'))).toBe(false)
  })

  it('retries server errors', () => {
    expect(shouldRetry(0, new ApiError(500, 'server error'))).toBe(true)
    expect(shouldRetry(0, new ApiError(503, 'unavailable'))).toBe(true)
  })

  it('retries an opaque failure once, then stops', () => {
    // CoinGecko's 429 carries no CORS header, so the browser hides the status
    // and a rate limit reaches us as status 0. Backing off three times would
    // report it seconds late and deepen the limit.
    const opaque = new ApiError(OPAQUE_STATUS, 'could not reach CoinGecko')

    expect(shouldRetry(0, opaque)).toBe(true)
    expect(shouldRetry(1, opaque)).toBe(false)
  })

  it('retries a failure that never reached the transport', () => {
    expect(shouldRetry(0, new TypeError('boom'))).toBe(true)
    expect(shouldRetry(2, new TypeError('boom'))).toBe(true)
    expect(shouldRetry(3, new TypeError('boom'))).toBe(false)
  })
})

describe('retryDelay', () => {
  it('backs off exponentially', () => {
    expect(retryDelay(0)).toBe(1000)
    expect(retryDelay(1)).toBe(2000)
    expect(retryDelay(2)).toBe(4000)
  })

  it('caps the wait so recovery is not deferred indefinitely', () => {
    expect(retryDelay(20)).toBe(30_000)
  })
})
