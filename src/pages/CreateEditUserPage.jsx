import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getUser, createUser, updateUser } from '../api/users';
import { getOrganizations } from '../api/organizations';
import useAuth from '../hooks/useAuth';
import { parseApiError } from '../utils/errorHandler';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ROLES = [
  { value: 'APP_ADMIN', label: 'Application Admin (APP_ADMIN)' },
  { value: 'CLIENT_ADMIN', label: 'Client Admin (CLIENT_ADMIN)' },
  { value: 'CLIENT_USER', label: 'Client User (CLIENT_USER)' },
];

export function CreateEditUserPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAppAdmin = currentUser?.role === 'APP_ADMIN';

  // Fetch client organizations for selection
  const { data: orgsData } = useQuery({
    queryKey: ['organizations-list'],
    queryFn: () => getOrganizations({ page: 0, size: 100 }),
  });

  // Fetch existing user if editing
  const { data: existingUser, isLoading: loadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      mobile: '',
      designation: '',
      office: '',
      role: 'CLIENT_USER',
      organizationId: '',
      active: true,
    },
  });

  const selectedRole = watch('role');

  // Pre-fill form when editing
  useEffect(() => {
    if (existingUser) {
      reset({
        email: existingUser.email || '',
        password: '',
        firstName: existingUser.firstName || '',
        lastName: existingUser.lastName || '',
        mobile: existingUser.mobile || '',
        designation: existingUser.designation || '',
        office: existingUser.office || '',
        role: existingUser.role || 'CLIENT_USER',
        organizationId: existingUser.organization?.id || '',
        active: existingUser.isActive ?? true,
      });
    }
  }, [existingUser, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError('');

    try {
      if (isEdit) {
        await updateUser(id, {
          firstName: data.firstName,
          lastName: data.lastName,
          mobile: data.mobile || null,
          designation: data.designation || null,
          office: data.office || null,
          role: data.role,
          organizationId: data.organizationId || null,
          active: Boolean(data.active),
        });
        navigate(`/users/${id}`);
      } else {
        const created = await createUser({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          mobile: data.mobile || null,
          designation: data.designation || null,
          office: data.office || null,
          role: data.role,
          organizationId: data.organizationId || null,
        });
        navigate(`/users/${created.id}`);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setServerError(parsed.message || 'Operation failed. Please check input parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loadingUser) {
    return <LoadingSpinner message="Loading user account details..." />;
  }

  const organizations = orgsData?.content || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link
            to={isEdit ? `/users/${id}` : '/users'}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 mb-1"
          >
            &larr; Cancel & Return
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">
            {isEdit ? 'Edit User Account' : 'Create New User'}
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
          <CardTitle>{isEdit ? 'Update Profile & Role' : 'Account Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email (only on creation) */}
            {!isEdit ? (
              <Input
                label="Email Address"
                type="email"
                placeholder="user@example.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email format',
                  },
                })}
              />
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="text"
                  disabled
                  value={existingUser?.email || ''}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-400 font-mono cursor-not-allowed"
                />
              </div>
            )}

            {/* Password (only on creation) */}
            {!isEdit && (
              <Input
                label="Initial Password"
                type="password"
                placeholder="Minimum 8 characters"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters long' },
                })}
              />
            )}

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                {...register('firstName', {
                  required: 'First name is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
              />

              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName', {
                  required: 'Last name is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
              />
            </div>

            {/* Mobile & Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Number (Optional)"
                placeholder="+1234567890"
                error={errors.mobile?.message}
                {...register('mobile')}
              />

              <Input
                label="Designation (Optional)"
                placeholder="Senior Engineer"
                error={errors.designation?.message}
                {...register('designation')}
              />
            </div>

            {/* Office */}
            <Input
              label="Office Location (Optional)"
              placeholder="Building A, HQ"
              error={errors.office?.message}
              {...register('office')}
            />

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Assigned Role
              </label>
              <select
                className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm px-3.5 py-2 focus:outline-none focus:border-indigo-500"
                {...register('role', { required: 'Role is required' })}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Client Organization Selection */}
            {selectedRole !== 'APP_ADMIN' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Client Organization
                </label>
                <select
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm px-3.5 py-2 focus:outline-none focus:border-indigo-500"
                  {...register('organizationId')}
                >
                  <option value="">Select Organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.code})
                    </option>
                  ))}
                </select>
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
                  Account Active
                </label>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <Link to={isEdit ? `/users/${id}` : '/users'}>
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Link>
              <Button variant="primary" type="submit" isLoading={submitting}>
                {isEdit ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateEditUserPage;
