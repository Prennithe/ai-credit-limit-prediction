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
  Cpu,
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

/* ── Workspace module definitions ─────────────────────────────── */
const WORKSPACE_MODULES = [
  {
    title: 'Customer Search & Profile',
    desc: 'Look up customer financial profiles, demographics, credit histories, and recent repayment standings.',
    to: '/app/customers',
    icon: Search,
    iconBg: 'bg-[rgba(116,141,164,0.12)] text-[var(--color-blue-grey)] border-[rgba(116,141,164,0.22)]',
  },
  {
    title: 'Model Prediction',
    desc: 'View AI-recommended credit limit and evaluate confidence bands and repayment scoring.',
    to: '/app/prediction',
    icon: Sparkles,
    iconBg: 'bg-[rgba(123,138,65,0.12)] text-[var(--brand-secondary)] border-[rgba(123,138,65,0.22)]',
  },
  {
    title: 'Financial Trends',
    desc: 'Interactive 6-month bill statement trends, payment amount trajectories, and balance ratios.',
    to: '/app/financial-trends',
    icon: TrendingUp,
    iconBg: 'bg-[rgba(116,141,164,0.12)] text-[var(--color-blue-grey)] border-[rgba(116,141,164,0.22)]',
  },
  {
    title: 'SHAP Explainability',
    desc: 'Inspect feature-level positive and negative risk factors driving the machine learning model output.',
    to: '/app/explainability',
    icon: Lightbulb,
    iconBg: 'bg-[rgba(167,181,156,0.18)] text-[var(--status-success)] border-[rgba(167,181,156,0.35)]',
  },
  {
    title: 'What-If Risk Simulator',
    desc: 'Simulate changes in customer payment delays, billing balances, and analyze projected impacts.',
    to: '/app/simulator',
    icon: Calculator,
    iconBg: 'bg-[rgba(123,138,65,0.12)] text-[var(--brand-secondary)] border-[rgba(123,138,65,0.22)]',
  },
  {
    title: 'Employee Decision & History',
    desc: 'Submit final credit decisions (Approve, Reject, Review) with audit trails and supervisory notes.',
    to: '/app/decisions',
    icon: ClipboardCheck,
    iconBg: 'bg-[rgba(91,47,66,0.10)] text-[var(--color-warning-plum)] border-[rgba(91,47,66,0.20)]',
  },
  {
    title: 'System Audit Log',
    desc: 'View comprehensive decision activity, model vs. final credit limit divergences, and officer logs.',
    to: '/app/audit',
    icon: ShieldCheck,
    iconBg: 'bg-[rgba(116,141,164,0.12)] text-[var(--color-blue-grey)] border-[rgba(116,141,164,0.22)]',
  },
];

/* ── Workflow step definitions ─────────────────────────────────── */
const STEPS = [
  {
    num: '1',
    title: 'Search Customer',
    body: (
      <>
        Query a customer ID (e.g.{' '}
        <code className="font-mono text-[var(--brand-secondary)] bg-[rgba(123,138,65,0.10)] px-1 rounded">
          CUST00001
        </code>
        ) on the Customers page to load full credit records.
      </>
    ),
    accent: 'var(--brand-primary)',
  },
  {
    num: '2',
    title: 'Review Recommendations',
    body: 'Navigate between Model Prediction, Financial Trends, and SHAP Explainability to assess model rationale and risk factors.',
    accent: 'var(--color-blue-grey)',
  },
  {
    num: '3',
    title: 'Submit & Audit',
    body: 'Execute decisions in the Employee Decision Panel. Review overall governance logs anytime in the standalone Audit Log.',
    accent: 'var(--color-warning-plum)',
  },
];

