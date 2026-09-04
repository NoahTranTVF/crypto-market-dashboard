import { Link } from 'react-router-dom'

/**
 * Anything the router does not recognise.
 *
 * The host rewrites unknown paths to index.html so that deep links survive a
 * reload, which means the router — not the host — has to answer for a URL that
 * matches no route. Without this the app mounts and renders nothing.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-semibold text-slate-900 dark:text-slate-50">Page not found</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          That address does not match anything in this app.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Back to market
        </Link>
      </div>
    </main>
  )
}
