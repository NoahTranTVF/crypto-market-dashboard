import { useEffect, useState } from 'react'
import { useIsOnline } from '../hooks/useIsOnline'
import { formatAgo } from '../lib/format'
import { STALE_AFTER_MS } from '../lib/queryClient'

/** How often the "updated Ns ago" label refreshes. */
const CLOCK_MS = 5000

export interface FeedStatusProps {
  dataUpdatedAt: number
  isFetching: boolean
  /** A fetch is queued but cannot run, which react-query reports while offline. */
  isPaused: boolean
  isError: boolean
  failureCount: number
  onRetry: () => void
}

type Tone = 'live' | 'busy' | 'warn' | 'error'

const DOT: Record<Tone, string> = {
  live: 'bg-up',
  busy: 'bg-sky-500 animate-pulse',
  warn: 'bg-amber-500',
  error: 'bg-down',
}

const TEXT: Record<Tone, string> = {
  live: 'text-slate-500 dark:text-slate-400',
  busy: 'text-slate-500 dark:text-slate-400',
  warn: 'text-amber-600 dark:text-amber-400',
  error: 'text-down',
}

/**
 * Reports the health of the feed without ever hiding the prices.
 *
 * Everything here is derived from state React Query already tracks, including
 * the offline case: its onlineManager pauses queries when the browser goes
 * offline, which surfaces as fetchStatus 'paused'. Listening to `navigator`
 * events ourselves would duplicate that.
 */
export function FeedStatus({
  dataUpdatedAt,
  isFetching,
  isPaused,
  isError,
  failureCount,
  onRetry,
}: FeedStatusProps) {
  const isOffline = !useIsOnline() || isPaused
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), CLOCK_MS)
    return () => clearInterval(timer)
  }, [])

  const age = dataUpdatedAt ? now - dataUpdatedAt : 0
  const lastUpdated = dataUpdatedAt ? `updated ${formatAgo(age)}` : 'never updated'

  let tone: Tone = 'live'
  let message = `Live · ${lastUpdated}`

  if (isOffline) {
    tone = 'warn'
    message = `Offline · showing prices from ${formatAgo(age)}`
  } else if (isError) {
    tone = 'error'
    message =
      failureCount > 0
        ? `Reconnecting (attempt ${failureCount}) · showing prices from ${formatAgo(age)}`
        : `Update failed · showing prices from ${formatAgo(age)}`
  } else if (isFetching) {
    tone = 'busy'
    message = 'Updating…'
  } else if (age > STALE_AFTER_MS) {
    tone = 'warn'
    message = `Stale · ${lastUpdated}`
  }

  return (
    <div className="flex items-center gap-2 text-xs" aria-live="polite">
      <span className={`size-2 shrink-0 rounded-full ${DOT[tone]}`} aria-hidden="true" />
      <span className={TEXT[tone]}>{message}</span>
      {(isError || isOffline) && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded font-medium text-sky-600 underline underline-offset-2 hover:text-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:text-sky-400"
        >
          Retry now
        </button>
      )}
    </div>
  )
}
