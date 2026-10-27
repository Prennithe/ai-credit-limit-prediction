import React, { useState, useEffect, useCallback } from 'react';
import { Shield, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';

export default function AuditPage() {
  const [recentAudit, setRecentAudit] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(null);

  const loadAudit = useCallback(async () => {
    setAuditLoading(true);
    try {
      const audit = await api.getRecentAudit(50);
      setRecentAudit(audit || []);
      setAuditError(null);
    } catch (err) {
      console.error('Failed to load audit:', err);
      setAuditError('Unable to load recent audit activity. Please check backend connectivity.');
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

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
      {/* ── Header Card ─────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border-default)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-50 p-2.5 rounded-lg text-purple-600 border border-purple-100">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">System Audit Trail</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive log of underwriter decisions and ML model recommendations across all customers.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAudit}
            disabled={auditLoading}
            className="inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* ── Audit Content ──────────────────────────────── */}
        <div className="pt-4">
          {auditError ? (
            <div className="text-rose-600 text-sm p-4 bg-rose-50 rounded-lg border border-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{auditError}</span>
            </div>
          ) : auditLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg w-full" />
              ))}
            </div>
          ) : recentAudit.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-100">
              <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No recent audit activity</p>
              <p className="text-xs text-slate-400 mt-1">Decisions recorded by officers will appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Customer ID</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Model Limit</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">
                      <ArrowRight className="w-4 h-4 mx-auto text-slate-400" />
                    </th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Final Limit</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Decision</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAudit.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono">{formatDate(item.timestamp)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-blue-600">{item.customer_id}</td>
                      <td className="px-4 py-3 text-slate-500">{formatCurrency(item.model_prediction)}</td>
                      <td className="px-4 py-3 text-center">
                        <ArrowRight className="w-4 h-4 mx-auto text-slate-300" />
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{formatCurrency(item.final_credit_limit)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center justify-center space-x-1 ${getDecisionColor(
                            item.decision
                          )}`}
                        >
                          {item.decision}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs font-mono">{item.officer_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
