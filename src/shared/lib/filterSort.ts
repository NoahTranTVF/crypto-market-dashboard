import type { SortDirection, SortKey } from '@/shared/constants'
import type { CoinMarket } from '@/shared/types/coin'

export interface FilterSortOptions {
  query: string
  sortKey: SortKey
  direction: SortDirection
}

export function filterAndSort(
  coins: CoinMarket[],
  { query, sortKey, direction }: FilterSortOptions,
): CoinMarket[] {
  const needle = query.trim().toLowerCase()

  const filtered = needle
    ? coins.filter(
        (coin) =>
          coin.name.toLowerCase().includes(needle) || coin.symbol.toLowerCase().includes(needle),
      )
    : coins

  const sign = direction === 'asc' ? 1 : -1

  return [...filtered].sort((a, b) => {
    const left = a[sortKey]
    const right = b[sortKey]

    // Missing values sort last in both directions, never paraded at the top.
    if (left == null) return right == null ? 0 : 1
    if (right == null) return -1

    return (left - right) * sign
  })
}
