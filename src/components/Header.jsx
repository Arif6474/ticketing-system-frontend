import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/auth';

export function Header() {
  const navigate = useNavigate();
  const user = getUser() || { fullName: 'Demo User', role: 'APP_ADMIN', email: 'admin@example.com' };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-slate-900/60 border-b border-slate-800 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Title / Breadcrumb Placeholder */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Internal Ticketing Platform
        </span>
        <span className="text-slate-700">/</span>
        <span className="text-xs font-medium text-indigo-400">Foundation Workspace</span>
      </div>

      {/* User Info & Logout Placeholder */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-right">
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">{user.fullName}</div>
            <div className="text-[10px] text-slate-400 font-mono">{user.role}</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
            {user.fullName ? user.fullName.charAt(0) : 'U'}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
