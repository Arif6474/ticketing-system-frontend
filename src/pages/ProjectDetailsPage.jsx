import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProject, deleteProject } from '../api/projects';
import { getModules } from '../api/modules';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [actionError, setActionError] = useState('');

  const isAppAdmin = user?.role === 'APP_ADMIN';
  const isClientAdmin = user?.role === 'CLIENT_ADMIN';
  const canManageModules = isAppAdmin || isClientAdmin;

  // Fetch Project Details
  const {
    data: project,
    isLoading: loadingProject,
    isError: isProjectError,
    error: projectError,
    refetch: refetchProject,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    enabled: Boolean(id),
  });

  // Fetch Modules belonging to this project
  const { data: modulesPage, isLoading: loadingModules } = useQuery({
    queryKey: ['modules', { projectId: id }],
    queryFn: () => getModules({ projectId: id, page: 0, size: 100 }),
    enabled: Boolean(id),
  });

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete project "${project?.name}"?`)) {
      return;
    }
    setActionError('');
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch (err) {
      setActionError(err.message || 'Failed to delete project.');
    }
  };

  if (loadingProject) {
    return <LoadingSpinner message="Loading project details..." />;
  }

  if (isProjectError) {
    return (
      <ErrorMessage
        title="Error Loading Project"
        message={projectError?.message || 'Failed to load project details.'}
        onRetry={refetchProject}
      />
    );
  }

  if (!project) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-300">Project not found.</p>
        <div className="mt-4">
          <Link to="/projects">
            <Button variant="secondary">Back to Projects</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const modules = modulesPage?.content || [];

  return (
    <div className="space-y-6">
      {/* Header / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Link
            to="/projects"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 mb-2"
          >
            &larr; Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100">{project.name}</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              {project.shortCode}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canManageModules && (
            <Link to={`/modules/new?projectId=${id}`}>
              <Button variant="secondary" size="sm">
                + Add Module
              </Button>
            </Link>
          )}

          {isAppAdmin && (
            <>
              <Link to={`/projects/${id}/edit`}>
                <Button variant="secondary" size="sm">
                  Edit Project
                </Button>
              </Link>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete Project
              </Button>
            </>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
          {actionError}
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Description
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Status
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    project.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {project.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Client Organization
                </span>
                <p className="text-slate-200 font-semibold">
                  {project.organization?.name || '—'}
                </p>
                {project.organization?.code && (
                  <p className="text-[10px] font-mono text-slate-500">
                    Code: {project.organization.code}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Created At
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {project.createdAt ? new Date(project.createdAt).toLocaleString() : '—'}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Updated At
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 2 Columns: Associated Modules */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Project Modules ({modules.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingModules && <LoadingSpinner message="Loading modules..." />}

              {!loadingModules && modules.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No modules created for this project yet.
                </div>
              )}

              {!loadingModules && modules.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-3">Module Name</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {modules.map((mod) => (
                        <tr key={mod.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-slate-100">{mod.name}</td>
                          <td className="p-3 text-slate-400 max-w-xs truncate">{mod.description || '—'}</td>
                          <td className="p-3 font-mono">
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
                          <td className="p-3 text-right">
                            {canManageModules && (
                              <Link
                                to={`/modules/${mod.id}/edit`}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium"
                              >
                                Edit
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailsPage;
