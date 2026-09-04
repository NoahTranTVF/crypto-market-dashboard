import { useId, useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { Currency } from '@/shared/constants'
import { formatAxisPrice, formatDay, formatDayTime, formatPrice } from '@/shared/lib/format'

const HEIGHT = 240

/** Classes, not `stroke`/`fill` props: a class beats Recharts' presentation attributes. */
const AXIS_TICK = { className: 'fill-slate-500 text-[11px] dark:fill-slate-400' }
const AXIS_LINE = { className: 'stroke-slate-200 dark:stroke-slate-800' }

interface PricePoint {
  time: number
  price: number
}

interface ChartTooltipProps {
  /** Injected by Recharts when it clones this element. */
  active?: boolean
  payload?: { payload: PricePoint }[]
  currency: Currency
}

function ChartTooltip({ active, payload, currency }: ChartTooltipProps) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-slate-500 dark:text-slate-400">{formatDayTime(point.time)}</p>
      <p className="mt-0.5 font-semibold text-slate-900 tabular-nums dark:text-slate-50">
        {formatPrice(point.price, currency)}
      </p>
    </div>
  )
}

interface PriceChartProps {
  /** [unixMillis, price] pairs, oldest first. */
  points: [number, number][]
  currency: Currency
  days: number
}

/**
 * The coin's price history. Colour reaches the SVG through `currentColor`
 * because a gradient stop sits in `<defs>` and cannot inherit a utility class.
 */
export function PriceChart({ points, currency, days }: PriceChartProps) {
  const gradientId = useId()
  const data = useMemo<PricePoint[]>(
    () => points.map(([time, price]) => ({ time, price })),
    [points],
  )

  const first = data[0]
  const last = data[data.length - 1]

  if (data.length < 2 || !first || !last) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Not enough data to chart.</p>
  }

  const prices = data.map((point) => point.price)
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const rising = last.price >= first.price

  return (
    <figure className="m-0">
      <div
        className={rising ? 'text-up' : 'text-down'}
        role="img"
        aria-label={`${days} day price trend, ${rising ? 'up' : 'down'} from ${formatPrice(
          first.price,
          currency,
        )} to ${formatPrice(last.price, currency)}`}
      >
        <ResponsiveContainer width="100%" height={HEIGHT}>
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatDay}
              tick={AXIS_TICK}
              axisLine={AXIS_LINE}
              tickLine={false}
              minTickGap={48}
            />
            <YAxis
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatAxisPrice}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              orientation="right"
              width={64}
            />
            <Tooltip content={<ChartTooltip currency={currency} />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="currentColor"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              // ~168 hourly points over 7 days; a dot per point would be noise.
              dot={false}
              activeDot={{ r: 3, fill: 'currentColor', strokeWidth: 0 }}
              // A redrawing chart on a live board reads as movement that did not happen.
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Low {formatPrice(low, currency)}</span>
        <span>{days} day range</span>
        <span>High {formatPrice(high, currency)}</span>
      </figcaption>
    </figure>
  )
}
