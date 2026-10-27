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
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="font-semibold text-sm">{predictionError}</p>
        </div>
      ) : (
        prediction && (
          <div className="space-y-4">
            <PredictionCard
              prediction={prediction}
              currentLimit={customer?.credit_limit}
            />

            {/* Quick action bar */}
            <div className="p-4 rounded-xl bg-white border border-[var(--border-default)] shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Deep Dive Analysis
                </p>
                <p className="text-sm text-[var(--text-primary)]">
                  Investigate historical billing patterns or examine SHAP feature drivers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/app/financial-trends">
                  <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Financial Trends</span>
                  </Button>
                </Link>
                <Link to="/app/explainability">
                  <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" />
                    <span>Explainability (SHAP)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
