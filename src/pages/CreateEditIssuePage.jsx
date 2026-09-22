import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getIssue, createIssue, updateIssue } from '../api/issues';
import { getProjects } from '../api/projects';
import { getModules } from '../api/modules';
import { parseApiError } from '../utils/errorHandler';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ISSUE_TYPES = [
  { value: 'BUG', label: 'Bug' },
  { value: 'ENHANCEMENT', label: 'Enhancement' },
  { value: 'NEW_FEATURE', label: 'New Feature' },
];

const ISSUE_PRIORITIES = [
  { value: 'VERY_LOW', label: 'Very Low' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export function CreateEditIssuePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch projects for selection
  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => getProjects({ page: 0, size: 100 }),
  });

  // Fetch existing issue if editing
  const { data: existingIssue, isLoading: loadingIssue } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => getIssue(id),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      type: 'BUG',
      priority: 'MEDIUM',
      projectId: '',
      moduleId: '',
    },
  });

  const selectedProjectId = watch('projectId');

  // Fetch modules for selected project
  const { data: modulesData } = useQuery({
    queryKey: ['modules-list', selectedProjectId],
    queryFn: () => getModules({ projectId: selectedProjectId, page: 0, size: 100 }),
    enabled: Boolean(selectedProjectId),
  });

  // Populate form values when editing existing issue
  useEffect(() => {
    if (existingIssue) {
      reset({
        title: existingIssue.title || '',
        description: existingIssue.description || '',
        type: existingIssue.type || 'BUG',
        priority: existingIssue.priority || 'MEDIUM',
        projectId: existingIssue.projectId || '',
        moduleId: existingIssue.moduleId || '',
      });
    }
  }, [existingIssue, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError('');

    try {
      if (isEdit) {
        const updateData = {
          title: data.title,
          description: data.description,
          type: data.type,
          priority: data.priority,
          moduleId: data.moduleId || null,
        };
        const updated = await updateIssue(id, updateData);
        navigate(`/issues/${updated.id}`);
      } else {
        const createData = {
          title: data.title,
          description: data.description,
          type: data.type,
          priority: data.priority,
          projectId: data.projectId,
          moduleId: data.moduleId || null,
        };
        const created = await createIssue(createData);
        navigate(`/issues/${created.id}`);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setServerError(parsed.message || 'Operation failed. Please check form input.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loadingIssue) {
    return <LoadingSpinner message="Loading issue data..." />;
  }

  const projects = projectsData?.content || [];
  const modules = modulesData?.content || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link
            to={isEdit ? `/issues/${id}` : '/issues'}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 mb-1"
          >
            &larr; Cancel & Return
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">
            {isEdit ? 'Edit Issue' : 'Create New Issue'}
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
          <CardTitle>{isEdit ? 'Update Details' : 'Issue Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <Input
              label="Title"
              placeholder="Brief summary of the issue..."
              error={errors.title?.message}
              {...register('title', {
                required: 'Title is required',
                maxLength: { value: 255, message: 'Title cannot exceed 255 characters' },
              })}
            />

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Description
              </label>
              <textarea
                rows={5}
                placeholder="Detailed description of the issue..."
                className={`w-full rounded-lg bg-slate-900 border ${
                  errors.description
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
                } px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors`}
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="text-xs text-rose-400">{errors.description.message}</p>
              )}
            </div>

            {/* Type & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Type
                </label>
                <select
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm px-3.5 py-2 focus:outline-none focus:border-indigo-500"
                  {...register('type', { required: 'Type is required' })}
                >
                  {ISSUE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="text-xs text-rose-400 mt-1">{errors.type.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Priority
                </label>
                <select
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm px-3.5 py-2 focus:outline-none focus:border-indigo-500"
                  {...register('priority', { required: 'Priority is required' })}
                >
                  {ISSUE_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="text-xs text-rose-400 mt-1">{errors.priority.message}</p>
                )}
              </div>
            </div>

            {/* Project & Module */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Project
                </label>
                <select
                  disabled={isEdit}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm px-3.5 py-2 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  {...register('projectId', { required: 'Project is required' })}
                >
                  <option value="">Select Project...</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({proj.code})
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="text-xs text-rose-400 mt-1">{errors.projectId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Module (Optional)
                </label>
                <select
                  disabled={!selectedProjectId}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm px-3.5 py-2 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  {...register('moduleId')}
                >
                  <option value="">None / General</option>
                  {modules.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      {mod.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <Link to={isEdit ? `/issues/${id}` : '/issues'}>
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Link>

              <Button variant="primary" type="submit" isLoading={submitting}>
                {isEdit ? 'Save Changes' : 'Create Issue'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateEditIssuePage;
