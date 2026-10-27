import React, { lazy, Suspense } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { FinancialTrendSkeleton } from '../../components/LoadingState';
import NoCustomerSelected from '../../components/NoCustomerSelected';
import { AlertCircle } from 'lucide-react';

const FinancialTrendDashboard = lazy(() => import('../../components/FinancialTrendDashboard'));

export default function FinancialTrendsPage() {
  const {
    customer,
    trendsData,
    trendsLoading,
    trendsError,
  } = useCustomer();

  if (!customer) {
    return (
      <NoCustomerSelected
        title="No Customer Selected"
        description="Select a customer first to view their 6-month billing statements and payment amount trends."
      />
    );
  }

  return (
    <div className="space-y-6">
      {trendsLoading ? (
        <FinancialTrendSkeleton />
      ) : trendsError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="font-semibold text-sm">{trendsError}</p>
        </div>
      ) : (
        trendsData && (
          <Suspense fallback={<FinancialTrendSkeleton />}>
            <FinancialTrendDashboard trendsData={trendsData} />
          </Suspense>
        )
      )}
    </div>
  );
}
