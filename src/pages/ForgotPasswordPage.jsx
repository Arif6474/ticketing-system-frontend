import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../api/auth';
import { parseApiError } from '../utils/errorHandler';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export function ForgotPasswordPage() {
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const res = await forgotPasswordApi({ email: data.email });
      setSuccessMessage(
        res?.message || 'If your email is registered in our system, password recovery instructions have been processed.'
      );
    } catch (err) {
      const parsed = parseApiError(err);
      setServerError(parsed.message || 'Failed to request password reset.');
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
          <h1 className="text-2xl font-bold text-slate-100">Forgot Password</h1>
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
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
              Send Reset Request
            </Button>
          </form>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              &larr; Back to Sign In
            </Link>
            <Link to="/reset-password" className="text-slate-400 hover:text-slate-200 transition-colors">
              Have a reset token?
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

export default ForgotPasswordPage;
