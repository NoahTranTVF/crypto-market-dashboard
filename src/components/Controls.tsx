import { CURRENCIES } from '../api/coingecko'
import type { FilterState } from '../hooks/useFilterState'
import { SORT_KEYS, SORT_LABELS, type SortKey } from '../lib/filterSort'

const FIELD =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50'

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
}: ControlsProps) {
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

      <div className="flex gap-2">
        <div>
          <label htmlFor="coin-sort" className="sr-only">
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
        </div>

        <button
          type="button"
          onClick={() => update({ direction: direction === 'asc' ? 'desc' : 'asc' })}
          className={FIELD}
          aria-label={`Sort ${direction === 'asc' ? 'ascending' : 'descending'}, change to ${
            direction === 'asc' ? 'descending' : 'ascending'
          }`}
        >
          <span aria-hidden="true">{direction === 'asc' ? '↑' : '↓'}</span>
        </button>

        <div>
          <label htmlFor="coin-currency" className="sr-only">
            Display currency
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
      </div>

      {/* Announced to screen readers as the filtered count changes. */}
      <p aria-live="polite" className="sr-only">
        {resultCount} coins shown
      </p>
    </div>
  )
}
