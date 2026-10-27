import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, XCircle, Clock, Save, History, 
  User, CheckCircle2, AlertCircle, Briefcase
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function EmployeeDecisionPanel({ customer, prediction, onDecisionSaved }) {
  const [decision, setDecision] = useState('');
  const [finalCreditLimit, setFinalCreditLimit] = useState('');
  const [reason, setReason] = useState('');
  const [officerId, setOfficerId] = useState('OFFICER001'); // Default demo officer
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [decisionHistory, setDecisionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const loadHistory = useCallback(async () => {
    if (!customer?.customer_id) return;
    setHistoryLoading(true);
    try {
      const history = await api.getCustomerDecisions(customer.customer_id);
      setDecisionHistory(history);
      setHistoryError(null);
    } catch (err) {
      setHistoryError('Unable to load decision history.');
    } finally {
      setHistoryLoading(false);
    }
  }, [customer?.customer_id]);

  // Load history whenever customer changes
  useEffect(() => {
    if (customer?.customer_id) {
      // Reset form state
      setDecision('');
      setFinalCreditLimit(prediction?.predicted_credit_limit || '');
      setReason('');
      setError(null);
      setSuccessMsg(null);
      setDecisionHistory([]);

      loadHistory();
    }
  }, [customer, prediction, loadHistory]);

  const handleSave = async () => {
    setError(null);
    setSuccessMsg(null);

    // Validation
    if (!decision) {
      setError('Please select a final decision (Approve, Reject, or Review).');
      return;
    }
    const parsedLimit = Number(finalCreditLimit);
    if (finalCreditLimit === '' || isNaN(parsedLimit) || parsedLimit < 0) {
      setError('Please provide a valid, non-negative final credit limit.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the decision.');
      return;
    }
    if (!officerId.trim()) {
      setError('Please provide an Officer ID.');
      return;
    }

    const payload = {
      decision,
      final_credit_limit: parsedLimit,
      reason: reason.trim(),
      officer_id: officerId.trim()
    };

    setIsSaving(true);
    try {
      await api.saveDecision(customer.customer_id, payload);
      setSuccessMsg('Credit decision recorded successfully in audit trail.');
      
      // Reload decision history for this customer
      loadHistory();
      
      // Notify parent if callback provided
      if (onDecisionSaved) {
        onDecisionSaved();
      }
    } catch (err) {
      setError(err.message || 'Failed to record decision. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getDecisionColor = (dec) => {
    switch (dec?.toLowerCase()) {
      case 'approve':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'reject':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'review':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Decision Submission Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Employee Decision Form</h3>
              <p className="text-xs text-slate-500 mt-1">Review model recommendations and submit official credit decisions.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-700 text-sm flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-700 text-sm flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Decision Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Final Decision <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Approve', icon: CheckCircle, color: 'text-emerald-600 hover:bg-emerald-50 border-emerald-200' },
                { id: 'Reject', icon: XCircle, color: 'text-rose-600 hover:bg-rose-50 border-rose-200' },
                { id: 'Review', icon: Clock, color: 'text-amber-600 hover:bg-amber-50 border-amber-200' },
              ].map(item => {
                const Icon = item.icon;
                const isSelected = decision === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDecision(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-semibold transition-all ${
                      isSelected 
                        ? `${item.color} bg-opacity-20 border-2 ring-2 ring-offset-1 ring-blue-500` 
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span>{item.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Final Credit Limit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Final Credit Limit (NT$) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={finalCreditLimit}
              onChange={(e) => setFinalCreditLimit(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {prediction?.predicted_credit_limit && (
              <p className="text-[11px] text-slate-500 mt-1">
                Model recommendation: {formatCurrency(prediction.predicted_credit_limit)}
              </p>
            )}
          </div>
        </div>

        {/* Reason and Officer ID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Decision Rationale / Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail reasons for model alignment or override..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Officer ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Free-text employee identifier for logging.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Recording Decision...' : 'Save Decision'}</span>
          </button>
        </div>
      </div>

      {/* 2. Customer Decision History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-500" />
            <h4 className="font-bold text-slate-800 text-sm">Customer Decision History</h4>
          </div>
          <span className="text-xs text-slate-400">Previous employee decisions for {customer.customer_id}</span>
        </div>

        {historyError ? (
          <div className="text-rose-600 text-sm p-4 bg-rose-50 rounded-lg border border-rose-100">{historyError}</div>
        ) : historyLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg w-full"></div>)}
          </div>
        ) : decisionHistory.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-100">
            No previous recorded decisions found for this customer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 font-semibold">Timestamp</th>
                  <th className="px-4 py-2 font-semibold">Decision</th>
                  <th className="px-4 py-2 font-semibold">Final Limit</th>
                  <th className="px-4 py-2 font-semibold">Officer ID</th>
                  <th className="px-4 py-2 font-semibold">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {decisionHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{formatDate(item.timestamp)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 w-fit ${getDecisionColor(item.decision)}`}>
                        <span>{item.decision}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{formatCurrency(item.final_credit_limit)}</td>
                    <td className="px-4 py-3 text-slate-600">{item.officer_id}</td>
                    <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]" title={item.reason}>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
