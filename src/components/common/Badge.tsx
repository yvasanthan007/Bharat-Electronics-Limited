import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple' | 'indigo';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
  error: 'bg-rose-50 text-rose-700 border-rose-200/60',
  info: 'bg-blue-50 text-blue-700 border-blue-200/60',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500',
  indigo: 'bg-indigo-500',
  neutral: 'bg-slate-400',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all ${sizeClasses} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
