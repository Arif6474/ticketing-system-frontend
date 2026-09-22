import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getUsers, deactivateUser, deleteUser } from '../api/users';
import { getOrganizations } from '../api/organizations';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const ROLES = ['APP_ADMIN', 'CLIENT_ADMIN', 'CLIENT_USER'];

export function UsersPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [actionError, setActionError] = useState('');

  const isAppAdmin = user?.role === 'APP_ADMIN';
  const isClientAdmin = user?.role === 'CLIENT_ADMIN';
  const canManageUsers = isAppAdmin || isClientAdmin;

  // Fetch client organizations for APP_ADMIN filter
  const { data: orgsData } = useQuery({
    queryKey: ['organizations-list'],
    queryFn: () => getOrganizations({ page: 0, size: 100 }),
    enabled: isAppAdmin,
  });

  // Fetch paginated users
  const {
    data: usersPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', { page, size, search, roleFilter, activeFilter, organizationId }],
    queryFn: () =>
      getUsers({
        page,
        size,
        search: search || undefined,
        role: roleFilter || undefined,
        active: activeFilter === '' ? undefined : activeFilter === 'true',
        organizationId: organizationId || undefined,
      }),
  });

  const handleDeactivate = async (id, email) => {
    if (!window.confirm(`Are you sure you want to deactivate user "${email}"?`)) {
      return;
    }
    setActionError('');
    try {
      await deactivateUser(id);
      refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to deactivate user.');
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${email}"?`)) {
      return;
    }
    setActionError('');
    try {
      await deleteUser(id);
      refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to delete user.');
    }
  };

  const users = usersPage?.content || [];
  const organizations = orgsData?.content || [];
  const totalPages = usersPage?.totalPages || 0;
  const totalElements = usersPage?.totalElements || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage system administrators, client managers, and user accounts.
          </p>
        </div>
        {canManageUsers && (
          <Link to="/users/new">
            <Button variant="primary">
              + Create User
            </Button>
          </Link>
        )}
      </div>

      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
          {actionError}
        </div>
      )}

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Active Status Filter */}
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {/* Organization Filter (for APP_ADMIN) */}
          {isAppAdmin && (
            <select
              value={organizationId}
              onChange={(e) => {
                setOrganizationId(e.target.value);
                setPage(0);
              }}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {/* Table */}
      {isLoading && <LoadingSpinner message="Loading users list..." />}

      {isError && (
        <ErrorMessage
          title="Error Loading Users"
          message={error?.message || 'Failed to fetch user accounts.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && users.length === 0 && (
        <Card className="p-12 text-center text-slate-400">
          <p className="text-base font-semibold text-slate-200">No users found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or create a new user.
          </p>
        </Card>
      )}

      {!isLoading && !isError && users.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Organization</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => {
                const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-slate-100">
                      <Link
                        to={`/users/${u.id}`}
                        className="hover:text-indigo-400 transition-colors"
                      >
                        {fullName}
                      </Link>
                    </td>

                    <td className="p-4 font-mono text-slate-300 text-xs">{u.email}</td>

                    <td className="p-4 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300">
                      {u.organization?.name || 'Internal / None'}
                    </td>

                    <td className="p-4 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/users/${u.id}`}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                      >
                        View
                      </Link>
                      {canManageUsers && (
                        <>
                          <Link
                            to={`/users/${u.id}/edit`}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium"
                          >
                            Edit
                          </Link>
                          {u.isActive && (
                            <button
                              onClick={() => handleDeactivate(u.id, u.email)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-medium cursor-pointer"
                            >
                              Deactivate
                            </button>
                          )}
                        </>
                      )}
                      {isAppAdmin && (
                        <button
                          onClick={() => handleDelete(u.id, u.email)}
                          className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page <span className="text-slate-200 font-semibold">{page + 1}</span> of{' '}
              <span className="text-slate-200 font-semibold">{totalPages || 1}</span> ({totalElements} total items)
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
