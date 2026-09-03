import { MARKETS_PER_PAGE } from '../api/coingecko'

const CARD = 'rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'

/**
 * Skeletons mirror the card layout rather than showing a centred spinner, so
 * the grid does not reflow when real data lands.
 */
export function GridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: MARKETS_PER_PAGE }, (_, index) => (
        <div key={index} className={`${CARD} animate-pulse`}>
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="mt-4 h-6 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  )
}

const BUTTON =
  'rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300'

interface ErrorStateProps {
  message: string
  onRetry: () => void
  isRetrying: boolean
}

/** Only shown when there is no cached data to fall back on. */
export function ErrorState({ message, onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div className={`${CARD} text-center`} role="alert">
      <h2 className="font-semibold text-slate-900 dark:text-slate-50">Could not load market data</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      <button type="button" onClick={onRetry} disabled={isRetrying} className={`${BUTTON} mt-4`}>
        {isRetrying ? 'Retrying…' : 'Retry'}
      </button>
    </div>
  )
}

export function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className={`${CARD} text-center`}>
      <p className="text-slate-900 dark:text-slate-50">
        No coins match <span className="font-semibold">“{query}”</span>
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Search is limited to the top {MARKETS_PER_PAGE} coins by market cap.
      </p>
      <button type="button" onClick={onClear} className={`${BUTTON} mt-4`}>
        Clear search
      </button>
    </div>
  )
}
