import { MARKETS_PER_PAGE } from '@/shared/constants'

const CARD = 'rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'

/** Mirrors the card layout, so the grid does not reflow when real data lands. */
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

const BAR = 'animate-pulse rounded bg-slate-200 dark:bg-slate-800'

/** Mirrors the detail header, so the page does not jump when the coin lands. */
export function CoinHeaderSkeleton() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className={`size-12 rounded-full ${BAR}`} />
      <div className="space-y-2">
        <div className={`h-6 w-40 ${BAR}`} />
        <div className={`h-3 w-24 ${BAR}`} />
      </div>
    </div>
  )
}

/** Height matches the rendered chart, so the panel does not resize when it lands. */
export function ChartSkeleton() {
  return <div className={`h-60 ${BAR}`} aria-hidden="true" />
}

/** Shown while a lazily loaded route chunk is in flight. */
export function RouteSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className={`mx-auto max-w-4xl ${CARD} h-40 animate-pulse`} aria-hidden="true" />
    </main>
  )
}

const BUTTON =
  'rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300'

interface ErrorStateProps {
  message: string
  onRetry: () => void
  isRetrying: boolean
  /** Defaults describe a failed fetch; the error boundary overrides both. */
  title?: string
  actionLabel?: string
}

/** Only shown when there is no cached data to fall back on. */
export function ErrorState({
  message,
  onRetry,
  isRetrying,
  title = 'Could not load market data',
  actionLabel = 'Retry',
}: ErrorStateProps) {
  return (
    <div className={`${CARD} text-center`} role="alert">
      <h2 className="font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      <button type="button" onClick={onRetry} disabled={isRetrying} className={`${BUTTON} mt-4`}>
        {isRetrying ? 'Retrying…' : actionLabel}
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
