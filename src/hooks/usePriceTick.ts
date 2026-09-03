import { useEffect, useRef, useState } from 'react'
import type { CoinMarket } from '../api/coingecko'

/** Must match the animation duration in index.css. */
const TICK_DURATION_MS = 800

export type Tick = 'up' | 'down'

/**
 * Flag which prices moved since the last poll, and in which direction.
 *
 * This is what makes the grid read as a live board rather than a table that
 * silently rewrites itself: a changed price flashes briefly, the way drifting
 * odds do. React Query's structural sharing keeps the array identity stable
 * when nothing changed, so this effect only runs on a real update.
 */
export function usePriceTick(coins: CoinMarket[] | undefined): Record<string, Tick> {
  const previousPrices = useRef(new Map<string, number>())
  const [ticks, setTicks] = useState<Record<string, Tick>>({})

  useEffect(() => {
    if (!coins) return

    const moved: Record<string, Tick> = {}

    for (const coin of coins) {
      if (coin.current_price == null) continue
      const before = previousPrices.current.get(coin.id)
      if (before != null && before !== coin.current_price) {
        moved[coin.id] = coin.current_price > before ? 'up' : 'down'
      }
      previousPrices.current.set(coin.id, coin.current_price)
    }

    if (Object.keys(moved).length === 0) return

    // A flash is a timed side effect of new data arriving, not a value that can
    // be derived during render. Deriving it at render time also breaks under
    // StrictMode: the second invocation sees the ref already updated and would
    // clear the tick before it is ever shown.
    // oxlint-disable-next-line react/set-state-in-effect
    setTicks(moved)
    const timer = setTimeout(() => setTicks({}), TICK_DURATION_MS)
    return () => clearTimeout(timer)
  }, [coins])

  return ticks
}
