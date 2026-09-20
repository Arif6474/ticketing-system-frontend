import { useHealthCheck } from '../hooks/useHealthCheck';

export default function HomePage() {
  const { data: health, isLoading, isError, error, refetch } = useHealthCheck();

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Foundation Initialized
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Internal Ticketing System
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-2xl">
              Greenfield foundation setup complete with Spring Boot 3, React 18, PostgreSQL, and Docker Compose.
            </p>
          </div>

          {/* Health Check Widget */}
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

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-1">
                <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                Checking health...
              </div>
            )}

            {isError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-rose-400 text-xs">
                <p className="font-semibold">Backend Unreachable</p>
                <p className="mt-1 text-slate-400 font-mono text-[11px]">{error?.message || 'Connection failed'}</p>
              </div>
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

      {/* Tech Stack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs font-mono text-indigo-400 mb-1">Backend Framework</div>
          <h3 className="text-lg font-semibold text-white">Spring Boot 3.4</h3>
          <p className="mt-2 text-xs text-slate-400">Java 17+ with Spring Web, Data JPA, and Jakarta Validation.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs font-mono text-indigo-400 mb-1">Frontend Library</div>
          <h3 className="text-lg font-semibold text-white">React 18 + Vite</h3>
          <p className="mt-2 text-xs text-slate-400">JavaScript/JSX with React Router v7 & TanStack Query v5.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs font-mono text-indigo-400 mb-1">Primary Database</div>
          <h3 className="text-lg font-semibold text-white">PostgreSQL 16</h3>
          <p className="mt-2 text-xs text-slate-400">Containerized via Docker Compose with volume persistence.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs font-mono text-indigo-400 mb-1">Styling Engine</div>
          <h3 className="text-lg font-semibold text-white">Tailwind CSS v4</h3>
          <p className="mt-2 text-xs text-slate-400">Utility-first styling with modern dark theme tokens.</p>
        </div>
      </div>

      {/* Roadmap Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          Upcoming Feature Branches
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {['Authentication & JWT', 'User & RBAC Management', 'Organizations & Projects', 'Issues & Workflow', 'Kanban (dnd-kit)', 'Comments & Activity', 'R2 Attachments', 'Audit Trail'].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
