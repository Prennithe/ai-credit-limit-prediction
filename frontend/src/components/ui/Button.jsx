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
      'focus-visible:ring-[var(--color-olive-400)] shadow-[var(--shadow-sm)]',

    teal:
      'bg-[var(--brand-secondary)] text-white border-[var(--brand-secondary)] ' +
      'hover:bg-[var(--brand-secondary-hover)] active:bg-[var(--color-olive-700)] ' +
      'focus-visible:ring-[var(--color-olive-400)] shadow-[var(--shadow-olive)]',

    secondary:
      'bg-[var(--color-olive-100)] text-[var(--color-forest-dark)] border-[var(--color-olive-200)] ' +
      'hover:bg-[var(--color-olive-200)] active:bg-[var(--color-olive-300)] ' +
      'focus-visible:ring-[var(--brand-secondary)]',

    outline:
      'bg-transparent text-[var(--text-primary)] border-[var(--border-default)] ' +
      'hover:bg-[rgba(123,138,65,0.08)] active:bg-[rgba(123,138,65,0.16)] ' +
      'focus-visible:ring-[var(--brand-secondary)]',

    ghost:
      'bg-transparent text-[var(--text-secondary)] border-transparent ' +
      'hover:bg-[rgba(123,138,65,0.08)] active:bg-[rgba(123,138,65,0.16)] ' +
      'focus-visible:ring-[var(--brand-secondary)]',

    danger:
      'bg-[var(--status-danger)] text-white border-[var(--status-danger)] ' +
      'hover:bg-[#482433] active:bg-[#381c28] ' +
      'focus-visible:ring-[#8c4b67] shadow-[var(--shadow-sm)]',
  };

  const sizes = {
    sm:  'px-3 py-1.5 text-xs gap-1.5 min-h-[32px]',
    md:  'px-5 py-2.5 text-sm gap-2 min-h-[40px]',
    lg:  'px-7 py-3.5 text-base gap-2.5 min-h-[48px]',
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
        leftIcon && <span className="flex-shrink-0 inline-flex items-center justify-center">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="flex-shrink-0 inline-flex items-center justify-center">{rightIcon}</span>}
    </button>
  );
}