export default function OverviewPage() {
  const { customer } = useCustomer();

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ──────────────────────────────────────── */}
      <div className="
        relative overflow-hidden rounded-2xl
        bg-[var(--surface-sidebar)]
        border border-[var(--border-sidebar)]
        shadow-[var(--shadow-md)]
        p-6 sm:p-8 text-white
      ">
        {/* Subtle decorative ring */}
        <div className="
          pointer-events-none absolute -top-16 -right-16
          w-56 h-56 rounded-full
          bg-[rgba(123,138,65,0.12)]
          blur-2xl
        " />

        <div className="relative z-10 max-w-3xl">
          {/* Tag pill */}
          <div className="
            inline-flex items-center gap-1.5 mb-4
            px-3 py-1 rounded-full
            text-xs font-semibold tracking-wide
            bg-[rgba(123,138,65,0.20)]
            text-[var(--color-olive-300)]
            border border-[rgba(123,138,65,0.35)]
          ">
            <Cpu className="w-3 h-3" />
            Decision Support System
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            AI-Based Credit Limit Recommendation
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[var(--text-on-dark-muted)] leading-relaxed max-w-2xl">
            Welcome to the underwriter portal. Access machine learning credit predictions, interpret SHAP feature
            influences, stress-test borrower variables, and log governed credit decisions.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {customer ? (
              <div className="
                inline-flex items-center gap-2 px-3.5 py-2
                rounded-lg text-sm
                bg-[rgba(255,255,255,0.07)]
                border border-[rgba(255,255,255,0.12)]
              ">
                <UserCheck className="w-4 h-4 text-[var(--color-olive-300)]" />
                <span className="text-[var(--text-on-dark-muted)]">Selected Customer:</span>
                <span className="font-mono font-bold text-white">{customer.customer_id}</span>
                <Link
                  to="/app/prediction"
                  className="
                    ml-1 text-xs font-semibold
                    text-[var(--color-olive-300)]
                    hover:text-white transition-colors
                    underline underline-offset-2
                  "
                >
                  View Prediction →
                </Link>
              </div>
            ) : (
              <Link to="/app/customers">
                <Button
                  variant="primary"
                  leftIcon={<Search className="w-4 h-4 flex-shrink-0" />}
                >
                  Start by Searching a Customer
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Getting Started Workflow ────────────────────────────── */}
      <Card className="border-[var(--border-default)]">
        <CardHeader
          title="Getting Started"
          subtitle="Follow the structured three-step workflow to review and record underwriting decisions"
        />
        <div className="pt-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="
                p-4 rounded-[var(--radius-lg)]
                bg-[var(--surface-bg)]
                border border-[var(--border-muted)]
              "
            >
              <div
                className="
                  w-7 h-7 rounded-full text-white
                  text-xs font-bold flex items-center justify-center mb-3
                  shadow-[var(--shadow-sm)]
                "
                style={{ backgroundColor: `var(${step.accent.replace('var(', '').replace(')', '')})` }}
              >
                {step.num}
              </div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-1 leading-snug">
                {step.title}
              </h4>
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Workspace Modules Grid ──────────────────────────────── */}
      <div>
        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 px-0.5">
          Workspace Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {WORKSPACE_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.to}
                to={mod.to}
                className="
                  group block p-5 rounded-[var(--radius-xl)]
                  bg-[var(--surface-card)]
                  border border-[var(--border-default)]
                  shadow-[var(--shadow-sm)]
                  hover:border-[var(--brand-secondary)]
                  hover:shadow-[var(--shadow-md)]
                  transition-all duration-[var(--transition-fast)]
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)]
                "
              >
                <div className="flex items-start gap-3.5">
                  {/* Icon badge */}
                  <div className={`
                    p-2.5 rounded-[var(--radius-md)] border flex-shrink-0
                    transition-transform duration-[var(--transition-fast)]
                    group-hover:scale-105
                    ${mod.iconBg}
                  `}>
                    <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="
                        font-bold text-sm text-[var(--text-primary)] leading-snug
                        group-hover:text-[var(--brand-secondary)]
                        transition-colors duration-[var(--transition-fast)]
                      ">
                        {mod.title}
                      </h4>
                      <ArrowRight className="
                        w-4 h-4 flex-shrink-0 mt-0.5
                        text-[var(--border-default)]
                        group-hover:text-[var(--brand-secondary)]
                        group-hover:translate-x-0.5
                        transition-all duration-[var(--transition-fast)]
                      " />
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
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
