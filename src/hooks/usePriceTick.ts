import { TICK_DURATION_MS, type Currency } from '@/shared/constants'
import type { CoinMarket } from '@/shared/types/coin'
import { useEffect, useRef, useState } from 'react'

export type Tick = 'up' | 'down'

/**
 * Which prices moved since the last poll, and in which direction.
 *
 * State lives here rather than per card: cards unmount when the search filters
 * them out, which would wipe their previous price and lose the next flash.
 */
export function usePriceTick(
  coins: CoinMarket[] | undefined,
  currency: Currency,
): Record<string, Tick> {
  const previousPrices = useRef(new Map<string, number>())
  const [ticks, setTicks] = useState<Record<string, Tick>>({})

  useEffect(() => {
    if (!coins) return

    const moved: Record<string, Tick> = {}

    for (const coin of coins) {
      if (coin.current_price == null) continue
      // Keyed by currency too: a USD to AUD switch reprices every coin, and
      // comparing across currencies would flash the board as a rally.
      const key = `${currency}:${coin.id}`
      const before = previousPrices.current.get(key)
      if (before != null && before !== coin.current_price) {
        moved[coin.id] = coin.current_price > before ? 'up' : 'down'
      }
      previousPrices.current.set(key, coin.current_price)
    }

    if (Object.keys(moved).length === 0) return

    // A timed side effect of new data, not a value derivable during render.
    // oxlint-disable-next-line react/set-state-in-effect
    setTicks(moved)
    const timer = setTimeout(() => setTicks({}), TICK_DURATION_MS)
    return () => clearTimeout(timer)
  }, [coins, currency])

  return ticks
}
