import type { Currency } from '../api/coingecko'
import { formatPrice } from '../lib/format'

const WIDTH = 720
const HEIGHT = 240
const PADDING_Y = 12

interface PriceChartProps {
  /** [unixMillis, price] pairs, oldest first. */
  points: [number, number][]
  currency: Currency
  days: number
}

/**
 * A plain SVG line chart.
 *
 * A charting library would add well over 100kB to a twenty-card dashboard for
 * a single static series, so the path is computed directly. Interactivity
 * (hover readout, zoom) is where a library would start to earn its place.
 */
export function PriceChart({ points, currency, days }: PriceChartProps) {
  if (points.length < 2) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Not enough data to chart.</p>
  }

  const prices = points.map(([, price]) => price)
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const first = prices[0]
  const last = prices[prices.length - 1]
  const rising = last >= first

  const firstTime = points[0][0]
  const span = points[points.length - 1][0] - firstTime || 1
  // A perfectly flat series would divide by zero, so it renders down the middle.
  const range = high - low

  const toX = (time: number) => ((time - firstTime) / span) * WIDTH
  const toY = (price: number) =>
    range === 0
      ? HEIGHT / 2
      : HEIGHT - PADDING_Y - ((price - low) / range) * (HEIGHT - PADDING_Y * 2)

  const line = points.map(([time, price]) => `${toX(time)},${toY(price)}`).join(' ')
  const area = `${toX(firstTime)},${HEIGHT} ${line} ${WIDTH},${HEIGHT}`
  const stroke = rising ? 'var(--color-up)' : 'var(--color-down)'
  const gradientId = 'price-chart-fill'

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${days} day price trend, ${rising ? 'up' : 'down'} from ${formatPrice(
          first,
          currency,
        )} to ${formatPrice(last, currency)}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${gradientId})`} />
        <polyline
          points={line}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          // Keeps the stroke 2px however the viewBox is scaled.
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Low {formatPrice(low, currency)}</span>
        <span>{days} day range</span>
        <span>High {formatPrice(high, currency)}</span>
      </figcaption>
    </figure>
  )
}
