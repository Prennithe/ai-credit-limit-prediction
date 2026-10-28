import React from 'react';
import { Link } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';
import CustomerSearch from '../../components/CustomerSearch';
import CustomerProfile from '../../components/CustomerProfile';
import ErrorMessage from '../../components/ErrorMessage';
import { ProfileSkeleton } from '../../components/LoadingState';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function CustomersPage() {
  const {
    activeCustomerId,
    customer,
    customerLoading,
    searchError,
    handleSearch,
    handleClear,
    isSearching,
  } = useCustomer();

  return (
    <div className="space-y-6">
      {/* ── Search Input Component ──────────────────────── */}
      <CustomerSearch
        onSearch={handleSearch}
        onClear={handleClear}
        isLoading={customerLoading || isSearching}
        activeSearchId={activeCustomerId}
      />

      {/* ── Error Display ───────────────────────────────── */}
      {searchError && (
        <ErrorMessage
          type={searchError.type}
          searchId={searchError.searchId}
          customMessage={searchError.customMessage}
          onRetry={() => activeCustomerId && handleSearch(activeCustomerId)}
        />
      )}

      {/* ── Loading Skeleton ────────────────────────────── */}
      {customerLoading && <ProfileSkeleton />}

      {/* ── Customer Profile ────────────────────────────── */}
      {!customerLoading && customer && (
        <div className="space-y-4">
          <CustomerProfile customer={customer} />

          {/* Quick jump to next steps in review process */}
          <div className="
            p-4 sm:p-5 rounded-[var(--radius-xl)]
            bg-[var(--surface-card)]
            border border-[var(--border-default)]
            shadow-[var(--shadow-sm)]
            flex flex-wrap items-center justify-between gap-3
          ">
            <div>
              <p className="text-[10px] font-bold text-[var(--brand-secondary)] uppercase tracking-widest mb-0.5">
                Profile Loaded
              </p>
              <p className="text-sm text-[var(--text-primary)] font-medium">
                Review the recommended credit limit and risk drivers.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <Link to="/app/prediction">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Sparkles className="w-4 h-4 flex-shrink-0" />}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />}
                >
                  View Prediction
                </Button>
              </Link>
              <Link to="/app/financial-trends">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<TrendingUp className="w-4 h-4 flex-shrink-0" />}
                >
                  Financial Trends
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
