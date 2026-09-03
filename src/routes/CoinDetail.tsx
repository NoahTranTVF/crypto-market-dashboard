import { Link, useLocation, useParams } from 'react-router-dom'
import { PriceChange } from '../components/PriceChange'
import { PriceChart } from '../components/PriceChart'
import { ErrorState } from '../components/States'
import { ThemeToggle } from '../components/ThemeToggle'
import { useFilterState } from '../hooks/useFilterState'
import { CHART_DAYS, useMarketChart } from '../hooks/useMarketChart'
import { useMarkets } from '../hooks/useMarkets'
import { formatCompact, formatPrice } from '../lib/format'

const PANEL =
  'rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'

export default function CoinDetail() {
  const { id = '' } = useParams()
  const { search } = useLocation()
  const { currency } = useFilterState()

  // Same query key as the dashboard, so arriving by click costs no request and
  // arriving by deep link fetches the list once.
  const markets = useMarkets(currency)
  const chart = useMarketChart(id, currency)
  const coin = markets.data?.find((candidate) => candidate.id === id)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <Link
            to={{ pathname: '/', search }}
            className="rounded text-sm text-sky-600 underline underline-offset-2 hover:text-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:text-sky-400"
          >
            ← Back to market
          </Link>
          <ThemeToggle />
        </header>

        {!coin && markets.isError && (
          <ErrorState
            message={markets.error.message}
            onRetry={() => void markets.refetch()}
            isRetrying={markets.isFetching}
          />
        )}

        {!coin && markets.isSuccess && (
          <div className={`${PANEL} text-center`}>
            <p className="text-slate-900 dark:text-slate-50">
              No coin called <span className="font-semibold">“{id}”</span> in the top 20 by market
              cap.
            </p>
          </div>
        )}

        {!coin && markets.isPending && (
          <div className={`${PANEL} h-24 animate-pulse`} aria-hidden="true" />
        )}

        {coin && (
          <>
            <div className="flex items-center gap-3">
              <img src={coin.image} alt="" width={48} height={48} className="size-12 rounded-full" />
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {coin.name}
                </h1>
                <p className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  {coin.symbol}
                  {coin.market_cap_rank != null && <> · rank #{coin.market_cap_rank}</>}
                </p>
              </div>
            </div>

            <div className="flex items-end gap-4">
              <p className="text-3xl font-semibold text-slate-900 tabular-nums dark:text-slate-50">
                {formatPrice(coin.current_price, currency)}
              </p>
              <PriceChange value={coin.price_change_percentage_24h} />
            </div>

            <section className={PANEL}>
              <h2 className="sr-only">Price history</h2>
              {chart.isPending && <div className="h-60 animate-pulse" aria-hidden="true" />}
              {chart.isError && (
                <ErrorState
                  message={chart.error.message}
                  onRetry={() => void chart.refetch()}
                  isRetrying={chart.isFetching}
                />
              )}
              {chart.data && (
                <PriceChart points={chart.data.prices} currency={currency} days={CHART_DAYS} />
              )}
            </section>

            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ['24h high', formatPrice(coin.high_24h, currency)],
                ['24h low', formatPrice(coin.low_24h, currency)],
                ['Market cap', formatCompact(coin.market_cap, currency)],
                ['24h volume', formatCompact(coin.total_volume, currency)],
              ].map(([label, value]) => (
                <div key={label} className={PANEL}>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
                  <dd className="mt-1 font-semibold text-slate-900 tabular-nums dark:text-slate-50">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
    </main>
  )
}
