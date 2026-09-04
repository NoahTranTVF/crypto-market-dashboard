import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  CURRENCIES,
  SORT_DIRECTIONS,
  SORT_KEYS,
  type Currency,
  type SortDirection,
  type SortKey,
} from '@/shared/constants'

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

const PARAM_KEYS: Record<keyof FilterState, string> = {
  query: 'q',
  sortKey: 'sort',
  direction: 'dir',
  currency: 'cur',
}

/** URL params are user input, so unknown values fall back rather than propagate. */
function oneOf<T extends string>(allowed: readonly T[], value: string | null, fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

/** Filter state in the URL, so a view is shareable and survives a reload. */
export function useFilterState() {
  const [params, setParams] = useSearchParams()

  const state: FilterState = {
    query: params.get(PARAM_KEYS.query) ?? DEFAULTS.query,
    sortKey: oneOf(SORT_KEYS, params.get(PARAM_KEYS.sortKey), DEFAULTS.sortKey),
    direction: oneOf(SORT_DIRECTIONS, params.get(PARAM_KEYS.direction), DEFAULTS.direction),
    currency: oneOf(CURRENCIES, params.get(PARAM_KEYS.currency), DEFAULTS.currency),
  }

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)

          for (const [field, value] of Object.entries(patch)) {
            const key = PARAM_KEYS[field as keyof FilterState]
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
