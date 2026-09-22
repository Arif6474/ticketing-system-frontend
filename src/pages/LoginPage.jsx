import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { parseApiError } from '../utils/errorHandler';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError('');

    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      const parsed = parseApiError(err);
      setServerError(parsed.message || 'Invalid credentials or login failed');
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
          <h1 className="text-2xl font-bold text-slate-100">Sign In</h1>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
              })}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
              Sign In
            </Button>
          </form>
        </div>

        <div className="text-center text-[11px] text-slate-500 font-mono">
          Internal Authentication Platform &copy; 2026
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
