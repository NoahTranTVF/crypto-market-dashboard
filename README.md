# Crypto Market Dashboard

A live market board for the top 20 cryptocurrencies by market cap, built with React, TypeScript and TanStack Query.

> **Live demo:** _not yet deployed — see [Deploying](#deploying)._

![Dashboard](docs/dashboard.png)

## Setup

Requires Node 20 or newer.

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build |
| `npm test` | Run the unit tests |
| `npm run lint` | Lint with oxlint |

No API key or environment variables are needed. The app calls CoinGecko's free
public API directly from the browser.

## What it does

- **Live board** — prices refresh every 60 seconds and flash green or red when
  they move, so the grid behaves like a market board rather than a table that
  silently rewrites itself.
- **Never blanks** — once prices have loaded they stay on screen. A failed
  refetch, a rate limit or a dropped connection degrades the status line
  instead of replacing the data with an error page.
- **Search and sort** — filter by name or symbol, sort by market cap, price or
  24h change in either direction. State lives in the URL, so a filtered view is
  shareable and survives a reload.
- **USD / AUD** — prices can be shown in either currency.
- **Coin detail** — a 7 day price chart plus 24h high/low, market cap and volume.
- **Light and dark themes**, following the operating system until you choose one.
- **Accessible** — price direction is carried by an arrow and a sign as well as
  colour, controls are labelled, and the feed status is announced politely.

## Tech choices

| Choice | Why |
| --- | --- |
| **Vite + React + TypeScript** | Fast, no framework features needed. There is no server-side rendering requirement and no backend to justify. |
| **TanStack Query** | Caching, retry with backoff, polling, offline pausing and loading/error state are the bulk of this brief. Hand-rolling them would be more code and worse. |
| **React Router** | Two routes, plus `useSearchParams` for filter state. |
| **Tailwind CSS v4** | Responsive grid and dark mode without a config file. |
| **Vitest** | Same toolchain as Vite; no extra configuration. |
| **No charting library** | One static series does not justify 100 kB+. The chart is an SVG path. |

## Architecture

```
src/
  api/coingecko.ts     Typed fetchers and an ApiError carrying the HTTP status
  hooks/               useMarkets, useMarketChart, usePriceTick, useFilterState, useIsOnline
  lib/                 queryClient (cache and retry policy), format, filterSort
  components/          CoinCard, CoinGrid, Controls, FeedStatus, States, PriceChart, ThemeToggle
  routes/CoinDetail    Coin detail page
```

`useMarkets` is the only module that knows the data arrives by polling. Every
component takes plain data as props, so replacing polling with a WebSocket
would mean rewriting one hook and touching no components.

## Tradeoffs

**No backend proxy.** CoinGecko's public endpoints send
`access-control-allow-origin: *` and need no key, so a proxy would add a
deployment target and a failure mode to hide nothing. With an API key, that
changes immediately — the key would have to move server-side.

**Polling at 60 seconds, not faster.** The free tier's own data is one to two
minutes behind: a request returned a payload stamped `09:25:30` at `09:27:23`.
Polling every 30 seconds would re-fetch identical bytes and burn twice the
quota against a limit of roughly 5–15 requests per minute.

**4xx is never retried.** A 429 means we are already asking too often, so
retrying makes it worse; a 404 will never succeed. `ApiError` carries the
status so the retry predicate can tell those apart from network failures and
5xx, which are retried three times with exponential backoff capped at 30s.

**A failed refetch never unmounts the data.** A full-screen error appears only
when there has never been a successful fetch. Showing a slightly old price with
an honest staleness label beats showing nothing.

**Offline state is read from TanStack Query's `onlineManager`,** not from our
own `navigator.onLine` listeners. The library already tracks connectivity to
pause and resume queries; duplicating that would risk the two disagreeing.

**Filtering and sorting run client-side** over a fixed 20 items, in a single
`useMemo`. There is no debounce because at this size it would be cargo cult.
Past a few hundred rows both decisions should flip: sort server-side and
virtualise the list.

**Currency is always named** — `USD 77,607.00`, not `$77,607.00`. With two
dollar currencies selectable, a bare dollar sign is ambiguous, and an ambiguous
price is the one defect a money display cannot afford.

**Prices below $1 widen to eight decimal places.** A fixed two would render
SHIB at `$0.00`. Related: `price_change_percentage_24h` is null for newly
listed coins, and direction is derived from the *rounded* value so a change
displaying as `0.00%` never sits beside a coloured arrow.

**No pagination.** The brief pins `per_page=20`, so paginating a single page
would be decoration. Infinite scroll would mean raising the page size, which
the brief fixes.

**Tests cover the pure logic only** — filtering, sorting, formatting and the
retry policy. Asserting that a card renders a `<div>` costs maintenance and
proves nothing.

## What I'd do next

1. **Replace polling with a WebSocket feed** — reconnect with backoff, resync
   from a snapshot on reconnect, discard out-of-order messages by sequence
   number, and batch renders so a fast feed cannot thrash the UI.
2. **Virtualise the grid** and move sorting server-side once the list outgrows
   a few hundred rows.
3. **MSW for network-level tests** — assert the loading, error, 429 and offline
   paths against a mocked transport rather than trusting them by inspection.
4. **A hover readout on the chart**, which is the point at which a charting
   library starts to pay for itself.
5. **Persist the last successful payload** to `localStorage` so a cold start
   while offline still shows something.

## Deploying

```bash
npx vercel        # or: npm run build && deploy dist/
```

Then replace the demo link at the top of this file.
