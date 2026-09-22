import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getProject, createProject, updateProject } from '../api/projects';
import { getOrganizations } from '../api/organizations';
import { parseApiError } from '../utils/errorHandler';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export function CreateEditProjectPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch client organizations for dropdown
  const { data: orgsData } = useQuery({
    queryKey: ['organizations-list'],
    queryFn: () => getOrganizations({ page: 0, size: 100 }),
    enabled: !isEdit,
  });

  // Fetch existing project if editing
  const { data: existingProject, isLoading: loadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      shortCode: '',
      description: '',
      organizationId: '',
      active: true,
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (existingProject) {
      reset({
        name: existingProject.name || '',
        shortCode: existingProject.shortCode || '',
        description: existingProject.description || '',
        organizationId: existingProject.organization?.id || '',
        active: existingProject.isActive ?? true,
      });
    }
  }, [existingProject, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError('');

    try {
      if (isEdit) {
        await updateProject(id, {
          name: data.name,
          shortCode: data.shortCode,
          description: data.description || '',
          active: Boolean(data.active),
        });
        navigate(`/projects/${id}`);
      } else {
        const created = await createProject({
          name: data.name,
          shortCode: data.shortCode,
          description: data.description || '',
          organizationId: data.organizationId,
        });
        navigate(`/projects/${created.id}`);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setServerError(parsed.message || 'Operation failed. Please check form parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loadingProject) {
    return <LoadingSpinner message="Loading project details..." />;
  }

  const organizations = orgsData?.content || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link
            to={isEdit ? `/projects/${id}` : '/projects'}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 mb-1"
          >
            &larr; Cancel & Return
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">
            {isEdit ? 'Edit Project' : 'Create New Project'}
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
          <CardTitle>{isEdit ? 'Update Project Information' : 'Project Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Project Name */}
            <Input
              label="Project Name"
              placeholder="e.g. Core Banking System"
              error={errors.name?.message}
              {...register('name', {
                required: 'Project name is required',
                maxLength: { value: 255, message: 'Project name cannot exceed 255 characters' },
              })}
            />

            {/* Short Code */}
            <Input
              label="Short Code"
              placeholder="e.g. CBS"
              error={errors.shortCode?.message}
              {...register('shortCode', {
                required: 'Short code is required',
                maxLength: { value: 50, message: 'Short code cannot exceed 50 characters' },
              })}
            />

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Detailed project summary..."
                className="w-full rounded-lg bg-slate-900 border border-slate-800 focus:border-indigo-500 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1"
                {...register('description')}
              />
            </div>

            {/* Organization selection (for new projects) */}
            {!isEdit && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Client Organization
                </label>
                <select
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm px-3.5 py-2 focus:outline-none focus:border-indigo-500"
                  {...register('organizationId', { required: 'Organization is required' })}
                >
                  <option value="">Select Organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.code})
                    </option>
                  ))}
                </select>
                {errors.organizationId && (
                  <p className="text-xs text-rose-400 mt-1">{errors.organizationId.message}</p>
                )}
              </div>
            )}

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
                  Project Active
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <Link to={isEdit ? `/projects/${id}` : '/projects'}>
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Link>
              <Button variant="primary" type="submit" isLoading={submitting}>
                {isEdit ? 'Save Changes' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateEditProjectPage;
