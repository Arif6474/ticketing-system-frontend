import React from 'react';
import useAuth from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export function DashboardPage() {
  const { user } = useAuth();

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User'
    : 'User';

  const organizationName = user?.organization?.name || 'Internal Platform (No Org)';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
          Active Session
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Welcome back, {fullName}!
        </h1>
        <p className="mt-2 text-slate-400 text-sm max-w-2xl">
          You are authenticated into the Internal Ticketing System.
        </p>
      </div>

      {/* Authenticated User Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div>
              <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Full Name
              </span>
              <span className="font-semibold text-slate-100">{fullName}</span>
            </div>

            <div>
              <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </span>
              <span className="font-mono text-slate-200 text-xs">{user?.email || 'N/A'}</span>
            </div>

            <div>
              <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Assigned Role
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono">
                {user?.role || 'N/A'}
              </span>
            </div>

            <div>
              <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Organization
              </span>
              <span className="text-slate-200">{organizationName}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
