import { describe, expect, it } from 'vitest'
import { ApiError } from '../api/coingecko'
import { retryDelay, shouldRetry } from './queryClient'

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

  it('retries network failures, which arrive as a plain TypeError', () => {
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true)
  })

  it('gives up after three attempts', () => {
    expect(shouldRetry(2, new TypeError('Failed to fetch'))).toBe(true)
    expect(shouldRetry(3, new TypeError('Failed to fetch'))).toBe(false)
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
