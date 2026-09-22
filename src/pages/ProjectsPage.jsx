import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getProjects, deleteProject } from '../api/projects';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export function ProjectsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [actionError, setActionError] = useState('');

  const {
    data: projectsPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects', { page, size, search, activeFilter }],
    queryFn: () =>
      getProjects({
        page,
        size,
        search: search || undefined,
        active: activeFilter === '' ? undefined : activeFilter === 'true',
      }),
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete project "${name}"?`)) {
      return;
    }
    setActionError('');
    try {
      await deleteProject(id);
      refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to delete project.');
    }
  };

  const projects = projectsPage?.content || [];
  const totalPages = projectsPage?.totalPages || 0;
  const totalElements = projectsPage?.totalElements || 0;

  const isAppAdmin = user?.role === 'APP_ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage application development projects and client organization assignments.
          </p>
        </div>
        {isAppAdmin && (
          <Link to="/projects/new">
            <Button variant="primary">
              + Create Project
            </Button>
          </Link>
        )}
      </div>

      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
          {actionError}
        </div>
      )}

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search name or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />

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
        </div>
      </Card>

      {/* Content Table */}
      {isLoading && <LoadingSpinner message="Loading projects..." />}

      {isError && (
        <ErrorMessage
          title="Error Loading Projects"
          message={error?.message || 'Could not fetch projects list.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <Card className="p-12 text-center text-slate-400">
          <p className="text-base font-semibold text-slate-200">No projects found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or create a new project.
          </p>
        </Card>
      )}

      {!isLoading && !isError && projects.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Project Name</th>
                <th className="p-4">Code</th>
                <th className="p-4">Organization</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-semibold text-slate-100">
                    <Link
                      to={`/projects/${proj.id}`}
                      className="hover:text-indigo-400 transition-colors"
                    >
                      {proj.name}
                    </Link>
                  </td>

                  <td className="p-4 font-mono text-indigo-400 font-medium">
                    {proj.shortCode}
                  </td>

                  <td className="p-4 text-slate-200">
                    {proj.organization?.name || '—'}
                  </td>

                  <td className="p-4 text-slate-400 max-w-xs truncate">
                    {proj.description || '—'}
                  </td>

                  <td className="p-4 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        proj.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {proj.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : '—'}
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <Link
                      to={`/projects/${proj.id}`}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                    >
                      View
                    </Link>
                    {isAppAdmin && (
                      <>
                        <Link
                          to={`/projects/${proj.id}/edit`}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(proj.id, proj.name)}
                          className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-medium cursor-pointer"
                        >
                          Delete
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

export default ProjectsPage;
