# Decisions

The calls most likely to come up in review. Setup and structure are in the
[README](../README.md).

## Data fetching

**Poll every 60 seconds, not faster.** The free tier's own data is one to two
minutes behind — a request returned a payload stamped `09:25:30` at `09:27:23`.
Polling twice as often would re-fetch identical bytes against a limit of
roughly 5–15 requests per minute. A refetch on window focus covers the gap left
by browsers throttling timers in background tabs.

**4xx is never retried.** A 429 means we are already asking too often, so
retrying deepens it; a 404 cannot succeed. `ApiError` carries the HTTP status so
the retry predicate can separate those from 5xx, which retry three times with
backoff capped at 30s.

**A rate limit reaches the browser as a status-less failure.** CoinGecko's 429
carries no `access-control-allow-origin` header (its 200s do), so the browser
blocks the response and `fetch` rejects with a bare `TypeError` — a rate limit
and a dropped connection are the same event at that layer. `ApiError` records
it as status 0 and the policy retries it *once*: three backed-off retries would
report the failure seven seconds late and deepen the limit it was meant to
avoid. `ApiError` is matched by name rather than `instanceof`, because a module
evaluated twice yields two classes and an `instanceof` that fails silently —
which is what happens under Vite's HMR, so the bug would appear only in
development.

**A failed refetch never unmounts the data.** The full-screen error appears
only when there has never been a successful fetch; otherwise the board keeps
the last prices and the status line degrades. A slightly old price with an
honest staleness label beats nothing. An error boundary covers the other half —
a render crash would blank the board more completely than any fetch failure.

**No backend proxy.** CoinGecko's public endpoints send
`access-control-allow-origin: *` and need no key, so a proxy would add a
deployment target to hide nothing. With an API key that flips immediately: the
key would have to move server-side.

**Response shapes are asserted, not validated.** Nothing checks the payload at
runtime. A schema library would catch CoinGecko changing a field, but would
also fail the whole board over a field we never read. Instead every numeric
field is typed nullable and every formatter returns a dash rather than `NaN`,
so a missing value degrades one cell. With more endpoints, this should become a
parsed boundary.

## Money

**The currency is always named** — `USD 77,607.00`, not `$77,607.00`. With two
dollar currencies selectable, a bare dollar sign is ambiguous.

**Prices below $1 widen to eight decimals,** or SHIB renders as `$0.00`.
Direction comes from the *rounded* value, so a `-0.0004%` change that displays
as `0.00%` never sits beside a red arrow.

## Scope

**No pagination.** The brief pins `per_page=20`, so paginating one page would
be decoration.

**Filtering and sorting run client-side** over 20 items, in one `useMemo`. No
debounce — at this size it would be cargo cult. Past a few hundred rows both
flip: sort server-side and virtualise. Filtering is deliberately not done in
React Query's `select`, whose key does not include the search text.

**Tests cover the pure logic** — filter, sort, format, retry policy. Asserting
that a card renders a `<div>` costs maintenance and proves nothing.

## What I'd do next

1. **Replace polling with a WebSocket feed** — reconnect with backoff, resync
   from a snapshot, discard out-of-order messages by sequence number, and batch
   renders so a fast feed cannot thrash the UI.
2. **Virtualise the grid** and sort server-side once the list outgrows a few
   hundred rows.
3. **MSW for network-level tests** — assert the loading, error, 429 and offline
   paths against a mocked transport rather than trusting them by inspection.
4. **Persist the last successful payload** so a cold start while offline still
   shows something.
