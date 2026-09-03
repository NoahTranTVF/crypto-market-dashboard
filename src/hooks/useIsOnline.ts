import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

/**
 * Subscribe to React Query's own connectivity state.
 *
 * fetchStatus only becomes 'paused' once a fetch is actually attempted, which
 * can be a whole poll interval away. Reading onlineManager lets the board admit
 * it is offline the moment the connection drops, without this app registering
 * its own navigator listeners alongside the ones the library already owns.
 */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
    () => true,
  )
}
