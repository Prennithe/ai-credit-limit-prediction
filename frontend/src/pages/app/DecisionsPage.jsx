import React, { lazy, Suspense } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import NoCustomerSelected from '../../components/NoCustomerSelected';

const EmployeeDecisionPanel = lazy(() => import('../../components/EmployeeDecisionPanel'));

export default function DecisionsPage() {
  const { customer, prediction } = useCustomer();

  if (!customer) {
    return (
      <NoCustomerSelected
        title="No Customer Selected"
        description="Select a customer first to review model recommendations and record an employee credit decision."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            <div className="h-40 bg-slate-100 rounded mt-6"></div>
          </div>
        }
      >
        <EmployeeDecisionPanel
          customer={customer}
          prediction={prediction}
        />
      </Suspense>
    </div>
  );
}
