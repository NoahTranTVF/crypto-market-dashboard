import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CURRENCIES, type Currency } from '../api/coingecko'
import { SORT_KEYS, type SortDirection, type SortKey } from '../lib/filterSort'

export interface FilterState {
  query: string
  sortKey: SortKey
  direction: SortDirection
  currency: Currency
}

const DEFAULTS: FilterState = {
  query: '',
  sortKey: 'market_cap_rank',
  direction: 'asc',
  currency: 'usd',
}

/** URL params are user input, so unknown values fall back rather than propagate. */
function oneOf<T extends string>(allowed: readonly T[], value: string | null, fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

/**
 * Search and sort live in the query string rather than component state.
 *
 * It costs nothing over useState and buys shareable links, back-button support
 * and state that survives a reload.
 */
export function useFilterState() {
  const [params, setParams] = useSearchParams()

  const state: FilterState = {
    query: params.get('q') ?? DEFAULTS.query,
    sortKey: oneOf(SORT_KEYS, params.get('sort'), DEFAULTS.sortKey),
    direction: oneOf(['asc', 'desc'] as const, params.get('dir'), DEFAULTS.direction),
    currency: oneOf(CURRENCIES, params.get('cur'), DEFAULTS.currency),
  }

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          const keys = { query: 'q', sortKey: 'sort', direction: 'dir', currency: 'cur' } as const

          for (const [field, value] of Object.entries(patch)) {
            const key = keys[field as keyof FilterState]
            // Keep defaults out of the URL so a shared link stays readable.
            if (!value || value === DEFAULTS[field as keyof FilterState]) next.delete(key)
            else next.set(key, value)
          }

          return next
        },
        // Typing in the search box must not fill up the history stack.
        { replace: true },
      )
    },
    [setParams],
  )

  return { ...state, update }
}
