import { useMarkets } from './hooks/useMarkets'
import { CoinGrid } from './components/CoinGrid'

export default function App() {
  const { data } = useMarkets('usd')

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Crypto Market Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Top 20 cryptocurrencies by market cap
        </p>

        <div className="mt-6">{data && <CoinGrid coins={data} currency="usd" />}</div>
      </div>
    </main>
  )
}
