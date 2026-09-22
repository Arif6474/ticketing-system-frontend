import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export function Sidebar() {
  const { user } = useAuth();
  const canVerify = user?.role === 'APP_ADMIN' || user?.role === 'CLIENT_ADMIN';

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Issues', path: '/issues' },
    { name: 'Projects', path: '/projects' },
    { name: 'Modules', path: '/modules' },
    { name: 'Users', path: '/users' },
    ...(canVerify ? [{ name: 'Verification', path: '/verification' }] : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* App Logo */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
          T
        </div>
        <div>
          <h1 className="font-semibold text-sm text-slate-100 tracking-tight leading-none">
            Ticketing System
          </h1>
          <span className="text-[10px] text-slate-500 font-mono">Internal Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>Status</span>
          <span className="text-emerald-400 font-medium">Authenticated</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
