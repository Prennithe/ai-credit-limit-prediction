import React, { useMemo, useState } from 'react';
import { useCustomer } from '../context/CustomerContext';
import {
  Lightbulb, Info, TrendingUp, TrendingDown,
  AlertTriangle, Minus, ArrowUp, ArrowDown, MessageSquare,
  ArrowUpRight, ArrowDownRight, Search, SlidersHorizontal,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import {
  formatCurrency, formatSex, formatEducation, formatMarriage,
} from '../utils/formatters';

/* ════════════════════════════════════════════════════════════════
   FEATURE LABEL MAP  (covers all 96 preprocessor output features)
════════════════════════════════════════════════════════════════ */

const PAY_MONTH = {
  PAY_0: 'Sep', PAY_2: 'Aug', PAY_3: 'Jul',
  PAY_4: 'Jun', PAY_5: 'May', PAY_6: 'Apr',
};

const PAY_STATUS = {
  '-2': 'No Consumption',
  '-1': 'Paid Duly',
   '0': 'Revolving Credit Used',
   '1': '1-Month Delay',
   '2': '2-Month Delay',
   '3': '3-Month Delay',
   '4': '4-Month Delay',
   '5': '5-Month Delay',
   '6': '6-Month Delay',
   '7': '7-Month Delay',
   '8': '8-Month Delay',
};

const FEATURE_LABELS = {
  // ── Numerical ────────────────────────────────────────────────
  num__AGE:                    'Age',
  num__BILL_AMT1:              'Statement Balance – Sep',
  num__BILL_AMT2:              'Statement Balance – Aug',
  num__BILL_AMT3:              'Statement Balance – Jul',
  num__BILL_AMT4:              'Statement Balance – Jun',
  num__BILL_AMT5:              'Statement Balance – May',
  num__BILL_AMT6:              'Statement Balance – Apr',
  num__PAY_AMT1:               'Payment Made – Sep',
  num__PAY_AMT2:               'Payment Made – Aug',
  num__PAY_AMT3:               'Payment Made – Jul',
  num__PAY_AMT4:               'Payment Made – Jun',
  num__PAY_AMT5:               'Payment Made – May',
  num__PAY_AMT6:               'Payment Made – Apr',
  num__total_bill_amount:      'Total 6-Month Statement Balance',
  num__average_bill_amount:    'Average Monthly Statement Balance',
  num__total_payment_amount:   'Total 6-Month Payments Made',
  num__average_payment_amount: 'Average Monthly Payment',
  num__payment_to_bill_ratio:  'Payment-to-Bill Ratio',
  num__min_bill_amount:        'Lowest Monthly Statement',
  num__max_bill_amount:        'Highest Monthly Statement',
  num__min_payment_amount:     'Lowest Monthly Payment',
  num__max_payment_amount:     'Highest Monthly Payment',
  num__num_payment_delays:     'Number of Payment Delays',
  // ── Categorical ──────────────────────────────────────────────
  cat__SEX_1:                  'Gender: Male',
  cat__SEX_2:                  'Gender: Female',
  cat__EDUCATION_1:            'Education: Graduate School',
  cat__EDUCATION_2:            'Education: University',
  cat__EDUCATION_3:            'Education: High School',
  cat__EDUCATION_4:            'Education: Other',
  cat__MARRIAGE_1:             'Marital Status: Married',
  cat__MARRIAGE_2:             'Marital Status: Single',
  cat__MARRIAGE_3:             'Marital Status: Other',
};

/** Resolve a preprocessor feature name to a human-readable display label. */
function featureLabel(name) {
  if (FEATURE_LABELS[name]) return FEATURE_LABELS[name];

  const m = name.match(/^cat__(PAY_\d)_(-?\d+)$/);
  if (m) {
    const month  = PAY_MONTH[m[1]] || m[1];
    const status = PAY_STATUS[m[2]] || `Code ${m[2]}`;
    return `${month} Repayment: ${status}`;
  }

  return name
    .replace(/^(num__|cat__)/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

const MONTH_SHORT = {
  '1': 'Sep', '2': 'Aug', '3': 'Jul',
  '4': 'Jun', '5': 'May', '6': 'Apr',
  '0': 'Sep',
};

/**
 * Maps a feature identifier to unique, human-readable labels and lines for the waterfall chart X-axis.
 * Disambiguates repeated feature families (e.g., multiple statement balances or payments) with month qualifiers.
 */
function getWaterfallFeatureConfig(feature, fullLabel, contextCounts = {}) {
  const { billAmtCount = 1, payAmtCount = 1, payStatusCount = 1 } = contextCounts;

  if (feature === 'num__AGE') {
    return { label: 'Age', lines: ['Age'] };
  }
  if (feature === 'num__total_payment_amount') {
    return { label: 'Total Payments', lines: ['Total', 'Payments'] };
  }
  if (feature === 'num__total_bill_amount') {
    return { label: 'Total Bills', lines: ['Total', 'Bills'] };
  }
  if (feature === 'num__average_bill_amount') {
    return { label: 'Average Bill', lines: ['Average', 'Bill'] };
  }
  if (feature === 'num__average_payment_amount') {
    return { label: 'Average Payment', lines: ['Average', 'Payment'] };
  }
  if (feature === 'num__max_bill_amount') {
    return { label: 'Highest Bill', lines: ['Highest', 'Bill'] };
  }
  if (feature === 'num__min_bill_amount') {
    return { label: 'Lowest Bill', lines: ['Lowest', 'Bill'] };
  }
  if (feature === 'num__max_payment_amount') {
    return { label: 'Highest Payment', lines: ['Highest', 'Payment'] };
  }
  if (feature === 'num__min_payment_amount') {
    return { label: 'Lowest Payment', lines: ['Lowest', 'Payment'] };
  }
  if (feature === 'num__payment_to_bill_ratio') {
    return { label: 'Payment Ratio', lines: ['Payment', 'Ratio'] };
  }
  if (feature === 'num__num_payment_delays') {
    return { label: 'Payment Delays', lines: ['Payment', 'Delays'] };
  }

  // Monthly Statement Balances
  if (feature.startsWith('num__BILL_AMT')) {
    const monthNum = feature.slice(13);
    const m = MONTH_SHORT[monthNum] || '';
    if (billAmtCount > 1) {
      return { label: `${m} Balance`, lines: [m, 'Balance'] };
    }
    return { label: 'Statement Balance', lines: ['Statement', 'Balance'] };
  }

  // Monthly Payments Made
  if (feature.startsWith('num__PAY_AMT')) {
    const monthNum = feature.slice(12);
    const m = MONTH_SHORT[monthNum] || '';
    if (payAmtCount > 1) {
      return { label: `${m} Payment`, lines: [m, 'Payment'] };
    }
    return { label: 'Payment Amount', lines: ['Payment', 'Amount'] };
  }

  // Monthly Repayment Status
  if (feature.startsWith('cat__PAY_')) {
    const parts = feature.split('_');
    const monthNum = parts[2];
    const m = MONTH_SHORT[monthNum] || '';
    if (payStatusCount > 1) {
      return { label: `${m} Status`, lines: [m, 'Status'] };
    }
    return { label: 'Payment History', lines: ['Payment', 'History'] };
  }

  // Demographics
  if (feature.startsWith('cat__EDUCATION')) {
    return { label: 'Education', lines: ['Education'] };
  }
  if (feature.startsWith('cat__MARRIAGE')) {
    return { label: 'Marital Status', lines: ['Marital', 'Status'] };
  }
  if (feature.startsWith('cat__SEX')) {
    return { label: 'Gender', lines: ['Gender'] };
  }

  // Fallback for any other features
  const words = fullLabel.split(' ');
  if (words.length <= 1) return { label: fullLabel, lines: [fullLabel] };
  if (words.length === 2) return { label: fullLabel, lines: words };
  const mid = Math.ceil(words.length / 2);
  return {
    label: fullLabel,
    lines: [words.slice(0, mid).join(' '), words.slice(mid).join(' ')],
  };
}

/**
 * Custom horizontal X-axis tick renderer.
 * Aligns precisely with the horizontal center of each waterfall bar and maintains
 * consistent vertical clearance from the horizontal axis.
 */
function WaterfallXAxisTick({ x, y, payload, index, entries }) {
  if (!payload || x == null) return null;
  const entry = entries?.find(e => e.id === payload.value) || entries?.[index];
  if (!entry) return null;

  const lines = entry.chartLines || [entry.chartLabel];
  const isSingle = lines.length === 1;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fill="var(--text-secondary)"
        fontSize={11}
        fontFamily="inherit"
        fontWeight={500}
      >
        {isSingle ? (
          <tspan x={0} dy={22}>
            {lines[0]}
          </tspan>
        ) : (
          <>
            <tspan x={0} dy={16}>
              {lines[0]}
            </tspan>
            <tspan x={0} dy={14}>
              {lines[1]}
            </tspan>
          </>
        )}
      </text>
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════
   ORIGINAL-VALUE LOOKUP
   Maps preprocessor feature name → customer's actual value string
   sourced entirely from the CustomerContext (no extra API call).
════════════════════════════════════════════════════════════════ */

function originalValue(name, cust) {
  if (!cust) return null;
  const {
    profile: pr,
    billing_history:  b,
    payment_history:  p,
    repayment_history: r,
  } = cust;

  const bills = [1,2,3,4,5,6].map(i => b?.[`bill_amt_${i}`] || 0);
  const pays  = [1,2,3,4,5,6].map(i => p?.[`pay_amt_${i}`] || 0);
  const totalBill = bills.reduce((a, v) => a + v, 0);
  const totalPay  = pays.reduce((a, v) => a + v, 0);
  const numDel    = [r?.pay_0, r?.pay_2, r?.pay_3, r?.pay_4, r?.pay_5, r?.pay_6]
    .filter(v => v > 0).length;

  const numMap = {
    num__AGE:                    `${pr?.age ?? '—'} yrs`,
    num__BILL_AMT1:              formatCurrency(b?.bill_amt_1),
    num__BILL_AMT2:              formatCurrency(b?.bill_amt_2),
    num__BILL_AMT3:              formatCurrency(b?.bill_amt_3),
    num__BILL_AMT4:              formatCurrency(b?.bill_amt_4),
    num__BILL_AMT5:              formatCurrency(b?.bill_amt_5),
    num__BILL_AMT6:              formatCurrency(b?.bill_amt_6),
    num__PAY_AMT1:               formatCurrency(p?.pay_amt_1),
    num__PAY_AMT2:               formatCurrency(p?.pay_amt_2),
    num__PAY_AMT3:               formatCurrency(p?.pay_amt_3),
    num__PAY_AMT4:               formatCurrency(p?.pay_amt_4),
    num__PAY_AMT5:               formatCurrency(p?.pay_amt_5),
    num__PAY_AMT6:               formatCurrency(p?.pay_amt_6),
    num__total_bill_amount:      formatCurrency(totalBill),
    num__average_bill_amount:    formatCurrency(totalBill / 6),
    num__total_payment_amount:   formatCurrency(totalPay),
    num__average_payment_amount: formatCurrency(totalPay / 6),
    num__payment_to_bill_ratio:  totalBill > 0
      ? `${((totalPay / totalBill) * 100).toFixed(1)}%`
      : '0.0%',
    num__min_bill_amount:        formatCurrency(Math.min(...bills)),
    num__max_bill_amount:        formatCurrency(Math.max(...bills)),
    num__min_payment_amount:     formatCurrency(Math.min(...pays)),
    num__max_payment_amount:     formatCurrency(Math.max(...pays)),
    num__num_payment_delays:     `${numDel} delay${numDel !== 1 ? 's' : ''}`,
  };
  if (name in numMap) return numMap[name];

  if (name.startsWith('cat__SEX_'))       return formatSex(pr?.sex);
  if (name.startsWith('cat__EDUCATION_')) return formatEducation(pr?.education);
  if (name.startsWith('cat__MARRIAGE_'))  return formatMarriage(pr?.marriage);

  const pm = name.match(/^cat__(PAY_\d)_(-?\d+)$/);
  if (pm) {
    const payVals = {
      PAY_0: r?.pay_0, PAY_2: r?.pay_2, PAY_3: r?.pay_3,
      PAY_4: r?.pay_4, PAY_5: r?.pay_5, PAY_6: r?.pay_6,
    };
    const code = payVals[pm[1]];
    if (code !== undefined) return PAY_STATUS[String(code)] || `Code ${code}`;
  }
  return null;
}

/* ════════════════════════════════════════════════════════════════
   WATERFALL DATA BUILDER
════════════════════════════════════════════════════════════════ */

const WFCOLOR = {
  baseline:   '#748DA4', // Slate blue
  positive:   '#A7B59C', // Sage green
  negative:   '#E7B9B2', // Dusty rose
  other:      '#E2E5DE', // Neutral surface grey
  prediction: '#142704', // Forest green
};

function buildWaterfall(features, baseValue, topN = 8) {
  const sorted = [...features].sort(
    (a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)
  );
  const top  = sorted.slice(0, topN);
  const rest = sorted.slice(topN);

  const contextCounts = {
    billAmtCount:   top.filter(f => f.feature.startsWith('num__BILL_AMT')).length,
    payAmtCount:    top.filter(f => f.feature.startsWith('num__PAY_AMT')).length,
    payStatusCount: top.filter(f => f.feature.startsWith('cat__PAY_')).length,
  };

  const entries = [];
  let running = baseValue;

  // Baseline bar
  entries.push({
    id:         'baseline',
    label:      'Model Baseline Average',
    chartLabel: 'Baseline',
    chartLines: ['Baseline'],
    invisible:  0,
    bar:        baseValue,
    total:      baseValue,
    shap_value: null,
    color:      WFCOLOR.baseline,
    isBaseline: true,
    isFinal:    false,
    feature:    null,
  });

  // Top feature contributions
  for (const f of top) {
    const sv   = f.shap_value;
    const prev = running;
    running   += sv;
    const cfg  = getWaterfallFeatureConfig(f.feature, featureLabel(f.feature), contextCounts);

    entries.push({
      id:         f.feature,
      label:      featureLabel(f.feature),
      chartLabel: cfg.label,
      chartLines: cfg.lines,
      invisible:  Math.max(0, sv >= 0 ? prev : running),
      bar:        Math.abs(sv),
      total:      running,
      shap_value: sv,
      feature:    f.feature,
      color:      sv >= 0 ? WFCOLOR.positive : WFCOLOR.negative,
      isBaseline: false,
      isFinal:    false,
    });
  }

  // Combined remaining features
  if (rest.length > 0) {
    const otherSum = rest.reduce((s, f) => s + f.shap_value, 0);
    const prev     = running;
    running       += otherSum;
    entries.push({
      id:         '__other__',
      label:      `Other ${rest.length} features combined`,
      chartLabel: 'Other Features',
      chartLines: ['Other', 'Features'],
      invisible:  Math.max(0, otherSum >= 0 ? prev : running),
      bar:        Math.abs(otherSum),
      total:      running,
      shap_value: otherSum,
      feature:    '__other__',
      color:      WFCOLOR.other,
      isBaseline: false,
      isFinal:    false,
    });
  }

  // Final prediction bar
  entries.push({
    id:         '__prediction__',
    label:      'AI Predicted Limit',
    chartLabel: 'Predicted Limit',
    chartLines: ['Predicted', 'Limit'],
    invisible:  0,
    bar:        running,
    total:      running,
    shap_value: null,
    feature:    null,
    color:      WFCOLOR.prediction,
    isBaseline: false,
    isFinal:    true,
  });

  return entries;
}

/* ════════════════════════════════════════════════════════════════
   WATERFALL TOOLTIP
════════════════════════════════════════════════════════════════ */

function WaterfallTooltip({ active, payload, customer }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-lg shadow-xl p-3 max-w-[280px] text-xs">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-muted)] pb-1.5 mb-2">
        <p className="font-bold text-[var(--text-primary)] text-xs leading-snug">
          {entry.label}
        </p>
        {entry.feature && entry.feature !== '__other__' && (
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {entry.chartLabel}
          </span>
        )}
      </div>

      {entry.isBaseline && (
        <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
          Global average prediction across training data. Every customer evaluation begins at this baseline.
        </p>
      )}

      {entry.isFinal && (
        <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
          Final recommended credit limit for this customer profile after all feature contributions.
        </p>
      )}

      {!entry.isBaseline && !entry.isFinal && entry.shap_value != null && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] text-[11px]">Contribution:</span>
            <span className={`text-xs font-bold font-mono ${
              entry.shap_value >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'
            }`}>
              {entry.shap_value >= 0 ? '+' : ''}
              {formatCurrency(entry.shap_value)}
            </span>
          </div>
          <p className="text-[var(--text-secondary)] text-[11px]">
            {entry.shap_value >= 0
              ? 'Pushed recommended limit higher.'
              : 'Pulled recommended limit lower.'}
          </p>
          {entry.feature && customer && entry.feature !== '__other__' && (
            <div className="flex items-center justify-between pt-1 border-t border-[var(--border-muted)] text-[11px]">
              <span className="text-[var(--text-secondary)]">Customer value:</span>
              <span className="font-semibold text-[var(--text-primary)] font-mono">
                {originalValue(entry.feature, customer) ?? '—'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-2.5 pt-2 border-t border-[var(--border-muted)] flex items-center justify-between font-mono text-[11px]">
        <span className="text-[var(--text-secondary)]">Cumulative Total:</span>
        <span className="font-bold text-[var(--text-primary)]">{formatCurrency(entry.total)}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   LEGACY HORIZONTAL BAR CHART (FALLBACK)
════════════════════════════════════════════════════════════════ */

function LegacyBarChart({ features }) {
  const chartData = useMemo(() => {
    return [...features]
      .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
      .slice(0, 10)
      .map(f => ({ ...f, label: featureLabel(f.feature) }))
      .reverse();
  }, [features]);

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={360}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 16, right: 24, left: 16, bottom: 16 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
        <XAxis
          type="number"
          tickFormatter={(v) => formatCurrency(v)}
          stroke="var(--border-muted)"
          fontSize={11}
          tick={{ fontFamily: 'var(--font-mono)' }}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={180}
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
        />
        <Tooltip
          formatter={(v) => [
            `${v >= 0 ? '+' : ''}${formatCurrency(v)}`,
            'SHAP Contribution',
          ]}
        />
        <ReferenceLine x={0} stroke="var(--border-default)" />
        <Bar dataKey="shap_value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.shap_value >= 0 ? WFCOLOR.positive : WFCOLOR.negative}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ════════════════════════════════════════════════════════════════
   CONCISE 1-LINE IMPACT DESCRIPTIONS (NO REPETITION)
════════════════════════════════════════════════════════════════ */

function featureShortImpact(name, shapValue) {
  const isPos = shapValue >= 0;

  if (name === 'num__AGE') {
    return isPos
      ? "Customer age positively influenced the limit."
      : "Customer age lowered the limit recommendation.";
  }
  if (name === 'num__total_payment_amount') {
    return isPos
      ? "Strong payment history increased the limit."
      : "Lower payment total pulled the limit down.";
  }
  if (name === 'num__payment_to_bill_ratio') {
    return isPos
      ? "High payment-to-bill ratio supported the limit."
      : "Lower payment-to-bill ratio reduced the limit.";
  }
  if (name === 'num__num_payment_delays') {
    return isPos
      ? "Zero recorded payment delays supported the limit."
      : "Recorded payment delays lowered the limit.";
  }
  if (name === 'num__max_bill_amount' || name === 'num__total_bill_amount') {
    return isPos
      ? "Higher statement balances supported the limit."
      : "Lower statement balances reduced the limit.";
  }
  if (name === 'cat__EDUCATION_1') {
    return isPos
      ? "Graduate education tier contributed positively."
      : "Education category reduced model contribution.";
  }
  if (name.startsWith('cat__PAY_')) {
    const pm = name.match(/^cat__(PAY_\d)_(-?\d+)$/);
    if (pm) {
      const month = PAY_MONTH[pm[1]] || pm[1];
      const status = PAY_STATUS[pm[2]] || `Code ${pm[2]}`;
      return isPos
        ? `${month} status (${status}) raised the limit.`
        : `${month} status (${status}) lowered the limit.`;
    }
  }
  if (name.startsWith('num__PAY_AMT')) {
    return isPos
      ? "Monthly payment installment supported the limit."
      : "Lower monthly payment installment pulled the limit down.";
  }
  if (name.startsWith('num__BILL_AMT')) {
    return isPos
      ? "Monthly statement balance supported the limit."
      : "Monthly statement balance lowered the limit.";
  }

  return isPos
    ? "Contributed toward a higher credit limit."
    : "Contributed toward a lower credit limit.";
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */

export default function ExplainabilityDashboard({ explanationData }) {
  const { customer, prediction } = useCustomer();

  // ── Table Controls State ────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [limitCount, setLimitCount] = useState('15'); // '10' | '15' | 'all'
  const [sortOption, setSortOption] = useState('abs_desc');

  // ── Derived values ──────────────────────────────────────────────
  const baseValue       = explanationData?.base_value ?? null;
  const historicalLimit = customer?.credit_history?.current_credit_limit ?? null;
  const predictedLimit  = prediction?.predicted_credit_limit ?? null;
  const difference      = predictedLimit != null && historicalLimit != null
    ? predictedLimit - historicalLimit
    : null;

  // ── Waterfall data ──────────────────────────────────────────────
  const waterfallEntries = useMemo(() => {
    if (!explanationData?.features || baseValue == null) return [];
    return buildWaterfall(explanationData.features, baseValue, 8);
  }, [explanationData, baseValue]);

  // ── Y-axis domain ───────────────────────────────────────────────
  const yDomain = useMemo(() => {
    if (!waterfallEntries.length) return ['auto', 'auto'];
    const tops = waterfallEntries.map(e => e.invisible + e.bar);
    return [0, Math.round(Math.max(...tops) * 1.12)];
  }, [waterfallEntries]);

  // ── Positive & Negative Drivers for Scannable Cards ────────────
  const { topPositive, topNegative, positiveCount, negativeCount, totalFeatures } = useMemo(() => {
    if (!explanationData?.features?.length) {
      return { topPositive: [], topNegative: [], positiveCount: 0, negativeCount: 0, totalFeatures: 0 };
    }

    const pos = explanationData.features
      .filter(f => f.shap_value > 0)
      .sort((a, b) => b.shap_value - a.shap_value);

    const neg = explanationData.features
      .filter(f => f.shap_value < 0)
      .sort((a, b) => a.shap_value - b.shap_value);

    const enrich = (list) => list.map(f => ({
      ...f,
      label: featureLabel(f.feature),
      origVal: originalValue(f.feature, customer),
      shortImpact: featureShortImpact(f.feature, f.shap_value),
    }));

    return {
      topPositive: enrich(pos.slice(0, 3)),
      topNegative: enrich(neg.slice(0, 3)),
      positiveCount: pos.length,
      negativeCount: neg.length,
      totalFeatures: explanationData.features.length,
    };
  }, [explanationData, customer]);

  // ── Processed Feature Contribution Table Rows ───────────────────
  const processedTableRows = useMemo(() => {
    if (!explanationData?.features) return [];

    let rows = explanationData.features.map(f => {
      const label = featureLabel(f.feature);
      const origVal = originalValue(f.feature, customer);
      return {
        feature: f.feature,
        label,
        origVal,
        shap: f.shap_value,
        absShap: Math.abs(f.shap_value),
        positive: f.shap_value >= 0,
      };
    });

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      rows = rows.filter(
        r => r.label.toLowerCase().includes(q) || r.feature.toLowerCase().includes(q)
      );
    }

    rows.sort((a, b) => {
      if (sortOption === 'abs_desc') return b.absShap - a.absShap;
      if (sortOption === 'shap_desc') return b.shap - a.shap;
      if (sortOption === 'shap_asc') return a.shap - b.shap;
      if (sortOption === 'name_asc') return a.label.localeCompare(b.label);
      return b.absShap - a.absShap;
    });

    const rankedRows = rows.map((r, idx) => ({ ...r, displayRank: idx + 1 }));

    if (limitCount !== 'all') {
      return rankedRows.slice(0, Number(limitCount));
    }
    return rankedRows;
  }, [explanationData?.features, customer, searchTerm, sortOption, limitCount]);

  if (!explanationData || !explanationData.features?.length) return null;

  return (
    <div className="space-y-6">

      {/* ══ PANEL A — Summary Cards ══════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Historical Credit Limit */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-xl p-5 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Historical Credit Limit
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-mono tabular-nums tracking-tight my-1.5">
            {historicalLimit != null ? formatCurrency(historicalLimit) : '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">Bank-assigned limit on record</p>
        </div>

        {/* AI Predicted Limit */}
        <div className="bg-[var(--color-slate-800)] border border-[rgba(116,141,164,0.35)] rounded-xl p-5 shadow-xs text-white">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-olive-300)]">
              AI Predicted Limit
            </p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono bg-[rgba(123,138,65,0.2)] text-[var(--color-olive-300)] border border-[rgba(123,138,65,0.4)]">
              XGBoost
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight my-1.5">
            {predictedLimit != null ? formatCurrency(predictedLimit) : '—'}
          </p>
          <p className="text-xs text-[var(--border-default)]">Decision-support recommendation</p>
        </div>

        {/* Difference vs Historical */}
        {difference != null ? (
          <div className={`rounded-xl p-5 shadow-xs border ${
            difference > 0
              ? 'bg-[var(--status-success-bg)] border-[var(--status-success-border)]'
              : difference < 0
              ? 'bg-[var(--status-danger-bg)] border-[var(--status-danger-border)]'
              : 'bg-[var(--surface-card)] border-[var(--border-default)]'
          }`}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Difference vs Historical
            </p>
            <div className="flex items-center gap-1.5 my-1.5">
              {difference > 0 ? (
                <TrendingUp className="w-5 h-5 text-[var(--status-success)] flex-shrink-0" />
              ) : difference < 0 ? (
                <TrendingDown className="w-5 h-5 text-[var(--status-danger)] flex-shrink-0" />
              ) : (
                <Minus className="w-5 h-5 text-[var(--text-secondary)] flex-shrink-0" />
              )}
              <p className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight ${
                difference > 0 ? 'text-[var(--status-success)]'
                : difference < 0 ? 'text-[var(--status-danger)]'
                : 'text-[var(--text-primary)]'
              }`}>
                {difference > 0 ? '+' : ''}
                {formatCurrency(difference)}
              </p>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {difference > 0
                ? 'Model suggests a credit limit increase'
                : difference < 0
                ? 'Model suggests a conservative credit limit reduction'
                : 'Recommendation matches historical limit'}
            </p>
          </div>
        ) : (
          <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-xl p-5 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Difference vs Historical
            </p>
            <p className="text-2xl font-extrabold text-[var(--text-muted)] font-mono my-1.5">—</p>
            <p className="text-xs text-[var(--text-muted)]">Historical limit unavailable</p>
          </div>
        )}
      </div>

      {/* ══ PANEL B — Refined Scannable Driver Section ═══════════════ */}
      <div
        className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-xl p-5 sm:p-6 shadow-xs"
        aria-label="Key factor influences on AI prediction"
      >
        {/* Section Header */}
        <div className="flex items-center gap-2.5 mb-4 border-b border-[var(--border-muted)] pb-3">
          <div className="bg-[rgba(123,138,65,0.12)] p-2 rounded-lg text-[var(--brand-primary)] border border-[rgba(123,138,65,0.25)] flex-shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
              Why This Predicted Limit?
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
              The model's recommendation is influenced by this customer's recorded financial details and payment behavior.
              Individual features push the predicted limit above or below the baseline model average.
            </p>
          </div>
        </div>

        {/* Side-by-Side Responsive Driver Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Positive Influences Column */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-muted)]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--status-success)] inline-block" />
                <h3 className="font-semibold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                  Positive Influences
                </h3>
              </div>
              <span className="text-[11px] font-semibold font-mono text-[var(--status-success)] bg-[var(--status-success-bg)] px-2 py-0.5 rounded border border-[var(--status-success-border)]">
                {topPositive.length} top / {positiveCount} total
              </span>
            </div>

            {topPositive.length > 0 ? (
              <div className="space-y-2">
                {topPositive.map(f => (
                  <div
                    key={f.feature}
                    className="px-3.5 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-bg)] hover:border-[var(--color-blue-grey)] transition-colors flex items-center justify-between gap-3 shadow-2xs min-h-[58px]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                          {f.label}
                        </span>
                        {f.origVal && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--surface-card)] border border-[var(--border-default)] flex-shrink-0">
                            {f.origVal}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {f.shortImpact}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-bold text-xs text-[var(--status-success)] flex-shrink-0 bg-[var(--status-success-bg)] px-2 py-1 rounded border border-[var(--status-success-border)] tabular-nums">
                      <ArrowUpRight className="w-3.5 h-3.5 text-[var(--status-success)] flex-shrink-0" />
                      <span>+{formatCurrency(f.shap_value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic py-3 text-center">
                No positive feature contributions for this customer profile.
              </p>
            )}
          </div>

          {/* Negative Influences Column */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-muted)]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--status-danger)] inline-block" />
                <h3 className="font-semibold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                  Negative Influences
                </h3>
              </div>
              <span className="text-[11px] font-semibold font-mono text-[var(--status-danger)] bg-[var(--status-danger-bg)] px-2 py-0.5 rounded border border-[var(--status-danger-border)]">
                {topNegative.length} top / {negativeCount} total
              </span>
            </div>

            {topNegative.length > 0 ? (
              <div className="space-y-2">
                {topNegative.map(f => (
                  <div
                    key={f.feature}
                    className="px-3.5 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-bg)] hover:border-[var(--color-blue-grey)] transition-colors flex items-center justify-between gap-3 shadow-2xs min-h-[58px]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                          {f.label}
                        </span>
                        {f.origVal && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--surface-card)] border border-[var(--border-default)] flex-shrink-0">
                            {f.origVal}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {f.shortImpact}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-bold text-xs text-[var(--status-danger)] flex-shrink-0 bg-[var(--status-danger-bg)] px-2 py-1 rounded border border-[var(--status-danger-border)] tabular-nums">
                      <ArrowDownRight className="w-3.5 h-3.5 text-[var(--status-danger)] flex-shrink-0" />
                      <span>{formatCurrency(f.shap_value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic py-3 text-center">
                No negative feature contributions for this customer profile.
              </p>
            )}
          </div>
        </div>

        {/* Simplified Summary Footer */}
        <div className="mt-4 pt-3 border-t border-[var(--border-muted)] flex flex-wrap items-center justify-between gap-2.5 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-[var(--text-primary)]">Summary:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--surface-bg)] text-[var(--text-secondary)] font-mono text-[11px] font-medium border border-[var(--border-default)]">
              {totalFeatures} features evaluated
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--status-success-bg)] text-[var(--status-success)] font-mono text-[11px] font-semibold border border-[var(--status-success-border)]">
              <ArrowUpRight className="w-3 h-3 text-[var(--status-success)]" />
              {positiveCount} increased prediction
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--status-danger-bg)] text-[var(--status-danger)] font-mono text-[11px] font-semibold border border-[var(--status-danger-border)]">
              <ArrowDownRight className="w-3 h-3 text-[var(--status-danger)]" />
              {negativeCount} decreased prediction
            </span>
          </div>

          <div className="font-mono text-[11px] text-[var(--text-secondary)]">
            Baseline <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(baseValue)}</span> → Prediction <span className="font-bold text-[var(--text-primary)]">{formatCurrency(predictedLimit)}</span>
          </div>
        </div>
      </div>

      {/* ══ PANEL C — Waterfall Chart ════════════════════════════════ */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-xl p-5 sm:p-6 shadow-xs">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="bg-[rgba(123,138,65,0.12)] p-2 rounded-lg text-[var(--brand-primary)] border border-[rgba(123,138,65,0.25)] flex-shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
              SHAP Waterfall — Step-by-Step Limit Attribution
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Incremental adjustments from model baseline average to final recommended credit limit
            </p>
          </div>
        </div>

        {/* Context banner */}
        {baseValue != null && (
          <div className="mt-3 mb-3.5 rounded-lg bg-[var(--surface-bg)] border border-[var(--border-default)] px-3.5 py-2 text-xs text-[var(--text-secondary)] leading-relaxed flex items-center justify-between flex-wrap gap-2">
            <div>
              Starting from the baseline average of{' '}
              <span className="font-bold font-mono text-[var(--text-primary)]">{formatCurrency(baseValue)}</span>
              {predictedLimit != null && (
                <>
                  {' '}→ feature attributions shifted the recommendation to{' '}
                  <span className="font-bold font-mono text-[var(--text-primary)]">{formatCurrency(predictedLimit)}</span>.
                </>
              )}
            </div>
            <span className="font-medium text-[var(--text-muted)] font-mono text-[11px]">
              Sage = Raised · Rose = Lowered
            </span>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-3 text-xs text-[var(--text-secondary)] font-medium">
          {[
            { color: WFCOLOR.baseline,   label: 'Baseline' },
            { color: WFCOLOR.positive,   label: 'Raised (+)' },
            { color: WFCOLOR.negative,   label: 'Lowered (−)' },
            { color: WFCOLOR.other,      label: 'Other Features' },
            { color: WFCOLOR.prediction, label: 'Predicted Limit' },
          ].map(({ color, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-xs inline-block flex-shrink-0"
                style={{
                  backgroundColor: color,
                  border: color === WFCOLOR.other ? '1px solid #B8C0B2' : 'none'
                }}
              />
              {label}
            </span>
          ))}
        </div>

        {/* Chart or fallback */}
        {baseValue != null && waterfallEntries.length > 0 ? (
          <div className="w-full overflow-x-auto" aria-label="SHAP waterfall chart">
            <div style={{ minWidth: 640 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={waterfallEntries}
                  margin={{ top: 16, right: 24, left: 16, bottom: 20 }}
                  barCategoryGap="22%"
                >
                  <CartesianGrid
                    strokeDasharray="2 4"
                    vertical={false}
                    stroke="var(--border-muted)"
                  />
                  <XAxis
                    dataKey="id"
                    interval={0}
                    height={52}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border-default)' }}
                    tick={<WaterfallXAxisTick entries={waterfallEntries} />}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    domain={yDomain}
                    width={88}
                  />
                  <Tooltip
                    content={<WaterfallTooltip customer={customer} />}
                    cursor={{ fill: 'rgba(116, 141, 164, 0.12)' }}
                  />
                  <Bar
                    dataKey="invisible"
                    stackId="wf"
                    fill="transparent"
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="bar"
                    stackId="wf"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive
                  >
                    {waterfallEntries.map((entry, i) => (
                      <Cell
                        key={entry.id || i}
                        fill={entry.color}
                        stroke={entry.color === WFCOLOR.other ? '#B8C0B2' : undefined}
                        strokeWidth={entry.color === WFCOLOR.other ? 1 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-96 w-full overflow-x-auto" aria-label="SHAP feature importance chart">
            <LegacyBarChart features={explanationData.features} />
          </div>
        )}
      </div>

      {/* ══ PANEL D — Feature Contribution Table with Controls ═════ */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-default)] rounded-xl shadow-xs overflow-hidden">

        {/* Table Title Bar */}
        <div className="px-5 py-4 border-b border-[var(--border-muted)] flex items-start gap-2.5">
          <div className="bg-[rgba(123,138,65,0.12)] p-2 rounded-lg text-[var(--brand-primary)] border border-[rgba(123,138,65,0.25)] flex-shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm sm:text-base leading-tight">
              Feature Contribution Breakdown
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Granular breakdown of all features influencing this recommendation
            </p>
          </div>
        </div>

        {/* Table Controls (Search, Sort, Row Limits) */}
        <div className="px-5 py-3 bg-[var(--surface-bg)] border-b border-[var(--border-default)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">

          {/* Search by feature name */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search features (e.g. Age, Balance, PAY_0)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--surface-card)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold cursor-pointer"
                title="Clear filter"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <SlidersHorizontal className="w-3 h-3 text-[var(--text-muted)]" />
              <span className="font-medium">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-xs bg-[var(--surface-card)] border border-[var(--border-default)] rounded-md px-2 py-1.5 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] cursor-pointer"
              >
                <option value="abs_desc">Absolute Impact (High to Low)</option>
                <option value="shap_desc">Positive Impact First (+)</option>
                <option value="shap_asc">Negative Impact First (-)</option>
                <option value="name_asc">Feature Name (A–Z)</option>
              </select>
            </div>

            {/* Row Limit Selector */}
            <div className="flex items-center gap-0.5 bg-[rgba(183,198,214,0.3)] p-0.5 rounded-md text-xs">
              {['10', '15', 'all'].map((limit) => (
                <button
                  key={limit}
                  type="button"
                  onClick={() => setLimitCount(limit)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    limitCount === limit
                      ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {limit === 'all' ? 'All (96)' : `Top ${limit}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm" aria-label="SHAP feature contributions table">
            <thead>
              <tr className="bg-[var(--surface-bg)] border-b border-[var(--border-default)] text-[var(--text-secondary)] text-[11px] font-semibold uppercase tracking-wider">
                <th className="text-center px-4 py-2.5 w-12">
                  #
                </th>
                <th className="text-left px-4 py-2.5 min-w-[200px]">
                  Feature
                </th>
                <th className="text-left px-4 py-2.5 min-w-[140px]">
                  Customer's Value
                </th>
                <th className="text-center px-4 py-2.5 w-28">
                  Direction
                </th>
                <th className="text-right px-4 py-2.5 min-w-[130px]">
                  SHAP Contribution
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-muted)]">
              {processedTableRows.length > 0 ? (
                processedTableRows.map((row) => (
                  <tr
                    key={row.feature}
                    className="hover:bg-[rgba(183,198,214,0.15)] transition-colors duration-100 group"
                  >
                    <td className="px-4 py-2.5 text-[var(--text-muted)] font-mono text-xs text-center">
                      {row.displayRank}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-[var(--text-primary)] text-xs sm:text-sm">
                        {row.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {row.origVal ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-[var(--surface-bg)] text-[var(--text-primary)] border border-[var(--border-default)]">
                          {row.origVal}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] font-mono text-xs opacity-60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {row.positive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success-border)]">
                          <ArrowUpRight className="w-3 h-3 text-[var(--status-success)]" />
                          Increased
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">
                          <ArrowDownRight className="w-3 h-3 text-[var(--status-danger)]" />
                          Decreased
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`font-bold font-mono text-xs sm:text-sm tabular-nums ${
                          row.positive ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'
                        }`}
                      >
                        {row.positive ? '+' : ''}
                        {formatCurrency(row.shap)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[var(--text-muted)]">
                    <Search className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-1.5 opacity-60" />
                    <p className="text-xs font-medium text-[var(--text-secondary)]">No matching features found</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Try searching for a different keyword or reset filters.</p>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Footer reconciliation row */}
            {baseValue != null && predictedLimit != null && (
              <tfoot>
                <tr className="border-t-2 border-[var(--border-default)] bg-[var(--surface-bg)] text-xs">
                  <td colSpan={4} className="px-4 py-2.5 font-semibold text-[var(--text-secondary)]">
                    Model Baseline{' '}
                    <span className="font-mono font-bold text-[var(--text-primary)]">{formatCurrency(baseValue)}</span>
                    {' '}+ all 96 feature contributions = AI Predicted Limit
                  </td>
                  <td className="px-4 py-2.5 text-right font-extrabold font-mono text-xs sm:text-sm text-[var(--text-primary)]">
                    {formatCurrency(predictedLimit)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
