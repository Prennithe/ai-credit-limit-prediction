import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Calculator,
  ClipboardCheck,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Info,
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const WORKSPACE_MODULES = [
  {
    title: 'Customer Search & Profile',
    desc: 'Look up customer financial profiles, demographics, credit histories, and recent repayment standings.',
    to: '/app/customers',
    icon: Search,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    title: 'Model Prediction',
    desc: 'View AI-recommended credit limit and evaluate confidence bands and repayment scoring.',
    to: '/app/prediction',
    icon: Sparkles,
    color: 'bg-teal-50 text-teal-600 border-teal-100',
  },
  {
    title: 'Financial Trends',
    desc: 'Interactive 6-month bill statement trends, payment amount trajectories, and balance ratios.',
    to: '/app/financial-trends',
    icon: TrendingUp,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
  {
    title: 'SHAP Explainability',
    desc: 'Inspect feature-level positive and negative risk factors driving the machine learning model output.',
    to: '/app/explainability',
    icon: Lightbulb,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    title: 'What-If Risk Simulator',
    desc: 'Simulate changes in customer payment delays, billing balances, and analyze projected impacts.',
    to: '/app/simulator',
    icon: Calculator,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    title: 'Employee Decision & History',
    desc: 'Submit final credit decisions (Approve, Reject, Review) with audit trails and supervisory notes.',
    to: '/app/decisions',
    icon: ClipboardCheck,
    color: 'bg-violet-50 text-violet-600 border-violet-100',
  },
  {
    title: 'System Audit Log',
    desc: 'View comprehensive decision activity, model vs. final credit limit divergences, and officer logs.',
    to: '/app/audit',
    icon: ShieldCheck,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
];

export default function OverviewPage() {
  const { customer, backendStatus } = useCustomer();

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner ──────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--color-navy-900)] to-[var(--color-navy-800)] p-6 sm:p-8 text-white border border-[var(--border-sidebar)] shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(20,196,171,0.2)] text-[var(--color-teal-300)] border border-[rgba(20,196,171,0.3)] mb-4">
            <span>Decision Support System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI-Based Credit Limit Recommendation
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[var(--text-on-dark-muted)] leading-relaxed">
            Welcome to the underwriter portal. Access machine learning credit predictions, interpret SHAP feature influences, stress-test borrower variables, and log governed credit decisions.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {customer ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-sm">
                <UserCheck className="w-4 h-4 text-[var(--color-teal-400)]" />
                <span>Selected Customer:</span>
                <span className="font-mono font-bold text-[var(--color-teal-300)]">{customer.customer_id}</span>
                <Link to="/app/prediction" className="ml-2 text-xs text-white underline hover:text-[var(--color-teal-200)]">
                  View Prediction →
                </Link>
              </div>
            ) : (
              <Link to="/app/customers">
                <Button variant="primary" className="inline-flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>Start by Searching a Customer</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Instructions / Getting Started Guide ────────── */}
      <Card className="border-[var(--border-default)]">
        <CardHeader
          title="Getting Started"
          subtitle="Follow the structured workflow to review and record underwriting decisions"
        />
        <div className="p-6 pt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-[var(--surface-bg)] border border-[var(--border-muted)]">
            <div className="w-7 h-7 rounded-full bg-[var(--brand-primary)] text-white text-xs font-bold flex items-center justify-center mb-2">
              1
            </div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">Search Customer</h4>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
              Query a customer ID (e.g. <code className="font-mono text-[var(--brand-primary)]">CUST00001</code>) on the Customers page to load full credit records.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[var(--surface-bg)] border border-[var(--border-muted)]">
            <div className="w-7 h-7 rounded-full bg-[var(--color-teal-600)] text-white text-xs font-bold flex items-center justify-center mb-2">
              2
            </div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">Review Recommendations</h4>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
              Navigate between Model Prediction, Financial Trends, and SHAP Explainability to assess model rationale and risk factors.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[var(--surface-bg)] border border-[var(--border-muted)]">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mb-2">
              3
            </div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">Submit & Audit</h4>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
              Execute decisions in the Employee Decision Panel. Review overall governance logs anytime in the standalone Audit Log.
            </p>
          </div>
        </div>
      </Card>

      {/* ── Module Shortcuts Grid ──────────────────────── */}
      <div>
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-3">
          Workspace Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKSPACE_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.to}
                to={mod.to}
                className="group block p-5 rounded-xl bg-white border border-[var(--border-default)] shadow-xs hover:border-[var(--brand-primary)] hover:shadow-md transition-all duration-[var(--transition-fast)]"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg border flex-shrink-0 ${mod.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                        {mod.title}
                      </h4>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[var(--brand-primary)] transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
