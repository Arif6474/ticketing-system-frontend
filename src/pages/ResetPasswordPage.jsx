import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../api/auth';
import { parseApiError } from '../utils/errorHandler';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initialToken = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      token: initialToken,
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (initialToken) {
      setValue('token', initialToken);
    }
  }, [initialToken, setValue]);

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const res = await resetPasswordApi({
        token: data.token.trim(),
        newPassword: data.newPassword,
      });
      setSuccessMessage(
        res?.message || 'Password successfully reset! You can now sign in with your new password.'
      );
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err) {
      const parsed = parseApiError(err);
      setServerError(parsed.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-xl shadow-indigo-500/20 mx-auto">
            T
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Reset Password</h1>
          <p className="text-xs text-slate-400">
            Internal Ticketing System
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          {serverError && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed font-mono">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs leading-relaxed font-mono">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Reset Token"
              type="text"
              placeholder="Paste reset token..."
              error={errors.token?.message}
              {...register('token', {
                required: 'Reset token is required',
              })}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.newPassword?.message}
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters long',
                },
              })}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (val) => val === newPassword || 'Passwords do not match',
              })}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
              Reset Password
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              &larr; Back to Sign In
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 font-mono">
          Internal Authentication Platform &copy; 2026
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
