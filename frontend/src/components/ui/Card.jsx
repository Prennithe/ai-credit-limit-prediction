import React from 'react';

/**
 * Card — surface container with optional header and footer slots
 * Variants: default | flat | navy | teal-accent
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  as: Tag = 'div',
  ...rest
}) {
  const variants = {
    default:
      'bg-[var(--surface-card)] border border-[var(--border-default)] shadow-[var(--shadow-sm)]',
    flat:
      'bg-[var(--surface-card)] border border-[var(--border-muted)]',
    navy:
      'bg-[var(--color-navy-800)] border border-[rgba(255,255,255,0.08)] shadow-[var(--shadow-md)]',
    'teal-accent':
      'bg-[var(--surface-card)] border-l-4 border-l-[var(--brand-secondary)] border-t border-r border-b border-[var(--border-default)] shadow-[var(--shadow-sm)]',
  };

  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-6',
    lg:   'p-8',
  };

  return (
    <Tag
      className={`rounded-[var(--radius-xl)] ${variants[variant] ?? variants.default} ${paddings[padding] ?? paddings.md} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * CardHeader — consistent section header within a Card
 */
export function CardHeader({ icon, title, subtitle, actions, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 pb-4 mb-5 border-b border-[var(--border-muted)] ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex-shrink-0 p-2 rounded-[var(--radius-md)] bg-[var(--color-navy-100)] text-[var(--color-navy-700)]">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {title && (
            <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
