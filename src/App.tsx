import { useMemo } from 'react'

import { CoinGrid } from '@/components/CoinGrid'
import { Controls } from '@/components/Controls'
import { FeedStatus } from '@/components/FeedStatus'
import { EmptyState, ErrorState, GridSkeleton } from '@/components/States'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useFilterState } from '@/hooks/useFilterState'
import { useMarketsQuery } from '@/hooks/useMarketsQuery'
import { usePriceTick } from '@/hooks/usePriceTick'
import { filterAndSort } from '@/shared/lib/filterSort'

export default function App() {
  const { query, sortKey, direction, currency, update } = useFilterState()
  const markets = useMarketsQuery(currency)
  const ticks = usePriceTick(markets.data, currency)

  const coins = useMemo(
    () => filterAndSort(markets.data ?? [], { query, sortKey, direction }),
    [markets.data, query, sortKey, direction],
  )

  // Once loaded, prices stay on screen: a failed refetch degrades FeedStatus
  // rather than replacing the board.
  const hasData = markets.data != null

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Crypto Market Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Top 20 cryptocurrencies by market cap
            </p>
          </div>
          <ThemeToggle />
        </header>

        {hasData && (
          <>
            <Controls
              query={query}
              sortKey={sortKey}
              direction={direction}
              currency={currency}
              update={update}
              resultCount={coins.length}
            />
            <FeedStatus
              dataUpdatedAt={markets.dataUpdatedAt}
              isFetching={markets.isFetching}
              isPaused={markets.isPaused}
              isError={markets.isError}
              failureCount={markets.failureCount}
              onRetry={() => void markets.refetch()}
            />
          </>
        )}

        {!hasData && markets.isError && (
          <ErrorState
            message={markets.error.message}
            onRetry={() => void markets.refetch()}
            isRetrying={markets.isFetching}
          />
        )}

        {!hasData && !markets.isError && <GridSkeleton />}

        {hasData &&
          (coins.length > 0 ? (
            <CoinGrid coins={coins} currency={currency} ticks={ticks} />
          ) : (
            <EmptyState query={query} onClear={() => update({ query: '' })} />
          ))}
      </div>
    </main>
  )
}
