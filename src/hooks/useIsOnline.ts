import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

// Hoisted out of the hook: React tears down and rebuilds the subscription
// whenever the `subscribe` identity changes, which an inline arrow does on
// every render.
const subscribe = (onStoreChange: () => void) => onlineManager.subscribe(onStoreChange)
const getSnapshot = () => onlineManager.isOnline()

/** Never reached in this client-only app; assuming online is the safe default. */
const getServerSnapshot = () => true

/**
 * React Query's own connectivity state. fetchStatus only turns 'paused' once a
 * fetch is attempted — up to a poll interval after the connection actually drops.
 */
export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
