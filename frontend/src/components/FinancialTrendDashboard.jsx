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
      <div className="bg-[var(--color-forest-dark)] text-white p-3 rounded-[var(--radius-md)] shadow-[var(--shadow-md)] border border-[var(--border-sidebar)] text-xs font-sans">
        <p className="font-bold text-[var(--color-olive-300)] mb-1.5 border-b border-[rgba(255,255,255,0.12)] pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center space-x-2 my-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
            <span className="text-[var(--text-on-dark-muted)]">{entry.name}:</span>
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
      <div className="bg-[var(--color-forest-dark)] text-white p-3 rounded-[var(--radius-md)] shadow-[var(--shadow-md)] border border-[var(--border-sidebar)] text-xs font-sans">
        <p className="font-bold text-[var(--color-olive-300)] mb-1.5 border-b border-[rgba(255,255,255,0.12)] pb-1">{label}</p>
        <div className="flex items-center space-x-2 my-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-secondary)]"></span>
          <span className="text-[var(--text-on-dark-muted)]">Payment-to-Bill Ratio:</span>
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
      <div className="bg-[var(--color-forest-dark)] text-white p-3 rounded-[var(--radius-md)] shadow-[var(--shadow-md)] border border-[var(--border-sidebar)] text-xs font-sans">
        <p className="font-bold text-[var(--color-olive-300)] mb-1.5 border-b border-[rgba(255,255,255,0.12)] pb-1">{label}</p>
        <div className="flex items-center space-x-2 my-1">
          <span className={`w-2.5 h-2.5 rounded-full ${delay > 0 ? 'bg-[var(--color-rose-soft)]' : 'bg-[var(--color-sage-muted)]'}`}></span>
          <span className="text-[var(--text-on-dark-muted)]">Repayment Status:</span>
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

  // 2. Generate Neutral Observational Summary
  const delayMonths = repayment_delay_trend.filter((item) => (item.payment_delay || 0) > 0).length;
  const historicalLimit = credit_limit_comparison.historical_credit_limit;
  const predictedLimit = credit_limit_comparison.predicted_credit_limit;
  const limitDifference = historicalLimit && predictedLimit ? predictedLimit - historicalLimit : 0;

  let trendObservationText = 'Historical payment and billing patterns have remained consistent across the 6-month window.';
  if (delayMonths > 0) {
    trendObservationText = `Payment delays were recorded in ${delayMonths} of the 6 historical monthly cycles.`;
  } else if (totalPayments > 0 && totalBills > 0 && overallRatio > 0.5) {
    trendObservationText = 'Historical payment activity indicates significant billing coverage with an overall payment-to-bill ratio exceeding 50%.';
  } else if (totalBills > 0 && totalPayments === 0) {
    trendObservationText = 'No payment settlements were recorded against bill statements during the observed 6-month timeline.';
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Section Title Header */}
      <div className="bg-[var(--surface-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border-default)] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-muted)] pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[rgba(116,141,164,0.14)] text-[var(--color-blue-grey)] border border-[rgba(116,141,164,0.25)] rounded-[var(--radius-md)] flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                Financial Trend Analysis
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Six-month chronological view of customer billing, payment, and repayment behavior
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-md)] bg-[rgba(123,138,65,0.12)] text-[var(--brand-secondary)] text-xs font-semibold border border-[rgba(123,138,65,0.25)] self-start sm:self-auto font-mono">
            6-Month Historical Window
          </span>
        </div>

        {/* Summary Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-3.5 bg-[var(--surface-bg)] rounded-[var(--radius-lg)] border border-[var(--border-muted)]">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Total Bills
            </span>
            <span className="text-base font-bold font-mono text-[var(--text-primary)]">
              {formatCurrency(totalBills)}
            </span>
          </div>

          <div className="p-3.5 bg-[var(--surface-bg)] rounded-[var(--radius-lg)] border border-[var(--border-muted)]">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Total Payments
            </span>
            <span className="text-base font-bold font-mono text-[var(--text-primary)]">
              {formatCurrency(totalPayments)}
            </span>
          </div>

          <div className="p-3.5 bg-[var(--surface-bg)] rounded-[var(--radius-lg)] border border-[var(--border-muted)]">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Avg Monthly Bill
            </span>
            <span className="text-base font-bold font-mono text-[var(--text-primary)]">
              {formatCurrency(avgBill)}
            </span>
          </div>

          <div className="p-3.5 bg-[var(--surface-bg)] rounded-[var(--radius-lg)] border border-[var(--border-muted)]">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Avg Monthly Payment
            </span>
            <span className="text-base font-bold font-mono text-[var(--text-primary)]">
              {formatCurrency(avgPayment)}
            </span>
          </div>

          <div className="p-3.5 bg-[rgba(123,138,65,0.10)] rounded-[var(--radius-lg)] border border-[rgba(123,138,65,0.25)] col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-[var(--brand-secondary)] uppercase tracking-wider block mb-1">
              Overall Ratio
            </span>
            <span className="text-base font-bold font-mono text-[var(--text-primary)]">
              {overallRatio.toFixed(2)} ({(overallRatio * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Six-Month Billing vs Payment Trend */}
        <div className="bg-[var(--surface-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border-default)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-[var(--border-muted)] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-[var(--radius-md)] bg-[rgba(116,141,164,0.12)] text-[var(--color-blue-grey)] border border-[rgba(116,141,164,0.22)]">
                <DollarSign className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">Six-Month Billing vs Payment Trend</h4>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 bg-[var(--surface-bg)] text-[var(--text-secondary)] rounded-md border border-[var(--border-default)] font-mono">INR (₹)</span>
          </div>

          {bill_payment_trend.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] gap-1.5">
              <AlertCircle className="w-5 h-5 text-[var(--border-default)]" />
              <span>No billing vs payment data available</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bill_payment_trend} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(183, 198, 214, 0.4)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis
                    width={68}
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="bill_amount"
                    name="Bill Amount"
                    stroke="#748DA4"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#748DA4' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="payment_amount"
                    name="Payment Amount"
                    stroke="#7B8A41"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#7B8A41' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 2. Payment-to-Bill Ratio Trend */}
        <div className="bg-[var(--surface-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border-default)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-[var(--border-muted)] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-[var(--radius-md)] bg-[rgba(123,138,65,0.12)] text-[var(--brand-secondary)] border border-[rgba(123,138,65,0.22)]">
                <PieChart className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">Payment-to-Bill Ratio Trend</h4>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 bg-[var(--surface-bg)] text-[var(--text-secondary)] rounded-md border border-[var(--border-default)] font-mono">Ratio (0.0 to 1.0+)</span>
          </div>

          {payment_to_bill_ratio.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] gap-1.5">
              <AlertCircle className="w-5 h-5 text-[var(--border-default)]" />
              <span>No ratio trend data available</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payment_to_bill_ratio} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(183, 198, 214, 0.4)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis
                    width={42}
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
                    domain={[0, (dataMax) => Math.max(1, Math.ceil((dataMax + 0.1) * 10) / 10)]}
                    tickFormatter={(val) => val.toFixed(1)}
                  />
                  <Tooltip content={<RatioTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <ReferenceLine y={1.0} stroke="var(--color-slate-400)" strokeDasharray="3 3" />
                  <Bar
                    dataKey="payment_to_bill_ratio"
                    name="Payment-to-Bill Ratio"
                    fill="#7B8A41"
                    radius={[4, 4, 0, 0]}
                  >
                    {payment_to_bill_ratio.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.payment_to_bill_ratio >= 0.5 ? '#7B8A41' : entry.payment_to_bill_ratio > 0 ? '#748DA4' : '#B7C6D6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 3. Repayment Delay Trend */}
        <div className="bg-[var(--surface-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border-default)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-[var(--border-muted)] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-[var(--radius-md)] bg-[rgba(91,47,66,0.12)] text-[var(--color-warning-plum)] border border-[rgba(91,47,66,0.22)]">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">Repayment Delay Trend</h4>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 bg-[var(--surface-bg)] text-[var(--text-secondary)] rounded-md border border-[var(--border-default)] font-mono">Status (-2 to 8)</span>
          </div>

          {repayment_delay_trend.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] gap-1.5">
              <AlertCircle className="w-5 h-5 text-[var(--border-default)]" />
              <span>No repayment delay data available</span>
            </div>
          ) : (
            <div className="h-64 w-full flex flex-col justify-between">
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={repayment_delay_trend} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(183, 198, 214, 0.4)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis
                    width={42}
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
                    domain={[(dataMin) => Math.min(-2, Math.floor(dataMin)), (dataMax) => Math.max(2, Math.ceil(dataMax))]}
                    allowDecimals={false}
                  />
                  <Tooltip content={<DelayTooltip />} />
                  <ReferenceLine y={0} stroke="var(--color-slate-400)" strokeDasharray="2 2" />
                  <Bar
                    dataKey="payment_delay"
                    name="Payment Delay Status"
                    radius={[3, 3, 0, 0]}
                  >
                    {repayment_delay_trend.map((entry, index) => (
                      <Cell
                        key={`cell-delay-${index}`}
                        fill={entry.payment_delay > 0 ? '#E7B9B2' : entry.payment_delay === 0 ? '#A7B59C' : '#B7C6D6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 pt-2 text-xs text-[var(--text-secondary)] font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[var(--color-sage-muted)] inline-block" />
                  Paid / On-Time (≤0)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[var(--color-rose-soft)] inline-block" />
                  Delayed (&gt;0)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Historical vs Predicted Credit Limit Summary Card */}
        <div className="bg-[var(--surface-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border-default)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-[var(--border-muted)] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-[var(--radius-md)] bg-[rgba(116,141,164,0.12)] text-[var(--color-blue-grey)] border border-[rgba(116,141,164,0.22)]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">Historical vs Model-Predicted Limit</h4>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-[rgba(123,138,65,0.12)] text-[var(--brand-secondary)] rounded-md border border-[rgba(123,138,65,0.25)] font-mono">
              Comparison
            </span>
          </div>

          {historicalLimit == null && predictedLimit == null ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] gap-1.5">
              <AlertCircle className="w-5 h-5 text-[var(--border-default)]" />
              <span>No credit limit comparison data available</span>
            </div>
          ) : (
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--surface-bg)] border border-[var(--border-muted)]">
                  <div>
                    <span className="text-xs font-semibold text-[var(--text-secondary)] block">Historical Credit Limit</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Current baseline limit on file</span>
                  </div>
                  <span className="text-base font-bold font-mono text-[var(--text-primary)]">
                    {formatCurrency(historicalLimit)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--surface-card)] border border-[rgba(116,141,164,0.3)]">
                  <div>
                    <span className="text-xs font-bold text-[var(--color-text-navy)] block">Model-Predicted Credit Limit</span>
                    <span className="text-[10px] text-[var(--text-muted)]">AI recommended optimal limit</span>
                  </div>
                  <span className="text-base font-extrabold font-mono text-[var(--color-text-navy)]">
                    {formatCurrency(predictedLimit)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--surface-bg)] border border-[var(--border-default)]">
                  <div>
                    <span className="text-xs font-semibold text-[var(--text-secondary)] block">Variance / Difference</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Predicted vs historical delta</span>
                  </div>
                  <span
                    className={`font-bold font-mono text-xs sm:text-sm inline-flex items-center px-2.5 py-1 rounded-md border ${
                      limitDifference > 0
                        ? 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]'
                        : limitDifference < 0
                        ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger-border)]'
                        : 'bg-[var(--surface-bg)] text-[var(--text-secondary)] border-[var(--border-default)]'
                    }`}
                  >
                    {limitDifference > 0 && <ArrowUpRight className="w-3.5 h-3.5 mr-1" />}
                    {limitDifference < 0 && <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                    {limitDifference === 0 && <Minus className="w-3.5 h-3.5 mr-1" />}
                    {formatDifference(limitDifference)}
                  </span>
                </div>
              </div>

              {/* Visual comparison bar */}
              {historicalLimit > 0 && predictedLimit > 0 && (
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-bg)] border border-[var(--border-muted)] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--text-secondary)]">Visual Comparison</span>
                    <span className="font-mono text-[var(--text-muted)] font-medium">
                      {limitDifference >= 0 ? '+' : ''}{((limitDifference / historicalLimit) * 100).toFixed(1)}% delta
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-16 text-[var(--text-secondary)] font-mono">Historical</span>
                      <div className="flex-1 bg-[var(--border-default)] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[var(--color-blue-grey)] h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (historicalLimit / Math.max(historicalLimit, predictedLimit)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-16 text-[var(--color-text-navy)] font-mono font-semibold">Predicted</span>
                      <div className="flex-1 bg-[var(--border-default)] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${limitDifference >= 0 ? 'bg-[var(--brand-secondary)]' : 'bg-[var(--color-warning-plum)]'}`}
                          style={{
                            width: `${Math.min(100, (predictedLimit / Math.max(historicalLimit, predictedLimit)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-muted)] leading-relaxed">
                The model prediction provides automated decision support alongside historical repayment behavior.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Financial Interpretation / Observational Summary */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5 sm:p-6 shadow-[var(--shadow-sm)]">
        <div className="flex items-start space-x-3.5">
          <div className="p-2 bg-[rgba(116,141,164,0.14)] text-[var(--color-blue-grey)] border border-[rgba(116,141,164,0.25)] rounded-[var(--radius-md)] flex-shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
              Observational Summary
            </h4>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              {trendObservationText}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2.5 pt-2 border-t border-[var(--border-muted)]">
              Historical trends describe past customer billing and repayment activity. AI feature attributions and risk weights are evaluated independently in the Explainability (SHAP) view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
