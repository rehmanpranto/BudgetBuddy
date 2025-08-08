import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {text && (
        <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm font-medium">{text}</p>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-3xl p-4 sm:p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="glass rounded-3xl p-4 sm:p-8">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
