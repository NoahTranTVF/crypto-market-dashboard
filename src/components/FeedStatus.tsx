import { useEffect, useState } from 'react'

import { useIsOnline } from '@/hooks/useIsOnline'
import { FEED_CLOCK_MS, STALE_AFTER_MS } from '@/shared/constants'
import { formatAgo } from '@/shared/lib/format'

export interface FeedStatusProps {
  dataUpdatedAt: number
  isFetching: boolean
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

/** Feed health, never hiding the prices. All of it derives from React Query state. */
export function FeedStatus({
  dataUpdatedAt,
  isFetching,
  isPaused,
  isError,
  failureCount,
  onRetry,
}: Readonly<FeedStatusProps>) {
  const isOffline = !useIsOnline() || isPaused
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), FEED_CLOCK_MS)
    return () => clearInterval(timer)
  }, [])

  const age = dataUpdatedAt ? now - dataUpdatedAt : 0
  const lastUpdated = dataUpdatedAt ? `updated ${formatAgo(age)}` : 'never updated'

  let tone: Tone = 'live'
  let message = `Live · ${lastUpdated}`
  let announcement = 'Price feed live.'

  if (isOffline) {
    tone = 'warn'
    message = `Offline · showing prices from ${formatAgo(age)}`
    announcement = 'Offline. Showing the last prices received.'
  } else if (isError) {
    tone = 'error'
    message =
      failureCount > 0
        ? `Reconnecting (attempt ${failureCount}) · showing prices from ${formatAgo(age)}`
        : `Update failed · showing prices from ${formatAgo(age)}`
    announcement = 'Price feed update failed. Showing the last prices received.'
  } else if (isFetching) {
    tone = 'busy'
    message = 'Updating…'
    // Announcement left as 'live': toggling it would re-announce every poll.
  } else if (age > STALE_AFTER_MS) {
    tone = 'warn'
    message = `Stale · ${lastUpdated}`
    announcement = 'Prices are out of date.'
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`size-2 shrink-0 rounded-full ${DOT[tone]}`} aria-hidden="true" />
      <span className={TEXT[tone]}>{message}</span>
      {isError && !isOffline && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded font-medium text-sky-600 underline underline-offset-2 hover:text-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:text-sky-400"
        >
          Retry now
        </button>
      )}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}
