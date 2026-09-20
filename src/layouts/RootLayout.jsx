import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              T
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-100">
              Internal Ticketing System
            </span>
            <span className="ml-2 px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-indigo-400 border border-indigo-500/20">
              Foundation
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Branch: <code className="text-emerald-400 bg-slate-800 px-2 py-0.5 rounded font-mono">feature/project-setup</code></span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/30 py-4 text-center text-xs text-slate-500">
        Internal Ticketing System &copy; 2026. Project Setup Phase.
      </footer>
    </div>
  );
}
