import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getModule, createModule, updateModule } from '../api/modules';
import { getProjects } from '../api/projects';
import { parseApiError } from '../utils/errorHandler';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export function CreateEditModulePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultProjectId = searchParams.get('projectId') || '';

  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch projects for selection
  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => getProjects({ page: 0, size: 100 }),
    enabled: !isEdit,
  });

  // Fetch existing module if editing
  const { data: existingModule, isLoading: loadingModule } = useQuery({
    queryKey: ['module', id],
    queryFn: () => getModule(id),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      projectId: defaultProjectId,
      name: '',
      description: '',
      active: true,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (existingModule) {
      reset({
        projectId: existingModule.projectId || '',
        name: existingModule.name || '',
        description: existingModule.description || '',
        active: existingModule.isActive ?? true,
      });
    }
  }, [existingModule, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError('');

    try {
      if (isEdit) {
        await updateModule(id, {
          name: data.name,
          description: data.description || '',
          active: Boolean(data.active),
        });
        navigate('/modules');
      } else {
        const created = await createModule({
          projectId: data.projectId,
          name: data.name,
          description: data.description || '',
        });
        if (created.projectId) {
          navigate(`/projects/${created.projectId}`);
        } else {
          navigate('/modules');
        }
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setServerError(parsed.message || 'Operation failed. Please check form parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loadingModule) {
    return <LoadingSpinner message="Loading module details..." />;
  }

  const projects = projectsData?.content || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link
            to="/modules"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 mb-1"
          >
            &larr; Cancel & Return
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">
            {isEdit ? 'Edit Module' : 'Create New Module'}
          </h1>
        </div>
      </div>

      {serverError && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
          {serverError}
        </div>
      )}

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Update Module Information' : 'Module Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Project Selection (for new module) */}
            {!isEdit && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Project
                </label>
                <select
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm px-3.5 py-2 focus:outline-none focus:border-indigo-500"
                  {...register('projectId', { required: 'Project is required' })}
                >
                  <option value="">Select Project...</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({proj.shortCode})
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="text-xs text-rose-400 mt-1">{errors.projectId.message}</p>
                )}
              </div>
            )}

            {/* Module Name */}
            <Input
              label="Module Name"
              placeholder="e.g. Authentication & RBAC"
              error={errors.name?.message}
              {...register('name', {
                required: 'Module name is required',
                maxLength: { value: 255, message: 'Module name cannot exceed 255 characters' },
              })}
            />

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Detailed module summary..."
                className="w-full rounded-lg bg-slate-900 border border-slate-800 focus:border-indigo-500 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1"
                {...register('description')}
              />
            </div>

            {/* Active Status (for editing) */}
            {isEdit && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  {...register('active')}
                />
                <label htmlFor="active" className="text-xs font-medium text-slate-300 cursor-pointer">
                  Module Active
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <Link to="/modules">
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Link>
              <Button variant="primary" type="submit" isLoading={submitting}>
                {isEdit ? 'Save Changes' : 'Create Module'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateEditModulePage;
