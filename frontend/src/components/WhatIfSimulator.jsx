import React, { useState, useEffect } from 'react';
import { 
  Calculator, RefreshCw, Play, ArrowRight, 
  TrendingUp, TrendingDown, Minus, AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency, formatDifference } from '../utils/formatters';

const LABEL_MAP = {
  age: 'Customer Age',
  sex: 'Sex',
  education: 'Education',
  marriage: 'Marital Status',
  pay_0: 'Latest Payment Status',
  pay_2: 'Previous Month Status',
  pay_3: '2 Months Ago Status',
  pay_4: '3 Months Ago Status',
  pay_5: '4 Months Ago Status',
  pay_6: '5 Months Ago Status',
  bill_amt_1: 'Bill Amount Month 1',
  bill_amt_2: 'Bill Amount Month 2',
  bill_amt_3: 'Bill Amount Month 3',
  bill_amt_4: 'Bill Amount Month 4',
  bill_amt_5: 'Bill Amount Month 5',
  bill_amt_6: 'Bill Amount Month 6',
  pay_amt_1: 'Payment Month 1',
  pay_amt_2: 'Payment Month 2',
  pay_amt_3: 'Payment Month 3',
  pay_amt_4: 'Payment Month 4',
  pay_amt_5: 'Payment Month 5',
  pay_amt_6: 'Payment Month 6',
};

const extractOriginalValues = (customer) => {
  if (!customer) return {};
  const { profile, repayment_history, billing_history, payment_history } = customer;
  return {
    age: profile?.age ?? '',
    sex: profile?.sex ?? '',
    education: profile?.education ?? '',
    marriage: profile?.marriage ?? '',
    pay_0: repayment_history?.pay_0 ?? 0,
    pay_2: repayment_history?.pay_2 ?? 0,
    pay_3: repayment_history?.pay_3 ?? 0,
    pay_4: repayment_history?.pay_4 ?? 0,
    pay_5: repayment_history?.pay_5 ?? 0,
    pay_6: repayment_history?.pay_6 ?? 0,
    bill_amt_1: billing_history?.bill_amt_1 ?? 0,
    bill_amt_2: billing_history?.bill_amt_2 ?? 0,
    bill_amt_3: billing_history?.bill_amt_3 ?? 0,
    bill_amt_4: billing_history?.bill_amt_4 ?? 0,
    bill_amt_5: billing_history?.bill_amt_5 ?? 0,
    bill_amt_6: billing_history?.bill_amt_6 ?? 0,
    pay_amt_1: payment_history?.pay_amt_1 ?? 0,
    pay_amt_2: payment_history?.pay_amt_2 ?? 0,
    pay_amt_3: payment_history?.pay_amt_3 ?? 0,
    pay_amt_4: payment_history?.pay_amt_4 ?? 0,
    pay_amt_5: payment_history?.pay_amt_5 ?? 0,
    pay_amt_6: payment_history?.pay_amt_6 ?? 0,
  };
};

