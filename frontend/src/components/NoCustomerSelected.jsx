import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import Button from './ui/Button';

export default function NoCustomerSelected({
  title       = 'No Customer Selected',
  description = 'Please look up a customer to view their data in this section.',
}) {
  return (
    <div className="
      bg-[var(--surface-card)]
      rounded-[var(--radius-xl)]
      border border-[var(--border-default)]
      shadow-[var(--shadow-sm)]
      p-8 text-center max-w-xl mx-auto my-8
    ">
      {/* Icon circle */}
      <div className="
        w-14 h-14 rounded-full
        bg-[rgba(123,138,65,0.10)]
        border border-[rgba(123,138,65,0.22)]
        flex items-center justify-center
        mx-auto mb-5
      ">
        <Search className="w-6 h-6 text-[var(--brand-secondary)]" />
      </div>

      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>

      <Link to="/app/customers">
        <Button
          variant="primary"
          rightIcon={<ArrowRight className="w-4 h-4 flex-shrink-0" />}
        >
          Go to Customer Search
        </Button>
      </Link>
    </div>
  );
}
