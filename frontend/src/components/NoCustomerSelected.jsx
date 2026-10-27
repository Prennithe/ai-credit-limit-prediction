import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import Button from './ui/Button';

export default function NoCustomerSelected({
  title = 'No Customer Selected',
  description = 'Please look up a customer to view their data in this section.',
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--border-default)] p-8 text-center max-w-xl mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-[var(--color-navy-50)] text-[var(--brand-primary)] flex items-center justify-center mx-auto mb-4 border border-[var(--border-default)]">
        <Search className="w-6 h-6 text-[var(--color-teal-600)]" />
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
        {description}
      </p>
      <Link to="/app/customers">
        <Button variant="primary" className="inline-flex items-center gap-2">
          <span>Go to Customer Search</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
