import React from 'react';
import { Cpu, ArrowUpRight, ArrowDownRight, Minus, AlertCircle, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDifference } from '../utils/formatters';

export default function PredictionCard({ prediction, currentCreditLimit }) {
  if (!prediction) return null;

  const predictedLimit = prediction.predicted_credit_limit;
  const hasCurrentLimit = currentCreditLimit !== undefined && currentCreditLimit !== null;
  const difference = hasCurrentLimit ? predictedLimit - currentCreditLimit : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Model-Predicted Credit Limit
          </h3>
        </div>
        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
          <Cpu className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          Model: Tuned XGBoost
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Prediction Display */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Recommended Credit Limit
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white my-2">
              {formatCurrency(predictedLimit)}
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Based on historical customer financial and repayment patterns evaluated by the tuned machine learning pipeline.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 mr-1.5 text-amber-400 flex-shrink-0" />
            <span>Decision Support System: Final approval remains with the authorized bank employee.</span>
          </div>
        </div>

        {/* Historical vs Predicted Comparison Card */}
        {hasCurrentLimit && (
          <div className="lg:col-span-5 bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-2">
              Historical vs Predicted Comparison
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Historical Credit Limit</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {formatCurrency(currentCreditLimit)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Predicted Credit Limit</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {formatCurrency(predictedLimit)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Variance / Difference</span>
                <span
                  className={`font-bold font-mono inline-flex items-center px-2 py-0.5 rounded text-xs ${
                    difference > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : difference < 0
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {difference > 0 && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
                  {difference < 0 && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {difference === 0 && <Minus className="w-3.5 h-3.5 mr-0.5" />}
                  {formatDifference(difference)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-4 italic">
              {difference > 0
                ? 'Model recommends a credit limit increase based on low risk features.'
                : difference < 0
                ? 'Model suggests a conservative credit limit reduction based on risk signals.'
                : 'Model recommendation matches historical credit limit.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
