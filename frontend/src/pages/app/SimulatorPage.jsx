import React, { lazy, Suspense } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import NoCustomerSelected from '../../components/NoCustomerSelected';

const WhatIfSimulator = lazy(() => import('../../components/WhatIfSimulator'));

export default function SimulatorPage() {
  const { customer } = useCustomer();

  if (!customer) {
    return (
      <NoCustomerSelected
        title="No Customer Selected"
        description="Select a customer first to simulate financial what-if scenarios and evaluate potential limit impacts."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="bg-[var(--surface-card)] rounded-xl border border-[var(--border-default)] p-8 shadow-xs animate-pulse space-y-4">
            <div className="h-6 bg-[rgba(183,198,214,0.4)] rounded w-1/4"></div>
            <div className="h-4 bg-[rgba(183,198,214,0.25)] rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="h-32 bg-[rgba(183,198,214,0.25)] rounded"></div>
              <div className="h-32 bg-[rgba(183,198,214,0.25)] rounded"></div>
            </div>
          </div>
        }
      >
        <WhatIfSimulator customer={customer} />
      </Suspense>
    </div>
  );
}
