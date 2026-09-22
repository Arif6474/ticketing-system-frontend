import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getIssue, deleteIssue, updateIssueStage } from '../api/issues';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const STAGE_OPTIONS = [
  'SUBMITTED',
  'RECEIVED',
  'UNDER_DEVELOPMENT',
  'TESTING',
  'DEPLOYED',
  'DECLINED',
  'RESOLVED',
];

export function IssueDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [actionError, setActionError] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);

  const {
    data: issue,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => getIssue(id),
    enabled: Boolean(id),
  });

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }
    setActionError('');
    try {
      await deleteIssue(id);
      navigate('/issues');
    } catch (err) {
      setActionError(err.message || 'Failed to delete issue.');
    }
  };

  const handleStageChange = async (newStage) => {
    if (!newStage || newStage === issue.stage) return;
    setUpdatingStage(true);
    setActionError('');
    try {
      await updateIssueStage(id, newStage);
      refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to update issue stage.');
    } finally {
      setUpdatingStage(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading issue details..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Error Loading Issue"
        message={error?.message || 'Failed to load issue details.'}
        onRetry={refetch}
      />
    );
  }

  if (!issue) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-300">Issue not found.</p>
        <div className="mt-4">
          <Link to="/issues">
            <Button variant="secondary">Back to Issues</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Link
            to="/issues"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 mb-2"
          >
            &larr; Back to Issues
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">{issue.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/issues/${id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit Issue
            </Button>
          </Link>

          {(user?.role === 'APP_ADMIN' || user?.role === 'CLIENT_ADMIN') && (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete Issue
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
          {actionError}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Title & Description */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans">
                {issue.description}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Metadata & Stage Transition */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Type
                </span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-slate-200">
                  {issue.type}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Priority
                </span>
                <span
                  className={`px-2 py-1 rounded font-mono font-semibold ${
                    issue.priority === 'URGENT' || issue.priority === 'HIGH'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {issue.priority}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Current Stage
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 font-mono">
                    {issue.stage?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Change Stage
                </span>
                <select
                  value={issue.stage || ''}
                  disabled={updatingStage}
                  onChange={(e) => handleStageChange(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  {STAGE_OPTIONS.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Verification Status
                </span>
                <span
                  className={`px-2 py-1 rounded font-mono ${
                    issue.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : issue.verificationStatus === 'REJECTED'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {issue.verificationStatus}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Project
                  </span>
                  <span className="text-slate-200 font-medium">{issue.projectName || '—'}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Module
                  </span>
                  <span className="text-slate-200 font-medium">{issue.moduleName || '—'}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Reporter
                  </span>
                  <span className="text-slate-200 font-medium">{issue.reporterName || issue.reporterEmail || '—'}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Created At
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : '—'}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Updated At
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default IssueDetailsPage;
