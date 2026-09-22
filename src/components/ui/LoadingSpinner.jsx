import React from 'react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} border-indigo-500 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
      <LoadingSpinner size="lg" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
