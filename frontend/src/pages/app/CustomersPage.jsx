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
          <div className="p-4 rounded-xl bg-white border border-[var(--border-default)] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Customer Profile Loaded
              </p>
              <p className="text-sm text-[var(--text-primary)]">
                Next step: review recommended model credit limit and risk drivers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/app/prediction">
                <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>View Prediction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link to="/app/financial-trends">
                <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Financial Trends</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
