import React from 'react';

/**
 * Badge — status pill / label
 * Variants: navy | teal | success | warning | danger | neutral | outline-navy
 * Sizes: sm | md
 */
export default function Badge({
  children,
  variant = 'navy',
  size = 'md',
  dot = false,
  className = '',
}) {
  const base =
    'inline-flex items-center gap-1.5 font-semibold rounded-[var(--radius-full)] border leading-none';

  const variants = {
    navy:
      'bg-[var(--color-navy-100)] text-[var(--color-navy-800)] border-[var(--color-navy-200)]',
    'outline-navy':
      'bg-transparent text-[var(--color-navy-700)] border-[var(--color-navy-300)]',
    teal:
      'bg-[var(--color-teal-100)] text-[var(--color-teal-800)] border-[var(--color-teal-200)]',
    success:
      'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]',
    warning:
      'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]',
    danger:
      'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger-border)]',
    neutral:
      'bg-slate-100 text-slate-600 border-slate-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const dotColors = {
    navy: 'bg-[var(--color-navy-500)]',
    'outline-navy': 'bg-[var(--color-navy-500)]',
    teal: 'bg-[var(--color-teal-500)]',
    success: 'bg-[var(--status-success)]',
    warning: 'bg-[var(--status-warning)]',
    danger: 'bg-[var(--status-danger)]',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`${base} ${variants[variant] ?? variants.neutral} ${sizes[size] ?? sizes.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant] ?? 'bg-slate-400'}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
