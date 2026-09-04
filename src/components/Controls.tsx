import {
  CURRENCIES,
  SORT_KEYS,
  SORT_LABELS,
  type SortDirection,
  type SortKey,
} from '@/shared/constants'
import type { FilterState } from '@/hooks/useFilterState'

const FIELD =
  'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50'

/** Lowercase: these only ever appear inside a sentence. */
const DIRECTION_LABELS: Record<SortDirection, string> = {
  asc: 'ascending',
  desc: 'descending',
}

interface ControlsProps extends FilterState {
  update: (patch: Partial<FilterState>) => void
  resultCount: number
}

export function Controls({
  query,
  sortKey,
  direction,
  currency,
  update,
  resultCount,
}: Readonly<ControlsProps>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="coin-search" className="sr-only">
          Search coins by name or symbol
        </label>
        <input
          id="coin-search"
          type="search"
          value={query}
          onChange={(event) => update({ query: event.target.value })}
          placeholder="Search by name or symbol…"
          autoComplete="off"
          className={`${FIELD} w-full`}
        />
      </div>

      {/* Two labelled groups, separated by a wider gap than the controls inside
          each one: without that, "USD" reads as part of the sort sentence. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          {/* Reads as a sentence completed by the value: "Prices in AUD". */}
          <label htmlFor="coin-currency" className="text-sm text-slate-500 dark:text-slate-400">
            Prices in
          </label>
          <select
            id="coin-currency"
            value={currency}
            onChange={(event) => update({ currency: event.target.value as FilterState['currency'] })}
            className={FIELD}
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Visible, because "24h change" alone does not say it is a sort field. */}
          <label htmlFor="coin-sort" className="text-sm text-slate-500 dark:text-slate-400">
            Sort by
          </label>
          <select
            id="coin-sort"
            value={sortKey}
            onChange={(event) => update({ sortKey: event.target.value as SortKey })}
            className={FIELD}
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>

          <div className="group relative">
            <button
              type="button"
              onClick={() => update({ direction: direction === 'asc' ? 'desc' : 'asc' })}
              className={`${FIELD} flex w-10 items-center justify-center`}
              aria-label={`Sorted by ${SORT_LABELS[sortKey]}, ${DIRECTION_LABELS[direction]}. Activate to sort ${
                DIRECTION_LABELS[direction === 'asc' ? 'desc' : 'asc']
              }.`}
            >
              <span aria-hidden="true">{direction === 'asc' ? '↑' : '↓'}</span>
            </button>

            {/* Not the native `title`, which waits about a second, cannot be
                styled and never appears on keyboard focus. Hidden from assistive
                tech because the button's aria-label already says the same thing. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-full right-0 z-10 mt-1 hidden rounded-md border border-slate-200 bg-white px-2 py-1 text-xs whitespace-nowrap text-slate-600 shadow-sm group-focus-within:block group-hover:block dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Sorted by {SORT_LABELS[sortKey]}, {DIRECTION_LABELS[direction]}
            </span>
          </div>
        </div>
      </div>

      {/* Announced to screen readers as the filtered count changes. */}
      <p aria-live="polite" className="sr-only">
        {resultCount} coins shown
      </p>
    </div>
  )
}
