import App from '@/App'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { RouteSkeleton } from '@/components/States'
import { queryClient } from '@/shared/lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import '@/index.css'

// Split at the route: only the detail page pulls in the chart library.
// Fast Refresh cannot apply to this entry file, which exports nothing.
// oxlint-disable-next-line react/only-export-components
const CoinDetail = lazy(() => import('@/routes/CoinDetail'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<RouteSkeleton />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/coin/:id" element={<CoinDetail />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)
