import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { setToken, setUser } from '../utils/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'admin@example.com',
      password: 'password123',
    },
  });

  const from = location.state?.from?.pathname || '/';

  const onSubmit = (data) => {
    setLoading(true);
    setServerError('');

    // Simulate login for foundation setup
    setTimeout(() => {
      setToken('sample-jwt-token-foundation');
      setUser({
        id: '1',
        email: data.email,
        fullName: 'Foundation Admin',
        role: 'APP_ADMIN',
      });
      setLoading(false);
      navigate(from, { replace: true });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-xl shadow-indigo-500/20 mx-auto">
            T
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome Back</h1>
          <p className="text-xs text-slate-400">
            Sign in to access the Internal Ticketing System
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          {serverError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Sign In (Demo)
            </Button>
          </form>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          Foundation authentication preview mode.
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
