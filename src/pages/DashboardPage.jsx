import React from 'react';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export function DashboardPage() {
  const { data: health, isLoading, isError, error, refetch } = useHealthCheck();

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Frontend Foundation Ready
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Internal Ticketing System
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-2xl">
              Production-ready frontend architecture initialized with React 18, Vite, React Router, TanStack Query, React Hook Form, and Tailwind CSS.
            </p>
          </div>

          {/* Backend Health Check Widget */}
          <div className="w-full md:w-auto bg-slate-900/80 border border-slate-800 rounded-xl p-5 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Backend Connection Status
              </span>
              <button
                onClick={() => refetch()}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {isLoading && <LoadingSpinner size="sm" />}

            {isError && (
              <ErrorMessage
                title="Backend Connection Failed"
                message={error?.message || 'Unable to connect to backend service.'}
              />
            )}

            {health && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">GET /api/health</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 font-bold font-mono">200 OK</span>
                </div>
                <div className="mt-2 font-mono text-slate-300 text-[11px]">
                  Response: {JSON.stringify(health)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tech Stack Components Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <div className="text-xs font-mono text-indigo-400 mb-1">State & Fetching</div>
            <CardTitle>TanStack Query v5</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Global QueryClient configured with caching, error handling, and auto retries.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-xs font-mono text-indigo-400 mb-1">Routing & Layout</div>
            <CardTitle>React Router v7</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Protected and public route guards with layout wrapping and token check.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-xs font-mono text-indigo-400 mb-1">Form Handling</div>
            <CardTitle>React Hook Form</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Clean form validation and submission state handling built into UI.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-xs font-mono text-indigo-400 mb-1">HTTP Client</div>
            <CardTitle>Axios API Client</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Configured with Bearer token interceptor and standard error parser.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
