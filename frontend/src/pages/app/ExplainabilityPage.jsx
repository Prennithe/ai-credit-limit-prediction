import React, { lazy, Suspense } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ExplainabilitySkeleton } from '../../components/LoadingState';
import NoCustomerSelected from '../../components/NoCustomerSelected';
import { AlertCircle } from 'lucide-react';

const ExplainabilityDashboard = lazy(() => import('../../components/ExplainabilityDashboard'));

export default function ExplainabilityPage() {
  const {
    customer,
    explanationData,
    explanationLoading,
    explanationError,
  } = useCustomer();

  if (!customer) {
    return (
      <NoCustomerSelected
        title="No Customer Selected"
        description="Select a customer first to view SHAP factor importances explaining the model's recommendation."
      />
    );
  }

  return (
    <div className="space-y-6">
      {explanationLoading ? (
        <ExplainabilitySkeleton />
      ) : explanationError ? (
        <div className="bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] rounded-xl p-6 text-center text-[var(--status-danger)]">
          <AlertCircle className="w-8 h-8 text-[var(--status-danger)] mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-sm">{explanationError}</p>
        </div>
      ) : (
        explanationData && (
          <Suspense fallback={<ExplainabilitySkeleton />}>
            <ExplainabilityDashboard explanationData={explanationData} />
          </Suspense>
        )
      )}
    </div>
  );
}
