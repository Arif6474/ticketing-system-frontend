import React from 'react';

export function ErrorMessage({ title = 'Error', message, onRetry, className = '' }) {
  return (
    <div
      className={`rounded-xl bg-rose-500/10 border border-rose-500/20 p-5 text-rose-300 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-rose-200 text-sm">{title}</h4>
          <p className="mt-1 text-xs text-rose-300/80 leading-relaxed font-mono">
            {message || 'An error occurred while loading content.'}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
