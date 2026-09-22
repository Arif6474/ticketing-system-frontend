import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'User';
  
  const displayRole = user?.role || 'USER';

  return (
    <header className="h-16 bg-slate-900/60 border-b border-slate-800 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Platform Title */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Internal Ticketing System
        </span>
      </div>

      {/* User Info & Logout Button */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-right">
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">{displayName}</div>
            <div className="text-[10px] text-indigo-400 font-mono font-medium">{displayRole}</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
            {displayName.charAt(0).toUpperCase()}
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
