import React from 'react';

/**
 * Button — primary UI primitive
 * Variants: primary | secondary | outline | ghost | danger | teal
 * Sizes: sm | md | lg
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] ' +
    'border transition-all duration-[var(--transition-fast)] focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed ' +
    'cursor-pointer select-none whitespace-nowrap';

  const variants = {
    primary:
      'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] ' +
      'hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] ' +
      'focus-visible:ring-[var(--color-navy-400)] shadow-[var(--shadow-sm)]',

    teal:
      'bg-[var(--brand-secondary)] text-white border-[var(--brand-secondary)] ' +
      'hover:bg-[var(--brand-secondary-hover)] active:bg-[var(--color-teal-700)] ' +
      'focus-visible:ring-[var(--color-teal-400)] shadow-[var(--shadow-teal)]',

    secondary:
      'bg-[var(--color-navy-100)] text-[var(--color-navy-800)] border-[var(--color-navy-200)] ' +
      'hover:bg-[var(--color-navy-200)] active:bg-[var(--color-navy-300)] ' +
      'focus-visible:ring-[var(--color-navy-300)]',

    outline:
      'bg-transparent text-[var(--brand-primary)] border-[var(--color-navy-300)] ' +
      'hover:bg-[var(--color-navy-50)] active:bg-[var(--color-navy-100)] ' +
      'focus-visible:ring-[var(--color-navy-300)]',

    ghost:
      'bg-transparent text-[var(--text-secondary)] border-transparent ' +
      'hover:bg-[var(--color-navy-50)] active:bg-[var(--color-navy-100)] ' +
      'focus-visible:ring-[var(--color-navy-200)]',

    danger:
      'bg-[var(--status-danger)] text-white border-[var(--status-danger)] ' +
      'hover:bg-red-700 active:bg-red-800 ' +
      'focus-visible:ring-red-400 shadow-[var(--shadow-sm)]',
  };

  const sizes = {
    sm:  'px-3 py-1.5 text-xs gap-1.5',
    md:  'px-5 py-2.5 text-sm gap-2',
    lg:  'px-7 py-3.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...rest}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
}
