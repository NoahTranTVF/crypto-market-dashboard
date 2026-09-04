import type { Currency } from '@/shared/constants'
import type { Tick } from '@/hooks/usePriceTick'
import type { CoinMarket } from '@/shared/types/coin'
import { CoinCard } from './CoinCard'

interface CoinGridProps {
  coins: CoinMarket[]
  currency: Currency
  ticks?: Record<string, Tick>
}

/** 1 column on mobile, 2 on tablet, 3-4 on desktop. */
export function CoinGrid({ coins, currency, ticks }: Readonly<CoinGridProps>) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {coins.map((coin) => (
        // Keyed by id, never index: the list is sorted and filtered.
        <li key={coin.id}>
          <CoinCard coin={coin} currency={currency} tick={ticks?.[coin.id]} />
        </li>
      ))}
    </ul>
  )
}