export default function WhatIfSimulator({ customer }) {
  const [originalValues, setOriginalValues] = useState({});
  const [editedValues, setEditedValues] = useState({});
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customer?.customer_id) {
      const defaults = extractOriginalValues(customer);
      setOriginalValues(defaults);
      setEditedValues(defaults);
      setSimulationResult(null);
      setError(null);
    }
  }, [customer]);

  const handleChange = (key, value) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getChangedFields = () => {
    const overrides = {};
    Object.keys(editedValues).forEach(key => {
      const originalNum = Number(originalValues[key]);
      const editedNum = Number(editedValues[key]);
      if (originalNum !== editedNum && !isNaN(editedNum)) {
        overrides[key] = editedNum;
      }
    });
    return overrides;
  };

  const handleReset = () => {
    setEditedValues({ ...originalValues });
    setSimulationResult(null);
    setError(null);
  };

  const handleSimulate = async () => {
    const overrides = getChangedFields();
    if (Object.keys(overrides).length === 0) {
      setError("No changes have been made. Adjust at least one input before running a simulation.");
      return;
    }
    
    setError(null);
    setIsSimulating(true);
    try {
      const result = await api.simulateWhatIf(customer.customer_id, overrides);
      setSimulationResult(result);
    } catch (err) {
      console.error(err);
      if (!err.status || err.message?.includes('Fetch') || err.message?.includes('Network')) {
        setError("Unable to connect to the recommendation service. Please verify that the backend is running.");
      } else {
        setError("Unable to run the simulation. Please check the entered values and try again.");
      }
    } finally {
      setIsSimulating(false);
    }
  };

  if (!customer) return null;

  const overrides = getChangedFields();
  const hasChanges = Object.keys(overrides).length > 0;

  return (
    <div className="bg-[var(--surface-card)] rounded-xl shadow-xs border border-[var(--border-default)] p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-[var(--border-muted)] pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-[rgba(123,138,65,0.12)] p-2 rounded-lg text-[var(--brand-primary)] border border-[rgba(123,138,65,0.25)] flex-shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">What-If Credit Limit Simulator</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Interactive exploratory scenario analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleReset}
            disabled={isSimulating}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-bg)] hover:bg-[rgba(183,198,214,0.25)] border border-[var(--border-default)] rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Changes</span>
          </button>
          <button
            onClick={handleSimulate}
            disabled={isSimulating || !hasChanges}
            className="flex items-center space-x-1.5 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--color-olive-600)] rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
          >
            {isSimulating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{isSimulating ? 'Running simulation...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 max-w-3xl leading-relaxed">
        Temporarily adjust selected customer information to evaluate how the model prediction changes. 
        These changes are simulation-only and are not saved.
      </p>

      {/* Error Message */}
      {error && (
        <div className="bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-[var(--status-danger)] p-4 rounded-lg flex items-start space-x-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--status-danger)]" />
          <p className="text-xs sm:text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Simulation Result */}
      {simulationResult && (
        <div className="bg-[var(--surface-bg)] border border-[var(--border-default)] rounded-xl p-5 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Simulation Result</h3>
            <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--surface-card)] px-2 py-0.5 rounded border border-[var(--border-default)]">
              Scenario Output
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--surface-card)] p-4 rounded-lg shadow-xs border border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Baseline Prediction</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-primary)] tabular-nums">
                {formatCurrency(simulationResult.baseline_prediction)}
              </p>
            </div>
            
            <div className="bg-[var(--surface-card)] p-4 rounded-lg shadow-xs border border-[var(--brand-primary)] ring-1 ring-[rgba(123,138,65,0.25)]">
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Simulated Prediction</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-[var(--brand-primary)] tabular-nums">
                {formatCurrency(simulationResult.simulated_prediction)}
              </p>
            </div>
            
            <div className="bg-[var(--surface-card)] p-4 rounded-lg shadow-xs border border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Change vs Baseline</p>
              <div className="flex items-center space-x-2">
                {simulationResult.prediction_change > 0 ? (
                  <TrendingUp className="w-5 h-5 text-[var(--status-success)] flex-shrink-0" />
                ) : simulationResult.prediction_change < 0 ? (
                  <TrendingDown className="w-5 h-5 text-[var(--status-danger)] flex-shrink-0" />
                ) : (
                  <Minus className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                )}
                <div>
                  <p className={`text-lg sm:text-xl font-bold font-mono tabular-nums ${
                    simulationResult.prediction_change > 0 ? 'text-[var(--status-success)]'
                    : simulationResult.prediction_change < 0 ? 'text-[var(--status-danger)]' : 'text-[var(--text-secondary)]'
                  }`}>
                    {formatDifference(simulationResult.prediction_change)}
                  </p>
                  <p className="text-[11px] font-medium text-[var(--text-muted)] font-mono">
                    {simulationResult.prediction_change > 0 ? '+' : ''}{simulationResult.prediction_change_percentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">Applied Overrides:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(simulationResult.applied_changes).map(([field, change]) => (
                <div key={field} className="bg-[var(--surface-card)] p-3 rounded-lg shadow-2xs border border-[var(--border-default)] flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">{LABEL_MAP[field] || field}</span>
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="text-[var(--text-muted)] line-through">
                      {field.includes('amt') ? formatCurrency(change.original) : change.original}
                    </span>
                    <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="font-bold text-[var(--brand-primary)]">
                      {field.includes('amt') ? formatCurrency(change.simulated) : change.simulated}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Form */}
      <div className="space-y-8">
        
        {/* Section A: Profile */}
        <section>
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border-muted)]">
            A — Customer Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{LABEL_MAP.age}</label>
              <input 
                type="number" min="18" max="100"
                value={editedValues.age ?? ''}
                onChange={e => handleChange('age', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] font-mono transition-colors ${editedValues.age != originalValues.age ? 'bg-[rgba(123,138,65,0.12)] border-[var(--brand-primary)]' : 'bg-[var(--surface-bg)] border-[var(--border-default)]'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{LABEL_MAP.sex}</label>
              <select
                value={editedValues.sex ?? ''}
                onChange={e => handleChange('sex', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] transition-colors cursor-pointer ${editedValues.sex != originalValues.sex ? 'bg-[rgba(123,138,65,0.12)] border-[var(--brand-primary)]' : 'bg-[var(--surface-bg)] border-[var(--border-default)]'}`}
              >
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{LABEL_MAP.education}</label>
              <select
                value={editedValues.education ?? ''}
                onChange={e => handleChange('education', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] transition-colors cursor-pointer ${editedValues.education != originalValues.education ? 'bg-[rgba(123,138,65,0.12)] border-[var(--brand-primary)]' : 'bg-[var(--surface-bg)] border-[var(--border-default)]'}`}
              >
                <option value="1">Graduate School</option>
                <option value="2">University</option>
                <option value="3">High School</option>
                <option value="4">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{LABEL_MAP.marriage}</label>
              <select
                value={editedValues.marriage ?? ''}
                onChange={e => handleChange('marriage', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] transition-colors cursor-pointer ${editedValues.marriage != originalValues.marriage ? 'bg-[rgba(123,138,65,0.12)] border-[var(--brand-primary)]' : 'bg-[var(--surface-bg)] border-[var(--border-default)]'}`}
              >
                <option value="1">Married</option>
                <option value="2">Single</option>
                <option value="3">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section B: Repayment */}
        <section>
          <div className="flex items-baseline space-x-2 mb-4 pb-2 border-b border-[var(--border-muted)]">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              B — Repayment Behavior
            </h3>
            <span className="text-[11px] text-[var(--text-muted)] italic">(Historical status codes)</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[0, 2, 3, 4, 5, 6].map(i => {
              const key = `pay_${i}`;
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis" title={LABEL_MAP[key]}>
                    {LABEL_MAP[key]}
                  </label>
                  <input 
                    type="number"
                    value={editedValues[key] ?? ''}
                    onChange={e => handleChange(key, e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] font-mono transition-colors ${editedValues[key] != originalValues[key] ? 'bg-[rgba(123,138,65,0.12)] border-[var(--brand-primary)]' : 'bg-[var(--surface-bg)] border-[var(--border-default)]'}`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Section C: Billing */}
        <section>
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border-muted)]">
            C — Billing History
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => {
              const key = `bill_amt_${i}`;
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis" title={LABEL_MAP[key]}>
                    {LABEL_MAP[key]}
                  </label>
                  <input 
                    type="number" min="0" step="100"
                    value={editedValues[key] ?? ''}
                    onChange={e => handleChange(key, e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] font-mono transition-colors ${editedValues[key] != originalValues[key] ? 'bg-[rgba(123,138,65,0.12)] border-[var(--brand-primary)]' : 'bg-[var(--surface-bg)] border-[var(--border-default)]'}`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Section D: Payment */}
        <section>
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border-muted)]">
            D — Payment History
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => {
              const key = `pay_amt_${i}`;
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis" title={LABEL_MAP[key]}>
                    {LABEL_MAP[key]}
                  </label>
                  <input 
                    type="number" min="0" step="100"
                    value={editedValues[key] ?? ''}
                    onChange={e => handleChange(key, e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] text-[var(--text-primary)] font-mono transition-colors ${editedValues[key] != originalValues[key] ? 'bg-[rgba(123,138,65,0.12)] border-[var(--brand-primary)]' : 'bg-[var(--surface-bg)] border-[var(--border-default)]'}`}
                  />
                </div>
              );
            })}
          </div>
        </section>

      </div>

      <div className="mt-8 pt-4 border-t border-[var(--border-muted)] text-center">
        <p className="text-xs text-[var(--text-muted)] italic max-w-2xl mx-auto leading-relaxed">
          Simulation only — changes are temporary and do not modify the customer's database record. 
          The model output is decision-support information. Final credit decisions remain with the authorized bank employee.
        </p>
      </div>
    </div>
  );
}
