import { Component, type ErrorInfo, type ReactNode } from 'react'

import { ErrorState } from './States'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Render-time crashes, which the query layer cannot see and which would blank
 * the board more completely than any fetch failure. Recovery is a reload: a
 * render error is deterministic, so re-rendering the same state throws again.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Stands in for a deployed app's error reporter.
    console.error('Unhandled render error', error, info.componentStack)
  }

  render() {
    const { error } = this.state

    if (!error) return this.props.children

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-md">
          <ErrorState
            title="Something went wrong"
            message={error.message}
            actionLabel="Reload the page"
            onRetry={() => window.location.reload()}
            isRetrying={false}
          />
        </div>
      </main>
    )
  }
}
