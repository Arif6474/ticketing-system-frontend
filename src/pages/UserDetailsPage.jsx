import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUser, deactivateUser, deleteUser, forcePasswordReset } from '../api/users';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [actionError, setActionError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const isAppAdmin = currentUser?.role === 'APP_ADMIN';
  const isClientAdmin = currentUser?.role === 'CLIENT_ADMIN';
  const canManageUsers = isAppAdmin || isClientAdmin;

  const {
    data: targetUser,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  });

  const handleDeactivate = async () => {
    if (!window.confirm(`Deactivate user "${targetUser?.email}"?`)) return;
    setActionError('');
    setSuccessMsg('');
    try {
      await deactivateUser(id);
      refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to deactivate user.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete user "${targetUser?.email}"?`)) return;
    setActionError('');
    setSuccessMsg('');
    try {
      await deleteUser(id);
      navigate('/users');
    } catch (err) {
      setActionError(err.message || 'Failed to delete user.');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setActionError('Password must be at least 8 characters long.');
      return;
    }
    setResettingPassword(true);
    setActionError('');
    setSuccessMsg('');
    try {
      await forcePasswordReset(id, newPassword);
      setSuccessMsg('Password successfully reset.');
      setNewPassword('');
    } catch (err) {
      setActionError(err.message || 'Failed to reset password.');
    } finally {
      setResettingPassword(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading user account details..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Error Loading User"
        message={error?.message || 'Failed to load user account.'}
        onRetry={refetch}
      />
    );
  }

  if (!targetUser) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-300">User not found.</p>
        <div className="mt-4">
          <Link to="/users">
            <Button variant="secondary">Back to Users</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const fullName = [targetUser.firstName, targetUser.lastName].filter(Boolean).join(' ') || targetUser.email;

  return (
    <div className="space-y-6">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Link
            to="/users"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 mb-2"
          >
            &larr; Back to Users
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100">{fullName}</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              {targetUser.role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canManageUsers && (
            <>
              <Link to={`/users/${id}/edit`}>
                <Button variant="secondary" size="sm">
                  Edit User
                </Button>
              </Link>
              {targetUser.isActive && (
                <Button variant="secondary" size="sm" onClick={handleDeactivate}>
                  Deactivate
                </Button>
              )}
            </>
          )}

          {isAppAdmin && (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete User
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
          {actionError}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
          {successMsg}
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                    Email Address
                  </span>
                  <span className="font-mono text-slate-200 text-sm">{targetUser.email}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                    Account Status
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      targetUser.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {targetUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                    Organization
                  </span>
                  <span className="text-slate-200 font-medium">
                    {targetUser.organization?.name || 'Internal / None'}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                    Mobile
                  </span>
                  <span className="text-slate-300">{targetUser.mobile || '—'}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                    Designation
                  </span>
                  <span className="text-slate-300">{targetUser.designation || '—'}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                    Office Location
                  </span>
                  <span className="text-slate-300">{targetUser.office || '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Force Password Reset (Admin Action) */}
        {canManageUsers && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Force Password Reset</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Minimum 8 characters..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={resettingPassword}
                  >
                    Reset Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDetailsPage;
