import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getIssues, deleteIssue } from '../api/issues';
import { getProjects } from '../api/projects';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const ISSUE_TYPES = ['BUG', 'ENHANCEMENT', 'NEW_FEATURE'];
const ISSUE_PRIORITIES = ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const ISSUE_STAGES = [
  'SUBMITTED',
  'RECEIVED',
  'UNDER_DEVELOPMENT',
  'TESTING',
  'DEPLOYED',
  'DECLINED',
  'RESOLVED',
];

export function IssuesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [stage, setStage] = useState('');
  const [priority, setPriority] = useState('');
  const [type, setType] = useState('');
  const [actionError, setActionError] = useState('');

  // Fetch projects for filter dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => getProjects({ page: 0, size: 100 }),
  });

  // Fetch paginated issues
  const {
    data: issuesPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['issues', { page, size, search, projectId, stage, priority, type }],
    queryFn: () =>
      getIssues({
        page,
        size,
        search: search || undefined,
        projectId: projectId || undefined,
        stage: stage || undefined,
        priority: priority || undefined,
        type: type || undefined,
      }),
  });

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete issue "${title}"?`)) {
      return;
    }
    setActionError('');
    try {
      await deleteIssue(id);
      refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to delete issue');
    }
  };

  const projects = projectsData?.content || [];
  const issues = issuesPage?.content || [];
  const totalPages = issuesPage?.totalPages || 0;
  const totalElements = issuesPage?.totalElements || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Issues</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage and track software defect reports and feature requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/issues/kanban">
            <Button variant="secondary">
              Kanban View
            </Button>
          </Link>
          <Link to="/issues/new">
            <Button variant="primary">
              + Create Issue
            </Button>
          </Link>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
          {actionError}
        </div>
      )}

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Search */}
          <Input
            placeholder="Search title or text..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />

          {/* Project Filter */}
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

          {/* Stage Filter */}
          <select
            value={stage}
            onChange={(e) => {
              setStage(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Stages</option>
            {ISSUE_STAGES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            {ISSUE_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Types</option>
            {ISSUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Main Content Area */}
      {isLoading && <LoadingSpinner message="Loading issues..." />}

      {isError && (
        <ErrorMessage
          title="Error Loading Issues"
          message={error?.message || 'Could not fetch issues list.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && issues.length === 0 && (
        <Card className="p-12 text-center text-slate-400">
          <p className="text-base font-semibold text-slate-200">No issues found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search filters or create a new issue.
          </p>
        </Card>
      )}

      {!isLoading && !isError && issues.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Project</th>
                <th className="p-4">Reporter</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-semibold text-slate-100 max-w-xs truncate">
                    <Link
                      to={`/issues/${issue.id}`}
                      className="hover:text-indigo-400 transition-colors"
                    >
                      {issue.title}
                    </Link>
                  </td>

                  <td className="p-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                      {issue.type}
                    </span>
                  </td>

                  <td className="p-4 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        issue.priority === 'URGENT' || issue.priority === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {issue.priority}
                    </span>
                  </td>

                  <td className="p-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {issue.stage?.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="p-4 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        issue.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : issue.verificationStatus === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {issue.verificationStatus}
                    </span>
                  </td>

                  <td className="p-4 text-slate-300">{issue.projectName || '—'}</td>

                  <td className="p-4 text-slate-400">{issue.reporterName || issue.reporterEmail || '—'}</td>

                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : '—'}
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <Link
                      to={`/issues/${issue.id}`}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                    >
                      View
                    </Link>
                    <Link
                      to={`/issues/${issue.id}/edit`}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium"
                    >
                      Edit
                    </Link>
                    {(user?.role === 'APP_ADMIN' || user?.role === 'CLIENT_ADMIN') && (
                      <button
                        onClick={() => handleDelete(issue.id, issue.title)}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
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

export default IssuesPage;
