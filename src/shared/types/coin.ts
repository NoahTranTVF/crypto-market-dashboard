/**
 * The subset of `/coins/markets` we render. Numeric fields are null in practice
 * for newly listed coins, so they are typed that way and every formatter handles it.
 */
export interface CoinMarket {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number | null
  market_cap: number | null
  market_cap_rank: number | null
  total_volume: number | null
  high_24h: number | null
  low_24h: number | null
  price_change_percentage_24h: number | null
  last_updated: string
}

/** `prices` is a list of [unixMillis, price] pairs, oldest first. */
export interface MarketChart {
  prices: [number, number][]
}
