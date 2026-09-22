import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getModules, deleteModule, activateModule, deactivateModule } from '../api/modules';
import { getProjects } from '../api/projects';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export function ModulesPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [actionError, setActionError] = useState('');

  const isAppAdmin = user?.role === 'APP_ADMIN';
  const isClientAdmin = user?.role === 'CLIENT_ADMIN';
  const canManageModules = isAppAdmin || isClientAdmin;

  // Fetch Projects for filter
  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => getProjects({ page: 0, size: 100 }),
  });

  // Fetch Modules
  const {
    data: modulesPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['modules', { page, size, search, projectId }],
    queryFn: () =>
      getModules({
        page,
        size,
        search: search || undefined,
        projectId: projectId || undefined,
      }),
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete module "${name}"?`)) {
      return;
    }
    setActionError('');
    try {
      await deleteModule(id);
      refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to delete module.');
    }
  };

  const handleToggleActive = async (id, isActive) => {
    setActionError('');
    try {
      if (isActive) {
        await deactivateModule(id);
      } else {
        await activateModule(id);
      }
      refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to change module activation status.');
    }
  };

  const projects = projectsData?.content || [];
  const modules = modulesPage?.content || [];
  const totalPages = modulesPage?.totalPages || 0;
  const totalElements = modulesPage?.totalElements || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Modules</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage feature modules scoped within projects.
          </p>
        </div>
        {canManageModules && (
          <Link to="/modules/new">
            <Button variant="primary">
              + Create Module
            </Button>
          </Link>
        )}
      </div>

      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Search module name..."
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

      {/* Table */}
      {isLoading && <LoadingSpinner message="Loading modules..." />}

      {isError && (
        <ErrorMessage
          title="Error Loading Modules"
          message={error?.message || 'Could not fetch modules list.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && modules.length === 0 && (
        <Card className="p-12 text-center text-slate-400">
          <p className="text-base font-semibold text-slate-200">No modules found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or create a new module.
          </p>
        </Card>
      )}

      {!isLoading && !isError && modules.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Module Name</th>
                <th className="p-4">Project</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {modules.map((mod) => (
                <tr key={mod.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-semibold text-slate-100">{mod.name}</td>

                  <td className="p-4 text-slate-200">
                    {mod.projectId ? (
                      <Link
                        to={`/projects/${mod.projectId}`}
                        className="hover:text-indigo-400 font-medium"
                      >
                        {mod.projectName || 'View Project'}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="p-4 text-slate-400 max-w-xs truncate">
                    {mod.description || '—'}
                  </td>

                  <td className="p-4 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        mod.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {mod.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {mod.createdAt ? new Date(mod.createdAt).toLocaleDateString() : '—'}
                  </td>

                  <td className="p-4 text-right space-x-2">
                    {canManageModules && (
                      <>
                        <Link
                          to={`/modules/${mod.id}/edit`}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleActive(mod.id, mod.isActive)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium cursor-pointer"
                        >
                          {mod.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(mod.id, mod.name)}
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

export default ModulesPage;
