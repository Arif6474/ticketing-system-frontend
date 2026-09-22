import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-2xl text-indigo-400 mb-4 shadow-xl">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-100">Page Not Found</h1>
      <p className="mt-2 text-xs text-slate-400 max-w-sm">
        The requested page does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
