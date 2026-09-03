import { Link } from 'react-router-dom'
import type { CoinMarket, Currency } from '../api/coingecko'
import type { Tick } from '../hooks/usePriceTick'
import { formatCompact, formatPrice } from '../lib/format'
import { PriceChange } from './PriceChange'

interface CoinCardProps {
  coin: CoinMarket
  currency: Currency
  tick?: Tick
}

export function CoinCard({ coin, currency, tick }: CoinCardProps) {
  return (
    <Link
      to={`/coin/${coin.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <div className="flex items-center gap-3">
        <img
          src={coin.image}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          className="size-9 rounded-full"
        />
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-slate-900 dark:text-slate-50">{coin.name}</h2>
          <p className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
            {coin.symbol}
            {coin.market_cap_rank != null && <> · #{coin.market_cap_rank}</>}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <p
          // The flash is keyed off the class being newly applied, then removed
          // by usePriceTick once the animation has run.
          className={`rounded px-1 text-xl font-semibold text-slate-900 tabular-nums dark:text-slate-50 ${
            tick ? `tick-${tick}` : ''
          }`}
        >
          {formatPrice(coin.current_price, currency)}
        </p>
        <PriceChange value={coin.price_change_percentage_24h} />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Market cap {formatCompact(coin.market_cap, currency)}
      </p>
    </Link>
  )
}
