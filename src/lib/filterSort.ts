import type { CoinMarket } from '../api/coingecko'

export const SORT_KEYS = ['market_cap_rank', 'current_price', 'price_change_percentage_24h'] as const
export type SortKey = (typeof SORT_KEYS)[number]

export const SORT_LABELS: Record<SortKey, string> = {
  market_cap_rank: 'Market cap',
  current_price: 'Price',
  price_change_percentage_24h: '24h change',
}

export type SortDirection = 'asc' | 'desc'

export interface FilterSortOptions {
  query: string
  sortKey: SortKey
  direction: SortDirection
}

/**
 * Search and sort in one pass over the cached list.
 *
 * Pure, so it is cheap to test and safe to memoise. Kept as a single function
 * rather than chained state because the two operations are always applied
 * together, and one `useMemo` is easier to reason about than two.
 */
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

    // Coins missing a value sort last in both directions, so flipping the
    // direction never parades unknowns at the top of the board.
    if (left == null) return right == null ? 0 : 1
    if (right == null) return -1

    return (left - right) * sign
  })
}
