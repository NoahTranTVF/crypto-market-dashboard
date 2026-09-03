import { describe, expect, it } from 'vitest'
import type { CoinMarket } from '../api/coingecko'
import { filterAndSort, type FilterSortOptions } from './filterSort'
import { directionOf, EMPTY, formatPercent, formatPrice } from './format'

function coin(overrides: Partial<CoinMarket> & Pick<CoinMarket, 'id'>): CoinMarket {
  return {
    symbol: overrides.id.slice(0, 3),
    name: overrides.id,
    image: '',
    current_price: 1,
    market_cap: 1,
    market_cap_rank: 1,
    total_volume: 1,
    high_24h: 1,
    low_24h: 1,
    price_change_percentage_24h: 0,
    last_updated: '',
    ...overrides,
  }
}

const COINS: CoinMarket[] = [
  coin({ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 108_000 }),
  coin({ id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3341 }),
  coin({ id: 'shiba', symbol: 'shib', name: 'Shiba Inu', current_price: 0.000012 }),
]

const BASE: FilterSortOptions = { query: '', sortKey: 'current_price', direction: 'asc' }

const ids = (coins: CoinMarket[]) => coins.map((c) => c.id)

describe('filterAndSort', () => {
  it('matches on name, case-insensitively', () => {
    expect(ids(filterAndSort(COINS, { ...BASE, query: 'BITcoin' }))).toEqual(['bitcoin'])
  })

  it('matches on symbol as well as name', () => {
    expect(ids(filterAndSort(COINS, { ...BASE, query: 'shib' }))).toEqual(['shiba'])
  })

  it('returns nothing when the query matches neither', () => {
    expect(filterAndSort(COINS, { ...BASE, query: 'zzz' })).toEqual([])
  })

  it('sorts by price in both directions', () => {
    expect(ids(filterAndSort(COINS, BASE))).toEqual(['shiba', 'ethereum', 'bitcoin'])
    expect(ids(filterAndSort(COINS, { ...BASE, direction: 'desc' }))).toEqual([
      'bitcoin',
      'ethereum',
      'shiba',
    ])
  })

  it('sorts by 24h change', () => {
    const changes = [
      coin({ id: 'a', price_change_percentage_24h: -5 }),
      coin({ id: 'b', price_change_percentage_24h: 10 }),
    ]
    const options = { ...BASE, sortKey: 'price_change_percentage_24h' } as const

    expect(ids(filterAndSort(changes, options))).toEqual(['a', 'b'])
    expect(ids(filterAndSort(changes, { ...options, direction: 'desc' }))).toEqual(['b', 'a'])
  })

  it('keeps coins with no value last in both directions', () => {
    const withNull = [coin({ id: 'unknown', current_price: null }), coin({ id: 'known' })]

    expect(ids(filterAndSort(withNull, BASE))).toEqual(['known', 'unknown'])
    expect(ids(filterAndSort(withNull, { ...BASE, direction: 'desc' }))).toEqual([
      'known',
      'unknown',
    ])
  })

  it('does not mutate the input', () => {
    const original = [...COINS]
    filterAndSort(COINS, { ...BASE, direction: 'desc' })
    expect(COINS).toEqual(original)
  })
})

describe('formatPrice', () => {
  it('keeps sub-cent coins readable instead of rounding them to zero', () => {
    const formatted = formatPrice(0.000012, 'usd')
    expect(formatted).toContain('0.000012')
    expect(formatted).not.toContain('0.00 ')
  })

  it('shows two decimals for ordinary prices', () => {
    expect(formatPrice(108_000, 'usd')).toContain('108,000.00')
  })

  it('names the currency so usd and aud cannot be confused', () => {
    expect(formatPrice(1, 'usd')).toContain('USD')
    expect(formatPrice(1, 'aud')).toContain('AUD')
  })

  it('renders a dash rather than NaN when the price is missing', () => {
    expect(formatPrice(null, 'usd')).toBe(EMPTY)
  })
})

describe('formatPercent', () => {
  it('always shows the sign', () => {
    expect(formatPercent(2.41)).toBe('+2.41%')
    expect(formatPercent(-0.15)).toBe('-0.15%')
  })

  it('renders a dash for coins with no 24h history', () => {
    expect(formatPercent(null)).toBe(EMPTY)
  })
})

describe('directionOf', () => {
  it('reports up and down', () => {
    expect(directionOf(2.41)).toBe('up')
    expect(directionOf(-0.15)).toBe('down')
  })

  it('is flat when the change rounds away, so no arrow contradicts "0.00%"', () => {
    expect(formatPercent(-0.0004)).toBe('0.00%')
    expect(directionOf(-0.0004)).toBe('flat')
    expect(directionOf(0.0004)).toBe('flat')
  })

  it('is null when unknown, which is not the same as flat', () => {
    expect(directionOf(null)).toBeNull()
  })
})
