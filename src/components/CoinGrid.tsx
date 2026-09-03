import type { CoinMarket, Currency } from '../api/coingecko'
import type { Tick } from '../hooks/usePriceTick'
import { CoinCard } from './CoinCard'

interface CoinGridProps {
  coins: CoinMarket[]
  currency: Currency
  ticks?: Record<string, Tick>
}

/** 1 column on mobile, 2 on tablet, 3-4 on desktop. */
export function CoinGrid({ coins, currency, ticks }: CoinGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {coins.map((coin) => (
        // Keyed by id, never by index: the list is sorted and filtered, so
        // index keys would make React reuse the wrong card.
        <li key={coin.id}>
          <CoinCard coin={coin} currency={currency} tick={ticks?.[coin.id]} />
        </li>
      ))}
    </ul>
  )
}
