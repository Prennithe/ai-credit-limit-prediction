import React from 'react';
import { Link } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';
import PredictionCard from '../../components/PredictionCard';
import { PredictionSkeleton } from '../../components/LoadingState';
import NoCustomerSelected from '../../components/NoCustomerSelected';
import Button from '../../components/ui/Button';
import { TrendingUp, Lightbulb, ArrowRight, AlertCircle } from 'lucide-react';

export default function PredictionPage() {
  const {
    customer,
    prediction,
    predictionLoading,
    predictionError,
  } = useCustomer();

  if (!customer) {
    return (
      <NoCustomerSelected
        title="No Customer Selected"
        description="Select a customer first to view their AI-recommended credit limit and repayment confidence score."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Prediction Content ──────────────────────────── */}
      {predictionLoading ? (
        <PredictionSkeleton />
      ) : predictionError ? (
        <div className="bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] rounded-[var(--radius-xl)] p-6 text-center text-[var(--status-danger)] shadow-[var(--shadow-sm)]">
          <AlertCircle className="w-8 h-8 text-[var(--status-danger)] mx-auto mb-2" />
          <p className="font-semibold text-sm">{predictionError}</p>
        </div>
      ) : (
        prediction && (
          <div className="space-y-5">
            <PredictionCard
              prediction={prediction}
              currentCreditLimit={customer?.credit_history?.current_credit_limit}
            />

            {/* Quick action bar */}
            <div className="p-4 sm:p-5 rounded-[var(--radius-xl)] bg-[var(--surface-card)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-[var(--brand-secondary)] uppercase tracking-widest mb-0.5">
                  Deep Dive Analysis
                </p>
                <p className="text-sm text-[var(--text-primary)] font-medium">
                  Investigate historical billing patterns or examine SHAP feature drivers.
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <Link to="/app/financial-trends">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<TrendingUp className="w-4 h-4 flex-shrink-0" />}
                  >
                    Financial Trends
                  </Button>
                </Link>
                <Link to="/app/explainability">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Lightbulb className="w-4 h-4 flex-shrink-0" />}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />}
                  >
                    Explainability (SHAP)
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
