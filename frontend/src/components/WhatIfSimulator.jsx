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
  bill_amt_1: 'Bill Amount — Month 1',
  bill_amt_2: 'Bill Amount — Month 2',
  bill_amt_3: 'Bill Amount — Month 3',
  bill_amt_4: 'Bill Amount — Month 4',
  bill_amt_5: 'Bill Amount — Month 5',
  bill_amt_6: 'Bill Amount — Month 6',
  pay_amt_1: 'Payment Amount — Month 1',
  pay_amt_2: 'Payment Amount — Month 2',
  pay_amt_3: 'Payment Amount — Month 3',
  pay_amt_4: 'Payment Amount — Month 4',
  pay_amt_5: 'Payment Amount — Month 5',
  pay_amt_6: 'Payment Amount — Month 6',
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
            <Calculator className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">What-If Credit Limit Simulator</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            disabled={isSimulating}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Changes</span>
          </button>
          <button
            onClick={handleSimulate}
            disabled={isSimulating || !hasChanges}
            className="flex items-center space-x-1.5 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isSimulating ? 'Running simulation...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-6 max-w-3xl">
        Temporarily adjust selected customer information to evaluate how the model prediction changes. 
        These changes are simulation-only and are not saved.
      </p>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-start space-x-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Simulation Result */}
      {simulationResult && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Simulation Result</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium mb-1">Baseline Prediction</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(simulationResult.baseline_prediction)}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-200 ring-1 ring-indigo-50">
              <p className="text-sm text-slate-500 font-medium mb-1">Simulated Prediction</p>
              <p className="text-2xl font-bold text-indigo-700">
                {formatCurrency(simulationResult.simulated_prediction)}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium mb-1">Change</p>
              <div className="flex items-center space-x-2">
                {simulationResult.prediction_change > 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                ) : simulationResult.prediction_change < 0 ? (
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                ) : (
                  <Minus className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <p className={`text-xl font-bold ${
                    simulationResult.prediction_change > 0 ? 'text-emerald-600' 
                    : simulationResult.prediction_change < 0 ? 'text-rose-600' : 'text-slate-600'
                  }`}>
                    {formatDifference(simulationResult.prediction_change)}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {simulationResult.prediction_change > 0 ? '+' : ''}{simulationResult.prediction_change_percentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Applied Changes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(simulationResult.applied_changes).map(([field, change]) => (
                <div key={field} className="bg-white p-3 rounded shadow-sm border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">{LABEL_MAP[field] || field}</span>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-slate-400 line-through">
                      {field.includes('amt') ? formatCurrency(change.original) : change.original}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold text-indigo-600">
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
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            A — Customer Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{LABEL_MAP.age}</label>
              <input 
                type="number" min="18" max="100"
                value={editedValues.age ?? ''}
                onChange={e => handleChange('age', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${editedValues.age != originalValues.age ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{LABEL_MAP.sex}</label>
              <select
                value={editedValues.sex ?? ''}
                onChange={e => handleChange('sex', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${editedValues.sex != originalValues.sex ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{LABEL_MAP.education}</label>
              <select
                value={editedValues.education ?? ''}
                onChange={e => handleChange('education', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${editedValues.education != originalValues.education ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <option value="1">Graduate School</option>
                <option value="2">University</option>
                <option value="3">High School</option>
                <option value="4">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{LABEL_MAP.marriage}</label>
              <select
                value={editedValues.marriage ?? ''}
                onChange={e => handleChange('marriage', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${editedValues.marriage != originalValues.marriage ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
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
          <div className="flex items-baseline space-x-2 mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              B — Repayment Behavior
            </h3>
            <span className="text-xs text-slate-500 italic">(Historical status codes)</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[0, 2, 3, 4, 5, 6].map(i => {
              const key = `pay_${i}`;
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1 whitespace-nowrap overflow-hidden text-ellipsis" title={LABEL_MAP[key]}>
                    {LABEL_MAP[key]}
                  </label>
                  <input 
                    type="number"
                    value={editedValues[key] ?? ''}
                    onChange={e => handleChange(key, e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${editedValues[key] != originalValues[key] ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Section C: Billing */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            C — Billing History
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => {
              const key = `bill_amt_${i}`;
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1 whitespace-nowrap overflow-hidden text-ellipsis" title={LABEL_MAP[key]}>
                    {LABEL_MAP[key]}
                  </label>
                  <input 
                    type="number" min="0" step="100"
                    value={editedValues[key] ?? ''}
                    onChange={e => handleChange(key, e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${editedValues[key] != originalValues[key] ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Section D: Payment */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            D — Payment History
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => {
              const key = `pay_amt_${i}`;
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1 whitespace-nowrap overflow-hidden text-ellipsis" title={LABEL_MAP[key]}>
                    {LABEL_MAP[key]}
                  </label>
                  <input 
                    type="number" min="0" step="100"
                    value={editedValues[key] ?? ''}
                    onChange={e => handleChange(key, e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${editedValues[key] != originalValues[key] ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              );
            })}
          </div>
        </section>

      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500 italic max-w-2xl mx-auto">
          Simulation only — changes are temporary and do not modify the customer's database record. 
          The model output is decision-support information. Final credit decisions remain with the authorized bank employee.
        </p>
      </div>
    </div>
  );
}
