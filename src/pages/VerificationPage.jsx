import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getVerificationQueue, updateVerificationStatus } from '../api/verification';
import { getProjects } from '../api/projects';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export function VerificationPage() {
  const { user } = useAuth();

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const isAppAdmin = user?.role === 'APP_ADMIN';
  const isClientAdmin = user?.role === 'CLIENT_ADMIN';
  const canVerify = isAppAdmin || isClientAdmin;

  // Fetch projects for filter dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => getProjects({ page: 0, size: 100 }),
  });

  // Fetch verification queue
  const {
    data: queuePage,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['verification-queue', { page, size, search, projectId }],
    queryFn: () =>
      getVerificationQueue({
        page,
        size,
        search: search || undefined,
        projectId: projectId || undefined,
      }),
  });

  const handleVerificationDecision = async (id, status, title) => {
    if (status === 'REJECTED') {
      if (!window.confirm(`Are you sure you want to REJECT verification for issue "${title}"?`)) {
        return;
      }
    }
    setProcessingId(id);
    setActionError('');
    setSuccessMsg('');

    try {
      await updateVerificationStatus(id, status);
      setSuccessMsg(
        `Issue "${title}" has been successfully ${status === 'VERIFIED' ? 'VERIFIED' : 'REJECTED'}.`
      );
      refetch();
    } catch (err) {
      setActionError(err.message || `Failed to update verification status.`);
    } finally {
      setProcessingId(null);
    }
  };

  const projects = projectsData?.content || [];
  const items = queuePage?.content || [];
  const totalPages = queuePage?.totalPages || 0;
  const totalElements = queuePage?.totalElements || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Issue Verification Queue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and verify reported issues before active development begins.
          </p>
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

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Search issue title or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />

          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Main Table */}
      {isLoading && <LoadingSpinner message="Loading verification queue..." />}

      {isError && (
        <ErrorMessage
          title="Error Loading Verification Queue"
          message={error?.message || 'Could not fetch verification queue.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <Card className="p-12 text-center text-slate-400">
          <p className="text-base font-semibold text-slate-200">Verification Queue Empty</p>
          <p className="text-xs text-slate-500 mt-1">
            There are currently no issues pending verification.
          </p>
        </Card>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Issue Title</th>
                <th className="p-4">Project</th>
                <th className="p-4">Module</th>
                <th className="p-4">Reporter</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-semibold text-slate-100 max-w-xs truncate">
                    <Link
                      to={`/issues/${issue.id}`}
                      className="hover:text-indigo-400 transition-colors"
                    >
                      {issue.title}
                    </Link>
                  </td>

                  <td className="p-4 text-slate-300">{issue.projectName || '—'}</td>

                  <td className="p-4 text-slate-300">{issue.moduleName || '—'}</td>

                  <td className="p-4 text-slate-400">{issue.reporterName || issue.reporterEmail || '—'}</td>

                  <td className="p-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {issue.stage?.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="p-4 font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                      {issue.verificationStatus}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : '—'}
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <Link
                      to={`/issues/${issue.id}`}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                    >
                      View
                    </Link>
                    {canVerify && (
                      <>
                        <button
                          disabled={processingId === issue.id}
                          onClick={() => handleVerificationDecision(issue.id, 'VERIFIED', issue.title)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Verify
                        </button>
                        <button
                          disabled={processingId === issue.id}
                          onClick={() => handleVerificationDecision(issue.id, 'REJECTED', issue.title)}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
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

export default VerificationPage;
