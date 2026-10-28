import React from 'react';
import { Cpu, ArrowUpRight, ArrowDownRight, Minus, AlertCircle, TrendingUp, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDifference } from '../utils/formatters';

export default function PredictionCard({ prediction, currentCreditLimit }) {
  if (!prediction) return null;

  const predictedLimit = prediction.predicted_credit_limit;
  const hasCurrentLimit = currentCreditLimit !== undefined && currentCreditLimit !== null;
  const difference = hasCurrentLimit ? predictedLimit - currentCreditLimit : 0;
  const percentDelta = hasCurrentLimit && currentCreditLimit > 0
    ? ((difference / currentCreditLimit) * 100).toFixed(1)
    : null;

  return (
    <div className="bg-[var(--surface-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border-default)] p-5 sm:p-6 mb-6">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-muted)] pb-4 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[var(--radius-md)] bg-[rgba(116,141,164,0.14)] text-[var(--color-blue-grey)] border border-[rgba(116,141,164,0.25)] flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight leading-tight">
              Model-Predicted Credit Limit
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Automated underwriter recommendation evaluated by tuned ML pipeline
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-md)] bg-[var(--surface-bg)] text-[var(--text-secondary)] text-xs font-semibold border border-[var(--border-default)] self-start sm:self-auto font-mono">
          <Cpu className="w-3.5 h-3.5 text-[var(--brand-secondary)]" />
          Model: Tuned XGBoost
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Prominent Recommendation Panel - Styled in refined blue-grey container */}
        <div className="lg:col-span-7 rounded-[var(--radius-xl)] bg-[var(--color-slate-800)] text-white p-6 shadow-[var(--shadow-md)] border border-[var(--border-sidebar)] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle ambient accent ring */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[rgba(116,141,164,0.15)] blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-slate-400)]">
                Recommended Credit Limit
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[rgba(123,138,65,0.25)] text-[#d9e8b0] border border-[rgba(123,138,65,0.4)]">
                <ShieldCheck className="w-3 h-3" />
                AI Recommendation
              </span>
            </div>

            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white my-3 font-mono">
              {formatCurrency(predictedLimit)}
            </div>

            <p className="text-xs text-[var(--color-slate-300)] mt-2 leading-relaxed max-w-xl">
              Derived from 6-month historical billing statements, repayment trajectories, and demographic risk attributes evaluated against bank underwriting models.
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-[rgba(255,255,255,0.12)] flex items-center text-xs text-[var(--color-slate-400)] gap-2">
            <AlertCircle className="w-4 h-4 text-[var(--color-olive-300)] flex-shrink-0" />
            <span>Decision Support System: Final credit sanction remains with the authorized bank officer.</span>
          </div>
        </div>

        {/* Historical vs Predicted Comparison Layout */}
        {hasCurrentLimit && (
          <div className="lg:col-span-5 bg-[var(--surface-bg)] rounded-[var(--radius-xl)] p-5 border border-[var(--border-default)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Limit Comparison
                </h4>
                {percentDelta && (
                  <span className="text-[11px] font-mono text-[var(--text-muted)] font-semibold">
                    {difference >= 0 ? '+' : ''}{percentDelta}% delta
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {/* Historical baseline row */}
                <div className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-card)] border border-[var(--border-muted)]">
                  <div>
                    <span className="text-xs text-[var(--text-secondary)] block">Historical Baseline</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Current line on record</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--text-primary)] font-mono">
                    {formatCurrency(currentCreditLimit)}
                  </span>
                </div>

                {/* Model-predicted row */}
                <div className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-card)] border border-[rgba(116,141,164,0.3)]">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-text-navy)] block">Predicted Limit</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Model recommendation</span>
                  </div>
                  <span className="text-sm font-extrabold text-[var(--color-text-navy)] font-mono">
                    {formatCurrency(predictedLimit)}
                  </span>
                </div>

                {/* Variance / Difference row */}
                <div className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-card)] border border-[var(--border-default)]">
                  <div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] block">Variance / Difference</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Proposed limit adjustment</span>
                  </div>
                  <span
                    className={`font-bold font-mono text-xs inline-flex items-center px-2 py-1 rounded-[var(--radius-md)] border ${
                      difference > 0
                        ? 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]'
                        : difference < 0
                        ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger-border)]'
                        : 'bg-[var(--surface-bg)] text-[var(--text-secondary)] border-[var(--border-default)]'
                    }`}
                  >
                    {difference > 0 && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
                    {difference < 0 && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                    {difference === 0 && <Minus className="w-3.5 h-3.5 mr-0.5" />}
                    {formatDifference(difference)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contextual evaluation text - neutral, non-evaluative guidance */}
            <p className="text-[11px] text-[var(--text-muted)] mt-4 pt-3 border-t border-[var(--border-muted)] leading-relaxed">
              {difference > 0
                ? 'Model output indicates capacity for credit limit expansion based on historical payment compliance.'
                : difference < 0
                ? 'Model output indicates a conservative exposure adjustment driven by identified risk factors.'
                : 'Model output aligns exactly with current recorded credit limit.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
