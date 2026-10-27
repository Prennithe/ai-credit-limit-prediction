import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { formatCurrency, formatDifference } from '../utils/formatters';

/**
 * Custom Tooltip for Monetary Values (INR)
 */
function CurrencyTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs font-sans">
        <p className="font-semibold text-slate-300 mb-1 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center space-x-2 my-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
            <span className="text-slate-300">{entry.name}:</span>
            <span className="font-bold font-mono text-white">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Custom Tooltip for Ratio Values
 */
function RatioTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const pct = (val * 100).toFixed(1);
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs font-sans">
        <p className="font-semibold text-slate-300 mb-1 border-b border-slate-800 pb-1">{label}</p>
        <div className="flex items-center space-x-2 my-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
          <span className="text-slate-300">Payment-to-Bill Ratio:</span>
          <span className="font-bold font-mono text-white">
            {val.toFixed(4)} ({pct}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Custom Tooltip for Repayment Delay
 */
function DelayTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const delay = payload[0].value;
    let statusText = 'On Time / Paid in Full';
    if (delay === -1) statusText = 'Pay Duly / Revolving Credit';
    if (delay === -2) statusText = 'No Consumption / Zero Balance';
    if (delay > 0) statusText = `Payment Delay: ${delay} Month(s)`;

    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs font-sans">
        <p className="font-semibold text-slate-300 mb-1 border-b border-slate-800 pb-1">{label}</p>
        <div className="flex items-center space-x-2 my-1">
          <span className={`w-2.5 h-2.5 rounded-full ${delay > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
          <span className="text-slate-300">Repayment Status:</span>
          <span className="font-bold text-white">{statusText} ({delay})</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function FinancialTrendDashboard({ trendsData }) {
  if (!trendsData) return null;

  const {
    bill_payment_trend = [],
    payment_to_bill_ratio = [],
    repayment_delay_trend = [],
    credit_limit_comparison = {},
  } = trendsData;

  // 1. Calculate Summary Metrics safely
  const totalBills = bill_payment_trend.reduce((sum, item) => sum + (item.bill_amount || 0), 0);
  const totalPayments = bill_payment_trend.reduce((sum, item) => sum + (item.payment_amount || 0), 0);
  const avgBill = bill_payment_trend.length > 0 ? totalBills / bill_payment_trend.length : 0;
  const avgPayment = bill_payment_trend.length > 0 ? totalPayments / bill_payment_trend.length : 0;
  const overallRatio = totalBills > 0 ? totalPayments / totalBills : 0;

  // 2. Generate Neutral Observational Observations
  const delayMonths = repayment_delay_trend.filter((item) => (item.payment_delay || 0) > 0).length;
  const historicalLimit = credit_limit_comparison.historical_credit_limit;
  const predictedLimit = credit_limit_comparison.predicted_credit_limit;
  const limitDifference = historicalLimit && predictedLimit ? predictedLimit - historicalLimit : 0;

  let trendObservationText = 'Historical payment and billing patterns have remained consistent across the 6-month window.';
  if (delayMonths > 0) {
    trendObservationText = `Payment delays were observed in ${delayMonths} of the 6 historical months.`;
  } else if (totalPayments > 0 && totalBills > 0 && overallRatio > 0.5) {
    trendObservationText = 'Payment activity demonstrates high historical bill coverage (payment-to-bill ratio above 50%).';
  } else if (totalBills > 0 && totalPayments === 0) {
    trendObservationText = 'No payment activity was recorded against bill amounts during the observed 6-month window.';
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Section Title Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Financial Trend Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Six-month view of customer billing, payment, and repayment behavior
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            6-Month Historical Window
          </span>
        </div>

        {/* Summary Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Bills
            </span>
            <span className="text-base font-bold font-mono text-slate-900">
              {formatCurrency(totalBills)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Payments
            </span>
            <span className="text-base font-bold font-mono text-slate-900">
              {formatCurrency(totalPayments)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Avg Monthly Bill
            </span>
            <span className="text-base font-bold font-mono text-slate-900">
              {formatCurrency(avgBill)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Avg Monthly Payment
            </span>
            <span className="text-base font-bold font-mono text-slate-900">
              {formatCurrency(avgPayment)}
            </span>
          </div>

          <div className="p-3.5 bg-blue-50/70 rounded-lg border border-blue-100 col-span-2 sm:col-span-1">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">
              Overall Ratio
            </span>
            <span className="text-base font-bold font-mono text-blue-900">
              {overallRatio.toFixed(2)} ({(overallRatio * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Six-Month Billing vs Payment Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Six-Month Billing vs Payment Trend</h4>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Values in INR (₹)</span>
          </div>

          {bill_payment_trend.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No billing vs payment data available
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bill_payment_trend} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="bill_amount"
                    name="Bill Amount"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563eb' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="payment_amount"
                    name="Payment Amount"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10b981' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 2. Payment-to-Bill Ratio Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">Payment-to-Bill Ratio Trend</h4>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Ratio (0.0 to 1.0+)</span>
          </div>

          {payment_to_bill_ratio.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No ratio trend data available
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payment_to_bill_ratio} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    domain={[0, 'dataMax + 0.2']}
                    tickFormatter={(val) => val.toFixed(1)}
                  />
                  <Tooltip content={<RatioTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar
                    dataKey="payment_to_bill_ratio"
                    name="Payment-to-Bill Ratio"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  >
                    {payment_to_bill_ratio.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.payment_to_bill_ratio > 0.5 ? '#10b981' : entry.payment_to_bill_ratio > 0 ? '#3b82f6' : '#cbd5e1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 3. Repayment Delay Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">Repayment Delay Trend</h4>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Status Code (-2 to 2+)</span>
          </div>

          {repayment_delay_trend.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No repayment delay data available
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={repayment_delay_trend} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    domain={[-2.5, 3]}
                    allowDecimals={false}
                  />
                  <Tooltip content={<DelayTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
                  <Bar
                    dataKey="payment_delay"
                    name="Payment Delay Status"
                    radius={[4, 4, 0, 0]}
                  >
                    {repayment_delay_trend.map((entry, index) => (
                      <Cell
                        key={`cell-delay-${index}`}
                        fill={entry.payment_delay > 0 ? '#f59e0b' : entry.payment_delay === 0 ? '#10b981' : '#94a3b8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 4. Historical vs Predicted Credit Limit Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-bold text-slate-900">Historical vs Model-Predicted Limit</h4>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
              Comparison
            </span>
          </div>

          <div className="space-y-4 my-2">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs font-semibold text-slate-600">Historical Credit Limit</span>
              <span className="text-base font-bold font-mono text-slate-900">
                {formatCurrency(historicalLimit)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-blue-50/70 rounded-lg border border-blue-100">
              <span className="text-xs font-semibold text-blue-800">Model-Predicted Credit Limit</span>
              <span className="text-base font-bold font-mono text-blue-900">
                {formatCurrency(predictedLimit)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-100/70 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">Variance / Difference</span>
              <span
                className={`font-bold font-mono text-sm inline-flex items-center px-2 py-0.5 rounded ${
                  limitDifference > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : limitDifference < 0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {limitDifference > 0 && <ArrowUpRight className="w-4 h-4 mr-0.5" />}
                {limitDifference < 0 && <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {limitDifference === 0 && <Minus className="w-4 h-4 mr-0.5" />}
                {formatDifference(limitDifference)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-2 italic leading-relaxed">
            The model prediction provides automated decision support and should be evaluated alongside the customer's historical 6-month repayment behavior.
          </p>
        </div>
      </div>

      {/* 5. Financial Interpretation / Trend Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg flex-shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Financial Trend Observational Summary
            </h4>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {trendObservationText}
            </p>
            <p className="text-[11px] text-slate-400 mt-2 border-t border-slate-200/80 pt-1.5 italic">
              Note: Historical behavior charts provide observational context. Model feature attributions are computed independently in the Explainable AI (SHAP) view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
