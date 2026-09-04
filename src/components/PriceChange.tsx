import { directionOf, formatPercent } from '@/shared/lib/format'

const STYLES = {
  up: 'text-up',
  down: 'text-down',
  flat: 'text-slate-500 dark:text-slate-400',
} as const

const ARROWS = { up: '▲', down: '▼', flat: '' } as const

/** Arrow and sign carry the direction independently of colour (WCAG 1.4.1). */
export function PriceChange({ value }: Readonly<{ value: number | null }>) {
  const direction = directionOf(value)
  const text = formatPercent(value)

  if (direction == null) {
    return (
      <span className="text-slate-500 dark:text-slate-400" title="No 24h data yet">
        {text}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium ${STYLES[direction]}`}>
      <span aria-hidden="true">{ARROWS[direction]}</span>
      <span>{text}</span>
      <span className="sr-only">over 24 hours</span>
    </span>
  )
}
